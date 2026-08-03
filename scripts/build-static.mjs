// Build estático para hosting Apache (Hostinger) — sin Node en producción.
// =====================================================================
// Genera dist/ con:
//   - build/*.js        → JSX de src/ precompilado (mismo esbuild que server.js)
//   - index.html        → placeholders {{...}} resueltos (SEO por defecto + hash)
//   - assets/           → copiados tal cual
//   - .htaccess         → SPA fallback + cache + gzip
//   - robots.txt        → versión estática
//   - sitemap.xml       → rutas públicas estáticas
//
// Uso:
//   node scripts/build-static.mjs [https://tu-dominio.com]
//   (o definí DEPLOY_URL en el entorno). Default: https://elpapustore.com.py
// =====================================================================

import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import * as esbuild from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");

// Dominio de producción para canonical/OG/JSON-LD (sin barra final).
const BASE_URL = (process.argv[2] || process.env.DEPLOY_URL || "https://elpapustore.com.py")
  .replace(/\/+$/, "");

// Mismos scripts y orden que server.js
const APP_SCRIPTS = [
  "data", "supabase-client", "store-api", "components",
  "pages-home", "pages-shop", "pages-misc", "admin", "app",
];

// ─── 1) Compilar JSX → build/*.js (idéntico a buildClientScripts de server.js) ──
const hash = crypto.createHash("sha1");
const compiled = new Map();
for (const name of APP_SCRIPTS) {
  const src = readFileSync(join(ROOT, "src", `${name}.jsx`), "utf8");
  const out = esbuild.transformSync(src, { loader: "jsx", jsx: "transform", target: "es2019" });
  compiled.set(name, out.code);
  hash.update(out.code);
}
const BUILD_VERSION = hash.digest("hex").slice(0, 10);

// ─── 2) Limpiar y crear dist/ ────────────────────────────────────────
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, "build"), { recursive: true });
for (const [name, code] of compiled) {
  writeFileSync(join(DIST, "build", `${name}.js`), code);
}

// ─── 3) index.html con placeholders resueltos (SEO por defecto) ───────
const seo = {
  title: "El Papu Store — Productos urbanos y virales en Paraguay",
  description:
    "El Papu Store: productos urbanos, virales y útiles en Paraguay. Compra rápida y atención por WhatsApp.",
  canonical: `${BASE_URL}/`,
  ogImage: `${BASE_URL}/assets/og-image.png`,
  extraJsonLd: "",
  seoContent: "",
};
const html = readFileSync(join(ROOT, "index.html"), "utf8")
  .split("{{BASE_URL}}").join(BASE_URL)
  .split("{{BUILD_V}}").join(BUILD_VERSION)
  .split("{{TITLE}}").join(seo.title)
  .split("{{DESCRIPTION}}").join(seo.description)
  .split("{{CANONICAL}}").join(seo.canonical)
  .split("{{OG_IMAGE}}").join(seo.ogImage)
  .split("{{EXTRA_JSONLD}}").join(seo.extraJsonLd)
  .split("{{SEO_CONTENT}}").join(seo.seoContent);
writeFileSync(join(DIST, "index.html"), html);

// ─── 4) Copiar assets/ y .htaccess ───────────────────────────────────
cpSync(join(ROOT, "assets"), join(DIST, "assets"), { recursive: true });
if (existsSync(join(ROOT, ".htaccess"))) {
  cpSync(join(ROOT, ".htaccess"), join(DIST, ".htaccess"));
}

// ─── 5) robots.txt + sitemap.xml estáticos ───────────────────────────
writeFileSync(join(DIST, "robots.txt"),
`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /checkout
Disallow: /pagopar

Sitemap: ${BASE_URL}/sitemap.xml
`);

const SITEMAP_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/catalogo", priority: "0.9", changefreq: "daily" },
  { path: "/sobre", priority: "0.6", changefreq: "monthly" },
  { path: "/contacto", priority: "0.6", changefreq: "monthly" },
  { path: "/faq", priority: "0.5", changefreq: "monthly" },
  { path: "/politicas", priority: "0.3", changefreq: "yearly" },
];
const urls = SITEMAP_ROUTES.map((r) =>
`  <url>
    <loc>${BASE_URL}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("\n");
writeFileSync(join(DIST, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);

console.log(`\n  ✔ Build estático generado en dist/`);
console.log(`  → dominio:  ${BASE_URL}`);
console.log(`  → versión:  ${BUILD_VERSION}`);
console.log(`  → scripts:  ${APP_SCRIPTS.length} archivos en dist/build/`);
console.log(`\n  Subí el CONTENIDO de dist/ a la carpeta public_html de Hostinger.\n`);
