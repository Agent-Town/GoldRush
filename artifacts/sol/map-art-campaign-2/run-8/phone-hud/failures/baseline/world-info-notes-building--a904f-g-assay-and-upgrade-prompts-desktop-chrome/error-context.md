# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: world-info-notes.spec.ts >> building notes sit with existing assay and upgrade prompts
- Location: e2e/world-info-notes.spec.ts:196:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByTestId('world-info-note')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('world-info-note')
    14 × locator resolved to <details name="" hidden="" aria-live="polite" data-compact="true" data-testid="world-info-note" data-object-class="assay_office" class="world-info-note world-info-note--compact">…</details>
       - unexpected value "hidden"

```

```yaml
- main:
  - text: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
  - region "Run vitals":
    - text: HP
    - strong: 100 / 100
    - text: Time
    - strong: 00:58
    - text: Wave
    - strong: "0"
  - region "Gold pouch":
    - text: Gold
    - strong: 1735/350
  - region "Active weapon":
    - text: Weapon
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
    - button "Build - Close" [pressed]
  - button "Pause the claim": catch your breath
  - status:
    - text: Palisade · Tier 1
    - button "Upgrade to T2 (90g)"
    - button "Tear down (+5g)"
    - text: invested 10g → returns 5g. The timber comes back, the labor doesn't.
  - status:
    - paragraph: Tavernkeeper
    - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
    - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
