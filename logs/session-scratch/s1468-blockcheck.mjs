// s1468: §3.0 — is this drain ALLOWED? Read the WORD, not just the exit code.
import { spawnSync } from 'node:child_process';
const target = '20260806-005756-lane-f1467-1-alpha-recipe-ab.md';
const r = spawnSync('node', ['scripts/drain-block-check.mjs', '--strict', target], { encoding: 'utf8' });
console.log('rc=' + r.status);
console.log(r.stdout || '');
if (r.stderr) console.log('STDERR:', r.stderr);
