import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kitDir = path.join(repoRoot, 'public', 'brand', 'logo-kit');
const presentationDir = path.join(kitDir, 'presentation');

const projects = [
  {
    id: 'uroref',
    label: 'UroRef',
    segments: [
      { text: 'Uro', color: '#0A2540' },
      { text: 'Ref', color: '#00AFA6' },
    ],
    accent: '#00D4C8',
    tagline: 'QUICK REFERENCE · EVIDENCE · EDUCATION',
    fontSize: 126,
    provenance: 'Normalised from the existing U-shaped UroRef app mark.',
  },
  {
    id: 'prostateview',
    label: 'ProstateView',
    segments: [
      { text: 'Prostate', color: '#0A2540' },
      { text: 'View', color: '#2587C8' },
    ],
    accent: '#F6C453',
    tagline: 'MRI · SPATIAL ANATOMY · TEACHING',
    fontSize: 108,
    provenance: 'Simplified vector companion to the established blue ProstateView emblem.',
  },
  {
    id: 'calyxview',
    label: 'CalyxView',
    segments: [
      { text: 'Calyx', color: '#0A2540' },
      { text: 'View', color: '#22A978' },
    ],
    accent: '#6EE7B7',
    tagline: 'RENAL ANATOMY · STONE LEARNING',
    fontSize: 118,
    provenance: 'New working identity created for the UroRef presentation suite.',
  },
  {
    id: 'uroops3d',
    label: 'UrOops3D',
    segments: [
      { text: 'UrOops', color: '#0A2540' },
      { text: '3D', color: '#8064E8' },
    ],
    accent: '#B8A4FF',
    tagline: 'OPERATIVE REHEARSAL · ACTIVE RECALL',
    fontSize: 116,
    provenance: 'New working identity created for the UroRef presentation suite.',
  },
  {
    id: 'cystosight',
    label: 'Cystosight by UroRef',
    segments: [
      { text: 'Cysto', color: '#0A2540' },
      { text: 'sight', color: '#3D8ECD' },
    ],
    accent: '#8FC7FF',
    tagline: 'BY UROREF · BLADDER VISION · CYSTOSCOPY',
    fontSize: 116,
    provenance: 'New working identity created for the UroRef presentation suite.',
  },
];

const xmlEscape = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const svgDataUri = (content) => `data:image/svg+xml;base64,${Buffer.from(content).toString('base64')}`;

