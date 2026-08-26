#!/usr/bin/env node
// Advisory evidence probe for task-master shipped-ness (F-1568-1/F-1569-1).

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

/**
 * 'on-branch' | 'detached' | 'no-git' | 'unverifiable' — F-2333-1's detachment half.
 *
 * A LOCAL COPY for the same measured reason as its twin in drain-block-check.mjs: guard
 * fixtures copy these files by a FIXED LIST and must not copy the whole scripts/ tree
 * (F-2284-1), so a sibling import is ERR_MODULE_NOT_FOUND inside them. This file already
 * carries its own `corpusTree` for the equivalent reason. The anti-drift duty F-2227-1 asks
 * for is discharged by a guard asserting all three copies AGREE, not by an import.
 *
 * 128 ("not a repository") stays PERMISSIVE: corpusTree here maps it onto a fixture root, and
 * refusing would red every legacy fixture in this family (F-1460-1).
 */
function headDetached(root) {
  const r = spawnSync('git', ['-C', root, 'symbolic-ref', '-q', 'HEAD'], { encoding: 'utf8', timeout: 10000 });
  if (r.error || r.status === null) return 'unverifiable';
  if (r.status === 0 && String(r.stdout).trim()) return 'on-branch';
  if (r.status === 1) return 'detached';
  if (r.status === 128) return 'no-git';
  return 'unverifiable';
}

// Exported for F-2226-1: `ghost-ladder-row-guard` cross-checks a frozen board's rows against
// main's own goals.json, and must ask the SAME question this file asks. A private copy of a
// two-element set is a rename away from silently disagreeing with its own source of truth.
export const SHIPPED = new Set(['merged', 'shipped']);
const TRACE_DIRS = new Set(['done', 'failed', 'running', 'runs', 'stopped', 'queue-paused']);
// Gates CANDIDATES only for NO-TRACE masters; widening can only shrink that list, so the risk is hiding real work.
const NOT_QUEUEABLE = /DO[- ]NOT[- ]QUEUE|NEVER QUEUE|NOT[- ](?:FIRE[- ])?QUEUEABLE/i;

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

const walkReviews = (root) =>
  walk(path.join(root, 'reviews')).filter((file) => file.endsWith('.md')).map((file) => path.relative(root, file));

// F-2213-1. `git ls-tree main` asks "what has MAIN shipped?"; walking `reviews/` asks "what is
// in THIS directory?". Those are the same question only when the working tree IS main. The old
// bare `catch` substituted the second for the first SILENTLY, and the substitution is not
// symmetric: measured s2213, the two arms agree exactly on main (955/955), but in
// worktrees/lane-a (behind 508) the walk is 32 paths SHORT and gains nothing -- loss is
// monotone, and lost review evidence drops a master SHIPPED -> NO-TRACE, i.e. INTO the
// `CANDIDATES` set this tool exists to compute. That is the Mistake #8 polarity (the 824k
// Flail): a crash reading as "never shipped, safe to queue".
//
// Unlike `merge-base --is-ancestor` (F-2212-1), a non-zero exit is NOT a legitimate verdict in
// ls-tree's protocol, so any failure here is a CRASH and must be loud. But the fallback is also
// genuinely load-bearing -- every one of this file's 12 guard tests builds a non-git mkdtemp
// root, so `main` does not resolve and the walk IS the honest answer there. Hence a
// DISCRIMINATOR rather than a refusal: resolve `main` first, and only treat an ls-tree failure
// as unverifiable when main demonstrably exists.
//
// Returns { ok, source: 'main' | 'worktree' | 'unverifiable', files }. `source` is a STRING for
// the F-2212-1 reason: a careless truthiness test at a call site coerces it TRUE, i.e. toward
// noticing rather than ignoring.
function mainReviews(root) {
  const opts = { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 };
  const ref = spawnSync('git', ['rev-parse', '--verify', '--quiet', 'main'], opts);
  // Codes MEASURED s2213, not assumed -- a broken git must not be waved through as "no main
  // here", which would just move the silent substitution one call earlier:
  //   128 = not a git repository   |   1 = a repo with no `main` branch   (both legitimate)
  //   .error (e.g. ENOENT) or any other code = the probe itself failed    (a crash)
  if (ref.error) return { ok: false, source: 'unverifiable', files: walkReviews(root), reason: `git unspawnable: ${ref.error.code}` };
  if (ref.status === 1 || ref.status === 128) {
    // No `main` here at all: a non-git root, or a repo without the branch. The walk is not a
    // degraded substitute in that case -- it is the only truthful source. Every one of this
    // file's 12 guard tests lives here.
    return { ok: true, source: 'worktree', files: walkReviews(root) };
  }
  if (ref.status !== 0) return { ok: false, source: 'unverifiable', files: walkReviews(root), reason: `git rev-parse exited ${ref.status}` };
  // maxBuffer is explicit and generous on purpose: the default 1 MiB is a growth-keyed trap.
  // Measured s2213, this output is 152,901 bytes over 3,081 paths -- 14.6% of the default, and
  // it grows by a line every drain. The sibling instruments in this corpus (gate-caller-audit,
  // row-quote-currency) already pass `64 << 20`; this file had simply never adopted it.
  const listed = spawnSync('git', ['ls-tree', '-r', '--name-only', 'main', '--', 'reviews'], opts);
  if (listed.error || listed.status !== 0) {
    const why = listed.error ? listed.error.message : `git exited ${listed.status}`;
    return { ok: false, source: 'unverifiable', files: walkReviews(root), reason: why };
  }
  return {
    ok: true,
    source: 'main',
    files: listed.stdout.trim().split('\n').filter((file) => file.endsWith('.md')),
  };
}

