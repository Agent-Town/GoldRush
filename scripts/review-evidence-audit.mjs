#!/usr/bin/env node
/**
 * Advisory audit for evidence paths cited by reviews.
 *
 * Default: node scripts/review-evidence-audit.mjs reviews/<slice>.md [...]
 * Sweep:   node scripts/review-evidence-audit.mjs --all
 * Gate:    add --strict to exit 1 only for ON-DISK-UNTRACKED evidence.
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
    console.error(`review-evidence-audit: REFUSING — ${error.message}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
