import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { onRequest as standingsRoute } from '../functions/api/standings';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';

type MockKV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

const SHOTS = path.resolve('reviews/shots-fd3');
const FD1_SHOTS = path.resolve('reviews/shots-fd1');
const MINDS_AND_RIGS_SHOTS = path.resolve('reviews/shots-minds-and-rigs');
const STACK_DIRECTORY_SHOTS = path.resolve('reviews/shots-stack-directory');
const FULL_WIDTH_SHOTS = path.resolve('reviews/shots-minds-rigs-full-width');
const PROFILE_STATE: ProfileState = {
  version: 2,
  activeId: 'field-book',
  profiles: [{ id: 'field-book', name: 'Field Book', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
};

function makeKv(): MockKV {
  const store = new Map<string, string>();
  return {
    get: async (key) => store.get(key) ?? null,
    put: async (key, value) => {
      store.set(key, value);
    },
  };
}

function request(method: 'GET' | 'POST', query = '', body?: unknown): Request {
  return new Request(`http://127.0.0.1/api/standings${query}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json', 'CF-Connecting-IP': '127.0.0.1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// F-SR-3 — THE ASSAY ERA'S ADMISSION LAW. The field book aggregates the RANKED rows
// (`rankedRows` feeds every view in functions/api/standings.ts), and the county ranks only a row
// that carries a tape. So a fixture standing is a TAPED standing: the v2 shape the season roll
// admits, with the `runStart` that makes the run replayable, mirrored from the season-roll fixtures
// in scripts/test-standings.mjs.
const RUN_START = {
  meta: { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } },
  research: {
    version: 1,
    progress: { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } },
    taken: [],
    proposalSalt: 0,
    pinnedTarget: null,
  },
};

function tape(id: string, contractId: string, seed: string, waves: number, timeAlive: number, gold: number): Record<string, unknown> {
  return {
    version: 2, id, createdAt: 1, kept: true, contract: contractId, seed, difficulty: 'trail',
    simVersion: 1, runStart: RUN_START,
    inputLog: {
      version: 1, name: id, contractId, seed, difficultyPreset: 'trail', stepSeconds: 1 / 30,
      start: { x: 0, z: 12 }, durationTicks: 1, entries: [], truncated: null, primarySlot: 0, streams: [],
    },
    eventLogHash: 'fnv1a32:1234abcd',
    outcome: { reason: 'secured', secured: true, waves, timeAlive, gold },
  };
}

function standing(anonId: string, contractId: string, waves: number, stack?: Record<string, unknown>): Record<string, unknown> {
  const score = { secured: true, waves, timeAlive: 600 + waves, gold: waves * 10, baseValue: waves * 20 };
  const seed = `field-book-${anonId}`;
  const runTape = tape(`fb-${anonId.slice(0, 4)}-${contractId}`, contractId, seed, score.waves, score.timeAlive, score.gold);
  return {
    contractId,
    epochId: 'epoch-1-frontier',
    score,
    profileName: 'Field Book',
    anonId,
    difficulty: 'trail',
    seed,
    seedMode: 'live',
    seedHash: 'a'.repeat(64),
    // The endpoint recomputes sha256(inputLog) and refuses a tape whose hash disagrees, so the
    // fixture derives the hash instead of declaring one.
    inputLogHash: createHash('sha256').update(JSON.stringify((runTape as { inputLog: unknown }).inputLog)).digest('hex'),
    tape: runTape,
    ...(stack ? { stack } : {}),
  };
}

async function post(kv: MockKV, body: unknown): Promise<Response> {
  return standingsRoute({ request: request('POST', '', body), env: { TELEMETRY: kv } });
}

function collectErrors(page: Page): { console: string[]; page: string[] } {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

// The Drill Yard takes no entries and prints no ranks — owner ruling 2026-08-09, verbatim:
// "the Drill Yard is not a contract that needs a ladder - it is the training ground". These
// assertions used to live inside the cost-fields test below, where a grep for the Drill Yard
// among test names could not find them and retiring the host would have deleted them silently
// (F-1596-1). A ruling's only defence gets its own title.
test('the Drill Yard is the training ground — standings refuse it on both POST and GET', async () => {
  const kv = makeKv();
  const drillYard = await post(kv, standing('0'.repeat(32), 'e1-drill-yard', 99));
  expect(drillYard.status).toBe(400);
  expect(await drillYard.json()).toMatchObject({
    ok: false,
    error: 'training_ground',
    message: 'The Drill Yard is the training ground — practice is its own reward.',
  });
  // The key a drill-yard write WOULD have used — the season the county now writes in, so the
  // refusal is still proved by an absent row rather than by looking in a closed book.
  expect(await kv.get('standings:s2:epoch-1-frontier:e1-drill-yard')).toBeNull();
  expect((await standingsRoute({
    request: request('GET', '?contract=e1-drill-yard&epoch=epoch-1-frontier'),
    env: { TELEMETRY: kv },
  })).status).toBe(400);
});

test('minds and rigs aggregate the same standings without changing county ranking', async () => {
  const kv = makeKv();
  const contracts = ['the-claim', 'e1-dry-gulch', 'e1-night-shift'];
  const stacks = [
    { model: 'mind-a', harness: 'rig-x', harnessVersion: 'test', tokensIn: 10, tokensOut: 1, calls: 1 },
    { model: 'mind-a', harness: 'rig-y', harnessVersion: 'test', tokensIn: 20, tokensOut: 2, calls: 2 },
    { model: 'mind-b', harness: 'rig-x', harnessVersion: 'test', tokensIn: 30, tokensOut: 3, calls: 3 },
    { model: 'mind-b', harness: 'rig-y', harnessVersion: 'test' },
  ];
  const crownByContract = [0, 3, 1];
  let fixtureIndex = 0;
  for (const [contractIndex, contractId] of contracts.entries()) {
    for (const [stackIndex, stack] of stacks.entries()) {
      const costs = stack.tokensIn === undefined ? stack : {
        ...stack,
        tokensIn: stack.tokensIn + contractIndex,
        tokensOut: stack.tokensOut + contractIndex,
      };
      expect((await post(kv, standing((fixtureIndex++).toString(16).repeat(32), contractId, crownByContract[contractIndex] === stackIndex ? 40 : 10 + stackIndex, costs))).status).toBe(200);
    }
  }
  expect((await post(kv, standing('c'.repeat(32), 'the-claim', 1))).status).toBe(200);
  for (const field of ['tokensIn', 'tokensOut', 'calls']) {
    for (const value of [-1, 1.5, 1_000_000_000_001]) {
      expect((await post(kv, standing('d'.repeat(32), 'the-claim', 1, { model: 'invalid', [field]: value }))).status).toBe(400);
    }
  }

  const county = await standingsRoute({
    request: request('GET', '?contract=the-claim&epoch=epoch-1-frontier'),
    env: { TELEMETRY: kv },
  });
  const countyBody = await county.json() as { board: Array<Record<string, unknown>> };
  expect(countyBody.board[0]).toMatchObject({ rank: 1, waves: 40, model: 'mind-a', harness: 'rig-x' });

  const mindsResponse = await standingsRoute({
    request: request('GET', '?view=byStack&epoch=epoch-1-frontier'),
    env: { TELEMETRY: kv },
  });
  const minds = await mindsResponse.json() as {
    view: string;
    byStack: Array<{ model: string; contracts: Array<Record<string, unknown>>; aggregate: Record<string, unknown> }>;
  };
  expect(mindsResponse.status).toBe(200);
  expect(minds.view).toBe('byStack');
  expect(minds.byStack.find((row) => row.model === 'mind-a')?.aggregate).toMatchObject({
    standings: 6, contracts: 3, crowns: 2, bestWaves: 40,
    totalTokensIn: 96, totalTokensOut: 15, totalCalls: 9,
    declaredCells: 6, undeclaredCells: 0,
  });
  expect(minds.byStack.find((row) => row.model === 'mind-b')?.aggregate).toMatchObject({
    standings: 6, contracts: 3, crowns: 1, bestWaves: 40,
    totalTokensIn: 93, totalTokensOut: 12, totalCalls: 9,
    declaredCells: 3, undeclaredCells: 3,
  });
  expect(minds.byStack.find((row) => row.model === 'undeclared rider')).toMatchObject({ aggregate: { standings: 1, contracts: 1, crowns: 0 } });
  const absentCostCell = minds.byStack.find((row) => row.model === 'mind-b')?.contracts.find((cell) => cell.contractId === 'e1-dry-gulch');
  for (const field of ['tokensIn', 'tokensOut', 'calls']) expect(absentCostCell).not.toHaveProperty(field);

  const rigsResponse = await standingsRoute({
    request: request('GET', '?view=byHarness&epoch=epoch-1-frontier'),
    env: { TELEMETRY: kv },
  });
  const rigs = await rigsResponse.json() as {
    view: string;
    byHarness: Array<{ harness: string; contracts: Array<Record<string, unknown>>; aggregate: Record<string, unknown> }>;
  };
  expect(rigsResponse.status).toBe(200);
  expect(rigs.view).toBe('byHarness');
  expect(rigs.byHarness.find((row) => row.harness === 'rig-x')?.aggregate).toMatchObject({
    standings: 6, contracts: 3, crowns: 1, bestWaves: 40,
    totalTokensIn: 126, totalTokensOut: 18, totalCalls: 12,
    declaredCells: 6, undeclaredCells: 0,
  });
  expect(rigs.byHarness.find((row) => row.harness === 'rig-y')?.aggregate).toMatchObject({
    standings: 6, contracts: 3, crowns: 2, bestWaves: 40,
    totalTokensIn: 63, totalTokensOut: 9, totalCalls: 6,
    declaredCells: 3, undeclaredCells: 3,
  });
  const undeclaredRig = rigs.byHarness.find((row) => row.harness === 'undeclared rig');
  expect(undeclaredRig).toMatchObject({ aggregate: { standings: 1, contracts: 1, crowns: 0, declaredCells: 0, undeclaredCells: 1 } });
  expect(undeclaredRig?.aggregate).not.toHaveProperty('totalTokensIn');
});

test('plain boot renders and expands the Minds and Rigs tables', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  const now = Date.now();
  await page.addInitScript(({ key, state }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: PROFILE_KEY, state: PROFILE_STATE });
  await page.route('https://gold-rush-3in.pages.dev/api/standings**', async (route) => {
    const url = new URL(route.request().url());
    const view = url.searchParams.get('view');
    expect(['byStack', 'byHarness']).toContain(view);
    expect(url.searchParams.get('epoch')).toBe('epoch-1-frontier');
    const groups = view === 'byHarness'
      ? {
          byHarness: [
            {
              harness: 'codex-cli',
              aggregate: { standings: 1, contracts: 1, crowns: 1, bestWaves: 20, totalTokensIn: 90_000, totalTokensOut: 8_000, totalCalls: 18, declaredCells: 1, undeclaredCells: 0, latestSubmittedAt: now - 60_000 },
              contracts: [{ contractId: 'the-claim', score: { secured: true, waves: 20, timeAlive: 620, gold: 200, baseValue: 400 }, difficulty: 'trail', tokensIn: 90_000, tokensOut: 8_000, calls: 18, harness: 'codex-cli', harnessVersion: '2026.08', config: 'medium', submittedAt: now - 60_000 }],
            },
            {
              harness: 'unknown-rig',
              aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 14, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: now - 86_400_000 },
              contracts: [{ contractId: 'e1-dry-gulch', score: { secured: true, waves: 14, timeAlive: 614, gold: 140, baseValue: 280 }, difficulty: 'vein-hunter', harness: 'unknown-rig', submittedAt: now - 86_400_000 }],
            },
            {
              harness: 'undeclared rig',
              aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 12, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: now - 120_000 },
              contracts: [{ contractId: 'the-claim', score: { secured: true, waves: 12, timeAlive: 612, gold: 120, baseValue: 240 }, difficulty: 'greenhorn', submittedAt: now - 120_000 }],
            },
          ],
        }
      : {
          byStack: [
            {
              model: 'gpt-5.6-sol',
              aggregate: { standings: 2, contracts: 2, crowns: 1, bestWaves: 20, totalTokensIn: 90_000, totalTokensOut: 8_000, totalCalls: 18, declaredCells: 1, undeclaredCells: 1, latestSubmittedAt: now - 60_000 },
              contracts: [
                { contractId: 'the-claim', score: { secured: true, waves: 20, timeAlive: 620, gold: 200, baseValue: 400 }, difficulty: 'trail', tokensIn: 90_000, tokensOut: 8_000, calls: 18, harness: 'codex', harnessVersion: '2026.08', config: 'medium', submittedAt: now - 60_000 },
                { contractId: 'e1-dry-gulch', score: { secured: true, waves: 14, timeAlive: 614, gold: 140, baseValue: 280 }, difficulty: 'vein-hunter', harness: 'gr-sim', submittedAt: now - 86_400_000 },
              ],
            },
            {
              model: 'pi-v4',
              aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 20, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: now - 180_000 },
              contracts: [{ contractId: 'e1-dry-gulch', score: { secured: true, waves: 20, timeAlive: 700, gold: 260, baseValue: 420 }, difficulty: 'trail', harness: 'pi', submittedAt: now - 180_000 }],
            },
            {
              model: 'undeclared rider',
              aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 12, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: now - 120_000 },
              contracts: [{ contractId: 'the-claim', score: { secured: true, waves: 12, timeAlive: 612, gold: 120, baseValue: 240 }, difficulty: 'greenhorn', submittedAt: now - 120_000 }],
            },
          ],
        };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        view,
        epochId: 'epoch-1-frontier',
        contracts: ['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'],
        ...groups,
      }),
    });
  });

  await page.goto('/');
  expect(new URL(page.url()).search).toBe('');
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-field-book').click();
  await expect(page.getByTestId('field-book-aggregate')).toBeVisible();
  await expect(page.getByTestId('field-book-aggregate')).toContainText('3 minds · 2 contracts with showings');
  await expect(page.getByTestId('field-book-aggregate')).toContainText('90,000 in · 8,000 out · 18 calls');
  await expect(page.getByTestId('field-book')).toContainText('Minds and rigs are SELF-DECLARED');
  await expect(page.getByTestId('field-book')).toContainText("learn-more links are the county's own pointers");
  await expect(page.getByTestId('field-book-view-byStack')).toHaveText('Minds');
  await expect(page.getByTestId('field-book-view-byHarness')).toHaveText('Rigs');
  await expect(page.getByTestId('field-book-row-undeclared-rider')).toBeVisible();
  await page.getByTestId('field-book-row-gpt-5-6-sol').click();
  await expect(page.getByTestId('field-book-cell-gpt-5-6-sol-the-claim')).toContainText('90,000 in');
  await expect(page.getByTestId('field-book-cell-gpt-5-6-sol-e1-dry-gulch')).toContainText('Cost not declared');
  await expect(page.getByTestId('field-book-detail-gpt-5-6-sol-the-claim')).toContainText('codex 2026.08');
  await expect(page.getByTestId('field-book-detail-gpt-5-6-sol-the-claim')).toContainText('medium');
  await expect(page.getByTestId('field-book-detail-gpt-5-6-sol-the-claim')).toContainText(new Date(now - 60_000).toISOString());
  const frontDesk = page.locator('[data-testid="field-book"] + [data-testid="front-desk"]');
  await expect(frontDesk).toBeVisible();
  await expect(frontDesk).toContainText('SEND YOUR RIG');
  await expect(frontDesk).toContainText('Agent-Town/GoldRush');
  await expect(frontDesk).toContainText('Agent-Town/goldrush-gauntlet');
  await expect(frontDesk.getByRole('link', { name: 'Agent-Town/GoldRush', exact: true })).toHaveAttribute('href', 'https://github.com/Agent-Town/GoldRush');
  await expect(frontDesk.getByRole('link', { name: 'Agent-Town/goldrush-gauntlet', exact: true })).toHaveAttribute('href', 'https://github.com/Agent-Town/goldrush-gauntlet');
  // Base-aware since the agenttown.app/goldrush base-path fix (owner-found 2026-08-09):
  // dev base '/' yields '/skill.md'; the goldrush-base release yields '/goldrush/skill.md'.
  await expect(frontDesk.getByTestId('front-desk-skill-link')).toHaveAttribute('href', /skill\.md$/);
  expect(await frontDesk.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.locator('body').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.locator('.claim-ledger__shell').evaluate((element) => { element.scrollTop = 0; });
  await mkdir(MINDS_AND_RIGS_SHOTS, { recursive: true });
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(MINDS_AND_RIGS_SHOTS, `minds-${testInfo.project.name}.png`) });

  await page.getByTestId('field-book-view-byHarness').click();
  await expect(page.getByTestId('field-book-aggregate')).toContainText('3 rigs · 2 contracts with showings');
  await expect(page.getByTestId('field-book-row-codex-cli')).toContainText('1');
  await expect(page.getByTestId('field-book-row-undeclared-rig')).toBeVisible();
  await expect(page.getByTestId('field-book-info-codex-cli')).toHaveAttribute('href', 'https://github.com/openai/codex');
  await expect(page.getByTestId('field-book-info-codex-cli')).toHaveAttribute('target', '_blank');
  await expect(page.getByTestId('field-book-info-codex-cli')).toHaveAttribute('rel', 'noopener');
  await expect(page.getByTestId('field-book-row-unknown-rig')).toBeVisible();
  await expect(page.getByTestId('field-book-row-unknown-rig').locator('[data-field-book-info]')).toHaveCount(0);
  await mkdir(STACK_DIRECTORY_SHOTS, { recursive: true });
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(STACK_DIRECTORY_SHOTS, `rigs-${testInfo.project.name}.png`) });
  await page.getByTestId('field-book-row-codex-cli').click();
  await expect(page.getByTestId('field-book-cell-codex-cli-the-claim')).toContainText('90,000 in');
  const aggregateWrap = page.locator('.field-book__aggregate-wrap');
  if (testInfo.project.name === 'desktop-chrome') {
    expect(await aggregateWrap.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(await aggregateWrap.evaluate((element) => element.clientWidth)).toBeGreaterThanOrEqual(900);
  }
  expect(await page.locator('body').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await mkdir(FULL_WIDTH_SHOTS, { recursive: true });
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(FULL_WIDTH_SHOTS, `rigs-${testInfo.project.name}.png`) });
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(MINDS_AND_RIGS_SHOTS, `rigs-${testInfo.project.name}.png`) });

  await mkdir(FD1_SHOTS, { recursive: true });
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(FD1_SHOTS, `field-book-${testInfo.project.name}.png`) });
  await mkdir(SHOTS, { recursive: true });
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(SHOTS, `after-field-book-${testInfo.project.name}.png`) });
  expect(errors).toEqual({ console: [], page: [] });
});

test('plain boot renders the honest empty Field Book state', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(({ key, state }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: PROFILE_KEY, state: PROFILE_STATE });
  await page.route('https://gold-rush-3in.pages.dev/api/standings**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, view: 'byStack', epochId: 'epoch-1-frontier', contracts: [], byStack: [] }),
  }));

  await page.goto('/');
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-field-book').click();
  await expect(page.getByTestId('field-book-board')).toHaveText('No minds in the field book yet; the door is open.');
  expect(errors).toEqual({ console: [], page: [] });
});
