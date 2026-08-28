import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputPath = resolve('dist/index.html');
const buildRef = process.env.PUBLIC_BUILD_REF?.trim() || 'local';
const escapedBuildRef = buildRef
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const markerPattern = /<meta\s+name=["']uroref-build-ref["']\s+content=["'][^"']*["']\s*\/?>/i;
const html = await readFile(outputPath, 'utf8');

if (!markerPattern.test(html)) {
  throw new Error(`Missing uroref-build-ref marker in ${outputPath}`);
}

const updated = html.replace(
  markerPattern,
  `<meta name="uroref-build-ref" content="${escapedBuildRef}">`,
);

await writeFile(outputPath, updated, 'utf8');
console.log(`Injected build reference ${buildRef} into dist/index.html`);
