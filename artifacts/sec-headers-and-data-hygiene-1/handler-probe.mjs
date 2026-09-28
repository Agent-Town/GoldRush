#!/usr/bin/env node
/**
 * handler-probe.mjs — runtime proof for sec-headers-and-data-hygiene-1 items 2 and 4.
 *
 * Item 4: postBug's kv.put actually carries expirationTtl (a declared constant nothing passes is the
 * failure this catches). Item 2: the accounts CORS allowlist admits a localhost origin only when the
 * production mail sender is UNBOUND, and never admits a stranger.
 *
 * No port and no server: vite in middlewareMode transforms the TypeScript handlers and the probe
 * calls them directly with a recording KV, the way scripts/test-accounts.mjs does. Nothing is
 * deployed, nothing is contacted: every `Request` here is constructed in process.
 *
 * usage (from the repo root): node artifacts/sec-headers-and-data-hygiene-1/handler-probe.mjs
 */
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const vite = await createServer({ root: ROOT, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const mod = await vite.ssrLoadModule('/functions/api/_bugs.ts');
  const puts = [];
  const store = new Map();
  const kv = {
    get: async (key) => store.get(key) ?? null,
    put: async (key, value, options) => { puts.push({ key, bytes: value.length, options: options ?? null }); store.set(key, value); },
    list: async () => ({ keys: [...store.keys()].map((name) => ({ name })), list_complete: true }),
    delete: async (key) => { store.delete(key); },
  };
  const body = JSON.stringify({
    description: 'A claim marker walked through the assay wall.',
    prospectorName: 'Copper Finch',
    screenshot: 'data:image/jpeg;base64,/9j/2Q==',
    diagnostics: { contractId: 'the-claim', wave: 4, position: { x: 12.5, z: -8 }, tier: 'FULL', version: 'dev' },
  });
  const request = new Request('https://agenttown.app/api/bugs', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Origin: 'https://agenttown.app', 'CF-Connecting-IP': '203.0.113.9' },
    body,
  });
  const response = await mod.postBug({ request, env: { TELEMETRY: kv } });
  console.log(`postBug -> ${response.status} ${await response.text()}`);
  for (const put of puts) console.log(`  put ${put.key}  ${put.bytes} bytes  options ${JSON.stringify(put.options)}`);
  // `bug:ratelimit:<hash>` also starts with `bug:` and is written FIRST, so the report key has to be
  // picked by excluding the counter. The first draft of this probe found the counter and printed a
  // FAIL beside a correct 7776000 in the very same output.
  const report = puts.find((put) => put.key.startsWith('bug:') && !put.key.startsWith('bug:ratelimit:'));
  console.log(report?.options?.expirationTtl === 60 * 60 * 24 * 90
    ? `PASS: the report key carries expirationTtl ${report.options.expirationTtl} (90 days)`
    : `FAIL: the report key carries ${JSON.stringify(report?.options)}`);

  // And the CORS arm of item 2, on the same harness: localhost is refused when the sender is bound.
  const accounts = await vite.ssrLoadModule('/functions/api/_accounts.ts');
  const call = async (env, origin) => {
    const res = await accounts.requestCode({
      env,
      request: new Request('https://agenttown.app/api/request-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Origin: origin, 'CF-Connecting-IP': '203.0.113.9' },
        body: JSON.stringify({ email: 'family@example.com' }),
      }),
    });
    // A dev fixture code is not a credential, but no probe of ours prints a six-digit code.
    const body = (await res.text()).replace(/"code":"\d{6}"/, '"code":"<redacted>"');
    return { status: res.status, allowOrigin: res.headers.get('access-control-allow-origin'), body };
  };
  const storage = () => {
    const map = new Map();
    return { get: async (k) => map.get(k) ?? null, put: async (k, v) => { map.set(k, v); }, delete: async (k) => { map.delete(k); } };
  };
  console.log('\nCORS arm (functions/api/_accounts.ts):');
  for (const [label, env, origin] of [
    ['production-shaped (sender bound) + localhost origin', { ACCOUNTS: storage(), RESEND_API_KEY: 'stub-sender-binding' }, 'http://localhost:5188'],
    ['production-shaped (sender bound) + agenttown origin', { ACCOUNTS: storage(), RESEND_API_KEY: 'stub-sender-binding' }, 'https://agenttown.app'],
    ['dev (no sender) + localhost origin', { ACCOUNTS: storage(), DEV_AUTH: '1' }, 'http://localhost:5188'],
    ['unconfigured (no sender, no DEV_AUTH) + localhost origin', { ACCOUNTS: storage() }, 'http://localhost:5188'],
    ['production-shaped + evil origin', { ACCOUNTS: storage(), RESEND_API_KEY: 'stub-sender-binding' }, 'https://evil.example'],
  ]) {
    const out = await call(env, origin);
    console.log(`  ${label}: ${out.status} allow-origin=${out.allowOrigin ?? '(none)'} ${out.body.slice(0, 90)}`);
  }
} finally {
  await vite.close();
}
