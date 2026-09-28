#!/usr/bin/env node
/**
 * csp-boot-probe.mjs — boot the game against the headered server and read the console.
 *
 * THE BAR (task sec-headers-and-data-hygiene-1 item 1): a plain boot of the Claim and a contract, at
 * 1280 and at 390, with the console captured, and ZERO Content-Security-Policy lines in it.
 *
 * WHY A POSITIVE CONTROL IS PART OF THE MEASUREMENT. "No CSP lines in the console" is exactly the
 * answer a browser that never received a policy gives, so a green here proves nothing on its own
 * (the s1299 standard: a detector never shown capable of a hit reports a vacuous zero). So after the
 * boots, on a fresh page, the probe fetches an origin the policy does NOT admit and requires a
 * report-only violation to appear. If that control is silent, the probe fails and says the
 * instrument, not the tree, is the problem.
 *
 * NO LIVE TRAFFIC. Every request that is not same-origin is intercepted: agenttown.app is fulfilled
 * locally with a benign JSON body (the request still passes the browser's CSP check, which is the
 * point) and anything else is aborted and recorded. The live site, the county door and the droplet
 * are never contacted.
 *
 * usage: node artifacts/sec-headers-and-data-hygiene-1/csp-boot-probe.mjs [baseURL]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from '@playwright/test';

const baseURL = process.argv[2] ?? 'http://127.0.0.1:5314';
const OUT = path.resolve('artifacts/sec-headers-and-data-hygiene-1/boots');
const CSP_PATTERN = /Content-Security-Policy|Report Only|violates the following/i;

// The plain-boot recipe of e2e/f-astra-6-plain-boot.spec.ts: a progressed player's storage admits the
// normal staged-launch path, with no debug flag, no test API and no scene mutation.
const PROFILE_KEY = 'gr.profile.v2';
const KEYS = {
  profile: PROFILE_KEY,
  scores: `${PROFILE_KEY}.robin.gr.scores.v2`,
  guide: `${PROFILE_KEY}.robin.gr.firstClaim.done.v1`,
  story: `${PROFILE_KEY}.robin.gr.story.firstBoot.v1`,
  town: `${PROFILE_KEY}.robin.gr.town.name.v1`,
};

const VIEWPORTS = [
  { label: '1280', viewport: { width: 1280, height: 800 }, extra: {} },
  { label: '390', viewport: { width: 390, height: 844 }, extra: devices['Pixel 5'] },
];
// `--maps a,b` narrows the run (the second pass only needed e1-dry-gulch); default is all three.
const mapArg = process.argv.indexOf('--maps');
const MAPS = mapArg === -1 ? ['town', 'the-claim', 'e1-dry-gulch'] : process.argv[mapArg + 1].split(',');

const results = [];
let failures = 0;

const browser = await chromium.launch({ channel: 'chromium' });
try {
  for (const arm of VIEWPORTS) {
    for (const map of MAPS) {
      const context = await browser.newContext({ ...arm.extra, viewport: arm.viewport, baseURL });
      const page = await context.newPage();
      const capture = { console: [], pageErrors: [], requestFailures: [], aborted: [] };
      page.on('console', (message) => capture.console.push(`${message.type()}: ${message.text()}`));
      page.on('pageerror', (error) => capture.pageErrors.push(error.message));
      page.on('requestfailed', (request) => capture.requestFailures.push(`${request.url()} ${request.failure()?.errorText ?? ''}`));
      await context.route('**/*', async (route) => {
        const url = route.request().url();
        if (url.startsWith(baseURL) || url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
        if (/^https:\/\/(www\.)?agenttown\.app\//.test(url)) {
          return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"boards":[],"bugs":[]}' });
        }
        capture.aborted.push(url);
        return route.abort();
      });
      await page.addInitScript((keys) => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem(keys.profile, JSON.stringify({ version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] }));
        localStorage.setItem(keys.scores, JSON.stringify([{ waves: 12, kills: 30, gold: 50, timeAlive: 300, at: 1, secured: true, contractId: 'the-claim', profileName: 'Robin' }]));
        localStorage.setItem(keys.guide, '1');
        localStorage.setItem(keys.story, '1');
        localStorage.setItem(keys.town, 'Quartz Hill');
        // THE LINE THE FIRST PASS MISSED. e2e/f-astra-6-plain-boot.spec.ts:21 sets this beside the
        // ?contract= query, and without it e1-dry-gulch never reaches its contract: the two 1280/390
        // e1-dry-gulch arms of pass 1 timed out at 90 s on the INSTRUMENT, not on the tree (town and
        // the-claim reached their frames in the same pass). the-claim boots from the query alone,
        // which is exactly why the omission looked harmless.
        if (keys.launchMap) sessionStorage.setItem('gr.contract.launch.v1', keys.launchMap);
      }, { ...KEYS, launchMap: map === 'town' ? '' : map });

      const target = map === 'town' ? '/' : `/?contract=${map}`;
      const response = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      const policy = response?.headers()['content-security-policy-report-only'] ?? '(absent)';
      const sent = {
        'content-security-policy-report-only': policy,
        'x-content-type-options': response?.headers()['x-content-type-options'] ?? '(absent)',
        'referrer-policy': response?.headers()['referrer-policy'] ?? '(absent)',
        'x-frame-options': response?.headers()['x-frame-options'] ?? '(absent)',
        'strict-transport-security': response?.headers()['strict-transport-security'] ?? '(absent)',
      };

      let reached = 'unknown';
      try {
        if (map === 'town') {
          await page.getByTestId('start-menu-enter-town').click({ timeout: 30_000 });
          await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 30, null, { timeout: 90_000 });
          reached = 'town frame > 30';
        } else {
          await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, map, { timeout: 90_000 });
          await page.getByTestId('contract-briefing-dismiss').click({ timeout: 4_000 }).catch(() => {});
          await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30, null, { timeout: 90_000 });
          reached = 'contract frame > 30';
        }
      } catch (error) {
        reached = `NOT REACHED: ${String(error).split('\n')[0]}`;
        failures += 1;
      }
      await page.waitForTimeout(1_500);

      const cspLines = capture.console.filter((line) => CSP_PATTERN.test(line));
      const consoleErrors = capture.console.filter((line) => line.startsWith('error:'));
      await mkdir(OUT, { recursive: true });
      await page.screenshot({ path: path.join(OUT, `${arm.label}-${map}.png`) });
      const row = { arm: arm.label, map, url: page.url(), reached, headers: sent, cspLines, consoleErrors, pageErrors: capture.pageErrors, aborted: capture.aborted, consoleAll: capture.console };
      await writeFile(path.join(OUT, `${arm.label}-${map}.json`), `${JSON.stringify(row, null, 2)}\n`);
      results.push(row);
      if (cspLines.length) failures += 1;
      console.log(`${arm.label} ${map}: ${reached} | csp lines ${cspLines.length} | console errors ${consoleErrors.length} | page errors ${capture.pageErrors.length} | policy ${policy === '(absent)' ? 'ABSENT' : 'received'}`);
      await context.close();
    }
  }

  // The positive control, on a fresh page: an origin the policy does not admit must be reported.
  const control = await browser.newContext({ baseURL });
  const controlPage = await control.newPage();
  const controlConsole = [];
  controlPage.on('console', (message) => controlConsole.push(`${message.type()}: ${message.text()}`));
  await control.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.startsWith(baseURL) || url.startsWith('data:')) return route.continue();
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await controlPage.goto('/privacy.html', { waitUntil: 'domcontentloaded' });
  await controlPage.evaluate(async () => {
    await fetch('https://not-an-allowed-origin.invalid/probe').catch(() => undefined);
    await fetch('https://agenttown.app/api/stats').catch(() => undefined);
  });
  await controlPage.waitForTimeout(1_000);
  const controlCsp = controlConsole.filter((line) => CSP_PATTERN.test(line));
  // ⚠️ MATCH THE TARGET, NOT THE MESSAGE. A violation line QUOTES the directive it broke, so it
  // contains "https://agenttown.app" even when the county origin was admitted: pass 1's naive
  // `includes('agenttown.app')` reported a control failure against a policy that was working
  // perfectly. The subject of the sentence is what matters.
  const connecting = (host) => controlCsp.some((line) => line.includes(`Connecting to 'https://${host}`));
  const refusedDisallowed = connecting('not-an-allowed-origin.invalid');
  const refusedAllowed = connecting('agenttown.app');
  await writeFile(
    path.resolve('artifacts/sec-headers-and-data-hygiene-1/csp-control.json'),
    `${JSON.stringify({ controlCsp, refusedDisallowed, refusedAllowed, controlConsole }, null, 2)}\n`,
  );
  console.log(`control: disallowed origin reported = ${refusedDisallowed} (must be true); agenttown.app reported = ${refusedAllowed} (must be false)`);
  if (!refusedDisallowed) {
    console.error('CONTROL FAILED: the policy never reported a disallowed origin, so the zeros above are vacuous.');
    failures += 1;
  }
  if (refusedAllowed) {
    console.error('CONTROL FAILED: the policy reported the county origin, which the game needs.');
    failures += 1;
  }
  await control.close();
} finally {
  await browser.close();
}

const totalCsp = results.reduce((sum, row) => sum + row.cspLines.length, 0);
console.log(`\n${results.length} boots, ${totalCsp} CSP console line(s) total, ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
