#!/usr/bin/env node
/**
 * bugs-cors-probe.mjs: runtime proof for small-fixes-1 item 1 (F-SEC2-2), in the style of
 * artifacts/sec-headers-and-data-hygiene-1/handler-probe.mjs.
 *
 * THE RULE UNDER TEST. The bug office's CORS allowlist admits a localhost origin ONLY while the
 * production mail sender is unbound (`!env.RESEND_API_KEY`), the predicate the accounts handler's
 * corsHeaders landed on 2026-09-24 (functions/api/_accounts.ts, SEC-8), and never a stranger.
 *
 * NO PORT AND NO SERVER. vite in middlewareMode transforms the TypeScript handler and the probe calls
 * postBug / listBugs / getBug directly with an in-memory KV, the way scripts/test-accounts.mjs does.
 * Nothing is deployed and nothing is contacted: every Request is constructed in this process. The
 * sender binding and the office token are stub strings, never credentials.
 *
 * usage (from the repo root):
 *   node artifacts/small-fixes-1/bugs-cors-probe.mjs --label before   # on the unfixed tree: exits 1, names the hole
 *   node artifacts/small-fixes-1/bugs-cors-probe.mjs --label after    # on the fixed tree: exits 0
 * exit: 0 when every row matches the rule, 1 when any row does not.
 */
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const labelAt = process.argv.indexOf('--label');
const LABEL = labelAt === -1 ? 'run' : process.argv[labelAt + 1];

const OFFICE_TOKEN = 'stub-office-token';
const PRODUCTION = { RESEND_API_KEY: 'stub-sender-binding', BUG_OFFICE_TOKEN: OFFICE_TOKEN };
const UNCONFIGURED = { BUG_OFFICE_TOKEN: OFFICE_TOKEN };

const REPORT = JSON.stringify({
  description: 'A claim marker walked through the assay wall.',
  prospectorName: 'Copper Finch',
  screenshot: 'data:image/jpeg;base64,/9j/2Q==',
  diagnostics: { contractId: 'the-claim', wave: 4, position: { x: 12.5, z: -8 }, tier: 'FULL', version: 'dev' },
});

