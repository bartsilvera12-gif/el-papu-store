// El Papu Store — Servidor Node/Express
// =====================================================================
// Sirve el frontend estático (index.html + src + assets) y deja listo
// el espacio para endpoints de API (PagoPar, etc.) bajo /api/*.
// =====================================================================

import "dotenv/config";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { pagoparRouter } from "./backend/routes-pagopar.js";
import { pagoparConfig } from "./backend/pagopar.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();

// ─── SEO helpers ──────────────────────────────────────────────────────
// index.html trae placeholders {{BASE_URL}} para URLs absolutas (canonical,
// Open Graph, JSON-LD). Las resolvemos por request: usamos APP_URL si apunta
// a un dominio real, sino derivamos del host del request (útil en local).
const INDEX_PATH = path.join(__dirname, "index.html");

function resolveBaseUrl(req) {
  if (APP_URL && !/localhost|127\.0\.0\.1/i.test(APP_URL)) {
    return APP_URL.replace(/\/+$/, "");
  }
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "http").split(",")[0].trim();
  return `${proto}://${req.get("host")}`;
}

function sendIndex(req, res) {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  let html;
  try {
    html = fs.readFileSync(INDEX_PATH, "utf8");
  } catch (e) {
    return res.status(500).send("index.html no encontrado");
  }
  const baseUrl = resolveBaseUrl(req);
  res.type("html").send(html.split("{{BASE_URL}}").join(baseUrl));
}

// Rutas públicas indexables para el sitemap (el resto se excluye en robots).
const SITEMAP_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/catalogo", priority: "0.9", changefreq: "daily" },
  { path: "/sobre", priority: "0.6", changefreq: "monthly" },
  { path: "/contacto", priority: "0.6", changefreq: "monthly" },
  { path: "/faq", priority: "0.5", changefreq: "monthly" },
  { path: "/politicas", priority: "0.3", changefreq: "yearly" },
];

// ─── Seguridad ────────────────────────────────────────────────────────
// helmet con CSP relajada porque cargamos React/Babel/Tailwind/Supabase
// desde CDN y compilamos JSX en el cliente con Babel standalone.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ─── Middlewares ──────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// ─── Healthcheck ──────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    env: NODE_ENV,
    uptime: process.uptime(),
    ts: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────
app.use("/api/pagopar", pagoparRouter());

// ─── SEO: robots.txt y sitemap.xml ────────────────────────────────────
app.get("/robots.txt", (req, res) => {
  const baseUrl = resolveBaseUrl(req);
  res.type("text/plain").send(
`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /checkout
Disallow: /pagopar

Sitemap: ${baseUrl}/sitemap.xml
`);
});

app.get("/sitemap.xml", (req, res) => {
  const baseUrl = resolveBaseUrl(req);
  const urls = SITEMAP_ROUTES.map((r) =>
`  <url>
    <loc>${baseUrl}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("\n");
  res.type("application/xml").send(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);
});

// ─── Estáticos ────────────────────────────────────────────────────────
// MIME para .jsx (Babel standalone los lee como text/babel en el client)
express.static.mime.define({ "application/javascript": ["jsx"] });

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

// Servir index.html (con URLs SEO inyectadas) sin cache, para no quedar
// pegado con versiones viejas. Interceptamos también /index.html para que
// nunca se sirva el archivo crudo con los placeholders {{BASE_URL}}.
app.get(["/", "/index.html"], sendIndex);

// Resto de archivos con cache largo (los .jsx cambian poco)
app.use(
  express.static(__dirname, {
    index: false,
    maxAge: NODE_ENV === "production" ? ONE_YEAR : 0,
    setHeaders(res, filePath) {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    },
  })
);

// ─── SPA fallback ─────────────────────────────────────────────────────
// Cualquier ruta que no sea /api/* y que no haya matcheado un archivo
// real, sirve index.html (para que /admin, /admin/login, etc. carguen
// el router del frontend).
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  sendIndex(req, res);
});

// ─── Error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(500).json({ ok: false, error: err.message || "internal_error" });
});

// ─── Start ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const pg = pagoparConfig();
  console.log(`\n  El Papu Store`);
  console.log(`  → ${APP_URL}`);
  console.log(`  → env: ${NODE_ENV}`);
  console.log(`  → healthcheck: ${APP_URL}/api/health`);
  console.log(`  → pagopar mode: ${pg.mode}`);
  console.log(`  → pagopar keys: public=${pg.public_key_set ? "set" : "MISSING"} private=${pg.private_key_set ? "set" : "MISSING"}`);
  console.log(`  → pagopar base: ${pg.base_url}`);
  console.log(`  → pagopar checkout: ${pg.checkout_url}`);
  if (pg.webhook_url) {
    console.log(`  → pagopar webhook (esperado en panel): ${pg.webhook_url}`);
  }
  console.log();
});
