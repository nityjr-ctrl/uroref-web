import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const baseline=path.resolve('security/clinical-integrity-baseline.json');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=Object.fromEntries([...walk('src/content'), 'public/index.html','public/js/site.js'].sort().map(f=>[f.replaceAll('\\','/'),crypto.createHash('sha256').update(fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n')).digest('hex')]));
if(process.argv.includes('--write-baseline')) {
  if(fs.existsSync(baseline))throw new Error('Refusing to overwrite existing content freeze');
  fs.mkdirSync(path.dirname(baseline),{recursive:true});fs.writeFileSync(baseline,JSON.stringify({schema:1,files},null,2)+'\n');
}else{
  if(JSON.stringify(files)!==JSON.stringify(JSON.parse(fs.readFileSync(baseline,'utf8')).files))throw new Error('Clinical/educational content changed; review separately.');
  console.log(`Content integrity PASS: ${Object.keys(files).length} website source files.`);
}
