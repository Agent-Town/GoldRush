#!/usr/bin/env node
// evidence-offload — move CITED-ONLY evidence out of the public tree into the private archive
// repository, behind an index with small previews.
//
// OWNER RULING 2026-09-24, item 14, option (a), verbatim: "Evidence goes to the existing archive
// repository with an index and small previews in the tree, plus a size budget per landing." The
// premise, from the same document: "7.4 GB of the 8.4 GB tracked tree is evidence (screenshots,
// transcripts), growing about 1 GB a day during art campaigns; GitHub reports about 10 GB."
//
// THE RETENTION LAW IS SATISFIED, NOT BENT (CLAUDE.md §4.10b, owner 2026-07-25: "We have to stop
// the pruning, our history is our strength"). Nothing is deleted: every moved byte is committed to
// a git repository the owner owns BEFORE it leaves this one, the move is verified against that
// commit path by path and size by size, and the index records where each file went with its
// sha256. The public tree keeps a pointer, a preview and every `report.md`.
//
// THE TWO INSTRUMENTS THIS WOULD BREAK IF DONE CARELESSLY (reader map §A5, measured):
//   `review-evidence-audit.mjs` - moving files out of git but leaving them on disk flips 911
//   citations to ON-DISK-UNTRACKED and `--strict` reds on EVERY drain. Moving them out of both
//   without an index flips them to ABSENT and the instrument goes blind. So this tool removes each
//   file from the index AND the disk in ONE commit, together with the index that explains it.
//   `modified-tracked-evidence-census.mjs` - reads a moved file as AT RISK unless it can see the
//   archive. It learns `SAFE (archive <commit>)` from the same index.
//
// THE HASH AND THE DEPLOY CANNOT MOVE. `ENGINE_SOURCE_INPUTS` in `assay-replay-agent.mjs` and
// `deploy.sh`'s MIRROR_FILTERS carry no `artifacts/` path (reader map §A5), so no era pin and no
// re-assay follows from an offload. Verified before this tool was written, not assumed.
//
// USAGE
//   node scripts/evidence-offload.mjs --plan [--limit 40] [--json]
//   node scripts/evidence-offload.mjs --apply <subtree>… --archive-worktree <path> [--drain-authorized]
//
// `--apply` NEVER PUSHES and never fetches on its own when given a prepared worktree: the drain
// pushes, once, after it has read the index it is about to commit. It also REFUSES to run against
// the real `archive` remote unless `--drain-authorized` is passed, so the branch that ships this
// tool can only ever exercise it against a fixture remote in a temp directory.
//
// EXIT CODES: 0 did what was asked · 1 REFUSED for a stated reason · 2 could not run at all.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isEvidenceCitation } from './review-evidence-audit.mjs';
import { ARCHIVE_INDEX_PATH, deriveMustStay, mustStayPredicate, readArchiveIndex, subtreeRootOf } from './evidence-readers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = resolve(HERE, '..');
// One implementation of the word: the path and the reader live in `evidence-readers.mjs`, because
// the two audits need them and must never import this mover to ask where a file went.
export const INDEX_PATH = ARCHIVE_INDEX_PATH;
export const ARCHIVE_BRANCH = 'evidence';
export const ARCHIVE_PREFIX = 'evidence';
export const POINTER_NAME = 'ARCHIVED.md';
export const PREVIEW_NAME = 'PREVIEW.png';

// GitHub refuses a push over 2 GB and any blob over 100 MB (attended memory `repo-rewrite-a3-lessons`,
// quoted in `docs/HANDOVER-2026-09-06-attended.md`, paid for during the A3 repo rewrite). 1.5 GB and
// 95 MB leave the margin those two numbers demand: a slice is measured on SOURCE bytes and git's own
// packing, delta and index overhead sit on top of it.
export const SLICE_BYTES = 1_500_000_000;
export const MAX_BLOB_BYTES = 95_000_000;
export const PREVIEW_LONGEST_SIDE = 320;

