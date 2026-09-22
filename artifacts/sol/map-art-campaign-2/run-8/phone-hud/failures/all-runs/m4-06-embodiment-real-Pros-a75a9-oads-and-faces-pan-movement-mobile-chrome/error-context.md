# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m4-06-embodiment.spec.ts >> real Prospector sprite loads and faces pan movement
- Location: e2e/m4-06-embodiment.spec.ts:298:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 8
Received: 1
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
        - strong: 00:03
      - generic:
        - generic: Wave
        - strong: "0"
    - region "Gold pouch":
      - strong: "0"
    - region "Active weapon":
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
    - button "Pause the claim" [ref=e28]: catch your breathⅡ
    - generic: Swipe to scroll
  - generic:
    - button [ref=e31]: Rotate
    - button [ref=e32]: Weapon
    - button [ref=e33]: OK
  - region
```

# Test source

```ts
  205 | test('Prospector floats above terrain while following hero probe points', async ({ page }) => {
  206 |   const errors = await openGame(page, '?debug&nowaves&nolevel&seed=prospector-clearance');
  207 |   await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  208 |   const probes = [
  209 |     { x: 0, z: 12 },
  210 |     { x: -5, z: 18 },
  211 |     { x: 5, z: 6.5 },
  212 |     { x: 5, z: 5.5 },
  213 |   ];
  214 | 
  215 |   for (const probe of probes) {
  216 |     await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x, z), probe);
  217 |     await expect
  218 |       .poll(
  219 |         () =>
  220 |           page.evaluate(() => {
  221 |             const hero = window.__THREE_GAME_DIAGNOSTICS__!.heroPos;
  222 |             const body = window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment.position;
  223 |             return Math.hypot(body.x - hero.x, body.z - hero.z);
  224 |           }),
  225 |         { timeout: 8_000 },
  226 |       )
  227 |       .toBeLessThan(3.15);
  228 |     const snap = await companion(page);
  229 |     expect(snap.position.y).toBeGreaterThanOrEqual(snap.terrainY + minProspectorClearance());
  230 |     expect(snap.clearance).toBeGreaterThanOrEqual(minProspectorClearance());
  231 |     expect(terrainZone(snap.position)).not.toBe('river');
  232 |   }
  233 | 
  234 |   expect(errors.consoleErrors).toEqual([]);
  235 |   expect(errors.pageErrors).toEqual([]);
  236 | });
  237 | 
  238 | test('normal play Prospector gathers XP motes when permission allows', async ({ page }, testInfo) => {
  239 |   await setAgentLevel(page, 1);
  240 |   const errors = await openGame(page, '?stress=2&timescale=10&nolevel&seed=prospector-normal-xp');
  241 |   await waitForProspectorSprite(page);
  242 | 
  243 |   await expect
  244 |     .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.motesCollected ?? 0), {
  245 |       timeout: 18_000,
  246 |     })
  247 |     .toBeGreaterThan(0);
  248 |   await expect(page.getByTestId('hud-agent-feed')).toContainText('Gather');
  249 |   const snap = await companion(page);
  250 |   expect(snap.lastLine).toMatch(/motes|sweep|spark/);
  251 | 
  252 |   await savePresenceShot(page, testInfo, 'xp-gather');
  253 |   expect(errors.consoleErrors).toEqual([]);
  254 |   expect(errors.pageErrors).toEqual([]);
  255 | });
  256 | 
  257 | test('Prospector defers XP gathering while a higher-priority receipt is active', async ({ page }) => {
  258 |   await setAgentLevel(page, 2);
  259 |   const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&seed=prospector-xp-priority');
  260 |   await page.waitForFunction(() => Boolean(window.__GR_AGENT__));
  261 |   await page.evaluate(() => {
  262 |     window.__GR_TEST__?.setBalance('agent.xpMoteAgeS', 0.05);
  263 |     window.__GR_TEST__?.setBalance('enemy.speed', 0);
  264 |   });
  265 | 
  266 |   const route = await page.evaluate(() => {
  267 |     const start = window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment.position;
  268 |     const nodes = window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.filter((node) => node.active);
  269 |     return (
  270 |       nodes
  271 |         .map((node) => ({
  272 |           id: node.id,
  273 |           position: node.position,
  274 |           distance: Math.hypot(node.position.x - start.x, node.position.z - start.z),
  275 |         }))
  276 |         .sort((a, b) => b.distance - a.distance)[0] ?? null
  277 |     );
  278 |   });
  279 |   expect(route).toBeTruthy();
  280 |   const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), route!.id);
  281 |   expect((receipt as { tool?: string } | undefined)?.tool).toBe('et.goldrush.pan_at');
  282 |   await expect.poll(() => companion(page).then((snap) => snap.moving), { timeout: 2_000 }).toBe(true);
  283 | 
  284 |   await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-8, 12))).resolves.toBe(true);
  285 |   await expect
  286 |     .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.motesSpawned ?? 0), { timeout: 8_000 })
  287 |     .toBeGreaterThan(0);
  288 |   await page.waitForTimeout(1_200);
  289 | 
  290 |   const snap = await companion(page);
  291 |   expect(snap.lastReceiptTool).toBe('et.goldrush.pan_at');
  292 |   expect(distance(snap.target, route!.position)).toBeLessThan(0.01);
  293 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.motesCollected ?? 0)).toBe(0);
  294 |   expect(errors.consoleErrors).toEqual([]);
  295 |   expect(errors.pageErrors).toEqual([]);
  296 | });
  297 | 
  298 | test('real Prospector sprite loads and faces pan movement', async ({ page }, testInfo) => {
  299 |   const errors = collectErrors(page);
  300 |   await page.goto('/?nowaves&nolevel&seed=m4-07-plain-sprite');
  301 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  302 | 
  303 |   const idle = await waitForProspectorSprite(page);
  304 |   expect(['idle', 'walk']).toContain(idle.clip);
> 305 |   expect(idle.fps).toBe(8);
      |                    ^ Error: expect(received).toBe(expected) // Object.is equality
  306 |   expect(idle.frameKey).not.toContain('createProspectorTexture');
  307 |   await saveM407Shot(page, testInfo, 'idle');
  308 | 
  309 |   await page.evaluate((agentLevel) => {
  310 |     localStorage.setItem(
  311 |       'gr.meta.v1',
  312 |       JSON.stringify({
  313 |         version: 1,
  314 |         tracks: { territory: 0, science: 0, hero: 0, agent: agentLevel },
  315 |       }),
  316 |     );
  317 |   }, 2);
  318 |   await page.goto('/?debug&timescale=4&nowaves&nolevel&seed=m4-07-drive-sprite');
  319 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  320 |   await page.waitForFunction(() => Boolean(window.__GR_AGENT__));
  321 |   await hideDebugGui(page);
  322 |   await waitForProspectorSprite(page);
  323 | 
  324 |   const routes = await page.evaluate(() => {
  325 |     const start = window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment.position;
  326 |     const nodes = window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.filter((node) => node.active);
  327 |     return nodes
  328 |       .map((node) => {
  329 |         const dx = node.position.x - start.x;
  330 |         const dz = node.position.z - start.z;
  331 |         return {
  332 |           id: node.id,
  333 |           position: node.position,
  334 |           distance: Math.hypot(dx, dz),
  335 |           dx,
  336 |           dz,
  337 |         };
  338 |       })
  339 |       .sort((a, b) => b.distance - a.distance);
  340 |   });
  341 |   const route = routes.find((node) => node.distance > 1 && expectedDirection(node.dx, node.dz) !== 's') ?? null;
  342 |   if (!route) throw new Error('No active pan node can exercise non-south Prospector facing.');
  343 |   const direction = expectedDirection(route.dx, route.dz);
  344 | 
  345 |   const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), route.id);
  346 |   expect((receipt as { tool?: string } | undefined)?.tool).toBe('et.goldrush.pan_at');
  347 |   await page.waitForFunction(
  348 |     (direction) => {
  349 |       const sprite = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent'];
  350 |       const body = window.__THREE_GAME_DIAGNOSTICS__?.agent.embodiment;
  351 |       return (
  352 |         body?.moving === true &&
  353 |         sprite?.loaded === true &&
  354 |         sprite.clip === 'walk' &&
  355 |         sprite.direction === direction &&
  356 |         (sprite.sourceFrameKey ?? sprite.frameKey).startsWith('char-prospector-sheet-hover8-')
  357 |       );
  358 |     },
  359 |     direction,
  360 |   );
  361 |   const rate = await sampleProspectorFrameAdvances(page, 950);
  362 |   expect(rate.samples).toBeGreaterThan(8);
  363 |   expect(rate.advances).toBeGreaterThanOrEqual(5);
  364 |   expect(rate.advances).toBeLessThanOrEqual(10);
  365 |   await saveM407Shot(page, testInfo, 'mid-action');
  366 | 
  367 |   const moving = await companion(page);
  368 |   expect(distance(moving.target, route.position)).toBeLessThan(0.01);
  369 |   expect(errors.consoleErrors).toEqual([]);
  370 |   expect(errors.pageErrors).toEqual([]);
  371 | });
  372 | 
  373 | test('debug receipt moves the Prospector toward a panning target and floats ledger voice', async ({ page }, testInfo) => {
  374 |   await setAgentLevel(page, 2);
  375 |   const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&seed=m4-06-pan');
  376 |   await page.waitForFunction(() => Boolean(window.__GR_AGENT__));
  377 |   await hideDebugGui(page);
  378 | 
  379 |   await expect(page.getByTestId('hud-agent')).toContainText('L2');
  380 |   await expect(page.getByTestId('hud-agent')).toContainText('trusted-routine');
  381 | 
  382 |   const before = await companion(page);
  383 |   const node = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active));
  384 |   expect(node).toBeTruthy();
  385 |   const receipt = await page.evaluate((nodeId) => window.__GR_AGENT__?.panAt(nodeId), node!.id);
  386 |   expect((receipt as { tool?: string } | undefined)?.tool).toBe('et.goldrush.pan_at');
  387 | 
  388 |   await expect
  389 |     .poll(() => companion(page).then((snap) => distance(snap.position, before.position)), { timeout: 8_000 })
  390 |     .toBeGreaterThan(0.3);
  391 |   const mid = await companion(page);
  392 |   expect(distance(mid.target, node!.position)).toBeLessThan(0.01);
  393 |   expect(mid.lastLine).toBe('shine');
  394 |   await expect(page.getByTestId('hud-agent-feed')).toContainText('Pan');
  395 |   await expect
  396 |     .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0), { timeout: 2_000 })
  397 |     .toBeGreaterThan(0);
  398 | 
  399 |   await saveShot(page, testInfo, 'mid-action');
  400 |   expect(errors.consoleErrors).toEqual([]);
  401 |   expect(errors.pageErrors).toEqual([]);
  402 | });
  403 | 
  404 | test('permission-denied receipts do not send the Prospector to the denied target', async ({ page }) => {
  405 |   const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&seed=m4-06-denied');
```