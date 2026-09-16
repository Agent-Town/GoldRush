/**
 * playability-smoke.spec.ts — "how do we get them all playable for me to test?" (owner, 2026-09-05)
 *
 * ONE TEST PER BOARD CONTRACT. Each one boots the contract the way a HUMAN boots it — no `?debug`,
 * no `__GR_TEST__`, no contract registry — and answers six questions the owner would otherwise
 * answer by hand tomorrow, one map at a time:
 *
 *   boots     the requested contract actually loaded (diagnostics.contract.fallbackReason === null)
 *   briefing  the run card is on screen and names THIS contract, with its own goals and rules
 *   HUD       gold, wave, and the contract's own objective line are readable
 *   moves     WASD moves the hero (real key events, read back off the read-only diagnostics)
 *   wave 2    the run reaches wave 2 under its own steam — UNLESS the contract has no waves to
 *             reach, in which case it is asked about its OWN objective instead (see below)
 *   clean     zero console errors and zero page errors across the whole boot
 *
 * THE PRACTICE EXEMPTION, IN THIS SPEC'S OWN WORDS (F-PLAY-E1-1, declared 2026-09-16).
 * A contract that declares `practice` (`ContractPracticeMode`, src/meta/ContractFamilies.ts:618)
 * is a PRACTICE GROUND, not a wave board: its `scheduledWaves` field is typed `false`, the wave
 * system only spawns when the player rings the yard's own bell, and so "reaches wave 2" is a
 * question the map can never answer however well it plays. The 2026-09-15 census measured exactly
 * that and called it a census defect rather than a map defect: `e1-drill-yard` "reached wave 0
 * after 374 s sim (runState `playing`, HUD wave 0) — the Drill Yard has no waves to reach, a
 * by-design exemption the smoke does not declare"
 * (docs/bench/playability-census-2026-09-15.md). It is declared here now.
 *
 * The exemption is not a skip. Such a contract is asked ITS OWN question over the SAME window an
 * ordinary contract gets to reach wave 2 (two default wave intervals, 60 sim-seconds): is the
 * practice objective still reachable at the end of it? — the yard is live and says itself that it
 * schedules no waves; every station and target it declared is on the board; every target is
 * standing and undamaged, so there is still something to practise on; and the run is still
 * `playing`, so the player is alive to walk over and do it.
 *
 * WHY NO `?debug` (Mistake #10). The owner's Saturday is a plain boot on the deployed preview. A
 * smoke that needs the debug seam proves nothing about that morning. Everything this spec uses is
 * reachable by a player:
 *   - `?contract=<id>` + the sessionStorage launch key `gr.contract.launch.v1` is EXACTLY what the
 *     town board's Launch button leaves behind (src/main.ts:230 `launchContract` ->
 *     `stagePlayerContractLaunch`), and `activeContractSelection` honours it with no debug flag
 *     (src/meta/ContractFamilies.ts:1336 `launched`).
 *   - `?timescale=N` is read by `readDebugParams` OUTSIDE the debug gate — the only thing that
 *     disables it is a RELEASE build (src/core/DebugParams.ts:42). In the full-board build the
 *     owner will be testing, a player can type it. It is here so 42 contracts x 2 viewports finish
 *     in an evening; nothing else about the run changes.
 *   - the save state below is a PROGRESSED PROFILE, not a seam. `reverifyStagedContractLaunch`
 *     (src/meta/ContractUnlock.ts:77) throws away a staged launch whose contract is still locked,
 *     so a smoke of the whole board has to arrive as a player who has earned the whole board.
 *
 * WHY IT IS NOT IN THE DEFAULT BATTERY. 42 contracts x 2 projects is ~30 minutes of wall clock per
 * environment (measured: dev 26 min, preview 28 min). Tagged `@slow` AND gated behind
 * GR_PLAYABILITY_SMOKE, because the tag alone would not keep it out of `npm test` (see the
 * `test.skip` below). Run it with `npm run test:playability`.
 */
import { appendFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  TOWN_WELCOME_SEEN_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listBoardContracts, listEpochs, type ContractManifest } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';

const ARTIFACT_ROOT = path.resolve('artifacts/playability-smoke');
/** dev | preview — one matrix per environment, both kept side by side. */
const ENV_LABEL = (process.env.GR_SMOKE_ENV ?? 'dev').trim();
const SHOT_DIR = path.join(ARTIFACT_ROOT, ENV_LABEL);
const ROWS_PATH = path.join(ARTIFACT_ROOT, 'rows.jsonl');
/**
 * The default config's globalSetup (scripts/external-server-guard.mjs) refuses any external server
 * that is not a vite DEV server, and says so with no bypass flag — deliberately. The deployed
 * preview IS a production build, so the preview matrix keeps GR_CAPTURE_BASE_URL pointed at the
 * local dev server (guard satisfied, honestly) and redirects only THIS spec with GR_SMOKE_BASE_URL.
 */
const SMOKE_BASE_URL = (process.env.GR_SMOKE_BASE_URL ?? '').trim();
const TIMESCALE = process.env.GR_SMOKE_TIMESCALE ?? '4';
const WAVE_TIMEOUT_MS = Number(process.env.GR_SMOKE_WAVE_TIMEOUT_MS ?? 90_000);
const BOOT_TIMEOUT_MS = Number(process.env.GR_SMOKE_BOOT_TIMEOUT_MS ?? 60_000);
const ONLY = (process.env.GR_SMOKE_ONLY ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

if (SMOKE_BASE_URL) test.use({ baseURL: SMOKE_BASE_URL });

/**
 * OUT OF THE DEFAULT BATTERY, BY MECHANISM AND NOT BY WISH. `playwright.config.ts` sets
 * `testDir: './e2e'` and ignores only `**\/*.rig.ts` plus three specs another config claims, so a
 * `@slow` tag on its own would NOT keep these 42 x 2 cells (~30 minutes per environment) out of
 * `npm test`. This is the house gate for exactly that — the same shape as
 * `e2e/f1148-1-trajectory-probe.spec.ts:5` and `e2e/landmark-brightness.spec.ts:183`.
 */
test.skip(
  !process.env.GR_PLAYABILITY_SMOKE,
  'whole-board matrix, ~30 min per environment — run `npm run test:playability`, or set GR_PLAYABILITY_SMOKE=1',
);

const PROFILE_ID = 'robin';
/** The whole board, in board order — src/meta/ContractFamilies.ts:1004. */
const BOARD_CONTRACTS: readonly ContractManifest[] = listBoardContracts();
const SMOKE_CONTRACTS = ONLY.length ? BOARD_CONTRACTS.filter((entry) => ONLY.includes(entry.id)) : BOARD_CONTRACTS;

type Cell = { ok: boolean; detail: string };
type Row = {
  env: string;
  project: string;
  contract: string;
  name: string;
  epoch: string;
  unlock: string;
  boots: Cell;
  briefing: Cell;
  hud: Cell;
  moves: Cell;
  wave2: Cell;
  clean: Cell;
  screenshot: string;
  screenshotBytes: number;
  consoleErrors: string[];
  pageErrors: string[];
  notes: string[];
  baseURL: string;
  at: string;
};

const pass = (detail = ''): Cell => ({ ok: true, detail });
const fail = (detail: string): Cell => ({ ok: false, detail });

/** listBoardContracts() flattens the epochs away; recover the owner from the id prefix. */
function epochOf(contractId: string): string {
  const ordinal = contractId.match(/^e(\d+)-/)?.[1];
  if (!ordinal) return 'epoch-1-frontier';
  return listEpochs().find((entry) => entry.id.startsWith(`epoch-${ordinal}-`))?.id ?? 'unknown';
}

/**
 * A player who has earned the whole board. Every key here is one a real profile writes; nothing is
 * a test-only channel. Written to both the raw and the profile-scoped key because
 * `installProfileStorageScope` (src/game/ProfileStorage.ts:306) is installed by the app, and module
 * scope in ContractFamilies can read ACTIVE_EPOCH_KEY before that happens.
 */
function seedEntries(): Array<[string, string]> {
  const profile: ProfileState = {
    version: 2,
    activeId: PROFILE_ID,
    profiles: [{ id: PROFILE_ID, name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  };
  const scores = BOARD_CONTRACTS.map((entry, index) => ({
    kills: 40,
    gold: 400,
    timeAlive: 600,
    at: index + 1,
    waves: 30,
    secured: true,
    contractId: entry.id,
    profileName: 'Robin',
  }));
  const meta = JSON.stringify({ version: 1, tracks: { territory: 40, science: 999, hero: 40, agent: 40 } });
  // scienceMeter().complete compares the ACTIVE epoch's registry steps to its threshold
  // (src/meta/ResearchTree.ts:296); a fresh registry inherits 0, which would leave e1-baron locked.
  const research = JSON.stringify({ version: 1, steps: 999, taken: [], proposalSalt: 0, pinnedTarget: null, metaScienceCursor: 999 });
  const logical: Array<[string, string]> = [
    [SCOREBOARD_KEY, JSON.stringify(scores)],
    [META_PROGRESS_KEY, meta],
    [TOWN_NAME_KEY, 'Quartz Hill'],
    [ACTIVE_EPOCH_KEY, 'epoch-10-deepsky'],
    [FIRST_CLAIM_DONE_KEY, '1'],
    [TOWN_WELCOME_SEEN_KEY, '1'],
    [STORY_TALES_STORAGE_KEY, '0'],
    ...listEpochs().map((epoch): [string, string] => [researchStateKey(epoch.id), research]),
  ];
  return [
    [PROFILE_KEY, JSON.stringify(profile)],
    ...logical.flatMap(([key, value]): Array<[string, string]> => [
      [key, value],
      [profileDataKey(PROFILE_ID, key), value],
    ]),
  ];
}

async function seed(page: Page, contractId: string): Promise<void> {
  await page.addInitScript(
    ({ entries, launchKey, launchValue }) => {
      try {
        localStorage.clear();
        for (const [key, value] of entries) localStorage.setItem(key, value);
      } catch {}
      try {
        sessionStorage.clear();
        sessionStorage.setItem(launchKey, launchValue);
      } catch {}
    },
    { entries: seedEntries(), launchKey: 'gr.contract.launch.v1', launchValue: contractId },
  );
}

async function shrinkTo(file: string, buffer: Buffer, width: number): Promise<number> {
  await sharp(buffer).resize({ width, withoutEnlargement: true }).png({ compressionLevel: 9, palette: true, colors: 128 }).toFile(file);
  return (await stat(file)).size;
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

/** Leave the run running whatever the pause-panel assertions did. */
async function unpause(page: Page, row: { notes: string[] }): Promise<void> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const paused = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused === true).catch(() => false);
    if (!paused) return;
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(300);
  }
  row.notes.push('WARNING: run still reported paused after three KeyP presses');
}

async function heroPos(page: Page): Promise<{ x: number; z: number } | null> {
  return page.evaluate(() => {
    const pos = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
    return pos ? { x: pos.x, z: pos.z } : null;
  });
}

/**
 * Two default wave intervals (`Balance.waves.waveInterval` is 30) — the sim-seconds an ordinary
 * contract is given to reach wave 2. A practice ground is asked its own question over the same
 * window, so the exemption costs the map the same patience, not less.
 */
const PRACTICE_WINDOW_SIM_SECONDS = 60;

/**
 * The practice ground's own question, asked in place of "reaches wave 2" (see the header). It is
 * answered off the SAME read-only diagnostics every other cell uses — `drillYard` is published on
 * every contract and is null where no practice mode is declared (src/vite-env.d.ts:189) — so this
 * stays a plain boot with no debug seam.
 */
async function practiceObjective(
  page: Page,
  practice: NonNullable<ContractManifest['practice']>,
  row: { notes: string[] },
): Promise<Cell> {
  const started = Date.now();
  const deadline = started + WAVE_TIMEOUT_MS;
  let snapshot: {
    sim: number;
    runState: string;
    active: boolean;
    scheduledWaves: boolean;
    stations: string[];
    targets: Array<{ kind: string; x: number; z: number; state: string; hp: number; maxHp: number }>;
  } | null = null;
  while (Date.now() < deadline) {
    snapshot = await page
      .evaluate(() => {
        const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
        const yard = diagnostics?.drillYard ?? null;
        return {
          sim: diagnostics?.timeAlive ?? 0,
          runState: String(diagnostics?.runState ?? ''),
          active: yard?.active === true,
          scheduledWaves: yard?.persistence.scheduledWaves !== false,
          stations: yard ? [yard.faucet, yard.bell].map((station) => `${station.x},${station.z}`) : [],
          targets: yard ? yard.targets.map(({ kind, x, z, state, hp, maxHp }) => ({ kind, x, z, state, hp, maxHp })) : [],
        };
      })
      .catch(() => null);
    if (!snapshot) break;
    if (snapshot.runState === 'dead' || snapshot.runState === 'won') break;
    if (snapshot.sim >= PRACTICE_WINDOW_SIM_SECONDS) break;
    await page.waitForTimeout(500);
  }
  const elapsed = (Date.now() - started) / 1_000;
  if (!snapshot) return fail(`practice ground stopped answering after ${elapsed.toFixed(1)}s`);
  row.notes.push(
    `practice ground: runState=${snapshot.runState} sim=${snapshot.sim.toFixed(1)}s standing=${snapshot.targets.filter(({ state }) => state === 'standing').length}/${snapshot.targets.length} scheduledWaves=${snapshot.scheduledWaves}`,
  );
  const declaredStations = practice.stations.map(({ x, z }) => `${x},${z}`);
  const standing = snapshot.targets.filter(({ state, hp, maxHp }) => state === 'standing' && hp >= maxHp);
  const reasons: string[] = [];
  if (!snapshot.active) reasons.push('the yard never reported itself active');
  if (snapshot.scheduledWaves) reasons.push('the yard claims scheduled waves, so it is not a practice ground');
  if (snapshot.sim < PRACTICE_WINDOW_SIM_SECONDS) reasons.push(`only ${snapshot.sim.toFixed(1)}s of sim in ${elapsed.toFixed(1)}s wall`);
  if (snapshot.runState !== 'playing') reasons.push(`runState=${snapshot.runState || 'unknown'}`);
  for (const station of declaredStations) {
    if (!snapshot.stations.includes(station)) reasons.push(`station (${station}) is not on the board`);
  }
  if (snapshot.targets.length !== practice.targets.length) {
    reasons.push(`${snapshot.targets.length} targets on the board, ${practice.targets.length} declared`);
  }
  if (standing.length !== practice.targets.length) {
    reasons.push(`${standing.length} of ${practice.targets.length} practice targets are standing and whole`);
  }
  return reasons.length === 0
    ? pass(
        `practice objective reachable after ${snapshot.sim.toFixed(1)}s sim: ${standing.length} targets standing, ${declaredStations.length} stations placed, no scheduled waves to reach`,
      )
    : fail(`practice objective not reachable: ${reasons.join('; ')}`);
}

test.describe('playability smoke: every board contract, plain boot', () => {
  for (const contract of SMOKE_CONTRACTS) {
    test(`${contract.id} boots plain, briefs, moves and reaches wave 2`, { tag: '@slow' }, async ({ page }, testInfo) => {
      test.setTimeout(WAVE_TIMEOUT_MS + BOOT_TIMEOUT_MS + 90_000);
      await mkdir(SHOT_DIR, { recursive: true });

      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));

      const row: Row = {
        env: ENV_LABEL,
        project: testInfo.project.name,
        contract: contract.id,
        name: contract.name,
        epoch: epochOf(contract.id),
        unlock: contract.boardRow.unlock,
        boots: fail('not run'),
        briefing: fail('not run'),
        hud: fail('not run'),
        moves: fail('not run'),
        wave2: fail('not run'),
        clean: fail('not run'),
        screenshot: '',
        screenshotBytes: 0,
        consoleErrors,
        pageErrors,
        notes: [],
        baseURL: SMOKE_BASE_URL || (testInfo.project.use.baseURL ?? ''),
        at: new Date().toISOString(),
      };

      try {
        // --- briefing (asserted FIRST: the run card auto-dismisses eight seconds in, and a
        //     heavy map can spend longer than that reaching frame 12) --------------------------
        await seed(page, contract.id);
        await page.goto(`/?contract=${encodeURIComponent(contract.id)}&seed=smoke-${contract.id}&timescale=${TIMESCALE}`);
        try {
          await page.getByTestId('contract-briefing').waitFor({ state: 'visible', timeout: BOOT_TIMEOUT_MS });
          await expect(page.getByTestId('contract-briefing-name')).toHaveText(contract.name, { timeout: 5_000 });
          await expect(page.getByTestId('contract-briefing-geography')).toHaveText(contract.briefing.geographyLine, { timeout: 5_000 });
          const goals = await page.getByTestId('contract-briefing-goals').locator('li').allTextContents();
          const rules = await page.getByTestId('contract-briefing-rules').locator('li').allTextContents();
          expect(goals, 'briefing goals').toEqual([...contract.briefing.goals]);
          expect(rules, 'briefing rules').toEqual([...contract.briefing.rules]);
          row.briefing = pass(`${goals.length} goals, ${rules.length} rules`);
        } catch (error) {
          row.briefing = fail(String((error as Error).message).split('\n').slice(0, 4).join(' | '));
        }

        // --- boots -------------------------------------------------------------------------
        try {
          await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, {
            timeout: BOOT_TIMEOUT_MS,
          });
          const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
          row.notes.push(`activeId=${active?.activeId ?? 'none'} fallbackReason=${String(active?.fallbackReason)}`);
          row.boots =
            active?.activeId === contract.id && active?.fallbackReason === null
              ? pass(`activeId=${active.activeId}`)
              : fail(`requested ${contract.id}, got activeId=${active?.activeId ?? 'none'} fallbackReason=${String(active?.fallbackReason)}`);
        } catch (error) {
          row.boots = fail(`no game frame within ${BOOT_TIMEOUT_MS}ms: ${String((error as Error).message).split('\n')[0]}`);
        }

        // --- HUD ---------------------------------------------------------------------------
        if (row.boots.ok) {
          try {
            await page.getByTestId('contract-briefing-dismiss').click({ timeout: 8_000 }).catch(() => undefined);
            await expect(page.getByTestId('contract-briefing')).toBeHidden({ timeout: 8_000 });
            await expect(page.getByTestId('hud-gold')).toBeVisible({ timeout: 8_000 });
            await expect(page.getByTestId('hud-vitals')).toBeVisible({ timeout: 5_000 });
            await expect(page.getByTestId('hud-wave')).toBeVisible({ timeout: 5_000 });
            const gold = (await page.locator('[data-hud-gold]').first().textContent())?.trim() ?? '';
            const waveNumber = (await page.locator('[data-hud-wave-number]').first().textContent())?.trim() ?? '';
            const waveCopy = (await page.locator('[data-hud-wave]').first().textContent())?.trim() ?? '';
            expect(gold, 'HUD gold reads a number').toMatch(/^-?\d/);
            expect(waveNumber, 'HUD wave reads a number').toMatch(/^\d/);
            expect(waveCopy.length, 'HUD wave line carries the run objective copy').toBeGreaterThan(0);
            // The pause panel is where the contract's own objective line lives once the card is
            // gone. Whatever happens in here, the run must come back UNPAUSED — a stranded pause
            // silently turns the two cells below into false reds (measured: e5-regatta, probe 2).
            try {
              await page.keyboard.press('KeyP');
              await expect(page.getByTestId('pause-meta-panel')).toBeVisible({ timeout: 8_000 });
              await expect(page.getByTestId('pause-contract-name')).toHaveText(contract.name, { timeout: 5_000 });
              const pauseGoals = await page.getByTestId('pause-contract-goals').locator('li').allTextContents();
              expect(pauseGoals, 'pause panel repeats this contract objective').toEqual([...contract.briefing.goals]);
            } finally {
              await unpause(page, row);
            }
            row.hud = pass(`gold=${gold} wave=${waveNumber} objective="${contract.briefing.goals[0] ?? ''}"`);
          } catch (error) {
            row.hud = fail(String((error as Error).message).split('\n').slice(0, 4).join(' | '));
          }
        } else {
          row.hud = fail('skipped: boot failed');
        }

        // --- moves -------------------------------------------------------------------------
        if (row.boots.ok) {
          try {
            await unpause(page, row);
            const before = await heroPos(page);
            await page.locator('#game-canvas').click({ position: { x: 40, y: 40 }, timeout: 8_000 }).catch(() => undefined);
            await hold(page, 'KeyD', 1_000);
            await hold(page, 'KeyW', 1_000);
            const after = await heroPos(page);
            const moved = before && after ? Math.hypot(after.x - before.x, after.z - before.z) : 0;
            row.moves = moved > 0.5 ? pass(`moved ${moved.toFixed(2)} world units`) : fail(`hero moved ${moved.toFixed(2)} units under 2s of WASD`);
          } catch (error) {
            row.moves = fail(String((error as Error).message).split('\n')[0]);
          }
        } else {
          row.moves = fail('skipped: boot failed');
        }

        // --- wave 2, or the practice objective for a contract that has no waves --------------
        if (row.boots.ok && contract.practice) {
          row.wave2 = await practiceObjective(page, contract.practice, row);
        } else if (row.boots.ok) {
          const started = Date.now();
          const deadline = started + WAVE_TIMEOUT_MS;
          let reached = 0;
          let runState = '';
          let simTick = 0;
          let hudWave = '';
          let diagWave = 0;
          let timeAlive = 0;
          let upgrades = 0;
          let pollError = '';
          while (Date.now() < deadline) {
            const snapshot = await page
              .evaluate(() => {
                const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
                return {
                  wave: diagnostics?.wave ?? 0,
                  hudWave: document.querySelector('[data-hud-wave-number]')?.textContent?.trim() ?? '',
                  timeAlive: diagnostics?.timeAlive ?? 0,
                  tick: diagnostics?.simulation?.tick ?? 0,
                  runState: String(diagnostics?.runState ?? ''),
                  upgrade: document.querySelector('[data-testid="upgrade-overlay"]')?.getAttribute('aria-hidden') === 'false',
                };
              })
              .catch((error: Error) => {
                pollError = String(error.message).split('\n')[0] ?? '';
                return null;
              });
            if (!snapshot) break;
            // THE PLAYER'S WAVE, NOT THE SCHEDULER'S. `__THREE_GAME_DIAGNOSTICS__.wave` publishes
            // `waveSystem.diagnostics.wave` (src/game/Game.ts:5400), but the number on the HUD is
            // `Game.currentRunWave()` (src/game/Game.ts:6210), and on a deepwater storm contract
            // those are different counters: `deepwaterStormDisablesScheduledWaves`
            // (src/world/DeepwaterClaimTile.ts:174) turns the scheduled wave system OFF and the run
            // counts `deepwaterCorsairWavesSpawned` instead — so the diagnostics field sits at 0 for
            // the whole run while the player watches waves 1, 2, 3 tick by. Measured on e5-regatta:
            // HUD "1" at 5s, diagnostics.wave 0 after 263 sim-seconds. This smoke asks what the
            // OWNER will see, so it takes the larger of the two.
            reached = Math.max(reached, snapshot.wave, Number.parseInt(snapshot.hudWave, 10) || 0);
            runState = snapshot.runState;
            simTick = snapshot.tick;
            hudWave = snapshot.hudWave;
            diagWave = snapshot.wave;
            timeAlive = snapshot.timeAlive;
            if (reached >= 2) break;
            if (snapshot.runState === 'dead' || snapshot.runState === 'won') break;
            // A level-up freezes the sim behind the Patent Office; a player picks a card, so do we.
            if (snapshot.upgrade) {
              upgrades += 1;
              await page.keyboard.press('Digit1');
            }
            await page.waitForTimeout(500);
          }
          const elapsed = Date.now() - started;
          if (upgrades) row.notes.push(`picked ${upgrades} upgrade card(s)`);
          if (pollError) row.notes.push(`wave poll error: ${pollError}`);
          row.notes.push(`runState=${runState || 'unknown'} diagnosticsWave=${diagWave} hudWave=${hudWave} simTick=${simTick} timeAlive=${timeAlive.toFixed(1)}s waited=${(elapsed / 1_000).toFixed(1)}s`);
          row.wave2 =
            reached >= 2
              ? pass(`wave ${reached} after ${(elapsed / 1_000).toFixed(1)}s wall (sim ${timeAlive.toFixed(1)}s)`)
              : fail(
                  `reached wave ${reached} after ${(elapsed / 1_000).toFixed(1)}s wall / ${timeAlive.toFixed(1)}s sim at timescale ${TIMESCALE} (runState=${runState || 'unknown'}, HUD wave reads "${hudWave}", simTick=${simTick}${pollError ? `, poll error: ${pollError}` : ''})`,
                );
        } else {
          row.wave2 = fail('skipped: boot failed');
        }

        // --- screenshot (always, even for a failed cell — a row without evidence is a claim) --
        try {
          const file = path.join(SHOT_DIR, `${contract.id}-${testInfo.project.name}.png`);
          const buffer = await page.screenshot({ fullPage: false });
          row.screenshotBytes = await shrinkTo(file, buffer, testInfo.project.name === 'mobile-chrome' ? 390 : 640);
          row.screenshot = path.relative(process.cwd(), file);
        } catch (error) {
          row.notes.push(`screenshot failed: ${String((error as Error).message).split('\n')[0]}`);
        }

        // --- clean -------------------------------------------------------------------------
        row.clean =
          consoleErrors.length === 0 && pageErrors.length === 0
            ? pass('0 console, 0 page')
            : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
      } finally {
        await appendFile(ROWS_PATH, `${JSON.stringify(row)}\n`, 'utf8');
      }

      expect(row.boots.ok, `boots: ${row.boots.detail}`).toBe(true);
      expect(row.briefing.ok, `briefing: ${row.briefing.detail}`).toBe(true);
      expect(row.hud.ok, `HUD: ${row.hud.detail}`).toBe(true);
      expect(row.moves.ok, `moves: ${row.moves.detail}`).toBe(true);
      expect(row.wave2.ok, `wave 2: ${row.wave2.detail}`).toBe(true);
      expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
      expect(row.screenshotBytes, 'screenshot exists and is under 300 KB').toBeGreaterThan(0);
      expect(row.screenshotBytes, 'screenshot is under 300 KB').toBeLessThan(300 * 1024);
    });
  }
});
