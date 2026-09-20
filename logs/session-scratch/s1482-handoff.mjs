import fs from 'node:fs';
import { execSync } from 'node:child_process';

const stamp = execSync('date "+%Y-%m-%dT%H:%MZ"').toString().trim();
const prev = fs.readFileSync('logs/session-scratch/s1481-line1.txt', 'utf8').replace(/\n$/, '');
const P = 'STATUS.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');

if (!/^ACTIVE .*s1482 fire/.test(lines[0])) {
  throw new Error('line-1 is not my ACTIVE lock — refusing to overwrite: ' + lines[0].slice(0, 120));
}
if (!/^Last updated: .*s1481 handoff/.test(prev)) {
  throw new Error('saved prior line-1 is not s1481\'s handoff — refusing to archive the wrong line');
}

const desk =
  '🔺 **OWNER’S DESK — 11 awaiting a word, 0 new this fire.** ' +
  '🔺 **F-1475-1** — still the highest-leverage word on the desk: `SUPPORTED_CONTRACTS` walls **30 of 42** contracts, so one ruling unblocks `e3-fairground` AND the 10 blocked E7/E8/E9 rows. **RECOMMENDED (c):** a diagnostics-only boot flag that bypasses the support gate for MEASUREMENT while leaving `SUPPORTED_CONTRACTS` (the playability CLAIM) untouched. · ' +
  '🔺 **F-1477-1** — tracked screenshot evidence churns 100% of the time (0/10 byte-stable); **RECOMMENDED: keep tracked and exempt `artifacts/**` from the pre-flight clean test.** · ' +
  '🔻 **F-1473-2** — three gate-cost rulings still waiting: root `halo-reextraction-check.mjs` into `test:node-guards` (+45.3 s; s1470 and s1473 both recommended **YES**)? Root `npm:test:asset-diet` (+52.3 s)? Root `npm:test:release` (~200 s, sole gate over the E1 release door)? **One word each.** ⓘ **Fresh datapoint for the first:** this fire added a guard for **+0.4 s** and the battery still runs in 149 s. · ' +
  '🟡 **F-1472-1 — VETO WINDOW STILL OPEN.** · 🟡 **F-1470-4** — 301 halo cells, 15 held sheets. · 🟡 **F-1462-1** — the two ER-02 rulings. · ' +
  '🟡 **F-1461-4** — ⚠️ **its desk placement is now DISPUTED and worth one look:** a scout sweep this fire read its gate as carrying no owner word at all and classed it fire-authorable, with three shipped sibling guards to copy. **I did NOT verify that myself**, so it stays on the desk rather than being quietly promoted — but the next fire should check before assuming an owner is owed. · ' +
  '🟡 **F-1461-6** — gates E7–E10; those four censuses have MERGED, so the ruling is no longer hypothetical. · 🟥 **F-1461-1** · 🟥 **F-1461-5** — runner-side, attended, inert until the runner restarts. · 🟢 **F-1471-1** — latent `objectiveAllowsSecure` width; inert today.';

