// THE ACTION-REACH PARITY GUARD (ADR-005, owner ruling 2026-09-07, verbatim: "Humans cannot
// control the positioning of the Prospector, just the rider, for the Prospector they can give
// 'policies' like repair. This has to be 1:1 the same for the AI.").
//
// `docs/bench/rider-parity-audit.md` §0 measured the real shape of the advantage: it is not one
// verb. In GR-SIM — the engine the benchmark scores — EVERY context-action reach test read
// `this.prospector.position`, where the browser reads `this.actionActor.group.position`. So a rider
// did not merely have an extra movement verb; it had an extra ARM, and the whole context-action
// family hung off a body the human cannot place.
//
// Stage 1 of `tasks/rider-parity-grammar.md` re-based those nine reads onto the hero. This guard
// keeps them there, and keeps the three DELIBERATE Prospector reads on the Prospector, because both
// halves are the law: parity means the same body doing the same job, not one body doing every job.
//
// It is a SOURCE guard rather than a behavioural one on purpose. The behavioural claim ("a rider
// reaches a stake by walking the hero") is already proved by the tapes whose hashes moved and is
// re-proved on every board re-ride; what rots silently is a reach test quietly moving back to the
// convenient body during an unrelated slice, which is exactly what a citation guard catches on the
// day it happens. Every needle below is matched against the file, and a manufactured defect proves
// the guard bites.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (relative) => readFileSync(process.env.RIDER_PARITY_SIM_PATH && relative.endsWith('HeadlessContractSim.ts')
  ? process.env.RIDER_PARITY_SIM_PATH
  : path.resolve(ROOT, relative), 'utf8');

const SIM = 'src/sim/HeadlessContractSim.ts';
const GAME = 'src/game/Game.ts';

/**
 * The nine ACTION reach sites named by the audit (§3a change 2), each as the exact call that
 * performs the reach. A coordinate would rot on the next slice; the call does not.
 */
const HERO_REACHES = [
  ['capture', "capture: () => this.atomic?.capture(this.hero.group.position)"],
  ['contextAction upgrade', 'this.build.upgradeBuilding(id, index, this.timeAlive, this.hero.group.position)'],
  ['contextAction demolish', 'this.build.demolish(id, index, this.timeAlive, this.hero.group.position)'],
  ['stokeVent', 'this.preserveVent.tryStoke(this.hero.group.position,'],
  ['recoverProbe', 'this.probeRecovery.recover(this.hero.group.position)'],
  ['plantSeedVault', 'this.seedCaravan.tryPlant(this.hero.group.position)'],
  ['decideCanalSegment', 'this.canalChoices.decide(this.hero.group.position, choice)'],
  ['motorVerb GRADE', 'this.motor.gradeAt(this.hero.group.position, round(this.timeAlive), emit)'],
  ['motorVerb HAUL', 'this.motor.haulTo(this.hero.group.position, round(this.timeAlive), emit)'],
  ['usePlaybook interference', "this.interferenceFront.refuse('playbooks', this.hero.group.position)"],
  ['fundMegaproject x', 'Math.abs(this.hero.group.position.x - x)'],
  ['fundMegaproject z', 'Math.abs(this.hero.group.position.z - z)'],
];

/**
 * The browser's own rule, which is the SHAPE the nine above were re-based onto. If the browser ever
 * moves its context chain off the acting hero, the parity claim above becomes a claim about a
 * body that no longer acts, so it is pinned here in the same guard rather than assumed.
 */
const BROWSER_REACHES = [
  ['confirmAction chain', 'private confirmAction(confirmAllowedAtIssue = true): void {'],
  ['confirmAction capture', 'if (this.wrangle.tryCapture(this.actionActor.group.position)) return;'],
  ['confirmAction stoke', 'if (this.tryStokeVent(this.actionActor.group.position)) return;'],
  ['confirmAction plant', 'if (this.seedCaravan?.tryPlant(this.actionActor.group.position).ok) return;'],
  ['confirmAction recover', 'if (this.tryRecoverProbe(this.actionActor.group.position)) return;'],
  ['confirmAction fund', 'if (this.fundMegaprojectStage(this.actionActor.group.position)) return;'],
  ['confirmAction redig', "if (this.canalChoices?.decide(this.actionActor.group.position, 'redig').ok) return;"],
  ['confirmAction motor', 'if (this.motorGrade(this.actionActor.group.position) || this.motorHaul(this.actionActor.group.position)) return;'],
  ['confirmUpgrade backfill', "if (this.canalChoices?.decide(this.actionActor.group.position, 'demolish').ok) return true;"],
  ['upgradeBuilding', 'this.buildSystem.upgradeBuilding(id, index, this.timeAlive, this.actionActor.group.position)'],
  ['demolish', 'this.buildSystem.demolish(id, index, this.timeAlive, this.actionActor.group.position)'],
];

