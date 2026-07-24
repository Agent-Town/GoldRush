#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [fullArg, releaseArg, fixedArg] = process.argv.slice(2);
if (!fullArg || !releaseArg) {
  console.error('Usage: node scripts/diff-release-assets.mjs <full-dist> <release-dist> [fixed-release-dist]');
  process.exit(1);
}

const townSheets = Object.values(JSON.parse(
  readFileSync(resolve('src/town/town-actor-sheets.json'), 'utf8'),
));
const builds = [
  ['Full', fullArg],
  ['Release before fix', releaseArg],
  ...(fixedArg ? [['Release after fix', fixedArg]] : []),
].map(([label, root]) => [label, manifest(resolve(root))]);
const full = builds[0][1];
const before = builds[1][1];
const after = builds[2]?.[1];
const columns = builds.map(([label]) => label);
const character = (entry) => /^(?:char-|townsfolk-)/.test(entry.file);

console.log('# E1 release asset manifest diff\n');
console.log(`Compared \`${fullArg}\` with \`${releaseArg}\`${fixedArg ? ` and \`${fixedArg}\`` : ''}.\n`);
console.log(`| Scope | ${columns.join(' | ')} |`);
console.log(`| --- | ${columns.map(() => '---:').join(' | ')} |`);
summaryRow('All emitted assets', () => true);
summaryRow('Character/townsfolk emitted assets', character);
summaryRow('Canonical character/townsfolk artifacts', character, true);

console.log('\n## Runtime town sheets\n');
console.log(`| Runtime registry sheet | ${columns.join(' | ')} |`);
console.log(`| --- | ${columns.map(() => '---:').join(' | ')} |`);
for (const sheet of townSheets) {
  console.log(`| \`${sheet}\` | ${builds.map(([, entries]) => sheetFrames(entries, sheet)).join(' | ')} |`);
}

console.log('\n## Canonical character families missing before the fix\n');
console.log(`| Family | Full | Release before fix${after ? ' | Release after fix' : ''} |`);
console.log(`| --- | ---: | ---:${after ? ' | ---:' : ''} |`);
const beforeNames = canonicalNames(before.filter(character));
const missing = [...canonicalNames(full.filter(character))].filter((name) => !beforeNames.has(name));
const families = new Map();
for (const name of missing) {
  const family = name.replace(/-r\d+c\d+(?=\.(?:png|js)$)/, '');
  const members = families.get(family) ?? [];
  members.push(name);
  families.set(family, members);
}
for (const [family, members] of [...families].sort(([left], [right]) => left.localeCompare(right))) {
  const counts = [full, before, ...(after ? [after] : [])].map((entries) => {
    const names = canonicalNames(entries.filter(character));
    return members.filter((name) => names.has(name)).length;
  });
  console.log(`| \`${family}\` | ${counts.join(' | ')} |`);
}

function manifest(root) {
  const assets = join(root, 'assets');
  return readdirSync(assets).map((file) => ({
    file,
    canonical: file.replace(/-[A-Za-z0-9_-]{8}(?=\.[^.]+$)/, ''),
    bytes: statSync(join(assets, file)).size,
  }));
}

function canonicalNames(entries) {
  return new Set(entries.map(({ canonical }) => canonical));
}

function sheetFrames(entries, sheet) {
  return new Set(entries
    .map(({ canonical }) => canonical)
    .filter((file) => new RegExp(`^${sheet}-r\\d+c\\d+\\.png$`).test(file))).size;
}

function summaryRow(label, predicate, canonical = false) {
  const values = builds.map(([, entries]) => {
    const selected = entries.filter(predicate);
    if (canonical) return canonicalNames(selected).size.toLocaleString('en-US');
    const bytes = selected.reduce((total, { bytes: size }) => total + size, 0);
    return `${selected.length.toLocaleString('en-US')} / ${bytes.toLocaleString('en-US')} B`;
  });
  console.log(`| ${label} | ${values.join(' | ')} |`);
}
