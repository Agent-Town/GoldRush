#!/usr/bin/env node
// s1261 — strike the 14 measured-stale double-state rows named (a) STALE by
// artifacts/findings-state-vocabulary-triage.md (s1260, 637e156e).
//
// Rows are located by F-ID in the line's leading subject zone, NEVER by the line
// numbers in the triage table: those were derived at 65e0de4e and BACKLOG has moved
// since. Every row is retained in full inside its strike span (Retention Law).
import { readFileSync, writeFileSync } from 'node:fs';

const RETENTION = 'Reasoning retained per the Retention Law.';

// evidence: re-derived this fire where marked ✓ RE-DERIVED s1261; otherwise carried
// from the triage table's own code/leaf probe, which held on every row sampled.
const STRIKES = [
  {
    id: 'F-1026-1',
    closed: 'L1237',
    ev: 'merge `9ba65911`; `e2e/asset-diet.spec.ts:15` gates on `GR_ASSET_DIET_BUNDLE` and `package.json:12` runs the preview-backed suite, so the pin this row asks for exists.',
  },
  {
    id: 'F-1026-5',
    closed: 'L1231 (M1 half) + L1271 (M2 half, fully closed)',
    ev: 'M1 cure `f7cd0103`, M2 cure `df51d877`; `src/game/Game.ts:warmVfx` warms the late uploads and `e2e/m2-01-build-menu.spec.ts:340` reaches the unchanged 200-call assertion.',
  },
  {
    id: 'F-1039-2',
    closed: 'L1338 (instance) + L1929 (CLOSED AT THE CLASS, sixth instance)',
    ev: 'main `efad618c`; `scripts/status-line1.mjs` substitutes `{STAMP}` from a command and rejects future timestamps — the hand-computed-stamp defect this row describes now has a mechanism, not just a law.',
  },
  {
    id: 'F-1047-1',
    closed: 'L1321',
    ev: '✓ RE-DERIVED s1261 BY CODE PROBE: merge `e718b7cc`; `package.json:12` reads `"test:asset-diet": "GR_ASSET_DIET_BUNDLE=1 playwright test …"` and `scripts/deploy.sh:59-61` invokes the real budget leg with `GR_ASSET_DIET_BUNDLE=1`. The command no longer skips its assertions.',
  },
  {
    id: 'F-1126-1',
    closed: 'L1757',
    ev: '✓ RE-DERIVED s1261 BY CODE PROBE, AND IT IS STRONGER THAN THE TRIAGE CLAIMED: merge `9a2e4842` added `npm run test:guards`, and the `GUARDS` array in `scripts/run-guards.mjs` now holds **TEN** callers (`test:node-guards`, `test:power-budget`, `test:stats`, `test:accounts`, `test:mp`, `test:deploy-contract`, `test:deploy-site-contract`, `test:task-guards`, `test:citations`, `test:gate-callers`) — not the seven this row says have zero. ⚠️ **This row is also a carried OWNER-DESK ask; striking it retires the desk item, which is why it was re-derived rather than inherited.**',
  },
  {
    id: 'F-1167-4',
    closed: 'L315',
    ev: 'discharged at `ea0cabc4`; `scripts/suite-red-inventory.mjs:65` resolves absolute paths against the raw’s `runRoot`, not the invoking `process.cwd()`.',
  },
  {
    id: 'F-1168-1',
    closed: 'L322',
    ev: 'cured and drained s1169 at `7c28335c`; `GR_ASSET_DIET_BUNDLE` now owns the bundle-only duty while `GR_CAPTURE_EXTERNAL_SERVER` owns server reuse, so the flag no longer falsely runs bundle-only tests.',
  },
  {
    id: 'F-1170-2',
    closed: 'L306 (itself a strike span — the first framing, retired to the owner’s desk and then answered)',
    ev: '✓ RE-DERIVED s1261 BY CODE PROBE, AND IT RESOLVES THE (a)-vs-(b) FORK THIS ROW OPENED: leaf `factory-build-mode-prompt-realign` is `merged` at `e42ed4efeffe`, and `e2e/bt-00-demolish.spec.ts:121-123` now reads `setBuildMode(false)` → prompt `toBeHidden()` → `setBuildMode(true)` → prompt `toBeVisible()`. **The fork was decided as (a): the five specs were stale and have been realigned; `50977ab6` did NOT regress a player capability.** ⚠️ **This row still carried a `FIRE-AUTHORABLE` flag, so it was advertising an authoring slot against already-ratified behaviour — the F-1258-4 harm shape exactly.**',
  },
  {
    id: 'F-1173-3',
    closed: 'L293 (discharged s1196; L291 is its ACTIONED workflow row)',
    ev: '✓ leaf `factory-run-guards-test-coverage` is `merged` at `4499e6960b37`; `scripts/run-guards.test.mjs` black-box tests exit propagation, signals, filters and changed-file routing, so the runner no longer has no test.',
  },
  {
    id: 'F-1198-2',
    closed: 'L251 (shipped; L279 is its authored workflow row)',
    ev: '✓ leaf `factory-suite-red-inventory-run-tree-invariance` is `merged` at `e968557ab2da`; `suite-red-inventory.mjs` keys off `config.rootDir`/`runRoot`, so the inventory no longer differs across checkouts.',
  },
  {
    id: 'F-1200-3',
    closed: 'L255',
    ev: 'shipped `b7cace2e`; `scripts/suite-red-inventory.test.mjs` now asserts the absolute "Failing file:line" path and rejects leaked fixture roots, so the guard is no longer weaker than its name.',
  },
  {
    id: 'F-1202-1',
    closed: 'L259',
    ev: '✓ leaf `factory-collection-guards-spawnsync-truncation` is `merged` at `1bf66dd5db7f`; both collection guards now use `spawn` with file-backed stdout/stderr and read after `close`, so capture no longer truncates under load.',
  },
  {
    id: 'F-1210-5',
    closed: 'L1910',
    ev: '✓ RE-DERIVED s1261 BY CODE PROBE: leaf `gg-01b-welcome-release-gate` is `merged` (`e5d3c26c`), and `e2e/release-build.spec.ts:48` clicks `town-welcome-skip` before approaching the Tavern, so the welcome no longer blocks the release-suite board click.',
  },
  {
    id: 'F-1256-2',
    closed: 'L50 (closed by execution at the GG-03e drain)',
    ev: '✓ RE-DERIVED s1261 BY CODE PROBE: merge `5e129079`; `src/news/heraldReader.ts:15-23` maps all eight engravings including `ceremony`, all eight `assets/processed/herald-engraving-*.webp` exist on disk, and `scripts/asset-diet.mjs` still enforces the same ceilings.',
  },
];

