import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kitDir = path.join(repoRoot, 'public', 'brand', 'logo-kit');
const presentationDir = path.join(kitDir, 'presentation');
const projects = [
  ['uroref', 'UroRef'],
  ['prostateview', 'ProstateView'],
  ['calyxview', 'CalyxView'],
  ['uroops3d', 'UrOops3D'],
  ['cystosight', 'Cystosight by UroRef'],
];
const errors = [];

for (const [id, name] of projects) {
  const markSvgPath = path.join(presentationDir, `${id}-mark.svg`);
  const lockupSvgPath = path.join(presentationDir, `${id}-lockup.svg`);
  const markPngPath = path.join(presentationDir, `${id}-mark-1024.png`);
  const lockupPngPath = path.join(presentationDir, `${id}-lockup-1600.png`);

  for (const file of [markSvgPath, lockupSvgPath, markPngPath, lockupPngPath]) {
    try { await access(file); } catch { errors.push(`Missing ${path.relative(repoRoot, file)}`); }
  }

  const markSvg = await readFile(markSvgPath, 'utf8');
  const lockupSvg = await readFile(lockupSvgPath, 'utf8');
  if (!markSvg.includes('viewBox="0 0 256 256"')) errors.push(`${id} mark has the wrong viewBox`);
  if (!markSvg.includes('<title')) errors.push(`${id} mark has no accessible title`);
  if (!lockupSvg.includes(name)) errors.push(`${id} lockup does not contain the canonical project name`);
  if (/<script\b/i.test(markSvg) || /<script\b/i.test(lockupSvg)) errors.push(`${id} SVG unexpectedly contains script`);

  const markMeta = await sharp(markPngPath).metadata();
  const lockupMeta = await sharp(lockupPngPath).metadata();
  if (markMeta.width !== 1024 || markMeta.height !== 1024 || !markMeta.hasAlpha) {
    errors.push(`${id} mark PNG must be 1024×1024 with alpha`);
  }
  if (lockupMeta.width !== 1600 || lockupMeta.height !== 400 || !lockupMeta.hasAlpha) {
    errors.push(`${id} lockup PNG must be 1600×400 with alpha`);
  }
}

const suiteMeta = await sharp(path.join(kitDir, 'uroref-project-logo-suite.png')).metadata();
if (suiteMeta.width !== 1920 || suiteMeta.height !== 1320) errors.push('Contact sheet must be 1920×1320');

const allTextFiles = [];
async function collectTextFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectTextFiles(filePath);
    else if (/\.(?:svg|md|json)$/i.test(entry.name)) allTextFiles.push(filePath);
  }
}
await collectTextFiles(kitDir);
for (const file of allTextFiles) {
  const text = await readFile(file, 'utf8');
  if (/recovery\s*view/i.test(text)) errors.push(`Non-canonical project name in ${path.relative(repoRoot, file)}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Logo kit check passed: 5 marks, 5 lockups, canonical naming, expected dimensions, and alpha-enabled PNG exports.');
}
