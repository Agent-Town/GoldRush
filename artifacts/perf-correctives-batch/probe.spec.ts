import { expect, test } from '@playwright/test';

// F-AUDIO-2 diagnosis probe for the mu-02 "shot bursts" red (`Received array: []`).
// Reproduces mu-02:60's exact opening and reports what the two diagnostics surfaces say.
test('mu-02 shot-burst opening: what the two audio surfaces report', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem('gr.profile.v2', JSON.stringify({
      version: 2,
      activeId: 'music-test',
      profiles: [{ id: 'music-test', name: 'Music Test', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
  });
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=mu-02-shots');
  await page.locator('#game-canvas').click({ position: { x: 40, y: 40 } });

  const samples: unknown[] = [];
  for (let i = 0; i < 24; i += 1) {
    samples.push(await page.evaluate(() => {
      const g = window.__THREE_GAME_DIAGNOSTICS__ as any;
      const a = window.__GR_AUDIO_DIAGNOSTICS__ as any;
      return {
        t: Math.round(performance.now()),
        frame: g?.frame ?? null,
        runState: g?.runState ?? null,
        assetLoadingState: document.querySelector('#game-canvas')?.getAttribute('data-asset-loading') ?? null,
        gameLoops: g?.audio?.loops ?? null,
        gameUnlocked: g?.audio?.unlocked ?? null,
        gameRequests: g?.audio?.requests ?? null,
        gameStartedBySound: g?.audio?.startedBySound ?? null,
        soundLoops: a?.loops ?? null,
        soundUnlocked: a?.unlocked ?? null,
        soundLastRequested: a?.lastRequested ?? null,
        soundLastStarted: a?.lastStarted ?? null,
        soundStarted: a?.started ?? null,
        soundMissing: a?.missing ?? null,
        sameObject: g?.audio === a,
      };
    }));
    await page.waitForTimeout(400);
  }
  console.log('PROBE_SAMPLES ' + JSON.stringify(samples, null, 1));
  console.log('PROBE_ERRORS ' + JSON.stringify(errors));
  expect(true).toBe(true);
});
