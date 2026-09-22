# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m2-05b-overwhelm-valves.spec.ts >> lullFloor12 only clamps post-wave-12 pulse spacing
- Location: e2e/m2-05b-overwhelm-valves.spec.ts:223:1

# Error details

```
TypeError: Cannot read properties of undefined (reading 'lastPulseAt')
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
      - generic: Wave 22 ledgered ✓
      - generic "Wave status":
        - generic:
          - generic: Hold the north bank for the assay!
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 01:35
        - generic:
          - generic: Wave
          - strong: "23"
      - region "Gold pouch":
        - strong: "0"
      - region "Active weapon":
        - strong: Spark Rig
        - button "Prospector permission chip" [ref=e21] [cursor=pointer]:
          - generic [ref=e22]:
            - generic [ref=e23]: the Prospector
            - strong [ref=e24]: L1
            - generic [ref=e25]: approval-required
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
      - status:
        - strong: CLAIM SECURED ✓
        - generic: The win is banked.
    - generic:
      - button [ref=e31]: Rotate
      - button [ref=e32]: Weapon
      - button [ref=e33]: OK
    - region
    - text: None None None
  - generic [ref=e34]:
    - button "▸ Game tuning" [ref=e35] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e36]: "Meta territory: 1 | science: 1 | hero: 1 | agent: 1 | agent autonomy: 1"
```

# Test source

