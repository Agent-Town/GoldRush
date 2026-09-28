# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: audio-integration.spec.ts >> settings volume and mute persist across reload
- Location: e2e/audio-integration.spec.ts:80:1

# Error details

```
Error: expect(received).toMatchObject(expected)

Matcher error: received value must be a non-null object

Received has value: undefined

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
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
      - navigation "Claim actions" [ref=e11]:
        - button "Enter Town" [ref=e12] [cursor=pointer]
        - button "Claim Ledger" [ref=e13] [cursor=pointer]
        - button "Profile" [ref=e14] [cursor=pointer]
        - button "Music on" [pressed] [ref=e15] [cursor=pointer]
        - button "Settings" [ref=e16] [cursor=pointer]
      - region "Settings" [ref=e17]:
        - generic [ref=e18]:
          - heading "Settings" [level=2] [ref=e19]
          - button "Back" [active] [ref=e20] [cursor=pointer]
        - generic [ref=e21]:
          - generic [ref=e22]: Volume
          - slider "Volume" [ref=e23]: "25"
          - status [ref=e24]: 25%
        - generic [ref=e25]:
          - generic [ref=e26]: Music Volume
          - slider "Music Volume" [ref=e27]: "35"
          - status [ref=e28]: 35%
        - generic [ref=e29]:
          - generic [ref=e30]: Music
          - checkbox "Music" [checked] [ref=e31]
        - generic [ref=e32]:
          - generic [ref=e33]: Mute
          - checkbox "Mute" [checked] [ref=e34]
        - generic [ref=e35]:
          - generic [ref=e36]: Tales
          - checkbox "Tales" [checked] [ref=e37]
        - generic [ref=e38]:
          - generic [ref=e39]: Performance
          - combobox "Performance" [ref=e40]:
            - option "Auto" [selected]
            - option "Full"
            - option "Balanced"
            - option "Lite"
        - generic [ref=e41]:
          - generic [ref=e42]: Warm every map
          - checkbox "Warm every map" [ref=e43]
        - paragraph [ref=e44]: Prepare more maps while idle, within this visit's download allowance. Uses extra data; Save Data and Lite still apply.
        - generic [ref=e45]:
          - generic [ref=e46]: Share anonymous run stats
          - checkbox "Share anonymous run stats" [checked] [ref=e47]
        - paragraph [ref=e48]: Anonymous gameplay statistics, no personal data, opt-out in Settings.
```

# Test source

```ts
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
  82  |   // Settings belongs to the returning-player menu. Preserve preferences on reload.
  83  |   await page.addInitScript((profileKey) => {
  84  |     if (!localStorage.getItem(profileKey)) localStorage.setItem(profileKey, JSON.stringify({
  85  |       version: 2,
  86  |       activeId: 'audio-persistence',
  87  |       profiles: [{ id: 'audio-persistence', name: 'Audio Persistence', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  88  |     }));
  89  |   }, PROFILE_KEY);
  90  |   await page.goto('/');
  91  |
  92  |   await page.getByTestId('start-menu-settings').click();
  93  |   await mkdir(SHOT_DIR, { recursive: true });
  94  |   await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-settings.png`, fullPage: true });
  95  |
  96  |   await page.getByTestId('start-menu-volume').evaluate((element) => {
  97  |     const input = element as HTMLInputElement;
  98  |     input.value = '25';
  99  |     input.dispatchEvent(new Event('input', { bubbles: true }));
  100 |   });
  101 |   await page.getByTestId('start-menu-mute').check();
  102 |   await expect(page.getByTestId('start-menu-volume-value')).toHaveText('25%');
  103 |
  104 |   await expect(
  105 |     page.evaluate(
  106 |       ({ mutedKey, volumeKey }) => ({
  107 |         muted: localStorage.getItem(mutedKey),
  108 |         volume: localStorage.getItem(volumeKey),
  109 |       }),
  110 |       { mutedKey: AUDIO_MUTED_STORAGE_KEY, volumeKey: AUDIO_VOLUME_STORAGE_KEY },
  111 |     ),
  112 |   ).resolves.toEqual({ muted: '1', volume: '0.25' });
  113 |
  114 |   await page.reload();
  115 |   await page.getByTestId('start-menu-settings').click();
  116 |   await expect(page.getByTestId('start-menu-volume')).toHaveValue('25');
  117 |   await expect(page.getByTestId('start-menu-mute')).toBeChecked();
