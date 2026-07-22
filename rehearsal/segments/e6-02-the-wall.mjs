// E6 SEGMENT — THE WALL (live proof of F-REH-01): science to 16 (cited), the
// calculating-house megaproject purchased through the real door — and then the
// player's dead end, recorded. Afterwards: the cited unblock (ACTIVE_EPOCH
// write, exactly what the debug era-door does via URL pinning) so the traversal
// can continue; the finding stands regardless.
import { openSegment, shot, poll, townReady, openSchoolhouse, seedScience, ceremonyDiag } from '../lib.mjs';

const { page, finish } = await openSegment('e6-02-the-wall-at-t6', { url: '/' });
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu' });
await seedScience(page, 16);
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await shot(page, 'e6-04-e6-town-square');
await openSchoolhouse(page);

// The megaproject door takes the purchase…
const mpDoor = await page.evaluate(() => {
  const el = document.querySelector('[data-testid="epoch-megaproject-door"]');
  return el ? { id: el.getAttribute('data-megaproject-id'), state: el.getAttribute('data-door-state'), text: el.textContent.replace(/\s+/g, ' ').slice(0, 200) } : null;
});
console.log('E6 megaproject door:', JSON.stringify(mpDoor));
await shot(page, 'e6-05-calculating-house-door');
if (mpDoor?.state === 'ready') {
  await page.getByTestId('raise-epoch-megaproject').click();
  console.log('calculating-house raised:', await page.evaluate(() => localStorage.getItem('gr.megaprojects.v1')));
}
await page.waitForTimeout(600);

// …and then: no ceremony door, no arming path. Record the dead end.
const after = await page.evaluate(() => ({
  ceremonyDoor: !!document.querySelector('[data-testid="ceremony-epoch-door"]'),
  megaprojectDoor: !!document.querySelector('[data-testid="epoch-megaproject-door"]'),
  stampDoor: !!document.querySelector('[data-testid="stamp-mill-epoch-door"]'),
  dynamoDoor: !!document.querySelector('[data-testid="dynamo-hall-epoch-door"]'),
  beginCeremony: !!document.querySelector('[data-testid="begin-ceremony"]'),
  doorText: [...document.querySelectorAll('.town-ui__epoch-door')].map((el) => el.textContent.replace(/\s+/g, ' ').slice(0, 120)),
}));
console.log('THE WALL — schoolhouse after purchase:', JSON.stringify(after, null, 1));
console.log('ceremony diagnostics:', JSON.stringify(await ceremonyDiag(page)));
await shot(page, 'e6-06-THE-WALL-no-door');

// The real arming seam refuses too (successor is null):
console.log('activateEpoch(epoch-7-signal) →', await page.evaluate(async () => {
  const registry = await Function('return import("/src/meta/ContractFamilies.ts")')();
  return registry.activateEpoch('epoch-7-signal');
}));

// CITED UNBLOCK (P0 workaround, not a fix): pin the era the way &era=N does.
await page.evaluate(() => localStorage.setItem('gr.activeEpoch.v1', 'epoch-7-signal'));
await page.reload();
await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu 2' });
console.log('epoch after unblock:', await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1')));
await page.getByTestId('start-menu-enter-town').click();
await townReady(page);
await shot(page, 'e6-07-e7-town-first-morning-post-unblock');
await finish('E6 wall proven live; unblocked to E7 via cited seam');
