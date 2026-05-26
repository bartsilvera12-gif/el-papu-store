// Renderiza sql/02-seed-products.template.sql reemplazando los placeholders
// __URL_<slug>__ con las URLs reales de scripts/cloudinary-urls.json.
// Output: sql/02-seed-products.sql

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const TEMPLATE = join(ROOT, "sql", "02-seed-products.template.sql");
const URLS = join(ROOT, "scripts", "cloudinary-urls.json");
const OUT = join(ROOT, "sql", "02-seed-products.sql");

if (!existsSync(TEMPLATE)) { console.error(`Falta ${TEMPLATE}`); process.exit(1); }
if (!existsSync(URLS)) { console.error(`Falta ${URLS}. Primero corré: node scripts/upload-to-cloudinary.mjs`); process.exit(1); }

const tpl = readFileSync(TEMPLATE, "utf-8");
const urls = JSON.parse(readFileSync(URLS, "utf-8"));

let rendered = tpl;
const missing = [];
const re = /__URL_([a-z0-9-]+)__/g;
let m;
const seen = new Set();
while ((m = re.exec(tpl)) !== null) {
  const slug = m[1];
  if (seen.has(slug)) continue;
  seen.add(slug);
  const data = urls[slug];
  if (!data || !data.url) {
    missing.push(slug);
    continue;
  }
  rendered = rendered.replaceAll(`__URL_${slug}__`, data.url);
}

if (missing.length) {
  console.error("[FATAL] Faltan URLs para:");
  missing.forEach(s => console.error("  -", s));
  process.exit(1);
}

writeFileSync(OUT, rendered);
console.log(`OK -> ${OUT}`);
console.log(`Slugs renderizados: ${seen.size}`);
