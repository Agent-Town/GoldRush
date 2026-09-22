# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e7-playbook-rows.spec.ts >> HUMAN PARITY: a plain-boot player records and delegates a patrol through the shared latch
- Location: e2e/e7-playbook-rows.spec.ts:218:1

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: locator.click: Test timeout of 180000ms exceeded.
Call log:
  - waiting for getByTestId('playbook-record')
    - locator resolved to <button type="button" data-recording="true" data-testid="playbook-record">Save Tape</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    306 × waiting for element to be visible, enabled and stable
        - element is not visible
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - generic:
    - generic "Wave status":
      - generic:
        - generic: Beacon coils hum eastward!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 400 / 400
      - generic:
        - generic: Time
        - strong: 02:59
      - generic:
        - generic: Wave
        - strong: "5"
    - region "Gold pouch":
      - generic: Gold
      - strong: "0"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L2
          - generic [ref=e8]: trusted-routine
      - group "Exchange rescue jack-board" [ref=e9]:
        - generic "The Exchange Searching" [ref=e10] [cursor=pointer]:
          - text: The Exchange
          - generic [ref=e11]: Searching
      - button "Tape Reel" [active] [ref=e12]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "1"
        - strong: 0 / 12 XP
    - region "Build":
      - button "Build" [ref=e14]
    - button "Pause the claim" [ref=e15]: catch your breath
    - generic: Swipe to scroll Swipe to scroll
  - generic:
    - button [ref=e18]: Rotate
    - button [ref=e19]: Weapon
    - button [ref=e20]: OK
  - region
