import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { srcScanSpace } from './no-emdash-scan-space.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HUMAN_TEXT_KEYS = new Set([
  'arrivalTitle', 'defeatBeat', 'defeatLine', 'defeatTitle', 'description', 'geographyLine',
  'goals', 'label', 'ledgerBlurb', 'ledgerLabel', 'medalBlurb', 'name', 'objective', 'rules',
  'secureCallout', 'taunt', 'tauntTitle', 'teachingIntent', 'unlock', 'variantLabel',
]);

const FORBIDDEN_DASH = /—|&(?:mdash|ndash|#821[12]|#x2014);|\\u2014/i;

function containsEmDashOutsideComments(source) {
  return FORBIDDEN_DASH.test(ts.transpileModule(source, {
    compilerOptions: { removeComments: true, target: ts.ScriptTarget.Latest },
  }).outputText);
}

function inspectTextFields(value, key, location, failures) {
  if (typeof value === 'string') {
    if (HUMAN_TEXT_KEYS.has(key) && FORBIDDEN_DASH.test(value)) failures.push(location);
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
  const { all, scanned, skipped } = srcScanSpace(ROOT);
  console.log(`scan space: ${all.length} tracked src TS files (${scanned.length} scanned, ${skipped} skipped)`);
  for (const file of scanned) {
    if (containsEmDashOutsideComments(fs.readFileSync(path.join(ROOT, file), 'utf8'))) failures.push(file);
  }

  const publicDir = path.join(ROOT, 'public');
  for (const name of fs.readdirSync(publicDir).filter((entry) => /\.(?:md|txt)$/.test(entry))) {
    if (FORBIDDEN_DASH.test(fs.readFileSync(path.join(publicDir, name), 'utf8'))) failures.push(`public/${name}`);
  }

  const contractsDir = path.join(ROOT, 'assets/contracts');
  for (const epoch of fs.readdirSync(contractsDir)) {
    const file = path.join(contractsDir, epoch, 'contracts.json');
    if (!fs.existsSync(file)) continue;
    inspectTextFields(JSON.parse(fs.readFileSync(file, 'utf8')), '', `assets/contracts/${epoch}/contracts.json`, failures);
  }

  assert.deepEqual(failures, []);
});

// These fixtures use the same detector as the tracked-source scan.
test('dash entities and Unicode escapes cannot bypass the guard', () => {
  for (const dash of ['—', '&mdash;', '&#8212;', '&#x2014;', String.raw`\u2014`, '&ndash;', '&#8211;']) {
    assert.equal(containsEmDashOutsideComments(`const copy = "before ${dash} after";`), true, dash);
    const failures = [];
    inspectTextFields({ description: dash }, '', 'fixture', failures);
    assert.deepEqual(failures, ['fixture.description'], dash);
  }
  assert.equal(containsEmDashOutsideComments('const copy = "repairs, pickups · none"; // &mdash;'), false);
});
