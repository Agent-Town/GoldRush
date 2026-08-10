# Task f1625-1: give the settled and cue-window town transfers SEPARATE NAMES so the release gate stops comparing one against the other's ceiling (LANE-C, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1625, from **F-1625-2** recorded at the `f1623-1` drain (`reviews/f1623-1-town-transfer-determinism.md`, merged `9e4b09c09875b50fe410b1b11cb10b3e671983ee`).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; `reviews/f1623-1-town-transfer-determinism.md` **in full** — it is the finding, the measurement and the explicit statement of what this task may NOT decide; `e2e/asset-diet.spec.ts` (the whole file, especially `startTownTransferMeter`, the cue measurement around `:226`, and the normal-arm assertions around `:399`); `scripts/deploy.sh` lines **50–92** — the release gate that consumes this spec's console line, including the `F-1489-3` comment explaining why a gate that measures nothing is not a pass.

SEQUENCING: verify the f1623-1 merge is on main by **FILE PROBE, never by grepping commit messages** (Mistake #16 — a message grep matches every *announcement* of a thing, including the authoring commit that preceded the code): `git ls-files artifacts/asset-diet/town-transfer-stability.md` must print that path; empty → **STOP and report "f1623-1 not landed"**. Then verify the subject is still what this master claims:
`grep -c "settleCapHit" e2e/asset-diet.spec.ts` → **must be non-zero**. If it is 0, the meter has been restructured under this master; **STOP and report the drift** rather than guessing where it moved.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-1625-2, measured s1625 at the f1623-1 drain — every number re-derived from the live tree, not inherited)

`f1623-1` replaced a cue-window sample with a meter that runs until 1500 ms of network idle, **capped at 20 s**. That was the right fix for F-1623-1: the old number swung **3.08×** run-to-run and no release decision could rest on it. But the 25 MB ceiling was calibrated against the **cue-window** quantity, and after the merge the *settled* quantity is what gets compared to it:

| | quantity | measured at the drain |
|---|---|---|
| cue window (what `TOWN_TRANSFER_CEILING_BYTES = 25_000_000` was set for) | small, early, **unstable** | historically ~15.2 MB, swinging 3.08× |
| settled ≤20 s (what the assertion now receives) | large, **cap-bounded** | desktop **45,895,261** · mobile **45,263,441** |

The suite therefore sits at **2 passed / 4 failed**, and all four reds are the same assertion —
`expect(…).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES)` at `:226` and `:399`. **Zero behavioural failures.**

**The expensive part is the release gate, not the suite.** `scripts/deploy.sh:68` runs this spec with
`--grep "honest town and claim cues"` — *one of the four failing tests* — and `:81` parses
`[asset-diet] <project> townResponses: <n> bytes` against `BUDGET_LIMIT=25000000` (`:52`). Both failure
conditions now trip at once (`BUDGET_RC≠0` **and** `BUDGET_OVER=1`): in default mode every deploy emits
`WARN: asset budget check failed` and continues; under `--strict` it **aborts**. ⚠️ **Not one byte of game
asset changed.** This is two measurements wearing one name — the exact F-1620-7 class `f1621-1` had just
finished curing on the other limb. The comment at `deploy.sh:82–:84` records that six deploys once shipped
past an *unmeasured* budget while looking like a pass; a permanent WARN on every deploy is how that lesson
gets re-learned (F-1460-1: an unowned red acquires an excused label and rots).

⛔ **WHAT THIS TASK MAY NOT DO — READ THIS TWICE.** There is a real design fork here, and it is **the owner's**,
not yours and not mine: *should the release budget govern the cue-window quantity or the settled one, and at
what value?* Answering it decides what blocks a deploy. **You will not answer it.** Specifically:

- **DO NOT change `25_000_000`.** Re-pinning a threshold to turn a red green is forbidden without a named
  cause (F-1441-3), and "the number is inconvenient" is not one.
- **DO NOT delete, skip, `testIgnore` or weaken any assertion**, and do not touch `expectNoConsoleErrors`.
- **DO NOT edit `scripts/deploy.sh`.** It is the consumer; this task fixes what it is *fed*, so that the gate
  keeps measuring the quantity it was written for. If you conclude `deploy.sh` must change, that is a FINDING
  for your report.
- **DO NOT revert `f1623-1`.** Its meter is the deliverable of a merged slice and stays.

## Scope

1. **Name the two quantities apart, in the spec, so neither can be read as the other.** The settled meter's
   output and the cue-window sample are different measurements; give them names that say so (the house
   precedent is F-1620-7's ruling: *either they measure the same thing or they are renamed so they cannot be
   confused*). Every artifact table column and every `console.info` line must be unambiguous about which one
   it carries.
