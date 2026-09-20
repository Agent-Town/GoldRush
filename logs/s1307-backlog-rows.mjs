// s1307 — close F-1305-2 (drained), disambiguate the F-1304-2 ID collision,
// and raise F-1307-1/2/3. Written as a file because the bash gate treats
// backticks in an inline -e string as command substitution.
import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const b = fs.readFileSync(p, 'utf8').split('\n');

// --- 1) Close F-1305-2 (drained this fire) ---
if (!b[21].startsWith('\u{1F535} **F-1305-2')) throw new Error('row 22 moved: ' + b[21].slice(0, 80));
b[21] = '✅ **F-1305-2 (s1305, OBSERVED — ✅ CURED s1307 at `d596f9120f84febbf21c4f82d56b6d5b840b9017`: the 16 uniform specs now import ONE `e2e/support/console-watch.ts` carrying the proven literal-prefix filter; the 5 divergent-contract specs remain local and are named in the review, per the master scope. Guarded by `scripts/console-watch-single-source.test.mjs`, rooted in `test:node-guards` and proven by manufacturing the defect. Evidence: `reviews/f1305-2-console-watch-single-source.md`.)** '
  + b[21].slice(3);

// --- 2) Disambiguate the F-1304-2 collision ---
if (!b[27].startsWith('\u{1F535} **F-1304-2')) throw new Error('row 28 moved: ' + b[27].slice(0, 80));
b[27] = b[27].replace(
  '\u{1F535} **F-1304-2 (s1304, MEASURED',
  '\u{1F535} **F-1304-2 (s1304, MEASURED — ⚠️ ID COLLISION, see F-1307-3: `reviews/ap-11-mechanics-manifest.md:97` also declares an "F-1304-2" (the missing goal leaf, marked closed). THIS row — the deploy alias window — is the one every handoff since s1304 cites, and it remains OPEN and fire-authorable. ⚠️ Premise RE-VERIFIED s1307 by reading the code: `scripts/deploy.sh:116`-`:133` is a 3-attempt loop with `sleep 15` between, so total patience is ~30s. Whoever authors the cure must give it a testable seam — a lane runner cannot execute a real Cloudflare deploy, so "run deploy.sh" is not an acceptance bar',
);

// --- 3) Raise this fire's findings, immediately after the F-1305-2 row ---
const rows = [
  '',
  '\u{1F7E1} **F-1307-1 (s1307, MEASURED — THE LANE RUNNER *COPIES* queue→running, SO A FINISHED TASK IMMEDIATELY RE-RUNS ITSELF).** Run `20260801-002355` of `lane-a-f1305-2` completed READY-FOR-GATES (300,016 tokens) and done-moved; **14 seconds later the runner started run `20260801-004329` of the same master**, because the queue entry is copied rather than moved and survives the done-move. The duplicate burned **24,818 tokens for zero output**. ✅ **It was contained, and by exactly the right mechanism:** the master\'s safe-dupe pre-flight (`node scripts/lane-usable.mjs lane-a` must print `USABLE`) read **`HOLDS`** against run 1\'s own committed work and stopped without changes, reporting the word verbatim. **Had that master used a bare `reset --hard` pre-flight, run 2 would have destroyed run 1 — Mistake #2 exactly.** So this is a COST finding, not a data-loss one, and it is standing evidence that the safe-dupe template earns its keep. Cheap cure: `mv` the queue entry instead of `cp`, or delete the queue copy at done-move. Fire-authorable.',
  '',
  '\u{1F7E1} **F-1307-2 (s1307, MEASURED — `logs/suite-red-inventory.md` LINE COORDINATES ROT WHENEVER A SPEC IS EDITED ABOVE A CITED LINE).** This drain shifted lines in 4 cited specs, rotting **18 citations**; all 18 repaired in the drain commit, **each verified by unique content match rather than by applying the net delta — which would have been wrong.** `asset-diet:101→:102` and `release-build:160→:161`/`:199→:200` moved **+1** (they sit above the deleted block but below the added import) while `cw-02-escort:134→:128` and `agent-view:283→:268` moved down 6 and 15. ⚠️ **Three were deliberately left alone and are NOT from this merge:** `release-build:107` and `:165` are generic brace lines with no unique content match, and **`release-build:393` already exceeded that file\'s 349 lines at HEAD** — pre-existing rot. ⓘ Severity is low **because the fingerprint\'s load-bearing columns are file + test name + project + error text**, and the line is supplementary — this very drain matched `cw-02-escort` on those three despite the stale line. Recorded so the class is known; not worth a guard yet.',
  '',
  '\u{1F7E1} **F-1307-3 (s1307, MEASURED — `F-1304-2` NAMES TWO DIFFERENT FINDINGS, AND THE GUARD CANNOT SEE IT).** `reviews/ap-11-mechanics-manifest.md:97` declares *"F-1304-2 — the master shipped without a goal leaf (closed by this drain)"*; `tasks/BACKLOG.md:28` declares F-1304-2 as the OPEN `deploy.sh` alias-window finding. Both minted by s1304. A fire grepping the ID meets one row marked closed and one open with different subjects — the "half-retired ledger entry is worse than none" hazard, and precisely the shape that could retire live work by accident. ⚠️ **`findings-state-guard` is blind to it**: both rows are \u{1F535}, and the census counts only \u{1F7E1} and ✅ (the same blind spot s1305 hit with \u{1F7E0}). Disambiguated in the BACKLOG row this fire rather than by renumbering, because three handoffs already cite BACKLOG\'s F-1304-2 by ID. **The general cure — make the census see \u{1F535}/\u{1F7E0} rows, or guard ID uniqueness — is fire-authorable.**',
];
b.splice(22, 0, ...rows);

fs.writeFileSync(p, b.join('\n'));
console.log('F-1305-2 CLOSED; F-1304-2 disambiguated; F-1307-1/2/3 raised');
