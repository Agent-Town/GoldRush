// E9 SEGMENT — the Dome Basin: THE OLD DIGGER — no kill path; board the live
// machine, record canal work, reach the tape deck, THE SWAP; it joins the
// fleet. Follows the exact player path the spec encodes (interact seam = the
// confirm-intent player action). timescale 4 cited.
import { openSegment, shot, hold, poll, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e9-01-dome-basin-and-the-old-digger', { url: '/?debug&contract=e9-dome-basin&timescale=4&seed=rehearsal-e9' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await shot(page, 'e9-01-dome-basin-boot');

// Record real canal work so the swap uses OUR tape (the era's thesis).
const rec = await page.evaluate(() => window.__GR_TEST__.playbook?.startRecording?.({ name: 'basin-canals' }) ?? 'no-playbook-seam');
console.log('recording:', JSON.stringify(rec).slice(0, 200));
await hold(page, 'KeyW', 600);
await hold(page, 'KeyD', 600);
const stopped = await page.evaluate(() => window.__GR_TEST__.playbook?.stopRecording?.('basin-canals') ?? null);
console.log('recorded:', JSON.stringify(stopped).slice(0, 200));

const digger = () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.oldDiggerBoss ?? null);
console.log('digger init:', JSON.stringify(await digger()).slice(0, 260));
await page.evaluate(() => window.__GR_TEST__.startWaveForTest(2));
await poll(async () => { const d = await digger(); return d && (d.started || d.act >= 1); }, { timeout: 30_000, label: 'digger starts' });
console.log('digger started:', JSON.stringify(await digger()).slice(0, 300));
await shot(page, 'e9-02-digger-renovation');

// Board: walk to it (teleport = parking-free positioning), interact.
const pos = await page.evaluate(() => window.__GR_TEST__.enemyPositions().find((e) => e.variantId === 'old_digger') ?? null);
console.log('digger position:', JSON.stringify(pos));
await page.evaluate(({ x, z }) => window.__GR_TEST__.teleport(x, z), { x: pos.x, z: pos.z });
console.log('board interact:', await page.evaluate(() => window.__GR_TEST__.oldDigger.interact()));
await poll(async () => (await digger())?.boarded === true, { timeout: 10_000, label: 'boarded' });
await shot(page, 'e9-03-boarding-the-live-machine');
await poll(async () => (await digger())?.atTapeDeck === true, { timeout: 30_000, label: 'tape deck' });
console.log('at tape deck:', JSON.stringify(await digger()).slice(0, 260));
console.log('swap interact:', await page.evaluate(() => window.__GR_TEST__.oldDigger.interact()));
await poll(async () => { const d = await digger(); return d?.gentle === true; }, { timeout: 30_000, label: 'gentle' });
const done = await digger();
console.log('THE SWAP:', JSON.stringify({ act: done.act, swapPhase: done.swapPhase, joinedFleet: done.joinedFleet, gentle: done.gentle, tape: done.tape, archivedTape: done.archivedTape }));
await page.waitForTimeout(1500);
await shot(page, 'e9-04-it-joins-the-fleet');
const hud = await page.getByTestId('hud-wave').textContent().catch(() => null);
console.log('hud:', hud?.replace(/\s+/g, ' ').slice(0, 200));
// persistence: reload, digger stays gentle on this tile
await page.reload();
await gameReady(page);
console.log('after reload, digger:', JSON.stringify(await digger()).slice(0, 260));
await shot(page, 'e9-05-digger-gentle-after-reload');
await finish('dome basin + old digger reprogrammed (joins the fleet)');
