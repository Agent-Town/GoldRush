import fs from 'node:fs';

const MERGE = '790a66f579c64944ad12dedc6a8ef011c4ca7f0d';
const SHORT = '790a66f5';

// ---- 1. goal leaf -> merged ----
const gp = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(gp, 'utf8'));
let found = 0;
const walk = (n) => {
  if (n && typeof n === 'object') {
    if (n.id === 'f1501-5-citation-quote-pairing') {
      n.status = 'merged';
      n.mergeHash = MERGE;
      n.closureReason =
        'MERGED s1515 at ' + SHORT + '. Every acceptance bar re-measured on the merged tree rather than inherited: ' +
        '--report 511/262/206/43 (main pre-merge 511/263/205/43), so scope 2 is met arithmetically — CARRIES-TITLE 206>=205, ' +
        'NUMBER-ONLY 262<=263, denominator stable at 511 — and the result lands EXACTLY on s1514\'s authoring-time prediction for ' +
        'the union arm, measured independently in another checkout at another Node version. tsc rc=0; test:node-guards rc=0, ' +
        '348 tests / 345 pass / 0 fail / 3 skipped at Node 26.4.0 (the runner\'s rc=1 / 2 reds on v23.11.1 were the standing ' +
        'F-1507-1 split, correctly diagnosed by the runner and discharged here — a FOURTH consecutive supervisor rerun). ' +
        'Manufactured-defect arms RE-PROVED, not inherited: reverting only the guard to main\'s blob inside gate-s1515 turns both ' +
        'new arms RED (rc=1, 2 fails) and restores byte-identically. build + browser NOT owed (scripts/ + docs/ only, no src/ run ' +
        'surface) and F-1460-1 checked not assumed (no src/sim, src/systems, src/entities path in the diff). ' +
        'RESIDUE: F-1515-1 filed — the union is a BACKSTOP, not a cure; greedy delimiter consumption survives and a class it ' +
        'cannot cover was MEASURED (an odd count of same-kind quotes before the title defeats BOTH arms). Pre-existing, fails ' +
        'CLOSED, and the merged change is a measured strict superset, so the slice merits its merge. ' +
        'Review: reviews/f1501-5-citation-quote-pairing.md.';
      found++;
    }
    for (const k of Object.keys(n)) if (typeof n[k] === 'object') walk(n[k]);
  }
};
walk(g);
if (found !== 1) throw new Error('expected exactly 1 leaf, found ' + found);
if (!/^[0-9a-f]{40}$/.test(MERGE)) throw new Error('mergeHash not 40 hex');
fs.writeFileSync(gp, JSON.stringify(g, null, 2) + '\n');
console.log('goal leaf -> merged, mergeHash', MERGE);

// ---- 2. BACKLOG ----
const bp = 'tasks/BACKLOG.md';
let b = fs.readFileSync(bp, 'utf8');

const openMarker = '🟢 **F-1501-5 (s1501 — ';
if (!b.includes(openMarker)) throw new Error('F-1501-5 open row marker not found');
const closed =
  '✅ **F-1501-5 — SHIPPED s1515, merged `' + SHORT + '`.** ' +
  '(gates on the merged tree, Node **26.4.0**, detached worktree `gate-s1515`: `tsc` rc=0 · `test:node-guards` **rc=0, 348 tests / ' +
  '345 pass / 0 fail / 3 skipped** · `--report` **511 / 262 / 206 / 43** against main\'s **511 / 263 / 205 / 43** · no build or ' +
  'browser owed — `scripts/` + `docs/` only, no `src/` run surface — **said out loud rather than skipped silently** · ' +
  '[F-1460-1] checked not assumed: the diff touches no `src/sim/`, `src/systems/` or `src/entities/` path.) ' +
  '🎯 **SCOPE 2\'S BAR MET ARITHMETICALLY:** `CARRIES-TITLE` **206 ≥ 205**, `NUMBER-ONLY` **262 ≤ 263**, denominator **511 = 511**; ' +
  'both arms sum (`263+205+43` and `262+206+43`). ⭐ **And it lands EXACTLY on s1514\'s authoring-time prediction for the union arm ' +
  '(`262/206/43`), measured independently in a different checkout at a different Node version — the strongest single piece of ' +
  'evidence in the drain.** 🔑 **THE CURE, from the code:** `QUOTED_BY_KIND` pairs delimiters with their own kind, and ' +
  '`matchingQuote()` tries the **loose scanner first, then by-kind**, returning the first candidate that resolves — a **union**, so ' +
  'nothing the loose scanner used to recover is lost. Both call sites go through it (the titles scan and the `CARRIES-LINE` ' +
  'fallback, [F-1252-3]), which the master required. ✅ **MANUFACTURED-DEFECT ARMS RE-PROVED BY THE DRAIN, NOT INHERITED** — a green ' +
  'never exercises a violation path (the s1299/s1301 standard), so reverting **only** the guard to main\'s blob inside the gate ' +
  'worktree turned both new arms **RED (rc=1, 13 pass / 2 fail)** and restored **byte-identically**; both are named in the output, ' +
  'so they demonstrably ran. ⚙️ **[F-1507-1] takes a FOURTH consecutive datum:** the runner reported rc=1 / 2 reds on its ambient ' +
  'v23.11.1, **correctly diagnosed them as the runtime split rather than bending a test**, and a supervisor discharged them rc=0 on ' +
  'the `.nvmrc` pin. 🚧 **RESIDUE → [F-1515-1]:** the union is a **backstop, not a cure**. Review: ' +
  '`reviews/f1501-5-citation-quote-pairing.md`. **Originally filed as:** 🟢 **(s1501 — ';