const BACKTICKED = /`([^`\n]*)`/g;
const mb = (b) => `${(b / 1e6).toFixed(1)} MB`;

class Refusal extends Error {}
const refuse = (message) => { throw new Refusal(message); };

function git(args, options = {}) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 30, ...options });
}

/** Tracked path -> blob bytes, for everything under artifacts/. */
export function trackedArtifactSizes(root) {
  const sizes = new Map();
  const out = git(['ls-tree', '-r', '-l', 'HEAD', '--', 'artifacts'], { cwd: root });
  for (const line of out.split('\n')) {
    const m = line.match(/^\d+ blob [0-9a-f]+\s+(\d+|-)\t(.*)$/);
    if (m) sizes.set(m[2], m[1] === '-' ? 0 : Number(m[1]));
  }
  return sizes;
}

/** Which reviews cite which evidence subtree. The citation vocabulary is imported, never re-typed (F-1261-1). */
export function citationsBySubtree(root, sizes) {
  const reviews = git(['ls-files', '-z', '--', 'reviews'], { cwd: root })
    .split('\0')
    .filter((f) => f.endsWith('.md'));
  const bySubtree = new Map();
  for (const review of reviews) {
    let text;
    try {
      text = readFileSync(resolve(root, review), 'utf8');
    } catch {
      continue;
    }
    for (const match of text.matchAll(BACKTICKED)) {
      const span = match[1];
      if (!isEvidenceCitation(span) || !span.startsWith('artifacts/')) continue;
      const cited = span.replace(/\/$/, '').replace(/:\d+$/, '');
      const subtree = subtreeRootOf(cited);
      if (!subtree.startsWith('artifacts/') || subtree === 'artifacts') continue;
      const entry = bySubtree.get(subtree) ?? { citations: 0, reviews: new Set() };
      entry.citations += 1;
      entry.reviews.add(review);
      bySubtree.set(subtree, entry);
    }
  }
  // Keep subtrees that exist; a citation to something already gone is `review-evidence-audit`'s question.
  for (const key of [...bySubtree.keys()]) {
    if (![...sizes.keys()].some((f) => f === key || f.startsWith(`${key}/`))) bySubtree.delete(key);
  }
  return bySubtree;
}

/**
 * The plan: every movable subtree, largest first, with what it costs and who cites it.
 *
 * A CANDIDATE is a top-level subtree (namespace-aware, so `sol/…` counts one segment deeper) that
 * `mustStay()` does not name, carrying at least one movable file. Its KEEP list is the must-stay
 * files inside it, tested FILE BY FILE - that is how `sol/map-art-campaign-2` can move while its 16
 * per-map `capture-config.json` readers under `run-6`, its two `run-8/phone-hud` fixtures and its
 * `report.md` stay exactly where the code and the drain law expect them.
 */
export function plan(root = DEFAULT_ROOT) {
  const derivation = deriveMustStay(root);
  const stays = mustStayPredicate(derivation);
  const sizes = trackedArtifactSizes(root);
  const citations = citationsBySubtree(root, sizes);
  const subtrees = new Map();

  for (const [path, bytes] of sizes) {
    const subtree = subtreeRootOf(path);
    const entry = subtrees.get(subtree) ?? {
      subtree, movable: [], movableBytes: 0, keep: [], keepBytes: 0, oversize: [],
    };
    if (stays(path)) {
      entry.keep.push(path);
      entry.keepBytes += bytes;
    } else if (bytes > MAX_BLOB_BYTES) {
      // Left in place and LISTED rather than silently skipped: a 95 MB+ blob is a separate owner
      // question (git-lfs, or a re-render), and a tool that quietly drops the biggest files would
      // report a plan it cannot execute.
      entry.oversize.push({ path, bytes });
      entry.keepBytes += bytes;
    } else {
      entry.movable.push(path);
      entry.movableBytes += bytes;
    }
    subtrees.set(subtree, entry);
  }

  const candidates = [...subtrees.values()]
    .filter((e) => e.movable.length && !stays(e.subtree))
    .map((e) => ({
      ...e,
      citations: citations.get(e.subtree)?.citations ?? 0,
      citingReviews: [...(citations.get(e.subtree)?.reviews ?? [])].sort(),
    }))
    .sort((a, b) => b.movableBytes - a.movableBytes);

  const mustStayTotals = [...subtrees.values()].reduce(
    (a, e) => ({ files: a.files + e.keep.length, bytes: a.bytes + e.keepBytes }),
    { files: 0, bytes: 0 },
  );

  return {
    root,
    derivation,
    stays,
    sizes,
    candidates,
    totals: {
      trackedFiles: sizes.size,
      trackedBytes: [...sizes.values()].reduce((a, b) => a + b, 0),
      movableFiles: candidates.reduce((a, c) => a + c.movable.length, 0),
      movableBytes: candidates.reduce((a, c) => a + c.movableBytes, 0),
      mustStayFiles: mustStayTotals.files,
      mustStayBytes: mustStayTotals.bytes,
      oversize: candidates.flatMap((c) => c.oversize),
      subtreesTotal: subtrees.size,
      subtreesMovable: candidates.length,
    },
  };
}

/** Greedy packing in path order, so one run's files land in one archive commit wherever they fit. */
export function sliceFiles(files, sizes, sliceBytes = SLICE_BYTES) {
  const slices = [];
  let current = { files: [], bytes: 0 };
  for (const file of files) {
    const bytes = sizes.get(file) ?? 0;
    if (current.files.length && current.bytes + bytes > sliceBytes) {
      slices.push(current);
      current = { files: [], bytes: 0 };
    }
    current.files.push(file);
    current.bytes += bytes;
  }
  if (current.files.length) slices.push(current);
  return slices;
}

function previewSourceFor(files) {
  const pngs = files.filter((f) => f.toLowerCase().endsWith('.png'));
  if (!pngs.length) return null;
  const rank = (f) => (/board/i.test(f) ? 0 : /(shot|screenshot|capture)/i.test(f) ? 1 : 2);
  return pngs.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))[0];
}

/** One small preview per moved subtree. A failure here is REPORTED, never fatal: no preview is lawful ("else none"). */
async function makePreview(root, source, destination) {
  try {
    const { default: sharp } = await import('sharp');
    mkdirSync(dirname(resolve(root, destination)), { recursive: true });
    await sharp(resolve(root, source))
      .resize({ width: PREVIEW_LONGEST_SIDE, height: PREVIEW_LONGEST_SIDE, fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toFile(resolve(root, destination));
    return { made: true, from: source, bytes: statSync(resolve(root, destination)).size };
  } catch (error) {
    return { made: false, from: source, reason: error.message };
  }
}

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function emptyIndex() {
  return {
    version: 1,
    note: 'Written by scripts/evidence-offload.mjs --apply. Cited-only evidence lives in the private archive repository; every path here is recoverable from the commit named beside it. Nothing was deleted (CLAUDE.md 4.10b).',
    archive: { remote: 'archive', branch: ARCHIVE_BRANCH, prefix: ARCHIVE_PREFIX },
    subtrees: {},
    files: {},
  };
}

/**
 * Prepare (or adopt) the archive worktree. A PREPARED worktree is what the fixture and the drain
 * both pass, because it separates the one networked act - fetching the archive branch - from the
 * move itself, and lets the dirty-worktree refusal be exercised without a network at all.
 */
function archiveWorktree(argv, root) {
  const flag = argv.indexOf('--archive-worktree');
  if (flag === -1) refuse('--apply needs --archive-worktree <path>: a prepared clone of the archive remote on branch '
    + `${ARCHIVE_BRANCH}. This tool does not fetch or push; the drain does, once, around it.`);
  const work = resolve(argv[flag + 1] ?? '');
  if (!existsSync(join(work, '.git'))) refuse(`${work} is not a git worktree`);

  // THE REAL REMOTE IS OFF LIMITS WITHOUT THE DRAIN SAYING SO. The lookup is the same one
  // `scripts/fire-memory-mirror.mjs` already uses (`GR_ARCHIVE_REMOTE` then `git remote get-url
  // archive`), so there is one implementation of "where the archive is". The URL is NEVER printed.
  let real = null;
  try {
    real = git(['remote', 'get-url', 'archive'], { cwd: root, stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch { /* no archive remote configured here: nothing to protect against */ }
  let configured = null;
  try {
    configured = git(['remote', 'get-url', 'origin'], { cwd: work, stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch { /* a worktree with no origin can only be a fixture */ }
  const isReal = Boolean(real) && (configured === real || process.env.GR_ARCHIVE_REMOTE === real);
  if (isReal && !argv.includes('--drain-authorized')) {
    refuse('this worktree points at the REAL archive remote. Only the attended drain runs the first offload '
      + '(task evidence-offload-1, gate-side hold): re-run with --drain-authorized, from fresh main, with the '
      + 'fires held. The branch that ships this tool exercises it against a fixture remote only.');
  }

  const dirty = git(['status', '--porcelain'], { cwd: work }).trim();
  if (dirty) {
    refuse(`the archive worktree is dirty (${dirty.split('\n').length} path(s)); commit or clean it first. `
      + 'A half-written archive commit is the one state from which a move cannot be verified.');
  }
  return { work, isReal: isReal ? 'the archive remote' : 'a fixture remote' };
}

async function apply(argv, root) {
  const requested = argv.filter((a) => !a.startsWith('--') && a.startsWith('artifacts/')).map((a) => a.replace(/\/+$/, ''));
  if (!requested.length) refuse('--apply needs at least one subtree under artifacts/');
  const { work, isReal } = archiveWorktree(argv, root);
  const sliceBytes = Number(argv[argv.indexOf('--slice-bytes') + 1]) || SLICE_BYTES;
  const maxBlob = Number(argv[argv.indexOf('--max-blob') + 1]) || MAX_BLOB_BYTES;
  const board = plan(root);
  const today = new Date().toISOString().slice(0, 10);
  const index = readArchiveIndex(root) ?? emptyIndex();
  const staged = [];
  const summary = [];

  console.log(`evidence-offload --apply against ${isReal}, branch ${ARCHIVE_BRANCH}`);
  console.log(`  slice ceiling ${mb(sliceBytes)} · blob ceiling ${mb(maxBlob)} · worktree ${work}`);

  for (const subtree of requested) {
    if (board.stays(subtree)) {
      refuse(`${subtree} is MUST-STAY: a reader, a write target or a law names it (node scripts/evidence-readers.mjs). `
        + 'Refusing rather than moving it, because the cost of the two readings is not symmetric.');
    }
    // ANY tracked directory under artifacts/, not only a top-level `--plan` candidate. The 5.9 GB
    // campaign cannot land in one call: GitHub refuses a push over 2 GB, so the drain must apply
    // `…/run-3`, push, apply `…/run-4`, push. Requiring a top-level candidate here would have made
    // the slicing the whole task asks for impossible to execute, and the only safety the candidate
    // list provided - mustStay - is asserted above, file by file, and again below.
    const prefix = `${subtree}/`;
    const under = [...board.sizes.keys()].filter((f) => f === subtree || f.startsWith(prefix));
    if (!under.length) refuse(`${subtree} has no tracked file under it on this tree`);
    const keep = under.filter(board.stays);
    const candidateMovable = under.filter((f) => !board.stays(f));
    if (!candidateMovable.length) {
      refuse(`${subtree} has no movable file: all ${under.length} tracked file(s) under it must stay`);
    }

    const modified = git(['status', '--porcelain', '-uno', '--', subtree], { cwd: root }).trim();
    if (modified) {
      refuse(`${subtree} has ${modified.split('\n').length} modified tracked file(s). A modified evidence file is a `
        + 'different question (modified-tracked-evidence-census.mjs); commit or restore it before moving the subtree.');
    }

    const movable = candidateMovable.filter((f) => (board.sizes.get(f) ?? 0) <= maxBlob);
    const oversize = candidateMovable.filter((f) => (board.sizes.get(f) ?? 0) > maxBlob);
    if (!movable.length) {
      refuse(`${subtree}: every movable file is over the ${mb(maxBlob)} blob ceiling. They stay, and they are an `
        + `owner question (git-lfs, or a re-render): ${oversize.join(' ')}`);
    }
    const slices = sliceFiles(movable, board.sizes, sliceBytes);
    console.log('');
    console.log(`  ${subtree}: ${movable.length} movable file(s) ${mb(movable.reduce((a, f) => a + (board.sizes.get(f) ?? 0), 0))} `
      + `· ${keep.length} kept · ${oversize.length} oversize left in place · ${slices.length} slice(s)`);

    const commits = [];
    for (const [i, slice] of slices.entries()) {
      const paths = [];
      for (const file of slice.files) {
        const destination = join(work, ARCHIVE_PREFIX, file);
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(resolve(root, file), destination);
        index.files[file] = { archiveCommit: null, sha256: sha256(resolve(root, file)), bytes: board.sizes.get(file) ?? 0, movedDate: today };
        paths.push(`${ARCHIVE_PREFIX}/${file}`);
      }
      git(['add', '--pathspec-from-file=-', '--pathspec-file-nul', '--'], { cwd: work, input: `${paths.join('\0')}\0` });
      git(['-c', 'user.name=Gold Rush factory', '-c', 'user.email=factory@agenttown.app', 'commit', '-q',
        '-m', `evidence: ${subtree} slice ${i + 1}/${slices.length} (${slice.files.length} file(s), ${mb(slice.bytes)})`], { cwd: work });
      const commit = git(['rev-parse', 'HEAD'], { cwd: work }).trim();

      // VERIFY BEFORE REMOVING. Every path must be in that commit at the same byte size, asked of
      // git in one batch. A move whose destination was not checked is a deletion with a good story.
      const probe = git(['cat-file', '--batch-check'], { cwd: work, input: `${paths.map((p) => `${commit}:${p}`).join('\n')}\n` });
      const lines = probe.split('\n').filter(Boolean);
      if (lines.length !== paths.length) refuse(`archive commit ${commit} answered for ${lines.length} of ${paths.length} path(s)`);
      lines.forEach((line, n) => {
        const size = Number(line.trim().split(/\s+/).pop());
        const expected = board.sizes.get(slice.files[n]) ?? 0;
        if (line.includes('missing')) refuse(`${paths[n]} is MISSING from archive commit ${commit}`);
        if (size !== expected) refuse(`${paths[n]} is ${size} B in the archive and ${expected} B here`);
      });
      for (const file of slice.files) index.files[file].archiveCommit = commit;
      commits.push({ commit, files: slice.files.length, bytes: slice.bytes });
      console.log(`    slice ${i + 1}/${slices.length}  ${commit.slice(0, 12)}  ${slice.files.length} file(s) ${mb(slice.bytes)}  VERIFIED in the archive commit`);
    }

    const previewSource = previewSourceFor(movable);
    const previewPath = `${subtree}/${PREVIEW_NAME}`;
    const preview = previewSource ? await makePreview(root, previewSource, previewPath) : { made: false, reason: 'no PNG under the subtree' };
    const pointer = `${subtree}/${POINTER_NAME}`;
    index.subtrees[subtree] = {
      archiveCommits: commits.map((c) => c.commit),
      files: movable.length,
      bytes: commits.reduce((a, c) => a + c.bytes, 0),
      movedDate: today,
      previews: preview.made ? [previewPath] : [],
      kept: keep,
      oversizeLeftInPlace: oversize,
    };

    writeFileSync(resolve(root, pointer),
      `# ARCHIVED\n\n\`${subtree}\` moved to the private \`archive\` remote, branch \`${ARCHIVE_BRANCH}\`, under `
      + `\`${ARCHIVE_PREFIX}/${subtree}/\` at commit ${commits.map((c) => c.commit).join(', ')} on ${today}: `
      + `${movable.length} file(s), ${mb(commits.reduce((a, c) => a + c.bytes, 0))}. Nothing was deleted (CLAUDE.md `
      + `4.10b); the per-file sha256 and commit are in \`${INDEX_PATH}\`.\n`);

    // Out of the index AND off the disk, in the SAME commit as the index that explains it: the one
    // sequence in which `review-evidence-audit.mjs --strict` never sees ON-DISK-UNTRACKED and never
    // goes blind (reader map §A5). Path-scoped, from a file, because a 10,000-path argv is ARG_MAX.
    git(['rm', '-q', '--pathspec-from-file=-', '--pathspec-file-nul', '--'], { cwd: root, input: `${movable.join('\0')}\0` });
    // `git rm` already STAGED each removal; re-adding those paths would fail on a pathspec that no
    // longer exists. Only the new files need an add.
    staged.push(pointer);
    if (preview.made) staged.push(previewPath);
    summary.push({ subtree, commits, moved: movable.length, bytes: index.subtrees[subtree].bytes, preview, oversize });
    console.log(`    pointer ${pointer}` + (preview.made ? ` · preview ${previewPath} from ${preview.from}` : ` · NO preview (${preview.reason})`));
  }

  writeFileSync(resolve(root, INDEX_PATH), `${JSON.stringify(index, null, 1)}\n`);
  const addPaths = [INDEX_PATH, ...staged];
  git(['add', '--pathspec-from-file=-', '--pathspec-file-nul', '--'], { cwd: root, input: `${addPaths.join('\0')}\0` });
  if (!argv.includes('--no-commit')) {
    const moved = summary.reduce((a, s) => a + s.moved, 0);
    const bytes = summary.reduce((a, s) => a + s.bytes, 0);
    git(['commit', '-q', '-m',
      `chore: offload ${summary.length} evidence subtree(s) to the archive (${moved} file(s), ${mb(bytes)})\n\n`
      + `${summary.map((s) => `${s.subtree} -> ${s.commits.map((c) => c.commit.slice(0, 12)).join(' ')}`).join('\n')}\n`],
      { cwd: root });
    console.log('');
    console.log(`  repo commit ${git(['rev-parse', 'HEAD'], { cwd: root }).trim()} — files gone from git AND disk, index and pointers in the same commit`);
  }
  console.log(`  NEXT (the drain, never this tool): git -C ${work} push origin ${ARCHIVE_BRANCH}:${ARCHIVE_BRANCH}  then  git push origin main`);
  return { summary, index, addPaths };
}

function printPlan(board, limit) {
  const t = board.totals;
  console.log('evidence-offload --plan — cited-only evidence that may move behind an index');
  console.log(`  tracked under artifacts/ : ${t.trackedFiles} file(s) ${mb(t.trackedBytes)} across ${t.subtreesTotal} subtree(s)`);
  console.log(`  MUST STAY                : ${t.mustStayFiles} file(s) ${mb(t.mustStayBytes)} (derived: node scripts/evidence-readers.mjs)`);
  console.log(`  MOVABLE                  : ${t.movableFiles} file(s) ${mb(t.movableBytes)} across ${t.subtreesMovable} subtree(s)`);
  console.log(`  oversize left in place   : ${t.oversize.length} blob(s) over ${mb(MAX_BLOB_BYTES)}`);
  for (const o of t.oversize) console.log(`      ${mb(o.bytes).padStart(10)}  ${o.path}`);
  console.log('');
  console.log('  candidates, largest first (movable bytes · files · kept · citations · reviews citing):');
  for (const c of board.candidates.slice(0, limit)) {
    console.log(`    ${mb(c.movableBytes).padStart(10)} ${String(c.movable.length).padStart(6)} file(s) `
      + `keep ${String(c.keep.length).padStart(3)} · ${String(c.citations).padStart(4)} citation(s) in ${String(c.citingReviews.length).padStart(3)} review(s)  ${c.subtree}`);
  }
  const rest = board.candidates.slice(limit);
  if (rest.length) {
    console.log(`    … and ${rest.length} more subtree(s): ${mb(rest.reduce((a, c) => a + c.movableBytes, 0))} `
      + `across ${rest.reduce((a, c) => a + c.movable.length, 0)} file(s) (the long tail)`);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const rootFlag = argv.indexOf('--root');
  const root = rootFlag === -1 ? DEFAULT_ROOT : resolve(argv[rootFlag + 1] ?? '');
  try {
    if (argv.includes('--apply')) {
      await apply(argv, root);
      return;
    }
    if (!argv.includes('--plan')) refuse('say --plan or --apply <subtree>…');
    const board = plan(root);
    if (argv.includes('--json')) {
      process.stdout.write(`${JSON.stringify({
        totals: board.totals,
        candidates: board.candidates.map((c) => ({
          subtree: c.subtree, movableFiles: c.movable.length, movableBytes: c.movableBytes,
          keep: c.keep, keepBytes: c.keepBytes, oversize: c.oversize,
          citations: c.citations, citingReviews: c.citingReviews,
        })),
      }, null, 1)}\n`);
      return;
    }
    const limitFlag = argv.indexOf('--limit');
    printPlan(board, limitFlag === -1 ? 20 : Number(argv[limitFlag + 1]) || 20);
  } catch (error) {
    if (error instanceof Refusal) {
      console.log(`⛔ REFUSING — ${error.message}`);
      console.error(`evidence-offload: REFUSING — ${error.message}`);
      process.exit(1);
    }
    console.log(`⛔ CANNOT VERIFY — evidence-offload did not run: ${error.message}`);
    console.error(`evidence-offload: ${error.stack}`);
    process.exit(2);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
