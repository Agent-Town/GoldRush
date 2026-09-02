import { expect, test, type Page } from '@playwright/test';
import { Vector2 } from 'three';
import {
  RUN_TAPES_KEY,
  RunTapeRecorder,
  appendRunTape,
  keepRunTape,
  readRunTapes,
  runTapeRecordingMeta,
  runTapeEventLogHash,
  type RunTape,
  type RunTapeEventLog,
} from '../src/game/RunTape';
import { MAX_PLAYBOOK_TICKS } from '../src/playbook/PlaybookFormat';

type MemoryStorage = Pick<Storage, 'getItem' | 'setItem'>;

function storage(): MemoryStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
  };
}

function tape(index: number): RunTape {
  return {
    version: 1,
    id: `tape-${index}`,
    createdAt: index,
    kept: false,
    contract: 'the-claim',
    seed: 'tape-ring',
    difficulty: 'trail',
    simVersion: 1,
    inputLog: {
      version: 1,
      name: `tape-${index}`,
      contractId: 'the-claim',
      seed: 'tape-ring',
      difficultyPreset: 'trail',
      stepSeconds: 1 / 30,
      start: { x: 0, z: 12 },
      durationTicks: 1,
      entries: [],
      truncated: null,
      primarySlot: 0,
      streams: [],
    },
    eventLogHash: 'fnv1a32:1234abcd',
    outcome: { reason: 'death', secured: false, waves: index, timeAlive: index, gold: 0 },
  };
}

function eventLog(marker: number): RunTapeEventLog {
  return {
    probes: [],
    kills: marker,
    gold: 0,
    wave: 0,
    economy: {
      panned: 0, sluiced: 0, granted: 0, stolen: 0, reclaimed: 0,
      pannedByProspector: 0, sluicedByProspector: 0, reclaimedByProspector: 0,
      spent: 0, baseValue: 0, buildingsBuilt: 0, beaconsBuilt: 0, repairSpent: 0, repairs: 0,
    },
  };
}

const idleIntents = {
  move: new Vector2(), confirm: false, upgrade: false, rotateBuild: false, weaponToggle: false,
  build: false, cancel: false, buildSlot: null, restart: false, pause: false, mute: false,
  debugSpawn: false, debugXp: false, debugPlant: false,
};

test('the profile tape ring keeps the latest ten plus older marked runs', () => {
  const memory = storage();
  appendRunTape(memory, tape(0));
  expect(keepRunTape(memory, 'tape-0')).toBe(true);
  for (let index = 1; index < 12; index += 1) appendRunTape(memory, tape(index));

  const tapes = readRunTapes(memory);
  expect(tapes).toHaveLength(11);
  expect(tapes.slice(0, 10).map((entry) => entry.id)).toEqual(
    Array.from({ length: 10 }, (_, index) => `tape-${11 - index}`),
  );
  expect(tapes.at(-1)).toMatchObject({ id: 'tape-0', kept: true });
  expect(JSON.parse(memory.getItem(RUN_TAPES_KEY) ?? '{}')).toMatchObject({ version: 1 });
});

test('the keep result stays false when profile storage rejects the write', () => {
  const memory = storage();
  appendRunTape(memory, tape(0));
  const blocked: MemoryStorage = {
    getItem: memory.getItem,
    setItem: () => {
      throw new Error('quota');
    },
  };
  expect(keepRunTape(blocked, 'tape-0')).toBe(false);
});

