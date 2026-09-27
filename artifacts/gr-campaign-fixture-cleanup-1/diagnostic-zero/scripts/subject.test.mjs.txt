
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
process.stdout.write('stdout-before-crash\n'); process.stderr.write('stderr-before-crash\n'); process.exit(0);
test('controlled nested assertion', () => {
  const dir = mkdtempSync(join(tmpdir(), 'campaign-diagnostic-'));
  try { assert.fail('CONTROLLED_NESTED_ASSERTION'); }
  finally { rmSync(dir, { recursive: true }); }
});
