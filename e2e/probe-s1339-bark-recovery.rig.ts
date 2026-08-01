// PROBE (s1339) — F-1338-1's GATE, verbatim: "measure whether `activeBark.actorId` returns to
// `tavernkeeper` on its own after a youngster occludes it, and how long that takes."
//
// NOT a gate test. `*.rig.ts` is testIgnored by the default config (playwright.config.ts:47), so
// this never enters a drain battery; it is collected only under GR_CAPTURE_RUN=1. It asserts
// nothing about the tree — it prints a timeline. Mirrored into git per the RETENTION LAW.
//
// Navigation is COPIED VERBATIM from e2e/en-02-e1-coverage.spec.ts (seedProfile / steerToPrompt /
// approachTavern) so the probe measures the same code path the flake lives on — memory law
// "reuse the failing test's navigation, don't write a third probe".
import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../src/encyclopedia/storage';
import { TOWN_ACTORS } from '../src/town/townsfolk';

const PROFILE_ID = 'robin';
const HORIZON_MS = 25_000;
const SAMPLE_MS = 100;

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey }) => {
      if (sessionStorage.getItem('__en02_seeded') === '1') return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('__en02_seeded', '1');
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey(PROFILE_ID, TOWN_NAME_KEY),
      ledgerKey: profileDataKey(PROFILE_ID, LEDGER_DISCOVERED_STORAGE_KEY),
    },
  );
}

async function steerToPrompt(page: Page, prompt: 'tavern'): Promise<void> {
  const target = await page.evaluate((id) => {
    const slot = window.__GR_TOWN_DIAGNOSTICS__?.plaza.slots.find((candidate) => candidate.id === id);
    return slot?.approach ?? slot?.position;
  }, prompt);
  if (!target) throw new Error(`${prompt} is absent from town plaza diagnostics`);
  for (let step = 0; step < 48; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === prompt) break;
    const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.player);
    const keys: string[] = [];
    if (Math.abs(target.x - position.x) > 0.6) keys.push(target.x > position.x ? 'KeyD' : 'KeyA');
    if (Math.abs(target.z - position.z) > 0.6) keys.push(target.z > position.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(160);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
}

async function approachTavern(page: Page): Promise<void> {
  await steerToPrompt(page, 'tavern');
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
}

test('PROBE s1339 bark-card actorId timeline after arriving at the tavern', async ({ page }, testInfo) => {
  // The sampling horizon plus navigation exceeds the config's 30s default; this is a probe, not a
  // gate, so the horizon sets the budget rather than the other way round.
  test.setTimeout(90_000);
  await seedProfile(page);
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await approachTavern(page);

  // t=0 is the instant approachTavern's own poll returns — i.e. exactly where the failing
  // assertion at en-02-e1-coverage.spec.ts:323 fires.
  const t0 = Date.now();
  const samples: Array<{ t: number; actorId: string | null; prompt: string | null; card: string | null }> = [];
  while (Date.now() - t0 < HORIZON_MS) {
    const snap = await page.evaluate(() => ({
      actorId: window.__GR_TOWN_DIAGNOSTICS__?.activeBark?.actorId ?? null,
      prompt: window.__GR_TOWN_DIAGNOSTICS__?.activePrompt ?? null,
      card: document.querySelector('[data-testid="town-bark-card"]')?.getAttribute('data-actor-id') ?? null,
    }));
    samples.push({ t: Date.now() - t0, ...snap });
    await page.waitForTimeout(SAMPLE_MS);
  }

  const first = samples[0]!;
  const transitions: Array<{ t: number; from: string | null; to: string | null }> = [];
  for (let i = 1; i < samples.length; i += 1) {
    if (samples[i]!.actorId !== samples[i - 1]!.actorId) {
      transitions.push({ t: samples[i]!.t, from: samples[i - 1]!.actorId, to: samples[i]!.actorId });
    }
  }
  const firstKeeper = samples.find((s) => s.actorId === 'tavernkeeper');
  const keeperSamples = samples.filter((s) => s.actorId === 'tavernkeeper').length;
  const cardDivergences = samples.filter((s) => s.actorId !== s.card).length;

  // Occlusion episodes = maximal runs where the card is NOT the tavernkeeper, after the first
  // time it ever was. Their durations answer the gate's "how long".
  const episodes: Array<{ start: number; end: number; ms: number; owner: string | null }> = [];
  if (firstKeeper) {
    let run: { start: number; owner: string | null } | null = null;
    for (const s of samples.filter((x) => x.t >= firstKeeper.t)) {
      if (s.actorId !== 'tavernkeeper') {
        if (!run) run = { start: s.t, owner: s.actorId };
      } else if (run) {
        episodes.push({ start: run.start, end: s.t, ms: s.t - run.start, owner: run.owner });
        run = null;
      }
    }
    if (run) episodes.push({ start: run.start, end: -1, ms: -1, owner: run.owner });
  }

  const report = {
    project: testInfo.project.name,
    horizonMs: HORIZON_MS,
    sampleMs: SAMPLE_MS,
    samples: samples.length,
    atArrival: { actorId: first.actorId, prompt: first.prompt, card: first.card },
    firstTavernkeeperAtMs: firstKeeper ? firstKeeper.t : null,
    tavernkeeperShareOfSamples: `${keeperSamples}/${samples.length}`,
    promptHeldTavern: samples.every((s) => s.prompt === 'tavern'),
    diagnosticsVsDomDivergences: cardDivergences,
    transitions,
    occlusionEpisodesAfterFirstKeeper: episodes,
  };
  console.log(`PROBE_S1339_JSON ${JSON.stringify(report)}`);
});

