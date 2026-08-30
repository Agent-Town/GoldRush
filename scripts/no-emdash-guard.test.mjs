import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HUMAN_TEXT_KEYS = new Set([
  'arrivalTitle', 'defeatBeat', 'defeatLine', 'defeatTitle', 'description', 'geographyLine',
  'goals', 'label', 'ledgerBlurb', 'ledgerLabel', 'medalBlurb', 'name', 'objective', 'rules',
  'secureCallout', 'taunt', 'tauntTitle', 'teachingIntent', 'unlock', 'variantLabel',
]);
const SRC_EXCEPTIONS = new Set([
  'src/game/SaveSlots.ts', // Structural: NAME_RULE permits existing profile names containing em dashes.
  'src/story/ceremonyPostscripts.ts', // Structural: parses existing "Ceremony postscript — T(n)" headings.
  'src/world/SteamPlume.ts', // GLSL template comments are player-invisible but remain inside a JS string token.
  'src/world/Water.ts', // GLSL template comments are player-invisible but remain inside a JS string token.
  'src/sim/HeadlessContractSim.ts', // Agent/machine-facing verdict reasons pending an owner ruling.
  'src/sim/SeatedLockstepSim.ts', // Agent/machine-facing notices and errors pending an owner ruling.
  'src/sim/SeatOrders.ts', // Agent/machine-facing validation copy pending an owner ruling.
  'src/agent/MechanicsManifest.ts', // Agent-facing manifest copy pending an owner ruling.
]);

function containsEmDashOutsideComments(source) {
  return ts.transpileModule(source, {
    compilerOptions: { removeComments: true, target: ts.ScriptTarget.Latest },
  }).outputText.includes('—');
}

function inspectTextFields(value, key, location, failures) {
  if (typeof value === 'string') {
    if (HUMAN_TEXT_KEYS.has(key) && value.includes('—')) failures.push(location);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectTextFields(entry, key, `${location}[${index}]`, failures));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [childKey, child] of Object.entries(value)) {
      inspectTextFields(child, childKey, `${location}.${childKey}`, failures);
    }
  }
}

test('visitor copy and contract text fields contain no em dashes', () => {
  const failures = [];
  const srcFiles = execFileSync('git', ['ls-files', '-z', '--', 'src/**/*.ts'], { cwd: ROOT })
    .toString().split('\0').filter(Boolean);
  const scanned = srcFiles.filter((file) => !SRC_EXCEPTIONS.has(file));
  const skipped = srcFiles.length - scanned.length;
  console.log(`scan space: ${scanned.length} tracked src/**/*.ts files scanned, ${skipped} skipped`);
  for (const file of scanned) {
    if (containsEmDashOutsideComments(fs.readFileSync(path.join(ROOT, file), 'utf8'))) failures.push(file);
  }

  const publicDir = path.join(ROOT, 'public');
  for (const name of fs.readdirSync(publicDir).filter((entry) => /\.(?:md|txt)$/.test(entry))) {
    if (fs.readFileSync(path.join(publicDir, name), 'utf8').includes('—')) failures.push(`public/${name}`);
  }

  const contractsDir = path.join(ROOT, 'assets/contracts');
  for (const epoch of fs.readdirSync(contractsDir)) {
    const file = path.join(contractsDir, epoch, 'contracts.json');
    if (!fs.existsSync(file)) continue;
    inspectTextFields(JSON.parse(fs.readFileSync(file, 'utf8')), '', `assets/contracts/${epoch}/contracts.json`, failures);
  }

  assert.deepEqual(failures, []);
});
