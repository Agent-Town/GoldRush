#!/usr/bin/env node
// rider-parity-grammar: replay a named panel of heat-12 tapes on THE CURRENT TREE and print one
// row per tape. Used twice per stage — once on the stage's base, once on its tip — so every moved
// hash in the review has a measured BEFORE and a measured AFTER rather than a recorded one.
//
// The recorded hash in a ride's summary.json is NOT a usable BEFORE: heat 12 rode engine
// 86e53f37 on 2026-09-05 and main has moved since, so a tape can already diverge at the base of
// this task (e1-baron/tune-1 records fnv1a32:41f0518d and replays to fnv1a32:fe24406d at
// 8c84605ed). Measuring both ends on this tree is the only honest attribution.
//
// Usage: node artifacts/rider-parity-grammar/replay-panel.mjs <out.json> [--scored] [--jobs N] [file...]
import { execFile } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';

const run = promisify(execFile);
const argv = process.argv.slice(2);
const out = argv.shift();
if (!out) throw new Error('usage: replay-panel.mjs <out.json> [--scored] [--jobs N] [file...]');

const scoredOnly = argv.includes('--scored');
const jobsAt = argv.indexOf('--jobs');
const jobs = jobsAt === -1 ? 4 : Number(argv[jobsAt + 1]);
const explicit = argv.filter((a, i) => !a.startsWith('--') && !(jobsAt !== -1 && i === jobsAt + 1));

const inventory = JSON.parse(readFileSync('artifacts/rider-parity-grammar/tape-inventory.json', 'utf8'));
const panel = explicit.length > 0
  ? inventory.rows.filter((row) => explicit.includes(row.file))
  : inventory.rows.filter((row) => !scoredOnly || row.scored);

const results = [];
let next = 0;
async function worker() {
  for (;;) {
    const index = next; next += 1;
    if (index >= panel.length) return;
    const row = panel[index];
    const startedAt = Date.now();
    try {
      const { stdout } = await run(process.execPath, ['scripts/assay-replay.mjs', row.file], {
        maxBuffer: 64 * 1024 * 1024,
      });
      const replay = JSON.parse(stdout.trim().split('\n').at(-1));
      results.push({ ...rowKey(row), ...replay, wallSeconds: Math.round((Date.now() - startedAt) / 1000) });
    } catch (error) {
      results.push({ ...rowKey(row), error: String(error.stderr ?? error.message).slice(-600) });
    }
    process.stderr.write(`${results.length}/${panel.length} ${row.ride}/${row.name}\n`);
  }
}

function rowKey(row) {
  return {
    ride: row.ride,
    name: row.name,
    file: row.file,
    scored: row.scored,
    tapeId: row.tapeId,
    contract: row.contract,
    seed: row.seed,
    difficulty: row.difficulty,
    recordedEngineHash: row.engineHash,
    recordedEventLogHash: row.recordedEventLogHash,
    carriesRemoved: row.carriesRemoved,
    carriesRebased: row.carriesRebased,
    carriesRepair: row.carriesRepair,
  };
}

await Promise.all(Array.from({ length: Math.max(1, jobs) }, worker));
results.sort((a, b) => `${a.ride}/${a.name}`.localeCompare(`${b.ride}/${b.name}`));
writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), tapes: results.length, results }, null, 2)}\n`);
process.stderr.write(`wrote ${out}\n`);
