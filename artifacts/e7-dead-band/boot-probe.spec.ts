import { expect, test } from '@playwright/test';

/**
 * PLAIN-BOOT PROBE for the A4 signal-suppression consumer (2026-08-20). Not part of the
 * standing suite — it is drain evidence, kept beside the prover it belongs to.
 *
 * NO `?debug` anywhere below. The board's own launch is a session key plus `?contract=`
 * (`main.ts:226-235` → `ContractFamilies.ts:1233`), so that is the route taken here, and the
 * resolved contract is read from the published diagnostics AND from the briefing card the
 * player actually looks at (Mistake #10).
 *
 * THE MIDDLE CASE IS THE ONE WORTH READING. Admitting a contract to the HEADLESS door does not
 * open its BOARD row: `reverifyStagedContractLaunch` (`ContractUnlock.ts:77`) clears a staged
 * launch whose contract is locked, and the Dead Band's row is `unlock: "secured:e7-echo-canyon"`
 * while Echo Canyon still declares `harvestAnchors: []` and cannot be played at all. So a
 * browser player cannot reach the Dead Band today — measured here rather than assumed, and
 * filed as F-E7DB-2.
 */
const LAUNCH_KEY = 'gr.contract.launch.v1';
const EPOCH_KEY = 'gr.activeEpoch.v1';
const SCORES_KEY = 'gr.scores.v2';

type Case = { label: string; contract: string | null; unlocked: boolean; activeId: string; briefing: string };

const CASES: Case[] = [
  // Untouched by this slice, and the control for "the boot is clean at all". Launched the same
  // way as the rows below rather than bare `/`, because a bare boot on a fresh profile stops at
  // the start menu and never reaches a contract at all — which would prove nothing about this.
  { label: 'default claim', contract: 'the-claim', unlocked: false, activeId: 'the-claim', briefing: 'The Claim' },
  // Staged but LOCKED: the board refuses, exactly as it should. F-E7DB-2's measurement.
  { label: 'dead band, locked', contract: 'e7-dead-band', unlocked: false, activeId: 'the-claim', briefing: 'The Claim' },
  // The state a player reaches by securing Echo Canyon, seeded through the game's own keys.
  { label: 'dead band, unlocked', contract: 'e7-dead-band', unlocked: true, activeId: 'e7-dead-band', briefing: 'The Dead Band' },
];

for (const probe of CASES) {
  test(`plain boot resolves and is clean — ${probe.label}`, async ({ page }) => {
    test.setTimeout(90_000);
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') problems.push(`${message.type()}: ${message.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));

    await page.addInitScript(([launchKey, epochKey, scoresKey, contract, unlocked]) => {
      if (contract) sessionStorage.setItem(launchKey as string, contract as string);
      if (!unlocked) return;
      localStorage.setItem(epochKey as string, 'epoch-7-signal');
      localStorage.setItem(scoresKey as string, JSON.stringify([{
        waves: 20, kills: 1, gold: 1, timeAlive: 1, at: 1, secured: true, contractId: 'e7-echo-canyon',
      }]));
    }, [LAUNCH_KEY, EPOCH_KEY, SCORES_KEY, probe.contract, probe.unlocked] as const);

    await page.goto(probe.contract ? `/?contract=${probe.contract}` : '/');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId), { timeout: 30_000 })
      .toBe(probe.activeId);
    await expect(page.getByTestId('contract-briefing-name')).toHaveText(probe.briefing, { timeout: 30_000 });
    await page.waitForTimeout(4_000);
    expect(problems).toEqual([]);
  });
}
