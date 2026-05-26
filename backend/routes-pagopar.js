// Routes /api/pagopar/* — integración PagoPar
// =====================================================================
// Endpoints:
//   POST /api/pagopar/crear      — crea pedido local + transacción PagoPar
//   POST /api/pagopar/webhook    — recibe notificación server-to-server
//   POST /api/pagopar/consultar  — consulta estado real del pago
// =====================================================================

import { Router } from "express";
import {
  isConfigured as pagoparConfigured,
  publicKey,
  checkoutUrl,
  signCreateToken,
  expectedWebhookToken,
  safeEqual,
  iniciarTransaccion,
  consultarPedido,
  fechaMaximaPago,
  generarIdPedidoComercio,
} from "./pagopar.js";
import { getClient as getSupabase, isConfigured as supabaseConfigured } from "./supabase.js";

export function pagoparRouter() {
  const router = Router();

  // -------------------------------------------------------------------
  // POST /api/pagopar/crear
  // -------------------------------------------------------------------
  router.post("/crear", async (req, res) => {
    try {
      if (!pagoparConfigured()) {
        return res.status(500).json({ success: false, error: "pagopar_not_configured" });
      }
      if (!supabaseConfigured()) {
        return res.status(500).json({ success: false, error: "supabase_not_configured" });
      }

      const { cart, form } = req.body || {};
      const APP_URL = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;

      // ───── Validaciones de entrada
      if (!Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ success: false, error: "empty_cart" });
      }
      if (!form) {
        return res.status(400).json({ success: false, error: "missing_form" });
      }
      const trim = s => (typeof s === "string" ? s.trim() : "");
      const onlyDigits = s => (typeof s === "string" ? s.replace(/\D/g, "") : "");
      const required = {
        nombre: trim(form.nombre),
        apellido: trim(form.apellido),
        telefono: onlyDigits(form.telefono),
        email: trim(form.email),
        documento: onlyDigits(form.documento || form.ci),
        ciudad: trim(form.ciudad === "Otra" ? form.ciudadOtra : form.ciudad),
        direccion: trim(form.direccion),
      };
      const missing = Object.entries(required).filter(([_, v]) => !v).map(([k]) => k);
      if (missing.length) {
        return res.status(400).json({ success: false, error: "missing_customer_fields", detail: missing });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(required.email)) {
        return res.status(400).json({ success: false, error: "invalid_email" });
      }
      if (required.telefono.length < 8 || required.telefono.length > 15) {
        return res.status(400).json({ success: false, error: "invalid_phone" });
      }
      if (required.documento.length < 4 || required.documento.length > 9) {
        return res.status(400).json({ success: false, error: "invalid_document" });
      }

      const supabase = getSupabase();

      // ───── Recalcular total server-side desde productos reales en DB
      // Esto evita que el frontend mande precios manipulados.
      const productIds = cart
        .map(it => it._dbId || it.id)
        .filter(id => typeof id === "string");

      let productsById = new Map();
      if (productIds.length) {
        const { data: prods, error: pErr } = await supabase
          .from("products")
          .select("id, name, price, sku, image_url, is_active")
          .in("id", productIds);
        if (pErr) throw pErr;
        productsById = new Map((prods || []).filter(p => p.is_active).map(p => [p.id, p]));
      }

      // Construir items canónicos usando precios de DB
      const items = [];
      let subtotal = 0;
      for (const it of cart) {
        const id = it._dbId || it.id;
        const dbProd = productsById.get(id);
        if (!dbProd) {
          return res.status(400).json({
            success: false,
            error: "product_not_found_or_inactive",
            detail: { id, nombre: it.nombre },
          });
        }
        const qty = Math.max(1, Number(it.qty) | 0);
        const unit = Number(dbProd.price) | 0;
        if (unit <= 0) {
          return res.status(400).json({ success: false, error: "invalid_unit_price", detail: { id } });
        }
        const lineTotal = unit * qty;
        if (lineTotal < 1000) {
          return res.status(400).json({
            success: false,
            error: "item_total_below_minimum",
            detail: { id, lineTotal },
          });
        }
        subtotal += lineTotal;
        items.push({
          product_id: id,
          product_name: dbProd.name,
          unit_price: unit,
          quantity: qty,
          total: lineTotal,
          image_url: dbProd.image_url || "",
          sku: dbProd.sku || "",
        });
      }

      const envio = form.entrega === "envio" ? 3500 : 0;
      const total = subtotal + envio;

      if (total < 1000) {
        return res.status(400).json({ success: false, error: "total_below_minimum" });
      }

      // ───── Crear pedido en DB en estado pendiente_pago
      const order_code = "PAPU-" + Math.floor(10000 + Math.random() * 90000);
      const id_pedido_comercio = generarIdPedidoComercio();

      const customer_name = required.nombre;
      const customer_lastname = required.apellido;

      const orderInsert = {
        order_code,
        status: "pending",
        payment_status: "pending",
        payment_provider: "pagopar",
        payment_method: "pagopar",
        pagopar_id_pedido_comercio: id_pedido_comercio,
        customer_name,
        customer_lastname,
        customer_phone: required.telefono,
        customer_email: required.email,
        delivery_method: form.entrega || null,
        address: required.direccion,
        city: required.ciudad,
        reference: trim(form.referencia) || null,
        subtotal,
        shipping_amount: envio,
        total,
      };

      const { data: orderRow, error: oErr } = await supabase
        .from("orders")
        .insert(orderInsert)
        .select("id, order_code")
        .single();
      if (oErr) throw oErr;

      const order_id = orderRow.id;

      // Insertar items
      const itemsInsert = items.map(it => ({
        order_id,
        product_id: it.product_id,
        product_name: it.product_name,
        unit_price: it.unit_price,
        quantity: it.quantity,
        total: it.total,
      }));
      const { error: iErr } = await supabase.from("order_items").insert(itemsInsert);
      if (iErr) throw iErr;

      // ───── Armar payload PagoPar
      const token = signCreateToken(id_pedido_comercio, total);

      // Detectar tipo de documento:
      //  - RUC solo si el usuario lo escribió con guión (ej "12345678-9")
      //  - todo lo demás → CI (cédula). Es lo más común para comercio retail.
      const docRaw = String(form.documento || "").trim();
      const isRuc = /-/.test(docRaw);
      const tipoDoc = isRuc ? "RUC" : "CI";
      const docDigits = required.documento;

      // Nombre completo y razon_social (PagoPar exige ambos)
      const fullName = `${customer_name} ${customer_lastname}`.trim();

      // Dirección con referencia incorporada si el comprador la mandó
      const direccionComprador = required.direccion;
      const direccionReferencia = trim(form.referencia) || `Ciudad: ${required.ciudad}`;

      const comprador = {
        ruc: isRuc ? docDigits : "",
        email: required.email,
        ciudad: "1", // ID de ciudad PagoPar; "1" (Asunción) acepta como default seguro
        nombre: fullName,
        telefono: required.telefono,
        direccion: direccionComprador,
        documento: docDigits,
        coordenadas: "",
        razon_social: fullName,
        tipo_documento: tipoDoc,
        direccion_referencia: direccionReferencia,
      };

      const compras_items = items.map(it => ({
        ciudad: "1",
        nombre: it.product_name,
        cantidad: it.quantity,
        categoria: "909",
        public_key: publicKey(),
        url_imagen: it.image_url || "",
        descripcion: it.product_name,
        id_producto: it.sku || it.product_id,
        precio_total: it.total,
        vendedor_telefono: "",
        vendedor_direccion: "",
        vendedor_direccion_referencia: "",
        vendedor_direccion_coordenadas: "",
      }));

      const pgPayload = {
        token,
        comprador,
        public_key: publicKey(),
        monto_total: total,
        tipo_pedido: "VENTA-COMERCIO",
        // PagoPar puede leer tipo_documento a nivel root o dentro de comprador;
        // mandamos en ambos para evitar el "El tipo documento debe estar presente".
        tipo_documento: tipoDoc,
        compras_items,
        fecha_maxima_pago: fechaMaximaPago(48),
        id_pedido_comercio,
        descripcion_resumen: `El Papu Store ${order_code} · ${items.length} item(s)`,
      };

      // Log de payload SIN secrets para diagnostico (ocultamos token sha1 y tokens internos)
      console.log("[pagopar/crear] iniciando", { order_code, id_pedido_comercio, total });
      console.log("[pagopar/crear] payload:", JSON.stringify({
        ...pgPayload,
        token: "<redacted>",
        compras_items: pgPayload.compras_items.map(it => ({ ...it, public_key: "<redacted>" })),
      }));

      let pgRes;
      try {
        pgRes = await iniciarTransaccion(pgPayload);
      } catch (err) {
        await supabase.from("orders")
          .update({ payment_status: "failed" })
          .eq("id", order_id);
        console.error("[pagopar/crear] error API:", err.message);
        return res.status(502).json({ success: false, error: "pagopar_api_error", detail: err.message });
      }

      const resultado = pgRes && pgRes.resultado;
      const hash = Array.isArray(resultado) && resultado[0] && resultado[0].data;

      if (!hash || pgRes.respuesta === false) {
        await supabase.from("orders")
          .update({ payment_status: "failed" })
          .eq("id", order_id);
        console.error("[pagopar/crear] respuesta sin hash:", JSON.stringify(pgRes).slice(0, 500));
        return res.status(502).json({
          success: false,
          error: "pagopar_no_hash",
          detail: pgRes && pgRes.mensaje ? pgRes.mensaje : "unknown",
        });
      }

      // Guardar hash en el pedido
      await supabase.from("orders")
        .update({
          pagopar_hash: hash,
          pagopar_numero_pedido: (resultado[0].numero_pedido || null),
        })
        .eq("id", order_id);

      console.log("[pagopar/crear] OK", { order_code, hash });

      return res.json({
        success: true,
        hash,
        redirectUrl: checkoutUrl(hash),
        orderId: order_id,
        order_code,
        id_pedido_comercio,
      });
    } catch (err) {
      console.error("[pagopar/crear] excepción:", err);
      return res.status(500).json({ success: false, error: "internal_error", detail: err.message });
    }
  });

  // -------------------------------------------------------------------
  // POST /api/pagopar/webhook  — URL DE RESPUESTA configurada en panel
  // -------------------------------------------------------------------
  router.post("/webhook", async (req, res) => {
    let auditId = null;
    const payload = req.body || {};
    const resultado = Array.isArray(payload.resultado) ? payload.resultado[0] : null;
    const hash = resultado && resultado.hash_pedido;
    const tokenRecibido = resultado && resultado.token;
    const pagado = resultado && resultado.pagado === true;
    const cancelado = resultado && resultado.cancelado === true;
    const tokenValid = hash && tokenRecibido && safeEqual(tokenRecibido, expectedWebhookToken(hash));

    // Audit best-effort: si la DB no responde, igual seguimos para no perder webhooks
    let supabase = null;
    try {
      supabase = getSupabase();
      const { data: auditRow } = await supabase.from("pagopar_webhooks").insert({
        hash_pedido: hash || null,
        token_valid: !!tokenValid,
        pagado: resultado ? resultado.pagado === true : null,
        cancelado: resultado ? resultado.cancelado === true : null,
        payload,
        remote_ip: (req.headers["x-forwarded-for"] || req.ip || "").toString().slice(0, 80),
        user_agent: (req.headers["user-agent"] || "").toString().slice(0, 200),
      }).select("id").single();
      auditId = auditRow && auditRow.id;
    } catch (auditErr) {
      console.warn("[pagopar/webhook] audit no disponible:", auditErr.message);
    }

    try {

      if (!hash || !tokenRecibido) {
        console.warn("[pagopar/webhook] payload incompleto");
        return res.status(400).json({ ok: false, error: "missing_fields" });
      }
      if (!tokenValid) {
        console.warn("[pagopar/webhook] token inválido para hash:", hash);
        // Importante: NO devolver 401, PagoPar puede reintentar agresivamente.
        // Pero tampoco modificar el pedido. 200 con flag.
        return res.status(200).json(JSON.parse(JSON.stringify(payload.resultado || [])));
      }

      if (!supabase) {
        console.error("[pagopar/webhook] DB no disponible, no se puede procesar");
        return res.status(503).json({ ok: false, error: "db_unavailable" });
      }

      // Buscar el pedido por hash
      const { data: order, error: oErr } = await supabase
        .from("orders")
        .select("id, payment_status, total")
        .eq("pagopar_hash", hash)
        .maybeSingle();
      if (oErr) throw oErr;
      if (!order) {
        console.warn("[pagopar/webhook] no se encontró pedido con hash:", hash);
        await supabase.from("pagopar_webhooks")
          .update({ process_error: "order_not_found" })
          .eq("id", auditId);
        return res.status(200).json(JSON.parse(JSON.stringify(payload.resultado || [])));
      }

      // Idempotencia: si ya está pagado, no volver a procesar
      if (order.payment_status === "paid" && pagado) {
        await supabase.from("pagopar_webhooks")
          .update({ processed: true, order_id: order.id, process_error: "already_paid_idempotent" })
          .eq("id", auditId);
        return res.status(200).json(JSON.parse(JSON.stringify(payload.resultado || [])));
      }

      // Construir update
      const update = {};
      if (pagado) {
        update.payment_status = "paid";
        update.pagopar_fecha_pago = resultado.fecha_pago || new Date().toISOString();
        update.pagopar_forma_pago = resultado.forma_pago || null;
        update.pagopar_forma_pago_id = resultado.forma_pago_identificador || null;
        update.pagopar_comprobante = resultado.numero_comprobante_interno || null;
        update.pagopar_numero_pedido = resultado.numero_pedido || null;
        if (resultado.monto != null) update.pagopar_monto_pagado = Number(resultado.monto) | 0;
        // Subir status de fulfillment si todavía está pending
        update.status = "confirmed";
      } else if (cancelado) {
        update.payment_status = "cancelled";
      }
      // Si pagado=false y cancelado=false → no tocar, queda pending

      if (Object.keys(update).length > 0) {
        const { error: uErr } = await supabase.from("orders").update(update).eq("id", order.id);
        if (uErr) throw uErr;
      }

      await supabase.from("pagopar_webhooks")
        .update({ processed: true, order_id: order.id })
        .eq("id", auditId);

      console.log("[pagopar/webhook] procesado", { hash, pagado, cancelado, orderId: order.id });

      // PagoPar espera el JSON de resultado de vuelta como ACK
      return res.status(200).json(JSON.parse(JSON.stringify(payload.resultado || [])));
    } catch (err) {
      console.error("[pagopar/webhook] excepción:", err);
      if (auditId && supabase) {
        try {
          await supabase.from("pagopar_webhooks")
            .update({ process_error: err.message.slice(0, 500) })
            .eq("id", auditId);
        } catch {}
      }
      return res.status(500).json({ ok: false, error: "internal_error" });
    }
  });

  // -------------------------------------------------------------------
  // POST /api/pagopar/consultar
  // -------------------------------------------------------------------
  router.post("/consultar", async (req, res) => {
    try {
      if (!pagoparConfigured()) {
        return res.status(500).json({ success: false, error: "pagopar_not_configured" });
      }
      const { hash_pedido } = req.body || {};
      if (!hash_pedido || typeof hash_pedido !== "string") {
        return res.status(400).json({ success: false, error: "missing_hash_pedido" });
      }

      const supabase = getSupabase();

      // Consultar a PagoPar
      let pgRes;
      try {
        pgRes = await consultarPedido({ hash_pedido });
      } catch (err) {
        console.error("[pagopar/consultar] error API:", err.message);
        return res.status(502).json({ success: false, error: "pagopar_api_error", detail: err.message });
      }

      const r = pgRes && Array.isArray(pgRes.resultado) && pgRes.resultado[0];
      if (!r) {
        return res.status(502).json({ success: false, error: "no_resultado", raw: pgRes });
      }

      const pagado = r.pagado === true;
      const cancelado = r.cancelado === true;

      // Buscar pedido local
      const { data: order } = await supabase
        .from("orders")
        .select("id, order_code, payment_status, status, total")
        .eq("pagopar_hash", hash_pedido)
        .maybeSingle();

      // Si PagoPar dice pagado y el local todavía no, actualizar (defensivo, además del webhook)
      if (order && pagado && order.payment_status !== "paid") {
        await supabase.from("orders").update({
          payment_status: "paid",
          status: "confirmed",
          pagopar_fecha_pago: r.fecha_pago || new Date().toISOString(),
          pagopar_forma_pago: r.forma_pago || null,
          pagopar_comprobante: r.numero_comprobante_interno || null,
          pagopar_numero_pedido: r.numero_pedido || null,
          pagopar_monto_pagado: r.monto != null ? Number(r.monto) | 0 : null,
        }).eq("id", order.id);
      }

      const estado_normalizado = pagado ? "paid" : cancelado ? "cancelled" : "pending";

      return res.json({
        success: true,
        estado: estado_normalizado,
        pagado,
        cancelado,
        forma_pago: r.forma_pago || null,
        fecha_pago: r.fecha_pago || null,
        monto: r.monto != null ? Number(r.monto) | 0 : null,
        mensaje_resultado_pago: r.mensaje_resultado_pago || null,
        numero_pedido: r.numero_pedido || null,
        order_code: order ? order.order_code : null,
      });
    } catch (err) {
      console.error("[pagopar/consultar] excepción:", err);
      return res.status(500).json({ success: false, error: "internal_error", detail: err.message });
    }
  });

  return router;
}
