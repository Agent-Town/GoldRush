import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';

const HARVEST = (seam: string) => Array.from({ length: 6 }, () => ({ verb: 'HARVEST', seam }));
const HOLD = [{ verb: 'HOLD', pos: { x: 0, z: 12 } }];
const SECURING_ORDERS = [
  [
    ...HARVEST('gold-seam-1'),
    ...HARVEST('gold-seam-2'),
    ...HARVEST('gold-seam-3'),
    { verb: 'BUILD', what: 'turret', where: { x: -3, z: 8 }, when: { goldGte: 50 } },
    { verb: 'BUILD', what: 'palisade', where: { x: -3, z: 10 }, when: { goldGte: 10 } },
    { verb: 'BUILD', what: 'palisade', where: { x: 0, z: 10 }, when: { goldGte: 10 } },
    { verb: 'BUILD', what: 'palisade', where: { x: 3, z: 10 }, when: { goldGte: 10 } },
    { verb: 'BUILD', what: 'palisade', where: { x: 0, z: 14 }, when: { goldGte: 10 } },
    ...HOLD,
  ],
  ...Array.from({ length: 12 }, () => HOLD),
];

function run(policy: 'stdin' | 'idle') {
  return spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', `--policy=${policy}`],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      input: policy === 'stdin' ? `${SECURING_ORDERS.map((orders) => JSON.stringify(orders)).join('\n')}\n` : undefined,
      timeout: 30_000,
    },
  );
}

test('pure stdin progression and panning secure the Claim deterministically', () => {
  const first = run('stdin');
  const second = run('stdin');
  expect(first.status, first.stderr).toBe(0);
  expect(second.status, second.stderr).toBe(0);
  expect(second.stdout).toBe(first.stdout);

  const transcript = first.stdout.trim().split('\n').map((line) => JSON.parse(line));
  const opening = transcript[0];
  const waveOne = transcript.find((entry) => entry.schema && entry.now.wave === 1);
  const progressed = transcript.find((entry) => entry.schema && entry.now.hero.level > 1);
  const outcome = transcript.at(-1);

  expect(opening.now.hero).toMatchObject({ level: 1, upgradesTaken: {}, upgradeChoiceRule: 'first-offer' });
  expect(opening.almanac.nextWave).toMatchObject({
    composition: [{ id: 'claim_jumper', label: 'Claim Jumpers', count: 6 }],
    compositionScope: 'wave-horn packs only; continuous tricklers are additional',
    continuousTrickle: { includedInComposition: false, includedInDefeatedTotal: true },
  });
  expect(waveOne.now.score.goldPanned).toBe(90);
  expect(waveOne.now.works.byKind).toEqual({ palisade: 4, turret: 1 });
  expect(progressed.now.hero.upgradesTaken).not.toEqual({});
  expect(progressed.now.threats).toMatchObject({
    defeatedBasis: 'all enemies, including continuous tricklers',
  });
  expect(outcome).toMatchObject({ secured: true, waves: 10, gold: 0, calls: SECURING_ORDERS.length });
});

test('idle remains deterministic and losable after progression parity', () => {
  const first = run('idle');
  const second = run('idle');
  expect(first.status, first.stderr).toBe(0);
  expect(second.status, second.stderr).toBe(0);
  expect(second.stdout).toBe(first.stdout);

  const transcript = first.stdout.trim().split('\n').map((line) => JSON.parse(line));
  const terminalView = transcript.at(-2);
  expect(terminalView.now.hero).toMatchObject({
    hp: 0,
    level: 3,
    upgradesTaken: { heavy_spark: 2 },
    upgradeChoiceRule: 'first-offer',
  });
  expect(terminalView.now.threats.defeatedTotal).toBeLessThan(terminalView.now.threats.spawnedTotal);
  expect(transcript.at(-1)).toMatchObject({ secured: false, waves: 3, gold: 0, calls: 0 });
});
