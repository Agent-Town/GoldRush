import { expect, test } from '@playwright/test';
import { EventBus, type GameEvent } from '../src/core/EventBus';
import { Economy, initialEconomyState, reduce } from '../src/game/Economy';
import {
  META_PROGRESS_KEY,
  agentAutonomyLevel,
  loadMetaProgress,
  saveMetaProgress,
  type MetaProgress,
} from '../src/game/MetaProgress';
import { install, summarizeRun } from '../src/game/RunManager';

type RunEvent<T extends GameEvent['type']> = Extract<GameEvent, { type: T }>;

test('run end summary matches Economy log replay', () => {
  const events = new EventBus();
  const economy = new Economy(32);
  const started: RunEvent<'run_started'>[] = [];
  const ended: RunEvent<'run_ended'>[] = [];
  const game = {
    events,
    economy,
    waveSystem: { diagnostics: { wave: 3 } },
    resetRun: () => {
      economy.apply({ id: uuid(7), at: 7, type: 'run_reset' });
    },
  };

  events.on('run_started', (event) => started.push(event));
  events.on('run_ended', (event) => ended.push(event));
  install(game, { storage: memoryStorage() });

  expect(started).toMatchObject([{ type: 'run_started', at: 0, runId: 1 }]);

  expect(economy.apply({ id: uuid(1), at: 1, type: 'gold_panned', nodeId: 'old', amount: 99 }).ok).toBe(true);
  game.resetRun();
  expect(started.at(-1)).toMatchObject({ type: 'run_started', runId: 2 });

  const mutations = [
    { id: uuid(2), at: 2, type: 'gold_panned', nodeId: 'seam-a', amount: 120 },
    { id: uuid(3), at: 3, type: 'gold_stolen', amount: 20 },
    { id: uuid(4), at: 4, type: 'gold_reclaimed', amount: 5 },
    { id: uuid(5), at: 5, type: 'gold_spent', sink: 'build_sentry_beacon', amount: 25 },
    { id: uuid(6), at: 6, type: 'gold_spent', sink: 'build_stockpile', amount: 60 },
  ] as const;

  for (const event of mutations) expect(economy.apply(event).ok).toBe(true);

  events.emit({
    type: 'hero_died',
    at: 8,
    timeAlive: 8,
    kills: 0,
    goldPanned: 0,
    spent: 0,
    beaconsBuilt: 0,
    wavesSurvived: 1,
  });

  const replay = economy.log.reduce(reduce, initialEconomyState);
  expect(replay.gold).toBe(20);
  expect(ended).toHaveLength(1);
  expect(ended[0].summary).toEqual({
    wavesSurvived: 3,
    goldPanned: 120,
    goldStolen: 20,
    goldReclaimed: 5,
    buildingsBuilt: 2,
  });
  expect(ended[0].summary).toEqual(summarizeRun(economy.log, game.waveSystem.diagnostics.wave));
});

test('meta persists across reload', async ({ page }) => {
  const storage = memoryStorage();
  const expected = saveMetaProgress(storage, {
    version: 1,
    tracks: { territory: 2, science: 3, hero: 4, agent: 5 },
  });

  await page.goto('/?debug&nowaves&nospawn&seed=m3-01-meta');
  await page.evaluate(
    ({ key, value }) => {
      localStorage.removeItem(key);
      localStorage.setItem(key, value);
    },
    { key: META_PROGRESS_KEY, value: storage.getItem(META_PROGRESS_KEY) ?? '' },
  );

  await page.reload();

  const loaded = JSON.parse((await page.evaluate((key) => localStorage.getItem(key), META_PROGRESS_KEY)) ?? 'null') as MetaProgress;

  expect(loaded).toEqual(expected);
  expect(agentAutonomyLevel(loaded)).toBe(5);
});

test('fresh profile migrates to gr.meta.v1 defaults', () => {
  const storage = memoryStorage();
  const meta = loadMetaProgress(storage);
  const stored = JSON.parse(storage.getItem(META_PROGRESS_KEY) ?? 'null') as unknown;

  expect(meta).toEqual({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } });
  expect(stored).toEqual(meta);
});

test('MetaProgress keeps agent reserved but exposes autonomy level', () => {
  const storage = memoryStorage();
  expect(loadMetaProgress(storage)).toEqual({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } });

  const saved = saveMetaProgress(storage, { version: 1, tracks: { territory: 1, science: 2, hero: 3, agent: 4.8 } });
  expect(saved.tracks).toEqual({ territory: 1, science: 2, hero: 3, agent: 4.8 });
  expect(agentAutonomyLevel(saved)).toBe(4);
});

function memoryStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, '0')}`;
}
