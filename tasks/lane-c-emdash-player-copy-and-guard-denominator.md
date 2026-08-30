# Task lane-c-emdash-player-copy-and-guard-denominator: the em-dash law reaches the strings a player actually reads, and the guard stops certifying a corpus it never scans (lane-c, prefix "fix:")

**FIRE-AUTHORED s2367 (attended review welcome).** Discharges the one fire-authorable item filed by the attended F-SHOW-0830 triage (`tasks/BACKLOG.md:1`, 2026-08-30, commit `03ef4af44`), and cures the mechanism that let it happen.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `CLAUDE.md` §4 (evidence-first), §6 (quality bars), §9 (canon); `scripts/no-emdash-guard.test.mjs` (46 lines — the whole file, it is the subject); `src/ui/LanternShow.ts` around the `lantern-agent-honesty` block; `src/game/RunSuspend.ts` at `RUN_SUSPEND_REJECTION_LINE`; `e2e/agent-reels.spec.ts` lines 30–55.

## WHY — quoted evidence, not vibes

**The law (owner, 2026-08-23, verbatim, recorded at `tasks/BACKLOG.md:358`):**
> "can you also remove the emdashes from the page, game and everything? They scream 'this was made by AI' and that is not necessary"

**The live violation (attended, 2026-08-30, `tasks/BACKLOG.md:1`, F-SHOW-0830 ③):**
> "Minor: the banner copy carries an em-dash (LanternShow.ts:228/:253) against the owner's no-em-dash law - fire-authorable one-liner with its e2e string assertions checked."

**Why it is not merely a typo — the timeline, measured s2367, not inherited:**
- The `c5-emdash-sweep` swept the game surfaces and merged **2026-08-23T15:39** (`ddcde57f0`).
- The em-dash was **re-introduced two days later**, **2026-08-25T22:09**, by `982926333` `runner(lane-d): lantern-show-agent-honesty.md`, into the flagship reel's honesty banner.
- `scripts/no-emdash-guard.test.mjs` was **green the entire time**, and is green today.

**The mechanism — the guard's denominator is narrower than the law it enforces.** Read the file: it scans exactly two corpora — `public/*.{md,txt}` (line 33) and `assets/contracts/*/contracts.json` restricted to the `HUMAN_TEXT_KEYS` allowlist (lines 8–12, 37–42). **It does not read one line of `src/`.** But the c5 sweep it was built to protect *did* cover `src/` ("src/news templates (37 lines), UI/playbook/blurb strings" — `tasks/BACKLOG.md:358`). So the sweep cleaned a corpus the guard never watches, and the very next slice to touch player copy silently regressed it. This is the house shape: a guard that asserts a principle where it holds and never where it fails certifies its own blind spot.

**The owner is the one who noticed.** He watched the Baron crown reel with this banner up and called the whole thing fake. The banner is the one piece of copy whose entire job is to be believed.

## Scope — numbered, each item independently testable

### 1. Fix the three player-facing em-dashes. Editorial rewrite, never transliteration.

House style is set by c5 and is binding here: *"Rewrites are editorial (colon/comma/semicolon/period per sentence), never transliteration."* Do **not** swap `—` for `-` or `--`. Re-punctuate the sentence. The middot `·` is already this codebase's accepted inline separator (`F-LB-0829`: "middots, not em dashes").

1a. `src/ui/LanternShow.ts` — the `lantern-agent-honesty` text (line 228 at time of writing; **find it by content**, `This is a browser APPROXIMATION of a machine ride.` — coordinates rot, the string does not). The trailing clause `${this.tape.eventLogHash} — replayed exactly on the county's engine.` becomes a sentence: `${this.tape.eventLogHash}. Replayed exactly on the county's engine.`

1b. `src/ui/LanternShow.ts` — the divergence ending (line 253 at time of writing; find by content, `The approximation diverged from the verified ride at wave`). `at wave ${state.divergedAtWave} — exact replay runs on the county's engine.` becomes `at wave ${state.divergedAtWave}. Exact replay runs on the county's engine.`