export function goalLeaves(value, out = []) {
  if (Array.isArray(value)) value.forEach((item) => goalLeaves(item, out));
  else if (value && typeof value === 'object') {
    if (value.taskFile) out.push(value);
    Object.values(value).forEach((item) => goalLeaves(item, out));
  }
  return out;
}

// F-2219-1 (s2219): THE SECOND SHIPPED-EVIDENCE SOURCE, WHICH F-2213-1 DID NOT CARRY ITS CURE
// ACROSS TO. `verdictFor` builds SHIPPED from TWO corpora -- reviews (declared above since
// F-2213-1) and goal leaves (undeclared until now) -- and the goals arm was a bare
// `existsSync(p) ? goalLeaves(JSON.parse(readFileSync(p))) : []`. That is F-2218-1's class: the
// swallow need not be a `catch`, so every catch-keyed census in this file's lineage (s2212
// grep -c catch, s2213 spawn-inside-try, s2214 same-file wrapper, s2215 handler polarity) was
// structurally incapable of seeing it -- nothing throws, so there is no handler to score.
//
// BLAST RADIUS, MEASURED s2219 by a controlled experiment against the live board (same root,
// same masters, same reviews; the ONLY variable is this arm, so anything that moves is this arm
// alone):  goals read -> SHIPPED 704 · NO-TRACE 66 · CANDIDATES 1 · DISAGREES 97
//          goals empty -> SHIPPED 547 · NO-TRACE 85 · CANDIDATES 8 · DISAGREES 272
// 157 masters fall out of SHIPPED and the candidate set inflates 8x, INTO the set this tool
// exists to compute -- the Mistake #8 / 824k Flail polarity, identical in direction to F-2213-1
// and two orders of magnitude larger: that finding was cured on a blast radius of ONE flip.
//
// SEVERITY, STATED HONESTLY: LATENT, exactly like F-2212-1/F-2213-1/F-2214-1 before it.
// `tasks/goals.json` is TRACKED and was measured present in main and in all four lane worktrees,
// and a MALFORMED file already fails loud (JSON.parse throws into the F-2214-1 CLI catch, which
// prints CANNOT VERIFY and reds --strict with 2). What was undefended is the ABSENT case, which
// alone reaches this ternary without an exception. The defect is not that absence is likely --
// it is that the tool could not tell you which corpus its queue licence was computed from.
//
// THE RESTRAINT IS THE DESIGN (F-2218-1): `absent` DECLARES AND DOES NOT REFUSE. A root with no
// goals.json is LAWFUL -- it is what every one of this file's 12 legacy guard tests uses, and it
// is how `mainReviews` already treats a non-git root ('worktree', ok: true). Refusing here would
// red every fixture and be excused into uselessness inside a week (F-1460-1), taking the
// declaration down with it. The parse path is DELIBERATELY LEFT ALONE: it already refuses
// correctly via F-2214-1, and re-coding a working cure in passing is a drive-by (F-2218-1).
//
// `source` is a STRING for the F-2212-1 reason: a careless truthiness test at a call site
// coerces it TRUE, i.e. toward noticing rather than ignoring.
function goalEvidence(tasksDir) {
  const goalsPath = path.join(tasksDir, 'goals.json');
  if (!fs.existsSync(goalsPath)) return { source: 'absent', leaves: [] };
  return { source: 'goals', leaves: goalLeaves(JSON.parse(fs.readFileSync(goalsPath, 'utf8'))) };
}

