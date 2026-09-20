// s1521 — re-measure the fd3 own-spec arms after the 429 rate-limit window drains.
// Every console error in the first pass was the SAME string ("...status of 429"), 5/5, and the
// slice touches no `functions/` code — so the red is an artifact of running the suite twice in
// three minutes, not a property of the merge. A red is not evidence until it reproduces.
import { spawnSync } from 'node:child_process';

const WAIT_S = 150;
console.log(`waiting ${WAIT_S}s for the rate-limit window…`);
Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, WAIT_S * 1000);

const env = {
  ...process.env,
  GR_CAPTURE_EXTERNAL_SERVER: '1',
  GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5234',
};

const arms = [
  ['desktop-chrome'],
  ['mobile-chrome'],
];
const out = {};
for (const [project] of arms) {
  const r = spawnSync('npx', [
    'playwright', 'test',
    'e2e/lb-01-county-standings.spec.ts', 'e2e/field-book.spec.ts',
    `--project=${project}`, '--workers=1', '--reporter=line',
  ], { encoding: 'utf8', env, maxBuffer: 1 << 28 });
  const txt = r.stdout + r.stderr;
  const tally = txt.match(/(\d+) failed|(\d+) passed \([^)]+\)/g) || [];
  out[project] = { rc: r.status, tally: tally.join(' | ') };
  console.log(`\n=== ${project} rc=${r.status} ===`);
  console.log(tally.join(' | '));
  if (r.status !== 0) {
    const errs = [...new Set(txt.match(/"Failed to load resource[^"]*"/g) || [])];
    console.log('distinct console errors:', errs.length ? errs.join(', ') : '(none — different failure)');
    console.log(txt.split('\n').filter((l) => /✘|›.*›/.test(l)).slice(-12).join('\n'));
  }
}
console.log('\nSUMMARY', JSON.stringify(out));
process.exit(Object.values(out).every((v) => v.rc === 0) ? 0 : 1);
