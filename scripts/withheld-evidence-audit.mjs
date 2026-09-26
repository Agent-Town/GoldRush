#!/usr/bin/env node
/**
 * withheld-evidence-audit.mjs — answers the question the runner ASKS ALOUD every
 * time it withholds a path, and which nothing in the factory has ever read:
 *
 *     "the runner declined to commit this evidence. Did it survive anywhere?"
 *
 * WHY THIS EXISTS (F-2477-1, s2477 — the general form of F-2476-1)
 * ---------------------------------------------------------------
 * `lane-runner-v3.sh` commits a lane's DELTA. A path that was already dirty in
 * the lane's baseline is not this run's to claim, so the runner withholds it and
 * says so, once per path:
 *
 *     [lane-runner-v3] withheld baseline-dirty path: <path>
 *
 * That refusal is CORRECT for source: claiming another task's uncommitted edits
 * is exactly the cross-contamination the delta-commit exists to prevent. But it
 * is applied to `artifacts/**` evidence too, and there it has the opposite
 * meaning — the evidence a run produced is dropped on the floor, silently, while
 * the run reports success. s2476 recovered its own two withheld screenshots ONLY
 * because the lane worktree still held them; a lane reset between then and the
 * next reader takes the bytes with it, and nothing anywhere would say so.
 *
 * NOTHING WATCHED THIS, verified by reading rather than inferred:
 *   - `review-evidence-audit.mjs` is CITATION-DRIVEN over `reviews/*.md`. An
 *     evidence tree that is cited from somewhere else — a heat note under
 *     `artifacts/`, say — is never a subject. Orthogonal axes (F-2357-1).
 *   - `art-staging-audit.mjs` scans art staging only and says so.
 *   - The withheld lines sit in `tasks/runs/*.log`, which no instrument reads.
 *
 * THE LIVE LOSS THAT PROMPTED IT, measured s2477
 * ----------------------------------------------
 * `20260902-071130-lane-b-gauntlet-heat10-r2.md.log` withheld 54 paths under
 * `artifacts/gauntlet-heat10-r2-20260902/`. NONE of the 54 is tracked on main,
 * none is present on any ref, and none is on disk in the main worktree, in any
 * of the four lanes, in any `-salvage` tree, or under `worktrees/art`.
 *
 * The heat is a two-rig EVAL and the loss is ASYMMETRIC BETWEEN THE RIGS:
 *   - `prime/` is COMPLETE — all four maps, 66 files tracked.
 *   - `pi/` kept only e1-baron (15) and e2-hill-mine (11). `pi/the-claim/` and
 *     `pi/e1-night-shift/` are gone entirely — two of the four rows the note's
 *     own PI matrix reports, including its "+1 wave on Night Shift" headline
 *     and its "lost its prior Claim row to a controller bug" claim.
 *   - Also gone: BOTH charters (the note's own fairness control — "separate
 *     charters, state, matrices, and notebooks"), `preflight.md` (the mandatory
 *     preflight its arena-law section cites), and the whole `probe/` set (the
 *     early probe accepted at rank 5, hash fnv1a32:8886f412).
 *
 * SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED
 * ------------------------------------------------------
 * The note itself is TRACKED and survives with every number intact, so no
 * CONCLUSION was lost — only its substantiation. This is not a false green:
 * nothing ever reported health about these bytes, because nothing looked.
 *
 * What earns it a tool is the DIRECTION and the asymmetry. A heat is a
 * COMPARISON, and one rider's evidence survived in full while the other's did
 * not — so the comparison can no longer be audited on both sides, and the rig
 * that came off worse in the write-up is the one whose transcripts are missing.
 * That is the RETENTION LAW's own subject (Mistake #11: what dies with this
 * disk), arriving through a mechanism that announces itself in the log and had
 * no reader.
 *
 * WHY ADVISORY AND NOT A RED GATE, and the restraint is measured
 * -------------------------------------------------------------
 * Withholding is LAWFUL and routine — it is the delta-commit working — and most
 * withheld paths are source files that another task legitimately owns and
 * commits. A red on "the runner withheld something" would fire during ordinary
 * correct operation and be excused into uselessness inside a week (F-1460-1, the
 * `cross-engine` fate). This is a triage READ, exactly as §2.0c's runner check
 * and F-2357-1's evidence sweep are. `--strict` is there for a caller who wants
 * the verdict as an exit code, and it separates 2 = "could not answer" from
 * 1 = "answered, and the answer refuses".
 *
 * ANCHOR THE NEEDLE ON THE LINE PREFIX. THIS IS NOT A STYLE POINT (F-2102-1)
 * -------------------------------------------------------------------------
 * `tasks/runs/*.log` embeds transcripts, diff hunks and grep output, so the run
 * logs QUOTE the runner's own source — including the printf that emits this very
 * line. Measured s2477 over 341 logs: a bare substring key matches 6 files, the
 * anchored key matches 5. The sixth withheld nothing and only narrates the
 * emitter. An unanchored census sends a fire chasing a run that never lost
 * anything, which is the same defect F-2102-1 measured at ~2.7x on FIRE END.
 *
 * USAGE
 *   node scripts/withheld-evidence-audit.mjs [--list] [--strict] [--json]
 */