```ts
  146 |     window.__M2_05B_PULSES__ = { records: [], lastPulseAt: Number.NEGATIVE_INFINITY };
  147 |     const tick = () => {
  148 |       const snapshot = window.__THREE_GAME_DIAGNOSTICS__;
  149 |       const track = window.__M2_05B_PULSES__!;
  150 |       const lastPulseAt = snapshot?.lastPulseAt ?? Number.NEGATIVE_INFINITY;
  151 |       if (Number.isFinite(lastPulseAt) && lastPulseAt !== track.lastPulseAt) {
  152 |         track.records.push({ wave: snapshot?.wave ?? 0, pulse: snapshot?.pulse ?? 0, lastPulseAt });
  153 |         track.lastPulseAt = lastPulseAt;
  154 |       }
  155 |       requestAnimationFrame(tick);
  156 |     };
  157 |     requestAnimationFrame(tick);
  158 |   });
  159 | }
  160 | 
  161 | test('scheduled thief flags never exceed the concurrency cap', async ({ page }) => {
  162 |   const errors = await openGame(page, '?debug&timescale=4&nokill&nolevel&nopause&nowreck&seed=m2-05b-cap');
  163 |   await setBalances(page, {
  164 |     'steal.minWave': 1,
  165 |     'steal.share': 1,
  166 |     'steal.maxConcurrent': 2,
  167 |     'steal.maxConcurrentPerWaves': 999,
  168 |     'steal.maxConcurrentCap': 2,
  169 |     'waves.waveInterval': 12,
  170 |     'waves.trickleInterval': 9999,
  171 |     'waves.pulseBase': 12,
  172 |     'waves.pulsePerWave': 0,
  173 |     'waves.pulsesPerWave': 1,
  174 |     'waves.edgesPerPulse': 2,
  175 |   });
  176 |   await placeStockpile(page);
  177 |   await grantGold(page, 200);
  178 |   await installCapTracker(page);
  179 | 
  180 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0), { timeout: 12_000 }).toBeGreaterThan(0);
  181 |   const track = await page.evaluate(() => window.__M2_05B_CAP__ as CapTrack);
  182 |   expect(track.samples).toBeGreaterThan(0);
  183 |   expect(track.max).toBeGreaterThan(0);
  184 |   expect(track.max).toBeLessThanOrEqual(2);
  185 |   expect(errors.consoleErrors).toEqual([]);
  186 |   expect(errors.pageErrors).toEqual([]);
  187 | });
  188 | 
  189 | test('wrecker pulses get a distinct telegraph and normal pulses do not', async ({ page }) => {
  190 |   const errors = await openGame(page, '?debug&timescale=4&nokill&nolevel&nopause&nosteal&seed=m2-05b-telegraph');
  191 |   await setBalances(page, {
  192 |     'wreck.minWave': 1,
  193 |     'wreck.pulseEvery': 2,
  194 |     'wreck.share': 1,
  195 |     'waves.waveInterval': 12,
  196 |     'waves.trickleInterval': 9999,
  197 |     'waves.pulseBase': 4,
  198 |     'waves.pulsePerWave': 0,
  199 |     'waves.pulsesPerWave': 2,
  200 |     'waves.edgesPerPulse': 1,
  201 |     'waves.lullSeconds': 3,
  202 |   });
  203 |   await grantGold(page, 20);
  204 |   await placeBuildableAt(page, 'palisade', 0, 9);
  205 |   await installBannerTracker(page);
  206 | 
  207 |   await expect
  208 |     .poll(() => page.evaluate(() => window.__M2_05B_BANNERS__?.records.some((record) => record.text.includes('Wrecking crew')) ?? false), {
  209 |       timeout: 14_000,
  210 |     })
  211 |     .toBe(true);
  212 |   await expect(page.getByTestId('hud-wave')).toContainText('Wrecking crew');
  213 |   await shot(page, 'wrecker-telegraph-banner');
  214 | 
  215 |   const records = await page.evaluate(() => window.__M2_05B_BANNERS__?.records ?? []);
  216 |   expect(records.some((record) => record.pulse === 1 && !record.text.includes('Wrecking crew'))).toBe(true);
  217 |   expect(records.some((record) => record.pulse === 1 && record.text.includes('Wrecking crew'))).toBe(false);
  218 |   expect(records.some((record) => record.pulse === 2 && record.text.includes('Wrecking crew'))).toBe(true);
  219 |   expect(errors.consoleErrors).toEqual([]);
  220 |   expect(errors.pageErrors).toEqual([]);
  221 | });
  222 | 
  223 | test('lullFloor12 only clamps post-wave-12 pulse spacing', async ({ page }) => {
  224 |   const errors = await openGame(page, '?debug&timescale=12&nokill&nolevel&nopause&nosteal&nowreck&seed=m2-05b-lull');
  225 |   await setBalances(page, {
  226 |     'waves.waveInterval': 4,
  227 |     'waves.trickleInterval': 9999,
  228 |     'waves.pulseBase': 2,
  229 |     'waves.pulsePerWave': 0,
  230 |     'waves.pulsesPerWave': 2,
  231 |     'waves.edgesPerPulse': 1,
  232 |     'waves.lullSeconds': 0.5,
  233 |     'waves.lullFloor12': 2,
  234 |     'waves.aliveCap': 96,
  235 |   });
  236 |   await installPulseTracker(page);
  237 | 
  238 |   await expect
  239 |     .poll(() => page.evaluate(() => window.__M2_05B_PULSES__?.records.some((record) => record.wave >= 12 && record.pulse === 2) ?? false), {
  240 |       timeout: 15_000,
  241 |     })
  242 |     .toBe(true);
  243 |   const records = await page.evaluate(() => window.__M2_05B_PULSES__?.records ?? []);
  244 |   const wave1 = records.filter((record) => record.wave === 1);
  245 |   const wave12 = records.filter((record) => record.wave === 12);
> 246 |   expect(wave1[1].lastPulseAt - wave1[0].lastPulseAt).toBeCloseTo(0.5, 4);
      |                   ^ TypeError: Cannot read properties of undefined (reading 'lastPulseAt')
  247 |   expect(wave12[1].lastPulseAt - wave12[0].lastPulseAt).toBeGreaterThanOrEqual(2);
  248 |   expect(errors.consoleErrors).toEqual([]);
  249 |   expect(errors.pageErrors).toEqual([]);
  250 | });
  251 | 
  252 | test('theft ping shows edge glyph, auto-hides, and debug flags suppress it', async ({ page }) => {
  253 |   let errors = await openGame(page, '?debug&timescale=8&nowaves&nokill&nolevel&nopause&seed=m2-05b-ping');
  254 |   await placeStockpile(page);
  255 |   await grantGold(page, 100);
  256 |   await teleport(page, 0, -5);
  257 |   await expect(page.evaluate(() => window.__GR_TEST__?.spawnThief('north'))).resolves.toBe(true);
  258 | 
  259 |   await expect(page.getByTestId('hud-wave')).toContainText('Gold snatched', { timeout: 10_000 });
  260 |   await expect(page.getByTestId('hud-edge')).toHaveText('N');
  261 |   await expect(page.getByTestId('hud-edge')).toHaveAttribute('data-edge', 'north');
  262 |   await shot(page, 'theft-ping-edge');
  263 |   await page.setViewportSize({ width: 390, height: 844 });
  264 |   await shot(page, '390px-frame');
  265 |   await page.waitForTimeout(Balance.steal.pingSeconds * 1000 + 700);
  266 |   await expect.poll(() => page.getByTestId('hud-wave').evaluate((element) => Number(getComputedStyle(element).opacity))).toBeLessThan(0.05);
  267 |   expect(errors.consoleErrors).toEqual([]);
  268 |   expect(errors.pageErrors).toEqual([]);
  269 | 
  270 |   errors = await openGame(page, '?debug&timescale=8&nowaves&nokill&nolevel&nopause&noping&seed=m2-05b-noping');
  271 |   await placeStockpile(page);
  272 |   await grantGold(page, 100);
  273 |   await teleport(page, 0, -5);
  274 |   await expect(page.evaluate(() => window.__GR_TEST__?.spawnThief('north'))).resolves.toBe(true);
  275 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.steal.stolenTotal ?? 0), { timeout: 10_000 }).toBeGreaterThan(0);
  276 |   await page.waitForTimeout(250);
  277 |   await expect(page.getByTestId('hud-wave')).not.toContainText('Gold snatched');
  278 |   await expect(page.getByTestId('hud-edge')).toHaveText('');
  279 |   expect(errors.consoleErrors).toEqual([]);
  280 |   expect(errors.pageErrors).toEqual([]);
  281 | 
  282 |   errors = await openGame(page, '?debug&timescale=8&nowaves&nokill&nolevel&nopause&nosteal&seed=m2-05b-nosteal');
  283 |   await placeStockpile(page);
  284 |   await grantGold(page, 100);
  285 |   await expect(page.evaluate(() => window.__GR_TEST__?.spawnThief('north'))).resolves.toBe(false);
  286 |   await page.waitForTimeout(250);
  287 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.steal.stolenTotal ?? 0)).toBe(0);
  288 |   await expect(page.getByTestId('hud-wave')).not.toContainText('Gold snatched');
  289 |   expect(errors.consoleErrors).toEqual([]);
  290 |   expect(errors.pageErrors).toEqual([]);
  291 | });
  292 | 
  293 | test('wave-12 palisade line survives one wrecker pulse and repair stays cheaper than new placement', async ({ page }) => {
  294 |   const errors = await openGame(page, '?debug&timescale=8&nowaves&nokill&nolevel&nopause&seed=m2-05b-wave12-wall');
  295 |   await setBalances(
  296 |     page,
  297 |     {
  298 |       'enemy.contactDamage': 0,
  299 |       'wreck.damage': 8,
  300 |       'wreck.hitCooldown': 0.9,
  301 |     },
  302 |     false,
  303 |   );
  304 |   await page.evaluate(() => window.__GR_TEST__?.setBeaconWave(12));
  305 |   await grantGold(page, 120);
  306 |   for (const x of [-3, -2, -1, 0, 1, 2]) await placeBuildableAt(page, 'palisade', x, 9);
  307 | 
  308 |   const before = await hpEntries(page, 'palisade');
  309 |   expect(before).toHaveLength(6);
  310 |   expect(before.every((entry) => entry.maxHp > Balance.wreck.hp.palisade)).toBe(true);
  311 | 
  312 |   await teleport(page, 0, 6);
  313 |   await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);
  314 |   await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);
  315 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0), { timeout: 12_000 }).toBeGreaterThanOrEqual(2);
  316 |   await shot(page, 'wave12-wall-under-assault');
  317 | 
  318 |   const afterPulse = await hpEntries(page, 'palisade');
  319 |   expect(afterPulse).toHaveLength(6);
  320 |   expect(afterPulse.every((entry) => !entry.wrecked)).toBe(true);
  321 |   expect(afterPulse.some((entry) => entry.hp < entry.maxHp)).toBe(true);
  322 | 
  323 |   await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  324 |   const newPlacementCost = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.nextCost ?? 0);
  325 |   const cost = repairCost('palisade');
  326 |   expect(cost).toBeLessThan(newPlacementCost);
  327 |   await wreck(page, 'palisade', 0);
  328 |   await grantGold(page, cost);
  329 |   await teleport(page, -3, 9);
  330 |   await expect
  331 |     .poll(() => hpEntries(page, 'palisade').then((entries) => entries.find((entry) => entry.index === 0)?.wrecked ?? true), {
  332 |       timeout: 10_000,
  333 |     })
  334 |     .toBe(false);
  335 |   expect((await economyLog(page)).some((event) => event.type === 'gold_spent' && event.sink === 'repair_palisade' && event.amount === cost)).toBe(true);
  336 |   expect(errors.consoleErrors).toEqual([]);
  337 |   expect(errors.pageErrors).toEqual([]);
  338 | });
  339 | 
  340 | declare global {
  341 |   interface Window {
  342 |     __M2_05B_CAP__?: CapTrack;
  343 |     __M2_05B_BANNERS__?: BannerTrack;
  344 |     __M2_05B_PULSES__?: PulseTrack;
  345 |   }
  346 | }
```