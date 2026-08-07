#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INVENTORY = process.env.RED_INVENTORY_PATH ?? path.join(ROOT, 'logs/suite-red-inventory.md');
const COMPACT = process.env.RED_INVENTORY_COMPACT_PATH ?? path.join(ROOT, 'logs/suite-red-inventory-compact.json');

function fail(message) {
  console.error(`red-inventory-lookup: ${message}`);
  process.exit(2);
}

function specPath(value) {
  const normalized = path.resolve(value).replaceAll(path.sep, '/');
  const e2e = normalized.lastIndexOf('/e2e/');
  return e2e >= 0 ? normalized.slice(e2e + 1) : `e2e/${path.basename(normalized)}`;
}

function existingSpec(value) {
  const spec = specPath(value);
  const candidate = path.join(ROOT, spec);
  if (!spec.endsWith('.spec.ts') || !fs.statSync(candidate, { throwIfNoEntry: false })?.isFile()) {
    fail(`spec does not exist: ${spec}; use an existing e2e/*.spec.ts path (bare names need the .spec.ts suffix)`);
  }
  return spec;
}

function cells(line) {
  const out = [];
  let cell = '';
  const source = line.slice(1, -1);
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '\\' && source[index + 1] === '|') {
      cell += '|';
      index += 1;
    } else if (char === '|') {
      out.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  out.push(cell.trim());
  return out;
}

function table(markdown, header, width) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.indexOf(header);
  if (start < 0 || !/^\|(?:---:?)?(?:\|(?:---:?)?)+\|$/.test(lines[start + 1]?.replaceAll(' ', ''))) {
    throw new Error(`missing or malformed table: ${header}`);
  }
  const rows = [];
  for (const line of lines.slice(start + 2)) {
    if (!line.startsWith('|')) break;
    if (!line.endsWith('|')) throw new Error(`malformed row below: ${header}`);
    const row = cells(line);
    if (row.length !== width) throw new Error(`expected ${width} columns below: ${header}`);
    rows.push(row);
  }
  return rows;
}

function count(markdown, label) {
  const match = markdown.match(new RegExp(`^- ${label}: \\*\\*(\\d+)\\*\\*$`, 'm'));
  if (!match) throw new Error(`missing header total: ${label}`);
  return Number(match[1]);
}

function readInventory() {
  const markdown = fs.readFileSync(INVENTORY, 'utf8');
  const totalRun = count(markdown, 'Total tests run');
  const totalFailed = count(markdown, 'Total failed');
  const totalBoth = count(markdown, 'BOTH');
  const failures = table(
    markdown,
    '| Spec file | Test title | Project | Failing file:line | First error line | Duration | Bucket |',
    7,
  ).map(([spec, title, project, location, error, duration, bucket]) => ({
    spec, title, project, location, error, duration, bucket,
  }));
  const blast = table(
    markdown,
    '| Rank | Spec file | Test title | Failing-line / body-lines ratio |',
    4,
  ).map(([rank, spec, title, ratio]) => ({ rank, spec, title, ratio }));
  if (failures.length !== totalFailed) {
    throw new Error(`header says ${totalFailed} failures but parsed ${failures.length}`);
  }
  if (blast.length !== totalBoth) {
    throw new Error(`header says ${totalBoth} BOTH tests but parsed ${blast.length} blast-radius rows`);
  }
  return { markdown, totalRun, totalFailed, failures, blast };
}

function readCoverage() {
  const report = JSON.parse(fs.readFileSync(COMPACT, 'utf8'));
  if (!Array.isArray(report.suites)) throw new Error('compact inventory has no suites array');
  const specs = new Set();
  const tests = new Set();
  const projects = new Set(['desktop-chrome', 'mobile-chrome']);

  function walk(suites, parents = []) {
    for (const suite of suites ?? []) {
      const next = suite.title && !suite.title.endsWith('.spec.ts') ? [...parents, suite.title] : parents;
      for (const entry of suite.specs ?? []) {
        if (!(entry.tests ?? []).some((test) =>
          projects.has(test.projectName) && test.results?.at(-1) && test.results.at(-1).status !== 'skipped'
        )) continue;
        const spec = specPath(entry.file ?? suite.file);
        const title = [...next, entry.title].filter(Boolean).join(' › ');
        specs.add(spec);
        tests.add(`${spec}\0${title}`);
      }
      walk(suite.suites, next);
    }
  }
  walk(report.suites);
  const start = new Date(typeof report.stats?.startTime === 'string' ? report.stats.startTime : NaN);
  return {
    specs,
    tests,
    snapshotDate: Number.isNaN(start.valueOf()) ? 'UNKNOWN' : start.toISOString().slice(0, 10),
    snapshotStartTime: Number.isNaN(start.valueOf()) ? null : start.toISOString(),
    snapshotDuration: Number.isFinite(report.stats?.duration) ? report.stats.duration : null,
  };
}

