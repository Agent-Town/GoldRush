#!/usr/bin/env node
// status-line1.mjs — the one supported way to rewrite STATUS.md line 1.
//
// WHY THIS EXISTS (s1049): STATUS.md is ~2.8MB, so line-1 rewrites are done
// programmatically. Every fire that needed one wrote its own throwaway wrapper
// (scripts/tmp-s1045-lock.mjs, tmp-s1046-lock.mjs, tmp-s1046-handoff.mjs, ...),
// which left untracked debris the Retention Law forbids deleting. This is the
// tracked, reusable replacement. Node is ungated for fires; env-prefixed and
// bash-script forms are not (F-1024-4 / F-1048-3), so keep it argv-only.
//
// USAGE
//   node scripts/status-line1.mjs set     <textfile>            # replace line 1
//   node scripts/status-line1.mjs handoff <textfile> <label>    # archive old line 1
//                                                               # as a bullet, then set
//   node scripts/status-line1.mjs show                          # print line 1
//
// <textfile> may contain newlines; they are collapsed to single spaces, because
// line 1 must stay exactly one line (the lock/staleness check reads head -1).
// <label> is the archive bullet's name, e.g. "s1048 handoff".
//
// CONVENTION (learned the hard way in s1049): `set` is for taking the lock and it
// does NOT archive — so the predecessor's handoff line is replaced and survives only
// in git. When you then write your handoff, the line you are archiving is your own
// lock line, not the predecessor's handoff. Label it for what it actually is
// ("sNNNN lock"), and if the predecessor's handoff never got archived, recover it
// with `git show <their-commit>:STATUS.md` rather than leaving a gap in the chain.
//
// The archive bullet is inserted at line 4 (0-based index 3), which is where
// every prior handoff has put it: line 1 = state, lines 2-3 = blank, then the
// newest-first archive bullets.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — the repo path contains a space ("Gold Rush")
// and .pathname hands back the percent-encoded form, which fs cannot open.
const STATUS = fileURLToPath(new URL('../STATUS.md', import.meta.url));
const ARCHIVE_INDEX = 3;

const [, , cmd, ...rest] = process.argv;

function readLines() {
  return readFileSync(STATUS, 'utf8').split('\n');
}

function oneLine(text) {
  const collapsed = text.replace(/\s*\n\s*/g, ' ').trim();
  if (!collapsed) throw new Error('refusing to write an empty line 1');
  return collapsed;
}

function write(lines) {
  writeFileSync(STATUS, lines.join('\n'), 'utf8');
}

try {
  if (cmd === 'show') {
    console.log(readLines()[0]);
  } else if (cmd === 'set') {
    const [file] = rest;
    if (!file) throw new Error('usage: set <textfile>');
    const lines = readLines();
    lines[0] = oneLine(readFileSync(file, 'utf8'));
    write(lines);
    console.log(`set line 1 (${lines[0].length} chars)`);
  } else if (cmd === 'handoff') {
    const [file, label] = rest;
    if (!file || !label) throw new Error('usage: handoff <textfile> <label>');
    const lines = readLines();
    const prev = lines[0];
    lines[0] = oneLine(readFileSync(file, 'utf8'));
    lines.splice(ARCHIVE_INDEX, 0, `- **${label} (line-1 archive):** ${prev}`);
    write(lines);
    console.log(`set line 1 (${lines[0].length} chars); archived previous as "${label}"`);
  } else {
    throw new Error('usage: status-line1.mjs set|handoff|show ...');
  }
} catch (err) {
  console.error(`status-line1: ${err.message}`);
  process.exit(1);
}
