import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const outputPath = resolve('dist/index.html');
const dir = resolve('src/content/deep-dives');
const LIMIT = 5;

const monthOrder = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
};

const catColour = {
  Oncology: '--cat-oncology',
  Stones: '--cat-stones',
  BPH: '--cat-oncall',
  Endourology: '--cat-oncall',
  'On-call': '--cat-oncall',
  'Peri-operative': '--cat-oncall',
};

const escapeHtml = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const scalar = (fm, key) => {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  if (!m) return undefined;
  return m[1].trim().replace(/^"(.*)"$/s, '$1').replace(/\\"/g, '"');
};

const files = (await readdir(dir)).filter((f) => f.endsWith('.mdx'));
const articles = [];
for (const file of files) {
  const raw = await readFile(join(dir, file), 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`No frontmatter in ${file}`);
  const [, fm, body] = m;
  const title = scalar(fm, 'title');
  const date = scalar(fm, 'date');
  const [month, year] = (date ?? '').split(' ');
  if (!title || !monthOrder[month] || !year) throw new Error(`Bad title/date in ${file}`);
  const tagsLine = scalar(fm, 'tags') ?? '';
  const firstTag = tagsLine.match(/"([^"]+)"/)?.[1] ?? 'Deep dive';
  const words = body.split(/\s+/).filter(Boolean).length;
  articles.push({
    id: file.replace(/\.mdx$/, ''),
    title,
    month,
    year: Number(year),
    tag: firstTag,
    minutes: Math.max(1, Math.round(words / 180)),
  });
}

articles.sort(
  (a, b) =>
    b.year - a.year ||
    monthOrder[b.month] - monthOrder[a.month] ||
    a.id.localeCompare(b.id),
);

const items = articles
  .slice(0, LIMIT)
  .map(
    (a) => `        <a class="log-item" href="/deep-dives/${a.id}">
          <span class="cat" style="color:var(${catColour[a.tag] ?? '--cat-default'})">${escapeHtml(a.tag)}</span>
          <span class="ttl">${escapeHtml(a.title)}</span>
          <span class="meta">${a.month} ${a.year} · ${a.minutes} min read</span>
        </a>`,
  )
  .join('\n');

const listPattern = /(<div\s+class="log-list"\s+data-reading-log>)[\s\S]*?(\n\s*<\/div>\n\s*<div class="log-rule")/;
const html = await readFile(outputPath, 'utf8');
if (!listPattern.test(html)) {
  throw new Error(`Missing data-reading-log marker in ${outputPath}`);
}
await writeFile(outputPath, html.replace(listPattern, (_, open, close) => `${open}\n${items}${close}`), 'utf8');
console.log(`Injected ${Math.min(LIMIT, articles.length)} reading log items into dist/index.html`);
