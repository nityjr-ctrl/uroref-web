import { createHash } from 'node:crypto';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const bundlePath = path.resolve('public/app-demo/static/js/main.bf23a7b9.js');
const adaptedBundlePath = path.resolve('public/app-demo/static/js/main.6d7b4626.js');
const packagedSha256 = 'FCBE4CAD36E1BEAFDA8233D9F704F7951188E86267A002F7593C857D7390EF23';
const adaptedSha256Expected = '6D7B4626333629641B2586153DE706C36D98A3D7E0464E40685C2912E5D4D14C';
const marker = 'uroref-preview-pin';

const nestedProcedureControl = '(0,Ee.jsx)("button",{onClick:()=>q(e),className:"w-full min-h-[52px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-brand-navySoft dark:hover:bg-slate-800",children:(0,Ee.jsxs)("div",{className:"flex items-center gap-2",children:[(0,Ee.jsxs)("div",{className:"min-w-0 flex-1",children:[(0,Ee.jsx)("div",{className:"truncate text-[13px] font-bold text-slate-900 dark:text-white",children:e.title}),(0,Ee.jsx)("div",{className:"truncate text-[11px] text-slate-500 dark:text-slate-400",children:e.subtitle})]}),j(t)]})},e.id)';

const siblingProcedureControls = '(0,Ee.jsxs)("div",{className:"flex items-stretch gap-1.5",children:[(0,Ee.jsx)("button",{onClick:()=>q(e),className:"min-w-0 flex-1 min-h-[52px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-brand-navySoft dark:hover:bg-slate-800",children:(0,Ee.jsxs)("div",{className:"min-w-0",children:[(0,Ee.jsx)("div",{className:"truncate text-[13px] font-bold text-slate-900 dark:text-white",children:e.title}),(0,Ee.jsx)("div",{className:"truncate text-[11px] text-slate-500 dark:text-slate-400",children:e.subtitle})]})}),(0,Ee.jsx)("div",{className:"uroref-preview-pin flex w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-brand-navySoft",children:j(t)})]},e.id)';

try {
  const existingAdapted = await readFile(adaptedBundlePath, 'utf8');
  const existingSha256 = createHash('sha256').update(existingAdapted).digest('hex').toUpperCase();
  if (!existingAdapted.includes(marker) || existingSha256 !== adaptedSha256Expected) {
    throw new Error(`Existing adapted bundle failed verification: ${existingSha256}`);
  }
  console.log(`App-demo accessibility adaptation already present (${existingSha256}).`);
  process.exit(0);
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const source = await readFile(bundlePath, 'utf8');
const sourceSha256 = createHash('sha256').update(source).digest('hex').toUpperCase();

if (sourceSha256 !== packagedSha256) {
  throw new Error(`Refusing to adapt an unrecognised app bundle: ${sourceSha256}`);
}

const occurrences = source.split(nestedProcedureControl).length - 1;
if (occurrences !== 1) {
  throw new Error(`Expected one nested procedure-control template; found ${occurrences}.`);
}

const adapted = source.replace(nestedProcedureControl, siblingProcedureControls);
await writeFile(adaptedBundlePath, adapted, 'utf8');

const adaptedSha256 = createHash('sha256').update(adapted).digest('hex').toUpperCase();
if (adaptedSha256 !== adaptedSha256Expected) {
  throw new Error(`Adapted bundle hash changed unexpectedly: ${adaptedSha256}`);
}
await unlink(bundlePath);
console.log(`Adapted procedure controls: ${sourceSha256} -> ${adaptedSha256}`);
