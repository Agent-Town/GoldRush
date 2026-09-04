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
// THE STAMP COMES FROM `date`, NOT FROM THE CALLER (F-1039-2 / F-1204-5, closed here
// s1206). Write the literal token {STAMP} in <textfile> and it is substituted with
// `date "+%Y-%m-%dT%H:%MZ"` at write time. This closes a SIX-instance lineage of
// models hand-computing a time they could have run a command for, every one of them
// drifting into the FUTURE: s1038 +46 min, s1046 +56/+50, s1053 +14, s1204 +38 — the
// s1053 and s1204 instances written by fires that had just re-read the rule forbidding
// it. It is not cosmetic: protocol §1.1 makes the next fire EXIT SILENTLY while an
// ACTIVE lock is <45 min old, so one future-dated stamp left by a fire that then dies
// stalls the whole factory for the skew plus 45 minutes.
//
// s1205 proved the fix in a per-session copy (logs/session-scratch/s1205-status-line1.mjs)
// and asked the next fire to "adopt it or fold it into a permanent script". This is that
// fold — the per-session copies are what kept letting the defect back in.
//
// BELT AND BRACES: any full ISO stamp (YYYY-MM-DDTHH:MMZ) appearing anywhere in the new
// line 1 is checked against now, and a FUTURE one is REFUSED even if the caller never
// used {STAMP}. That is the actual failure mode, caught regardless of how it was written.
// Past stamps pass freely (handoff prose legitimately cites earlier times), and the
// short forms fires quote in prose ("claimed at 09:44:53") are not full ISO and do not
// match. Local time labelled Z, matching every recent fire — protocol §1.1 fixes the
// label on a flag day, never as a drive-by.
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
// Insert before the first archive bullet. Most STATUS files have two blank lines
// first, but one missing blank must not strand an older handoff above newer ones.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — the repo path contains a space ("Gold Rush")
// and .pathname hands back the percent-encoded form, which fs cannot open.
const STATUS = fileURLToPath(new URL('../STATUS.md', import.meta.url));
const ARCHIVE_INDEX = 3;

const [, , cmd, ...rest] = process.argv;

function readLines() {
  return readFileSync(STATUS, 'utf8').split('\n');
}

const ISO_MIN = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z/g;

// The one place a stamp may be born. Same command protocol §1.1 names.
function nowStamp() {
  const stamp = execFileSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/.test(stamp)) {
    throw new Error(`refusing to write a malformed stamp: ${JSON.stringify(stamp)}`);
  }
  return stamp;
}

// Stamps are written local-labelled-Z, so compare in the same frame: parse the text
// as if local. A stamp more than SKEW_MS ahead of now was hand-computed, not measured.
const SKEW_MS = 2 * 60 * 1000;
function assertNoFutureStamp(line, now) {
  const nowMs = Date.parse(`${now.replace(/Z$/, '')}:00`);
  if (Number.isNaN(nowMs)) return; // never let the guard itself break a handoff
  for (const found of line.match(ISO_MIN) ?? []) {
    const ms = Date.parse(`${found.replace(/Z$/, '')}:00`);
    if (Number.isNaN(ms)) continue;
    if (ms - nowMs > SKEW_MS) {
      throw new Error(
        `refusing a FUTURE stamp ${found} (now ${now}, +${Math.round((ms - nowMs) / 60000)} min). ` +
        'Stamps come from a command, never arithmetic — write {STAMP} and let this script fill it in (F-1039-2).',
      );
    }
  }
}

function oneLine(text) {
  const now = nowStamp();
  const collapsed = text.replace(/\s*\n\s*/g, ' ').trim().replaceAll('{STAMP}', now);
  if (!collapsed) throw new Error('refusing to write an empty line 1');
  assertNoFutureStamp(collapsed, now);
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
    const firstArchive = lines.findIndex((line, index) =>
      index > 0 && /^- \*\*.+ \(line-1 archive\):\*\*/.test(line));
    lines.splice(firstArchive === -1 ? ARCHIVE_INDEX : firstArchive, 0, `- **${label} (line-1 archive):** ${prev}`);
    write(lines);
    console.log(`set line 1 (${lines[0].length} chars); archived previous as "${label}"`);
  } else {
    throw new Error('usage: status-line1.mjs set|handoff|show ...');
  }
} catch (err) {
  console.error(`status-line1: ${err.message}`);
  process.exit(1);
}
