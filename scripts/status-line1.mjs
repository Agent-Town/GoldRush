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
//        [--allow-desk-drop]                                    # ... losing a ruled desk item
//   node scripts/status-line1.mjs handoff <textfile> <label>    # archive old line 1
//                                                               # as a bullet, then set
//   node scripts/status-line1.mjs show                          # print line 1
//
// THE STAMP COMES FROM `date`, NOT FROM THE CALLER (F-1039-2 / F-1204-5, closed here
// s1206). Write the literal token {STAMP} in <textfile> and it is substituted with
// `date -u "+%Y-%m-%dT%H:%MZ"` at write time (`-u` since 2026-09-26, F-ATT-3: without it the stamp was this Mac's local clock with a literal Z, seven hours ahead once the clock moved to +07). This closes a SIX-instance lineage of
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
// BELT AND BRACES: the new line's OWN stamp is checked against now and a FUTURE one is
// REFUSED even if the caller never used {STAMP}. That is the actual failure mode, caught
// regardless of how it was written. Past stamps pass freely (handoff prose legitimately
// cites earlier times), and the short forms fires quote in prose ("claimed at 09:44:53")
// are not full ISO and do not match. Local time labelled Z, matching every recent fire —
// protocol §1.1 fixes the label on a flag day, never as a drive-by.
//
// F-2676-1 (filed s2676, CURED HERE s2677) — "ITS OWN STAMP" IS THE FIRST FULL ISO ON THE
// LINE, AND THIS CHECK USED TO WALK EVERY ONE OF THEM. The belt-and-braces sentence above
// said "appearing anywhere in the new line 1" and the loop meant it, so a handoff sentence
// that merely CITED a future date — an RT-01 due date, a gate window, a veto window, all of
// which have full-ISO shape — was refused with the hand-computed-stamp message, a message
// about a different act entirely. s2676 hit it writing "the next RT-01 mint is due after
// 2026-09-27T00:00Z" on a line whose own stamp was a lawful {STAMP}, and got past it only
// by degrading the ISO form to prose. The old header had considered prose and concluded the
// short forms "do not match": true, and it did not cover a fire citing a full ISO it never
// claimed as the line's time.
//
// Scoping to the FIRST match is not a weakening, because the stamp that can HARM is the one
// a reader takes as the line's time. Both lock shapes put it first (`ACTIVE <ISO> (sNNNN
// fire)` and `Last updated: <ISO> sNNNN handoff`), and — verified s2677, not assumed — no
// other script in this repo parses an ISO stamp out of line 1 at all: health-watch.sh:281
// judges staleness by STATUS.md's MTIME, and protocol §1.1's 45-minute rule is read by a
// fire BY EYE, off the front of the line. A future date in the tail stalls nothing; a future
// date in front stalls the factory for the skew plus 45 minutes, and still refuses here.
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
// F-2671-2 (filed s2671, CURED HERE s2673) — THE CONVENTION ABOVE IS CORRECT AND WAS NOT
// ENOUGH. s2671 read this very block for its `{STAMP}` contract, used `set`, and dropped
// s2670's 7,974-char handoff line — including the OWNER'S DESK tail, its header and all
// three items — off the board at 20:26:30, restored 11 minutes later from git. Documented
// behaviour is not a guard: the one surface whose entire purpose is to be read by the owner
// WITHOUT a git command went missing, and the tool that did it said nothing.
//
// `set` now REFUSES when all three hold: the line it would displace carries a desk tail,
// the new line does not carry that desk forward intact, and no archive bullet on the board
// already holds the displaced line. Any one of those failing means nothing is lost, so the
// refusal cannot fire on lawful work — a fire that carries the tail onto its lock line (the
// habit F-2671-2 prescribes) never sees it, and `handoff` preserves by construction and is
// not checked at all.
//
// 🚫 THE REMEDY IT PRINTS NAMES ONLY CORRECT ACTS, because this repo has twice been bitten
// by a guard whose remedy was to corrupt a correct file (status-archive-audit.mjs:322 and
// F-2088-2). Both offered routes ADD the missing words; neither removes any. The deliberate
// override `--allow-desk-drop` exists for the one lawful shape the predicate cannot see —
// a ruled item leaving the tail (fire.md §4) — and it warns instead of failing, so the act
// stays visible in the run log rather than becoming silent.
//
// ⚠️ SELF-CONTAINED ON PURPOSE (F-2672-2, s2672, one fire before this one): adding a
// relative import to a script that guard harnesses copy OUT of scripts/ breaks every copied
// variant at once, and the breakage wears the costume of the arms working. `deskOf` below
// therefore duplicates status-archive-audit.mjs:136-145 rather than importing it. The
// duplication is stated so it is visible: both read the LAST desk marker in the line and
// slice to the end. If one changes, change both.
//
// Insert before the first archive bullet. Most STATUS files have two blank lines
// first, but one missing blank must not strand an older handoff above newer ones.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — the repo path contains a space ("Gold Rush")
// and .pathname hands back the percent-encoded form, which fs cannot open.
const STATUS = fileURLToPath(new URL('../STATUS.md', import.meta.url));
// The fallback insertion point when the board carries NO archive bullet at all — index 2, the
// line straight after line 1 and the blank line under it. It was 3, from the era when STATUS.md
// opened with TWO blank lines; the board has carried one since, and after the ledger-shape-1
// rotation (owner ruling 2026-09-24, item 13a) a fully-drained board is reachable for the first
// time, where a 3 would splice the bullet one line too low and strand it under the first
// archived line. The `findIndex` below still wins whenever any bullet is present, which is every
// real board: the trailing window `scripts/status-rotate-month.mjs` holds back guarantees it.
const ARCHIVE_INDEX = 2;