lines[0] =
  `Last updated: ${stamp} s1482 handoff, lock CLEARED — ` +
  '🟩 **NO DRAIN EXISTED, SO I CLOSED F-1398-1 — THE FINDING THREE FIRES HAD PRICED AND NONE HAD BUILT, BECAUSE ITS PREDICATE WAS UNSETTLED. I SETTLED IT, AND THE MEASUREMENT CHANGED WHO IS GUILTY.** ' +
  '🔻 **BOARD AT LOCK: genuinely dry** — six queues empty, every done-move already `drained-`/`stopped-` prefixed, `tasks/failed/` all `shipped-`, assayer `pending/` empty, no CODEX-WALL, all four lanes `ahead=0` USABLE. **0 drains available, 0 of 3 budget used.** ' +
  '✅ **F-1398-1 CLOSED — `98690e837` + `c40b383d7`.** New `scripts/claimed-spec-harness-guard.mjs`, rooted in **both** `test:node-guards` and `test:ledger-guards`. ' +
  '📐 **THE PREDICATE WAS THE WHOLE SLICE, so here is the ruling and its price.** Over **1,144** tracked masters, **21** naming a claimed spec: arm **(a)** command-form-only = **2** · arm **(b)** command OR gate/adjacent context = **6** ← **CHOSEN** · arm **(c)** any mention = **12**. ' +
  '**(a) rejected**: it misses 4 real cases causing identical harm — a checklist line (*“Adjacent unmodified-green: `e2e/release-build.spec.ts`, both projects”*) sends the runner to the same unrunnable harness a bare command does; it just is not command-shaped, so a command-shaped regex never sees it. ' +
  '**(c) rejected**: its extra 6 are provably DESCRIPTIVE — verified by READING every one (two say only “adjacent to the F-1296-3 standing order”; one is a firewall NO-list plus a `git diff` path; three are the masters that CREATED the spec). A guard that flags description trains authors to paste boilerplate. ' +
  '⚠️ **THE HALF NOBODY HAD MEASURED — THE TIME DIMENSION.** This row has named `lane-b-approach-convergence-class.md` as a canonical offender since s1398 and prescribed it a correction note. It was authored `ec72d12bc` **2026-07-29, three days BEFORE `c8ed271c4` (2026-07-31T21:34)** made its command invalid. **It was correct when written.** Only **2 of 6** postdate the change — and they are **NOT the 2 arm (a) finds**: `f1397-1` (2026-08-02) and `lane-a-f1305-2` (2026-08-01T00:23, **under three hours after**, ordering 15 specs green when one had just become uncollectable). The other 4 are **GRANDFATHERED IN THE OPEN**, each carrying the commit proving it predates the rule. *Everyone had assumed the offenders were always-wrong; four of six were not.* ' +
  '✅ **CURE APPLIED TO THE 2 LIVE ONES BY APPENDING** a note naming the owning config — never editing the cited lines (F-1397-3). ' +
  '🔬 **PREMISE RE-VERIFIED EMPIRICALLY, NOT INHERITED:** `npx playwright test e2e/release-build.spec.ts --list` → **“No tests found” / “Total: 0 tests in 0 files”**. It fails LOUDLY, so nothing ever shipped on a false green; the cost was a runner cycle. ' +
  '🧪 **11/11, THREE of them MANUFACTURED defects** (command / checklist / gate-region) plus two negative controls proving arm (c) is deliberately NOT enforced — a green never executes the violation path. ' +
  '⚠️ **AND THE BATTERY CAUGHT A DEFECT IN MY OWN TEST:** first `test:node-guards` run went **rc=1** on `fixture-teardown` — my test leaked **8** temp dirs, invisible to its own 11 greens. Cured, then **tsc rc=0 + node-guards rc=0** (`artifacts/s1482-gate.txt`, run through `scripts/gate-battery.mjs` — s1481’s widened driver, dogfooded). ' +
  '🐛 **One self-inflicted bug worth the next author knowing:** the `` import.meta.url === `file://${process.argv[1]}` `` entrypoint idiom is **always false in this repo** — the path contains a space, which `import.meta.url` percent-encodes and `argv[1]` does not. My guard silently printed nothing and exited 0 on its first run: a gate that looks rooted and measures nothing. ⓘ **The class is already cured repo-wide** — I measured all of `scripts/`: every entrypoint uses `pathToFileURL`/`path.resolve`, and `ruling-propagation-guard.mjs:122` + `desk-declaration-guard.mjs:284` already carry the warning. **Not a new finding.** ' +
  '👻 **F-1415-1 RETIRED AS A GHOST LINE (Mistake #5)** — cured at `cf005d597`, but the row read 🟡 open for three days. **Verified by file-probe and `merge-base`, never by grepping commit messages (Mistake #16):** `scripts/component-boss-secure.test.mjs` exists, is named in `test:node-guards`, and covers exactly the REC’d component branch both ways. A grep of `gr-sim.test.mjs` looks empty because the cure landed in its own file — which is how it stayed invisible. ' +
  '⚠️ **PIPELINE-DRY: ALL FOUR LANES IDLE, AND THIS IS NOW STRUCTURAL, NOT AN OVERSIGHT.** A scout sweep of the whole ledger found **no unblocked product leaf**: every non-`merged` leaf in `tasks/goals.json` is owner-gated (`rf-04`/`rf-05` planned · `ap-03/04/05` conjunctive owner-greenlight `:5018,5023,5028` · `roster-wiring-e6-e10` post-launch-only `:1763` · `map-campaign-27` owner-test `:2300`). **Every remaining authorable item is a finding-cure, not a ladder rung.** s1481’s F-1481-2 bar on E7/E8/E9 era-sockets STANDS. ' +
  '🧪 **ASSAYER:** `pending/` empty. 📰 **TK-01:** coverage-day 2026-08-05 digest on disk — verified by listing, not inherited. 📰 **GZ-01: no item owed** — zero `src/` bytes, nothing player-visible. 🚀 **DEPLOY: skipped, correctly** (no gameplay code). 🎨 **ART slot untouched, no staging audit run** (s1469 carry stands: AT RISK 582 files / 527.89 MB, LOCAL-ONLY 0). 🧹 **`gate-s1455/` LEFT ALONE** — still another session’s worktree and an open desk item. 💾 **BACKUP: pushed.** 🩺 **`test:ledger-guards` RUN LAST** per F-1300-4. 🙏 **ATTENDED-OWED: still 1 open — `001-drain-skill-custody-rule.md`.** ' +
  '**NEXT: (A)** 🟢 **F-1461-4** — the scout’s pick and mine: smallest blast radius, three shipped sibling guards to copy, and s1461’s hand-retirement `a678fe3f0` is a ready-made manufactured-violation fixture. **Verify its desk placement first** (see the desk note). **(B)** 🟢 **F-1391-1** — `layerDrawCalls: 1` is a hardcoded literal in an evidence artifact (`e2e/run3d-rail-elements.spec.ts:70`); gate is a disjunction (measure it or delete it) so it cannot deadlock, and it is the only candidate with a real spec anchor (`specs/town-3d/RUN-RECIPE.md:20`). **(C)** 🟢 **F-1471-1** — two one-line edits, browser first then the sim mirror in the same slice; the row already proves it inert today. **(D)** 🟢 **F-1470-4** — 301 halo cells / 15 held sheets, still the largest body. **(E)** 🚫 **do NOT author era-sockets for E4–E10** until F-1475-1 is ruled. ' +
  desk;

// Archive s1481's handoff as the newest line-1 bullet, directly above s1480's.
const at = lines.findIndex((l) => l.startsWith('- **s1480 handoff (line-1 archive):**'));
if (at < 0) throw new Error('could not find the s1480 archive bullet to anchor against');
lines.splice(at, 0, `- **s1481 handoff (line-1 archive):** ${prev}`);

fs.writeFileSync(P, lines.join('\n'));

const after = fs.readFileSync(P, 'utf8');
const n = (after.match(/s1481 handoff \(line-1 archive\)/g) || []).length;
console.log('s1481 archive bullets:', n, '(expect 1)');
console.log('line-1 chars:', lines[0].length);
if (n !== 1) throw new Error('archive check FAILED');