> 118 |   await expect.poll(() => page.evaluate(() => window.__GR_AUDIO_DIAGNOSTICS__)).toMatchObject({ volume: 0.25, muted: true });
      |                                                                                 ^ Error: expect(received).toMatchObject(expected)
  119 |   assertNoErrors(errors);
  120 | });
  121 |
  122 | test('legacy audio preferences migrate into profile storage', async ({ page }) => {
  123 |   const errors = collectErrors(page);
  124 |   await page.addInitScript(
  125 |     ({ profileKey, mutedKey, volumeKey }) => {
  126 |       localStorage.clear();
  127 |       sessionStorage.clear();
  128 |       localStorage.setItem(
  129 |         profileKey,
  130 |         JSON.stringify({
  131 |           version: 2,
  132 |           activeId: 'robin',
  133 |           profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  134 |         }),
  135 |       );
  136 |       localStorage.setItem(volumeKey, '0.35');
  137 |       localStorage.setItem(mutedKey, '1');
  138 |     },
  139 |     { profileKey: PROFILE_KEY, mutedKey: AUDIO_MUTED_STORAGE_KEY, volumeKey: AUDIO_VOLUME_STORAGE_KEY },
  140 |   );
  141 |
  142 |   await page.goto('/');
  143 |   await page.getByTestId('start-menu-settings').click();
  144 |
  145 |   await expect(page.getByTestId('start-menu-volume')).toHaveValue('35');
  146 |   await expect(page.getByTestId('start-menu-mute')).toBeChecked();
  147 |   await expect(
  148 |     page.evaluate(
  149 |       ({ profileKey, mutedKey, volumeKey }) => ({
  150 |         muted: localStorage.getItem(`${profileKey}.robin.${mutedKey}`),
  151 |         volume: localStorage.getItem(`${profileKey}.robin.${volumeKey}`),
  152 |       }),
  153 |       { profileKey: PROFILE_KEY, mutedKey: AUDIO_MUTED_STORAGE_KEY, volumeKey: AUDIO_VOLUME_STORAGE_KEY },
  154 |     ),
  155 |   ).resolves.toEqual({ muted: '1', volume: '0.35' });
  156 |   assertNoErrors(errors);
  157 | });
  158 |
  159 | test('first-use bursts respect the per-sound pool cap', async ({ page }) => {
  160 |   await clearStorage(page);
  161 |   const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=audio-pool');
  162 |   await page.keyboard.press('p');
  163 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.unlocked ?? false)).toBe(true);
  164 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false)).toBe(true);
  165 |
  166 |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.started ?? 0);
  167 |   await page.evaluate(() => {
  168 |     for (let i = 0; i < 8; i += 1) window.__GR_TEST__?.testAudio('invalid');
  169 |   });
  170 |
  171 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.started ?? 0)).toBeGreaterThan(before);
  172 |   const started = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.started ?? 0);
  173 |   expect(started - before).toBeLessThanOrEqual(4);
  174 |   assertNoErrors(errors);
  175 | });
  176 |
  177 | test('missing audio names are silent no-ops', async ({ page }) => {
  178 |   await clearStorage(page);
  179 |   const errors = await openGame(page, '?debug&timescale=3&nowaves&nolevel&seed=audio-missing');
  180 |   await unlockAudio(page);
  181 |
  182 |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.missing ?? 0);
  183 |   await page.evaluate(() => window.__GR_TEST__?.testAudio('__missing_audio__'));
  184 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.audio.missing ?? 0)).toBe(before + 1);
  185 |   assertNoErrors(errors);
  186 | });
  187 |
```