/**
 * The three reads the audit explicitly told this slice NOT to move (§3a change 2b). Harvest and
 * repair are Prospector chores on BOTH sides already — the human's dispatch pans at the Prospector
 * and the human's repair sweep measures from the Prospector — so re-basing them would BREAK parity
 * rather than restore it. Pinned so a later reading of "re-base the reach tests" cannot take them
 * too.
 */
const PROSPECTOR_REACHES = [
  ['panAt reach', 'Math.hypot(this.prospector.position.x - position.x, this.prospector.position.z - position.z) > Balance.goldSeam.channelRange'],
  ['repairBuilding reach', 'this.build.repairBuilding(ref.id, index, this.timeAlive, this.prospector.position)'],
  ['harvestTargets body', 'position: this.prospector.position,'],
];

test('every GR-SIM action reach test reads the hero (ADR-005 stage 1)', () => {
  const source = read(SIM);
  for (const [name, needle] of HERO_REACHES) {
    assert.equal(source.split(needle).length, 2,
      `${SIM}: the ${name} reach test must read the hero exactly once — expected ${JSON.stringify(needle)}`);
  }
});

test('the browser still acts from the acting hero, which is the shape stage 1 copied', () => {
  const source = read(GAME);
  for (const [name, needle] of BROWSER_REACHES) {
    assert.ok(source.includes(needle),
      `${GAME}: the browser's ${name} no longer reads the acting hero — expected ${JSON.stringify(needle)}`);
  }
});

test('harvest and repair stay Prospector chores on both sides (they were already 1:1)', () => {
  const source = read(SIM);
  for (const [name, needle] of PROSPECTOR_REACHES) {
    assert.ok(source.includes(needle),
      `${SIM}: ${name} must keep reading the Prospector — expected ${JSON.stringify(needle)}`);
  }
});

/**
 * The remaining `this.prospector.position` reads in the sim, enumerated. This is the test that makes
 * the guard a MEASUREMENT rather than a spot check: it counts every read and pins the count, so a
 * tenth reach test added tomorrow on the Prospector's body reds here even though nobody thought to
 * name it above. The list is the audit's own §3a 2b set plus the passive per-tick reads that are
 * not reach tests at all (construction wiring, the Prospector's own movement multiplier, the
 * pressure/motor body lists, the E8 hollow crossing, the interference-front suspension).
 */
test('the Prospector reads that remain are exactly the ones that are meant to remain', () => {
  const source = read(SIM);
  const remaining = source.split('\n')
    .map((line, index) => [index + 1, line.trim()])
    // Prose is not a read. The two comment lines that quote the phrase are the `e8-air-logical`
    // epitaph and this slice's own F-RPG-2 note, and both should survive a re-word.
    .filter(([, line]) => line.includes('this.prospector.position') && !line.startsWith('//') && !line.startsWith('*'))
    .map(([number, line]) => `${number}: ${line}`);
  assert.equal(remaining.length, 12,
    `${SIM} carries ${remaining.length} \`this.prospector.position\` code reads, not 12. `
    + 'Stage 1 left exactly twelve: three deliberate reach tests (pan, repair, harvestTargets), '
    + "seven passive wirings (the deepwater shooter, BuildSystem's construction anchor, the "
    + "deepwater actor pick, build.update, the pressure and motor body lists, the Prospector's own "
    + 'movement multiplier), the E8 hollow crossing, and the interference-front suspension. '
    + `Adding a tenth ACTION reach on this body is the thing this test exists to catch:\n${remaining.join('\n')}`);
});

test('the reach guard BITES a read moved back to the Prospector (manufactured defect)', {
  skip: process.env.RIDER_PARITY_SIM_PATH ? 'running as the manufactured-defect child' : false,
}, () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'rider-parity-reach-'));
  try {
    const drifted = path.join(dir, 'HeadlessContractSim.ts');
    const source = read(SIM);
    const [name, needle] = HERO_REACHES[4];
    assert.ok(source.includes(needle), `the control needs ${name} present to move it`);
    writeFileSync(drifted, source.replace(needle, needle.replace('this.hero.group.position', 'this.prospector.position')));
    // NODE_TEST_CONTEXT MUST BE STRIPPED — `scripts/skillmd-guard.test.mjs:137-143` measured this
    // at s1493 and it cost a vacuous control: a child that inherits the variable reports over IPC
    // to a parent that is not listening and EXITS 0 with failing assertions, so the naive control
    // is green inside `test:node-guards` for the wrong reason. Reproduced here before the strip.
    const env = { ...process.env, RIDER_PARITY_SIM_PATH: drifted };
    delete env.NODE_TEST_CONTEXT;
    const child = spawnSync(process.execPath, ['--test', fileURLToPath(import.meta.url)], {
      timeout: 240_000,
      killSignal: 'SIGKILL',
      cwd: ROOT,
      encoding: 'utf8',
      env,
    });
    assert.notEqual(child.status, 0, 'a reach test moved back to the Prospector did NOT red the guard');
    assert.match(`${child.stdout}${child.stderr}`, /every GR-SIM action reach test reads the hero/,
      'the guard reddened, but not on the reach test — this control is measuring the wrong failure');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
