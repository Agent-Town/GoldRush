# f-door-6-reach-vs-zone — reach and zone get their honest words at the agent door

**Slice:** `tasks/lane-fdoor6-reach-vs-zone.md` (F-DOOR-6 (a)+(b))
**Branch:** `lane/b` · **Tip:** `96d51f60a` · **Merge:** `906ca396e3bf340c83668d2fc5c1bf5411f5feda`
**Gated by:** s1611 fire, detached worktree `gate-s1611` (§3.0b), `--workers=1` (§3.1)

## VERDICT: MERGED

---

## What it does

The agent door told operators the wrong thing about why their builds failed, and the
lie was in one word. `BuildSystem.rejectionDetail()` mapped `invalid_range` →
`out_of_zone` — but I read the computation site before believing the finding, and
`confirmDiagnostics` (`src/systems/BuildSystem.ts:956–961`) derives `invalid_range`
purely from `distanceSq` between `heroPosition` and `ghostPos` against `placeRadius`.
That is a **reach** test wearing the word *zone*, which is exactly why an operator's
five `FAILED (out_of_zone)` placements turned legal after simply walking closer.

The slice gives each cause its honest word:

| reason | was | now |
|---|---|---|
| `invalid_range` (hero↔ghost distance) | `out_of_zone` | **`out_of_reach`** |
| `invalid_placement` (terrain sampling) | `invalid_position` | **`out_of_zone`** |

`invalid_position` is retired. The (b) half writes down two door facts that were true
but unstated: a `BUILD` is placed from where the Prospector stands and **does not
auto-walk** (so `MOVE_TO` must precede a distant `BUILD`), and exceeding the 32-order
cap **refuses the entire array** and installs none of it — so a rig sending 33 orders
appears to stall while its previous orders remain in force.

Vocabulary after this slice: `insufficient_gold`, `out_of_reach`, `out_of_zone`,
`collision`, `cap_reached`.

## Merge classification

Base `f2f11ec5e`. `lane-usable lane-b` → `ahead=1 behind=8 paths=4 tracked-dirt=0 untracked=0`,
all four paths **HELD LANE-ONLY** — main had moved none of them. Merge by `ort`, **zero conflicts**,
+51/−7 across exactly the four TOUCH-ONLY files. `main..lane/b` empty after merge.

| File | Class |
|---|---|
| `src/systems/buildRejectionDetail.ts` | LANE-ONLY |
| `src/systems/BuildSystem.ts` | LANE-ONLY |
| `public/skill.md` | LANE-ONLY |
| `e2e/m4-01-tool-surface.spec.ts` | LANE-ONLY (purely additive: 1 import, 1 optional type field, 1 new test) |

The runner stayed inside its firewall; `(c)` (publishing build zones) was barred by the
master and is untouched.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.03s** |
| `e2e/m4-01-tool-surface.spec.ts` desktop-chrome | **6/6** (15.5s, 15.3s across two warm runs) |
| `e2e/m4-01-tool-surface.spec.ts` mobile-chrome (390px) | **6/6** (14.8s) |
| Adjacent × 6, desktop-chrome | **19/20** — one pre-existing red |
| Adjacent × 6, mobile-chrome (390px) | **19/20** — same pre-existing red |
| `npm run test:node-guards` (run ALONE, F-1460-1) | **rc=0**, 285s |
| Retired label `invalid_position` across `src e2e public scripts docs specs lore` | **0 hits** |
| Console/page errors | `[]` asserted in every m4-01 test, both projects |

**Adjacent list re-derived from the cure, not inherited from the master.** The master named
`m4-10 / m4-05 / ap-standing-orders / m4-09`. Grepping the actual consumers of the detail
vocabulary (`src/agent/ToolSurface.ts`) and of the changed door doc added
**`skillmd-door.spec.ts`** and **`front-door-parity.spec.ts`**, which the master's list
omitted because it was scoped to the defect rather than to the fix. Both are green.

No screenshots or perf table: this slice renders nothing. It changes two string
literals, a type union, and prose in `public/skill.md`.

## Findings

### F-1611-1 — `ap-standing-orders:342` is red on main, and the assertion is the stale party (NON-BLOCKING, pre-existing)

`e2e/ap-standing-orders.spec.ts:408` asserts `toContain('FAILED: BUILD action was rejected')`
while the door emits `FAILED (insufficient_gold): BUILD action was rejected.`

**Control-confirmed pre-existing, byte-identical on both arms.** Same harness, same hour,
two trees on two scratch ports (merged `gate-s1611` @ 5251, control `gate-s1611-ctl` @ main
@ 5252, each proven to serve its own tree by fetching `/skill.md` before trusting a result):

```
MERGED  : Expected substring: "FAILED: BUILD action was rejected"
          Received string:    "FAILED (insufficient_gold): BUILD action was rejected."
CONTROL : Expected substring: "FAILED: BUILD action was rejected"
          Received string:    "FAILED (insufficient_gold): BUILD action was rejected."
```

The received label is **`insufficient_gold`** — a detail this slice never touches. The
detail-in-reason format predates the slice; the test was never updated when it landed.
Reproduces on desktop **and** mobile (the "two instances" the runner reported honestly).

`red-inventory-lookup` returns **NOT-IN-INVENTORY** with a **12-day-stale snapshot**
(threshold 7; 331 commits have touched `e2e/` or `src/` since), so absence there is not
evidence either way — this red is simply untracked.

**Cure is one line** (widen the assertion to the detail-bearing form, or assert the
prefix). Filed rather than fixed: it is outside this slice's firewall and belongs to
whoever owns the detail-in-reason format. **GATE: a corrective lands at
`e2e/ap-standing-orders.spec.ts:408`, or the row is closed with a stated reason. No owner
word owed.**

### F-1611-2 — a cold external dev server manufactures wandering reds that look like a load ceiling (NON-BLOCKING, harness)

The first two runs of the target spec against a freshly-started external dev server failed
**3 of 6** and then **1 of 6**, with the failing members *moving* between runs
(`:101`/`:216`/`:240` → `:129`) and each failure landing in `installAgentTools`'s
`page.evaluate`. Every one of them **passed alone in 2.9s**, and runs 3 and 4 were
**6/6 in 15.5s and 15.3s** — *faster* than the control's first run (18.2s).

The cause is the harness, not the slice: under `GR_CAPTURE_EXTERNAL_SERVER=1` the first
playwright run pays vite's cold transform of the whole `Game` module graph, and the
per-test timeout is what gives.

This is a **different axis from F-1270-1**: that law fixes `--workers=1`, which was already
honoured on every run here. **GATE: none owed — this is a note for the next fire that gates
with an external server, so it does not read its own cold start as a slice defect. Warm the
server (one page fetch is not enough) or discard run 1 before drawing a verdict.**
