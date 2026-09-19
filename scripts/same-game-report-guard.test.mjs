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

// Whole rows, not just the leading id — see the value-drift test below for why this exists.
// Split on unescaped pipes only: `cell()` writes a literal `\|` for any pipe inside a value.
const tableRows = section[0].split('\n')
  .filter((line) => line.startsWith('| ') && !line.startsWith('|---'))
  .slice(1)
  .map((line) => line.replace(/^\| /, '').replace(/ \|$/, '').split(/ \| /))
  .filter((cells) => cells.length === 3)
  .map(([contractId, reason, citation]) => ({ contractId, reason, citation }));

// `same-game-audit.mjs:345` — the report is the escaped form, so compare source through it.
const cell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');

// The prose/table check alone is a tautology when a stale committed report remains internally
// consistent. The source-set check is what catches a report nobody regenerated.
test('same-game report exemption prose matches its table', () => {
  assert.equal(statedCount, tableIds.length, 'stated cited-exemption count differs from report table');
});

test('same-game report exemption table matches source', async () => {
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { CONTRACT_ADMISSION_EXEMPTIONS } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    assert.deepEqual(tableIds.sort(), Object.keys(CONTRACT_ADMISSION_EXEMPTIONS).sort(),
      'report exemption ids differ from CONTRACT_ADMISSION_EXEMPTIONS');
  } finally {
    await vite.close();
  }
});

// F-2096-1 (s2096). The id-set check above was written to catch "a report nobody regenerated",
// and it cannot: it compares only the KEY SET, so every VALUE in the table is unguarded. Proven
// live on main, not argued — `e2b9399a2` rewrote the `e3-fairground` reason to record F-E3CF-4 as
// CLOSED while the committed report kept saying "Admission HELD pending", and both tests above
// stayed green for the whole window because the seven ids never moved. A row asserting a finding
// is pending when source declares it closed is worse than a missing row: it is read as current.
// The id set is the LEAST volatile thing here — ids change when a contract is admitted or exempted
// (rare, ratcheted), reasons change whenever anyone measures anything (often). The guard was
// watching the stable half.
test('same-game report exemption reasons and citations match source', async () => {
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { CONTRACT_ADMISSION_EXEMPTIONS } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    assert.equal(tableRows.length, Object.keys(CONTRACT_ADMISSION_EXEMPTIONS).length,
      'cited-exemptions table row count differs from source');
    for (const row of tableRows) {
      const source = CONTRACT_ADMISSION_EXEMPTIONS[row.contractId];
      assert.ok(source, `report cites exemption '${row.contractId}' that source does not hold`);
      assert.equal(row.reason, cell(source.reason),
        `stale exemption reason for '${row.contractId}' — regenerate with `
        + `\`node scripts/same-game-audit.mjs --write-report\``);
      assert.equal(row.citation, cell(source.citation),
        `stale exemption citation for '${row.contractId}' — regenerate with `
        + `\`node scripts/same-game-audit.mjs --write-report\``);
    }
  } finally {
    await vite.close();
  }
});
