#!/usr/bin/env node
// nul-audit — find raw NUL bytes in tracked TEXT sources (F-1465-1).
//
// WHY THIS EXISTS. A single raw NUL byte makes `grep` classify a file as BINARY and
// print NOTHING (exit 1) — silently, with no warning, for every pattern. It is not a
// locale effect: measured s1465, `LC_ALL=en_US.UTF-8 grep -c PowerGraph src/game/Game.ts`
// is just as blind as the C-locale run. So any session that concludes "X is absent from
// src/" from a grep has a FALSE NEGATIVE on every NUL-bearing file, and the bigger the
// file the more expensive the wrong conclusion.
//
// That is not hypothetical. s1465 measured `src/game/Game.ts` (8,640 lines, the game's
// largest file) as returning ZERO matches for `import` — a string it contains 134 times —
// and was one commit away from filing a finding claiming four era systems were dead code.
// They are all constructed in that very file (WrangleSystem :646, MothSwarm :667,
// PressureSystem :1310, PowerGraphSystem :3757). The instrument was broken, not the code.
//
// The cure is byte-level and behaviour-preserving: write the delimiter as the six-character ESCAPE
// backslash-u-0-0-0-0 instead of a raw 0x00 byte. JS parses both to the same
// one-character string, so the runtime value is identical and grep can read the file again.
//
// Usage:
//   node scripts/nul-audit.mjs            # report; exit 1 if any NUL found
//   node scripts/nul-audit.mjs --quiet    # exit code only
import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync, statSync } from 'node:fs';

const NUL = String.fromCharCode(0);
const quiet = process.argv.includes('--quiet');

// Extensions we expect to be text. Binary assets legitimately contain NULs and are skipped.
const TEXT_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|md|css|html|yml|yaml|sh|txt)$/i;

// F-2220-1 — DECLARE THE CORPUS. This audit's banner is a UNIVERSAL claim ("no raw NUL
// bytes in tracked text sources") over a set it never counted. `git ls-files` is CWD-
// RELATIVE: from a subdirectory it lists only that subtree, so the scan silently narrows
// and still prints CLEAN. Measured s2220 on a scratch repo whose ground truth was ONE
// NUL-bearing tracked file: from the repo root -> `1 file(s) carry raw NUL bytes`, rc=1;
// from `scripts/` -> `CLEAN`, rc=0, BYTE-IDENTICAL on stdout, stderr AND rc to a
// genuinely clean board. The same 61-byte string is the output of four different
// failure modes and of real good news.
//
// `scope` is deliberately a STRING, not a boolean (F-2212-1): a careless truthiness test
// on a failure value reads TRUE, i.e. toward NOTICING rather than toward clearing.
function corpus() {
  let root;
  try {
    root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  } catch {
    // Not a repo, or git unavailable. `ls-files` cannot be trusted to mean what the
    // banner claims, so this is an instrument failure, not a verdict.
    return { scope: 'unverifiable', detail: 'git rev-parse --show-toplevel failed', files: [] };
  }
  // realpath BOTH sides: on macOS /tmp is a symlink to /private/tmp, and comparing the
  // raw strings reports a false narrowing (the exact trap that made an s2215 control
  // silently vacuous).
  const here = realpathSync(process.cwd());
  const top = realpathSync(root);
  const out = execFileSync('git', ['ls-files', '-z'], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
  const files = out.toString('utf8').split('\0').filter(Boolean);
  if (here !== top) return { scope: 'narrowed', detail: `cwd ${here} is below repo root ${top}`, files };
  return { scope: 'repo', detail: top, files };
}

const { scope, detail, files } = corpus();

// A narrowed or unverifiable scan cannot answer the question the banner asks. Refuse with
// 2 = "could not answer", against 1 = "answered, and the answer refuses" — the convention
// drain-block-check, dry-board-probe, master-shipped-classifier and review-evidence-audit
// already carry. The banner goes to STDOUT even under --quiet: a refusal is not a report,
// and per F-2211-1 a caller that classifies stdout reads an empty string as silence.
if (scope !== 'repo') {
  console.log(`nul-audit: ⛔ CANNOT VERIFY — scan is ${scope} (${detail}).`);
  console.log('  The CLEAN banner is a claim about every tracked text source in the repo.');
  console.log('  Re-run from the repository root.');
  process.exit(2);
}

const hits = [];
let subjects = 0, read = 0, emptySkip = 0;
const unreadable = [];
for (const rel of files) {
  if (!TEXT_EXT.test(rel)) continue;
  subjects += 1;
  let buf;
  try {
    if (statSync(rel).size === 0) { emptySkip += 1; continue; }
    buf = readFileSync(rel);
    read += 1;
  } catch (err) {
    // Deleted-but-tracked, or unreadable. NOT a refusal: a stale index entry is a lawful,
    // routine state, so refusing here would red on ordinary work and be excused into
    // uselessness inside a week (F-1460-1, the `cross-engine` fate — F-2218-1's restraint).
    // But it IS a hole in the denominator, so it is COUNTED and NAMED rather than dropped:
    // the comment this replaced named one cause and was blind to every other one.
    unreadable.push(`${rel} (${err.code || 'unreadable'})`);
    continue;
  }
  if (buf.indexOf(0) === -1) continue;

  // Report per line so the fix site is unambiguous.
  const text = buf.toString('utf8');
  const lines = text.split('\n');
  const sites = [];
  let total = 0;
  lines.forEach((line, i) => {
    const n = line.split(NUL).length - 1;
    if (n > 0) {
      total += n;
      sites.push({ line: i + 1, count: n, sample: line.trim().slice(0, 110) });
    }
  });
  hits.push({ file: rel, total, sites });
}

if (!quiet) {
  // Printed ALWAYS, including the happy path (F-2208-1): a declaration that appears only
  // on failure re-creates the very ambiguity it removes. This one line is what separates
  // "I read 9,701 files and found nothing" from "I read nothing".
  const skipped = unreadable.length ? `, ${unreadable.length} UNREADABLE` : '';
  console.log(`nul-audit: corpus ${subjects} text subject(s) — ${read} read, ${emptySkip} empty${skipped}.`);
  for (const u of unreadable) console.log(`  ⚠️  not audited: ${u}`);
  if (hits.length === 0) {
    console.log('nul-audit: CLEAN — no raw NUL bytes in tracked text sources.');
  } else {
    console.log(`nul-audit: ${hits.length} file(s) carry raw NUL bytes — grep is BLIND to these files.\n`);
    for (const h of hits) {
      console.log(`  ${h.file}  (${h.total} NUL byte(s))`);
      for (const s of h.sites) {
        console.log(`    :${s.line}  x${s.count}  ${s.sample}`);
      }
      console.log('');
    }
    console.log('Cure: replace each raw 0x00 with the six-character escape \\u0000.');
    console.log('The parsed string is identical, so runtime behaviour does not change.');
  }
}

process.exit(hits.length === 0 ? 0 : 1);
