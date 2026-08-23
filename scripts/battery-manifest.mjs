#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const UNKNOWN_FILE = '<unknown>';

function clean(line) {
  return line.replace(/\x1b\[[0-?]*[ -\/]*[@-~]/g, '').trimEnd();
}

// F-2234-1 (measured s2234): THE ROSTER IS THE SOLE ATTRIBUTION SOURCE, so whichever battery
// it names is the only battery this tool can attribute. A real `node --test <files>` log carries
// ZERO file markers and mentions ZERO test-file paths — measured on a live 419-test
// `test:ledger-guards` log — so the log-harvest below contributes nothing in practice and every
// row's `file` is resolved by matching test-name literals against sources named in the roster.
// Reading only `scripts['test:node-guards']` therefore made this tool structurally incapable of
// attributing any other battery: 32 of `test:ledger-guards`' 40 files produced ZERO rows and
// 297 of 419 rows (70.9%) collapsed to <unknown>, while `totals` reconciled perfectly against
// the log's own summary — a correct headline over an attribution that had silently narrowed.
// package.json already knows every battery's files; a hardcoded single-battery list is a defect
// awaiting the next battery. Widening it is measured behaviour-neutral for the original battery.
function parse(log) {
  let roster = [];
  let rosterSource = 'log-only';
  try {
    const scripts = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).scripts ?? {};
    roster = [...new Set(Object.values(scripts).flatMap((body) => (typeof body === 'string'
      ? [...body.matchAll(/\b((?:scripts|src)\/[^\s'"`]+\.test\.mjs)\b/g)].map((match) => match[1])
      : [])))];
    rosterSource = 'package-scripts';
  } catch {
    // Explicit file markers still work outside this repository.
    rosterSource = 'log-only';
  }
  const sourceFiles = [...new Set([
    ...roster,
    ...[...log.matchAll(/\b((?:scripts|src)\/[^\s'"`]+\.test\.mjs)\b/g)].map((match) => match[1]),
  ])]
    .map((name) => {
      try {
        return { name, source: readFileSync(new URL(`../${name}`, import.meta.url), 'utf8') };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
  const inferredOccurrences = new Map();
  const suiteNames = new Set(sourceFiles.flatMap(({ source }) => [
    ...source.matchAll(/\b(?:describe|suite)(?:\.\w+)*\s*\(\s*['"`]([^'"`]+)['"`]/g),
  ].map((match) => match[1])));
  const inferredFile = (name) => {
    const hits = sourceFiles.filter(({ name: fileName, source }) => {
      const literals = [
        ...source.matchAll(/\b(?:test|it)(?:\.\w+)*\s*\(\s*'((?:\\.|[^'\\])*)'/g),
        ...source.matchAll(/\b(?:test|it)(?:\.\w+)*\s*\(\s*"((?:\\.|[^"\\])*)"/g),
      ].map((match) => match[1].replace(/\\(['"`\\])/g, '$1'));
      if (literals.includes(name)) return true;
      return [...source.matchAll(/\b(?:test|it)(?:\.\w+)*\s*\(\s*`([^`]*)`/g)].some((match) => {
        const pattern = match[1].split(/\$\{[^}]*\}/).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.+?');
        return new RegExp(`^${pattern}$`).test(name);
      });
    });
    const occurrence = inferredOccurrences.get(name) ?? 0;
    inferredOccurrences.set(name, occurrence + 1);
    return hits[occurrence]?.name ?? UNKNOWN_FILE;
  };
  let file = UNKNOWN_FILE;
  let tests = [];
  const blocks = [];
  let totals = {};
  let suites = new Map();

  for (const raw of log.split(/\r?\n/)) {
    const line = clean(raw);
    const marker = line.trim().match(/^(?:#\s*file:|▶)\s*(.+\.test\.mjs)$/);
    if (marker) {
      file = marker[1];
      continue;
    }
    const suite = line.match(/^(\s*)▶\s+(.+)$/);
    if (suite) {
      const key = `${suite[1].length}:${suite[2]}`;
      suites.set(key, (suites.get(key) ?? 0) + 1);
      continue;
    }

    const result = line.match(/^\s*(✔|✖|﹣|○)\s+(.+)$/);
    const decorated = result?.[2].match(/^(.*)\s+\([^)]+ms\)(?:\s+#\s*(.*))?$/);
    const name = decorated?.[1] ?? result?.[2];
    const directive = decorated?.[2];
    const fileResult = result && (
      /^(?:scripts|src)\/\S+\.test\.mjs$/.test(name)
      || sourceFiles.some(({ name: candidate }) => name === candidate || name.endsWith(`/${candidate}`))
    );
    if (fileResult) continue;
    const indent = line.length - line.trimStart().length;
    const suiteKey = `${indent}:${name}`;
    const closing = result && suites.has(suiteKey);
    if (closing) {
      const remaining = suites.get(suiteKey) - 1;
      if (remaining) suites.set(suiteKey, remaining);
      else suites.delete(suiteKey);
    }
    if (result) {
      const prefixed = name.match(/^(.+\.test\.mjs)\s+::\s+(.+)$/);
      tests.push({
        file: prefixed?.[1] ?? file,
        name: prefixed?.[2] ?? name,
        status: result[1] === '✔' && !directive ? 'pass' : result[1] === '✖' ? 'fail' : 'skip',
        closing,
        suite: suiteNames.has(name),
      });
      continue;
    }

    const summary = line.trim().match(/^(?:ℹ|#)\s+(tests|suites|pass|fail|cancelled|skipped)\s+(\d+)$/);
    if (!summary) continue;
    totals[summary[1]] = Number(summary[2]);
    if (summary[1] === 'skipped') {
      blocks.push({ tests, totals });
      tests = [];
      totals = {};
      file = UNKNOWN_FILE;
      suites = new Map();
    }
  }

  const block = blocks.sort((a, b) => b.totals.tests - a.totals.tests)[0] ?? { tests, totals };
  let suiteClosures = block.totals.suites ?? 0;
  for (let index = block.tests.length - 1; index >= 0 && suiteClosures; index -= 1) {
    if (!block.tests[index].suite) continue;
    block.tests.splice(index, 1);
    suiteClosures -= 1;
  }
  for (let index = block.tests.length - 1; index >= 0 && suiteClosures; index -= 1) {
    if (!block.tests[index].closing) continue;
    block.tests.splice(index, 1);
    suiteClosures -= 1;
  }
  while (suiteClosures && block.tests.length) {
    block.tests.pop();
    suiteClosures -= 1;
  }
  for (const entry of block.tests) {
    delete entry.closing;
    delete entry.suite;
  }
  for (const entry of block.tests) if (entry.file === UNKNOWN_FILE) entry.file = inferredFile(entry.name);
  block.tests.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name) || a.status.localeCompare(b.status));
  // Declared ALWAYS, including the happy path (F-2208-1): a field that appears only when
  // something is wrong re-creates the ambiguity it removes. `source` is a STRING, not a
  // boolean (F-2212-1) — a careless truthiness test coerces every value toward NOTICING.
  // `unattributed` is the number that makes F-2234-1 visible at a glance: it sits beside a
  // `totals` that reconciles perfectly, and says how much of the battery this manifest can
  // actually name. A high count means the roster does not cover the log, NOT that the run failed.
  return {
    attribution: {
      source: rosterSource,
      rosterFiles: sourceFiles.length,
      unattributed: block.tests.filter((entry) => entry.file === UNKNOWN_FILE).length,
    },
    tests: block.tests,
    totals: {
      tests: block.totals.tests ?? block.tests.length,
      pass: block.totals.pass ?? block.tests.filter((entry) => entry.status === 'pass').length,
      fail: block.totals.fail ?? block.tests.filter((entry) => entry.status === 'fail').length,
      skipped: block.totals.skipped ?? block.tests.filter((entry) => entry.status === 'skip').length,
      cancelled: block.totals.cancelled ?? 0,
    },
  };
}

function key(entry) {
  return `${entry.file} :: ${entry.name}`;
}

function diff(a, b) {
  const before = new Map(a.tests.map((entry) => [key(entry), entry.status]));
  const after = new Map(b.tests.map((entry) => [key(entry), entry.status]));
  const added = [...after.keys()].filter((name) => !before.has(name)).sort();
  const removed = [...before.keys()].filter((name) => !after.has(name)).sort();
  const changed = [...after.keys()]
    .filter((name) => before.has(name) && before.get(name) !== after.get(name))
    .sort()
    .map((name) => `${name} ${before.get(name)} -> ${after.get(name)}`);
  const totalDelta = b.totals.tests - a.totals.tests;
  const nameDelta = added.length - removed.length;
  const signed = (value) => `${value >= 0 ? '+' : ''}${value}`;
  const section = (title, rows) => `${title}\n${rows.length ? rows.map((row) => `  ${row}`).join('\n') : '  (none)'}`;
  const residue = totalDelta === nameDelta
    ? `RESIDUE: accounted for (totals.tests delta ${signed(totalDelta)}; named delta ${signed(nameDelta)})`
    : `RESIDUE: UNACCOUNTED (totals.tests delta ${signed(totalDelta)}; named delta ${signed(nameDelta)}; residue ${signed(totalDelta - nameDelta)})`;
  // The harm is per-CONSUMER (F-2216-1): `key()` is file-scoped, so rows this tool could not
  // attribute compare as `<unknown> :: name` on BOTH sides. Same-named tests in different
  // unattributed files then share one key and one of them is invisible here. Unlike the JSON
  // above this line is DEVIATION-ONLY — a clean diff stays clean, and the machine channel
  // already carries the field unconditionally for anything that wants to branch on it.
  const degraded = [a, b]
    .map((side, index) => ({ side: index ? 'after' : 'before', count: side.attribution?.unattributed ?? 0 }))
    .filter((entry) => entry.count > 0);
  const rows = [section('ADDED', added), section('REMOVED', removed), section('STATUS-CHANGED', changed), residue];
  if (degraded.length) {
    rows.push(`ATTRIBUTION: DEGRADED (${degraded.map((e) => `${e.side} ${e.count} unattributed`).join('; ')}) — these rows key on <unknown>, so same-named tests in different files collide`);
  }
  return rows.join('\n');
}

const args = process.argv.slice(2);
try {
  if (args[0] === '--diff' && args.length === 3) {
    console.log(diff(JSON.parse(readFileSync(args[1], 'utf8')), JSON.parse(readFileSync(args[2], 'utf8'))));
  } else if (args[0] === '--from-log' && args.length === 2) {
    process.stdout.write(`${JSON.stringify(parse(readFileSync(args[1], 'utf8')), null, 2)}\n`);
  } else if (args.length === 0) {
    process.stdout.write(`${JSON.stringify(parse(readFileSync(0, 'utf8')), null, 2)}\n`);
  } else {
    throw new Error('usage: battery-manifest.mjs [--from-log <path> | --diff <a.json> <b.json>]');
  }
} catch (error) {
  console.error(`battery-manifest: ${error.message}`);
  process.exitCode = 1;
}
