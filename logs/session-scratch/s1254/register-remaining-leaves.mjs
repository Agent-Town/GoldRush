// s1254: discharge the rest of F-1254-1 — register the two owner-authored masters that landed
// with no goal leaf, so the next fire's §3.0 check answers from the tree instead of UNKNOWN.
// Status 'building' is the vocabulary's word for built-but-not-merged (allowed set:
// scripts/goal-tracker.test.mjs:56). It clears drain-block-check, which is the correct verdict:
// neither is owner-blocked or terminal-closed. The DRAIN flips each to 'merged' with its hash.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/goals.json';
const g = JSON.parse(readFileSync(P, 'utf8'));
const bucket = g.goals[0].subgoals[0].tasks;

const anchor = bucket.findIndex((t) => t.id === 'gg-02-greenhorn-gazette-art');
if (anchor < 0) throw new Error('anchor gg-02 not found — refusing to guess placement');

const leaves = [
  {
    id: 'gg-04-mandatory-welcome',
    title:
      'THE MANDATORY WELCOME — the town greets every new face unasked: the first-time question leaves profile creation (name only) and the welcome auto-arms for fresh profiles, never for imported ones.',
    taskFile: 'lane-mandatory-welcome.md',
    status: 'building',
    lane: 'lane-c',
    authoredBy: 'owner (5ffd80f7 2026-07-30) — "owner: ongoing herald illustration begins + mandatory welcome ruled + practice claim specced"',
    spec: 'specs/greenhorn-gazette/README.md §THE MANDATORY WELCOME (owner ruling 2026-07-30, verbatim therein)',
    registeredBy:
      's1254 fire — F-1254-1 repair. The master shipped with no leaf, so drain-block-check answered "? UNKNOWN", which is a bookkeeping finding and NOT a clearance.',
    note_s1254:
      'AWAITING DRAIN. Runner output is lane/e2-arsenal 40ea99a4 (12 files: profile creation, welcome arming, 5 e2e specs incl. release-build.spec.ts + trail-guide.spec.ts). ⚠️ DRAIN BY CHERRY-PICK OF 40ea99a4 ALONE — its PARENT 6c44c6f3 (ap-06b-panel-ladder-and-voice) is a terminal-closed leaf that drain-block-check refuses with "⛔ CLOSED"; merging the branch would land owner-gated work past a lawful stop. Base is 176 behind main, so the two-dot branch diff is stale-base phantom. The master self-check names the release-build first-player spec, which is 138 s and config-owned (F-1251-1).',
  },
  {
    id: 'gg-03d-herald-class-engravings',
    title:
      'The Claim Herald\'s ongoing class engravings — the eight class dispatch plates, generated in the ART slot as the herald illustration goes on.',
    taskFile: 'art-herald-class-engravings.md',
    status: 'building',
    lane: 'art',
    authoredBy: 'owner (5ffd80f7 2026-07-30) — "ongoing herald illustration begins"',
    registeredBy: 's1254 fire — F-1254-1 repair (same gap as gg-04 above).',
    note_s1254:
      'AWAITING THE DRAIN CEREMONY, NOT THE BYTES. The 8 raws are ALREADY ON MAIN: the art runner committed them itself in b00194fa with a repo-root broad add (F-1253-3), which also swallowed the whole of the s1253 fire into that commit — so the art batch\'s drain diff is CONTAMINATED with a guard slice and must be classified per-file, never by the commit. Still owed: extract-alpha, contract wiring, in-game review, LEDGER entry, reviews/ file. Any fire touching this slot also owes `node scripts/art-staging-audit.mjs` and must report BOTH its AT RISK and LOCAL-ONLY counts (fire.md §2E ART-SLOT LAW).',
  },
];

for (const leaf of leaves) {
  if (bucket.some((t) => t.taskFile === leaf.taskFile)) throw new Error(`leaf exists: ${leaf.taskFile}`);
}
bucket.splice(anchor + 1, 0, ...leaves);
writeFileSync(P, JSON.stringify(g, null, 2) + '\n');
console.log('registered', leaves.map((l) => l.id).join(' + '), '— leaves now', bucket.length);