```

# Test source

```ts
  149 |       uses: row.uses,
  150 |       repeats: row.repeats,
  151 |       programRuns: row.programRuns,
  152 |       programSuspensions: row.programSuspensions,
  153 |       relaysLitByProgram: row.relaysLitByProgram,
  154 |       refusals: row.refusals,
  155 |       shelfHashes: row.shelf.map((tape: { name: string; hash: string; uses: number }) => `${tape.name}:${tape.hash}:${tape.uses}`),
  156 |       recordedUses: mirror ? mirror.recordedUses : null,
  157 |       pendingMirrors: mirror ? mirror.pending.length : null,
  158 |       tickHash: sim.tickHash(budget),
  159 |     } as RideResult;
  160 |   }, { contract, script, modules: MODULES, ticks });
  161 | }
  162 | 
  163 | test('the four Signal maps run the playbook verb identically in the browser runtime and in Node', async ({ page }, testInfo) => {
  164 |   test.setTimeout(300_000);
  165 |   const errors = collectErrors(page);
  166 |   const table: Array<Record<string, unknown>> = [];
  167 |   // The Node side, in its own process and its own module graph, from the SAME script table the
  168 |   // browser rides below (`scripts/e7-playbook-digest.mjs` exports both).
  169 |   const node = JSON.parse(execFileSync(process.execPath, ['scripts/e7-playbook-digest.mjs', '--all', '--sub-wave'],
  170 |     { encoding: 'utf8', timeout: 280_000 }).trim().split('\n').at(-1)!);
  171 |   for (const map of MAPS) {
  172 |     // Settle on a blank page first: the harness boots its own navigation from `?contract=`, and
  173 |     // under parallel workers that pending navigation interrupts the NEXT map's goto.
  174 |     await page.goto('about:blank');
  175 |     await page.goto(HARNESS(map.id, `${map.id}-01`));
  176 |     await page.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
  177 |     const browser = await rideInBrowser(page, map.id, map.script, SUBWAVE_TICKS);
  178 |     expect(browser.objective).toBe(map.objective);
  179 |     // THE BOTH-ENGINES CLAIM: same sim, same seed, same order stream, two runtimes, one answer,
  180 |     // down to the sim's own per-tick determinism fingerprint at the bound.
  181 |     expect(browser).toEqual(node[map.id]);
  182 |     table.push({ contract: map.id, seed: `${map.id}-01`, ticks: SUBWAVE_TICKS, node: node[map.id], browser });
  183 |     console.log(`[e7-both-engines] ${map.id} tickHash node=${node[map.id].tickHash} browser=${browser.tickHash} `
  184 |       + `met=${browser.objectiveMet} uses=${browser.uses} runs=${browser.programRuns} `
  185 |       + `relays=${JSON.stringify(browser.relaysLitByProgram)} refusals=${JSON.stringify(browser.refusals)}`);
  186 |   }
  187 |   // The two maps whose proof lands inside the bound are asserted here as well as in the Node
  188 |   // guard, so the browser arm is not merely "agrees" but "agrees about the mechanic firing".
  189 |   expect(node['e7-relay-valley'].relaysLitByProgram).toEqual(['relay-site-r1']);
  190 |   expect(node['e7-relay-valley'].objectiveMet).toBe(true);
  191 |   expect(node['e7-dead-band'].refusals.suppressed).toBe(1);
  192 |   expect(node['e7-dead-band'].objectiveMet).toBe(true);
  193 |   await mkdir(ARTIFACTS, { recursive: true });
  194 |   await writeFile(path.join(ARTIFACTS, `both-engines-${testInfo.project.name}.json`), `${JSON.stringify(table, null, 2)}\n`);
  195 |   expect(errors).toEqual([]);
  196 | });
  197 | 
  198 | test('every Signal map still boots clean for a player, and the E7 board is where the player sees it', async ({ page }) => {
  199 |   test.setTimeout(180_000);
  200 |   const errors = collectErrors(page);
  201 |   for (const map of MAPS) {
  202 |     // `&epoch=epoch-7-signal` is what RESOLVES these contracts: three of the four board rows are
  203 |     // locked behind an earlier secure, so a bare `?contract=` falls back to The Claim
  204 |     // (`e2e/er01-e7-census.spec.ts` asserts exactly that).
  205 |     await page.goto(`/?debug&epoch=epoch-7-signal&contract=${map.id}&seed=${map.id}-01`);
  206 |     await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId !== undefined);
  207 |     const briefing = page.getByTestId('contract-briefing');
  208 |     if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  209 |     // Mistake #10: where does the PLAYER see this? The Exchange rescue board, which
  210 |     // `E7SignalSystem.render` unhides exactly when the ACTIVE EPOCH is the Signal Era.
  211 |     await expect(page.getByTestId('e7-jack-board')).toBeVisible();
  212 |     expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe(map.id);
  213 |     expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal.enabled)).toBe(true);
  214 |   }
  215 |   expect(errors).toEqual([]);
  216 | });
  217 | 
  218 | test('HUMAN PARITY: a plain-boot player records and delegates a patrol through the shared latch', async ({ page }) => {
  219 |   test.setTimeout(180_000);
  220 |   const errors = collectErrors(page);
  221 |   await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify({
  222 |     version: 1,
  223 |     tracks: { territory: 0, science: 0, hero: 0, agent: 2 },
  224 |   })), { key: META_PROGRESS_KEY });
  225 |   await page.goto('/?epoch=epoch-7-signal&contract=e7-relay-valley&seed=e7-parity-plain&nolevel&nokill');
  226 |   await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId !== undefined);
  227 |   const briefing = page.getByTestId('contract-briefing');
  228 |   if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  229 | 
  230 |   const seam = await page.evaluate(() => {
  231 |     const sites = window.__THREE_GAME_DIAGNOSTICS__!.harvestVisuals!.seams;
  232 |     return sites.slice(1).reduce((best, candidate) => Math.hypot(candidate.x + 45, candidate.z - 42) < Math.hypot(best.x + 45, best.z - 42) ? candidate : best, sites[0]!);
  233 |   });
  234 |   await movePlayerTo(page, seam);
  235 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.economy.gold), { timeout: 15_000 }).toBeGreaterThanOrEqual(25);
  236 | 
  237 |   await page.getByTestId('playbook-toggle').click();
  238 |   await page.getByTestId('playbook-name').fill('Relay Patrol');
  239 |   await page.getByTestId('playbook-record').click();
  240 |   await page.getByTestId('playbook-toggle').click();
  241 |   await movePlayerTo(page, { x: RELAY_R1_PAD.x, z: RELAY_R1_PAD.z + 2 });
  242 |   await page.keyboard.press('KeyB');
  243 |   await page.keyboard.press('Digit1');
  244 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.ghostValid)).toBe(true);
  245 |   await page.keyboard.press('Enter');
  246 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.buildables.find(({ id }) => id === 'sentry_beacon')?.count ?? 0)).toBe(1);
  247 |   if (await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.mode)) await page.keyboard.press('KeyB');
  248 |   await page.getByTestId('playbook-toggle').click();
