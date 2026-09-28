# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ss-01-beats.spec.ts >> pointer glow clears on first interaction
- Location: e2e/ss-01-beats.spec.ts:169:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByTestId('story-beat-card')
Expected: "deputy-hello"
Received: "first-boot"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for getByTestId('story-beat-card')
    14 × locator resolved to <article role="status" data-art-key="" aria-live="polite" data-ceremony-step="" data-beat-id="first-boot" data-speaker="tavernkeeper" data-testid="story-beat-card" class="story-beat-card story-beat-card--visible">…</article>
       - unexpected value "first-boot"

```

```yaml
- status:
  - paragraph: Tavernkeeper
  - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
  - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
```

# Test source

```ts
  1   | import { mkdir } from 'node:fs/promises';
  2   | import path from 'node:path';
  3   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  4   | import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
  5   | import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
  6   | import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';
  7   | 
  8   | const ARTIFACT_DIR = path.resolve('artifacts/ss-01');
  9   | 
  10  | type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
  11  | type SeedOptions = {
  12  |   townName?: string;
  13  |   talesEnabled?: boolean;
  14  |   agentLevel?: number;
  15  | };
  16  | 
  17  | function collectErrors(page: Page): ErrorBucket {
  18  |   const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  19  |   page.on('console', (message) => {
  20  |     if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  21  |   });
  22  |   page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  23  |   return bucket;
  24  | }
  25  | 
  26  | async function seedProfile(page: Page, options: SeedOptions = {}): Promise<void> {
  27  |   await page.goto('/?debug&seed=ss-01-seed');
  28  |   await page.evaluate(
  29  |     ({ profileKey, townKey, talesKey, metaKey, seed }) => {
  30  |       localStorage.clear();
  31  |       sessionStorage.clear();
  32  |       const state: ProfileState = {
  33  |         version: 2,
  34  |         activeId: 'robin',
  35  |         profiles: [
  36  |           {
  37  |             id: 'robin',
  38  |             name: 'Robin',
  39  |             createdAt: 1,
  40  |             updatedAt: 1,
  41  |             difficultyPreset: 'trail',
  42  |             hintsSeen: [],
  43  |           },
  44  |         ],
  45  |       };
  46  |       localStorage.setItem(profileKey, JSON.stringify(state));
  47  |       if (seed.townName) localStorage.setItem(townKey, seed.townName);
  48  |       localStorage.setItem(talesKey, seed.talesEnabled === false ? '0' : '1');
  49  |       localStorage.setItem(
  50  |         metaKey,
  51  |         JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: seed.agentLevel ?? 0 } }),
  52  |       );
  53  |     },
  54  |     {
  55  |       profileKey: PROFILE_KEY,
  56  |       townKey: profileDataKey('robin', TOWN_NAME_KEY),
  57  |       talesKey: profileDataKey('robin', STORY_TALES_STORAGE_KEY),
  58  |       metaKey: profileDataKey('robin', META_PROGRESS_KEY),
  59  |       seed: options,
  60  |     },
  61  |   );
  62  | }
  63  | 
  64  | async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  65  |   await mkdir(ARTIFACT_DIR, { recursive: true });
  66  |   await page.waitForTimeout(240);
  67  |   await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
  68  | }
  69  | 
  70  | async function hold(page: Page, key: string, ms: number): Promise<void> {
  71  |   await page.keyboard.down(key);
  72  |   await page.waitForTimeout(ms);
  73  |   await page.keyboard.up(key);
  74  | }
  75  | 
  76  | async function openTownBoard(page: Page): Promise<void> {
  77  |   await hold(page, 'KeyA', 850);
  78  |   await hold(page, 'KeyW', 850);
  79  |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  80  |   await page.getByTestId('town-open-board').click();
  81  |   await expect(page.getByTestId('contract-board')).toBeVisible();
  82  | }
  83  | 
  84  | async function expectBeat(page: Page, id: string, speaker: string, portraitNeedle: string): Promise<void> {
  85  |   const card = page.getByTestId('story-beat-card');
  86  |   await expect(card).toBeVisible({ timeout: 8_000 });
  87  |   await expect(card).toHaveClass(/story-beat-card--visible/);
> 88  |   await expect(card).toHaveAttribute('data-beat-id', id);
      |                      ^ Error: expect(locator).toHaveAttribute(expected) failed
  89  |   await expect(card).toHaveAttribute('data-speaker', speaker);
  90  |   await expect(page.getByTestId('story-beat-portrait')).toHaveAttribute('src', new RegExp(portraitNeedle));
  91  | }
  92  | 
  93  | async function dismissBeat(page: Page): Promise<void> {
  94  |   await page.mouse.click(6, 6);
  95  |   await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  96  | }
  97  | 
  98  | function assertNoErrors(errors: ErrorBucket): void {
  99  |   expect(errors.consoleErrors).toEqual([]);
  100 |   expect(errors.pageErrors).toEqual([]);
  101 | }
  102 | 
  103 | test('founding, first contract, and Prospector XP beats fire once with portraits', async ({ page }, testInfo) => {
  104 |   test.setTimeout(60_000);
  105 |   await seedProfile(page, { agentLevel: 1 });
  106 |   const errors = collectErrors(page);
  107 | 
  108 |   await page.goto('/');
  109 |   await page.getByTestId('start-menu-enter-town').click();
  110 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  111 |   await page.getByTestId('town-name-input').fill('Aurora Bend');
  112 |   await page.getByTestId('town-name-submit').click();
  113 |   await expectBeat(page, 'founding-welcome', 'elder', 'townsfolk-elder');
  114 |   await shot(page, testInfo, 'founding-beat');
  115 |   await dismissBeat(page);
  116 | 
  117 |   await openTownBoard(page);
  118 |   await expectBeat(page, 'first-contract', 'tavernkeeper', 'townsfolk-tavernkeeper');
  119 |   await expect(page.getByTestId('contract-launch-the-claim')).toHaveAttribute('data-story-pointer', 'true');
  120 |   await shot(page, testInfo, 'first-contract-beat');
  121 |   await dismissBeat(page);
  122 |   await expect(page.getByTestId('contract-launch-the-claim')).not.toHaveAttribute('data-story-pointer', 'true');
  123 |   await page.evaluate(() => history.replaceState(null, '', '/?debug&timescale=8&nowaves&nolevel&seed=ss-01-deputy'));
  124 |   await page.getByTestId('contract-launch-the-claim').click();
  125 | 
  126 |   await page.waitForFunction(() => window.__GR_TEST__ && window.__GR_AGENT__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  127 |   const collectedXp = await page.evaluate(() => {
  128 |     window.__GR_TEST__?.setBalance('agent.xpMoteAgeS', -1);
  129 |     const pos = window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment.position;
  130 |     window.__GR_TEST__?.spawnXpMote(pos.x, pos.z, 4);
  131 |     const receipt = window.__GR_AGENT__?.collectXp();
  132 |     return receipt?.outcome.ok === true ? (receipt.outcome.result as { xp?: number } | undefined)?.xp ?? 0 : 0;
  133 |   });
  134 |   expect(collectedXp).toBeGreaterThan(0);
  135 |   await expectBeat(page, 'deputy-hello', 'prospector', 'char-prospector-portrait');
  136 |   await shot(page, testInfo, 'deputy-beat');
  137 |   await dismissBeat(page);
  138 | 
  139 |   await page.reload();
  140 |   await page.waitForFunction(() => window.__GR_STORY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  141 |   await page.evaluate(() => {
  142 |     window.__GR_STORY__?.emit({ type: 'town-named', townName: 'Aurora Bend' });
  143 |     window.__GR_STORY__?.emit({ type: 'board-first-open' });
  144 |     window.__GR_STORY__?.emit({ type: 'xp-collected' });
  145 |   });
  146 |   await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  147 |   assertNoErrors(errors);
  148 | });
  149 | 
  150 | test('Tales setting silences story beats at queue level', async ({ page }) => {
  151 |   await seedProfile(page, { talesEnabled: false });
  152 |   const errors = collectErrors(page);
  153 | 
  154 |   await page.goto('/');
  155 |   await page.getByTestId('start-menu-settings').click();
  156 |   await expect(page.getByTestId('start-menu-tales')).not.toBeChecked();
  157 |   await page.getByTestId('start-menu-enter-town').click();
  158 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  159 |   await page.getByTestId('town-name-input').fill('Silent Bend');
  160 |   await page.getByTestId('town-name-submit').click();
  161 |   await page.waitForTimeout(700);
  162 |   await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  163 |   await page.evaluate(() => window.__GR_STORY__?.emit({ type: 'xp-collected' }));
  164 |   await page.waitForTimeout(700);
  165 |   await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  166 |   assertNoErrors(errors);
  167 | });
  168 | 
  169 | test('pointer glow clears on first interaction', async ({ page }, testInfo) => {
  170 |   test.setTimeout(60_000);
  171 |   await seedProfile(page, { townName: 'Pointer Bend', agentLevel: 1 });
  172 |   const errors = collectErrors(page);
  173 | 
  174 |   await page.goto('/?debug&timescale=4&nowaves&nolevel&seed=ss-01-pointer');
  175 |   await page.waitForFunction(() => window.__GR_STORY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  176 |   await page.evaluate(() => window.__GR_STORY__?.emit({ type: 'xp-collected' }));
  177 |   await expectBeat(page, 'deputy-hello', 'prospector', 'char-prospector-portrait');
  178 |   const chip = page.getByTestId('hud-agent');
  179 |   await expect(chip).toHaveAttribute('data-story-pointer', 'true');
  180 |   await shot(page, testInfo, 'pointer-glow');
  181 |   await chip.click();
  182 |   await expect(chip).not.toHaveAttribute('data-story-pointer', 'true');
  183 |   await expect(page.getByTestId('prospector-panel')).toBeVisible();
  184 |   assertNoErrors(errors);
  185 | });
  186 | 
  187 | test('story card waits until wave banner clears when both fire same tick', async ({ page }, testInfo) => {
  188 |   await seedProfile(page, { townName: 'Banner Bend' });
```