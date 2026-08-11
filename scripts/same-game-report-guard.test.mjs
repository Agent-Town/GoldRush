import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const report = readFileSync(new URL('../docs/bench/same-game-audit.md', import.meta.url), 'utf8');
const section = report.match(/### Cited exemptions\n\n[\s\S]*?\n\nFinal derived door/);
assert.ok(section, 'same-game report is missing its cited-exemptions table');
const tableIds = [...section[0].matchAll(/^\| ([^|-][^|]*?) \|/gm)].slice(1).map((match) => match[1]);
const statedCount = Number(report.match(/The county holds (\d+) cited exemptions in total/)?.[1]);

// The prose/table check alone is a tautology when a stale committed report remains internally
// consistent. The source-set check is what catches a report nobody regenerated.
test('same-game report exemption prose matches its table', () => {
  assert.equal(statedCount, tableIds.length, 'stated cited-exemption count differs from report table');
});

test('same-game report exemption table matches source', async () => {
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { CONTRACT_ADMISSION_EXEMPTIONS } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    assert.deepEqual(tableIds.sort(), Object.keys(CONTRACT_ADMISSION_EXEMPTIONS).sort(),
      'report exemption ids differ from CONTRACT_ADMISSION_EXEMPTIONS');
  } finally {
    await vite.close();
  }
});
