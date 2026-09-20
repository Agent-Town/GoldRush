# Task f2124-1: the public view can LOCATE an active seam — carry live seam positions in `now.seams` (lane-d, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s2124, from the engine debt **F-E3CF-5** filed for fires at `tasks/BACKLOG.md:10` and stated at `tasks/BACKLOG.md:70`. Every file:line below was re-verified at source by the author on main at `7caa4183c (archive: pruned by the A3 rewrite)`, not inherited from the finding's own prose — and one half of the finding's wording is CORRECTED by that reading (see Why §3).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `src/agent/View.ts` (**the surface you are changing**); `src/entities/GoldNode.ts` (the snapshot that ALREADY carries what you need — read it before writing anything); `src/systems/HarvestSystem.ts` (how anchors are assigned); `e2e/agent-view.spec.ts` (**your spec**); `public/skill.md` (the door doc you must make truthful).

**REFRESH THIS LANE FIRST — IT IS OVER 200 COMMITS BEHIND** (210 at dispatch; the exact figure drifts with every merge, so do not gate on it). This is step ONE, before the pre-flight below and before `npm install`. The author verified at dispatch that `lane/d` is `ahead=0`, tracked-dirt 0, untracked 0 (`node scripts/lane-usable.mjs lane-d` → **USABLE**) — **there is nothing on this branch to lose**, so the reset is unconditionally safe here:

```
git checkout -B lane/d main && git clean -fd
```

**THEN TWO CHECKS — BOTH HARD STOPS. THEY ASK DIFFERENT QUESTIONS; RUN BOTH.**

**(a) THE PREMISE CHECK.** Run:

`grep -Fc "seams: records(record(diagnostics.harvest).activeNodes).map((node) => ({" src/agent/View.ts`

Expect **exactly 1**. The author proved this count against `main` before writing it here (F-1425-2: a key that spans a line break matches nowhere, so this one was chosen to sit on a single line and was verified at 1 on main). If it is 0, the mapping site this task rewrites is not where the master says it is — **STOP and report "View.ts mapping site not found"**; do not attempt the task from this file alone.

**(b) THE CURRENCY CHECK — AND IT IS A SEPARATE QUESTION FROM (a).** Run:

`ls e2e/e5-stillwater-noise.spec.ts`

Expect it to **exist**. If it does not, the reset in step ONE did not take and you are on the stale lane — **STOP and report "lane-d not refreshed"**. ⓘ **Why two greps and not one:** the author measured that key (a) returns `1` in the *unrefreshed* lane as well, because that line has been on main far longer than this lane is behind — so **(a) is structurally incapable of detecting a stale lane**, and a master that used it for that purpose would be claiming a control it does not have. `e2e/e5-stillwater-noise.spec.ts` is one of the 64 run-surface files main has and this lane lacks at dispatch, so it genuinely discriminates.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-E3CF-5, banked from the fairground prover; `tasks/BACKLOG.md:70`)

The finding, verbatim: *"the public view cannot locate an ACTIVE seam (anchors≠live nodes; positions absent). Successor: expose live seam positions in now.seams + audit rows."*

**1. THE POSITIONS ARE GENUINELY ABSENT — VERIFIED.** `src/agent/View.ts:83` types the live boundary's seams as `readonly { id: string; active: boolean; remaining: number }[]` — no position of any kind. The mapping at `:314` builds exactly those three fields from `diagnostics.harvest.activeNodes`.

**2. THE DATA IS ALREADY THERE, ONE FIELD AWAY — THIS IS WHY THE SLICE IS SMALL.** `GoldNodeSnapshot` (`src/entities/GoldNode.ts:8-17`) already carries **`position: { x: number; z: number }`** AND **`anchorIndex: number`**, and `HarvestSystem.buildSnapshot` (`:437-440`) already puts every one of them into `activeNodes` via `node.snapshot(at)`. **Nothing needs to be threaded through either engine.** The View simply drops the fields on the floor. If you find yourself editing `GoldNode.ts` or `HarvestSystem.ts` to obtain a position, **STOP and report** — that means the premise moved under this master.

**3. THE FINDING'S "anchors≠live nodes" IS TRUE, AND THE REAL MECHANISM IS SHARPER THAN THE WORDING — THE OBVIOUS WORKAROUND IS NOT MERELY MISSING, IT IS ACTIVELY WRONG.** The ids on both sides are the *same strings*, which invites a join:
- static/authored: `View.ts:236-239` builds `map.seams` from the authored anchors with `` id: `gold-seam-${index + 1}` `` plus `x`/`z`.
- live: `HarvestSystem.ts:86` constructs nodes with the identical scheme — `` new GoldNode(`gold-seam-${index + 1}`, index, ...) ``.

