#!/usr/bin/env node
// s1260 — the gr-sim drain line + F-1260-3/-4/-5, inserted at the newest-findings anchor.
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/BACKLOG.md';
const lines = readFileSync(path, 'utf8').split('\n');
const anchorIdx = lines.findIndex((l) => l.startsWith('⛔ **STOPPED (s1260)'));
if (anchorIdx < 0) throw new Error('anchor not found — refusing to guess placement');

const DRAINED =
  '✅ **DRAINED (s1260) — `lane-gr-sim` MERGED `d705cf9c8a38d22347f870be06e96faea60681b0`: AP-07\'s prerequisite is real — the sim now runs BLIND, and §4.6 finally cashes in.** ' +
  '(review `reviews/gr-sim.md`, leaf **`ap-07-gr-sim`** → `merged`.) `scripts/gr-sim.mjs` boots `src/sim/HeadlessContractSim.ts` (new, 475 lines) through `vite.ssrLoadModule` — no `WebGLRenderer`, no DOM ownership — steps the production sim at a fixed 1/30 s timestep, emits `goldrush.view.v1` NDJSON per wave boundary + surprise, reads standing orders one JSON per line on stdin, and exits with `{secured,waves,timeMs,gold,kills,calls,eventLogHash}`. `--policy=idle` runs orderless. **It FAILS CLOSED for any contract but `e1-dry-gulch`** — adding another requires that contract\'s real objective driver, which is the correct refusal rather than a fabricated one. ' +
  '**Not owner-gated, and that was verified against the spec\'s own gate line rather than assumed** (`specs/agent-play/README.md:70`: *"package publication to the Environments Hub is OWNER-GATED … GR-SIM itself is engine work, buildable now"*) — this slice published nothing. It also discharges the spec\'s ASYNC LAW at `:74` (line-delimited JSON both directions) instead of deferring it. ' +
  '**EVERY GATE RE-MEASURED ON MERGED MAIN, NONE INHERITED:** the master\'s scope-4 determinism gate is **byte-identical** across two runs — 7 lines / 13,678 bytes / `sha256 63f42fac…129f5`, **reproducing the lane\'s hash on a different tree** · tsc 0 · build 1.23 s · **node-guards 159/159 over 29 files, DERIVED** (s1259\'s 158/28 + this slice\'s 1; the lane\'s own 157 differs by exactly the 2 `findings-state-guard` tests main added, which independently confirms my `package.json` union graft) · core trio `m1-01`/`m2-01`/`m3-01` **30/30** desktop+mobile · release suite **26/26 at DEFAULT workers** (the loaded arm, stronger than the lane\'s `--workers=1`) · boot probe **12/12**, zero console. ' +
  '**Firewall PASS:** 12 files, **+695/−1**, zero `Balance`, zero `e2e/`, zero gameplay logic; `StandingOrders.ts` +4 is a pure delegating accessor onto the **pre-existing** `snapshot()` at `:172`, so no Orders-schema byte moved; and the five render seams are all `typeof document === \'undefined\'` early returns, hence **unreachable in a browser — browser identity proved by inspection, not merely by suite greens.**';

const F3 =
  '🔺 **F-1260-3 (s1260, BOOKKEEPING — repaired in the drain commit; the residue is an attended call) — `lane-gr-sim` SHIPPED WITH NO GOAL LEAF, AND THE `ap-*` NUMBERING IN `tasks/goals.json` CONTRADICTS ITS OWN SPEC.** ' +
  '`node scripts/drain-block-check.mjs 20260730-135054-lane-gr-sim.md` returned **`? UNKNOWN`** — no leaf matched — which the §3.0 law defines as a bookkeeping finding and **explicitly not a clearance**, so I settled gating by reading the spec instead. ' +
  '✓ **And the obvious id was already taken, one off:** the tree carries **`ap-07-county-standings`** (`merged`) while the spec numbers county standings **AP-06** (`specs/agent-play/README.md:45`) and reserves **AP-07** for THE PRIME BRIDGE (`:64`); `ap-06-standing-orders` already occupies AP-06. **The county-standings leaf\'s own title even cites "§AP-06" while its id says `ap-07`** — the collision is self-documenting. That is precisely why the real AP-07 work had nowhere to register. ' +
  'Registered as a distinct **`ap-07-gr-sim`** to avoid deepening it. ➡️ **DELIBERATELY NOT DONE: renumbering the existing merged leaves.** Retitling shipped leaves is a ledger decision, not a drive-by — it belongs to an attended pass, and it is cosmetic until someone tries to register AP-08+ against the spec.';

const F4 =
  '🔻 **F-1260-4 (s1260, informational — worth preserving because it is the house reflex working inside a RUN).** `artifacts/gr-sim/ap-07/report.md:58-62` records that an independent review of the run\'s **first draft** caught "fake cross-contract objective handling, duplicated building simulation, incomplete thief/wrecker contexts, and an unregistered regression test", and that the final version fails closed to Dry Gulch, reuses the production `BuildSystem`, and registers its check in `test:node-guards`. ' +
  '✓ Spot-verified both: the fail-closed behaviour is real, and `scripts/gr-sim.test.mjs` is in `test:node-guards` (it is 1 of my derived 159). **A run that reports its own rejected draft is doing the factory\'s work for it** — Mistake #14\'s reject-don\'t-stretch, applied by the implementer to itself. No action; cited so the next AP master can ask for the same.';

const F5 =
  '🔻 **F-1260-5 (s1260, MEASURED — for whoever writes the next AP rung: this master shipped a self-check the board CANNOT satisfy).** `tasks/lane-gr-sim.md:14` asks for "FULL adjacent suites unmodified-green … run the m1/m2/m3 core set" and the run duly ran the exhaustive board: **205/222, with 17 reds.** ' +
  '✓ Those reds are pre-existing, confirmed **two independent ways** — `grep -rn HeadlessContractSim src e2e scripts` returns only its own definition plus the two lines in `scripts/gr-sim.mjs`, so the new sim has **zero `src/` and zero `e2e/` importers** and cannot red a browser test; and `logs/suite-red-inventory.md` already names **all eight** families (`m1-06`×29, `m2-07b`×11, `m2-06`×11, `m2-07`/`m2-03`/`m1-03`×7, `m2-05b`/`m2-04`×2). ' +
  '➡️ **THE RULE: an exhaustive-board green is not an authorable gate while eight families sit in the red inventory.** Future AP masters should name the core trio + release suite as the gate and cite the inventory for the remainder — otherwise every AP slice inherits an unmeetable self-check and burns a run proving the same 17 reds again.';

lines.splice(anchorIdx, 0, DRAINED, '', F3, '', F4, '', F5, '');
writeFileSync(path, lines.join('\n'));
console.log(`inserted drain + 3 findings before L${anchorIdx + 1}; file now ${lines.length} lines`);
