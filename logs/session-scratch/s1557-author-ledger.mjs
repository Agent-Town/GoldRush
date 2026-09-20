// s1557 — register the f1557-3 leaf + file the F-1557-3 BACKLOG row (same commit as the master).
import fs from 'node:fs';

const LEAF = {
  id: 'f1557-3-m4-06-denied-drift-differential',
  title: 'M4-06 permission-denied: assert the rule before the proxy, and measure drift directionally',
  taskFile: 'lane-b-f1557-3-m4-06-denied-drift-differential.md',
  status: 'queued',
};

// ---- goal leaf: attach beside the other m4/agent leaves --------------------
const gp = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(gp, 'utf8'));

let host = null;
function walk(n) {
  if ((n.tasks || []).some((t) => /m4-06|m4-08|embodiment|attribution/i.test(t.id || ''))) host = n;
  for (const k of ['subgoals', 'tasks', 'children']) (n[k] || []).forEach(walk);
}
g.goals.forEach(walk);

if (!host) {
  // fall back: the subgoal that already owns agent-side factory leaves
  function findByTask(n) {
    if ((n.tasks || []).some((t) => /f1319-2|f1318-1|findings-state-guard/.test(t.id || ''))) return n;
    for (const k of ['subgoals', 'tasks', 'children']) {
      for (const c of n[k] || []) { const r = findByTask(c); if (r) return r; }
    }
    return null;
  }
  for (const root of g.goals) { host = findByTask(root); if (host) break; }
}
if (!host) { console.error('no host subgoal found — ABORT'); process.exit(1); }
if (JSON.stringify(g).includes(LEAF.id)) { console.error('leaf already present — ABORT'); process.exit(1); }

host.tasks.push(LEAF);
fs.writeFileSync(gp, JSON.stringify(g, null, 2) + '\n');
console.log('leaf registered under subgoal:', host.id || host.title);

// ---- BACKLOG row ---------------------------------------------------------
const bp = 'tasks/BACKLOG.md';
const L = fs.readFileSync(bp, 'utf8').split('\n');
const row =
  '🔬 **F-1557-3 (s1557 2026-08-08, F-1285-2\'s GATE RUN AT LAST — AND THE ANSWER IS THE THIRD OPTION ITS GATE DID NOT OFFER. AUTHORED + DISPATCHED TO lane-b).** ' +
  'F-1285-2 sat open since s1285 behind **GATE: re-run both arms idle**. ✅ **RUN s1557 on a genuinely idle board** (no batteries, no playwright, no lane runners; the only resident ' +
  '`codex exec` was a FOREIGN project at 0.0–0.4% CPU — measured, not assumed), mobile-chrome, `--workers=1`: **`--repeat-each=5` → 5 passed; `--repeat-each=10` → 9 passed, 1 FAILED.** ' +
  '**Idle total 14/15, with the failure reading `0.4757520362541813` against `< 0.45`.** Against s1285\'s loaded arms (merged **4/5 failed**, control `0b87c662` **5/5 failed**). ' +
  '⇒ **The quantity STRADDLES the threshold: load is a strong amplifier (80% → ~7%) but is NOT the cause.** F-1285-2\'s gate allowed only *"green idle ⇒ load ceiling"* or *"red ⇒ instrument finding"*; ' +
  'the truth is neither. ⚠️ **I nearly filed the wrong verdict: the first batch was 5/5 and I was one command from writing "load ceiling, closed."** The second batch is the only reason this row is right — ' +
  '**a 5-sample green on a straddling quantity is not a negative result.** ' +
  '🔑 **THE DEFECT, verified by READING `e2e/m4-06-embodiment.spec.ts:395`–`:417` on main rather than by re-running it: the test asserts its WEAKEST PROXY FIRST.** The rule it is named for — ' +
  '*"permission-denied receipts do not send the Prospector to the denied target"* — is encoded by `:411` (`after.moving === false`), `:412` (target unchanged) and `:413` (target NOT the denied node). ' +
  'The flaky line `:410` (`distance(after.position, before.position) < 0.45`) encodes something weaker and DIFFERENT: **undirected** drift magnitude, over 350 ms at `?timescale=4` (≈1.4 s of sim), which ' +
  'idle wander alone can push past 0.45. **Because it runs first, every failure of this test aborts BEFORE the three assertions that prove the property.** ' +
  '⛔ **CONSEQUENCE FOR THE STANDING PROHIBITION: F-1285-2 says "do NOT widen the 0.45 tolerance", on the ground that "the number encodes *the Prospector did not walk to the denied target*". ' +
  'That ground is MEASURED FALSE — `:413` encodes that; `:410` does not.** The prohibition was real and protective, but it was guarding the wrong line, and obeying it literally would have preserved the flake forever. ' +
  '**The cure still does not widen anything by fiat:** it replaces the undirected magnitude with the DIRECTIONAL form of the same rule (`gapClosed` = how much of the distance to the denied node was closed), ' +
  'reorders the semantics ahead of the proxy, and requires every threshold to be derived from an archived 30×2-sample distribution — with an explicit STOP if the measured spread cannot support a meaningful bound. ' +
  '📦 **DISPATCHED: `tasks/lane-b-f1557-3-m4-06-denied-drift-differential.md` → lane-b** (leaf `f1557-3-m4-06-denied-drift-differential`), firewalled against `src/**` — if the drift is a real product bug the runner REPORTS it rather than fixing it, ' +
  'since a test-correctness slice that starts editing the Prospector is how a flake becomes a regression. ' +
  '💡 **The reusable half, and it is about gates rather than about this test: a gate phrased as a DICHOTOMY silently forbids its own third answer.** F-1285-2 wrote a good gate, ran nothing for 272 fires, ' +
  'and pre-committed to two verdicts; the measurement fits neither, and the row\'s prescribed cure (*amend §3.1*) would have been wrong under either reading. **§3.1 needs NO amendment** — `--workers=1` is not impeached ' +
  'by a flake that survives it, because serialisation was only ever claimed to cure 6-worker starvation. ' +
  '**GATE: drain when lane-b reports; the archived distribution `artifacts/f1557-3-m4-06-denied/distribution.txt` must exist and must justify both chosen thresholds, and the 15×2 re-run must be reported even if it still fails.**';

L.splice(0, 0, row, '');
fs.writeFileSync(bp, L.join('\n'));
console.log('BACKLOG row filed at L1');
