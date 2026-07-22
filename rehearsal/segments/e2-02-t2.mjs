// E2 SEGMENT — T2 THE DYNAMO HALL: hold-to-crank through the schoolhouse door
// on a plain boot; the lamp in the Elder's Tree; E3 armed exactly once.
// Science seeded to 8 (cited: eight secured runs at 1/run; we played two real).
import { openSegment, shot, poll, townReady, openSchoolhouse, openBoard } from '../lib.mjs';

const { page, finish } = await openSegment('e2-02-t2-the-dynamo-ceremony', { url: '/' });
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu' });
await page.evaluate(() => {
  const key = 'gr.profile.v2.rehearsal.gr.meta.v1';
  const meta = JSON.parse(localStorage.getItem(key));
  meta.tracks.science = Math.max(meta.tracks.science, 8);
  localStorage.setItem(key, JSON.stringify(meta));
});
await page.reload();
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu 2' });
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await shot(page, 'e2-05-e2-town-square');
await openSchoolhouse(page);
const door = await page.evaluate(() => {
  const el = document.querySelector('[data-testid="dynamo-hall-epoch-door"]');
  return el ? { state: el.getAttribute('data-door-state'), text: el.textContent.replace(/\s+/g, ' ').slice(0, 220) } : null;
});
console.log('T2 door:', JSON.stringify(door));
await shot(page, 'e2-06-t2-door');

const crank = page.getByTestId('crank-dynamo');
await crank.dispatchEvent('pointerdown');
await poll(() => page.getByTestId('story-beat-card').isVisible(), { timeout: 15_000, label: 'dynamo beat' });
await crank.dispatchEvent('pointerup').catch(() => {});
for (const [i, name] of [['dynamo', 'flywheel'], ['tree', 'lamp-in-the-tree'], ['title', 'voltage-title']].entries()) {
  await poll(() => page.getByTestId('story-beat-card').isVisible(), { label: `beat ${name[0]}` });
  console.log('ceremony beat:', await page.getByTestId('story-beat-card').getAttribute('data-beat-id'));
  await shot(page, `e2-07-t2-${name[1]}`);
  if (i < 2) await page.locator('[data-story-ceremony-continue]').click();
}
console.log('active epoch after T2:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));
await page.locator('[data-story-ceremony-skip]').click().catch(() => {});

// Reload (persistence), then E3 town + board chapters.
await page.reload();
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu 3' });
console.log('epoch after reload:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await shot(page, 'e2-08-e3-town-first-morning');
await openBoard(page);
const chapters = await page.evaluate(() =>
  [...document.querySelectorAll('[data-contract-chapter]')].map((el) => el.getAttribute('data-contract-chapter')));
console.log('board chapters visible:', JSON.stringify(chapters));
await shot(page, 'e2-09-board-e3-chapter');
await finish('T2 ceremony + E3 arming');
