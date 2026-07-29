CODEX: model=gpt-5.6-sol effort=xhigh
# e2-rail-tough-only-bind — bind the ONE E2 sheet whose rows are settled, and prove the repaired row before you trust it
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
**FIRE-AUTHORED (attended review welcome)** — authored s1221 from `reviews/eight-winds-wiring-spec.md` (the code slice's READ-FIRST, gate released at BACKLOG:1643 verbatim *"EIGHT-WINDS-WIRING is now FIRE-AUTHORABLE (art + spec on main)"*) plus the four shipped rungs of its evidence chain. **Every number below was measured by the authoring fire on today's main, not inherited from a handoff** — the control script is committed alongside this master.

WHY: slice 3 (`reviews/eight-winds-wiring-e2-enemies.md`, `fe3ae8cb`) tried to bind **all three** E2 enemy sheets and **STOPPED**, correctly, because their row→heading mapping was not established. F-1188-2 wrote the rule this task obeys:

> **Do not art-correct Coal Thief alone and re-queue.** The row-order premise must be established for **all three** sheets first, by an instrument that can actually see heading. A wrong mapping ships silently — the master says so, and that is precisely why this slice stopped.

Since then the ladder settled **one** of the three. `f61843c0` (`reviews/eight-winds-e2-row-repairs.md`) shipped as an explicit **PARTIAL — 2 rows landed, 2 rows parked**: Rail Tough row 1 and Steam Wrecker row 2 landed; **Coal Thief row 0 and Steam Wrecker row 1 remain wrong on main** (F-1193-3, still open). ➡️ **So the three-sheet slice stays blocked and this task does not touch it.** What *is* newly possible is the single sheet whose four rows have all been addressed: **Rail Tough, and Rail Tough only.**

---

## THE MEASURED PREMISE — and the two findings that make this task's scope-1 gate mandatory

### F-1221-1 — the committed instrument is RED on main, and its `probe-results.json` provenance is VOID

`logs/s1190-rail-tough-wrench-probe.mjs` is the hash-proven instrument that settled rows 2/3 (s1191, `8b9e8af2`). **Run it on main today and it throws before writing anything:**

```
Error: Mirror-floor control drifted: 0.4585250692698196     (line 246 pins '0.452')
```

The authoring fire built the decisive control — **the same instrument, one argv parameter for the sheet path, assertions truncated** (`logs/s1221-rail-tough-row1-repair-control.mjs`, committed with this master) — and ran it against the pre-batch sheet (`git show f61843c0^:assets/raw/char-railtough-sheet-walkdiag4-a.png`) and today's:

| | pre-batch (`f61843c0^`) | today (repaired) |
|---|---|---|
| `mirrorFloor` (mean self-mirror IoU, all 16 frames) | **0.45249519682907424** | **0.4585250692698196** |
| row 0 wrench offsets | −69.5 −63.5 −52.8 −56.5 | **identical, to the last digit** |
| **row 1** wrench offsets | −62.4 −45.5 −56.7 −52.7 | **−41.4 −52.2 −54.6 −47.1 — MOVED** |
| row 2 wrench offsets | 52.6 59.8 46.4 53.7 | **identical** |
| row 3 wrench offsets | 59.3 64.5 58.3 61.2 | **identical** |

➡️ **The drift is caused by row 1 and by nothing else** — the instrument is not decaying, the art moved under a pinned constant. Two consequences you must carry: (a) the byte-identity provenance s1191 published for `artifacts/eight-winds-rail-tough/probe-results.json` **cannot be reproduced on today's tree**, so do not cite it; (b) the probe's row-1 **landmarks are hand-checked coordinates measured on pixels that no longer exist** (`landmarks.diagonal[1]`, `:22`) — they happen to still land on the wrench (all four offsets stayed negative) but that is a fact you must re-verify from the overlay, not assume.

### F-1221-2 — the spec's ordering safety-net does NOT exist on the path this slice uses

`reviews/eight-winds-wiring-spec.md` §4 warns that wiring before extracting makes a block *"fail that test as a whole and silently fall back to `walk4`"*. **That protection is `walk8`-only.** Read `src/assets/SpriteAnimator.ts:979-984`:

```ts
const walk8 = slot?.walk8;
if (walkSheetEnabled(walk8) && walkSheetHasProcessedCells(walk8)) return walk8;   // ← the check
const walk4 = slot?.walk4;
return walk4 && walk4.status !== 'RUNTIME-DORMANT' && walk4.enabled !== false ? walk4 : null;  // ← NO check
```

The E2 slots have **no `walk8` block at all** (verified: `assets/layer-contracts/characters.v2.json:196-211` — `char.e2.rail_tough` carries only `walk4`). So diagonals added here get **no** has-cells gate, and a missing cell resolves to `null` at `loadProcessedTexture:1148-1149` — **no throw, no log, no fallback: a silently absent texture for exactly those four headings.** ➡️ **Extraction MUST precede wiring, and the in-game check at scope 6 is not a formality.**

### What IS settled, and what is NOT — do not conflate these

| fact | status |
|---|---|
| rows 0,1 = front hemisphere; rows 2,3 = back | ✅ settled (wrench root screen-left vs screen-right, all 16 frames, reproduced by the authoring fire this hour) |
| rows 2/3 are a lawful mirror pair, not a duplicate | ✅ settled by s1191's decisive masked experiment (`8b9e8af2`) — 2v3 flips +0.250 → −0.127, one-sided, 9/9 sensitivity |
| **which** of rows 2/3 is `nw` and which is `ne` | ⚠️ **NOT settled by silhouette.** F-1191-1, verbatim: *"the `nw`/`ne` LABELS are one tier below the PAIR — the masking that settles the pair is what removes the information distinguishing the labels."* The surviving evidence is the **body** read (survey: row 2 head/boots screen-left, row 3 screen-right), which s1191 left unopposed once the wrench confound was removed. **Treat it as a hypothesis to confirm, not a fact.** |
| **rows 0/1 are a lawful `sw`/`se` pair** | ❌ **NOT MEASURED SINCE THE REPAIR — THIS IS THE WHOLE POINT OF SCOPE 1.** F-1188-2 measured `0v1` as **direct**-dominant **+0.119** (i.e. the two front rows read as the *same* heading) — the defect the art batch was meant to cure by regenerating row 1. **The batch's review contains no post-repair heading measurement of Rail Tough at all**: its pixel gates are Steam Wrecker cyan clusters and 12-row byte-exactness; row 1 appears only as *"it moved"*. The wrench control that DOES still pass is a **front/back** tell and carries no east/west information. |

---

READ-FIRST: `reviews/eight-winds-wiring-spec.md` — **all of it**, especially §2.2 (the 1252×1252 / 4×4 / cell-313 convention and the **do-not-fix-the-dimension** rule), §3.1 (the two binding surfaces; the `aliases` override), §4.1 (extraction, the pinned-scale rule), §6 (the anti-mirror law), §7 (the wiring gate) · `reviews/eight-winds-wiring-e2-enemies.md` (the STOP you are NOT reversing, and F-1188-2) · `reviews/eight-winds-rail-tough-row-settle.md` + `logs/s1190-rail-tough-wrench-probe.mjs` (the instrument — **reuse it, do not write a third one**) · `reviews/eight-winds-e2-row-repairs.md` (what landed, what parked, F-1193-3) · `assets/layer-contracts/characters.v2.json:196-211` (THE SUBJECT SLOT) · `src/assets/SpriteAnimator.ts:979-1035` (`selectWalkSheet`, `walkSheetHasProcessedCells`, `expandWalkSheetSources`) and `:843` (the hero-only alias guard).

PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob in this worktree must be reachable in git, else STOP and report. The lane was verified a **SAFE DUPE** at authoring time (`git diff --diff-filter=A main..lane/m3` **EMPTY**; its 2 commits are the already-shipped `94dd863b` + `b5be7ab3`) — **re-verify that yourself before you reset.**

## SCOPE

1. **THE GATE, AND IT CAN CANCEL THIS ENTIRE TASK. Do this first and do not proceed on a maybe.**
   Establish whether **rows 0/1 of the repaired sheet are a lawful `sw`/`se` mirror pair**, using s1190's instrument and s1191's method — the masked comparison, calibrated against the subject's own mirror floor, with the prop confound removed the way s1191 removed it for 2v3.
   - **Validate the instrument on a known-good case before you aim it at the disputed one** — that is this ladder's binding doctrine and it has caught two reports already (F-1188-2, F-1189-2). The settled 2v3 pair is your positive control: your pipeline must reproduce mirror-dominance there.
   - **Re-derive row 1's wrench landmarks from the current pixels** (F-1221-1) and ship the locator overlay as evidence that they sit on the wrench.
   - **PASS = `0v1` is mirror-dominant by a margin outside the subject's noise band** (s1188 measured that band as |Δ| ≤ ~0.09 for this subject class; state the band you used and how you derived it). **Then continue to scope 2.**
   - **FAIL or INDETERMINATE = STOP THE TASK.** Do not bind. Do not "bind three directions and leave one". Commit the measurement, the overlay, and a report naming which row still needs art, and stop. **A STOP here is a SUCCESS**, exactly as slice 3's was — the deliverable is the determination.
   - ⚠️ **The failure this gate exists to prevent is invisible:** a wrong mapping renders the character walking backwards and **no test catches it**.

2. **Repair the instrument you just used** (F-1221-1). `logs/s1190-rail-tough-wrench-probe.mjs` must run green on the current tree: re-pin `mirrorFloor` to the measured value and refresh the row-1 landmarks. **Do not weaken an assertion to make it pass** — re-pin the constant the art legitimately moved, keep every other check at its current strength, and say in your report which pins you changed and why each change is the art moving rather than the instrument drifting. Regenerate `artifacts/eight-winds-rail-tough/probe-results.json` so its provenance is true again.

3. **Extract the cells — before any contract edit** (F-1221-2). Rail Tough's diagonal sheet only:
   ```bash
   node scripts/extract-alpha.mjs --key ff00ff --grid 4x4 --scale 1 \
        assets/raw/char-railtough-sheet-walkdiag4-a.png
   ```
   `--scale 1` is **pinned from the base sheet's own `assets/processed/char-railtough-sheet-walk4-a.frames.json`** (`"scale": 1`, `"cell": 512`) — verified by the authoring fire. Letting extract-alpha auto-fit re-derives scale from the new sheet's largest bbox and **every figure resizes** (§4.1 measured +10.5%/+14.1%/+16.0% doing exactly this). Reproduce the base's own convention; `scripts/anim-pass-reextract.mjs --verify-downscale` exists to prove the replication. **16 cells, not 51** — you are extracting one sheet, and slice 3's lesson was that unbound cells are dead bundle weight in the lazy glob, so every cell you land must be referenced by scope 4.

4. **Bind the contract — `char.e2.rail_tough` ONLY, data-only, zero `src/`.** In its `walk4` block: add explicit `directions` for `sw`/`se`/`nw`/`ne` naming the extracted cells, each with `clips.walk.frames [0,1,2,3]` at the block's existing `fps` (**`clips.walk` must be given explicitly — `withWalkSheetCadence` returns early without it**), using the mapping **scope 1 established**.
   ⚠️ **THE TRAP THAT MAKES A CORRECT EDIT DO NOTHING.** That block today carries `"aliases": { "se": "e", "ne": "e", "sw": "w", "nw": "w" }`. Per §3.1 the alias loop runs **after** the explicit one and `SpriteAnimator.ts:843` skips an alias only for `charHero` — **so for this slot the aliases OVERWRITE your new directions.** They must be **emptied for this slot**, not merely shadowed. **Do NOT take §3.1's alternative** (widening the `:843` guard): that is a one-line `src/` change affecting **every** slot in the contract, and it would silently activate any other slot's half-built diagonals. Emptying this one slot's alias map is the surgical, reversible move — take it, and say so in your report.
   **Do not touch `char.e2.steam_wrecker` or `char.e2.coal_thief`** — both still carry a wrong row (F-1193-3) and binding either would ship the exact defect slice 3 stopped to prevent.

5. **A GUARD, because this is data and data rots silently.** Extend the node-guard set so that for **every** contract slot: any direction named in a `directions` map has all its referenced cell files present under `assets/processed/`, **and** no direction key appears in both `directions` and `aliases` of the same block. The second half is F-1221-2's lesson made permanent — it is the check that would have caught a bind that renders nothing. Wire it into `npm run test:node-guards`. **Mutate it both ways to prove it has teeth** (remove a cell → red; re-add a `sw` alias next to an explicit `sw` → red) and report both mutations.

6. **PROVE IT IN A PLAIN BOOT — Mistake #10, and here it genuinely applies.** Every predecessor on this ladder answered *"nowhere yet, by design"*; **this slice is the one that changes that.** Add an e2e (no `?debug`) that puts a Rail Tough on screen walking a diagonal heading and asserts it renders the **diagonal** cells rather than the aliased cardinal ones — assert on the resolved sheet/cell identity, not on a screenshot. Capture desktop + 390px screenshots into `reviews/shots-e2-rail-tough-only-bind/`. **If you cannot reach a Rail Tough in a plain boot at all, say so plainly and report how it is reached instead** — do not invent a debug door to make the test pass.

TOUCH-ONLY: `assets/layer-contracts/characters.v2.json` (**the `char.e2.rail_tough` slot only**) · `assets/processed/char-railtough-sheet-walkdiag4-a-*.png` + its `.frames.json` (new) · `logs/s1190-rail-tough-wrench-probe.mjs` (scope 2 re-pin only) · `artifacts/eight-winds-rail-tough/**` · one new/extended node guard + its `package.json` registration · one new e2e + `reviews/shots-e2-rail-tough-only-bind/`.
NO: **the `char.e2.steam_wrecker` and `char.e2.coal_thief` slots** (F-1193-3 — automatic reject) · **any `src/` file**, including the `SpriteAnimator.ts:843` guard widening (scope 4 — that is a contract-wide behaviour change, not this slice) · `assets/raw/**` (you are measuring and extracting art, not regenerating it — an art repair is an ART-slot batch) · the three-sheet master `tasks/lane-c-eight-winds-wiring-e2-enemies.md` or its `stopped` leaf (it stays stopped; this task does not reverse it) · the town plaza surface (§3.2 — that one needs `src/` and is a different slice) · `src/agent/**` (owner-gated by F-1219-1) · `functions/api/standings.ts` + `assets/contracts/**` (lane-b is live on LB-03 this hour) · `e2e/ap-standing-orders.spec.ts` (lane-d is curing it live this hour) · Economy · CombatSystem · Balance · `playwright.config.ts`.

SELF-CHECK: `npm run test:node-guards` **FIRST** — baseline on main at authoring time was **74/74 pass, 0 fail, rc 0** (measured this hour); expect **74 + your new guard's tests**, and **state the literal count** · `npx tsc --noEmit` clean · `npm run build` green, asset-diet green (**report the bundle delta from 16 new cells** — the lazy glob emits every file, and slice 3 removed 51 cells for exactly this reason) · `node logs/s1190-rail-tough-wrench-probe.mjs` **rc 0** (scope 2) · `npx playwright test --list` (baseline **344 files**; the count moves by your new tests × 2 projects — **state both numbers**) · your new e2e both projects · adjacent: any spec referencing `char-railtough` or the characters contract, both projects · plain boot desktop + 390px, **zero console/page errors**, screenshots to `reviews/shots-e2-rail-tough-only-bind/`.

⚠️ **`--workers=N` DOES NOT DO WHAT YOU THINK ON A SINGLE FILE (F-1217-2).** `playwright.config.ts` sets no `fullyParallel` and no `workers`; one spec × two projects tops out at **2 workers** whatever you pass. **Always quote the literal `Running X tests using M workers` line**, never the flag.

🔴 KNOWN REDS — NOT yours, do not "fix" them (automatic reject):
  - `locked-win.spec.ts:65` and `tl-01-run-telemetry.spec.ts:229` — **100% deterministic at every worker count** (F-1218-3). Report if seen; never chase.
  - `m4-06-embodiment.spec.ts:395` — known ~45% flake (F-1212-2). Re-measure as a rate before blaming yourself.
  - ✅ `ap-standing-orders.spec.ts` — **CURED s1222 (`a0aae876`, test-only). NO LONGER A KNOWN RED: a failure here is a real regression, report it.** The old *"25% mobile-only at w4"* was a low-load SAMPLE, not a property (F-1222-3, refined by F-1223-1): pre-cure it failed in **both** projects at a load-dependent rate — 12.5% quiet (s1216), **50%/50% at loadavg ~15** (s1223), **100%/100% at loadavg ~25** (s1222). Post-cure **64/64 green** across two fires, at loadavg up to 29.

READY-FOR-GATES + report: **scope 1's verdict FIRST and in plain words — PASS or STOP** — with the `0v1` direct/mirrored figures, the noise band you used and how you derived it, your positive-control result on 2v3, and the locator overlay proving the row-1 landmarks sit on the wrench · which row→heading mapping you bound and **what evidence fixed `nw` vs `ne`** (F-1191-1 says silhouette cannot) · the scope-2 re-pins, each classified art-moved vs instrument-drifted · the scope-5 mutation proofs, both directions · the bundle delta · the literal guard count and `--list` numbers · and the answer to **"where does the PLAYER see this, in a plain boot?"** in one sentence. If scope 1 stopped you: **that is the deliverable, ship it and stop** — and name which row needs art and what the ART batch must change.
