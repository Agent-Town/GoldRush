// One-profile ledger proof after the legitimate T6 → E7 ceremony.
import { openSegment, shot, poll, townReady, openBoard, exposeFullSagaDoors } from '../lib.mjs';

const expected = [
  'epoch-1-frontier',
  'epoch-2-steamworks',
  'epoch-3-voltage',
  'epoch-4-motor',
  'epoch-5-deepwater',
  'epoch-6-atomic',
  'epoch-7-signal',
];
const { page, finish } = await openSegment('e6-03-one-profile-board-chapters', { url: '/' });
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu' });
await exposeFullSagaDoors(page);
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await openBoard(page);
const chapters = await page.evaluate(() =>
  [...document.querySelectorAll('[data-testid^="contract-chapter-tab-"]')]
    .map((element) => element.getAttribute('data-testid')?.replace('contract-chapter-tab-', '')));
console.log('one-profile board chapters:', JSON.stringify(chapters));
for (const id of expected) {
  if (!chapters.includes(id)) throw new Error(`One-profile board is missing ${id}: ${JSON.stringify(chapters)}`);
}
await shot(page, 'e6-08-board-chapters-e1-through-e7');
await finish('one-profile board chapters E1 through E7');
