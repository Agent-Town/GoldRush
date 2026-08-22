#!/usr/bin/env node
// Advisory evidence probe for task-master shipped-ness (F-1568-1/F-1569-1).

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SHIPPED = new Set(['merged', 'shipped']);
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
  const goalsPath = path.join(tasksDir, 'goals.json');
  const goals = fs.existsSync(goalsPath) ? goalLeaves(JSON.parse(fs.readFileSync(goalsPath, 'utf8'))) : [];

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
    process.exitCode =
      process.argv.includes('--strict') && (result.counts.CANDIDATES || !result.reviewsOk) ? 1 : 0;
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
