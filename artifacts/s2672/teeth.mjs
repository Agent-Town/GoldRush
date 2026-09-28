// s2672 — TEETH BY MUTATION for the destination arms (22-25) of
// scripts/ledger-mirror-freshness-guard.test.mjs.
//
// A passing guard never executes its own violation path, so a green is not evidence about
// a red. This copies scripts/ and ops/ into a scratch root, runs the suite there as a
// CONTROL, then manufactures one defect at a time and records WHICH ARM reddens. A
// mutation that reds nothing is a toothless arm; a mutation that reds a DIFFERENT arm than
// predicted is recorded as the prediction being wrong, never quietly widened (s2671's rule).
//
// cwd stays the real repo so scripts/ledger-backup-pull.mjs can read GR_DROPLET_HOST from
// .env.local; every path the subjects resolve comes from import.meta.url inside the scratch
// root, so the live tree is never the corpus. Rerunnable.
import { cpSync, mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const root = mkdtempSync(path.join(tmpdir(), 's2672-teeth-'));
cpSync(path.join(REPO, 'scripts'), path.join(root, 'scripts'), { recursive: true });
cpSync(path.join(REPO, 'ops'), path.join(root, 'ops'), { recursive: true });

const TEST = path.join(root, 'scripts', 'ledger-mirror-freshness-guard.test.mjs');
const RESOLVER = path.join(root, 'scripts', 'ledger-mirror-dest.mjs');
const FRESHNESS = path.join(root, 'scripts', 'ledger-mirror-freshness.mjs');
const pristine = { resolver: readFileSync(RESOLVER, 'utf8'), freshness: readFileSync(FRESHNESS, 'utf8') };

function run() {
  const r = spawnSync('node', ['--test', '--test-timeout=300000', TEST],
    { encoding: 'utf8', cwd: REPO, timeout: 600_000 });
  const out = (r.stdout ?? '') + (r.stderr ?? '');
  // node --test prints ✖ for a failing test AND again in its summary block, so the raw
  // match list double-counts every arm. Dedupe: this is a property of the REPORTER, and a
  // count that silently doubles is exactly the kind of number this factory files findings
  // about — it is fixed here rather than read around.
  const failed = [...new Set([...out.matchAll(/^✖ (\d+)\./gm)].map(m => Number(m[1])))].sort((a, b) => a - b);
  const reasons = [...out.matchAll(/^✖ (\d+)\.[^\n]*\n([\s\S]*?)(?=\n {2}\.\.\.|\n✔|\n✖|$)/gm)]
    .map(m => [Number(m[1]), (/(?:AssertionError|Error)[^\n]*\n?|message: '([^']*)'|\+ actual[^\n]*/.exec(m[2])?.[0] ?? '').trim()]);
  const pass = /^ℹ pass (\d+)$/m.exec(out)?.[1] ?? '?';
  const fail = /^ℹ fail (\d+)$/m.exec(out)?.[1] ?? '?';
  return { failed, reasons, pass, fail, rc: r.status };
}

const restore = () => {
  writeFileSync(RESOLVER, pristine.resolver);
  writeFileSync(FRESHNESS, pristine.freshness);
};

const lines = [];
const say = (s) => { lines.push(s); console.log(s); };

const control = run();
say(`CONTROL (scratch copy, unmutated): pass ${control.pass}, fail ${control.fail}, rc ${control.rc}`);
if (control.fail !== '0') { say('control is not green — every verdict below would be meaningless'); process.exit(1); }

const mutations = [
  {
    name: 'M1 — the destination moves back INSIDE the public repo',
    predicts: [22],
    why: 'owner ruling 15 mechanised: a mirror under the repo root is one `git add -f` from a public origin',
    explain: 'arm 24 reds too, and the reason is the mutation\'s own shape rather than a flaky arm: with the '
      + 'destination anchored to the SCRIPT\'S OWN LOCATION, "the default" stops being ONE value — the relocated '
      + 'copy in the fixture resolves <fixture>/artifacts/ledger-backups while the test imports the scratch '
      + 'root\'s. A homedir anchor has one value everywhere, which is the property the re-home bought.',
    apply: () => writeFileSync(RESOLVER, pristine.resolver.replace(
      "export const DEFAULT_MIRROR_DIR = path.join(homedir(), '.goldrush', 'ledger-backups');",
      "export const DEFAULT_MIRROR_DIR = fileURLToPath(new URL('../artifacts/ledger-backups/', import.meta.url));\nimport { fileURLToPath } from 'node:url';")),
  },
  {
    name: 'M2 — the freshness guard keeps its OWN copy of the destination again',
    predicts: [23, 24],
    why: 'the divergence s2671 banked: the pull follows the re-home, the guard audits the abandoned path',
    explain: 'twelve arms, not two, and the excess is the finding: once the guard stops honouring the shared '
      + 'destination it can no longer be AIMED AT A FIXTURE AT ALL, so every corpus-driven arm (1,2,3,7,8,9,16,'
      + '17,19,20) loses its subject as well. The divergence is not a narrow reporting defect — it detaches the '
      + 'tool from the directory in force.',
    apply: () => writeFileSync(FRESHNESS, pristine.freshness.replace(
      'const MIRROR_DEST = resolveMirrorDest();\nconst MIRROR_DIR = MIRROR_DEST.dir;',
      "const MIRROR_DEST = { dir: fileURLToPath(new URL('../artifacts/ledger-backups/', import.meta.url)), provenance: 'default' };\nconst MIRROR_DIR = MIRROR_DEST.dir;")),
  },
  {
    name: 'M3 — the provenance stops riding with the path',
    predicts: [24],
    why: 'an env-narrowed corpus that prints like the default is F-2220-1 rebuilt in a new place',
    apply: () => writeFileSync(RESOLVER, pristine.resolver.replace(
      /export function destLine[\s\S]*?\n}/,
      'export function destLine(dest = resolveMirrorDest()) {\n  return `destination : ${dest.dir}  (default: private, outside the public repo)`;\n}')),
  },
  {
    name: 'M4 — a RELATIVE override is resolved against cwd instead of refused',
    predicts: [25],
    why: 'the over-general fix: it passes every other arm and restores a cwd-aimable corpus',
    apply: () => writeFileSync(RESOLVER, pristine.resolver.replace(
      /  if \(!path\.isAbsolute\(override\)\) \{[\s\S]*?\n  \}/,
      '  if (!path.isAbsolute(override)) return { dir: path.resolve(override), provenance: \'environment\' };')),
  },
];

for (const m of mutations) {
  restore();
  m.apply();
  const r = run();
  const hit = r.failed.join(',') || 'NOTHING';
  const ok = JSON.stringify(r.failed) === JSON.stringify(m.predicts);
  say('');
  say(`${m.name}`);
  say(`  why it matters : ${m.why}`);
  say(`  predicted arm(s): ${m.predicts.join(',')}`);
  say(`  reddened arm(s) : ${hit}   (pass ${r.pass}, fail ${r.fail})`);
  say(`  verdict         : ${ok ? 'AS PREDICTED' : r.failed.length === 0 ? 'NO TEETH — the arm does not catch this' : 'PREDICTION NARROWER THAN THE MUTATION — recorded as measured, not widened after the fact'}`);
  for (const [arm, why] of new Map(r.reasons)) if (why) say(`    arm ${arm}: ${why.slice(0, 160)}`);
  if (m.explain) say(`  explained       : ${m.explain}`);
}

restore();
const after = run();
say('');
say(`RESTORED: pass ${after.pass}, fail ${after.fail}, rc ${after.rc}`);
writeFileSync(fileURLToPath(new URL('./teeth.txt', import.meta.url)), lines.join('\n') + '\n');
rmSync(root, { recursive: true, force: true });
