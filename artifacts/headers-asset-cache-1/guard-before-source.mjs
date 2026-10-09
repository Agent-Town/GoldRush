/**
 * site-security-headers.test.mjs — the game's origin ships the security headers it says it ships.
 *
 * WHY THIS EXISTS (SEC-8 and SEC-7 of the outside review 2026-09-24, task
 * sec-headers-and-data-hygiene-1)
 * ---------------------------------------------------------------------------
 * `public/_headers` was Cache-Control ONLY: no nosniff, no Referrer-Policy, no frame refusal, no
 * HSTS, no CSP, on an origin whose localStorage holds a session token and the signed-in email. The
 * cure is a text file, which is the cheapest kind of cure to lose: nothing in the tree read that
 * file except `e2e/058-device-tiers.spec.ts`, which asserts the two Cache-Control rules and would
 * stay green with every security header deleted.
 *
 * WHAT IT GUARDS, AND WHY EACH ARM IS NOT DECORATION
 *   1. The five headers exist on `/*` with their exact values. A header silently dropped in a merge
 *      is the failure mode: the site keeps working, so nothing else notices.
 *   2. The CSP's directives are compared ONE BY ONE against a pinned map rather than as one string.
 *      A string compare reds usefully on deletion and uselessly on reordering; a per-directive
 *      compare names the directive that moved and catches a WIDENED source list (`img-src 'self'
 *      data: https:`) which a "contains 'self'" check would wave through.
 *   3. The policy is still REPORT-ONLY. Task item 1 is explicit that flipping it to enforcing is the
 *      owner's decision after a week of production reports, and "someone turned it on quietly" is
 *      exactly the kind of change that looks like progress and takes the game's boot with it.
 *   4. No wildcard source and no 'unsafe-eval'. A CSP rots by widening, one debugging session at a
 *      time; 'wasm-unsafe-eval' is admitted by name because the meshopt decoder needs it, and its
 *      big brother is refused.
 *   5. The bug-report TTL the OFFICE writes (`functions/api/_bugs.ts` REPORT_TTL_SECONDS) and the
 *      one the FETCH SCRIPT prints (`scripts/fetch-bugs.mjs` REPORT_TTL_DAYS) are the same number.
 *      Two copies of one fact in two languages is a defect waiting for whoever raises one of them;
 *      this arm rides in this file rather than in a second new one because the task's allowance was
 *      one new test, and a file holding a single assertion is worse than a named arm here.
 *
 * THE DETECTOR IS CONTROLLED BEFORE ITS GREEN IS BELIEVED (the s1299/s1300 standard: a passing
 * guard never executes its violation path). The last test runs the SAME predicate over three
 * synthetic header files — one with the CSP deleted, one with img-src widened to `https:`, one with
 * the policy flipped to enforcing — and asserts each is caught. Without it, a parser that quietly
 * returned an empty rule map would report a vacuous pass on every arm above.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (relative) => readFileSync(join(ROOT, relative), 'utf8');
const HEADERS_FILE = 'public/_headers';
const SITE_RULE = '/*';
const CSP_HEADER = 'Content-Security-Policy-Report-Only';

const EXPECTED_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=2592000',
};

// The pin, directive by directive. Every source here is answerable with a file and a line; the
// reasoning lives beside the policy itself in public/_headers.
const EXPECTED_CSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'wasm-unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https://agenttown.app', 'wss://agenttown.app'],
  'worker-src': ["'self'", 'blob:'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
};

/**
 * Parse a Cloudflare Pages `_headers` file into pattern -> [[name, value], ...].
 * Path patterns start at column 0; header lines are indented; `#` lines are comments.
 */
