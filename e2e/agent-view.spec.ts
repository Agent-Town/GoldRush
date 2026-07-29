import { expect, test, type Page } from '@playwright/test';
import type { AgentView } from '../src/agent/View';

const WAVE_THREE_SNAPSHOT = `{
  "schema": "goldrush.view.v1",
  "stablePrefix": {
    "seed": "ap-view",
    "contract": {
      "id": "the-claim",
      "name": "The Claim",
      "briefing": {
        "geography": "The classic river claim.",
        "goals": [
          "Hold the claim through wave 10."
        ],
        "rules": [
          "The river splits the claim around one center ford.",
          "Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck."
        ]
      }
    },
    "map": {
      "claim": {
        "x": 0,
        "z": 12
      },
      "seams": [
        {
          "id": "gold-seam-1",
          "x": -22,
          "z": -6.8
        },
        {
          "id": "gold-seam-2",
          "x": -9,
          "z": 6.7
        },
        {
          "id": "gold-seam-3",
          "x": -1.5,
          "z": -6.4
        },
        {
          "id": "gold-seam-4",
          "x": 7.5,
          "z": 6.5
        },
        {
          "id": "gold-seam-5",
          "x": 18,
          "z": -7
        },
        {
          "id": "gold-seam-6",
          "x": 25,
          "z": 6.9
        }
      ],
      "water": {
        "river": true,
        "ford": true,
        "sources": 0,
        "descriptor": null
      },
      "spawnGates": [
        {
          "edge": "north"
        },
        {
          "edge": "south"
        },
        {
          "edge": "east"
        },
        {
          "edge": "west"
        }
      ]
    },
    "orders": []
  },
  "appendLog": [
    {
      "wave": 1,
      "outcome": "held",
      "goldDelta": 7,
      "worksHp": {
        "current": 40,
        "max": 40,
        "delta": 0
      },
      "kills": 0,
      "surprises": []
    },
    {
      "wave": 2,
      "outcome": "held",
      "goldDelta": 0,
      "worksHp": {
        "current": 40,
        "max": 40,
        "delta": 0
      },
      "kills": 0,
      "surprises": []
    }
  ],
  "now": {
    "wave": 3,
    "timers": {
      "runSeconds": "<number>",
      "nextWaveInSeconds": 30
    },
    "gold": 7,
    "hero": {
      "hp": 100,
      "maxHp": 100,
      "x": 0,
      "z": 12
    },
    "works": {
      "hp": 40,
      "maxHp": 40,
      "standing": 1,
      "wrecked": 0,
      "byKind": {
        "sentry_beacon": 1
      }
    },
    "threats": {
      "alive": 0,
      "state": "quiet",
      "edge": null,
      "thieves": 0,
      "wreckers": 0
    },
    "orders": [],
    "needsRider": false,
    "seams": [
      {
        "id": "gold-seam-1",
        "active": true,
        "remaining": 30
      },
      {
        "id": "gold-seam-2",
        "active": true,
        "remaining": 30
      },
      {
        "id": "gold-seam-3",
        "active": false,
        "remaining": 30
      },
      {
        "id": "gold-seam-4",
        "active": false,
        "remaining": 30
      },
      {
        "id": "gold-seam-5",
        "active": false,
        "remaining": 30
      },
      {
        "id": "gold-seam-6",
        "active": false,
        "remaining": 30
      }
    ],
    "score": {
      "wavesSurvived": 3,
      "goldPanned": 0,
      "goldPannedByProspector": 0,
      "goldStolen": 0,
      "goldReclaimed": 0,
      "goldReclaimedByProspector": 0,
      "buildingsBuilt": 0
    }
  },
  "almanac": {
    "label": "the Almanac reckons",
    "estimate": true,
    "nextWave": {
      "wave": 4,
      "arrivalInSeconds": 30,
      "basis": "estimated-from-wave-schedule",
      "composition": [
        {
          "id": "claim_jumper",
          "label": "Claim Jumpers",
          "count": 15
        }
      ]
    },
    "projection": {
      "expectedLeaks": 0,
      "expectedWorksDamage": 0,
      "expectedGold": 55.83,
      "currentWorks": 1,
      "harnessHash": "fnv1a32:b7eecc61"
    }
  }
}`;

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('the seeded rider view stays cache-shaped and grows one honest wave at a time', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=ap-view');
  await page.waitForFunction(
    () => Boolean(window.__GR_TEST__ && window.__GR_AGENT__ && 'view' in window.__GR_AGENT__),
  );

  const views = await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    if (!window.__GR_TEST__!.placeFree('sentry_beacon', -4, 9)) throw new Error('view fixture did not place');

    const baseline = window.__GR_AGENT__!.view;
    window.__GR_TEST__!.startWaveForTest(1);
    const wave1 = window.__GR_AGENT__!.view;
    window.__GR_TEST__!.grantGold(7);
    window.__GR_TEST__!.startWaveForTest(2);
    const wave2 = window.__GR_AGENT__!.view;
    window.__GR_TEST__!.startWaveForTest(3);
    const wave3 = window.__GR_AGENT__!.view;
    return { baseline, wave1, wave2, wave3 };
  });

  expect(views.wave1.stablePrefix).toEqual(views.baseline.stablePrefix);
  expect(views.wave2.stablePrefix).toEqual(views.baseline.stablePrefix);
  expect(views.wave3.stablePrefix).toEqual(views.baseline.stablePrefix);
  expect([
    views.baseline.appendLog.length,
    views.wave1.appendLog.length,
    views.wave2.appendLog.length,
    views.wave3.appendLog.length,
  ]).toEqual([0, 0, 1, 2]);
  expect(views.wave3.appendLog.map((entry) => entry.wave)).toEqual([1, 2]);
  expect(views.wave3.appendLog[0]).toMatchObject({ outcome: 'held', goldDelta: 7 });

  const { nextWave, projection } = views.wave3.almanac;
  const scheduled = nextWave.composition.reduce((sum, entry) => sum + entry.count, 0);
  expect(views.wave3.almanac.label).toBe('the Almanac reckons');
  expect(nextWave.wave).toBe(4);
  expect(nextWave.arrivalInSeconds).toBeGreaterThan(0);
  expect(projection.expectedLeaks).toBeGreaterThanOrEqual(0);
  expect(projection.expectedLeaks).toBeLessThanOrEqual(scheduled);
  expect(projection.expectedWorksDamage).toBeGreaterThanOrEqual(0);
  expect(projection.expectedWorksDamage).toBeLessThanOrEqual(views.wave3.now.works.hp);
  expect(projection.expectedGold).toBeGreaterThanOrEqual(0);
  expect(projection.harnessHash).toMatch(/^fnv1a32:[0-9a-f]{8}$/);

  const receipt = await page.evaluate(async () => {
    const { createToolSurface } = await import('../src/agent/ToolSurface');
    return createToolSurface({
      diagnostics: () => window.__THREE_GAME_DIAGNOSTICS__,
      economyLog: () => window.__GR_TEST__!.economyLog(),
      standingOrders: () => ({
        needsRider: true,
        orders: [{ id: 'orders-1', order: { verb: 'HOLD', pos: { x: 0, z: 12 } }, status: 'active' }],
        log: [{ seq: 1, at: 0, type: 'surprise', surprise: 'claim_damage' }],
      }),
    }).tools.view();
  });
  expect(receipt).toMatchObject({
    tool: 'et.goldrush.view',
    args: {},
    outcome: {
      ok: true,
      state: {
        schema: 'goldrush.view.v1',
        stablePrefix: { orders: [{ id: 'orders-1' }] },
        now: { needsRider: true },
      },
      economyLog: [],
    },
  });

  const snapshot: AgentView | (Omit<AgentView, 'now'> & {
    now: Omit<AgentView['now'], 'timers'> & {
      timers: { runSeconds: '<number>'; nextWaveInSeconds: number };
    };
  }) = {
    ...views.wave3,
    now: {
      ...views.wave3.now,
      timers: { ...views.wave3.now.timers, runSeconds: '<number>' },
    },
  };
  expect(JSON.stringify(snapshot, null, 2)).toBe(WAVE_THREE_SNAPSHOT);

  const afterSkippedRead = await page.evaluate(() => {
    window.__GR_TEST__!.startWaveForTest(5);
    return window.__GR_AGENT__!.view;
  });
  expect(afterSkippedRead.appendLog.slice(-2)).toEqual([
    {
      wave: 3,
      outcome: 'unobserved',
      goldDelta: null,
      worksHp: null,
      kills: null,
      surprises: [],
    },
    {
      wave: 4,
      outcome: 'unobserved',
      goldDelta: null,
      worksHp: null,
      kills: null,
      surprises: [],
    },
  ]);

  const terminalEntries = await page.evaluate(async () => {
    const { buildView } = await import('../src/agent/View');
    const diagnostics = { ...window.__THREE_GAME_DIAGNOSTICS__! } as unknown as Record<string, unknown>;
    diagnostics.wave = 1;
    diagnostics.timeAlive = 0;
    diagnostics.runState = 'playing';
    diagnostics.hp = 100;
    const source = { diagnostics: () => diagnostics, economyLog: () => [] };
    buildView(source);
    diagnostics.timeAlive = 8;
    diagnostics.runState = 'dead';
    diagnostics.hp = 0;
    const riderDown = buildView(source).appendLog.at(-1);

    diagnostics.runState = 'playing';
    diagnostics.hp = 100;
    diagnostics.run = { secured: false };
    diagnostics.timeAlive = 0;
    const securedSource = { diagnostics: () => diagnostics, economyLog: () => [] };
    buildView(securedSource);
    diagnostics.timeAlive = 8;
    diagnostics.run = { secured: true };
    const secured = buildView(securedSource).appendLog.at(-1);
    return { riderDown, secured };
  });
  expect(terminalEntries.riderDown).toMatchObject({ wave: 1, outcome: 'rider-down' });
  expect(terminalEntries.secured).toMatchObject({ wave: 1, outcome: 'secured' });
  expect(errors).toEqual([]);
});
