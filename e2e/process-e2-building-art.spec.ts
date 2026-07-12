import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const ARTIFACT_DIR = path.resolve('artifacts/process-e2-building-art');

test('Steamworks build and research UI use processed art', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nowaves&nolevel&nopause&seed=e2-art');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);

  await page.getByTestId('hud-build').click();
  const boiler = page.getByTestId('hud-build-tile-boiler_house');
  await expect(boiler).toHaveAttribute('data-asset-state', 'ready');
  await expect(boiler.locator('.hud-build-tile__icon')).toHaveCSS('background-image', /bld-boiler-house/);

  const icons = await page.evaluate(async () => {
    const contracts = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    const research = (await Function('return import("/src/ui/ResearchChart.ts")')()) as typeof import('../src/ui/ResearchChart');
    const state = { version: 1 as const, epochId: 'epoch-2-steamworks', taken: [], steps: 0, proposalSalt: 0, pinnedTarget: null, progress: { version: 1 as const, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } } };
    const host = document.createElement('div');
    host.dataset.testid = 'e2-icon-row';
    host.innerHTML = research.renderResearchChart(state);
    document.body.append(host);
    const buildingUrls = (await Function('return Promise.all([import("/assets/processed/bld-boiler-house.png?url"), import("/assets/processed/bld-rail-depot.png?url"), import("/assets/processed/bld-machine-shop.png?url")])')()) as Array<{ default: string }>;
    const buildings = document.createElement('div');
    buildings.dataset.testid = 'e2-building-row';
    buildings.style.cssText = 'position:fixed;inset:16px;z-index:9999;display:flex;gap:12px;background:#f5e6c8;padding:12px';
    for (const source of buildingUrls) {
      const image = document.createElement('img');
      image.src = source.default;
      image.style.cssText = 'width:min(30vw,384px);height:auto;object-fit:contain';
      buildings.append(image);
    }
    document.body.append(buildings);
    return contracts.loadEpoch('epoch-2-steamworks').research.branches.flatMap((branch) => branch.nodes.map((node) => node.iconKey));
  });
  expect(icons).toEqual(expect.arrayContaining(['ui.e2.boiler_lance', 'ui.e2.pressure_mortar', 'ui.e2.iron_wall', 'ui.e2.boiler_battery', 'ui.e2.pressure']));
  await expect(page.locator('[data-testid="e2-icon-row"] [data-research-icon-key^="ui.e2."]')).not.toHaveCount(0);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await expect(page.locator('[data-testid="e2-building-row"] img')).toHaveCount(3);
  await page.locator('[data-testid="e2-building-row"]').screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-buildings.png`) });
  await page.locator('[data-testid="e2-building-row"]').evaluate((element) => element.remove());
  await page.locator('[data-testid="e2-icon-row"]').screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-icon-row.png`) });
  expect(errors).toEqual([]);
});
