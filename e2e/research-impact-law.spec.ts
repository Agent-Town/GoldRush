import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { listEpochs } from '../src/meta/ContractFamilies';
import { RESEARCH_STATE_KEY, researchNodeById, researchNodes } from '../src/meta/ResearchTree';
import { deriveResearchImpact, playerFacingScienceCarryover } from '../src/ui/ResearchChart';

const SCHOOLHOUSE = { x: -8.2, z: 5.4 };
const SHOT_DIR = 'artifacts/research-impact-law';
const SCOPES = ['THIS RUN', 'EVERY RUN', 'THE TOWN'];
const RETIRED_RESEARCH_WORDS = /\b(?:banks?|banked|staked)\b/i;

test('every era research node states a scoped impact from engine truth', () => {
  for (const epoch of listEpochs()) {
    for (const node of researchNodes(epoch.id)) {
      const impact = deriveResearchImpact(node);
      expect(impact.line.trim(), `${epoch.id}/${node.id}`).not.toBe('');
      expect(SCOPES, `${epoch.id}/${node.id}`).toContain(impact.scope);
      if (impact.future) {
        expect(impact.line, `${epoch.id}/${node.id}`).toMatch(/^Unlocks: .+ — .+ Arrives with .+\.$/);
      } else expect(impact.line, `${epoch.id}/${node.id}`).toMatch(/\d/);
      expect(impact.line, `${epoch.id}/${node.id}`).not.toMatch(RETIRED_RESEARCH_WORDS);
    }
  }

  expect(deriveResearchImpact(researchNodeById.chain_spark_primer)).toMatchObject({ scope: 'EVERY RUN', future: false });
  expect(deriveResearchImpact(researchNodeById.chain_spark_primer).line).toContain('12%');
  expect(deriveResearchImpact(researchNodeById.assay_grading).line).toContain('+35');
  expect(deriveResearchImpact(researchNodeById.second_order_slot)).toMatchObject({ scope: 'THE TOWN', future: false });
  expect(deriveResearchImpact(researchNodeById.pressure_assay).line).toContain('25–80');
  expect(deriveResearchImpact(researchNodeById.boiler_lance).line).toContain('5 damage');
  expect(deriveResearchImpact(researchNodeById.recruited_agent_slot)).toMatchObject({ scope: 'THE TOWN', future: true });
  expect(deriveResearchImpact(researchNodeById.coil_groundwork).line).toContain('Arrives with the Voltage Age.');
  expect(playerFacingScienceCarryover('banked: +2 toward the Steamworks')).toBe('carried forward: +2 toward the Steamworks');
  expect(playerFacingScienceCarryover('banked: +2 toward the Steamworks')).not.toMatch(RETIRED_RESEARCH_WORDS);
});

test('Schoolhouse selection and Elder proposals show the same impact law', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await seedProfile(page);
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await walkToSchoolhouse(page);
  await page.getByTestId('town-open-schoolhouse').click();

  await page.getByTestId('research-chart-node-chain_spark_primer').click();
  await expect(page.getByTestId('research-chart-impact-line')).toContainText('12%');
  await expect(page.getByTestId('research-chart-scope')).toHaveText('EVERY RUN');

  await page.getByTestId('research-chart-node-mother_lode_survey').click();
  await expect(page.getByTestId('research-chart-impact-line')).toContainText('Unlocks: Mother Lode Survey');
  await expect(page.getByTestId('research-chart-impact-line')).toContainText('Long claims start building toward better seam returns.');
  await expect(page.getByTestId('research-chart-impact-line')).toContainText('Arrives with a future Frontier update.');
  await expect(page.getByTestId('research-chart-scope')).toHaveText('THE TOWN');
  await expect(page.getByTestId('research-chart')).not.toContainText(RETIRED_RESEARCH_WORDS);
  await shot(page, testInfo, 'schoolhouse-unlock-impact');

  await page.goto('/?debug&timescale=8&nowaves&nolevel&seed=research-impact-law');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    window.__GR_TEST__?.teleport(0, 12);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0 });
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 8_000 }).toBe('dead');

  for (const index of [0, 1]) {
    const card = page.getByTestId(`research-card-${index}`);
    const id = await card.getAttribute('data-research-id');
    const impact = deriveResearchImpact(researchNodeById[id!]);
    await expect(page.getByTestId(`research-effect-${index}`)).toHaveText(`Effect: ${impact.line}`);
    await expect(page.getByTestId(`research-scope-${index}`)).toHaveText(impact.scope);
  }
  await expect(page.getByTestId('research-overlay')).not.toContainText(RETIRED_RESEARCH_WORDS);
  await shotElement(page.getByTestId('research-overlay'), testInfo, 'elder-proposal-impact');
  expect(errors).toEqual({ console: [], page: [] });
});

function collectErrors(page: Page): { console: string[]; page: string[] } {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text()));
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, metaKey, researchKey, scoreKey, townKey }) => {
      if (sessionStorage.getItem('research-impact-law-seeded') === 'true') return;
      localStorage.clear();
      sessionStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(profile));
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } }));
      localStorage.setItem(researchKey, JSON.stringify({ version: 1, taken: [], proposalSalt: 0, pinnedTarget: null }));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.removeItem(scoreKey);
      sessionStorage.setItem('research-impact-law-seeded', 'true');
    },
    {
      profileKey: PROFILE_KEY,
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      researchKey: profileDataKey('robin', RESEARCH_STATE_KEY),
      scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
    },
  );
}

async function walkToSchoolhouse(page: Page): Promise<void> {
  for (let step = 0; step < 48; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === 'schoolhouse') return;
    const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 });
    const keys: string[] = [];
    if (Math.abs(SCHOOLHOUSE.x - position.x) > 0.6) keys.push(SCHOOLHOUSE.x > position.x ? 'KeyD' : 'KeyA');
    if (Math.abs(SCHOOLHOUSE.z - position.z) > 0.6) keys.push(SCHOOLHOUSE.z > position.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(160);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('schoolhouse');
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

async function shotElement(element: ReturnType<Page['getByTestId']>, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await element.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png` });
}
