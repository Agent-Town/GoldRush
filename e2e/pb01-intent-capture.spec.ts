import { expect, test, type Page } from '@playwright/test';

// PB-01 — INTENT CAPTURE (specs/playbook-core/README.md, slice PB-01).
// The recorder taps the lockstep intent seam (Game.consumePlaybookTick):
// {tick, mx, my, semantic actions} only — never raw input, never camera
// coordinates, never wall-clock. GATE: two same-seed sessions performing the
// same scripted actions produce byte-stable intent streams.

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

type ScriptEntry = { t: number; mx: number; my: number; a: unknown[] };

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
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

// Mirrors the determinism-audit harness: pin the sim to manual stepping, reset
// to a clean same-seed world, and bound the probe workload.
async function prepDeterministicRun(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.contactDamage', 0))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('waves.aliveCap', 12))).resolves.toBe(true);
}

function patrolScript(hx: number, hz: number): ScriptEntry[] {
  const q3 = (value: number) => Math.round(value * 1000) / 1000;
  return [
    { t: 0, mx: 1, my: 0, a: [] },
    { t: 30, mx: 0, my: 1, a: [] },
    { t: 60, mx: -1, my: 0, a: [] },
    { t: 90, mx: 0, my: -1, a: [] },
    { t: 120, mx: 0, my: 0, a: [{ type: 'weapon_toggle' }] },
    {
      t: 150,
      mx: 0,
      my: 0,
      a: [{ type: 'place_build', id: 'palisade', position: { x: q3(hx + 3), z: q3(hz) }, rotationSteps: 0 }],
    },
    { t: 200, mx: 0.5, my: 0.5, a: [] },
    { t: 260, mx: 0, my: 0, a: [] },
  ];
}

async function recordScriptedSession(page: Page, seconds: number) {
  const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
  const script = patrolScript(hero.x, hero.z);
  await page.evaluate(() => window.__GR_TEST__?.grantGold(300));
  const started = await page.evaluate((entries) => window.__GR_TEST__!.playbook.startRecording({ script: entries }), script);
  expect(started.ok).toBe(true);
  await page.evaluate((s) => window.__GR_TEST__?.advanceSim(s), seconds);
  return page.evaluate(() => window.__GR_TEST__!.playbook.stopRecording('pb01-tape'));
}

test.describe('PB-01 intent capture', () => {
  test('plain boot stays inert — zero playbook surface', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await expect(page.getByTestId('start-menu')).toBeVisible();
    const surface = await page.evaluate(() => ({
      testHook: typeof window.__GR_TEST__,
      playbookKeys: Object.keys(localStorage).filter((key) => key.includes('playbook')),
    }));
    expect(surface.testHook).toBe('undefined');
    expect(surface.playbookKeys).toEqual([]);
    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  });

  test('two same-seed scripted sessions produce byte-stable intent streams', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = await openGame(page, '?debug&nolevel&seed=pb01-stable');
    await prepDeterministicRun(page);
    const first = await recordScriptedSession(page, 12);

    // Fresh boot, same seed, same script — the byte-stability gate.
    await openGame(page, '?debug&nolevel&seed=pb01-stable');
    await prepDeterministicRun(page);
    const second = await recordScriptedSession(page, 12);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(first.truncated).toBeNull();
    expect(first.entries).toBeGreaterThanOrEqual(6);
    expect(first.durationTicks).toBe(360);
    expect(second.text).toBe(first.text);
    expect(second.hash).toBe(first.hash);

    // SIM-TRUTH law: the serialized stream is sim vocabulary only.
    const tape = JSON.parse(first.text!) as {
      version: number;
      stepSeconds: number;
      seed: string;
      entries: Array<Record<string, unknown>>;
    };
    expect(tape.version).toBe(1);
    expect(tape.seed).toBe('pb01-stable');
    expect(tape.stepSeconds).toBeCloseTo(1 / 30, 10);
    for (const entry of tape.entries) expect(Object.keys(entry).sort()).toEqual(['a', 'mx', 'my', 't']);
    expect(first.text).not.toMatch(/Key[A-Z]/);
    expect(first.text).not.toContain('client');
    expect(first.text).not.toContain('camera');
    expect(first.text).not.toContain('screen');

    // Profile-scoped store persisted the tape.
    const listed = await page.evaluate(() => window.__GR_TEST__!.playbook.list());
    expect(listed.some((entry) => entry.name === 'pb01-tape' && entry.hash === first.hash)).toBe(true);

    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  });

  test('live keyboard input reaches the recorder through the seam', async ({ page }) => {
    const errors = await openGame(page, '?debug&nolevel&seed=pb01-live');
    await page.evaluate(() => window.__GR_TEST__?.resetRun());
    const started = await page.evaluate(() => window.__GR_TEST__!.playbook.startRecording());
    expect(started.ok).toBe(true);
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyD');
    await page.waitForTimeout(200);
    const status = await page.evaluate(() => window.__GR_TEST__!.playbook.status());
    expect(status.recording?.scripted).toBe(false);
    expect(status.recording?.ticks).toBeGreaterThan(0);
    const stopped = await page.evaluate(() => window.__GR_TEST__!.playbook.stopRecording('pb01-live-tape'));
    expect(stopped.ok).toBe(true);
    const tape = JSON.parse(stopped.text!) as { entries: Array<{ mx: number; my: number }> };
    expect(tape.entries.length).toBeGreaterThanOrEqual(1);
    expect(tape.entries.some((entry) => entry.mx === 1)).toBe(true);
    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  });

  test('intent bound truncates loudly at 2,000 entries', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = await openGame(page, '?debug&nolevel&seed=pb01-bound');
    await prepDeterministicRun(page);
    // A demonstration longer than the tape bound: the recorder must cut the
    // tape LOUDLY at 2,000 intents (law 6 — no silent caps).
    const started = await page.evaluate(() => {
      const script: Array<{ t: number; mx: number; my: number; a: never[] }> = [];
      for (let t = 0; t < 2_100; t += 1) script.push({ t, mx: t % 2 === 0 ? 1 : 0, my: 0, a: [] });
      return window.__GR_TEST__!.playbook.startRecording({ script });
    });
    expect(started.ok).toBe(true);
    await page.evaluate(() => window.__GR_TEST__?.advanceSim(68));
    const stopped = await page.evaluate(() => window.__GR_TEST__!.playbook.stopRecording('pb01-bound-tape'));
    expect(stopped.ok).toBe(true);
    expect(stopped.truncated).not.toBeNull();
    expect(stopped.truncated?.reason).toBe('max-entries');
    expect(stopped.entries).toBe(2_000);
    expect(stopped.durationTicks).toBe(stopped.truncated?.atTick);
    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  });
});
