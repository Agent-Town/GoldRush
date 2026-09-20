// F-1455-1 (s1455) — GUARD: a review whose VERDICT refuses the merge must not sit un-bannered
// while its goal leaf says the slice shipped.
//
// WHY THIS EXISTS. A HOLD verdict has no enforcement surface (F-1295-1): it lives in a review file
// and a goal leaf, and nothing in git defends it or retires it. When a hold is satisfied by a
// SUCCESSOR slice, the successor gets its own review — and the held one is never reopened. So the
// refusal stays on disk, in the present tense, forever. s1454 found three such rows and banner'd
// them; s1455 re-derived the class independently and found TWO MORE that a sample of nine had
// missed (`gg-03-gazette-panel-swap`, blocked 2026-07-29 and discharged by the GG-03c ladder at
// `15e00755`; `m2-05-geometry-settle`, whose "The leaf does NOT close" outlived its own closure at
// `94ce3888` by fifteen fires). The cost of the class is Mistake #8 — re-queueing shipped work —
// and it is paid by the next reader, not by the fire that left the row.
//
// ⚠️ THE HARD PART IS THE CLASSIFIER, NOT THE LOOKUP, AND THIS GUARD IS SHAPED BY ITS OWN FIRST
// DRAFT BEING WRONG. s1455's first sweep matched HOLD|HELD|NOT MERGED|WITHHELD|BLOCKED anywhere in
// the verdict line and produced SIX hits, of which FOUR were its own bug:
//   `e2-rail-tough-only-bind`      "**MERGE — … the firewall HELD byte-for-byte**"
//   `f1420-1`                      "MERGE — gates green, scope 4's STOP condition HELD"
//   `eight-winds-e2-row-order-survey`  "**ACCEPTED** — … the wiring slice stays BLOCKED"
//   `art-e7-town-icons`            "QA PASS — reference-tier, extraction WITHHELD."
// Every one is a MERGE verdict whose prose happens to discuss holding, blocking or withholding —
// which is what review prose is *about*. A guard that reds on those trains fires to ignore it.
// ➡️ THEREFORE: classify on the DECISION TOKEN ONLY — the span before the first em-dash, period or
// comma — never on the sentence. The fixtures below pin all four false positives so the sentence
// form can never creep back in.
import test from 'node:test';
import assert from 'node:assert';
import { readdirSync, readFileSync } from 'node:fs';

// Paths are redirectable ONLY so the guard's red path can be exercised against a manufactured
// corpus without ever placing a known-broken file in main's working tree (§3.0b custody).
// ⓘ This cannot be used to SILENCE the guard: the instrument-validation test below asserts the
// corpus is large, so pointing these at a small or empty directory REDS the battery rather than
// greening it. A redirect can only ever make this guard louder.
const REVIEWS = process.env.GR_HOLD_GUARD_REVIEWS || 'reviews';
const GOALS = process.env.GR_HOLD_GUARD_GOALS || 'tasks/goals.json';

// A verdict that asserts the slice did NOT land. Matched against the decision token only.
const REFUSAL = /\b(HOLD|HELD|NOT\s+MERGED|NO\s+MERGE|WITHHELD|WITHHOLD|BLOCKED|REJECTED|REJECT)\b/i;

// Retiring markers. A banner naming the discharge is the prescribed cure (retention law: the
// original verdict is KEPT verbatim, so "fixed" can never mean "deleted").
const RETIRED = /\b(SUPERSEDED|SUPERSEDES|DISCHARGED|RETIRED|STALE)\b/i;

