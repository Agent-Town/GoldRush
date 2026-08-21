import { expect, test } from '@playwright/test';
import { spawn, spawnSync } from 'node:child_process';

const HARVEST = (seam: string) => Array.from({ length: 6 }, () => ({ verb: 'HARVEST', seam }));
const HOLD = [{ verb: 'HOLD', pos: { x: 0, z: 12 } }];
const SECURING_ORDERS = [
  [
    ...HARVEST('gold-seam-2'),
    ...HARVEST('gold-seam-3'),
    ...HARVEST('gold-seam-1'),
    { verb: 'MOVE_TO', pos: { x: 0, z: 12 } },
    { verb: 'BUILD', what: 'turret', where: { x: -3, z: 8 }, when: { goldGte: 50 } },
    { verb: 'BUILD', what: 'palisade', where: { x: -3, z: 10 }, when: { goldGte: 10 } },
    { verb: 'BUILD', what: 'palisade', where: { x: 0, z: 10 }, when: { goldGte: 10 } },
    { verb: 'BUILD', what: 'palisade', where: { x: 3, z: 10 }, when: { goldGte: 10 } },
    { verb: 'BUILD', what: 'palisade', where: { x: 0, z: 14 }, when: { goldGte: 10 } },
    ...HOLD,
  ],
];
const ANSWERED_FIRST_UPGRADE_LEVEL = 2;

// This spec only spawns a Node client, so a second viewport cannot add coverage.
test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== 'desktop-chrome', 'node-only door proof is desktop-only'));

function runReactive(answerOffers: boolean) {
  return new Promise<{ status: number | null; stderr: string; transcript: any[] }>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--policy=stdin'],
      { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] },
    );
    const transcript: any[] = [];
    let buffer = '';
    let stderr = '';
    let firstView = true;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, 180_000);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        const message = JSON.parse(line);
        transcript.push(message);
        if (message.schema !== 'goldrush.view.v1') continue;
        const terminal = message.now.hero.hp <= 0 || message.appendLog.at(-1)?.outcome === 'secured';
        if (terminal) continue;
        const offer = message.now.pendingOffer?.[0];
        const orders = message.now.pendingSecure
          ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }]
          : firstView
            ? SECURING_ORDERS[0]
            : answerOffers && offer
              ? [{ verb: 'PICK_UPGRADE', id: offer.id }, ...HOLD]
              : HOLD;
        firstView = false;
        child.stdin.write(`${JSON.stringify(orders)}\n`);
      }
    });
    child.stderr.on('data', (chunk: string) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (status) => {
      clearTimeout(timeout);
      if (timedOut) reject(new Error(`gr-sim exceeded the 180s protocol timeout.\n${stderr}`));
      else resolve({ status, stderr, transcript });
    });
  });
}

function runIdle() {
  return spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--policy=idle'],
    { cwd: process.cwd(), encoding: 'utf8', timeout: 30_000 },
  );
}

test('pure stdin progression and panning secure the Claim deterministically', async () => {
  test.setTimeout(210_000);
  const run = await runReactive(true);
  expect(run.status, run.stderr).toBe(0);

  const opening = run.transcript[0];
  const waveOne = run.transcript.find((entry) => entry.schema && entry.now.wave === 1);
  const firstUpgrade = run.transcript.find((entry) => entry.schema && Object.keys(entry.now.hero.upgradesTaken).length > 0);
  const outcome = run.transcript.at(-1);

  expect(opening.now.hero).toMatchObject({ level: 1, upgradesTaken: {}, upgradeChoiceRule: 'first-offer' });
  expect(opening.almanac.nextWave).toMatchObject({
    composition: [{ id: 'claim_jumper', label: 'Claim Jumpers', count: 6 }],
    compositionScope: 'wave-horn packs only; continuous tricklers are additional',
    continuousTrickle: { includedInComposition: false, includedInDefeatedTotal: true },
  });
  expect(waveOne.now.score.goldPanned).toBe(90);
  expect(waveOne.now.works.byKind).toEqual({ palisade: 4, turret: 1 });
  expect(firstUpgrade.now.hero).toMatchObject({ level: ANSWERED_FIRST_UPGRADE_LEVEL, upgradeChoiceRule: 'first-offer' });
  expect(firstUpgrade.now.threats).toMatchObject({
    defeatedBasis: 'all enemies, including continuous tricklers',
  });
  expect(outcome).toMatchObject({
    secured: true,
    waves: 10,
    gold: 0,
    kills: 297,
    calls: 27,
    defaultedPicks: 0,
    eventLogHash: 'fnv1a32:05270638',
  });
});

test('silence defaults the first upgrade at the deadline', async () => {
  test.setTimeout(210_000);
  const run = await runReactive(false);
  expect(run.status, run.stderr).toBe(0);

  const firstUpgrade = run.transcript.find((entry) => entry.schema && Object.keys(entry.now.hero.upgradesTaken).length > 0);
  const outcome = run.transcript.at(-1);
  expect(firstUpgrade.now.hero.level).toBe(4);
  expect(firstUpgrade.now.hero.level).toBeGreaterThan(ANSWERED_FIRST_UPGRADE_LEVEL);
  expect(outcome).toMatchObject({
    secured: false,
    waves: 8,
    gold: 0,
    kills: 200,
    calls: 38,
    defaultedPicks: 6,
    eventLogHash: 'fnv1a32:bd899678',
  });
});

test('idle remains deterministic and losable after progression parity', () => {
  const first = runIdle();
  const second = runIdle();
  expect(first.status, first.stderr).toBe(0);
  expect(second.status, second.stderr).toBe(0);
  expect(second.stdout).toBe(first.stdout);

  const transcript = first.stdout.trim().split('\n').map((line) => JSON.parse(line));
  const terminalView = transcript.at(-2);
  // HeadlessContractSim.ts:767-783 defaults only after the offer deadline; this rider dies first.
  expect(terminalView.now.hero).toMatchObject({
    hp: 0,
    level: 3,
    upgradesTaken: {},
    upgradeChoiceRule: 'first-offer',
  });
  expect(terminalView.now.threats.defeatedTotal).toBeLessThan(terminalView.now.threats.spawnedTotal);
  expect(transcript.at(-1)).toMatchObject({ secured: false, waves: 2, gold: 0, calls: 0, defaultedPicks: 0 });
});
