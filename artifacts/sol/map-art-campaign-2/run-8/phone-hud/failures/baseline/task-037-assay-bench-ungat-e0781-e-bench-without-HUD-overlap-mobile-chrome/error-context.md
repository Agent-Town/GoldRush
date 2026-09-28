# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: task-037-assay-bench-ungate.spec.ts >> mobile touch confirm opens and closes the bench without HUD overlap
- Location: e2e/task-037-assay-bench-ungate.spec.ts:202:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - status [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - paragraph [ref=e7]: The Contract
            - button "Begin" [ref=e8] [cursor=pointer]
          - heading "The Claim" [level=2] [ref=e9]
          - paragraph [ref=e10]: The classic river claim.
          - generic [ref=e11]:
            - generic [ref=e12]:
              - paragraph [ref=e13]: Goals
              - list [ref=e14]:
                - listitem [ref=e15]: Survive through wave 10.
            - generic [ref=e16]:
              - paragraph [ref=e17]: Rules
              - list [ref=e18]:
                - listitem [ref=e19]: The river splits the claim around one center ford.
                - listitem [ref=e20]: Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.
      - generic "Wave status":
        - generic:
          - generic: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 00:20
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - generic: Gold
        - strong: "40"
      - region "Active weapon":
        - generic: Weapon
        - strong: Spark Rig
        - button "Prospector permission chip" [ref=e21] [cursor=pointer]:
          - generic [ref=e22]:
            - generic [ref=e23]: the Prospector
            - strong [ref=e24]: L0
            - generic [ref=e25]: suggest-only
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build" [ref=e27]
      - button "Pause the claim" [ref=e28]: catch your breath
      - generic [ref=e29]:
        - text: Swipe to scroll
        - status: Assay Office · debug crafting
    - generic:
      - button [ref=e32]: Rotate
      - button [ref=e33]: Weapon
      - button [ref=e34]: OK
    - region
    - text: None None None
  - generic [ref=e35]:
    - button "▸ Game tuning" [ref=e36] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e37]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  111 |       }),
  112 |     )
  113 |     .toBe(true);
  114 |   await page.keyboard.press('Enter');
  115 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.assayOffices ?? 0)).toBe(1);
  116 |   await page.keyboard.press('Escape');
  117 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.mode ?? true)).toBe(false);
  118 | }
  119 | 
  120 | async function debugPlaceAssayOffice(page: Page): Promise<void> {
  121 |   await page.evaluate(() => {
  122 |     window.__GR_TEST__?.grantGold(120);
  123 |     window.__GR_TEST__?.teleport(0, 9);
  124 |     window.__GR_TEST__?.selectBuildable('assay_office');
  125 |   });
  126 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  127 |   const placed = await page.evaluate(() => window.__GR_TEST__?.confirmBuild());
  128 |   expect(placed, 'confirmBuild() refused: ghost invalid at the requested position').toBe(true);
  129 |   await page.evaluate(() => {
  130 |     window.__GR_TEST__?.setBuildMode(false);
  131 |     window.__GR_TEST__?.teleport(0, 7);
  132 |   });
  133 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.assayOffices ?? 0)).toBe(1);
  134 | }
  135 | 
  136 | function intersects(a: Rect | null, b: Rect | null): boolean {
  137 |   if (!a || !b) return false;
  138 |   return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  139 | }
  140 | 
  141 | async function cleanupPostedPath(page: Page): Promise<void> {
  142 |   const path = await page.getByTestId('assay-pending-path').textContent();
  143 |   if (path) await rm(resolve(process.cwd(), path), { force: true });
  144 | }
  145 | 
  146 | test('debug play builds the Assay Office and posts an order at the bench', async ({ page }, testInfo: TestInfo) => {
  147 |   test.skip(testInfo.project.name !== 'desktop-chrome', 'normal play keyboard path is covered on desktop; mobile touch has its own test');
  148 |   // F-1157-1: this test walks the whole normal-play path, and panGold() alone budgets 20s (:65).
  149 |   // Measured quiet-box (s1157, 12 runs): passes at 26.9/28.4/28.9/29.3/29.6s against the 30s global
  150 |   // cap -- a worst-case margin of 0.4s -- so 2/12 died on the clock with the order already posted,
  151 |   // not on any assertion. The budget is the defect, not the game. 45s leaves room for jitter while
  152 |   // still catching a genuine 2x regression; it weakens no assertion below.
  153 |   test.setTimeout(45_000);
  154 |   const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&nokill&seed=task037-normal');
  155 |   await expect(page.getByTestId('assay-bench')).toBeHidden();
  156 |   await expect(page.getByTestId('assay-office-prompt')).toBeHidden();
  157 | 
  158 |   await panGold(page, 85);
  159 |   await buildAssayOfficeWithUi(page);
  160 |   await walkTo(page, { x: 0, z: 12 }, 0.75);
  161 |   await expect(page.getByTestId('assay-office-prompt')).toBeHidden();
  162 |   await walkTo(page, { x: 0, z: 7 }, 0.35);
  163 |   await expect(page.getByTestId('assay-office-prompt')).toBeVisible();
  164 |   await expect(page.getByTestId('assay-office-prompt')).toContainText('Enter - Assay Office');
  165 | 
  166 |   await page.keyboard.press('Enter');
  167 |   await expect(page.getByTestId('assay-bench')).toBeVisible();
  168 |   await expect(page.getByTestId('assay-office-prompt')).toBeHidden();
  169 |   const orderText = 'Need a field-ready assay sample';
  170 |   await page.getByTestId('assay-text').fill(orderText);
  171 |   await page.getByTestId('assay-profile').fill(`task037_${testInfo.project.name}`);
  172 |   await page.getByTestId('assay-post').click();
  173 |   await expect(page.getByTestId('assay-pending-status')).toHaveText(/Posted|JSON ready/);
  174 |   await expect(page.getByTestId('assay-queue-pending').locator('li').first()).toContainText(orderText);
  175 |   await cleanupPostedPath(page);
  176 | 
  177 |   expect(errors.consoleErrors).toEqual([]);
  178 |   expect(errors.pageErrors).toEqual([]);
  179 | });
  180 | 
  181 | test('prompt hides in build mode and returns after closing the bench', async ({ page }) => {
  182 |   const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&nokill&seed=task037-hidden');
  183 |   await debugPlaceAssayOffice(page);
  184 |   await expect(page.getByTestId('assay-office-prompt')).toBeVisible();
  185 | 
  186 |   await page.evaluate(() => window.__GR_TEST__?.setBuildMode(true));
  187 |   await expect(page.getByTestId('assay-office-prompt')).toBeHidden();
  188 |   await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  189 |   await expect(page.getByTestId('assay-office-prompt')).toBeVisible();
  190 | 
  191 |   await page.keyboard.press('Enter');
  192 |   await expect(page.getByTestId('assay-bench')).toBeVisible();
  193 |   await expect(page.getByTestId('assay-office-prompt')).toBeHidden();
  194 |   await page.getByTestId('assay-close').click();
  195 |   await expect(page.getByTestId('assay-bench')).toBeHidden();
  196 |   await expect(page.getByTestId('assay-office-prompt')).toBeVisible();
  197 | 
  198 |   expect(errors.consoleErrors).toEqual([]);
  199 |   expect(errors.pageErrors).toEqual([]);
  200 | });
  201 | 
  202 | test('mobile touch confirm opens and closes the bench without HUD overlap', async ({ page }, testInfo: TestInfo) => {
  203 |   test.skip(testInfo.project.name !== 'mobile-chrome', 'mobile prompt layout is only meaningful on the mobile project');
  204 |   const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&nokill&seed=task037-mobile');
  205 |   await debugPlaceAssayOffice(page);
  206 | 
  207 |   const prompt = page.getByTestId('assay-office-prompt');
  208 |   await expect(prompt).toBeVisible();
  209 |   await expect(prompt.locator('.assay-office-prompt__key')).toBeHidden();
  210 |   const promptBox = await prompt.boundingBox();
> 211 |   expect(intersects(promptBox, await page.locator('#touch-controls').boundingBox())).toBe(false);
      |                                                                                      ^ Error: expect(received).toBe(expected) // Object.is equality
  212 |   expect(intersects(promptBox, await page.getByTestId('hud-build-panel').boundingBox())).toBe(false);
  213 |   expect(intersects(promptBox, await page.getByTestId('hud-xp').boundingBox())).toBe(false);
  214 | 
  215 |   await page.locator('#confirm-button').tap();
  216 |   await expect(page.getByTestId('assay-bench')).toBeVisible();
  217 |   await page.getByTestId('assay-close').tap();
  218 |   await expect(page.getByTestId('assay-bench')).toBeHidden();
  219 | 
  220 |   expect(errors.consoleErrors).toEqual([]);
  221 |   expect(errors.pageErrors).toEqual([]);
  222 | });
  223 | 
```