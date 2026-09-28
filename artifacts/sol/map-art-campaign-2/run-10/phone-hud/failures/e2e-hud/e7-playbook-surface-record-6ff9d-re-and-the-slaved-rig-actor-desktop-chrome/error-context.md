# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e7-playbook-surface.spec.ts >> record, name, shelf, and replay use the profile tape store and the slaved rig actor
- Location: e2e/e7-playbook-surface.spec.ts:54:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('playbook-toggle')
    - locator resolved to <button type="button" aria-expanded="false" data-testid="playbook-toggle" class="playbook-surface__toggle" aria-controls="playbook-library">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    55 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - generic "Wave status":
        - generic:
          - strong: THE EXCHANGE
          - generic: The ford still feeds every walker. Supper is still on.
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 00:02
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - generic: Gold
        - strong: "0"
      - region "Claim paused" [ref=e4]:
        - paragraph [ref=e5]: Claim Memory
        - heading "Claim Paused" [level=2] [ref=e6]
        - button "Claim Ledger" [ref=e7]
        - button "Back to Town - the claim keeps your place" [ref=e8]
        - paragraph [ref=e9]: The ledger saves at each wave's end.
        - group [ref=e10]:
          - generic "📒 Save this claim…" [ref=e11] [cursor=pointer]
        - paragraph [ref=e12]: ledger local only
        - generic [ref=e13]:
          - paragraph [ref=e14]: The Contract
          - strong [ref=e15]: The Claim
          - generic [ref=e16]: The classic river claim.
          - paragraph [ref=e17]: Goals
          - list [ref=e18]:
            - listitem [ref=e19]: "Secure the claim at wave 10: wave 0/10"
          - list [ref=e20]:
            - listitem [ref=e21]: Survive through wave 10.
          - paragraph [ref=e22]: Rules
          - list [ref=e23]:
            - listitem [ref=e24]: The river splits the claim around one center ford.
            - listitem [ref=e25]: Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.
        - paragraph [ref=e26]: "Science: 0/18 steps; banked +0"
        - paragraph [ref=e27]: "Territory 0/1: palisade kit not earned"
        - generic [ref=e28]:
          - paragraph [ref=e29]: Sound
          - generic [ref=e30]:
            - generic [ref=e31]: Volume
            - slider "Volume" [ref=e32]: "80"
            - status [ref=e33]: 80%
          - generic [ref=e34]:
            - generic [ref=e35]: Music Volume
            - slider "Music Volume" [ref=e36]: "35"
            - status [ref=e37]: 35%
          - generic [ref=e38]:
            - generic [ref=e39]: Mute
            - checkbox "Mute" [ref=e40]
          - generic [ref=e41]:
            - generic [ref=e42]: Tales
            - checkbox "Tales" [checked] [ref=e43]
        - paragraph [ref=e44]: Active Research
        - list [ref=e45]:
          - listitem [ref=e46]:
            - strong [ref=e47]: 0 active research boons
            - generic [ref=e48]: 0 named family effects earned.
        - paragraph [ref=e49]: Mastery
        - list [ref=e50]:
          - listitem [ref=e51]:
            - strong [ref=e52]: Firerate mastery
            - generic [ref=e53]: 0/3 stacks toward Spark Pressure Ring
          - listitem [ref=e54]:
            - strong [ref=e55]: Prospecting mastery
            - generic [ref=e56]: 0/2 stacks toward Stockpile Seam Survey
      - button "Back to the claim" [ref=e57]: P - back to the claim
      - region "Prospector ledger" [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]:
            - paragraph [ref=e62]: Claim partner
            - heading "the Prospector" [level=2] [ref=e63]
            - paragraph [ref=e64]: "Agent level 2: trusted-routine"
            - paragraph [ref=e65]: "Autonomy: 2.0 / 3.0 — secured claims advance the Prospector"
          - button "Close Prospector ledger" [ref=e66] [cursor=pointer]: Back
        - generic [ref=e67]:
          - heading "Trust ladder" [level=3] [ref=e68]
          - generic [ref=e69]:
            - generic [ref=e70]:
              - generic [ref=e71]:
                - strong [ref=e72]: L0 suggest-only
                - generic [ref=e73]: watches the claim and suggests work
              - generic [ref=e74] [cursor=pointer]:
                - switch "Granted" [checked] [ref=e75]
                - generic [ref=e76]: Granted
            - generic [ref=e77]:
              - generic [ref=e78]:
                - strong [ref=e79]: L1 approval-required
                - generic [ref=e80]: acts with your approval — repairs, pickups
              - generic [ref=e81] [cursor=pointer]:
                - switch "Granted" [checked] [ref=e82]
                - generic [ref=e83]: Granted
            - generic [ref=e84]:
              - generic [ref=e85]:
                - strong [ref=e86]: L2 trusted-routine
                - generic [ref=e87]: Current rung
                - generic [ref=e88]: routine work unattended
              - generic [ref=e89] [cursor=pointer]:
                - switch "Granted" [checked] [ref=e90]
                - generic [ref=e91]: Granted
            - generic [ref=e92]:
              - generic [ref=e93]:
                - strong [ref=e94]: L3 autonomous-within-budget
                - generic [ref=e95]: spends within a budget
              - paragraph [ref=e96]: Earned at agent level 3. Claim victories grow the trust track.
        - generic [ref=e97]:
          - heading "At this level" [level=3] [ref=e98]
          - generic [ref=e99]:
            - generic [ref=e100] [cursor=pointer]:
              - checkbox "Let the Prospector gather loose XP and dropped gold" [checked] [ref=e101]
              - generic [ref=e102]: Let the Prospector gather loose XP and dropped gold
            - generic [ref=e103] [cursor=pointer]:
              - checkbox "Let the Prospector tend walls" [checked] [ref=e104]
              - generic [ref=e105]:
                - text: Let the Prospector tend walls
                - generic [ref=e106]:
                  - text: Repair under
                  - spinbutton "Auto-repair threshold percent" [ref=e107]: "60"
                  - text: "% HP"
            - generic [ref=e108] [cursor=pointer]:
              - checkbox "Let the Prospector work claim pans" [checked] [ref=e109]
              - generic [ref=e110]:
                - text: Let the Prospector work claim pans
                - generic [ref=e111]:
                  - text: Act after
                  - spinbutton "Automation idle seconds" [ref=e112]: "0.8"
                  - text: s idle
            - generic [ref=e113] [cursor=pointer]:
              - checkbox "Let the Prospector light the trail" [ref=e114]
              - generic [ref=e115]: Let the Prospector light the trail
        - group [ref=e117]:
          - generic "Receipts No chores logged yet." [ref=e118] [cursor=pointer]:
            - generic [ref=e119]: Receipts
            - strong [ref=e120]: No chores logged yet.
          - list [ref=e121]:
            - listitem [ref=e122]: No chores logged yet.
    - region
    - text: None None None
  - generic [ref=e123]:
    - button "▸ Game tuning" [ref=e124] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e125]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 2 | agent autonomy: 2"
