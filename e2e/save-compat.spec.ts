import { expect, test, type Page } from '@playwright/test';
import fixture from './fixtures/ledger-pack-v2026-07-19.json' with { type: 'json' };
import { PROFILE_KEY } from '../src/game/ProfileStorage';
import type { ProfileTransferEnvelope } from '../src/game/ProfileTransfer';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

test('the 2026-07-19 ledger ancestors import, heal, and resume', async ({ page }) => {
  await page.addInitScript((profileKey) => {
    if (sessionStorage.getItem('save-compat-seeded') === 'true') return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('save-compat-seeded', 'true');
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'local-keeper',
      profiles: [{
        id: 'local-keeper',
        name: 'Local Keeper',
        createdAt: 1,
        updatedAt: 1,
        difficultyPreset: 'trail',
        hintsSeen: [],
      }],
    }));
  }, PROFILE_KEY);
  const errors = collectErrors(page);
  await page.goto('/');

  const imported = await page.evaluate(async (corpus) => {
    const transfer = (await Function('return import("/src/game/ProfileTransfer.ts")')()) as typeof import('../src/game/ProfileTransfer');
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    const research = (await Function('return import("/src/meta/ResearchTree.ts")')()) as typeof import('../src/meta/ResearchTree');
    const contracts = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    const results = [];

    for (const pack of corpus.packs) {
      const expanded = await transfer.expandCloudProfileTransfer(pack.envelope as unknown as ProfileTransferEnvelope);
      if (!expanded) throw new Error(`could not expand ${pack.expected.name}`);
      const result = transfer.unpackProfile(localStorage, expanded);
      if (!result.ok) throw new Error(result.message);
      profiles.bindProfileSession(result.profile.id);
      research.reconcileActiveEpoch(localStorage);
      const slots = JSON.parse(localStorage.getItem(profiles.SAVE_SLOTS_KEY) ?? '{"manual":[]}');
      const run = JSON.parse(localStorage.getItem(profiles.RUN_SUSPEND_KEY) ?? 'null');
      results.push({
        name: result.profile.name,
        difficultyPreset: result.profile.difficultyPreset,
        activeEpoch: localStorage.getItem(contracts.ACTIVE_EPOCH_KEY),
        saveSlotCount: slots.manual.length,
        resumableContract: run?.contractId ?? null,
      });
    }
    return {
      results,
      profileNames: (profiles.loadProfileState(localStorage)?.profiles ?? []).map((profile) => profile.name),
    };
  }, fixture);

  expect(fixture.packs.every((pack) => pack.envelope.version === 2 && '$goldRushGzipDataV1' in pack.envelope.data)).toBe(true);
  expect(imported.results).toEqual(fixture.packs.map((pack) => pack.expected));
  expect(imported.profileNames).toEqual(['Local Keeper', ...fixture.packs.map((pack) => pack.expected.name)]);

  await page.reload();
  await expect(page.getByTestId('start-menu-continue')).toBeVisible();
  await page.getByTestId('start-menu-continue').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => ({
    contractId: window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId,
    difficultyPreset: window.__THREE_GAME_DIAGNOSTICS__?.difficultyPreset,
  }))).toEqual({ contractId: 'the-claim', difficultyPreset: 'vein-hunter' });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
