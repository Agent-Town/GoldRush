CODEX: model=gpt-5.6-sol effort=xhigh

# lane-f1496-1-drill-yard-fixture-six — the E1 fixture still says five; the registry has said six since 2026-08-02

**FIRE-AUTHORED s1500 (attended review welcome).** Authored from a finding that has been named by
three consecutive fires as *"cheap, still fire-authorable, still unowned"* (F-1496-1, `tasks/BACKLOG.md:3`),
plus a measurement this fire took that **removes the one thing that was actually blocking it** (see
§WHY, "The block that was in the way, and why it is gone"). No spec slice is needed and none is
invented: this is test-fixture hygiene against a registry change that already shipped. No design
fork, no canon, no owner word.

ROLE: implementer on lane-a. WORKDIR: `worktrees/lane-a` (branch `lane/a`). Commit prefix `dyf:`.
Never touch STATUS.md, reviews/, tasks/queue/, tasks/goals.json, or other lanes.

---

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 exists because a master offered the refresh as a conditional and put a currency probe
beside it; the runner ran the probe first against a stale lane and truthfully reported a failure that
was only staleness. Refresh FIRST, probe SECOND, always.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-a fetch origin main
git -C worktrees/lane-a checkout -B lane/a origin/main
```
This is safe and authorized: `node scripts/lane-usable.mjs --all` read lane-a **USABLE**
(`ahead=0`, `tracked-dirt=0`) at authoring time. The lane was **6 commits behind** main at that
moment, which is exactly why this step is unconditional rather than optional.

**STEP 2 — CURRENCY PROBE (only after step 1). Must print `1`:**
```
grep -c "expect(ids).toEqual(\['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'\]);" e2e/agent-view.spec.ts
```
If it prints `0`, someone has already changed the line this task exists to change — **STOP** and
report the tip you found and what that line says now. (s1500 verified this exact one-line key returns
`1` on main at authoring time, per F-1425-2: a key that spans a wrapped line matches nowhere,
including in the file it was copied from. This one visibly sits on a single line.)

**STEP 3 — CLEANLINESS:** `git -C worktrees/lane-a status --short` → must be clean.
> **FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them and proceed (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence. ⓘ What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — i.e. anything a live drain or a concurrent task could actually own.

---

## READ FIRST (paths, in this order)

- `e2e/agent-view.spec.ts`, the test **`all five E1 mechanics manifests match their byte-stable fixture`**
  (opens at `:264`; the id assertion is `:269`). Read the whole test before editing one line of it —
  it asserts the id list, deep-equality against the fixture, a `JSON.stringify` byte compare, and a
  per-id re-derivation stability loop. **Your change must keep all four of those jobs intact.**
- `e2e/fixtures/e1-mechanics-manifests.json` — the fixture. Five entries today.
- `src/agent/MechanicsManifest.ts` — the derivation. **You are NOT editing this file.** Read
  `interactables()` and the `if (practice)` block (`:355-364`) so you can recognise a correct
  drill-yard manifest when you see one.
- `assets/contracts/epoch-1-frontier/contracts.json` — the registry data. Six contracts;
  `e1-drill-yard` is **second**, and it is the only one carrying a `practice` block.

## WHY (evidence, quoted and dated)

**F-1496-1** (`tasks/BACKLOG.md:3`, filed s1496 against the `milk/motor-socket` review's own evidence):

> *"`agent-view.spec.ts:264` + `:297` fail on **both** projects because `e1-drill-yard` became the
> **sixth** E1 contract in `19f212b71` while `:269` still expects five and
> `e2e/fixtures/e1-mechanics-manifests.json` still holds five entries — it is NOT in
> `logs/suite-red-inventory.md`. GATE: fire-authorable — regenerate the fixture to six entries and
> update the count, then confirm 8/8 both projects. Whoever takes it must gate BOTH projects, which
> is the whole lesson of F-1496-1."*

s1500 re-measured both halves rather than inheriting them:

- `assets/contracts/epoch-1-frontier/contracts.json` holds **6** contracts, in this order:
  `the-claim`, `e1-drill-yard`, `e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `e1-baron`.
- `e2e/fixtures/e1-mechanics-manifests.json` holds **5**, missing `e1-drill-yard`.
- `listContracts()` returns the 6 above, measured through the same `vite.ssrLoadModule` harness the
  census specs use.

So `expect(ids).toEqual([…five…])` cannot pass, and `expect(manifests).toEqual(fixtures)` compares a
6-element array against a 5-element one. The red is real, it is main-side, and it is not in the
suite-red inventory — which is why it has read as an unexplained red to every fire that ran this spec.

### The block that was in the way, and why it is gone — READ THIS, IT IS WHY THE TASK IS LAWFUL

`tasks/goals.json` leaf **`f1328-1-drill-yard-census-debt`** is `status:"blocked"`, and its scope
item 1 is *"regenerate the byte-stable fixture"* — **the same act this task performs.** Its stated
reason reserves a judgement for the owner:

> *"does a byte-stable fixture of F-1328-4's wrong derivation bless it or catch it?"*

That question had a premise: **F-1328-4**, *"`deriveMechanicsManifest("e1-drill-yard")` returns
`interactables:[]` and rules river/water_crossings despite the yard declaring a bell, dummies,
practice gold and buildables: the derivation ignores `practice`."*

**s1500 measured that premise on current main and it is FALSE.** Derived through the census harness:

- `interactables` = **4, not empty** — `assay_tent_faucet` (`top_up`), `drill_bell` (`ring`),
  `rolling_log` ×2 (`strike`), `straw_man` ×3 (`strike`) — every one sourced from
  `practice.stations` / `practice.targets`.
