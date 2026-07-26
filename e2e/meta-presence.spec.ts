import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { SCOREBOARD_KEY } from '../src/game/ProfileStorage';
import { RESEARCH_STATE_KEY } from '../src/meta/ResearchTree';

const SHOT_DIR = 'artifacts/meta-presence';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const MAX_EXCEPT_PROSPECTING = {
  double_tap_coil: Balance.upgrades.doubleTapCoilMaxStacks,
  heavy_spark: 3,
  long_resonator: 2,
  split_spark: 2,
  tinkers_plating: 3,
  spring_heels: 3,
  pan_legend: 2,
  powder_charge: 2,
  wide_ring: 2,
  quick_fuse: 2,
};
const MAX_EXCEPT_RICH_SEAM = { ...MAX_EXCEPT_PROSPECTING, prospectors_luck: 2 };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(
  page: Page,
  taken: string[],
  territory: number,
  query: string,
  scienceSteps = taken.length,
): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ metaKey, researchKey, scoreKey, takenNodes, territorySteps, science }) => {
      localStorage.removeItem(scoreKey);
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          version: 1,
          tracks: { territory: territorySteps, science, hero: 0, agent: 0 },
        }),
      );
      localStorage.setItem(researchKey, JSON.stringify({ version: 1, taken: takenNodes, proposalSalt: 0 }));
    },
    {
      metaKey: META_PROGRESS_KEY,
      researchKey: RESEARCH_STATE_KEY,
      scoreKey: SCOREBOARD_KEY,
      takenNodes: taken,
      territorySteps: territory,
      science: scienceSteps,
    },
  );
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.addStyleTag({ content: '.lil-gui { display: none !important; }' });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

async function openProspectingOffer(page: Page): Promise<void> {
  await page.evaluate((stacks) => {
    window.__GR_TEST__?.setFillersDisabled(true);
    window.__GR_TEST__?.setUpgradeStacks(stacks);
    window.__GR_TEST__?.grantXp(50);
  }, MAX_EXCEPT_PROSPECTING);
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
  await expect(page.locator('[data-upgrade-id="prospectors_luck"]')).toBeVisible();
}

async function openRichSeamOffer(page: Page): Promise<void> {
  await page.evaluate((stacks) => {
    window.__GR_TEST__?.setFillersDisabled(true);
    window.__GR_TEST__?.setUpgradeStacks(stacks);
    window.__GR_TEST__?.grantXp(50);
  }, MAX_EXCEPT_RICH_SEAM);
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
  await expect(page.locator('[data-upgrade-id="rich_seam_pact"]')).toBeVisible();
}

async function triggerSecureClaim(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('run.secureWave', 1);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.25);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 0);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.resetRun();
  });
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 10_000 });
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('earned meta is visible in run recap, pause ledger, and boosted cards', async ({ page }, testInfo) => {
  const errors = await openGame(
    page,
    ['assay_grading', 'second_order_slot'],
    3,
    '?debug&timescale=3&nowaves&seed=meta-presence',
  );

  const recap = page.getByTestId('run-meta-recap');
  await expect(recap).toBeVisible();
  await expect(recap).toHaveText(
    `Your claim remembers: palisade ring (Territory III) | Prospecting cards +${Balance.research.assayGradingStockpileCapBonus} cap/stack (Assay Grading) | +1 order slot (Second Order Slot)`,
  );
  await shot(page, testInfo, 'recap-banner');

  await page.keyboard.press('KeyP');
  await expect(page.getByTestId('pause-meta-panel')).toBeVisible();
  await expect(page.getByTestId('pause-meta-panel')).toHaveCSS('pointer-events', 'auto');
  await expect(page.getByTestId('pause-meta-panel')).toHaveCSS('overflow-y', 'auto');
  await expect(page.getByTestId('pause-meta-science')).toHaveText('Science: 2/6 steps; banked +0');
  await expect(page.getByTestId('pause-meta-territory')).toHaveText('Territory III: palisade ring active (8 segments)');
  await expect(page.getByTestId('pause-meta-boons')).toContainText('Assay Grading');
  await expect(page.getByTestId('pause-meta-boons')).toContainText('+35 stockpile cap');
  await expect(page.getByTestId('pause-meta-boons')).toContainText('Second Order Slot');
  await expect(page.getByTestId('pause-meta-mastery')).toContainText('Firerate mastery');
  await expect(page.getByTestId('pause-meta-mastery')).toContainText(
    `0/${Balance.upgrades.doubleTapCoilMaxStacks} stacks toward Spark Pressure Ring`,
  );
  await shot(page, testInfo, 'pause-panel');

  await page.keyboard.press('KeyP');
  await expect(page.getByTestId('pause-meta-panel')).toBeHidden();
  await openProspectingOffer(page);
  await expect(page.getByTestId('upgrade-provenance-badge')).toBeVisible();
  await expect(page.getByTestId('upgrade-provenance-0')).toHaveText(
    `Assay Grading raised Prospecting - +${Balance.research.assayGradingStockpileCapBonus} stockpile cap rides seam cards.`,
  );
  await shot(page, testInfo, 'badged-card');
  assertNoErrors(errors);
});

