import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const { bossKillSecuresRun } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
await vite.close();

const loadContracts = async (era) => JSON.parse(await readFile(`assets/contracts/${era}/contracts.json`, 'utf8')).contracts;
const contracts = [
  ...await loadContracts('epoch-1-frontier'),
  ...await loadContracts('epoch-2-steamworks'),
  ...await loadContracts('epoch-3-voltage'),
  ...await loadContracts('epoch-6-atomic'),
];
const baron = (id) => contracts.find((contract) => contract.id === id).twist.baron;
const kill = (overrides = {}) => ({ type: 'enemy_killed', at: 1, enemyId: 1, xp: 0, ...overrides });

test('E2 default railcar group secures only when its last component dies', () => {
  const boss = baron('e2-hill-mine');
  const bossGroupId = 'e2-hill-mine:wave-12:railcar';
  assert.equal(bossKillSecuresRun(boss, 'e2-hill-mine', kill({ eliteKind: boss.bossKind, bossGroupId, bossRemaining: 0 })), true);
  assert.equal(bossKillSecuresRun(boss, 'e2-hill-mine', kill({ eliteKind: boss.bossKind, bossGroupId, bossRemaining: 1 })), false);
});

test('E2 default railcar group rejects a wrong group id', () => {
  const boss = baron('e2-hill-mine');
  assert.equal(bossKillSecuresRun(boss, 'e2-hill-mine', kill({
    eliteKind: boss.bossKind,
    bossGroupId: 'e2-hill-mine:wave-12:component-boss',
    bossRemaining: 0,
  })), false);
});

test('E3 variant uses the component-boss group suffix, not railcar', () => {
  const boss = baron('e3-canyon-works');
  assert.equal(bossKillSecuresRun(boss, 'e3-canyon-works', kill({
    eliteKind: boss.bossKind,
    bossGroupId: 'e3-canyon-works:wave-14:component-boss',
    bossRemaining: 0,
  })), true);
  assert.equal(bossKillSecuresRun(boss, 'e3-canyon-works', kill({
    eliteKind: boss.bossKind,
    bossGroupId: 'e3-canyon-works:wave-14:railcar',
    bossRemaining: 0,
  })), false);
});

test('E1 plain Baron accepts no group id and rejects a defined one', () => {
  const boss = baron('e1-baron');
  assert.equal(bossKillSecuresRun(boss, 'e1-baron', kill({ eliteKind: 'baron' })), true);
  assert.equal(bossKillSecuresRun(boss, 'e1-baron', kill({ eliteKind: 'baron', bossGroupId: 'some-group' })), false);
});

// THE HOMEMAKER IS THE ONE BOSS WHOSE AUTHORED GROUP MUST NOT SECURE THE RUN. Its contract
// declares VAC + RACK as a two-member `wave-8:component-boss` group, and the generic branch above
// would fire the moment the second of them died — while the CORE the boss spawns on VAC's death
// (its own single-member group) still stood. `src/game/Game.ts:1710` says otherwise, in the
// browser's own words: `!isHomemakerComponent || event.bossComponentId === 'core'`. Without this
// pin, a refactor could quietly restore the group-id path and `e6-glow-mesa` would start securing
// on a boss that is still alive — a false green no census assertion would catch.
test('E6 Homemaker secures on its CORE only, never on the authored VAC+RACK group', () => {
  const boss = baron('e6-glow-mesa');
  const core = { eliteKind: boss.bossKind, bossGroupId: 'e6-glow-mesa:homemaker-core', bossComponentId: 'core', bossRemaining: 0 };
  assert.equal(bossKillSecuresRun(boss, 'e6-glow-mesa', kill(core)), true);
  assert.equal(bossKillSecuresRun(boss, 'e6-glow-mesa', kill({ ...core, bossRemaining: 1 })), false);
  for (const bossComponentId of ['vac', 'rack']) {
    assert.equal(bossKillSecuresRun(boss, 'e6-glow-mesa', kill({
      eliteKind: boss.bossKind,
      bossGroupId: 'e6-glow-mesa:wave-8:component-boss',
      bossComponentId,
      bossRemaining: 0,
    })), false, `${bossComponentId} must not secure the run`);
  }
  assert.equal(bossKillSecuresRun(boss, 'e6-glow-mesa', kill({ ...core, eliteKind: 'baron' })), false);
});

test('elite kind must match even when the component group is fully down', () => {
  const boss = baron('e2-hill-mine');
  assert.equal(bossKillSecuresRun(boss, 'e2-hill-mine', kill({
    eliteKind: 'baron',
    bossGroupId: 'e2-hill-mine:wave-12:railcar',
    bossRemaining: 0,
  })), false);
});
