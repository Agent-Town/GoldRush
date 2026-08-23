// L3 cutover (owner "go", 2026-08-23): the county ledger lives on the droplet behind
// agenttown.app/api/standings*; every other /api/* path (accounts, multiplayer) is forwarded
// by the droplet nginx to the Cloudflare functions, so ONE origin serves the whole surface.
// Rollback = revert this line (specs/ops/ledger-on-droplet.md Law 5; KV stays warm).
export const GAME_API_ORIGIN = 'https://agenttown.app';

export function gameApiUrl(path: `/api/${string}`): string {
  return `${GAME_API_ORIGIN}${path}`;
}
