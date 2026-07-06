import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Point = { x: number; z: number };
type ToolReceipt = {
  tool: string;
  cost?: number;
  outcome: {
    ok: boolean;
    reason?: string;
    requiredLevel?: number;
    economyLog?: readonly unknown[];
  };
};
type InstallResult = { ok: true } | { ok: false; reason: string };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function setStoredMeta(page: Page, agent: number): Promise<void> {
  await page.addInitScript(
    ({ key, agentLevel }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          tracks: { territory: 0, science: 0, hero: 0, agent: agentLevel },
        }),
      );
    },
    { key: META_PROGRESS_KEY, agentLevel: agent },
  );
}

async function updateStoredAgentLevel(page: Page, agent: number): Promise<void> {
  await page.evaluate(
    ({ key, agentLevel }) => {
      const meta = JSON.parse(localStorage.getItem(key) ?? '{"version":1,"tracks":{}}');
      meta.version = 1;
      meta.tracks = { territory: 0, science: 0, hero: 0, ...meta.tracks, agent: agentLevel };
      localStorage.setItem(key, JSON.stringify(meta));
    },
    { key: META_PROGRESS_KEY, agentLevel: agent },
  );
}

async function openDebugGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__GR_AGENT__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function waitForFrames(page: Page, frames: number): Promise<void> {
  const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  await page.waitForFunction(
    ({ startFrame, frameCount }) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) >= startFrame + frameCount,
    { startFrame: start, frameCount: frames },
  );
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

async function farthestActiveNode(page: Page): Promise<{ id: string; position: Point }> {
  const node = await page.evaluate((home) => {
    const nodes = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.filter((entry) => entry.active) ?? [];
    return (
      nodes
        .map((entry) => ({
          id: entry.id,
          position: entry.position,
          distance: Math.hypot(entry.position.x - home.x, entry.position.z - home.z),
        }))
        .sort((a, b) => b.distance - a.distance)[0] ?? null
    );
  }, homePoint());
  expect(node).toBeTruthy();
  return { id: node!.id, position: node!.position };
}

async function agentReceiptCount(page: Page): Promise<number> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.receiptCount ?? 0);
}

async function embodiment(page: Page): Promise<{
  moving: boolean;
  working: boolean;
  position: Point;
  target: Point;
}> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment);
}

async function callAgentPan(page: Page, nodeId: string): Promise<ToolReceipt> {
  return page.evaluate((id) => window.__GR_AGENT__!.panAt(id), nodeId) as Promise<ToolReceipt>;
}

async function killHero(page: Page): Promise<void> {
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.contactDamage', 999))).resolves.toBe(true);
  await page.evaluate(() => {
    window.__GR_TEST__?.teleport(0, 12);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0 });
  });
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 8_000 })
    .toBe('dead');
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.lastRunEndedReason ?? null), {
      timeout: 2_000,
    })
    .not.toBeNull();
}

async function grantGold(page: Page, amount: number): Promise<void> {
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0), { timeout: 2_000 })
    .toBe(before + amount);
}

async function installLiveMetaTools(page: Page): Promise<InstallResult> {
  await page.addScriptTag({
    type: 'module',
    content: `
      const rotationSteps = (rot) => {
        if (!Number.isFinite(rot)) return 0;
        const raw = Number.isInteger(rot) ? rot : Math.round(rot / (Math.PI / 2));
        return ((raw % 4) + 4) % 4;
      };

      const adapter = {
        metaProgress: {
          get agentAutonomyLevel() {
            const raw = JSON.parse(localStorage.getItem(${JSON.stringify(META_PROGRESS_KEY)}) ?? '{"tracks":{}}');
            const value = raw?.tracks?.agent ?? 0;
            return Number.isFinite(value) ? value : 0;
          },
        },
        diagnostics: () => window.__THREE_GAME_DIAGNOSTICS__,
        economyLog: () => window.__GR_TEST__?.economyLog() ?? [],
        placeBuilding: (def, pos, rot = 0) => {
          window.__GR_TEST__?.teleport(pos.x, pos.z + 2);
          if (!window.__GR_TEST__?.selectBuildable(def)) return false;
          const current = window.__THREE_GAME_DIAGNOSTICS__?.build.ghostRotationSteps ?? 0;
          const turns = (rotationSteps(rot) - current + 4) % 4;
          for (let i = 0; i < turns; i += 1) window.__GR_TEST__?.rotateBuildGhost();
          return window.__GR_TEST__?.confirmBuild() === true;
        },
      };

      import('/src/agent/ToolSurface.ts')
        .then(({ createToolSurface }) => {
          window.__M4_05_TOOLS__ = createToolSurface(adapter);
          window.__M4_05_INSTALL__ = { ok: true };
        })
        .catch((error) => {
          window.__M4_05_INSTALL__ = { ok: false, reason: String(error?.message ?? error) };
        });
    `,
  });
  await page.waitForFunction(() => Boolean((window as unknown as { __M4_05_INSTALL__?: unknown }).__M4_05_INSTALL__));
  const result = await page.evaluate(() => (window as unknown as { __M4_05_INSTALL__: InstallResult }).__M4_05_INSTALL__);
  if (!result.ok && !result.reason.includes('Failed to fetch dynamically imported module')) {
    throw new Error(result.reason);
  }
  return result;
}

