#!/usr/bin/env node
/**
 * cors-probe.mjs: the localhost CORS rule across all eight doors (localhost-cors-2; F-SF1-1, F-SF1-8).
 * Evidence, not a gate. It extends artifacts/small-fixes-1/bugs-cors-probe.mjs (one door) and
 * other-doors-cors-probe.mjs (one entry point per door, one env) to EVERY CORS entry point of the
 * eight doors, under five env shapes.
 *
 * NO PORT AND NO SERVER. vite in middlewareMode transforms the TypeScript handlers and the probe calls
 * them directly. Every Request is built in this process, every binding is a stub string or an
 * in-memory store, nothing is deployed and nothing is contacted.
 *
 * THE TARGET RULE (the task master's scope 1 to 3):
 *   - a localhost origin (http://localhost[:port], http://127.0.0.1[:port]) is admitted ONLY when
 *     env.ALLOW_LOCALHOST_ORIGINS === '1'. Admitted means the answer carries
 *     Access-Control-Allow-Origin equal to that origin. Refused means the door's CORS refusal
 *     (403, or 404 on the bug office's two read doors, or the canonical 308 with no CORS answer)
 *     and NO allow-origin header;
 *   - the site's own origins (agenttown.app, www.agenttown.app, the pages.dev project and a preview
 *     of it) are admitted in every env;
 *   - a stranger is refused in every env.
 *
 * usage (repo root): node artifacts/localhost-cors-2/cors-probe.mjs --label before|after
 * exit: 0 when every row matches the target rule, 1 when any row does not.
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const labelAt = process.argv.indexOf('--label');
const LABEL = labelAt === -1 ? 'run' : process.argv[labelAt + 1];

function kv() {
  const store = new Map();
  return {
    get: async (key) => store.get(key) ?? null,
    put: async (key, value) => { store.set(key, value); },
    list: async ({ prefix = '' } = {}) => ({ keys: [...store.keys()].filter((key) => key.startsWith(prefix)).map((name) => ({ name })), list_complete: true }),
    delete: async (key) => { store.delete(key); },
  };
}

// The five env shapes. Stub strings only, never credentials.
//   pages production: what the Pages project binds today (the one variable measured by NAME through the
//     Cloudflare API on 2026-09-25, reviews/small-fixes-1.md F-SF1-8) plus the wrangler.toml KV bindings.
//   droplet production: the explicit env server/ledger/serve.mjs:152-161 builds (the sender is bound there).
//   development: a developer's box with the new variable set, no sender.
//   misspelled development: the variable set to something that is not exactly '1'.
//   development, sender bound: the variable set AND the mail key bound, so the variable is seen to decide alone.
const ENVS = [
  ['pages production', false, () => ({ ASSAY_WORKER_SECRET: 'stub-assay-secret', TELEMETRY: kv(), MULTIPLAYER_RATE_LIMITS: kv() })],
  ['droplet production', false, () => ({ ASSAY_WORKER_SECRET: 'stub-assay-secret', RESEND_API_KEY: 'stub-sender-binding', AUTH_CODE_PEPPER: 'stub-pepper', ALLOWED_CORS_ORIGINS: new Set(), ACCOUNTS: kv(), TELEMETRY: kv() })],
  ['development (ALLOW_LOCALHOST_ORIGINS=1)', true, () => ({ ALLOW_LOCALHOST_ORIGINS: '1', TELEMETRY: kv(), ACCOUNTS: kv() })],
  ['misspelled development (ALLOW_LOCALHOST_ORIGINS=true)', false, () => ({ ALLOW_LOCALHOST_ORIGINS: 'true', TELEMETRY: kv(), ACCOUNTS: kv() })],
  ['development, sender bound (=1 and RESEND_API_KEY)', true, () => ({ ALLOW_LOCALHOST_ORIGINS: '1', RESEND_API_KEY: 'stub-sender-binding', TELEMETRY: kv(), ACCOUNTS: kv() })],
];

const LOCALHOST = ['http://localhost:5188', 'http://127.0.0.1:5188'];
const SITE = ['https://agenttown.app', 'https://www.agenttown.app', 'https://gold-rush-3in.pages.dev', 'https://feature-x.gold-rush-3in.pages.dev'];
const STRANGER = ['https://evil.example'];

// Every CORS entry point of the eight doors: [door file, export, route, status the door answers a refused origin with].
const ENTRIES = [
  ['functions/api/_bugs.ts', 'postBug', '/api/bug-report', 403],
  ['functions/api/_bugs.ts', 'listBugs', '/api/bugs', 404],
  ['functions/api/_bugs.ts', 'getBug', '/api/bugs/1790270634442-448e89e1', 404],
  ['functions/api/_accounts.ts', 'requestCode', '/api/request-code', 403],
  ['functions/api/_accounts.ts', 'verifyCode', '/api/verify', 403],
  ['functions/api/_accounts.ts', 'sessionStatus', '/api/session', 403],
  ['functions/api/_accounts.ts', 'pushSave', '/api/save/push', 403],
  ['functions/api/_accounts.ts', 'pullSave', '/api/save/pull', 403],
  ['functions/api/_accounts.ts', 'saveVersions', '/api/save/versions', 403],
  ['functions/api/_accounts.ts', 'saveProfiles', '/api/save/profiles', 403],
  ['functions/api/_accounts.ts', 'deleteAccount', '/api/delete-account', 403],
  ['functions/api/redeem.ts', 'onRequest', '/api/redeem', 403],
  ['functions/api/standings.ts', 'onRequest', '/api/standings', 403],
  ['functions/api/standings.ts', 'onRequestAssayQueue', '/api/standings/assay-queue', 403],
  ['functions/api/standings.ts', 'onRequestAssayVerdict', '/api/standings/assay-verdict', 403],
  ['functions/api/standings.ts', 'onRequestStandingsReassay', '/api/standings/reassay', 403],
  ['functions/api/refusals.ts', 'onRequest', '/api/refusals', 403],
  ['functions/api/telemetry.ts', 'onRequest', '/api/telemetry', 403],
  ['functions/api/stats.ts', 'onRequest', '/api/stats', 403],
  ['functions/api/_multiplayer.ts', 'createRoom', '/api/multiplayer/create', 403],
  ['functions/api/_multiplayer.ts', 'connectRoom', '/api/multiplayer/connect?code=AAAAAAAAAAAAAAAAAAAAAAAA', 403],
  ['functions/api/_multiplayer.ts', 'inspectRoom', '/api/multiplayer/inspect?code=AAAAAAAAAAAAAAAAAAAAAAAA', 403],
];

// The standings door's other CORS answer: bound to its canonical origin (ops evening Part C step 9), the
// Pages copy answers 308 before any CORS decision and the 308 carries the door's CORS headers.
const REDIRECT_ENTRIES = [
  ['functions/api/standings.ts', 'onRequest', '/api/standings'],
  ['functions/api/standings.ts', 'onRequestAssayQueue', '/api/standings/assay-queue'],
];
const REDIRECT_ENVS = [
  ['pages production, canonical origin bound', false, () => ({ ASSAY_WORKER_SECRET: 'stub-assay-secret', STANDINGS_CANONICAL_ORIGIN: 'https://agenttown.app', TELEMETRY: kv() })],
  ['development, canonical origin bound', true, () => ({ ALLOW_LOCALHOST_ORIGINS: '1', STANDINGS_CANONICAL_ORIGIN: 'https://agenttown.app', TELEMETRY: kv() })],
];

function preflight(url, origin) {
  return new Request(url, {
    method: 'OPTIONS',
    headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type', 'CF-Connecting-IP': '203.0.113.7' },
  });
}

function classOf(origin) {
  if (LOCALHOST.includes(origin)) return 'localhost';
  if (SITE.includes(origin)) return 'site';
  return 'stranger';
}

async function answer(mod, exportName, request, env) {
  try {
    const params = exportName === 'getBug' ? { id: '1790270634442-448e89e1' } : {};
    const response = await mod[exportName]({ request, env, params });
    const code = response.status >= 400 ? (await response.clone().json().catch(() => ({}))).error ?? '' : '';
    return { status: response.status, code, allow: response.headers.get('access-control-allow-origin') };
  } catch (error) {
    return { status: 'threw', code: String(error?.message ?? error).slice(0, 80), allow: null };
  }
}

function head() {
  try {
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

const vite = await createServer({ root: ROOT, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const rows = [];
try {
  const modules = new Map();
  for (const [file] of [...ENTRIES, ...REDIRECT_ENTRIES]) {
    if (!modules.has(file)) modules.set(file, await vite.ssrLoadModule(`/${file}`));
  }
  for (const [envLabel, allowsLocalhost, makeEnv] of ENVS) {
    for (const [file, exportName, route, refusal] of ENTRIES) {
      for (const origin of [...LOCALHOST, ...SITE, ...STRANGER]) {
        const kind = classOf(origin);
        const admit = kind === 'site' || (kind === 'localhost' && allowsLocalhost);
        const got = await answer(modules.get(file), exportName, preflight(`https://agenttown.app${route}`, origin), makeEnv());
        const ok = admit ? got.allow === origin : got.allow === null && got.status === refusal;
        rows.push({ door: file, entry: exportName, env: envLabel, origin, kind, admit, refusal, got, ok });
      }
    }
  }
  for (const [envLabel, allowsLocalhost, makeEnv] of REDIRECT_ENVS) {
    for (const [file, exportName, route] of REDIRECT_ENTRIES) {
      for (const origin of [LOCALHOST[0], SITE[0], STRANGER[0]]) {
        const kind = classOf(origin);
        const admit = kind === 'site' || (kind === 'localhost' && allowsLocalhost);
        const got = await answer(modules.get(file), exportName, preflight(`https://gold-rush-3in.pages.dev${route}`, origin), makeEnv());
        const ok = got.status === 308 && (admit ? got.allow === origin : got.allow === null);
        rows.push({ door: file, entry: `${exportName} (308)`, env: envLabel, origin, kind, admit, refusal: 308, got, ok });
      }
    }
  }
} finally {
  await vite.close();
}

console.log(`cors-probe (${LABEL}): tree ${head()}, node ${process.version}; eight doors, every CORS entry point, called in process, no port, no live request`);
console.log('door | entry | env | origin | status error | allow-origin | expected | verdict');
for (const row of rows) {
  const expected = row.admit ? `admit ${row.origin}` : `refuse ${row.refusal} (none)`;
  console.log(`${row.door} | ${row.entry} | ${row.env} | ${row.origin} | ${row.got.status}${row.got.code ? ` ${row.got.code}` : ''} | ${row.got.allow ?? '(none)'} | ${expected} | ${row.ok ? 'ok' : 'MISMATCH'}`);
}

const doors = [...new Set(rows.map((row) => row.door))];
console.log('');
console.log('SUMMARY by door: rows, mismatches (of which: localhost admitted where the rule refuses / localhost refused where the rule admits / site or stranger rows)');
for (const door of doors) {
  const mine = rows.filter((row) => row.door === door);
  const bad = mine.filter((row) => !row.ok);
  const wrongAdmit = bad.filter((row) => row.kind === 'localhost' && !row.admit).length;
  const wrongRefuse = bad.filter((row) => row.kind === 'localhost' && row.admit).length;
  const other = bad.length - wrongAdmit - wrongRefuse;
  console.log(`  ${door}: ${mine.length} rows, ${bad.length} mismatches (${wrongAdmit} / ${wrongRefuse} / ${other})`);
}
console.log('SUMMARY by env: rows, mismatches');
for (const envLabel of [...new Set(rows.map((row) => row.env))]) {
  const mine = rows.filter((row) => row.env === envLabel);
  console.log(`  ${envLabel}: ${mine.length} rows, ${mine.filter((row) => !row.ok).length} mismatches`);
}
const failures = rows.filter((row) => !row.ok).length;
console.log(`TOTAL: ${rows.length} rows, ${failures} mismatches`);
console.log(failures === 0
  ? `VERDICT (${LABEL}): every row matches the rule. Without the variable every door refuses localhost with no allow-origin; the site's origins are admitted everywhere; the variable, exactly '1', admits localhost.`
  : `VERDICT (${LABEL}): ${failures} of ${rows.length} rows do not match the rule.`);
process.exitCode = failures === 0 ? 0 : 1;
