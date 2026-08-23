import { expect, test, type Page } from '@playwright/test';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import { GAME_API_ORIGIN } from '../src/app/GameApi';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';
import { RUN_TAPES_KEY, type RunTape } from '../src/game/RunTape';
import { TELEMETRY_DEV_SEND_STORAGE_KEY, TELEMETRY_OPT_IN_STORAGE_KEY } from '../src/telemetry/payload';

type StandingPost = { tape?: RunTape };

const seed = benchSeeds['the-claim'][0]!;
const profile: ProfileState = {
  version: 2,
  activeId: 'assay-auto-tape',
  profiles: [{
    id: 'assay-auto-tape',
    name: 'Assay Auto Tape',
    createdAt: 1,
    updatedAt: 1,
    difficultyPreset: 'trail',
    hintsSeen: ['story:first-contract'],
  }],
};

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function openRun(page: Page, posts: StandingPost[]): Promise<void> {
  await page.addInitScript(({ profile, profileKey, optInKey, devSendKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(optInKey, '1');
    localStorage.setItem(devSendKey, '1');
  }, {
    profile,
    profileKey: PROFILE_KEY,
    optInKey: TELEMETRY_OPT_IN_STORAGE_KEY,
    devSendKey: TELEMETRY_DEV_SEND_STORAGE_KEY,
  });
  await page.route(`${GAME_API_ORIGIN}/api/standings**`, async (route) => {
    if (route.request().method() === 'POST') posts.push(JSON.parse(route.request().postData() ?? '{}') as StandingPost);
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.route('**/api/telemetry', (route) => route.fulfill({ json: { ok: true } }));
  await page.goto(`/?debug&timescale=100&nolevel&seed=${seed}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 5);
}

test('a qualifying run posts its tape without pressing Keep this tape', async ({ page }) => {
  const posts: StandingPost[] = [];
  const errors = collectErrors(page);
  await openRun(page, posts);

  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.35);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 1);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.resetRun();
  });

  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 12_000 });
  await expect.poll(() => posts.length, { timeout: 8_000 }).toBe(1);
  expect(posts[0]?.tape).toMatchObject({
    contract: 'the-claim',
    seed,
    kept: false,
    outcome: { secured: true, waves: 10 },
  });
  expect(errors).toEqual([]);
});

test('a non-qualifying run stays local and makes no standings post', async ({ page }) => {
  const posts: StandingPost[] = [];
  const errors = collectErrors(page);
  await openRun(page, posts);

  await page.evaluate(() => window.__GR_TEST__?.endRunForTest());
  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await page.waitForTimeout(300);
  expect(posts).toEqual([]);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}').tapes?.length, RUN_TAPES_KEY)).toBe(1);
  expect(errors).toEqual([]);
});
