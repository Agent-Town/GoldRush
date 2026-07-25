// E2 SEGMENT — the Hill Mine: pressure economy, the ARMORED RAILCAR fought
// through its acts (wheels → boiler → cabin quit), dynamo-hall stages funded
// through the real path. Shortcuts cited: debug door, timescale 4, setWave(11),
// granted gold/pressure standing in for panning/boiler grind.
import { openSegment, shot, pilotBoss, poll, gameReady, bankEpochScience } from '../lib.mjs';

const { page, finish } = await openSegment('e2-01-hill-mine-and-the-railcar', { url: '/?debug&contract=e2-hill-mine&timescale=4&seed=rehearsal-e2' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
// Interrupted rehearsal retries can leave a run suspend. Restart only the
// current run; profile progression and the one-profile chain stay intact.
await page.evaluate(() => window.__GR_TEST__.resetRun());
await gameReady(page);
await bankEpochScience(page, 8);
await page.reload();
await gameReady(page);
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await page.evaluate(() => window.__GR_TEST__.resetRun());
await gameReady(page);
await shot(page, 'e2-01-hill-mine-boot');
// GRINDING SHORTCUT (cited): a player reaches the boss fully leveled — max the arsenal.
await page.evaluate(() => { window.__GR_TEST__.maxUpgrades?.(); });

// pressure diagnostics before the fight
console.log('pressure:', JSON.stringify(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure ?? null)).slice(0, 300));

await page.evaluate(() => {
  window.__GR_TEST__.setBalance('waves.pulseBase', 0);
  window.__GR_TEST__.setBalance('waves.pulsePerWave', 0);
  window.__GR_TEST__.setBalance('waves.aliveCap', 0);
  window.__GR_TEST__.setWave(11);
});
console.log('wave -> 11; the whistle should be next');

const start = Date.now();
let outcome = 'timeout';
let sawRailcar = false;
let acts = new Set();
let ki = 0;
let lastComponents = '';
while (Date.now() - start < 10 * 60_000) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    const cars = window.__GR_TEST__?.enemyPositions()
      .filter((e) => e.variantId === 'baron_railcar' && e.bossComponentId) ?? [];
    const overlay = document.querySelector('[data-testid="upgrade-overlay"]');
    return {
      wave: g.wave, hp: g.hp, state: g.state, enemies: g.enemiesAlive,
      cars: cars.map((c) => ({ hp: Math.round(c.hp), max: Math.round(c.maxHp), id: c.bossComponentId })),
      bossBar: g.readability?.bossHpBar ?? null,
      announce: g.ui?.announcement ?? null,
      upgradeOpen: overlay?.classList.contains('upgrade-overlay--visible') === true
        && overlay.getAttribute('aria-hidden') === 'false',
    };
  });
  if (!d) break;
  if (d.upgradeOpen) { await page.keyboard.press(`Digit${(ki % 3) + 1}`); continue; }
  if (d.cars.length && !sawRailcar) {
    sawRailcar = true;
    console.log('RAILCAR:', JSON.stringify(d.cars), 'announce:', d.announce);
    await shot(page, 'e2-02-railcar-arrival');
  }
  if (d.cars.length) {
    acts.add(d.cars.length);
    const components = d.cars.map((car) => car.id).join(',');
    if (components !== lastComponents) {
      console.log('railcar act:', components, '— kite/aim at wheels → boiler → cabin');
      lastComponents = components;
    }
  }
  if (sawRailcar && d.cars.length === 0) {
    console.log('railcar down at wave', d.wave);
    outcome = 'railcar-defeated';
    break;
  }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; break; }
  await pilotBoss(page, 'baron_railcar', ['wheels', 'boiler', 'cabin'], 22);
  ki += 1;
  await page.waitForTimeout(120);
}
console.log('fight outcome:', outcome, 'component-counts seen:', [...acts]);
await page.waitForTimeout(2000);
await shot(page, 'e2-03-railcar-defeat');
if (outcome !== 'railcar-defeated') {
  await finish(`hill mine + railcar (${outcome}); stopped before Dynamo funding`);
  throw new Error(`Railcar did not fall (${outcome}); inspect e2-01 footage before resuming`);
}
await page.keyboard.press('Space');
await poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.baronCeremony?.active === false), {
  timeout: 15_000,
  label: 'railcar defeat ceremony',
});
const secured = page.getByTestId('claim-secured');
await poll(() => secured.isVisible(), { timeout: 15_000, label: 'railcar claim secured' });
await page.getByTestId('stay-for-rush').click();
await poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.megaproject?.unlocked === true), {
  timeout: 15_000,
  label: 'Dynamo Hall unlock',
});

// Dynamo Hall: fund the three defended stages through the real path.
console.log('megaproject before:', JSON.stringify(await page.evaluate(() => window.__GR_TEST__.megaproject())));
await page.evaluate(() => {
  window.__GR_TEST__.grantGold(800);
  window.__GR_TEST__.grantPressure(300);
  window.__GR_TEST__.setBalance('waves.waveInterval', 1);
  window.__GR_TEST__.setWave(window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0);
});
for (let stage = 0; stage < 3; stage += 1) {
  const before = await page.evaluate(() => window.__GR_TEST__.megaproject());
  if (before.stage > stage || before.complete) continue;
  const funded = before.funded || await page.evaluate(() => window.__GR_TEST__.fundMegaproject());
  console.log(`fund stage ${stage + 1}:`, funded);
  if (!funded) throw new Error(`Dynamo Hall stage ${stage + 1} did not fund`);
  const complete = await poll(async () => {
    const m = await page.evaluate(() => window.__GR_TEST__.megaproject());
    return m && (m.stage > stage || m.complete) ? m : null;
  }, { timeout: 90_000, interval: 250, label: `Dynamo Hall stage ${stage + 1}` });
  console.log('stage done:', JSON.stringify(complete));
}
const final = await page.evaluate(() => window.__GR_TEST__.megaproject());
if (final?.stage !== 3 || !final.complete) throw new Error(`Dynamo Hall incomplete: ${JSON.stringify(final)}`);
console.log('megaproject after:', JSON.stringify(final));
await shot(page, 'e2-04-dynamo-hall-built');
console.log('meta:', await page.evaluate(() => localStorage.getItem('gr.profile.v2.rehearsal.gr.meta.v1')));
await finish(`hill mine + railcar (${outcome}) + dynamo stages`);
