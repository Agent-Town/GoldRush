# vp-02b-jumper-slot-repair — drain review (s1146)

- **Slice:** `lane-vp-02b-jumper-slot-repair` (FIRE-AUTHORED s1144 from F-1144-1/2)
- **Branch / tip:** `lane/m4` @ `efe3b209` — `runner(lane-b): lane-vp-02b-jumper-slot-repair.md`
- **Base:** `d86e8db7` (merge-base with main)
- **Run:** `20260728-000441`, 316,758 tokens, report `READY-FOR-GATES`
- **§3.0 drain-block-check:** ✅ CLEAR, run **before** classification and before I formed an opinion.

## Verdict: **ACCEPT**

Nothing that passed before fails now; the two specs the repair existed to green **are green on both projects**; the remaining reds are the pre-declared Class A plus one newly-exposed red that is a **finding, not a regression** — and which the runner reported honestly rather than greening.

## What it does

Completes the e2e half of a rename that landed in `src/` on 2026-07-12 (`82543f27`) and was never propagated: the enemy `SpriteAnimator`s were rewired from `assetSlots.charClaimJumper` to `charBanditBase`/`charBanditThief`, but **zero** of the seven e2e specs naming the old diagnostics key were updated. Because `spriteAnimationDiagnostics()` is keyed per constructed animator, `char.claim_jumper` could never appear again — so seven specs sat waiting on a key that cannot exist, and successive drains fingerprinted them **one at a time** as separate "pre-existing known reds" for 15 days.

This slice replaces `char.claim_jumper` → `char.bandit_base` at all seven sites. **Zero `src/`.** 7 files, 20 insertions / 20 deletions.

## Merge classification

| File | Class |
|---|---|
| `e2e/066-walk8-engine.spec.ts` | LANE-TOUCHED |
| `e2e/lane-c-activations-assay-office.spec.ts` | LANE-TOUCHED |
| `e2e/task-031-anim-roundness.spec.ts` | LANE-TOUCHED |
| `e2e/task-042-anim-smoothness.spec.ts` | LANE-TOUCHED |
| `e2e/visual-polish-assets.spec.ts` | LANE-TOUCHED |
| `e2e/vp-02-sprite-animation.spec.ts` | LANE-TOUCHED |
| `e2e/vp-02b-rotation-resolver.spec.ts` | LANE-TOUCHED |

