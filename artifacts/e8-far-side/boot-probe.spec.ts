import { expect, test } from '@playwright/test';

/**
 * PLAIN-BOOT PROBE for the A6 probe/playback consumer (2026-08-20). Not part of the standing
 * suite — it is drain evidence, kept beside the prover it belongs to.
 *
 * NO `?debug` anywhere below. The board's own launch is a session key plus `?contract=`
 * (`main.ts:226-235` → `ContractFamilies.ts:1233`), so that is the route taken here, and the
 * resolved contract is read from the published diagnostics AND from the briefing card the
 * player actually looks at (Mistake #10).
 *
 * THE MIDDLE CASE IS THE ONE WORTH READING, AND IT IS BETTER NEWS THAN THE DEAD BAND'S. A4's
 * F-E7DB-2 measured a contract admitted to the headless door that NO browser player could
 * reach, because its unlock chain ran through an unplayable map. The Far Side's row is
 * `unlock: "secured:e8-mare-claim"`, and the Mare Claim is admitted, seeded and playable — so
 * the chain is whole and this probe seeds exactly the state ordinary play produces.
 */
const LAUNCH_KEY = 'gr.contract.launch.v1';
const EPOCH_KEY = 'gr.activeEpoch.v1';
const SCORES_KEY = 'gr.scores.v2';

type Case = { label: string; contract: string; unlocked: boolean; activeId: string; briefing: string };

const CASES: Case[] = [
  // Untouched by this slice, and the control for "the boot is clean at all".
  { label: 'default claim', contract: 'the-claim', unlocked: false, activeId: 'the-claim', briefing: 'The Claim' },
  // Staged but LOCKED: the board refuses, exactly as it should.
  { label: 'far side, locked', contract: 'e8-far-side', unlocked: false, activeId: 'the-claim', briefing: 'The Claim' },
  // The state a player reaches by securing the Mare Claim, seeded through the game's own keys.
  { label: 'far side, unlocked', contract: 'e8-far-side', unlocked: true, activeId: 'e8-far-side', briefing: 'The Far Side' },
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
      sessionStorage.setItem(launchKey as string, contract as string);
      if (!unlocked) return;
      localStorage.setItem(epochKey as string, 'epoch-8-orbital');
      localStorage.setItem(scoresKey as string, JSON.stringify([{
        waves: 20, kills: 1, gold: 1, timeAlive: 1, at: 1, secured: true, contractId: 'e8-mare-claim',
      }]));
    }, [LAUNCH_KEY, EPOCH_KEY, SCORES_KEY, probe.contract, probe.unlocked] as const);

    await page.goto(`/?contract=${probe.contract}`);
    await expect(page.locator('canvas')).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId), { timeout: 30_000 })
      .toBe(probe.activeId);
    await expect(page.getByTestId('contract-briefing-name')).toHaveText(probe.briefing, { timeout: 30_000 });

    // The objective is armed only on the Far Side, and only when the player actually got there.
    const declared = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.probeRecovery.declared);
    expect(declared).toBe(probe.activeId === 'e8-far-side');

    await page.waitForTimeout(4_000);
    expect(problems).toEqual([]);
  });
}
