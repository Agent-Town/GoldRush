# Task f1662-2: A COUNT ENCODED AS PROSE ROTS WHEN ITS TABLE GROWS — derive the AP-16-4 admission numbers, name the two populations apart, and guard the artifact against itself (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED s1663 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` — grep `F-1662-2` and `F-1662-3` (the two findings you are curing, both filed by the s1662 drain that measured them); `reviews/f1660-1-door-readmission-repair.md` (the merge that made the prose false); `specs/agent-play/ap-16-same-game-law.md` **line 33** (the mode rule — it is the reason the two populations differ, and you cannot write item 1 correctly without it).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**STEP 1 (unconditional, F-1465-2): refresh the lane onto current `origin/main` before reading any source.** This lane was **19 commits behind** at authoring time. Then verify the cited code is present — each of these returned exactly **1** on main at authoring time (measured s1663, not remembered; the fifth has since risen to **2** by lawful ledger-keeping and is satisfied by `>= 1` — see the note under the block before you read a count of 2 as staleness):

```
grep -c "leaving five cited exemptions" scripts/same-game-audit.mjs                  # expect 1
grep -c "ten of those fifteen passed below and were admitted" scripts/same-game-audit.mjs  # expect 1
grep -c "### Cited exemptions" scripts/same-game-audit.mjs                           # expect 1
grep -c "'e2-incline': {" src/sim/HeadlessContractSim.ts                             # expect 1
grep -c "F-1662-2 MASTER AUTHORED s1663" tasks/BACKLOG.md                            # expect >= 1  (NOT ==1 — see below)
```

