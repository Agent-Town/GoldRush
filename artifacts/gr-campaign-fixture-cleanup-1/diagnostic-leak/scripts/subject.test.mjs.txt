
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

test('controlled nested assertion', () => {
  const dir = mkdtempSync(join(tmpdir(), 'campaign-diagnostic-'));
  try { assert.fail('CONTROLLED_NESTED_ASSERTION'); }
  finally { /* deliberately leak for the verdict probe */ }
});
