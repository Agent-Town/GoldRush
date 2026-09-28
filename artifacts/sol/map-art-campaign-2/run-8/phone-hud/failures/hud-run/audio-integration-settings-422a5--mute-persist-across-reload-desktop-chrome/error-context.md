# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: audio-integration.spec.ts >> settings volume and mute persist across reload
- Location: e2e/audio-integration.spec.ts:80:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('start-menu-settings')

```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - region "Gold Rush start menu" [ref=e4]:
    - generic [ref=e6]:
      - heading "GOLD RUSH" [level=1] [ref=e8]
      - paragraph [ref=e9]: an Agent Town tale
      - paragraph [ref=e10]: ledger local only
      - region "Create profile" [ref=e11]:
        - paragraph [ref=e12]: Claim Ledger
        - heading "Who's prospecting?" [level=2] [ref=e13]
        - paragraph [ref=e14]: Name the claim-holder before the first claim.
        - generic [ref=e15]:
          - textbox "Claim-holder name" [ref=e16]
          - button "Open ledger" [ref=e17]
```

# Test source

```ts
  1   | import { mkdir } from 'node:fs/promises';
  2   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  3   | import { PROFILE_KEY } from '../src/game/ProfileStorage';
  4   | import { AUDIO_MUTED_STORAGE_KEY, AUDIO_VOLUME_STORAGE_KEY } from '../src/audio/settings';
  5   | 
  6   | const SHOT_DIR = 'artifacts/audio-integration';
  7   | 
  8   | type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
  9   | type HarvestNode = {
  10  |   active: boolean;
  11  |   position: { x: number; z: number };
  12  | };
  13  | 
  14  | function collectErrors(page: Page): ErrorBucket {
  15  |   const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  16  |   page.on('console', (message) => {
  17  |     if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  18  |   });
  19  |   page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  20  |   return bucket;
  21  | }
  22  | 
  23  | async function clearStorage(page: Page): Promise<void> {
  24  |   await page.addInitScript(() => {
  25  |     localStorage.clear();
  26  |     sessionStorage.clear();
  27  |   });
  28  | }
  29  | 
  30  | async function openGame(page: Page, query = '?debug&timescale=6&nowaves&nolevel&seed=audio'): Promise<ErrorBucket> {
  31  |   const errors = collectErrors(page);
  32  |   await page.goto(`/${query}`, { waitUntil: 'domcontentloaded' });
  33  |   await expect(page.getByTestId('hud-vitals')).toBeVisible();
  34  |   return errors;
  35  | }
  36  | 
  37  | async function unlockAudio(page: Page): Promise<void> {
  38  |   await page.mouse.click(24, 24);
  39  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked ?? false)).toBe(true);
  40  | }
  41  | 
  42  | async function nearestActiveNode(page: Page): Promise<HarvestNode> {
  43  |   const nodes = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.filter((node) => node.active) ?? []);
  44  |   expect(nodes.length).toBeGreaterThan(0);
  45  |   const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 });
  46  |   nodes.sort((a, b) => distanceSq(hero, a.position) - distanceSq(hero, b.position));
  47  |   return nodes[0]!;
  48  | }
  49  | 
  50  | function distanceSq(a: { x: number; z: number }, b: { x: number; z: number }): number {
  51  |   const dx = a.x - b.x;
  52  |   const dz = a.z - b.z;
  53  |   return dx * dx + dz * dz;
  54  | }
  55  | 
  56  | function assertNoErrors(errors: ErrorBucket): void {
  57  |   expect(errors.consoleErrors).toEqual([]);
  58  |   expect(errors.pageErrors).toEqual([]);
  59  | }
  60  | 
  61  | test('boot stays audio-locked until gesture, then seeded panning requests sound', async ({ page }) => {
  62  |   await clearStorage(page);
  63  |   const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&seed=audio-pan');
  64  | 
  65  |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked)).toBe(false);
  66  |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.started)).toBe(0);
  67  |   assertNoErrors(errors);
  68  | 
  69  |   await unlockAudio(page);
  70  |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.requests ?? 0);
  71  |   const target = await nearestActiveNode(page);
  72  |   await page.evaluate((position) => window.__GR_TEST__?.teleport(position.x, position.z), target.position);
  73  | 
  74  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.requests ?? 0)).toBeGreaterThan(before);
  75  |   const lastRequested = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.lastRequested);
  76  |   expect(['pan-swish', 'gold-chime']).toContain(lastRequested);
  77  |   assertNoErrors(errors);
  78  | });
  79  | 
  80  | test('settings volume and mute persist across reload', async ({ page }, testInfo: TestInfo) => {
  81  |   const errors = collectErrors(page);
  82  |   await page.goto('/');
  83  |   await page.evaluate(() => {
  84  |     localStorage.clear();
  85  |     sessionStorage.clear();
  86  |   });
  87  |   await page.reload();
  88  | 
> 89  |   await page.getByTestId('start-menu-settings').click();
      |                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  90  |   await mkdir(SHOT_DIR, { recursive: true });
  91  |   await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-settings.png`, fullPage: true });
  92  | 
  93  |   await page.getByTestId('start-menu-volume').evaluate((element) => {
  94  |     const input = element as HTMLInputElement;
  95  |     input.value = '25';
  96  |     input.dispatchEvent(new Event('input', { bubbles: true }));
  97  |   });
  98  |   await page.getByTestId('start-menu-mute').check();
  99  |   await expect(page.getByTestId('start-menu-volume-value')).toHaveText('25%');
  100 | 
  101 |   await expect(
  102 |     page.evaluate(
  103 |       ({ mutedKey, volumeKey }) => ({
  104 |         muted: localStorage.getItem(mutedKey),
  105 |         volume: localStorage.getItem(volumeKey),
  106 |       }),
  107 |       { mutedKey: AUDIO_MUTED_STORAGE_KEY, volumeKey: AUDIO_VOLUME_STORAGE_KEY },
  108 |     ),
  109 |   ).resolves.toEqual({ muted: '1', volume: '0.25' });
  110 | 
  111 |   await page.reload();
  112 |   await page.getByTestId('start-menu-settings').click();
  113 |   await expect(page.getByTestId('start-menu-volume')).toHaveValue('25');
  114 |   await expect(page.getByTestId('start-menu-mute')).toBeChecked();
  115 |   assertNoErrors(errors);
  116 | });
  117 | 
  118 | test('legacy audio preferences migrate into profile storage', async ({ page }) => {
  119 |   const errors = collectErrors(page);
  120 |   await page.addInitScript(
  121 |     ({ profileKey, mutedKey, volumeKey }) => {
  122 |       localStorage.clear();
  123 |       sessionStorage.clear();
  124 |       localStorage.setItem(
  125 |         profileKey,
  126 |         JSON.stringify({
  127 |           version: 2,
  128 |           activeId: 'robin',
  129 |           profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  130 |         }),
  131 |       );
  132 |       localStorage.setItem(volumeKey, '0.35');
  133 |       localStorage.setItem(mutedKey, '1');
  134 |     },
  135 |     { profileKey: PROFILE_KEY, mutedKey: AUDIO_MUTED_STORAGE_KEY, volumeKey: AUDIO_VOLUME_STORAGE_KEY },
  136 |   );
  137 | 
  138 |   await page.goto('/');
  139 |   await page.getByTestId('start-menu-settings').click();
  140 | 
  141 |   await expect(page.getByTestId('start-menu-volume')).toHaveValue('35');
  142 |   await expect(page.getByTestId('start-menu-mute')).toBeChecked();
  143 |   await expect(
  144 |     page.evaluate(
  145 |       ({ profileKey, mutedKey, volumeKey }) => ({
  146 |         muted: localStorage.getItem(`${profileKey}.robin.${mutedKey}`),
  147 |         volume: localStorage.getItem(`${profileKey}.robin.${volumeKey}`),
  148 |       }),
  149 |       { profileKey: PROFILE_KEY, mutedKey: AUDIO_MUTED_STORAGE_KEY, volumeKey: AUDIO_VOLUME_STORAGE_KEY },
  150 |     ),
  151 |   ).resolves.toEqual({ muted: '1', volume: '0.35' });
  152 |   assertNoErrors(errors);
  153 | });
  154 | 
  155 | test('first-use bursts respect the per-sound pool cap', async ({ page }) => {
  156 |   await clearStorage(page);
  157 |   const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=audio-pool');
  158 |   await page.keyboard.press('p');
  159 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked ?? false)).toBe(true);
  160 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false)).toBe(true);
  161 | 
  162 |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.started ?? 0);
  163 |   await page.evaluate(() => {
  164 |     for (let i = 0; i < 8; i += 1) window.__GR_TEST__?.testAudio('invalid');
  165 |   });
  166 | 
  167 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.started ?? 0)).toBeGreaterThan(before);
  168 |   const started = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.started ?? 0);
  169 |   expect(started - before).toBeLessThanOrEqual(4);
  170 |   assertNoErrors(errors);
  171 | });
  172 | 
  173 | test('missing audio names are silent no-ops', async ({ page }) => {
  174 |   await clearStorage(page);
  175 |   const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=audio-missing');
  176 |   await unlockAudio(page);
  177 | 
  178 |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.missing ?? 0);
  179 |   await page.evaluate(() => window.__GR_TEST__?.testAudio('__missing_audio__'));
  180 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.missing ?? 0)).toBe(before + 1);
  181 |   assertNoErrors(errors);
  182 | });
  183 | 
```