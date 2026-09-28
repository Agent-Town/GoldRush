# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bt-01-tiers.spec.ts >> Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button
- Location: e2e/bt-01-tiers.spec.ts:205:1

# Error details

```
Error: expect(received).toBeNull()

Received: {"effectiveDamage": 72.8, "effectiveFireRate": 1.298, "hp": 50, "id": "turret", "index": 0, "maxHp": 50, "panRateMult": undefined, "position": {"x": 0, "z": 12}, "repairCost": 0, "repairProgress": 0, "tier": 2, "worn": false, "wrecked": false, "yieldPerCycle": undefined}

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - generic "Wave status":
        - generic:
          - generic: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 01:15
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - strong: 730/200
      - region "Active weapon":
        - strong: Spark Rig
        - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
          - generic [ref=e5]:
            - generic [ref=e6]: the Prospector
            - strong [ref=e7]: L0
            - generic [ref=e8]: suggest-only
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build - Close" [pressed] [ref=e10]
      - button "Pause the claim" [ref=e11]: catch your breathⅡ
      - status [ref=e13]:
        - generic "Signal Turret · Tier 2 Swipe to scroll" [ref=e14] [cursor=pointer]:
          - generic [ref=e15]: T
          - text: Signal Turret · Tier 2 Swipe to scroll
        - generic [ref=e16]:
          - button "Upgrade to T3 (300g)" [ref=e17]
          - button "Tear down (+25g)" [ref=e18]
          - generic [ref=e19]: invested 200g → returns 25g. The timber comes back, the labor doesn't.
    - generic:
      - button [ref=e22]: Rotate
      - button [ref=e23]: Weapon
      - button [ref=e24]: OK
    - region
    - generic:
      - status:
        - generic:
          - paragraph: Tavernkeeper
          - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
          - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
    - text: None None None
  - generic [ref=e25]:
    - button "▸ Game tuning" [ref=e26] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e27]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  116 | }
  117 | 
  118 | async function ghostValidAt(page: Page, id: BuildableId, x: number, z: number): Promise<boolean> {
  119 |   await teleport(page, x, z + 2);
  120 |   await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  121 |   await expect
  122 |     .poll(() =>
  123 |       page.evaluate(
  124 |         (target) => {
  125 |           const build = window.__THREE_GAME_DIAGNOSTICS__?.build;
  126 |           return Boolean(build && Math.abs(build.ghostPos.x - target.x) < 0.01 && Math.abs(build.ghostPos.z - target.z) < 0.01);
  127 |         },
  128 |         { x, z },
  129 |       ),
  130 |     )
  131 |     .toBe(true);
  132 |   return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false);
  133 | }
  134 | 
  135 | test('every buyable tier rung changes a live stat', () => {
  136 |   const stats = {
  137 |     palisade: ['maxHpMult'],
  138 |     sluice: ['panRateMult', 'yieldMult'],
  139 |     turret: ['damageMult', 'fireRateMult'],
  140 |   } as const;
  141 | 
  142 |   for (const id of Object.keys(stats) as Array<keyof typeof stats>) {
  143 |     const rows = Balance.tiers[id] as readonly Record<string, number>[];
  144 |     for (let tier = 1; tier < rows.length; tier += 1) {
  145 |       if ((rows[tier]?.cost ?? 0) <= 0) continue;
  146 |       const changed = stats[id].some((stat) => rows[tier]?.[stat] !== rows[tier - 1]?.[stat]);
  147 |       expect(changed, `${id} tier ${tier + 1} changes a stat`).toBe(true);
  148 |     }
  149 |   }
  150 | });
  151 | 
  152 | test('turret tier raises live damage and spends the exact tier-2 cost', async ({ page }) => {
  153 |   const errors = await openGame(page, 'bt-01-turret');
  154 |   await grantGold(page, 300);
  155 |   const turret = await placeBuildableAt(page, 'turret', 0, 12);
  156 |   const before = (await hpEntry(page, 'turret', turret.index))!;
  157 |   expect(before.tier).toBe(1);
  158 |   expect(before.effectiveDamage).toBe(Balance.turret.damage);
  159 |   expect(before.effectiveFireRate).toBe(Balance.turret.fireRate);
  160 | 
  161 |   await teleport(page, turret.position.x, turret.position.z);
  162 |   await expect(page.getByTestId('building-context-prompt')).toBeVisible();
  163 |   await expect(page.getByTestId('building-context-prompt')).toContainText(`Upgrade to T2 (${Balance.tiers.turret[1].cost}g)`);
  164 |   const beforeGold = await gold(page);
  165 |   await page.keyboard.press('KeyU');
  166 | 
  167 |   await expect.poll(() => hpEntry(page, 'turret', turret.index).then((entry) => entry?.tier ?? 0)).toBe(2);
  168 |   const after = (await hpEntry(page, 'turret', turret.index))!;
  169 |   expect(await gold(page)).toBe(beforeGold - Balance.tiers.turret[1].cost);
  170 |   expect(await baseValue(page)).toBe(Balance.turret.costBase + Balance.tiers.turret[1].cost);
  171 |   expect(after.effectiveDamage).toBeGreaterThan(before.effectiveDamage ?? 0);
  172 |   expect(after.effectiveDamage).toBeCloseTo(Balance.turret.damage * Balance.tiers.turret[1].damageMult, 5);
  173 |   expect(after.effectiveFireRate).toBeCloseTo(Balance.turret.fireRate * Balance.tiers.turret[1].fireRateMult, 5);
  174 |   expect((after.effectiveDamage ?? 0) * (after.effectiveFireRate ?? 0)).toBeGreaterThanOrEqual(
  175 |     (before.effectiveDamage ?? 0) * (before.effectiveFireRate ?? 0) * 1.5,
  176 |   );
  177 |   expect(errors.consoleErrors).toEqual([]);
  178 |   expect(errors.pageErrors).toEqual([]);
  179 | });
  180 | 
  181 | test('same-frame upgrade and confirm does not demolish the upgraded building', async ({ page }) => {
  182 |   const errors = await openGame(page, 'bt-01-upgrade-confirm-chord');
  183 |   await grantGold(page, 300);
  184 |   const turret = await placeBuildableAt(page, 'turret', 0, 12);
  185 |   await teleport(page, turret.position.x, turret.position.z);
  186 |   await expect(page.getByTestId('building-context-prompt')).toContainText(`Upgrade to T2 (${Balance.tiers.turret[1].cost}g)`);
  187 |   const beforeGold = await gold(page);
  188 | 
  189 |   await page.evaluate(() => {
  190 |     window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'KeyU', key: 'u' }));
  191 |     window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Enter', key: 'Enter' }));
  192 |   });
  193 | 
  194 |   await expect.poll(() => hpEntry(page, 'turret', turret.index).then((entry) => entry?.tier ?? 0)).toBe(2);
  195 |   await expect.poll(() => buildableCount(page, 'turret')).toBe(1);
  196 |   expect(await gold(page)).toBe(beforeGold - Balance.tiers.turret[1].cost);
  197 |   await page.evaluate(() => {
  198 |     window.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code: 'KeyU', key: 'u' }));
  199 |     window.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code: 'Enter', key: 'Enter' }));
  200 |   });
  201 |   expect(errors.consoleErrors).toEqual([]);
  202 |   expect(errors.pageErrors).toEqual([]);
  203 | });
  204 | 
  205 | test('Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button', async ({ page }) => {
  206 |   const errors = await openGame(page, 'bt-01-click-upgrade-enter-demolish');
  207 |   await grantGold(page, 1_000);
  208 |   const turret = await placeBuildableAt(page, 'turret', 0, 12);
  209 |   await teleport(page, turret.position.x, turret.position.z);
  210 |   await page.getByTestId('upgrade-confirm').click();
  211 |   await expect.poll(() => hpEntry(page, 'turret', turret.index).then((entry) => entry?.tier ?? 0)).toBe(2);
  212 |   await expect(page.getByTestId('building-context-prompt')).toContainText('Signal Turret · Tier 2');
  213 | 
  214 |   await page.keyboard.press('Enter');
  215 | 
> 216 |   await expect.poll(() => hpEntry(page, 'turret', turret.index)).toBeNull();
      |                                                                  ^ Error: expect(received).toBeNull()
  217 |   await expect.poll(() => buildableCount(page, 'turret')).toBe(0);
  218 |   expect(errors.consoleErrors).toEqual([]);
  219 |   expect(errors.pageErrors).toEqual([]);
  220 | });
  221 | 
  222 | test('palisade tier raises max HP, heals, and wears only below half the new max', async ({ page }) => {
  223 |   const errors = await openGame(page, 'bt-01-palisade');
  224 |   await grantGold(page, 200);
  225 |   const palisade = await placeBuildableAt(page, 'palisade', 0, 9);
  226 |   expect(palisade.maxHp).toBe(60);
  227 | 
  228 |   await expect(upgrade(page, palisade)).resolves.toBe(true);
  229 |   const upgraded = (await hpEntry(page, 'palisade', palisade.index))!;
  230 |   expect(upgraded.tier).toBe(2);
  231 |   expect(upgraded.maxHp).toBe(Math.round(Balance.wreck.hp.palisade * Balance.tiers.palisade[1].maxHpMult));
  232 |   expect(upgraded.maxHp / palisade.maxHp).toBeGreaterThanOrEqual(1.75);
  233 |   expect(upgraded.hp).toBe(upgraded.maxHp);
  234 |   expect(upgraded.worn).toBe(false);
  235 | 
  236 |   await setBalance(page, 'enemy.contactDamage', 0);
  237 |   const firstDamage = Math.floor(upgraded.maxHp / 2) - 1;
  238 |   await setBalance(page, 'wreck.damage', firstDamage);
  239 |   await setBalance(page, 'wreck.hitCooldown', 999);
  240 |   await setBalance(page, 'wreck.repairSeconds', 999);
  241 |   await spawnStationaryWreckerAt(page, upgraded);
  242 |   const aboveHalfHp = upgraded.maxHp - firstDamage;
  243 |   await expect.poll(() => hpEntry(page, 'palisade', palisade.index).then((entry) => entry?.hp ?? -1), { timeout: 12_000 }).toBe(aboveHalfHp);
  244 |   expect((await hpEntry(page, 'palisade', palisade.index))?.worn).toBe(false);
  245 | 
  246 |   await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  247 |   await setBalance(page, 'wreck.damage', 2);
  248 |   await spawnStationaryWreckerAt(page, upgraded);
  249 |   await expect.poll(() => hpEntry(page, 'palisade', palisade.index).then((entry) => entry?.hp ?? -1), { timeout: 12_000 }).toBe(aboveHalfHp - 2);
  250 |   await expect.poll(() => hpEntry(page, 'palisade', palisade.index).then((entry) => entry?.worn ?? false), { timeout: 12_000 }).toBe(true);
  251 |   expect(errors.consoleErrors).toEqual([]);
  252 |   expect(errors.pageErrors).toEqual([]);
  253 | });
  254 | 
  255 | test('sluice tier raises pan-out yield and out-earns two tier-1 rates', async ({ page }) => {
  256 |   const errors = await openGame(page, 'bt-01-sluice');
  257 |   await grantGold(page, 200);
  258 |   const tier1 = await placeBuildableAt(page, 'sluice', -2, 7);
  259 |   const tier2 = await placeBuildableAt(page, 'sluice', 2, 7);
  260 |   const before = (await hpEntry(page, 'sluice', tier1.index))!;
  261 |   expect(before.panRateMult).toBe(1);
  262 |   expect(before.yieldPerCycle).toBe(Balance.sluice.goldPerCycle);
  263 | 
  264 |   await expect(upgrade(page, tier2)).resolves.toBe(true);
  265 |   const after = (await hpEntry(page, 'sluice', tier2.index))!;
  266 |   expect(after.tier).toBe(2);
  267 |   expect(after.panRateMult).toBe(Balance.tiers.sluice[1].panRateMult);
  268 |   expect(after.yieldPerCycle).toBe(Math.round(Balance.sluice.goldPerCycle * Balance.tiers.sluice[1].yieldMult));
  269 |   expect(sluiceRate(after)).toBeGreaterThan(sluiceRate(before) * 2);
  270 | 
  271 |   const sluiceState = await page.evaluate((index) => window.__THREE_GAME_DIAGNOSTICS__?.build.sluicesState[index], tier2.index);
  272 |   expect(sluiceState?.panRateMult).toBe(Balance.tiers.sluice[1].panRateMult);
  273 |   expect(sluiceState?.yieldPerCycle).toBe(after.yieldPerCycle);
  274 | 
  275 |   const tier1Id = `sluice-${tier1.index + 1}`;
  276 |   const tier2Id = `sluice-${tier2.index + 1}`;
  277 |   await expect
  278 |     .poll(() => firstSluiceAmounts(page, [tier1Id, tier2Id]), { timeout: 8_000 })
  279 |     .toEqual({ [tier1Id]: before.yieldPerCycle, [tier2Id]: after.yieldPerCycle });
  280 |   expect(errors.consoleErrors).toEqual([]);
  281 |   expect(errors.pageErrors).toEqual([]);
  282 | });
  283 | 
  284 | test('upgraded palisade keeps identical footprint blocking and edge-touch behavior', async ({ page }) => {
  285 |   const errors = await openGame(page, 'bt-01-footprint');
  286 |   await grantGold(page, 200);
  287 |   const palisade = await placeBuildableAt(page, 'palisade', 0, 9);
  288 | 
  289 |   const blockedBefore = await ghostValidAt(page, 'palisade', 0, 10);
  290 |   const edgeBefore = await ghostValidAt(page, 'palisade', 0, 12);
  291 |   await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  292 |   await expect(upgrade(page, palisade)).resolves.toBe(true);
  293 |   const blockedAfter = await ghostValidAt(page, 'palisade', 0, 10);
  294 |   const edgeAfter = await ghostValidAt(page, 'palisade', 0, 12);
  295 | 
  296 |   expect({ blockedBefore, blockedAfter, edgeBefore, edgeAfter }).toEqual({
  297 |     blockedBefore: false,
  298 |     blockedAfter: false,
  299 |     edgeBefore: true,
  300 |     edgeAfter: true,
  301 |   });
  302 |   expect(errors.consoleErrors).toEqual([]);
  303 |   expect(errors.pageErrors).toEqual([]);
  304 | });
  305 | 
  306 | test('tier cap stops at tier 3 without extra spend', async ({ page }) => {
  307 |   const errors = await openGame(page, 'bt-01-cap');
  308 |   await grantGold(page, 1000);
  309 |   const turret = await placeBuildableAt(page, 'turret', 0, 12);
  310 |   await expect(upgrade(page, turret)).resolves.toBe(true);
  311 |   await expect(upgrade(page, turret)).resolves.toBe(true);
  312 |   await expect.poll(() => hpEntry(page, 'turret', turret.index).then((entry) => entry?.tier ?? 0)).toBe(3);
  313 | 
  314 |   const beforeGold = await gold(page);
  315 |   await expect(upgrade(page, turret)).resolves.toBe(false);
  316 |   expect(await gold(page)).toBe(beforeGold);
```