const path = 'tasks/BACKLOG.md';
const lines = readFileSync(path, 'utf8').split('\n');

// Locate each row the way the guard does: F-ID declared in the line's leading
// subject zone (~140 chars), on a line that is not already struck.
const ZONE = 140;
const report = [];
let struck = 0;

for (const s of STRIKES) {
  const idx = lines.findIndex((l) => {
    const zone = l.slice(0, ZONE);
    if (!zone.includes(s.id)) return false;
    if (l.includes('~~')) return false; // already struck
    if (/^\s*(-\s*)?✅/.test(l)) return false; // a closure row, not the open one
    return true;
  });
  if (idx === -1) {
    report.push(`  ✗ ${s.id}: NO unstruck open row found in the subject zone — SKIPPED`);
    continue;
  }
  const line = lines[idx];
  const starAt = line.indexOf('**');
  if (starAt === -1) {
    report.push(`  ✗ ${s.id}: line ${idx + 1} has no bold subject to wrap — SKIPPED`);
    continue;
  }
  const prefix = line.slice(0, starAt);
  const body = line.slice(starAt);
  lines[idx] =
    `${prefix}~~**${s.id} — ✅ CLOSED, see ${s.closed}; struck s1261 as measured STALE by ` +
    `\`artifacts/findings-state-vocabulary-triage.md\` (s1260, \`637e156e\`) — ${s.ev} ${RETENTION}** ${body}~~`;
  report.push(`  ✓ ${s.id}: struck at L${idx + 1} (${line.length} → ${lines[idx].length} chars)`);
  struck += 1;
}

writeFileSync(path, lines.join('\n'));
console.log(report.join('\n'));
console.log(`\nstruck ${struck} of ${STRIKES.length}`);
