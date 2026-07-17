import { expect, test, type Page } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { DREDGE_QUEEN_WRECK_KEY } from '../src/game/ProfileStorage';

const QUERY = '/?debug&epoch=epoch-5-deepwater&contract=e5-deepwater-claim&nolevel&nopause&seed=dredge-queen';
const LEGACY_WRECK = { e5W6Wreck: true, x: 36, z: -20 } as const;

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ epochKey }) => {
  if (!sessionStorage.getItem('tp01-migration-test')) {
    localStorage.clear();
    sessionStorage.setItem('tp01-migration-test', '1');
  }
  localStorage.setItem(epochKey, 'epoch-5-deepwater');
}, { epochKey: ACTIVE_EPOCH_KEY }));

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function openBoss(page: Page): Promise<void> {
  await page.goto(QUERY);
  await waitForBoot(page);
}

async function waitForBoot(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e5-deepwater-claim');
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
}

async function dredge(page: Page) {
  return page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__!.deepwaterClaim as { dredgeQueenBoss?: unknown }).dredgeQueenBoss);
}

async function tileStateKeys(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter((key): key is string =>
      Boolean(key?.includes('.tilestate.')),
    ),
  );
}

test('an old-format wreck flag converts at run end and the wreck outlives the flag', async ({ page }) => {
  const errors = collectErrors(page);
  await openBoss(page);

  // Seed the pre-substrate flag through the profile-scoped shim, exactly as the old system wrote it.
  await page.evaluate(({ key, wreck }) => localStorage.setItem(key, JSON.stringify(wreck)), {
    key: DREDGE_QUEEN_WRECK_KEY,
    wreck: LEGACY_WRECK,
  });
  await page.reload();
  await waitForBoot(page);

  // Read-at-birth compat: the old flag alone mounts the wreck, same behavior as before the migration.
  await expect.poll(() => dredge(page)).toMatchObject({ active: false, act: 3, hulkPresent: true, persistentWreck: true });
  expect(await dredge(page)).toMatchObject({ anchor: { x: LEGACY_WRECK.x, z: LEGACY_WRECK.z } });

  // Write-at-end law: the conversion is staged, not committed — no tile-state key exists mid-run.
  expect(await tileStateKeys(page)).toEqual([]);

  // Run end commits the converted entry onto the substrate.
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  const written = await page.evaluate(async () => {
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    const profileId = profiles.activeProfile(localStorage).id;
    return {
      profileId,
      raw: localStorage.getItem(profiles.tileStateKey(profileId, 'e5-deepwater-claim')),
      legacyStillHeld: localStorage.getItem('gr.e5W6Wreck.v1') !== null,
    };
  });
  expect(written.raw).not.toBeNull();
  expect(JSON.parse(written.raw!)).toMatchObject({
    schemaVersion: 1,
    entries: [{ kind: 'render', id: 'dredge-queen-wreck', payload: { x: LEGACY_WRECK.x, z: LEGACY_WRECK.z }, schemaVersion: 1 }],
  });
  // Nothing loved is erased: the conversion never deletes the old flag.
  expect(written.legacyStillHeld).toBe(true);

  // The substrate is now authoritative: remove the old flag, the wreck still mounts.
  await page.evaluate(({ key }) => localStorage.removeItem(key), { key: DREDGE_QUEEN_WRECK_KEY });
  await page.reload();
  await waitForBoot(page);
  await expect.poll(() => dredge(page)).toMatchObject({ active: false, act: 3, hulkPresent: true, persistentWreck: true });
  expect(await dredge(page)).toMatchObject({ anchor: { x: LEGACY_WRECK.x, z: LEGACY_WRECK.z } });

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('a substrate wreck entry mounts without any legacy flag and stays profile-scoped', async ({ page }) => {
  const errors = collectErrors(page);
  await openBoss(page);

  const seeded = await page.evaluate(async () => {
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    const profileId = profiles.activeProfile(localStorage).id;
    localStorage.removeItem('gr.e5W6Wreck.v1');
    localStorage.setItem(
      profiles.tileStateKey(profileId, 'e5-deepwater-claim'),
      JSON.stringify({
        schemaVersion: 1,
        entries: [{ kind: 'render', id: 'dredge-queen-wreck', payload: { x: 22, z: -11 }, schemaVersion: 1 }],
      }),
    );
    return { profileId };
  });
  expect(seeded.profileId.length).toBeGreaterThan(0);
  await page.reload();
  await waitForBoot(page);
  await expect.poll(() => dredge(page)).toMatchObject({ active: false, act: 3, hulkPresent: true, persistentWreck: true });
  expect(await dredge(page)).toMatchObject({ anchor: { x: 22, z: -11 } });

  // Another profile reads its own (empty) scope: no wreck, the storm can come again.
  await page.evaluate(async () => {
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    profiles.createProfile(localStorage, 'Fresh Migrator');
  });
  await page.reload();
  await waitForBoot(page);
  await expect.poll(() => dredge(page)).toMatchObject({ active: false, act: 0, hulkPresent: false, persistentWreck: false });

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
