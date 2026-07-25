// E1 SEGMENT 1 — the founding: profile at boot, town naming, first-claim guide,
// THE CLAIM played to secure at timescale 1 (fully honest — the founding run).
import { openSegment, shot, hold, poll, townReady, gameReady, walkToPrompt } from '../lib.mjs';

const { page, finish } = await openSegment('e1-01-the-founding-and-first-claim', { url: '/' });

// 1. Profile created at boot, through the door every player walks through.
await poll(() => page.getByTestId('profile-create-form').isVisible(), { label: 'profile form' });
await shot(page, 'e1-00-first-boot-ledger');
await page.getByTestId('profile-name-input').fill('Rehearsal');
await page.getByTestId('profile-create').click();

// 2. The town asks its name.
await poll(() => page.getByTestId('town-name-card').isVisible(), { label: 'town name card' });
await page.getByTestId('town-name-input').fill('Kettle Creek');
await page.getByTestId('town-name-submit').click();
await townReady(page);

// 3. Founding welcome beat.
await poll(() => page.getByTestId('story-beat-card').isVisible(), { label: 'founding beat' });
console.log('founding beat:', await page.getByTestId('story-beat-card').getAttribute('data-beat-id'));
await shot(page, 'e1-01-founding-welcome');
await page.mouse.click(6, 6);

// 4. First-claim guide: trail + greeting.
await poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide?.active === true), { label: 'guide active' });
console.log('firstClaimGuide:', JSON.stringify(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide)));
await shot(page, 'e1-02-town-square-first-morning');
await page.keyboard.press('ShiftLeft');

// 5. To the tavern, the book, the first claim.
await walkToPrompt(page, [['KeyA', 850], ['KeyW', 850]], 'tavern');
await page.getByTestId('town-open-board').click();
await poll(() => page.getByTestId('contract-board').isVisible(), { label: 'board' });
console.log('first-claim tooltip:', await page.getByTestId('first-claim-launch-tooltip').textContent().catch(() => null));
await shot(page, 'e1-03-the-book-first-claim');
await page.getByTestId('contract-launch-the-claim').click();
await gameReady(page);
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await shot(page, 'e1-04-first-claim-briefing');
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});

// 6. Play to secure: kite around the claim, answer level-ups, watch the sim.
const start = Date.now();
let lastWave = -1;
let outcome = 'timeout';
const keys = ['KeyW', 'KeyD', 'KeyS', 'KeyA'];
let ki = 0;
while (Date.now() - start < 18 * 60_000) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    const overlay = document.querySelector('[data-testid="upgrade-overlay"]');
    return {
      wave: g.wave, hp: g.hp, maxHp: g.maxHp, gold: g.economy?.gold, kills: g.kills,
      secured: g.run?.secured, secureWave: g.run?.secureWave, state: g.state, enemies: g.enemiesAlive,
      upgradeOpen: overlay?.classList.contains('upgrade-overlay--visible') === true
        && overlay.getAttribute('aria-hidden') === 'false',
    };
  });
  if (!d) break;
  if (d.upgradeOpen) {
    await page.keyboard.press(`Digit${(ki % 3) + 1}`);
    console.log('level-up: picked a card');
    continue;
  }
  if (d.wave !== lastWave) {
    console.log(`wave ${d.wave}/${d.secureWave} hp=${Math.round(d.hp)}/${d.maxHp} gold=${d.gold} kills=${d.kills} enemies=${d.enemies} state=${d.state}`);
    lastWave = d.wave;
    if (d.wave === 6) await shot(page, 'e1-05-mid-run-battle');
    if (d.wave === 14) await shot(page, 'e1-06-late-run');
  }
  if (d.secured) { outcome = 'secured'; break; }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; break; }
  await hold(page, keys[ki % 4], 200 + (ki % 3) * 80);
  ki += 1;
  await page.waitForTimeout(150);
}
console.log('run outcome:', outcome);
await shot(page, 'e1-07-run-end');
const visible = await page.evaluate(() =>
  [...document.querySelectorAll('[data-testid]')].filter((el) => {
    const style = getComputedStyle(el);
    return el.getAttribute('aria-hidden') !== 'true' && style.display !== 'none' && style.visibility !== 'hidden';
  }).map((el) => el.getAttribute('data-testid')));
console.log('end-of-run testids:', visible.join(', '));
console.log('meta after run:', await page.evaluate(() => localStorage.getItem('gr.profile.v2.rehearsal.gr.meta.v1') ?? '(key probe)'));
console.log('profile keys:', await page.evaluate(() => Object.keys(localStorage).join(' | ')));
await finish(`founding + the-claim, outcome=${outcome}`);
if (outcome === 'timeout') throw new Error('Founding claim timed out; inspect e1-01 footage before resuming');