- `rules` = `drill_wave`, `ledger_free_practice`, `practice_buildables`, `practice_gold_grant`,
  `practice_target_respawn`, `river`, `water_crossings`.

The bell, the dummies, the practice gold and the buildables — the four things the block named as
missing — are **all present and all practice-sourced**. The derivation was cured by a dedicated slice,
`6e4e728ec` *"runner(lane-a): lane-a-drill-yard-practice-derivation.md"* (2026-08-02, on main), four
days after the block was written. **There is no longer a wrong derivation to bless**, so the owner's
question is vacuous and the fixture regeneration is ordinary hygiene. Probe retained at
`logs/session-scratch/s1500-drill-yard-derive.mjs` — re-run it if you doubt any of the above.

⚠️ **What this does NOT license:** it does not license editing the derivation, and it does not
license touching the separate census-count debt (`board-card-images.spec.ts:37`,
`map-census.spec.ts:63`, both asserting `toHaveLength(41)`), which was deliberately carved out to
`f1330-1-count-shaped-censuses`. See the FIREWALL.

## SCOPE — numbered, each item testable

1. **Regenerate `e2e/fixtures/e1-mechanics-manifests.json` to SIX entries, in `listContracts()`
   order** (`e1-drill-yard` second). **DERIVE it — never hand-write or hand-edit an entry.** Produce
   it by mapping `listContracts().map(({ id }) => id)` through `deriveMechanicsManifest` and
   serialising, so the file is by construction what the spec's byte compare expects. Match the
   existing file's JSON formatting exactly (same indentation, same trailing-newline convention) — a
   formatting-only diff on the five existing entries is acceptable **only** if their *semantic*
   content is unchanged; prove that (see self-check 4).
2. **Update the id assertion at `e2e/agent-view.spec.ts:269`** ("all five E1 mechanics manifests match their byte-stable fixture") (that test was RENAMED at commit 77a1b19b and is now titled "all six E1 mechanics manifests match their byte-stable fixture" — the count in the old title was the defect) to the six ids in registry order.
3. **Update the test title at `:264`** — it says *"all five E1 mechanics manifests"*. Make the number
   match reality. **A title that lies is how this stayed invisible**: fires reading a passing-sounding
   name never asked whether the count was still true.
4. **Do not weaken any assertion to make the red go away.** The deep-equal, the `JSON.stringify` byte
   compare and the per-id re-derivation loop all stay. If the fixture will not settle byte-identically
   across two derivations, **STOP and report it as a finding** — that would mean the derivation is
   non-deterministic, which is worth far more than this task.
5. **If the derived `e1-drill-yard` manifest looks WRONG to you** — a mechanic the contract declares
   that the manifest omits, or an operation the manifest invents — **do not fix it and do not adjust
   the fixture to hide it.** Record it in your report as a finding, with the field name. The whole
   point of a byte-stable fixture is that it records what the derivation *does*; correcting the
   derivation is a different slice with a different firewall.

## FIREWALL

**TOUCH-ONLY:** `e2e/fixtures/e1-mechanics-manifests.json`, `e2e/agent-view.spec.ts`.

**NO — do not edit any of these, for any reason, even if you believe it would help:**
- `src/agent/MechanicsManifest.ts` — the derivation is the SUBJECT of this fixture, not its variable.
  Editing it to make a fixture pretty is the tail wagging the dog, and it re-opens the exact owner
  question this task just proved vacuous.
- `assets/contracts/**` — `e1-drill-yard`'s membership in the registry is the shipped fact this task
  is catching up to. Removing it would "fix" the red by deleting the feature (Mistake #10 shape).
- `e2e/board-card-images.spec.ts`, `e2e/map-census.spec.ts` — the `toHaveLength(41)` census-count debt
  is **carved out to `f1330-1-count-shaped-censuses`** and is NOT yours, even though it has the same
  root cause and will be sitting right next to you. Touching it collides with another master.
- `logs/suite-red-inventory.md` — a fire curates that; do not add or retire rows.
- `STATUS.md`, `tasks/goals.json`, `tasks/queue/**`, `reviews/**`, other lanes.

## SELF-CHECK before you report

1. `npx tsc --noEmit` → clean.
2. `npm run build` → green.
3. **`npx playwright test e2e/agent-view.spec.ts --workers=1` → run BOTH projects and report
   `passed/failed` PER PROJECT.** This is the whole lesson of F-1496-1: its parent review gated one
   project, reported *"2 desktop reds"*, and the truth was **4 across both**. A green you took on one
   project is not evidence about the other. Expect **8/8 desktop-chrome and 8/8 mobile-chrome**; if
   your numbers differ, report them as they are rather than rounding toward the expectation.
4. **Prove the five pre-existing entries are semantically unchanged**: derive the manifests for the
   five original ids from the OLD fixture and from your new one and show they are deep-equal. A
   regeneration that silently rewrites the other five is a much bigger change than this task, and the
   byte compare alone will not tell you which entry moved.
5. Derive the fixture **twice** and confirm the file is byte-identical both times (this is the
   stability claim the spec's own loop makes; make it once yourself before trusting it).
6. `git -C worktrees/lane-a status --short` → clean apart from the F-1407-1 churn classes.

**READY-FOR-GATES** — report: the commit sha; the per-project pass/fail counts from self-check 3; the
six ids in the order you wrote them; the result of the five-entry equivalence check; whether the two
derivations were byte-identical; and anything you found and did **not** fix, named as a finding. If
you stopped at any STOP above, report exactly which one and what you found — a truthful stop is a
good outcome and costs the factory far less than a fixture that records the wrong thing.
