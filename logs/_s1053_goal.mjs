// s1053 — flip the deploy-verify-production-alias goal leaf in the drain commit
// (Goal Registration Law: full 40-char merge hash).
import fs from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));

let hit = null;
const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk);
  if (n && typeof n === 'object') {
    if (n.id === 'deploy-verify-production-alias') hit = n;
    Object.values(n).forEach(walk);
  }
};
walk(g);
if (!hit) throw new Error('goal leaf deploy-verify-production-alias not found');

hit.status = 'merged';
hit.mergeHash = 'e74230184cbb0204dd7fe9c391a12f9c69ee7c86';
hit.tip = '99baab74';
hit.review = 'reviews/deploy-verify-production-alias.md';
hit.outcome = [
  's1053 DRAINED (lane-d tip 99baab74 -> main e7423018). Firewall held exactly:',
  'scripts/deploy.sh + scripts/test-deploy-contract.sh ONLY, +117/-33, zero src/, zero asset-diet.mjs.',
  'F-1050-1 CLOSED - the confirmation now reads the PRODUCTION ALIAS via GR_PAGES_PRODUCTION_URL',
  '(default https://gold-rush-3in.pages.dev, the value second-rider.mjs:7 and fetch-bugs.mjs:9 already',
  'hardcode, so adopted not invented) instead of the deployment-specific hostname that cannot disagree',
  'with the upload it just made. F-1050-2 CLOSED - wrangler-exits-0-with-no-URL now says so in those',
  'words instead of naming the last progress line. F-1052-1 CLOSED and, crucially, CONFIRMED BY',
  'EXECUTION rather than inherited: s1052 could only deduce the contract test was red (bash is',
  'permission-gated for fires and it said so honestly), but the ASSERTION is runnable with node, and',
  'run against the real artifact written by s1050 genuine 15.4-minute deploy it gives - real keys',
  'commit,outcome,publishedBuild,ts,url; OLD 4-key assertion THROWS; NEW 5-key assertion PASSES.',
  'So the guard had been red on all seven run_case calls since publishedBuild was added, and two',
  'consecutive deploy correctives shipped without their own contract test ever going green.',
  'Scope 2 adds a BOUNDED 3-attempt/15s propagation retry (terminates by construction:',
  '[ATTEMPT -eq 3] || sleep 15, each fetch capped by AbortSignal.timeout(20000)); the runner',
  'wall-clocks corroborate - alias-stale 31s, alias-http-500 30s, alias-retry 15s stopping at the',
  'first match. Scope 4 repairs the test to the 5-key contract and makes it HERMETIC against a local',
  '127.0.0.1 node server (it previously reached the real internet to decide a unit result), adding 5',
  'cases each of which fails if scopes 1-3 are reverted. Gates: tsc clean, build green 1.46s,',
  'never-block law preserved (finish() still exits 0 unless --strict). Merge was an EXACT GRAFT, not a',
  '3-way: merge-base 1cc8bce3, and git diff 1cc8bce3 main -- <the 2 files> is EMPTY, so main never',
  'moved either file; working tree verified byte-identical to the lane tip before staging.',
  'LIMIT stated in the review and not softened: I did NOT execute the contract test itself -',
  'bash <script> and direct execution are both gated for fires and I attempted both - so its green',
  'rests on the runner paste plus my line-by-line read of the diff PLUS the one piece I could',
  'execute, which happens to be the exact assertion that was broken.',
  'Finding F-1053-1 (non-blocking, no corrective owed): LIVE_BUILD==PUBLISHED_BUILD would',
  'false-VERIFY if both were empty, but that is UNREACHABLE - BUILD_ID:48 uses the ${VAR:-default}',
  'form which treats empty as unset, and an unreadable snapshot version.json hard-fails at :80-82',
  'before the comparison. THIS SLICE DEPLOYS NOTHING AND CHANGES ZERO PLAYER-FACING BYTES; the 423MB',
  'transport problem remains owner-gated (F-1051-2/F-1051-3). What it buys: the first successful',
  'deploy will be VERIFIABLE, where previously the next success would have printed VERIFIED on',
  'evidence structurally incapable of detecting the bug it was written for.',
  'Review: reviews/deploy-verify-production-alias.md.',
].join(' ');

fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('leaf flipped:', hit.id, '->', hit.status, hit.mergeHash);
