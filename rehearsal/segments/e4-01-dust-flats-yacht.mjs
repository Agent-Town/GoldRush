// E4 SEGMENT — the Dust Flats: the LAND-YACHT fought through its acts
// (dust column → orbit → beaching → wheelhouse quit). Shortcuts cited:
// debug door, timescale 4, setWave(13); the Yacht rides at 14. A sentry beacon
// is placed via the real build seam so the watchtower dread beat can fire.
import { openSegment, shot, hold, poll, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e4-01-dust-flats-and-the-land-yacht', { url: '/?debug&contract=e4-dust-flats&timescale=4&seed=rehearsal-e4' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await shot(page, 'e4-01-dust-flats-boot');
// GRINDING SHORTCUT (cited): a player reaches the boss fully leveled — max the arsenal.
await page.evaluate(() => { window.__GR_TEST__.maxUpgrades?.(); });
await page.evaluate(() => { window.__GR_TEST__.grantGold(120); });
console.log('beacon placed:', await page.evaluate(() => {
  const hero = window.__THREE_GAME_DIAGNOSTICS__.heroPos;
  return window.__GR_TEST__.placeFree('sentry_beacon', hero.x + 2, hero.z + 2);
}));

await page.evaluate(() => window.__GR_TEST__.setWave(13));
const start = Date.now();
let outcome = 'timeout';
let saw = false;
let ki = 0;
let lastAct = null;
while (Date.now() - start < 10 * 60_000) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    const card = document.querySelector('[data-testid="upgrade-card-0"]');
    return {
      wave: g.wave, hp: g.hp, state: g.state,
      yacht: g.landYachtBoss ?? null,
      bossBar: g.readability?.bossHpBar ?? null,
      upgradeOpen: !!(card && card.getClientRects().length),
    };
  });
  if (!d) break;
  if (d.upgradeOpen) { await page.keyboard.press(`Digit${(ki % 3) + 1}`); ki += 1; continue; }
  const act = d.yacht?.act ?? d.yacht?.phase ?? d.yacht?.state ?? null;
  if (act !== lastAct) { console.log('yacht act:', JSON.stringify(d.yacht).slice(0, 260)); lastAct = act; }
  const active = d.yacht && (d.yacht.active ?? d.yacht.arrived ?? (act && act !== 'idle' && act !== 'done'));
  if (active && !saw) { saw = true; await shot(page, 'e4-02-yacht-arrival'); }
  if (saw && ((d.yacht?.act ?? 0) >= 3 || d.yacht?.wreckRemains || d.yacht?.salvageReady)) { outcome = 'yacht-beached'; break; }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; break; }
  await hold(page, ['KeyW', 'KeyD', 'KeyS', 'KeyA'][ki % 4], 180);
  ki += 1;
  await page.waitForTimeout(120);
}
console.log('fight outcome:', outcome);
await page.waitForTimeout(2000);
await shot(page, 'e4-03-yacht-defeat');
console.log('yacht end:', JSON.stringify(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.landYachtBoss ?? null)).slice(0, 400));
await finish(`dust flats + land yacht (${outcome})`);
