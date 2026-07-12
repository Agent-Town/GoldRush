import { expect, test } from '@playwright/test';

// Owner (Baron run, 2026-07-13): "restarts the music whenever an opponent is dying" —
// kills trigger level-up overlays, overlays pause, and the pause gate hard-stopped the
// music voice; resume restarted the track. Music must ride through pause, and stop
// only when the run leaves 'playing'.
test('the era loop rides through pause without restarting', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'autoplay flag is chromium-only');
  await page.goto('/?debug&nolevel&nopause&seed=music-pause-probe');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.mouse.click(400, 300);
  await page.waitForFunction(
    () => (window.__GR_AUDIO_DIAGNOSTICS__?.loops ?? []).some((loop) => loop.startsWith('era-')),
    undefined,
    { timeout: 15_000 },
  );
  const read = () =>
    page.evaluate(() => {
      const diagnostics = window.__GR_AUDIO_DIAGNOSTICS__!;
      const loop = diagnostics.loops.find((name) => name.startsWith('era-'))!;
      return {
        loop,
        elapsed: diagnostics.loopElapsedSeconds[loop] ?? -1,
        starts: diagnostics.startedBySound[loop] ?? 0,
        paused: window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false,
      };
    });
  const before = await read();
  expect(before.starts).toBe(1);

  await page.keyboard.press('KeyP');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)).toBe(true);
  await page.waitForTimeout(1500);
  const paused = await read();
  expect(paused.loop, 'music loop must survive the pause').toBe(before.loop);
  expect(paused.starts, 'pause must not restart the track').toBe(1);
  expect(paused.elapsed).toBeGreaterThan(before.elapsed);

  await page.keyboard.press('KeyP');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)).toBe(false);
  await page.waitForTimeout(800);
  const resumed = await read();
  expect(resumed.starts, 'resume must not restart the track').toBe(1);
  expect(resumed.elapsed).toBeGreaterThan(paused.elapsed);
});
