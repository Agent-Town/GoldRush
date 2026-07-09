import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

type SpriteSnapshot = {
  clip?: string;
  frame?: number;
  frameKey?: string;
  sourceFrameKey?: string;
  frameCount?: number;
  fps?: number;
  loaded?: boolean;
  strideUnitsPerCycle?: number;
};

type Route = {
  id: string;
  position: { x: number; z: number };
  distance: number;
};

const artifactDir = path.resolve('artifacts/066');

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('net::ERR_INSUFFICIENT_RESOURCES')) bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function setAgentLevel(page: Page, level: number): Promise<void> {
  await page.addInitScript((agentLevel) => {
    localStorage.setItem(
      'gr.meta.v1',
      JSON.stringify({
        version: 1,
        tracks: { territory: 0, science: 0, hero: 0, agent: agentLevel },
      }),
    );
  }, level);
}

async function openGame(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nolevel&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function saveShot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync(artifactDir, { recursive: true });
  await page.screenshot({ path: path.join(artifactDir, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function sprite(page: Page, slot: string): Promise<SpriteSnapshot> {
  return page.evaluate((wantedSlot) => {
    const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations[wantedSlot];
    return {
      clip: snapshot?.clip,
      frame: snapshot?.frame,
      frameKey: snapshot?.frameKey,
      sourceFrameKey: snapshot?.sourceFrameKey,
      frameCount: snapshot?.frameCount,
      fps: snapshot?.fps,
      loaded: snapshot?.loaded,
      strideUnitsPerCycle: snapshot?.strideUnitsPerCycle,
    };
  }, slot);
}

async function heroWalk(page: Page): Promise<SpriteSnapshot> {
  await page.keyboard.down('KeyS');
  await page.waitForFunction(
    () =>
      window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.clip === 'walk' &&
      window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.frameCount === 4,
  );
  return sprite(page, 'char.hero');
}

async function farthestPanRoute(page: Page): Promise<Route | null> {
  return page.evaluate(() => {
    const start = window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment.position;
    const nodes = window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.filter((node) => node.active);
    return (
      nodes
        .map((node) => ({
          id: node.id,
          position: node.position,
          distance: Math.hypot(node.position.x - start.x, node.position.z - start.z),
        }))
        .sort((a, b) => b.distance - a.distance)[0] ?? null
    );
  });
}

async function driveProspectorToFarthestPanNode(page: Page): Promise<Route> {
  await page.waitForFunction(() => Boolean(window.__GR_AGENT__));
  const route = await farthestPanRoute(page);
  expect(route).toBeTruthy();
  expect(route!.distance).toBeGreaterThan(3);
  const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), route!.id);
  expect((receipt as { tool?: string } | undefined)?.tool).toBe('et.goldrush.pan_at');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.embodiment.moving === true);
  return route!;
}

async function collectProspectorHover8Frames(page: Page, durationMs: number): Promise<{
  frameKeys: string[];
  frameColumns: number[];
  final: SpriteSnapshot;
}> {
  return page.evaluate(async (duration) => {
    const frameKeys: string[] = [];
    const frameColumns: number[] = [];
    const seen = new Set<string>();
    const start = performance.now();
    while (performance.now() - start < duration) {
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      const snapshot = diagnostics?.spriteAnimations['char.prospector_agent'];
      const key = snapshot?.sourceFrameKey ?? snapshot?.frameKey ?? '';
      if (
        diagnostics?.agent.embodiment.moving === true &&
        snapshot?.clip === 'walk' &&
        snapshot.frameCount === 8 &&
        key.startsWith('char-prospector-sheet-hover8-') &&
        !seen.has(key)
      ) {
        seen.add(key);
        frameKeys.push(key);
        frameColumns.push(Number.parseInt(key.match(/-r\d+c(\d+)\.png$/)?.[1] ?? '-1', 10));
      }
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    const final = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent'];
    return {
      frameKeys,
      frameColumns,
      final: {
        clip: final?.clip,
        frame: final?.frame,
        frameKey: final?.frameKey,
        sourceFrameKey: final?.sourceFrameKey,
        frameCount: final?.frameCount,
        fps: final?.fps,
        loaded: final?.loaded,
        strideUnitsPerCycle: final?.strideUnitsPerCycle,
      },
    };
  }, durationMs);
}

test('Prospector hover8 plays eight distinct frames while panning', async ({ page }, testInfo) => {
  await setAgentLevel(page, 2);
  const errors = await openGame(page, '066-prospector-hover8');
  await saveShot(page, testInfo, 'prospector-before-pan');

  await driveProspectorToFarthestPanNode(page);
  await page.waitForFunction(
    () =>
      window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent']?.clip === 'walk' &&
      window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent']?.frameCount === 8 &&
      (
        window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent']?.sourceFrameKey ??
        window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent']?.frameKey ??
        ''
      ).startsWith('char-prospector-sheet-hover8-'),
  );

  const sample = await collectProspectorHover8Frames(page, 1_400);
  await saveShot(page, testInfo, 'prospector-hover8-mid-action');
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(
    path.join(artifactDir, `${testInfo.project.name}-prospector-hover8-frame-probe.json`),
    JSON.stringify(sample, null, 2),
  );

  expect(new Set(sample.frameKeys).size).toBe(8);
  expect(new Set(sample.frameColumns)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
  expect(sample.frameKeys.every((key) => key.startsWith('char-prospector-sheet-hover8-'))).toBe(true);
  expect(sample.final.frameCount).toBe(8);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('hero stays on walk4 while walk8 cells are registered', async ({ page }, testInfo) => {
  const errors = await openGame(page, '066-hero-stays-walk4');
  const walking = await heroWalk(page);
  await saveShot(page, testInfo, 'hero-walk4-unchanged');
  await page.keyboard.up('KeyS');

  expect(walking.frameCount).toBe(4);
  expect(walking.fps).toBeCloseTo(9.5, 1);
  expect(walking.sourceFrameKey).toContain('char-hero-sheet-walk4-');
  expect(walking.sourceFrameKey).not.toContain('walk8');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Claim Jumper walk8 keeps the old stride duration at higher frame count', async ({ page }) => {
  const errors = await openGame(page, '066-jumper-walk8-cadence');
  const hero = await heroWalk(page);
  await page.keyboard.up('KeyS');

  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(-8, 7, 8, 7, 2.7);
  });
  await page.waitForFunction(
    () =>
      window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.claim_jumper']?.clip === 'walk' &&
      window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.claim_jumper']?.frameCount === 8,
  );
  const jumper = await sprite(page, 'char.claim_jumper');

  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(-8, 7, 8, 7, 5.4);
  });
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.claim_jumper']?.fps ?? 0) > 12);
  const fastJumper = await sprite(page, 'char.claim_jumper');

  expect(hero.frameCount).toBe(4);
  expect(hero.sourceFrameKey).toContain('char-hero-sheet-walk4-');
  expect(jumper.frameCount).toBe(8);
  expect(jumper.sourceFrameKey).toContain('char-jumper-sheet-walk8-');
  expect(jumper.fps).toBeCloseTo(8.55, 1);
  expect(fastJumper.fps).toBeCloseTo(17.1, 2);
  expect(jumper.strideUnitsPerCycle).toBeCloseTo(hero.strideUnitsPerCycle ?? 0, 1);
  expect(fastJumper.strideUnitsPerCycle).toBeCloseTo(hero.strideUnitsPerCycle ?? 0, 1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