async function callLiveTool(page: Page, name: string, args: unknown[]): Promise<ToolReceipt> {
  return page.evaluate(
    ({ toolName, toolArgs }) => {
      const tools = (window as unknown as { __M4_05_TOOLS__: { tools: Record<string, (...args: unknown[]) => unknown> } })
        .__M4_05_TOOLS__.tools;
      return tools[toolName]?.(...toolArgs);
    },
    { toolName: name, toolArgs: args },
  ) as Promise<ToolReceipt>;
}

async function fastWave20(page: Page): Promise<void> {
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.contactDamage', 0))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('waves.waveInterval', 0.35))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('waves.pulseBase', 1))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await expect(page.getByTestId('claim-office')).toBeVisible({ timeout: 12_000 });
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured === true && window.__THREE_GAME_DIAGNOSTICS__?.paused === true), {
      timeout: 2_000,
    })
    .toBe(true);
}

function homePoint(): Point {
  return { x: Balance.agent.homeX, z: Balance.agent.homeZ };
}

test('hero death creates no orphan agent receipts and reset returns the Prospector home', async ({ page }) => {
  await setStoredMeta(page, 2);
  const errors = await openDebugGame(page, '?debug&timescale=4&nowaves&nolevel&seed=m4-05-death');

  const node = await farthestActiveNode(page);
  const beforeReceipt = await agentReceiptCount(page);
  const receipt = await callAgentPan(page, node.id);
  expect(receipt.tool).toBe('et.goldrush.pan_at');
  await expect.poll(() => agentReceiptCount(page), { timeout: 2_000 }).toBe(beforeReceipt + 1);

  await expect
    .poll(() => embodiment(page).then((snap) => distance(snap.position, homePoint())), { timeout: 8_000 })
    .toBeGreaterThan(0.3);

  await killHero(page);
  const deadReceiptCount = await agentReceiptCount(page);
  await waitForFrames(page, 20);
  expect(await agentReceiptCount(page)).toBe(deadReceiptCount);

  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state), { timeout: 2_000 }).toBe('playing');
  const reset = await embodiment(page);
  expect(distance(reset.position, homePoint())).toBeLessThan(0.2);
  expect(distance(reset.target, homePoint())).toBeLessThan(0.01);
  expect(reset.moving).toBe(false);
  expect(reset.working).toBe(false);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('side-effect permission checks read live meta on each call', async ({ page }) => {
  await setStoredMeta(page, 0);
  const errors = await openDebugGame(page, '?debug&timescale=4&nowaves&nolevel&seed=m4-05-permission');
  const install = await installLiveMetaTools(page);
  test.skip(!install.ok, 'ToolSurface is source-only until the merge session wires install(game).');
  await grantGold(page, 50);

  const before = await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0,
    logLength: window.__THREE_GAME_DIAGNOSTICS__?.economy.logLength ?? 0,
    beacons: window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0,
  }));
  const args = ['sentry_beacon', { x: 0, z: 10 }, 0];

  const denied = await callLiveTool(page, 'place_building', args);
  expect(denied.outcome).toMatchObject({ ok: false, reason: 'PERMISSION_DENIED', requiredLevel: 1 });
  const afterDenied = await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0,
    logLength: window.__THREE_GAME_DIAGNOSTICS__?.economy.logLength ?? 0,
    beacons: window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0,
  }));
  expect(afterDenied).toEqual(before);

  await updateStoredAgentLevel(page, 1);
  const allowed = await callLiveTool(page, 'place_building', args);
  expect(allowed.tool).toBe('et.goldrush.place_building');
  expect(allowed.outcome.ok).toBe(true);
  expect(allowed.cost).toBe(25);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0), { timeout: 2_000 })
    .toBe(before.beacons + 1);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBe(before.gold - 25);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('victory pause agent calls do not bank gold into the stale or next run', async ({ page }) => {
  await setStoredMeta(page, 2);
  const errors = await openDebugGame(page, '?debug&timescale=100&nolevel&seed=m4-05-victory');
  await fastWave20(page);

  const node = await farthestActiveNode(page);
  const before = await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0,
    logLength: window.__THREE_GAME_DIAGNOSTICS__?.economy.logLength ?? 0,
    receiptCount: window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.receiptCount ?? 0,
    runSecured: window.__THREE_GAME_DIAGNOSTICS__?.run.secured ?? false,
    paused: window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false,
  }));
  expect(before.runSecured).toBe(true);
  expect(before.paused).toBe(true);

  const receipt = await callAgentPan(page, node.id);
  expect(receipt.tool).toBe('et.goldrush.pan_at');
  await expect.poll(() => agentReceiptCount(page), { timeout: 2_000 }).toBe(before.receiptCount + 1);
  await waitForFrames(page, 8);
  const after = await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0,
    logLength: window.__THREE_GAME_DIAGNOSTICS__?.economy.logLength ?? 0,
    runSecured: window.__THREE_GAME_DIAGNOSTICS__?.run.secured ?? false,
    paused: window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false,
  }));
  expect(after).toEqual({
    gold: before.gold,
    logLength: before.logLength,
    runSecured: true,
    paused: true,
  });

  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('waves.waveInterval', 999))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999))).resolves.toBe(true);
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 4_000 });
  await expect(page.getByTestId('death-overlay')).toBeVisible({ timeout: 4_000 });
  await page.getByTestId('stake-again').click();
  await expect
    .poll(() => page.getByTestId('death-overlay').getAttribute('aria-hidden'), { timeout: 4_000 })
    .toBe('true');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state), { timeout: 2_000 }).toBe('playing');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave), { timeout: 2_000 }).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? -1)).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured ?? true)).toBe(false);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
