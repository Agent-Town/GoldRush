// E2 SEGMENT — T2 THE DYNAMO HALL: hold-to-crank through the schoolhouse door
// on a plain boot; the lamp in the Elder's Tree; E3 armed exactly once.
// Science seeded to 8 (cited: eight secured runs at 1/run; we played two real).
import { openSegment, shot, poll, townReady, openSchoolhouse, openBoard, seedScience, dismissStoryBeats, exposeFullSagaDoors, restorePlainBoot } from '../lib.mjs';

const { page, finish } = await openSegment('e2-02-t2-the-dynamo-ceremony', { url: '/' });
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu' });
const armedBeforeStart = await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1') === 'epoch-3-voltage');
if (!armedBeforeStart) await seedScience(page, 8);
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await exposeFullSagaDoors(page);
await shot(page, 'e2-05-e2-town-square');
if (!armedBeforeStart) {
  await openSchoolhouse(page);
  await dismissStoryBeats(page);
  const door = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="dynamo-hall-epoch-door"]');
    return el ? { state: el.getAttribute('data-door-state'), text: el.textContent.replace(/\s+/g, ' ').slice(0, 220) } : null;
  });
  console.log('T2 door:', JSON.stringify(door));
  await shot(page, 'e2-06-t2-door');

  const crank = page.getByTestId('crank-dynamo');
  await crank.dispatchEvent('pointerdown');
  await poll(async () => {
    const card = page.getByTestId('story-beat-card');
    if (!await card.isVisible().catch(() => false)) return false;
    const id = await card.getAttribute('data-beat-id');
    if (id === 'e3-ceremony-dynamo') return true;
    console.log('dismiss queued beat during crank:', id);
    await page.mouse.click(6, 6);
    await page.waitForTimeout(100);
    return false;
  }, { timeout: 15_000, label: 'dynamo ceremony beat' });
  await crank.dispatchEvent('pointerup').catch(() => {});
  for (const [i, name] of [['dynamo', 'flywheel'], ['tree', 'lamp-in-the-tree'], ['title', 'voltage-title']].entries()) {
    await poll(() => page.getByTestId('story-beat-card').isVisible(), { label: `beat ${name[0]}` });
    console.log('ceremony beat:', await page.getByTestId('story-beat-card').getAttribute('data-beat-id'));
    await shot(page, `e2-07-t2-${name[1]}`);
    if (i < 2) await page.locator('[data-story-ceremony-continue]').click();
  }
  await page.locator('[data-story-ceremony-skip]').click().catch(() => {});
} else {
  console.log('T2 already armed exactly once by the stopped prior attempt; continuing with reload persistence proof');
}
console.log('active epoch after T2:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));

// Reload (persistence), then E3 town + board chapters.
await restorePlainBoot(page);
await page.reload();
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu 3' });
console.log('epoch after reload:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));
await exposeFullSagaDoors(page);
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await shot(page, 'e2-08-e3-town-first-morning');
await openBoard(page);
const chapters = await page.evaluate(() =>
  [...document.querySelectorAll('[data-testid^="contract-chapter-tab-"]')]
    .map((element) => element.getAttribute('data-testid')?.replace('contract-chapter-tab-', '')));
console.log('board chapters visible:', JSON.stringify(chapters));
await shot(page, 'e2-09-board-e3-chapter');
await finish('T2 ceremony + E3 arming');
