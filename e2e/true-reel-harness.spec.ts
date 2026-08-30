import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const fixturePath = 'artifacts/eh2-fixture/tape.json';
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));

test('the browser replays the assayer fixture to the claimed and node hashes', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

  const node = JSON.parse(execFileSync(process.execPath, ['scripts/assay-replay-agent.mjs', fixturePath], {
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

  expect(browser.eventLogHash).toBe(fixture.eventLogHash);
  expect(browser.eventLogHash).toBe(node.eventLogHash);
  expect(browser.outcome).toEqual(node.outcome);
  expect(browser.ticks).toBe(node.ticks);
  expect(errors).toEqual([]);
  console.log(`[eh2] claimed=${fixture.eventLogHash} node=${node.eventLogHash} browser=${browser.eventLogHash} browserWallMs=${browser.wallMs}`);
});
