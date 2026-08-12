import { expect, test } from '@playwright/test';
import { buildView } from '../src/agent/View';
import { AgentRiderBody } from '../src/mp/AgentRiderBody';

test('the browser-owned seat binds actor verbs without borrowing the headless singleton', () => {
  let weapon: 'rig' | 'blast' = 'rig';
  let contextActions = 0;
  let pendingSecure = false;
  const diagnostics = () => ({
    timeAlive: 1,
    runState: 'playing',
    hp: 100,
    maxHp: 100,
    heroPos: { x: 0, z: 12 },
    enemiesAlive: 0,
    wave: 1,
    nextWaveInSim: 30,
    economy: { gold: 1_000 },
    build: { hp: [], sluicePositions: [] },
    harvest: { activeNodes: [] },
    run: { pendingSecure },
  });
  const body = new AgentRiderBody('browser-seat', { diagnostics, economyLog: () => [] }, {
    setWeapon: (next) => {
      weapon = next;
      return { ok: true };
    },
    secureChoice: () => ({ ok: true }),
    contextAction: () => {
      contextActions += 1;
      return { ok: true };
    },
  });

  expect(body.submit([{ verb: 'SET_WEAPON', weapon: 'blast' }], 'weapon', 1)).toBe(true);
  body.movement(1, { x: 0, z: 12 });
  expect(weapon).toBe('blast');

  expect(body.submit([{ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: 0 } }], 'context', 1)).toBe(true);
  body.movement(1, { x: 0, z: 12 });
  expect(contextActions).toBe(1);

  pendingSecure = true;
  expect(body.submit([
    { verb: 'SECURE_CHOICE', choice: 'bank' },
    { verb: 'SET_WEAPON', weapon: 'rig' },
  ], 'mixed-secure', 1)).toBe(false);
  expect(body.submit([{ verb: 'SECURE_CHOICE', choice: 'bank' }], 'secure', 1)).toBe(true);
  body.movement(1, { x: 0, z: 12 });
  expect(body.snapshot().orders[0]).toMatchObject({ status: 'done' });

  const view = buildView({
    diagnostics: () => ({
      ...diagnostics(),
      weapon: 'rig',
      arsenal: { active: 'blast' },
      actors: [{ local: true, weapon: 'blast' }],
      megaproject: {
        active: true,
        unlocked: true,
        id: 'stamp-mill',
        stage: 0,
        funded: false,
        materials: { gold: 90 },
        siteFootprint: { x: -8, z: 16, w: 5, d: 3 },
      },
    }),
    economyLog: () => [],
  });
  expect(view.now.weapon).toBe('rig');
  expect(view.now.pendingSecure).toBe(true);
  expect(view.now.megaproject).toEqual({
    id: 'stamp-mill',
    stage: 0,
    funded: false,
    cost: 90,
    site: { x: -8, z: 16, w: 5, d: 3 },
  });
});

test('a browser secure window stays nonterminal until the bank transition lands', () => {
  let run = { secured: false, rush: false, pendingSecure: false, lastRunEndedReason: null as string | null };
  const source = {
    diagnostics: () => ({
      timeAlive: 1,
      runState: 'playing',
      hp: 100,
      maxHp: 100,
      heroPos: { x: 0, z: 12 },
      enemiesAlive: 0,
      wave: 10,
      nextWaveInSim: 30,
      economy: { gold: 0 },
      build: { hp: [], sluicePositions: [] },
      harvest: { activeNodes: [] },
      run,
    }),
    economyLog: () => [],
  };

  buildView(source);
  run = { secured: true, rush: false, pendingSecure: true, lastRunEndedReason: null };
  expect(buildView(source).appendLog.some(({ outcome }) => outcome === 'secured')).toBe(false);
  run = { secured: true, rush: true, pendingSecure: false, lastRunEndedReason: null };
  expect(buildView(source).appendLog.some(({ outcome }) => outcome === 'secured')).toBe(false);
  run = { secured: true, rush: false, pendingSecure: false, lastRunEndedReason: 'secured' };
  expect(buildView(source).appendLog.at(-1)?.outcome).toBe('secured');

  const rushSource = { ...source };
  run = { secured: true, rush: true, pendingSecure: false, lastRunEndedReason: null };
  buildView(rushSource);
  run = { secured: true, rush: true, pendingSecure: false, lastRunEndedReason: 'rush' };
  expect(buildView(rushSource).appendLog.at(-1)?.outcome).toBe('rider-down');
});
