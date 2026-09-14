import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const vite = await createServer({
  root: fileURLToPath(new URL('..', import.meta.url)),
  appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, hmr: false },
});
let saves, normalizeRunSuspendDatum, validateTownName, Balance;
try {
  saves = await vite.ssrLoadModule('/src/game/SaveSlots.ts');
  ({ normalizeRunSuspendDatum } = await vite.ssrLoadModule('/src/game/RunSuspend.ts'));
  ({ validateTownName } = await vite.ssrLoadModule('/src/town/TownNaming.ts'));
  ({ Balance } = await vite.ssrLoadModule('/src/game/Balance.ts'));
} finally {
  await vite.close();
}

function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

// A supported legacy snapshot, normalized by the real decoder before any save.
function snapshot(wave = 1) {
  const meta = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  const value = normalizeRunSuspendDatum({
    v: 1, wave, timeAlive: wave * 30, writtenAt: 1, lastWriteMs: 0, sizeBytes: 1,
    trigger: 'wave-boundary', copy: '', contractId: 'the-claim', seed: 'save-name-review',
    rng: { waves: null, upgrades: null },
    waveSystem: {
      wave, pulse: 0, edge: null, budget: 0, waveSpawnedTotal: 0, nextTrickleAt: 1,
      nextWaveAt: 1, nextPlanWaveAt: 1, nextPlanWave: 1, plannedPulses: [], copyCursor: 0,
      lastCopy: '', currentAtSim: wave * 30, waveState: 'quiet', lastPulseAt: null,
    },
    enemies: { spawnSerial: 0, active: [] },
    economy: { gold: 0, bankCap: Balance.economy.bankCap, resources: {}, log: [] },
    hero: {
      level: 1, xpTotal: 0, spentXp: 0, xpInto: 0, pendingLevels: 0, offer: null, stacks: {},
      hp: Balance.hero.maxHp, maxHp: Balance.hero.maxHp,
      position: { x: 0, y: 0, z: 12 }, velocity: { x: 0, y: 0, z: 0 },
    },
    buildings: [],
    counters: { kills: 0, stolenTotal: 0, reclaimedTotal: 0, buildingHitsResolved: 0, buildingsWrecked: 0, weapon: 'rig', weaponToggleCount: 0, blastTime: 0 },
    meta, research: { version: 1, progress: meta, taken: [], proposalSalt: 0, pinnedTarget: null },
  });
  assert.ok(value, 'test snapshot must pass the real suspend decoder');
  return value;
}

test('the untouched default saves and remains readable on the manual shelf', () => {
  const data = snapshot();
  const store = storage();
  const name = saves.defaultSaveSlotName(data, 'Quartz Hill');
  const result = saves.saveManualSlot({ name, snapshot: data, townName: 'Quartz Hill', contractName: 'The Claim', now: 1 }, store);
  assert.equal(result.ok, true, result.message);
  assert.equal(name, 'Quartz Hill - wave 1');
  assert.deepEqual(saves.readSaveSlots(store).manual.map((slot) => slot.name), [name]);
});

test('legal town names and the fallback fit every supported wave digit count', () => {
  const towns = ['AB', '123', "Miner's Rest", 'Red-Rock Crossing', 'A'.repeat(18)];
  for (const town of towns) assert.equal(validateTownName(town).ok, true, town);
  for (const town of [...towns, null, '', '   ']) {
    for (const wave of [0, 1, 9, 10, 99, 100, 999, 1000, 9999, 10000, 99999, 100000, 999999, 1000000]) {
      const data = snapshot(wave);
      const name = saves.defaultSaveSlotName(data, town);
      assert.ok(name.length >= 2 && name.length <= 24, name);
      assert.ok(name.endsWith(` - wave ${wave}`), name);
      const store = storage();
      const result = saves.saveManualSlot({ name, snapshot: data, townName: town, contractName: 'The Claim', now: 1 }, store);
      assert.equal(result.ok, true, `${name}: ${result.message}`);
      assert.equal(saves.readSaveSlots(store).manual[0]?.name, name);
    }
  }
  assert.equal(saves.defaultSaveSlotName(snapshot(), null), 'The Claim - wave 1');
});

test('manual input keeps its punctuation, reserved-name, profanity, and duplicate checks', () => {
  const data = snapshot();
  for (const name of ['', 'A', 'A'.repeat(25), 'Quartz Hill, wave 1', 'Bad/Name', saves.AUTO_SAVE_SLOT_NAME, 's-h-i-t']) {
    const store = storage();
    const result = saves.saveManualSlot({ name, snapshot: data, townName: null, contractName: 'The Claim' }, store);
    assert.equal(result.ok, false, name);
    assert.equal(saves.readSaveSlots(store).manual.length, 0);
  }
  const store = storage();
  const input = { name: "Miner's Rest - 12", snapshot: data, townName: null, contractName: 'The Claim', now: 1 };
  assert.equal(saves.saveManualSlot(input, store).ok, true);
  assert.equal(saves.saveManualSlot({ ...input, name: input.name.toUpperCase() }, store).ok, false);
  assert.equal(saves.readSaveSlots(store).manual.length, 1);
});
