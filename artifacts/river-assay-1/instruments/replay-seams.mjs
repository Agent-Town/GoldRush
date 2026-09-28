#!/usr/bin/env node
// river-assay-1 evidence instrument (not a gate, not an engine input): the seams twin of the browser arm.
// It boots a reel exactly as `scripts/assay-replay.mjs` does at this slice's tip (the same query, the same River
// ceremony staging, one synchronous `setManualSim(true)` + `advanceSim(duration)`, so no animation frame consumes a
// replay tick in between), and records what the instrument does not print: the live seams at boot, the seams and
// the hero when the replay completes, the pan's channel, and the replay's own outcome and hash.
// Usage (from the checkout root): node replay-seams.mjs <reel.json> <out.json>   (port: GR_ASSAY_REPLAY_PORT)
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const [reelPath, outPath] = process.argv.slice(2);
const port = Number(process.env.GR_ASSAY_REPLAY_PORT ?? 5852);
const root = process.cwd();
const payload = JSON.parse(await readFile(path.resolve(reelPath), 'utf8'));
const tape = payload.tape ?? payload.reel ?? payload;

const vite = await createServer({ root, logLevel: 'silent', server: { host: '127.0.0.1', port, strictPort: true } });
await vite.listen();
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const result = { reel: reelPath, contract: tape.contract, seed: tape.seed, claimed: { eventLogHash: tape.eventLogHash, outcome: tape.outcome, durationTicks: tape.inputLog.durationTicks }, errors: [] };
try {
  let session = [];
  let search;
  if (tape.contract === 'e10-river') {
    const [{ getPostCreditsCharter }, { stampCharter }, { charterLineageRootId }, { CHARTER_LAUNCH_KEY }] = await Promise.all([
      vite.ssrLoadModule('/src/charter/TheRiver.ts'),
      vite.ssrLoadModule('/src/charter/CharterStamp.ts'),
      vite.ssrLoadModule('/src/charter/CharterSchema.ts'),
      vite.ssrLoadModule('/src/meta/ContractFamilies.ts'),
    ]);
    const charter = getPostCreditsCharter();
    const stamped = stampCharter(charter);
    const templateId = charterLineageRootId(charter);
    session = [['gr.contract.launch.v1', templateId], [CHARTER_LAUNCH_KEY, JSON.stringify({ templateId, document: stamped.document })]];
    search = new URLSearchParams({ debug: '', assayReplay: '', replay: tape.id, contract: templateId, difficulty: tape.difficulty });
    if (charter.envelope.seedPolicy.mode === 'fixed') search.set('seed', charter.envelope.seedPolicy.seed);
    if (charter.envelope.runPolicy?.waves === 'none') search.set('nowaves', '');
  } else {
    search = new URLSearchParams({ debug: '', assayReplay: '', replay: tape.id, contract: tape.contract, seed: tape.seed, difficulty: tape.difficulty });
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
    return {
      sim: d.timeAlive,
      hero: { x: d.heroPos.x, z: d.heroPos.z },
      gold: d.economy.gold,
      channeling: d.harvest.channeling === true,
      seams: d.harvest.activeNodes.filter((node) => node.active).map((node) => ({ id: node.id, x: node.position.x, z: node.position.z, remaining: node.remaining })),
      contract: { activeId: d.contract.activeId, name: d.contract.name },
      wave: d.wave,
      enemies: d.enemiesAlive,
      run: { secured: d.run.secured, securedSnapshot: d.run.securedSnapshot },
    };
  });
  result.atBoot = await read();
  await page.evaluate((seconds) => {
    window.__GR_TEST__.setManualSim(true);
    window.__GR_TEST__.advanceSim(seconds);
  }, tape.inputLog.durationTicks * tape.inputLog.stepSeconds);
  await page.waitForFunction(() => document.querySelector('[data-testid="lantern-show"]')?.getAttribute('data-playback') === 'complete', undefined, { timeout: 120_000 });
  result.end = await read();
  result.replayed = await page.evaluate(() => {
    const status = document.querySelector('[data-testid="lantern-playback-status"]');
    const show = document.querySelector('[data-testid="lantern-show"]');
    return { eventLogHash: status?.getAttribute('data-hash') ?? null, ticks: Number(show?.getAttribute('data-tick')) };
  });
  result.sameHash = result.replayed.eventLogHash === tape.eventLogHash;
  result.timeAliveBitIdentical = result.end.run.securedSnapshot?.timeAlive === tape.outcome.timeAlive;
} catch (error) {
  result.errors.push(`diag: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  await writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`);
  await browser.close();
  await vite.close();
}
process.stdout.write(`${path.basename(reelPath)}: boot seams ${JSON.stringify(result.atBoot?.seams?.map((s) => [s.x, s.z]))}, end gold ${result.end?.gold}, secured ${result.end?.run?.secured}, sameHash ${result.sameHash}, bit-identical time ${result.timeAliveBitIdentical}\n`);
