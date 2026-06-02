// SEO por ruta para El Papu Store
// =====================================================================
// Devuelve title, description, canonical, og:image, JSON-LD y un bloque de
// contenido HTML por ruta. Para /producto/:id trae los datos desde Supabase
// (REST, anon key, schema elpapustore) con cache TTL y timeout, de modo que
// los buscadores vean contenido real sin depender de ejecutar JS.
//
// Robustez: cualquier fallo (Supabase caído, producto inexistente, timeout)
// cae al SEO genérico. Nunca rompe el render del sitio.
// =====================================================================

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://api.neura.com.py";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc0MTAxNDYxLCJleHAiOjE5MzE3ODE0NjF9.7_wAph8IolPMXtgfpezSwS5XR62IdD__qhqCywLDp3Q";
const SCHEMA = "elpapustore";

const SITE_NAME = "El Papu Store";
const DEFAULT_TITLE = "El Papu Store — Productos urbanos y virales en Paraguay";
const DEFAULT_DESC =
  "El Papu Store: productos urbanos, virales y útiles en Paraguay. Accesorios para autos y motos, vapes, vasos térmicos, decoración y más. Compra rápida y atención por WhatsApp.";

// ---------- helpers ----------
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function clip(s, n) {
  s = String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}
function fmtGs(n) {
  const v = Math.round(Number(n) || 0);
  return "Gs. " + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function jsonLdTag(obj) {
  // Escapamos "<" para que no se pueda cerrar el <script>.
  const json = JSON.stringify(obj).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

// ---------- cache simple con TTL ----------
const TTL_MS = 5 * 60 * 1000;
const cache = new Map(); // key -> { value, exp }
function cacheGet(key) {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.value;
  return undefined;
}
function cacheSet(key, value) {
  cache.set(key, { value, exp: Date.now() + TTL_MS });
}

async function sbFetch(pathAndQuery) {
  const url = `${SUPABASE_URL}/rest/v1/${pathAndQuery}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Accept-Profile": SCHEMA,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(2500),
  });
  if (!res.ok) throw new Error("supabase " + res.status);
  return res.json();
}

async function fetchProduct(id) {
  const key = "prod:" + id;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;
  let product = null;
  try {
    const rows = await sbFetch(
      `products?id=eq.${encodeURIComponent(id)}&is_active=eq.true` +
        `&select=name,description,short_description,price,compare_at_price,image_url,slug,stock&limit=1`
    );
    product = Array.isArray(rows) && rows[0] ? rows[0] : null;
  } catch (_) {
    product = null;
  }
  cacheSet(key, product);
  return product;
}

async function fetchProductList() {
  const key = "prod:list";
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;
  let list = [];
  try {
    list = await sbFetch(
      `products?is_active=eq.true&select=id,name,price,updated_at&order=display_order.asc`
    );
    if (!Array.isArray(list)) list = [];
  } catch (_) {
    list = [];
  }
  cacheSet(key, list);
  return list;
}

// ---------- SEO estático por ruta ----------
const STATIC = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    h1: "El Papu Store",
    intro:
      "Productos urbanos, virales y útiles en Paraguay: accesorios para autos y motos, vapes, vasos térmicos, decoración y más. Compra rápida y atención por WhatsApp.",
  },
  "/catalogo": {
    title: "Catálogo completo — El Papu Store",
    description:
      "Explorá el catálogo de El Papu Store: accesorios para autos y motos, vapes, vasos térmicos, decoración y más. Productos seleccionados y compra rápida en Paraguay.",
    h1: "Catálogo completo",
    intro: "Productos seleccionados, virales y compra rápida.",
  },
  "/sobre": {
    title: "Sobre nosotros — El Papu Store",
    description:
      "Conocé El Papu Store: tienda online de productos urbanos, virales y de utilidad real en Paraguay, con compra fácil y atención directa por WhatsApp.",
    h1: "Sobre nosotros",
    intro: "La store con más estilo.",
  },
  "/contacto": {
    title: "Contacto — El Papu Store",
    description:
      "Contactá a El Papu Store por WhatsApp o redes. Consultá productos, stock, ofertas o coordiná tu compra. Atención rápida y directa en Paraguay.",
    h1: "Contacto",
    intro: "Escribinos por WhatsApp y te contestamos rápido.",
  },
  "/faq": {
    title: "Preguntas frecuentes — El Papu Store",
    description:
      "Dudas sobre envíos, métodos de pago, tiempos de entrega y más en El Papu Store. Encontrá las respuestas a las preguntas frecuentes.",
    h1: "Preguntas frecuentes",
    intro: "Todo lo que necesitás saber sobre compras, envíos y pagos.",
  },
  "/politicas": {
    title: "Políticas — El Papu Store",
    description:
      "Políticas de El Papu Store: envíos, devoluciones, privacidad y términos de compra. Comprá con confianza en Paraguay.",
    h1: "Políticas",
    intro: "Envíos, devoluciones y términos de compra.",
  },
};

function pageContent(h1, intro, extraHtml) {
  return (
    `<div style="max-width:720px;margin:0 auto;padding:120px 20px 60px;` +
    `color:#fff;font-family:Inter,system-ui,sans-serif;text-align:center">` +
    `<h1 style="font-size:34px;line-height:1.1;margin:0 0 14px">${esc(h1)}</h1>` +
    `<p style="opacity:.7;font-size:17px;margin:0 auto;max-width:560px">${esc(intro)}</p>` +
    (extraHtml || "") +
    `</div>`
  );
}

// ---------- API principal ----------
async function getSeo(pathname, baseUrl) {
  const clean = (pathname || "/").replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
  const ogDefault = `${baseUrl}/assets/og-image.png`;

  // ----- Producto -----
  const m = clean.match(/^\/producto\/([^/]+)/);
  if (m) {
    const product = await fetchProduct(decodeURIComponent(m[1]));
    if (product) {
      const canonical = `${baseUrl}${clean}`;
      const desc = clip(product.short_description || product.description || DEFAULT_DESC, 160);
      const img = product.image_url || ogDefault;
      const inStock = (Number(product.stock) || 0) > 0;
      const jsonLd = jsonLdTag({
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        image: img,
        description: desc,
        sku: product.slug || undefined,
        brand: { "@type": "Brand", name: SITE_NAME },
        offers: {
          "@type": "Offer",
          url: canonical,
          priceCurrency: "PYG",
          price: String(Math.round(Number(product.price) || 0)),
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      });
      const imgHtml = product.image_url
        ? `<img src="${esc(product.image_url)}" alt="${esc(product.name)}" width="420" ` +
          `style="max-width:100%;height:auto;border-radius:14px;margin:22px auto 0;display:block"/>`
        : "";
      const content =
        `<div style="max-width:720px;margin:0 auto;padding:120px 20px 60px;` +
        `color:#fff;font-family:Inter,system-ui,sans-serif;text-align:center">` +
        `<h1 style="font-size:32px;line-height:1.1;margin:0 0 10px">${esc(product.name)}</h1>` +
        `<p style="color:#1FE620;font-weight:700;font-size:24px;margin:0">${esc(fmtGs(product.price))}</p>` +
        imgHtml +
        `<p style="opacity:.75;font-size:16px;margin:20px auto 0;max-width:560px">${esc(desc)}</p>` +
        `</div>`;
      return {
        title: `${product.name} — ${SITE_NAME}`,
        description: desc,
        canonical,
        ogImage: img,
        extraJsonLd: jsonLd,
        content,
      };
    }
    // producto no encontrado → cae al SEO de catálogo
    const cat = STATIC["/catalogo"];
    return {
      title: cat.title,
      description: cat.description,
      canonical: `${baseUrl}/catalogo`,
      ogImage: ogDefault,
      extraJsonLd: "",
      content: pageContent(cat.h1, cat.intro, ""),
    };
  }

  // ----- Catálogo (con lista de productos para enlazar/keywords) -----
  if (clean === "/catalogo") {
    const s = STATIC["/catalogo"];
    let listHtml = "";
    const list = await fetchProductList();
    if (list.length) {
      listHtml =
        `<ul style="list-style:none;padding:0;margin:28px auto 0;max-width:560px;text-align:left">` +
        list
          .map(
            (p) =>
              `<li style="padding:6px 0"><a href="${baseUrl}/producto/${esc(p.id)}" ` +
              `style="color:#fff;text-decoration:none">${esc(p.name)} — ` +
              `<span style="color:#1FE620">${esc(fmtGs(p.price))}</span></a></li>`
          )
          .join("") +
        `</ul>`;
    }
    return {
      title: s.title,
      description: s.description,
      canonical: `${baseUrl}/catalogo`,
      ogImage: ogDefault,
      extraJsonLd: "",
      content: pageContent(s.h1, s.intro, listHtml),
    };
  }

  // ----- Resto de páginas estáticas -----
  const s = STATIC[clean] || STATIC["/"];
  return {
    title: s.title,
    description: s.description,
    canonical: `${baseUrl}${clean === "/" ? "/" : clean}`,
    ogImage: ogDefault,
    extraJsonLd: "",
    content: pageContent(s.h1, s.intro, ""),
  };
}

// Para el sitemap: lista de productos (id) para generar /producto/:id.
async function getProductRoutesForSitemap() {
  const list = await fetchProductList();
  return list.map((p) => ({ id: p.id, lastmod: p.updated_at || null }));
}

export { getSeo, getProductRoutesForSitemap };
