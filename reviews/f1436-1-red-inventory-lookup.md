# f1436-1-red-inventory-lookup — drain review (s1447)

**Slice:** `f1436-1-red-inventory-lookup` · **branch:** `lane/perf` (lane-d) · **tip:** `e7011955`
**Merge-base:** `8eb04081` · **Merged as:** `4070ace526aa82525b8a73e5439ac44f9d685b87`
**Gated in:** detached worktree `gate-s1447` (§3.0b), removed after.

## VERDICT: ACCEPT — MERGED.

## What it does
Gives a drain a way to ask a question it previously answered by eye: **"is this red already
known?"** `scripts/red-inventory-lookup.mjs` parses `logs/suite-red-inventory.md` (and a compact
JSON sidecar) and answers per spec file, or per exact test title, with the recorded coordinate,
the blast-radius percentages, the project(s) affected and the recorded error excerpt.

The design decision that matters is the **fail-safe outcome split**. There are three outcomes
(`red-inventory-lookup.mjs:141`) — `KNOWN-RED`, `CLEAN-IN-INVENTORY`, `NOT-IN-INVENTORY` — and a
spec the inventory never covered returns **`NOT-IN-INVENTORY`, not "clean"**. That is the whole
point: F-1444-2's hazard is inventory membership being read as exoneration, and a tool that
answered "clean" for an unrecorded spec would have industrialised exactly that mistake.

## Merge classification
Base `8eb04081`; **main never moved any of the three files since** (`git log 8eb04081..main --
<path>` empty for `package.json`; both scripts absent from main entirely).

| file | classification | note |
|---|---|---|
| `scripts/red-inventory-lookup.mjs` | **PURE ADD** (+171) | `git cat-file -e main:…` → does not exist |
| `scripts/red-inventory-lookup.test.mjs` | **PURE ADD** (+158) | 8 tests |
| `package.json` | **LANE-TOUCHED only** (+1/-1) | inserts exactly one entry into the `test:node-guards` roster, in alphabetical position between `rehearsal-base` and `ruling-propagation` |

No conflicts; no 3-way needed. All three landed blobs verified **byte-identical** to the lane tip
by `git rev-parse HEAD:<path>` vs `refs/heads/lane/perf:<path>`.

⚠️ **A two-dot `git diff main..lane/perf` reported six extra files including a 142-line
"deletion" of `tasks/art-drill-yard-stations-keyed.md` and an 8-line cut to `tasks/goals.json`.
Those are stale-base phantoms, not deletes** — the lane branched at `8eb04081`, before this same
fire committed those files at `d2dc14cc`. The three-dot diff and the runner's own commit stat both
report the true content: **3 files, +330/-1.** Recorded because the phantom set named files this
fire had just written, which is the most convincing possible version of that illusion.

## Evidence (all measured on the merged tree in `gate-s1447`, `--workers=1` where applicable)
| gate | result |
|---|---|
| `npx tsc --noEmit` | **clean, rc=0** |
| `npm run build` | **green, 1.18 s**; asset-diet unchanged (54 plate-class PNGs) |
| `test:node-guards` (full chain, run verbatim from `package.json`) | **rc=0** — incl. `test-ticker-stats`, `findings-state`, `blocker-panel` (76 panel rows, 0 closed-on-panel), `ruling-propagation` (3 ruled, 27 refusals, **0 stale**), `desk-declaration` (145/145, 0 undeclared) |
| new leaf `red-inventory-lookup.test.mjs` | **8 pass / 0 fail**, 351 ms |
| adjacent suites | **structurally none.** The slice touches no `src/`, no `e2e/`, no contract/manifest/balance data. The one gate surface it modifies *is* `test:node-guards`, which was run in full above — including `gate-caller-audit`, the guard that asserts a new npm-rooted script is actually rooted. |
| screenshots / perf | **not applicable — nothing renders.** No `src/` surface is touched, so there is no player-visible change and no frame budget to measure. |

### Executed, not merely built (the clean-tsc-is-not-evidence rule)
The tool was run on the merged tree and its exit semantics probed directly, rather than inherited
from the run log:

| invocation | outcome | rc |
|---|---|---|
| `e2e/world-info-notes.spec.ts` | KNOWN-RED — 3 titles × 2 projects, with `:335` / `:111` / `:301`, blast radii 89.5% / 13.9% / 51.7% | **0** |
| `e2e/world-info-notes.spec.ts --strict` | KNOWN-RED | **1** |
| `e2e/drill-yard.spec.ts` | NOT-IN-INVENTORY | **1** |
| `e2e/does-not-exist-xyz.spec.ts` | NOT-IN-INVENTORY | **1** |

Inventory parse re-derived at drain: **438 rows (303 failure, 135 blast-radius), 2388 tests run,
303 failed** — identical to the run log's claim, so the claim is confirmed rather than trusted.

## Findings
🟢 **F-1447-2 (non-blocking, style).** `red-inventory-lookup.mjs:171` reads
`outcome === 'NOT-IN-INVENTORY' || args.includes('--strict') && outcome === 'KNOWN-RED' ? 1 : 0`.
JS precedence makes this the intended `A || (B && C)`, and the measured rc table above confirms
all four branches behave correctly — but the parens are elided on an expression whose whole job is
to encode a fail-safe. Worth one pair of brackets the next time the file is opened. **No behaviour
change requested; do not re-open the file solely for this.**

ⓘ **Noted, not a finding:** the tool reads `logs/suite-red-inventory.md`, whose rows carry recorded
coordinates the file itself flags as "may have rotted". That caveat is printed on every row, which
is the right call — and it is also why **F-1445-3 remains open**: `gt-02-slope.spec.ts:169` is
recorded MOBILE-ONLY and was measured reddening on DESKTOP at s1445. This tool will faithfully
report that stale qualifier until someone widens the row. It reports the inventory; it does not
audit it.

## Where does the player see this?
**Nowhere, and that is correct.** This is factory tooling with no runtime surface. The Mistake #10
question is answered by the gate battery it joins, not by a boot probe.
