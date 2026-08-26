#!/usr/bin/env node
/**
 * source-pointer-guard.mjs — does a SOURCE COMMENT still point at the line it names?
 *
 * WHY THIS EXISTS (F-2338-1, s2338)
 * --------------------------------
 * The factory has a mechanised law-pointer discipline and it is applied to exactly
 * SIX files. `law-surfaces.mjs` is a closed list — CLAUDE.md, AGENTS.md,
 * scripts/fire.md and the three SKILL.md files under .claude/skills — so
 * `law-pointer-guard` scans no source file at all.
 *
 * The same rot mechanism runs in code comments, at scale and unwatched. Measured
 * s2338 over 517 files in scripts/: 296 `<file>:<line>` citations live inside
 * source comments, and NOT ONE of them is read by any guard in the repo.
 *
 * The asymmetry is the finding, and it is what makes this worth a mechanism rather
 * than three edits. On the GUARDED surfaces the discipline works: s2198 measured
 * 31 distinct scripts/ citations across all six law surfaces with ZERO dead. On the
 * UNGUARDED one, every checkable pointer had rotted — 3 of 3, by 254, 108 and 63
 * lines, all three inside instruments §3.0 and §4 make every fire run:
 *
 *     drain-block-check.mjs:489     `dispatchCorpus` cited :713, declared :967
 *     drain-block-check.mjs:963     `ancestryOfMain` cited :205, declared :313
 *     status-archive-audit.mjs:205  `kind`           cited :115, declared :178
 *
 * SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED. This is NOT a false
 * green, NOT a Mistake #8 clearance, and no verdict any instrument printed was
 * wrong. These are comments. The harm is the one CLAUDE.md §4.10b names for its own
 * rotted coordinates: a reader following a stale number "lands on an unrelated line
 * and could wrongly conclude the epitaph was DELETED — i.e. infer a law violation
 * that never happened". Here `drain-block-check.mjs:489` tells a reader that the
 * F-2218-1 dispatch declaration lives at :713; :713 is unrelated prose, and the
 * declaration is 254 lines further down. What earns it a mechanism is that the
 * factory already decided this class is worth guarding and then drew the corpus
 * boundary at a file extension.
 *
 * THE SUBJECT SET IS THE DECIDABLE SUBSET, AND THAT BOUNDARY IS MEASURED
 * ---------------------------------------------------------------------
 * Only a SAME-FILE citation has a ground truth this guard can check: the symbol is
 * declared in the file, so the coordinate either matches a declaration or it does
 * not. Cross-file pointers (`lane-runner-v3.sh:59`) are the larger population but
 * their ground truth is "what a human meant", so they are COUNTED AND NAMED rather
 * than silently dropped — the three-bucket shape F-2246-1 landed in nul-audit.
 *
 * THE KEY IS NARROW ON PURPOSE, AND THE WIDE VERSION WAS MEASURED FIRST. A looser
 * net — any backticked name plus any `:NNN` on the line — finds 8 candidates, of
 * which FOUR ARE FALSE POSITIVES: `(1)` and `(3)` are list markers, `874 nodes` is
 * a count, and one is a cross-file pointer whose symbol happens to also exist
 * locally. A guard that cries wolf half the time gets routed around, and then it
 * protects nothing (F-1460-1, the `cross-engine` fate). So the coordinate must be
 * anchored to a BACKTICKED identifier, on the same line, within a short window.
 *
 * NO TREE DISCRIMINATOR, AND THE OMISSION IS REASONED RATHER THAN FORGOTTEN
 * ------------------------------------------------------------------------
 * F-2225-1's rule: does the question name a CANONICAL ARTIFACT, or does it ask
 * about the tree it sits in? This one is SELF-SCOPED — "are this file's comments
 * consistent with this file's own code" — so a linked worktree's answer is CORRECT
 * for that worktree, exactly as nul-audit's is. Adding a refusal here would red the
 * §3.0b-mandated detached gate for no gain.
 *
 * BUT THE CORPUS IS DECLARED AND AN EMPTY ONE REFUSES, because "0 citations checked"
 * and "every citation agrees" are the same green — the rung s2335..s2337 have been
 * walking, applied to this guard's own subject set. The root is anchored at
 * import.meta.url, so it is cwd-invariant BY CONSTRUCTION (F-2220-1's lesson: the
 * dangerous cwd is a SUBDIRECTORY, which keeps git healthy and only narrows).
 *
 * usage:
 *   node scripts/source-pointer-guard.mjs           # gate: rc 1 on rot, 2 if unanswerable
 *   node scripts/source-pointer-guard.mjs --report  # also list every checked citation
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Anchored at this file's own location, NOT process.cwd(). `git ls-files` and bare
 * relative paths both resolve against the working directory, which is how nul-audit
 * and attended-owed-audit could silently narrow to nothing (F-2220-1). This corpus
 * is a fixed directory, so it can be addressed absolutely and the whole class is
 * closed by construction rather than by a discriminator.
 */
