#!/usr/bin/env node
/**
 * other-doors-cors-probe.mjs: F-SF1-1 measured, not read (small-fixes-1, 2026-09-25). Evidence, not a gate.
 *
 * Six more Pages/droplet doors keep the unconditional `http://localhost:*` CORS arm the accounts door
 * (SEC-8) and now the bug office (F-SEC2-2) have closed. This sends each one a CORS PREFLIGHT (OPTIONS)
 * under a PRODUCTION-SHAPED env (the mail sender bound, as a stub string) from three origins: localhost
 * (the question), the county origin (must be allowed) and a stranger (must be refused). A preflight is
 * answered by the CORS decision alone, before any handler logic, so nothing is written and nothing is
 * contacted: vite middleware mode, the handlers called in process, every Request built here, no port.
 *
 * usage (repo root): node artifacts/small-fixes-1/other-doors-cors-probe.mjs
 */
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const DOORS = [
  ['functions/api/redeem.ts', 'onRequest', '/api/redeem'],
  ['functions/api/standings.ts', 'onRequest', '/api/standings'],
  ['functions/api/refusals.ts', 'onRequest', '/api/refusals'],
  ['functions/api/telemetry.ts', 'onRequest', '/api/telemetry'],
  ['functions/api/stats.ts', 'onRequest', '/api/stats'],
  ['functions/api/_multiplayer.ts', 'createRoom', '/api/multiplayer/create'],
  ['functions/api/_bugs.ts', 'postBug', '/api/bug-report'],
];
const ORIGINS = ['http://localhost:5188', 'https://agenttown.app', 'https://evil.example'];
const kv = () => {
  const store = new Map();
  return {
    get: async (key) => store.get(key) ?? null,
    put: async (key, value) => { store.set(key, value); },
    list: async () => ({ keys: [], list_complete: true }),
    delete: async (key) => { store.delete(key); },
  };
};

const vite = await createServer({ root: ROOT, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  console.log('other-doors-cors-probe: OPTIONS preflight, production-shaped env (sender bound), in process, no port');
  console.log('door | handler | origin | status | allow-origin');
  for (const [file, handler, route] of DOORS) {
    const mod = await vite.ssrLoadModule(`/${file}`);
    for (const origin of ORIGINS) {
      const env = { RESEND_API_KEY: 'stub-sender-binding', TELEMETRY: kv(), ACCOUNTS: kv(), BUG_OFFICE_TOKEN: 'stub-office-token' };
      const request = new Request(`https://agenttown.app${route}`, {
        method: 'OPTIONS',
        headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type', 'CF-Connecting-IP': '203.0.113.7' },
      });
      let line;
      try {
        const response = await mod[handler]({ request, env, params: {} });
        line = `${response.status} | ${response.headers.get('access-control-allow-origin') ?? '(none)'}`;
      } catch (error) {
        line = `threw ${error?.name ?? 'Error'}: ${String(error?.message ?? error).slice(0, 80)}`;
      }
      console.log(`${file} | ${handler} | ${origin} | ${line}`);
    }
  }
} finally {
  await vite.close();
}
