// E1 SEGMENT 3 — the Stamp Mill built through its real funding path in-run
// (gold granted = grinding shortcut, cited), then T1 THE CEREMONY through the
// schoolhouse door on a plain boot. Science seeded to threshold between runs
// (cited: 1 science per secured run; 6 needed).
import { openSegment, shot, hold, poll, townReady, gameReady, walkToPrompt, openSchoolhouse } from '../lib.mjs';

// --- Part A: the mill's three defended stages, on the-claim with the debug seam.
{
  const { page, finish } = await openSegment('e1-03a-stamp-mill-stages', { url: '/?debug&contract=the-claim&timescale=4&seed=rehearsal-mill' });
  await gameReady(page);
  await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
  await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
  console.log('megaproject before:', JSON.stringify(await page.evaluate(() => window.__GR_TEST__.megaproject())));
  await page.evaluate(() => window.__GR_TEST__.grantGold(600)); // grinding shortcut: panning gold
  for (let stage = 0; stage < 3; stage += 1) {
    const funded = await page.evaluate(() => window.__GR_TEST__.fundMegaproject());
    console.log(`fund stage ${stage + 1}:`, funded);
    // each funded stage builds under a defense wave — let it play out
    for (let i = 0; i < 120; i += 1) {
      const m = await page.evaluate(() => window.__GR_TEST__.megaproject());
      const card = await page.evaluate(() => {
        const c = document.querySelector('[data-testid="upgrade-card-0"]');
        return !!(c && c.getClientRects().length);
      });
      if (card) { await page.keyboard.press('Digit1'); }
      if (m && (m.stage > stage || m.complete)) { console.log('stage done:', JSON.stringify(m)); break; }
      await hold(page, ['KeyW', 'KeyD', 'KeyS', 'KeyA'][i % 4], 150);
      await page.waitForTimeout(250);
    }
  }
  const final = await page.evaluate(() => window.__GR_TEST__.megaproject());
  console.log('megaproject after:', JSON.stringify(final));
  await shot(page, 'e1-11-stamp-mill-built');
  await finish(`mill stages, complete=${JSON.stringify(final?.complete ?? final)}`);
}

// --- Part B: plain boot; seed science to threshold (cited); walk the T1 door.
{
  const { page, finish } = await openSegment('e1-04-t1-the-stamp-mill-ceremony', { url: '/' });
  // start menu (existing profile)
  await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu' });
  // GRINDING SHORTCUT (cited): science 6 = six secured runs at 1/run; we played
  // the-claim honestly and bank the remaining five.
  await page.evaluate(() => {
    const key = 'gr.profile.v2.rehearsal.gr.meta.v1';
    const meta = JSON.parse(localStorage.getItem(key) ?? '{"version":1,"tracks":{"territory":0,"science":0,"hero":0,"agent":0}}');
    meta.tracks.science = Math.max(meta.tracks.science, 6);
    localStorage.setItem(key, JSON.stringify(meta));
  });
  await page.reload();
  await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu 2' });
  await page.getByTestId('start-menu-enter-town').click();
  await townReady(page);
  await openSchoolhouse(page);
  await shot(page, 'e1-12-schoolhouse-door');
  const door = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="stamp-mill-epoch-door"]');
    return el ? { state: el.getAttribute('data-door-state'), text: el.textContent.replace(/\s+/g, ' ').slice(0, 200) } : null;
  });
  console.log('T1 door:', JSON.stringify(door));
  await page.getByTestId('raise-stamp-mill').click();
  for (const [i, name] of [['1', 'mill-rises'], ['2', 'valley-transforms'], ['3', 'epoch-title']].entries()) {
    await poll(() => page.getByTestId('story-beat-card').isVisible(), { label: `ceremony beat ${name[0]}` });
    const beat = await page.getByTestId('story-beat-card').getAttribute('data-beat-id');
    console.log('ceremony beat:', beat);
    await shot(page, `e1-13-t1-${name[1]}`);
    if (i < 2) await page.locator('[data-story-ceremony-continue]').click();
  }
  const epoch = await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1'));
  console.log('active epoch after T1:', epoch);
  await page.locator('[data-story-ceremony-skip]').click().catch(() => {});
  // reload — persistence under fire
  await page.reload();
  await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu 3' });
  console.log('epoch after reload:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));
  await page.getByTestId('start-menu-enter-town').click();
  await townReady(page);
  await shot(page, 'e1-14-e2-town-first-morning');
  await finish(`T1 ceremony, epoch=${epoch}`);
}
