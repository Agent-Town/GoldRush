import fs from 'node:fs';

const path = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(path, 'utf8').split('\n');
const i = lines.findIndex((l) => l.includes('F-1510-3 (s1510 —'));
if (i < 0) throw new Error('F-1510-3 row not found');
if (lines[i].includes('s1517-f1510-3-esm-dirname-proof')) {
  console.log('already appended — no-op');
  process.exit(0);
}

const addition =
  " 🟢 **SUCCESSOR #2 AUTHORED + DISPATCHED s1517 → lane-b, AND THE REFUTED CONJUNCT IS NOW MEASURED CURED** " +
  '(`tasks/lane-f1510-3-revision-metadata-esm.md`, leaf `f1510-3-revision-metadata-esm` registered in the same commit; ' +
  'evidence `docs/bench/s1517-f1510-3-esm-dirname-proof.md`). ' +
  '✅ **`import.meta.dirname` WORKS, AND IT WAS PROVED IN A WORKTREE OF THIS REPOSITORY — which is [F-1516-1]’s own REC ' +
  'applied to the row that finding was filed against.** s1517 built a detached `gate-s1517` inside the repo (§3.0b custody; removed at the end, ' +
  'node_modules symlink unlinked first) so the probe shared the subject’s COMPOSITION: same `package.json` `"type": "module"`, same Playwright 1.61.1, ' +
  'same pinned Node 26.4.0. **Four measurements, none inherited:** ' +
  '**[1]** `typeof __dirname=undefined` reproduced independently — `eb301c3a`’s finding confirmed by a second hand — while `import.meta.dirname` resolves. ' +
  '**[2]** THE DISCRIMINATING RUN, which is the one that actually earns the claim: invoked from the repo root against the worktree’s config, ' +
  '`dirname=/…/gate-s1517` while `cwd=/…/Gold Rush`. The value is **config-anchored, not cwd-shaped**, so it names the TESTED tree — and `process.cwd()`, ' +
  'the obvious substitute, is thereby **disqualified by measurement** rather than by taste. ' +
  '**[3]** A **real** single-spec JSON-reporter run emitted `{"revision":"f56843b5b51b6265aef49bb1872aa48539ec074b","dirty":true,"actualWorkers":1}` in 4.0 s. ' +
  'That settles the fifth conjunct with **live** values; `eb301c3a` had shown the same coexistence only with `unrecorded` fallbacks. ' +
  '**[4]** Constraint (b) **DEMONSTRATED INSTEAD OF PREDICTED**: the obvious top-of-file placement pushed `workers:` from `:50` to `:69` and produced ' +
  '`FAIL — 3 pointer problem(s)` naming `scripts/fire.md`, `.claude/skills/drain/SKILL.md` and `tasks/goals.json[calibrate-suite-workers-v2]` — ' +
  'three surfaces a lane runner may not edit. The arrangement that holds puts the `metadata:` key BELOW `workers:` and the `import` plus a ' +
  '**`function` declaration** at the BOTTOM of the file (ESM imports hoist; so do function declarations; a `const` arrow would not, and would force the helper above `:50`). ' +
  'Re-measured in that shape: `50:` intact, `law-pointer-guard` **PASS**, `tsc` rc=0, identical metadata capture. ' +
  '⚠️ **A TRAP THE SEAM DOC’S OTHER CANDIDATE WALKS INTO:** this repository’s path contains a SPACE, so `import.meta.url` is percent-encoded (`Gold%20Rush`) ' +
  'and a hand-rolled `.replace(‘file://’,’’)` yields a path that does not exist. `import.meta.dirname` returns the decoded path; prefer it. ' +
  '📏 Constraint (a) **re-measured on today’s main rather than carried forward: 142 porcelain entries vs 6 tracked** (s1516 saw 128 / 8). The ratio is the point — ' +
  '`--untracked-files=no` stays mandatory. ' +
  '⚖️ **ONE CONJUNCT IS FLAGGED UNPROVED AND PUSHED TO THE RUNNER, deliberately, because the whole lesson of [F-1516-1] is that a probe’s unshared properties must be ' +
  'written down rather than discovered:** s1517’s end-to-end capture used bare `--porcelain`, **not** `--untracked-files=no`. It is a one-token change to an ' +
  '`execFileSync` argument list that touches neither the module system nor the hoisting nor the serialisation — and it is still not a measurement anyone took, so the master’s ' +
  'self-check makes re-running it the runner’s job and says why. **GATE unchanged** — this ships the MECHANISM, and the row closes only on the next REAL regeneration ' +
  'of the inventory. Related: [F-1516-1], [F-1514-1].';

lines[i] = lines[i] + addition;
fs.writeFileSync(path, lines.join('\n'));
console.log('appended to row', i, '— row now', lines[i].length, 'chars');