/**
 * F-2222-2 (measured s2222, cured s2223). WHICH TREE is this board a checkout OF?
 *
 * Every discriminator this file has grown asks WHETHER a corpus could be read:
 * F-2213-1 gave `reviewsSource` (main vs a walked working tree), F-2214-1 made a
 * crash refuse, F-2219-1 gave `goalsSource` (goals vs absent). NONE of them asks
 * WHICH corpus it was -- and three of this tool's four inputs are TRACKED files
 * (`tasks/*.md`, the trace dirs under `tasks/`, `tasks/goals.json`), so a linked
 * worktree holds all three FROZEN at whatever commit that lane sits on.
 *
 * A stale checkout passes every existing test: the files exist, they enumerate,
 * nothing throws, the sets are non-empty, and BOTH declarations read healthy --
 * measured s2223 from worktrees/lane-c, `reviewsSource: "main"` (correctly: git
 * ls-tree reaches main from inside a worktree, same object database) and
 * `goalsSource: "goals"` (correctly: goals.json is tracked and present there).
 *
 * BLAST RADIUS, measured s2223 on the live board, same binary ninety seconds apart:
 *   repo root      -> TOTAL 1125 · SHIPPED 704 · NO-TRACE  66 ->   1 candidate
 *   worktrees/lane-c -> TOTAL 1122 · SHIPPED 695 · NO-TRACE 343 -> 268 candidates
 * A 268x inflation of the queue-me set at identical rc=0, with no refusal and no
 * declaration. That is the Mistake #8 / 824k Flail polarity -- this tool exists to
 * stop a fire re-deriving already-merged work -- and it is the largest blast radius
 * this lineage has measured: F-2219-1's was 8x, F-2213-1's was ONE flip.
 *
 * WHY THIS REFUSES WHERE F-2218-1's `absent` ONLY DECLARES: an absent corpus can be
 * a lawful routine state, so refusing there would red on ordinary work and be
 * excused into uselessness (F-1460-1). A STALE board is never lawful for THIS
 * question. The tool asks "has MAIN shipped this master?", and a lane's frozen
 * checkout cannot answer that -- it answers a different question and reports the
 * answer as if it were this one. dry-board-probe set the precedent for exactly this
 * corpus class one file over: report the counts (seeing 154 against 1,353 is the
 * whole tell) and refuse the verdict.
 *
 * The test is exact and cheap: a LINKED worktree's gitdir is
 * <main>/.git/worktrees/<name> while --git-common-dir still resolves to the MAIN
 * .git. Equal => the main worktree OR ANY SUBDIRECTORY OF IT, which is correct and
 * must NOT be flagged -- flagging every repo is the over-general cure, and s2221's
 * near-catastrophic reverse control is the standing warning about helpers pitched
 * one level too general.
 *
 * `cwd: root`, NOT process.cwd(): unlike dry-board-probe this file takes an explicit
 * `--root`, so the question is about the tree the CALLER named, not the one the
 * process happens to sit in. spawnSync, not execFileSync: it reports by RETURN VALUE
 * and never throws (s2216), so this reads a status rather than a caught exception.
 * Exit 128 is git's "not a repository" and is LAWFUL -- all 12 legacy tests in this
 * file build non-git mkdtemp roots and must keep asserting exactly what they always
 * asserted. Only a git that could not ANSWER is 'tree-unverifiable'.
 *
 * Values are STRINGS for the F-2212-1 reason: a careless truthiness test at a call
 * site coerces every failure value TRUE, i.e. toward noticing rather than ignoring.
 *
 * @returns {{tree: 'main'|'linked-worktree'|'tree-unverifiable', detail: string}}
 */
