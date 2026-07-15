// Generates the Nity G publicity QR assets in /public/publicity/nity-g/
// and verifies every variant decodes to exactly https://uroref.com/nity.
// Run via:  node scripts/generate-nity-publicity.mjs
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const URL_TARGET = 'https://uroref.com/nity';
const CHARCOAL = '#050F1C';
const TEAL = '#00D4C8';
const GOLD = '#F5D76E';
const TEXT_MUTED = '#7A8CA3';
const TEXT_SECONDARY = '#B8C5D6';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/publicity/nity-g');
await mkdir(outDir, { recursive: true });

const out = (f) => resolve(outDir, f);

// ── QR generation ──────────────────────────────────────────────
// Error correction H, 4-module quiet zone, plain square modules.
const qrSvg = (opts) =>
  QRCode.toString(URL_TARGET, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 4,
    ...opts,
  });

const svgBlack = await qrSvg({ color: { dark: '#000000', light: '#FFFFFF' } });
const svgWhite = await qrSvg({ color: { dark: '#FFFFFF', light: CHARCOAL } });
const svgTransparent = await qrSvg({ color: { dark: '#000000', light: '#0000' } });

await writeFile(out('nity-g-qr-black.svg'), svgBlack);
await writeFile(out('nity-g-qr-white.svg'), svgWhite);
await writeFile(out('nity-g-qr-transparent.svg'), svgTransparent);

for (const [svg, name] of [
  [svgBlack, 'nity-g-qr-black-2048.png'],
  [svgWhite, 'nity-g-qr-white-2048.png'],
  [svgTransparent, 'nity-g-qr-transparent-2048.png'],
]) {
  await sharp(Buffer.from(svg)).resize(2048, 2048, { kernel: 'nearest' }).png().toFile(out(name));
  console.log('→', name);
}

// Inner content of a QR SVG, for embedding into composed artwork.
const qrInner = (svg) => {
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return { viewBox, inner };
};
const embedQr = (svg, x, y, size) => {
  const { viewBox, inner } = qrInner(svg);
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${viewBox}" shape-rendering="crispEdges">${inner}</svg>`;
};

const FONT = `'Geist','Inter',-apple-system,'Segoe UI',Arial,sans-serif`;
const MONO = `'JetBrains Mono','SF Mono',Consolas,monospace`;

// ── Business-card QR artwork (card back) ───────────────────────
// UK card 85×55 mm + 3 mm bleed each side → 91×61 mm canvas.
// Trim box: (3,3)–(88,58). Safe zone: 3 mm inside trim.
const cardBack = `<svg xmlns="http://www.w3.org/2000/svg" width="91mm" height="61mm" viewBox="0 0 91 61" font-family="${FONT}">
  <!-- full-bleed background -->
  <rect width="91" height="61" fill="${CHARCOAL}"/>
  <!-- QR on a white panel: black-on-white for maximum scan reliability -->
  <rect x="8" y="14.5" width="32" height="32" rx="2" fill="#FFFFFF"/>
  <!-- QR 28 mm printed size (panel provides extra quiet zone) -->
  ${embedQr(svgTransparent, 10, 16.5, 28)}
  <text x="8.5" y="52.4" font-size="2.6" letter-spacing="0.06" fill="${TEXT_MUTED}" font-family="${MONO}">uroref.com/nity</text>
  <!-- project list -->
  <g font-size="4.6" font-weight="600" fill="#FFFFFF">
    <text x="48" y="21.2">Uro<tspan fill="${TEAL}">Ref</tspan></text>
    <text x="48" y="28.6">Prostate<tspan fill="#38BDF8">View</tspan></text>
    <text x="48" y="36">Calyx<tspan fill="#F59E0B">View</tspan></text>
    <text x="48" y="43.4">UroOps<tspan fill="#A78BFA">3D</tspan></text>
  </g>
  <text x="48" y="50.6" font-size="2.9" letter-spacing="0.14" fill="${GOLD}" font-family="${MONO}">EXPLORE THE ECOSYSTEM</text>
</svg>`;
await writeFile(out('nity-g-qr-business-card.svg'), cardBack);
console.log('→ nity-g-qr-business-card.svg');

