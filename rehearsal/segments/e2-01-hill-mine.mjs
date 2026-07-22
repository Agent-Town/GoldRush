// E2 SEGMENT — the Hill Mine: pressure economy, the ARMORED RAILCAR fought
// through its acts (wheels → boiler → cabin quit), dynamo-hall stages funded
// through the real path. Shortcuts cited: debug door, timescale 4, setWave(11),
// granted gold/pressure standing in for panning/boiler grind.
import { openSegment, shot, hold, poll, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e2-01-hill-mine-and-the-railcar', { url: '/?debug&contract=e2-hill-mine&timescale=4&seed=rehearsal-e2' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await shot(page, 'e2-01-hill-mine-boot');

// pressure diagnostics before the fight
console.log('pressure:', JSON.stringify(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure ?? null)).slice(0, 300));

await page.evaluate(() => window.__GR_TEST__.setWave(11));
console.log('wave -> 11; the whistle should be next');

const start = Date.now();
let outcome = 'timeout';
let sawRailcar = false;
let acts = new Set();
let ki = 0;
while (Date.now() - start < 10 * 60_000) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    const cars = window.__GR_TEST__?.enemyPositions().filter((e) => e.eliteKind === 'railcar') ?? [];
    const card = document.querySelector('[data-testid="upgrade-card-0"]');
    return {
      wave: g.wave, hp: g.hp, state: g.state, enemies: g.enemiesAlive,
      cars: cars.map((c) => ({ hp: Math.round(c.hp), max: Math.round(c.maxHp), id: c.id })),
      bossBar: g.readability?.bossHpBar ?? null,
      announce: g.ui?.announcement ?? null,
      upgradeOpen: !!(card && card.getClientRects().length),
    };
  });
  if (!d) break;
  if (d.upgradeOpen) { await page.keyboard.press(`Digit${(ki % 3) + 1}`); continue; }
  if (d.cars.length && !sawRailcar) {
    sawRailcar = true;
    console.log('RAILCAR:', JSON.stringify(d.cars), 'announce:', d.announce);
    await shot(page, 'e2-02-railcar-arrival');
  }
  if (d.cars.length) acts.add(d.cars.length);
  if (sawRailcar && d.cars.length === 0) {
    console.log('railcar down at wave', d.wave);
    outcome = 'railcar-defeated';
    break;
  }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; break; }
  await hold(page, ['KeyW', 'KeyD', 'KeyS', 'KeyA'][ki % 4], 180);
  ki += 1;
  await page.waitForTimeout(120);
}
console.log('fight outcome:', outcome, 'component-counts seen:', [...acts]);
await page.waitForTimeout(2000);
await shot(page, 'e2-03-railcar-defeat');

// Dynamo Hall: fund the three defended stages through the real path.
console.log('megaproject before:', JSON.stringify(await page.evaluate(() => window.__GR_TEST__.megaproject())));
await page.evaluate(() => { window.__GR_TEST__.grantGold(800); window.__GR_TEST__.grantPressure(300); });
for (let stage = 0; stage < 3; stage += 1) {
  const funded = await page.evaluate(() => window.__GR_TEST__.fundMegaproject());
  console.log(`fund stage ${stage + 1}:`, funded);
  for (let i = 0; i < 100; i += 1) {
    const m = await page.evaluate(() => window.__GR_TEST__.megaproject());
    const card = await page.evaluate(() => !!document.querySelector('[data-testid="upgrade-card-0"]')?.getClientRects().length);
    if (card) await page.keyboard.press('Digit1');
    if (m && (m.stage > stage || m.complete)) { console.log('stage done:', JSON.stringify(m)); break; }
    await hold(page, ['KeyW', 'KeyD', 'KeyS', 'KeyA'][i % 4], 150);
    await page.waitForTimeout(250);
  }
}
console.log('megaproject after:', JSON.stringify(await page.evaluate(() => window.__GR_TEST__.megaproject())));
await shot(page, 'e2-04-dynamo-hall-built');
console.log('meta:', await page.evaluate(() => localStorage.getItem('gr.profile.v2.rehearsal.gr.meta.v1')));
await finish(`hill mine + railcar (${outcome}) + dynamo stages`);
