import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const QUERY = '/?debug&contract=e1-baron&nowaves&nolevel&nopause&nosteal&nowreck&seed=boss-healthbar';
const SHOT_DIR = path.resolve('reviews/shots-bossbar');

test('boss damage leaves green life over red loss', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await dismissBriefing(page);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.spawnPack(1, 8, { eliteKind: 'baron', hpScale: 240, speedScale: 0, visualScale: 4, banner: true });
    const snapshot = structuredClone(test.captureSuspend());
    const boss = snapshot.enemies.active.find((enemy) => enemy.eliteKind === 'baron');
    if (!boss) throw new Error('missing seeded boss');
    boss.hp = boss.maxHp * 0.625;
    if (!test.restoreSuspend(snapshot)) throw new Error('failed to apply seeded boss damage');
    test.advanceSim(1 / 30);
  });

  await expect(page.locator('#game-canvas')).toHaveAttribute('data-boss-bar-visible', 'true');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-boss-bar-semantic', 'health');
  const bar = await page.locator('#game-canvas').evaluate((canvas: HTMLCanvasElement) => ({
    remaining: Number(canvas.dataset.bossBarRemaining),
    depleted: Number(canvas.dataset.bossBarDepleted),
    remainingColor: canvas.dataset.bossBarRemainingColor,
    depletedColor: canvas.dataset.bossBarDepletedColor,
  }));
  expect(bar).toMatchObject({
    remainingColor: '#6bb36b',
    depletedColor: '#a0522d',
  });
  expect(bar.remaining).toBeGreaterThan(0);
  expect(bar.remaining).toBeLessThan(1);
  expect(bar.depleted).toBeCloseTo(1 - bar.remaining, 3);

  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-mid-fight.png`) });
  expect(errors).toEqual([]);
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function dismissBriefing(page: Page): Promise<void> {
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.click();
}
