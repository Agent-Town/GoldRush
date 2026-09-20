import fs from 'node:fs';
const P = '/Users/robin/.claude-fires/projects/-Users-robin-Claude-Projects-Gold-Rush/memory/MEMORY.md';
let s = fs.readFileSync(P, 'utf8');
const before = Buffer.byteLength(s);
const cuts = [
  [" — dead fire's commits+mtimes look live; the log says rc=1", ""],
  [" — the lane only sees main as of its own reset", ""],
  [" — it still ran the spec, still regenerated tracked shots, and froze the next preflight; declare the instrument's exhaust", ""],
  [" — the runner's `refresh-lane` .req resets a frozen lane; s1270 escalated to the owner instead. Prove loss-free first", " — prove loss-free first"],
  [" — ANSWERED s1269: lane 7.53x vs fire 3.47x at 8 children, 1-child baselines matched within 10%, so only SCALING diverges; mechanism (plist ProcessType) still unproven; measure parallelism in the subject's UNIT", " — ANSWERED s1269; measure parallelism in the subject's UNIT"],
  [" — findings get re-derived, laws never do; fire.md told fires to corrupt their own gates for 3 weeks", ""],
  [" — stale lane would have answered 6 workers = my table said SAFE; naming a file in READ-FIRST is not a guard", " — naming a file in READ-FIRST is not a guard; gate on the subject's BLOB"],
  ["— \"idle during 8-child arm: 77.61%\" was measured after the arm ended; sample proportionally, never at a fixed delay, or you go blind in the good case", "— sample proportionally, never at a fixed delay"],
  [" — \"PASS, 335 scanned\" ran before the git add; re-run FAIL/336 on its own master. Read the denominator; quoted titles must be on ONE line", " — run author-duty guards AFTER the git add"],
  [" — now n=24 both sides: lane 0/24, fire 22/24; serial agrees, and the fire runs 6 workers SLOWER than 1", " — n=24: lane 0/24, fire 22/24"],
  [" — five fires quoted \"working directory eliminated\"; nobody had ever changed the cwd", ""],
  [" — a finding committed to main while a lane runs can change that run's output", ""],
  [" — a test that resisted 4 cures was a latency test", ""],
  [" — my probe added a round-trip inside the span it timed; the real spec disagreed and won", ""],
];
let n = 0;
for (const [a, b] of cuts) {
  if (s.includes(a)) { s = s.replace(a, b); n++; }
  else console.error('MISS: ' + a.slice(0, 60));
}
fs.writeFileSync(P, s);
const links = [...s.matchAll(/\]\(([^)]+\.md)\)/g)].map((m) => m[1]);
const missing = links.filter((f) => !fs.existsSync(P.replace(/MEMORY\.md$/, '') + f));
console.log(`applied ${n}/${cuts.length} | pointers ${links.length} (broken: ${missing.length}) | ${before} -> ${Buffer.byteLength(s)} bytes`);