**But a node's id is fixed at CONSTRUCTION while its anchor is assigned by a SHUFFLE.** `activateInitialNodes` (`:335-341`) takes `shuffledAnchorIndexes()` — a Fisher-Yates shuffle over the anchor list at `:428-435` — and calls `placeNode(this.nodes[index], anchorIndexes[index])`, and `place()` (`GoldNode.ts:169-171`) sets `this.anchorIndex = anchorIndex`. So `gold-seam-1` sits at a **random** anchor, not anchor 1. An agent that joins `now.seams[id]` to `map.seams[id]` — the only locating move the view currently affords — gets a **confidently wrong position** with probability `(n-1)/n`. That is worse than absent data, and it is the part of this finding worth fixing carefully.

**4. THE DOOR DOC CURRENTLY INVITES EXACTLY THAT WRONG JOIN.** `public/skill.md:44` tells the agent the stable prefix *"locates the claim, seams, water, and spawn gates"*, and `:46` says `now` carries *"active seams"*. Read together they promise a locating join that the shuffle makes unreliable.

**5. THE COST IS MEASURED, NOT HYPOTHETICAL — THE FACTORY'S OWN REFERENCE RIDERS FLY BLIND.** `scripts/gr-sim.test.mjs:288-289` and `:361-362` and `:398-399` each select a seam with `view.now.seams.filter(({ active, remaining }) => ...)` and then issue `{ verb: 'HARVEST', seam: seam.id }` — they **cannot** prefer the nearest seam, because the view gives them no way to know where any of them is, and every one of those riders falls back to a hardcoded `{ verb: 'HOLD', pos: { x: 0, z: 12 } }`.

**6. THE INACTIVE-SEAM TRAP, AND IT IS THE ONE THING THAT MAKES THIS SLICE NON-TRIVIAL.** A despawned node's transform is reset to the world origin: `GoldNode.ts:218` sets `this.anchorIndex = -1` and `:221` sets `this.group.position.set(0, 0.05, 0)`, and `snapshot()` (`:249-252`) reports `anchorIndex` and `position` straight off that. **So an inactive seam reports position `(0, 0)` — a real, plausible-looking coordinate near the claim.** Publishing that raw would replace "no location" with "a false location", which is the same failure this task exists to fix. Inactive seams must publish `null`, never the origin.

## Scope

1. **Extend the live seam type** at `src/agent/View.ts:83` so each `now.seams` element carries, in addition to today's `id`/`active`/`remaining`: `x: number | null`, `z: number | null`, and `anchorIndex: number | null`.
2. **Populate them at the mapping site** (`View.ts:314-318`) from the snapshot fields named in Why §2, using the file's existing `record()` / `number()` / `round()` helpers in the same style as the surrounding code (`node.position` is a nested record — read it with `record(...)`, do not index it raw).
3. **Inactive seams publish `null` for all three new fields** — `x`, `z` and `anchorIndex` — per the Why §6 trap. Key this on the seam's own `active` flag, and treat `anchorIndex === -1` as inactive too; state in your report which predicate you used and why. **Do NOT publish `(0, 0)` for a despawned seam under any circumstance.**
4. **Round positions the way the rest of the view does** — `map.seams` at `:238-239` uses `round(number(...))`. Match it, so the two surfaces are comparable at the same precision and a reader can diff them directly.
5. **Update the byte-stable fixture** `WAVE_THREE_SNAPSHOT` in `e2e/agent-view.spec.ts` (its `now.seams` block begins at `:289`; it is asserted byte-for-byte at `:590`, test **"the seeded rider view stays cache-shaped and grows one honest wave at a time"**). This fixture WILL red until you update it — that is expected and is not a finding.
6. **Add an assertion to that same spec** proving the fix in both directions: every seam with `active: true` carries finite numeric `x`/`z` and an `anchorIndex >= 0`; every seam with `active: false` carries `x === null && z === null && anchorIndex === null`. Put it in the existing spec — **do not add a new spec file** (see Firewall).
7. **Make the door doc truthful** — `public/skill.md`. `:46`'s `now` sentence must state that active seams carry their live position; `:44`'s *"locates the ... seams"* must be qualified so it no longer promises that `map.seams` locates a LIVE seam. Keep the house voice and keep it short — two sentences at most, no new section.
8. **RESOLVE-AND-REPORT (free, deterministic — do not change anything for this).** The fixture is seeded and byte-stable, so it is a direct measurement of Why §3: with your change in place, report for `WAVE_THREE_SNAPSHOT` **how many active seams have a live position that differs from the `map.seams` entry sharing their id**, and give one worked example (`id`, authored `x/z` from the `map.seams` block at `:160`, live `x/z`). This is the first direct observation of the divergence rate; it belongs in your report and in the review file, and it is evidence for or against F-E3CF-5's central claim. **If the answer is ZERO, say so plainly and do NOT adjust anything to manufacture a difference** — a refutation is a result, and it would mean the shuffle is seeded to identity for this seed.
9. **RESOLVE-AND-REPORT ONLY — DO NOT BUILD.** F-E3CF-5 also says *"+ audit rows"*. The author searched and could **not** find an existing seam row to extend: `grep -n seam scripts/same-game-audit.mjs` returns nothing. Report, in one paragraph, where such a row belongs and what it should assert — **do not invent an audit surface in this task.**