```

# Test source

```ts
  6   | 
  7   | type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
  8   | 
  9   | function collectErrors(page: Page): ErrorBucket {
  10  |   const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  11  |   page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  12  |   page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  13  |   return errors;
  14  | }
  15  | 
  16  | async function open(page: Page, epoch: string): Promise<void> {
  17  |   await page.goto(`/?debug&epoch=${epoch}&contract=the-claim&nowaves&nolevel&nopause&seed=e7-playbook-surface`);
  18  |   await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
  19  |   const briefing = page.getByTestId('contract-briefing');
  20  |   if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  21  | }
  22  | 
  23  | async function setAgentLevel(page: Page, level: number): Promise<void> {
  24  |   await page.addInitScript(
  25  |     ({ key, agentLevel }) => localStorage.setItem(key, JSON.stringify({
  26  |       version: 1,
  27  |       tracks: { territory: 0, science: 0, hero: 0, agent: agentLevel },
  28  |     })),
  29  |     { key: META_PROGRESS_KEY, agentLevel: level },
  30  |   );
  31  | }
  32  | 
  33  | test('the tape drawer arms at the Signal Era and remains inherited afterward', async ({ page }) => {
  34  |   const errors = collectErrors(page);
  35  |   await page.addInitScript(
  36  |     ({ key }) => localStorage.setItem(key, 'epoch-7-signal'),
  37  |     { key: profileDataKey('robin', ACTIVE_EPOCH_KEY) },
  38  |   );
  39  |   await open(page, 'epoch-6-atomic');
  40  |   await expect(page.getByTestId('playbook-toggle')).toHaveCount(0);
  41  | 
  42  |   await open(page, 'epoch-7-signal');
  43  |   await expect(page.getByTestId('playbook-toggle')).toBeVisible();
  44  | 
  45  |   await open(page, 'epoch-8-orbital');
  46  |   await expect(page.getByTestId('playbook-toggle')).toBeVisible();
  47  | 
  48  |   await page.goto('/?contract=the-claim&nowaves&nolevel&nopause');
  49  |   await expect(page.getByTestId('playbook-toggle')).toBeVisible();
  50  |   expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  51  |   expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  52  | });
  53  | 
  54  | test('record, name, shelf, and replay use the profile tape store and the slaved rig actor', async ({ page }) => {
  55  |   const errors = collectErrors(page);
  56  |   await setAgentLevel(page, Balance.e7Playbook.requiredPermissionLevel);
  57  |   await open(page, 'epoch-7-signal');
  58  |   await page.getByTestId('playbook-toggle').click();
  59  |   await expect(page.getByTestId('playbook-library')).toBeVisible();
  60  |   await expect(page.getByTestId('playbook-shelf')).toContainText('The drawer is empty');
  61  | 
  62  |   await page.getByTestId('playbook-name').pressSequentially('Morning Round');
  63  |   await expect(page.getByTestId('playbook-name')).toHaveValue('Morning Round');
  64  |   await page.getByTestId('playbook-record').click();
  65  |   await expect(page.getByTestId('playbook-library')).toBeHidden();
  66  |   await expect(page.getByTestId('playbook-record')).toHaveText('Save Tape');
  67  |   await page.keyboard.down('KeyD');
  68  |   await page.waitForTimeout(350);
  69  |   await page.keyboard.up('KeyD');
  70  |   await page.getByTestId('playbook-toggle').click();
  71  |   await expect(page.getByTestId('playbook-message')).toContainText('Recording Morning Round');
  72  |   await page.getByTestId('playbook-toggle').click();
  73  |   await page.keyboard.press('KeyP');
  74  |   await expect(page.locator('#hud')).toHaveAttribute('data-paused', 'true');
  75  |   const pausedTicks = await page.evaluate(() => window.__GR_TEST__!.playbook.status().recording!.ticks);
  76  |   await page.waitForTimeout(250);
  77  |   expect(await page.evaluate(() => window.__GR_TEST__!.playbook.status().recording!.ticks)).toBe(pausedTicks);
  78  |   await page.keyboard.press('KeyP');
  79  |   await expect(page.locator('#hud')).toHaveAttribute('data-paused', 'false');
  80  |   await page.getByTestId('playbook-toggle').click();
  81  |   await page.getByTestId('playbook-record').click();
  82  | 
  83  |   await expect(page.getByTestId('playbook-shelf')).toContainText('Morning Round');
  84  |   await expect(page.getByTestId('playbook-message')).toContainText('shelved');
  85  |   const stored = await page.evaluate(() => ({
  86  |     tapes: window.__GR_TEST__!.playbook.list(),
  87  |     keys: Object.keys(localStorage).filter((key) => key.includes('gr.playbooks.v1')),
  88  |   }));
  89  |   expect(stored.tapes.some((tape) => tape.name === 'Morning Round' && tape.entries > 0)).toBe(true);
  90  |   expect(stored.keys).toHaveLength(1);
  91  |   expect(stored.keys[0]).not.toBe('gr.playbooks.v1');
  92  |   expect(stored.keys[0]).toContain('gr.profile.v2.');
  93  | 
  94  |   await page.getByTestId('playbook-toggle').click();
  95  |   await page.getByTestId('hud-agent').click();
  96  |   await page.getByTestId('prospector-rung-toggle-2').uncheck();
  97  |   await page.keyboard.press('Escape');
  98  |   await page.getByTestId('playbook-toggle').click();
  99  |   await page.getByTestId('playbook-shelf').getByRole('button', { name: 'Replay' }).click();
  100 |   await expect(page.getByTestId('playbook-message')).toContainText('permission-level-2-required');
  101 | 
  102 |   await page.getByTestId('playbook-toggle').click();
  103 |   await page.getByTestId('hud-agent').click();
  104 |   await page.getByTestId('prospector-rung-toggle-2').check();
  105 |   await page.keyboard.press('Escape');
> 106 |   await page.getByTestId('playbook-toggle').click();
      |                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  107 |   await page.getByTestId('playbook-shelf').getByRole('button', { name: 'Replay' }).click();
  108 |   await expect(page.getByTestId('playbook-message')).toContainText('handed to the agent');
  109 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal.playbookSlaved)).toBe(true);
  110 |   await page.getByTestId('playbook-toggle').click();
  111 |   await page.keyboard.press('KeyP');
  112 |   await expect(page.locator('#hud')).toHaveAttribute('data-paused', 'true');
  113 |   const pausedReplayTick = await page.evaluate(() => window.__GR_TEST__!.playbook.status().replay!.tick);
  114 |   await page.waitForTimeout(250);
  115 |   expect(await page.evaluate(() => window.__GR_TEST__!.playbook.status().replay!.tick)).toBe(pausedReplayTick);
  116 |   await page.keyboard.press('KeyP');
  117 |   await expect(page.locator('#hud')).toHaveAttribute('data-paused', 'false');
  118 |   await page.getByTestId('hud-agent').click();
  119 |   await page.getByTestId('prospector-rung-toggle-2').uncheck();
  120 |   await page.keyboard.press('Escape');
  121 |   await expect.poll(() => page.evaluate(() => window.__GR_TEST__!.playbook.status().replay!.stopped)).toBe(true);
  122 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal.playbookSlaved)).toBe(false);
  123 | 
  124 |   expect(stored.tapes.length).toBeLessThanOrEqual(Balance.e7Playbook.shelfCapacity);
  125 |   expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  126 | });
  127 | 
```