> 249 |   await page.getByTestId('playbook-record').click();
      |                                             ^ Error: locator.click: Test timeout of 180000ms exceeded.
  250 |   await page.getByTestId('playbook-toggle').click();
  251 |   await page.getByTestId('playbook-toggle').click();
  252 |   await page.getByTestId('playbook-replay-Relay Patrol').click();
  253 |   await expect.poll(() => page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__ as unknown as { playbookUse: { objectiveMet: boolean } }).playbookUse.objectiveMet)).toBe(true);
  254 | 
  255 |   const plain = await page.evaluate(() => ({
  256 |     row: (window.__THREE_GAME_DIAGNOSTICS__ as unknown as { playbookUse: { objective: string; objectiveMet: boolean; uses: number; relaysLitByProgram: string[] } }).playbookUse,
  257 |     litJacks: window.__THREE_GAME_DIAGNOSTICS__!.e7Signal.jacks.filter((jack) => jack.state === 'lit').map((jack) => jack.id),
  258 |     testSeam: typeof window.__GR_TEST__,
  259 |   }));
  260 |   expect(plain.row).toMatchObject({ objective: 'relay', objectiveMet: true, uses: 1, relaysLitByProgram: ['relay-site-r1'] });
  261 |   expect(plain.litJacks).toContain('ford-table');
  262 |   expect(plain.testSeam).toBe('undefined');
  263 |   console.log(`[e7-parity] plain player use=${JSON.stringify(plain.row)} lit=${JSON.stringify(plain.litJacks)}`);
  264 |   expect(errors).toEqual([]);
  265 | });
  266 | 
  267 | test('the human run tape records and assay-replays a player playbook use', async ({ page }) => {
  268 |   test.setTimeout(180_000);
  269 |   const errors = collectErrors(page);
  270 |   await page.goto('/?debug&epoch=epoch-7-signal&contract=e7-relay-valley&seed=e7-human-tape&nowaves&nolevel&nopause');
  271 |   await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
  272 |   const briefing = page.getByTestId('contract-briefing');
  273 |   if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  274 |   expect(await page.evaluate(() => window.__GR_TEST__!.playbook.startRecording({
  275 |     script: [{ t: 0, mx: 1, my: 0, a: [] }, { t: 5, mx: 0, my: 0, a: [] }],
  276 |   }))).toMatchObject({ ok: true });
  277 |   await page.evaluate(() => window.__GR_TEST__!.advanceSim(1));
  278 |   expect(await page.evaluate(() => window.__GR_TEST__!.playbook.stopRecording('Assay Patrol'))).toMatchObject({ ok: true, saved: true });
  279 |   expect(await page.evaluate(() => window.__GR_TEST__!.playbook.startReplay({ name: 'Assay Patrol' }))).toMatchObject({ ok: true });
  280 |   await page.evaluate(() => window.__GR_TEST__!.advanceSim(1));
  281 |   await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  282 |   const tape = await page.evaluate(() => window.__GR_TEST__!.runTape.list()[0]!);
  283 |   expect(tape.inputLog.playbookUses).toHaveLength(1);
  284 |   expect(tape.inputLog.playbookUses?.[0]).toMatchObject({ kind: 'playbook_use', playbook: { name: 'Assay Patrol' } });
  285 | 
  286 |   await page.addInitScript((reel) => sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(reel)), tape);
  287 |   await page.goto(`/?debug&assayReplay&replay=${tape.id}&contract=${tape.contract}&seed=${tape.seed}&difficulty=${tape.difficulty}`);
  288 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__ as unknown as { playbookUse?: { uses: number } })?.playbookUse?.uses === 1);
  289 |   expect(errors).toEqual([]);
  290 | });
  291 | 
```