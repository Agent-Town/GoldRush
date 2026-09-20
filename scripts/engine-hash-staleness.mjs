#!/usr/bin/env node
/**
 * engine-hash-staleness — is a BANKED engine-identity hash still current?
 *
 * WHY THIS EXISTS (F-2439-1, s2439).
 * F-2438-1 landed a cheap staleness predicate one fire earlier so a reader could
 * trust a banked engine hash without paying the ~530 s `test:node-guards` battery:
 *
 *     git log --name-only <banked-commit>..HEAD -- package.json
 *
 * The METHOD is right and the SELECTOR is one entry of eleven. `computeEngineHash`
 * hashes every path in `ENGINE_SOURCE_INPUTS`, and `src` is in that list — so a
 * commit that lands ordinary game code rotates the hash while the one-file
 * predicate reports EMPTY, i.e. "still current". That is a FALSE-CURRENT: it fails
 * toward TRUSTING a figure that has already moved.
 *
 * MEASURED s2439 over 800 first-parent commits (a41c2504a..e28a45b63 window and
 * wider): 54 commits rotated the corpus; the one-file predicate is blind to 11 of
 * them — 20.4% FALSE-CURRENT — and all 11 are `src/` code drains, i.e. the
 * factory's most common real work. On a dry board the predicate is right; on a
 * working board it is wrong one time in five, always in the trusting direction.
 *
 * THE CURE IS THE F-2207-1 INVERSION: derive the pathspec from the corpus itself
 * rather than transcribing it into prose. A transcribed list of eleven paths is a
 * subject set that rots silently the day `ENGINE_SOURCE_INPUTS` grows a twelfth;
 * an imported one cannot.
 *
 * DELIBERATELY NOT ROOTED IN ANY npm BATTERY, and the restraint is measured rather
 * than lazy: adding a `test:ledger-guards` leg edits `package.json`, which IS in
 * `ENGINE_SOURCE_INPUTS` — so this tool would rotate the very hash it reports on
 * and add another movement to the corpus the owner is being asked to rule on
 * (F-2416-2(ii)). A guard for this instrument would corrupt its own subject.
 * `desk-state-audit.mjs` is unrooted for the sibling reason (F-1566-2); this is a
 * triage READ, like §2.0c's runner check, not a gate.
 *
 * EXIT CODES follow the house convention (`drain-block-check`, `dry-board-probe`,
 * `master-shipped-classifier`, `review-evidence-audit`):
 *   default  advisory, always 0 — an advisory must never block a fire by its own absence
 *   --strict 0 = CURRENT · 1 = ROTATED (answered, and the answer refuses)
 *            2 = COULD NOT ANSWER (bad ref, unreadable corpus, git failure)
 *
 * The 2-vs-1 split is load-bearing here: this file imports its corpus from another
 * module, and an uncaught import throw would exit 1 — which in this protocol MEANS
 * "rotated". A failure wearing a verdict's exit code is F-2212-1 exactly, so every
 * failure path is caught and mapped to 2.
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Anchored to this file, never to process.cwd(): `git log -- <pathspec>` resolves
// its pathspec against the PROCESS cwd while reporting repo-relative names, so a
// cwd-rooted corpus silently narrows to nothing from any subdirectory and prints
// an affirmative "no rotation" (F-2221-1, F-2220-1).
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function git(args, timeout = 60_000) {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 << 20,
    timeout,
    killSignal: 'SIGKILL',
  });
}

function refuse(why, detail) {
  console.log('ENGINE HASH STALENESS — F-2439-1');
  console.log('');
  console.log('  ⛔ CANNOT ANSWER — ' + why);
  if (detail) console.log('     ' + detail);
  console.log('');
  console.log('  A refusal is not a verdict. Do NOT read this as "still current".');
  return 2;
}

async function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const json = argv.includes('--json');
  const positional = argv.filter((a) => !a.startsWith('--'));

  if (positional.length < 1 || positional.length > 2) {
    return refuse(
      'usage: node scripts/engine-hash-staleness.mjs <banked-commit-ish> [<until-commit-ish>] [--strict] [--json]',
      'The banked commit is the commit AT WHICH the hash you are trusting was read. ' +
        'The optional second ref ends the window (default HEAD) — it exists so this tool can be ' +
        'exercised over a historical window whose answer is already known, which is the only way ' +
        'to prove the corpus selector discriminates (F-2209-1: test from where the caller stands).',
    );
  }
  const banked = positional[0];
  const until = positional[1] ?? 'HEAD';

  // Corpus comes from the source of truth. If that import fails we must NOT fall
  // through to a bare throw: rc=1 means ROTATED in this protocol (F-2212-1).
  let inputs;
  try {
    ({ ENGINE_SOURCE_INPUTS: inputs } = await import(path.join(ROOT, 'scripts/assay-replay-agent.mjs')));
  } catch (e) {
    return refuse('could not import ENGINE_SOURCE_INPUTS from scripts/assay-replay-agent.mjs', String(e && e.message));
  }
  if (!Array.isArray(inputs) || inputs.length === 0) {
    // An empty corpus drives every bucket to zero and prints the shape of good
    // news (F-2217-1). Refuse rather than report an unearned CURRENT.
    return refuse('ENGINE_SOURCE_INPUTS is absent or empty — the corpus would select nothing');
  }

  let head;
  try {
    head = git(['rev-parse', '--short', until + '^{commit}']).trim();
    git(['rev-parse', '--verify', '--quiet', banked + '^{commit}']);
  } catch {
    return refuse('a ref does not resolve to a commit in this repo: ' + banked + '..' + until);
  }

  let lines;
  try {
    lines = git(['log', '--oneline', banked + '..' + until, '--', ...inputs])
      .split('\n').map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    return refuse('git log over the corpus failed', String(e && e.message));
  }

  const rotated = lines.length > 0;

  if (json) {
    console.log(JSON.stringify({
      banked, until, head, corpusSource: 'scripts/assay-replay-agent.mjs',
      corpusEntries: inputs.length, corpus: inputs,
      rotated, movingCommits: lines,
    }, null, 2));
  } else {
    console.log('ENGINE HASH STALENESS — is the banked hash still current? (F-2439-1)');
    console.log('');
    // Declared ALWAYS, including the happy path: a declaration that appears only
    // on failure re-creates the ambiguity it removes (F-2208-1).
    console.log('  corpus        : ' + inputs.length + ' entries, imported from scripts/assay-replay-agent.mjs (not transcribed)');
    console.log('                  ' + inputs.join(' · '));
    console.log('  window        : ' + banked + '..' + until + '  (' + until + ' = ' + head + ')');
    console.log('');
    if (rotated) {
      console.log('  ⚠️  ROTATED — ' + lines.length + ' commit(s) since the banked reading touched the identity corpus.');
      console.log('     The banked hash is STALE. Re-read the live hash before citing it.');
      console.log('');
      for (const l of lines.slice(0, 20)) console.log('       ' + l.slice(0, 110));
      if (lines.length > 20) console.log('       … and ' + (lines.length - 20) + ' more');
    } else {
      console.log('  ✅ CURRENT — no commit since the banked reading touched any corpus entry,');
      console.log('     so the banked hash cannot have moved. No test run needed.');
    }
    console.log('');
    console.log('  Advisory: this answers STALENESS only. It renders no verdict on the');
    console.log('  engine-era red itself, which is owner-gated (F-2416-2).');
  }

  if (!strict) return 0;
  return rotated ? 1 : 0;
}

main().then((c) => process.exit(c)).catch((e) => {
  process.exit(refuse('unexpected failure', String(e && e.message)));
});
