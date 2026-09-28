# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: same-laws-harvest-parity.spec.ts >> mouse and touch dispatch travel, then grant one rider-rate tick per command
- Location: e2e/same-laws-harvest-parity.spec.ts:110:1

# Error details

```
Error: (node:28721) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
assay replay failed: Port 5300 is already in use


expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - generic "Wave status":
        - generic:
          - generic: Stake your claim.
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
        - strong: "10"
      - region "Active weapon":
        - strong: Spark Rig
        - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
          - generic [ref=e5]:
            - generic [ref=e6]: the Prospector
            - strong [ref=e7]: L3
            - generic [ref=e8]: autonomous-within-budget
          - generic [ref=e9]: 00:19 - Gathered 4 XP
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 4 / 12 XP
      - region "Build":
        - button "Build" [ref=e11]
      - button "Pause the claim" [ref=e12]: catch your breathⅡ
      - generic [ref=e13]:
        - text: Swipe to scroll
        - group [ref=e14]:
          - generic "Claim Stake" [ref=e15] [cursor=pointer]
    - generic:
      - button [ref=e18]: Rotate
      - button [ref=e19]: Weapon
      - button [ref=e20]: OK
    - region:
      - generic:
        - paragraph: The claim went quiet.
        - heading [level=1]: Run Ledger
        - paragraph: The claim was overrun. The gold remembers.
        - generic:
          - generic:
            - term: Time Held
            - definition: 00:20
          - generic:
            - term: Claim Jumpers Turned Back
            - definition: "4"
          - generic:
            - term: Waves Survived
            - definition: "0"
          - generic:
            - term: Gold Panned
            - definition: "10"
          - generic:
            - term: Gold Sluiced
            - definition: "0"
          - generic:
            - term: Stolen / Reclaimed
            - definition: 0 / 0
          - generic:
            - term: Spent
            - definition: "0"
          - generic:
            - term: Beacons Built
            - definition: "0"
          - generic:
            - term: Buildings Built / Lost / Repaired
            - definition: 0 / 0 / 0
          - generic:
            - term: Spark / Blast Damage
            - definition: 101 / 0
          - generic:
            - term: Blast Toggles
            - definition: "0"
          - generic:
            - term: Blast Charge Time
            - definition: 00:00
          - generic:
            - term: Upgrades Taken
            - definition: none
        - paragraph: "Science: 0 steps - 6 to the Steamworks"
        - region:
          - paragraph: Research pick 1 of 1
          - heading [level=2]: The Elder proposes...
          - generic:
            - button:
              - generic: "1"
              - generic: Advances economy
              - strong: Assay Grading
              - generic: "Effect: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight."
              - generic:
                - generic: EVERY RUN
            - button:
              - generic: "2"
              - generic: Advances arsenal
              - strong: Chain Spark Primer
              - generic: "Effect: Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate."
              - generic:
                - generic: EVERY RUN
          - paragraph: Skip chooses neither proposal.
        - region:
          - heading [level=2]: Best Claims
          - list:
            - listitem:
              - generic: wave 0 · baseless
              - strong: OVERRUN
              - generic: Robin · 0 waves · 00:20 · 4 turned back · 10 gold held · spark 101 / blast 0
        - generic:
          - button: Keep this tape
          - button: Return to Town
          - button: Try Again
    - generic:
      - status:
        - generic:
          - paragraph: Tavernkeeper
          - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
          - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
    - text: None None None
  - generic [ref=e21]:
    - button "▸ Game tuning" [ref=e22] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e23]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 3 | agent autonomy: 3"
```

# Test source

