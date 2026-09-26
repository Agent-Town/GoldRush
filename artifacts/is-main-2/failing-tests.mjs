#!/usr/bin/env node
/**
 * failing-tests.mjs: the failing tests of a `node --test` spec-reporter log, one line each
 * (file:line, test name, first error line), plus the log's own totals. Evidence helper for
 * artifacts/is-main-2 (is-main-2, 2026-09-26): the control, measurement and final family runs are
 * compared with it.
 *
 * usage: node artifacts/is-main-2/failing-tests.mjs <log> [<log>...]
 */
import { readFileSync } from 'node:fs';

for (const file of process.argv.slice(2)) {
  const text = readFileSync(file, 'utf8');
  const totals = ['tests', 'pass', 'fail', 'cancelled', 'skipped'].map((k) => `${k} ${(text.match(new RegExp(`^ℹ ${k} (\\d+)`, 'm')) ?? [])[1] ?? '?'}`).join(', ');
  const rc = (text.match(/^rc=(\d+) elapsed=(\d+)s/m) ?? []).slice(1);
  console.log(`== ${file}: ${totals}; rc ${rc[0] ?? '?'}, ${rc[1] ?? '?'} s`);
  const at = text.indexOf('✖ failing tests:');
  if (at === -1) continue;
  const lines = text.slice(at).split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const where = lines[i].match(/^test at (\S+)/);
    if (!where) continue;
    const name = (lines[i + 1] ?? '').replace(/^✖\s*/, '').replace(/\s*\(\d+(\.\d+)?ms\)\s*$/, '');
    const error = lines.slice(i + 2, i + 12).map((l) => l.trim()).find((l) => l && !l.startsWith('at ')) ?? '';
    console.log(`   ${where[1].replace(/^file:\/\/\S*?\/scripts\//, 'scripts/')} | ${name.slice(0, 110)} | ${error.slice(0, 170)}`);
  }
}
