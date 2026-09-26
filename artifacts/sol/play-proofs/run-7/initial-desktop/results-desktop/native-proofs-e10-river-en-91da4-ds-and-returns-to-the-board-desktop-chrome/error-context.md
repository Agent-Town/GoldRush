# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e10-river-ending.spec.ts >> e10-river plays to its authored terminal, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:815:5

# Error details

```
Error: native re-pull remains required

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - generic:
    - generic "Wave status":
      - generic:
        - generic: "the Prospector: does trusted chores. Chip by weapon; claim wins grow it."
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 100 / 100
      - generic:
        - generic: Time
        - strong: 00:30
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
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 00:29 - Gathered 8 XP
      - button "Tape Reel" [ref=e10]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "2"
        - strong: 16 / 20 XP
    - region "Build":
      - button "Build" [ref=e12]
    - button "Pause the claim" [ref=e13]: P - catch your breath
    - group [ref=e14]:
      - generic "Claim Stake" [ref=e15] [cursor=pointer]
  - region
```

# Test source

```ts
  36  |     if (ceremony && new URL(request.url()).pathname === '/api/standings') standings.push(`${request.method()} ${request.url()}`);
  37  |   });
  38  |   // Count real requests, but never let this test publish county data.
  39  |   await page.route('https://agenttown.app/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  40  |   await page.exposeFunction('recordRiverObservation', (observation: Observation) => {
  41  |     observations.push(observation);
  42  |     if (observation.kind === 'first-gold' && !panShot) {
  43  |       panShot = page.screenshot({ path: path.join(root, `pan-${info.project.name}.png`) });
  44  |     }
  45  |   });
  46  |   await page.addInitScript(({ key }) => {
  47  |     let boot = false, first = false, second = false;
  48  |     const timer = setInterval(() => {
  49  |       const d = window.__THREE_GAME_DIAGNOSTICS__;
  50  |       if (!d || !location.search.includes('nowaves') || d.frame < 13) return;
  51  |       const raw = localStorage.getItem(key);
  52  |       const river = (JSON.parse(raw ?? '[]') as Score[]).filter(s => s.contractId === 'e10-river');
  53  |       let kind = '';
  54  |       if (!boot) { boot = true; kind = 'boot'; }
  55  |       else if (!first && d.economy.gold >= 5) { first = true; kind = 'first-gold'; }
  56  |       else if (!second && d.economy.gold >= 10) { second = true; kind = 'second-gold'; clearInterval(timer); }
  57  |       if (kind) void (window as unknown as { recordRiverObservation: (o: Observation) => Promise<void> }).recordRiverObservation({ kind, sim: d.timeAlive, gold: d.economy.gold, raw, river });
  58  |     }, 16);
  59  |   }, { key: scoreKey });
  60  | });
  61  | 
  62  | nativeProof('e10-river', 7);
  63  | 
  64  | test.afterEach(async ({ page }, info) => {
  65  |   if (info.status === 'skipped') return;
  66  |   info.setTimeout(240_000);
  67  |   const result: Record<string, unknown> = { observations, errors, standings, repull: { ok: false, detail: 'not yet measured' } };
  68  |   try {
  69  |     await panShot;
  70  |     const row = JSON.parse(await readFile(path.join(root, `row-${info.project.name}.json`), 'utf8'));
  71  |     result.nativeCells = { banks: row.banks, reload: row.reload, board: row.board, secures: row.secures };
  72  |     expect(row.banks.ok, row.banks.detail).toBe(true);
  73  |     expect(row.reload.ok, row.reload.detail).toBe(true);
  74  |     const first = observations.find(o => o.kind === 'first-gold');
  75  |     const second = observations.find(o => o.kind === 'second-gold');
  76  |     expect(observations.find(o => o.kind === 'boot')?.river).toEqual([]);
  77  |     expect(first?.river).toHaveLength(1);
  78  |     expect(first!.river[0]).toMatchObject({ secured: true, waves: 0, gold: 5 });
  79  |     expect(second?.raw, 'second pan writes nothing more').toBe(first!.raw);
  80  |     expect(await scores(page), 'native bank/reload cells retain the first pan score').toBe(first!.raw);
  81  |     result.firstGoldTime = first!.river[0].timeAlive;
  82  |     result.firstGold = first!.river[0].gold;
  83  |     await page.getByTestId('contract-chapter-tab-epoch-10-deepsky').click();
  84  |     const best = page.getByTestId('contract-best-e10-river');
  85  |     await best.scrollIntoViewIfNeeded();
  86  |     await expect(best).toHaveText('Secured: wave 0, 5 gold');
  87  |     await page.screenshot({ path: path.join(root, `book-${info.project.name}.png`) });
  88  |     await best.screenshot({ path: path.join(root, `bank-cell-${info.project.name}.png`) });
  89  |     await page.reload();
  90  |     expect(await scores(page), 'a literal plain reload preserves score bytes').toBe(first!.raw);
  91  |     result.literalReload = true;
  92  |     // Return through the actual browser history to the earned Press, if retained.
  93  |     // A reconstructed Press or staged charter would not prove a human re-pull.
  94  |     const history: string[] = [];
  95  |     for (let step = 0; step < 6; step++) {
  96  |       if (!await page.goBack({ waitUntil: 'domcontentloaded' })) break;
  97  |       history.push(page.url());
  98  |       if (await page.getByTestId('e10-river-lever').isVisible().catch(() => false)) {
  99  |         await page.getByTestId('e10-river-lever').click();
  100 |         await page.waitForURL(url => url.searchParams.has('nowaves'));
  101 |         await page.getByTestId('contract-briefing-dismiss').click({ timeout: 60_000 });
  102 |         await pan(page);
  103 |         expect(await scores(page)).toBe(first!.raw);
  104 |         result.repull = { ok: true, detail: 'real earned Press retained by browser history; clicked and panned again' };
  105 |         break;
  106 |       }
  107 |     }
  108 |     result.history = history;
  109 |     if (!(result.repull as { ok: boolean }).ok) result.repull = { ok: false, detail: 'Browser history did not retain the earned Press; re-pull needs another earned Last Claim journey. No charter staged.' };
  110 |     result.ceremonyStandings = [...standings];
  111 |     expect(standings, 'zero standings requests during the ceremony').toEqual([]);
  112 |     ceremony = false;
  113 |     // Measure the raw route using the real Book button, without constructing its URL.
  114 |     await page.goto('/');
  115 |     await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  116 |     await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  117 |     await tavern(page);
  118 |     await page.getByTestId('town-open-board').click();
  119 |     await page.getByTestId('contract-chapter-tab-epoch-10-deepsky').click();
  120 |     await page.getByTestId('contract-launch-e10-river').click();
  121 |     await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 60_000 });
  122 |     expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e10-river');
  123 |     await page.getByTestId('contract-briefing-dismiss').click();
  124 |     if (await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)) await page.keyboard.press('KeyP');
  125 |     const rawSamples = [];
  126 |     for (const target of [11.5, 26.5, 30]) {
  127 |       await page.waitForFunction(t => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) >= t, target, { polling: 16, timeout: 45_000 });
  128 |       rawSamples.push(await page.evaluate(target => {
  129 |         const d = window.__THREE_GAME_DIAGNOSTICS__!;
  130 |         return { target, sim: d.timeAlive, alive: d.enemiesAlive, wave: d.wave, gold: d.economy.gold };
  131 |       }, target));
  132 |     }
  133 |     result.rawRoute = rawSamples;
  134 |     await page.screenshot({ path: path.join(root, `raw-${info.project.name}.png`) });
  135 |     expect(errors).toEqual({ console: [], page: [] });
> 136 |     expect((result.repull as { ok: boolean }).ok, 'native re-pull remains required').toBe(true);
      |                                                                                      ^ Error: native re-pull remains required
  137 |   } finally {
  138 |     result.observations = observations; result.errors = errors;
  139 |     await writeFile(path.join(root, `ending-${info.project.name}.json`), JSON.stringify(result, null, 2) + '\n');
  140 |   }
  141 | });
  142 | 
  143 | async function steer(page: Page, dx: number, dz: number, ms: number) {
  144 |   const keys = [Math.abs(dx) > .35 ? dx > 0 ? 'KeyD' : 'KeyA' : '', Math.abs(dz) > .35 ? dz > 0 ? 'KeyS' : 'KeyW' : ''].filter(Boolean);
  145 |   for (const key of keys) await page.keyboard.down(key);
  146 |   await page.waitForTimeout(ms);
  147 |   for (const key of keys) await page.keyboard.up(key);
  148 | }
  149 | async function tavern(page: Page) {
  150 |   for (let step = 0; step < 70; step++) {
  151 |     const t = await page.evaluate(() => {
  152 |       const d = window.__GR_TOWN_DIAGNOSTICS__!;
  153 |       return { prompt: d.activePrompt, hero: d.player, target: d.buildings.find(b => b.id === 'tavern')?.approach };
  154 |     });
  155 |     if (t.prompt === 'tavern') return;
  156 |     if (!t.target) throw new Error('no tavern approach');
  157 |     await steer(page, t.target.x - t.hero.x, t.target.z - t.hero.z, 170);
  158 |   }
  159 |   throw new Error('tavern not reached');
  160 | }
  161 | async function pan(page: Page) {
  162 |   for (let step = 0; step < 100; step++) {
  163 |     const d = await page.evaluate(() => {
  164 |       const d = window.__THREE_GAME_DIAGNOSTICS__!;
  165 |       return { hero: d.heroPos, gold: d.economy.gold, paused: d.paused, nodes: d.harvest.activeNodes.filter(n => n.active) };
  166 |     });
  167 |     if (d.gold >= 5) return;
  168 |     if (d.paused) { await page.keyboard.press('KeyP'); continue; }
  169 |     const n = d.nodes.filter(n => Math.sign(n.position.z) === Math.sign(d.hero.z)).sort((a, b) => Math.hypot(a.position.x-d.hero.x, a.position.z-d.hero.z)-Math.hypot(b.position.x-d.hero.x,b.position.z-d.hero.z))[0];
  170 |     if (!n) throw new Error('no seam on this bank');
  171 |     const gap = Math.hypot(n.position.x-d.hero.x,n.position.z-d.hero.z);
  172 |     if (gap <= 1.1) await page.waitForTimeout(100);
  173 |     else await steer(page,n.position.x-d.hero.x,n.position.z-d.hero.z,Math.min(160,Math.max(16,gap*18)));
  174 |   }
  175 |   throw new Error('no gold landed');
  176 | }
  177 | 
```