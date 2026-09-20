// s1254 CONTROL ARM: does e2e/trail-guide-beat-priority.spec.ts actually discriminate?
// Keep the new spec; revert ONLY src/game/Game.ts to HEAD (the pre-slice code). The spec must RED.
// A green here would mean the spec asserts nothing the tree did not already do.
// Restores the grafted Game.ts byte-identically and proves it by sha256.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SUBJECT = 'src/game/Game.ts';
const out = new URL('./control-transcript.txt', import.meta.url);
const sha = (b) => createHash('sha256').update(b).digest('hex').slice(0, 16);

const grafted = readFileSync(SUBJECT);
const before = sha(grafted);
writeFileSync(out, `CONTROL ARM — grafted ${SUBJECT} sha256[0:16] = ${before}\n`);

function run(label, cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  const body = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  appendFileSync(out, `\n===== ${label} =====\nrc=${r.status}\n${body}\n`);
  console.log(`===== ${label} rc=${r.status} =====`);
  console.log(body.split('\n').filter((l) => /passed|failed|✘|✓|Error:/.test(l)).slice(0, 25).join('\n'));
  return r.status;
}

try {
  // revert the subject only — the spec and artifacts stay grafted
  const head = spawnSync('git', ['show', `HEAD:${SUBJECT}`], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
  if (head.status !== 0) throw new Error('could not read HEAD subject');
  writeFileSync(SUBJECT, head.stdout);
  appendFileSync(out, `reverted to HEAD sha256[0:16] = ${sha(head.stdout)}\n`);
  const rc = run('spec-against-PRE-SLICE-Game.ts', 'npx', [
    'playwright', 'test', 'e2e/trail-guide-beat-priority.spec.ts', '--workers=1',
  ]);
  appendFileSync(out, `\nCONTROL VERDICT: rc=${rc} (expected NON-ZERO — the spec must fail without the slice)\n`);
} finally {
  writeFileSync(SUBJECT, grafted);
  const after = sha(readFileSync(SUBJECT));
  appendFileSync(out, `restored sha256[0:16] = ${after} — identical: ${after === before}\n`);
  console.log(`restored identical: ${after === before}`);
}
