// s1481 — compact the memory index under the 17.1KB limit WITHOUT dropping a single entry or
// link. Only the trailing recall-prose is shortened, and on the three topic-file lines the
// duplicated sub-hooks are removed because the topic file exists to hold exactly those.
// Anchored on filenames, never line numbers.
import { readFileSync, writeFileSync } from 'node:fs';

const P = '/Users/robin/.claude-fires/projects/-Users-robin-Claude-Projects-Gold-Rush/memory/MEMORY.md';

// [anchor filename, new trailing prose ('' = drop the tail entirely)]
const TRIMS = [
  ['measure-a-stale-patch-against-main-not-its-own-base.md)', ' — 699 of its 754 lines were already on main'],
  ['merge-a-lane-with-three-way-never-a-two-dot-diff.md)', " — main's own commits read as DELETIONS"],
  ['a-negative-grep-is-not-a-negative-result.md)', ' — one NUL byte silences grep for EVERY pattern'],
  ['refute-a-known-red-class-label-by-testing-its-premise.md)', ' — the label was scenery on a live regression'],
  ['re-run-the-same-commit-before-bisecting-a-number.md)', " — two answers ⇒ noise; no commit can be blamed"],
  ['validate-a-bisect-predicate-on-known-outcomes-first.md)', ' — all-BAD converges on an innocent commit'],
  ['investigation-inherited-reports-and-re-derivation.md)', ''],
  ['a-ladder-findings-dependency-list-is-systematically-pessimistic.md)', ' — decays BY DESIGN, in our favour'],
  ['run-the-sweep-a-finding-demands-before-authoring-it.md)', ' — 15 min; 3/4 already clean, finding closed'],
  ['mechanising-a-prose-rule-needs-a-narrower-scope-than-the-prose.md)', ' — MEASURE the discriminator'],
  ['majority-compliance-can-be-an-accident-not-the-guard-working.md)', ' — a coverage hole, not an authoring bug'],
  ['measure-the-corpus-before-narrowing-a-parser.md)', ' — the obvious whitelist fails CLOSED on 253'],
  ['a-guard-can-pass-by-reading-a-stale-subject.md)', ' — a string-match SELECTOR fails OPEN'],
  ['investigation-reading-reds-and-greens.md)', ''],
  ['a-merged-spec-can-regress-hygiene-by-where-it-writes.md)', ' — defaults overwrite retained evidence'],
  ['drain-duties-block-checks-and-triage.md)', ''],
];

const src = readFileSync(P, 'utf8');
const before = Buffer.byteLength(src);
const lines = src.split('\n');
let changed = 0;

for (const [anchor, tail] of TRIMS) {
  const idx = lines.findIndex((l) => l.includes(anchor) && l.lastIndexOf('.md)') === l.lastIndexOf(anchor) + anchor.length - 4);
  if (idx === -1) {
    console.error(`SKIP (anchor not the LAST link on any line): ${anchor}`);
    continue;
  }
  const l = lines[idx];
  const cut = l.lastIndexOf('.md)') + 4;
  const oldTail = l.slice(cut);
  if (!oldTail.trim()) continue;
  lines[idx] = l.slice(0, cut) + tail;
  changed += 1;
}

const out = lines.join('\n');
writeFileSync(P, out);
const after = Buffer.byteLength(out);
console.log(`trimmed ${changed}/${TRIMS.length} lines`);
console.log(`${before} -> ${after} bytes (saved ${before - after}); limit 17100 => ${after < 17100 ? 'OK' : 'STILL OVER'}`);
console.log(`entries (link count) before/after: ${(src.match(/\]\(/g) || []).length} / ${(out.match(/\]\(/g) || []).length}`);
