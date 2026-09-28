#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = process.argv[2];
const port = Number(process.env.GR_ASSAY_REPLAY_PORT ?? 5234);

// THE RIVER REPLAYS IN ITS CEREMONY (river-assay-1, F-RES1-1 cause 1). A reel scored `e10-river` (`Game.ts`
// RIVER_ENDING_CONTRACT_ID) was played on the finale lever's run, never on the raw River the Book names: THE RIVER
// charter pressed onto its lineage root, under the charter's run policy. So it is replayed in that world, staged the
// way `E10FinaleSystem.launchRiver` stages the run, with the game's own calls: the same stamp and the same two
// session entries (`stageCharterLaunch`), the lineage root as `?contract=`, `?seed=` only for a fixed seed policy,
// `?nowaves` for the no-wave run policy. `gr.contract.launch.v1` is module-private in `src/meta/ContractFamilies.ts`
// (PLAYER_CONTRACT_LAUNCH_KEY); `e2e/river-ending-score.spec.ts` and `e2e/cp04-lever.spec.ts` stage the same literal.
const RIVER_ENDING_CONTRACT_ID = 'e10-river';
const PLAYER_CONTRACT_LAUNCH_KEY = 'gr.contract.launch.v1';

async function riverCeremony(server, tape) {
  if (tape.contract !== RIVER_ENDING_CONTRACT_ID) return null;
  const [{ getPostCreditsCharter }, { stampCharter }, { charterLineageRootId }, { CHARTER_LAUNCH_KEY }] = await Promise.all([
    server.ssrLoadModule('/src/charter/TheRiver.ts'),
    server.ssrLoadModule('/src/charter/CharterStamp.ts'),
    server.ssrLoadModule('/src/charter/CharterSchema.ts'),
    server.ssrLoadModule('/src/meta/ContractFamilies.ts'),
  ]);
  const charter = getPostCreditsCharter();
  const stamped = stampCharter(charter);
  if (!stamped.ok) throw new Error(`THE RIVER no longer stamps: ${stamped.reasons.map((reason) => reason.code).join(', ')}`);
  const templateId = charterLineageRootId(charter);
  const search = { contract: templateId };
  if (charter.envelope.seedPolicy.mode === 'fixed') search.seed = charter.envelope.seedPolicy.seed;
  return {
    search,
    nowaves: charter.envelope.runPolicy?.waves === 'none',
    session: [
      [PLAYER_CONTRACT_LAUNCH_KEY, templateId],
      [CHARTER_LAUNCH_KEY, JSON.stringify({ templateId, document: stamped.document })],
    ],
  };
}

if (!inputPath) {
  process.stderr.write('Usage: node scripts/assay-replay.mjs <reel.json>\n');
  process.exit(1);
}

