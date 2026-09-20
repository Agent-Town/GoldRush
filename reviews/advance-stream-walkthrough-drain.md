# Drain review — f1614-1 advance-stream walkthrough table (F-1532-2)

**Slice:** `f1614-1-advance-stream-walkthrough-table` · **branch:** `lane/b` @ `ec456981b` · **merge:** `21b473464e5d77781e7d133969f43be20881ba64` (`21b473464`) · **drained:** s1616, 2026-08-10T05:05Z

## Verdict

**MERGED.** The deliverable is real, reproducible, and is the thing Robin asked for by name ~13 days ago. Three findings ride along, none of which impeach the table: one says the slice's own prescribed control is vacuous (and was vacuous *by construction*, so the runner could not have satisfied it as intended), one is a lane-freezing hygiene trap armed by the new spec, one is a precise statement of what the WARM column can and cannot see.

## What it does

Adds `e2e/advance-stream-walkthrough.spec.ts`: a single long test (180 s budget) that walks the five doors **menu → town → contract1 → town-return → contract2** with every binary `.glb` request throttled to 150 ms, and classifies the GLB traffic each door involved into WARM (a request for that URL carrying `x-gold-rush-prefetch: 1` had *completed* before the door opened) versus COLD. It writes the resulting table to `artifacts/advance-stream-walkthrough.md` and `reviews/advance-stream-walkthrough.md`. The mechanism assertions are `town.warm > 0` and zero console/page errors — deliberately not exact counts, per the master's own anti-flake clause.

## Evidence (all re-run drain-side; nothing inherited)

Gated on the **merged tree in a detached worktree** (`worktrees/gate-s1616`, §3.0b) against a scratch dev server on **:5199** — 5188 was held by lane-a's live f1615-1 gate (Mistake #12 attribution hygiene). All playwright at `--workers=1` (§3.1).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, clean |
| `npm run build` | **rc=0**, built in 1.55 s; asset-diet 235 GLBs 592.0 MB → 92.7 MB |
| `e2e/advance-stream-walkthrough.spec.ts` | **rc=0 · 2/2 passed · 35.7 s** (desktop-chrome + mobile-chrome) |
| adjacent `e2e/advance-stream.spec.ts` | **rc=0 · 10/10 passed · 28.1 s** (both projects) |
| console/page errors | zero — asserted in-spec (`expect(errors).toEqual([])`) |
| `test:node-guards` | **correctly OUT of battery** per F-1460-1: the diff is `e2e/` + two `.md`, **zero `src/`** |

