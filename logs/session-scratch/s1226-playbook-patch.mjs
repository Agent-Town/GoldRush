// s1226 — wire the GOAL REGISTRATION LAW (owner ruling 2026-07-16) into the two
// playbooks that AUTHOR tasks. /drain got it from s1225's pre-built patch; this
// closes the CLASS, not the instance (memory law: cured-defect-survives-in-the-sibling).
//
// Every added line is transcription of law ratified elsewhere (scripts/fire.md §2E
// "GOAL REGISTRATION LAW"), not new policy. Purely additive. Anchors are verified —
// this script THROWS rather than guess, copying s1225's discipline.
import fs from 'node:fs';

const GOAL_LAW =
  '- **GOAL REGISTRATION LAW (owner ruling 2026-07-16): every authored master adds its leaf to `tasks/goals.json` IN THE SAME COMMIT** — ' +
  'with `taskFile` set to the master’s filename, which is how `scripts/drain-block-check.mjs` (the §0.1 first-command-of-every-drain guard) finds it. ' +
  'A master with NO leaf is invisible to that guard: it returns "? UNKNOWN" with **rc=0** instead of STOP, and its own output calls that ' +
  '"a bookkeeping finding, not a clearance." Not hypothetical — three consecutive fires (s1163/s1164/s1165) each reached for the same owner-gated ' +
  'master carrying it as "still absent, still authorable", precisely because it had no leaf; a fourth is now stopped. ' +
  'Missing goal-tree bookkeeping means the authoring duty is UNFINISHED.';

function patch(path, edits) {
  let s = fs.readFileSync(path, 'utf8');
  const before = s;
  if (s.includes('GOAL REGISTRATION LAW')) throw new Error(`${path}: already present — refusing to duplicate`);
  for (const [anchor, replacement] of edits) {
    if (!s.includes(anchor)) throw new Error(`${path}: ANCHOR MISSING, refusing to guess:\n  ${anchor.slice(0, 80)}`);
    if (s.split(anchor).length > 2) throw new Error(`${path}: anchor is AMBIGUOUS (appears >1x)`);
    s = s.replace(anchor, replacement);
  }
  // Purely-additive invariant: every original line must survive IN ORDER, either
  // verbatim or EXTENDED (original is a prefix of the new line — an in-line append,
  // which is how the §6 checklist gains a token). Still catches any deletion,
  // truncation or reordering. A plain equality check cannot express this: it strands
  // every line after an intentionally-extended one and reports phantom losses.
  const b = before.split('\n'), a = s.split('\n');
  let i = 0;
  for (const line of a) if (i < b.length && line.startsWith(b[i])) i++;
  if (i !== b.length) {
    throw new Error(`${path}: NOT purely additive — first unmatched original line ${i + 1}: ${JSON.stringify(b[i]?.slice(0, 90))}`);
  }
  fs.writeFileSync(path, s);
  console.log(`${path}: +${a.length - b.length} lines, 0 removed`);
}

const AT = '.claude/skills/author-task/SKILL.md';
const ledger = '- Same-commit ledger: add the BACKLOG ladder line WHEN you write the master (Completeness Law).';
const check = 'no-op guard present ✓ BACKLOG line written ✓.';
patch(AT, [
  [ledger, ledger + '\n' + GOAL_LAW],
  // Appended AFTER the original sentence, not spliced before its full stop, so the
  // original line is a strict PREFIX of the new one and the additive invariant holds
  // at full strength. The guard rejected the spliced form; the edit changed, not the guard.
  [check, check + ' Goal leaf in `tasks/goals.json`, same commit ✓.'],
]);
