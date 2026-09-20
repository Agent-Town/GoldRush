#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const output = process.argv[2];
if (!output) throw new Error('usage: sweep-agent-tapes.mjs OUTPUT');
const paths = [];
await walk('artifacts');
const tapes = [];
for (const path of paths) {
  try {
    const tape = JSON.parse(await readFile(path, 'utf8'));
    if (typeof tape?.eventLogHash === 'string' && isAgentTape(tape)) tapes.push({ path, tape });
  } catch {}
}

const results = [];
let cursor = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (cursor < tapes.length) {
    const { path, tape } = tapes[cursor++];
    const replay = await run(path);
    if (!replay.ok) {
      results.push({ path, claimed: tape.eventLogHash, status: 'unreplayable', error: replay.error });
      continue;
    }
    const result = JSON.parse(replay.stdout.trim().split('\n').at(-1));
    results.push({
      path,
      claimed: tape.eventLogHash,
      replayed: result.eventLogHash,
      status: tape.eventLogHash === result.eventLogHash ? 'agree' : 'diverge',
      outcome: result.outcome,
    });
  }
}));
results.sort((a, b) => a.path.localeCompare(b.path));
const counts = Object.fromEntries(['agree', 'diverge', 'unreplayable'].map((status) => [status, results.filter((row) => row.status === status).length]));
await writeFile(output, `${JSON.stringify({ total: results.length, ...counts, results }, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ total: results.length, ...counts })}\n`);

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (path.startsWith('artifacts/f2289-1-')) continue;
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && entry.name.endsWith('.json')) paths.push(path);
  }
}

function isAgentTape(tape) {
  return [tape.inputLog, ...(tape.inputLog?.streams ?? [])].some((log) => log?.entries?.some((entry) =>
    entry.a?.some((action) => action?.kind === 'agent_orders')));
}

function run(path) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/assay-replay-agent.mjs', path], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (code) => resolve(code === 0 ? { ok: true, stdout } : { ok: false, error: stderr.trim() || `exit ${code}` }));
  });
}
