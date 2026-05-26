// Cliente PagoPar — capa sobre la API REST de PagoPar
// =====================================================================
// Docs: https://pagopar.com/desarrolladores
//
// Tokens:
//   - PAGOPAR_PUBLIC_KEY: identifica al comercio (usa en payload + URLs)
//   - PAGOPAR_PRIVATE_KEY: SECRETO. Solo backend. Firma sha1.
//
// Firmas:
//   - Iniciar transacción: sha1(PRIVATE_KEY + id_pedido_comercio + String(monto_total))
//   - Consultar pedido:    sha1(PRIVATE_KEY + "CONSULTA")
//   - Validar webhook:     sha1(PRIVATE_KEY + hash_pedido)  (comparar contra "token" del payload)
// =====================================================================

import { createHash } from "node:crypto";

const PUBLIC_KEY = process.env.PAGOPAR_PUBLIC_KEY || "";
const PRIVATE_KEY = process.env.PAGOPAR_PRIVATE_KEY || "";
const BASE_URL = process.env.PAGOPAR_BASE_URL || "https://api.pagopar.com/api";
const CHECKOUT_URL = process.env.PAGOPAR_CHECKOUT_URL || "https://www.pagopar.com/pagos";
const MODE = process.env.PAGOPAR_MODE || "production";
const WEBHOOK_URL = process.env.PAGOPAR_WEBHOOK_URL || "";

export function isConfigured() {
  return Boolean(PUBLIC_KEY && PRIVATE_KEY);
}

export function publicKey() {
  return PUBLIC_KEY;
}

export function checkoutUrl(hash) {
  return `${CHECKOUT_URL}/${hash}`;
}

// Devuelve la config PagoPar SIN secrets. Útil para logs de boot y debug.
// Nunca incluye PUBLIC_KEY ni PRIVATE_KEY: solo flags booleanos.
export function pagoparConfig() {
  return {
    mode: MODE,
    base_url: BASE_URL,
    checkout_url: CHECKOUT_URL,
    webhook_url: WEBHOOK_URL || null,
    public_key_set: Boolean(PUBLIC_KEY),
    private_key_set: Boolean(PRIVATE_KEY),
  };
}

export function sha1(s) {
  return createHash("sha1").update(String(s)).digest("hex");
}

// Token para iniciar transacción
export function signCreateToken(idPedidoComercio, montoTotal) {
  const monto = String(Number(montoTotal) | 0);
  return sha1(PRIVATE_KEY + idPedidoComercio + monto);
}

// Token para consultar pedido
export function signConsultaToken() {
  return sha1(PRIVATE_KEY + "CONSULTA");
}

// Token esperado para validar webhook entrante
export function expectedWebhookToken(hashPedido) {
  return sha1(PRIVATE_KEY + hashPedido);
}

// Comparación constant-time para evitar timing attacks
export function safeEqual(a, b) {
  const x = String(a || "");
  const y = String(b || "");
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

// Llamada HTTP genérica al API de PagoPar
async function postPagopar(path, body) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); }
  catch { throw new Error(`PagoPar respondió HTTP ${res.status} no-JSON: ${text.slice(0, 500)}`); }
  if (!res.ok) {
    throw new Error(`PagoPar HTTP ${res.status}: ${text.slice(0, 500)}`);
  }
  return json;
}

// Iniciar transacción
//   POST /comercios/2.0/iniciar-transaccion
//   Devuelve: { resultado: [{ data: hash, ... }], respuesta: true|false, mensaje: ... }
export async function iniciarTransaccion(payload) {
  return postPagopar("/comercios/2.0/iniciar-transaccion", payload);
}

// Consultar estado del pedido
//   POST /pedidos/1.1/traer
export async function consultarPedido({ hash_pedido }) {
  const body = {
    hash_pedido,
    token: signConsultaToken(),
    token_publico: PUBLIC_KEY,
  };
  return postPagopar("/pedidos/1.1/traer", body);
}

// Formatear fecha para PagoPar: "dd/MM/yyyy HH:mm:ss"
export function fechaMaximaPago(hoursFromNow = 48) {
  const d = new Date(Date.now() + hoursFromNow * 3600 * 1000);
  const p = n => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// Generar id_pedido_comercio único: EPS-YYYYMMDD-HHMMSS-{random4}
export function generarIdPedidoComercio() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  const ymd = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  const hms = `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EPS-${ymd}-${hms}-${rand}`;
}
