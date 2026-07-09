import { mkdirSync } from 'node:fs';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { OrientationResolver } from '../src/assets/OrientationResolver';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Point = { x: number; z: number };
type SpriteSnapshot = {
  clip: string;
  frame: number;
  frameKey: string;
  sourceFrameKey?: string;
  frameCount: number;
  fps: number;
  loaded: boolean;
  direction?: string;
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
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

async function saveShot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync('artifacts/m4-re-land', { recursive: true });
  await page.screenshot({ path: `artifacts/m4-re-land/${testInfo.project.name}-${name}.png`, fullPage: true });
}

async function saveM407Shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync('artifacts/m4-07', { recursive: true });
  await page.screenshot({ path: `artifacts/m4-07/${testInfo.project.name}-${name}.png`, fullPage: true });
}

async function savePresenceShot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync('artifacts/prospector-presence', { recursive: true });
  await page.screenshot({ path: `artifacts/prospector-presence/${testInfo.project.name}-${name}.png`, fullPage: true });
}

async function hideDebugGui(page: Page): Promise<void> {
  await page.evaluate(() => {
    const gui = document.querySelector<HTMLElement>('.lil-gui');
    if (gui) gui.style.display = 'none';
  });
}

async function companion(page: Page): Promise<{
  visible: boolean;
  moving: boolean;
  drifting: boolean;
  working: boolean;
  receiptCount: number;
  lastReceiptTool: string | null;
  lastLine: string | null;
  position: { x: number; y: number; z: number };
  target: Point;
  terrainY: number;
  clearance: number;
}> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment);
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function terrainZone(point: Point): 'bank' | 'shallows' | 'river' | 'ford' | 'out' {
  if (point.x < -32 || point.x > 32 || point.z < -32 || point.z > 32) return 'out';
  if (point.x >= -3 && point.x <= 3 && point.z >= -5 && point.z <= 5) return 'ford';
  if (point.z >= -5 && point.z <= 5) return 'river';
  if ((point.z > 5 && point.z <= 6.25) || (point.z < -5 && point.z >= -6.25)) return 'shallows';
  return 'bank';
}

async function waitForProspectorSprite(page: Page, timeout = 5_000): Promise<SpriteSnapshot> {
  await page.waitForFunction(() => {
    const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent'];
    return (
      snapshot?.loaded === true &&
      snapshot.frameCount === 8 &&
      (snapshot.sourceFrameKey ?? snapshot.frameKey).startsWith('char-prospector-sheet-hover8-')
    );
  }, undefined, { timeout });
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.spriteAnimations['char.prospector_agent'] as SpriteSnapshot);
}