test('gated prospecting cards keep assay provenance when both research perks apply', async ({ page }) => {
  const errors = await openGame(page, ['assay_grading', 'pact_ledger'], 0, '?debug&timescale=3&nowaves&seed=meta-presence-rich');

  await openRichSeamOffer(page);
  const richSeam = page.locator('[data-upgrade-id="rich_seam_pact"]');
  await expect(richSeam.getByTestId('upgrade-provenance-badge')).toBeVisible();
  await expect(richSeam.locator('.upgrade-card__provenance')).toContainText('Pact Ledger opened Rich Seam Pact');
  await expect(richSeam.locator('.upgrade-card__provenance')).toContainText(
    `Assay Grading raised Prospecting - +${Balance.research.assayGradingStockpileCapBonus} stockpile cap rides seam cards.`,
  );
  assertNoErrors(errors);
});

test('conditional research recap copy does not imply a run-start stat', async ({ page }) => {
  const errors = await openGame(page, ['agent_schooling'], 0, '?debug&timescale=3&nowaves&seed=meta-presence-agent');

  await expect(page.getByTestId('run-meta-recap')).toHaveText(
    'Your claim remembers: Agent Schooling card after wave 15 (+1 policy slot)',
  );
  await expect(page.getByTestId('run-meta-recap')).not.toContainText('+1 policy slot (Agent Schooling)');
  assertNoErrors(errors);
});

test('continued study recap matches the live run stat on first load', async ({ page }) => {
  const errors = await openGame(
    page,
    ['continued_study:stockpile_cap:6:0:0'],
    0,
    '?debug&timescale=3&nowaves&seed=meta-presence-continued',
    7,
  );

  await expect(page.getByTestId('run-meta-recap')).toHaveText(
    'Your claim remembers: +5 stockpile cap (Continued Study)',
  );
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.bankCap)).toBe(205);
  await page.keyboard.press('KeyP');
  await expect(page.getByTestId('pause-meta-boons')).toContainText('Continued Study: Stockpile Ledger');
  await expect(page.getByTestId('pause-meta-boons')).toContainText('+5 stockpile cap');
  assertNoErrors(errors);
});

test('fresh profile shows no false meta recap or card provenance', async ({ page }) => {
  const errors = await openGame(page, [], 0, '?debug&timescale=3&nowaves&seed=meta-presence-fresh');
  await expect(page.getByTestId('run-meta-recap')).toBeHidden();

  await openProspectingOffer(page);
  await expect(page.getByTestId('upgrade-provenance-badge')).toHaveCount(0);
  await expect(page.locator('.upgrade-card__provenance')).toHaveCount(0);
  assertNoErrors(errors);
});

test('stay for the rush does not call newly banked territory active', async ({ page }) => {
  const errors = await openGame(page, [], 0, '?debug&timescale=8&seed=meta-presence-rush');
  await triggerSecureClaim(page);
  await page.getByTestId('stay-for-rush').click();
  await expect(page.getByTestId('claim-secured')).toBeHidden();

  await page.keyboard.press('KeyP');
  await expect(page.getByTestId('pause-meta-panel')).toBeVisible();
  await expect(page.getByTestId('pause-meta-territory')).toHaveText(
    `Territory 0/${Balance.meta.territoryTier1}: palisade ring not earned`,
  );
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.meta?.tracks.territory)).toBe(1);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisades)).resolves.toBe(0);
  assertNoErrors(errors);
});

test('combat hit-pause does not open the claim memory ledger', async ({ page }) => {
  const errors = await openGame(page, [], 0, '?debug&nowaves&seed=meta-presence-hit-pause');
  await page.evaluate(() => {
    const w = window as unknown as {
      __metaHitPauseTrack: { sawCharmPause: boolean; sawLedgerDuringCharm: boolean };
    };
    w.__metaHitPauseTrack = { sawCharmPause: false, sawLedgerDuringCharm: false };
    const tick = () => {
      if (window.__THREE_GAME_DIAGNOSTICS__?.charmPause) {
        w.__metaHitPauseTrack.sawCharmPause = true;
        const panel = document.querySelector<HTMLElement>('[data-testid="pause-meta-panel"]');
        if (panel && !panel.hidden) w.__metaHitPauseTrack.sawLedgerDuringCharm = true;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('charm.hitPauseMs', 500);
    window.__GR_TEST__?.spawnPack(1, 8);
  });

  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __metaHitPauseTrack: { sawCharmPause: boolean } }).__metaHitPauseTrack.sawCharmPause,
      ),
    )
    .toBe(true);
  await expect(
    page.evaluate(
      () =>
        (window as unknown as { __metaHitPauseTrack: { sawLedgerDuringCharm: boolean } }).__metaHitPauseTrack
          .sawLedgerDuringCharm,
    ),
  ).resolves.toBe(false);
  assertNoErrors(errors);
});

test('secured new claim shows recap after research ledger closes', async ({ page }) => {
  const errors = await openGame(page, [], 0, '?debug&timescale=8&seed=meta-presence-secured');
  await triggerSecureClaim(page);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('run.secureWave', 999);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
  });
  await page.getByTestId('bank-secured-claim').click();

  await expect(page.getByTestId('research-overlay')).toBeVisible();
  await expect(page.getByTestId('run-meta-recap')).toBeHidden();
  await page.getByTestId('run-secondary-action').click();
  await expect(page.getByTestId('death-overlay')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByTestId('run-meta-recap')).toBeVisible();
  await expect(page.getByTestId('run-meta-recap')).toContainText('palisade ring (Territory I)');
  assertNoErrors(errors);
});
