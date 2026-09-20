#!/usr/bin/env node
// s1261 — strike the 14 measured-stale rows. v2.
//
// WHY v2: v1 re-implemented the probe's "declared in the leading subject zone" rule
// and the two implementations disagreed on 4 of 14 rows — v1 struck a shipped-drain
// list entry (L388) and three ⚙️/✍️/🔻 workflow-receipt rows instead of the open
// declarations. Line numbers + expected glyph now come from the probe itself
// (logs/session-scratch/s1259/findings-double-state.mjs), run this fire on this file,
// and every target is asserted before a byte is written. Run with --write to apply.
import { readFileSync, writeFileSync } from 'node:fs';

const RETENTION = 'Reasoning retained per the Retention Law.';
const WRITE = process.argv.includes('--write');

// { id, line, glyph } straight from the probe's OPEN rows; ev = closure evidence.
const STRIKES = [
  { id: 'F-1026-1', line: 1211, glyph: '', closed: 'L1237',
    ev: 'merge `386cce80`; `e2e/asset-diet.spec.ts` now gates the whole suite on the built bundle at file level — `test.skip(process.env.GR_ASSET_DIET_BUNDLE !== \'1\', BUILT_BUNDLE_ONLY)` — and `package.json:12` runs the preview-backed suite, so the pin this row asks for exists.' },
  { id: 'F-1026-5', line: 1217, glyph: '⚠', closed: 'L1231 (M1 half) + L1271 (M2 half, fully closed)',
    ev: 'M1 cure `bebc1b1f`, M2 cure `1ee47bbd`; `src/game/Game.ts:warmVfx` warms the late uploads and `e2e/m2-01-build-menu.spec.ts:340` ("stress draw calls stay under 200 with palisades and beacons") reaches the unchanged 200-call assertion.' },
  { id: 'F-1039-2', line: 1258, glyph: '🧭', closed: 'L1338 (instance) + L1929 (CLOSED AT THE CLASS, sixth instance)',
    ev: 'main `6a12b69c`; `scripts/status-line1.mjs` substitutes `{STAMP}` from a command and rejects future timestamps — the hand-computed-stamp defect now has a mechanism, not just a law.' },
  { id: 'F-1047-1', line: 1314, glyph: '⚠', closed: 'L1321',
    ev: '✓ RE-DERIVED s1261 BY CODE PROBE: merge `dca123b6`; `package.json:12` reads `"test:asset-diet": "GR_ASSET_DIET_BUNDLE=1 playwright test …"` and `scripts/deploy.sh:59-61` invokes the real budget leg with `GR_ASSET_DIET_BUNDLE=1`. The command no longer skips its assertions.' },
  { id: 'F-1126-1', line: 1753, glyph: '🔴', closed: 'L1757',
    ev: '✓ RE-DERIVED s1261 BY CODE PROBE, AND IT IS STRONGER THAN THE TRIAGE CLAIMED: merge `594e9180` added `npm run test:guards`, and the `GUARDS` array in `scripts/run-guards.mjs` now holds **TEN** callers (`test:node-guards`, `test:power-budget`, `test:stats`, `test:accounts`, `test:mp`, `test:deploy-contract`, `test:deploy-site-contract`, `test:task-guards`, `test:citations`, `test:gate-callers`) — not the seven this row says have zero. ⚠️ **This row is also a carried OWNER-DESK ask; striking it retires that desk item, which is why it was re-derived rather than inherited.**' },
  { id: 'F-1167-4', line: 314, glyph: '🔻', closed: 'L315',
    ev: 'discharged at `c14a19ef`; `scripts/suite-red-inventory.mjs:65` resolves absolute paths against the raw’s `runRoot`, not the invoking `process.cwd()`.' },
  { id: 'F-1168-1', line: 1313, glyph: '🔴', closed: 'L322',
    ev: 'cured and drained s1169 at `45124d00`; `GR_ASSET_DIET_BUNDLE` now owns the bundle-only duty while `GR_CAPTURE_EXTERNAL_SERVER` owns server reuse, so the flag no longer falsely runs bundle-only tests.' },
  { id: 'F-1170-2', line: 303, glyph: '✍', closed: 'L306 (itself a strike span — the first framing, retired to the owner’s desk and then answered)',
    ev: '✓ RE-DERIVED s1261 BY CODE PROBE, AND IT RESOLVES THE (a)-vs-(b) FORK THIS ROW OPENED: leaf `factory-build-mode-prompt-realign` is `merged` at `46d6308cea38`, and `e2e/bt-00-demolish.spec.ts:121-123` ("demolish refunds full-HP palisade and frees its footprint for replacement") now reads `setBuildMode(false)` → prompt `toBeHidden()` → `setBuildMode(true)` → prompt `toBeVisible()`. **The fork was decided as (a): the five specs were stale and have been realigned; `3e23a12a` did NOT regress a player capability.** ⚠️ **This row still carried a `FIRE-AUTHORABLE` flag, so it was advertising an authoring slot against already-ratified behaviour — the F-1258-4 harm shape exactly.**' },
  { id: 'F-1173-3', line: 289, glyph: '🔻', closed: 'L293 (discharged s1196; L291 is its ACTIONED workflow row)',
    ev: '✓ leaf `factory-run-guards-test-coverage` is `merged` at `0fae52bd0677`; `scripts/run-guards.test.mjs` black-box tests exit propagation, signals, filters and changed-file routing, so the runner no longer has no test.' },
  { id: 'F-1198-2', line: 249, glyph: '🔺', closed: 'L251 (shipped; L279 is its authored workflow row)',
    ev: '✓ leaf `factory-suite-red-inventory-run-tree-invariance` is `merged` at `1e351130118f`; `suite-red-inventory.mjs` keys off `config.rootDir`/`runRoot`, so the inventory no longer differs across checkouts.' },
  { id: 'F-1200-3', line: 277, glyph: '🔻', closed: 'L255',
    ev: 'shipped `731b3582`; `scripts/suite-red-inventory.test.mjs` now asserts the absolute "Failing file:line" path and rejects leaked fixture roots, so the guard is no longer weaker than its name. (The ⚙️ row two lines above is its workflow receipt and is deliberately left alone.)' },
  { id: 'F-1202-1', line: 263, glyph: '🚨', closed: 'L259',
    ev: '✓ leaf `factory-collection-guards-spawnsync-truncation` is `merged` at `df3e051ce9cb`; both collection guards now use `spawn` with file-backed stdout/stderr and read after `close`, so capture no longer truncates under load.' },
  { id: 'F-1210-5', line: 1931, glyph: '🚨', closed: 'L1910',
    ev: '✓ RE-DERIVED s1261 BY CODE PROBE: leaf `gg-01b-welcome-release-gate` is `merged` (`feb0a3d7`), and `e2e/release-build.spec.ts:48` ("first player reaches textured town actors and places a Dry Gulch spring sluice") clicks `town-welcome-skip` before approaching the Tavern, so the welcome no longer blocks the release-suite board click.' },
  { id: 'F-1256-2', line: 70, glyph: '🚨', closed: 'L50 (closed by execution at the GG-03e drain)',
    ev: '✓ RE-DERIVED s1261 BY CODE PROBE: merge `8133dd91`; `src/news/heraldReader.ts:15-23` maps all eight engravings including `ceremony`, all eight `assets/processed/herald-engraving-*.webp` exist on disk, and `scripts/asset-diet.mjs` still enforces the same ceilings.' },
];

