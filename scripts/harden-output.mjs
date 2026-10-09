import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {transform} from 'esbuild';
const root=path.resolve('dist');
// Only remove named authoring readmes from this build. Retain their source and
// all third-party licence notices. Sister-product mirrors remain untouched.
for(const name of ['publicity/nity-g/README.md','brand/logo-kit/README.md']) {
  const target=path.resolve(root,name);
  if(!target.startsWith(root+path.sep))throw new Error('Unsafe build output path');
  if(fs.existsSync(target))fs.unlinkSync(target);
}
const script=path.join(root,'js/site.js');
fs.writeFileSync(script,(await transform(fs.readFileSync(script,'utf8'),{minify:true,sourcemap:false,target:'es2020',legalComments:'eof'})).code);
const manifest=JSON.parse(fs.readFileSync('security/demo-release.json','utf8'));
const actual=fs.readdirSync(path.join(root,'app-demo'),{recursive:true}).filter(f=>fs.statSync(path.join(root,'app-demo',f)).isFile()).map(f=>f.replaceAll('\\','/')).sort();
if(JSON.stringify(actual)!==JSON.stringify(manifest.files.map(f=>f.file).sort()))throw new Error('Unexpected/missing demo assets: only the reviewed release may ship');
for(const f of manifest.files){
  const bytes=fs.readFileSync(path.join(root,'app-demo',f.file));
  if(crypto.createHash('sha256').update(bytes).digest('hex')!==f.sha256)throw new Error(`Demo release mismatch: ${f.file}`);
}
// Do not index the interactive app or create a duplicate clinical search corpus.
const entry=path.join(root,'app-demo/index.html');
const html=fs.readFileSync(entry,'utf8');
if(!html.includes('data-pagefind-ignore'))throw new Error('Demo must be excluded from Pagefind');
console.log(`Release hardening PASS: ${actual.length} reviewed demo files; marketing JS minified; authoring readmes excluded.`);

if(process.env.UROREF_DEMO_DELIVERY==='edge') {
  // Activate only after the owner has tested the separate private-assets Worker.
  // Do not leave a second static origin copy behind its authentication gate.
  for(const file of manifest.files) {
    const target=path.resolve(root,'app-demo',file.file);
    if(!target.startsWith(path.join(root,'app-demo')+path.sep))throw new Error('Unsafe demo output path');
    fs.unlinkSync(target);
  }
  fs.writeFileSync(entry,'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>UroRef demo</title><body data-pagefind-ignore><main><h1>UroRef demo</h1><p>The interactive demo is temporarily unavailable from this address.</p><p><a href="https://uroref.com/app/">Get the full UroRef app</a></p></main></body></html>');
  console.log('Edge delivery selected: no demo JavaScript or content published to the static origin.');
}