const [, , cmd, ...rest] = process.argv;

function readLines() {
  return readFileSync(STATUS, 'utf8').split('\n');
}

const ISO_MIN = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z/g;

// The one place a stamp may be born. Same command protocol §1.1 names.
function nowStamp() {
  const stamp = execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/.test(stamp)) {
    throw new Error(`refusing to write a malformed stamp: ${JSON.stringify(stamp)}`);
  }
  return stamp;
}

// Stamps are written local-labelled-Z, so compare in the same frame: parse the text
// as if local. A stamp more than SKEW_MS ahead of now was hand-computed, not measured.
const SKEW_MS = 2 * 60 * 1000;

// The line's OWN stamp — the first full ISO on it — and nothing else (F-2676-1). Later
// matches are prose the line CITES, not a time it CLAIMS, and refusing them cost precision
// in the one surface the owner reads without a git command. See the header for why first.
const ownStamp = (line) => (line.match(ISO_MIN) ?? [])[0] ?? null;

function assertNoFutureStamp(line, now) {
  const nowMs = Date.parse(`${now.replace(/Z$/, '')}:00`);
  if (Number.isNaN(nowMs)) return; // never let the guard itself break a handoff
  const found = ownStamp(line);
  if (found === null) return;
  const ms = Date.parse(`${found.replace(/Z$/, '')}:00`);
  if (Number.isNaN(ms)) return;
  if (ms - nowMs > SKEW_MS) {
    throw new Error(
      `refusing a FUTURE stamp ${found} (now ${now}, +${Math.round((ms - nowMs) / 60000)} min). ` +
      'Stamps come from a command, never arithmetic — write {STAMP} and let this script fill it in (F-1039-2). ' +
      "Only the line's OWN stamp (the first full ISO on it) is checked — a future date CITED later in the " +
      'line is lawful prose and passes (F-2676-1).',
    );
  }
}

// --- F-2671-2: the desk-survival predicate ---------------------------------------
// Twin of status-archive-audit.mjs:136-145. Kept local, not imported (see the header).
const DESK = /OWNER.{0,2}S? DESK/i;
const FINDING_ID = /\bF-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*\b/g;
const DESK_ITEM = /🔺/g;

const deskOf = (line) => {
  const all = [...line.matchAll(new RegExp(DESK.source, 'gi'))];
  return all.length ? line.slice(all[all.length - 1].index) : null;
};

// Already on the board? The bullet `handoff` writes carries the displaced line verbatim,
// so a substring test is exact rather than a resemblance. Line 0 is excluded: the line
// about to be replaced cannot archive itself.
const archivedBelow = (lines, prev) =>
  lines.some((line, index) =>
    index > 0 && /^- \*\*.+ \(line-1 archive\):\*\*/.test(line) && line.includes(prev));

// Returns null when the desk survives, or a sentence naming exactly what would be lost.
function deskLoss(prev, next) {
  const before = deskOf(prev);
  if (before === null) return null; // nothing to lose

  const after = deskOf(next);
  if (after === null) return 'the new line carries no OWNER\'S DESK tail at all';

  const beforeIds = [...new Set(before.match(FINDING_ID) ?? [])];
  const afterIds = new Set(after.match(FINDING_ID) ?? []);
  const lost = beforeIds.filter((id) => !afterIds.has(id));
  if (lost.length) return `the new desk drops ${lost.length} finding id(s) the old one named: ${lost.join(', ')}`;

  // Not every desk item is an F-id — `b1-device-verdict-rows` is a backtick key — so count
  // the item markers too, or a whole class of items can vanish past the id test.
  const beforeItems = (before.match(DESK_ITEM) ?? []).length;
  const afterItems = (after.match(DESK_ITEM) ?? []).length;
  if (afterItems < beforeItems) {
    return `the new desk shows ${afterItems} 🔺 marker(s) against the old line's ${beforeItems}`;
  }
  return null;
}

function assertDeskSurvives(prev, next, lines, allowDrop) {
  const loss = deskLoss(prev, next);
  if (loss === null) return;
  if (archivedBelow(lines, prev)) return; // the displaced line is already on the board

  if (allowDrop) {
    console.error(
      `status-line1: ⚠️  DESK DROP ALLOWED — ${loss}, and the displaced line is not archived ` +
        'below. Proceeding because --allow-desk-drop was passed. If an item was RULED, say so ' +
        'in the commit message; if it was not, this is F-2671-2 happening again.',
    );
    return;
  }

  throw new Error(
    `refusing to displace the OWNER'S DESK (F-2671-2): ${loss}, and no archive bullet on the ` +
      'board holds the line being replaced — so the desk would survive in git alone for the ' +
      'length of this fire, and not at all if this session dies before its handoff.\n' +
      '  Two ways forward, both of which ADD words and remove none:\n' +
      '    1. archive it by construction — node scripts/status-line1.mjs handoff <textfile> ' +
      '"s<N-1> handoff"  (this is the right command at LOCK time too, whenever the ' +
      "predecessor's handoff is not yet archived);\n" +
      "    2. carry the tail — slice from the `🔺 **OWNER'S DESK` header to the end of the old " +
      'line 1 and append it verbatim to your new line, with nothing after it.\n' +
      '  If an item was genuinely RULED and is meant to leave the tail (fire.md §4), pass ' +
      '--allow-desk-drop and say so in the commit message.',
  );
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
    const allowDrop = rest.includes('--allow-desk-drop');
    const [file] = rest.filter((a) => !a.startsWith('--'));
    if (!file) throw new Error('usage: set <textfile> [--allow-desk-drop]');
    const lines = readLines();
    const next = oneLine(readFileSync(file, 'utf8'));
    assertDeskSurvives(lines[0], next, lines, allowDrop);
    lines[0] = next;
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
