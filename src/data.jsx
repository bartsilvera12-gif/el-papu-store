// Datos iniciales de El Papu Store
// =====================================================================
// Los datos reales (PRODUCTS, CATEGORIAS, FAQS) se cargan desde Supabase
// en `store-api.jsx -> loadInitialData()`. Estos arrays vacíos son solo
// el esqueleto que se muta in-place cuando llega la respuesta de la DB.
//
// Si Supabase no está configurado o falla, la web se ve "vacía" en vez
// de mostrar productos mock viejos.
// =====================================================================

const PRODUCTS = [];

const CATEGORIAS = [];

const FAQS = [];

window.__PAPU_DATA__ = { PRODUCTS, CATEGORIAS, FAQS };
