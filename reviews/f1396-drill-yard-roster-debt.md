# F-1396 — F-1394-1 was TWO unrelated defects; and the drill-yard census debt has a ROSTER-shaped half nobody swept

**Fire:** s1396, 2026-08-02. **No merge.** This is an investigation record: every number below was measured this fire, on this disk, at `--workers=1`.

**Verdict:** F-1394-1 (`cp01-charter-roundtrip` + `cp03-press-loop` red on clean main) named one finding and contained two, with **different causes, different dates, and different owners**. Splitting them is the whole result.

---

## Instrument note (why these numbers are admissible)

Every run below used `--workers=1`, per §3.1 (F-1270-1: at default workers the fire shell manufactures reds). This matters directly here: the standing `logs/suite-red-inventory.md` snapshot was taken at **configured workers 2 / actual workers 2** (its own "Harness provenance" section says so, and adds *"A comparison run at a different worker count uses a different instrument"*). So the inventory's cp03 row is **not** by itself evidence that cp03 is a genuine red. I re-measured rather than inherited.

⚠️ **A trap worth recording, because it nearly became a finding.** `logs/suite-red-inventory.md:419` lists cp03 with `39/71 (54.9%)`, which reads exactly like a flake rate. It is not. The section header at `:363` says **"Masking candidates — ranked by the earliest failing line within the test body … Lower ratios leave more of the test unexercised."** The number is a **failing-line / body-lines ratio**, not a frequency. Had I carried "cp03 is a 54.9% flake" forward, every conclusion after it would have been wrong. *A number inherits the meaning of its column.*

---

## (A) cp01 — CAUSED by `f86b28b3`, and it is one of FOUR

**Cause, control-proven.** `f86b28b3` (`runner(lane-b): lane-drill-yard.md`, 2026-08-01T08:14) added `e1-drill-yard` as E1's 6th contract. Specs that hard-code a five-name E1 roster went red by arithmetic.

**The control run is what makes this a cause and not a correlation.** At `f86b28b3^` (`02249254`), in a detached worktree (§3.0b), same harness, `--workers=1`:

| Spec | at `f86b28b3^` | on main today |
|---|---|---|
| `cp01-charter-roundtrip.spec.ts:28` | **GREEN** | **RED** both projects |
| `072-era-activation.spec.ts:241` | **GREEN** | **RED** both projects |
| `cp03-press-loop.spec.ts:64` | **RED** | **RED** both projects |

Both cp01 and 072 fail with the identical diff — `+ "e1-drill-yard"` inserted into an otherwise-matching array.

### The full roster-shaped debt on main (measured, not inferred)

| Spec | Line | Red on main? | Fix status |
|---|---|---|---|
| `cp01-charter-roundtrip.spec.ts` | `:28` | ✅ RED ×2 projects | **unfixed anywhere — this is the authorable half** |
| `072-era-activation.spec.ts` | `:241` | ✅ RED ×2 projects | fix EXISTS, frozen in blocked `7c4f132f` |
| `agent-view.spec.ts` | `:263` | ✅ RED ×2 projects | fix EXISTS, frozen in blocked `7c4f132f` |
| `e1-baron.spec.ts` | `:343` | ✅ RED ×2 projects | fix EXISTS, frozen in blocked `7c4f132f` |

**4 logical tests, 8 project-results.**

### ⓘ At my own expense: my first denominator missed the file I started from

I sized this class with `git grep "'the-claim', 'e1-dry-gulch'"` and got 10 files. That grep **does not match `cp01-charter-roundtrip.spec.ts`** — the very spec that opened the investigation — because cp01 writes its roster as a multi-line array. A second, format-independent pass (any file naming `the-claim`, `e1-dry-gulch` and `e1-baron` inside one 400-char window) found 8 files including cp01 **and** `town-t3-board.spec.ts`, which the first pass also missed — while itself losing five files the first pass had found. **Neither grep is the denominator; the union (12 files) is the candidate set.**

So I stopped grepping and measured. `town-t3-board.spec.ts` and `contract-briefings.spec.ts` both name a full roster and are **26/26 GREEN** — because naming a roster is not the defect. Only an **exhaustive assertion against live-derived data** goes red; an iteration list silently skips the new contract instead.

