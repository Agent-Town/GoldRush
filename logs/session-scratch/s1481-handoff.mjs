// s1481 handoff — rewrite line-1, archive this fire's lock line, keep s1480's archive intact.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const stamp = execSync('date "+%Y-%m-%dT%H:%MZ"').toString().trim();
const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
const lockLine = lines[0];

if (!/^Last updated: ACTIVE/.test(lockLine)) {
  console.error('line-1 is not my ACTIVE lock — refusing to overwrite it');
  process.exit(2);
}

const DESK =
  '🔺 **OWNER’S DESK — 11 awaiting a word, 0 new this fire, but ONE OF THEM JUST GOT MUCH BIGGER.** ' +
  '🔺 **F-1475-1 — RE-PRICED BY F-1481-2 AND NOW THE HIGHEST-LEVERAGE WORD ON THIS DESK.** Its row still reads ' +
  '“the LAST E3 era-socket is blocked on one design question”. Measured this fire from ' +
  '`src/sim/HeadlessContractSim.ts:41`: `SUPPORTED_CONTRACTS` holds **12 ids, every one E1/E2/E3**, and `:184` ' +
  'throws unless the id is in that set **or** the contract declares a `mode`. Across all 42 shipped contracts — ' +
  '**12 admitted · 0 mode escapes · 30 that THROW**, namely all four contracts of E4/E5/E6/E7/E8/E9/E10 plus ' +
  '`e3-fairground` and `e1-drill-yard`. **So the word does not unblock one socket, it unblocks the construction ' +
  'path for 30 contracts and every era-socket master after them.** RECOMMENDATION UNCHANGED — **(c)** a ' +
  'diagnostics-only boot flag that bypasses the support gate for MEASUREMENT while leaving `SUPPORTED_CONTRACTS` ' +
  '(the playability CLAIM) untouched. · ' +
  '🔺 **F-1477-1** — tracked screenshot evidence churns 100% of the time (0/10 byte-stable); **RECOMMENDED: keep ' +
  'tracked and exempt `artifacts/**` from the pre-flight clean test.** · ' +
  '🔻 **F-1473-2** — three gate-cost rulings still waiting: root `halo-reextraction-check.mjs` into ' +
  '`test:node-guards` (+45.3 s; s1470 and s1473 both recommended **YES**)? Root `npm:test:asset-diet` (+52.3 s)? ' +
  'Root `npm:test:release` (~200 s, sole gate over the E1 release door)? **One word each.** · ' +
  '🟡 **F-1472-1 — VETO WINDOW STILL OPEN** (the desk header became a hard gate on s1472’s own authority). · ' +
  '🟡 **F-1470-4** — 301 halo cells, 15 held sheets. · ' +
  '🟡 **F-1462-1** — the two ER-02 rulings. · 🟡 **F-1461-4** · ' +
  '🟡 **F-1461-6** — gates E7–E10; those four censuses have MERGED, so the ruling is no longer hypothetical. · ' +
  '🟥 **F-1461-1** · 🟥 **F-1461-5** — runner-side, attended, inert until the runner restarts. · ' +
  '🟢 **F-1471-1** — latent `objectiveAllowsSecure` width; inert today.';

