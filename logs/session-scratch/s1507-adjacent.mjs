// s1507 — the adjacent battery, DERIVED at drain time rather than inherited from the runner's
// report (a review's adjacent-suite list is perishable). The cure changes `activeEpoch` for every
// non-replay boot, so the denominator is every spec that reasons about epoch/era activation.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const GATE = join(ROOT, 'gate-s1507');

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

// grep -rln 'eraActive|selectActiveEpoch|activeEpoch|epochOrder|era-active' e2e/
// minus the own spec (run separately, 6 passed) and the non-spec fixture.
const SPECS = [
  'e2e/072-era-activation.spec.ts', 'e2e/077-epoch-substrate.spec.ts', 'e2e/advance-stream.spec.ts',
  'e2e/beauty-town.spec.ts', 'e2e/board-era-chapters.spec.ts', 'e2e/board-gating-and-profiles.spec.ts',
  'e2e/board-upcoming-surveys.spec.ts', 'e2e/ceremony-framework.spec.ts', 'e2e/cold-anchor-rule.spec.ts',
  'e2e/e2-pressure-economy.spec.ts', 'e2e/e2-t2-dynamo-ceremony.spec.ts', 'e2e/e6-arsenal.spec.ts',
  'e2e/e9-arsenal.spec.ts', 'e2e/landmark-collision.spec.ts', 'e2e/ledger-era-chapters.spec.ts',
  'e2e/release-build.spec.ts', 'e2e/release-frontier.spec.ts', 'e2e/save-compat.spec.ts',
  'e2e/schoolhouse-era-truth.spec.ts', 'e2e/tour-era-seed.spec.ts', 'e2e/town-dynamo-hall-blender.spec.ts',
  'e2e/ui-era-dressing.spec.ts', 'e2e/wd03-ledger.spec.ts', 'e2e/wd04-postscripts.spec.ts',
  'e2e/wire-era-anchor-emitters.spec.ts',
];

console.log(`adjacent denominator: ${SPECS.length} specs (derived by grep at drain time)\n`);
const t0 = Date.now();
const r = spawnSync('npx', ['playwright', 'test', ...SPECS, '--workers=1', '--reporter=line'], {
  cwd: GATE, encoding: 'utf8', env, maxBuffer: 128 * 1024 * 1024,
});
const out = `${r.stdout}${r.stderr}`;
console.log(`rc=${r.status}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log((out.match(/\d+ (?:passed|failed|flaky|skipped|did not run)/g) || []).join(', '));

if (r.status !== 0) {
  console.log('\n--- failing lines ---');
  console.log(out.split('\n').filter((l) => /✘|Error|Expected|Received|failed/.test(l)).slice(0, 60).join('\n'));
}
