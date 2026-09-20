# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m2-01-build-menu.spec.ts >> palisade footprint rejects overlap while allowing edge-touch chaining
- Location: e2e/m2-01-build-menu.spec.ts:178:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 2

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
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
          - strong: 00:19
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - generic: Gold
        - strong: "30"
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
        - button "Build - Close" [pressed] [ref=e27]
      - button "Pause the claim" [ref=e28]: P - catch your breath
    - generic:
      - status:
        - generic:
          - paragraph: Tavernkeeper
          - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
          - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
    - region
    - text: None None None
  - generic [ref=e29]:
    - button "▸ Game tuning" [ref=e30] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e31]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  116 |   if (testInfo.project.name === 'desktop-chrome') await saveShot(page, 'desktop-build-menu-palisade');
  117 |   await testInfo.attach('m2-01-desktop-menu-open', {
  118 |     body: await page.screenshot({ fullPage: true }),
  119 |     contentType: 'image/png',
  120 |   });
  121 |   await selectFromMenu(page, 'palisade');
  122 |   await placeSelected(page, 'palisade');
  123 | 
  124 |   expect(await gold(page)).toBe(10);
  125 |   const spent = await page.evaluate(() =>
  126 |     (window.__GR_TEST__?.economyLog() ?? []).filter((event) => {
  127 |       const entry = event as { type?: string };
  128 |       return entry.type === 'gold_spent';
  129 |     }),
  130 |   );
  131 |   expect(spent.at(-1)).toMatchObject({ type: 'gold_spent', sink: 'build_palisade', amount: 10 });
  132 |   expect(errors.consoleErrors).toEqual([]);
  133 |   expect(errors.pageErrors).toEqual([]);
  134 | });
  135 | 
  136 | test('build menu shows six ready icons and Balance-backed blurbs', async ({ page }, testInfo: TestInfo) => {
  137 |   const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m2-01-icons-blurbs');
  138 |   await grantGold(page, 1000);
  139 | 
  140 |   await openBuildMenu(page);
  141 |   const blurb = page.getByTestId('hud-build-blurb');
  142 |   await expect(blurb).toContainText(`radius ${Balance.beacon.range}wu`);
  143 | 
  144 |   const expectedSlugs: Record<(typeof menuBuildables)[number], string> = {
  145 |     sentry_beacon: 'sentry-beacon',
  146 |     palisade: 'palisade',
  147 |     sluice: 'sluice-works',
  148 |     stockpile: 'stockpile-yard',
  149 |     turret: 'signal-turret',
  150 |     assay_office: 'claim-office',
  151 |   };
  152 |   for (const id of menuBuildables) {
  153 |     const tile = page.getByTestId(`hud-build-tile-${id}`);
  154 |     await expect(tile).toHaveAttribute('data-icon-slug', expectedSlugs[id]);
  155 |     await expect(tile).toHaveAttribute('data-asset-state', 'ready');
  156 |     await expect(tile.locator('.hud-build-tile__icon')).toHaveCSS('display', 'block');
  157 |   }
  158 | 
  159 |   await page.getByTestId('hud-build-tile-sluice').hover();
  160 |   await expect(blurb).toContainText(`${Balance.sluice.goldPerCycle}g per cycle`);
  161 |   await expect(blurb).toContainText(`T1: ${Balance.sluice.goldPerCycle}g every ${Balance.sluice.cycleSeconds}s`);
  162 | 
  163 |   await page.mouse.move(4, 4);
  164 |   await page.keyboard.press('Digit5');
  165 |   await expect.poll(() => selectedBuildable(page)).toBe('turret');
  166 |   await expect(blurb).toContainText(`${Balance.turret.range}wu range`);
  167 |   await expect(blurb).toContainText(`T1: ${Math.round(Balance.turret.damage)} damage`);
  168 | 
  169 |   await page.keyboard.press('Digit6');
  170 |   await expect.poll(() => selectedBuildable(page)).toBe('assay_office');
  171 |   await expect(blurb).toContainText('One per claim');
  172 |   if (testInfo.project.name === 'desktop-chrome') await saveShot(page, 'desktop-build-menu-icons-blurb');
  173 | 
  174 |   expect(errors.consoleErrors).toEqual([]);
  175 |   expect(errors.pageErrors).toEqual([]);
  176 | });
  177 | 
  178 | test('palisade footprint rejects overlap while allowing edge-touch chaining', async ({ page }) => {
  179 |   const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m2-01-palisade-footprint');
  180 |   await grantGold(page, 50);
  181 | 
  182 |   await placeBuildableAt(page, 'palisade', 0, 9);
  183 | 
  184 |   await teleport(page, 0, 12);
  185 |   await page.evaluate(() => window.__GR_TEST__?.selectBuildable('palisade'));
  186 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? true)).toBe(false);
  187 |   const trace = await page.evaluate(async () => {
  188 |     const sample = (label: string) => ({
  189 |       label,
  190 |       frame: window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0,
  191 |       tick: window.__THREE_GAME_DIAGNOSTICS__?.simulation.tick ?? 0,
  192 |       build: window.__THREE_GAME_DIAGNOSTICS__?.build,
  193 |       confirm: window.__GR_TEST__?.confirmBuildDiagnostics(),
  194 |       gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0,
  195 |     });
  196 |     const waitPast = (tick: number) => new Promise<void>((resolve) => {
  197 |       const poll = () => {
  198 |         if ((window.__THREE_GAME_DIAGNOSTICS__?.simulation.tick ?? 0) > tick) resolve();
  199 |         else requestAnimationFrame(poll);
  200 |       };
  201 |       requestAnimationFrame(poll);
  202 |     });
  203 |     const rejectedAt = window.__THREE_GAME_DIAGNOSTICS__?.simulation.tick ?? 0;
  204 |     window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
  205 |     window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
  206 |     window.__GR_TEST__?.teleport(0, 14);
  207 |     await waitPast(rejectedAt);
  208 |     const samples = [sample('rejected-consumed-no-release-sample')];
  209 |     window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
  210 |     window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
  211 |     const ignoredAt = window.__THREE_GAME_DIAGNOSTICS__?.simulation.tick ?? 0;
  212 |     await waitPast(ignoredAt + 1);
  213 |     samples.push(sample('consecutive-sample-enter-ignored'));
  214 |     return samples;
  215 |   });
