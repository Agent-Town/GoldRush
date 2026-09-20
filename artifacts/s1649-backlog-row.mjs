import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/BACKLOG.md';
const src = readFileSync(P, 'utf8');
const lines = src.split('\n');

const row = [
  '🟡 **F-1649-1 (s1649 2026-08-11, MEASURED WHILE DECIDING WHAT TO AUTHOR INTO FOUR IDLE LANES — ',
  '**AP-16-6 IS NOT FIRE-AUTHORABLE, AND THE REASON IS THAT EVERY ONE OF ITS "OWED" VERBS HAS NO ',
  'HEADLESS SYSTEM TO ATTACH TO.** ATTENDED-OWED, NOT OWNER-GATED — the same shape as F-1641-3, filed ',
  'so the next fire does not spend its budget re-deriving it.)** ',
  'With `ap16-5b` merged, AP-16-6 is the last AP-16 rung and every recent handoff names it as ',
  'authorable — s1646\'s (A) called it *"genuinely authorable"* and s1645\'s (B) *"the last AP-16 rung"*, ',
  'both with the sound instruction to **scope it to ONE verb per master**. I went to do exactly that ',
  'and the premise did not survive the first probe. ',
  '✗ **The spec slice (`specs/agent-play/ap-16-same-game-law.md:35`) classifies five verbs as OWED — ',
  '`TOGGLE_WEAPON` · `RESEARCH_PICK` · `SECURE_CHOICE` · `DEATH_ACTION` · `CONTEXT_ACTION` — and ',
  'closes with *"Each verb: same rules, same costs, additive hashes."* **That closing promise is ',
  'measurably false for all five**, because the systems they would drive do not exist headless.** ',
  '🔬 **MEASURED, file by file, not inferred from the audit table:** ',
  '**(1) `TOGGLE_WEAPON`** — `weaponToggle` is consumed in exactly ONE place in the whole tree, ',
  '`src/game/Game.ts:2473` (`if (intents.weaponToggle) this.toggleWeapon()`), which is the BROWSER ',
  'game. In the sim it is an **inert struct member**: `src/sim/HeadlessContractSim.ts:186` initialises ',
  '`weaponToggle: false` and **nothing ever reads it**, while the outcome ledger at `:972` reports ',
  '`weaponToggles: 0` as a **hardcoded literal**. There is no headless weapon state to toggle. ',
  '**(2) `RESEARCH_PICK` / `SECURE_CHOICE` / `DEATH_ACTION`** — `grep` for `research`, `secureChoice`, ',
  '`deathAction` and `secure_choice` over `src/sim/HeadlessContractSim.ts` returns **zero hits each**, ',
  'and the sim\'s 36 imports compose no research, secure-choice or death-action system (the single ',
  '`esearch` hit anywhere under `src/sim/` is `E9ArsenalSocket.ts`, an unrelated arsenal surface). ',
  '⚖️ **WHY THAT MAKES IT NON-AUTHORABLE RATHER THAN MERELY BIGGER:** adding any of these verbs means ',
  '**porting a system into the sim**, which changes what the sim DOES — hero attack resolution for the ',
  'weapon, run-end agency for secure/death — and therefore **moves event-log hashes**, contradicting ',
  'the slice\'s own additive promise and every "additive, default preserves every existing hash" ',
  'assertion AP-16-4/5 landed on. That is a design decision about sim behaviour, which `fire.md` §2E\'s ',
  'HARD LIMIT reserves (*"if the lane\'s next work has no spec slice, needs a design fork, or bends ',
  'canon, do NOT author"*). The slice EXISTS, so this is not the F-1641-3 missing-slice case exactly — ',
  'it is the subtler one: **a slice whose stated premise its own implementation surface refutes.** ',
  '🔎 **AND A SHARPER QUESTION FELL OUT OF THE SAME PROBE, WHICH IS THE HALF WORTH THE ATTENDED ',
  'SESSION\'S MINUTE:** the audit files `weapon_toggle` as **agent-lacks on all 42 contracts** ',
  '(`docs/bench/same-game-audit.md:90` and 41 siblings), but AP-16-3 already gave agents `BLAST_AT` — ',
  'a **direct** verb reaching the blast pool at `HeadlessContractSim.ts:1305`. So the two species now ',
  'reach the blast charge by **different mechanisms**: the human toggles the active weapon (`rig` ↔ ',
  '`blast`, `src/ui/Hud.ts:260`) and presumably surrenders Spark Rig output while holding it, whereas ',
  'the agent calls `BLAST_AT` and **keeps firing the rig**. ⚠️ **If that reading is right, the agent ',
  'does not LACK the toggle — it EXCEEDS the human by never paying the toggle\'s opportunity cost**, ',
  'which is the same-game law\'s rule 3 violated in the direction the audit is not looking. I did ',
  '**not** verify the opportunity cost (it lives in `Game.ts`\'s attack path, outside what this probe ',
  'read), so this is stated as the question it is, not as a finding. ',
  '**GATE: ATTENDED — re-slice AP-16-6 against its real implementation surface.** The three live ',
  'options, none of which a fire may pick: **(a)** port the systems and accept an era re-stamp for the ',
  'hash movement; **(b)** rule the five verbs EXEMPT-with-cited-reason as browser-input artifacts with ',
  'no headless referent, which is the *"exemption is a debt, not a policy"* path AP-16-4 already ',
  'established; **(c)** decide the `BLAST_AT`-vs-toggle equivalence question above first, since a ruling ',
  'that agents already have ability parity may retire `TOGGLE_WEAPON` outright. ',
  'ⓘ **No goal leaf exists for AP-16-6** (`drain-block-check ap16-6` → UNKNOWN, and a `goals.json` walk ',
  'for `ap16-6` returns `[]`), so nothing on the board is left stale by not authoring it.',
].join('');

// Insert as its own declaring row after the F-1642-1 block (line 4, 1-indexed), keeping the
// 🔺 owner-desk cluster at the top intact and the 🟡 attended-owed rows below it.
const idx = lines.findIndex((l) => l.startsWith('🔵 **F-1648-2'));
if (idx < 0) { console.error('REFUSE: anchor row F-1648-2 not found'); process.exit(2); }
lines.splice(idx, 0, row, '');
writeFileSync(P, lines.join('\n'));
console.log(`OK inserted F-1649-1 declaring row at line ${idx + 1}`);
