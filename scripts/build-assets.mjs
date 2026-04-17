// One-shot script to render brand SVG assets into the PNG variants
// the platform/social-share/iOS targets need. Run via:
//   node scripts/build-assets.mjs
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub  = (p) => resolve(root, 'public', p);

async function svgToPng(svgPath, outPath, width, height) {
  const svg = await readFile(svgPath);
  const pipeline = sharp(svg, { density: 384 });
  const buf = await (height
    ? pipeline.resize(width, height, { fit: 'cover' })
    : pipeline.resize({ width })
  ).png({ quality: 92 }).toBuffer();
  await writeFile(outPath, buf);
  console.log('→', outPath);
}

await svgToPng(pub('og-image.svg'), pub('og-image.png'), 1200, 630);
await svgToPng(pub('favicon.svg'),  pub('apple-touch-icon.png'), 180, 180);
await svgToPng(pub('favicon.svg'),  pub('icon-192.png'), 192, 192);
await svgToPng(pub('favicon.svg'),  pub('icon-512.png'), 512, 512);
console.log('Done.');
