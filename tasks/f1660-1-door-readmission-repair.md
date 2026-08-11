# Task f1660-1: THE DOOR RE-ADMITTED THREE RULED-OUT CONTRACTS — restore the cited exemption and ratchet the door so it cannot happen silently again (LANE-B, commit prefix "fix:")

**FIRE-AUTHORED s1660 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `specs/agent-play/ap-16-same-game-law.md` **line 33, the AP-16-4 admission rule** (the law you are restoring — read the whole bullet, especially the two sentences about mode-declaring contracts and about what an exemption is FOR); `reviews/f1605-1-e2s3-door-delist.md` (the de-list this task restores); `reviews/ap16-4-same-game-admission.md` (the slice that dropped it — a GOOD slice with one omission; you are not reverting it).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**STEP 1 (unconditional, F-1465-2): refresh the lane onto current `origin/main` before reading any source.** This lane was 99 commits behind at authoring time. Then verify the cited code is present — each of these returned exactly **1** on main at authoring time:

```
grep -c "boot.admissionProbe !== true" src/sim/HeadlessContractSim.ts          # expect 1
grep -c "export const CONTRACT_ADMISSION_EXEMPTIONS" src/sim/HeadlessContractSim.ts   # expect 1
grep -c "in CONTRACT_ADMISSION_EXEMPTIONS" src/sim/HeadlessContractSim.ts      # expect 1
grep -c "const admitted = new HeadlessContractSim" e2e/er01-e2-census.spec.ts  # expect 1
grep -c "skillmd-guard:door-contracts:start" public/skill.md                   # expect 1
```

If any returns 0, **STOP and report "lane is stale or the cited code moved"** — do NOT improvise a replacement anchor.

---

## Why (owner ruling + ratified law + measured live state, 2026-08-11)

**The owner ruled on 2026-08-09 (OWNER RULINGS ROUNDUP, `tasks/BACKLOG.md`, grep `F-E2S-3 RULED`), verbatim:**

> **F-E2S-3 RULED: de-list now, socket later** — the door refuses e2-hill-mine/trestle/incline by name … the era-true pressure-to-damage socket follows as its own census-stream slice.

That ruling shipped: `f1605-1` merged at **`88530e3ef`** (drained s1606, review `reviews/f1605-1-e2s3-door-delist.md`), de-listing the three from `SUPPORTED_CONTRACTS` while **deliberately leaving the escort-mode arm intact** so escort callers were untouched.

✗ **IT HAS BEEN SILENTLY REVERSED, AND I MEASURED THE LIVE DOOR RATHER THAN READING A LEDGER.** `48a0d41ab` (the `ap16-4-same-game-admission` runner commit, 2026-08-11T00:02, on main) replaced the hand-maintained `SUPPORTED_CONTRACTS` literal with a derivation — registry minus a new `CONTRACT_ADMISSION_EXEMPTIONS` table. The E5/E6 refusals (×4) and `e3-fairground` were carried across into that table as cited entries. **The three E2 railcar contracts were not**, so the derivation swept them back in.

✓ **PROVEN LIVE, s1660** — this is the acceptance evidence, and reproducing it is scope item 0:

```
node scripts/gr-sim.mjs --contract=e2-hill-mine --seed=e2-hill-mine-01 --policy=idle
```

…runs a **full contract and emits a view. No mode was supplied and it did not throw.** `public/skill.md`'s public door fence lists all three again, and `skillmd-guard` is **green** — because it asserts skill.md *agrees with* `SUPPORTED_CONTRACTS`, so when both surfaces move together it is structurally incapable of seeing a policy reversal.

⚖️ **THIS IS NOT A REVERT OF AP-16-4, AND YOU MUST NOT TREAT IT AS ONE.** The re-admission also contradicts **AP-16-4's own ratified law**, which is why the repair is law-restoring rather than law-bending. `specs/agent-play/ap-16-same-game-law.md:33` states, verbatim:

> **Mode-declaring contracts (escort etc.) admit through their declared mode.**

✓ **Measured s1660: exactly 4 of 42 contracts declare `modes`** — `e2-hill-mine`, `e2-trestle`, `e2-incline` (all `[escort]`) and `e3-canyon-works` (`[escort]`). The shipped gate is:

```js
if (!SUPPORTED_CONTRACTS.has(this.contractId) && !mode && boot.admissionProbe !== true) { throw … }
```

Membership in `SUPPORTED_CONTRACTS` therefore makes the mode arm **irrelevant** — the three now admit with **no mode at all**, which is a strictly wider door than the law's own sentence describes. Before `48a0d41ab` they admitted *only* through their declared mode, which is exactly what the law prescribes. **The de-list was the mechanism implementing the law's mode clause, and removing it broke both the owner's ruling and the slice's own spec in one omission.**

