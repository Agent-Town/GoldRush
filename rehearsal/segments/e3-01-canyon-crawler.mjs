// E3 SEGMENT — the Canyon Works at night: the DYNAMO CRAWLER fought through its
// acts (flicker → drain-mast → tracks → capacitor gift-back). Shortcuts cited:
// debug door, timescale 4, setWave(13); the Crawler rides at 14.
import { openSegment, shot, pilotBoss, poll, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e3-01-canyon-works-and-the-crawler', { url: '/?debug&contract=e3-canyon-works&timescale=4&seed=rehearsal-e3' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await shot(page, 'e3-01-canyon-boot');
// GRINDING SHORTCUT (cited): a player reaches the boss fully leveled — max the arsenal.
await page.evaluate(() => { window.__GR_TEST__.maxUpgrades?.(); });
console.log('crawler diag:', JSON.stringify(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.crawlerBoss ?? null)).slice(0, 300));
// Secure the CONNECT path exactly as the boss spec does (e3-crawler-boss:8-11,31-45).
console.log('secure-path pylons:', await page.evaluate(() => {
  const test = window.__GR_TEST__;
  test.grantGold(1_000);
  return [[-12, -36], [-24, -20], [-28, 8], [12, -36], [24, -20], [28, 8]]
    .map(([x, z]) => test.placeFree('sentry_beacon', x, z));
}));

await page.evaluate(() => window.__GR_TEST__.setWave(13));
const start = Date.now();
let outcome = 'timeout';
let saw = false;
let ki = 0;
let lastPhase = null;
while (Date.now() - start < 10 * 60_000) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    const bossParts = window.__GR_TEST__?.enemyPositions()
      .filter((e) => e.variantId === 'dynamo_crawler' && e.bossComponentId) ?? [];
    const overlay = document.querySelector('[data-testid="upgrade-overlay"]');
    return {
      wave: g.wave, hp: g.hp, state: g.state,
      crawler: g.crawlerBoss ?? null,
      boss: bossParts.length ? {
        hp: bossParts.reduce((sum, part) => sum + Math.round(part.hp), 0),
        max: bossParts.reduce((sum, part) => sum + Math.round(part.maxHp), 0),
        components: bossParts.map((part) => part.bossComponentId),
      } : null,
      bossBar: g.readability?.bossHpBar ?? null,
      upgradeOpen: overlay?.classList.contains('upgrade-overlay--visible') === true
        && overlay.getAttribute('aria-hidden') === 'false',
    };
  });
  if (!d) break;
  if (d.upgradeOpen) { await page.keyboard.press(`Digit${(ki % 3) + 1}`); ki += 1; continue; }
  const phase = d.crawler?.phase ?? d.crawler?.act ?? d.crawler?.state ?? null;
  if (phase !== lastPhase) {
    console.log('crawler phase:', JSON.stringify(d.crawler).slice(0, 240), '— secure path; aim drain_mast → tracks → capacitor_bank');
    lastPhase = phase;
  }
  if ((d.boss || d.crawler?.active) && !saw) { saw = true; await shot(page, 'e3-02-crawler-arrival'); console.log('CRAWLER:', JSON.stringify(d.boss ?? d.crawler).slice(0, 200)); }
  if (saw && ((d.crawler?.act ?? 0) >= 3 || d.crawler?.wreckRemains)) { outcome = 'crawler-kept'; break; }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; break; }
  await pilotBoss(page, 'dynamo_crawler', ['drain_mast', 'tracks', 'capacitor_bank']);
  ki += 1;
  await page.waitForTimeout(120);
}
console.log('fight outcome:', outcome);
await page.waitForTimeout(2000);
await shot(page, 'e3-03-crawler-defeat');
console.log('crawler end:', JSON.stringify(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.crawlerBoss ?? null)).slice(0, 400));
console.log('meta:', await page.evaluate(() => localStorage.getItem('gr.profile.v2.rehearsal.gr.meta.v1')));
await finish(`canyon works + crawler (${outcome})`);
if (outcome !== 'crawler-kept') throw new Error(`Crawler did not reach its kept wreck (${outcome}); inspect e3-01 footage before resuming`);
