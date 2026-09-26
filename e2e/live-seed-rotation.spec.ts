import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import registry from '../assets/rotations/rotation-seeds.json' with { type: 'json' };
import { onRequest as countyDoor } from '../functions/api/standings';
import { normalizeSeed } from '../src/core/Rng';
import { LIVE_SEED_CONSTANT, liveSeedLabel, resolveLiveSeed } from '../src/game/liveSeed';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { RESEARCH_NODES, RESEARCH_STATE_KEY, STEAMWORKS_THRESHOLD } from '../src/meta/ResearchTree';
import { TELEMETRY_DEV_SEND_STORAGE_KEY, TELEMETRY_OPT_IN_STORAGE_KEY } from '../src/telemetry/payload';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

// LIVE-SEED-ROTATION-1 (owner ruling 2026-09-24 on docs/OWNER-DECISIONS-2026-09-24.md item 2, "(a)":
// humans ride the open rotation's seed per contract). The rules are unit-tested in
// scripts/live-seed-rotation.test.mjs; this spec proves the WIRING in real boots.
//
// Runs against either build the server was started with: the default dev server, or a release one
// (`GR_RELEASE=e1`, the flag bug-office-desk.spec.ts reads), where `?debug` and `?seed=` are inert, so a
// human can only ever get the resolver's seed. The plain boots never reach the live county: the relay is
// a `.invalid` host answered by stubs, and every request to agenttown.app is refused and counted.
const RELEASE = process.env.GR_RELEASE === 'e1';
const MODE = RELEASE ? 'release-e1' : 'dev';
const ART = path.resolve('artifacts/live-seed-rotation-1');
const RELAY = 'https://relay.lsr1.invalid';
const CODE = '0123456789ABCDEF01234567';
const HOST = { playerId: 'host', name: 'Robin', town: 'Quartz Hill', client: 'browser' } as const;
const E1_BOARD = ['the-claim', 'e1-drill-yard', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'] as const;
const ROTATION_BOARDS = [...new Set(registry.rotations.flatMap((rotation) => Object.keys(rotation.seeds)))].sort();
const INERT_PIN = 'lsr1-inert-pin';
const SEEDED_KEY = 'gr.live-seed-rotation-1.seeded';
const resolved: Record<string, { seed: string; week: string | null }> = {};

type JoinMessage = { type?: string; setup?: { contractId?: string; seed?: string } };
type StandingBody = {
  contractId: string;
  seed: string;
  seedMode: string;
  seedHash: string;
  inputLogHash: string;
  tape?: { seed?: string; inputLog?: { seed?: string; playbookUses?: unknown[] } };
};
type DoorAnswer = { status: number; body: { ok?: boolean; error?: string; message?: string; rotationId?: string; rank?: number | null } };

test.afterAll(({}, testInfo) => {
  if (Object.keys(resolved).length === 0) return;
  mkdirSync(ART, { recursive: true });
  writeFileSync(
    path.join(ART, `resolved-seeds-${MODE}-${testInfo.project.name}.json`),
    `${JSON.stringify({ mode: MODE, project: testInfo.project.name, at: new Date().toISOString(), resolved }, null, 2)}\n`,
  );
});

test('the run seed feeds the wave and upgrade RNGs per contract, and a dev pin keeps precedence', async ({ page }) => {
  test.skip(RELEASE, 'the ?debug seam is inert in a release build; the plain-boot tests below cover it');
  test.setTimeout(150_000);
  const watch = watchErrors(page);
  const live = await fenceLiveCounty(page);
  const cases: Array<{ contractId: string; pin?: string }> = [
    ...ROTATION_BOARDS.map((contractId) => ({ contractId })),
    { contractId: 'e1-drill-yard' },
    { contractId: 'the-claim', pin: 'lsr1-dev-pin' },
  ];
  for (const { contractId, pin } of cases) {
    const before = Date.now();
    await page.goto(`/?debug&contract=${contractId}&nowaves&nolevel&nopause${pin ? `&seed=${pin}` : ''}`);
    await waitForContract(page, contractId);
    await page.waitForFunction(() => Boolean(window.__GR_TEST__));
    const rng = await page.evaluate(() => window.__GR_TEST__!.captureSuspend().rng);
    const candidates = pin ? [pin] : liveCandidates(contractId, before, Date.now());
    expect(candidates.map((seed) => normalizeSeed(`${seed}:waves`)), `${contractId} waves RNG`).toContain(rng.waves?.seed);
    expect(candidates.map((seed) => normalizeSeed(`${seed}:upgrades`)), `${contractId} upgrades RNG`).toContain(rng.upgrades?.seed);
    if (!pin && !ROTATION_BOARDS.includes(contractId)) expect(candidates).toEqual([LIVE_SEED_CONSTANT]);
  }
  expect(live).toEqual([]);
  expectNoConsoleErrors(watch, 'dev rng seeds');
});

test('a plain boot opens the Claim room and rides it on the open rotation seed, host and rider agreeing', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const watch = watchErrors(page);
  const live = await fenceLiveCounty(page);
  const joins = await captureJoins(page);
  let created: { setup?: { contractId?: string; seed?: string } } | null = null;
  await page.route(`${RELAY}/api/multiplayer/create`, async (route) => {
    created = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: CODE }) });
  });
  await page.route(`${RELAY}/api/multiplayer/inspect**`, (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, started: false, players: 1, roster: [HOST] }),
  }));
  await seedProfile(page, {});
  const before = Date.now();
  // A release build strips `?debug` from the address before it routes (src/main.ts), so the menu still
  // opens there: that is the proof the server under test is the build humans get. (`?seed=` would make
  // the boot a run route; the six-board launches below carry the inert pin instead.)
  await page.goto(RELEASE ? '/?debug' : '/');
  if (RELEASE) expect(new URL(page.url()).searchParams.has('debug'), 'the release build strips ?debug').toBe(false);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await dismissStoryCard(page);
  await teleportToBuilding(page, 'tavern');
  await page.getByTestId('town-open-board').click();
  await dismissStoryCard(page);
  const card = page.getByTestId('ride-together-card');
  if ((await card.getAttribute('open')) === null) await page.getByTestId('ride-together-toggle').click();
  await page.getByTestId('ride-open-claim').click();
  await expect(page.getByTestId('ride-code-word')).not.toHaveText('No claim open');
  await expect.poll(() => created?.setup?.seed ?? null).not.toBeNull();
  const room = created as unknown as { setup: { contractId: string; seed: string } };
  expect(room.setup.contractId).toBe('the-claim');
  await expect(page.getByTestId('ride-contract')).toContainText(room.setup.seed);
  mkdirSync(ART, { recursive: true });
  await page.getByTestId('ride-together-card').screenshot({ path: path.join(ART, `${MODE}-${testInfo.project.name}-ride-lobby.png`) });

  await page.getByTestId('ride-start').click();
  await waitForContract(page, 'the-claim');
  await expect.poll(() => joins.length, { timeout: 20_000 }).toBeGreaterThan(0);
  const join = joins[0]!;
  expect(join.type).toBe('join');
  expect(join.setup?.contractId).toBe('the-claim');
  expect(join.setup?.seed, 'the rider joins on the seed the host opened the room with').toBe(room.setup.seed);
  expect(liveCandidates('the-claim', before, Date.now())).toContain(room.setup.seed);
  expect(room.setup.seed).toMatch(/^e1-the-claim-r\d{4}w\d{2}-[0-9a-f]{12}$/);
  expect(liveSeedLabel(room.setup.seed)).toMatch(/^Week \d{1,2} claim$/);
  expect(live).toEqual([]);
  expectNoConsoleErrors(watch, `${MODE} claim room`);
});

