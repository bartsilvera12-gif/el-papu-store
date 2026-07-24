// Sube las imágenes de tmp-images/ a Cloudinary usando el nombre de archivo
// (sin .png) como public_id. Carpeta destino: elpapustore/productos.
// MERGE seguro: no pisa scripts/cloudinary-urls.json, lo actualiza.
//
// Requiere en el entorno (o en .env):
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
//
// Uso:
//   node scripts/upload-catalogo-cloudinary.mjs
// =====================================================================

import "dotenv/config";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD || !KEY || !SECRET) {
  console.error("[FATAL] Faltan CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET");
  process.exit(1);
}

const IMAGES_DIR = join(process.cwd(), "tmp-images");
const OUT_FILE = join(process.cwd(), "scripts", "cloudinary-urls.json");
const FOLDER = "elpapustore/productos";

function signParams(params) {
  const sorted = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  return createHash("sha1").update(sorted + SECRET).digest("hex");
}

async function uploadOne(filepath, publicId) {
  const fileBuf = readFileSync(filepath);
  const b64 = `data:image/png;base64,${fileBuf.toString("base64")}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = { folder: FOLDER, overwrite: "true", public_id: publicId, timestamp: String(timestamp) };
  const signature = signParams(paramsToSign);

  const form = new FormData();
  form.append("file", b64);
  form.append("api_key", KEY);
  form.append("timestamp", String(timestamp));
  form.append("folder", FOLDER);
  form.append("public_id", publicId);
  form.append("overwrite", "true");
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Cloudinary HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return { url: json.secure_url, public_id: json.public_id, bytes: json.bytes };
}

async function main() {
  if (!existsSync(IMAGES_DIR)) { console.error(`[FATAL] No existe ${IMAGES_DIR}`); process.exit(1); }
  const out = existsSync(OUT_FILE) ? JSON.parse(readFileSync(OUT_FILE, "utf-8")) : {};
  const files = readdirSync(IMAGES_DIR).filter((f) => f.toLowerCase().endsWith(".png"));
  console.log(`Subiendo ${files.length} imágenes a Cloudinary (${FOLDER})...\n`);

  let ok = 0, fail = 0;
  for (const file of files) {
    const slug = basename(file, ".png");
    process.stdout.write(`[up] ${slug} ... `);
    try {
      const r = await uploadOne(join(IMAGES_DIR, file), slug);
      out[slug] = r;
      ok++;
      console.log(`OK ${r.bytes}B`);
    } catch (e) {
      fail++;
      console.log(`FAIL ${e.message}`);
    }
  }
  writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
  console.log(`\nListo: ${ok} OK, ${fail} fallidas. Índice: ${OUT_FILE}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
