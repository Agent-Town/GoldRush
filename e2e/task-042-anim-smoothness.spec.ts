import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('net::ERR_INSUFFICIENT_RESOURCES')) bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&seed=task-042-anim-smoothness');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function heroWalk(page: Page): Promise<void> {
  await page.keyboard.down('KeyS');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.clip === 'walk');
}

async function heroIdle(page: Page): Promise<void> {
  await page.keyboard.up('KeyS');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.clip === 'idle');
}

async function spriteSmoothness(page: Page, slot: string): Promise<{
  fps: number;
  stride: number;
  frame: number;
  frameCount: number;
  sourceFrameKey: string;
}> {
  return page.evaluate((wantedSlot) => {
    const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations[wantedSlot];
    return {
      fps: snapshot?.fps ?? 0,
      stride: snapshot?.strideUnitsPerCycle ?? 0,
      frame: snapshot?.frame ?? -1,
      frameCount: snapshot?.frameCount ?? 0,
      sourceFrameKey: snapshot?.sourceFrameKey ?? '',
    };
  }, slot);
}

test('walk cadence is speed-scaled and restart keeps phase', async ({ page }) => {
  const errors = await openGame(page);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('hero.decel', 999))).resolves.toBe(true);

  await heroWalk(page);
  await page.waitForFunction(() => {
    const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero'];
    return snapshot?.clip === 'walk' && snapshot.frameCount === 4 && (snapshot.frame ?? 0) > 0;
  });
  const heroBeforeStop = await spriteSmoothness(page, 'char.hero');
  await heroIdle(page);
  await heroWalk(page);
  await page.waitForTimeout(50);
  const heroRestart = await spriteSmoothness(page, 'char.hero');
  await heroIdle(page);

  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(-8, 7, 8, 7, 2.7);
  });
  await page.waitForFunction(
    () =>
      window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.bandit_base']?.clip === 'walk' &&
      window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.bandit_base']?.frameCount === 8,
  );
  const jumper = await spriteSmoothness(page, 'char.bandit_base');

  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(-8, 7, 8, 7, 5.4);
  });
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.bandit_base']?.fps ?? 0) > 12);
  const fastJumper = await spriteSmoothness(page, 'char.bandit_base');

  expect(heroBeforeStop.fps).toBeCloseTo(9.5, 1);
  expect(jumper.frameCount).toBe(8);
  expect(jumper.fps).toBeCloseTo(8.55, 1);
  expect(fastJumper.fps).toBeCloseTo(17.1, 2);
  expect(jumper.stride).toBeCloseTo(heroBeforeStop.stride, 1);
  expect(fastJumper.stride).toBeCloseTo(heroBeforeStop.stride, 1);
  expect(heroBeforeStop.sourceFrameKey).toContain('walk4');
  expect(jumper.sourceFrameKey).toContain('walk8');
  expect([heroBeforeStop.frame, (heroBeforeStop.frame + 1) % 4, (heroBeforeStop.frame + 2) % 4]).toContain(heroRestart.frame);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