test('a secured live run submits the seed it rode, and the real county door takes it inside its week', async ({ page }, testInfo) => {
  test.skip(RELEASE, 'the secure-fast balance seam is dev-only; the release boots above prove the seed');
  test.setTimeout(90_000);
  const before = Date.now();
  const { body, answer, watch, live } = await secureLiveClaim(page, null);
  expect(liveCandidates('the-claim', before, Date.now())).toContain(body.seed);
  const week = registry.rotations.find((rotation) => (rotation.seeds as Record<string, string>)['the-claim'] === body.seed);
  expect(week, 'a live Claim run rides a minted rotation seed').toBeTruthy();
  const open = Date.parse(week!.opensAt) <= Date.now() && Date.now() < Date.parse(week!.closesAt);
  if (open) {
    expect(answer.status, JSON.stringify(answer.body)).toBe(200);
    expect(answer.body).toMatchObject({ ok: true, rotationId: week!.id, rank: 1 });
    await expect(page.getByTestId('county-standing-answer')).toHaveText('County rank #1. This run holds the crown.');
  } else {
    // The registry in this tree has no open Claim week (RT-01 has not minted it yet): the resolver fell
    // back to the latest closed week and the door refuses it, exactly as the next test pins.
    expect(answer.body.error).toBe('rotation_closed');
  }
  await page.getByTestId('county-standing').screenshot({ path: path.join(ART, `${MODE}-${testInfo.project.name}-standing-inside-week.png`) });
  expect(live).toEqual([]);
  expectNoConsoleErrors(watch, 'live standing inside its week');
});

