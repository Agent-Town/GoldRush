import fs from 'node:fs';

// 1. Two declaring rows in BACKLOG — each one's FIRST F-ID inside the first 90 chars.
const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const anchor = lines.findIndex((l) => /^- ✅ \*\*THE AGENT SEAT — MERGED s1499/.test(l));
if (anchor < 0) { console.log('ANCHOR MISS'); process.exit(1); }

const rowA =
  '- 🟢 **F-1499-1 (s1499, MEASURED AT THE DRAIN — NON-BLOCKING, NO OWNER WORD NEEDED): a milk shift mirrored its DERIVED table into `reviews/` and believed its evidence preserved; the RUNS it was derived from were in no object database.** ' +
  'The ER-02 review cites `logs/session-scratch/er02/` as holding *every view, submission and receipt*. Measured at drain time: **701 files / 6.62 MB, of which 597 blobs (4.93 MB) existed on one disk only** — untracked in the milk worktree, and `logs/session-scratch/` is **not gitignored**, so nothing was refusing them; nobody had asked. ' +
  'The shift mirrored **104 of 701** blobs (`card-table.json` + the tapes). That preserves the ARITHMETIC a reader can check and destroys the RUNS a reader could re-derive or re-run — the difference between a citable result and a reproducible one. Salvaged to the same path on main at `d20dcd82` (Retention Law) so the review’s §14 citations still resolve. ' +
  '⭐ **THE CLASS, not the instance: this is the ART-slot F-1045-1 shape in a second slot nobody had counted.** `worktrees/art/` was found holding 10 files / 16.5 MB in no commit, the oldest for 14 days; `gr-milk-*` worktrees have exactly the same property and eight of them existed this week. **GATE: a cheap standing guard — refuse to remove a worktree (or close a shift) while any file under it is in no object database.** `scripts/art-staging-audit.mjs` already answers this question for one slot; the fix is to widen its denominator, not to write a second script (F-1054-1/F-1055-1 both fixed that audit by CLASS after it shipped a false zero twice).';

const rowB =
  '- 🔺 **F-1499-2 (s1499, OWNER DESIGN FORK — raised by the ER-02 rehearsal at `reviews/standing-orders-rehearsal-e2.md` §13(2), merged `4839c2ad`): DOES A HEADLESS RIDER GET A BODY?** ' +
  'Both AGENT-READY-rated E2 contracts were played at both tiers on both pinned bench seeds — **8 metered runs, 0 secured** — and they fail for the SAME reason: the headless hero is `IDLE_INTENTS` forever. It cannot move. So it is parked 12 wu from the rail its boss rides while holding a 10 wu weapon, and the works it can buy last four tenths of a second. ' +
  '`e2-incline` is rated AGENT-READY and kills the rider at **wave 2 of 12** on both seeds at both tiers, with or without works. `e2-trestle` has no terminal outcome because nothing that can reach the Railcar survives and nothing that survives can reach it — **that is not a horizon problem to be fixed with a wider ceiling; it is the map telling the truth about an actor that cannot walk.** ' +
  '**THE FORK: (a) the headless sim grows a movement/progression path — the E2 maps then become playable as drawn; or (b) GR-SIM’s contracts are declared *works-only* puzzles and the E2 maps are balanced for a stationary hero.** ' +
  '**RECOMMENDATION: (a).** The maps were drawn for someone who can walk, and (b) retires that map work rather than using it. ⓘ Not fire-authorable: §2E bars a fire from choosing between (a) and (b), and either answer changes what every future rehearsal measures. ' +
  '⚠️ **Related but SEPARATE, do not fold them together:** the census’s AGENT-READY column is measured by a completability probe that hands the hero **100,000 HP and a 1,000-damage rig with 300 range** (`e2e/er01-e2-census.spec.ts:92`, `:95-96`), and its verb check asserts seven order forms are ACCEPTED, not that any can EXECUTE. **F-ER02-15: "7/7 grammar forms" measures the validator; this rehearsal is the first thing to measure the executor.** Re-running that probe without the god-hero rig is a separate, fire-authorable slice and does not need this ruling.';

lines.splice(anchor, 0, rowA, rowB);
fs.writeFileSync(p, lines.join('\n'));
console.log('two declaring rows inserted at line', anchor + 1);

// 2. Line-1: the invented placeholder becomes the real, now-declared id.
const s = 'STATUS.md';
const sl = fs.readFileSync(s, 'utf8').split('\n');
const before = sl[0];
sl[0] = sl[0].replace('F-ER02-NEW (ADDED THIS FIRE, and it is the fork the whole E2 epoch now waits on)', 'F-1499-2 (ADDED THIS FIRE, and it is the fork the whole E2 epoch now waits on)');
if (sl[0] === before) { console.log('LINE-1 ANCHOR MISS'); process.exit(1); }
fs.writeFileSync(s, sl.join('\n'));
console.log('line-1 desk id fixed: F-ER02-NEW -> F-1499-2');
