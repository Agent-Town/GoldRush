import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const fixtures = [
  { path: 'artifacts/eh2-fixture/tape.json', controlHash: 'fnv1a32:a45ba9ac' },
  { path: 'artifacts/e4-roads-and-convoys/e4-dust-flats-floor.tape.json' },
] as const;

test('the browser replays the Claim control and a terrain-reading Motor reel to the claimed and node hashes', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

  for (const entry of fixtures) {
    const fixture = JSON.parse(readFileSync(entry.path, 'utf8'));
    if ('controlHash' in entry) expect(fixture.eventLogHash).toBe(entry.controlHash);
    const node = JSON.parse(execFileSync(process.execPath, ['scripts/assay-replay-agent.mjs', entry.path], {
      encoding: 'utf8',
      timeout: 120_000,
    }));
    await page.goto(`/src/replay/harness.html?debug&contract=${fixture.contract}&seed=${fixture.seed}`);
    await page.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
    const browser = await page.evaluate(async (tape) => {
      const startedAt = performance.now();
      const replay = await window.__GR_AGENT_TAPE_REPLAY__!.replay(tape);
      return { ...replay, wallMs: Math.round(performance.now() - startedAt) };
    }, fixture);

    console.log(`[true-reel] contract=${fixture.contract} claimed=${fixture.eventLogHash} node=${node.eventLogHash}/${node.ticks}/${JSON.stringify(node.outcome)} browser=${browser.eventLogHash}/${browser.ticks}/${JSON.stringify(browser.outcome)} browserWallMs=${browser.wallMs}`);
    expect(browser.eventLogHash).toBe(fixture.eventLogHash);
    expect(browser.eventLogHash).toBe(node.eventLogHash);
    expect(browser.outcome).toEqual(node.outcome);
    expect(browser.ticks).toBe(node.ticks);
  }
  expect(errors).toEqual([]);
});
