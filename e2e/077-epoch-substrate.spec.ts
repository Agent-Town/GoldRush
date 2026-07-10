import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, loadEpoch } from '../src/meta/ContractFamilies';
import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';
import {
  RESEARCH_STATE_KEY,
  availablePicks,
  loadResearchState,
  researchStateKey,
} from '../src/meta/ResearchTree';

const FRONTIER = 'epoch-1-frontier';
const STEAMWORKS = 'epoch-2-steamworks';
const VOLTAGE = 'epoch-3-voltage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

test('loadEpoch rejects a malformed research contract instead of stretching it', () => {
  const node = loadEpoch(FRONTIER).research.branches[0]!.nodes[0]! as { cost: number };
  const cost = node.cost;
  try {
    node.cost = 0;
    expect(() => loadEpoch(FRONTIER)).toThrow('research node assay_grading.cost must be a positive integer');
  } finally {
    node.cost = cost;
  }
});

test('legacy Frontier research maps byte-equivalent state into the epoch key on first read', () => {
  const legacy = {
    version: 1,
    taken: ['assay_grading', 'mother_lode_survey', 'chain_spark_primer'],
    proposalSalt: 3,
    pinnedTarget: 'claim_map_table',
  };
  const values = new Map<string, string>([
    [META_PROGRESS_KEY, JSON.stringify({ version: 1, tracks: { territory: 2, science: 3, hero: 1, agent: 4 } })],
    [RESEARCH_STATE_KEY, JSON.stringify(legacy)],
  ]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };

  const migrated = loadResearchState(storage, storage, {}, FRONTIER);
  expect(migrated).toMatchObject({
    epochId: FRONTIER,
    taken: legacy.taken,
    proposalSalt: legacy.proposalSalt,
    pinnedTarget: legacy.pinnedTarget,
    progress: { tracks: { territory: 2, science: 3, hero: 1, agent: 4 } },
  });
  expect(availablePicks(migrated).map((node) => node.id)).toEqual(['second_order_slot', 'beacon_cadence']);
  expect(JSON.parse(values.get(RESEARCH_STATE_KEY)!)).toEqual(legacy);
  expect(JSON.parse(values.get(researchStateKey(FRONTIER))!)).toMatchObject({ ...legacy, steps: 3 });
  console.log('[077-migration] legacy gr.research.v1 -> gr.research.epoch-1-frontier.v1; state and proposal order identical');
});

test('an epoch consumes each legacy science payout once through its cursor', () => {
  const values = new Map<string, string>([
    [META_PROGRESS_KEY, JSON.stringify({ version: 1, tracks: { territory: 0, science: 6, hero: 0, agent: 0 } })],
    [RESEARCH_STATE_KEY, JSON.stringify({ version: 1, taken: [], proposalSalt: 0, pinnedTarget: null })],
  ]);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
  expect(loadResearchState(storage, storage, {}, STEAMWORKS).progress.tracks.science).toBe(0);
  values.set(META_PROGRESS_KEY, JSON.stringify({ version: 1, tracks: { territory: 0, science: 7, hero: 0, agent: 0 } }));
  expect(loadResearchState(storage, storage, {}, STEAMWORKS).progress.tracks.science).toBe(1);
  expect(loadResearchState(storage, storage, {}, STEAMWORKS).progress.tracks.science).toBe(1);
  expect(JSON.parse(values.get(researchStateKey(STEAMWORKS))!)).toMatchObject({ steps: 1, metaScienceCursor: 7 });
});

