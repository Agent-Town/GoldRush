import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { onRequest as standingsRoute } from '../functions/api/standings';
import {
  isMultiplayerStandingSubmitter,
  multiplayerStandingParty,
  resetMultiplayerStandingRoster,
} from '../src/agent/DeclaredStack';

function request(body?: unknown, query = ''): Request {
  return new Request(`http://127.0.0.1/api/standings${query}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'content-type': 'application/json', 'CF-Connecting-IP': '127.0.0.1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test('a mixed ride records its declared agent stack while the agents-only bench payload stays byte-identical', async () => {
  const values = new Map<string, string>();
  const kv = {
    get: async (key: string) => values.get(key) ?? null,
    put: async (key: string, value: string) => { values.set(key, value); },
  };
  const stack = { model: 'deepseek/deepseek-v4-flash', harness: 'pi', harnessVersion: '0.84.1' };
  const mixedParty = multiplayerStandingParty([
    { name: 'Robin', client: 'browser' },
    { name: 'Cedar Jack (scout)', client: 'headless' },
  ]);
  expect(mixedParty).toEqual({ riderCount: 2, riders: [{ name: 'Robin' }, { name: 'Cedar Jack', stack: {} }] });
  expect(multiplayerStandingParty([
    { name: 'Robin', client: 'browser' },
    { name: 'Cedar Jack (scout)', client: 'headless', stack },
  ])).toEqual({ riderCount: 2, riders: [{ name: 'Robin' }, { name: 'Cedar Jack', stack }] });

  const solo = await standingsRoute({
    request: request({
      contractId: 'the-claim',
      epochId: 'epoch-1-frontier',
      score: { secured: true, waves: 30, timeAlive: 600, gold: 100, baseValue: 200 },
      profileName: 'Robin',
      anonId: '1'.repeat(32),
      difficulty: 'trail',
      seed: 'solo-live-seed',
      seedMode: 'live',
      seedHash: createHash('sha256').update('solo-live-seed').digest('hex'),
      inputLogHash: createHash('sha256').update('[]').digest('hex'),
    }),
    env: { TELEMETRY: kv },
  });
  expect(solo.status).toBe(200);

  const seed = 'mixed-live-seed';
  const posted = await standingsRoute({
    request: request({
      contractId: 'the-claim',
      epochId: 'epoch-1-frontier',
      score: { secured: true, waves: 20, timeAlive: 600, gold: 100, baseValue: 200 },
      profileName: 'Robin',
      anonId: '1'.repeat(32),
      difficulty: 'trail',
      seed,
      seedMode: 'live',
      seedHash: createHash('sha256').update(seed).digest('hex'),
      inputLogHash: createHash('sha256').update('[]').digest('hex'),
      party: mixedParty,
    }),
    env: { TELEMETRY: kv },
  });
  expect(posted.status).toBe(200);
  const board = await standingsRoute({
    request: request(undefined, '?contract=the-claim&epoch=epoch-1-frontier&party=2'),
    env: { TELEMETRY: kv },
  });
  expect((await board.json()) as unknown).toMatchObject({
    board: [{ party: { riders: [{ name: 'Robin', declared: false }, { name: 'Cedar Jack', declared: true }] } }],
  });
  const soloBoard = await standingsRoute({
    request: request(undefined, '?contract=the-claim&epoch=epoch-1-frontier'),
    env: { TELEMETRY: kv },
  });
  expect((await soloBoard.json()) as { board: unknown[] }).toMatchObject({ board: [{ waves: 30 }] });

  const benchmark = { stack, seedMode: 'bench', seed: 'e1-the-claim-01' };
  const before = JSON.stringify(benchmark);
  const agentsOnlyParty = multiplayerStandingParty([
    { name: 'Rig A', client: 'headless', stack },
    { name: 'Rig B', client: 'headless', stack },
  ]);
  expect(agentsOnlyParty).toBeUndefined();
  expect(JSON.stringify({ ...benchmark, ...(agentsOnlyParty ? { party: agentsOnlyParty } : {}) })).toBe(before);
});

test('a retry drops departed riders from the new run attribution', () => {
  const robin = { playerId: 'p1', name: 'Robin', client: 'browser' as const };
  const cedar = { playerId: 'p2', name: 'Cedar Jack', client: 'headless' as const, stack: {} };
  const recorded = new Map<string, typeof robin | typeof cedar>([[robin.playerId, robin], [cedar.playerId, cedar]]);
  expect(multiplayerStandingParty([...recorded.values()])?.riders).toHaveLength(2);

  resetMultiplayerStandingRoster(recorded, [robin]);

  expect([...recorded.values()]).toEqual([robin]);
  expect(multiplayerStandingParty([...recorded.values()])).toBeUndefined();
});

test('the first active browser is the only standing submitter and a survivor takes over', () => {
  const robin = { playerId: 'p1', name: 'Robin', client: 'browser' as const };
  const ada = { playerId: 'p2', name: 'Ada', client: 'browser' as const };
  const cedar = { playerId: 'p3', name: 'Cedar Jack', client: 'headless' as const };

  expect(isMultiplayerStandingSubmitter([robin, ada, cedar], robin.playerId)).toBe(true);
  expect(isMultiplayerStandingSubmitter([robin, ada, cedar], ada.playerId)).toBe(false);
  expect(isMultiplayerStandingSubmitter([ada, cedar], ada.playerId)).toBe(true);
});