// ── Card front (contact side) ───────────────────────────────────
const cardFront = `<svg xmlns="http://www.w3.org/2000/svg" width="91mm" height="61mm" viewBox="0 0 91 61" font-family="${FONT}">
  <rect width="91" height="61" fill="${CHARCOAL}"/>
  <!-- fine grid texture, kept inside bleed -->
  <g stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="0.1">
    ${Array.from({ length: 8 }, (_, i) => `<line x1="${11 + i * 10}" y1="0" x2="${11 + i * 10}" y2="61"/>`).join('')}
    ${Array.from({ length: 5 }, (_, i) => `<line x1="0" y1="${10 + i * 10}" x2="91" y2="${10 + i * 10}"/>`).join('')}
  </g>
  <text x="10" y="12.5" font-size="3.4" font-weight="700" fill="#FFFFFF">Uro<tspan fill="${TEAL}">Ref</tspan><tspan fill="${TEAL}" font-size="3.4"> ·</tspan></text>
  <text x="10" y="27" font-size="8.4" font-weight="700" letter-spacing="-0.2" fill="#FFFFFF">Nity G<tspan fill="${GOLD}">.</tspan></text>
  <text x="10" y="33.4" font-size="3.6" font-weight="600" fill="#FFFFFF">ST5 Urology Registrar</text>
  <text x="10" y="38.2" font-size="3" fill="${TEXT_SECONDARY}">Medical Educator · Digital Health Builder</text>
  <line x1="10" y1="43" x2="26" y2="43" stroke="${GOLD}" stroke-width="0.25" stroke-opacity="0.7"/>
  <g font-family="${MONO}" font-size="2.9">
    <text x="10" y="48.6" fill="${TEAL}">nity@uroref.com</text>
    <text x="10" y="53.2" fill="${TEXT_MUTED}">uroref.com/nity</text>
  </g>
</svg>`;
await writeFile(out('nity-card-front.svg'), cardFront);
console.log('→ nity-card-front.svg');

// ── Lanyard QR end-tag ──────────────────────────────────────────
// For a card/tag attached to the lanyard clip, not the 20 mm strap itself.
const lanyardTag = `<svg xmlns="http://www.w3.org/2000/svg" width="30mm" height="38mm" viewBox="0 0 30 38" font-family="${FONT}">
  <rect width="30" height="38" rx="2" fill="#FFFFFF"/>
  ${embedQr(svgTransparent, 3, 3, 24)}
  <text x="15" y="30.8" text-anchor="middle" font-size="2" letter-spacing="0.05" fill="#000000" font-family="${MONO}">uroref.com/nity</text>
  <text x="15" y="34.6" text-anchor="middle" font-size="2.2" font-weight="700" fill="${CHARCOAL}">Uro<tspan fill="#009B92">Ref</tspan> · Nity G</text>
</svg>`;
await writeFile(out('nity-g-qr-lanyard.svg'), lanyardTag);
console.log('→ nity-g-qr-lanyard.svg');

