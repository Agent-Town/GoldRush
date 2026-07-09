import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { RESEARCH_NODES, RESEARCH_STATE_KEY, STEAMWORKS_THRESHOLD } from '../src/meta/ResearchTree';
import { RESEARCH_NODE_ICON_KEYS } from '../src/ui/ResearchChart';

const SHOT_DIR = 'artifacts/060';
const SEEDED_TAKEN = ['assay_grading', 'mother_lode_survey', 'chain_spark_primer'];
const SCHOOLHOUSE = { x: -8.2, z: 5.4 };

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedResearch(
  page: Page,
  taken: string[],
  options: { science?: number; pinnedTarget?: string | null; proposalSalt?: number } = {},
): Promise<void> {
  await page.addInitScript(
    ({ profileKey, metaKey, researchKey, scoreKey, townKey, takenNodes, science, pinnedTarget, proposalSalt }) => {
      if (sessionStorage.getItem('research-chart-seeded') === 'true') return;
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(
        metaKey,
        JSON.stringify({ version: 1, tracks: { territory: 0, science, hero: 0, agent: 0 } }),
      );
      localStorage.setItem(researchKey, JSON.stringify({ version: 1, taken: takenNodes, proposalSalt, pinnedTarget }));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.removeItem(scoreKey);
      sessionStorage.setItem('research-chart-seeded', 'true');
    },
    {
      profileKey: PROFILE_KEY,
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      researchKey: profileDataKey('robin', RESEARCH_STATE_KEY),
      scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      takenNodes: taken,
      science: options.science ?? taken.length,
      pinnedTarget: options.pinnedTarget ?? null,
      proposalSalt: options.proposalSalt ?? 0,
    },
  );
}

async function openChart(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await walkTo(page, SCHOOLHOUSE, 'schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
  await expect(page.getByTestId('research-chart')).toBeVisible();
}

async function walkTo(page: Page, target: { x: number; z: number }, prompt: 'schoolhouse'): Promise<void> {
  for (let step = 0; step < 48; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === prompt) return;
    const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 });
    const keys = [];
    if (Math.abs(target.x - position.x) > 0.6) keys.push(target.x > position.x ? 'KeyD' : 'KeyA');
    if (Math.abs(target.z - position.z) > 0.6) keys.push(target.z > position.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(160);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 2_000 }).toBe(prompt);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

async function killFast(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    window.__GR_TEST__?.teleport(0, 12);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0 });
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 8_000 }).toBe('dead');
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('survey chart renders node states, traces locked requirements, and persists one pin', async ({ page }, testInfo) => {
  await seedResearch(page, SEEDED_TAKEN);
  const errors = collectErrors(page);
  await openChart(page);

  await expect(page.locator('[data-testid^="research-branch-icon-"]')).toHaveCount(3);
  await expect(page.locator('[data-survey-line]')).toHaveCount(
    RESEARCH_NODES.filter((node) => 'requires' in node && node.requires.length > 0).length,
  );
  for (const node of RESEARCH_NODES) {
    await expect(page.getByTestId(`research-chart-icon-${node.id}`)).toHaveAttribute(
      'data-research-icon-key',
      RESEARCH_NODE_ICON_KEYS[node.id],
    );
  }
  const repeatedEffects = await page.locator('[data-research-node]').evaluateAll((nodes) =>
    nodes.flatMap((node) => {
      const effect = node.querySelector('.research-chart__effect')?.textContent?.trim() ?? '';
      const count = effect ? (node.textContent ?? '').split(effect).length - 1 : 0;
      return count === 1 ? [] : [node.getAttribute('data-research-node') ?? 'unknown'];
    }),
  );
  expect(repeatedEffects).toEqual([]);
  await expect(page.getByTestId('research-chart-node-assay_grading')).toHaveAttribute('data-research-state', 'taken');
  await expect(page.getByTestId('research-chart-node-sluice_accounting')).toHaveAttribute('data-research-state', 'available');
  await expect(page.getByTestId('research-chart-node-claim_map_table')).toHaveAttribute('data-research-state', 'locked');
  await expect(page.getByTestId('research-chart-node-assay_grading')).toContainText('SURVEYED');
  const visualStates = await page.evaluate(() => {
    const styles = (id: string) => {
      const element = document.querySelector<HTMLElement>(`[data-research-node="${id}"]`);
      if (!element) return null;
      const computed = getComputedStyle(element);
      return { borderColor: computed.borderColor, opacity: Number(computed.opacity) };
    };
    return {
      taken: styles('assay_grading'),
      available: styles('sluice_accounting'),
      locked: styles('claim_map_table'),
    };
  });
  expect(visualStates.taken?.borderColor).not.toBe(visualStates.available?.borderColor);
  expect(visualStates.available?.borderColor).not.toBe(visualStates.locked?.borderColor);
  expect(visualStates.locked?.opacity).toBeLessThan(1);
  await expect(page.getByTestId('research-next-epoch')).toContainText('awaits the town');
  await shot(page, testInfo, 'chart-overview');

  await page.getByTestId('research-chart-node-claim_map_table').click();
  await expect(page.getByTestId('research-chart-distance')).toHaveText('2 picks away');
  await expect(page.getByTestId('research-chart-node-sluice_accounting')).toHaveAttribute('data-selected-path', 'true');
  await page.getByTestId('research-chart-pin').click();
  await expect(page.getByTestId('research-chart-pin-mark')).toBeVisible();
  await expect(
    page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').pinnedTarget, profileDataKey('robin', RESEARCH_STATE_KEY)),
  ).resolves.toBe('claim_map_table');
  await shot(page, testInfo, 'pinned-path-highlight');

  await page.reload();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await walkTo(page, SCHOOLHOUSE, 'schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
  await expect(page.getByTestId('research-chart-pin-mark')).toBeVisible();
  assertNoErrors(errors);
});

test('pinned path marks post-run proposals without auto-picking', async ({ page }) => {
  await seedResearch(page, SEEDED_TAKEN, { pinnedTarget: 'claim_map_table', proposalSalt: 0 });
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&seed=research-chart-pin');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await killFast(page);
  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await expect(page.locator('[data-testid^="research-pin-hint-"]').first()).toHaveText('on your surveyed route');
  await expect(page.locator('[data-research-id="sluice_accounting"]')).toBeVisible();
  assertNoErrors(errors);
});

test('fresh profile chart has no false marks', async ({ page }) => {
  const errors = collectErrors(page);
  await seedResearch(page, []);
  await openChart(page);
  await expect(page.locator('[data-research-state="taken"]')).toHaveCount(0);
  await expect(page.getByTestId('research-chart-pin-mark')).toHaveCount(0);
  assertNoErrors(errors);
});

test('exhausted frontier shows Continued Study stack and banked overflow', async ({ page }) => {
  const taken = RESEARCH_NODES.map((node) => node.id);
  await seedResearch(page, taken, { science: STEAMWORKS_THRESHOLD + 2 });
  const errors = collectErrors(page);
  await openChart(page);

  await expect(page.getByTestId('continued-study-stack')).toBeVisible();
  await expect(page.getByTestId('science-banked')).toHaveText('banked: +2 toward the Steamworks');
  assertNoErrors(errors);
});
