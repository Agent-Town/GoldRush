#!/usr/bin/env node
/**
 * Advisory audit for evidence paths cited by reviews.
 *
 * Default: node scripts/review-evidence-audit.mjs reviews/<slice>.md [...]
 * Sweep:   node scripts/review-evidence-audit.mjs --all
 * Gate:    add --strict to exit 1 only for ON-DISK-UNTRACKED evidence.
 *
 * EXIT CODES (F-2215-1, s2215)
 *   0  advisory mode, always; or --strict with nothing ON-DISK-UNTRACKED
 *   1  --strict, and the audit RAN and found ON-DISK-UNTRACKED evidence
 *   2  --strict, and the audit COULD NOT RUN at all
 * 1 and 2 are different questions and must never share a code: "the answer
 * refuses" is not "there was no answer". A crash also prints ⛔ CANNOT VERIFY
 * to STDOUT, because the caller in .claude/skills/drain/SKILL.md §4 acts on
 * stdout and an empty stdout would read as "no untracked evidence cited".
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BACKTICKED = /`([^`\n]*)`/g;
const CITATION = /^(?:artifacts|reviews\/shots-)\S*$/;
const PLACEHOLDER = /[{}<>*?|…]|\.\./;

function argumentsFor(argv) {
  const files = [];
  let root = DEFAULT_ROOT;
  let all = false;
  let strict = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--root') root = path.resolve(argv[++i] || '');
    else if (arg === '--all') all = true;
    else if (arg === '--strict') strict = true;
    else if (arg.startsWith('--')) throw new Error(`unknown option: ${arg}`);
    else files.push(arg);
  }
  if (all && files.length) throw new Error('--all cannot be combined with review paths');
  return { root, all, strict, files };
}

function trackedPaths(root) {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 })
    .split('\0')
    .filter(Boolean);
}

function trackedDirectories(files) {
  const directories = new Set();
  for (const file of files) {
    let directory = path.posix.dirname(file);
    while (directory !== '.') {
      directories.add(directory);
      directory = path.posix.dirname(directory);
    }
  }
  return directories;
}

export function audit(root, reviewFiles, tracked = trackedPaths(root)) {
  const trackedFiles = new Set(tracked);
  const directories = trackedDirectories(tracked);
  const buckets = { TRACKED: [], 'ON-DISK-UNTRACKED': [], ABSENT: [], SKIPPED: [] };
  let citations = 0;

  for (const review of reviewFiles) {
    const text = fs.readFileSync(path.resolve(root, review), 'utf8');
    for (const match of text.matchAll(BACKTICKED)) {
      if (!CITATION.test(match[1])) continue;
      citations += 1;
      const cited = match[1];
      if (PLACEHOLDER.test(cited)) {
        buckets.SKIPPED.push({ cited, review });
        continue;
      }
      const resolved = cited.replace(/\/$/, '').replace(/:\d+$/, '');
      const item = { cited, resolved, review };
      if (trackedFiles.has(resolved) || directories.has(resolved)) buckets.TRACKED.push(item);
      else if (fs.existsSync(path.resolve(root, resolved))) buckets['ON-DISK-UNTRACKED'].push(item);
      else buckets.ABSENT.push(item);
    }
  }
  return { paths: reviewFiles.length, citations, buckets };
}

export function summary(result) {
  const count = (bucket) => result.buckets[bucket].length;
  return `paths=${result.paths} citations=${result.citations} TRACKED=${count('TRACKED')} ON-DISK-UNTRACKED=${count('ON-DISK-UNTRACKED')} ABSENT=${count('ABSENT')} SKIPPED=${count('SKIPPED')}`;
}

function print(result) {
  for (const bucket of ['ON-DISK-UNTRACKED', 'ABSENT']) {
    for (const item of result.buckets[bucket]) console.log(`${bucket}\t${item.cited}\t${item.review}`);
  }
  const disease = result.buckets['ON-DISK-UNTRACKED'].length;
  console.log(`${disease ? 'WARN' : 'PASS'} — ${disease ? 'review cites evidence present only on disk' : 'no on-disk-untracked evidence cited'}`);
  console.log(summary(result));
}

function main() {
  // F-2215-1 (s2215): parsed OUTSIDE the try, because argumentsFor() itself throws
  // and a crash must still know whether the caller asked for an exit code.
  // includes() cannot throw; that is the whole point of not reusing args.strict here.
  const strict = process.argv.slice(2).includes('--strict');
  try {
    const args = argumentsFor(process.argv.slice(2));
    const tracked = trackedPaths(args.root);
    const reviews = args.all
      ? tracked.filter((file) => file.startsWith('reviews/') && file.endsWith('.md'))
      : args.files;
    if (!reviews.length) throw new Error('provide one or more review paths, or --all');
    const result = audit(args.root, reviews, tracked);
    print(result);
    if (args.strict && result.buckets['ON-DISK-UNTRACKED'].length) process.exitCode = 1;
  } catch (error) {
    // F-2215-1: this catch used to print "REFUSING" to stderr and set NO exit code,
    // so a crash exited 0 with EMPTY stdout — byte-identical, on both channels the
    // caller reads, to "audited fine, nothing untracked". Measured s2215 across four
    // arms (absent review path, --root one directory off, unknown option, advisory
    // mode): every one rc=0 against a clean control also rc=0.
    //
    // The banner goes to STDOUT as well as stderr because the LAW-side caller reads
    // stdout: .claude/skills/drain/SKILL.md §4 tells every drain to run this on the
    // review it is about to commit and to `git add -f` each ON-DISK-UNTRACKED path.
    // An empty stdout there reads as "no untracked evidence" — the exact inversion of
    // this tool's purpose, and a Retention Law hole (cited evidence that dies with the
    // disk). Per F-2211-1, an stdout-classifying caller reads an empty string as silence.
    //
    // The ADVISORY default still exits 0, deliberately: an advisory reader must never
    // block a drain by its own absence (the drain-block-check UNKNOWN precedent, and
    // the intent gate-caller-baseline.json records for this file). Only --strict gains
    // a code, and it separates 2 = "could not answer" from 1 = "answered, and the
    // answer refuses" — the convention drain-block-check, dry-board-probe and
    // master-shipped-classifier already carry.
    console.log(`⛔ CANNOT VERIFY — the audit did not run: ${error.message}`);
    console.log('   Do NOT read this as "no untracked evidence cited".');
    console.error(`review-evidence-audit: REFUSING — ${error.message}`);
    if (strict) process.exitCode = 2;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
