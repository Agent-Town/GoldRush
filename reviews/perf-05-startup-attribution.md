# perf-05-startup-attribution — review (s1038)

**Slice:** `lane-a-perf-05-startup-attribution` (F-1034-3, perf-05 half)
**Branch:** `lane/m3` · **Tip:** `cec50777` · **Base:** `69f0cd80`
**Run:** `20260725-164910-lane-a` → **rc1**, `tasks/failed/rc1-20260725-164910-lane-a-perf-05-startup-attribution.md`

## VERDICT: **HELD — not merged.** The deliverable is PROVEN; the slice's own spec cannot be taken green while another lane saturates the CPU.

The task's two questions are both answered with measured evidence, reproduced four independent times.
The single remaining red is `ttiMs < 3000`, an assertion this change cannot causally affect, measured
under a concurrently-running lane-c task. Merging on a red own-spec would break the evidence law
(CLAUDE.md §6) and Mistake #12; the correct close is one clean re-run on an idle machine.

## What it does
Narrows every needle in `NON_CRITICAL_TEXTURES` and `PREFETCH_TEXTURES` by a leading `/`, raises the
page's resource-timing buffer from the browser default (250) to 5,000, and adds a `diagnostics` block
to the report (browser version, icon rows, prefetch rows, asset statuses). Test-side only — **zero
`src/` bytes.**

## How the run died (not a task failure)
The live log's last two lines are the cause, and it is upstream:

```
ERROR: Selected model is at capacity. Please try a different model.
tokens used 156,153
```

The run had **already completed both playwright projects** — desktop artifact written 16:53:50, mobile
16:57:14, log ends 16:57:39 — and died during its closing narration. Because rc≠0 the runner never
committed (`lane-runner-v3.sh:70-90`), so the entire output sat **uncommitted in `worktrees/lane-a`**,
one lane-refill `reset --hard` away from the Reset Massacre. Salvaged first, judged second (`d1743150`).

> **Reading note for the next fire:** `logs/runs-archive/…164910….log` is a **mid-run snapshot** (410KB,
> frozen 16:50, ends mid-`exec` with no error). The live `tasks/runs/…164910….log` is 644KB and carries
> the capacity error. Diagnosing from the archive copy alone would have mis-attributed this to a hang.

## Evidence

