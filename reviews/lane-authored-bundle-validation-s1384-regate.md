# lane-authored-bundle-validation — s1384 RE-GATE

**Slice:** authored-bundle validation across 10 epochs / 42-contract fleet
**Branch:** `lane/perf` · **tip** `0f2544f2328ddab20a0d7deea7df6a57ff41827f` · **base** `b80ee2ba` · ahead=1
**Done-move:** `tasks/done/held-s1381-F1381-1-release-build-regression-BLOCKING-20260802-064330-lane-authored-bundle-validation.md`
**Prior gate:** `reviews/lane-authored-bundle-validation.md` (s1381, VERDICT HOLD)
**Gated in:** detached scratch worktree `worktrees/gate-s1384` · control in `worktrees/ctl-s1384` (§3.0b custody)

## VERDICT: ACCEPT — merged.

The hold was a **`blockClass: "gate-side"`** readiness hold, not an owner fork. Its stated condition had
**two conjuncts**, and both are now satisfied by measurement rather than by argument.

## §3.0 block check — run as the first command, before classification

```
⛔ BLOCKED — DO NOT DRAIN   (exit 1)
goal leaf  : e1-authored-bundle-validation
blockClass : gate-side — a FIRE-RECORDED readiness hold, NOT an owner debt
```
Per §3.0 as amended by F-1383-1, for `gate-side` the STOP is **on the MERGE**: gathering evidence in a
detached worktree is the prescribed cure, and the merge is lawful only in a commit that also flips the
leaf and records the satisfying evidence. That is what this drain did.

## The stated condition, conjunct by conjunct

> "this slice has never been gated against a working release door, **and** F-1381-2 (a release-suite
> '26/26' green the tree could not have produced) is unexplained."

**Conjunct 1 — gated against a working release door. SATISFIED.**
The door was repaired s1382 (`8d1c59c2`, `scripts/assert-release-build.mjs:54`). On the grafted tree
`GR_RELEASE=e1 npm run build:release` is **rc=0**, and the check is **non-vacuous**: it reports
`1874 files … checked against 262 later-asset stems`, the same denominator as the clean-main control.

**Conjunct 2 — F-1381-2. DISCHARGED BY MEASUREMENT, NOT ADJUDICATION.**
Rather than rule on whether the runner's claimed `release suite 26/26` was honest, I ran it:
**26 passed (1.9 m)** at `--workers=1` on the grafted tree. The tree *can* produce that green, and does.
The number the runner reported is exactly the number the suite yields. F-1381-2's premise — "a green the
tree could not have produced" — was an artefact of the broken door (F-1382-1), and dies with it.

⚠️ Worth recording: the durable `blockedReason` said F-1381-2 "is unexplained" while **the same fire's**
handoff said "F-1381-2 is therefore EXPLAINED". Two surfaces written by one session, disagreeing. I did
not adjudicate between them; I re-measured the subject instead. *When two documents contradict, the
cheapest third source is usually the measurement they are both describing.*

## Evidence table

| # | Check | Result |
|---|---|---|
| 1 | `drain-block-check.mjs` | ⛔ exit 1, `blockClass=gate-side` — the condition this drain satisfies |
| 2 | **CONTROL: clean main, `GR_RELEASE=e1 build:release`** | ✅ **rc=0**, 1874 files, 262 stems — a control that *can* fail, and didn't |
| 3 | `git merge --no-ff lane/perf` | 3 contracts.json auto-merged; **1 conflict: `src/meta/ContractFamilies.ts`** (2 hunks) |
| 4 | `npx tsc --noEmit` (grafted) | ✅ clean, 3.9 s |
| 5 | `npm run build` (grafted) | ✅ green, `✓ built in 1.01s` |
| 6 | **`GR_RELEASE=e1 npm run build:release` (grafted)** | ✅ **rc=0**, 1874 files, 99177691 B, 262 stems |
| 7 | slice spec `contract-bundle-validation.spec.ts` | ✅ **2/2** desktop+mobile, `--workers=1` |
| 8 | **release suite** `playwright.release.config.ts` | ✅ **26 passed (1.9 m)**, `--workers=1` |
| 9 | adjacent batch (4 specs, both projects) | **109 passed / 3 failed** — all three fingerprint-matched known-reds |
| 10 | **CONTROL: same specs on clean main** | **3 failed, same two test identities** ⇒ reds are pre-existing, not the merge's |
| 11 | boot probes (3 specs, both projects) | ✅ **16/16**, incl. `s106 boot probe: zero errors + prospector visible (plain boot)` |
| 12 | blob-hash custody check | **11/11 MATCH** — bytes gated == bytes merged |

### The 3 adjacent reds, and why they are not mine

Both are in the committed known-red inventory (`logs/suite-red-inventory.md`):

- `water-mask-engine.spec.ts:23` *"the Claim keeps its legacy water contract byte-for-byte…"* — inventory
  line 311/312, classified **BOTH**, failing at `:39` on deep equality. My grafted run and my clean-main
  control both fail it in both projects, at `:39`. ✓ fingerprint match.
- `ed-02-authored-grid-substrate.spec.ts:93` *"session document changes visual height across reload…"* —
  inventory line 122, classified **DESKTOP-ONLY**. ⚠️ Reported honestly: my graft run failed it on
  **mobile**, my control on **desktop** — one failure per run, project varying. That is a **flake across
  projects**, slightly broader than the inventory's DESKTOP-ONLY label. It is present on clean main
  either way, so it does not block this merge, but the inventory's classification is narrower than the
  behaviour. Not hand-edited (standing order); recorded here instead.