async function sampleProspectorFrameAdvances(page: Page, sampleMs: number): Promise<{ advances: number; samples: number }> {
  return page.evaluate(async (durationMs) => {
    const frames: number[] = [];
    const deadline = performance.now() + durationMs;
    await new Promise<void>((resolve) => {
      const tick = () => {
        const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
        const sprite = diagnostics?.spriteAnimations['char.prospector_agent'];
        if (diagnostics?.agent.embodiment.moving && sprite?.clip === 'walk') frames.push(sprite.frame);
        if (performance.now() >= deadline || diagnostics?.agent.embodiment.moving !== true) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    const advances = frames.reduce((count, frame, index) => count + (index > 0 && frame !== frames[index - 1] ? 1 : 0), 0);
    return { advances, samples: frames.length };
  }, sampleMs);
}

function expectedDirection(dx: number, dz: number): string {
  return new OrientationResolver().resolve(dx, dz);
}

function minProspectorClearance(): number {
  return Balance.agent.spriteScale * 0.5 + 0.08;
}

test('plain boot renders the Prospector near the claim with no debug gate', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?nowaves&nolevel&seed=m4-06-plain');
  const intro = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcement ?? '');

  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.embodiment.visible ?? false), {
      timeout: 2_000,
    })
    .toBe(true);
  await waitForProspectorSprite(page, 2_000);
  const snap = await companion(page);
  const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
  expect(distance(snap.position, hero)).toBeGreaterThan(1.2);
  expect(distance(snap.position, hero)).toBeLessThan(3.1);
  expect(snap.position.y).toBeGreaterThanOrEqual(snap.terrainY + minProspectorClearance());
  expect(snap.clearance).toBeGreaterThanOrEqual(minProspectorClearance());
  expect(snap.moving).toBe(false);
  expect(snap.receiptCount).toBeGreaterThanOrEqual(1);
  expect(intro).toContain('the Prospector');
  expect(intro).toContain('Chip by weapon');
  await expect(page.getByTestId('hud-wave')).toContainText('the Prospector');
  await expect(page.getByTestId('hud-agent')).toContainText('L0');
  await expect(page.getByTestId('hud-agent')).toContainText('suggest-only');

  const introSample = await page.evaluate(() => ({
    text: window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcement,
    at: window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcementAt,
  }));
  await page.waitForTimeout(650);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcementAt ?? -1), { timeout: 1_000 })
    .toBe(introSample.at);

  await savePresenceShot(page, testInfo, 'idle-beside-hero');
  await savePresenceShot(page, testInfo, 'first-contact-beat');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('permission chip shows portrait, current level, abilities, and growth path', async ({ page }, testInfo) => {
  await setAgentLevel(page, 1);
  const errors = await openGame(page, '?nowaves&nolevel&seed=prospector-chip');
  const chip = page.getByTestId('hud-agent');

  await expect(chip.locator('[data-hud-agent-portrait]')).toBeVisible();
  await expect(chip).toContainText('L1');
  await expect(chip).toContainText('approval-required');
  await chip.click();
  await expect(chip).toHaveAttribute('aria-expanded', 'true');
  await expect(chip.locator('[data-hud-agent-detail]')).toContainText('Can gather XP motes');
  await expect(chip.locator('[data-hud-agent-detail]')).toContainText('Grows when secured claims add agent progress');

  await savePresenceShot(page, testInfo, 'chip');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Prospector floats above terrain while following hero probe points', async ({ page }) => {
  const errors = await openGame(page, '?debug&nowaves&nolevel&seed=prospector-clearance');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  const probes = [
    { x: 0, z: 12 },
    { x: -5, z: 18 },
    { x: 5, z: 6.5 },
    { x: 5, z: 5.5 },
  ];

  for (const probe of probes) {
    await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x, z), probe);
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const hero = window.__THREE_GAME_DIAGNOSTICS__!.heroPos;
            const body = window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment.position;
            return Math.hypot(body.x - hero.x, body.z - hero.z);
          }),
        { timeout: 8_000 },
      )
      .toBeLessThan(3.15);
    const snap = await companion(page);
    expect(snap.position.y).toBeGreaterThanOrEqual(snap.terrainY + minProspectorClearance());
    expect(snap.clearance).toBeGreaterThanOrEqual(minProspectorClearance());
    expect(terrainZone(snap.position)).not.toBe('river');
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('normal play Prospector gathers XP motes when permission allows', async ({ page }, testInfo) => {
  await setAgentLevel(page, 1);
  const errors = await openGame(page, '?stress=2&timescale=10&nolevel&seed=prospector-normal-xp');
  await waitForProspectorSprite(page);

  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.motesCollected ?? 0), {
      timeout: 18_000,
    })
    .toBeGreaterThan(0);
  await expect(page.getByTestId('hud-agent-feed')).toContainText('Gather');
  const snap = await companion(page);
  expect(snap.lastLine).toMatch(/motes|sweep|spark/);

  await savePresenceShot(page, testInfo, 'xp-gather');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Prospector defers XP gathering while a higher-priority receipt is active', async ({ page }) => {
  await setAgentLevel(page, 2);
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&seed=prospector-xp-priority');
  await page.waitForFunction(() => Boolean(window.__GR_AGENT__));
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('agent.xpMoteAgeS', 0.05);
    window.__GR_TEST__?.setBalance('enemy.speed', 0);
  });

  const route = await page.evaluate(() => {
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
  expect(route).toBeTruthy();
  const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), route!.id);
  expect((receipt as { tool?: string } | undefined)?.tool).toBe('et.goldrush.pan_at');
  await expect.poll(() => companion(page).then((snap) => snap.moving), { timeout: 2_000 }).toBe(true);

  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-8, 12))).resolves.toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.motesSpawned ?? 0), { timeout: 8_000 })
    .toBeGreaterThan(0);
  await page.waitForTimeout(1_200);

  const snap = await companion(page);
  expect(snap.lastReceiptTool).toBe('et.goldrush.pan_at');
  expect(distance(snap.target, route!.position)).toBeLessThan(0.01);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.motesCollected ?? 0)).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('real Prospector sprite loads and faces pan movement', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto('/?nowaves&nolevel&seed=m4-07-plain-sprite');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const idle = await waitForProspectorSprite(page);
  expect(['idle', 'walk']).toContain(idle.clip);
  expect(idle.fps).toBe(8);
  expect(idle.frameKey).not.toContain('createProspectorTexture');
  await saveM407Shot(page, testInfo, 'idle');

  await page.evaluate((agentLevel) => {
    localStorage.setItem(
      'gr.meta.v1',
      JSON.stringify({
        version: 1,
        tracks: { territory: 0, science: 0, hero: 0, agent: agentLevel },
      }),
    );
  }, 2);
  await page.goto('/?debug&timescale=4&nowaves&nolevel&seed=m4-07-drive-sprite');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.waitForFunction(() => Boolean(window.__GR_AGENT__));
  await hideDebugGui(page);
  await waitForProspectorSprite(page);

  const routes = await page.evaluate(() => {
    const start = window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment.position;
    const nodes = window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.filter((node) => node.active);
    return nodes
      .map((node) => {
        const dx = node.position.x - start.x;
        const dz = node.position.z - start.z;
        return {
          id: node.id,
          position: node.position,
          distance: Math.hypot(dx, dz),
          dx,
          dz,
        };
      })
      .sort((a, b) => b.distance - a.distance);
  });
  const route = routes.find((node) => node.distance > 1 && expectedDirection(node.dx, node.dz) !== 's') ?? null;
  if (!route) throw new Error('No active pan node can exercise non-south Prospector facing.');
  const direction = expectedDirection(route.dx, route.dz);

  const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), route.id);
  expect((receipt as { tool?: string } | undefined)?.tool).toBe('et.goldrush.pan_at');
  await page.waitForFunction(
    (direction) => {
      const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent'];
      const body = window.__THREE_GAME_DIAGNOSTICS__?.agent.embodiment;
      return (
        body?.moving === true &&
        sprite?.loaded === true &&
        sprite.clip === 'walk' &&
        sprite.direction === direction &&
        (sprite.sourceFrameKey ?? sprite.frameKey).startsWith('char-prospector-sheet-hover8-')
      );
    },
    direction,
  );
  const rate = await sampleProspectorFrameAdvances(page, 950);
  expect(rate.samples).toBeGreaterThan(8);
  expect(rate.advances).toBeGreaterThanOrEqual(5);
  expect(rate.advances).toBeLessThanOrEqual(10);
  await saveM407Shot(page, testInfo, 'mid-action');

  const moving = await companion(page);
  expect(distance(moving.target, route.position)).toBeLessThan(0.01);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('debug receipt moves the Prospector toward a panning target and floats ledger voice', async ({ page }, testInfo) => {
  await setAgentLevel(page, 2);
  const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&seed=m4-06-pan');
  await page.waitForFunction(() => Boolean(window.__GR_AGENT__));
  await hideDebugGui(page);

  await expect(page.getByTestId('hud-agent')).toContainText('L2');
  await expect(page.getByTestId('hud-agent')).toContainText('trusted-routine');

  const before = await companion(page);
  const node = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active));
  expect(node).toBeTruthy();
  const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), node!.id);
  expect((receipt as { tool?: string } | undefined)?.tool).toBe('et.goldrush.pan_at');

  await expect
    .poll(() => companion(page).then((snap) => distance(snap.position, before.position)), { timeout: 8_000 })
    .toBeGreaterThan(0.3);
  const mid = await companion(page);
  expect(distance(mid.target, node!.position)).toBeLessThan(0.01);
  expect(mid.lastLine).toBe('pan...');
  await expect(page.getByTestId('hud-agent-feed')).toContainText('Pan');
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0), { timeout: 2_000 })
    .toBeGreaterThan(0);

  await saveShot(page, testInfo, 'mid-action');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('permission-denied receipts do not send the Prospector to the denied target', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&seed=m4-06-denied');
  await page.waitForFunction(() => Boolean(window.__GR_AGENT__));
  const before = await companion(page);
  const node = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active));
  expect(node).toBeTruthy();

  const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), node!.id);
  expect((receipt as { outcome?: { ok?: boolean; reason?: string } } | undefined)?.outcome).toMatchObject({
    ok: false,
    reason: 'PERMISSION_DENIED',
  });
  await page.waitForTimeout(350);
  const after = await companion(page);

  expect(distance(after.position, before.position)).toBeLessThan(0.45);
  expect(after.moving).toBe(false);
  expect(distance(after.target, before.target)).toBeLessThan(0.01);
  expect(distance(after.target, node!.position)).toBeGreaterThan(0.5);
  expect(['held', 'ask me', 'no trust']).toContain(after.lastLine);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('the Prospector has no collider for scripted enemy movement', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=1&nowaves&nokill&nolevel&seed=m4-06-collider');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.formationSpreadWidth', 0))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.formationSeparationStrength', 0))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.teleport(12, 12));
  const snap = await companion(page);
  const start = { x: snap.position.x - 4, z: snap.position.z };
  const target = { x: snap.position.x + 4, z: snap.position.z };

  await expect(
    page.evaluate(
      ({ x, z, tx, tz }) => window.__GR_TEST__?.scriptEnemyAt(x, z, tx, tz, 2),
      { x: start.x, z: start.z, tx: target.x, tz: target.z },
    ),
  ).resolves.toBe(true);

  await page.evaluate(
    ({ companionPoint, targetPoint }) => {
      const w = window as unknown as {
        __M4_06_PATH__?: { reached: boolean; samples: number; minCompanionDistance: number; maxZDeviation: number };
      };
      w.__M4_06_PATH__ = {
        reached: false,
        samples: 0,
        minCompanionDistance: Number.POSITIVE_INFINITY,
        maxZDeviation: 0,
      };
      const tick = () => {
        const track = w.__M4_06_PATH__!;
        const enemy = window.__GR_TEST__?.enemyPositions()[0];
        if (enemy) {
          track.samples += 1;
          track.minCompanionDistance = Math.min(
            track.minCompanionDistance,
            Math.hypot(enemy.x - companionPoint.x, enemy.z - companionPoint.z),
          );
          track.maxZDeviation = Math.max(track.maxZDeviation, Math.abs(enemy.z - companionPoint.z));
          if (Math.hypot(enemy.x - targetPoint.x, enemy.z - targetPoint.z) < 0.45) track.reached = true;
        }
        if (!track.reached) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    { companionPoint: snap.position, targetPoint: target },
  );

  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __M4_06_PATH__?: { reached: boolean } }).__M4_06_PATH__?.reached ?? false), {
      timeout: 10_000,
    })
    .toBe(true);
  const path = await page.evaluate(() =>
    (window as unknown as {
      __M4_06_PATH__?: { samples: number; minCompanionDistance: number; maxZDeviation: number };
    }).__M4_06_PATH__
  );
  expect(path?.samples ?? 0).toBeGreaterThan(0);
  expect(path?.minCompanionDistance ?? 99).toBeLessThan(0.35);
  expect(path?.maxZDeviation ?? 99).toBeLessThan(0.2);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