import fs, { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Anchored to this file, never to process.cwd(): the corpus is a fixed tree in
// this repo, and a cwd-relative root silently narrows to nothing from a
// subdirectory while still printing a clean verdict (F-2220-1).
const REPO = fileURLToPath(new URL('..', import.meta.url));
const RUNS_DIR = path.join(REPO, 'tasks', 'runs');

// The emitted prefix, verbatim from lane-runner-v3.sh. Anchored: see above.
export const NEEDLE = '[lane-runner-v3] withheld baseline-dirty path: ';

const git = (args, opts = {}) =>
  spawnSync('git', args, {
    cwd: REPO,
    encoding: 'utf8',
    maxBuffer: 64 << 20,
    timeout: 240_000,
    killSignal: 'SIGKILL',
    ...opts,
  });

/**
 * Read every run log and pull the ANCHORED withheld lines out of each.
 * Returns a declared corpus — an empty selection must never be confused with a
 * clean board, which is the shape of good news in every instrument here
 * (F-2217-1).
 */
export function selectWithheld(runsDir = RUNS_DIR) {
  let entries;
  try {
    entries = readdirSync(runsDir);
  } catch (err) {
    return {
      corpus: err.code === 'ENOENT' ? 'absent' : 'unreadable',
      corpusDetail: `${err.code ?? 'error'} at ${runsDir}`,
      logsRead: 0,
      logsUnreadable: 0,
      runs: [],
    };
  }
  const logs = entries.filter((f) => f.endsWith('.log')).sort();
  const runs = [];
  let logsRead = 0;
  const unreadable = [];
  for (const name of logs) {
    let text;
    try {
      text = readFileSync(path.join(runsDir, name), 'utf8');
    } catch (err) {
      // Counted and NAMED, never silently dropped: an unreadable member is a
      // hole in the denominator, not an absence of findings.
      unreadable.push(`${name} (${err.code ?? 'error'})`);
      continue;
    }
    logsRead++;
    const paths = [];
    for (const line of text.split('\n')) {
      if (line.startsWith(NEEDLE)) {
        const p = line.slice(NEEDLE.length).trim();
        if (p) paths.push(p);
      }
    }
    if (paths.length) runs.push({ log: name, paths: [...new Set(paths)] });
  }
  return {
    corpus: 'read',
    corpusDetail: runsDir,
    logsRead,
    logsUnreadable: unreadable.length,
    unreadableNames: unreadable,
    runs,
  };
}

/**
 * Classify each withheld path. Order matters: cheapest and most decisive first,
 * and the expensive all-refs question is asked ONLY of the residue.
 *
 *   TRACKED   — on main today. The ordinary, lawful outcome.
 *   IN-GIT    — on some other ref. Safe; it is in an object database.
 *   ON-DISK   — untracked but still here. RECOVERABLE, and the owed act is to
 *               judge it and commit it path-scoped (or say why not).
 *   LOST      — in no object database, on no ref, and on no disk we can see.
 */
export function classify(sel, { repo = REPO } = {}) {
  if (sel.corpus !== 'read') {
    return { corpus: sel.corpus, corpusDetail: sel.corpusDetail, rows: [], counts: null };
  }

  const ls = git(['ls-files']);
  if (ls.status !== 0) {
    return {
      corpus: 'tracked-set-unverifiable',
      corpusDetail: `git ls-files exited ${ls.status ?? 'null'}${ls.error ? ` (${ls.error.code})` : ''}`,
      rows: [],
      counts: null,
    };
  }
  const tracked = new Set(ls.stdout.split('\n').filter(Boolean));
  // A tracked set this small is not a repo we can reason about. Refuse rather
  // than classify every path LOST against an empty denominator (F-2215-1: a
  // control must assert its own validity before its answer is believed).
  if (tracked.size === 0) {
    return { corpus: 'tracked-set-empty', corpusDetail: 'git ls-files returned no paths', rows: [], counts: null };
  }

  // Every tree a withheld path could still be sitting in. The lanes matter:
  // s2476's own recovery worked only because its lane worktree still held the
  // files, and that is the difference between ON-DISK and LOST.
  const searchRoots = [repo];
  const wt = path.join(repo, 'worktrees');
  if (existsSync(wt)) {
    for (const d of readdirSync(wt).sort()) searchRoots.push(path.join(wt, d));
  }

  const rows = [];
  for (const run of sel.runs) {
    for (const p of run.paths) {
      let state;
      if (tracked.has(p)) state = 'TRACKED';
      else {
        const where = searchRoots.find((r) => existsSync(path.join(r, p)));
        if (where) state = 'ON-DISK';
        else {
          // Only the residue pays for the all-refs question.
          const r = git(['log', '--all', '--oneline', '-1', '--', p]);
          if (r.status !== 0) state = 'UNVERIFIABLE';
          else state = r.stdout.trim() ? 'IN-GIT' : 'LOST';
        }
      }
      rows.push({ log: run.log, path: p, state });
    }
  }

  const counts = { TRACKED: 0, 'IN-GIT': 0, 'ON-DISK': 0, LOST: 0, UNVERIFIABLE: 0 };
  for (const r of rows) counts[r.state]++;
  // Rows are per (run, path), and a path withheld by two consecutive runs in the
  // same lane appears twice — which is the ORDINARY case, because the second
  // task inherits the first's dirty baseline. Report BOTH: the row count is the
  // work the runner declined, the distinct count is the files at stake, and a
  // reader who sees only the first over-states the loss by the repeat factor.
  const distinct = { TRACKED: 0, 'IN-GIT': 0, 'ON-DISK': 0, LOST: 0, UNVERIFIABLE: 0 };
  const seen = new Map();
  for (const r of rows) if (!seen.has(r.path)) seen.set(r.path, r.state);
  for (const s of seen.values()) distinct[s]++;
  return { corpus: 'read', corpusDetail: sel.corpusDetail, rows, counts, distinct, distinctPaths: seen.size };
}

export function exitCodeFor(result, strict) {
  if (!strict) return 0;
  if (result.corpus !== 'read') return 2; // could not answer
  if (result.counts.UNVERIFIABLE > 0) return 2;
  if (result.counts.LOST > 0 || result.counts['ON-DISK'] > 0) return 1; // answered, and it refuses
  return 0;
}

function main(argv) {
  const strict = argv.includes('--strict');
  const list = argv.includes('--list');
  const asJson = argv.includes('--json');

  const sel = selectWithheld();
  const result = classify(sel);

  if (asJson) {
    console.log(JSON.stringify({ corpus: result.corpus, corpusDetail: result.corpusDetail, counts: result.counts, rows: result.rows }, null, 2));
    return exitCodeFor(result, strict);
  }

  console.log('WITHHELD EVIDENCE AUDIT — paths lane-runner-v3 declined to commit');
  console.log('');
  // Declared ALWAYS, including the happy path: a declaration that appears only
  // on failure re-creates the ambiguity it removes (F-2208-1).
  console.log(`  corpus                  : ${sel.corpus} (${sel.logsRead} run log(s) read${sel.logsUnreadable ? `, ${sel.logsUnreadable} UNREADABLE` : ''})`);
  console.log(`  dir                     : ${sel.corpusDetail}`);
  if (sel.logsUnreadable) for (const n of sel.unreadableNames) console.log(`      UNREADABLE ${n}`);

  if (result.corpus !== 'read') {
    console.log('');
    console.log(`⛔ CANNOT VERIFY — ${result.corpus}: ${result.corpusDetail}`);
    console.log('   Do NOT read this run as "nothing was withheld".');
    return exitCodeFor(result, strict);
  }

  console.log(`  runs that withheld      : ${sel.runs.length}`);
  console.log(`  withheld rows           : ${result.rows.length}  (${result.distinctPaths} distinct path(s))`);
  console.log('');
  console.log('                                 rows   distinct');
  const row = (label, k) =>
    console.log(`  ${label.padEnd(28)}${String(result.counts[k]).padStart(5)}${String(result.distinct[k]).padStart(11)}`);
  row('TRACKED  (on main)', 'TRACKED');
  row('IN-GIT   (another ref)', 'IN-GIT');
  row('ON-DISK  (untracked, HERE)', 'ON-DISK');
  row('LOST     (no ref, no disk)', 'LOST');
  if (result.counts.UNVERIFIABLE) row('UNVERIFIABLE', 'UNVERIFIABLE');
  console.log('');

  const owed = result.rows.filter((r) => r.state === 'ON-DISK' || r.state === 'LOST' || r.state === 'UNVERIFIABLE');
  if (owed.length === 0) {
    console.log('✅ NOTHING OWED — every withheld path is in an object database.');
  } else {
    const byRun = new Map();
    for (const r of owed) {
      if (!byRun.has(r.log)) byRun.set(r.log, []);
      byRun.get(r.log).push(r);
    }
    for (const [log, rs] of byRun) {
      const n = (s) => rs.filter((r) => r.state === s).length;
      console.log(`  ${log}`);
      console.log(`     ON-DISK ${n('ON-DISK')} · LOST ${n('LOST')}${n('UNVERIFIABLE') ? ` · UNVERIFIABLE ${n('UNVERIFIABLE')}` : ''}`);
      if (list) for (const r of rs) console.log(`        ${r.state.padEnd(12)}${r.path}`);
    }
    console.log('');
    // The remedy beside the alarm, not in the law: an alarm whose reader has
    // nothing to type decays into a formality (F-2451-1).
    if (result.counts['ON-DISK']) {
      console.log('  ON-DISK is RECOVERABLE and is the one bucket you can still act on:');
      console.log('    judge each path, then `git add -f <path>` + commit path-scoped, or');
      console.log('    say in the handoff why it stays out. Never bulk-add what this returns.');
    }
    if (result.counts.LOST) {
      console.log('  LOST bytes cannot be recovered by any command. Record the judgement');
      console.log('  where the next fire reads it, and say WHAT the evidence substantiated.');
    }
    if (!list) console.log('  Re-run with --list to see every path.');
  }
  return exitCodeFor(result, strict);
}

if (isMain(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}

/**
 * A VERBATIM COPY of isMain from ./is-main.mjs (F-SF1-2, is-main-2), not an import: a guard fixture
 * relocates this file ALONE. withheld-evidence-audit-guard.test.mjs copies it by itself into a
 * fixture repository's scripts/ and writes a variant of it alone as variant.mjs, where a relative
 * import of is-main.mjs dies ERR_MODULE_NOT_FOUND (measured with the import applied).
 * scripts/is-main.test.mjs asserts this copy still matches the original byte for byte; change them
 * together.
 */
function isMain(importMetaUrl) {
  const entry = process.argv[1];
  if (!entry || !importMetaUrl) return false;
  try {
    return fs.realpathSync(entry) === fs.realpathSync(fileURLToPath(importMetaUrl));
  } catch {
    return false;
  }
}