// ── Lanyard strap preview ───────────────────────────────────────
// 20 mm double-sided strap; one 200 mm repeat shown twice (400 mm preview).
// Text sits in the middle 12 mm; 4 mm top/bottom kept clear of stitching.
// textLength pins each segment's width so the layout holds in any font.
const repeatUnit = (x) => `
  <g transform="translate(${x},0)" font-family="${FONT}" font-weight="700" font-size="6">
    <text x="0" y="12.1" fill="#FFFFFF" textLength="13" lengthAdjust="spacingAndGlyphs">URO</text>
    <text x="14" y="12.1" fill="${TEAL}" textLength="13" lengthAdjust="spacingAndGlyphs">REF</text>
    <circle cx="31.5" cy="10" r="0.8" fill="${TEAL}"/>
    <text x="36" y="12.1" fill="#FFFFFF" textLength="22" lengthAdjust="spacingAndGlyphs">NITY G</text>
    <circle cx="62.5" cy="10" r="0.8" fill="${TEAL}"/>
    <text x="67" y="12.1" fill="#FFFFFF" textLength="75" lengthAdjust="spacingAndGlyphs">ST5 UROLOGY REGISTRAR</text>
    <circle cx="146.5" cy="10" r="0.8" fill="${TEAL}"/>
    <text x="152" y="12.1" fill="${TEXT_SECONDARY}" textLength="37" lengthAdjust="spacingAndGlyphs">UROREF.COM</text>
    <text x="194" y="11.7" fill="${GOLD}" font-size="3.1" font-weight="500" font-style="italic" font-family="${MONO}" textLength="13" lengthAdjust="spacingAndGlyphs">by Nity G</text>
  </g>`;
const lanyardStrip = `<svg xmlns="http://www.w3.org/2000/svg" width="440mm" height="20mm" viewBox="0 0 440 20" font-family="${FONT}">
  <rect width="440" height="20" fill="#0B0B0D"/>
  <!-- stitch guides: keep artwork inside -->
  <line x1="0" y1="2" x2="440" y2="2" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="0.2" stroke-dasharray="1.2 1.2"/>
  <line x1="0" y1="18" x2="440" y2="18" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="0.2" stroke-dasharray="1.2 1.2"/>
  ${repeatUnit(6)}
  ${repeatUnit(226)}
</svg>`;
await writeFile(out('nity-lanyard-preview.svg'), lanyardStrip);
console.log('→ nity-lanyard-preview.svg');

// ── Decode verification ─────────────────────────────────────────
// Every asset must decode to exactly URL_TARGET, from rendered pixels.
async function decode(input, { width = 1024, flatten = true, label }) {
  let img = sharp(input, { density: 300 }).resize({ width });
  if (flatten) img = img.flatten({ background: '#FFFFFF' });
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const result = jsQR(new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength), info.width, info.height, {
    inversionAttempts: 'attemptBoth',
  });
  const ok = result?.data === URL_TARGET;
  console.log(`${ok ? '✓' : '✗'} ${label} → ${result ? JSON.stringify(result.data) : 'NO DECODE'}`);
  return ok;
}

let allOk = true;
allOk &= await decode(out('nity-g-qr-black-2048.png'), { label: 'nity-g-qr-black-2048.png' });
allOk &= await decode(out('nity-g-qr-white-2048.png'), { label: 'nity-g-qr-white-2048.png (inverted)' });
allOk &= await decode(out('nity-g-qr-transparent-2048.png'), { label: 'nity-g-qr-transparent-2048.png (on white)' });
allOk &= await decode(Buffer.from(svgBlack), { label: 'nity-g-qr-black.svg (rendered)' });
allOk &= await decode(Buffer.from(svgWhite), { label: 'nity-g-qr-white.svg (rendered)' });
allOk &= await decode(Buffer.from(svgTransparent), { label: 'nity-g-qr-transparent.svg (rendered, on white)' });
allOk &= await decode(Buffer.from(cardBack), { width: 1075, label: 'nity-g-qr-business-card.svg (300 dpi)' });
allOk &= await decode(Buffer.from(lanyardTag), { width: 354, label: 'nity-g-qr-lanyard.svg (300 dpi)' });
// Small-print simulation: 15 mm at 300 dpi ≈ 177 px.
allOk &= await decode(out('nity-g-qr-black-2048.png'), { width: 177, label: 'black QR at 15 mm / 300 dpi print size' });

if (!allOk) {
  console.error('\nQR VERIFICATION FAILED — do not ship these assets.');
  process.exit(1);
}
console.log('\nAll QR variants decode to', URL_TARGET);
