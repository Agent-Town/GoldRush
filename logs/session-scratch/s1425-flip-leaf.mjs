import fs from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));
const ft = g.goals.find((x) => x.id === 'factory-infra').subgoals.find((x) => x.id === 'factory-truth');
const leaf = ft.tasks.find((t) => t.id === 'f1424-2-reject-visibly-in-the-janitor-queue');
if (!leaf) throw new Error('leaf not found');

leaf.status = 'merged';
leaf.mergeHash = '2921d2ce7c056d1a64f46a1376e9941e677a68d2';
leaf.attempts = 2;
leaf.closureReason = [
  'Drained s1425. The unknown-op fall-through in lane-runner-v3.sh now files rejections as janitor-REJECTED-<epoch>-<name> and echoes the offending first line plus the two-line contract, while the success path keeps the exact janitor-<epoch>-<name> shape 56 archived files already carry. Parser and accepted case arms byte-identical; the cure is visibility, not a wider parser (Mistake #14).',
  'Gated on the merged tree in detached worktree gate-s1425 (fire.md §3.0b): tsc rc 0, build green, test:node-guards 275 tests / 272 pass / 0 fail / 3 known F-1408-2 fire-shell skips, test:ledger-guards 42/42 plus every downstream audit and the new guard, bash -n clean, git diff vs main on src/ and e2e/ EMPTY, no Playwright (zero rendering surface).',
  'THE RED WAS MANUFACTURED BY THE DRAINING FIRE, NOT READ FROM THE RUNNER: reverting only lane-runner-v3.sh gives rc 1 with SEVEN failures — the runner had pasted five, the two extra being the "has no success filename" assertions. The difference runs in the safe direction but is recorded, because a report that under-states its own red is the same shape as F-1424-4 filed one fire earlier.',
  'The guard is non-vacuous by construction: it EXTRACTS the real janitor block from lane-runner-v3.sh with awk instead of re-implementing it ("A copy of the dispatch logic would stay green while the runner regressed"), exits 2 on extraction misuse so a future refactor fails loudly, and its z-valid case proves archive_prefix cannot leak from a rejected request into a successful one processed in the same cycle.',
  'Law pointers re-based and VERIFIED BY READING the merged file, not by trusting --update: CLAUDE.md §4.10b now cites :169 (the .git scratch sweep) and :171 (the DO-NOT-RESTORE prune epitaph, present and intact — no RETENTION LAW violation). The baseline diff against main is exactly those two coordinates with both fingerprints unchanged.',
  'Merge classification: base 8c4b3a3f, all five paths LANE-TOUCHED-only (main unmoved on every one since the base), landed byte-identical to lane tip a11d76cf — no 3-way, no conflict surface.',
  'F-1425-1 filed non-blocking: the master authorised law-pointer-guard --update in scope 4 but omitted scripts/law-pointer-baseline.json from TOUCH-ONLY, so the drain firewall was ambiguous exactly where it should be sharpest. Edit verified correct; nothing owed beyond the note.',
].join(' ');

fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('flipped', leaf.id, '->', leaf.status, leaf.mergeHash);
