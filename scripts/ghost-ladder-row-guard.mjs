#!/usr/bin/env node
/**
 * Find lead-📋 BACKLOG rows that still advertise an already-SHIPPED master.
 *
 * Advisory by default, `--strict` gates. Like drain-block-check's UNKNOWN
 * precedent, the legacy corpus is a backlog: making the default strict would
 * red the whole board instead of answering the question asked.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SHIPPED, classifyRoot, goalLeaves } from './master-shipped-classifier.mjs';

/**
 * F-2226-1 (measured and cured s2226). THE CURE LANDED IN THE CLI; THE ONLY OTHER CALLER
 * IMPORTS THE LIBRARY BENEATH IT AND NEVER SEES IT.
 *
 * `classifyRoot` computes `corpusTree` (F-2222-2, s2223) and returns it, and the comment at
 * that field says the reason in so many words: "the two source fields above both read healthy
 * from a stale worktree, so a caller has no other way to tell." This file is that caller --
 * the ONLY non-test importer of `classifyRoot` in the repo -- and it read `.verdicts` and threw
 * the declaration away. s2223 cured the classifier's CLI, which REFUSES from a linked worktree;
 * nothing on this path ever reaches that refusal.
 *
 * That matters because three of the classifier's four inputs are TRACKED, so a linked worktree
 * holds them FROZEN. Fewer goal leaves means fewer SHIPPED verdicts means fewer ghosts found --
 * and `--strict` reds only when `ghosts.length`, so the frozen board goes GREEN. Measured on a
 * fixture whose ground truth was ONE REAL GHOST: repo root -> `GHOST line 3`, rc=1; linked
 * worktree branched before the leaf -> `0 ghost ladder row(s).`, rc=0, BYTE-IDENTICAL on stdout
 * and rc to a genuinely clean board. This guard is chained bare in `test:ledger-guards`, so the
 * false green lands in a GATE, in the permissive direction.
 *
 * WHY THIS DECLARES AND CROSS-CHECKS RATHER THAN REFUSING, and the reason is measured rather
 * than stylistic (s2225's precedent for `attended-owed-audit`): §3.0b MANDATES gating undecided
 * content in a DETACHED worktree, and `test:ledger-guards` chains this guard, so a fire FOLLOWING
 * THE LAW runs it from a linked worktree as ordinary prescribed work. A blanket linked-worktree
 * refusal would red the mandated drain gate and be excused into uselessness inside a week
 * (F-1460-1, the `cross-engine` fate).
 *
 * The targeted half instead asks main's OWN goals.json about the rows this board cleared. It is
 * STRUCTURALLY UNABLE to fire on the lawful detached-gate path, because a merged tree is a
 * superset of main for any master main already records as shipped.
 */
function mainShipped(root) {
  const git = spawnSync('git', ['show', 'main:tasks/goals.json'], {
    cwd: root, encoding: 'utf8', timeout: 10000, maxBuffer: 64 << 20,
  });
  // 128 is git's "no such ref or path" and is LAWFUL, not a failure: a fixture root outside a
  // repo, or a board whose main carries no goals.json. `mainReviews` treats it the same way.
  if (git.status === 128) return { source: 'absent', masters: new Set() };
  if (git.status !== 0) {
    return { source: 'unverifiable', masters: new Set(), detail: String(git.error?.code || `git show exit ${git.status}`) };
  }
  try {
    const shipped = goalLeaves(JSON.parse(git.stdout)).filter((leaf) => SHIPPED.has(leaf.status));
    return { source: 'main', masters: new Set(shipped.map((leaf) => leaf.taskFile)) };
  } catch (error) {
    return { source: 'unverifiable', masters: new Set(), detail: `main:tasks/goals.json did not parse — ${error.message}` };
  }
}

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
  const classified = classifyRoot(root);
  const verdicts = new Map(classified.verdicts.map((item) => [item.master, item]));
  const tree = classified.corpusTree;
  // F-2226-1: only a board that is NOT main can be frozen relative to main, so the cross-check
  // costs one `git show` and only on the path that needs it.
  const cross = tree === 'main' ? { source: 'not-needed', masters: new Set() } : mainShipped(root);
  const ghosts = masterRows(backlog).flatMap((row) => {
    const verdict = verdicts.get(row.master);
    if (verdict?.verdict === 'SHIPPED') return [{ ...row, evidence: verdict.evidenceSummary }];
    if (cross.masters.has(row.master)) {
      return [{
        ...row,
        fromMain: true,
        evidence: `main:tasks/goals.json records this master SHIPPED — this board is a ${tree} and cannot see it`,
      }];
    }
    return [];
  });
  return { ghosts, tree, treeDetail: classified.corpusTreeDetail ?? '', crossSource: cross.source, crossDetail: cross.detail ?? '' };
}

function main() {
  const rootIndex = process.argv.indexOf('--root');
  const root = path.resolve(rootIndex === -1 ? process.cwd() : process.argv[rootIndex + 1]);
  const { ghosts, tree, treeDetail, crossSource, crossDetail } = findGhosts(root);
  console.log('=== ghost-ladder-row-guard ===');
  for (const ghost of ghosts) console.log(`GHOST line ${ghost.line} ${ghost.path} — ${ghost.evidence}`);
  console.log(`${ghosts.length} ghost ladder row(s).`);
  // F-2226-1: declared ALWAYS, including the happy path (F-2208-1). Nothing on this path
  // refuses on an ordinary non-main tree, so a line that appeared only on failure would
  // re-create the very ambiguity it removes -- and the two zeros above ("no ghosts exist" vs
  // "I read a frozen board") are otherwise byte-identical.
  console.log(`corpus tree: ${tree}${treeDetail ? ` (${treeDetail})` : ''} — main shipped-evidence cross-check: ${crossSource}`);

  if (!process.argv.includes('--strict')) return;
  // 2 = "could not answer" outranks 1 = "answered, and the answer refuses" -- the convention
  // drain-block-check, dry-board-probe, master-shipped-classifier and review-evidence-audit all
  // carry. An incomplete ghost list read off a frozen board is exactly a non-answer, so it must
  // not be reported with the exit code that means a clean, complete refusal.
  if (crossSource === 'unverifiable') {
    console.log(
      `⛔ CANNOT VERIFY — this board is a ${tree}, so its ladder rows are frozen, and main's own\n` +
      `   goals.json could not be read to cross-check them (${crossDetail}). The count above may\n` +
      `   be short. Re-run from the repo root.`,
    );
    process.exitCode = 2;
    return;
  }
  if (ghosts.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
