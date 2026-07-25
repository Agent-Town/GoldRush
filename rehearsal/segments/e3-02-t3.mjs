// E3 SEGMENT — T3 THE REFINERY: the one-shot megaproject purchase, then the
// framework ceremony (valve HOLD gates the arming). Science seeded to 10 (cited).
import { openSegment, shot, poll, townReady, openSchoolhouse, openBoard, seedScience, frameworkCeremony, exposeFullSagaDoors, restorePlainBoot } from '../lib.mjs';

const { page, finish } = await openSegment('e3-02-t3-the-refinery-ceremony', { url: '/' });
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu' });
await seedScience(page, 10);
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await exposeFullSagaDoors(page);
await shot(page, 'e3-04-e3-town-square');
await openSchoolhouse(page);
const done = await frameworkCeremony(page, { shotPrefix: 'e3-05-t3', hand: 'hold' });
console.log('armed epoch:', done?.armedEpochId, '| activeEpoch:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));
console.log('kept image key:', await page.evaluate(() => {
  const raw = localStorage.getItem('gr.ceremony.keptImage.v1.t3-the-refinery');
  return raw ? JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(raw)).filter(([k]) => k !== 'dataUrl'))) : null;
}));
await restorePlainBoot(page);
await page.reload();
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu 2' });
console.log('epoch after reload:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));
await exposeFullSagaDoors(page);
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await shot(page, 'e3-06-e4-town-first-morning');
await openBoard(page);
await shot(page, 'e3-07-board-e4-chapter');
await finish('T3 valve ceremony + E4 arming');
