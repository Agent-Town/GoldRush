import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { PROFILE_KEY, profileDataKey } from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const CONTRACT_ID = 'tp00-test-claim';
const PROFILES = {
  version: 2,
  activeId: 'profile-a',
  profiles: [
    { id: 'profile-a', name: 'Profile A', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] },
    { id: 'profile-b', name: 'Profile B', createdAt: 2, updatedAt: 2, difficultyPreset: 'trail', hintsSeen: [] },
  ],
} as const;

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function openDebug(page: Page): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ profileKey, profiles }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(profileKey, JSON.stringify(profiles));
    },
    { profileKey: PROFILE_KEY, profiles: PROFILES },
  );
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=tp00');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
  return errors;
}

test('tile state is isolated by profile and restored byte-identically', async ({ page }) => {
  const errors = await openDebug(page);
  const result = await page.evaluate(async (contractId) => {
    const tileState = (await Function('return import("/src/game/TileStateStore.ts")')()) as typeof import('../src/game/TileStateStore');
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    const entry = { kind: 'render' as const, id: 'old-dredger', payload: { mounted: true }, schemaVersion: 1 };

    profiles.bindProfileSession('profile-a');
    const storeA = new tileState.TileStateStore(localStorage);
    storeA.stageWrite(contractId, entry);
    const committed = storeA.commitAtRunEnd();
    const keyA = profiles.tileStateKey('profile-a', contractId);
    const rawA = localStorage.getItem(keyA);

    profiles.bindProfileSession('profile-b');
    const storeB = new tileState.TileStateStore(localStorage);
    const hiddenFromB = storeB.readSnapshot(contractId);

    profiles.bindProfileSession('profile-a');
    const restored = new tileState.TileStateStore(localStorage).readSnapshot(contractId);
    return {
      committed,
      keyA,
      rawA,
      hiddenFromB,
      restored,
      restoredRaw: JSON.stringify(restored),
    };
  }, CONTRACT_ID);

  expect(result.committed).toBe(true);
  expect(result.keyA).toBe(profileDataKey('profile-a', `tilestate.${CONTRACT_ID}`));
  expect(result.hiddenFromB.entries).toEqual([]);
  expect(result.restored.entries).toHaveLength(1);
  expect(result.restoredRaw).toBe(result.rawA);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('unknown envelope and entry keys survive a read-stage-commit cycle byte-for-byte', async ({ page }) => {
  const errors = await openDebug(page);
  const result = await page.evaluate(async (contractId) => {
    const tileState = (await Function('return import("/src/game/TileStateStore.ts")')()) as typeof import('../src/game/TileStateStore');
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    profiles.bindProfileSession('profile-a');
    const key = profiles.tileStateKey('profile-a', contractId);
    const raw = JSON.stringify({
      schemaVersion: 7,
      futureEnvelope: { opaque: 'keep-this-exactly' },
      entries: [
        {
          kind: 'sim',
          id: 'future-canal',
          payload: { stage: 2 },
          schemaVersion: 4,
          futureEntry: ['unknown', 17],
        },
      ],
    });
    localStorage.setItem(key, raw);

    const store = new tileState.TileStateStore(localStorage);
    const snapshot = store.readSnapshot(contractId);
    store.stageWrite(contractId, snapshot.entries[0]!);
    const committed = store.commitAtRunEnd();
    return { committed, before: raw, after: localStorage.getItem(key) };
  }, CONTRACT_ID);

  expect(result.committed).toBe(true);
  expect(result.after).toBe(result.before);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('staging snapshots nested JSON and rejects values that JSON would drop', async ({ page }) => {
  const errors = await openDebug(page);
  const result = await page.evaluate(async (contractId) => {
    const tileState = (await Function('return import("/src/game/TileStateStore.ts")')()) as typeof import('../src/game/TileStateStore');
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    profiles.bindProfileSession('profile-a');
    const store = new tileState.TileStateStore(localStorage);
    const payload = { stage: 1 };
    store.stageWrite(contractId, { kind: 'sim', id: 'canal', payload, schemaVersion: 1 });
    payload.stage = 2;
    let rejected = false;
    try {
      store.stageWrite(contractId, { kind: 'sim', id: 'lossy', payload: undefined, schemaVersion: 1 });
    } catch (error) {
      rejected = error instanceof TypeError;
    }
    return { rejected, committed: store.commitAtRunEnd(), snapshot: store.readSnapshot(contractId) };
  }, CONTRACT_ID);

  expect(result.rejected).toBe(true);
  expect(result.committed).toBe(true);
  expect(result.snapshot.entries).toEqual([{ kind: 'sim', id: 'canal', payload: { stage: 1 }, schemaVersion: 1 }]);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('an over-budget tile write is refused whole and leaves the prior snapshot untouched', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (message) => message.type() === 'warning' && warnings.push(message.text()));
  const errors = await openDebug(page);
  const result = await page.evaluate(
    async ({ contractId, maxBytes }) => {
      const tileState = (await Function('return import("/src/game/TileStateStore.ts")')()) as typeof import('../src/game/TileStateStore');
      const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
      profiles.bindProfileSession('profile-a');
      const key = profiles.tileStateKey('profile-a', contractId);
      const before = JSON.stringify({
        schemaVersion: 1,
        entries: [{ kind: 'render', id: 'prior', payload: { kept: true }, schemaVersion: 1 }],
      });
      localStorage.setItem(key, before);
      const store = new tileState.TileStateStore(localStorage);
      store.stageWrite(contractId, {
        kind: 'sim',
        id: 'too-large',
        payload: { data: 'x'.repeat(maxBytes) },
        schemaVersion: 1,
      });
      return { committed: store.commitAtRunEnd(), before, after: localStorage.getItem(key) };
    },
    { contractId: CONTRACT_ID, maxBytes: Balance.persistence.tileStateMaxBytes },
  );

  expect(result.committed).toBe(false);
  expect(result.after).toBe(result.before);
  expect(warnings).toHaveLength(1);
  expect(warnings[0]).toContain('write refused');
  expect(warnings[0]).toContain(`${Balance.persistence.tileStateMaxBytes}-byte budget`);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('same seed composes with snapshots while the birth loader remains inert', async ({ page }) => {
  const errors = await openDebug(page);
  const result = await page.evaluate(async (contractId) => {
    const tileState = (await Function('return import("/src/game/TileStateStore.ts")')()) as typeof import('../src/game/TileStateStore');
    const contracts = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    profiles.bindProfileSession('profile-a');
    const testHarness = window.__GR_TEST__!;
    const run = (stage: number) => {
      const key = profiles.tileStateKey('profile-a', contractId);
      localStorage.setItem(
        key,
        JSON.stringify({
          schemaVersion: 1,
          entries: [{ kind: 'sim', id: 'canal-stage', payload: { stage }, schemaVersion: 1 }],
        }),
      );
      const snapshot = new tileState.TileStateStore(localStorage).readSnapshot(contractId);
      const tileParams = structuredClone(contracts.activeContract().tileParams);
      const beforeBirth = JSON.stringify(tileParams);
      const afterBirth = tileState.applyAtBirth(snapshot.entries, tileParams);
      const logStart = testHarness.economyLog().length;
      testHarness.resetRun();
      testHarness.setManualSim(true);
      testHarness.setBalance('enemy.contactDamage', 0);
      testHarness.rollUpgradeOffer();
      testHarness.advanceSim(40);
      const semanticLog = testHarness.economyLog().slice(logStart).map((value) => {
        const { id: _id, ...event } = value as Record<string, unknown>;
        return event;
      });
      return { snapshot, beforeBirth, afterBirth: JSON.stringify(afterBirth), semanticLog };
    };
    return { first: run(1), second: run(1), changed: run(2) };
  }, CONTRACT_ID);

  expect(result.first.snapshot).toEqual(result.second.snapshot);
  expect(result.changed.snapshot).not.toEqual(result.first.snapshot);
  expect(result.first.afterBirth).toBe(result.first.beforeBirth);
  expect(result.changed.afterBirth).toBe(result.changed.beforeBirth);
  expect(result.second.semanticLog).toEqual(result.first.semanticLog);
  expect(result.changed.semanticLog).toEqual(result.first.semanticLog);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('plain boot writes no tile-state keys', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/');
  await expect(page.getByTestId('profile-title')).toBeVisible();
  const tileKeys = await page.evaluate(() =>
    Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter((key) => key?.includes('.tilestate.')),
  );
  expect(tileKeys).toEqual([]);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