const BODY =
  `Last updated: ${stamp} s1481 handoff, lock CLEARED — ` +
  '🟩 **NO DRAIN EXISTED (six queues empty, four lanes idle, zero done-moves), SO I CLOSED THE SMALLEST REAL ' +
  'FINDING ON THE BOARD AND THEN REFUSED TO AUTHOR — THE REFUSAL IS THE MORE IMPORTANT HALF.** ' +
  '🔧 **F-1480-3 HALF-CLOSED VIA F-1481-1 — AND NOT THE WAY IT ASKED.** Its REC was to mint a tracked ' +
  '`scripts/gate-run.mjs`. Reading the neighbourhood first found **`scripts/gate-battery.mjs` already there since ' +
  's1275**, its header opening *“the PERMANENT gate-battery driver”* and explaining at length that fires kept ' +
  're-minting exactly this script (F-1255-3, F-1275-1). **The recommended cure was a third sibling of the script ' +
  'whose whole purpose is to have no siblings** — it would have re-opened F-1275-1 under a new name. ' +
  '⚠️ **The cause is NOT “fires don’t know the home exists”** (the tempting read, which would have produced a docs ' +
  'fix that changed nothing) — **it is that the home could not do the job**: it hardcoded `cwd: REPO_ROOT`, so ' +
  '**§3.0b’s detached gate worktree was unreachable through it with no workaround**, and it passed no `env`, so ' +
  'the scratch-port pair `GR_CAPTURE_BASE_URL`/`GR_CAPTURE_EXTERNAL_SERVER` could not be delivered (a fire cannot ' +
  'set those inline — the bash allowlist refuses that form). **Both gaps are load-bearing against laws written ' +
  'AFTER s1275**, and three re-derivations post-date the home. ✅ **CURED BY WIDENING, NOT FORKING** (`b53444106`): ' +
  '`--cwd` + repeatable `--env`, both **failing CLOSED on rc=2** rather than falling back to the repo root or an ' +
  'empty env (a silent fallback returns a *real verdict about the wrong subject*), both **named in the transcript** ' +
  'so a battery can never claim a tree it did not measure, transcript still resolving against the REPO ROOT because ' +
  'evidence written inside a scratch worktree dies with it. ' +
  '🩺 **GATES: `gate-battery.test.mjs` 13/13 (6 new), already rooted in `test:node-guards`; CONTROL ' +
  '`npm run test:node-guards` **rc=0**, run THROUGH the extended driver as its own dogfood ' +
  '(`artifacts/s1481-gate.txt`).** ' +
  '🧪 **EVERY NEW ASSERTION PROVEN TO BITE BY MUTATION, NOT BY A GREEN** ' +
  '(`logs/session-scratch/s1481-mutation-probe.mjs`, 4/4 red, driver restored byte-identical, sha256 ' +
  '`051957042994c352`). 💡 **And the probe caught a defect in MY OWN GUARD before it shipped:** deleting ' +
  '`env: childEnv` left the env test **green**, because its `/marker-8842/` assertion was matched by the `env+` ' +
  'header **the driver writes itself** — the assertion was reading my bookkeeping, not the observation. Anchored on ' +
  '`SAW=` now. *A guard written and greened in the same minute has never executed its violation path.* ' +
  '📎 **CITED IN LAW (`b568000d6`)** — `.claude/skills/drain/SKILL.md` now carries the invocation; a shipped cure is ' +
  'inert until a law surface names it. (Skill writes are gated for fires; node fs is not.) ' +
  '⛔ **F-1481-2 FILED — I WAS SENT TO AUTHOR AN E7/E8/E9 ERA-SOCKET MASTER AND PROVED I MUST NOT.** Before writing ' +
  'scope I asked whether the harness is constructible — the lesson of the s1475 run that spent **124,606 tokens for ' +
  'zero repo changes**. `SUPPORTED_CONTRACTS` admits **only E1/E2/E3**; **all 12 E7/E8/E9 contracts are absent AND ' +
  'declare `modes=undefined`**, so `HeadlessContractSim` throws for every one of them. An E7 master would be ' +
  '**jointly unsatisfiable in exactly the shape s1475 already paid for, twelve times over.** §2E hard limit: needs a ' +
  'design fork ⇒ **DO NOT AUTHOR**. Widening the measurement to all 42 contracts gave **30 walled**, which is what ' +
  're-prices F-1475-1 on the desk below. ' +
  '⚠️ **PIPELINE-DRY: ALL FOUR LANES IDLE AND I DELIBERATELY LEFT THEM SO.** Fleet measured `lane-usable --all`: ' +
  '**all four `ahead=0` USABLE**, but **20–28 commits BEHIND** with `package.json` among the drifted files — so a ' +
  'lane gate is a strict SUBSET of main’s; refresh at dispatch and prove the dependency commit is an ancestor. ' +
  '🧪 **ASSAYER:** `pending/` empty. 📰 **TK-01:** `ticker-digest-2026-08-05.md` on disk — verified by listing, not ' +
  'inherited. 📰 **GZ-01: no item owed** — zero `src/` bytes, nothing player-visible. 🚀 **DEPLOY: skipped, ' +
  'correctly** (no gameplay code). 🎨 **ART slot untouched, no staging audit run** (s1469 carry stands: AT RISK 582 ' +
  'files / 527.89 MB, LOCAL-ONLY 0). 🧹 **`gate-s1455/` LEFT ALONE** — still another session’s worktree and an open ' +
  'desk item; its salvage was completed by s1480. 💾 **BACKUP: pushed.** 🩺 **`test:ledger-guards` RUN LAST** per ' +
  'F-1300-4. 🙏 **ATTENDED-OWED: still 1 open — `001-drain-skill-custody-rule.md`.** ' +
  '**NEXT: (A)** 🟢 **F-1398-1** — now the best fire-side target: fully priced by s1479, mapping machine-derivable, ' +
  'but **CHOOSE THE PREDICATE FIRST** — the offender count is **2 / 3 / 4 / 7** depending on which you pick, and a ' +
  'guard built without settling it reds on history nobody agreed was a defect. **(B)** 🟢 close F-1480-3’s remaining ' +
  'half by gating one real drain **through** `gate-battery.mjs --cwd/--env` — the row stays open until a drain has ' +
  'used it. **(C)** 🟡 **F-1470-4** — 301 halo cells / 15 held sheets, still the largest body of work. ' +
  '**(D)** 🚫 **do NOT author era-sockets for E4–E10** until F-1475-1 is ruled (F-1481-2). ' +
  DESK;

lines[0] = BODY;
lines.splice(1, 0, `- **s1481 lock line (archived):** ${lockLine}`);
writeFileSync(P, lines.join('\n'));

const after = readFileSync(P, 'utf8');
const prior = (after.match(/s1480 handoff \(line-1 archive\)/g) || []).length;
console.log(`prior-handoff archive count = ${prior} (expect 1)`);
console.log(`line-1 length = ${BODY.length}`);
if (prior !== 1) process.exit(2);
