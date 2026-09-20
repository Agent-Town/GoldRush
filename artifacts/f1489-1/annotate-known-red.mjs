// s1491 — the next fire that meets this red greps the KNOWN-RED row (F-1146-6), not the finding
// that was closed about it. Put the re-validated recipe where it will actually be read.
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = readFileSync(p, 'utf8').split('\n');
const i = lines.findIndex((l) => l.includes('F-1146-6 — `vp-02-sprite-animation:405` IS THE KNOWN LOAD-SENSITIVE FLAKE'));
if (i === -1) throw new Error('F-1146-6 row not found');
if (lines[i].includes('RE-VALIDATED s1491')) throw new Error('already annotated');

lines[i] +=
  ' ✅ **RE-VALIDATED s1491 (F-1489-1 closed): this discriminator STILL WORKS — 3/3 both projects, verbatim recipe, on `2895ab088`.** ' +
  'Two clarifications that cost s1489 a wrong conclusion. **(1) "Isolated" means COMPOSITION-isolated — the single test via `-g "warmed test clip swaps"` — not "a quiet box".** s1489 ran a quiet box but the full 3-spec battery, reported the property as decayed, and filed a bisect nobody could have completed. ' +
  '**(2) The predicate is NOT deterministic in either direction: 18/20 quiet instances pass, so ONE red in the quiet arm does not refute the property** — re-run it before concluding anything, exactly as the house law says about numbers. The contended half is the reliable one (battery RED 2/2). ' +
  '⚠️ **And `:461` (textures) and `:467` (draw calls) are DIFFERENT assertions, not "the same lines"** — a `:461` red means `:467` never even ran. Ready-made predicate: `node artifacts/f1489-1/probe.mjs --cwd <worktree> --port <scratch> [--battery] [--repeat 3]`.';

writeFileSync(p, lines.join('\n'));
console.log(`annotated the F-1146-6 known-red row at line ${i + 1}`);