- button "▸ Game tuning"
- status: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  1   | import { mkdirSync } from 'node:fs';
  2   | import path from 'node:path';
  3   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  4   | import { Balance } from '../src/game/Balance';
  5   | import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
  6   | import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
  7   | import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';
  8   | import { RESEARCH_NODES, RESEARCH_STATE_KEY, STEAMWORKS_THRESHOLD } from '../src/meta/ResearchTree';
  9   | import type { WorldInfoObjectClass } from '../src/ui/WorldInfoNotes';
  10  | 
  11  | // 2026-07-28 lane-a-build-mode-prompt-spec-realign: the building card is build-mode-only per the owner's 2026-07-12 ruling (tasks/fix-building-prompt-flicker.md:8).
  12  | type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret' | 'assay_office';
  13  | type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
  14  | type BuildEntry = { id: BuildableId; index: number; tier: number; position: { x: number; z: number } };
  15  | type StorageEntry = [string, string];
  16  | 
  17  | const ARTIFACT_DIR = path.resolve('artifacts/world-info-notes');
  18  | const PROFILE_ID = 'robin';
  19  | const TAKEN_FRONTIER_NODES = RESEARCH_NODES.map((node) => node.id);
  20  | 
  21  | // 2026-07-28 F-1169: keep these at the nearest measured terrain-valid, mutually clear cells.
  22  | const BUILD_NOTE_CASES: Array<{ id: BuildableId; x: number; z: number; objectClass: WorldInfoObjectClass; text: string }> = [
  23  |   { id: 'sentry_beacon', x: -16, z: 14, objectClass: 'sentry_beacon', text: 'brass lamp' },
  24  |   { id: 'palisade', x: -10, z: 14, objectClass: 'palisade', text: 'Higher tier means more hit points' },
  25  |   { id: 'stockpile', x: 9, z: 13, objectClass: 'stockpile', text: 'bank cap' },
  26  |   { id: 'turret', x: 16, z: 14, objectClass: 'turret', text: 'spark tower' },
  27  |   { id: 'sluice', x: -4, z: 7, objectClass: 'sluice', text: 'Washes gold over time' },
  28  |   { id: 'assay_office', x: 3, z: 7, objectClass: 'assay_office', text: 'Write an order' },
  29  | ];
  30  | 
  31  | function collectErrors(page: Page): ErrorBucket {
  32  |   const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  33  |   page.on('console', (message) => {
  34  |     if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  35  |   });
  36  |   page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  37  |   return bucket;
  38  | }
  39  | 
  40  | async function seedProfile(page: Page, entries: StorageEntry[] = [], hintsSeen: string[] = []): Promise<void> {
  41  |   const profileState: ProfileState = {
  42  |     version: 2,
  43  |     activeId: PROFILE_ID,
  44  |     profiles: [
  45  |       {
  46  |         id: PROFILE_ID,
  47  |         name: 'Robin',
  48  |         createdAt: 1,
  49  |         updatedAt: 1,
  50  |         difficultyPreset: 'trail',
  51  |         hintsSeen,
  52  |       },
  53  |     ],
  54  |   };
  55  |   await page.addInitScript(
  56  |     ({ profileKey, state, seededEntries }) => {
  57  |       localStorage.clear();
  58  |       sessionStorage.clear();
  59  |       localStorage.setItem(profileKey, JSON.stringify(state));
  60  |       for (const [key, value] of seededEntries) localStorage.setItem(key, value);
  61  |     },
  62  |     { profileKey: PROFILE_KEY, state: profileState, seededEntries: entries },
  63  |   );
  64  | }
  65  | 
  66  | async function openGame(page: Page, query: string, entries: StorageEntry[] = []): Promise<ErrorBucket> {
  67  |   await seedProfile(page, entries);
  68  |   const errors = collectErrors(page);
  69  |   await page.goto(`/${query}`);
  70  |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  71  |   await dismissBriefing(page);
  72  |   return errors;
  73  | }
  74  | 
  75  | async function dismissBriefing(page: Page): Promise<void> {
  76  |   const briefing = page.getByTestId('contract-briefing');
  77  |   if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  78  |   await expect(briefing).toBeHidden();
  79  | }
  80  | 
  81  | async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  82  |   mkdirSync(ARTIFACT_DIR, { recursive: true });
  83  |   await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
  84  | }
  85  | 
  86  | async function teleport(page: Page, x: number, z: number): Promise<void> {
  87  |   await page.evaluate((point) => window.__GR_TEST__?.teleport(point.x, point.z), { x, z });
  88  |   await page.waitForTimeout(80);
  89  | }
  90  | 
  91  | async function clearNote(page: Page): Promise<void> {
  92  |   await teleport(page, 30, 30);
  93  |   await expect(page.getByTestId('world-info-note')).toBeHidden();
  94  | }
  95  | 
  96  | async function expectNote(page: Page, objectClass: WorldInfoObjectClass, text?: string): Promise<void> {
  97  |   const note = page.getByTestId('world-info-note');
> 98  |   await expect(note).toBeVisible();
      |                      ^ Error: expect(locator).toBeVisible() failed
  99  |   await expect(note).toHaveAttribute('data-object-class', objectClass);
  100 |   if (text) await expect(note).toContainText(text);
  101 | }
  102 | 
  103 | async function grantGold(page: Page, amount: number): Promise<void> {
  104 |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
  105 |   await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  106 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBe(before + amount);
  107 | }
  108 | 
  109 | async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<BuildEntry> {
  110 |   await teleport(page, x, z + 2);
  111 |   const before = await buildableCount(page, id);
  112 |   await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  113 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  114 |   await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  115 |   await expect.poll(() => buildableCount(page, id)).toBe(before + 1);
  116 |   await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  117 |   const entry = await page.evaluate(
  118 |     (buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((candidate) => candidate.id === buildableId) ?? null,
  119 |     id,
  120 |   );
  121 |   expect(entry).toBeTruthy();
  122 |   return entry as BuildEntry;
  123 | }
  124 | 
  125 | async function buildableCount(page: Page, id: BuildableId): Promise<number> {
  126 |   return page.evaluate(
  127 |     (buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0,
  128 |     id,
  129 |   );
  130 | }
  131 | 
  132 | async function approachTownBuilding(page: Page, id: 'tavern' | 'claim_office' | 'schoolhouse' | 'assay_office'): Promise<void> {
  133 |   const approach = await page.evaluate((buildingId) => window.__GR_TOWN_DIAGNOSTICS__?.plaza.slots.find((slot) => slot.id === buildingId)?.approach ?? null, id);
  134 |   if (!approach) throw new Error(`${id} is absent from town plaza diagnostics`);
  135 |   await page.evaluate((point) => window.__GR_TOWN_DIAGNOSTICS__?.teleport(point.x, point.z), approach);
  136 |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe(id);
  137 | }
  138 | 
  139 | function assertNoErrors(errors: ErrorBucket): void {
  140 |   expect(errors.consoleErrors).toEqual([]);
  141 |   expect(errors.pageErrors).toEqual([]);
  142 | }
  143 | 
  144 | function scopedEntry(key: string, value: string): StorageEntry[] {
  145 |   return [
  146 |     [key, value],
  147 |     [profileDataKey(PROFILE_ID, key), value],
  148 |   ];
  149 | }
  150 | 
  151 | function metaEntry(tracks: { territory: number; science: number; hero: number; agent: number }): StorageEntry[] {
  152 |   return scopedEntry(META_PROGRESS_KEY, JSON.stringify({ version: 1, tracks }));
  153 | }
  154 | 
  155 | function researchEntry(steps = 0): StorageEntry[] {
  156 |   return scopedEntry(RESEARCH_STATE_KEY, JSON.stringify({ version: 1, taken: TAKEN_FRONTIER_NODES, overflow: steps, proposalSalt: 0 }));
  157 | }
  158 | 
  159 | function megaprojectResetEntry(): StorageEntry[] {
  160 |   return scopedEntry(MEGAPROJECT_STATE_KEY, JSON.stringify({ version: 1, projects: {} }));
  161 | }
  162 | 
  163 | test('run-world notes explain seams, stake, ford, prospector, and soften after two approaches', async ({ page }, testInfo) => {
  164 |   const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&nokill&seed=world-info-core');
  165 | 
  166 |   const seam = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((node) => node.active)?.position ?? null);
  167 |   expect(seam).toBeTruthy();
  168 |   await teleport(page, seam!.x, seam!.z);
  169 |   await expectNote(page, 'gold_seam', 'pan works itself');
  170 |   await shot(page, testInfo, 'gold-seam-note');
  171 |   await clearNote(page);
  172 |   await teleport(page, seam!.x, seam!.z);
  173 |   await expectNote(page, 'gold_seam', 'pan works itself');
  174 |   await expect(page.getByTestId('world-info-note-body')).toBeVisible();
  175 |   await clearNote(page);
  176 |   await teleport(page, seam!.x, seam!.z);
  177 |   await expectNote(page, 'gold_seam');
  178 |   await expect(page.getByTestId('world-info-note')).toHaveAttribute('data-compact', 'true');
  179 |   await expect(page.getByTestId('world-info-note-body')).toBeHidden();
  180 | 
  181 |   await teleport(page, 0, 12);
  182 |   await expectNote(page, 'claim_stake', 'Lose it and the run is done');
  183 |   await shot(page, testInfo, 'claim-stake-note');
  184 | 
  185 |   await teleport(page, 0, 0);
  186 |   await expectNote(page, 'ford', 'only crossing');
  187 | 
  188 |   const prospector = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.embodiment.position ?? null);
  189 |   expect(prospector).toBeTruthy();
  190 |   await teleport(page, prospector!.x, prospector!.z);
  191 |   await expectNote(page, 'prospector', 'Your deputy');
  192 | 
  193 |   assertNoErrors(errors);
  194 | });
  195 | 
  196 | test('building notes sit with existing assay and upgrade prompts', async ({ page }) => {
  197 |   const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&nokill&nosteal&seed=world-info-buildings');
  198 |   await grantGold(page, 2_000);
```