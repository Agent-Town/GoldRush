#!/usr/bin/env node
// check-paths.mjs: every path the launch-video documents name must exist.
// Usage (from anywhere): node artifacts/launch-video-vibe-check-1/check-paths.mjs [extra.md ...]
// Scans backticked tokens in the three deliverables (plus any extra files given) and checks the
// ones that look like paths: repo-relative (artifacts/, reviews/, lore/, docs/, ...), absolute
// (/Users/...), home-relative (~/...), and the documents' `store:` shorthand for the art store.
// A `:NN` or `:NN-MM` line suffix is stripped. A `*` inside a segment is matched against the
// directory listing, and every segment must match its directory entry in exact case. Phase-2 outputs under ~/.goldrush/launch-video/ are reported PLANNED.
// Prints every miss and exits 1 when there is at least one.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const STORE = '/Users/robin/Claude/Projects/GoldRush-assets/raw';
const HOME = os.homedir();
const PLANNED = [path.join(HOME, '.goldrush', 'launch-video')];
const DOCS = [
  'docs/marketing/launch-video/vibe-check-2026-09-25.md',
  'docs/marketing/launch-video/treatment.md',
  'docs/marketing/launch-video/mood-board.md',
];
const ROOT_DIRS = ['artifacts', 'reviews', 'lore', 'docs', 'specs', 'src', 'assets', 'marketing', 'site', 'e2e', 'tasks', 'scripts', 'public', 'bench'];
const ROOT_FILES = ['index.html', 'AGENTS.md', 'CLAUDE.md', 'STATUS.md', 'package.json'];

function resolveToken(raw) {
  let token = raw.trim().replace(/[),.;]+$/, '');
  if (!token || /^https?:\/\//.test(token) || token.includes('<') || token.includes('>')) return null;
  let absolute = null;
  if (token.startsWith('store:')) absolute = path.join(STORE, token.slice('store:'.length));
  else if (token.startsWith('~/')) absolute = path.join(HOME, token.slice(2));
  else if (token.startsWith('/Users/')) absolute = token;
  else {
    const first = token.split('/')[0];
    const isRootDir = ROOT_DIRS.includes(first) && token.includes('/');
    const isRootFile = ROOT_FILES.includes(token.replace(/:\d+(-\d+)?$/, ''));
    if (!isRootDir && !isRootFile) return null;
    absolute = path.join(REPO, token);
  }
  absolute = absolute.replace(/:\d+(-\d+)?$/, '').replace(/\/$/, '');
  return { token, absolute };
}

// Exact-case walk: macOS resolves paths case-insensitively, so existsSync alone would pass a
// wrongly-cased path that breaks on Linux. Each segment must match a directory entry exactly.
function exactExists(absolute) {
  const parts = absolute.split('/').filter(Boolean);
  let dir = '/';
  for (const part of parts) {
    let entries;
    try { entries = fs.readdirSync(dir); } catch { return false; }
    if (!entries.includes(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}

function globExists(absolute) {
  if (!absolute.includes('*')) return exactExists(absolute);
  const parts = absolute.split('/').filter(Boolean);
  let frontier = ['/'];
  for (const part of parts) {
    const next = [];
    for (const dir of frontier) {
      if (!part.includes('*')) {
        const candidate = path.join(dir, part);
        if (fs.existsSync(candidate)) next.push(candidate);
        continue;
      }
      const pattern = new RegExp('^' + part.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
      let entries = [];
      try { entries = fs.readdirSync(dir); } catch { entries = []; }
      for (const entry of entries) if (pattern.test(entry)) next.push(path.join(dir, entry));
    }
    frontier = next;
    if (frontier.length === 0) return false;
  }
  return frontier.length > 0;
}

const files = [...DOCS, ...process.argv.slice(2)];
let checked = 0;
let planned = 0;
const misses = [];
const seen = new Set();
for (const rel of files) {
  const file = path.isAbsolute(rel) ? rel : path.join(REPO, rel);
  if (!fs.existsSync(file)) { misses.push({ file: rel, token: '(the document itself)', absolute: file }); continue; }
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/`([^`\n]+)`/g)) {
    const resolved = resolveToken(match[1]);
    if (!resolved) continue;
    const key = `${rel}::${resolved.absolute}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (PLANNED.some((dir) => resolved.absolute.startsWith(dir))) { planned += 1; console.log(`PLANNED ${rel}: ${resolved.token}`); continue; }
    checked += 1;
    if (!globExists(resolved.absolute)) misses.push({ file: rel, token: resolved.token, absolute: resolved.absolute });
  }
}
for (const miss of misses) console.log(`MISS ${miss.file}: ${miss.token} -> ${miss.absolute}`);
console.log(`checked ${checked} path mention(s) across ${files.length} file(s); ${planned} planned phase-2 output(s); ${misses.length} miss(es)`);
process.exit(misses.length ? 1 : 0);