const ANCHORED = dirname(fileURLToPath(import.meta.url));
const REPORT = process.argv.includes('--report');
/**
 * An EXPLICIT caller choice, and that is the whole difference from the cwd
 * resolution F-2220-1 cured: `--root` is a directory somebody named on purpose,
 * where a bare relative path is a directory nobody thought about. The DEFAULT stays
 * anchored, so the prescribed invocation cannot silently narrow no matter where it
 * is run from. It exists because main() — the enumeration, the empty-corpus
 * refusal, the exit code — is otherwise unreachable from a fixture, and a decision
 * that no test can reach is F-2209-1's relocated blind spot: exported helpers go
 * green while the arm the caller actually observes is never exercised.
 */
const rootArg = process.argv.indexOf('--root');
const SCRIPTS = rootArg === -1 ? ANCHORED : process.argv[rootArg + 1];

/** Source files that can carry a comment pointer. */
const SOURCE = /\.(mjs|cjs|js|sh)$/;

/**
 * A comment line. Deliberately covers `//`, `#`, and both block-comment shapes,
 * because this corpus is mixed JS and shell.
 */
const COMMENT = /^\s*(\/\/|\*|#|\/\*)/;

/**
 * `symbol` ... :NNN — the anchored key whose precision was measured above. The
 * identifier must be BACKTICKED and the coordinate must follow within 40 chars, so
 * a list marker or a count elsewhere on the line cannot supply the number.
 */
const CITATION = /`([A-Za-z_$][\w$]*)`[^`\n]{0,40}?[(\s]:(\d{1,5})\)?/g;

/**
 * Every line that plausibly DECLARES `name` in this file. Several shapes, because a
 * pointer may legitimately aim at a function, a const, a shell function or an object
 * key — and a symbol may be declared more than once (a local and a field). Any
 * declaration within tolerance satisfies the citation: the guard's claim is "this
 * coordinate lands on a declaration of the thing it names", not "on THE one".
 */
export function declarationLines(text, name) {
  const out = [];
  const pats = [
    new RegExp(`^\\s*(?:export\\s+)?(?:async\\s+)?function\\s+${name}\\b`),
    new RegExp(`^\\s*(?:export\\s+)?(?:const|let|var)\\s+${name}\\b`),
    new RegExp(`^\\s*(?:function\\s+)?${name}\\s*\\(\\)\\s*\\{`),
    new RegExp(`^\\s*${name}\\s*:`),
  ];
  text.split('\n').forEach((line, i) => {
    if (pats.some((p) => p.test(line))) out.push(i + 1);
  });
  return out;
}

/**
 * Tolerance of 3 lines. A pointer aimed at the docstring immediately above a
 * declaration is a legitimate aim, not rot, and reding it would be the
 * false-positive direction this guard is built to avoid.
 */
const TOLERANCE = 3;

export function scanFile(name, text) {
  const checked = [];
  const crossFile = [];
  text.split('\n').forEach((line, idx) => {
    if (!COMMENT.test(line)) return;
    CITATION.lastIndex = 0;
    let m;
    while ((m = CITATION.exec(line))) {
      const symbol = m[1];
      const cited = Number(m[2]);
      const declared = declarationLines(text, symbol);
      // Not declared here: this is a cross-file pointer (or a symbol from another
      // module). Its ground truth is not in this file, so it is NOT checkable —
      // counted and named, never silently dropped (F-2246-1's third bucket).
      if (!declared.length) {
        crossFile.push({ file: name, at: idx + 1, symbol, cited });
        continue;
      }
      const ok = declared.some((d) => Math.abs(d - cited) <= TOLERANCE);
      checked.push({ file: name, at: idx + 1, symbol, cited, declared, ok });
    }
  });
  return { checked, crossFile };
}

function main() {
  let entries;
  try {
    entries = readdirSync(SCRIPTS).filter((f) => SOURCE.test(f));
  } catch (err) {
    console.log(`source-pointer-guard: ⛔ CANNOT VERIFY — could not enumerate ${SCRIPTS} (${err.code || 'unreadable'}).`);
    console.log('  A PASS here would be a claim about a corpus this run never read.');
    process.exit(2);
  }

  const checked = [];
  const crossFile = [];
  const unreadable = [];
  for (const f of entries) {
    let text;
    try {
      text = readFileSync(join(SCRIPTS, f), 'utf8');
    } catch (err) {
      // COUNTED AND NAMED, not a refusal: a deleted-but-tracked entry is a lawful,
      // routine state (F-2218-1's restraint). It is still a hole in the denominator.
      unreadable.push(`${f} (${err.code || 'unreadable'})`);
      continue;
    }
    const r = scanFile(f, text);
    checked.push(...r.checked);
    crossFile.push(...r.crossFile);
  }

  // Printed ALWAYS, including the happy path (F-2208-1): a declaration that appears
  // only on failure re-creates the ambiguity it removes. This line is what separates
  // "I checked 3 pointers and they agree" from "I checked nothing".
  console.log('=== source-pointer-guard ===');
  console.log(`corpus                    : ${entries.length} source file(s) under ${SCRIPTS}`);
  console.log(`same-file citations checked: ${checked.length}`);
  console.log(`cross-file citations (not checkable here): ${crossFile.length}`);
  for (const u of unreadable) console.log(`  ⚠️  not scanned: ${u}`);

  // THE RUNG (s2335..s2338): is the empty state LAWFUL here? It is NOT. This corpus
  // is a tracked directory of 500+ files that has carried checkable pointers
  // continuously; zero subjects means the key stopped matching, not that the factory
  // stopped writing pointers. "Nothing to check" and "everything checks out" print
  // the same green, so the empty state refuses. 2 = "could not answer", against
  // 1 = "answered, and the answer refuses".
  if (checked.length === 0) {
    console.log('');
    console.log('source-pointer-guard: ⛔ CANNOT VERIFY — zero checkable citations found.');
    console.log('  This corpus has carried same-file pointers continuously, so an empty');
    console.log('  subject set means the citation key stopped matching — not that the');
    console.log('  pointers are sound. A PASS here would certify a scan that read nothing.');
    process.exit(2);
  }

  if (REPORT) {
    for (const c of checked) {
      console.log(`  ${c.ok ? 'ok  ' : 'ROT '} ${c.file}:${c.at}  \`${c.symbol}\` -> :${c.cited} (declared :${c.declared.join(',')})`);
    }
  }

  const rot = checked.filter((c) => !c.ok);
  if (rot.length) {
    console.error('');
    console.error(`FAIL — ${rot.length} source comment(s) point at a line that no longer declares the symbol:`);
    for (const c of rot) {
      console.error(`  ${c.file}:${c.at}`);
      console.error(`      cites \`${c.symbol}\` at :${c.cited}, but it is declared at :${c.declared.join(', :')}`);
    }
    console.error('');
    console.error('Re-base by RE-GREPPING the symbol, never by adding a remembered delta —');
    console.error('two pointers into one file routinely move by different amounts in the same');
    console.error('commit (CLAUDE.md §4.10b). Cite the CODE; the coordinate drifts.');
    process.exit(1);
  }

  console.log('PASS — every checkable source pointer still lands on its declaration.');
}

// NOT `file://${process.argv[1]}`: this repo's path contains a space, which
// import.meta.url percent-encodes and process.argv[1] does not (the s1334 trap).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
