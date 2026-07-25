// E6 SEGMENT — T6 THE CALCULATING HOUSE: the real framework door, the
// mount-plate hold, and the legitimate E6 → E7 arming. Science to 16 is cited.
import {
  openSegment, shot, poll, townReady, openSchoolhouse, openBoard, seedScience,
  frameworkCeremony, exposeFullSagaDoors, restorePlainBoot,
} from '../lib.mjs';

const ACTIVE_EPOCH = 'gr.activeEpoch.v1';
const { page, finish } = await openSegment('e6-02-t6-the-calculating-house-ceremony', { url: '/' });
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu' });

// Repair only the interrupted rehearsal attempt made by the retired wall rig.
await page.evaluate(({ activeKey, keptKey }) => {
  if (localStorage.getItem(activeKey) === 'epoch-7-signal' && !localStorage.getItem(keptKey)) {
    localStorage.setItem(activeKey, 'epoch-6-atomic');
    localStorage.setItem('gr.epochCeremony.v1', 'epoch-6-atomic');
    localStorage.removeItem('gr.research.epoch-7-signal.v1');
  }
}, { activeKey: ACTIVE_EPOCH, keptKey: 'gr.ceremony.keptImage.v1.t6-the-calculating-house' });
await seedScience(page, 16);
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await exposeFullSagaDoors(page);
await shot(page, 'e6-04-e6-town-square');
await openSchoolhouse(page);
const done = await frameworkCeremony(page, { shotPrefix: 'e6-05-t6', hand: 'hold' });
console.log('armed epoch:', done?.armedEpochId, '| activeEpoch:', await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH));
console.log('kept image:', await page.evaluate(() => {
  const raw = localStorage.getItem('gr.ceremony.keptImage.v1.t6-the-calculating-house');
  return raw ? JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(raw)).filter(([key]) => key !== 'dataUrl'))) : null;
}));
if (done?.armedEpochId !== 'epoch-7-signal') throw new Error(`T6 did not arm E7: ${JSON.stringify(done)}`);

await restorePlainBoot(page);
await page.reload();
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu 2' });
console.log('epoch after reload:', await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH));
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await shot(page, 'e6-06-e7-town-first-morning');
await exposeFullSagaDoors(page);
await openBoard(page);
await shot(page, 'e6-07-board-e7-chapter');
await finish('T6 calculating-house ceremony + legitimate E7 arming');
