# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: advance-stream-cache-reuse.spec.ts >> compares advance-stream cache reuse under production headers
- Location: e2e/advance-stream-cache-reuse.spec.ts:67:1

# Error details

```
Error: the dev-server arm must run before the production arm

expect(received).toBeDefined()

Received: undefined
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - generic "Wave status":
        - generic:
          - generic: West ridge shadows want the gold!
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 0 / 100
        - generic:
          - generic: Time
          - strong: 00:43
        - generic:
          - generic: Wave
          - strong: "1"
      - region "Gold pouch":
        - generic: Gold
        - strong: "0"
      - region "Active weapon":
        - generic: Weapon
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
          - strong: 8 / 12 XP
      - region "Build":
        - button "Build" [ref=e10]
      - button "Pause the claim" [ref=e11]: P - catch your breath
    - region "Run ledger" [ref=e12]:
      - generic [ref=e13]:
        - paragraph [ref=e14]: The claim went quiet.
        - heading "Run Ledger" [level=1] [ref=e15]
        - paragraph [ref=e16]: The claim was overrun. The gold remembers.
        - generic [ref=e17]:
          - generic [ref=e18]:
            - term [ref=e19]: Time Held
            - definition [ref=e20]: 00:43
          - generic [ref=e21]:
            - term [ref=e22]: Claim Jumpers Turned Back
            - definition [ref=e23]: "11"
          - generic [ref=e24]:
            - term [ref=e25]: Waves Survived
            - definition [ref=e26]: "1"
          - generic [ref=e27]:
            - term [ref=e28]: Gold Panned
            - definition [ref=e29]: "0"
          - generic [ref=e30]:
            - term [ref=e31]: Gold Sluiced
            - definition [ref=e32]: "0"
          - generic [ref=e33]:
            - term [ref=e34]: Stolen / Reclaimed
            - definition [ref=e35]: 0 / 0
          - generic [ref=e36]:
            - term [ref=e37]: Spent
            - definition [ref=e38]: "0"
          - generic [ref=e39]:
            - term [ref=e40]: Beacons Built
            - definition [ref=e41]: "0"
          - generic [ref=e42]:
            - term [ref=e43]: Buildings Built / Lost / Repaired
            - definition [ref=e44]: 0 / 0 / 0
          - generic [ref=e45]:
            - term [ref=e46]: Spark / Blast Damage
            - definition [ref=e47]: 316 / 0
          - generic [ref=e48]:
            - term [ref=e49]: Blast Toggles
            - definition [ref=e50]: "0"
          - generic [ref=e51]:
            - term [ref=e52]: Blast Charge Time
            - definition [ref=e53]: 00:00
          - generic [ref=e54]:
            - term [ref=e55]: Upgrades Taken
            - definition [ref=e56]: none
        - paragraph [ref=e57]: "Science: 0 steps - 6 to the Steamworks"
        - paragraph [ref=e58]: Recorded for the claim of Quartz Hill.
        - region "Research proposal" [ref=e59]:
          - paragraph [ref=e60]: Research pick 1 of 1
          - heading "The Elder proposes..." [level=2] [ref=e61]
          - generic [ref=e62]:
            - 'button "1 Advances economy Assay Grading Effect: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight. EVERY RUN" [active] [ref=e63]':
              - generic [ref=e64]: "1"
              - generic [ref=e65]: Advances economy
              - strong [ref=e66]: Assay Grading
              - generic [ref=e67]: "Effect: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight."
              - generic [ref=e69]: EVERY RUN
            - 'button "2 Advances arsenal Chain Spark Primer Effect: Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate. EVERY RUN" [ref=e70]':
              - generic [ref=e71]: "2"
              - generic [ref=e72]: Advances arsenal
              - strong [ref=e73]: Chain Spark Primer
              - generic [ref=e74]: "Effect: Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate."
              - generic [ref=e76]: EVERY RUN
          - paragraph [ref=e77]: Skip chooses neither proposal.
        - region "Best Claims" [ref=e78]:
          - heading "Best Claims" [level=2] [ref=e79]
          - list [ref=e80]:
            - listitem [ref=e81]:
              - generic [ref=e82]: wave 1 · baseless
              - strong [ref=e83]: OVERRUN
              - generic [ref=e84]: Robin · 1 waves · 00:43 · 11 turned back · 0 gold · spark 316 / blast 0
        - generic [ref=e85]:
          - button "Keep this tape" [ref=e86]
          - button "Return to Town" [ref=e87]
          - button "Try Again" [ref=e88]
    - status [ref=e89] [cursor=pointer]:
      - generic [ref=e90]:
        - paragraph [ref=e91]: Assay Clerk
        - paragraph [ref=e92]: "The ledger gains a page: Claim Jumper measurements."
        - paragraph [ref=e93]: Open it before the next trail.
    - text: None None None
  - generic [ref=e94]:
    - button "▸ Game tuning" [ref=e95] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e96]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  1   | import { execFile } from 'node:child_process';
  2   | import { access, mkdir, rm, writeFile } from 'node:fs/promises';
  3   | import { tmpdir } from 'node:os';
  4   | import { join } from 'node:path';
  5   | import { promisify } from 'node:util';
  6   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  7   | import { preview as startVitePreview, type PreviewServer } from 'vite';
  8   | import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
  9   | import {
  10  |   FIRST_CLAIM_DONE_KEY,
  11  |   PROFILE_KEY,
  12  |   SCOREBOARD_KEY,
  13  |   TOWN_NAME_KEY,
  14  |   profileDataKey,
  15  |   type ProfileState,
  16  | } from '../src/game/ProfileStorage';
  17  | 
  18  | // This probe asserts only that its instrument observed both sides of the cache
  19  | // question. The answer itself becomes a regression assertion only after it is known.
  20  | const BOOT_FLAGS = 'debug&timescale=24&nolevel&seed=advance-stream-walkthrough';
  21  | const PRODUCTION_CACHE_CONTROL = 'public, max-age=31536000, immutable';
  22  | const execFileAsync = promisify(execFile);
  23  | 
  24  | type Bucket = 'DOUBLE-DOWNLOAD' | 'REVALIDATED' | 'OVERLAP' | 'CACHE-HIT';
  25  | type Fetch = {
  26  |   requestId: string;
  27  |   url: string;
  28  |   door: string;
  29  |   startedAt: number;
  30  |   wallTime: number;
  31  |   prefetch: boolean;
  32  |   servedFromCache: boolean;
  33  |   fromDiskCache: boolean;
  34  |   fromPrefetchCache: boolean;
  35  |   status?: number;
  36  |   finishedAt?: number;
  37  |   failedAt?: number;
  38  |   encodedDataLength?: number;
  39  |   cacheControl?: string;
  40  | };
  41  | type DoorRow = {
  42  |   door: string;
  43  |   doubleDownload: number;
  44  |   revalidated: number;
  45  |   overlap: number;
  46  |   cacheHit: number;
  47  |   wireBytes: number;
  48  | };
  49  | type ProbeResult = {
  50  |   arm: 'dev-server' | 'production-headers';
  51  |   project: string;
  52  |   cacheControl: string[];
  53  |   doorRows: DoorRow[];
  54  |   observed: Fetch[];
  55  |   repeatedUrls: Array<{ url: string; fetches: Fetch[] }>;
  56  | };
  57  | 
  58  | const devResults = new Map<string, ProbeResult>();
  59  | 
  60  | test('measures advance-stream cache reuse without route interception', async ({ page }, testInfo) => {
  61  |   const result = await measure(page, testInfo, 'dev-server', '/');
  62  |   devResults.set(testInfo.project.name, result);
  63  |   await writeReport(`artifacts/advance-stream-cache-reuse-${testInfo.project.name}.md`, renderArm(result));
  64  | });
  65  | 
  66  | // The production answer is genuinely unknown: assert only instrument validity, never its outcome.
  67  | test('compares advance-stream cache reuse under production headers', async ({ page }, testInfo) => {
  68  |   test.setTimeout(180_000);
  69  |   const preview = await startPreview();
  70  |   try {
  71  |     const production = await measure(page, testInfo, 'production-headers', preview.url);
  72  |     const dev = devResults.get(testInfo.project.name);
> 73  |     expect(dev, 'the dev-server arm must run before the production arm').toBeDefined();
      |                                                                          ^ Error: the dev-server arm must run before the production arm
  74  |     await writeReport(`artifacts/advance-stream-cache-reuse-headers-${testInfo.project.name}.md`, renderComparison(dev!, production));
  75  |   } finally {
  76  |     await preview.server.close();
  77  |   }
  78  | });
  79  | 
  80  | async function measure(
  81  |   page: Page,
  82  |   testInfo: TestInfo,
  83  |   arm: ProbeResult['arm'],
  84  |   targetUrl: string,
  85  | ): Promise<ProbeResult> {
  86  |   test.setTimeout(180_000);
  87  |   await seedProfile(page);
  88  |   const errors = collectErrors(page);
  89  |   const cdp = await page.context().newCDPSession(page);
  90  |   await cdp.send('Network.enable');
  91  |   const fetches = new Map<string, Fetch>();
  92  |   let currentDoor = 'menu';
  93  | 
  94  |   cdp.on('Network.requestWillBeSent', (event) => {
  95  |     if (!isGlbRequest(event.request.url)) return;
  96  |     fetches.set(event.requestId, {
  97  |       requestId: event.requestId,
  98  |       url: event.request.url,
  99  |       door: currentDoor,
  100 |       startedAt: event.timestamp,
  101 |       wallTime: event.wallTime,
  102 |       prefetch: Object.entries(event.request.headers).some(
  103 |         ([name, value]) => name.toLowerCase() === 'x-gold-rush-prefetch' && value === '1',
  104 |       ),
  105 |       servedFromCache: false,
  106 |       fromDiskCache: false,
  107 |       fromPrefetchCache: false,
  108 |     });
  109 |   });
  110 |   cdp.on('Network.requestServedFromCache', ({ requestId }) => {
  111 |     const fetch = fetches.get(requestId);
  112 |     if (fetch) fetch.servedFromCache = true;
  113 |   });
  114 |   cdp.on('Network.responseReceived', ({ requestId, response }) => {
  115 |     const fetch = fetches.get(requestId);
  116 |     if (!fetch) return;
  117 |     fetch.fromDiskCache = response.fromDiskCache ?? false;
  118 |     fetch.fromPrefetchCache = response.fromPrefetchCache ?? false;
  119 |     fetch.status ??= response.status;
  120 |     const cacheControl = Object.entries(response.headers).find(([name]) => name.toLowerCase() === 'cache-control')?.[1];
  121 |     if (cacheControl !== undefined) fetch.cacheControl = String(cacheControl);
  122 |   });
  123 |   cdp.on('Network.responseReceivedExtraInfo', ({ requestId, statusCode }) => {
  124 |     const fetch = fetches.get(requestId);
  125 |     if (fetch) fetch.status = statusCode;
  126 |   });
  127 |   cdp.on('Network.loadingFinished', ({ requestId, timestamp, encodedDataLength }) => {
  128 |     const fetch = fetches.get(requestId);
  129 |     if (!fetch) return;
  130 |     fetch.finishedAt = timestamp;
  131 |     fetch.encodedDataLength = encodedDataLength;
  132 |   });
  133 |   cdp.on('Network.loadingFailed', ({ requestId, timestamp }) => {
  134 |     const fetch = fetches.get(requestId);
  135 |     if (fetch) fetch.failedAt = timestamp;
  136 |   });
  137 | 
  138 |   await page.goto(targetUrl);
  139 |   await expect.poll(() => [...fetches.values()].filter(({ prefetch, finishedAt }) => prefetch && finishedAt !== undefined).length, { timeout: 20_000 }).toBeGreaterThan(0);
  140 |   await page.evaluate((flags) => history.replaceState(null, '', `/?${flags}`), BOOT_FLAGS);
  141 | 
  142 |   currentDoor = 'town';
  143 |   await page.getByTestId('start-menu-enter-town').click();
  144 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  145 |   await openBoard(page);
  146 | 
  147 |   currentDoor = 'contract1';
  148 |   await page.getByTestId('contract-launch-the-claim').click();
  149 |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  150 |   await forceSecure(page);
  151 |   await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 15_000 });
  152 |   await page.getByTestId('bank-secured-claim').click();
  153 |   await expect(page.getByTestId('stake-again')).toHaveText('Return to Town', { timeout: 8_000 });
  154 | 
  155 |   currentDoor = 'town-return';
  156 |   await page.getByTestId('stake-again').click();
  157 |   await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 8_000 });
  158 |   await dismissStoryBeat(page);
  159 | 
  160 |   currentDoor = 'contract2';
  161 |   await page.getByTestId('contract-launch-e1-dry-gulch').click();
  162 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  163 |   await expect.poll(() => [...fetches.values()].filter(({ finishedAt, failedAt }) => finishedAt === undefined && failedAt === undefined).length, { timeout: 20_000 }).toBe(0);
  164 | 
  165 |   const observed = [...fetches.values()].sort((a, b) => a.startedAt - b.startedAt);
  166 |   const demands = observed.filter(({ prefetch }) => !prefetch);
  167 |   const classified = demands.map((fetch) => ({ fetch, bucket: classify(fetch, observed) }));
  168 |   const doors = ['menu', 'town', 'contract1', 'town-return', 'contract2'];
  169 |   const doorRows = doors.map((door) => {
  170 |     const buckets = classified.filter(({ fetch }) => fetch.door === door).map(({ bucket }) => bucket);
  171 |     return {
  172 |       door,
  173 |       doubleDownload: buckets.filter((bucket) => bucket === 'DOUBLE-DOWNLOAD').length,
```