2. **Restore `townResponses:` to the quantity the release gate's 25 MB was calibrated for — the cue-window
   sample — and emit the settled figure under a DIFFERENT, clearly-named line.** `scripts/deploy.sh:81`'s
   `sed` must keep parsing exactly one number per project, unchanged in format. After this, the release gate
   again compares like with like.
3. **Apply `TOWN_TRANSFER_CEILING_BYTES` only to the cue-window quantity**, so the four ceiling reds clear
   and the suite returns to **6/6 both projects**. The settled figure is **recorded, not gated** — it appears
   in `artifacts/asset-diet/*` and in the stability artifact, asserted on for nothing.
4. **Write the honesty note into the spec, at the assertion site, in a comment.** The gated quantity is
   **known-unstable** (F-1623-1: 3.08× swing) — that is *why* `f1623-1` exists, and restoring it to the gate
   does not un-know it. State plainly that the gate currently blocks on a quantity whose instrument is
   unreliable, that the stable quantity is measured beside it and gated on nothing, and that reconciling the
   two is an **open owner fork (F-1625-4)**. A future reader must not be able to mistake this arrangement for
   a finished design.
5. **Settle F-1625-3 rather than assuming it.** The stability PASS `f1623-1` reported (0.39%/0.61% over three
   runs) did not survive a different shell: the drain measured **45,895,261 / 45,263,441** against the runner's
   band **47,998,506–48,582,362** — 4.4% and 6.8% below its minimum, same direction. The mechanism is that
   **every arm hit the 20 s cap**, so the meter measures load as well as bytes. Run the settled measurement
   **at least twice under deliberately different load** (e.g. once alone, once alongside a second playwright
   project) and report both, with the cap-hit flag for every arm. ⚠️ **Report what you find — do NOT widen a
   tolerance, drop a run, or reword the stability claim to fit.** If the settled quantity is load-dependent,
   say so in a number; that is a finding about the instrument and it is worth more than a green.

## Firewall

Touch ONLY: `e2e/asset-diet.spec.ts`, and generated evidence under `artifacts/asset-diet/**`.

NO changes to: **`scripts/deploy.sh`** (the consumer — see above) · **anything under `src/**`** (the prefetch is
the subject of this measurement; changing it while measuring it destroys the evidence — a needed `src/` change
is a FINDING, not an edit) · `playwright.config.ts`, `playwright.preview.config.ts` · `package.json` (no new
scripts) · any other `e2e/*.spec.ts` · `tasks/**`, `specs/**`, `reviews/**`, `STATUS.md`, `tasks/BACKLOG.md`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:asset-diet` — **6/6 both projects, `--workers=1`**. This is the task's headline: name the
  pass/fail counts and wall time. Anything less than 6/6 is a STOP-and-report, **not** a tolerance to adjust.
- **Prove the release gate is fed correctly, without running a deploy.** Capture the spec's output and run the
  gate's own parser over it — `sed -nE 's/.*\[asset-diet\] ([^ ]+) townResponses: ([0-9]+) bytes.*/\1 \2/p'` —
  and confirm it yields **exactly two lines** (one per project) with numbers **below 25000000**. Paste the
  parser's output verbatim. ⓘ Run the parser, do **not** run `deploy.sh`: a guard probe must never run the real
  side-effecting command (it publishes).
- **Prove the settled figure is still reported**: show the artifact lines carrying it, with `settleCapHit` per arm.
- Adjacent suite, unmodified-green both projects: `npx playwright test e2e/advance-stream-cache-reuse.spec.ts --workers=1`.
  If red, fingerprint against main BEFORE claiming this task caused it.
- `npm run test:node-guards` is **NOT** required — this task touches no `src/sim/`, `src/systems/` or
  `src/entities/` path (F-1460-1). Say so in your report rather than silently omitting it.
- Zero console/page errors in every arm; `expectNoConsoleErrors` call count unchanged.
- Confirm by grep that `DO NOT QUOTE A SINGLE RUN OF THIS INSTRUMENT AS A FACT` still returns **1**.
- `git diff --numstat` reported in your message.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a
queue slot and a gate (Mistake #1).

End: READY-FOR-GATES + report (1) the suite's counts both projects; (2) the parser output proving the release
gate is fed two sub-ceiling numbers; (3) the settled figures with cap-hit flags, from **both** load conditions,
and your verdict on whether the settled quantity is load-dependent — in a number; (4) confirmation that
`25_000_000` is untouched and no assertion was deleted, skipped or weakened; (5) any `src/` or `deploy.sh`
change you concluded was needed and did NOT make.
