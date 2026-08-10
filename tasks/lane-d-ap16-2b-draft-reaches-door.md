# Task ap16-2b: the draft reaches the door — RE-LAND of ap16-2 on fresh main, with the fixture and the audit inside the firewall (LANE-D, commit prefix "feat:")

**FIRE-AUTHORED s1639 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in **worktrees/lane-d**.

## THIS IS A RE-LAND, NOT A FRESH BUILD — READ THIS FIRST

The original `ap16-2` was **implemented correctly and never merged**. Its output is preserved
forever on the salvage ref **`save/ap16-2-s1639-73a0cfed`** (tip
`73a0cfedc8379019a441d29d7375864967136e28`, 5 files, +209/−26). **Read that diff first and reuse
it — you are re-landing a known-good implementation on a moved main, not re-deriving it:**

```
git diff main...save/ap16-2-s1639-73a0cfed
```

**Why it is being re-landed rather than merged** (measured s1639, not inherited): `ap16-3` merged
`eba8d15ea` into the *same two files* on 2026-08-10, and `save/ap16-2-s1639-73a0cfed` now
**CONFLICTS with main — 5 conflict hunks, 3 in `src/agent/StandingOrders.ts` and 2 in
`src/sim/HeadlessContractSim.ts`.** Stale + conflicted = RE-LAND with the old branch as
salvage-ref (Mistake #15): agent hours are cheap, subtle merge corruption is not. **Nothing is
lost and nothing may be resurrected by hand-merge.**

READ FIRST:
- `AGENTS.md`
- `specs/agent-play/ap-16-same-game-law.md` — rule 2 (same agency) + the ANSWERED block: the owner
  ruled the pick clock **30/20/10s** by greenhorn/trail/vein-hunter, silence = first option,
  `defaultedPicks` counted, and verb `PICK_UPGRADE` **ratified**. Prove you have the right file:
  `grep -c "PICK_UPGRADE" specs/agent-play/ap-16-same-game-law.md` → **must print 1**. 0 = stale lane, STOP and report.
- **The merged browser clock, main `e7bb88cf0` — READ ITS DIFF.** You REUSE its Balance keys and
  mirror its semantics sim-side. Do not invent a second clock.
- `src/sim/HeadlessContractSim.ts` — the auto-first-pick you replace. Prove you have it:
  `grep -c "while (this.progression.offer" src/sim/HeadlessContractSim.ts` → **must print 1**.
  ⚠️ **Cited by CONTENT deliberately: the original master cited this site as `:661-662` and it is
  now at `:665`, because ap16-3 added 27 lines above it.** Never trust a line number here.
- `src/agent/StandingOrders.ts` — the grammar `PICK_UPGRADE` joins. It already carries SEVEN verbs
  including ap16-3's: `grep -c "BLAST_AT" src/agent/StandingOrders.ts` → **must print 7**. **0 means
  your lane predates ap16-3 and every conflict this task exists to avoid is back — STOP and report.**
- `reviews/ap16-3-blast-verb.md` — what landed in these two files under you, and how it routed
  through the shared `CombatSystem.launchLob` rather than a parallel implementation. Your slice
  mirrors that discipline for the draft.
- `public/skill.md` — the door doc. **F-1541-1 REGION PARTITION LAW: add a NEW self-contained
  section, never re-flow the file.**
- `scripts/moth-season-pressure.test.mjs` and `scripts/fixtures/moth-season-orders.json` — the
  suite the original slice reddened. See scope 7; this is the reason that slice could not merge.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its
content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE →
`git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead
commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree
holds uncommitted edits you did not make.

ⓘ **s1639 reset lane-d to main deliberately, AFTER preserving its tip on
`save/ap16-2-s1639-73a0cfed`.** So a clean `ahead=0` lane is the EXPECTED state here and is not a
sign anything was lost. If you find the lane ahead of main with content that is neither on main nor
on that salvage ref, STOP and report — that would be someone else's work.

EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`,
`reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP, whether uncommitted dirt or the
entire content of an ahead commit. Discard them and PROCEED, listing what you discarded.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A
CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN
EXCEPTION (F-1407-1) — always expected, never a STOP; list and proceed: (a) `logs/**`;
(b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`,
`scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner 2026-08-10, verbatim — the law this slice serves)
> "Then the agents also don't upgrade their skills or collect experience?"

They collect XP but the sim drafts FOR them — first offer, always, forever. The owner ruled the
cure: **same offer, same clock, same default, both species.** And the sequencing ruling the same
day: *"lets wait until we have parity between humans and agents on the maps"* — the roguelite draft
is the heart of a build, and this is the largest of the three parity gaps.

**AP-16-1 merged `8465f6b33`, AP-16-3 merged `eba8d15ea`. This slice is the LAST of the three.**

## Scope

1. **The offer rides the view.** While `progression.offer` is non-null headless, the view gains
   `now.pendingOffer`: `[{id, name, effectText}]` plus `expiresAtSimMs` (see 3). Derive
   `effectText` the same way the browser overlay does — **reuse, don't fork.** Additive view field;
   existing view consumers unaffected.
2. **`PICK_UPGRADE` joins the grammar**: `{"verb":"PICK_UPGRADE","id":"<upgradeId>"}` — valid only
   while an offer is live AND the id is IN the live offer; otherwise the existing order-rejection
   surprise. A valid pick applies that upgrade through the same `applyUpgrade` path and consumes
   the offer. It becomes the **eighth** verb, joining ap16-3's `BLAST_AT`.
3. **The shared clock, in SIM time.** The offer auto-resolves to `offer[0]` after the difficulty
   window, using **the SAME Balance keys the merged browser clock uses** (30/20/10s
   greenhorn/trail/vein-hunter). Every auto-resolution increments `defaultedPicks`; the outcome
   line gains `defaultedPicks`. Verify the browser and sim counters share one name and derivation;
   unify if the clock slice left them apart, citing lines.
4. **The auto-first-pick loop dies.** The `while (this.progression.offer…)` site is replaced by the
   offer lifecycle above. XP consumption stays.
5. **The door doc.** `public/skill.md` gains ONE new self-contained section documenting
   `pendingOffer` + `PICK_UPGRADE` + the clock + `defaultedPicks`. Never re-flow the file;
   `skillmd-guard`'s fenced blocks stay untouched unless the grammar fence must gain the verb — if
   so, edit ONLY inside that fence and say so.
6. **e2e** (re-land the salvage ref's `e2e/ap16-upgrade-door.spec.ts`, or name your replacement):
   the offer appears in the view with an expiry; a valid PICK consumes and applies; an invalid PICK
   rejects; **silence past the window defaults to first AND increments `defaultedPicks`.**

7. ⭐ **THE MOTH-SEASON FIXTURE — THIS IS THE SCOPE THE ORIGINAL MASTER LACKED, AND WHY IT COULD
   NOT MERGE.** `scripts/moth-season-pressure.test.mjs` replays the prerecorded stream
   `scripts/fixtures/moth-season-orders.json` through `gr-sim.mjs` and asserts
   `{ secured: true, waves: 12 }`. ✓ VERIFIED s1639: that fixture holds **17 order entries and ZERO
   `PICK_UPGRADE`** — it **cannot express a pick at all**, so under your delayed draft its upgrades
   arrive at window-expiry instead of immediately, and the run is reported to die at **wave 6**.
   **You must leave this suite GREEN, and you have exactly two lawful ways to do it:**
   - **(a) PREFERRED — re-record the fixture** so the competent stream picks its upgrades
     deliberately (add `PICK_UPGRADE` orders at the ticks where the offer is live). This keeps the
     suite's *meaning* — "competent play secures at wave 12" — and makes it *stronger*, because
     competence now includes drafting.
   - **(b) Re-pin the expectation** only if (a) genuinely cannot restore wave 12, and then **only
     with a NAMED CAUSE written at the pin site** — F-1441-3: never re-pin to make a red go away.
     State the new number, the mechanism, and why (a) was insufficient.
   ⛔ **What is FORBIDDEN: leaving it red, deleting it, skipping it, or excusing it under a class
   label.** A red nobody investigates is worse than no test (F-1460-1).

8. ⭐ **RETIRE THE AUDIT'S PINNED FALSEHOOD (F-1638-3) — and the generator defect under it.**
   `scripts/same-game-audit.mjs` hardcodes every non-`:rig` ability as unavailable to agents, so
   **all 42 blast ability rows still read *"no reachable standing-order path reaches this hero
   ability"* even though `BLAST_AT` merged at `eba8d15ea`.** Worse, `scripts/same-game-audit.test.mjs`
   **asserts** that row is `agent-lacks` under the title `blast-charge gap must remain visible`
   (`grep -c "blast-charge gap must remain visible" scripts/same-game-audit.test.mjs` → 1) — **so
   whoever fixes the ability rows watches `test:node-guards` go RED *because* they fixed it.** That
   is you. It is expected, it is not your regression, and you must:
   - make the ability-row generator **derive** agent availability from the real door grammar
     instead of hardcoding it (so `BLAST_AT` reads as reachable, and your new `PICK_UPGRADE` does
     too, without a third hardcode);
   - **update that guard's assertion to the measured truth**, renaming the test so its title states
     what it now protects, and **naming `eba8d15ea` (blast) and this slice (pick) as the causes**;
   - **PROVE THE GUARD STILL HAS TEETH: manufacture the defect.** Force the generator to report the
     blast ability as unavailable again and show the guard goes **RED**, then revert byte-identical
     and show it **GREEN**. A guard that cannot fail protects nothing — that is exactly how
     F-1636-1 was born, and it must not recur here.
   Report the ability-row counts before and after, and the new whole-report divergence totals.

⏭️ **ERA STAMP — REPORT, DO NOT MINT.** This slice is the last of AP-16-1..3, which is the condition
`specs/seasons/seasons-v1.md` names for opening **Season 2 "The Same Game"**. **Do NOT create a
season, a date, or an era stamp** — a season boundary is a canon + date decision that belongs to an
attended session or the owner. Simply state in your report: *"AP-16-1..3 are now complete; the
Season-2 boundary condition is met and unminted."*

## Firewall
Touch ONLY: `src/sim/HeadlessContractSim.ts` · `src/agent/StandingOrders.ts` · `src/agent/View.ts`
(only if the view type needs the additive `pendingOffer` field) · `src/game/Progression.ts` (only if
the offer lifecycle needs an additive hook) · `public/skill.md` (one new section + at most the
grammar fence) · `e2e/ap16-upgrade-door.spec.ts` (or your named replacement) ·
`scripts/gr-sim.test.mjs` re-pins under the evidence rule · **`scripts/fixtures/moth-season-orders.json`
and `scripts/moth-season-pressure.test.mjs` (scope 7)** · **`scripts/same-game-audit.mjs` and
`scripts/same-game-audit.test.mjs` (scope 8)** · `docs/bench/same-game-audit.md` **only as
regenerated output, never hand-edited**.

> ⓘ **The last four paths are in TOUCH-ONLY deliberately, and their absence is the whole reason the
> original slice sat undrained.** F-1637-1 is now the third instance of a master ordering work whose
> completion required a file outside its own firewall. If you find a fifth such file, **report it —
> do not silently reach for it.**

NO changes to: the browser clock/overlay (merged at `e7bb88cf0`, done) · the buildable predicate
(ap16-1's, merged) · the blast ability implementation (ap16-3's, merged — you change how the AUDIT
*reports* it, never how it *behaves*) · ranking / `compareScores` / the standings API / tape
validation · `src/encyclopedia/**` and `src/seasons/**` (SEA-2 merged `39c036580` — the seasons
surface is live and not yours) · any season DATA or era stamp.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent
no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)
- `npx tsc --noEmit` clean; `npm run build` green.
- Your door e2e green **desktop + 390px mobile**, zero console/page errors. Run playwright with
  **`--workers=1`**.
- **`npm run test:node-guards` green — run it ALONE** (F-1537-1: it is ~181–400 s and overlapping it
  with a second battery contaminates both on shared fixtures). This is mandatory here, not optional:
  your diff touches `src/sim/` (F-1460-1), and it is also what proves `skillmd-guard`,
  `moth-season-pressure` (scope 7) and `same-game-audit` (scope 8) all landed lawfully. **State the
  test/pass/fail/skip counts.**
- **Full `gr-sim` battery with EVERY re-pin explained per seed.** Any seeded run that levels up WILL
  re-pin, because the default pick moves from immediate to window-expiry — enumerate every changed
  seed and tie it to that mechanism. **Unexplained drift = STOP, do not re-pin blind.**
- Adjacent: `task-025` + `m1-01` + `m2-01` unmodified-green, both projects.
- The scope-8 teeth proof (guard RED on a manufactured defect, GREEN after byte-identical revert).

End: **READY-FOR-GATES** + report: what you reused from `save/ap16-2-s1639-73a0cfed` vs re-derived
and why · the view field shape · the clock unification evidence (browser + sim sharing one key set)
· `defaultedPicks` wiring on both sides · the per-seed re-pin table · **which lawful option (a) or
(b) you took for the moth-season fixture, with the named cause** · the ability-row counts before and
after plus the guard's red-then-green proof · the era-stamp line (met and unminted).