1c. `src/game/RunSuspend.ts` — `RUN_SUSPEND_REJECTION_LINE`. It is player-facing: it is returned as `message:` on save rejection at `SaveSlots.ts:288`, `ProfileTransfer.ts:349` and `RunSuspend.ts:2818`. `'Saved claim set aside — snapshot from an older build.'` becomes `'Saved claim set aside. This snapshot is from an older build.'`

### 2. Move the pins in the SAME commit as the copy.

- ⚰️ **CITATION RETIRED s2374 — the cited test NO LONGER EXISTS, and its coordinate is deliberately written as prose so it can no longer be read as a live claim.** This master (SHIPPED s2371) cited `e2e/agent-reels.spec.ts` at line 36 — "the verified Dry Gulch agent reel is labeled as an approximation and ends honestly" — a full literal `toContainText` carrying the em-dash, to be updated to match 1a byte-for-byte. **The EH-3 `true-reel-show` merge (`af85497537fb973b8798089794498ff9b2974110`) RETIRED that test outright: it removed the agent-reel approximation path the test described, so there is no approximation left to label.** Text retained verbatim above per the RETENTION LAW — superseded, never erased.
- ⚰️ **CITATION RETIRED s2374, same cause.** This master cited the same spec at line 49 — the same test title — as a **regex** carrying the em-dash, to be updated to match 1b; both citations lived inside that one test, so one red named both. **Retired by the same EH-3 merge.** ⓘ These two lines are why `citation-title-guard` reddened in the s2374 closing battery: a SHIPPED master citing a spec that a later slice rewrote. That is ordinary historical decay of a completed master, not debt — but a coordinate that cannot resolve manufactures a false accusation in a ledger, so it is retired rather than left to accuse.
- `e2e/restore-validation.spec.ts:799` **imports the constant** (`RUN_SUSPEND_REJECTION_LINE`) rather than duplicating the string, so it moves for free. **Verify this rather than assuming it** — re-run that spec.

A copy change that leaves a pin behind is a red board for everyone; a pin change that leaves the copy behind is the defect surviving its own fix.

### 3. Widen the guard by INVERSION — enumerate what to SKIP, so the set fails SAFE.

Extend `scripts/no-emdash-guard.test.mjs` to scan **every tracked `src/**/*.ts` for em-dashes in string literals**, keeping its existing `public/` and contracts coverage untouched.

- **Strip comments before judging.** c5 ratified comments as out of scope ("comments explicitly OUT of scope (not rendered)") and there are **769** of them in `src/` — a guard that reds on those fires on every slice and is excused into uselessness within a week (F-1460-1, the `cross-engine` fate).
- **Do not hardcode the in-scope file list.** A new UI file with an em-dash must land in the subject set automatically. Enumerate the EXCEPTIONS instead.
- **Declare the scan space on stdout on every run, including the happy path** (F-2208-1, and the `gazette-scan-space-guard` precedent): print the number of files scanned and the number skipped. A `0` over an unnamed corpus is indistinguishable from a `0` over a corpus that excluded everything.
- **Each exception carries its reason as a comment.** An unexplained allowlist entry is how this defect gets re-introduced.

**The exception list, measured s2367 — 12 sites, each verified by reading it:**

| Site | Why it is exempt |
|---|---|
| `src/game/SaveSlots.ts` (`NAME_RULE`) | **Structural.** The em-dash is a member of a regex character class that *permits* em-dash in profile names. Removing it changes validation behaviour and would reject existing names. |
| `src/story/ceremonyPostscripts.ts` | **Structural.** The em-dash is a parser token in a `matchAll` regex matching `### Ceremony postscript — T(n)` headings in an existing dispatch document. Changing it breaks parsing. |
| `src/world/SteamPlume.ts`, `src/world/Water.ts` | **Comments inside GLSL shader template literals.** A JS comment-stripper cannot see `//` inside a shader string, so these read as code to a naive scanner. They are comments and are out of scope. |
| `src/sim/HeadlessContractSim.ts`, `src/sim/SeatedLockstepSim.ts`, `src/sim/SeatOrders.ts`, `src/agent/MechanicsManifest.ts` | **Agent/machine-facing, pending a ruling — see §4. Do NOT edit these.** |

