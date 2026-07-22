// E5 SEGMENT — T5 THE DEEP REACTOR: the rhythm ceremony (six timed pulls, then
// the homecoming pass with the hand kept in). Science seeded to 14 (cited).
import { openSegment, shot, poll, townReady, openSchoolhouse, openBoard, seedScience, frameworkCeremony } from '../lib.mjs';

const { page, finish } = await openSegment('e5-02-t5-the-deep-reactor-ceremony', { url: '/' });
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu' });
await seedScience(page, 14);
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await shot(page, 'e5-04-e5-town-square');
await openSchoolhouse(page);
const done = await frameworkCeremony(page, { shotPrefix: 'e5-05-t5', hand: 'rhythm' });
console.log('armed epoch:', done?.armedEpochId, '| activeEpoch:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));
console.log('kept image:', await page.evaluate(() => {
  const raw = localStorage.getItem('gr.ceremony.keptImage.v1.t5-the-deep-reactor');
  return raw ? JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(raw)).filter(([k]) => k !== 'dataUrl'))) : null;
}));
await page.reload();
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu 2' });
console.log('epoch after reload:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await shot(page, 'e5-06-e6-town-first-morning');
await openBoard(page);
await shot(page, 'e5-07-board-e6-chapter');
await finish('T5 rhythm ceremony + E6 arming');