test('fresh Steamworks science raises the manifest-declared Voltage successor without engine ids', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ profileKey, activeKey, metaKey, legacyResearchKey, steamworks }) => {
      localStorage.clear();
      sessionStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(profile));
      localStorage.setItem(activeKey, steamworks);
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 6, hero: 0, agent: 0 } }));
      localStorage.setItem(legacyResearchKey, JSON.stringify({ version: 1, taken: [], proposalSalt: 0, pinnedTarget: null }));
    },
    {
      profileKey: PROFILE_KEY,
      activeKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      legacyResearchKey: profileDataKey('robin', RESEARCH_STATE_KEY),
      steamworks: STEAMWORKS,
    },
  );
  await page.goto('/?debug&nowaves&nolevel&seed=077-epoch-substrate');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const proof = await page.evaluate(
    async ({ steamworks, voltage, researchKey, megaprojectKey }) => {
      const contracts = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      const research = (await Function('return import("/src/meta/ResearchTree.ts")')()) as typeof import('../src/meta/ResearchTree');
      const chart = (await Function('return import("/src/ui/ResearchChart.ts")')()) as typeof import('../src/ui/ResearchChart');
      const signals = (await Function('return import("/src/story/signals.ts")')()) as typeof import('../src/story/signals');
      const before = research.loadResearchState(localStorage, localStorage, {}, steamworks);
      const researched: string[] = [];
      while (window.__GR_TEST__!.researchState().steps < contracts.loadEpoch(steamworks).scienceThreshold) {
        const id = window.__GR_TEST__!.availableResearchPicks()[0];
        if (!id || !window.__GR_TEST__!.takeResearchNode(id)) throw new Error(`Could not research Steamworks node: ${id}`);
        researched.push(id);
      }
      const state = research.loadResearchState(localStorage, localStorage, {}, steamworks);
      const meter = research.scienceMeter(state);
      const host = document.createElement('div');
      host.innerHTML = chart.renderResearchChart(state);
      const branchIds = [...host.querySelectorAll<HTMLElement>('[data-research-branch]')].map(
        (branch) => branch.dataset.researchBranch,
      );
      const nextEpoch = host.querySelector<HTMLElement>('[data-testid="research-next-epoch"]');

      const blockedWrongTarget = contracts.activateEpoch(steamworks);
      const blockedBeforeRecord = contracts.activateEpoch(voltage);
      const target = contracts.loadEpoch(steamworks).megaproject;
      localStorage.setItem(megaprojectKey, JSON.stringify({ version: 1, projects: { [target.id]: { complete: true } } }));
      let event = '';
      const off = signals.onStorySignal((signal) => {
        if (signal.type === 'epoch-activated') event = `${signal.type}: ${signal.epochId}`;
      });
      const activated = contracts.activateEpoch(voltage);
      if (activated) {
        signals.emitStorySignal({ type: 'epoch-activated', epochId: voltage, displayName: contracts.loadEpoch(voltage).displayName });
      }
      off();
      return {
        initialSteps: before.progress.tracks.science,
        researched,
        meter,
        branchIds,
        nodeCount: host.querySelectorAll('[data-research-node]').length,
        nextEpochId: nextEpoch?.dataset.epochId,
        blockedWrongTarget,
        blockedBeforeRecord,
        target,
        activated,
        activeEpochId: contracts.activeEpochId(),
        event,
        saved: JSON.parse(localStorage.getItem(researchKey) ?? 'null') as unknown,
      };
    },
    {
      steamworks: STEAMWORKS,
      voltage: VOLTAGE,
      researchKey: researchStateKey(STEAMWORKS),
      megaprojectKey: MEGAPROJECT_STATE_KEY,
    },
  );

  expect(proof.initialSteps).toBe(0);
  expect(proof.researched).toHaveLength(8);
  expect(proof.meter).toMatchObject({ steps: 8, threshold: 8, complete: true, overflow: 0 });
  expect(proof.branchIds).toEqual(['Geology', 'Arsenal', 'Fabrication']);
  expect(proof.nodeCount).toBe(18);
  expect(proof.nextEpochId).toBe(VOLTAGE);
  expect(proof.blockedWrongTarget).toBe(false);
  expect(proof.blockedBeforeRecord).toBe(false);
  expect(proof.target).toMatchObject({ id: 'dynamo-hall' });
  expect(proof.target.cost.bankedScience).toBe(8);
  expect(proof.activated).toBe(true);
  expect(proof.activeEpochId).toBe(VOLTAGE);
  expect(proof.event).toBe(`epoch-activated: ${VOLTAGE}`);
  expect(proof.saved).toMatchObject({ steps: 8, taken: proof.researched });
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  console.log(`[077-proof] ${proof.researched.length} Steamworks nodes; 8/8 banked; ${proof.event}`);
});
