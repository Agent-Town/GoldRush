#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const skillPath = process.env.SKILLMD_PATH ?? path.join(root, 'public/skill.md');
const begin = '<!-- contracts:begin -->';
const end = '<!-- contracts:end -->';
const skill = readFileSync(skillPath, 'utf8');
const seeds = JSON.parse(readFileSync(path.join(root, 'assets/contracts/bench-seeds.json'), 'utf8'));
const receipts = JSON.parse(readFileSync(path.join(root, 'assets/rotations/winnability-receipts.json'), 'utf8')).contracts;
const manifests = new Map();

for (const epoch of readdirSync(path.join(root, 'assets/contracts'), { withFileTypes: true })) {
  if (!epoch.isDirectory() || !epoch.name.startsWith('epoch-')) continue;
  const bundle = JSON.parse(readFileSync(path.join(root, 'assets/contracts', epoch.name, 'contracts.json'), 'utf8'));
  for (const contract of bundle.contracts ?? []) {
    if (manifests.has(contract.id)) throw new Error(`${contract.id}: duplicate contract manifest`);
    manifests.set(contract.id, epoch.name);
  }
}

const seen = new Set();
for (const receipt of receipts) {
  if (seen.has(receipt.contractId)) throw new Error(`${receipt.contractId}: duplicate winnability receipt`);
  seen.add(receipt.contractId);
  if (manifests.get(receipt.contractId) !== receipt.epochId) {
    throw new Error(`${receipt.contractId}: receipt epoch does not match its contract manifest`);
  }
  if (!['claimed', 'unclaimed'].includes(receipt.status)) throw new Error(`${receipt.contractId}: invalid receipt status`);
}

const rows = [...receipts].sort((a, b) => a.contractId.localeCompare(b.contractId));
const ids = rows.map(({ contractId }) => contractId);
const rendered = [
  begin,
  'Standing marker: `unclaimed` means no verified rider has secured the contract; otherwise the first verified secure names the rider and date.',
  '',
  ...rows.map((receipt) => {
    const variants = seeds[receipt.contractId];
    if (variants !== undefined && (!Array.isArray(variants) || variants.some((seed) => typeof seed !== 'string'))) {
      throw new Error(`${receipt.contractId}: bench seeds must be a string array`);
    }
    const seedText = variants?.length ? variants.map((seed) => `\`${seed}\``).join(', ') : 'none published';
    return `- \`${receipt.contractId}\` | bench seeds: ${seedText} | ${marker(receipt)}`;
  }),
  '',
  '<!-- skillmd-guard:door-contracts:start -->',
  '```json',
  JSON.stringify(ids, null, 2),
  '```',
  '<!-- skillmd-guard:door-contracts:end -->',
  end,
].join('\n');

const fenced = new RegExp(`${begin}[\\s\\S]*?${end}`);
if (skill.split(begin).length !== 2 || skill.split(end).length !== 2) {
  throw new Error(`public/skill.md must contain exactly one ${begin} / ${end} pair`);
}
const next = skill.replace(fenced, rendered);

if (process.argv.includes('--check')) {
  if (next !== skill) {
    console.error(`${path.relative(root, skillPath)} contract list is stale; run node scripts/render-skillmd-contracts.mjs`);
    process.exitCode = 1;
  }
} else {
  writeFileSync(skillPath, next);
}

function marker(receipt) {
  if (receipt.status === 'unclaimed') return 'unclaimed';
  if (!receipt.species || !receipt.profileName || !Number.isFinite(Date.parse(receipt.date))) {
    throw new Error(`${receipt.contractId}: claimed receipt is missing species, profile, or date`);
  }
  return `first secured by ${markdown(receipt.species)} (${markdown(receipt.profileName)}) on ${receipt.date.slice(0, 10)}`;
}

function markdown(value) {
  return value.replace(/([\\`*_[\]<>|])/g, '\\$1').replace(/[\r\n]+/g, ' ');
}
