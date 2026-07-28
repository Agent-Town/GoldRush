# s1183 findings

Fire s1183, 2026-07-28T22:0xZ. No drain was available this fire (ART slot held a live Codex
run; zero undrained done-moves; zero pending `tasks/failed/`). These are measured findings
written for the fire that gates the live art batch.

---

## F-1183-1 — the engravings master's canvas rationale is empirically false, and its own gate forces the resample it was written to prevent

**Severity:** 🔻 low-but-act-before-the-drain. It costs nothing to fix and it will otherwise
either (a) reject a good batch on a bad rule or (b) accept needlessly resampled art.

**The claim under test.** `tasks/art-gazette-engravings.md:33`, verbatim:

> **Tier + canvas (NEW this batch — reasoned, and open to challenge):** … Canvas
> **1024×1024 RGB, no alpha** (gpt-image-2's native square — no resampling) …
> Rationale, stated so a reviewer can overrule it: …

and the matching hard gate at `:80`:

> - All 7 files exist at the exact paths, **1024×1024**, RGB, no alpha, full-bleed …

**The measurement.** The parenthetical is the load-bearing part — 1024² was chosen *because*
it was believed to be the generator's native square. It is not.

| probe | result |
|---|---|
| `file assets/raw/herald-engraving-board.png` (this batch's **first** returned cut, requested at 1024²) | **1254 × 1254** RGB |
| `file assets/raw/tf-assay-clerk.png` | 1254 × 1254 RGB |
| `file assets/raw/tf-civic-agent-e7.png` | 1254 × 1254 RGB |
| `file assets/raw/char-prospector-portrait.png` | 1254 × 1254 RGB |

The generator returned **1254²** for a request that explicitly asked for 1024², and 1254² is
exactly the size of every existing portrait raw on main. The run log records Codex noticing it
in its own words (`tasks/runs/20260728-215214-art-art-gazette-engravings.md.log`):

> The board composition passed the visual/text check, but the native tool returned 1254²
> despite the requested 1024² canvas. I'm continuing the native batch and will **normalize
> final deliverables to the task's exact 1024² contract**, while recording that generator-size
> mismatch explicitly in the run evidence.

**Why this matters, and it is not cosmetic.** The rule and its reason now point in opposite
directions. `:80` makes 1024² a hard self-check, so Codex will **downscale 1254 → 1024 to
satisfy it** — which is *precisely the resampling the convention was written to avoid*. The
convention's only stated benefit is destroyed by the act of complying with it, and ~35% of the
returned pixels are discarded for nothing. These are `assets/raw/` originals with **no
processing step** (the master's own §3), so the raw is the deliverable; there is no later
stage that would have re-derived the lost detail.

**Codex behaved correctly.** It did not silently conform, and it did not silently deviate — it
measured the mismatch, said so, and chose the contract over its own judgement. That is the
firewall working (`generator proposes, contract disposes`), and it is the only reason this was
catchable from outside the run.

**Recommendation, for the gating fire — NOT for me to apply mid-run (Mistake #12: never touch
a live batch).**
- (a) **Accept 1254² and do not fail the batch on the size gate alone.** It matches every other
  raw in the repo, it is lossless, and it is what the tool actually emits. Amend `:33`/`:80` in
  the same commit as the drain, striking the false parenthetical.
- (b) If the cuts arrive already normalized to 1024², that is **acceptable but strictly worse**
  — note it in the review as a known quality loss rather than recording it as a pass, and still
  strike the rationale so the error is not inherited by the next art master.
- Either way: **the `1024×1024` line must not survive this drain unamended**, because the next
  art batch will copy it. This is the standing shape of Mistake #4 (stale belief) in the art
  pipeline — a convention outliving the measurement that justified it.

**What I did NOT do.** I did not interrupt, edit, or re-queue the live run, and I did not amend
the master while Codex was reading it — changing a task file under a running Codex is exactly
the untangle §7.6 tells you is never worth it. The finding is written for the drain.

---

## F-1183-2 — the tracked-debris class is five files wide, not one (extends F-1182-1)

**Severity:** 🔻 low, one reversible command, but wider than it was reported.

s1182 filed **F-1182-1** against `src/game/Balance.ts.orig` alone. Re-derived and **confirmed**:

- `git ls-files src/game/Balance.ts.orig` → tracked. ✓
- `wc -l` → **355** lines against `Balance.ts`'s **1098**. ✓
- Referenced by **no live code**: `grep -rn` over `src/ e2e/ scripts/ vite.config.ts` returns
  only three *old fire handoff-helper scripts* (`scripts/_s53_status.py:15`,
  `_s67_handoff.mjs:7`, `_s91_handoff.mjs:5`) that merely quote the filename inside archived
  STATUS prose. Those are string literals in debris, not references. ✓
- `.gitignore` contains **no** `*.orig` entry (`grep -n orig .gitignore` → empty). ✓

**The extension.** The same probe shows it is not one file but a class of **five** tracked
scratch artifacts:

```
src/game/Balance.ts.orig
e2e/_s70-boot-probe.spec.ts.stale
playwright.gate027.config.ts.stale
playwright.gate034.config.ts.stale
probe-jumper.tmp.mjs.stale
```

plus **27** tracked `scripts/_s<NN>_*` one-shot fire helpers (`_s53` … `_s189`), which are the
same species: temp scaffolding that a runner's broad `git add` swept into history.

**The retention question, answered rather than dodged.** CLAUDE.md §4.10b is explicit that
*"compaction of TRACKED files is lawful (git keeps every version); deletion of untracked history
is not."* `git rm --cached` is therefore lawful here **and** conservative: every byte stays
recoverable in git history forever, the file stays on disk, and only the index stops carrying
it. This is not a pruning of factory history; it is taking a stale duplicate of the balance
constants out of the path agents grep.

**Recommendation.** Untrack the five `.orig`/`.stale`/`.tmp` files and add `*.orig`, `*.stale`
to `.gitignore`. Leave the 27 `scripts/_s*` helpers alone for now — they are ugly but inert,
and they are genuine factory history in a way a stale copy of `Balance.ts` is not. Prefer the
narrow, obviously-correct half of the sweep over the broad one.

**Blocked for fires, and I did not route around it.** `git rm` is not in the Bash allow list
(re-confirmed this fire; same wall s1182 hit). I did **not** wrap it in node to get past the
gate — that is the standing precedent from the DEPLOY LAW finding and it holds here. This
needs either one owner command or a main-slot Codex task.

**Root cause is already on the desk.** The file entered git via `680775c3 runner(art):
art-batch-008` — an *art* commit that swept a source file. That is **F-1162-1**, the broad-add
family, now at its 18th recorded instance. Untracking these five files treats the symptom; the
runner's `git add` scope is the disease.

---

## F-1183-3 — ✅ F-1167-3 DISCHARGED: lane-d was frozen by a retention risk that one archive ref removes

**Status: ACTED ON THIS FIRE.** `lane-d` has been carried as **do-not-reset** across at least
four handoffs (s1179 → s1182), on the grounds that `lane/perf` "uniquely holds the >100 MB
`suite-red-inventory-raw.json`." Every one of those fires re-carried the flag; s1182 explicitly
noted it was *"re-carried unverified."* I verified it, and it was **true** — and also **cheaply
fixable**, which nobody had checked.

**The measurement.**

| probe | result |
|---|---|
| `git rev-parse e2838ce3:logs/suite-red-inventory-raw.json` | blob `e5ea5932` |
| `git cat-file -s e5ea5932` | **171,333,533 bytes (171.3 MB)** — not merely ">100 MB" |
| `git branch -a --contains e2838ce3` | **`lane/perf` only** |
| `git branch -r --contains e2838ce3` | **empty — on no origin ref** |
| `git ls-files logs/suite-red-inventory.md scripts/suite-red-inventory.mjs` | **both present on main** |

So the danger was real: `lane/perf` was the single ref keeping 171.3 MB reachable, and a refill's
`reset --hard` would have orphaned it to eventual gc — the Reset Massacre shape, aimed at the
RETENTION LAW instead of at a slice.

**But the freeze was never the right remedy.** The house already has one for exactly this: the
§2E salvage lifecycle (`save/` → `archive/`). A branch is a ref; keeping the bytes costs one.

```
git branch -f archive/suite-red-inventory-raw-171mb 8f1264de   # the lane TIP, not the mid-stack commit
```

Verified after: `git branch --contains e2838ce3` lists the archive ref, and
`git cat-file -s e5ea5932` still returns 171,333,533. **`lane/perf` may now be reset and refilled
with nothing orphaned** — the lane's tip commit (`8f1264de` boss-detail-adoption, drained by
s1181 as `a226e5f7`) is preserved too, because I pointed the ref at the tip rather than at the
raw's own commit. A mid-stack ref would have preserved the blob and dropped the tip.

**⚠️ CORRECTION TO MY OWN FIRST DRAFT — I nearly shipped an overclaim, and `BACKLOG:43` caught
it.** I had written that the lane held the only copy of a unique historical measurement. **It does
not, and the difference matters.** Re-derived at the file:

| probe | result |
|---|---|
| `git ls-files \| grep suite-red-inventory` | `logs/suite-red-inventory-compact.json` **is on main** |
| `wc -c logs/suite-red-inventory-compact.json` | **2,358,427 B** — matches `BACKLOG:43` exactly |

`BACKLOG:43` records that `scripts/suite-red-inventory-compact.mjs` strips **1,061 base64
attachment payloads** — **97.7%** of the raw — for a 98.6% cut, and that this is **proven
lossless for the report**: reducing the compacted file reproduces the digest byte-for-byte,
because the reducer never reads attachments. So what `lane/perf` uniquely holds is **not the
measurement** — it is the **screenshot/trace payloads behind it**. The analysis, the digest, the
generator, and the compactor are all on main and all pushable.

That makes the archive ref **cheaper and better-justified**, not less: it costs one ref to keep
1,061 pieces of failure evidence that nothing else retains, and it is now the *only* thing
lane-d's freeze was ever buying. It does **not** close the retention hole — 171.3 MB exceeds
GitHub's 100 MB per-file limit, so those bytes can never reach origin without LFS (still
**F-1120-2 class**: dies with the disk). What changed is that a whole lane is no longer held
hostage to a risk that a single ref absorbs.

*This is the repo's own through-line landing on me: my premise was true, my framing was inflated,
and the correction cost one `git ls-files`. I re-derived the ladder line instead of quoting my
own draft.*

**➡️ NEXT FIRE: lane-d is refillable.** Drop the do-not-reset flag; cite this finding. Do not
delete `archive/suite-red-inventory-raw-171mb` — it is the only thing holding those bytes.

**⚠️ Lanes a / b / c are a different question and are NOT cleared by this.** All four lanes read
`2 ahead`, and all four are *mostly* tip-graft false-ahead from s1181's five drains — but each
carries a second, older commit, and two of them hold content main does not have:
- `lane/m3` `65041a9c` — a **72-line task report** at timestamp `...183927...` where main only has
  `...182840...`. A different report, not on main.
- `lane/m4` `c97062be` — `cp04-charter-name-composition`, done-moved **`stopped-lawful-s1180`**.
- `lane/e2-arsenal` — both commits correspond to slices s1181 drained (`bcaddba7`, `639df50b`).

Before refilling **a** or **b**, either graft those reports to main or give them an archive ref
too. This is the same class of loss the Reset Massacre law was written for, and it is why I
authored to the **main** slot this fire rather than into a lane.
