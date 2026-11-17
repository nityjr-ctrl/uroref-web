// Production dependency audit gate.
//
// Fails on any high or critical advisory in production dependencies, except advisories
// listed in ALLOWED below. Each exception must name the advisory, say why it is acceptable,
// and carry a review date. When the date passes, the gate fails until the entry is removed
// or consciously extended.
import { spawnSync } from 'node:child_process';

const ALLOWED = [
  {
    id: 'GHSA-fc5q-39xc-vjpf',
    package: 'picomatch',
    added: '2026-11-17',
    reviewBy: '2027-01-31',
    reason:
      'ReDoS in glob matching. No fixed release exists yet (latest is 4.0.7). picomatch is used only ' +
      'while the site is being built, on glob patterns from this repository; the published site is ' +
      'static files and never runs it. Remove this entry as soon as a patched picomatch is released.',
  },
];

const run = spawnSync('npm', ['audit', '--omit=dev', '--json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
let report;
try {
  report = JSON.parse(run.stdout);
} catch {
  console.error('audit:production could not read the npm audit report.');
  console.error(run.stderr || run.stdout);
  process.exit(1);
}
if (report.error) {
  console.error('audit:production: npm audit returned an error:', report.error.summary || report.error.code);
  process.exit(1);
}

const ghsa = (url = '') => (url.match(/GHSA-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}/i) || [''])[0];
const serious = new Map();
for (const [pkg, vuln] of Object.entries(report.vulnerabilities || {})) {
  for (const via of vuln.via || []) {
    if (typeof via !== 'object') continue; // a package name: flagged only through another advisory
    if (via.severity !== 'high' && via.severity !== 'critical') continue;
    const id = ghsa(via.url) || String(via.source);
    serious.set(id, { id, pkg, severity: via.severity, title: via.title, url: via.url });
  }
}

const today = new Date().toISOString().slice(0, 10);
const allowed = new Map(ALLOWED.map((entry) => [entry.id, entry]));
const blocking = [];
const excepted = [];
for (const advisory of serious.values()) {
  const entry = allowed.get(advisory.id);
  if (!entry) blocking.push(advisory);
  else if (today > entry.reviewBy) blocking.push({ ...advisory, expired: entry.reviewBy });
  else excepted.push({ ...advisory, reviewBy: entry.reviewBy });
}

for (const a of excepted) {
  console.log(`Allowed by exception until ${a.reviewBy}: ${a.id} (${a.pkg}, ${a.severity}) ${a.title}`);
}
for (const entry of ALLOWED) {
  if (!serious.has(entry.id)) console.log(`Exception ${entry.id} (${entry.package}) is no longer needed. Remove it from scripts/audit-production.mjs.`);
}

if (blocking.length) {
  console.error(`\naudit:production failed: ${blocking.length} high or critical advisory(ies) in production dependencies.`);
  for (const a of blocking) {
    console.error(`- ${a.id} (${a.pkg}, ${a.severity}) ${a.title}${a.expired ? ` [exception expired ${a.expired}]` : ''}\n  ${a.url}`);
  }
  process.exit(1);
}
console.log(`audit:production passed: no unexcepted high or critical advisories (${excepted.length} excepted).`);
