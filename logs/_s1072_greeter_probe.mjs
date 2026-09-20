// s1072 probe — F-1071-2 diagnosis: who greets a fresh player, and by how much?
// Reproduces 061-first-claim-onboarding's seed + naming ceremony, then reads the
// LIVE hero position and the LIVE positions of the two whitelisted greeter
// candidates (TownScene.firstClaimGreeter considers ONLY tavernkeeper + elder).
// Retained per the RETENTION LAW. Run: node logs/_s1072_greeter_probe.mjs
import { chromium } from 'playwright';

const BASE = process.env.GR_PROBE_BASE ?? 'http://127.0.0.1:5252';

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

await page.goto(BASE + '/');
// Mirror the spec's seedProfile() exactly (fresh 'robin', trail preset, zeroed meta).
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
  // Real keys, read from src/game/ProfileStorage.ts (PROFILE_KEY = 'gr.profile.v2';
  // profileDataKey = `${PROFILE_KEY}.${id}.${logicalKey}`), not guessed.
  localStorage.setItem('gr.profile.v2', JSON.stringify({
    version: 2,
    activeId: 'robin',
    profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  }));
  localStorage.setItem('gr.profile.v2.robin.gr.meta.v1', JSON.stringify({
    version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 },
  }));
});
await page.reload();

await page.getByTestId('start-menu-enter-town').click();
await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);

// Naming ceremony, as the spec does it.
await page.getByTestId('town-name-input').fill('Copper Hill');
await page.getByTestId('town-name-submit').click();
await page.waitForTimeout(500);
await page.mouse.click(6, 6);
await page.waitForTimeout(800);

const speaker = await page.getByTestId('town-bark-speaker').textContent().catch(() => null);
const diag = await page.evaluate(() => {
  const d = window.__GR_TOWN_DIAGNOSTICS__;
  const actors = (d?.actors ?? []).filter((a) => a.id === 'tavernkeeper' || a.id === 'elder');
  return {
    firstClaimGuide: d?.firstClaimGuide ?? null,
    activeBark: d?.activeBark ?? null,
    hero: d?.hero ?? null,
    candidates: actors,
    actorKeys: Object.keys((d?.actors ?? [])[0] ?? {}),
  };
});

console.log('rendered town-bark-speaker :', JSON.stringify(speaker));
console.log('firstClaimGuide            :', JSON.stringify(diag.firstClaimGuide));
console.log('activeBark                 :', JSON.stringify(diag.activeBark));
console.log('hero                       :', JSON.stringify(diag.hero));
console.log('greeter candidates         :', JSON.stringify(diag.candidates));
console.log('actor diag keys            :', JSON.stringify(diag.actorKeys));
console.log('console/page errors        :', consoleErrors.length, consoleErrors.slice(0, 3));

await browser.close();
