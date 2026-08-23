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

// F-2246-1 — THE SUBJECT TEST ADMITS BY FORMAT WHERE THE CLAIM IS A ROLE.
//
// This file's banner is a UNIVERSAL claim about "tracked text sources", but the subject
// test was a 14-extension ALLOW-LIST, and the comment defending it named only the case it
// was thinking about ("binary assets legitimately contain NULs and are skipped"). An
// allow-list does not exclude BINARY; it excludes EVERYTHING NOBODY LISTED, and it fails
// toward silently narrowing — the direction that prints good news.
//
// Measured s2246 over 22,386 tracked files: the old list admitted 9,751 and excluded
// 12,635, of which 1,109 are text by any reading — py 230, log 680, jsonl 43, rc 48,
// toml 4, plus ndjson/tsv/xml/conf/c/patch/diff, `public/_headers`, and the SHA256SUMS
// evidence-integrity files. F-2220-1's declaration is TRUE and could not say so: it counts
// POST-FILTER subjects, so it reports "corpus 9,751 text subject(s)" whether the filter
// dropped 12 files or 12,000. That is a declaration NEAR the verdict but not OF the claim.
//
// SEVERITY, STATED HONESTLY AND NOT INFLATED: LATENT. Of those 1,109, 1,101 were readable
// and exactly 2 carry a raw NUL — both sqlite `-shm`/`-wal` sidecars, i.e. genuinely
// binary. So every CLEAN this audit has printed was TRUE about text sources, verified not
// assumed. What earns it a cure is that the miss would land in a GATE (chained bare in
// test:ledger-guards), in the permissive direction, in the DEFAULT mode the battery uses —
// and the harm the banner itself names ("grep is BLIND to these files") bites hardest on
// the excluded `.log` files, since §1.1 tells every fire to grep logs/fire-<date>.log for
// the authoritative FIRE END lock signal.
//
// COST OF WIDENING, measured before it was chosen: 1,101 files, 12.8 MB, 18 ms. Free.
//
// WHY NOT A PURE DENY-LIST (the F-2207-1 invert, "enumerate what to SKIP"). That is right
// for dry-board-probe, whose unknown prefixes are lawful subjects. Here it would make every
// NEW binary asset type a subject, and binary files legitimately carry NULs — so adding a
// .ktx2 or .fbx would RED test:ledger-guards on ordinary art work and the guard would be
// excused into uselessness inside a week (F-1460-1, the `cross-engine` fate). So the cure
// is three buckets, not two: TEXT is audited, known-BINARY is skipped, and anything in
// NEITHER list is COUNTED AND NAMED. An unlisted extension can no longer vanish — it
// arrives on stdout by name — without a new asset type being able to red the gate.
// UNCLASSIFIED therefore DECLARES AND DOES NOT REFUSE (F-2218-1's restraint): a suffix
// nobody has listed is a lawful, routine state.
const TEXT_EXT =
  /\.(ts|tsx|js|jsx|mjs|cjs|json|jsonl|ndjson|md|css|html|yml|yaml|toml|sh|txt|py|log|tsv|csv|xml|svg|sql|conf|c|h|patch|diff|rc|out|err|trace|tap|ffconcat|service|nvmrc|gitignore|gitattributes|gitkeep|editorconfig)$/i;
// Suffixes that are binary BY DESIGN: a NUL here is the file working correctly, so they are
// skipped without comment. Listed explicitly rather than assumed, so that the third bucket
// below means "nobody has classified this", not "the author forgot".
const BINARY_EXT =
  /\.(png|jpe?g|gif|webp|ico|bmp|tiff?|glb|gltf|blend1?|fbx|obj|stl|mp4|webm|mov|mp3|m4a|wav|ogg|flac|pdf|zip|gz|tgz|bz2|7z|rar|ttf|otf|woff2?|eot|sqlite|sqlite-shm|sqlite-wal|db|pyc|pyo|so|dylib|dll|exe|bin|dat|b64|plist)$/i;

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
let subjects = 0, read = 0, emptySkip = 0, binarySkip = 0;
const unreadable = [];
const unclassified = [];
for (const rel of files) {
  if (!TEXT_EXT.test(rel)) {
    // Three buckets, not two (F-2246-1): a file that is on NEITHER list is not silently
    // dropped, it is counted and named below. That is what makes the corpus declaration a
    // statement about the whole tracked set rather than about the filter's own output.
    if (BINARY_EXT.test(rel)) binarySkip += 1;
    else unclassified.push(rel);
    continue;
  }
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
  // The other side of the denominator (F-2246-1), printed ALWAYS including the happy path
  // (F-2208-1): without it, "corpus N text subject(s)" is a statement about what the filter
  // KEPT and says nothing about what it threw away.
  console.log(
    `nul-audit: excluded ${binarySkip} known-binary, ${unclassified.length} UNCLASSIFIED` +
      ` of ${files.length} tracked file(s).`,
  );
  if (unclassified.length) {
    const by = new Map();
    for (const f of unclassified) {
      const m = f.match(/\.([A-Za-z0-9-]+)$/);
      const k = m ? `.${m[1].toLowerCase()}` : '(no extension)';
      by.set(k, (by.get(k) || 0) + 1);
    }
    const shown = [...by.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}×${n}`);
    console.log(`  ⓘ  UNCLASSIFIED (not audited, not known-binary): ${shown.join(' ')}`);
    console.log('     Add each to TEXT_EXT or BINARY_EXT — this list is how a new suffix');
    console.log('     announces itself instead of silently leaving the corpus.');
  }
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