const path = 'tasks/BACKLOG.md';
const lines = readFileSync(path, 'utf8').split('\n');
const ZONE = 140;
let bad = 0;

for (const s of STRIKES) {
  const line = lines[s.line - 1];
  const problems = [];
  if (line === undefined) problems.push('line does not exist');
  else {
    if (!line.slice(0, ZONE).includes(s.id)) problems.push(`${s.id} not in leading ${ZONE} chars`);
    if (s.glyph && !line.slice(0, 12).includes(s.glyph)) problems.push(`expected glyph ${s.glyph} not at line head`);
    if (line.includes('~~')) problems.push('line already contains a strike span');
    if (line.indexOf('**') === -1) problems.push('no bold subject to wrap');
  }
  if (problems.length) {
    console.log(`✗ ${s.id} L${s.line}: ${problems.join('; ')}`);
    console.log(`    ${String(line).slice(0, 150)}`);
    bad += 1;
  } else {
    console.log(`✓ ${s.id} L${s.line}: ${line.slice(0, 130)}`);
  }
}

if (bad) {
  console.log(`\n${bad} target(s) failed assertion — NOTHING WRITTEN.`);
  process.exit(1);
}
console.log(`\nall ${STRIKES.length} targets asserted OK`);

if (!WRITE) {
  console.log('dry run — pass --write to apply.');
  process.exit(0);
}

for (const s of STRIKES) {
  const line = lines[s.line - 1];
  const starAt = line.indexOf('**');
  lines[s.line - 1] =
    `${line.slice(0, starAt)}~~**${s.id} — ✅ CLOSED, see ${s.closed}; struck s1261 as measured STALE by ` +
    `\`artifacts/findings-state-vocabulary-triage.md\` (s1260, \`637e156e\`) — ${s.ev} ${RETENTION}** ${line.slice(starAt)}~~`;
}
writeFileSync(path, lines.join('\n'));
console.log(`WROTE ${STRIKES.length} strikes to ${path}`);