b = b.replace(openMarker, closed);

// mark the dispatch row drained
const dispatchMarker = '📮 **F-1501-5 — MASTER AUTHORED s1514 → lane-a**';
if (!b.includes(dispatchMarker)) throw new Error('F-1501-5 dispatch row not found');
b = b.replace(
  dispatchMarker,
  '✅ **F-1501-5 — MASTER AUTHORED s1514 → lane-a, DRAINED s1515 (`' + SHORT + '`), leaf `merged`.** *(originally filed as* 📮 **MASTER AUTHORED s1514 → lane-a**',
);

// insert F-1515-1 immediately after the F-1501-5 dispatch row (thread-local)
const lines = b.split('\n');
const di = lines.findIndex((l) => l.includes('F-1501-5 — MASTER AUTHORED s1514 → lane-a, DRAINED s1515'));
if (di < 0) throw new Error('could not locate dispatch line for insertion');

const newRow =
  '🟡 **F-1515-1 (s1515 — THE f1501-5 CURE IS A BACKSTOP, NOT A CURE: GREEDY DELIMITER CONSUMPTION SURVIVES IT, AND A CLASS IT ' +
  'CANNOT COVER WAS MEASURED.** Non-blocking, fire-authorable — **but it must be PRICED before it is authored.**) ' +
  'The f1501-5 master offered the union as *"a PROVEN-SAFE FLOOR, not the required implementation"* and named the cleaner ' +
  'alternative: *"a non-destructive scan that enumerates all candidate spans instead of consuming them greedily … is arguably what ' +
  'the code meant to do all along."* The runner took the floor. **That is within licence and the slice merits its merge** — but the ' +
  'underlying design is intact, and the union masks the defect only where a *same-kind* pairing happens to survive the greedy walk. ' +
  '📐 **MEASURED, NOT ASSERTED** — replaying both regexes from the merged guard over three windows: title · short code span · title ' +
  '→ loose ✗, by-kind ✓, **union RECOVERS**; title · bare apostrophe · title → loose ✗, by-kind ✓, **union RECOVERS**; ' +
  '**an ODD count of same-kind quotes before the title → loose ✗, by-kind ✗, union does NOT recover.** `he said "foo and then some ' +
  'prose "<title>".` yields `"foo and then some prose "` from **both** arms and never the title, because an unbalanced same-kind ' +
  'delimiter earlier in the window makes both scanners consume the wrong pair. ⚠️ **PRE-EXISTING, NOT INTRODUCED:** the merged ' +
  'change is a measured strict superset of main (`263/205/43 → 262/206/43`, nothing lost), so the residual was already there and ' +
  'the slice strictly improves on it. It fails **CLOSED**, so it costs cycles rather than shipping defects. ' +
  '📊 **CORPUS INCIDENCE IS UNMEASURED AND I AM NOT INVENTING A NUMBER.** Per [F-1514-1] the successor must be priced *before* ' +
  'authoring: of today\'s 262 `NUMBER-ONLY` rows, how many would a non-destructive all-pairs scan recover? **If the answer is ~0, ' +
  'CLOSE THIS ROW AS THEORY rather than building it.** 🪤 **AND THE OBVIOUS WAY TO MEASURE IT SILENTLY RETURNS A FALSE ZERO — this ' +
  'is the reusable half.** `scan()` is exported, but its rows are `{file, raw, spec, verdict, carried, mdLine, context}`: there is ' +
  '**no `window` and no `titles` field**. A probe filtering on those (as s1515\'s first attempt did) skips **every** row and reports ' +
  '`0 recoverable`, which reads exactly like *"the residual never occurs"*. It was caught only because ' +
  '`scripts/citation-title-guard.mjs` has **no `import.meta.main` guard** — importing it executes the CLI and calls ' +
  '`process.exit()`, so the probe **died loudly instead of lying quietly**. **REC: price it by copying the guard and exporting the ' +
  'window derivation — the way s1514 measured the by-kind arm — NOT by consuming `scan()`\'s public rows. ' +
  'GATE: closes when either (a) a corpus measurement shows the all-pairs scan recovers ≥1 real `NUMBER-ONLY` citation AND a slice ' +
  'lands it with a manufactured-defect arm for the odd-delimiter window, or (b) a measured incidence of 0 closes it as theory.** ' +
  'Related: [F-1501-5], [F-1514-1], [F-1506-2].';
lines.splice(di + 1, 0, newRow);
b = lines.join('\n');

fs.writeFileSync(bp, b);
console.log('BACKLOG: F-1501-5 closed, dispatch row marked drained, F-1515-1 filed');
