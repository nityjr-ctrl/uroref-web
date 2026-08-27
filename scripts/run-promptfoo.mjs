import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);
const isLiveEval = args.some((argument) => argument.includes('promptfoo.live'));

if (isLiveEval && !process.env.ARIADNE_EVAL_ENDPOINT) {
  console.error('Live Ariadne evaluation is gated: set ARIADNE_EVAL_ENDPOINT to an approved evaluation-only endpoint.');
  process.exit(2);
}

const configDirectory = path.resolve('.promptfoo-local');
mkdirSync(configDirectory, { recursive: true });

const cli = path.resolve('node_modules/promptfoo/dist/src/entrypoint.js');
const result = spawnSync(process.execPath, [cli, ...args], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    ...process.env,
    PROMPTFOO_CONFIG_DIR: configDirectory,
    PROMPTFOO_DISABLE_TELEMETRY: '1',
    PROMPTFOO_DISABLE_UPDATE: '1',
  },
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