➡️ **That distinction splits the class in two, and only the first half is a red:**
- **Exhaustive (RED):** the four above.
- **Iteration lists (SILENT COVERAGE HOLE, not red):** `panorama-framing:39,:72` · `release-build:100` · `terrain-seamless:128` · `tr-02-splat-ground:102` · `contract-briefings:258` (a `.has()` membership set, so drill-yard reads as locked) · `scripts/stream-capture.mjs:16`. **These are UNMEASURED as defects and I did not touch them.** Adding drill-yard to them is a behaviour question (does it have panorama art? terrain? release assets?) that can legitimately red things — it deserves its own measured slice, not a drive-by. Recorded as **F-1396-3**.

📌 **Why this half was missed by the sweep that was supposed to catch it.** `f1330-1-count-shaped-censuses` (shipped `68deb90a`) swept the drill-yard census debt and its own master states the denominator it used: `grep "toHaveLength(41)\|toHaveCount(41)\|toBe(41)\|toEqual(41)\|all 41 \|41 contracts\|41 cards"`. That is a **count-shaped** denominator. It is correct and it was run honestly — and a roster-shaped literal contains no `41` at all, so it was invisible to it. The cure's denominator was narrower than the defect's class.

---

## (B) cp03 — NOT drill-yard. A deliberate behaviour change from RF-05b, never reconciled

cp03 was **already red at `f86b28b3^`**, so drill-yard is exonerated. Two further measurements date it:

- **GREEN at its own birth commit** `d3d0a484` (2026-07-17), **6/6, rc=0** — so this is genuine rot, not a never-green guard.
- **Bisect** over the 2,992-commit window `d3d0a484..f86b28b3^`, 15 automated steps, one spec per step at `--workers=1`:

> **first bad commit: `776cd64a` — "feat: add physical E1 release build"** (RF-05b, 2026-07-23T06:22)

### The mechanism, read rather than blamed

A bisect names a commit, not a cause. I traced the path:

1. `776cd64a` adds `src/meta/ContractUnlock.ts` (new file) and wires `reverifyStagedContractLaunch()` into boot at **`src/main.ts:114`**.
2. `ContractUnlock.ts:77-90` reads the staged launch, and if the contract is **locked**, calls `clearPlayerContractLaunch()`.
3. `ContractFamilies.ts:1245-1252` — that function removes **both** `PLAYER_CONTRACT_LAUNCH_KEY` **and `CHARTER_LAUNCH_KEY`**.
4. With no staged launch, the run resolves to the default contract, so the guard at `ContractFamilies.ts:1331` (`launched && requestedId && contract.id === requestedId`) never fires and the charter document is never applied.
5. `Hud.ts:329` therefore renders the base contract's name.

**Is twin-banks actually locked?** Yes — and checking this corrected my own first guess. `assets/contracts/epoch-1-frontier/contracts.json` has no top-level `unlock` key at all (my first probe read the wrong field and printed `undefined` for all six). The gate is **`boardRow.unlock`**, and `e1-twin-banks` carries **`"firstSecuredClaim"`** → `scores.some(s => s.secured === true)`. cp03 presses from a **fresh profile** with no secured claim. Locked. Cleared. Falls back to `the-claim` — exactly the observed `Expected: "Twin Banks, Re-pressed" / Received: "The Claim"`.

⚖️ **This is arguably CORRECT behaviour, which is why it is a fork and not a bug report.** A Press launch bypassing contract unlock gating is precisely what a release build should refuse. The RF-05b author evidently knew the interaction existed: the clear path records `charterDocumentPresent: stagedCharterLaunchPresent()` into diagnostics — it is *instrumented for this exact case*. What was never done is reconciling CP-03's spec with it.

**Recommendation (attended, cheap): (b).**
- **(a)** exempt the Press from unlock re-verification — restores the old behaviour, but re-opens the bypass RF-05b closed. Not recommended.
- **(b)** ✅ **cp03 seeds a secured score so twin-banks is genuinely unlocked before pressing.** The test establishes its own precondition; no product behaviour changes and no guard is loosened. This matches the ratified precedent from s1323, whose review states the parity corrective was accepted specifically because *"no guard was loosened to pass"*.

---

## (C) 🔺 THE FINDING WITH THE MOST LEVERAGE — an owner block is freezing four files it has no quarrel with

`7c4f132f` (lane/m4, owner-BLOCKED) is **five files**:

| File | Content | Contested? |
|---|---|---|
| `e2e/072-era-activation.spec.ts` | roster 5→6 (**one line**) | **no** |
| `e2e/agent-view.spec.ts` | roster 5→6 + title "five"→"six" | **no** |
| `e2e/e1-baron.spec.ts` | `toHaveCount(5)`→`(6)` + comment | **no** |
| `src/town/TownScene.ts` | **a comment**, 41→42 | **no** |
| `e2e/fixtures/e1-mechanics-manifests.json` | +36 lines | ⚠️ **YES — this is the whole dispute** |

