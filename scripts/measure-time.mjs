import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const sepIndex = args.indexOf('--');
if (sepIndex === -1 || sepIndex === 0) {
    console.error('Usage: measure-time.mjs <label> -- <command...>');
    process.exit(1);
}

const label = args.slice(0, sepIndex).join(' ');
const [cmd, ...cmdArgs] = args.slice(sepIndex + 1);

const LOG_FILE = fileURLToPath(new URL('../perf-log.csv', import.meta.url));

const start = Date.now();
const result = spawnSync(cmd, cmdArgs, { stdio: 'inherit', shell: true });
const seconds = ((Date.now() - start) / 1000).toFixed(1);
const exitCode = result.status ?? 1;

appendFileSync(
    LOG_FILE,
    `${new Date().toISOString()},${label},${seconds},${exitCode}\n`,
);

process.exit(exitCode);