function corpusTree(root) {
  const opts = { cwd: root, encoding: 'utf8', timeout: 10000 };
  const ask = (args) => spawnSync('git', args, opts);
  const gitDir = ask(['rev-parse', '--absolute-git-dir']);
  if (gitDir.status === 128) return { tree: 'main', detail: '' }; // not a repo: a fixture root
  if (gitDir.status !== 0) {
    return { tree: 'tree-unverifiable', detail: String(gitDir.error?.code || `git rev-parse exit ${gitDir.status}`) };
  }
  const common = ask(['rev-parse', '--path-format=absolute', '--git-common-dir']);
  if (common.status !== 0) {
    return { tree: 'tree-unverifiable', detail: String(common.error?.code || `git rev-parse exit ${common.status}`) };
  }
  const a = (gitDir.stdout || '').trim();
  const b = (common.stdout || '').trim();
  if (!a || !b) return { tree: 'tree-unverifiable', detail: 'git rev-parse returned empty' };
  if (a === b) return { tree: 'main', detail: '' };
  return { tree: 'linked-worktree', detail: `the board main tracks lives in ${path.dirname(b)}` };
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
  const reviewSource = mainReviews(root);
  const reviews = reviewSource.files;
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
  const goalSource = goalEvidence(tasksDir); // F-2219-1
  const goals = goalSource.leaves;
  const tree = corpusTree(root); // F-2222-2. The corpora read FINE; the question left is WHICH board they are.
  // F-2333-1. And WHICH COMMIT they were read at: this file's corpusTree maps git's 128 onto
  // 'main' for fixture roots, so the 'no-git' answer is REACHABLE here and must stay permissive
  // (F-1460-1). Only asked of a tree that claims to be main -- a linked worktree is already
  // refused above, and asking twice would print a DETACHED accusation for a stale-lane cause.
  const head = tree.tree === 'main' ? headDetached(root) : 'not-asked';

  const verdicts = masters.map((master) => {
    const fullStem = stem(master);
    const masterText = fs.readFileSync(path.join(tasksDir, master), 'utf8');
    const banner = masterText.split('\n').slice(0, 6).join('\n').match(NOT_QUEUEABLE)?.[0] ?? '';
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
    // F-2213-1: which corpus the SHIPPED evidence actually came from. A caller that reads
    // CANDIDATES without reading this is reading a queue licence off an unknown source.
    reviewsOk: reviewSource.ok,
    reviewsSource: reviewSource.source,
    ...(reviewSource.reason && { reviewsReason: reviewSource.reason }),
    // F-2219-1: the OTHER shipped-evidence corpus, declared on the machine channel ALWAYS --
    // including the happy path -- because a field that appears only on failure re-creates the
    // ambiguity it removes (F-2208-1). The human channel follows this file's OWN convention
    // instead and prints only a deviation, matching `reviewsSource` fifteen lines below: an
    // always-on line for the ordinary case is the noise that decays a declaration into a
    // formality (F-2218-1). That split is a decision, not an oversight.
    goalsSource: goalSource.source,
    // F-2222-2: WHICH tree the three TRACKED corpora above are a checkout of. Carried on the
    // machine channel ALWAYS, including the happy path (F-2208-1) -- the two source fields above
    // both read healthy from a stale worktree, so a caller has no other way to tell.
    corpusTree: tree.tree,
    ...(tree.detail && { corpusTreeDetail: tree.detail }),
    // F-2333-1: the OTHER way this board can be frozen. `corpusTree` answers WHICH TREE and
    // is used above as a proxy for IS THIS BOARD FRESH -- and in the MAIN worktree a DETACHED
    // HEAD answers 'main', the modal healthy value. `tasks/goals.json` is TRACKED, so it is
    // then frozen at that commit. Carried ALWAYS, including the happy path (F-2208-1), for
    // exactly the reason the field above states: from a detached tree `reviewsSource`,
    // `goalsSource` AND `corpusTree` all read healthy, so a caller has no other way to tell.
    headState: head,
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
  // F-2222-2: this refusal prints BEFORE the two source notes below, and the order is the point.
  // From a stale worktree `reviewsSource` and `goalsSource` both read HEALTHY (measured s2223),
  // so those notes stay silent and would leave the count looking fully attested. The banner is
  // cured here and not merely at the exit code because the DEFAULT mode is advisory and there the
  // whole verdict travels on stdout (F-2210-1). Human channel prints only a DEVIATION, matching
  // this file's own convention for the two fields below; the machine channel carries it always.
  if (result.corpusTree === 'linked-worktree') {
    console.log(
      `\n⛔ CANNOT VERIFY — DO NOT QUEUE off this run. This root is a LINKED WORKTREE, so the\n` +
        `   masters, traces and goal leaves above are a checkout of the board FROZEN at this\n` +
        `   lane's commit, not main's (${result.corpusTreeDetail}).\n` +
        `   The two source lines below cannot see this: git reaches main for reviews from inside a\n` +
        `   worktree, and goals.json is tracked and present here, so BOTH read healthy while the\n` +
        `   board underneath them is stale. That loss is one-directional — it moves masters INTO\n` +
        `   the candidate set above. Re-run from the main worktree before queueing anything.`,
    );
  } else if (result.corpusTree === 'tree-unverifiable') {
    console.log(
      `\n⛔ CANNOT VERIFY — DO NOT QUEUE off this run. git could not say which tree this board is a\n` +
        `   checkout of (${result.corpusTreeDetail}), so the counts above may be computed from a\n` +
        `   stale lane checkout rather than from main. Re-run once git is healthy.`,
    );
  } else if (result.headState === 'detached') {
    // F-2333-1. Cured at the BANNER and not merely at the exit code, because the default mode
    // is advisory and there the whole verdict travels on stdout (F-2210-1). Kept SEPARATE from
    // the linked-worktree text above: that one opens "this root is a LINKED WORKTREE", which is
    // false here, and the two owe different acts -- that one says re-run from main, this one
    // says `git checkout main` first (F-2225-1).
    console.log(
      `\n⛔ CANNOT VERIFY — DO NOT QUEUE off this run. This IS the main worktree, but its HEAD is\n` +
        `   DETACHED, so the masters, traces and goal leaves above are a checkout of the board\n` +
        `   FROZEN at that commit. Every declaration on this run reads healthy and cannot see it:\n` +
        `   reviews are read by REF so they are genuinely fresh, goals.json is tracked and present,\n` +
        `   and corpusTree says 'main' — the modal healthy value. Measured s2333: a master shipped\n` +
        `   by its goal leaf alone moved SHIPPED→NO-TRACE and INTO the candidate set (Mistake #8).\n` +
        `   Run \`git checkout main\`, or pass --root <a tree on main>, before queueing anything.`,
    );
  } else if (result.headState === 'unverifiable') {
    console.log(
      `\n⛔ CANNOT VERIFY — DO NOT QUEUE off this run. git could not say whether this main worktree's\n` +
        `   HEAD is detached, so this run cannot tell a tree on \`main\` from one frozen at a bare\n` +
        `   commit. This is an INSTRUMENT failure, not a board state: check git, then re-run.\n` +
        `   (A non-git root is NOT this case — that answers 128 and proceeds normally.)`,
    );
  }
  // F-2213-1: never let a candidate count leave here wearing an authority it does not have.
  if (!result.reviewsOk) {
    console.log(
      `\n⛔ CANNOT VERIFY — DO NOT QUEUE off this run. \`main\` resolves here but its review list\n` +
        `   could not be read (${result.reviewsReason}), so SHIPPED evidence fell back to this\n` +
        `   working tree. That loss is one-directional: it moves masters INTO the candidate set.\n` +
        `   Re-run once git is healthy before treating any candidate above as queueable.`,
    );
  } else if (result.reviewsSource === 'worktree') {
    console.log(`\nⓘ review evidence read from this WORKING TREE (no \`main\` ref here), not from main.`);
  }
  // F-2219-1: the goal-leaf corpus is the OTHER half of SHIPPED evidence. Measured on the live
  // board, losing it moves 157 masters out of SHIPPED and inflates CANDIDATES 1 -> 8, so a
  // candidate count computed without it must never leave here wearing an authority it lacks.
  if (result.goalsSource === 'absent') {
    console.log(
      `\nⓘ NO goal-leaf evidence — tasks/goals.json is absent under this root, so SHIPPED was\n` +
        `   computed from reviews and traces ALONE. That loss is one-directional: it moves masters\n` +
        `   INTO the candidate set above. Expected for a scratch root; on a real board, re-run\n` +
        `   from the repo root before treating any candidate as queueable.`,
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rootIndex = process.argv.indexOf('--root');
  const root = rootIndex === -1 ? process.cwd() : process.argv[rootIndex + 1];
  try {
    const result = classifyRoot(root);
    process.argv.includes('--json') ? console.log(JSON.stringify(result, null, 2)) : printTable(result);
    // F-2213-1: under --strict an unverifiable review corpus refuses in its own right. Without
    // this, a degraded run whose candidate count happens to be 0 exits 0 -- byte-identical to a
    // clean board, which is the exact defect F-2208-1 cured one file over.
    // F-2222-2: 2 = "could not answer" OUTRANKS 1 = "answered, and the answer refuses" -- the
    // house convention already carried by drain-block-check, dry-board-probe and
    // review-evidence-audit. A candidate count off a stale board is not a smaller refusal than a
    // candidate count off main; it is not an answer to this question at all.
    const strict = process.argv.includes('--strict');
    process.exitCode = !strict
      ? 0
      : result.corpusTree !== 'main'
        ? 2
        // F-2333-1: the detachment half. 2 = "could not answer", the same act as the tree
        // check above. Tested by VALUE and not by `!== 'on-branch'`, because 'no-git' is a
        // LAWFUL fixture root that must keep exiting on its counts (F-1460-1).
        : result.headState === 'detached' || result.headState === 'unverifiable'
          ? 2
        : result.counts.CANDIDATES || !result.reviewsOk
          ? 1
          : 0;
  } catch (error) {
    // F-2214-1: F-2213-1's `--strict` refusal lives INSIDE the try above, so ANY throw skipped it
    // and this line forced exitCode 0 -- byte-identical to a genuinely clean board, with stdout
    // EMPTY. That is F-2208-1's defect one file over, and it defeated the cure landed one arm
    // over a fire earlier. The triggers are mundane, not exotic: a mid-splice or malformed
    // `tasks/goals.json` (fires splice it every drain), a `--root` one directory off, or a master
    // renamed between readdirSync and readFileSync by a concurrent drain.
    //
    // The advisory DEFAULT is deliberately preserved -- a drain must never be blocked by this
    // tool's own absence, which is what the retired comment here protected and what an
    // over-general cure (rethrow, or refuse on every catch) would break. What changes is only
    // `--strict`, which now separates "could not answer" (2) from "answered, and the answer
    // refuses" (1) -- the house convention already carried by drain-block-check and
    // dry-board-probe, so the corpus supplied this pattern rather than inventing one.
    //
    // The banner is printed to STDOUT as well as stderr: per F-2211-1 a caller classifying by
    // stdout would otherwise read an empty string from a crashed run and bucket it as silence.
    console.log(
      '\n⛔ CANNOT VERIFY — DO NOT QUEUE off this run. The classifier crashed before it finished\n' +
        `   reading the board (${error.message}). No master above, if any printed at all, carries\n` +
        '   a verdict. Re-run once the cause is fixed before treating anything here as queueable.',
    );
    console.error(`master-shipped-classifier: ${error.message}`);
    process.exitCode = process.argv.includes('--strict') ? 2 : 0;
  }
}