// PROBE 2 — the only candidate repair the first probe did not refute: make the approach
// DETERMINISTIC rather than waiting longer. `__GR_TOWN_DIAGNOSTICS__.teleport` (TownScene.ts:2210)
// is exposed for tests; standing on the tavernkeeper's own post gives distanceSq = 0, and
// TownScene.ts:1444 selects with a STRICT `<`, so no other actor can displace it. This probe asks
// whether that survives the sim (collision push-out, prompt loss) instead of assuming it.
test('PROBE s1339 deterministic post — teleport to the tavernkeeper and hold', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  // Default = the tavernkeeper's own post. GR_PROBE_POST="x,z" overrides, so candidate standing
  // spots outside the tavern footprint can be measured without editing the rig.
  const override = process.env.GR_PROBE_POST?.split(',').map(Number);
  const post =
    override && override.length === 2 && override.every((n) => Number.isFinite(n))
      ? { x: override[0]!, z: override[1]! }
      : TOWN_ACTORS.find((actor) => actor.id === 'tavernkeeper')!.position;
  await seedProfile(page);
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await approachTavern(page);

  await page.evaluate(({ x, z }) => window.__GR_TOWN_DIAGNOSTICS__!.teleport(x, z), post);

  const t0 = Date.now();
  const samples: Array<{ t: number; actorId: string | null; prompt: string | null; card: string | null; drift: number }> = [];
  while (Date.now() - t0 < HORIZON_MS) {
    const snap = await page.evaluate(
      ({ x, z }) => {
        const d = window.__GR_TOWN_DIAGNOSTICS__!;
        const dx = d.player.x - x;
        const dz = d.player.z - z;
        return {
          actorId: d.activeBark?.actorId ?? null,
          prompt: d.activePrompt ?? null,
          card: document.querySelector('[data-testid="town-bark-card"]')?.getAttribute('data-actor-id') ?? null,
          drift: Math.sqrt(dx * dx + dz * dz),
        };
      },
      post,
    );
    samples.push({ t: Date.now() - t0, ...snap });
    await page.waitForTimeout(SAMPLE_MS);
  }

  const keeper = samples.filter((s) => s.actorId === 'tavernkeeper').length;
  const firstKeeper = samples.find((s) => s.actorId === 'tavernkeeper');
  const others = [...new Set(samples.filter((s) => s.actorId !== 'tavernkeeper').map((s) => s.actorId))];
  const postReport = {
    project: testInfo.project.name,
    post,
    samples: samples.length,
    firstTavernkeeperAtMs: firstKeeper ? firstKeeper.t : null,
    tavernkeeperShareOfSamples: `${keeper}/${samples.length}`,
    nonKeeperOwners: others,
    promptHeldTavern: samples.every((s) => s.prompt === 'tavern'),
    promptValues: [...new Set(samples.map((s) => s.prompt))],
    maxDriftFromPost: Math.max(...samples.map((s) => s.drift)),
  };
  console.log(`PROBE_S1339_POST_JSON ${JSON.stringify(postReport)}`);
});
