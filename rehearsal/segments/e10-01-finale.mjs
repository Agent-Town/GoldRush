// E10 SEGMENT — THE LAST CLAIM: THE STATIC/THE QUIET fought as three preserves
// (lantern · song · portrait), the recession (out-lived, not killed), the
// re-ink, the river offer, and the post-credits RIVER charter launched. Then a
// separate boot proves the post-credits river hook (064). Debug finale flags +
// balance-tuned windows are cited grinding shortcuts; the preserve VERBS are
// played through the real interact seam.
import { openSegment, shot, poll, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e10-01-the-last-claim-the-static', { url: '/?debug&contract=e10-last-claim&e10static&timescale=1&seed=rehearsal-e10' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await shot(page, 'e10-01-ark-plaza-boot');

// slow-drain, generous windows so the play reads on video (cited)
await page.evaluate(() => {
  window.__GR_TEST__.setBalance('e10Static.approachSeconds', 0.5);
  window.__GR_TEST__.setBalance('e10Static.meaningDrainPerSecond', 0.05);
  window.__GR_TEST__.setBalance('e10Static.preserveWindowSeconds', 12);
  window.__GR_TEST__.setBalance('e10Static.recessionHoldSeconds', 1);
});
const diag = () => page.evaluate(() => window.__GR_TEST__.e10Static.diagnostics());
console.log('static init:', JSON.stringify(await diag()).slice(0, 300));

// Act 2: bring the Quiet on by entering its aura.
await page.evaluate(() => { window.__GR_TEST__.teleport(0, 20); window.__GR_TEST__.advanceSim(0.6); });
console.log('static engaged:', JSON.stringify(await diag()).slice(0, 300));
await shot(page, 'e10-02-the-quiet-approach');

// Act 3: the three preserves, each played at its site through the interact seam.
for (const [i, [x, z, name]] of [[-10, 50, 'lantern'], [0, 50, 'song'], [10, 50, 'portrait']].entries()) {
  await page.evaluate(({ x, z }) => { window.__GR_TEST__.teleport(x, z); window.__GR_TEST__.advanceSim(1 / 30); }, { x, z });
  const ok = await page.evaluate(() => window.__GR_TEST__.e10Static.interact());
  await page.evaluate(() => window.__GR_TEST__.advanceSim(1 / 30));
  console.log(`preserve ${name}:`, ok);
  await shot(page, `e10-03-preserve-${i + 1}-${name}`);
}
await page.evaluate(() => window.__GR_TEST__.advanceSim(2));
const receded = await diag();
console.log('THE QUIET receded:', JSON.stringify({ victory: receded.victory, act: receded.act, jarredMote: receded.jarredMote, killPath: receded.killPath, damageAccepted: receded.damageAccepted, allPreserved: receded.allPreserved }));
await shot(page, 'e10-04-the-recession-re-inking');

// The re-ink → the river offer → the lever.
await page.evaluate(() => { window.__GR_TEST__.setBalance('e10Finale.reinkSeconds', 0.5); window.__GR_TEST__.setBalance('e10Finale.offerDelaySeconds', 0); window.__GR_TEST__.e10Finale.close(); });
await poll(async () => (await page.evaluate(() => window.__GR_TEST__.e10Finale.diagnostics()))?.riverOffer?.offered === true, { timeout: 20_000, label: 'river offered' });
console.log('finale:', JSON.stringify(await page.evaluate(() => window.__GR_TEST__.e10Finale.diagnostics())).slice(0, 300));
await shot(page, 'e10-05-the-charter-press-river-lever');
await page.getByTestId('e10-river-lever').click().catch(() => {});
await poll(() => page.getByTestId('contract-briefing-name').textContent().then((t) => t?.includes('River')).catch(() => false), { timeout: 15_000, label: 'river charter' });
console.log('post-credits charter:', await page.getByTestId('contract-briefing-name').textContent().catch(() => null));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await gameReady(page);
// The RIVER hook fires: E1's claim at dawn, the river running (064 vista law).
const river = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain?.vista?.river ?? null);
console.log('post-credits river vista:', JSON.stringify(river)?.slice(0, 260));
console.log('post-credits contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await shot(page, 'e10-07-THE-RIVER-playable-dawn');
await finish(`the last claim: static receded=${receded.victory}, river charter launched + playable`);
