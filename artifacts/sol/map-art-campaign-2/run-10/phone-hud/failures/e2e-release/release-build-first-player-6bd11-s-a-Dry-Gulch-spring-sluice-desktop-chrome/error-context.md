# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: release-build.spec.ts >> first player reaches textured town actors and places a Dry Gulch spring sluice
- Location: e2e/release-build.spec.ts:24:1

# Error details

```
Test timeout of 150000ms exceeded.
```

```
Error: locator.click: Test timeout of 150000ms exceeded.
Call log:
  - waiting for getByTestId('contract-briefing-dismiss')

```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - generic:
    - status [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - paragraph [ref=e7]: The Contract
          - button "Begin" [ref=e8] [cursor=pointer]
        - heading "The Dry Gulch" [level=2] [ref=e9]
        - paragraph [ref=e10]: Mesa country; dry washes fall toward one sunken spring.
        - generic [ref=e11]:
          - generic [ref=e12]:
            - paragraph [ref=e13]: Goals
            - list [ref=e14]:
              - listitem [ref=e15]: Survive through wave 20.
              - listitem [ref=e16]: Work the dry washes around the lone spring.
          - generic [ref=e17]:
            - paragraph [ref=e18]: Rules
            - list [ref=e19]:
              - listitem [ref=e20]: Sluices work only beside the spring.
              - listitem [ref=e21]: The river is gone; enemies can press from every edge.
              - listitem [ref=e22]: Seams pay 40% more gold.
    - generic "Wave status":
      - generic:
        - generic: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 100 / 100
      - generic:
        - generic: Time
        - strong: 00:00
      - generic:
        - generic: Wave
        - strong: "0"
    - region "Gold pouch":
      - generic: Gold
      - strong: "0"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e23] [cursor=pointer]:
        - generic [ref=e24]:
          - generic [ref=e25]: the Prospector
          - strong [ref=e26]: L0
          - generic [ref=e27]: suggest-only
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "1"
        - strong: 0 / 12 XP
    - region "Build":
      - button "Build" [ref=e29]
    - button "Pause the claim" [ref=e30]: P - catch your breath
  - region