let vite;
let browser;
try {
  const payload = JSON.parse(await readFile(path.resolve(inputPath), 'utf8'));
  const tape = payload?.reel ?? payload;
  if (!tape?.inputLog?.durationTicks) throw new Error('reel JSON does not contain a tape');
  if (tape.version === 1) {
    process.stdout.write(`${JSON.stringify({ status: 'unverifiable-legacy' })}\n`);
    process.exit(0);
  }

  // TWO DOORS, TWO ENGINES (F-ASSAY-E2E-3, 2026-08-22). A browser recording replays in the browser
  // below. A headless-door recording — the only writer of `agent_orders` entries is
  // `scripts/gr-sim.mjs` — was written by `HeadlessContractSim`, whose world differs from the
  // browser's from tick 0 (the seam census in `assay-replay-agent.mjs`), so the browser cannot
  // verify one. Each claim is assayed by the engine that can reproduce it; the routing is the
  // same discriminator the replay seam itself uses (`Game.ts:6892`).
  const { isAgentTape, replayAgentTape } = await import('./assay-replay-agent.mjs');
  if (isAgentTape(tape)) {
    const startedAt = performance.now();
    const replay = await replayAgentTape(tape);
    process.stdout.write(`${JSON.stringify({ ...replay, wallMs: Math.round(performance.now() - startedAt) })}\n`);
    process.exit(0);
  }

  vite = await createServer({
    root,
    logLevel: 'silent',
    server: { host: '127.0.0.1', port, strictPort: true },
  });
  await vite.listen();
  browser = await chromium.launch({ headless: true, channel: 'chromium' });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  const ceremony = await riverCeremony(vite, tape);
  await page.addInitScript(({ reel, session }) => {
    sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(reel));
    for (const [key, value] of session) sessionStorage.setItem(key, value);
  }, { reel: tape, session: ceremony?.session ?? [] });

  const query = new URLSearchParams(ceremony
    ? { debug: '', assayReplay: '', replay: tape.id, ...ceremony.search, difficulty: tape.difficulty }
    : {
        debug: '',
        assayReplay: '',
        replay: tape.id,
        contract: tape.contract,
        seed: tape.seed,
        difficulty: tape.difficulty,
      });
  if (ceremony?.nowaves) query.set('nowaves', '');
  const startedAt = performance.now();
  await page.goto(`http://127.0.0.1:${port}/?${query}`, { waitUntil: 'load', timeout: 60_000 });
  // Slow-box headroom (the DO worker droplet cold-transforms the whole game on its first replay):
  // the FIRST boot may exceed a fixed minute; later replays reuse the warmed vite server.
  const bootTimeoutMs = Number(process.env.ASSAY_BOOT_TIMEOUT_MS ?? 60_000) || 60_000;
  await page.waitForFunction(() => Boolean(window.__GR_TEST__), undefined, { timeout: bootTimeoutMs });
  await page.evaluate((seconds) => {
    window.__GR_TEST__.setManualSim(true);
    window.__GR_TEST__.advanceSim(seconds);
  }, tape.inputLog.durationTicks * tape.inputLog.stepSeconds);
  const playbackTimeoutMs = Number(process.env.ASSAY_PLAYBACK_TIMEOUT_MS ?? 120_000) || 120_000;
  await page.waitForFunction(
    () => document.querySelector('[data-testid="lantern-show"]')?.getAttribute('data-playback') === 'complete',
    undefined,
    { timeout: playbackTimeoutMs },
  );
  if (errors.length) throw new Error(errors.join('\n'));

  // F-H154-1 (attended drain, 2026-09-22): the browser arm reports the map's signature mechanic exactly
  // as the headless arm does (`HeadlessContractSim.MECHANIC_OUTCOMES`, one row today) — a human's
  // browser-recorded Regatta reel would otherwise verify with no finish and rank below every agent
  // finish. Hand mirror of the engine's table; `scripts/skillmd-guard.test.mjs` pins it equal.
  const MECHANIC_BROWSER_CONTRACTS = new Set(['e5-regatta']);
  const replay = await page.evaluate((mechanicContracts) => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    const show = document.querySelector('[data-testid="lantern-show"]');
    const status = document.querySelector('[data-testid="lantern-playback-status"]');
    if (!diagnostics || !show || !status) throw new Error('replay diagnostics unavailable');
    const mechanic = mechanicContracts.includes(diagnostics.contract?.activeId) && diagnostics.regatta
      ? { id: 'regatta-race', complete: diagnostics.regatta.race?.finished === true }
      : null;
    return {
      eventLogHash: status.getAttribute('data-hash'),
      // `run.secured` and `run.securedSnapshot` are RunManager's secure, or, for a River reel, the ceremony's pan: the
      // River never secures through RunManager, and its replay publishes the score the pan wrote there instead
      // (`Game.completeRiverEnding`, river-assay-1, F-RES1-1 cause 2).
      outcome: {
        secured: diagnostics.run.secured,
        waves: Math.floor(diagnostics.wave),
        // THE PURSE HELD, not the run's lifetime panning (F-2464-4, owner ruling 2026-09-06,
        // verbatim: "fix the board and tape gold issue"). This is the field the worker compares
        // against the reel's declared `outcome.gold`, and a browser reel now declares the held
        // purse (`Game.runTapeOutcome`) exactly as a headless reel does (`outcome().gold` =
        // `round(economy.gold)`). Reading `economy.summary.panned` here verified the OTHER
        // quantity, so a browser reel and an agent reel could never be assayed by one meaning.
        gold: Math.floor(diagnostics.economy.gold),
        // Printed to the microsecond, as it always has been (e2e/assay-replay-roundtrip.spec.ts pins it). A browser
        // reel declares the raw float its run accumulated, so the worker does not compare the two exactly: it compares
        // them at a stated tolerance (`scripts/assay-worker.mjs`, TIME_ALIVE_TOLERANCE_SECONDS; river-assay-1,
        // F-RES1-1 cause 3). The secure snapshot below stays the raw float the county applies over a verified row.
        timeAlive: Math.round(diagnostics.timeAlive * 1_000_000) / 1_000_000,
      },
      securedSnapshot: diagnostics.run.securedSnapshot,
      ...(mechanic ? { mechanic } : {}),
      ticks: Number(show.getAttribute('data-tick')),
    };
  }, [...MECHANIC_BROWSER_CONTRACTS]);
  process.stdout.write(`${JSON.stringify({ ...replay, wallMs: Math.round(performance.now() - startedAt) })}\n`);
} catch (error) {
  process.stderr.write(`assay replay failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await vite?.close();
}