function memoryKv() {
  const store = new Map();
  return {
    get: async (key) => store.get(key) ?? null,
    put: async (key, value) => { store.set(key, value); },
    list: async ({ prefix = '' } = {}) => ({ keys: [...store.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }),
    delete: async (key) => { store.delete(key); },
  };
}

let ip = 0;
function request(url, { method, origin, body, bearer }) {
  const headers = { 'CF-Connecting-IP': `203.0.113.${(ip += 1)}` };
  if (origin) headers.Origin = origin;
  if (body) headers['content-type'] = 'application/json';
  if (bearer) headers.authorization = `Bearer ${bearer}`;
  return new Request(url, { method, headers, body });
}

// [env label, env, origin, handler, method, expected status, expected allow-origin (null = none)]
const ROWS = [
  ['production (sender bound)', PRODUCTION, 'http://localhost:5188', 'postBug', 'POST', 403, null],
  ['production (sender bound)', PRODUCTION, 'http://localhost:5188', 'postBug', 'OPTIONS', 403, null],
  ['production (sender bound)', PRODUCTION, 'http://127.0.0.1:5324', 'postBug', 'POST', 403, null],
  ['production (sender bound)', PRODUCTION, 'http://localhost:5188', 'listBugs', 'GET', 404, null],
  ['production (sender bound)', PRODUCTION, 'http://localhost:5188', 'listBugs', 'OPTIONS', 404, null],
  ['production (sender bound)', PRODUCTION, 'http://localhost:5188', 'getBug', 'GET', 404, null],
  ['production (sender bound)', PRODUCTION, 'https://agenttown.app', 'postBug', 'POST', 201, 'https://agenttown.app'],
  ['production (sender bound)', PRODUCTION, 'https://agenttown.app', 'postBug', 'OPTIONS', 204, 'https://agenttown.app'],
  ['production (sender bound)', PRODUCTION, 'https://agenttown.app', 'listBugs', 'GET', 200, 'https://agenttown.app'],
  ['production (sender bound)', PRODUCTION, 'https://www.agenttown.app', 'postBug', 'POST', 201, 'https://www.agenttown.app'],
  ['production (sender bound)', PRODUCTION, 'https://gold-rush-3in.pages.dev', 'postBug', 'POST', 201, 'https://gold-rush-3in.pages.dev'],
  ['production (sender bound)', PRODUCTION, 'https://feature-x.gold-rush-3in.pages.dev', 'postBug', 'POST', 201, 'https://feature-x.gold-rush-3in.pages.dev'],
  ['production (sender bound)', PRODUCTION, 'https://evil.example', 'postBug', 'POST', 403, null],
  ['production (sender bound)', PRODUCTION, null, 'postBug', 'POST', 201, null],
  ['production (sender bound)', PRODUCTION, null, 'listBugs', 'GET', 200, null],
  ['unconfigured (no sender)', UNCONFIGURED, 'http://localhost:5188', 'postBug', 'POST', 201, 'http://localhost:5188'],
  ['unconfigured (no sender)', UNCONFIGURED, 'http://localhost:5188', 'postBug', 'OPTIONS', 204, 'http://localhost:5188'],
  ['unconfigured (no sender)', UNCONFIGURED, 'http://127.0.0.1:5324', 'listBugs', 'GET', 200, 'http://127.0.0.1:5324'],
  ['unconfigured (no sender)', UNCONFIGURED, 'https://agenttown.app', 'postBug', 'POST', 201, 'https://agenttown.app'],
  ['unconfigured (no sender)', UNCONFIGURED, 'https://evil.example', 'postBug', 'POST', 403, null],
];

const vite = await createServer({ root: ROOT, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
let failures = 0;
try {
  const bugs = await vite.ssrLoadModule('/functions/api/_bugs.ts');
  console.log(`bugs-cors-probe (${LABEL}): functions/api/_bugs.ts, called in process, no port, no live request`);
  console.log('env | origin | handler method | status | allow-origin | expected | verdict');
  for (const [envLabel, envShape, origin, handler, method, wantStatus, wantAllow] of ROWS) {
    const kv = memoryKv();
    const env = { ...envShape, TELEMETRY: kv };
    let url = 'https://agenttown.app/api/bug-report';
    let params;
    if (handler === 'listBugs') url = 'https://agenttown.app/api/bugs';
    if (handler === 'getBug') {
      url = 'https://agenttown.app/api/bugs/1790270634442-448e89e1';
      params = { id: '1790270634442-448e89e1' };
    }
    const body = handler === 'postBug' && method === 'POST' ? REPORT : undefined;
    const bearer = handler === 'postBug' ? undefined : OFFICE_TOKEN;
    const response = await bugs[handler]({ request: request(url, { method, origin, body, bearer }), env, params });
    const allow = response.headers.get('access-control-allow-origin');
    const ok = response.status === wantStatus && allow === wantAllow;
    if (!ok) failures += 1;
    const errorCode = response.status >= 400 ? ` ${(await response.clone().json().catch(() => ({}))).error ?? ''}` : '';
    console.log(
      `${envLabel} | ${origin ?? '(no Origin)'} | ${handler} ${method} | ${response.status}${errorCode} | ${allow ?? '(none)'} | ` +
        `${wantStatus} ${wantAllow ?? '(none)'} | ${ok ? 'ok' : 'MISMATCH'}`,
    );
  }
  console.log(failures === 0
    ? `VERDICT (${LABEL}): every row matches the rule. Production refuses localhost with no allow-origin; the site's origins are allowed; the unconfigured arm still admits localhost.`
    : `VERDICT (${LABEL}): ${failures} row(s) do not match the rule.`);
} finally {
  await vite.close();
}
process.exitCode = failures === 0 ? 0 : 1;
