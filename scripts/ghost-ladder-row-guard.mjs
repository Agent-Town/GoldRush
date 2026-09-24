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
import { backlogFiles, backlogText } from './ledger-corpus.mjs';

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
  // ledger-shape-1 (owner ruling 2026-09-24, item 13a): the ledger is `tasks/BACKLOG.md` PLUS
  // `tasks/backlog/**`. Reading the index alone after the split narrows the lead-clipboard row set SILENTLY and
  // fails OPEN. `scripts/ledger-corpus.mjs` lists the corpus; coordinates carry their own file so
  // they still resolve (bare for the index, `<rel>:<n>` for a split part).
  const backlogCorpus = backlogFiles(root);
  const backlog = backlogText(root);
  const classified = classifyRoot(root);
  const verdicts = new Map(classified.verdicts.map((item) => [item.master, item]));
  const tree = classified.corpusTree;
  // F-2226-1: only a board that is NOT main can be frozen relative to main, so the cross-check
  // costs one `git show` and only on the path that needs it.
  const cross = tree === 'main' ? { source: 'not-needed', masters: new Set() } : mainShipped(root);
  // F-2336-1: the SUBJECT SET, so `0 ghost ladder row(s)` stops being byte-identical between
  // "I checked four rows and none is a ghost" and "I selected nothing to check". Every other
  // declaration this file carries (F-2226-1, F-2245-1) names a corpus feeding the CLASSIFIER;
  // none of them moves when the SELECTOR comes back empty, because the selector is upstream of
  // all three. `clipboard` is carried beside `rows` because the two zeros mean different things:
  // no ladder rows at all, versus rows that exist but name no master.
  const rows = masterRows(backlog);
  const clipboard = backlog.split('\n').filter((line) => LEAD_CLIPBOARD.test(line)).length;
  const ghosts = rows.flatMap((row) => {
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
  return {
    ghosts,
    rows: rows.length,
    clipboard,
    tree,
    treeDetail: classified.corpusTreeDetail ?? '',
    crossSource: cross.source,
    crossDetail: cross.detail ?? '',
    // F-2245-1: the OTHER TWO declarations `classifyRoot` returns. See the block above main().
    reviewsOk: classified.reviewsOk,
    reviewsSource: classified.reviewsSource,
    reviewsReason: classified.reviewsReason ?? '',
    goalsSource: classified.goalsSource,
    // ledger-shape-1: the LEDGER files the selector actually read, declared for the same
    // F-2245-1/F-2208-1 reason as the three above it — `0 ghost ladder row(s)` over the index
    // alone and over the whole corpus are otherwise byte-identical.
    backlogCorpus,
  };
}

/**
 * F-2245-1 (measured and cured s2245). F-2226-1'S OWN SHAPE, ON THE SAME IMPORT, ONE FIELD OVER
 * -- TWICE. THE CURE THAT NAMED IT CARRIED ONE DECLARATION ACROSS AND LEFT TWO BEHIND.
 *
 * `classifyRoot` returns THREE declarations, each added by a fire that had measured the harm of
 * its absence: `reviewsSource` (F-2213-1), `goalsSource` (F-2219-1) and `corpusTree` (F-2222-2).
 * s2226 carried `corpusTree` across to this caller and read `.verdicts` for the rest -- so the
 * other two were discarded exactly as `corpusTree` had been. The comment at `reviewsSource` states
 * the duty outright: "A caller that reads CANDIDATES without reading this is reading a queue
 * licence off an unknown source." This file is that caller, and it is the ONLY non-test importer.
 *
 * BOTH are permissive: lost shipped-evidence drops a master SHIPPED -> NO-TRACE, which drops a
 * GHOST, and `--strict` reds only when `ghosts.length`. Fewer evidence rows means a QUIETER gate.
 *
 * MEASURED s2245 by manufacturing, ground truth = ONE REAL GHOST, with the control asserting its
 * own validity first (F-2215-1: the healthy arm really did produce the ghost):
 *   reviews axis (evidence on main, not in the working tree; `git ls-tree` broken by a PATH shim)
 *     healthy .................. GHOST line 3, rc=1, 174 B
 *     ls-tree BROKEN ........... 0 ghost ladder row(s), rc=0, 119 B
 *     REVERSE CONTROL, clean ... 0 ghost ladder row(s), rc=0, 119 B   <- BYTE-IDENTICAL to the defect
 *   goals axis (evidence is a goals.json leaf only)
 *     healthy .................. GHOST line 3, rc=1, 214 B
 *     goals.json ABSENT ........ 0 ghost ladder row(s), rc=0, 119 B   <- BYTE-IDENTICAL again
 *
 * AND THE SAME LIBRARY DISAGREES WITH ITSELF ON THE IDENTICAL INPUT, which is what makes this a
 * finding rather than a preference: on the same root with the same broken git, the classifier's
 * CLI prints "⛔ CANNOT VERIFY — DO NOT QUEUE off this run" and exits 1, while THIS guard --
 * the one chained bare in `test:ledger-guards` -- exits 0. Two consumers of one library, one
 * failure, opposite verdicts, and the gate got the permissive one.
 *
 * SEVERITY STATED HONESTLY AND NOT INFLATED: LATENT in the prescribed invocation. At the repo
 * root git is healthy and `tasks/goals.json` is tracked and present, so every green this guard
 * has printed was TRUE -- verified on the live board, not assumed. The harm is BOOKKEEPING (a
 * stale ladder row), NOT a Mistake #8 clearance. What earns it a clause is that the false green
 * lands in a GATE, in the permissive direction, in the DEFAULT mode the battery uses.
 *
 * WHY THE TWO ARMS DIFFER, and it is the F-2218-1 restraint rather than a style choice:
 *   `reviewsOk === false` REFUSES (2 = "could not answer"). `mainReviews` already discriminates
 *   the lawful states from the crashes -- a non-git root and a repo with no `main` both return
 *   ok:true/'worktree', which is where all 12 of the classifier's legacy fixtures live -- so
 *   ok:false means a genuine crash and nothing lawful reaches it.
 *   `goalsSource === 'absent'` DECLARES AND DOES NOT REFUSE. A root without goals.json is a
 *   LAWFUL routine state (it is what those same 12 fixtures use), so refusing there would red on
 *   ordinary work and be excused into uselessness inside a week (F-1460-1), taking the
 *   declaration down with it.
 *
 * Declared ALWAYS, including the happy path (F-2208-1), for the reason the tree line beneath it
 * already gives: the two zeros are otherwise byte-identical. A SEPARATE line rather than an
 * extension of the tree line, because that line answers a different question -- WHICH BOARD this
 * is -- and the F-2226-1 cross-check it reports asks only main's GOALS corpus, so it is
 * structurally unable to speak for review-only evidence.
 */
function main() {
  const rootIndex = process.argv.indexOf('--root');
  const root = path.resolve(rootIndex === -1 ? process.cwd() : process.argv[rootIndex + 1]);
  const {
    ghosts, rows, clipboard, tree, treeDetail, crossSource, crossDetail, reviewsOk, reviewsSource,
    reviewsReason, goalsSource, backlogCorpus,
  } = findGhosts(root);
  console.log('=== ghost-ladder-row-guard ===');
  for (const ghost of ghosts) console.log(`GHOST line ${ghost.line} ${ghost.path} — ${ghost.evidence}`);
  console.log(`${ghosts.length} ghost ladder row(s).`);
  // F-2336-1: printed ALWAYS, including the happy path (F-2208-1) -- a declaration that appears
  // only on failure re-creates the ambiguity it removes. This is the one number that separates
  // "no ghosts among N rows" from "no rows".
  //
  // DELIBERATELY NOT A REFUSAL, and the restraint is MEASURED rather than stylistic (F-2218-1).
  // An empty subject set is the LAWFUL RESTING STATE OF A DRY BOARD: a fire ladders a master (the
  // set rises) and the drain retires the row (it returns to 0). Measured s2336 over every
  // BACKLOG.md revision since this guard was born at f94055da -- 37 transitions, oscillating
  // constantly, e.g. 4fe6445a 0->1 when s2291 authored and b2332c00 1->0 when s2293 drained.
  // So `rows === 0` would red this gate on most dry boards, i.e. most of the time, and would be
  // excused into uselessness inside a week (F-1460-1, the `cross-engine` fate).
  console.log(`ladder corpus: ${rows} master row(s) selected from ${clipboard} clipboard-lead row(s).`);
  // F-2226-1: declared ALWAYS, including the happy path (F-2208-1). Nothing on this path
  // refuses on an ordinary non-main tree, so a line that appeared only on failure would
  // re-create the very ambiguity it removes -- and the two zeros above ("no ghosts exist" vs
  // "I read a frozen board") are otherwise byte-identical.
  console.log(`corpus tree: ${tree}${treeDetail ? ` (${treeDetail})` : ''} — main shipped-evidence cross-check: ${crossSource}`);
  // F-2245-1: the corpora the ghost list is actually COMPUTED from, as opposed to the tree it was
  // read on. Always, including the happy path (F-2208-1).
  console.log(`shipped-evidence corpora: reviews ${reviewsSource}, goals ${goalsSource}`);
  // ledger-shape-1 (owner ruling 2026-09-24, item 13a): the ledger is the index PLUS
  // `tasks/backlog/**`, so the corpus the SELECTOR ran over is named too.
  console.log(`ledger files: ${backlogCorpus.join(', ')}`);

  if (!process.argv.includes('--strict')) return;
  // F-2245-1: this refusal comes FIRST because it invalidates the ghost list wholesale, where the
  // cross-check refusal below speaks only to its COMPLETENESS on a non-main tree. Same code (2 =
  // "could not answer") either way, so the order changes only which cause a reader is told.
  if (!reviewsOk) {
    console.log(
      `⛔ CANNOT VERIFY — \`main\` resolves here but its review list could not be read\n` +
      `   (${reviewsReason}), so SHIPPED evidence fell back to this working tree and the count\n` +
      `   above may be SHORT. The classifier's own CLI refuses on this same input.\n` +
      `   Re-run when git is healthy.`,
    );
    process.exitCode = 2;
    return;
  }
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
