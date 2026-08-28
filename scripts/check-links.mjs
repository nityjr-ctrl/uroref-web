import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const requiredPaths = [
  'index.html',
  'showcase/index.html',
  'imaging-lab/index.html',
  'last30days/index.html',
  'pagefind/pagefind.js',
  'pagefind/pagefind-entry.json',
  'pagefind/wasm.en.pagefind',
  'prostateview/v2/template-report-visualiser/index.html',
  'prostateview/v2/learn/mental-rotation/index.html',
  'prostateview/v2/case/pv-case-001/index.html',
  'prostateview/demo-cases/pv-case-001/model.glb',
  'prostateview/demo-cases/pv-case-001/model.usdz',
  'prostateview/models_ar_human/pv-case-001/model.glb',
  'prostateview/models_ar_human/pv-case-001/model.usdz',
  'prostateview/demo-cases/pv-case-001/preview/t2_full_slice_overlay.png',
  'prostateview/draco/draco_wasm_wrapper.js',
  'prostateview/draco/draco_decoder.wasm',
  'prostateview/draco/draco_decoder_gltf.wasm',
  'prostateview/draco/draco_decoder.js',
];

const exists = async (candidate) => {
  try {
    return (await stat(candidate)).isFile();
  } catch {
    return false;
  }
};

const walk = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
};

const authoredHtml = (await walk(root))
  .filter((file) => file.endsWith('.html'))
  .filter((file) => !path.relative(root, file).split(path.sep).includes('prostateview'));

const errors = [];
let checked = 0;

for (const required of requiredPaths) {
  if (!await exists(path.join(root, required))) errors.push(`Missing required presentation asset: /${required.replaceAll('\\', '/')}`);
}

for (const [directory, extension] of [['pagefind/index', '.pf_index'], ['pagefind/fragment', '.pf_fragment'], ['pagefind/filter', '.pf_filter']]) {
  try {
    const entries = await readdir(path.join(root, directory), { withFileTypes: true });
    if (!entries.some((entry) => entry.isFile() && entry.name.endsWith(extension))) {
      errors.push(`Pagefind produced no ${extension} data in /${directory}`);
    }
  } catch {
    errors.push(`Missing Pagefind data directory: /${directory}`);
  }
}

for (const file of authoredHtml) {
  const html = await readFile(file, 'utf8');
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const pagePath = relative === 'index.html' ? '/' : `/${relative.replace(/index\.html$/, '')}`;
  const attributePattern = /\b(?:href|src)\s*=\s*["']([^"'<>]+)["']/gi;

  for (const match of html.matchAll(attributePattern)) {
    const raw = match[1].trim();
    if (!raw || raw === '#' || raw.includes('${') || raw.includes('{{') || /^(?:https?:|mailto:|tel:|data:|blob:|javascript:|\/\/)/i.test(raw)) continue;

    let url;
    try {
      url = new URL(raw, `https://uroref.local${pagePath}`);
    } catch {
      errors.push(`${relative}: invalid URL ${raw}`);
      continue;
    }

    if (url.hostname !== 'uroref.local') continue;
    checked += 1;
    const decodedPath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const baseCandidate = path.join(root, decodedPath);
    const candidates = url.pathname.endsWith('/')
      ? [path.join(baseCandidate, 'index.html')]
      : [baseCandidate, path.join(baseCandidate, 'index.html'), `${baseCandidate}.html`];
    const target = (await Promise.all(candidates.map(async (candidate) => await exists(candidate) ? candidate : null))).find(Boolean);

    if (!target) {
      errors.push(`${relative}: ${raw} does not resolve inside dist`);
      continue;
    }

    if (url.hash && target.endsWith('.html')) {
      const fragment = decodeURIComponent(url.hash.slice(1));
      if (fragment) {
        const targetHtml = target === file ? html : await readFile(target, 'utf8');
        const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!new RegExp(`(?:id|name)=["']${escaped}["']`, 'i').test(targetHtml)) {
          errors.push(`${relative}: ${raw} points to a missing fragment`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error(`Link check failed with ${errors.length} issue(s):\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exit(1);
}

console.log(`Link check passed: ${authoredHtml.length} authored pages, ${checked} internal references and ${requiredPaths.length} presentation assets.`);
