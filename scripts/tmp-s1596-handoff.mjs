import { readFileSync, writeFileSync } from 'node:fs';

const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
const lockLine = lines[0];
if (!lockLine.startsWith('ACTIVE')) throw new Error('line-1 is not my ACTIVE lock: ' + lockLine.slice(0, 60));

const desk = [
  "🔺 **OWNER'S DESK — 31 awaiting a word.**",
  'ⓘ **32 inherited − 1 discharged + 0 mine = 31.**',
  "`desk-state-audit --status` against s1595's archived line-1 returned **`CLOSED=0 · OPEN=5 · BOTH=0 · OPEN-DESK-ONLY=27 · UNRECORDED=0`** — so nothing was dropped on the tool's word.",
  "**The one I DID drop, I dropped on YOURS: `f1328-1-drill-yard-census-debt` is settled by your own ruling** — it asked whether the Drill Yard owes E1 a six-contract census, and \"the Drill Yard is not a contract that needs a ladder\" answers it; the leaf reads `superseded` (flipped attended-side at `7a564d8ad`, verified by reading it, not inherited).",
  '**F-1596-1 is NOT a desk item** — non-blocking, fire-side, and cheaper folded into the next edit of that spec file.',
  '🔺 **F-1587-2 OPEN** — five attempts; F-1593-2 recommends PARKING it as a KNOWN-RARE, and s1594/s1595 both agreed. **s1596 makes it a fourth agreement:** both recent attempts are bannered DO-NOT-QUEUE, so the thread has no live authoring slot left — parking costs nothing that is not already stopped.',
  '🔺 **F-1591-1 OPEN** — the frame-supply derivation; parent of the F-1587-2 thread.',
  '🔺 **F-E2S-4 OPEN** — canyon-works wave-6 power deadline missed by 2.77 s. Fork: (a) recalibrate for walk-era economics, (b) accept as elite routing challenge, (c) leave open.',
  '🔺 **F-1589-2 OPEN** — red inventory exonerates a spec that fails on clean main.',
  '🔺 **F-1589-3 OPEN** — `wd02-barks:139` is load-sensitive, not a line defect.',
  '🔺 **F-1588-1 OPEN** 🔺 **F-1588-2 OPEN** 🔺 **F-1587-1 OPEN** 🔺 **F-1193-3 OPEN** 🔺 **F-1562-3 OPEN** 🔺 **F-1553-2 OPEN** 🔺 **F-BAL-1 OPEN** 🔺 **F-DOOR-5 OPEN** 🔺 **F-DOOR-6 OPEN** 🔺 **F-E2S-3 OPEN** 🔺 **F-1544-1 OPEN** 🔺 **F-1536-2 OPEN** 🔺 **F-1532-2 OPEN** 🔺 **F-1528-3 OPEN** 🔺 **F-1511-5 OPEN** 🔺 **F-1510-1 OPEN** 🔺 **F-1507-1 OPEN** 🔺 **F-1493-3 OPEN** 🔺 **F-MTS-2 OPEN** 🔺 **F-MSD-2 OPEN** 🔺 **F-MILK-SS-3 OPEN** 🔺 **F-1166-1 OPEN** 🔺 **F-1101-1 OPEN**',
  '🔺 **`rf-34-hero-y-restore-roundtrip` BLOCKED owner-fork** 🔺 **`e3-fairground-socket` BLOCKED owner-fork** 🔺 **`bt-04-homestead-automation` BLOCKED owner-fork**',
  '⏳ **The cheapest is still the AP-03/04/05 re-greenlight — ONE WORD unblocks THREE leaves** (F-1364-1; the transcription cure landed at `6d7f888f`, so your word is the only thing left in that thread).',
  "🎵 **And the town's tune still sits at 0.7 of a run's — say higher or lower and it is one number.**",
].join(' ');

