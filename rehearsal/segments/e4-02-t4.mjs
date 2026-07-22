// E4 SEGMENT — T4 THE BOAT: the drive ceremony (the hand on the wheel gates the
// crest; the SEA; the kept image). Science seeded to 12 (cited).
import { openSegment, shot, poll, townReady, openSchoolhouse, openBoard, seedScience, frameworkCeremony } from '../lib.mjs';

const { page, finish } = await openSegment('e4-02-t4-the-boat-ceremony', { url: '/' });
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu' });
await seedScience(page, 12);
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await shot(page, 'e4-04-e4-town-square');
await openSchoolhouse(page);
const done = await frameworkCeremony(page, { shotPrefix: 'e4-05-t4', hand: 'hold' });
console.log('armed epoch:', done?.armedEpochId, '| activeEpoch:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));
console.log('kept image:', await page.evaluate(() => {
  const raw = localStorage.getItem('gr.ceremony.keptImage.v1.t4-the-boat');
  return raw ? JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(raw)).filter(([k]) => k !== 'dataUrl'))) : null;
}));
await page.reload();
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu 2' });
console.log('epoch after reload:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await shot(page, 'e4-06-e5-town-first-morning');
await openBoard(page);
await shot(page, 'e4-07-board-e5-chapter');
await finish('T4 boat ceremony + E5 arming');
