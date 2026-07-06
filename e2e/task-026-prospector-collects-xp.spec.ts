import { expect, test } from '@playwright/test';
import { createRng } from '../src/core/Rng';
import { createToolSurface, type AgentCollectXpOptions, type AgentVec2 } from '../src/agent/ToolSurface';
import { Balance } from '../src/game/Balance';
import { GameState } from '../src/game/GameState';
import { Progression } from '../src/game/Progression';

type Mote = {
  id: string;
  ageS: number;
  xp: number;
  active: boolean;
  position: AgentVec2;
};

test('collect_xp sweeps aged motes in batched receipts without entering deep water', () => {
  const state = new GameState();
  state.transition('playing');
  const progression = new Progression({
    state,
    rng: createRng('task-026-offers'),
    getBeaconCount: () => 0,
    getWave: () => 1,
    getMaxHp: () => Balance.hero.maxHp,
    onStatsChanged: () => {},
  });
  let xpTotal = 0;
  const motes: Mote[] = [
    { id: 'north-a', ageS: Balance.agent.xpMoteAgeS + 0.2, xp: Balance.xp.perKill, active: true, position: { x: -12, z: 12 } },
    { id: 'north-b', ageS: Balance.agent.xpMoteAgeS + 1, xp: Balance.xp.perKill, active: true, position: { x: 8, z: 13 } },
    { id: 'south-a', ageS: Balance.agent.xpMoteAgeS + 0.4, xp: Balance.xp.perKill, active: true, position: { x: -12, z: -12 } },
    { id: 'south-b', ageS: Balance.agent.xpMoteAgeS + 0.8, xp: Balance.xp.perKill, active: true, position: { x: 10, z: -13 } },
    { id: 'fresh-near-hero', ageS: Balance.agent.xpMoteAgeS - 0.1, xp: Balance.xp.perKill, active: true, position: { x: 1, z: 11 } },
  ];
  const agent = { position: { x: -14, z: 12 } };
  const pathSamples: AgentVec2[] = [];

  const collectXp = (options: AgentCollectXpOptions) => {
    const swept = motes.filter((mote) => mote.active && mote.ageS > options.minAgeS && zoneAt(mote.position) !== 'river');
    let xp = 0;
    for (const mote of swept) {
      const route = routeThroughFord(agent.position, mote.position);
      pathSamples.push(...sampleRoute(route));
      agent.position = { ...mote.position };
      mote.active = false;
      xp += mote.xp;
    }
    xpTotal += xp;
    progression.consumeXpTotal(xpTotal);
    return {
      xp,
      motes: swept.length,
      collector: 'prospector' as const,
      agentPath: pathSamples,
      sweptIds: swept.map((mote) => mote.id),
    };
  };

  const surface = createToolSurface(
    {
      diagnostics: () => ({ heroPinnedInCombat: true, progression: progression.snapshot }),
      economyLog: () => [],
      collectXp,
    },
    { permissionLevel: 1 },
  );

  const first = surface.tools.collect_xp();
  expect(first.outcome.ok).toBe(true);
  const firstResult = (first.outcome as { ok: true; result: { xp: number; motes: number; message: string; sweptIds: string[] } })
    .result;
  expect(first.tool).toBe('et.goldrush.collect_xp');
  expect(first.args).toEqual({ minAgeS: Balance.agent.xpMoteAgeS });
  expect(firstResult).toMatchObject({ xp: 16, motes: 4, message: 'Gathered 16 XP' });
  expect(firstResult.sweptIds).not.toContain('fresh-near-hero');
  expect(motes.find((mote) => mote.id === 'fresh-near-hero')?.active).toBe(true);
  expect(state.current).toBe('levelup');
  expect(progression.snapshot.offer?.length).toBe(3);

  motes.find((mote) => mote.id === 'fresh-near-hero')!.ageS = Balance.agent.xpMoteAgeS + 0.1;
  const second = surface.tools.collect_xp();
  expect(second.outcome.ok).toBe(true);
  const secondResult = (second.outcome as { ok: true; result: { xp: number; motes: number; message: string } }).result;
  expect(secondResult).toMatchObject({ xp: 4, motes: 1, message: 'Gathered 4 XP' });

  expect(firstResult.xp + secondResult.xp).toBe(motes.length * Balance.xp.perKill);
  expect([first, second]).toHaveLength(2);
  expect(pathSamples.length).toBeGreaterThan(0);
  expect(pathSamples.every((sample) => zoneAt(sample) !== 'river')).toBe(true);
});

function routeThroughFord(from: AgentVec2, to: AgentVec2): AgentVec2[] {
  if (from.z > 5 && to.z < -5) return [from, { x: 0, z: from.z }, { x: 0, z: to.z }, to];
  if (from.z < -5 && to.z > 5) return [from, { x: 0, z: from.z }, { x: 0, z: to.z }, to];
  return [from, to];
}

function sampleRoute(route: AgentVec2[]): AgentVec2[] {
  const samples: AgentVec2[] = [];
  for (let i = 1; i < route.length; i += 1) {
    const a = route[i - 1]!;
    const b = route[i]!;
    const distance = Math.hypot(b.x - a.x, b.z - a.z);
    const steps = Math.max(1, Math.ceil(distance / 0.5));
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      samples.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
    }
  }
  return samples;
}

function zoneAt(pos: AgentVec2): 'bank' | 'ford' | 'river' {
  if (Math.abs(pos.z) <= 5) return Math.abs(pos.x) <= 3 ? 'ford' : 'river';
  return 'bank';
}
