#!/usr/bin/env node
// Advisory evidence probe for task-master shipped-ness (F-1568-1/F-1569-1).

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SHIPPED = new Set(['merged', 'shipped']);
const TRACE_DIRS = new Set(['done', 'failed', 'running', 'runs', 'stopped', 'queue-paused']);

const stem = (file) => path.basename(file, path.extname(file));
const bareStem = (name) => name.replace(/^lane-[a-d]?-?/, '');
const names = (name) => [...new Set([name, bareStem(name)])];
const namesFile = (file, name) => `-${stem(file)}-`.includes(`-${name}-`);
const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(file) : [file];
      })
    : [];

function mainReviews(root) {
  try {
    return execFileSync('git', ['ls-tree', '-r', '--name-only', 'main', '--', 'reviews'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim().split('\n').filter((file) => file.endsWith('.md'));
  } catch {
    return walk(path.join(root, 'reviews')).filter((file) => file.endsWith('.md')).map((file) => path.relative(root, file));
  }
}

function goalLeaves(value, out = []) {
  if (Array.isArray(value)) value.forEach((item) => goalLeaves(item, out));
  else if (value && typeof value === 'object') {
    if (value.taskFile) out.push(value);
    Object.values(value).forEach((item) => goalLeaves(item, out));
  }
  return out;
}

function verdictFor(name, goalEvidence, reviews, drained, traces) {
  const shipped = [
    ...goalEvidence,
    ...reviews.filter((file) => stem(file) === name).map((file) => ({ kind: 'review', path: file, transform: name })),
    ...drained
      .filter(({ file }) => namesFile(file, name))
      .map(({ file, hash }) => ({ kind: 'drained', path: file, hash, transform: name })),
  ];
  if (shipped.length) return { verdict: 'SHIPPED', evidence: shipped };

  const ran = traces
    .filter((file) => namesFile(file, name))
    .map((file) => ({ kind: 'trace', path: file, transform: name }));
  return ran.length
    ? { verdict: 'RAN-UNMERGED', evidence: ran }
    : { verdict: 'NO-TRACE', evidence: [] };
}

export function classifyRoot(root) {
  const tasksDir = path.join(root, 'tasks');
  const relative = (file) => path.relative(root, file);
  const masters = fs
    .readdirSync(tasksDir)
    .filter((file) => file.endsWith('.md') && file !== 'BACKLOG.md')
    .sort();
  const reviews = mainReviews(root);
  const traceDirs = fs
    .readdirSync(tasksDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() && (TRACE_DIRS.has(entry.name) || entry.name === 'queue' || entry.name.startsWith('queue-')),
    );
  const traces = traceDirs.flatMap((entry) => walk(path.join(tasksDir, entry.name))).map(relative);
  const drained = traces.flatMap((file) => {
    const match = path.basename(file).match(/^drained-([0-9a-f]{7,40})-/);
    return match ? [{ file, hash: match[1] }] : [];
  });
  const goalsPath = path.join(tasksDir, 'goals.json');
  const goals = fs.existsSync(goalsPath) ? goalLeaves(JSON.parse(fs.readFileSync(goalsPath, 'utf8'))) : [];

  const verdicts = masters.map((master) => {
    const fullStem = stem(master);
    const masterText = fs.readFileSync(path.join(tasksDir, master), 'utf8');
    const banner = masterText.split('\n').slice(0, 6).join('\n').match(/DO NOT QUEUE|DO-NOT-QUEUE/i)?.[0] ?? '';
    const goalEvidence = goals
      .filter((goal) => goal.taskFile === master && SHIPPED.has(goal.status))
      .map((goal) => ({ kind: 'goal', path: 'tasks/goals.json', id: goal.id, ...(goal.mergeHash && { hash: goal.mergeHash }) }));
    const byName = Object.fromEntries(
      names(fullStem).map((name) => [name, verdictFor(name, goalEvidence, reviews, drained, traces)]),
    );
    const full = byName[fullStem];
    const bare = byName[bareStem(fullStem)];
    const winning = full.verdict === 'SHIPPED' || bare.verdict === 'SHIPPED'
      ? 'SHIPPED'
      : full.verdict === 'RAN-UNMERGED' || bare.verdict === 'RAN-UNMERGED'
        ? 'RAN-UNMERGED'
        : 'NO-TRACE';
    const evidence = [full, bare].filter((item) => item.verdict === winning).flatMap((item) => item.evidence).filter(
      (item, index, all) => index === all.findIndex((other) => JSON.stringify(other) === JSON.stringify(item)),
    );
    return {
      master,
      title: masterText.split('\n', 1)[0].replace(/^#+\s*/, '').trim(),
      verdict: winning,
      banner,
      evidence: winning === 'NO-TRACE' ? [] : evidence,
      evidenceSummary: winning === 'NO-TRACE' ? 'empty set' : evidence.map(formatEvidence).join('; '),
      transforms: { full: full.verdict, slotStripped: bare.verdict },
      disagrees: full.verdict !== bare.verdict,
    };
  });
  const counts = Object.fromEntries(
    ['SHIPPED', 'RAN-UNMERGED', 'NO-TRACE'].map((verdict) => [
      verdict,
      verdicts.filter((item) => item.verdict === verdict).length,
    ]),
  );
  return {
    counts: {
      ...counts,
      CANDIDATES: verdicts.filter((item) => item.verdict === 'NO-TRACE' && !item.banner).length,
      DISAGREES: verdicts.filter((item) => item.disagrees).length,
    },
    verdicts,
  };
}

function formatEvidence(item) {
  return `${item.kind}:${item.path}${item.id ? `#${item.id}` : ''}${item.hash ? `@${item.hash}` : ''}${item.transform ? `[${item.transform}]` : ''}`;
}

function printTable(result) {
  console.log('VERDICT       DISAGREES  BANNER        MASTER                                    TITLE                                                                    EVIDENCE');
  for (const item of result.verdicts) {
    const title = item.title.length > 72 ? `${item.title.slice(0, 69)}...` : item.title;
    console.log(
      `${item.verdict.padEnd(13)} ${String(item.disagrees).padEnd(10)} ${item.banner.padEnd(13)} ${item.master.padEnd(41)} ${title.padEnd(72)} ${item.evidenceSummary}`,
    );
  }
  const bannered = result.counts['NO-TRACE'] - result.counts.CANDIDATES;
  console.log(
    `\nTOTAL ${result.verdicts.length} · SHIPPED ${result.counts.SHIPPED} · RAN-UNMERGED ${result.counts['RAN-UNMERGED']} · NO-TRACE ${result.counts['NO-TRACE']}, of which ${bannered} self-declare DO NOT QUEUE → ${result.counts.CANDIDATES} candidates · DISAGREES ${result.counts.DISAGREES}`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rootIndex = process.argv.indexOf('--root');
  const root = rootIndex === -1 ? process.cwd() : process.argv[rootIndex + 1];
  try {
    const result = classifyRoot(root);
    process.argv.includes('--json') ? console.log(JSON.stringify(result, null, 2)) : printTable(result);
    process.exitCode = process.argv.includes('--strict') && result.counts.CANDIDATES ? 1 : 0;
  } catch (error) {
    console.error(`master-shipped-classifier: ${error.message}`);
    process.exitCode = 0; // advisory: never block a drain on our own absence
  }
}
