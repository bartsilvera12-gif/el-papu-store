// Script para subir las imágenes de tmp-images/ a Cloudinary
// =====================================================================
// Uso:
//   1) export CLOUDINARY_CLOUD_NAME="xxxx"
//   2) export CLOUDINARY_API_KEY="xxxx"
//   3) export CLOUDINARY_API_SECRET="xxxx"
//   4) node scripts/upload-to-cloudinary.mjs
//
// En Windows PowerShell:
//   $env:CLOUDINARY_CLOUD_NAME="xxxx"
//   $env:CLOUDINARY_API_KEY="xxxx"
//   $env:CLOUDINARY_API_SECRET="xxxx"
//   node scripts/upload-to-cloudinary.mjs
//
// Salida: scripts/cloudinary-urls.json con { filename: { url, public_id } }
// =====================================================================

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { createHash } from "node:crypto";

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD || !KEY || !SECRET) {
  console.error("[FATAL] Faltan env vars: CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET");
  process.exit(1);
}

const IMAGES_DIR = join(process.cwd(), "tmp-images");
const OUT_FILE = join(process.cwd(), "scripts", "cloudinary-urls.json");
const FOLDER = "elpapustore/productos";

// Mapeo nombre archivo -> slug semántico para public_id en Cloudinary
const SLUG_BY_FILE = {
  "1000196158.jpg.jpeg": "vasos-termicos-albirroja-fifa26",
  "1000196159.jpg.jpeg": "vasos-termicos-magang-elpapu",
  "1000196160.jpg.jpeg": "casco-ls2-ff353-rapid-negro-mate",
  "1000196161.jpg.jpeg": "placa-decorativa-brasil-elpapu",
  "1000196162.jpg.jpeg": "cuadro-poliptico-moto-3-piezas",
  "1000196163.jpg.jpeg": "cuadro-billete-100-dolares-placas-elpapu",
  "1000196164.jpg.jpeg": "lanyards-elpapu-vol3-pro",
  "1000196166.jpg.jpeg": "vape-life-pod-eco-ii-candy-ice-10k",
  "1000196167.jpg (1).jpeg": "cuadro-plan-de-ahorro-lisa-debo-ahorrar",
  "1000196168.jpg.jpeg": "soporte-kojima-windshield-mount-ventosa",
  "1000196169.jpg (1).jpeg": "soporte-kojima-cellphone-magnetic-mount",
  "1000196170.jpg.jpeg": "vonixx-blend-ceramic-carnauba-spray-wax-500ml",
  "1000196171.jpg.jpeg": "vonixx-v-floc-shampoo-lava-autos-500ml",
  "1000196172.jpg.jpeg": "cargador-auto-kojima-30w-dual-usbc-type-cx2",
  // Duplicado de 1000196166.jpg.jpeg → se ignora
  // "1000196166 (1).jpg.jpeg": null,
};

function signParams(params) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  return createHash("sha1").update(sorted + SECRET).digest("hex");
}

async function uploadOne(filepath, publicId) {
  const fileBuf = readFileSync(filepath);
  const ext = extname(filepath).replace(/^\./, "") || "jpeg";
  const b64 = `data:image/${ext};base64,${fileBuf.toString("base64")}`;

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder: FOLDER,
    overwrite: "true",
    public_id: publicId,
    timestamp: String(timestamp),
  };
  const signature = signParams(paramsToSign);

  const form = new FormData();
  form.append("file", b64);
  form.append("api_key", KEY);
  form.append("timestamp", String(timestamp));
  form.append("folder", FOLDER);
  form.append("public_id", publicId);
  form.append("overwrite", "true");
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cloudinary HTTP ${res.status}: ${txt}`);
  }
  const json = await res.json();
  return { url: json.secure_url, public_id: json.public_id, width: json.width, height: json.height, bytes: json.bytes };
}

async function main() {
  if (!existsSync(IMAGES_DIR)) {
    console.error(`[FATAL] No existe el directorio ${IMAGES_DIR}`);
    process.exit(1);
  }

  const out = {};
  const files = Object.keys(SLUG_BY_FILE);

  for (const file of files) {
    const slug = SLUG_BY_FILE[file];
    const filepath = join(IMAGES_DIR, file);
    if (!existsSync(filepath)) {
      console.warn(`[skip] No existe ${file}`);
      continue;
    }
    process.stdout.write(`[up] ${slug} ... `);
    try {
      const r = await uploadOne(filepath, slug);
      out[slug] = r;
      console.log(`OK ${r.bytes}B`);
    } catch (e) {
      console.log(`FAIL ${e.message}`);
      out[slug] = { error: e.message };
    }
  }

  writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
  console.log(`\nResultado escrito en ${OUT_FILE}`);
}

main().catch(e => { console.error(e); process.exit(1); });
