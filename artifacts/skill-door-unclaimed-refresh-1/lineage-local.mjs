import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
const skill = readFileSync('public/skill.md', 'utf8');
const ids = JSON.parse(skill.match(/<!-- skillmd-guard:door-contracts:start -->\s*```json\s*([\s\S]*?)\s*```/)[1]);
assert.equal(ids.length, 38);
assert.equal(new Set(ids).size, 38);
const requests = [];
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  assert.equal(req.method, 'GET');
  assert.equal(url.pathname, '/api/standings');
  assert.ok(ids.includes(url.searchParams.get('contract')));
  requests.push(url.searchParams.get('contract'));
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true, board: [] }));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  const child = spawn(process.execPath, ['scripts/assay-lineage-sweep.mjs', '--base', `http://127.0.0.1:${server.address().port}`], { stdio: ['ignore', 'pipe', 'inherit'] });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  const code = await new Promise(resolve => child.on('close', resolve));
  assert.equal(code, 0);
  const rows = output.trim().split('\n').map(JSON.parse);
  const done = rows.at(-1);
  assert.equal(done.event, 'lineage_sweep_done');
  assert.equal(done.contracts, requests.length);
  assert.ok(done.contracts > 0);
  assert.equal(done.reassayed, 0);
  assert.equal(done.commit, false);
  console.log(output.trim());
  console.log(`PASS: 38 door IDs parsed; ${requests.length} local empty-board requests; no live-county requests.`);
} finally {
  await new Promise(resolve => server.close(resolve));
}
