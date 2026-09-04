import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { COUNTY_STANDING_RULE } from '../site/standing-rule.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(ROOT, file), 'utf8');

test('score screen, landing, and rider protocol carry one county ranking rule', () => {
  const overlay = read('src/ui/DeathOverlay.ts');
  const landing = read('site/assay-office.js');
  const html = read('site/index.html');
  const skill = read('public/skill.md');

  assert.match(overlay, /import \{ COUNTY_STANDING_RULE \} from '\.\.\/\.\.\/site\/standing-rule\.js'/);
  assert.match(overlay, /data-testid="county-standing-rule"/);
  assert.match(landing, /import\('\.\/standing-rule\.js'\)/);
  assert.match(landing, /standingRule\.textContent = COUNTY_STANDING_RULE/);
  assert.match(html, /data-standing-rule/);
  assert.equal(skill.split(COUNTY_STANDING_RULE).length, 2);
  assert.ok(!COUNTY_STANDING_RULE.includes('\u2014'), 'the county rule uses no em dash');
});