export function parseHeaderFile(text) {
  const rules = new Map();
  let pattern = null;
  text.split('\n').forEach((raw, index) => {
    const line = raw.replace(/\r$/, '');
    if (!line.trim() || line.trimStart().startsWith('#')) return;
    if (!/^\s/.test(line)) {
      pattern = line.trim();
      if (!rules.has(pattern)) rules.set(pattern, []);
      return;
    }
    const match = /^\s+([A-Za-z0-9-]+):[ \t]*(.*)$/.exec(line);
    assert.ok(match, `${HEADERS_FILE}:${index + 1} is indented but is not a "Name: value" header line: ${line}`);
    assert.ok(pattern, `${HEADERS_FILE}:${index + 1} is a header line before any path pattern: ${line}`);
    rules.get(pattern).push([match[1], match[2]]);
  });
  return rules;
}

function headersFor(text, rule) {
  const rules = parseHeaderFile(text);
  const entries = rules.get(rule);
  assert.ok(entries, `${HEADERS_FILE} has no "${rule}" rule; found ${[...rules.keys()].join(', ') || '(nothing)'}`);
  assert.ok(entries.length > 0, `${HEADERS_FILE} rule "${rule}" carries no headers at all`);
  return new Map(entries);
}

function directives(cspValue) {
  const parsed = new Map();
  for (const part of cspValue.split(';')) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) continue;
    parsed.set(tokens[0], tokens.slice(1));
  }
  return parsed;
}

/** The whole verdict, as one function, so the fixtures below exercise the very predicate the tree is judged by. */
function auditHeaderText(text) {
  const headers = headersFor(text, SITE_RULE);
  for (const [name, value] of Object.entries(EXPECTED_SECURITY_HEADERS)) {
    assert.equal(headers.get(name), value, `${HEADERS_FILE} "${SITE_RULE}" must send ${name}: ${value}`);
  }
  assert.ok(
    !/^\s*Content-Security-Policy:/im.test(text),
    `${HEADERS_FILE} carries an ENFORCING Content-Security-Policy. Task sec-headers-and-data-hygiene-1 ` +
      'item 1 keeps the policy report-only until the owner rules otherwise, after a week of production reports.',
  );
  const csp = headers.get(CSP_HEADER);
  assert.ok(csp, `${HEADERS_FILE} "${SITE_RULE}" must send ${CSP_HEADER}`);
  const parsed = directives(csp);
  assert.deepEqual(
    [...parsed.keys()].sort(),
    Object.keys(EXPECTED_CSP).sort(),
    `${CSP_HEADER} directive set moved. Add or remove a directive here in the same commit, with the file and line in the tree that needs it.`,
  );
  for (const [directive, sources] of Object.entries(EXPECTED_CSP)) {
    assert.deepEqual(parsed.get(directive), sources, `${CSP_HEADER} ${directive} sources moved`);
  }
  for (const [directive, sources] of parsed) {
    assert.ok(!sources.includes('*'), `${CSP_HEADER} ${directive} admits every origin ("*")`);
    assert.ok(!sources.includes("'unsafe-eval'"), `${CSP_HEADER} ${directive} admits 'unsafe-eval'`);
  }
  return parsed;
}

const liveHeaders = read(HEADERS_FILE);

test('public/_headers sends the five security headers on every path', () => {
  const parsed = auditHeaderText(liveHeaders);
  console.log(`${HEADERS_FILE} "${SITE_RULE}": ${Object.keys(EXPECTED_SECURITY_HEADERS).length + 1} security headers, ${parsed.size} CSP directives`);
});

test('the Cache-Control rules 058-device-tiers gates are still there', () => {
  const rules = parseHeaderFile(liveHeaders);
  assert.equal(rules.get('/assets/*')?.[0]?.[1], 'public, max-age=31536000, immutable');
  assert.equal(new Map(rules.get('/*')).get('Cache-Control'), 'no-cache');
  assert.equal(new Map(rules.get('/*.html')).get('Cache-Control'), 'no-cache');
});

