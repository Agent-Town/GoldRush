CODEX: model=gpt-5.6-sol effort=high
# lane-trail-guide-plain-boot-timeouts — F-1204-3: make the plain-boot proof survive its own default timeouts
**FIRE-AUTHORED (attended review welcome)** — s1204, 2026-07-29

ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.

## WHY (measured by the s1204 drain gate, not inferred)
`lane-trail-guide-plain-boot-proof` (branch `lane/m4`, tip `d7d8ba03`) was **gated and REJECTED at the drain**, not because its content is wrong — the content is right and the owner asked for it — but because the spec is **flaky at the repo's canonical worker count**. It is the whole deliverable: the slice adds **zero `src/` bytes** (198-line new e2e + 12 screenshots), so every failure is in the spec's own waits.

Measured by s1204 on the merged tree, same box, same command:

| Configuration | Result |
|---|---|
| desktop alone, 1 worker | **PASS** (25.5 s) |
| both projects, 2 tests, 2 workers (the canonical invocation) | **1 fail / 1 pass** — while the lane runner's own report claimed 2/2 |
| both projects, `--repeat-each=2` (4 tests, 2 workers) | **4/4 FAIL** |
| same, **with GG-01 reverted** (control arm) | **4/4 FAIL** — identical |

➡️ **The control matters: GG-01 is NOT implicated.** GG-01 (`d2fc1b06`) auto-opens the Herald on first town entry and sets `ui.inert`, which was the obvious suspect for a fresh-boot town flow. Reverting `src/town/TownScene.ts` + `src/news/heraldReader.{ts,css}` and re-running gave the **same 4/4 red**. This is a property of the spec, not of the merge it landed beside.

**The mechanism, read at source.** `playwright.config.ts:13` sets the repo-wide `expect` timeout to **5 s**. The spec's author already raised the timeouts they had seen bite — `:64` (8 s), `:170` (15 s), `:191` (15 s) — but **two waits were left at the 5 s default**, and those are exactly the two that fail:

- **`:189`** — `expect.poll(() => …harvest.channeling ?? false).toBe(true)` — 3 of 4 failures. Its own sibling one line later (`:191`) already carries `{ timeout: 15_000 }`.
- **`:166`** — `expectGuideBeat(page, testInfo, 1)` → a `toBeVisible()` that inherits the 5 s default — 1 of 4 failures.

⚠️ **DO NOT "fix" only `:189`.** The first diagnosis was exactly that one-line cure, and capturing the failing line numbers under load refuted it — `:166` fails by the same mechanism through a different helper. **Fix the class, not the instance.**

## READ-FIRST
- `logs/session-scratch/s1204-unmerged-trail-guide/trail-guide-plain-boot.spec.ts` — the rejected spec as authored (also in git at `d7d8ba03:e2e/trail-guide-plain-boot.spec.ts`; the 12 screenshots are in the same commit).
- `reviews/trail-guide-plain-boot.md` — the s1204 gate rejection with the full evidence table.
- `playwright.config.ts:11-13` — test timeout 30 s, expect timeout 5 s. These are the numbers you are working against.
- The sibling waits at `:64`/`:170`/`:191` — the house pattern for "this one is genuinely slow".

## PRE-FLIGHT (LANE-SAFETY invariant)
`lane/m4` holds **undrained content** (`d7d8ba03`, the rejected slice). Any dirty tracked blob must be reachable in git, else STOP. **Do NOT `reset --hard` away `d7d8ba03` — it is the only working copy of the 12 screenshots besides the session scratchpad.** Re-land on top of it.

## SCOPE
1. Re-land the spec from `d7d8ba03` (content unchanged in substance — it is correct).
2. Give **every** wait in the spec that can be gated by sim progress a timeout consistent with its siblings. Prefer a **class fix** — e.g. one configured `expect` for the file, or a named constant applied to all sim-progress waits — over patching the two lines that happened to fail today. State in your report which waits you covered and why that set is complete.
3. Keep the plain-boot guarantee **exactly** as authored: `page.goto('/')` and `expect(new URL(page.url()).search).toBe('')`. **That assertion is the entire point of the slice** (Mistake #10) — it must not be weakened to buy stability.
4. Do not paper over a real hang: if a wait needs more than ~20 s, say so in the report rather than raising it silently.

## TOUCH-ONLY
`e2e/trail-guide-plain-boot.spec.ts` · `artifacts/trail-guide-plain-boot/` (regenerated screenshots).
**NO:** `src/` of any kind · `playwright.config.ts` (changing the global 5 s expect timeout would silently re-time **every** suite in the repo — that is a repo-wide decision, not this slice's) · any other spec.

## SELF-CHECK (this is the gate that rejected the predecessor — clear it explicitly)
- `npx playwright test e2e/trail-guide-plain-boot.spec.ts --repeat-each=2` → **4/4 green, both projects.** This is the exact command that produced 4/4 red; reporting anything less is not evidence.
- Then the canonical invocation (no `--repeat-each`) → 2/2 green.
- Zero console/page errors (the spec already asserts this — keep it).
- Screenshots regenerated into `artifacts/trail-guide-plain-boot/`.

READY-FOR-GATES + report: which waits you raised, the value you chose for each, the `--repeat-each=2` result, and whether any wait needed more than 20 s (a signal of a real product slowness worth its own finding).