If any returns 0, **STOP and report "lane is stale or the cited code moved"** — do NOT improvise a replacement anchor. ⚠️ **The LAST key is a freshness probe, not a code anchor**: it proves the lane carries the commit that authored this master (F-1424-3 — a lane one commit behind the master's own commit produced a 44,007-token zero-file STOP). **The FIRST key is the defect itself**: if it returns 0, someone has already cured this — STOP and report that, rather than inventing a replacement task.

⚠️ **THE FIFTH KEY IS SATISFIED BY `>= 1`, AND A COUNT ABOVE 1 IS NOT A DEFECT — DO NOT STOP ON IT (F-1668-1, measured s1668).** Its corpus is `tasks/BACKLOG.md`, a ledger **every fire writes to**, so any fire that records having verified this key — by quoting the key string in its own row, which is exactly what a careful evidence-citing row does — **increments the very count it is asserting.** That is not hypothetical: s1666 measured all five keys at exactly 1, wrote the F-1666-1 row asserting it, and **that row's own backticked quotation of the key string took the count to 2** (`tasks/BACKLOG.md:5` and `:9`, re-measured s1668). The probe's question is **presence** — *does this lane carry the authoring commit?* — and presence is answered by `>= 1` at any count. Reading it as `== 1` converts a correctly-kept ledger into a false STOP whose error text (*"lane is stale"*) accuses the wrong subject, sending the next fire chasing a phantom refresh. **The first four keys keep `== 1`**: their corpora are source files with a single site each, which no fire's bookkeeping touches.

---

## Why (measured on main, s1662 + independently re-verified s1663 before this master was written)

`scripts/same-game-audit.mjs:379` builds the "AP-16-4 admission measurement" paragraph. Its **leading** numbers interpolate from `result`; its **tail is hardcoded prose**:

> The measured 15/15 split matches F-1642-1: 15 browser refusals and 15 browser-offered legacy door refusals; ten of those fifteen passed below and were admitted, **leaving five cited exemptions.**

✓ **THAT SENTENCE WAS ACCURATE WHEN IT WAS WRITTEN AND IS NOT ACCURATE NOW.** `CONTRACT_ADMISSION_EXEMPTIONS` held **5** entries at AP-16-4 (`effe1057`). After `7f006034a` restored the three F-E2S-3 railcars as cited exemptions, it holds **8**. Re-measured s1663 by reading both artifacts rather than trusting the finding:

- `src/sim/HeadlessContractSim.ts:57–90` — **8** entries: `e2-hill-mine`, `e2-incline`, `e2-trestle` (`F-E2S-3`), `e3-fairground` (`F-1475-1`), `e5-deepwater-claim`, `e5-stillwater`, `e6-glow-mesa`, `e6-showroom` (`reviews/milk-twin-sockets.md`).
- `docs/bench/same-game-audit.md:27` says **five** in prose, and `:46–:53` lists **eight** rows in the table **directly beneath it**. The report contradicts itself twenty-six lines apart.

💡 **THE CLASS, and it is one level over the bug this report's own subject was born from.** F-1660-1's root was *a policy encoded as a comment evaporates when its data structure is derived*. This is its sibling: **a count encoded as prose rots when its table grows.** Both store a fact outside the structure that owns it, and both stayed green, because **nothing asserts the prose against the data**. That is what item 3 fixes, and it is the durable half of this slice — the prose repair alone would rot again the next time an exemption is filed.

⛔ **DO NOT JUST CHANGE "five" TO "eight". THE SENTENCE IS AMBIGUOUS AND ONE OF ITS READINGS IS STILL TRUE.** This is the whole reason the s1662 drain refused to hand-tune it:

- **"five arising from that population of fifteen"** — **STILL TRUE.** The fifteen are browser-offered contracts the *legacy* door refused; ten were measured and admitted, and the five that remained refused (`e3-fairground` + the four E5/E6 sockets) became cited exemptions.
- **"five cited exemptions in the county"** — **NOW FALSE.** There are eight.

✓ **AND I VERIFIED WHY THE THREE RAILCARS ARE NOT IN THAT FIFTEEN, rather than assuming it** — this is the fact item 1 must encode, and it is not obvious. The same report's `reachability` line still reads **equal 22 · divergence 5 · not-offered 15** *after* the de-list regeneration (`244253143` moved `Final derived door` **22 → 19** and left that line untouched). That is **correct, not stale**: the three railcars declare `modes: [escort]`, and per `ap-16-same-game-law.md:33` — *"Mode-declaring contracts (escort etc.) admit through their declared mode"* — they remain **reachable**, so they sit in `equal` on the reachability surface while being **absent from the modeless derived door**. **Two populations, two correct numbers, one sentence that conflates them.**

---

## Scope (numbered; each item is checkable)

0. **Reproduce the contradiction before you change anything**, and quote it in your report: the prose count at `docs/bench/same-game-audit.md` versus the row count of its own `### Cited exemptions` table. A cure whose defect was never reproduced is a guess.

1. **Derive every number in that paragraph from `result`, and name the two populations apart.** No bare integer or number-word in the AP-16-4 paragraph may be a literal that describes live data. Concretely:
   - the total cited exemptions must come from `result.admission.exemptions.length`;
   - the admitted count must come from `result.admission.measurements` (it is the measured candidate table printed immediately below the sentence — derive it, do not retype `ten`);
   - the population arithmetic (`15/15`, `ten of those fifteen`) must be derived from the same `reachability` reduction the sentence already interpolates, or from `result` — whichever is honest.
   - **The sentence must state BOTH populations explicitly** so neither reading can be mistaken for the other: how many exemptions arose from the measured legacy-refusal population, AND how many cited exemptions the county holds in total, with one clause saying why they differ (mode-declaring contracts are reachable through their declared mode and were never in that population).
   ⚠️ **The historical baseline is NOT live data and must stay literal**: *"Reachability before this slice was equal 12 · divergence 30 · not-offered 0"* describes a past measurement and is correct as prose. Do not "derive" it. If you cannot derive a number honestly, **say so in the prose in one clause** rather than inventing a derivation that happens to produce today's value.

2. **Correct the one exemption `reason` the evidence does not support (F-1662-3) — by MEASURING, not by rewording.** All three F-E2S-3 entries carry the byte-identical reason *"Measured modeless idle run reached the wave ceiling without a lawful terminal because no weapon reaches the railcar."* The pinned null-floor evidence the s1662 drain deleted (git keeps it at `73ae4929a`) shows `e2-hill-mine-01/02` and `e2-trestle-01/02` at **18 waves / 540000 ms** — the cap — but `e2-incline-01/02` terminating at **wave 2 in 82633 ms / 76733 ms**, which is not a ceiling.
   ➡️ **Measure `e2-incline`'s modeless idle terminal yourself** through the admission-probe path `admissionMeasurement()` already uses (`boot.admissionProbe === true` bypasses the door; that is an existing, sanctioned mechanism — do not add a new one, and do not re-admit the contract). Then write a reason that says **what you measured**, for that contract only.
   🔑 **THE ERROR BEING CURED IS A GENERALISATION, SO DO NOT COMMIT IT AGAIN:** F-E2S-3's ceiling proof was measured on `e2-hill-mine` alone and copied onto all three. **A proof measured on one member of a set becomes an unmeasured claim about the others the moment it is copied into the set's shared justification.** If your measurement also contradicts the phrasing for `e2-hill-mine` or `e2-trestle`, that is a **FINDING for your report**, not an edit — those two have pinned evidence agreeing with their text.
   ⚖️ **POLICY IS UNTOUCHED AND MUST NOT BE RE-OPENED.** The citation stays `F-E2S-3` — an owner ruling of 2026-08-09 naming all three contracts **by name** — so all three remain exempt whatever the mechanism. You are correcting the `reason` **string value** only. Changing an id, a citation, or the door itself is a STOP.

3. **Guard the artifact against itself — the durable half.** Add a fast guard (no sims) that reds when `docs/bench/same-game-audit.md` disagrees with the data it describes:
   - (a) the exemption count **stated in its prose** equals the number of rows in its own `### Cited exemptions` table;
   - (b) the contract-id set in that table equals the keys of `CONTRACT_ADMISSION_EXEMPTIONS` imported from source — which is what catches a **stale committed report**, the failure (a) alone cannot see.
   🔑 **WHY (b) IS NOT OPTIONAL:** with (a) alone, a report nobody regenerated stays internally consistent and green forever — the guard would assert only that the artifact agrees with itself, which is the tautology class F-1636-1 was filed for. State that limit in the guard's header comment so the next reader does not delete (b) as redundant.
   **PROVE IT BITES by manufacturing the defect** — twice, once per assertion: (a) edit the stated count in the committed report → **RED**; (b) delete one table row → **RED**. Revert each byte-identically (record the `sha256` before and after) and watch it go **GREEN**. The red-then-green transcript is mandatory and goes in your report; a green from a guard that has never executed its violation path is not evidence.
   **Root the new script** (its name will match `(guard|assert|check|audit|contract|ratchet)`): add it to the `test:node-guards` list in `package.json`, and run `node scripts/gate-caller-audit.mjs --include-untracked` before you finish (F-1576-1 — the runner commits last, so its own battery cannot see the file it just wrote).

4. **Regenerate `docs/bench/same-game-audit.md`** with `node scripts/same-game-audit.mjs --write-report` — **regenerated, never hand-edited**. Quote the before/after of the AP-16-4 paragraph in your report. ⚠️ If the regeneration moves anything **outside** that paragraph, the exemption table and the reason strings — e.g. the reachability numbers or `Final derived door` — **STOP and report it**: that would mean your change reached the door, which is out of scope.

5. **Report, do not act, on anything else you find.** In particular: if you notice other hardcoded counts in this generator's prose (there may be more — items 1–4 fix the one that is currently false), **list them with line references as a finding**. Do not sweep them. A named list is worth more than a broad edit nobody gated.

If you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

## Firewall

**Touch ONLY:** `scripts/same-game-audit.mjs` (**the AP-16-4 paragraph and any small derivation helper it needs** — not the row builders, not `admissionMeasurement()`'s logic) · `src/sim/HeadlessContractSim.ts` (**the `reason` STRING VALUE of the F-E2S-3 entries ONLY** — not ids, not citations, not the type, not the table's membership, not the derivation filters, not the constructor gate) · `docs/bench/same-game-audit.md` (**regenerated only**) · your new guard script under `scripts/` (new) · `package.json` (**the `test:node-guards` script list ONLY**, to root the new guard).

**NO changes to:** `SUPPORTED_CONTRACTS`, the derivation filters, or the constructor gate `!SUPPORTED_CONTRACTS.has(…) && !mode && boot.admissionProbe !== true` — **admission is settled and this slice is about REPORTING it** · the **membership** of `CONTRACT_ADMISSION_EXEMPTIONS` (adding or removing an entry here is an owner-ruling act, Mistake #14) · `scripts/door-admission-baseline.json` and `scripts/door-admission-ratchet.test.mjs` — **they must stay green untouched; if either reds, that is a FINDING about your change, not a file to edit** · `public/skill.md` · `assets/contracts/**` · `scripts/null-floor-anchors.mjs` and `assets/contracts/null-floors.json` · `e2e/**` · `scripts/gr-sim.test.mjs` pins — **a moved hash is a FINDING, never a re-pin (F-1441-3)** · `src/systems/**`, `src/game/Game.ts`, `src/meta/ContractFamilies.ts` · `specs/**`, `tasks/**`, `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json` (the fire owns those).

🔓 **FIREWALL LIFT:** item 3(b) needs to read the exemption keys from source — **`CONTRACT_ADMISSION_EXEMPTIONS` is already exported** from `src/sim/HeadlessContractSim.ts` and `scripts/same-game-audit.mjs:31` already imports it that way. Use that; do not add an accessor. If your work requires touching any file **not** listed above, **STOP and report** rather than reaching.

## Self-check (all of it, before you report READY)

- `npx tsc --noEmit` clean · `npm run build` green.
- `node --test <your new guard>` — green, **plus both manufactured-defect red-then-green transcripts** from item 3, with the `sha256` of the reverted file before and after.
- `node --test scripts/door-admission-ratchet.test.mjs` and `node --test scripts/skillmd-guard.test.mjs` — green **without editing either**. The door must be exactly where you found it.
- **`npm run test:node-guards` — RUN IT ALONE, nothing else in parallel.** Required because the diff touches `src/sim/` (F-1460-1: a slice-local check cannot see a cross-cutting sim pin), and it is ~3 minutes and contends with any concurrent battery (F-1537-1). Report the full tests/pass/fail/skip line. **Zero `gr-sim` hash drift is expected** — this slice changes prose and a report; **any moved pin is a FINDING, not a re-pin.**
- The regenerated `docs/bench/same-game-audit.md`: quote the AP-16-4 paragraph **before and after**, and confirm `Final derived door (19)` and the reachability line are **unchanged**.
- `node scripts/gate-caller-audit.mjs --include-untracked` green.

⚠️ **No e2e run is required** — this slice touches no rendering, no player-facing surface and no spec assertion. If you believe one IS required, say why in your report rather than running the whole board.

**READY-FOR-GATES** — then report: the item 0 reproduction · the before/after AP-16-4 paragraph · your measured `e2-incline` terminal and the reason string you wrote from it (item 2), plus any finding about the other two · both red-then-green transcripts (item 3) · the `test:node-guards` line · the item 5 list of any other hardcoded counts you found · every file you touched and why.
