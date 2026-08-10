#!/usr/bin/env node
/**
 * Find lead-📋 BACKLOG rows that still advertise an already-SHIPPED master.
 *
 * Advisory by default, `--strict` gates. Like drain-block-check's UNKNOWN
 * precedent, the legacy corpus is a backlog: making the default strict would
 * red the whole board instead of answering the question asked.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { classifyRoot } from './master-shipped-classifier.mjs';

const LEAD_CLIPBOARD = /^\s*(?:(?:[-+*]|\d+[.)])\s+)?📋\s*(.*)$/;
const TASK_PATH = /tasks\/[A-Za-z0-9._-]+\.md/g;
const stripLane = (name) => name.replace(/^lane-[a-d]?-?/, '');

export function masterRows(backlogText) {
  return backlogText.split('\n').flatMap((line, index) => {
    const lead = line.match(LEAD_CLIPBOARD);
    if (!lead) return [];
    return [...line.matchAll(TASK_PATH)].flatMap((match) => {
      const master = path.basename(match[0]);
      const label = lead[1].match(/^\*\*\[?([a-z0-9][a-z0-9-]*)\]?/i)?.[1];
      const namedByLabel = label?.toLowerCase() === stripLane(master.slice(0, -3)).toLowerCase();
      const namedAsMaster = /\bmaster\b/i.test(line.slice(0, match.index));
      return namedByLabel || namedAsMaster ? [{ line: index + 1, path: match[0], master }] : [];
    });
  });
}

export function findGhosts(root) {
  const backlog = fs.readFileSync(path.join(root, 'tasks', 'BACKLOG.md'), 'utf8');
  const verdicts = new Map(classifyRoot(root).verdicts.map((item) => [item.master, item]));
  return masterRows(backlog).flatMap((row) => {
    const verdict = verdicts.get(row.master);
    return verdict?.verdict === 'SHIPPED' ? [{ ...row, evidence: verdict.evidenceSummary }] : [];
  });
}

function main() {
  const rootIndex = process.argv.indexOf('--root');
  const root = path.resolve(rootIndex === -1 ? process.cwd() : process.argv[rootIndex + 1]);
  const ghosts = findGhosts(root);
  console.log('=== ghost-ladder-row-guard ===');
  for (const ghost of ghosts) console.log(`GHOST line ${ghost.line} ${ghost.path} — ${ghost.evidence}`);
  console.log(`${ghosts.length} ghost ladder row(s).`);
  if (process.argv.includes('--strict') && ghosts.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