Per the leaf's own re-verification (s1330), the owner question is whether the fixture byte-stably blesses `interactables: []` for the drill yard, i.e. whether it enshrines the AP-11 derivation defect F-1328-4. **That question lives entirely in the fixture.** The other four files are mechanical roster arithmetic that is true no matter how the owner rules — and freezing them keeps **6 of the 8 red project-results red**.

s1330 already established the pattern for exactly this situation, carving the census half out of the same block so it *"cannot be held hostage"*. This is the same shape, one level down.

➡️ **Recommended (attended/owner, one word): carve the four uncontested files out of `7c4f132f` and land them; leave the fixture blocked.** A fire may not lift a block (§3.0), so this needs a human. I did not do it.

---

## Findings

- **F-1396-1** — F-1394-1 is two defects. cp01 (+072, agent-view, e1-baron) ← `f86b28b3`; cp03 ← `776cd64a`. Control-proven, dated, mechanisms read. **The cp01 half is fire-authorable and is authored this fire.**
- **F-1396-2** 🔺 — cp03 is a deliberate RF-05b behaviour change (unlock re-verification clears the charter). Needs an attended ruling; **rec (b)**, test-side precondition. Player-facing surface is limited to `?editor`.
- **F-1396-3** 🟡 — six iteration-list roster sites silently skip drill-yard, including the **release-build gate** (`release-build.spec.ts:100`) and `scripts/stream-capture.mjs:16`. Coverage holes, not reds. **UNMEASURED — wants its own slice; do not drive-by fix.**
- **F-1396-4** 🔺 — the owner block on `7c4f132f` freezes four uncontested files alongside the one contested fixture, holding 6 red project-results hostage. **Rec: carve out the four.**
- **F-1396-5** 🟢 — `logs/suite-red-inventory.md:419`'s `54.9%` is a body-coverage ratio, not a flake rate, and reads like one. Noted, **not** edited (standing order forbids hand-editing that file).

## Re-derivation

Raw logs parked under `logs/_s1396_*` per the Retention Law: `cp01cp03_w1`, `072_w1`, `parent_control`, `cp03_birth`, `bisect`, `class_probe`, `heldspecs`.

---

# DRAIN — s1397 (2026-08-02)

**Slice:** `f1396-1-cp01-roster-census` · **branch:** `lane/e2-arsenal` · **lane tip:** `bb66753c` · **merge:** `7f5b8017`

**VERDICT: MERGED.** The cp01 half of F-1396-1 is closed.

## What it does

`f86b28b3` landed `e1-drill-yard`, the owner-ratified 6th E1 contract. `cp01-charter-roundtrip.spec.ts:27` asserts the E1 roster **exhaustively** against live-derived data (`listContracts('epoch-1-frontier')`), so the new contract reddened it with a pure-arithmetic diff. The slice adds `'e1-drill-yard'` at index 1 and retitles the test five→six. **Two lines, one file, test-only — no product code touched.**

Worth recording: the roster literal also drives a parameterised loop, so the fix does not merely silence an assertion — it **adds a genuinely executed case**, `round-trip: e1-drill-yard`, which passes. cp01 went 18→20 project-results.

## Evidence (merged tree, detached gate worktree per §3.0b, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, built in 1.10s |
| `cp01-charter-roundtrip` | **20/20** desktop + mobile |
| Adjacent — grep-derived (`listContracts` consumers + both drill-yard specs, 10 files) | **104 passed / 8 red** |
| Boot probes (`_s106-prospector`, `profile-first-boot`, `f1297-2-plain-boot`) | **16/16** desktop + 390px, zero console/page errors |

Adjacency was **derived by grep, not inherited from the runner's list**: `grep -rln listContracts e2e/` returns the nine specs that actually read the roster. The broader `epoch-1-frontier` string match (40 files) is mostly incidental and was not used as the denominator.

## The 8 remaining reds — fingerprint, not hand-wave