function lockupSvg(project, markSvg) {
  const text = project.segments
    .map((segment) => `<tspan fill="${segment.color}">${xmlEscape(segment.text)}</tspan>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" role="img" aria-labelledby="title desc">
  <title id="title">${xmlEscape(project.label)} logo</title>
  <desc id="desc">Horizontal ${xmlEscape(project.label)} presentation lockup.</desc>
  <image href="${svgDataUri(markSvg)}" x="24" y="22" width="256" height="256"/>
  <text x="322" y="164" font-family="Inter, Arial, sans-serif" font-size="${project.fontSize}" font-weight="800" letter-spacing="-5">${text}</text>
  <circle cx="330" cy="213" r="6" fill="${project.accent}"/>
  <text x="349" y="220" fill="#52667A" font-family="Inter, Arial, sans-serif" font-size="23" font-weight="700" letter-spacing="4">${xmlEscape(project.tagline)}</text>
</svg>`;
}

const marks = new Map();
const lockups = new Map();

for (const project of projects) {
  const markPath = path.join(presentationDir, `${project.id}-mark.svg`);
  const markSvg = await readFile(markPath, 'utf8');
  const lockup = lockupSvg(project, markSvg);

  marks.set(project.id, markSvg);
  lockups.set(project.id, lockup);

  await writeFile(path.join(presentationDir, `${project.id}-lockup.svg`), lockup, 'utf8');
  await sharp(Buffer.from(markSvg))
    .resize(1024, 1024)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(presentationDir, `${project.id}-mark-1024.png`));
  await sharp(Buffer.from(lockup))
    .resize({ width: 1600 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(presentationDir, `${project.id}-lockup-1600.png`));
}

const cardPositions = [
  [90, 308],
  [990, 308],
  [90, 628],
  [990, 628],
  [540, 948],
];

const cards = projects.map((project, index) => {
  const [x, y] = cardPositions[index];
  const lockup = lockups.get(project.id);
  return `<g transform="translate(${x} ${y})">
    <rect width="840" height="270" rx="34" fill="#FFFFFF" stroke="#DCE5EA"/>
    <rect width="840" height="7" rx="3.5" fill="${project.accent}"/>
    <image href="${svgDataUri(lockup)}" x="30" y="29" width="780" height="195"/>
    <text x="42" y="246" fill="#728395" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="600">${xmlEscape(project.provenance)}</text>
  </g>`;
}).join('\n');

const heroMark = marks.get('uroref');
const contactSheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1320" role="img" aria-labelledby="title desc">
  <title id="title">UroRef five-project logo suite</title>
  <desc id="desc">Presentation contact sheet for UroRef, ProstateView, CalyxView, UrOops3D and Cystosight by UroRef.</desc>
  <defs>
    <linearGradient id="page" x1="0" y1="0" x2="1920" y2="1320" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F7FAFB"/>
      <stop offset="1" stop-color="#EAF0F3"/>
    </linearGradient>
    <linearGradient id="header" x1="0" y1="0" x2="1920" y2="250" gradientUnits="userSpaceOnUse">
      <stop stop-color="#061725"/>
      <stop offset="1" stop-color="#153B5F"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1320" fill="url(#page)"/>
  <rect width="1920" height="242" fill="url(#header)"/>
  <image href="${svgDataUri(heroMark)}" x="90" y="43" width="154" height="154"/>
  <text x="283" y="112" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="62" font-weight="800" letter-spacing="-2">UroRef project logo suite</text>
  <text x="285" y="159" fill="#9AB0C5" font-family="Inter, Arial, sans-serif" font-size="23" font-weight="600" letter-spacing="2">FIVE CONNECTED EDUCATIONAL PRODUCTS · PRESENTATION SET</text>
  <text x="1738" y="142" fill="#67FFF2" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" text-anchor="end">28 AUG 2026</text>
  ${cards}
  <text x="960" y="1278" fill="#607286" font-family="Inter, Arial, sans-serif" font-size="18" text-anchor="middle">Working presentation identities · original UroRef and ProstateView artwork is preserved in the Originals folder</text>
</svg>`;

await writeFile(path.join(kitDir, 'uroref-project-logo-suite.svg'), contactSheet, 'utf8');
await sharp(Buffer.from(contactSheet))
  .resize(1920, 1320)
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(kitDir, 'uroref-project-logo-suite.png'));

const manifest = {
  name: 'UroRef five-project logo kit',
  version: '2026.08.28',
  originalAssets: [
    'originals/uroref-favicon-original.svg',
    'originals/uroref-app-icon-original-512.png',
    'originals/uroref-wordmark-legacy-prostateview.svg',
    'originals/prostateview-logo-original.png',
    'originals/prostateview-symbol-original.png',
    'originals/prostateview-app-icon-legacy.svg',
    'originals/prostateview-app-icon-legacy-512.png',
  ],
  projects: projects.map((project) => ({
    id: project.id,
    name: project.label,
    accent: project.accent,
    provenance: project.provenance,
    assets: {
      markSvg: `presentation/${project.id}-mark.svg`,
      markPng: `presentation/${project.id}-mark-1024.png`,
      lockupSvg: `presentation/${project.id}-lockup.svg`,
      lockupPng: `presentation/${project.id}-lockup-1600.png`,
    },
  })),
};

await writeFile(path.join(kitDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Built ${projects.length} marks, ${projects.length} lockups, and the suite contact sheet.`);