🔑 **THE ROOT, NAMED SO YOU DO NOT REPEAT IT.** The AP-16-4 master's baseline arithmetic said *"Today's admitted 12 = the 9 ids in the `SUPPORTED_CONTRACTS` literal + the 3 escort-mode railcars … which enter through `boot.mode`"* — it counted the mode path as **admission**, so the three never appeared in its own list of five ALREADY-RULED refusals that must not be admitted, and its measurement pass never attempted them. **They were admitted by omission, never by measurement** (the review's own table lists the 10 measured candidates; the railcars are not among them). The prior policy lived in a **code comment inside the literal** — *"The three E2 railcar contracts stay out under the F-E2S-3 owner ruling…"* — and a comment does not survive a derivation. That is the whole lesson: **a policy encoded as a comment evaporates when its data structure is derived.**

⚠️ **AND THE HARM IS REAL, NOT BOOKKEEPING.** F-E2S-3's proof is that `e2-hill-mine` is **unsecurable headless by construction** — the board sells no weapon that touches the railcar; s1605 measured an idle rider surviving **18/18 waves to the ceiling exactly**, `endReason: wave-ceiling`, *because* of that defect. `public/skill.md` is the **public door doc for BYO agents**. Today it advertises three contracts to strangers that a modeless headless rider cannot win.

---

## Scope

0. **Reproduce the defect first, and record it.** Run the `gr-sim` command above and paste its verdict (does the door admit `e2-hill-mine` with no mode?) into your report. If it *throws* the `AP-07 supports only` error, the defect is already cured — **STOP and report that**, changing nothing. Everything below assumes it admits.

1. **Restore the three as CITED EXEMPTIONS** in `CONTRACT_ADMISSION_EXEMPTIONS` (`src/sim/HeadlessContractSim.ts`), in the table's existing shape and its existing sort position. Each entry carries `reason` + `citation`, matching the E5/E6 entries' voice. The citation is **`F-E2S-3`**. The reason must state the measured fact, not the policy — the E5/E6 entries say *"Measured … run did not reach a lawful terminal"*, and this is the same criterion: a modeless idle run reaches the wave ceiling without a lawful terminal because no weapon reaches the railcar. **Do not write "the owner said so" as the reason** — the ruling is the citation, the mechanism is the reason.
   🚫 **Do NOT touch the constructor gate at `boot.admissionProbe !== true`.** The escort-mode arm is what keeps these contracts lawfully reachable **through their declared mode**, per the law. After your change they must still admit **with** `--mode=escort` and refuse **without** it. Both directions are acceptance criteria (item 5).

2. **Restore the `e2e/er01-e2-census.spec.ts` refusal arms** that `48a0d41ab` inverted. It replaced `expect(() => new HeadlessContractSim({…})).toThrow(/AP-07 supports only/)` with an admission assertion; put the refusal assertion back for the three de-listed contracts, preserving the file's current structure and its zero-console assertion. **`e2-pressure-garden` stays admitted and its arm must not change** — it declares no modes and was never de-listed.

3. **Update the guarded `public/skill.md` door-contracts fence** to the new derived list, editing **inside** the `<!-- skillmd-guard:door-contracts:start -->` / `:end` markers only, preserving sorted order and formatting. Expect the list to drop from 22 to 19 ids.

4. **Regenerate the audit report**: `node scripts/same-game-audit.mjs`, and commit `docs/bench/same-game-audit.md`. The three move from admitted to exempted; report the before/after class-5 counts. **If the regenerated numbers disagree with that expectation, report the disagreement rather than tuning to match it.**

5. **Prove BOTH directions of the mode rule in `e2e/ap16-4-contract-admission.spec.ts`** — this is the assertion whose absence let the reversal through. For every contract that **declares a mode**, assert the door **refuses it modelessly** and **admits it with its declared mode**. Derive the mode-declaring set from the registry, never a hardcoded list of three, so the spec cannot rot when a fifth mode-declaring contract appears. ⚠️ **`e3-canyon-works` declares `[escort]` and is LAWFULLY admitted modelessly today** (it predates this affair and s1605 measured it 3/3 under idle against a ceiling of 20) — so it is a **cited exception to your own new assertion**, not a contract to de-list. Encode it as one named, commented exception. **De-listing `e3-canyon-works` is out of scope and is a STOP-and-report if you think it is warranted.**