## Firewall

**TOUCH ONLY:** `src/agent/View.ts` (**the live `now.seams` type at `:83` and its mapping at `:314-318` ONLY** — not `map.seams`, not any other section of the view) · `e2e/agent-view.spec.ts` (**the `WAVE_THREE_SNAPSHOT` fixture's `now.seams` block and ONE new assertion** — no other test's expectations) · `public/skill.md` (**the two sentences named in scope 7 ONLY**).

**NO — do not touch, for any reason:**
- `src/entities/GoldNode.ts` and `src/systems/HarvestSystem.ts` — **the position and anchorIndex you need ALREADY EXIST there** (Why §2, verified at source). Needing to edit them means the premise moved: **STOP and report** rather than changing them.
- **The shuffle itself** (`HarvestSystem.ts:428-435`) — this task makes the world *legible*, it does not make it *different*. Changing anchor assignment would move every seeded sim baseline on the board.
- `src/sim/HeadlessContractSim.ts` — **`lane/b` holds undrained content in this file right now** (the F-2090-1 picnic salvage); editing it here would collide with a live salvage the owner has not yet ruled on.
- `src/meta/ContractFamilies.ts` · `assets/contracts/**` · `scripts/e3-mask-tables.test.mjs` · `e2e/er01-e10-census.spec.ts` — **all four are the live firewall of `e10s-1b`, executing on lane-a as you read this.** Touching any of them is a guaranteed merge collision.
- `src/config/Balance.ts` — no balance edits, no minting (F-1741).
- **Any NEW file under `e2e/`.** `playwright.config.ts` sets `testDir: './e2e'` with `testMatch` unset, so a new `*.spec.ts` is auto-collected into the standing suites the moment it lands and permanently taxes every run (F-1577-1). Extend the existing spec instead.
- `specs/**` · `STATUS.md` · `tasks/**` other than your own done-move.

## Self-check before READY-FOR-GATES

- `npx tsc --noEmit` clean · `npm run build` green.
- **`e2e/agent-view.spec.ts` green, desktop AND 390px mobile, at `--workers=1`** (F-1270-1: a fire-side gate at default workers is a known-unreliable instrument; the lane shell is faster in parallel but pass the flag anyway so the intent is legible).
- **Adjacent suites, named — unmodified-green, both projects, `--workers=1`:** `e2e/skillmd-door.spec.ts` (**"served skill.md exposes the source-locked grammar and replace warning"** — you are editing `public/skill.md`, so this one is directly at risk) · `e2e/front-door-parity.spec.ts` · `e2e/agent-seat.spec.ts`.
- **`npm run test:node-guards`** — required. `scripts/gr-sim.test.mjs` **consumes `view.now.seams`** at `:288`, `:361` and `:398` (Why §5), so it is genuinely adjacent even though your diff stays inside `src/agent/`. ⓘ The battery is **~7 minutes serial (404.7 s measured s2099)** and must be **run ALONE** — overlapping it with a browser battery contaminates both. Your change is purely additive to that surface (those riders destructure `{ active, remaining }` and read `seam.id`), so a red here is a real finding: **fingerprint it against a clean-main control before attributing it to yourself.**
- Zero console/page errors in a plain boot (no `?debug`), desktop and 390px.
- Screenshots to `reviews/shots-f2124-1/` (desktop + mobile boot).

**NO-OP GUARD:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report: the inactive-seam predicate you chose and why (scope 3) · **the divergence count and worked example (scope 8)** · your one-paragraph audit-row verdict (scope 9) · whether `test:node-guards` was clean and how you fingerprinted any red · anything you were forbidden to fix but noticed.
