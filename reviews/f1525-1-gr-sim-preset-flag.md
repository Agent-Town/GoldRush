# f1525-1 — gr-sim accepts `--preset` / `--difficulty` (F-ER02-3)

**Slice:** `lane-a-f1525-1-gr-sim-preset-flag.md` (FIRE-AUTHORED s1525)
**Branch:** `lane/a` · **tip:** `95cb16499` · **base:** `aaaf8d0f6`
**Merged to main:** `c65e6b6d0aa6cc1809dd5d6f952b6568a6520f36` (s1527 drain, 2026-08-07)

## VERDICT: MERGED — all four required relationships re-derived by the drain, not inherited.

## What it does

`scripts/gr-sim.mjs` parsed argv against a hard allowlist and threw `Unknown argument` for
`--preset` and `--difficulty`, so the ER-02 Steamworks rehearsal could not ask the **shipped**
CLI for either ratified difficulty tier — it had to reach `vein-hunter` in-process through the
game's own read+apply path and license that detour with a separate byte-for-byte control.
*A measurement instrument that cannot be pointed at the thing being measured was the finding.*

The slice adds both keys to the **solo** allowlist, validates the raw string against the set
`normalizeDifficultyPreset` actually recognises **before** normalising (so a typo is a loud
non-zero exit rather than a silent fall back to TRAIL), loads `Balance` through the *same*
`vite.ssrLoadModule` graph the sim is loaded from, applies the preset **before** the sim is
constructed, and prints a one-line stderr provenance note. Seated rides (`--room`) reject the
flags outright — the host room owns difficulty.

**27 insertions, 2 deletions, one file.** No balance VALUE was re-tuned; this changes who may
*select* a tier, never what a tier *is*.

## Evidence (all re-derived on the merged tree in detached worktree `gate-s1527`, §3.0b custody)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, 0 errors |
| `npm run build` | green, built in 1.26s |
| `npm run test:node-guards` | **rc=0 · 351 passed · 0 failed** on Node **v26.4.0** (`.nvmrc`) |
| pinned E2 Baron outcomes test | **✔ PASS, pin UNMOVED** — no re-pin, diff never leaves `scripts/` |
| boot probe | **deliberately not run — see "Boot probe" below** |

### The three-arm discrimination run (scope item 4) — re-derived, not read off the report

`--contract=e2-incline --seed=e2-incline-01 --policy=idle`

| Arm | Flag | Exit | `eventLogHash` |
|---|---|---:|---|
| A | *(none)* | 0 | `fnv1a32:7e6c3132` |
| B | `--preset=trail` | 0 | `fnv1a32:7e6c3132` |
| C | `--preset=vein-hunter` | 0 | `fnv1a32:9a55b079` |

- `hash(A) == hash(B)` → **true** (the default path did not regress)
- `hash(A) != hash(C)` → **true** (the flag reaches the sim; it does not merely parse)

Arm C **discriminated under `--policy=idle`**, so the master's rider fallback was not needed.
These three numbers match the runner's own table exactly; they were obtained independently by
this drain, from the merged tree, before the merge commit existed.

### Provenance from the sim's own module instance (scope item 3)

```
rc=0  gr-sim preset: trail       enemy.hp=25.2
rc=0  gr-sim preset: vein-hunter enemy.hp=28
rc=0  gr-sim preset: greenhorn   enemy.hp=25.2
```

`trail 25.2` / `vein-hunter 28` are exactly the values `reviews/standing-orders-rehearsal-e2.md`
§8 records as this door's entire live delta. The wiring bit.

### Error paths (scope items 1 and 2)

| Case | Exit | Message |
|---|---:|---|
| `--preset=vien-hunter` (typo) | 1 | `--preset must be one of: greenhorn, trail, vein-hunter, vein_hunter, hard.` |
| `--room=… --preset=trail` | 1 | `--preset and --difficulty cannot be used with --room; the host room owns difficulty.` |
| `--preset=trail --difficulty=vein-hunter` | 1 | `--preset and --difficulty must have the same value when both are given.` |
| `--preset=hard --difficulty=hard` | 0 | accepted (same value) |

The accepted set was verified against the source rather than against the master: `src/game/Balance.ts:1043-1047`
`normalizeDifficultyPreset` recognises `greenhorn` · `vein-hunter` · `vein_hunter` · `hard`, and
returns `trail` for everything else — so `DIFFICULTY_VALUES` in the CLI is a correct enumeration,
including `trail` itself as the canonical id.