6. **Ratchet the door so the next derivation cannot drop a ruling silently.** Add `scripts/door-admission-baseline.json` — the sorted derived door list — and a guard that reds when the live derived door differs from it, with a remedy line telling the reader: *if you are ADMITTING a contract, add it to the baseline and cite the measurement that admitted it; if you are REMOVING one, add a cited exemption.*
   🔑 **WHY A BASELINE AND NOT A LOOP OVER THE EXEMPTION TABLE — read this before you "simplify" it.** A guard that iterates `CONTRACT_ADMISSION_EXEMPTIONS` and asserts each entry is refused **cannot detect a deletion from that table**: remove the entry and the loop simply stops checking it. Its denominator moves with the defect, which is the exact class that produced this bug (and F-1536-1 / F-1658-2 / F-1659-2 before it). The baseline's denominator is **fixed in a file the defect does not touch**, which is why it is the instrument here. **Do not replace it with a table-driven loop.**
   **PROVE IT BITES by manufacturing the defect**: delete one of your three new exemption entries, watch the ratchet go **RED**, revert byte-identical, watch it go **GREEN**. The red-then-green transcript is mandatory and goes in your report.
   **Root the new script** (it matches `(guard|assert|check|audit|contract|ratchet)`): add it to the `test:node-guards` list in `package.json`, and run `node scripts/gate-caller-audit.mjs --include-untracked` before you finish (F-1576-1 — the runner commits last, so its own battery cannot see the file it just wrote).

7. **Report, do not act, on the second half.** F-E2S-3's socket ("the era-true pressure-to-damage socket") is still owed and is **out of scope** — it needs its census-stream slice specced first, per the owner's own gate. Do not build it, do not stub it. If your work surfaces anything about it, that is a finding for your report.

If you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

## Firewall

**Touch ONLY:** `src/sim/HeadlessContractSim.ts` (**the `CONTRACT_ADMISSION_EXEMPTIONS` table ONLY** — not the constructor gate, not the derivation filters) · `e2e/er01-e2-census.spec.ts` (the three inverted arms only) · `e2e/ap16-4-contract-admission.spec.ts` (add the mode assertions) · `public/skill.md` (**inside the `door-contracts` fence only**) · `docs/bench/same-game-audit.md` (regenerated, not hand-edited) · `scripts/door-admission-baseline.json` (new) · your new ratchet script under `scripts/` (new) · `package.json` (**the `test:node-guards` script list ONLY**, to root the new guard).

**NO changes to:** `assets/contracts/**` — **the contract bundles are DATA; admission is a door question and editing a manifest to change admission is the "stretch the vocabulary" failure (Mistake #14)** · the constructor gate `!SUPPORTED_CONTRACTS.has(…) && !mode && boot.admissionProbe !== true` · `src/meta/ContractFamilies.ts` · `scripts/same-game-audit.mjs` (you RUN it, you do not edit it) · `scripts/skillmd-guard.test.mjs` (it should stay green untouched — if it reds, that is a FINDING about your change, not a test to edit) · `scripts/gr-sim.test.mjs` pins — **a moved hash is a FINDING, never a re-pin (F-1441-3)** · any era socket or `src/systems/**` · `src/game/Game.ts` · `e2e/er01-e4-census.spec.ts` · `specs/**`, `tasks/**`, `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json` (the fire owns those).

🔓 **FIREWALL LIFT:** if item 6's ratchet needs a tiny exported accessor to read the derived door, `supportedContractIds()` **already exists and is exported** — use it rather than adding one. If your work requires touching any file **not** listed above, **STOP and report** rather than reaching.

## Self-check (all of it, before you report READY)

- `npx tsc --noEmit` clean · `npm run build` green.
- `e2e/er01-e2-census.spec.ts` and `e2e/ap16-4-contract-admission.spec.ts` — **desktop AND 390px mobile-chrome**, `--workers=1`, zero console/page errors.
- `node --test scripts/skillmd-guard.test.mjs` — green **without editing it**, including its own positive control.
- **`npm run test:node-guards` — RUN IT ALONE, nothing else in parallel** (required because the diff touches `src/sim/`: contract admission is behaviour the sim replays — F-1460-1; and it is ~3 minutes and contends with any concurrent battery — F-1537-1). Report the full tests/pass/fail/skip line. **Zero `gr-sim` hash drift is expected; any moved pin is a FINDING, not a re-pin.**
- The item 6 **red-then-green** transcript for the ratchet, and `gate-caller-audit` green.
- The item 0 and item 5 door probes quoted verbatim: `e2-hill-mine` refused modeless, admitted with `--mode=escort`.

**READY-FOR-GATES** — then report: the item 0 reproduction verdict · the before/after door counts (expect 22 → 19) · the class-5 before/after from the regenerated audit · the ratchet's red-then-green transcript · the `test:node-guards` line · anything you found about the still-owed socket half (item 7) · every file you touched and why.