function usage() {
  fail('usage: node scripts/red-inventory-lookup.mjs <spec-path> [--title "<exact test title>"] [--json] [--strict] | --snapshot');
}

const args = process.argv.slice(2);
const titleIndex = args.indexOf('--title');
const title = titleIndex >= 0 ? args[titleIndex + 1] : undefined;
const positional = args.filter((arg, index) => !arg.startsWith('--') && (titleIndex < 0 || index !== titleIndex + 1));
const snapshot = args.includes('--snapshot');
if (snapshot ? positional.length !== 0 || titleIndex >= 0 : positional.length !== 1 || titleIndex >= 0 && !title) usage();

if (snapshot) {
  let coverage;
  try {
    coverage = readCoverage();
  } catch (error) {
    fail(`snapshot date UNKNOWN — ${error.message}`);
  }
  if (!coverage.snapshotStartTime) fail('snapshot date UNKNOWN — compact inventory has no valid stats.startTime');
  const end = coverage.snapshotDuration === null
    ? 'UNKNOWN'
    : new Date(Date.parse(coverage.snapshotStartTime) + coverage.snapshotDuration).toISOString();
  const command = `git rev-list -1 --before=${coverage.snapshotStartTime} main`;
  const git = spawnSync('git', ['rev-list', '-1', `--before=${coverage.snapshotStartTime}`, 'main'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  console.log(`SNAPSHOT ${coverage.snapshotStartTime} to ${end} — duration ${coverage.snapshotDuration ?? 'UNKNOWN'} ms`);
  console.log(git.status === 0 && git.stdout.trim()
    ? `SNAPSHOT main commit ${git.stdout.trim()}`
    : `SNAPSHOT main commit UNKNOWN — run: ${command}`);
  process.exit(0);
}

const spec = existingSpec(positional[0]);

let inventory;
let coverage;
try {
  inventory = readInventory();
  coverage = readCoverage();
} catch (error) {
  fail(error.code === 'ENOENT' && error.path === COMPACT ? `snapshot date UNKNOWN — ${error.message}` : error.message);
}

const key = title === undefined ? undefined : `${spec}\0${title}`;
const rows = inventory.failures.filter((row) => row.spec === spec && (title === undefined || row.title === title));
const blastByTest = new Map(inventory.blast.map((row) => [`${row.spec}\0${row.title}`, row]));
const covered = title === undefined ? coverage.specs.has(spec) : coverage.tests.has(key);
const outcome = rows.length ? 'KNOWN-RED' : covered ? 'CLEAN-IN-INVENTORY' : 'NOT-IN-INVENTORY';
const result = {
  outcome,
  query: { spec, ...(title === undefined ? {} : { title }) },
  snapshotDate: coverage.snapshotDate,
  inventory: path.relative(ROOT, INVENTORY).replaceAll(path.sep, '/'),
  rowsParsed: inventory.failures.length + inventory.blast.length,
  failureRowsParsed: inventory.failures.length,
  blastRadiusRowsParsed: inventory.blast.length,
  totalTestsRun: inventory.totalRun,
  totalFailed: inventory.totalFailed,
  rows: rows.map((row) => ({
    ...row,
    locationNote: 'recorded at inventory run — may have rotted',
    blastRadius: blastByTest.get(`${row.spec}\0${row.title}`)?.ratio ?? null,
  })),
};

if (args.includes('--json')) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`INVENTORY ${result.inventory} — rows parsed ${result.rowsParsed} (${result.failureRowsParsed} failure, ${result.blastRadiusRowsParsed} blast-radius) — Total tests run ${result.totalTestsRun} — Total failed ${result.totalFailed}`);
  console.log(`${outcome} — ${spec}${title === undefined ? '' : ` — ${title}`} — snapshot date ${result.snapshotDate}`);
  for (const row of result.rows) {
    console.log(`- ${row.title} [${row.project}]`);
    console.log(`  ${row.location} (recorded at inventory run — may have rotted) — ${row.bucket} — ${row.duration}`);
    if (row.blastRadius) console.log(`  Blast radius: ${row.blastRadius}`);
    console.log(`  ${row.error}`);
  }
}

process.exit(outcome === 'NOT-IN-INVENTORY' || args.includes('--strict') && outcome === 'KNOWN-RED' ? 1 : 0);