| Spec | Projects | Owner |
|---|---|---|
| `072-era-activation.spec.ts:226` | desktop + mobile | held in owner-BLOCKED `7c4f132f` → **F-1396-4** |
| `agent-view.spec.ts:263` | desktop + mobile | held in owner-BLOCKED `7c4f132f` → **F-1396-4** |
| `e1-baron.spec.ts:343` | desktop + mobile | held in owner-BLOCKED `7c4f132f` → **F-1396-4** |
| `cp03-press-loop.spec.ts:25` | desktop + mobile | RF-05b design fork → **F-1396-2**, attended |

s1396 measured the roster debt at **10 red project-results** (cp01, 072, agent-view, e1-baron × 2, plus cp03 × 2). I measure **8** on the merged tree. **10 − 8 = 2 = exactly cp01's own**, which is the arithmetic this merge predicts and nothing more. The diff touches one test file, so it is structurally incapable of moving the other four specs.

⚠️ **A measurement note against my own first number.** The line reporter's summary for the 10-spec adjacent run said `7 failed`; a per-test JSON walk over the four suspect specs said **8**. I did not average them or pick the convenient one — the JSON count enumerates test-by-test with project names and line numbers and is the one reproduced in the table above. The line-reporter's 7 is most likely a retry being counted as a pass. **Flagged rather than smoothed over: if a future fire sees this discrepancy again it is the reporter, not the suite.**

## Findings

- **F-1397-1** 🟢 — playwright's `line` reporter summary count disagreed with a per-test JSON walk on the same tree (7 vs 8) in the fire shell. Low severity, instrument-side, **not** a product defect. Recorded so the next fire that meets it does not re-diagnose it as a flaky suite. Use `--reporter=json` + a per-test walk when an exact red count matters.

No blocking findings. Nothing in this slice touches the owner-blocked files, the six iteration-list coverage holes (F-1396-3), or the cp03 fork (F-1396-2) — all three were firewalled OUT by the master and stayed out.

### Two more findings, both surfaced by this fire's own bookkeeping (s1397)

- **F-1397-2** 🟡 — **the E1 release door boots five of E1's six contracts.** `e2e/release-build.spec.ts:18` holds the array consumed at `:100` by "for (const contractId of CONTRACTS) {", and it is precisely the five E1 contracts that predate `f86b28b3` — so `e1-drill-yard`, a shipping E1 contract, **has never booted through the E1 release gate.** This is the roster-shaped member of F-1396-3; s1396 filed all six sites as one UNMEASURED class, and re-reading each site's *constant definition* shows they are not one class (three are deliberately **sampled** sets spanning E2/E4, one encodes an **unlock ruling**). Authored s1397 as `f1397-1-e1-release-door-drill-yard`, MEASURE-FIRST. Matters now because the owner's #1 ask is closing launch, and tagging vE1.0 with an untested shipping contract is a gap that is cheap to close beforehand.

- **F-1397-3** 🟢 — **`citation-title-guard`'s quote extraction is sensitive to unrelated nearby markdown formatting.** `QUOTED` (`scripts/citation-title-guard.mjs:66`) treats every backtick as a delimiter and requires 12–160 chars between a pair. An inline-code span **shorter than 12 characters** is therefore skipped as an opener, which **desynchronises the pairing for everything after it** — the regex then extracts the prose *between* code spans instead of the spans themselves. Measured here: a correct, verbatim quote of a real source line sat in the window and was never extracted, because a nearby 9-char span had shifted the pairing. Two further consequences worth knowing: the window is `±400` chars from the citation, so **whether a citation passes can depend on where that window happens to start**; and a `MIN_PREFIX` of 20 means a quoted prefix of exactly 19 chars fails (`const CONTRACTS = [` truncates at the array's first `'`). **Not filed as a defect to fix** — the guard's purpose (recoverability) is served, and loosening the regex risks false greens. Recorded so the next fire that meets a "but I quoted it correctly" red spends one minute, not ten: **put the quote immediately after the citation, in double quotes, with no inline-code spans between them.**

### ⚠️ A note on how this fire's own merge reddened the guard

`7f5b8017` renamed the cp01 test five→six. That **invalidated every ledger citation quoting the old title** — two in `BACKLOG.md`, two in the shipped `f1396-1` master — none of which the drain battery could have caught, because it ran on the merged tree *before* the bookkeeping existed. This is exactly the s1301 law's class (*guards whose subject a fire mutates late in its own run*), with one addition worth naming: **a merge that renames a test is itself a late mutation of a guarded subject.** The renaming commit and the citations that quote the old name are always in different commits, so the red is structurally deferred to whoever writes the next ledger row. `test:ledger-guards` run after the bookkeeping is what caught it — 5 reds, cured to 0.