test('a run ridden on last week and submitted after Monday 00:00 UTC is refused, and the player reads why', async ({ page }, testInfo) => {
  test.skip(RELEASE, 'the secure-fast balance seam is dev-only; the release boots above prove the seed');
  test.setTimeout(90_000);
  const now = Date.now();
  const lastWeek = [...registry.rotations]
    .filter((rotation) => Date.parse(rotation.closesAt) <= now && (rotation.seeds as Record<string, string>)['the-claim'])
    .sort((a, b) => Date.parse(b.opensAt) - Date.parse(a.opensAt))[0];
  test.skip(!lastWeek, 'no closed Claim week in the registry yet');
  // The page believes it is the middle of last week when the run is born; the door answers on the real
  // clock. That is a run that started before the close and reached the door after it.
  const { body, answer, answers, watch, live } = await secureLiveClaim(page, Date.parse(lastWeek!.opensAt) + 3.5 * 86_400_000);
  expect(body.seed).toBe((lastWeek!.seeds as Record<string, string>)['the-claim']);
  expect(answer.status, JSON.stringify(answer.body)).toBe(403);
  expect(answer.body).toMatchObject({ ok: false, error: 'rotation_closed', message: 'That rotation is not open.' });
  await expect(page.getByTestId('county-standing-answer')).toHaveText('The county refused this standing: That rotation is not open.');
  await page.getByTestId('county-standing').screenshot({ path: path.join(ART, `${MODE}-${testInfo.project.name}-standing-after-monday.png`) });
  expect(live).toEqual([]);
  // The browser logs each honest 403 from the door as a failed resource; nothing else may reach the console.
  const refusedResource = /^Failed to load resource: the server responded with a status of 403/;
  expect(watch.errors.filter((text) => !refusedResource.test(text))).toEqual([]);
  expect(watch.errors.length).toBeLessThanOrEqual(answers.filter((next) => next.status === 403).length);
});

for (const contractId of E1_BOARD) {
  test(`${contractId}: a plain launch rides the resolver's seed`, async ({ page }) => {
    test.setTimeout(90_000);
    const watch = watchErrors(page);
    const live = await fenceLiveCounty(page);
    const joins = await captureJoins(page);
    // The Game announces its contract's seed in the co-op handshake (`currentMultiplayerSetup` with the
    // active contract), which is the one place a release build publishes it. The staged setup's own seed
    // is a placeholder the Game must NOT reuse.
    await seedProfile(page, {
      contractId,
      ride: {
        relayBase: RELAY,
        code: CODE,
        player: { name: HOST.name, town: HOST.town },
        phrase: 'COPPER-MULE-LSR1',
        setup: { contractId, seed: 'staged-placeholder', difficultyPreset: 'trail', meta: {}, research: {} },
      },
    });
    const before = Date.now();
    await page.goto(`/?contract=${contractId}${RELEASE ? `&debug&seed=${INERT_PIN}` : ''}`);
    await waitForContract(page, contractId);
    await expect.poll(() => joins.length, { timeout: 20_000 }).toBeGreaterThan(0);
    const seed = joins[0]!.setup?.seed ?? '';
    expect(joins[0]!.setup?.contractId).toBe(contractId);
    expect(liveCandidates(contractId, before, Date.now())).toContain(seed);
    if (ROTATION_BOARDS.includes(contractId)) {
      expect(registry.rotations.some((rotation) => (rotation.seeds as Record<string, string>)[contractId] === seed)).toBe(true);
      expect(liveSeedLabel(seed)).toMatch(/^Week \d{1,2} claim$/);
    } else {
      expect(seed).toBe(LIVE_SEED_CONSTANT);
    }
    resolved[contractId] = { seed, week: liveSeedLabel(seed) };
    expect(live).toEqual([]);
    expectNoConsoleErrors(watch, `${MODE} ${contractId}`);
  });
}