export function decisionToken(verdictLine) {
  return String(verdictLine)
    .replace(/^#+\s*VERDICT:?\s*/i, '')
    // strip markdown emphasis and leading emoji/punctuation so "**⛔ BLOCKED" reads as "BLOCKED"
    .replace(/[*_`]/g, '')
    .replace(/^[^\p{L}]+/u, '')
    // the decision is the span before the first em-dash / period / comma / colon
    .split(/\s+—\s+|\s+--\s+|[.,:;]|\s+-\s+/u)[0]
    .trim();
}

export function classifyReview(text) {
  const m = text.match(/^#+\s*VERDICT:.*$/im);
  if (!m) return null;
  const verdictLine = m[0];
  const start = text.indexOf(verdictLine);
  // The banner must live in the verdict's OWN block — before the next heading. A marker further
  // down the file is discussing some other slice, not retiring this verdict.
  const rest = text.slice(start + verdictLine.length);
  const nextHeading = rest.search(/^#+\s/m);
  const block = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return {
    verdictLine,
    decision: decisionToken(verdictLine),
    refuses: REFUSAL.test(decisionToken(verdictLine)),
    retired: RETIRED.test(block),
  };
}

function leafIndex() {
  const g = JSON.parse(readFileSync(GOALS, 'utf8'));
  const leaves = [];
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (n.id && (n.taskFile || n.mergeHash || n.status)) leaves.push(n);
    for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
  })({ subgoals: g.goals || [] });
  const byId = new Map(leaves.map((l) => [l.id, l]));
  const byTaskFile = new Map(leaves.filter((l) => l.taskFile).map((l) => [l.taskFile, l]));
  return { leaves, byId, byTaskFile };
}

// MEASURED s1455: no single key resolves the corpus — of 13 mappable non-merged verdicts, 6
// resolved by file stem, 4 by taskFile and 3 by the `**Slice:**` header. `gg-03-gazette-panel-swap`
// is the instructive one: its leaf id names the BLOCKED slice while its taskFile names the
// SUCCESSOR that discharged it, so a taskFile-only lookup would never have found the stale row.
function resolveLeaf(file, text, idx) {
  const stem = file.replace(/\.md$/, '');
  const sliceM = text.match(/^\*\*Slice:\*\*\s*`([^`]+)`/im);
  const slice = sliceM ? sliceM[1] : null;
  return (
    (slice && idx.byId.get(slice)) ||
    idx.byId.get(stem) ||
    idx.byTaskFile.get(stem + '.md') ||
    null
  );
}

const SHIPPED = /^(merged|shipped)$/i;

function sweep() {
  const idx = leafIndex();
  const files = readdirSync(REVIEWS).filter((f) => f.endsWith('.md'));
  const withVerdict = [];
  const stale = [];
  const unmapped = [];
  for (const f of files) {
    const text = readFileSync(`${REVIEWS}/${f}`, 'utf8');
    const c = classifyReview(text);
    if (!c) continue;
    withVerdict.push(f);
    if (!c.refuses || c.retired) continue;
    const leaf = resolveLeaf(f, text, idx);
    if (!leaf) { unmapped.push(f); continue; }
    if (SHIPPED.test(leaf.status || '')) {
      stale.push(`${f} — verdict "${c.decision}" but leaf ${leaf.id} is "${leaf.status}"`);
    }
  }
  return { files, withVerdict, stale, unmapped };
}

// ---------------------------------------------------------------------------
// Instrument validation FIRST: a guard that silently stopped finding anything would pass forever.
test('the sweep still sees the corpus it judges', () => {
  const { files, withVerdict } = sweep();
  assert.ok(files.length > 300, `expected the reviews corpus; saw ${files.length} files`);
  assert.ok(
    withVerdict.length > 50,
    `expected many parsed VERDICT lines; saw ${withVerdict.length}. If this collapsed, the ` +
      `heading form changed and this guard has been reading nothing.`
  );
});

// The classifier's OWN false positives, pinned. Each string is a real verdict line from the
// corpus that a substring matcher wrongly convicted (s1455 first draft).
test('a MERGE verdict whose prose discusses holding is not a refusal', () => {
  const merges = [
    '## Verdict: **MERGE — scope 1 PASSED with a real measurement, the firewall held byte-for-byte.**',
    "## VERDICT: MERGE — gates green, scope 4's STOP condition held, and both halves were re-proven.",
    '## Verdict: **ACCEPTED** — merged as evidence. The wiring slice stays blocked, which is correct.',
    '## VERDICT: QA PASS — reference-tier, extraction WITHHELD.',
    '## VERDICT: MERGED — both slices',
  ];
  for (const line of merges) {
    const c = classifyReview(line + '\n\n## What it does\n\nbody\n');
    assert.strictEqual(
      c.refuses,
      false,
      `classified as a refusal on prose, not on its decision token ` +
        `(token was "${c.decision}"): ${line}`
    );
  }
});

test('a genuine refusal is still caught in every form the corpus uses', () => {
  const refusals = [
    '## VERDICT: HOLD — NOT MERGED',
    '## VERDICT: **HOLD — NOT MERGED.** Code accepted on its own evidence; blocked on a sibling.',
    '## VERDICT: ⛔ BLOCKED — do not merge. The slice is well-built and it breaks a sibling suite.',
    '## VERDICT: NOT MERGED — there is nothing to merge, and that was **lawful**.',
    '## VERDICT: **HELD — not merged.** The deliverable is PROVEN; the slice is not.',
  ];
  for (const line of refusals) {
    const c = classifyReview(line + '\n\n## What it does\n\nbody\n');
    assert.strictEqual(c.refuses, true, `missed a real refusal (token "${c.decision}"): ${line}`);
  }
});

test('a supersede banner retires the verdict, but only inside the verdict block', () => {
  const line = '## VERDICT: HOLD — NOT MERGED\n';
  const inBlock = classifyReview(line + '\n> ⚠️ **SUPERSEDED s1455** — merged at abc1234.\n\n## What it does\nbody\n');
  assert.strictEqual(inBlock.retired, true, 'a banner in the verdict block must retire it');
  const elsewhere = classifyReview(line + '\n\n## What it does\n\nthis SUPERSEDED some other slice\n');
  assert.strictEqual(
    elsewhere.retired,
    false,
    'a marker under a later heading is prose about another slice and must NOT retire this verdict'
  );
});

// ---------------------------------------------------------------------------
test('no shipped slice is left carrying a live refusal verdict', () => {
  const { stale } = sweep();
  assert.deepStrictEqual(
    stale,
    [],
    `Reviews whose VERDICT still refuses the merge while their goal leaf says the slice shipped.\n` +
      `A fire reading only that line concludes the slice is unmerged and owed work — Mistake #8.\n` +
      `CURE: add a supersede banner naming the discharging commit, verified BY ANCESTRY\n` +
      `(git merge-base --is-ancestor <hash> main), directly under the VERDICT line. KEEP the\n` +
      `original verdict verbatim — retention law: supersede, never delete.\n` +
      `Offenders:\n  ` + stale.join('\n  ')
  );
});

// Unmapped reviews are REPORTED, never red: an unmatched review is goal-leaf debt (F-1448-6,
// 526 of 762 masters carry no leaf), a different finding with a different owner. Reddening the
// battery for it would punish this guard's users for someone else's backlog.
test('unmappable reviews are surfaced as leaf debt, not treated as clearance', () => {
  const { unmapped } = sweep();
  if (unmapped.length) {
    console.log(
      `  ⓘ ${unmapped.length} refusal verdict(s) have no goal leaf, so this guard cannot judge ` +
        `them (F-1448-6 leaf debt): ${unmapped.join(', ')}`
    );
  }
  assert.ok(unmapped.length < 40, `unmapped refusals exploded to ${unmapped.length}; lookup likely broke`);
});
