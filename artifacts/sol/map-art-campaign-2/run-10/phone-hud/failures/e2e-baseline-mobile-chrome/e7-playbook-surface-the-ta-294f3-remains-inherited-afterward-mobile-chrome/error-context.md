# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e7-playbook-surface.spec.ts >> the tape drawer arms at the Signal Era and remains inherited afterward
- Location: e2e/e7-playbook-surface.spec.ts:33:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('playbook-toggle')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('playbook-toggle')

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
  - text: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
  - region "Run vitals":
    - text: HP
    - strong: 100 / 100
    - text: Time
    - strong: 00:04
    - text: Wave
    - strong: "0"
  - region "Gold pouch":
    - strong: "0"
  - region "Active weapon":
    - strong: Spark Rig
    - button "Prospector permission chip":
      - text: the Prospector
      - strong: L0
      - text: suggest-only
  - region "Experience":
    - text: Level
    - strong: "1"
    - strong: 0 / 12 XP
  - region "Build":
    - button "Build"
  - button "Pause the claim": catch your breathⅡ
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | import { Balance } from '../src/game/Balance';
  3   | import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
  4   | import { profileDataKey } from '../src/game/ProfileStorage';
  5   | import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
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
> 49  |   await expect(page.getByTestId('playbook-toggle')).toBeVisible();
      |                                                     ^ Error: expect(locator).toBeVisible() failed
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
  106 |   await page.getByTestId('playbook-toggle').click();
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