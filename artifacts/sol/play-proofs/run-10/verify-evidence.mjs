import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
const root = 'artifacts/sol/play-proofs/run-10';
const base = fs.readFileSync(`${root}/base.txt`, 'utf8').trim();
const allowed = ['driver.ts', 'e9-old-canal.spec.ts', 'e1-twin-banks.spec.ts', 'e2-incline.spec.ts'].map(p => `e2e/native-proofs/${p}`);
const changed = execFileSync('git', ['diff', '--name-only', base], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
assert.ok(changed.every(p => allowed.includes(p) || p.startsWith(`${root}/`)), 'tracked changes respect firewall');
function assertions(text) {
  const ast = ts.createSourceFile('driver.ts', text, ts.ScriptTarget.Latest, true);
  const found = [];
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'expect') found.push(node.getText(ast));
    ts.forEachChild(node, visit);
  }
  visit(ast); return found;
}
for (const file of allowed) {
  const before = execFileSync('git', ['show', `${base}:${file}`], { encoding: 'utf8' });
  assert.deepEqual(assertions(fs.readFileSync(file, 'utf8')), assertions(before), `${file}: existing expectations unchanged`);
}
const rows = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/^row-.*\.json$/.test(entry.name)) {
      const row = JSON.parse(fs.readFileSync(file, 'utf8'));
      assert.equal(row.consoleErrors.length, 0); assert.equal(row.pageErrors.length, 0); assert.equal(row.clean.ok, true);
      assert.ok(fs.existsSync(path.join(dir, `terminal-${row.project}.png`)));
      if (row.secures.ok) {
        for (const cell of ['banks', 'board', 'reload']) assert.equal(row[cell].ok, true, `${file}: ${cell}`);
        for (const shot of ['board', 'bank-cell', 'bank-book']) assert.ok(fs.existsSync(path.join(dir, `${shot}-${row.project}.png`)), `${file}: ${shot}`);
        const cell = JSON.parse(fs.readFileSync(path.join(dir, `bank-cell-${row.project}.json`), 'utf8'));
        assert.equal(cell.originalContext, true);
        assert.ok(cell.text.includes(`wave ${row.peakWave}`));
      }
      rows.push({ file, project: row.project, map: row.contract, secure: row.secures.ok, wave: row.peakWave,
        seconds: row.simAtEnd, hp: row.hpAtEnd, gold: row.goldAtEnd, repairs: row.finalSnapshot.repairs,
        standing: row.finalSnapshot.defences.filter(p => p.hp > 0 && !p.wrecked).length,
        pieces: row.finalSnapshot.defences.length, lateSpent: row.restoration?.spent ?? null });
    }
  }
}
walk(root);
assert.equal(rows.filter(r => r.map === 'e9-old-canal' && r.project === 'desktop-chrome').length, 1);
assert.equal(rows.filter(r => r.map === 'e9-old-canal' && r.project === 'mobile-chrome').length, 0);
assert.equal(rows.filter(r => r.map === 'e1-twin-banks' && r.project === 'mobile-chrome').length, 2);
const changedPhone = rows.find(r => r.map === 'e1-twin-banks' && r.project === 'mobile-chrome' && !r.file.includes('/diagnostic/'));
assert.equal(rows.filter(r => r.map === 'e1-twin-banks' && r.project === 'desktop-chrome').length, changedPhone.secure ? 1 : 0);
assert.equal(rows.filter(r => r.map === 'e2-incline' && r.project === 'desktop-chrome').length, 1);
console.log(JSON.stringify({ scope: 'PASS', existingExpectations: 'unchanged', cleanBrowsers: 'PASS',
  successfulRideScreenshots: 'PASS', rideLimits: 'PASS', rows }, null, 2));
