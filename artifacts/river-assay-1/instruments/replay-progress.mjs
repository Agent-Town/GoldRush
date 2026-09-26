#!/usr/bin/env node
// river-assay-1 evidence instrument (not a gate, not an engine input): WHERE a browser replay stops. It boots a reel
// exactly as `scripts/assay-replay.mjs` does (the same query and one synchronous `setManualSim(true)` +
// `advanceSim(duration)`, so no animation frame runs in between, F-RVA1-2), then records how long that call took and
// where the Lantern Show stands when it returns: its tick, its playback state, the game's pause, the clock. A second
// synchronous advance of ten seconds tells a stopped replay from a slow one. A River reel is staged in its ceremony.
// Usage (from the checkout root): node replay-progress.mjs <reel.json> <out.json>   (port: GR_ASSAY_REPLAY_PORT)
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const [reelPath, outPath] = process.argv.slice(2);
const port = Number(process.env.GR_ASSAY_REPLAY_PORT ?? 5863);
const payload = JSON.parse(await readFile(path.resolve(reelPath), 'utf8'));
const tape = payload.tape ?? payload.reel ?? payload;
const vite = await createServer({ root: process.cwd(), logLevel: 'silent', server: { host: '127.0.0.1', port, strictPort: true } });
await vite.listen();
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const pauses = tape.inputLog.entries.flatMap((entry) => (entry.a ?? []).filter((action) => action.type === 'set_pause').map((action) => ({ t: entry.t, paused: action.paused })));
const result = { reel: reelPath, contract: tape.contract, durationTicks: tape.inputLog.durationTicks, recordedPauses: pauses, errors: [] };
try {
  let search = new URLSearchParams({ debug: '', assayReplay: '', replay: tape.id, contract: tape.contract, seed: tape.seed, difficulty: tape.difficulty });
  let session = [];
  if (tape.contract === 'e10-river') {
    // The River ceremony, staged exactly as scripts/assay-replay.mjs stages it at this slice's tip.
    const [{ getPostCreditsCharter }, { stampCharter }, { charterLineageRootId }, { CHARTER_LAUNCH_KEY }] = await Promise.all([
      vite.ssrLoadModule('/src/charter/TheRiver.ts'), vite.ssrLoadModule('/src/charter/CharterStamp.ts'),
      vite.ssrLoadModule('/src/charter/CharterSchema.ts'), vite.ssrLoadModule('/src/meta/ContractFamilies.ts'),
    ]);
    const charter = getPostCreditsCharter();
    const stamped = stampCharter(charter);
    const templateId = charterLineageRootId(charter);
    session = [['gr.contract.launch.v1', templateId], [CHARTER_LAUNCH_KEY, JSON.stringify({ templateId, document: stamped.document })]];
    search = new URLSearchParams({ debug: '', assayReplay: '', replay: tape.id, contract: templateId, difficulty: tape.difficulty });
    if (charter.envelope.seedPolicy.mode === 'fixed') search.set('seed', charter.envelope.seedPolicy.seed);
    if (charter.envelope.runPolicy?.waves === 'none') search.set('nowaves', '');
  }
  result.query = search.toString();
  const page = await browser.newPage();
  page.on('console', (message) => { if (message.type() === 'error') result.errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => result.errors.push(`page: ${error.message}`));
  await page.addInitScript(({ reel, entries }) => {
    sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(reel));
    for (const [key, value] of entries) sessionStorage.setItem(key, value);
  }, { reel: tape, entries: session });
  await page.goto(`http://127.0.0.1:${port}/?${search}`, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForFunction(() => Boolean(window.__GR_TEST__), undefined, { timeout: 120_000 });
  const read = () => page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    const show = document.querySelector('[data-testid="lantern-show"]');
    return {
      showTick: Number(show?.getAttribute('data-tick')),
      playback: show?.getAttribute('data-playback') ?? null,
      paused: d?.paused ?? null,
      timeAlive: d?.timeAlive ?? null,
      wave: d?.wave ?? null,
      enemies: d?.enemiesAlive ?? null,
    };
  });
  result.atBoot = await read();
  const advance = (seconds) => page.evaluate((s) => {
    const started = performance.now();
    window.__GR_TEST__.setManualSim(true);
    window.__GR_TEST__.advanceSim(s);
    return performance.now() - started;
  }, seconds);
  result.firstAdvanceMs = await advance(tape.inputLog.durationTicks * tape.inputLog.stepSeconds);
  result.afterFirst = await read();
  result.secondAdvanceMs = await advance(10);
  result.afterSecond = await read();
} catch (error) {
  result.errors.push(`diag: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  await writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`);
  await browser.close();
  await vite.close();
}
process.stdout.write(`${path.basename(reelPath)}: first advance ${Math.round(result.firstAdvanceMs ?? -1)} ms -> ${JSON.stringify(result.afterFirst)}; second ${Math.round(result.secondAdvanceMs ?? -1)} ms -> ${JSON.stringify(result.afterSecond)}; first recorded pause t=${pauses[0]?.t ?? 'none'}; errors ${result.errors.length}\n`);
