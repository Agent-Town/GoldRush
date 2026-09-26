import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY } from '../src/game/ProfileStorage';

// F-SEC2-4 (reviews/sec-headers-and-data-hygiene-1.md; small-fixes-1, 2026-09-25): the privacy notice
// was linked from the sign-in form and the complaints desk, but not from the card a SIGNED-IN player
// sees, the one that carries "Burn cloud ledger". Where the player sees it: Profiles, the account
// card, in a plain boot (no ?debug), signed in or not.
//
// NO LIVE REQUEST. A signed-in boot asks the account door for the cloud ledgers
// (/api/save/profiles), and the door's default origin is the live county one. Every /api/ call is
// answered here, every other off-origin request is aborted and recorded, and both tests assert that
// record is empty. The seeded session is a fixture, not a credential.

const SHOT_DIR = 'artifacts/small-fixes-1/shots';
const ACCOUNT_KEY = 'gr.account.v1';
const LINK_TEXT = 'What the Office keeps about you';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Fence = { offOrigin: string[]; answered: string[] };

// The signed-out render is the reference: the signed-in link must be the same element, byte for byte.
const signedOutLink = new Map<string, string>();

test.describe.configure({ mode: 'serial' });

test('signed-out account card carries the reference privacy link', async ({ page, baseURL }, testInfo) => {
  const fence = await fenceNetwork(page, baseURL);
  await seedProfile(page, { signedIn: false });
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();

  const card = page.getByTestId('account-card');
  await expect(card.getByTestId('account-email-form')).toBeVisible();
  const link = card.getByTestId('account-privacy-link');
  await expect(link).toHaveCount(1);
  await expect(link).toHaveText(LINK_TEXT);
  signedOutLink.set(testInfo.project.name, await link.evaluate((node) => node.outerHTML));

  expect(fence.answered, 'a signed-out boot asks the account door nothing').toEqual([]);
  expect(fence.offOrigin).toEqual([]);
  assertNoErrors(errors);
});

test('signed-in account card links the privacy notice with the same link and wording (F-SEC2-4)', async ({ page, baseURL }, testInfo) => {
  const fence = await fenceNetwork(page, baseURL);
  await seedProfile(page, { signedIn: true });
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();

  const card = page.getByTestId('account-card');
  // The signed-in branch, not the sign-in form: its controls are present and the email form is not.
  await expect(card.getByTestId('account-burn')).toBeVisible();
  await expect(card.getByTestId('account-sign-out')).toBeVisible();
  await expect(card.getByTestId('account-email-form')).toHaveCount(0);

  const link = card.getByTestId('account-privacy-link');
  await expect(link).toHaveCount(1);
  await link.scrollIntoViewIfNeeded();
  await expect(link).toBeVisible();
  await expect(link).toHaveText(LINK_TEXT);
  const href = await link.getAttribute('href');
  expect(href).toMatch(/(^|\/)privacy\.html$/);
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noopener');
  const reference = signedOutLink.get(testInfo.project.name);
  expect(reference, 'the signed-out reference ran first in this project').toBeTruthy();
  expect(await link.evaluate((node) => node.outerHTML)).toBe(reference);

  // The link resolves to the notice itself, served from this origin.
  const notice = await page.request.get(new URL(href ?? '', page.url()).toString());
  expect(notice.status()).toBe(200);
  expect(await notice.text()).toContain(`<h1>${LINK_TEXT}</h1>`);

  await shot(page, testInfo, 'signed-in');
  // Anti-vacuity for "no live request": the signed-in boot DID ask for the cloud ledgers, and the
  // fence answered it.
  await expect.poll(() => fence.answered.some((url) => url.endsWith('/api/save/profiles'))).toBe(true);
  expect(fence.offOrigin).toEqual([]);
  assertNoErrors(errors);
});

async function fenceNetwork(page: Page, baseURL: string | undefined): Promise<Fence> {
  const fence: Fence = { offOrigin: [], answered: [] };
  const own = new URL(baseURL ?? 'http://127.0.0.1:5188').origin;
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.protocol === 'data:' || url.protocol === 'blob:') return route.continue();
    if (url.pathname.startsWith('/api/')) {
      fence.answered.push(url.toString());
      const headers = {
        'access-control-allow-origin': own,
        'access-control-allow-headers': 'authorization, content-type',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
      };
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
      const body = url.pathname === '/api/save/profiles'
        ? { ok: true, profiles: [] }
        : { ok: true, savedAt: '2026-09-25T00:00:00.000Z' };
      return route.fulfill({ status: 200, headers, contentType: 'application/json', body: JSON.stringify(body) });
    }
    if (url.origin === own) return route.continue();
    fence.offOrigin.push(url.toString());
    return route.abort();
  });
  return fence;
}

async function seedProfile(page: Page, { signedIn }: { signedIn: boolean }): Promise<void> {
  await page.addInitScript(
    ({ profileKey, metaKey, townKey, accountKey, signedIn }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          version: 2,
          activeId: 'robin',
          profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
        }),
      );
      localStorage.setItem(`${profileKey}.robin.${townKey}`, 'Quartz Hill');
      localStorage.setItem(`${profileKey}.robin.${metaKey}`, JSON.stringify({ version: 1, tracks: { territory: 3, science: 6, hero: 0, agent: 0 } }));
      if (signedIn) {
        localStorage.setItem(
          accountKey,
          JSON.stringify({
            email: 'family@example.com',
            token: 'fixture-session-not-a-credential',
            accountId: 'fixture-account',
            expiresAt: '2099-01-01T00:00:00.000Z',
            profileId: 'robin',
            lastSavedAt: '2026-09-25T00:00:00.000Z',
          }),
        );
      }
    },
    { profileKey: PROFILE_KEY, metaKey: META_PROGRESS_KEY, townKey: TOWN_NAME_KEY, accountKey: ACCOUNT_KEY, signedIn },
  );
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  const prefix = `${SHOT_DIR}/${testInfo.project.name}-${name}`;
  await page.getByTestId('account-card').screenshot({ path: `${prefix}-account-card.png` });
  await page.screenshot({ path: `${prefix}-profiles.png` });
}