`git log <base>..main -- <each file>` is **empty for all seven** — main never moved any of them, so **no graft was needed** and the merge is a clean path-scoped take. Everything else in the two-dot diff (`STATUS.md`, `logs/*`, `scripts/tmp-s1144-*`, `tasks/BACKLOG.md`, this fire's own `2d94e141`) is **MAIN-MOVED-ONLY** — the lane's base simply predates it. Post-merge `git diff lane/m4 -- e2e/` is **empty** (byte-identical to the lane).

## Evidence — re-measured by me on the merged tree, not inherited

Scratch port **5261** (5188 left free for the lane runners), `--workers=1`, both projects, no codex live.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 4.26s |
| `npm run build` | **rc=0**, 16.47s |
| 6-spec battery, desktop-chrome | **6 failed / 12 passed** (6.2m) |
| 6-spec battery, mobile-chrome | **6 failed / 12 passed** (5.4m) |
| `vp-02-sprite-animation`, desktop | 10 passed / 1 failed (2.4m) — see F-1146-6 |
| `vp-02-sprite-animation`, mobile | 9 passed / 2 failed (2.5m) — see F-1146-6 |
| `git grep "char.claim_jumper" -- e2e/` | **no matches** |

`vp-02-sprite-animation` was gated separately (it is the long one). Its `:739` line — the **only** line this slice changes in that file — is in the screenshot test, which **passed on both projects**.

**The two target specs went green, both projects:** `visual-polish-assets` **2/2** and `vp-02b-rotation-resolver` **7/7** — these are the specs the repair was for.

### The six reds, by first-failure line — identical on desktop and mobile

| Spec | First fail | Signature | Class |
|---|---|---|---|
| `066-walk8-engine:194` | `:81` | `waitForFunction` 30s timeout | **A — pre-declared** |
| `066-walk8-engine:208` | `:81` | `waitForFunction` 30s timeout | **A — pre-declared** |
| `task-031-anim-roundness:175` | `:202` | Expected **4**, Received **8** | **A — pre-declared** |
| `task-031-anim-roundness:230` | `:242` | Expected **4**, Received **8** | **A — pre-declared** |
| `task-042-anim-smoothness:54` | `:59` | `waitForFunction` 30s timeout | **A — pre-declared** |
| `lane-c-activations-assay-office:80` | `:99` | `toContain` — see F-1146-4 | **NEW, reported** |

Class A is the hero `walk4`-vs-`walk8` question, which s1144 measured at **exactly these lines** (`066:81`, `task-031:202`, `task-042:59`) and deliberately routed to the **owner's desk** as a design fork. s1145's bar pre-declared these would still be red. They are, at the same lines, with the same signatures. **Not a failure of this merge.**

## Findings

- **F-1146-4 (non-blocking, NEW, the valuable output of this drain) — the 2026-07-12 rename is stale one layer deeper than the slot key: the FRAME MATRIX.** `lane-c-activations-assay-office:99` now fails with `Expected value: "char-bandit-base-sheet-walk8-r0c7.png"` against `Received array: ["char-jumper-sheet-rotation-r0c0.png", "char-jumper-sheet-rotation-r0c1.png"]`. The spec's hard-coded expected frame-filename list is still the **old jumper art**, while the runtime now correctly emits the **bandit-base walk8 sheet**. ⚖️ **This is an IMPROVEMENT in the same red, not a new breakage:** the spec was 2/3 before and is 2/3 now — the failure merely **moved from a dead wait at `:91` on an undefined snapshot (which said nothing) to a precise, actionable assertion at `:99`.** Exactly the *"repair a stale test and expect a real bug behind it — a red at row 1 says nothing about rows 2..N"* shape. **Not fixed here, correctly:** rewriting a frame-expectation matrix from observed runtime is the **vp-02d failure mode** (promoting a live bug into a spec); the replacement list must be derived from `assets/layer-contracts/characters.v2.json`, which is a separable slice.
- **F-1146-6 (non-blocking, FINGERPRINTED not assumed) — `vp-02-sprite-animation:405` is the known load-sensitive flake, and it nearly read as a regression.** It failed on **both** projects in the full battery with `Expected 30 / Received 31` (desktop, `:461`) and `Expected 57 / Received 58` (mobile, `:467`) — the **off-by-one** signature of F-1136-1, which F-1138-6 proved is contention-driven and which *"nearly bought a wrong rejection of a correct fix"* once already. ✓ **Discriminated rather than waved through:** re-run **isolated on a quiet box**, `-g "warmed test clip swaps" --repeat-each=3` → **3/3 PASS desktop, 3/3 PASS mobile**. Contended RED/RED, quiet GREEN/GREEN — the F-1138-6 fingerprint reproduced exactly. ⚖️ **It also cannot be caused by this slice:** the only line changed in that file is `:739`, in a *later* test, and `--workers=1` runs it after `:405`. Mobile's second red, `:566`, is the **known west-capture flake** (F-1141-2, open and owner-routed; measured desktop 5/10, mobile 2/10).
- **F-1146-7 (hygiene, REPORTED not acted on) — four orphaned vite dev-servers have been running for DAYS**, left by prior sessions: pid `8787` port **5207** (3d 3h), `42553` port **5252** (1d 5h), `61156` port **5247** (1d 18h), `95039` port **5231** in `Projects/gr-task-rehearsal` (5d 18h). All at **0.0% CPU**, so they are not a live contention source, but they hold four scratch ports and survive across fires. **Deliberately NOT killed by me:** the `gr-task-*` fleet is attended-owned, and killing by a pid is exactly the class of act the never-kill-by-remembered-pid law exists to prevent. **Owner/attended call.** My own servers (5261/5262) were verified **FREE** after each run — this fire leaked nothing.
- **F-1146-5 (report-only, banked by the runner, `src/**` barred in this task):** `src/assets/generated.ts:206` still names `charClaimJumper` **boot-critical**, and the pool batch names at `src/entities/pools.ts:343`/`:349` still read `GeneratedClaimJumperThief…`. **That vestige is precisely what hid the rename for 15 days.**
- **Class A remains OWNER-GATED (F-1144-2), unchanged by this drain.** `066-walk8-engine:200-205` asserts `.not.toContain('walk8')` **on purpose**; whether the hero being walk8 is the shipped intent or a regression is a design fork and not a fire's call. Curing it will **unmask further Class-B failures** in those three specs.

## Bar compliance (s1144 set it, s1145 restated it verbatim)

| Requirement | Met |
|---|---|
| Before/after table for all seven specs **with first-failure lines** | ✅ runner supplied; **I re-measured independently** |
| base-vs-thief justified **per call site** | ✅ verified by me: `git grep spawnThief` over the seven specs returns **NONE** — every site uses `spawnPack`/`spawnEnemyAt`/`scriptEnemyAt`, which create ordinary enemies, so `char.bandit_base` (not `_thief`) is correct everywhere |
| Scope 3 resolved (substituted **with proof**, or stopped with numbers) | ✅ the `visual-polish-assets` boot canary was **measured first**, then its stale spawn counter repaired → **2/2**. Not weakened |
| Scope 6 mutation control shown RED then restored byte-exact | ✅ `char.bandit_base_NOPE` failed at `vp-02b:284`; restored, SHA-256 `86134d13da3c…` |
| Zero `src/` | ✅ |
| A NEW true red behind a repaired wait **outranks** the green | ✅ F-1146-4 recorded as the headline finding |