test('the recorder deduplicates routed actions and freezes the hash at its input ceiling', () => {
  const meta = { buildId: 'deadbeef', engineHash: '1'.repeat(64), era: 5 };
  const recorder = new RunTapeRecorder({ contract: 'the-claim', seed: 'bounded', difficulty: 'trail', start: { x: 0, z: 12 }, meta });
  meta.engineHash = '2'.repeat(64);
  const action = { type: 'context_action', action: 'fund' } as const;
  recorder.recordAction(action);
  recorder.record(idleIntents, { x: 0, z: 12 }, [action]);
  recorder.recordAdditional(1, { ...idleIntents, move: new Vector2(1, 0) }, { x: 2, z: 12 });
  for (let tick = 1; tick <= MAX_PLAYBOOK_TICKS; tick += 1) recorder.record(idleIntents, { x: 0, z: 12 });
  expect(recorder.truncated).toBe(true);
  recorder.freezeEventLog(eventLog(1));
  const recorded = recorder.finish(
    { reason: 'rush', secured: true, waves: 99, timeAlive: 700, gold: 0 },
    eventLog(2),
  );
  expect(recorded.inputLog.entries[0]?.a).toEqual([action]);
  expect(recorded.inputLog.streams).toMatchObject([{ slot: 1, entries: [{ t: 0, mx: 1, my: 0 }] }]);
  expect(recorded.eventLogHash).toBe(runTapeEventLogHash(eventLog(1)));
  expect(recorded.meta).toEqual({ buildId: 'deadbeef', engineHash: '1'.repeat(64), era: 5 });
});

test('a resumed recording keeps the engine stamp captured by the original build', () => {
  const store = storage();
  const oldMeta = runTapeRecordingMeta(store, 'the-claim', { buildId: 'deadbeef', engineHash: '1'.repeat(64), era: 5 }, false);
  const resumedMeta = runTapeRecordingMeta(store, 'the-claim', { buildId: 'cafebabe', engineHash: '2'.repeat(64), era: 6 }, true);

  expect(resumedMeta).toEqual(oldMeta);
});

async function prep(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.contactDamage', 0))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('waves.aliveCap', 12))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.grantGold(400));
}

test('every ended run writes a keepable tape whose replay reproduces its event hash', async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  const query = '?debug&nolevel&nowaves&seed=tape-01-proof';
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await prep(page);
  const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
  const q = (value: number) => Math.round(value * 1000) / 1000;
  const script = [
    { t: 0, mx: 1, my: 0, a: [] },
    { t: 45, mx: 0, my: 1, a: [] },
    { t: 90, mx: -1, my: 0, a: [] },
    { t: 135, mx: 0, my: -1, a: [] },
    { t: 180, mx: 0, my: 0, a: [{ type: 'place_build', id: 'palisade', position: { x: q(hero.x + 3), z: q(hero.z) }, rotationSteps: 0 }] },
    { t: 240, mx: 0, my: 0, a: [{ type: 'place_build', id: 'palisade', position: { x: q(hero.x + 3), z: q(hero.z + 2) }, rotationSteps: 1 }] },
    { t: 300, mx: 0.5, my: -0.5, a: [] },
    { t: 420, mx: -0.5, my: 0.5, a: [] },
    { t: 540, mx: 0, my: 0, a: [] },
  ];
  expect(await page.evaluate((entries) => window.__GR_TEST__!.playbook.startRecording({ script: entries }), script)).toMatchObject({ ok: true });
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(45));
  await page.evaluate(() => window.__GR_TEST__?.endRunForTest());

  await expect(page.getByTestId('keep-run-tape')).toBeVisible();
  const recorded = await page.evaluate(() => window.__GR_TEST__!.runTape.list()[0]!);
  expect(recorded).toMatchObject({ contract: 'the-claim', seed: 'tape-01-proof', difficulty: 'trail', simVersion: 1, kept: false });
  expect(recorded.inputLog.entries.length).toBeGreaterThan(0);
  await page.getByTestId('keep-run-tape').click();
  await expect(page.getByTestId('keep-run-tape')).toHaveText('Tape kept');
  expect(await page.evaluate(() => window.__GR_TEST__!.runTape.list()[0]!.kept)).toBe(true);

  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await prep(page);
  expect(await page.evaluate((text) => window.__GR_TEST__!.playbook.startReplay({ text, hidePlayer: true }), JSON.stringify(recorded.inputLog))).toMatchObject({ ok: true });
  await page.evaluate((seconds) => window.__GR_TEST__?.advanceSim(seconds), recorded.inputLog.durationTicks / 30);
  const replayHash = await page.evaluate(() => window.__GR_TEST__!.runTape.replayEventLogHash());
  expect(replayHash).toBe(recorded.eventLogHash);
  expect(errors).toEqual([]);
});