## Merge classification

- **Base:** `aaaf8d0f6` (the s1525 authoring commit). `main..lane/a` = exactly one commit, `95cb16499`.
- **LANE-TOUCHED:** `scripts/gr-sim.mjs` — the only file the lane commit touches
  (`git log main..lane/a --name-only`).
- **MAIN-MOVED:** `STATUS.md`, `logs/**`, `tasks/BACKLOG.md`, `tasks/goals.json`,
  `tasks/lane-b-f1526-1-*.md` — these appear in the two-dot diff as deletions because main
  advanced, not because the lane removed anything.
- **Conflicts:** none. `git log aaaf8d0f6..main -- scripts/gr-sim.mjs` is **empty** — main never
  moved the file since the base, so this is a clean path-scoped application, not a graft.
- Merged with `git checkout lane/a -- scripts/gr-sim.mjs`; `git add` path-scoped to that one file.

## Boot probe — not run, and why (stated so it is not read as an omission)

Two independent reasons, either sufficient:

1. **The merged content cannot reach the browser.** The lane touches exactly one file, a Node
   CLI that is never bundled. Zero `src/`, zero `e2e/`, zero `vite.config` / `playwright.config` /
   `package.json`. The shipped bundle is unaffected, so a boot probe would measure main, not this slice.
2. **Mistake #12 (gate contamination).** `lane-b` is **LIVE** this hour on `f1526-1`, whose cure
   surface is `src/agent/View.ts` — a file every browser boot probe exercises. Gating a browser
   spec against a surface a live task is editing manufactures attribution noise.

The slice's *own* suite is `scripts/gr-sim.test.mjs`, which ran green inside `test:node-guards`.

## Findings

**F-1527-1 (non-blocking, informational) — the provenance line is blind to the `greenhorn` tier.**
Scope item 3's proof-of-wiring is a stderr line printing `Balance.enemy.hp`. Verified by reading
`src/game/Balance.ts:1075-1084`: `greenhorn` adjusts `steal.maxConcurrent`, `steal.maxConcurrentCap`
and `wreck.hp.palisade`, and **does not touch `enemy.hp`** — so `--preset=greenhorn` prints
`enemy.hp=25.2`, byte-identical to `trail`. That is correct behaviour, not a wiring failure, but it
means the provenance line **cannot distinguish a correctly-applied `greenhorn` from a silently-ignored
one** — precisely the silent failure mode the master was built to prevent, surviving for one of the
three tiers. Cheap cure if anyone extends this: print a field the tier actually moves, or print the
whole tuple. Not blocking: `greenhorn` was not in the acceptance criteria and both criterion tiers
prove out.

**F-1527-2 (non-blocking, informational) — two spellings of the same tier are rejected as a conflict.**
`--preset=vein-hunter --difficulty=hard` names **one** tier (both normalise to `vein-hunter`) but is
rejected by the string-equality check as disagreeing. Loud-and-conservative is the right default for
an instrument and matches the master's literal wording ("different values is an error"), so this is
recorded rather than corrected. If it ever annoys a rider, compare *normalised* values and keep the
error for genuinely different tiers.

**F-1527-3 (instrument note, closes a question the runner's report left open) — the runner's two
reported reds were a Node-version artifact, not the slice.** The runner reported
`test:node-guards` 352/354 with two failures it attributed to "the known F-1507-1 timeout-semantics
guards", noting it ran on **Node 23.11.1** because `.nvmrc`'s **26.4.0** was not installed in the lane.
This drain re-ran the same battery on **v26.4.0** and got **351 passed / 0 failed, rc=0**. The two
reds belong to the lane's interpreter, not to this change — worth knowing before anyone chases them
as a regression. It also means lane runs and fire gates are currently on **different Node majors**;
that is a standing instrument split, and this is a data point for it, not a finding against f1525-1.

## Follow-on

`F-ER02-1` and `F-ER02-2` (the other two fire-authorable ER-02 protocol repairs) both cure
`scripts/gr-sim.mjs`. s1526 correctly refused to author them while this task held that file as its
entire firewall. **That collision is now cleared by this merge** — they are authorable by the next
fire.
