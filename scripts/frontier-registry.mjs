#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMain } from './is-main.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_ARTIFACT = path.join(ROOT, 'assets/contracts/frontier-registry.json');
const ERAS = [
  { startsAt: 0, stamp: 'pre-walk' },
  { startsAt: 1_786_167_061_000, stamp: '55ce6f7d' },
  { startsAt: 1_786_376_727_000, stamp: '89e97e293' },
];

export function deriveRegistry(boardExport, previous = null, sourceBackend = 'exported-board') {
  const candidates = [];
  for (const [key, rows] of Object.entries(boardExport.boards ?? boardExport)) {
    const match = /^standings:(?:s\d+:)?([^:]+):([^:]+)$/.exec(key);
    if (!match || !Array.isArray(rows)) continue;
    const [, , contractId] = match;
    for (const row of rows) {
      const decisions = row?.assay === 'verified' ? decisionCount(row) : undefined;
      if (!row?.seed || decisions === undefined) continue;
      candidates.push({ contractId, seed: row.seed, eraStamp: eraAt(row.submittedAt), row, decisions });
    }
  }

  const best = new Map();
  for (const candidate of candidates) {
    const key = frontierKey(candidate);
    const current = best.get(key);
    if (!current || compareCandidate(candidate, current) < 0) best.set(key, candidate);
  }

  const frontiers = [...best.values()].sort(compareKey).map(({ contractId, seed, eraStamp, row, decisions }) => ({
    contractId,
    seed,
    eraStamp,
    surveyor: {
      profileName: row.profileName,
      ...(row.stack?.model ? { model: row.stack.model } : {}),
      ...(row.stack?.harness ? { harness: row.stack.harness } : {}),
      decisions,
      submittedAt: row.submittedAt,
      assayedAt: row.assayedAt,
      assayHash: row.assayHash,
      inputLogHash: row.inputLogHash,
      score: { waves: row.waves, timeAlive: row.timeAlive, gold: row.gold, baseValue: row.baseValue },
    },
    homesteader: null,
  }));

  const oldFrontiers = new Map((previous?.frontiers ?? []).map((frontier) => [frontierKey(frontier), frontier]));
  const events = [...(previous?.events ?? [])];
  const eventIds = new Set(events.map((event) => event.id));
  for (const frontier of frontiers) {
    const old = oldFrontiers.get(frontierKey(frontier));
    if (!old || old.surveyor.inputLogHash === frontier.surveyor.inputLogHash
      || frontier.surveyor.decisions >= old.surveyor.decisions) continue;
    const event = {
      id: `frontier-${frontier.eraStamp}-${frontier.contractId}-${frontier.seed}-${frontier.surveyor.assayHash.replace(':', '-')}`,
      kind: 'frontier-dethroned',
      contractId: frontier.contractId,
      seed: frontier.seed,
      eraStamp: frontier.eraStamp,
      recordedAt: frontier.surveyor.assayedAt,
      previous: { profileName: old.surveyor.profileName, decisions: old.surveyor.decisions },
      current: { profileName: frontier.surveyor.profileName, decisions: frontier.surveyor.decisions },
    };
    if (!eventIds.has(event.id)) events.push(event);
  }
  events.sort((a, b) => a.recordedAt - b.recordedAt || a.id.localeCompare(b.id));

  return {
    schema: 'goldrush.frontiers.v1',
    generatedAt: candidates.reduce((latest, candidate) => Math.max(latest, candidate.row.assayedAt ?? 0), 0),
    sourceBackend,
    frontiers,
    events,
  };
}

function decisionCount(row) {
  const input = row?.tape?.inputLog;
  if (!input || !Array.isArray(input.entries)) return undefined;
  const entries = [input.entries, ...(Array.isArray(input.streams) ? input.streams.map((stream) => stream?.entries ?? []) : [])].flat();
  const count = entries.filter((entry) => Array.isArray(entry?.a)
    && entry.a.some((action) => action?.kind === 'agent_orders')).length;
  return count > 0 ? count : undefined;
}

function eraAt(submittedAt) {
  return ERAS.findLast((era) => submittedAt >= era.startsAt)?.stamp ?? ERAS[0].stamp;
}

function frontierKey(value) {
  return `${value.contractId}\n${value.seed}\n${value.eraStamp}`;
}

function compareCandidate(a, b) {
  return a.decisions - b.decisions || a.row.assayedAt - b.row.assayedAt || a.row.inputLogHash.localeCompare(b.row.inputLogHash);
}

function compareKey(a, b) {
  return a.contractId.localeCompare(b.contractId) || a.seed.localeCompare(b.seed) || a.eraStamp.localeCompare(b.eraStamp);
}

function parseArgs(argv) {
  const options = { output: DEFAULT_ARTIFACT, check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') options.check = true;
    else if (arg === '--input') options.input = path.resolve(argv[++index] ?? '');
    else if (arg === '--output') options.output = path.resolve(argv[++index] ?? '');
    else if (arg === '--source-backend') options.sourceBackend = argv[++index];
    else throw new Error('Usage: node scripts/frontier-registry.mjs --input <board-export.json> [--output <artifact.json>] [--source-backend <name>] [--check]');
  }
  if (!options.input) throw new Error('--input is required');
  return options;
}

if (isMain(import.meta.url)) {
  const options = parseArgs(process.argv.slice(2));
  const boardExport = JSON.parse(readFileSync(options.input, 'utf8'));
  const previous = existsSync(options.output) ? JSON.parse(readFileSync(options.output, 'utf8')) : null;
  if (options.check && !previous) throw new Error(`No frontier registry exists at ${options.output}`);
  const derived = deriveRegistry(boardExport, previous, options.sourceBackend ?? previous?.sourceBackend);
  const json = `${JSON.stringify(derived, null, 2)}\n`;
  if (options.check) {
    if (json !== `${JSON.stringify(previous, null, 2)}\n`) {
      process.stderr.write('Frontier registry differs from the board export.\n');
      process.exitCode = 1;
    } else process.stdout.write(`${derived.frontiers.length} frontiers match ${path.relative(ROOT, options.output)}.\n`);
  } else {
    writeFileSync(options.output, json);
    process.stdout.write(`Wrote ${derived.frontiers.length} frontiers and ${derived.events.length} dethronement events to ${path.relative(ROOT, options.output)}.\n`);
  }
}
