// Genera la imagen Open Graph (1200x630) de El Papu Store.
// Uso: node scripts/make-og.mjs   (requiere sharp instalado)
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const LOGO = path.join(root, "assets", "logo.png");
const OUT = path.join(root, "assets", "og-image.png");

const W = 1200, H = 630;
const LOGO_SIZE = 180;
const LOGO_X = Math.round((W - LOGO_SIZE) / 2);
const LOGO_Y = 78;

// Fondo + glow + textos (sin el logo, que se compone aparte).
const bg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="20%" cy="25%" r="60%">
      <stop offset="0%" stop-color="#1FE620" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="#1FE620" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="82%" cy="80%" r="55%">
      <stop offset="0%" stop-color="#00FF33" stop-opacity="0.14"/>
      <stop offset="60%" stop-color="#00FF33" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="10" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="#050505"/>
  <rect width="${W}" height="${H}" fill="url(#g1)"/>
  <rect width="${W}" height="${H}" fill="url(#g2)"/>

  <!-- borde superior neón -->
  <rect x="0" y="0" width="${W}" height="6" fill="#1FE620"/>

  <!-- aro alrededor del logo -->
  <rect x="${LOGO_X - 5}" y="${LOGO_Y - 5}" width="${LOGO_SIZE + 10}" height="${LOGO_SIZE + 10}" rx="28"
        fill="none" stroke="#1FE620" stroke-width="3" opacity="0.85" filter="url(#glow)"/>

  <!-- título -->
  <text x="${W / 2}" y="360" text-anchor="middle"
        font-family="'Arial Black','Arial',sans-serif" font-weight="900"
        font-size="104" letter-spacing="4" fill="#ffffff" filter="url(#glow)">EL PAPU STORE</text>

  <!-- tagline -->
  <text x="${W / 2}" y="430" text-anchor="middle"
        font-family="'Arial','Helvetica',sans-serif" font-weight="600"
        font-size="34" letter-spacing="1" fill="#ffffff" opacity="0.78">Productos urbanos, virales y con estilo</text>

  <!-- línea + handle -->
  <rect x="${W / 2 - 90}" y="498" width="180" height="3" rx="2" fill="#1FE620"/>
  <text x="${W / 2}" y="556" text-anchor="middle"
        font-family="'Arial','Helvetica',sans-serif" font-weight="700"
        font-size="26" letter-spacing="3" fill="#1FE620">@ELPAPU_STORE · PARAGUAY</text>
</svg>`;

// Logo redondeado (máscara rounded-rect).
const mask = Buffer.from(
  `<svg width="${LOGO_SIZE}" height="${LOGO_SIZE}" xmlns="http://www.w3.org/2000/svg"><rect width="${LOGO_SIZE}" height="${LOGO_SIZE}" rx="24" ry="24" fill="#fff"/></svg>`
);

const logoRounded = await sharp(LOGO)
  .resize(LOGO_SIZE, LOGO_SIZE, { fit: "cover" })
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();

await sharp(Buffer.from(bg))
  .composite([{ input: logoRounded, top: LOGO_Y, left: LOGO_X }])
  .png()
  .toFile(OUT);

console.log("OG image escrita en", OUT);