test('the bug-office report TTL and the number the fetch script prints are the same', () => {
  const office = read('functions/api/_bugs.ts');
  const fetcher = read('scripts/fetch-bugs.mjs');
  const seconds = /^const REPORT_TTL_SECONDS = ([^;]+);/m.exec(office);
  const days = /^const REPORT_TTL_DAYS = (\d+);/m.exec(fetcher);
  assert.ok(seconds, 'functions/api/_bugs.ts no longer declares REPORT_TTL_SECONDS');
  assert.ok(days, 'scripts/fetch-bugs.mjs no longer declares REPORT_TTL_DAYS');
  // A product of integer literals is the only expression this pin accepts: reading it with eval or
  // `new Function` would let a future edit of the subject file decide what this guard executes.
  assert.match(seconds[1].trim(), /^\d+(?:\s*\*\s*\d+)*$/, `REPORT_TTL_SECONDS must stay a product of literals, got "${seconds[1].trim()}"`);
  const officeSeconds = seconds[1].split('*').reduce((product, factor) => product * Number(factor.trim()), 1);
  assert.equal(officeSeconds, Number(days[1]) * 86_400, `the office expires reports after ${officeSeconds}s but fetch-bugs prints a ${days[1]}-day TTL`);
  assert.ok(officeSeconds >= 60, 'Cloudflare KV refuses an expirationTtl below 60 seconds');
  // A declared constant nothing passes is the shape this arm exists to catch: the number can be
  // right in both files while the report is still written with no expiry at all.
  // `[^)]*` was the first draft and it CANNOT match this call: the argument between the key and the
  // options object is `JSON.stringify(stored)`, whose own `)` ends the class. It was added after the
  // file's last green run and committed red; the final re-run of every arm is what caught it, which is
  // the whole argument for re-running a test after touching it rather than after touching its subject.
  assert.match(
    office,
    /kv\.put\(`bug:\$\{id\}`.*\{ expirationTtl: REPORT_TTL_SECONDS \}\)/,
    'functions/api/_bugs.ts stores the report without passing REPORT_TTL_SECONDS to kv.put',
  );
});

// ⚠️ The fixtures below patch the POLICY LINE, never the whole file by string replace. The first
// draft did the latter and went green on the widening arm: `public/_headers` documents each
// directive in a `#` comment above the rule, so `replace("img-src 'self' data:", …)` patched the
// PROSE, the parser skipped it as a comment, and the fixture proved nothing. That near-miss is the
// reason this test exists in the shape it does.
function patchPolicyLine(mutate) {
  const patched = liveHeaders
    .split('\n')
    .map((line) => (line.trimStart().startsWith(`${CSP_HEADER}:`) ? mutate(line) : line))
    .join('\n');
  assert.notEqual(patched, liveHeaders, 'the fixture patched nothing: the policy line moved');
  return patched;
}

test('the audit catches a deleted policy, a widened source and an enforcing flip', () => {
  const deleted = liveHeaders
    .split('\n')
    .filter((line) => !line.trimStart().startsWith(`${CSP_HEADER}:`))
    .join('\n');
  assert.throws(() => auditHeaderText(deleted), /must send Content-Security-Policy-Report-Only/);

  const widened = patchPolicyLine((line) => line.replace("img-src 'self' data:", "img-src 'self' data: https:"));
  assert.throws(() => auditHeaderText(widened), /img-src sources moved/);

  const enforcing = patchPolicyLine((line) => line.replace(`${CSP_HEADER}:`, 'Content-Security-Policy:'));
  assert.throws(() => auditHeaderText(enforcing), /ENFORCING Content-Security-Policy/);

  const wildcard = patchPolicyLine((line) => line.replace("connect-src 'self'", 'connect-src *'));
  assert.throws(() => auditHeaderText(wildcard), /admits every origin|connect-src sources moved/);

  const dropped = liveHeaders.split('\n').filter((line) => !line.trimStart().startsWith('X-Frame-Options:')).join('\n');
  assert.throws(() => auditHeaderText(dropped), /must send X-Frame-Options: DENY/);

  const noRule = 'x\n/assets/*\n  Cache-Control: no-cache\n';
  assert.throws(() => auditHeaderText(noRule), /has no "\/\*" rule/);
});
