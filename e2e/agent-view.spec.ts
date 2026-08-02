import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { deriveMechanicsManifest, mechanicsManifestLine, type MechanicsManifest } from '../src/agent/MechanicsManifest';
import type { AgentView } from '../src/agent/View';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { listContracts } from '../src/meta/ContractFamilies';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

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
          "Survive through wave 10."
        ],
        "rules": [
          "The river splits the claim around one center ford.",
          "Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck."
        ]
      }
    },
    "mechanics": {
      "schema": "goldrush.mechanics.v1",
      "contractId": "the-claim",
      "interactables": [],
      "rules": [
        {
          "id": "river",
          "source": "tileParams.river",
          "data": {}
        },
        {
          "id": "water_crossings",
          "source": "tileParams.ford",
          "data": {
            "count": 1,
            "ids": [
              "center-ford"
            ]
          }
        }
      ],
      "posting": {
        "waves": [
          {
            "event": "secure",
            "wave": 10,
            "source": "twist.secureWave"
          }
        ],
        "spawnEdges": [
          "east",
          "north",
          "south",
          "west"
        ],
        "lossStakes": []
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
        "descriptor": "frontier-river-depth"
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

test('the zero-error rider suppresses only the known transient', async ({ page }) => {
  const watch = watchErrors(page);
  await page.evaluate(() => {
    console.error("THREE.GLTFLoader: Couldn't load texture blob:mutation-control");
    console.error('foreign console error mutation control');
  });
  expect(watch.suppressed).toEqual(["THREE.GLTFLoader: Couldn't load texture blob:mutation-control"]);
  expect(watch.errors).toEqual(['foreign console error mutation control']);
  expect(() => expectNoConsoleErrors(watch, 'mutation control')).toThrow();
});

test('all five E1 mechanics manifests match their byte-stable fixture', async () => {
  const fixtures = JSON.parse(await readFile(path.resolve('e2e/fixtures/e1-mechanics-manifests.json'), 'utf8')) as MechanicsManifest[];
  const ids = listContracts().map(({ id }) => id);
  const manifests = ids.map(deriveMechanicsManifest);

  expect(ids).toEqual(['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron']);
  expect(manifests).toEqual(fixtures);
  expect(JSON.stringify(manifests)).toBe(JSON.stringify(fixtures));
  for (const id of ids) expect(JSON.stringify(deriveMechanicsManifest(id))).toBe(JSON.stringify(deriveMechanicsManifest(id)));

  const night = deriveMechanicsManifest('e1-night-shift');
  expect(night.interactables).toContainEqual(expect.objectContaining({ id: 'lantern_post', operations: ['relight'] }));
  expect(night.rules.map(({ id }) => id)).toContain('darkness_cycle');
  expect(deriveMechanicsManifest('e1-dry-gulch').rules.map(({ id }) => id)).toContain('spring_cells');
  expect(deriveMechanicsManifest('e1-twin-banks').rules).toContainEqual(
    expect.objectContaining({ id: 'water_crossings', data: expect.objectContaining({ count: 2 }) }),
  );
  for (const id of ['the-claim', 'e1-night-shift', 'e1-baron']) {
    expect(deriveMechanicsManifest(id).rules).toContainEqual(
      expect.objectContaining({ id: 'water_crossings', data: { count: 1, ids: ['center-ford'] } }),
    );
  }

  const pressed = structuredClone(listContracts().find(({ id }) => id === 'e1-night-shift')!);
  pressed.twist.secureWave = 24;
  expect(deriveMechanicsManifest(pressed).posting.waves).toContainEqual(
    expect.objectContaining({ event: 'secure', wave: 24 }),
  );
});

test('the derived manifest rides THE VIEW and every E1 briefing speaks it', async ({ page }) => {
  const watch = watchErrors(page);
  await page.goto('/?debug&contract=e1-night-shift&nowaves&nolevel&terrain2d&seed=mechanics-view');
  await page.waitForFunction(() => Boolean(window.__GR_AGENT__ && 'view' in window.__GR_AGENT__));
  expect(await page.evaluate(() => window.__GR_AGENT__!.view.stablePrefix.mechanics)).toEqual(
    deriveMechanicsManifest('e1-night-shift'),
  );

  await page.evaluate(
    ({ profileKey, scoreKey, townKey, metaKey, storyKey }) => {
      localStorage.clear();
      localStorage.setItem(profileKey, JSON.stringify({
        version: 2,
        activeId: 'manifest',
        profiles: [{
          id: 'manifest',
          name: 'Manifest',
          createdAt: 1,
          updatedAt: 1,
          difficultyPreset: 'trail',
          hintsSeen: [],
        }],
      }));
      localStorage.setItem(scoreKey, JSON.stringify([
        { waves: 20, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: 'the-claim', profileName: 'Manifest' },
        { waves: 20, kills: 0, gold: 0, timeAlive: 60, at: 2, secured: true, contractId: 'e1-dry-gulch', profileName: 'Manifest' },
      ]));
      localStorage.setItem(townKey, 'Manifest Hill');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 6, hero: 0, agent: 0 } }));
      localStorage.setItem(storyKey, '0');
    },
    {
      profileKey: PROFILE_KEY,
      scoreKey: profileDataKey('manifest', SCOREBOARD_KEY),
      townKey: profileDataKey('manifest', TOWN_NAME_KEY),
      metaKey: profileDataKey('manifest', META_PROGRESS_KEY),
      storyKey: STORY_TALES_STORAGE_KEY,
    },
  );
  await page.goto('/?tier=lite');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const tavern = town.buildings.find(({ id }) => id === 'tavern');
    if (!tavern) throw new Error('Missing tavern');
    town.teleport(tavern.approach.x, tavern.approach.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();

  for (const id of listContracts().map(({ id }) => id)) {
    await expect(page.getByTestId(`contract-board-mechanics-${id}`)).toHaveText(
      mechanicsManifestLine(deriveMechanicsManifest(id)),
    );
  }
  expectNoConsoleErrors(watch, 'manifest view');
});

test('the seeded rider view stays cache-shaped and grows one honest wave at a time', async ({ page }) => {
  const watch = watchErrors(page);
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
  expectNoConsoleErrors(watch, 'seeded rider');
});