```

# Test source

```ts
  1   | import { execFileSync } from 'node:child_process';
  2   | import { mkdirSync } from 'node:fs';
  3   | import path from 'node:path';
  4   | import { expect, test, type Page } from '@playwright/test';
  5   | import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
  6   | import {
  7   |   FIRST_CLAIM_DONE_KEY,
  8   |   PROFILE_KEY,
  9   |   SCOREBOARD_KEY,
  10  |   TOWN_NAME_KEY,
  11  |   profileDataKey,
  12  |   type ProfileState,
  13  | } from '../src/game/ProfileStorage';
  14  | import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
  15  | import { RESEARCH_NODES, RESEARCH_STATE_KEY, STEAMWORKS_THRESHOLD } from '../src/meta/ResearchTree';
  16  | import { moveHeroTo } from './helpers/hero-approach';
  17  | import { expectNoConsoleErrors, watchErrors } from './support/console-watch';
  18  | 
  19  | const FRONTIER = 'epoch-1-frontier';
  20  | const CONTRACTS = ['the-claim', 'e1-drill-yard', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'] as const;
  21  | const LAUNCH_KEY = 'gr.contract.launch.v1';
  22  | const SEEDED_KEY = 'gr.release-build.seeded';
  23  | 
  24  | test('first player reaches textured town actors and places a Dry Gulch spring sluice', async ({ page }, testInfo) => {
  25  |   test.setTimeout(150_000);
  26  |   const watch = watchErrors(page);
  27  |   await page.addInitScript(() => {
  28  |     if (sessionStorage.getItem('gr.release-build.first-player')) return;
  29  |     localStorage.clear();
  30  |     sessionStorage.clear();
  31  |     sessionStorage.setItem('gr.release-build.first-player', '1');
  32  |   });
  33  |   await page.goto('/');
  34  |   await expect(page.getByTestId('greenhorn-question')).toHaveCount(0);
  35  |   await page.getByTestId('profile-name-input').fill('Mina');
  36  |   await page.getByTestId('profile-create').click();
  37  |   await waitForTown(page);
  38  |   await page.getByTestId('town-name-input').fill('Aurora Bend');
  39  |   await page.getByTestId('town-name-submit').click();
  40  |   await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'founding-welcome');
  41  |   await page.mouse.click(6, 6);
  42  |   await expect.poll(() => page.evaluate(() => {
  43  |     const actors = window.__GR_TOWN_DIAGNOSTICS__?.actors.filter((actor) => actor.visible && actor.presentation === 'full_body') ?? [];
  44  |     return actors.length > 0 && actors.every((actor) => actor.loaded);
  45  |   }), { timeout: 15_000 }).toBe(true);
  46  | 
  47  |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide.greetingVisible)).toBe(true);
  48  |   await page.mouse.click(6, 6);
  49  |   await teleportToActor(page, 'newsie');
  50  |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeBark?.actorId ?? null)).toBe('newsie');
  51  |   await page.getByTestId('town-welcome-skip').click();
  52  |   await teleportToBuilding(page, 'tavern');
  53  |   await page.getByTestId('town-open-board').click();
  54  |   await expect(page.getByTestId('contract-board')).toBeVisible();
  55  |   if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) await page.mouse.click(6, 6);
  56  |   await page.getByTestId('contract-launch-the-claim').click();
  57  |   await waitForContract(page, 'the-claim');
  58  |   if (await page.getByTestId('contract-briefing').isVisible().catch(() => false)) {
  59  |     await page.getByTestId('contract-briefing-dismiss').click();
  60  |   }
  61  |   await page.keyboard.press('Escape');
  62  |   await page.getByTestId('pause-back-to-town').click();
  63  |   await expect(page.getByTestId('start-menu')).toBeVisible();
  64  |   await page.getByTestId('start-menu-enter-town').click();
  65  |   await waitForTown(page);
  66  | 
  67  |   await page.evaluate(({ profileKey, scoreKey }) => {
  68  |     const profile = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as ProfileState;
  69  |     localStorage.setItem(`${profileKey}.${profile.activeId}.${scoreKey}`, JSON.stringify([
  70  |       { waves: 20, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: 'the-claim', profileName: 'Mina' },
  71  |     ]));
  72  |   }, { profileKey: PROFILE_KEY, scoreKey: SCOREBOARD_KEY });
  73  |   await teleportToBuilding(page, 'tavern');
  74  |   await page.getByTestId('town-open-board').click();
  75  |   page.once('dialog', (dialog) => dialog.accept());
  76  |   await page.getByTestId('contract-launch-e1-dry-gulch').dispatchEvent('click');
  77  |   await waitForContract(page, 'e1-dry-gulch');
  78  |   if (await page.getByTestId('contract-briefing').isVisible().catch(() => false)) {
> 79  |     await page.getByTestId('contract-briefing-dismiss').click();
      |                                                         ^ Error: locator.click: Test timeout of 150000ms exceeded.
  80  |   }
  81  |   await harvestSluiceBudget(page);
  82  |   if (await page.getByTestId('upgrade-overlay').isVisible()) {
  83  |     await page.getByTestId('upgrade-card-0').click();
  84  |     await expect(page.getByTestId('upgrade-overlay')).toBeHidden();
  85  |   }
  86  |   await moveHeroTo(page, -9, -12);
  87  |   await moveHeroTo(page, -17.8, -12);
  88  |   const mobile = testInfo.project.name === 'mobile-chrome';
  89  |   await moveHeroTo(page, -17.8, mobile ? -13.1 : -15.2);
  90  |   await page.getByTestId('hud-build').click();
  91  |   await page.getByTestId('hud-build-tile-sluice').click();
  92  |   const canvas = page.locator('#game-canvas');
  93  |   await canvas.dispatchEvent('pointerdown', { clientX: 1, clientY: 1, pointerType: 'mouse', button: 0 });
  94  |   await expect(page.getByTestId('hud-build-menu')).toBeHidden();
  95  |   const springRim = await aimBuildGhost(page, { x: -18, z: -15 });
  96  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid)).toBe(true);
  97  |   await canvas.dispatchEvent('click', { clientX: springRim.x, clientY: springRim.y });
  98  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.sluices)).toBe(1);
  99  |   expectNoConsoleErrors(watch);
  100 | });
  101 | 
  102 | for (const contractId of CONTRACTS) {
  103 |   test(`${contractId} boots through the E1 release door`, async ({ page }) => {
  104 |     const watch = watchErrors(page);
  105 |     await seedProfile(page, { contractId, unlocked: true });
  106 |     await page.goto(`/?contract=${contractId}`);
  107 |     await waitForContract(page, contractId);
  108 |     expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  109 |     expectNoConsoleErrors(watch);
  110 |   });
  111 | }
  112 | 
  113 | test('the schoolhouse ledger opens clean on a progressed frontier save', async ({ page }) => {
  114 |   // Owner-found F-E1W-1: era-triggered dispatches referencing stripped epochs
  115 |   // ('unreleased-epoch') must publish as beyond-the-frontier, never throw.
  116 |   const watch = watchErrors(page);
  117 |   await seedProfile(page, { unlocked: true });
  118 |   await page.goto('/');
  119 |   await page.getByTestId('start-menu-enter-town').click();
  120 |   await waitForTown(page);
  121 |   if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) await page.mouse.click(6, 6);
  122 |   await teleportToBuilding(page, 'schoolhouse');
  123 |   await page.mouse.click(6, 6);
  124 |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('schoolhouse');
  125 |   await page.getByTestId('town-open-schoolhouse').click();
  126 |   await page.waitForTimeout(500);
  127 |   expectNoConsoleErrors(watch);
  128 |   await expect(page.getByTestId('schoolhouse-close')).toBeVisible({ timeout: 10_000 });
  129 | });
  130 | 
  131 | test('the in-run Stamp Mill site explains the release horizon without funding controls', async ({ page }, testInfo) => {
  132 |   const watch = watchErrors(page);
  133 |   await seedProfile(page, { contractId: 'the-claim', unlocked: true });
  134 |   await page.goto('/?contract=the-claim');
  135 |   await waitForContract(page, 'the-claim');
  136 |   if (await page.getByTestId('contract-briefing').isVisible().catch(() => false)) {
  137 |     await page.getByTestId('contract-briefing-dismiss').click();
  138 |   }
  139 |   const footprint = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.megaproject.siteFootprint ?? null);
  140 |   expect(footprint).toBeTruthy();
  141 |   await moveHeroTo(page, footprint!.x, footprint!.z - footprint!.d * 0.5 - 0.72);
  142 | 
  143 |   await expect(page.getByTestId('world-info-note-title')).toHaveText('The Stamp Mill stands ready.');
  144 |   await expect(page.getByTestId('world-info-note-body')).toHaveText('The era turns when the wider world sends word.');
  145 |   await expect(page.getByTestId('building-context-prompt')).toBeHidden();
  146 |   await expect(page.getByTestId('stamp-site-fund')).toBeHidden();
  147 |   await page.keyboard.press('Enter');
  148 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.megaproject.funded)).toBe(false);
  149 | 
  150 |   const artifactDir = path.resolve('artifacts/mill-horizon-copy');
  151 |   mkdirSync(artifactDir, { recursive: true });
  152 |   await page.screenshot({ path: path.join(artifactDir, `${testInfo.project.name}-in-run.png`) });
  153 |   expectNoConsoleErrors(watch);
  154 | });
  155 | 
  156 | test('debug and era query seams are inert', async ({ page }) => {
  157 |   const watch = watchErrors(page);
  158 |   await seedProfile(page, { unlocked: true });
  159 |   await page.goto('/?debug&era=5&contract=e1-baron');
  160 |   await waitForContract(page, 'the-claim');
  161 |   expect(await page.evaluate(() => ({
  162 |     epoch: localStorage.getItem('gr.activeEpoch.v1'),
  163 |     seam: typeof window.__GR_TEST__,
  164 |     gui: typeof window.__GR_GUI__,
  165 |     agent: typeof window.__GR_AGENT__,
  166 |     telemetry: typeof window.__GR_TELEMETRY__,
  167 |     seededEra: document.querySelector('canvas')?.dataset.seededEra,
  168 |   }))).toEqual({
  169 |     epoch: FRONTIER,
  170 |     seam: 'undefined',
  171 |     gui: 'undefined',
  172 |     agent: 'undefined',
  173 |     telemetry: 'undefined',
  174 |     seededEra: undefined,
  175 |   });
  176 |   expectNoConsoleErrors(watch);
  177 | });
  178 | 
  179 | test('an imported later ledger heals to the frontier and plays', async ({ page }) => {
```