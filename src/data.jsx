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

// CONTENT: textos editables desde el admin (clave -> objeto). Se llena desde
// site_content en loadInitialData(). Vacío = los componentes usan su fallback.
const CONTENT = {};

window.__PAPU_DATA__ = { PRODUCTS, CATEGORIAS, FAQS, CONTENT };

// Optimizador de imágenes de Cloudinary. Inserta transformaciones
// (f_auto = formato moderno tipo WebP/AVIF, q_auto = calidad automática,
// w_<ancho> = redimensiona) justo después de /image/upload/, así el
// navegador descarga una versión liviana en vez del original de varios MB.
// URLs que no son de Cloudinary o que ya traen transformaciones se devuelven
// sin tocar.
window.cldImg = function (url, w) {
  if (!url || typeof url !== "string") return url;
  const marker = "/image/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url; // no es Cloudinary
  if (url.includes("f_auto") || url.includes("q_auto")) return url; // ya optimizada
  const t = "f_auto,q_auto" + (w ? ",w_" + w : "") + "/";
  return url.slice(0, i + marker.length) + t + url.slice(i + marker.length);
};

// Datos de contacto centralizados. Cualquier botón/enlace de WhatsApp o
// Instagram debe usar estos valores (no hardcodear números/URLs sueltos).
window.__PAPU_CONTACT__ = {
  whatsappNumber: "595971985337",
  whatsappDisplay: "+595 971 985 337",
  whatsappUrl: "https://wa.me/595971985337",
  instagramHandle: "@elpapu_store",
  instagramUrl: "https://www.instagram.com/elpapu_store?igsh=MXF6Y2wydHdoeTcyMw==",
};