**The table, reproduced drain-side** (independent of the runner's run — this is the desktop arm):

| Door | WARM | COLD |
|---|---:|---:|
| menu | 0 | 0 |
| town | 2 | 8 |
| contract1 | 7 | 8 |
| town-return | 4 | 6 |
| contract2 | 2 | 8 |

Mobile reproduced `0/0 · 2/8 · 7/8 · 2/8 · 2/8`, byte-identical to the committed file. The only cell that moved between projects and between runs is **town-return** (2|8 vs 4|6) — the leg the master flagged as the one never previously executed under throttling. Everything else reproduced exactly, twice.

## Merge classification

Base `bd8aae1bd`. `main..lane/b` was exactly one commit. All three paths **LANE-ONLY, all-new files** — main had never seen any of them (`lane-freeze-classify` read `HELD LANE-ONLY 9/9, 152/152, 9/9`). **No conflicts, no 3-way graft, nothing MAIN-MOVED.** Main advanced by two attended commits (`f5e940f57`, `60d6a8e0b`) mid-gate; both touch `tasks/**` only — no `src/`, `e2e/`, `scripts/` or `playwright.config.ts` — so the battery taken at `bd8aae1bd` remains valid on the merged tree.

## Findings

### 🔺 F-1616-1 — the slice's prescribed prefetch-disabled control is VACUOUS, and it was unsatisfiable as intended

The master's self-check and the BACKLOG gate both require: *"the prefetch-disabled control showing the WARM column collapse — a table whose warm column is unchanged with the stream off is measuring nothing."* The control is `/?tier=lite`.

**Measured this fire, both projects:** the control table is **all zeros — WARM *and* COLD**, every door.

```
| menu | 0 | 0 |  | town | 0 | 0 |  | contract1 | 0 | 0 |
| town-return | 0 | 0 |  | contract2 | 0 | 0 |
```

The WARM column does collapse, so the gate is **literally met** — and it carries **no information**, because the COLD column collapsed with it. An all-zero control cannot distinguish *"prefetch stopped warming"* from *"nothing was requested at all"*, which is exactly the failure mode the gate line was written to prevent, arriving through the door the gate line did not cover.

✓ **VERIFIED it is unsatisfiable by construction, not by the runner's choice** — `src/assets/AdvanceStream.ts:250-252`, `threeDimensionalAssetsEnabled()`, returns false on `terrain2d` **or** `tier=lite`, and that one predicate gates the whole 3D asset path, demand-loads included. There is no prefetch-only disable flag. So *any* runner obeying this control literally would produce an all-zero table. The runner reported `WARM 0/0/0/0/0` — precisely the column it was asked for (item (e)), and precisely the half that hides the problem. **No dishonesty: the master asked for one column and the missing column is the one that voids the result.**

**The discriminator is nonetheless proved, by better evidence available inside the main arm:** within a *single* run, town reads `2 WARM / 8 COLD` while contract1 reads `7 WARM / 8 COLD`. A degenerate classifier cannot produce different ratios at different doors of the same run. That within-arm variance, reproduced across two independent runs and two projects, is stronger evidence than the lite control was ever capable of giving.

➡️ **A real control IS constructible spec-side with no `src/` change:** `page.route` already intercepts every `.glb`; abort or delay only the requests carrying `x-gold-rush-prefetch: 1`, leaving the 3D path enabled, then assert **COLD stays non-zero while WARM collapses**. Folded into the corrective below. **GATE: none owed to the owner — spec-side work with a ruling already behind it.**

### 🔺 F-1616-2 — the new spec rewrites a TRACKED `reviews/*.md` on every run, which is a hard STOP in both pre-flight templates

`e2e/advance-stream-walkthrough.spec.ts:97` writes `reviews/advance-stream-walkthrough.md` — a **tracked** file — every time the test runs. Both pre-flight templates in `.claude/skills/author-task/SKILL.md` (LANE and MAIN) end with the same sentence: *"What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`."* The FACTORY-CHURN and EVIDENCE-ARTIFACT exceptions cover `artifacts/**`, `reviews/shots-*` and `.png` — **`reviews/*.md` is deliberately excluded from both.**

✅ **CONFIRMED BY MANUFACTURE, not by argument** (the s1299/s1300 standard — a passing check is not evidence about the failing path). A desktop-only run on the merged tree, then `git status --short`:

```
 M artifacts/advance-stream-walkthrough.md
 M reviews/advance-stream-walkthrough.md
```

That is the exact predicate `f1406-1` died on — **54,875 tokens for zero edits** (F-1407-1). ⓘ **It hid during the two-project run** because playwright runs projects in declared order, mobile ran last, and mobile's numbers happened to reproduce the committed file byte-for-byte; the desktop arm had already written `town-return 4|6` over it and been overwritten back. **A trap that is invisible whenever the last project agrees with the committed bytes is worse than one that always fires**, because the board reads clean until the day it does not.

📐 **Two aggravations, both structural.** (1) Every other e2e spec in the repo writes only to `artifacts/**` or `reviews/shots-*` — ✓ verified across all `writeFile(` call sites in `e2e/`; **this is the only spec that writes a tracked `reviews/*.md`**, so the convention exists and this is the sole exception. (2) Both projects write **the same path**, so at the 6 workers a lane shell uses (`workers: isFireShell ? 1 : undefined`), the two project instances race on one file.

➡️ **CURE (corrective authored this fire): write only `artifacts/`; keep the committed `reviews/advance-stream-walkthrough.md` as the static owner-facing artifact it already is.** The owner deliverable is a *record of a measurement*, not a file that must silently re-derive itself under every unrelated suite run. **GATE: none owed to the owner.**

### 🔧 F-1616-3 — the WARM column measures request ORDERING, not cache warmth, and the data proves it

Both columns are computed from `door.demands`, which by construction holds only requests **without** the prefetch header (`:28`). So a URL is counted WARM iff it was prefetched-to-completion **and then demand-requested again anyway**.

✓ **This is not a reading of the code, it is visible in the numbers: `WARM > 0` is only possible when a completed prefetch failed to prevent a second request.** Town shows 2 such URLs, contract1 shows 7. Meanwhile `AdvanceStream.ts:191-193` fetches with `cache: 'force-cache'` — the prefetch's entire value proposition is a populated HTTP cache, and in this harness that cache is demonstrably not being reused.

So the table faithfully answers *"was this door's fetch preceded by a completed prefetch?"* and **not** the question the owner's phrasing asks, *"what was already warm at each door?"* — an asset genuinely served warm from cache would fire no request and appear in **neither** column.

⚠️ **UNVERIFIED, deliberately, and it is the part worth someone's time:** whether the re-request is an artifact of `page.route('**/*.glb')` interception bypassing the browser cache, or a real property of play. **If it is real, the advance stream downloads its assets twice in normal play** — a genuine performance defect, and a much larger finding than this drain. Distinguishing them costs one probe (walk the same doors with no `page.route` at all and count requests per URL). **Not attempted here: out of this drain's scope, and it is a measurement, not a guess to record as fact.** **GATE: none owed to the owner; any fire may take the probe.**

## Where does the PLAYER see this, in a plain boot? (Mistake #10)

**Nowhere, and that is correct.** This slice is evidence-only: one new `e2e/` spec and two markdown tables. It changes no `src/`, renders nothing, and the firewall named `AdvanceStream.ts`, `TownTavernPilot.ts` and `Terrain3dClaimPilot.ts` as untouchable precisely so that measuring the prefetch set could not alter it. ✓ Verified: the merge diff is `e2e/` + 2 `.md`, zero `src/`. **No GZ-01 news item is owed** — nothing player-visible merged.
