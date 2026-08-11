// s1656 drain acceptance for f1655-1: does the cured reducer preserve the TEN hand-authored
// sections of the REAL 844-line logs/suite-red-inventory.md, byte-for-byte?
// Runs the OLD reducer as a CONTROL on an identical copy — a green here means nothing unless
// the old one is shown to destroy the same sections (s1299/s1300 manufacture-the-defect standard).
// Both arms run from IDENTICALLY-SHAPED mini-roots (mirroring the suite's own scriptCopies
// helper), because the reducer resolves its tree from its own path — an unequal shape would
// make the control refuse for the wrong reason and fake a passing comparison.
// Writes ONLY into /tmp. The live report is never opened for writing (master firewall).
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const GATE = path.join(REPO, 'gate-s1656');
const LIVE = path.join(REPO, 'logs/suite-red-inventory.md');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's1656-acceptance-'));

function miniRoot(name, source) {
  const root = path.join(dir, name);
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'scripts', 'suite-red-inventory.mjs'), source);
  fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(root, 'node_modules'), 'dir');
  fs.mkdirSync(path.join(root, 'e2e'));
  fs.writeFileSync(path.join(root, 'e2e', 'fixture.spec.ts'), "test('cwd invariant failure', async () => {\n  await fixture();\n  throw new Error('fixture failure');\n});\n");
  return root;
}

const newSource = fs.readFileSync(path.join(GATE, 'scripts/suite-red-inventory.mjs'), 'utf8');
const oldSource = execFileSync('git', ['show', 'main:scripts/suite-red-inventory.mjs'], { cwd: REPO, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const CURED_ROOT = miniRoot('cured', newSource);
const CONTROL_ROOT = miniRoot('control', oldSource);

// one raw input, shared by both arms
function makeInput(root) {
  const specFile = path.join(root, 'e2e', 'fixture.spec.ts');
  const input = path.join(root, 'input.json');
  fs.writeFileSync(input, JSON.stringify({
    config: { rootDir: path.join(root, 'e2e') },
    suites: [{
      title: 'fixture.spec.ts',
      file: 'fixture.spec.ts',
      specs: [{
        title: 'cwd invariant failure',
        file: 'fixture.spec.ts',
        line: 1,
        tests: ['desktop-chrome', 'mobile-chrome'].map((projectName) => ({
          projectName,
          status: 'unexpected',
          expectedStatus: 'passed',
          results: [{
            status: 'failed',
            duration: 1,
            error: {
              message: 'fixture failure',
              location: { file: specFile, line: 3, column: 3 },
              stack: `Error: fixture failure\n    at ${specFile}:3:3`,
            },
          }],
        })),
      }],
    }],
  }));
  return input;
}

const liveText = fs.readFileSync(LIVE, 'utf8');

// The ten sections are DERIVED from the live file, never hardcoded: any '## ' section whose
// heading the generator does not emit. The generated set is read off the code under test.
const freshOut = path.join(dir, 'fresh.md');
const freshRun = spawnSync(process.execPath, [path.join(CURED_ROOT, 'scripts/suite-red-inventory.mjs'), makeInput(CURED_ROOT), freshOut], { cwd: CURED_ROOT, encoding: 'utf8' });
if (freshRun.status !== 0) { console.error('fresh run failed:', freshRun.stderr); process.exit(1); }
const generatedHeadings = new Set((fs.readFileSync(freshOut, 'utf8').match(/^## [^\r\n]*/gm) || []));

const matches = [...liveText.matchAll(/^## [^\r\n]*/gm)];
const liveSections = matches.map((m, i) => ({
  heading: m[0],
  text: liveText.slice(m.index, matches[i + 1]?.index ?? liveText.length),
}));
const handAuthored = liveSections.filter((s) => !generatedHeadings.has(s.heading));

console.log(`live file: ${liveText.split('\n').length} lines · ${liveSections.length} '## ' sections`);
console.log(`generator emits ${generatedHeadings.size} · hand-authored ${handAuthored.length}`);
console.log('');

function arm(label, root) {
  const out = path.join(root, 'report.md');
  fs.writeFileSync(out, liveText); // an exact copy of the live report as the EXISTING output
  const res = spawnSync(process.execPath, [path.join(root, 'scripts/suite-red-inventory.mjs'), makeInput(root), out], { cwd: root, encoding: 'utf8' });
  const after = fs.readFileSync(out, 'utf8');
  const survived = handAuthored.filter((s) => after.includes(s.text));
  const lost = handAuthored.filter((s) => !after.includes(s.text));
  console.log(`--- ${label} --- rc=${res.status}`);
  if (res.stdout.trim()) console.log(`   stdout: ${res.stdout.trim()}`);
  if (res.stderr.trim()) console.log(`   stderr: ${res.stderr.trim().split('\n')[0]}`);
  console.log(`   hand-authored sections surviving byte-for-byte: ${survived.length}/${handAuthored.length}`);
  console.log(`   result: ${after.split('\n').length} lines (live was ${liveText.split('\n').length})`);
  for (const s of lost) console.log(`   LOST: ${s.heading.slice(0, 76)}`);
  console.log('');
  return { survived: survived.length, total: handAuthored.length, after, rc: res.status };
}

const control = arm('CONTROL — old reducer (main)', CONTROL_ROOT);
const cured = arm('CURED — new reducer (lane/a)', CURED_ROOT);

const KEY = '## Corrections since the snapshot';
console.log(`consumer key '${KEY}' — after cure: ${cured.after.includes(KEY)} · after control: ${control.after.includes(KEY)}`);
console.log('');
const pass = cured.survived === cured.total && control.survived === 0 && control.rc === 0;
console.log(`VERDICT: control preserved ${control.survived}/${control.total} (expect 0 = the defect reproduces) · cured preserved ${cured.survived}/${cured.total} (expect ${cured.total})`);
console.log(`scratch dir: ${dir}`);
process.exit(pass ? 0 : 1);