| gate | result |
|---|---|
| `npx tsc --noEmit` | ✅ clean — **after** a fix (see F-1038-2); the lane's own state was **red** |
| `beforeFirstFrame` empty (`:223`) | ✅ `[]` on **4/4** runs (lane's 2 + my 3 desktop) |
| `prefetchedBeforeWaveSpawn` non-empty (`:224`) | ✅ all **5** buildings on **4/4** runs |
| console / page / asset errors | ✅ all three `[]` |
| `ttiMs < 3000` (`:231`) | ❌ **3118 / 3014 / 3961** — see F-1038-1 |
| `npm run build` | ✅ green (in the lane's own run, 1.24s) |
| mobile project | ⏸ not re-run by me — held with desktop |

### The two-halved control — proven exhaustively, not by mutation
The master demanded *still-bites* **and** *no-longer-false*. Because `hasAny` is a pure
`String.includes` (`:214-216`), both halves are decidable exactly rather than sampled:

| URL | old needles | new needles |
|---|---|---|
| `/favicon-32.png` | `true` ❌ the bug | `false` ✅ |
| `/favicon-16.png` | `true` ❌ | `false` ✅ |
| `/favicon-48.png` | `true` ❌ | `false` ✅ |
| `/assets/processed/icon-gold.png` | `true` | `true` ✅ still bites |
| `/assets/processed/icon-range.png?import&url` | `true` | `true` ✅ |
| `/assets/processed/bld-palisade.png` | `true` | `true` ✅ |
| `/assets/processed/ui-menu-frame.png` | `true` | `true` ✅ |

This is **stronger** than the mutation run the master asked for: it covers the whole false-positive
class (all three favicons, not just the one that happened to be requested) and cannot itself flake.
The guard is narrowed, **not** defanged — so this is not F-1032-1 wearing a fix's coat.

## Findings

**F-1038-1 — `perf-05:231` (`ttiMs < 3000`) is load-sensitive, and THIS one really is.**
Measured 3118 / 3014 / 3961 across three consecutive runs while lane-c's `lane-m2-05-geometry-settle`
held the CPU (verified live by `pgrep -f "codex exec"` before and after). A spread of **947ms across
identical runs** is the signature of contention, not of a regression. **No causal path exists from this
change to `ttiMs`:** the marks are sampled in-page by `__PERF05_BOOT__`, every edit here is either a
needle string, a post-measurement `filter`, or a resource-buffer size. Non-blocking for the diagnosis;
**blocking for the merge** until one idle-machine run confirms it. *Note the irony: the ledger called
`:223` a load flake when it was deterministic, while the genuinely load-sensitive assertion two lines
up went unnamed.*

**F-1038-2 — the lane's delivered state did not compile.**
`diagnostics.assetStatuses` was typed `Record<string, string>` but
`window.__THREE_GAME_DIAGNOSTICS__?.assets` is `Partial<Record<string, …>>`, so `tsc` failed with
TS2322. Fixed in `cec50777` by widening to `Record<string, string | undefined>` (1 line, inside the
review-fix allowance). Recorded because a done-move would have carried a red tsc into a drain.

**F-1038-3 — a temporary mutation control was left in the measurement path.**
The delivered spec contained a `page.route('**/src/assets/generated.ts')` rewriting
`nonCriticalGeneratedAssetSlots` to `[]` — i.e. disabling the very prefetch `:224` asserts. It was
added **after** both measured runs (proof: those artifacts show all 5 prefetch rows, which the route
would have made impossible), so it was a *still-bites* control for `:224` that the capacity kill
interrupted before it ran. **Removed in `cec50777`** — shipping it would have made `:224` permanently
and invisibly false. Non-blocking, but exactly why an rc1 lane output must never be merged unread.

**F-1038-4 (product-adjacent, for the record) — defect 2 reading 3 is REFUTED, and the real cause is
the 250-entry cap again.**
s1037 flagged that empty `prefetchedBeforeWaveSpawn` might mean *"the wave-1 prefetch stopped happening
= a regression against `8bd9eca`"*. It did not. With the buffer raised, all five buildings appear every
run (`bld-{palisade,sentry-beacon,signal-turret,sluice-works,stockpile-yard}.png`, script-initiated at
~2996ms, img-initiated at ~3062ms). The prefetch was **always** firing; the browser's default
250-entry resource-timing buffer overflowed during boot and silently dropped it — **the same root
cause as F-1032-1**, in the positive direction this time. Corroborating measurement: `bootBytes` moves
**3,565,726 → 7,916,964** on the same build, because the old figure was summing a truncated list.
**Every perf number this spec has ever reported for boot bytes was an undercount.** No owner decision
needed; nothing goes to `src/`.

## Merge classification
Not merged. `lane/m3` = `main` + 2 commits, both **LANE-TOUCHED only**, no MAIN-MOVED files, no
conflicts possible:
- `e2e/perf-05-startup.spec.ts` — lane-touched
- `artifacts/perf-05/after-desktop-chrome.{json,png}`, `after-mobile-chrome.{json,png}` — lane-touched

## To close (next fire, ~5 minutes)
1. Confirm no `codex exec` is running (`pgrep -f "codex exec"` empty).
2. `npx playwright test e2e/perf-05-startup.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1` in `worktrees/lane-a`.
3. Green ⇒ path-scoped merge of the two files to main, close F-1034-3's perf-05 half, gazette-exempt (test-only).
4. Still red on `:231` **with an idle machine** ⇒ that is a genuine TTI regression and a **new** finding — do not widen the threshold (F-1026-1 class).
