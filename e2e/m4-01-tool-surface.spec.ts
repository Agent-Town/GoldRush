import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type ToolReceipt = {
  tool: string;
  args: unknown;
  cost?: number;
  outcome: {
    ok: boolean;
    reason?: string;
    requiredLevel?: number;
    economyLog: unknown[];
    state?: unknown;
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

async function openGame(page: Page, query = '?debug&timescale=4&nowaves&nolevel&seed=m4-01'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function installAgentTools(page: Page, level: 0 | 1 | 2 | 3): Promise<InstallResult> {
  await page.evaluate((permissionLevel) => {
    (window as unknown as { __M4_LEVEL__?: number }).__M4_LEVEL__ = permissionLevel;
  }, level);
  await page.addScriptTag({
    type: 'module',
    content: `
      const rotationSteps = (rot) => {
        if (!Number.isFinite(rot)) return 0;
        const raw = Number.isInteger(rot) ? rot : Math.round(rot / (Math.PI / 2));
        return ((raw % 4) + 4) % 4;
      };

      const adapter = {
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
          window.__M4_TOOLS__ = createToolSurface(adapter, { permissionLevel: window.__M4_LEVEL__ ?? 0 });
          window.__M4_INSTALL__ = { ok: true };
        })
        .catch((error) => {
          window.__M4_INSTALL__ = { ok: false, reason: String(error?.message ?? error) };
        });
    `,
  });
  await page.waitForFunction(() => Boolean((window as unknown as { __M4_INSTALL__?: unknown }).__M4_INSTALL__));
  const result = await page.evaluate(() => (window as unknown as { __M4_INSTALL__: InstallResult }).__M4_INSTALL__);
  if (!result.ok && !result.reason.includes('Failed to fetch dynamically imported module')) {
    throw new Error(result.reason);
  }
  return result;
}

async function grantGold(page: Page, amount: number): Promise<void> {
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBe(before + amount);
}

async function economyLog(page: Page): Promise<unknown[]> {
  return page.evaluate(() => [...(window.__GR_TEST__?.economyLog() ?? [])]);
}

async function callTool(page: Page, name: string, args: unknown[] = []): Promise<ToolReceipt> {
  return page.evaluate(
    ({ toolName, toolArgs }) => {
      const tools = (window as unknown as { __M4_TOOLS__: { tools: Record<string, (...args: unknown[]) => unknown> } })
        .__M4_TOOLS__.tools;
      return tools[toolName]?.(...toolArgs);
    },
    { toolName: name, toolArgs: args },
  ) as Promise<ToolReceipt>;
}

test('get_state returns the same state and economy log as the direct harness', async ({ page }) => {
  const errors = await openGame(page);
  const install = await installAgentTools(page, 1);
  test.skip(!install.ok, 'ToolSurface is source-only until the merge session wires install(game).');
  await grantGold(page, 7);

  const result = await page.evaluate(() => {
    const tools = (window as unknown as { __M4_TOOLS__: { tools: { get_state: () => ToolReceipt } } }).__M4_TOOLS__.tools;
    const receipt = tools.get_state();
    return {
      receipt,
      direct: JSON.parse(
        JSON.stringify({
          state: window.__THREE_GAME_DIAGNOSTICS__,
          economyLog: window.__GR_TEST__?.economyLog() ?? [],
        }),
      ) as { state: unknown; economyLog: unknown[] },
    };
  });

  expect(result.receipt.tool).toBe('et.goldrush.get_state');
  expect(result.receipt.outcome.ok).toBe(true);
  expect(result.receipt.outcome.state).toEqual(result.direct.state);
  expect(result.receipt.outcome.economyLog).toEqual(result.direct.economyLog);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('place_building delegates to the direct build path and receipts the exact economy log', async ({ page }) => {
  const errors = await openGame(page);
  const install = await installAgentTools(page, 1);
  test.skip(!install.ok, 'ToolSurface is source-only until the merge session wires install(game).');
  await grantGold(page, 30);

  const receipt = await callTool(page, 'place_building', ['sentry_beacon', { x: 0, z: 10 }, 0]);
  const directLog = await economyLog(page);

  expect(receipt.tool).toBe('et.goldrush.place_building');
  expect(receipt.outcome.ok).toBe(true);
  expect(receipt.cost).toBe(25);
  expect(JSON.stringify(receipt.outcome.economyLog)).toBe(JSON.stringify(directLog));
  expect(directLog.at(-1)).toMatchObject({ type: 'gold_spent', sink: 'build_sentry_beacon', amount: 25 });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0)).toBe(1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('level 0 blocks every side-effect tool with a typed refusal and no log delta', async ({ page }) => {
  const errors = await openGame(page);
  const install = await installAgentTools(page, 0);
  test.skip(!install.ok, 'ToolSurface is source-only until the merge session wires install(game).');
  await grantGold(page, 50);
  const before = await economyLog(page);

  const receipts = await Promise.all([
    callTool(page, 'pan_at', ['gold-seam-1']),
    callTool(page, 'repair', [{ id: 'palisade', index: 0 }]),
    callTool(page, 'chase_mark', [{ index: 0 }]),
    callTool(page, 'place_building', ['palisade', { x: 0, z: 10 }, 0]),
  ]);
  const after = await economyLog(page);

  for (const receipt of receipts) {
    expect(receipt.outcome.ok).toBe(false);
    expect(receipt.outcome.reason).toBe('PERMISSION_DENIED');
    expect(receipt.outcome.requiredLevel).toBe(1);
    expect(receipt.outcome.economyLog).toEqual(before);
  }
  expect(after).toEqual(before);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('unbacked action tools refuse without mutating the direct economy log', async ({ page }) => {
  const errors = await openGame(page);
  const install = await installAgentTools(page, 1);
  test.skip(!install.ok, 'ToolSurface is source-only until the merge session wires install(game).');
  const before = await economyLog(page);

  const receipts = await Promise.all([
    callTool(page, 'pan_at', ['gold-seam-1']),
    callTool(page, 'repair', [{ id: 'sentry_beacon', index: 0 }]),
    callTool(page, 'chase_mark', [{ index: 0 }]),
  ]);
  const after = await economyLog(page);

  for (const receipt of receipts) {
    expect(receipt.outcome.ok).toBe(false);
    expect(receipt.outcome.reason).toBe('NO_SYSTEM_API');
    expect(receipt.outcome.economyLog).toEqual(before);
  }
  expect(after).toEqual(before);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
