import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HUMAN_TEXT_KEYS = new Set([
  'arrivalTitle', 'defeatBeat', 'defeatLine', 'defeatTitle', 'description', 'geographyLine',
  'goals', 'label', 'ledgerBlurb', 'ledgerLabel', 'medalBlurb', 'name', 'objective', 'rules',
  'secureCallout', 'taunt', 'tauntTitle', 'teachingIntent', 'unlock', 'variantLabel',
]);

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
