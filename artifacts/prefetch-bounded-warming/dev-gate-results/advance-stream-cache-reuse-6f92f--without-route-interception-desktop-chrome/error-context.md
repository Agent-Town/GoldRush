# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: advance-stream-cache-reuse.spec.ts >> measures advance-stream cache reuse without route interception
- Location: e2e/advance-stream-cache-reuse.spec.ts:60:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "tavern"
Received: null

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - region "Town square":
    - generic:
      - generic:
        - strong: Quartz Hill
        - generic: Town Square
      - generic [ref=e4]:
        - group [ref=e5]:
          - generic "Settings" [ref=e6] [cursor=pointer]
        - button "Exit" [ref=e7] [cursor=pointer]
    - status [ref=e8]:
      - generic [ref=e9]:
        - strong [ref=e10]: Chen Mei
        - generic [ref=e11]: Newsie
        - paragraph [ref=e12]: EXTRA! No fresh ink today.
        - 'button "Read issue #1 again" [ref=e13] [cursor=pointer]'
        - button "Show me around again" [ref=e14] [cursor=pointer]
```

# Test source

```ts
  226 |     await mkdir(lock);
  227 |   } catch (error) {
  228 |     if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
  229 |     await expect.poll(() => access(ready).then(() => true).catch(() => false), { timeout: 120_000 }).toBe(true);
  230 |     return;
  231 |   }
  232 |   try {
  233 |     await execFileAsync('npm', ['run', 'build'], { cwd: process.cwd(), maxBuffer: 50 * 1024 * 1024 });
  234 |     await writeFile(ready, 'ready');
  235 |   } finally {
  236 |     await rm(lock, { recursive: true, force: true });
  237 |   }
  238 | }
  239 | 
  240 | async function writeReport(path: string, report: string): Promise<void> {
  241 |   console.log(`\n${report}`);
  242 |   await mkdir('artifacts', { recursive: true });
  243 |   await writeFile(path, report);
  244 | }
  245 | 
  246 | function renderArm(result: ProbeResult): string {
  247 |   return [
  248 |     '# Advance-stream cache reuse',
  249 |     '',
  250 |     `Boot flags: \`${BOOT_FLAGS}\` · arm: ${result.arm} · route interception: none · network emulation: none · project: ${result.project}`,
  251 |     `Observed \`cache-control\` via CDP \`Network.responseReceived\`: ${result.cacheControl.map((value) => `\`${value}\``).join(', ')}`,
  252 |     '',
  253 |     '| Door | DOUBLE-DOWNLOAD | REVALIDATED | OVERLAP | CACHE-HIT | Wire bytes |',
  254 |     '|---|---:|---:|---:|---:|---:|',
  255 |     ...result.doorRows.map(({ door, doubleDownload, revalidated, overlap, cacheHit, wireBytes }) => `| ${door} | ${doubleDownload} | ${revalidated} | ${overlap} | ${cacheHit} | ${wireBytes} |`),
  256 |     '',
  257 |     '| URL | Prefetch bytes | Subsequent fetch bytes and bucket |',
  258 |     '|---|---:|---|',
  259 |     ...result.repeatedUrls.map(({ url, fetches }) => {
  260 |       const prefetchBytes = fetches.filter(({ prefetch }) => prefetch).map(({ encodedDataLength }) => encodedDataLength ?? 0).join('<br>') || '—';
  261 |       const subsequent = fetches.filter(({ prefetch }) => !prefetch).map((fetch) => `${fetch.encodedDataLength ?? 0} (${classify(fetch, result.observed)})`).join('<br>') || '—';
  262 |       return `| ${shortUrl(url)} | ${prefetchBytes} | ${subsequent} |`;
  263 |     }),
  264 |     '',
  265 |   ].join('\n');
  266 | }
  267 | 
  268 | function renderComparison(dev: ProbeResult, production: ProbeResult): string {
  269 |   const rows = dev.doorRows.map((devRow, index) => {
  270 |     const productionRow = production.doorRows[index];
  271 |     return `| ${devRow.door} | ${devRow.doubleDownload} | ${devRow.revalidated} | ${devRow.overlap} | ${devRow.cacheHit} | ${devRow.wireBytes} | ${productionRow.doubleDownload} | ${productionRow.revalidated} | ${productionRow.overlap} | ${productionRow.cacheHit} | ${productionRow.wireBytes} |`;
  272 |   });
  273 |   return [
  274 |     '# Advance-stream cache reuse: dev vs production headers',
  275 |     '',
  276 |     `Boot flags: \`${BOOT_FLAGS}\` · route interception: none · network emulation: none · project: ${dev.project}`,
  277 |     `Dev \`cache-control\` observed via CDP \`Network.responseReceived\`: ${dev.cacheControl.map((value) => `\`${value}\``).join(', ')}`,
  278 |     `Production \`cache-control\` observed via CDP \`Network.responseReceived\` from Vite preview's native header option: ${production.cacheControl.map((value) => `\`${value}\``).join(', ')}`,
  279 |     '',
  280 |     '| Door | Dev DOUBLE-DOWNLOAD | Dev REVALIDATED | Dev OVERLAP | Dev CACHE-HIT | Dev wire bytes | Production DOUBLE-DOWNLOAD | Production REVALIDATED | Production OVERLAP | Production CACHE-HIT | Production wire bytes |',
  281 |     '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  282 |     ...rows,
  283 |     '',
  284 |     '## Dev-server detail',
  285 |     '',
  286 |     renderArm(dev),
  287 |     '## Production-headers detail',
  288 |     '',
  289 |     renderArm(production),
  290 |   ].join('\n');
  291 | }
  292 | 
  293 | async function seedProfile(page: Page): Promise<void> {
  294 |   await page.addInitScript(({ profileKey, townKey, metaKey, scoreKey, guideKey }) => {
  295 |     localStorage.clear();
  296 |     sessionStorage.clear();
  297 |     const state: ProfileState = {
  298 |       version: 2,
  299 |       activeId: 'robin',
  300 |       profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
  301 |     };
  302 |     localStorage.setItem(profileKey, JSON.stringify(state));
  303 |     localStorage.setItem(townKey, 'Quartz Hill');
  304 |     localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } }));
  305 |     localStorage.setItem(scoreKey, '[]');
  306 |     localStorage.setItem(guideKey, '1');
  307 |   }, {
  308 |     profileKey: PROFILE_KEY,
  309 |     townKey: profileDataKey('robin', TOWN_NAME_KEY),
  310 |     metaKey: profileDataKey('robin', META_PROGRESS_KEY),
  311 |     scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
  312 |     guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  313 |   });
  314 | }
  315 | 
  316 | function collectErrors(page: Page): string[] {
  317 |   const errors: string[] = [];
  318 |   page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  319 |   page.on('pageerror', (error) => errors.push(error.message));
  320 |   return errors;
  321 | }
  322 | 
  323 | async function openBoard(page: Page): Promise<void> {
  324 |   await hold(page, 'KeyA', 850);
  325 |   await hold(page, 'KeyW', 850);
> 326 |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
      |                                                                                                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  327 |   await page.getByTestId('town-open-board').click();
  328 |   await expect(page.getByTestId('contract-board')).toBeVisible();
  329 | }
  330 | 
  331 | async function forceSecure(page: Page): Promise<void> {
  332 |   await page.evaluate(() => {
  333 |     window.__GR_TEST__?.setBalance('run.secureWave', 1);
  334 |     window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
  335 |     window.__GR_TEST__?.setBalance('waves.waveInterval', 0.25);
  336 |     window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
  337 |     window.__GR_TEST__?.setBalance('waves.pulseBase', 0);
  338 |     window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
  339 |     window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
  340 |     window.__GR_TEST__?.resetRun();
  341 |   });
  342 | }
  343 | 
  344 | async function dismissStoryBeat(page: Page): Promise<void> {
  345 |   if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) {
  346 |     await page.mouse.click(6, 6);
  347 |     await page.waitForTimeout(150);
  348 |   }
  349 | }
  350 | 
  351 | async function hold(page: Page, key: string, ms: number): Promise<void> {
  352 |   await page.keyboard.down(key);
  353 |   await page.waitForTimeout(ms);
  354 |   await page.keyboard.up(key);
  355 | }
  356 | 
  357 | function shortUrl(url: string): string {
  358 |   return new URL(url).pathname;
  359 | }
  360 | 
  361 | function isGlbRequest(url: string): boolean {
  362 |   const parsed = new URL(url);
  363 |   return parsed.pathname.endsWith('.glb') && parsed.search === '';
  364 | }
  365 | 
```