> 216 |   await expect.poll(() => buildableCount(page, 'palisade')).toBe(1);
      |                                                             ^ Error: expect(received).toBe(expected) // Object.is equality
  217 |   expect(await gold(page)).toBe(40);
  218 |   fs.mkdirSync(path.resolve('artifacts/m2-palisade-placement-diagnosis'), { recursive: true });
  219 |   fs.writeFileSync(
  220 |     path.resolve(`artifacts/m2-palisade-placement-diagnosis/controlled-${test.info().project.name}.json`),
  221 |     `${JSON.stringify(trace, null, 2)}\n`,
  222 |   );
  223 | 
  224 |   await placeSelected(page, 'palisade');
  225 |   expect(await buildableCount(page, 'palisade')).toBe(2);
  226 |   expect(await gold(page)).toBe(30);
  227 |   expect(errors.consoleErrors).toEqual([]);
  228 |   expect(errors.pageErrors).toEqual([]);
  229 | });
  230 | 
  231 | test('beacon cost curve stays intact through the menu', async ({ page }) => {
  232 |   const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m2-01-beacon-cost');
  233 |   await grantGold(page, 80);
  234 | 
  235 |   await openBuildMenu(page);
  236 |   await selectFromMenu(page, 'sentry_beacon');
  237 |   await placeSelected(page, 'sentry_beacon');
  238 |   expect(await gold(page)).toBe(55);
  239 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.nextCost)).toBe(35);
  240 | 
  241 |   await closeBuild(page);
  242 |   await teleport(page, 3, 12);
  243 |   await openBuildMenu(page);
  244 |   await selectFromMenu(page, 'sentry_beacon');
  245 |   await placeSelected(page, 'sentry_beacon');
  246 | 
  247 |   expect(await gold(page)).toBe(20);
  248 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.nextCost)).toBe(45);
  249 |   expect(errors.consoleErrors).toEqual([]);
  250 |   expect(errors.pageErrors).toEqual([]);
  251 | });
  252 | 
  253 | test('single enemy slides around a finite palisade line without passing through', async ({ page }, testInfo: TestInfo) => {
  254 |   const errors = await openGame(page, '?debug&timescale=4&nowaves&nokill&seed=m2-01-wall');
  255 |   await grantGold(page, 100);
  256 | 
  257 |   for (const x of [-2, -1, 0, 1, 2]) {
  258 |     await placeBuildableAt(page, 'palisade', x, 9);
  259 |   }
  260 |   await testInfo.attach('m2-01-palisade-line', {
  261 |     body: await page.screenshot({ fullPage: true }),
  262 |     contentType: 'image/png',
  263 |   });
  264 | 
  265 |   await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  266 |   await teleport(page, 0, 12);
  267 |   await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 6));
  268 |   await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? 0)).toBe(1);
  269 | 
  270 |   await page.evaluate(() => {
  271 |     const start = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0;
  272 |     window.__M2_01_TRACKER__ = {
  273 |       crossedThrough: false,
  274 |       reached: false,
  275 |       done: false,
  276 |       samples: 0,
  277 |       last: null,
  278 |     };
  279 | 
  280 |     const tick = () => {
  281 |       const tracker = window.__M2_01_TRACKER__!;
  282 |       const now = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? start;
  283 |       const enemy = window.__GR_TEST__?.enemyPositions()[0];
  284 |       if (enemy) {
  285 |         const last = tracker.last;
  286 |         if (last && last.z <= 10.5 && enemy.z > 10.5 && Math.abs(enemy.x) <= 3.18) {
  287 |           tracker.crossedThrough = true;
  288 |         }
  289 |         const dx = enemy.x;
  290 |         const dz = enemy.z - 12;
  291 |         tracker.reached ||= dx * dx + dz * dz <= 1.25 * 1.25;
  292 |         tracker.last = { x: enemy.x, z: enemy.z };
  293 |         tracker.samples += 1;
  294 |       }
  295 |       if (!tracker.reached && now - start < 20) requestAnimationFrame(tick);
  296 |       else tracker.done = true;
  297 |     };
  298 |     requestAnimationFrame(tick);
  299 |   });
  300 | 
  301 |   await expect.poll(() => page.evaluate(() => window.__M2_01_TRACKER__?.done ?? false), { timeout: 8_000 }).toBe(true);
  302 |   const tracker = await page.evaluate(() => window.__M2_01_TRACKER__);
  303 |   expect(tracker?.samples).toBeGreaterThan(0);
  304 |   expect(tracker?.crossedThrough).toBe(false);
  305 |   expect(tracker?.reached).toBe(true);
  306 |   expect(errors.consoleErrors).toEqual([]);
  307 |   expect(errors.pageErrors).toEqual([]);
  308 | });
  309 | 
  310 | test('390px build menu is visible, tappable, and clear of HUD controls', async ({ page }, testInfo: TestInfo) => {
  311 |   await page.setViewportSize({ width: 390, height: 844 });
  312 |   const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m2-01-mobile');
  313 |   await grantGold(page, 1000);
  314 | 
  315 |   await page.getByTestId('hud-build').click();
  316 |   const menu = page.getByTestId('hud-build-menu');
```