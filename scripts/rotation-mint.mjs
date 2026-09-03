#!/usr/bin/env node
import { createHmac } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const contracts = [
  ['the-claim', 'e1-the-claim'],
  ['e1-dry-gulch', 'e1-dry-gulch'],
  ['e1-twin-banks', 'e1-twin-banks'],
  ['e1-night-shift', 'e1-night-shift'],
  ['e2-hill-mine', 'e2-hill-mine'],
  ['e1-baron', 'e1-baron'],
];

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const week = args.get('--week');
const saltFile = args.get('--salt-file');
// --append <registry.json>: merge the minted rotation into the tracked registry (replace a same-id
// entry, keep history, sort by opensAt) instead of printing it. This is the RT-01 fire duty's form
// (scripts/fire.md); the print form stays byte-identical for the mint test and for eyeballing.
const appendPath = args.get('--append');
const validShape = args.size === 2 || (args.size === 3 && typeof appendPath === 'string' && appendPath.length > 0);
if (!/^\d{4}-W\d{2}$/.test(week ?? '') || !saltFile || !validShape) {
  throw new Error('usage: node scripts/rotation-mint.mjs --week YYYY-Www --salt-file <path-outside-repo> [--append assets/rotations/rotation-seeds.json]');
}
const salt = (await readFile(saltFile, 'utf8')).trim();
if (!salt) throw new Error('rotation salt is empty');

const [, yearText, weekText] = /^(\d{4})-W(\d{2})$/.exec(week);
const year = Number(yearText);
const weekNumber = Number(weekText);
if (weekNumber < 1 || weekNumber > 53) throw new Error('ISO week must be between 01 and 53');
const januaryFourth = new Date(Date.UTC(year, 0, 4));
const monday = new Date(januaryFourth.getTime() - ((januaryFourth.getUTCDay() + 6) % 7) * 86_400_000 + (weekNumber - 1) * 7 * 86_400_000);
if (new Date(monday.getTime() + 3 * 86_400_000).getUTCFullYear() !== year) throw new Error('ISO week does not exist');
const id = `r${year}w${weekText}`;
const seeds = Object.fromEntries(contracts.map(([contractId, prefix]) => {
  const digest = createHmac('sha256', salt).update(`${week}:${contractId}`).digest('hex').slice(0, 12);
  return [contractId, `${prefix}-${id}-${digest}`];
}));

const rotation = {
  id,
  opensAt: monday.toISOString(),
  closesAt: new Date(monday.getTime() + 7 * 86_400_000).toISOString(),
  seeds,
};

if (appendPath) {
  const existing = existsSync(appendPath) ? JSON.parse(await readFile(appendPath, 'utf8')) : { rotations: [] };
  const rotations = (existing.rotations ?? []).filter((entry) => entry.id !== rotation.id).concat([rotation])
    .sort((a, b) => a.opensAt.localeCompare(b.opensAt));
  await writeFile(appendPath, `${JSON.stringify({ ...existing, rotations }, null, 2)}\n`);
  process.stdout.write(`appended ${id} to ${appendPath} (${rotations.length} rotation(s))\n`);
} else {
  process.stdout.write(`${JSON.stringify({ rotations: [rotation] }, null, 2)}\n`);
}
