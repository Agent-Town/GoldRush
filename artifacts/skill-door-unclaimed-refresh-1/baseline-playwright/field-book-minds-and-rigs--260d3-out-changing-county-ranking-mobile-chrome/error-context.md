# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: field-book.spec.ts >> minds and rigs aggregate the same standings without changing county ranking
- Location: e2e/field-book.spec.ts:129:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 400
```

# Test source

```ts
  47  | const RUN_START = {
  48  |   meta: { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } },
  49  |   research: {
  50  |     version: 1,
  51  |     progress: { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } },
  52  |     taken: [],
  53  |     proposalSalt: 0,
  54  |     pinnedTarget: null,
  55  |   },
  56  | };
  57  | 
  58  | function tape(id: string, contractId: string, seed: string, waves: number, timeAlive: number, gold: number): Record<string, unknown> {
  59  |   return {
  60  |     version: 2, id, createdAt: 1, kept: true, contract: contractId, seed, difficulty: 'trail',
  61  |     simVersion: 1, runStart: RUN_START,
  62  |     inputLog: {
  63  |       version: 1, name: id, contractId, seed, difficultyPreset: 'trail', stepSeconds: 1 / 30,
  64  |       start: { x: 0, z: 12 }, durationTicks: 1, entries: [], truncated: null, primarySlot: 0, streams: [],
  65  |     },
  66  |     eventLogHash: 'fnv1a32:1234abcd',
  67  |     outcome: { reason: 'secured', secured: true, waves, timeAlive, gold },
  68  |   };
  69  | }
  70  | 
  71  | function standing(anonId: string, contractId: string, waves: number, stack?: Record<string, unknown>): Record<string, unknown> {
  72  |   const score = { secured: true, waves, timeAlive: 600 + waves, gold: waves * 10, baseValue: waves * 20 };
  73  |   const seed = `field-book-${anonId}`;
  74  |   const runTape = tape(`fb-${anonId.slice(0, 4)}-${contractId}`, contractId, seed, score.waves, score.timeAlive, score.gold);
  75  |   return {
  76  |     contractId,
  77  |     epochId: 'epoch-1-frontier',
  78  |     score,
  79  |     profileName: 'Field Book',
  80  |     anonId,
  81  |     difficulty: 'trail',
  82  |     seed,
  83  |     seedMode: 'live',
  84  |     seedHash: 'a'.repeat(64),
  85  |     // The endpoint recomputes sha256(inputLog) and refuses a tape whose hash disagrees, so the
  86  |     // fixture derives the hash instead of declaring one.
  87  |     inputLogHash: createHash('sha256').update(JSON.stringify((runTape as { inputLog: unknown }).inputLog)).digest('hex'),
  88  |     tape: runTape,
  89  |     ...(stack ? { stack } : {}),
  90  |   };
  91  | }
  92  | 
  93  | async function post(kv: MockKV, body: unknown): Promise<Response> {
  94  |   return standingsRoute({ request: request('POST', '', body), env: { TELEMETRY: kv } });
  95  | }
  96  | 
  97  | function collectErrors(page: Page): { console: string[]; page: string[] } {
  98  |   const errors = { console: [] as string[], page: [] as string[] };
  99  |   page.on('console', (message) => {
  100 |     if (message.type() === 'error') errors.console.push(message.text());
  101 |   });
  102 |   page.on('pageerror', (error) => errors.page.push(error.message));
  103 |   return errors;
  104 | }
  105 | 
  106 | // The Drill Yard takes no entries and prints no ranks — owner ruling 2026-08-09, verbatim:
  107 | // "the Drill Yard is not a contract that needs a ladder - it is the training ground". These
  108 | // assertions used to live inside the cost-fields test below, where a grep for the Drill Yard
  109 | // among test names could not find them and retiring the host would have deleted them silently
  110 | // (F-1596-1). A ruling's only defence gets its own title.
  111 | test('the Drill Yard is the training ground — standings refuse it on both POST and GET', async () => {
  112 |   const kv = makeKv();
  113 |   const drillYard = await post(kv, standing('0'.repeat(32), 'e1-drill-yard', 99));
  114 |   expect(drillYard.status).toBe(400);
  115 |   expect(await drillYard.json()).toMatchObject({
  116 |     ok: false,
  117 |     error: 'training_ground',
  118 |     message: 'The Drill Yard is the training ground — practice is its own reward.',
  119 |   });
  120 |   // The key a drill-yard write WOULD have used — the season the county now writes in, so the
  121 |   // refusal is still proved by an absent row rather than by looking in a closed book.
  122 |   expect(await kv.get('standings:s2:epoch-1-frontier:e1-drill-yard')).toBeNull();
  123 |   expect((await standingsRoute({
  124 |     request: request('GET', '?contract=e1-drill-yard&epoch=epoch-1-frontier'),
  125 |     env: { TELEMETRY: kv },
  126 |   })).status).toBe(400);
  127 | });
  128 | 
  129 | test('minds and rigs aggregate the same standings without changing county ranking', async () => {
  130 |   const kv = makeKv();
  131 |   const contracts = ['the-claim', 'e1-dry-gulch', 'e1-night-shift'];
  132 |   const stacks = [
  133 |     { model: 'mind-a', harness: 'rig-x', harnessVersion: 'test', worldModel: 'sim-import', tokensIn: 10, tokensOut: 1, calls: 1 },
  134 |     { model: 'mind-a', harness: 'rig-y', harnessVersion: 'test', tokensIn: 20, tokensOut: 2, calls: 2 },
  135 |     { model: 'mind-b', harness: 'rig-x', harnessVersion: 'test', tokensIn: 30, tokensOut: 3, calls: 3 },
  136 |     { model: 'mind-b', harness: 'rig-y', harnessVersion: 'test' },
  137 |   ];
  138 |   const crownByContract = [0, 3, 1];
  139 |   let fixtureIndex = 0;
  140 |   for (const [contractIndex, contractId] of contracts.entries()) {
  141 |     for (const [stackIndex, stack] of stacks.entries()) {
  142 |       const costs = stack.tokensIn === undefined ? stack : {
  143 |         ...stack,
  144 |         tokensIn: stack.tokensIn + contractIndex,
  145 |         tokensOut: stack.tokensOut + contractIndex,
  146 |       };
> 147 |       expect((await post(kv, standing((fixtureIndex++).toString(16).repeat(32), contractId, crownByContract[contractIndex] === stackIndex ? 40 : 10 + stackIndex, costs))).status).toBe(200);
      |                                                                                                                                                                                    ^ Error: expect(received).toBe(expected) // Object.is equality
  148 |     }
  149 |   }
  150 |   expect((await post(kv, standing('c'.repeat(32), 'the-claim', 1))).status).toBe(200);
  151 |   for (const field of ['tokensIn', 'tokensOut', 'calls']) {
  152 |     for (const value of [-1, 1.5, 1_000_000_000_001]) {
  153 |       expect((await post(kv, standing('d'.repeat(32), 'the-claim', 1, { model: 'invalid', [field]: value }))).status).toBe(400);
  154 |     }
  155 |   }
  156 | 
  157 |   const county = await standingsRoute({
  158 |     request: request('GET', '?contract=the-claim&epoch=epoch-1-frontier'),
  159 |     env: { TELEMETRY: kv },
  160 |   });
  161 |   const countyBody = await county.json() as { board: Array<Record<string, unknown>> };
  162 |   expect(countyBody.board[0]).toMatchObject({ rank: 1, waves: 40, model: 'mind-a', harness: 'rig-x' });
  163 | 
  164 |   const mindsResponse = await standingsRoute({
  165 |     request: request('GET', '?view=byStack&epoch=epoch-1-frontier'),
  166 |     env: { TELEMETRY: kv },
  167 |   });
  168 |   const minds = await mindsResponse.json() as {
  169 |     view: string;
  170 |     byStack: Array<{ model: string; contracts: Array<Record<string, unknown>>; aggregate: Record<string, unknown> }>;
  171 |   };
  172 |   expect(mindsResponse.status).toBe(200);
  173 |   expect(minds.view).toBe('byStack');
  174 |   expect(minds.byStack.find((row) => row.model === 'mind-a')?.aggregate).toMatchObject({
  175 |     standings: 6, contracts: 3, crowns: 2, bestWaves: 40,
  176 |     totalTokensIn: 96, totalTokensOut: 15, totalCalls: 9,
  177 |     declaredCells: 6, undeclaredCells: 0,
  178 |   });
  179 |   expect(minds.byStack.find((row) => row.model === 'mind-b')?.aggregate).toMatchObject({
  180 |     standings: 6, contracts: 3, crowns: 1, bestWaves: 40,
  181 |     totalTokensIn: 93, totalTokensOut: 12, totalCalls: 9,
  182 |     declaredCells: 3, undeclaredCells: 3,
  183 |   });
  184 |   expect(minds.byStack.find((row) => row.model === 'undeclared rider')).toMatchObject({ aggregate: { standings: 1, contracts: 1, crowns: 0 } });
  185 |   const absentCostCell = minds.byStack.find((row) => row.model === 'mind-b')?.contracts.find((cell) => cell.contractId === 'e1-dry-gulch');
  186 |   for (const field of ['tokensIn', 'tokensOut', 'calls']) expect(absentCostCell).not.toHaveProperty(field);
  187 |   expect(minds.byStack.find((row) => row.model === 'mind-a')?.contracts.find((cell) => cell.contractId === 'the-claim')).toMatchObject({ worldModel: 'sim-import' });
  188 |   expect(absentCostCell).not.toHaveProperty('worldModel');
  189 | 
  190 |   const rigsResponse = await standingsRoute({
  191 |     request: request('GET', '?view=byHarness&epoch=epoch-1-frontier'),
  192 |     env: { TELEMETRY: kv },
  193 |   });
  194 |   const rigs = await rigsResponse.json() as {
  195 |     view: string;
  196 |     byHarness: Array<{ harness: string; contracts: Array<Record<string, unknown>>; aggregate: Record<string, unknown> }>;
  197 |   };
  198 |   expect(rigsResponse.status).toBe(200);
  199 |   expect(rigs.view).toBe('byHarness');
  200 |   expect(rigs.byHarness.find((row) => row.harness === 'rig-x')?.aggregate).toMatchObject({
  201 |     standings: 6, contracts: 3, crowns: 1, bestWaves: 40,
  202 |     totalTokensIn: 126, totalTokensOut: 18, totalCalls: 12,
  203 |     declaredCells: 6, undeclaredCells: 0,
  204 |   });
  205 |   expect(rigs.byHarness.find((row) => row.harness === 'rig-y')?.aggregate).toMatchObject({
  206 |     standings: 6, contracts: 3, crowns: 2, bestWaves: 40,
  207 |     totalTokensIn: 63, totalTokensOut: 9, totalCalls: 6,
  208 |     declaredCells: 3, undeclaredCells: 3,
  209 |   });
  210 |   const undeclaredRig = rigs.byHarness.find((row) => row.harness === 'undeclared rig');
  211 |   expect(undeclaredRig).toMatchObject({ aggregate: { standings: 1, contracts: 1, crowns: 0, declaredCells: 0, undeclaredCells: 1 } });
  212 |   expect(undeclaredRig?.aggregate).not.toHaveProperty('totalTokensIn');
  213 | });
  214 | 
  215 | test('plain boot renders and expands the Minds and Rigs tables', async ({ page }, testInfo) => {
  216 |   const errors = collectErrors(page);
  217 |   const now = Date.now();
  218 |   await page.addInitScript(({ key, state }) => {
  219 |     localStorage.clear();
  220 |     sessionStorage.clear();
  221 |     localStorage.setItem(key, JSON.stringify(state));
  222 |   }, { key: PROFILE_KEY, state: PROFILE_STATE });
  223 |   await page.route('**/api/standings**', async (route) => {
  224 |     const url = new URL(route.request().url());
  225 |     const view = url.searchParams.get('view');
  226 |     expect(['byStack', 'byHarness']).toContain(view);
  227 |     expect(url.searchParams.get('epoch')).toBe('epoch-1-frontier');
  228 |     const groups = view === 'byHarness'
  229 |       ? {
  230 |           byHarness: [
  231 |             {
  232 |               harness: 'codex-cli',
  233 |               aggregate: { standings: 1, contracts: 1, crowns: 1, bestWaves: 20, totalTokensIn: 90_000, totalTokensOut: 8_000, totalCalls: 18, declaredCells: 1, undeclaredCells: 0, latestSubmittedAt: now - 60_000 },
  234 |               contracts: [{ contractId: 'the-claim', score: { secured: true, waves: 20, timeAlive: 620, gold: 200, baseValue: 400 }, difficulty: 'trail', tokensIn: 90_000, tokensOut: 8_000, calls: 18, harness: 'codex-cli', harnessVersion: '2026.08', config: 'medium', submittedAt: now - 60_000 }],
  235 |             },
  236 |             {
  237 |               harness: 'unknown-rig',
  238 |               aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 14, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: now - 86_400_000 },
  239 |               contracts: [{ contractId: 'e1-dry-gulch', score: { secured: true, waves: 14, timeAlive: 614, gold: 140, baseValue: 280 }, difficulty: 'vein-hunter', harness: 'unknown-rig', submittedAt: now - 86_400_000 }],
  240 |             },
  241 |             {
  242 |               harness: 'undeclared rig',
  243 |               aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 12, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: now - 120_000 },
  244 |               contracts: [{ contractId: 'the-claim', score: { secured: true, waves: 12, timeAlive: 612, gold: 120, baseValue: 240 }, difficulty: 'greenhorn', submittedAt: now - 120_000 }],
  245 |             },
  246 |           ],
  247 |         }
```