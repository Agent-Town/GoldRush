import { expect, test } from '@playwright/test';

/**
 * PLAIN-BOOT PROBE for the A7 low-orbit consumer (2026-08-20). Not part of the standing suite —
 * it is drain evidence, kept beside the prover it belongs to.
 *
 * NO `?debug` anywhere below. The board's own launch is a session key plus `?contract=`
 * (`main.ts:226-235` → `ContractFamilies.ts:1233`), so that is the route taken here, and the
 * resolved contract is read from the published diagnostics AND from the briefing card the player
 * actually looks at (Mistake #10).
 *
 * THE MIDDLE CASE IS AGAIN THE ONE WORTH READING, and it is the SAME shape A4 measured as
 * F-E7DB-2. Admitting a contract to the HEADLESS door does not open its BOARD row: Low Orbit's
 * row is `unlock: "secured:e8-far-side"`, and the Far Side still declares `harvestAnchors: []`,
 * so it cannot be played and cannot be secured. A browser player therefore cannot reach Low
 * Orbit TODAY — measured here rather than assumed, and filed as F-E8LO-2.
 *
 * That debt is already being paid: A6 (`e8-far-side`) is in flight in a parallel worktree and
 * admits exactly that contract. When it lands, the third case below stops needing its seeded
 * `secured` row and becomes the ordinary route. Nothing in A7 needs to change for that to
 * happen — which is the point of measuring it instead of guessing.
 */
const LAUNCH_KEY = 'gr.contract.launch.v1';
const EPOCH_KEY = 'gr.activeEpoch.v1';
const SCORES_KEY = 'gr.scores.v2';

type Case = { label: string; contract: string | null; unlocked: boolean; activeId: string; briefing: string };

const CASES: Case[] = [
  // Untouched by this slice, and the control for "the boot is clean at all".
  { label: 'default claim', contract: 'the-claim', unlocked: false, activeId: 'the-claim', briefing: 'The Claim' },
  // Staged but LOCKED: the board refuses, exactly as it should. F-E8LO-2's measurement.
  { label: 'low orbit, locked', contract: 'e8-low-orbit', unlocked: false, activeId: 'the-claim', briefing: 'The Claim' },
  // The state a player reaches by securing the Far Side, seeded through the game's own keys.
  { label: 'low orbit, unlocked', contract: 'e8-low-orbit', unlocked: true, activeId: 'e8-low-orbit', briefing: 'Low Orbit' },
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
      localStorage.setItem(epochKey as string, 'epoch-8-orbital');
      localStorage.setItem(scoresKey as string, JSON.stringify([{
        waves: 20, kills: 1, gold: 1, timeAlive: 1, at: 1, secured: true, contractId: 'e8-far-side',
      }]));
    }, [LAUNCH_KEY, EPOCH_KEY, SCORES_KEY, probe.contract, probe.unlocked] as const);

    await page.goto(probe.contract ? `/?contract=${probe.contract}` : '/');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId), { timeout: 30_000 })
      .toBe(probe.activeId);
    await expect(page.getByTestId('contract-briefing-name')).toHaveText(probe.briefing, { timeout: 30_000 });

    // Where the PLAYER sees A7, with no debug flag anywhere: the briefing card names the spine
    // and the debris fields, and on the unlocked run the consumer is live behind it.
    if (probe.activeId === 'e8-low-orbit') {
      const briefing = await page.getByTestId('contract-briefing').textContent();
      expect(briefing).toContain('spine');
      expect(briefing?.toLowerCase()).toContain('debris');
      expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lowOrbit)).toMatchObject({
        declared: true,
        orbitalReturn: true,
        returnSeconds: 12,
      });
    }

    await page.waitForTimeout(4_000);
    expect(problems).toEqual([]);
  });
}
