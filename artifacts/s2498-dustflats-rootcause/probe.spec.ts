// TEMPORARY s2498 PROBE — delete before commit. Tests F-2497-1's PRESCRIBED CURE
// ("press Upgrade instead of Space") against the live boot, and asks the decisive
// control question the cure never asked: is `dustFlats` published AT ALL?
import { test, expect } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  localStorage.clear();
  localStorage.setItem(key, 'epoch-4-motor');
}, { key: ACTIVE_EPOCH_KEY }));

test('s2498 probe: is dustFlats published, and does the prescribed Upgrade cure grade a road?', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => sessionStorage.setItem('gr.contract.launch.v1', 'e4-dust-flats'));
  await page.goto('/?contract=e4-dust-flats&nowaves&nospawn&nokill&nolevel&nopause');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e4-dust-flats' && window.__THREE_GAME_DIAGNOSTICS__?.vehicle?.active === true);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();

  // CONTROL 1 — the boot really did come up (so a null result below is an ANSWER, not a failed read).
  const contractId = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId);
  const vehicleActive = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vehicle?.active);
  console.log(`[s2498] CONTROL contract=${contractId} vehicleActive=${vehicleActive}`);

  // THE DECISIVE READ — is the `dustFlats` diagnostic block present before ANY input?
  const dustBefore = await page.evaluate(() => JSON.stringify(window.__THREE_GAME_DIAGNOSTICS__?.dustFlats ?? null));
  console.log(`[s2498] dustFlats BEFORE any input = ${dustBefore}`);

  // THE PRESCRIBED CURE — walk, then press Upgrade instead of Space.
  await page.keyboard.down('KeyS');
  await page.waitForTimeout(350);
  await page.keyboard.up('KeyS');
  await page.keyboard.press('KeyU');
  await page.waitForTimeout(1200);
  const dustAfterUpgrade = await page.evaluate(() => JSON.stringify(window.__THREE_GAME_DIAGNOSTICS__?.dustFlats ?? null));
  console.log(`[s2498] dustFlats AFTER Upgrade = ${dustAfterUpgrade}`);

  // AND the original input, for completeness.
  await page.keyboard.press('Space');
  await page.waitForTimeout(1200);
  const dustAfterSpace = await page.evaluate(() => JSON.stringify(window.__THREE_GAME_DIAGNOSTICS__?.dustFlats ?? null));
  console.log(`[s2498] dustFlats AFTER Space = ${dustAfterSpace}`);

  // CONTROL 2 — a diagnostics key the boot DOES publish, proving the object itself is readable.
  const keys = await page.evaluate(() => Object.keys(window.__THREE_GAME_DIAGNOSTICS__ ?? {}).sort().join(','));
  console.log(`[s2498] diagnostics keys = ${keys}`);
  console.log(`[s2498] console errors = ${JSON.stringify(errors)}`);
  expect(contractId).toBe('e4-dust-flats');
});
