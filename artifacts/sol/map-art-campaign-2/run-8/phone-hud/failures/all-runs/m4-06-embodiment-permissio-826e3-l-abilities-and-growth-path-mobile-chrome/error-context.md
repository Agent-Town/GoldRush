# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m4-06-embodiment.spec.ts >> permission chip shows portrait, current level, abilities, and growth path
- Location: e2e/m4-06-embodiment.spec.ts:187:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByTestId('hud-agent').locator('[data-hud-agent-portrait]')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('hud-agent').locator('[data-hud-agent-portrait]')
    13 × locator resolved to <img alt="" data-hud-agent-portrait="" class="hud-agent-chip__portrait" src="http://127.0.0.1:5312/assets/processed/char-prospector-portrait.png"/>
       - unexpected value "hidden"

```

```yaml
- main:
  - status:
    - paragraph: The Contract
    - button "Begin"
    - heading "The Claim" [level=2]
    - paragraph: The classic river claim.
    - paragraph: Goals
    - list:
      - listitem: Survive through wave 10.
    - paragraph: Rules
    - list:
      - listitem: The river splits the claim around one center ford.
      - listitem: Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.
  - text: "the Prospector: can gather and mend with approval. Chip by weapon; claim wins grow it."
  - region "Run vitals":
    - text: HP
    - strong: 100 / 100
    - text: Time
    - strong: 00:05
    - text: Wave
    - strong: "0"
  - region "Gold pouch":
    - strong: "0"
  - region "Active weapon":
    - strong: Spark Rig
    - button "Prospector permission chip":
      - text: the Prospector
      - strong: L1
      - text: approval-required
  - region "Experience":
    - text: Level
    - strong: "1"
    - strong: 0 / 12 XP
  - region "Build":
    - button "Build"
  - button "Pause the claim": catch your breathⅡ
  - status:
    - paragraph: Tavernkeeper
    - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
    - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