const body = [
  'Last updated: 2026-08-09T12:03Z s1596 handoff, lock CLEARED —',
  '🎯 **ONE DRAIN, AND IT IS TWO OF YOUR OWN RULINGS LANDING TOGETHER.**',
  '**`team-and-training` merged `f18879c9ee1bbc1f79439d48cec9b45b4798152d`.**',
  "The county now says **Team of 2/3/4** instead of Posse everywhere a player can read it, and **the Drill Yard has left the ladder** — it refuses standings rows with \"The Drill Yard is the training ground — practice is its own reward.\" and is filtered out of the contract chips and the epoch listing. **It stays fully playable; only the scoring door is shut**, and that was tested rather than asserted.",
  '📋 **BOARD ON ARRIVAL (11:52):** lock CLEARED (s1595, owning commit `1c3538cf1` — judged by the COMMIT per §1.1, never the stamp text) · all six queues EMPTY · assayer `pending/` EMPTY · no live `tasks/CODEX-WALL`.',
  '⚠️ **BUT THE BOARD WAS NOT DRY, AND THE REASON IS A MEMORY I ALMOST REPEATED:** s1595 recorded *"every `tasks/done/` entry `drained-` prefixed"*, and a name-sorted `tail` of `tasks/done/` agrees — because **digits sort before letters**, so `20260809-113950-lane-team-and-training.md` hides above a wall of `stopped-`/`superseded-` residue. **`ls -lt` put it first.** The attended session authored the master at 11:39:31 (`7a564d8ad`), the runner finished at 11:50:36, and the fire arrived at 11:52 to a board that *read* dry. **Count `tasks/done/` by mtime, never by a name-sorted tail.**',
  '✅ **§3.0 FIRST, BEFORE FORMING AN OPINION:** `drain-block-check` → `✅ CLEAR … status="planned"` (the attended author had registered the leaf, so the Goal Registration Law held).',
  '🔬 **GATED IN A DETACHED WORKTREE (§3.0b), MERGED AS ONE ACT (F-1589-5):** `worktrees/gate-s1596`, `--workers=1` throughout per §3.1. tsc clean · build green in 1.16 s · `functions/` touched → the F-1229-1 battery **stats 87 / accounts 43 / mp 462** · own specs **22/22** · adjacent **24/24** · zero console/page errors · 6 screenshots.',
  '🎯 **THE ADJACENT LIST WAS RE-DERIVED FROM THE CURE, NOT INHERITED FROM THE MASTER** (the master\'s list is written before the fix exists): `grep`ing the fix\'s call sites gave **`lb-01-county-standings`** — the suite that would have caught a regression in the new contract-chip filter — and **`drill-yard` + `drill-yard-manifest`**, which are what actually prove your ruling did not break the thing it renamed. They assert the Drill Yard is still **visible, launchable, resettable and ledger-free**. Taking a claim off the ladder is one line away from taking it off the board; that pair is the difference between believing it and knowing it.',
  '🧾 **MERGE CLASSIFICATION — and a false signal worth naming:** base `7a564d8ad`, one ahead commit, **no conflicts**. The two-dot `main..lane/a` diff showed `STATUS.md` + `logs/*` as *reversions of this fire\'s own lock commit* — MAIN-MOVED-ONLY, the classic trap. The three-way merge left them at main\'s version; a two-dot copy would have reverted my own lock. `git show --stat` confirms the runner touched **exactly** the firewall\'s TOUCH-ONLY set.',
  '🔎 **SCOPE 3 VERIFIED BY READING, NOT BY TRUSTING THE REPORT:** the runner claimed the board card already reads as training and changed nothing — `TownScene.ts:2326` `renderTrainingGround` does give it its own "THE TRAINING GROUND" section with `data-training-ground="true"` (pc-01c). A cited no-change is a legitimate scope outcome; an uncited one is a silent no-op (Mistake #1).',
  '📰 **GZ-01: one gazette item appended** (player-visible copy + a ruling), NO OWNER CHOICE. **And the standing backfill sweep is discharged: all four merges the law names as casualties (`99f0d60a40`, `38615d7841`, `5698e6ae30`, `3dec093294`) are ALREADY in the queue** — that debt was cleared by an earlier fire. ⚠️ **My first backfill probe returned 339 candidates** because it keyed on commit subjects; the law\'s criterion is *a review file exists*, and it explicitly predicts this failure ("fires on every bookkeeping and infrastructure merge and gets excused into uselessness within a week"). I reproduced the predicted failure in one command — recorded so the next fire keys on reviews, not subjects, and so nobody builds it as a red guard.',
  '📌 **F-1596-1 FILED, NON-BLOCKING:** the drill-yard refusal coverage is real and thorough (asserts the 400, the exact message, that KV is not written, **and** that GET refuses) — but it is appended to a test titled *"optional cost fields group the best score by model…"*. An **owner ruling\'s** only test is housed under a title that does not name it, so it is invisible to a grep for "drill yard" and would be deleted silently with its host. No corrective task authored: it is a one-line `test(...)` split, cheaper folded into the next edit of that file than dispatched as its own lane run.',
  '🚫 **NO MASTER AUTHORED.** The board is genuinely dry now — all six queues empty, **all four lanes `ahead=0` USABLE** (lane-a flipped from HOLDS to USABLE, which is the classifier confirming the merge absorbed), assayer empty. Every ladder item I could reach is either owner-gated or bannered DO-NOT-QUEUE. Inventing scope is forbidden.',
  '➡️ **NEXT: (A)** nothing is waiting to drain — the next fire should expect a dry board unless the attended session dispatches again, and should **check `tasks/done/` by mtime** before believing it. **(B)** lanes are 3/37/111/110 behind — `refresh-lane` is free while `ahead=0`, and lane-c/d at >100 behind will make any master\'s citation grep miss (F-1424-3). **(C)** F-1587-2 has now been recommended for PARKING by four consecutive fires; it wants one word, not a fifth attempt.',
  desk,
].join(' ');

lines[0] = body;
lines.splice(1, 0, '- **s1596 lock line (archived):** ' + lockLine);
writeFileSync(p, lines.join('\n'));
console.log('handoff written; line-1 chars =', body.length);