```ts
  132 |     await page.getByTestId('prospector-dispatch-confirm').click();
  133 |     await expect(page.getByTestId('prospector-dispatch-confirm')).toBeHidden();
  134 |   };
  135 |   if (mobile) {
  136 |     await dispatchByTouch();
  137 |     await dispatchByTouch();
  138 |   } else {
  139 |     // Selecting = opening the charter once (chip or G); the selection outlives the panel.
  140 |     await page.getByTestId('hud-agent').click();
  141 |     await expect(page.getByTestId('hud-agent')).toHaveAttribute('data-selected', 'true');
  142 |     await page.getByRole('button', { name: 'Close Prospector ledger' }).click();
  143 |     await canvas.click({ position: { x: point.x, y: point.y } });
  144 |     await canvas.click({ position: { x: point.x, y: point.y } });
  145 |     await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  146 |     await mkdir(SHOTS, { recursive: true });
  147 |     await page.screenshot({ path: path.join(SHOTS, `${testInfo.project.name}.png`) });
  148 |   }
  149 |   await page.evaluate((seconds) => window.__GR_TEST__!.advanceSim(seconds), mobile ? 20 : 19.5);
  150 |   const player = await panTicks(page, seam.id, playerLogStart, issuedAt);
  151 |   const afterPlayer = await seamRemaining(page, seam.id);
  152 |   expect(afterPlayer).toBe(before - 10);
  153 |   expect(player).toHaveLength(2);
  154 |   await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  155 |   const tape = await page.evaluate(() => window.__GR_TEST__!.runTape.list()[0]!);
  156 |   const dispatches = tape.inputLog.entries.flatMap((entry) => entry.a)
  157 |     .filter((action) => 'type' in action && action.type === 'prospector_dispatch');
  158 |   expect(dispatches).toHaveLength(2);
  159 | 
  160 |   // The rider's side of the same law: two HARVEST orders on the same seam from the same fresh run.
  161 |   await freshManualRun(page);
  162 |   const riderLogStart = await economyLogLength(page);
  163 |   const riderIssuedAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.timeAlive);
  164 |   const riderBefore = await seamRemaining(page, seam.id);
  165 |   const accepted = await page.evaluate((id) => window.__GR_AGENT__!.submitOrders([
  166 |     { verb: 'HARVEST', seam: id },
  167 |     { verb: 'HARVEST', seam: id },
  168 |   ]).outcome.ok, seam.id);
  169 |   expect(accepted).toBe(true);
  170 |   await page.evaluate(() => window.__GR_TEST__!.advanceSim(20));
  171 |   const rider = await panTicks(page, seam.id, riderLogStart, riderIssuedAt);
  172 |   const afterRider = await seamRemaining(page, seam.id);
  173 |   expect(rider).toHaveLength(2);
  174 |   expect(afterRider).toBe(riderBefore - 10);
  175 |   expect(curve(player)).toEqual(curve(rider));
  176 |   const table = parityTable(player, rider);
  177 |   console.log(`same-laws parity [${testInfo.project.name}] seam=${seam.id}\n${table}`);
  178 | 
  179 |   const slip = await assay(testInfo.outputPath('same-laws-tape.json'), tape, 5260 + testInfo.workerIndex);
  180 |   expect(slip.eventLogHash).toBe(tape.eventLogHash);
  181 |   expect(slip.ticks).toBe(tape.inputLog.durationTicks);
  182 |   console.log('SAME_LAWS_ASSAY_SLIP', JSON.stringify(slip));
  183 | 
  184 |   await mkdir(ARTIFACTS, { recursive: true });
  185 |   await writeFile(path.join(ARTIFACTS, `parity-${testInfo.project.name}.json`), JSON.stringify({
  186 |     project: testInfo.project.name,
  187 |     query: QUERY,
  188 |     seam: { id: seam.id, position: seam.position, before, afterPlayer, riderBefore, afterRider },
  189 |     player: { issuedAt, input: mobile ? 'touch tap-hold + confirm' : 'click while selected', ticks: player },
  190 |     rider: { issuedAt: riderIssuedAt, input: 'HARVEST x2 via __GR_AGENT__.submitOrders', ticks: rider },
  191 |     table,
  192 |     tape: {
  193 |       inputKind: 'prospector_dispatch',
  194 |       dispatches,
  195 |       eventLogHash: tape.eventLogHash,
  196 |       durationTicks: tape.inputLog.durationTicks,
  197 |     },
  198 |     assay: slip,
  199 |   }, null, 2));
  200 |   expect(errors).toEqual([]);
  201 | });
  202 | 
  203 | test('plain boot: the command is reachable without ?debug and the boot is clean', async ({ page }) => {
  204 |   test.setTimeout(90_000);
  205 |   const errors = collectErrors(page);
  206 |   await installMeta(page);
  207 |   await page.goto(`/?${QUERY}`);
  208 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24, undefined, { timeout: 60_000 });
  209 |   await dismissBriefing(page);
  210 |   const chip = page.getByTestId('hud-agent');
  211 |   await expect(chip).toBeVisible();
  212 |   await expect(chip).not.toHaveAttribute('data-selected', 'true');
  213 |   // Where the PLAYER sees it: the Prospector chip is the selection gate; opening the charter selects.
  214 |   await chip.click();
  215 |   await expect(chip).toHaveAttribute('data-selected', 'true');
  216 |   await page.getByRole('button', { name: 'Close Prospector ledger' }).click();
  217 |   await expect(chip).toHaveAttribute('data-selected', 'true');
  218 |   // The touch prompt is mounted on every boot and stays hidden until a hold on a seam.
  219 |   await expect(page.getByTestId('prospector-dispatch-confirm')).toBeAttached();
  220 |   await expect(page.getByTestId('prospector-dispatch-confirm')).toBeHidden();
  221 |   expect(errors).toEqual([]);
  222 | });
  223 | 
  224 | async function assay(file: string, tape: RunTape, port: number): Promise<{ eventLogHash: string; ticks: number; wallMs: number }> {
  225 |   await writeFile(file, JSON.stringify(tape));
  226 |   const run = spawnSync(process.execPath, ['scripts/assay-replay.mjs', file], {
  227 |     cwd: process.cwd(),
  228 |     encoding: 'utf8',
  229 |     timeout: 120_000,
  230 |     env: { ...process.env, GR_ASSAY_REPLAY_PORT: String(port) },
  231 |   });
> 232 |   expect(run.status, run.stderr).toBe(0);
      |                                  ^ Error: (node:28721) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
  233 |   return JSON.parse(run.stdout.trim()) as { eventLogHash: string; ticks: number; wallMs: number };
  234 | }
  235 | 
```