## Merge classification

Base `b80ee2ba`. Since s1381's gate, main moved on **exactly one** of the slice's 11 paths' history —
`8815e476` (lane-c dead-fields sweep) — verified by `git log b80ee2ba..main -- <the 11 paths>`. So
s1381's conflict analysis was still current and I re-derived rather than inherited its resolutions.

| File | Class | Resolution |
|---|---|---|
| 9 × `assets/contracts/epoch-*/contracts.json` | LANE-TOUCHED | 3 auto-merged, 6 clean |
| `e2e/contract-bundle-validation.spec.ts` | LANE-ONLY (add) | taken as-is |
| `src/meta/ContractFamilies.ts` | **BOTH-MOVED** | 3-way graft, 2 conflicts + 3 clean-merged allowlists narrowed |

**The one collision, in both conflicts and in three cleanly-merged lists:** lane-d forked before
`8815e476` retired four words from the contract vocabulary — `sluicesNeedWaterSource`, `slopeMax`,
`waterline`, `damChannel` — and typed and allowlisted all four.

- `:672` — main deleted `damChannel?:`; lane replaced it with 27 lines. **Took the 26 genuinely-new
  fields, dropped `damChannel`.**
- `:1015` — main removed `waterline` from the `contractNumberRange` signed-key regex; lane kept it and
  added a new deepwater-depth clause. **Took the new clause, dropped `waterline`.**
- Cleanly-merged (main never had these lists, so git raised no conflict — the dangerous kind):
  `AUTHORED_TILE_KEYS:'damChannel'`, `AUTHORED_TWIST_KEYS:'sluicesNeedWaterSource'`, and three
  `DECLARED_INERT_PATHS` entries. **All five dropped** — shipping a brand-new allowlist naming a
  vocabulary main deleted 40 minutes earlier would re-establish the second source `8815e476` removed.

**Re-measured, not inherited.** s1381 justified the drops with *"zero contract JSON in
`assets/contracts/` declares any of the four"*. My first re-run of that grep found **three files** —
apparently a contradiction. Reading them showed all matches are inside a **description string**
(`"Needs registered consumers for the declared slopeMax and waterline advisory fields"`), not key
declarations. Re-grepped as JSON keys (`"key":`) → **zero**, and `git grep` on main's
`src/meta/ContractFamilies.ts` for the four → **zero**. s1381's conclusion holds; its instrument was
loose. *The loose form of that grep also matches prose, and prose is not a declaration.*

## Findings

**F-1384-1 (process, non-blocking) — §3.0's gate-side clause cannot be executed literally, because a
schema guard forbids it.** The clause landed s1383 requires that the merge happen "in a commit that
**also** flips the leaf out of `blocked` and records the evidence". But `scripts/goal-tracker.test.mjs:80`
asserts `if (leaf.status === 'merged') assert.ok(leaf.mergeHash)` and `:79` requires
`/^[0-9a-f]{40}$/` — and the `mergeHash` convention is the **main-side merge commit** (verified:
`77f6c4b6…` is an ancestor of main). **A commit cannot contain its own hash**, so "merge + flip to
merged + record hash, in one commit" is jointly unsatisfiable. Every real drain therefore lands the code
first and the leaf immediately after (verified on `7435fa7c`, whose `goals.json` update is a later
commit). **This drain follows that same two-commit sequence, deliberately and in the same fire.** The
clause's *intent* — never leave a merged slice sitting behind a stale block — is fully met. Recommend the
next fire amend §3.0 to say "in the same fire, code commit immediately followed by the leaf commit",
which is what the mechanism permits. No owner word needed.

**F-1384-2 (content staleness, non-blocking) — the slice ships 5 `engineDependencies` descriptions that
name retired vocabulary as current.** e.g. `epoch-2-steamworks/contracts.json:125`: *"Needs registered
consumers for the declared slopeMax and waterline advisory fields."* Those fields were retired by
`8815e476`. These are **prose inside a description string**, not declarations — they pass validation, are
inert at runtime, and were verified not to re-establish the vocabulary (the key-scoped grep is zero). But
they document as "declared" a thing that no longer exists, and they are the reason a loose grep reads as
a violation. Cheap to fix in a later text pass; not worth blocking a green slice.

## Where does the PLAYER see this, in a plain boot? (Mistake #10)

**Nowhere, and that is correct for this slice.** It is authoring/validation infrastructure: a type
surface, an allowlist, and a spec that asserts the authored fleet boots valid and that planted inert data
**fails closed**. The player-facing guarantee is negative — malformed contract data cannot reach a boot.
That guarantee is exercised by the slice's own spec (2/2) and by the 16/16 boot probes, which include an
explicit zero-console plain-boot probe. No GAZETTE item is owed: no review names a player-visible change.

## Custody note (§3.0b)

Every measurement above ran in **detached scratch worktrees** (`worktrees/gate-s1384`,
`worktrees/ctl-s1384`). Main's working tree received slice content **only after the verdict was ACCEPT**,
and the lift was verified by **blob hash on all 11 files** rather than by `git status` — because a clean
`git status` is exactly what a concurrent broad `git add` also produces (F-1295-1). Both worktrees pruned
at close. Test-run byproducts (regenerated `artifacts/**` PNGs) were left in the scratch worktree and
deliberately **not** merged.