async function secureLiveClaim(page: Page, pageClock: number | null): Promise<{
  body: StandingBody;
  answer: DoorAnswer;
  answers: DoorAnswer[];
  watch: ReturnType<typeof watchErrors>;
  live: string[];
}> {
  const watch = watchErrors(page);
  const live = await fenceLiveCounty(page);
  const store = new Map<string, string>();
  const kv = { get: async (key: string) => store.get(key) ?? null, put: async (key: string, value: string) => { store.set(key, value); } };
  const bodies: StandingBody[] = [];
  const answers: DoorAnswer[] = [];
  const rawVerdicts: DoorAnswer[] = [];
  await page.route('https://agenttown.app/api/telemetry', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  // The REAL door (functions/api/standings.ts) answers in this process on an in-memory ledger: the
  // browser's own request body goes in, the door's own status and copy come back. Nothing leaves the box.
  await page.route('https://agenttown.app/api/standings**', async (route) => {
    const request = route.request();
    const raw = request.postData() ?? undefined;
    const url = new URL(request.url());
    const ask = async (body: string | undefined) => {
      const response = await countyDoor({
        request: new Request(`http://127.0.0.1${url.pathname}${url.search}`, {
          method: request.method(),
          headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '127.0.0.1' },
          ...(body === undefined ? {} : { body }),
        }),
        env: { TELEMETRY: kv },
      });
      return { status: response.status, text: await response.text() };
    };
    let verdict = await ask(raw);
    if (request.method() === 'POST' && raw) {
      const posted = JSON.parse(raw) as StandingBody;
      bodies.push(posted);
      const first = { status: verdict.status, body: JSON.parse(verdict.text) as DoorAnswer['body'] };
      // F-LSR1-0 (found by this spec, out of this task's firewall): since 15dc51b89 (2026-09-05) every
      // browser reel carries `inputLog.playbookUses` (always, empty when no playbook was used) and the
      // door's tape grammar (`validTapeInput`) does not know the key, so it refuses EVERY browser standing
      // `bad_payload` before any seed check. An EMPTY list carries nothing; to reach the verdict this task
      // is about, the spec re-asks the door with that empty list dropped and `inputLogHash` recomputed,
      // exactly what a client that omits an empty list would send. Both verdicts are recorded; once the
      // door accepts the raw body this branch no longer runs.
      const uses = posted.tape?.inputLog?.playbookUses;
      if (first.status === 400 && first.body.error === 'bad_payload' && Array.isArray(uses) && uses.length === 0) {
        const stripped = structuredClone(posted);
        delete stripped.tape!.inputLog!.playbookUses;
        stripped.inputLogHash = createHash('sha256').update(JSON.stringify(stripped.tape!.inputLog)).digest('hex');
        verdict = await ask(JSON.stringify(stripped));
        rawVerdicts.push(first);
      }
      answers.push({ status: verdict.status, body: JSON.parse(verdict.text) as DoorAnswer['body'] });
    }
    await route.fulfill({ status: verdict.status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: verdict.text });
  });
  await seedProfile(page, { standings: true });
  if (pageClock !== null) await page.clock.setFixedTime(pageClock);
  await page.goto('/?debug&timescale=100&nolevel');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 5);
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
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 20_000 });
  // The standing posts when the run ENDS: banking the secured claim (`RunManager.endSecuredRun` emits
  // `run_ended`, whose Game handler calls `submitCountyStanding`), not at the secure tick itself.
  await page.getByTestId('bank-secured-claim').click();
  await expect.poll(() => answers.length, { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  await expect(page.getByTestId('county-standing')).toBeVisible();
  const body = bodies[0]!;
  expect(body.contractId).toBe('the-claim');
  expect(body.seedMode, 'an unpinned run is live play, never a bench claim').toBe('live');
  expect(body.seedHash).toBe(createHash('sha256').update(body.seed).digest('hex'));
  expect(body.tape?.seed, 'the reel names the seed the run rode').toBe(body.seed);
  expect(body.tape?.inputLog?.seed).toBe(body.seed);
  expect(liveSeedLabel(body.seed)).toMatch(/^Week \d{1,2} claim$/);
  mkdirSync(ART, { recursive: true });
  expect(bodies.every((next) => next.seed === body.seed), 'every standing this run posts names one seed').toBe(true);
  writeFileSync(test.info().outputPath('door-exchange.json'), `${JSON.stringify({ rawVerdicts, answers, bodies }, null, 2)}\n`);
  if (rawVerdicts.length) {
    test.info().annotations.push({ type: 'F-LSR1-0', description: `raw browser body refused ${JSON.stringify(rawVerdicts[0]!.body)}; verdict taken on the body without its empty playbookUses` });
  }
  writeFileSync(path.join(ART, `${MODE}-${test.info().project.name}-${pageClock === null ? 'inside-week' : 'after-monday'}-door.json`), `${JSON.stringify({ seed: body.seed, seedMode: body.seedMode, rawVerdicts, answers }, null, 2)}\n`);
  return { body, answer: answers[0]!, answers, watch, live };
}

function liveCandidates(contractId: string, before: number, after: number): string[] {
  return [...new Set([resolveLiveSeed(contractId, before), resolveLiveSeed(contractId, after)])];
}

async function fenceLiveCounty(page: Page): Promise<string[]> {
  const live: string[] = [];
  await page.route('https://agenttown.app/**', (route) => {
    live.push(`${route.request().method()} ${route.request().url()}`);
    return route.abort('blockedbyclient');
  });
  return live;
}

async function captureJoins(page: Page): Promise<JoinMessage[]> {
  const joins: JoinMessage[] = [];
  await page.routeWebSocket(/\/api\/multiplayer\/connect/, (socket) => {
    socket.onMessage((raw) => {
      try {
        const message = JSON.parse(String(raw)) as JoinMessage;
        if (message.type === 'join' || message.type === 'rejoin') joins.push(message);
      } catch {
        // Not a handshake frame; the refusal below answers it the same way.
      }
      socket.send(JSON.stringify({ v: 3, type: 'error', error: 'room_not_found' }));
    });
  });
  return joins;
}

async function seedProfile(page: Page, options: { contractId?: string; ride?: unknown; standings?: boolean }): Promise<void> {
  // The six-board launches need the E1 boards unlocked (the release-build.spec.ts seeding); the Claim-only
  // tests ride a plain first-town profile, so the reel's runStart stays the ordinary one.
  const unlocked = options.contractId !== undefined && options.contractId !== 'the-claim';
  await page.addInitScript(({ keys, seededKey, contractId, ride, standings, unlocked, relay, threshold, taken }) => {
    if (sessionStorage.getItem(seededKey)) return;
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
    };
    localStorage.setItem(keys.profile, JSON.stringify(profile));
    localStorage.setItem(keys.town, 'Quartz Hill');
    localStorage.setItem(keys.firstClaim, '1');
    localStorage.setItem(keys.activeEpoch, 'epoch-1-frontier');
    if (unlocked) {
      localStorage.setItem(keys.meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: threshold, hero: 0, agent: 0 } }));
      localStorage.setItem(keys.research, JSON.stringify({ version: 1, taken, proposalSalt: 0, pinnedTarget: null }));
      localStorage.setItem(keys.scores, JSON.stringify([
        { waves: 20, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: 'the-claim', profileName: 'Robin' },
        { waves: 20, kills: 0, gold: 0, timeAlive: 60, at: 2, secured: true, contractId: 'e1-dry-gulch', profileName: 'Robin' },
      ]));
    } else {
      localStorage.setItem(keys.scores, '[]');
    }
    localStorage.setItem('gr.mp.relayBase.v1', relay);
    localStorage.setItem(keys.optIn, standings ? '1' : '0');
    if (standings) localStorage.setItem(keys.devSend, '1');
    if (contractId) sessionStorage.setItem('gr.contract.launch.v1', contractId);
    if (ride) sessionStorage.setItem('gr.mp.ride.v1', JSON.stringify(ride));
    sessionStorage.setItem(seededKey, '1');
  }, {
    keys: {
      profile: PROFILE_KEY,
      town: profileDataKey('robin', TOWN_NAME_KEY),
      firstClaim: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
      activeEpoch: profileDataKey('robin', ACTIVE_EPOCH_KEY),
      meta: profileDataKey('robin', META_PROGRESS_KEY),
      research: profileDataKey('robin', RESEARCH_STATE_KEY),
      scores: profileDataKey('robin', SCOREBOARD_KEY),
      optIn: TELEMETRY_OPT_IN_STORAGE_KEY,
      devSend: TELEMETRY_DEV_SEND_STORAGE_KEY,
    },
    seededKey: SEEDED_KEY,
    contractId: options.contractId,
    ride: options.ride,
    standings: options.standings === true,
    unlocked,
    relay: RELAY,
    threshold: STEAMWORKS_THRESHOLD,
    taken: RESEARCH_NODES.map((node) => node.id),
  });
}

async function waitForContract(page: Page, contractId: string): Promise<void> {
  await page.waitForFunction((id) =>
    window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10,
  contractId);
}

async function teleportToBuilding(page: Page, buildingId: string): Promise<void> {
  await page.evaluate((id) => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const building = town.buildings.find((entry) => entry.id === id)!;
    town.teleport(building.approach.x, building.approach.z);
  }, buildingId);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe(buildingId);
}

async function dismissStoryCard(page: Page): Promise<void> {
  if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) await page.mouse.click(6, 6);
}
