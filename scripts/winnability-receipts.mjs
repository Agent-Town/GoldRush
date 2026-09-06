#!/usr/bin/env node

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_ENDPOINT = 'https://agenttown.app/api/standings';
const DEFAULT_FIXTURE = resolve(ROOT, 'scripts/fixtures/winnability-standings.json');
const DEFAULT_OUTPUT = resolve(ROOT, 'assets/rotations/winnability-receipts.json');

const args = process.argv.slice(2);
const offline = args.includes('--offline');
const endpoint = valueOf('--endpoint') ?? DEFAULT_ENDPOINT;
const fixturePath = resolve(ROOT, valueOf('--fixture') ?? DEFAULT_FIXTURE);
const outputPath = resolve(ROOT, valueOf('--output') ?? DEFAULT_OUTPUT);

const contracts = await doorContracts();
const fixture = offline ? JSON.parse(await readFile(fixturePath, 'utf8')) : null;
const receipts = [];
// F-RECEIPTS-1 (attended 2026-09-06): a first-secure receipt is a HISTORICAL fact and must never move later.
// The door keeps one row per rider, so a re-ride replaces that rider's earlier row and its date; regenerating
// from the live board alone rewrote nine first-secure receipts (species and dates) the morning heat 12's
// re-rides landed. The stored receipt wins unless the live board offers a strictly EARLIER verified secure.
let stored = new Map();
try { stored = new Map(JSON.parse(await readFile(outputPath, 'utf8')).contracts.filter((r) => r.status === 'claimed').map((r) => [r.contractId, r])); } catch { stored = new Map(); }

for (const contract of contracts) {
  if (contract.standings === false) {
    // Owner ruling 2026-09-06 ("drill yard is not winable"): a standings-disabled board entry is a TRAINING
    // GROUND, not a contract. It never counts toward the receipts denominator (heat 12 measured it: POST refused as
    // `training_ground`, GET answers 400, the only one of 36) and it is never 'unclaimed'.
    receipts.push({ epochId: contract.epochId, contractId: contract.id, status: 'training-ground', reason: 'standings-disabled' });
    continue;
  }
  const board = offline
    ? fixtureBoard(fixture, contract.id)
    : await getJson(endpoint, { epoch: contract.epochId, contract: contract.id });
  const first = [...board.board]
    .filter((row) => row.secured === true && row.assay === 'verified' && row.reel?.id)
    .sort((a, b) => a.submittedAt - b.submittedAt || a.reel.id.localeCompare(b.reel.id))[0];

  if (!first) {
    receipts.push({ epochId: contract.epochId, contractId: contract.id, status: 'unclaimed' });
    continue;
  }

  const reelPayload = offline
    ? fixture.reels?.[first.reel.id]
    : await getJson(endpoint, { epoch: contract.epochId, contract: contract.id, reel: first.reel.id });
  const pin = reelPayload?.reel?.meta?.engineHash;
  if (typeof pin !== 'string' || pin.length === 0) throw new Error(`${contract.id}: verified reel ${first.reel.id} has no public engine pin`);
  if (!Number.isFinite(first.submittedAt)) throw new Error(`${contract.id}: verified reel ${first.reel.id} has no submission date`);

  const candidate = {
    epochId: contract.epochId,
    contractId: contract.id,
    status: 'claimed',
    // The standings are deliberately species-blind. Preserve the self-declared model token;
    // never guess "human" or "agent" when the API exposes neither classification.
    species: typeof first.model === 'string' && first.model.length > 0 ? first.model : 'undeclared',
    profileName: first.profileName,
    reelId: first.reel.id,
    pin,
    date: new Date(first.submittedAt).toISOString(),
  };
  const kept = stored.get(contract.id);
  receipts.push(kept && Date.parse(kept.date) <= Date.parse(candidate.date) ? kept : candidate);
}

const ledger = {
  version: 1,
  source: offline ? 'fixture' : endpoint,
  contracts: receipts,
};
await writeFile(outputPath, `${JSON.stringify(ledger, null, 2)}\n`);
printSummary(receipts);

function valueOf(flag) {
  const index = args.indexOf(flag);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
  return value;
}

async function doorContracts() {
  const skill = await readFile(resolve(ROOT, 'public/skill.md'), 'utf8');
  const match = skill.match(/<!-- skillmd-guard:door-contracts:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- skillmd-guard:door-contracts:end -->/);
  if (!match) throw new Error('public/skill.md door-contracts block not found');
  const ids = JSON.parse(match[1]);
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) throw new Error('public/skill.md door-contracts block is not a string array');

  const epochByContract = new Map();
  const contractsRoot = resolve(ROOT, 'assets/contracts');
  for (const entry of await readdir(contractsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('epoch-')) continue;
    const bundle = JSON.parse(await readFile(resolve(contractsRoot, entry.name, 'contracts.json'), 'utf8'));
    for (const contract of bundle.contracts ?? []) {
      epochByContract.set(contract.id, { epochId: entry.name, standings: contract.practice?.standings });
    }
  }
  return [...ids].sort().map((id) => {
    const manifest = epochByContract.get(id);
    if (!manifest) throw new Error(`${id}: door contract has no contract manifest`);
    return { id, ...manifest };
  });
}

function fixtureBoard(value, contractId) {
  const board = value?.boards?.[contractId] ?? value?.defaultBoard;
  if (!Array.isArray(board)) throw new Error(`${contractId}: offline fixture has no board`);
  return { board };
}

async function getJson(base, params) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const json = await response.json();
  if (json?.ok !== true) throw new Error(`${url}: standings response was not ok`);
  return json;
}

function printSummary(rows) {
  const epochs = new Map();
  for (const row of rows) {
    const counts = epochs.get(row.epochId) ?? { claimed: 0, unclaimed: 0 };
    counts[row.status] += 1;
    epochs.set(row.epochId, counts);
  }
  console.log('epoch\tclaimed\tunclaimed\ttotal');
  for (const [epoch, counts] of [...epochs].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`${epoch}\t${counts.claimed}\t${counts.unclaimed}\t${counts.claimed + counts.unclaimed}`);
  }
  const claimed = rows.filter((row) => row.status === 'claimed').length;
  const training = rows.filter((row) => row.status === 'training-ground').length;
  console.log(`TOTAL\t${claimed}\t${rows.length - claimed - training}\t${rows.length - training}\t(+${training} training ground, not a contract)`);
}
