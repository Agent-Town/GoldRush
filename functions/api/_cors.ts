// localhost-cors-2 (F-SF1-1, F-SF1-8; 2026-09-26): the ONE development switch for every door's localhost
// CORS arm. A localhost origin (`http://localhost[:port]`, `http://127.0.0.1[:port]`) is admitted only when
// the environment sets ALLOW_LOCALHOST_ORIGINS to exactly '1', and nothing else is read to decide it: not the
// mail key (F-SF1-8 measured the Pages production environment holding exactly one variable,
// ASSAY_WORKER_SECRET, so a predicate on RESEND_API_KEY read "development" there and admitted localhost), not
// DEV_AUTH, and never a header, an origin or a host, which a request writes itself (the droplet forwards the
// caller's own Host). So the production default refuses and development opts in explicitly:
//   - development: `.dev.vars` at the repo root (gitignored; `.dev.vars.example` carries the line), which
//     `wrangler pages dev` and `wrangler dev` read from their config's directory; a harness that starts the
//     functions passes it itself (`--binding ALLOW_LOCALHOST_ORIGINS=1`, or the env it builds);
//   - production: never set, on Pages or on the droplet, whose env is an explicit key list without it
//     (server/ledger/serve.mjs; docs/ops/ops-evening-2026-09.md says so).
// Only the localhost arm lives here: every door keeps its own ALLOWED_ORIGINS set, which
// scripts/function-cors-allowlist.test.mjs counts.
export type LocalhostOriginsEnv = {
  ALLOW_LOCALHOST_ORIGINS?: string;
};

const LOCALHOST_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function localhostOriginAllowed(origin: string, env: LocalhostOriginsEnv | undefined): boolean {
  return env?.ALLOW_LOCALHOST_ORIGINS === '1' && LOCALHOST_ORIGIN.test(origin);
}
