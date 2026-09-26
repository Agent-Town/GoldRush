/**
 * test-truth-2 probe for the secure spec's `board` cell on the Last Claim (both projects failed it in
 * batch A with "waiting for getByTestId('stake-again')" after banking and before a reload that passed).
 * Question: after "Return to Town" on a secured Last Claim, what does the player get, and when? The
 * secure is reached through the debug seam `startWaveForTest(8)` (the map's secure wave, as
 * e2e/locked-win.spec.ts does for the Claim at 10), then the same click the secure spec makes, then a
 * 250 ms timeline of the surfaces the board step could meet: the run ledger and its `stake-again`, the
 * E10 finale layer, and the Book (`contract-board-title`).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const OUT = path.resolve(import.meta.dirname, 'out');

test('probe: where Return to Town lands on a secured Last Claim', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  await mkdir(OUT, { recursive: true });
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    if (sessionStorage.getItem('tt2.lastClaim.seeded') === '1') return;
    localStorage.clear();
    sessionStorage.setItem('tt2.lastClaim.seeded', '1');
  });
  await page.goto('/?debug&contract=e10-last-claim&nowaves&nolevel&seed=tt2-last-claim-board');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 2, undefined, { timeout: 60_000 });
  await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 }).catch(() => undefined);
  const secureWave = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.secureWave ?? null);
  const finale = await page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__ as unknown as { e10Finale?: unknown })?.e10Finale ?? null);
  await page.evaluate((wave) => window.__GR_TEST__?.startWaveForTest(wave ?? 8), secureWave);
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 30_000 });
  await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  const started = Date.now();
  const timeline: Array<{ ms: number; visible: string[] }> = [];
  let last = '';
  while (Date.now() - started < 45_000) {
    const visible = await page.evaluate(() => {
      const ids = ['claim-secured', 'death-overlay', 'stake-again', 'run-secondary-action', 'research-card-0', 'e10-finale-layer', 'e10-river-lever', 'e10-return-town', 'contract-board', 'contract-board-title', 'start-menu-enter-town'];
      return ids.filter((id) => {
        const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
        if (!el || el.hidden) return false;
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01 && rect.width > 0 && rect.height > 0;
      });
    }).catch(() => ['(page navigating)']);
    const key = visible.join(',');
    if (key !== last) {
      last = key;
      timeline.push({ ms: Date.now() - started, visible });
    }
    if (visible.includes('contract-board-title')) break;
    // The finale's own way home, pressed once it is offered (batch B watched 45 s and saw only the finale
    // layer, its screenshot the Charter Press offer): does "Return to the Ark" put the Book on screen?
    if (visible.includes('e10-return-town') && !timeline.some((row) => row.visible.includes('(pressed e10-return-town)'))) {
      await page.getByTestId('e10-return-town').click({ timeout: 5_000 });
      timeline.push({ ms: Date.now() - started, visible: ['(pressed e10-return-town)'] });
    }
    await page.waitForTimeout(250);
  }
  await page.screenshot({ path: path.join(OUT, `${testInfo.project.name}-last-claim-after-return.png`) });
  await writeFile(path.join(OUT, `${testInfo.project.name}-last-claim-board.json`), `${JSON.stringify({ project: testInfo.project.name, secureWave, finale, timeline, url: page.url(), errors }, null, 2)}\n`);
});
