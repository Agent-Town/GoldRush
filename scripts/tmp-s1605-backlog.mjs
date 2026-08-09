import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
// Anchor by CONTENT, not by index — this file shifted by one line mid-fire when a second
// owner rulings roundup landed, which is exactly why the index form failed once already.
const at = lines.findIndex((l) => l.includes('RELEASE ANNOUNCEMENT DEFERRED'));
if (at < 0) {
  console.error('anchor not found');
  process.exit(1);
}

const row = [
  '\u{1F527} **f1605-1 AUTHORED s1605 — the FIRST of the two masters owner ruling 2 asks for** (`tasks/f1605-1-e2s3-door-delist.md`, lane-b, leaf `f1605-1-e2s3-door-delist`).',
  'De-lists `e2-hill-mine`/`e2-trestle`/`e2-incline` from `SUPPORTED_CONTRACTS` (`src/sim/HeadlessContractSim.ts:49`, enforced `:254` as `!SUPPORTED_CONTRACTS.has(id) && !mode`, so escort callers are untouched and `e2-pressure-garden` STAYS listed),',
  'updates the guard-derived `public/skill.md` door-contracts block, retires the two `scripts/gr-sim.test.mjs` pins whose subjects leave the door, and flips three of the four `e2e/er01-e2-census.spec.ts` tests to the `er01-e4` refusal pattern.',
  '⚠️ **THE RULING’S THIRD CLAUSE IS MEASURED UNSATISFIABLE, AND THE MASTER SAYS SO RATHER THAN QUIETLY ADAPTING.**',
  'It asks to *“RE-AIM f-e2s-1’s hill-mine idle ceiling test at a still-listed subject”*, but `endReason: ‘wave-ceiling’` is emitted only when a **non-terminal** idle run reaches `max(secureWave, baron.wave) + BOSS_GRACE_WAVES` (`scripts/gr-sim.mjs:76`), i.e. the idle rider must still be ALIVE there.',
  '✓ **MEASURED, NOT ASSUMED — s1605 ran EVERY real bench seed under `--policy=idle`:** `e1-baron` reached **5/8/11/5/5** against a ceiling of **26**; `e3-canyon-works` **3/3** against **20**; `e2-hill-mine` **18/18 = its ceiling exactly**, `endReason: wave-ceiling`.',
  'Those two are the only Baron contracts left on the door after the de-list, so there is no still-listed subject to re-aim at.',
  '\u{1F511} **The pin only ever went green BECAUSE of the defect being de-listed** — an idle rider survives 18 waves on hill-mine precisely because the board sells no weapon that touches the railcar (F-E2S-3’s own proof).',
  'So it is retired with a **named cause** and left as the socket slice’s restore target: NOT re-aimed, NOT loosened, and the master explicitly forbids slipping past the door with `--mode` (era-false, games the refusal).',
  '\u{1F4E1} **Blast radius found while authoring and folded into scope rather than discovered by a red gate:** `e2e/er01-e2-census.spec.ts` generates one test per E2 contract and constructs the sim with **no mode**, so three of its four tests would have gone red;',
  'and `the E2 Baron fights keep their pinned outcomes` cannot be re-aimed at `e2-pressure-garden` either, because that contract has **no `twist.baron`** while the test asserts the Baron auto-secure path.',
  '✅ **ROUNDUP #2 CONFIRMS THIS RATHER THAN CONFLICTING WITH IT, checked before dispatch because it landed mid-authoring:** the Hill Mine railcar ruling *“Tune the fight shorter”* (F-1493-3) is a **browser-side pacing** pass whose own row states *“the map stays door-de-listed per F-E2S-3 until the socket”*. Shortening the browser fight gives the HEADLESS board no weapon, which is what F-E2S-3 measured — the two rulings compose, and that balance pass is a separate master.',
  '**GATE: de-list merged with `skillmd-guard` green (the owner’s own gate).** The SECOND master — the era-true pressure-to-damage socket — needs its census-stream slice **specced before authoring** per the same ruling, so it is NOT authorable yet.',
].join(' ');

lines.splice(at, 0, row);
fs.writeFileSync(p, lines.join('\n'));
console.log('BACKLOG row inserted at line', at + 1);