```

# Test source

```ts
  92  | }
  93  | 
  94  | function distance(a: Point, b: Point): number {
  95  |   return Math.hypot(a.x - b.x, a.z - b.z);
  96  | }
  97  | 
  98  | function terrainZone(point: Point): 'bank' | 'shallows' | 'river' | 'ford' | 'out' {
  99  |   if (point.x < -32 || point.x > 32 || point.z < -32 || point.z > 32) return 'out';
  100 |   if (point.x >= -3 && point.x <= 3 && point.z >= -5 && point.z <= 5) return 'ford';
  101 |   if (point.z >= -5 && point.z <= 5) return 'river';
  102 |   if ((point.z > 5 && point.z <= 6.25) || (point.z < -5 && point.z >= -6.25)) return 'shallows';
  103 |   return 'bank';
  104 | }
  105 | 
  106 | async function waitForProspectorSprite(page: Page, timeout = 5_000): Promise<SpriteSnapshot> {
  107 |   await page.waitForFunction(() => {
  108 |     const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent'];
  109 |     return (
  110 |       snapshot?.loaded === true &&
  111 |       snapshot.frameCount === 8 &&
  112 |       (snapshot.sourceFrameKey ?? snapshot.frameKey).startsWith('char-prospector-sheet-hover8-')
  113 |     );
  114 |   }, undefined, { timeout });
  115 |   return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.spriteAnimations['char.prospector_agent'] as SpriteSnapshot);
  116 | }
  117 | 
  118 | async function sampleProspectorFrameAdvances(page: Page, sampleMs: number): Promise<{ advances: number; samples: number }> {
  119 |   return page.evaluate(async (durationMs) => {
  120 |     const frames: number[] = [];
  121 |     const deadline = performance.now() + durationMs;
  122 |     await new Promise<void>((resolve) => {
  123 |       const tick = () => {
  124 |         const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
  125 |         const sprite = diagnostics?.spriteAnimations['char.prospector_agent'];
  126 |         if (diagnostics?.agent.embodiment.moving && sprite?.clip === 'walk') frames.push(sprite.frame);
  127 |         if (performance.now() >= deadline || diagnostics?.agent.embodiment.moving !== true) {
  128 |           resolve();
  129 |           return;
  130 |         }
  131 |         requestAnimationFrame(tick);
  132 |       };
  133 |       requestAnimationFrame(tick);
  134 |     });
  135 |     const advances = frames.reduce((count, frame, index) => count + (index > 0 && frame !== frames[index - 1] ? 1 : 0), 0);
  136 |     return { advances, samples: frames.length };
  137 |   }, sampleMs);
  138 | }
  139 | 
  140 | function expectedDirection(dx: number, dz: number): string {
  141 |   return new OrientationResolver().resolve(dx, dz);
  142 | }
  143 | 
  144 | function minProspectorClearance(): number {
  145 |   return Balance.agent.spriteScale * 0.5 + 0.08;
  146 | }
  147 | 
  148 | test('plain boot renders the Prospector near the claim with no debug gate', async ({ page }, testInfo) => {
  149 |   const errors = await openGame(page, '?nowaves&nolevel&seed=m4-06-plain');
  150 |   const intro = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcement ?? '');
  151 | 
  152 |   await expect
  153 |     .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.embodiment.visible ?? false), {
  154 |       timeout: 2_000,
  155 |     })
  156 |     .toBe(true);
  157 |   await waitForProspectorSprite(page, 2_000);
  158 |   const snap = await companion(page);
  159 |   const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos);
  160 |   expect(distance(snap.position, hero)).toBeGreaterThan(1.2);
  161 |   expect(distance(snap.position, hero)).toBeLessThan(3.1);
  162 |   expect(snap.position.y).toBeGreaterThanOrEqual(snap.terrainY + minProspectorClearance());
  163 |   expect(snap.clearance).toBeGreaterThanOrEqual(minProspectorClearance());
  164 |   expect(snap.moving).toBe(false);
  165 |   expect(snap.receiptCount).toBeGreaterThanOrEqual(1);
  166 |   expect(intro).toContain('the Prospector');
  167 |   expect(intro).toContain('Chip by weapon');
  168 |   await expect(page.getByTestId('hud-wave')).toContainText('the Prospector');
  169 |   await expect(page.getByTestId('hud-agent')).toContainText('L0');
  170 |   await expect(page.getByTestId('hud-agent')).toContainText('suggest-only');
  171 | 
  172 |   const introSample = await page.evaluate(() => ({
  173 |     text: window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcement,
  174 |     at: window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcementAt,
  175 |   }));
  176 |   await page.waitForTimeout(650);
  177 |   await expect
  178 |     .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcementAt ?? -1), { timeout: 1_000 })
  179 |     .toBe(introSample.at);
  180 | 
  181 |   await savePresenceShot(page, testInfo, 'idle-beside-hero');
  182 |   await savePresenceShot(page, testInfo, 'first-contact-beat');
  183 |   expect(errors.consoleErrors).toEqual([]);
  184 |   expect(errors.pageErrors).toEqual([]);
  185 | });
  186 | 
  187 | test('permission chip shows portrait, current level, abilities, and growth path', async ({ page }, testInfo) => {
  188 |   await setAgentLevel(page, 1);
  189 |   const errors = await openGame(page, '?nowaves&nolevel&seed=prospector-chip');
  190 |   const chip = page.getByTestId('hud-agent');
  191 | 
> 192 |   await expect(chip.locator('[data-hud-agent-portrait]')).toBeVisible();
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  193 |   await expect(chip).toContainText('L1');
  194 |   await expect(chip).toContainText('approval-required');
  195 |   await chip.click();
  196 |   await expect(chip).toHaveAttribute('aria-expanded', 'true');
  197 |   await expect(chip.locator('[data-hud-agent-detail]')).toContainText('Can gather XP motes');
  198 |   await expect(chip.locator('[data-hud-agent-detail]')).toContainText('Grows when secured claims add agent progress');
  199 | 
  200 |   await savePresenceShot(page, testInfo, 'chip');
  201 |   expect(errors.consoleErrors).toEqual([]);
  202 |   expect(errors.pageErrors).toEqual([]);
  203 | });
  204 | 
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
```