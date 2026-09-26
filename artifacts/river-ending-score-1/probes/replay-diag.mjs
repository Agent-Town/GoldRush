// Diagnostic twin of scripts/assay-replay.mjs's browser arm (same boot query, same manual advance), which also samples
// where the hero is, which seams are live and what the purse holds, every ~10 ticks. Not an instrument of record.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';
const req = createRequire('/Users/robin/Claude/Projects/wt-rvs1/package.json');
const { chromium } = req('playwright');
const [reelPath, outPath, portArg] = process.argv.slice(2);
const port = Number(portArg ?? 5451);
const { createServer } = await import(pathToFileURL(req.resolve('vite')).href);
const root = '/Users/robin/Claude/Projects/wt-rvs1';
const tape = JSON.parse(await readFile(reelPath, 'utf8'));
const vite = await createServer({ root, logLevel: 'silent', server: { host: '127.0.0.1', port, strictPort: true } });
await vite.listen();
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const log = { reel: reelPath, contract: tape.contract, durationTicks: tape.inputLog.durationTicks, samples: [], errors: [] };
try {
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') log.errors.push(m.text()); });
  page.on('pageerror', (e) => log.errors.push(e.message));
  await page.addInitScript((reel) => sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(reel)), tape);
  const query = new URLSearchParams({ debug: '', assayReplay: '', replay: tape.id, contract: tape.contract, seed: tape.seed, difficulty: tape.difficulty });
  await page.goto(`http://127.0.0.1:${port}/?${query}`, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForFunction(() => Boolean(window.__GR_TEST__), undefined, { timeout: 120_000 });
  const read = () => page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    return { sim: d.timeAlive, hero: { x: +d.heroPos.x.toFixed(2), z: +d.heroPos.z.toFixed(2) }, gold: d.economy.gold, channeling: d.harvest.channeling,
      seams: d.harvest.activeNodes.filter((n) => n.active).map((n) => `${n.id}@${n.position.x},${n.position.z}`), contract: d.contract.activeId, name: d.contract.name, wave: d.wave, enemies: d.enemiesAlive };
  });
  log.atBoot = await read();
  await page.evaluate(() => window.__GR_TEST__.setManualSim(true));
  const total = tape.inputLog.durationTicks * tape.inputLog.stepSeconds;
  for (let done = 0; done < total - 1e-9; done += 10 / 30) {
    await page.evaluate((s) => window.__GR_TEST__.advanceSim(s), Math.min(10 / 30, total - done));
    log.samples.push(await read());
  }
  log.end = await read();
} catch (error) {
  log.errors.push(`diag: ${error.message}`);
} finally {
  await writeFile(outPath, `${JSON.stringify(log, null, 1)}\n`);
  await browser.close();
  await vite.close();
}