### 4. REPORT, do not fix: the six borderline sites.

These are **out of scope** and touching them is a firewall violation. Report them in your run report so a ruling can be taken:

- `src/sim/HeadlessContractSim.ts:205,227` — `reason:` fields in the bench-verdict table (paired with `citation: 'reviews/...'`).
- `src/sim/SeatedLockstepSim.ts:381` — the `onNotice` seat-resignation notice.
- `src/sim/SeatedLockstepSim.ts:410` — a `throw new Error` for a room with no ride setup.
- `src/agent/MechanicsManifest.ts:492` — `handholds: 'soft — never a wall'`, part of the AI-agent manifest.
- `src/sim/SeatOrders.ts:157` — a rejected-order validation `message:`.

The owner's law says "the page, game and everything". Whether an **agent-facing manifest and error path** counts as "the game" is a judgement, not a mechanical fact, and a fire does not invent scope. Say what you found and stop.

⚠️ **Editing any file under `src/sim/` or `src/agent/` would also drag `npm run test:node-guards` into this slice's mandatory battery as a sim-touching change and put the Baron determinism pin at risk (F-2235-5: contract prose sits inside `eventLogHash`).** That is the second reason these are NO.

## Firewall

**TOUCH-ONLY** (exactly six files):
- `src/ui/LanternShow.ts`
- `src/game/RunSuspend.ts`
- `e2e/agent-reels.spec.ts`
- `scripts/no-emdash-guard.test.mjs`
- `tasks/goals.json` (your leaf's status only)
- your run report

**NO:**
- **NO** edits under `src/sim/`, `src/systems/`, `src/entities/`, `src/agent/` — see §4.
- **NO** edits to `src/game/SaveSlots.ts` or `src/story/ceremonyPostscripts.ts` — structural em-dashes, §3.
- **NO** touching `assets/contracts/**` — moving contract prose moves `eventLogHash` and re-pins the Baron (F-2235-5).
- **NO** comment rewrites anywhere. 769 em-dashes live in comments and they are ratified out of scope.
- **NO** widening the guard to comments, to `docs/`, `tasks/`, `reviews/`, or to `scripts/**` — those are factory surfaces, not player copy.
- **NO** new npm scripts. The guard is already rooted in `test:node-guards`; keep it there.
- **NO** `git add -A`. Path-scoped adds only.

## Pre-flight (LANE-C, branch `lane/c` — SAFE-DUPE, judge by CONTENT not ahead-count)

1. `lane/c` was re-measured `ahead=0 behind=210` USABLE, `tracked-dirt=0`, by s2368. **Verify it yourself before resetting, with a DIRECTIONAL instrument:**
   ```
   node scripts/lane-usable.mjs lane-c     # expect USABLE (rc=0)
   git log main..lane/c --oneline          # expect EMPTY — this is the decisive check
   ```
   `main..lane/c` empty means the lane holds **no commit main lacks**, so there is nothing a reset could destroy. If either says otherwise — `HOLDS`, `DIRTY`, `BUSY`, or any commit listed — **STOP and report** "lane/c has unmerged code: `<files>`" — do NOT reset over it (LANE-SAFETY LAW; the Reset Massacre, Mistake #2).

   🚫 **DO NOT judge this by `git diff --stat main lane/c` — an earlier draft of this pre-flight did, and it is a FALSE-STOP TRAP (measured s2368, before dispatch).** That is a two-dot **tree** diff, so it reports every way the two trees differ **without direction**: run today it prints **56 files, +127 / -7400**, including `src/game/Game.ts | 61 ++---`. Every one of those insertions is the *older* side of a line main has since changed — the lane is 210 commits **behind**, not unique — but it reads exactly like "lane-unique `src` content that is not on main", which this step's own wording tells you to STOP on. A run that stops there burns its whole budget for zero diff (F-1424-3: 44,007 tokens, zero files touched). **Difference is not direction; ask `main..lane/c`.**
2. When safe: `git checkout -B lane/c main && git clean -fd && npm install --no-audit --no-fund && npm run build` green before touching anything.
3. Cleanliness: `git -C worktrees/lane-c status --short` → must be clean, **with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1):** (a) `logs/**` — the fire/runner accounting, rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence, which is never byte-identity gated and so differs from main forever (F-1266-1). ⓘ **What still STOPs, unchanged and load-bearing: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`** — anything a live drain or a concurrent task could actually own. (Retro-fitted s2369: the master was banked without this line, and `scripts/banked-master-preflight-guard.test.mjs` in `test:ledger-guards` REDS on any `queued` master that declares a PRE-FLIGHT without matching `/F-1407-1|FACTORY-CHURN EXCEPTION/`. Caught by running the battery as the fire's last act — F-1300-4 — because a guard that reads a ledger row runs *before* the row exists.)

⚠️ **`lane/c` is 210 commits behind main and USABLE does not mean CURRENT.** This task depends on `982926333` (2026-08-25, `lantern-show-agent-honesty`), which introduced the copy you are fixing. s2367 proved `lane/c` HAS it and that the two subject files carry **2 em-dashes each**, identical to main. After the reset in step 2 you are on main anyway, so the dependency is satisfied — but if you skip the reset, prove it:

```
git merge-base --is-ancestor 982926333 HEAD    # expect rc=0
grep -c "This is a browser APPROXIMATION of a machine ride." src/ui/LanternShow.ts   # expect 1
```

**A `0` from that grep means the lane drifted — STOP and report. It does NOT mean the work is done.** (The key was proved to return exactly `1` on `main`, `lane/c` and `lane/c` at authoring time — F-1425-2: a key that matches nowhere is a paraphrase, not a key.)

## Self-check — the exact gates, run them all

1. `npx tsc --noEmit` — clean.
2. `npm run build` — green.
3. `node --test scripts/no-emdash-guard.test.mjs` — **green, and prove it has teeth.** Manufacture the defect: put the em-dash back into `src/ui/LanternShow.ts`, re-run, confirm it **REDS and names the file**, then restore byte-identically and confirm green again. **A guard you did not try to break is decoration** — report both the red and the restore.
4. `node --test scripts/no-emdash-guard.test.mjs` a second time after restore, to prove the restore was byte-identical.
5. `npx playwright test e2e/agent-reels.spec.ts --workers=1` — both projects (desktop **and** 390px mobile). `--workers=1` is a correctness requirement in this shell, not an optimisation (F-1270-1).
6. `npx playwright test e2e/tape-02-lantern-show.spec.ts e2e/restore-validation.spec.ts --workers=1` — the adjacent suites that touch the same strings, both projects.
7. `npm run test:node-guards` — the battery that roots this guard. It is **~530 s and must be run ALONE** (F-2166-2); do not overlap it with another battery. Any red must be attributed away from this slice **by measurement** (a reverted-content control), never by argument.
8. Boot probe: load the game with **no** `?debug`, desktop and 390px — **zero console errors, zero page errors**. Screenshot the Lantern Show banner in both widths to `artifacts/lane-c-emdash/` and name the paths in your report.
9. `grep -c "—" src/ui/LanternShow.ts src/game/RunSuspend.ts e2e/agent-reels.spec.ts` — expect `0` from all three.

## Report

**READY-FOR-GATES**, and report:
- the exact before/after text of all three copy changes, so the reviewer can judge the editorial rewrite without opening the diff;
- the guard's new declared scan space — files scanned, files skipped;
- **the manufactured-defect result from self-check 3** (what reddened, what it named, and that the restore returned green);
- the six §4 sites, verbatim, as a question for a ruling;
- any adjacent problem you noticed and did **not** fix.
