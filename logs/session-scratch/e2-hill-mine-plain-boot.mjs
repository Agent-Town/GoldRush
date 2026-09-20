// PLAIN BOOT — no ?debug anywhere. Seeds a profile, walks to the tavern, opens the board and
// launches e2-hill-mine from it, exactly as a player does (the board stages the launch in
// sessionStorage, so ?contract= appears in the URL with no debug flag; the honest-harness rule).
// Answers Mistake #10's question for this shift: where does the PLAYER see this, in a plain boot?
// Also runs the 390px max zoom-out for the MQ-2 backplate-band check. Reads only.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5271';
const MOBILE = process.argv.includes('--mobile');
const PROJECT = MOBILE ? 'mobile-chrome' : 'desktop-chrome';
const OUT = path.resolve('artifacts/beauty-e2-hill-mine/plain-boot');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: MOBILE ? { width: 390, height: 844 } : { width: 1280, height: 800 } });
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(String(error)));

await page.goto(`${BASE}/`);
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
  // Key shapes read from src/game/ProfileStorage.ts + src/meta/ContractFamilies.ts, not guessed.
  localStorage.setItem('gr.profile.v2', JSON.stringify({
    version: 2,
    activeId: 'robin',
    profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  }));
  localStorage.setItem('gr.profile.v2.robin.gr.town.name.v1', 'Quartz Hill');
  localStorage.setItem('gr.profile.v2.robin.gr.activeEpoch.v1', 'epoch-2-steamworks');
});
await page.reload();
await page.getByTestId('start-menu-enter-town').click();
await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 120000 });
for (const [key, ms] of [['KeyA', 850], ['KeyW', 850]]) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}
await page.getByTestId('town-open-board').click();
await page.getByTestId('contract-chapter-tab-epoch-2-steamworks').click();
await page.screenshot({ path: path.join(OUT, `${PROJECT}-1-board.png`) });
await page.getByTestId('contract-launch-e2-hill-mine').click();
await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 180000 });
await page.waitForFunction(() => {
  const canvas = document.querySelector('canvas');
  return canvas?.dataset.terrain3dPilotState && canvas.dataset.terrain3dPilotState !== 'loading';
}, undefined, { timeout: 180000 });
await page.waitForTimeout(2500);
// The contract card is up over the terraces — the brief's shot 1.
await page.screenshot({ path: path.join(OUT, `${PROJECT}-2-briefing.png`) });
const begin = page.getByTestId('contract-briefing-dismiss');
if (await begin.count()) await begin.click().catch(() => {});
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(OUT, `${PROJECT}-3-run.png`) });

// MQ-2: max zoom-out must not show a backplate band past the sculpt edge.
for (let step = 0; step < 14; step += 1) {
  await page.mouse.move(MOBILE ? 195 : 640, MOBILE ? 420 : 400);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(90);
}
await page.waitForTimeout(1600);
await page.screenshot({ path: path.join(OUT, `${PROJECT}-4-zoomed-out.png`) });

const report = await page.evaluate(() => {
  const d = document.querySelector('canvas')?.dataset ?? {};
  return {
    debugHandlePresent: typeof window.__GR_TEST__ !== 'undefined',
    url: window.location.search,
    activeContract: window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId,
    state: d.terrain3dPilotState,
    renderSource: d.terrain3dPilotRenderSource,
    landmarks: d.terrain3dPilotLandmarks,
    landmarkSkipped: d.terrain3dPilotLandmarkSkipped,
    landmarkEmissive: d.terrain3dPilotLandmarkEmissive,
    sculptWater: d.terrain3dPilotSculptWater,
    sculptWaterHalfWidth: d.terrain3dPilotSculptWaterHalfWidth,
    sculptWaterSimHalfWidth: d.terrain3dPilotSculptWaterSimHalfWidth,
    contactShadows: d.terrain3dPilotContactShadows,
    motes: d.terrain3dPilotMotes,
    steam: d.terrain3dPilotSteam,
    steamAnchors: d.terrain3dPilotSteamAnchors,
    landmarkMaterials: d.terrain3dPilotLandmarkMaterials,
    zoom: window.__THREE_GAME_DIAGNOSTICS__?.camera?.zoom ?? null,
  };
});
report.consoleErrors = errors;
writeFileSync(path.join(OUT, `${PROJECT}-report.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
