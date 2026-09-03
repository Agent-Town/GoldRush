#!/usr/bin/env node
import { createHmac } from 'node:crypto';
import { readFile } from 'node:fs/promises';

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
if (!/^\d{4}-W\d{2}$/.test(week ?? '') || !saltFile || args.size !== 2) {
  throw new Error('usage: node scripts/rotation-mint.mjs --week YYYY-Www --salt-file <path-outside-repo>');
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

process.stdout.write(`${JSON.stringify({ rotations: [{
  id,
  opensAt: monday.toISOString(),
  closesAt: new Date(monday.getTime() + 7 * 86_400_000).toISOString(),
  seeds,
}] }, null, 2)}\n`);
