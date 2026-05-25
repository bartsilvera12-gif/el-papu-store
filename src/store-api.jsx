// Store API — capa de acceso a datos con fallback a mock (data.jsx).
// =====================================================================
// - Si Supabase está configurado y responde, mutamos __PAPU_DATA__ in-place
//   y emitimos "papu:data-loaded" para que la UI re-renderice.
// - Si no, queda el mock como está (la web sigue funcionando).
// - createOrder() intenta crear pedido real; si falla, retorna un código
//   sintético para no romper el flujo del checkout.

const PapuStoreAPI = (function () {

  // ---------- Helpers de mapping (DB row -> shape legacy del frontend) ----------

  function mapProductRow(row, categoriesById) {
    const cat = row.category_id && categoriesById ? categoriesById.get(row.category_id) : null;
    return {
      id: row.id,
      _dbId: row.id,
      nombre: row.name,
      categoria: cat ? cat.name : (row.category_name || ""),
      precio: row.price,
      precioAnterior: row.compare_at_price || null,
      badge: row.badge || null,
      descripcion: row.description || row.short_description || "",
      caracteristicas: Array.isArray(row.features) ? row.features : [],
      rating: row.rating || 0,
      reviews: row.reviews_count || 0,
      stock: row.stock || 0,
      color: row.color || "from-emerald-500/20 to-black",
      img: row.image_url || "",
      slug: row.slug,
      is_active: row.is_active,
      is_featured: row.is_featured === true,
    };
  }

  function mapCategoryRow(row) {
    return {
      id: row.slug || row.id, // legacy front usa slug-like id
      _dbId: row.id,
      nombre: row.name,
      desc: row.description || "",
      icon: row.icon || "✨",
      slug: row.slug,
    };
  }

  function mapFaqRow(row) {
    return { q: row.question, a: row.answer, _dbId: row.id };
  }

  // ---------- Carga inicial ----------

  async function loadInitialData() {
    const client = window.getSupabaseClient && window.getSupabaseClient();
    if (!client) return { loaded: false, reason: "supabase-not-configured" };

    try {
      const [catsRes, prodsRes, faqsRes] = await Promise.all([
        client.from("categories").select("*").eq("is_active", true).order("display_order", { ascending: true }),
        client.from("products").select("*").eq("is_active", true).order("display_order", { ascending: true }),
        client.from("faqs").select("*").eq("is_active", true).order("display_order", { ascending: true }),
      ]);

      if (catsRes.error) throw catsRes.error;
      if (prodsRes.error) throw prodsRes.error;
      if (faqsRes.error) throw faqsRes.error;

      const cats = (catsRes.data || []).map(mapCategoryRow);
      const catsById = new Map((catsRes.data || []).map(r => [r.id, r]));
      const prods = (prodsRes.data || []).map(r => mapProductRow(r, catsById));
      const faqs = (faqsRes.data || []).map(mapFaqRow);

      const D = window.__PAPU_DATA__ = window.__PAPU_DATA__ || { PRODUCTS: [], CATEGORIAS: [], FAQS: [] };

      // Mutar in-place para que componentes que tienen referencia al array
      // sigan funcionando.
      if (prods.length) D.PRODUCTS.splice(0, D.PRODUCTS.length, ...prods);
      if (cats.length) D.CATEGORIAS.splice(0, D.CATEGORIAS.length, ...cats);
      if (faqs.length) D.FAQS.splice(0, D.FAQS.length, ...faqs);

      window.dispatchEvent(new Event("papu:data-loaded"));
      return { loaded: true, products: prods.length, categories: cats.length, faqs: faqs.length };
    } catch (err) {
      console.warn("[papu] No se pudo cargar datos desde Supabase, usando mock:", err.message || err);
      return { loaded: false, reason: "supabase-error", error: err };
    }
  }

  // ---------- Crear pedido ----------

  // cart: [{ id, nombre, precio, qty, ... }]
  // form: { nombre, apellido, telefono, email, ciudad, direccion, referencia, entrega, pago }
  // totals: { subtotal, envio, total }
  async function createOrder({ cart, form, totals }) {
    const client = window.getSupabaseClient && window.getSupabaseClient();
    const fallbackCode = "PAPU-" + Math.floor(10000 + Math.random() * 90000);

    if (!client) {
      return { ok: false, fallback: true, order_code: fallbackCode, reason: "supabase-not-configured" };
    }

    try {
      // Usamos una RPC SECURITY DEFINER para crear orden + items en una sola transacción,
      // sin exponer SELECT público de la tabla orders.
      const items = cart.map(it => ({
        product_id: typeof it._dbId === "string" ? it._dbId : null, // null si es mock
        product_name: it.nombre,
        unit_price: it.precio | 0,
        quantity: it.qty | 0,
        total: ((it.precio | 0) * (it.qty | 0)),
      }));

      const { data, error } = await client.rpc("create_order_with_items", {
        p_customer: {
          nombre: form.nombre || "",
          apellido: form.apellido || null,
          telefono: form.telefono || null,
          email: form.email || null,
          ciudad: form.ciudad || null,
          direccion: form.direccion || null,
          referencia: form.referencia || null,
          entrega: form.entrega || null,
          pago: form.pago || null,
        },
        p_totals: {
          subtotal: totals.subtotal | 0,
          envio: totals.envio | 0,
          total: totals.total | 0,
        },
        p_items: items,
      });

      if (error) throw error;
      return { ok: true, order_code: (data && data.order_code) || fallbackCode, order_id: data && data.order_id };
    } catch (err) {
      console.warn("[papu] Error creando pedido en Supabase, fallback a código local:", err.message || err);
      return { ok: false, fallback: true, order_code: fallbackCode, error: err };
    }
  }

  return { loadInitialData, createOrder, mapProductRow, mapCategoryRow, mapFaqRow };
})();

window.PapuStoreAPI = PapuStoreAPI;
