// s1161 — re-derive F-1160-2's own statistic before authoring its remedy.
// s1160 measured "over cap 4/20 (20%)" and diagnosed SCHEDULER STEAL, recommending min-of-3.
// Both the rate and the diagnosis are hypotheses. This measures them.
//
// Arms (interleaved, because ORDER is a confound on a box whose load drifts):
//   P = default QoS
//   E = `taskpolicy -b` (background QoS -> efficiency cores on Apple Silicon)
// If the slow mode is E-core scheduling rather than generic steal, arm E should
// reproduce the 0.63-0.90 band s1160 saw, and do so RELIABLY.
import { spawnSync } from 'node:child_process';

const GUARD = ['--experimental-strip-types', 'scripts/check-power-graph-budget.mjs'];
const CAP = 0.5;
const REPS = Number(process.argv[2] ?? 12);

function runOnce(arm) {
  const cmd = arm === 'E' ? 'taskpolicy' : process.execPath;
  const args = arm === 'E' ? ['-b', process.execPath, ...GUARD] : GUARD;
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  const text = `${r.stdout}${r.stderr}`;
  const m = text.match(/p95[= ]([0-9.]+)ms/);
  return { p95: m ? Number(m[1]) : null, code: r.status, text: m ? '' : text.slice(0, 200) };
}

const results = { P: [], E: [] };
for (let i = 0; i < REPS; i += 1) {
  for (const arm of ['P', 'E']) {          // interleaved, not blocked
    const r = runOnce(arm);
    if (r.p95 === null) { console.log(`${arm}[${i}] PARSE-FAIL rc=${r.code} ${r.text}`); continue; }
    results[arm].push(r.p95);
    console.log(`${arm}[${i}] p95=${r.p95.toFixed(3)} ${r.p95 > CAP ? 'OVER' : 'ok'}`);
  }
}

for (const arm of ['P', 'E']) {
  const v = results[arm].slice().sort((a, b) => a - b);
  if (!v.length) continue;
  const over = v.filter((x) => x > CAP).length;
  console.log(
    `\narm ${arm}: n=${v.length} min=${v[0].toFixed(3)} med=${v[Math.floor(v.length / 2)].toFixed(3)} ` +
    `max=${v[v.length - 1].toFixed(3)} OVER-CAP ${over}/${v.length} (${((over / v.length) * 100).toFixed(0)}%)`,
  );
  console.log(`  sorted: ${v.map((x) => x.toFixed(3)).join(' ')}`);
}

// What would the recommended remedy have done? min-of-3 over consecutive triples, same arm.
for (const arm of ['P', 'E']) {
  const v = results[arm];
  const mins = [];
  for (let i = 0; i + 3 <= v.length; i += 3) mins.push(Math.min(v[i], v[i + 1], v[i + 2]));
  if (!mins.length) continue;
  const over = mins.filter((x) => x > CAP).length;
  console.log(`  min-of-3 (${arm}): ${mins.map((x) => x.toFixed(3)).join(' ')} -> OVER ${over}/${mins.length}`);
}
