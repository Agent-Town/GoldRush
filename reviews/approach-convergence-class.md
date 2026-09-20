# approach-convergence-class — the F-1207-1/2 cure: `moveHeroTo` converges instead of guessing

**Slice:** `lane-b-approach-convergence-class` · **Branch:** `lane/m4` · **Tip:** `c162bd1a` · **Merge-base:** `058762f9`
**Drained by:** s1210 fire, 2026-07-29 · **Landed in:** `0114f5bb` — ⚠️ **see F-1210-6, this was an unlabelled sweep, not a deliberate commit**

## Verdict

**ACCEPT — and it is better than its own report claimed.** The cure is proven green on the release gate suite under that suite's *real* config, and the residual red the runner honestly reported as remaining is **not this slice's** — it is GG-01b's, proved by control (F-1210-5).

## What it does

s1207 measured the root cause: `moveHeroTo` made **one correction pass per axis, x then z, never re-checking x after z**, and each correction sampled the hero through a `page.evaluate` round-trip measured at **166–491 ms against an intended 25 ms loop** — so its accuracy was bounded by sampling latency, and no timeout could ever help a hero already stopped in the wrong place.

This slice moves the control loop **inside the page**: a single `page.evaluate` dispatches the keydown and then samples `__THREE_GAME_DIAGNOSTICS__` every **16 ms in-browser**, releasing the key by a speed-aware lead (`speed / 28 + 0.08`) and resolving only once the hero has actually stopped. The outer loop re-picks the dominant axis each of up to **12 attempts** and converges on `hypot(dx, dz) <= 0.12` rather than per-axis inequalities. It also dismisses a `levelup` overlay that could otherwise eat the movement.

That is a fix aimed at the measured mechanism, not at the symptom.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green, 1.38 s** |
| `e2e/release-build.spec.ts` under `playwright.release.config.ts`, both projects | **24/26** — the 2 failures are GG-01b's, see F-1210-5 |
| **Control: the cured suite with GG-01b reverted** | **2/2 PASSED, 57.9 s** |

Runner's own numbers, retained: before **5/8 (62.5%)** approach failures → cured **0/8**, with **72/72 movements converged inside the 0.12 radius**. **Mutation control:** reducing the 12 attempts to 3 restored **6/8** failures — a guard shown failing, not only passing.

## Merge classification

Base `058762f9` (an ancestor of main; `lane/m4` was exactly **1 ahead**). `git diff 058762f9 main` on both paths is **empty** — main never moved them, so both applied clean with no 3-way judgment.

| File | Class | Resolution |
|---|---|---|
| `e2e/release-build.spec.ts` | **LANE-TOUCHED only** (+55/−22) | clean apply |
| `logs/suite-red-inventory.md` | **LANE-TOUCHED only** (4 lines, ±2) | clean apply — runner re-fingerprinted row 198 honestly rather than deleting it |

**Test-only slice: no `src/` file is touched**, so it cannot alter game behaviour — its entire risk surface is the harness itself.

## Findings

### F-1210-5 (BLOCKING, and it is MINE not this slice's) — GG-01b regresses `e2e/release-build.spec.ts:21` on both projects

See `reviews/gg-01b-gazette-welcome.md` and the handoff. Summary of the control run, done this fire on one tree with one variable:

| Arm | `release-build.spec.ts:21`, desktop + mobile |
|---|---|
| lane-b cure **+ GG-01b** (`9825441f`) | **2/2 FAILED** — `locator.click` timeout 150 s on `getByTestId('town-open-board')`, *"element is not visible"* |
| lane-b cure **− GG-01b** (reverted `TownScene.ts`/`ProfileStorage.ts`, `TownWelcome.ts` + welcome spec moved out, `grep -c TownWelcome src/town/TownScene.ts` → **0**) | **2/2 PASSED, 57.9 s** |

The mechanism is coherent rather than coincidental: GG-01b's welcome takes over a **fresh profile's first town entry**, and its **first anchored beat is the Tavern board** — precisely the control `:21` cannot click. `release-build.spec.ts` creates exactly that fresh profile and knows nothing about the welcome.

⚠️ **This is very likely a TEST-KNOWLEDGE gap rather than a product defect** — a real player is *meant* to be taken through the welcome first — but that is a hypothesis, and it does not change the fact that **main is currently red on the suite that guards what ships**. It must be cured or explicitly ruled on before a release, not absorbed into the inventory.

**Why my own GG-01b battery missed it, which is the generalisable half:** `e2e/release-build.spec.ts` runs **only** under `playwright.release.config.ts` (`testMatch: /release-build\.spec\.ts/`, a `vite preview` server on port **5190**, reached via `npm run test:release`). It is therefore invisible to the dev config, and it is **not** in the drain skill's adjacent minimum (`task-025` + `m1-01` + `m2-01`). A drain can run every listed gate, pass them all, and never touch the release suite. ➡️ **The release suite deserves a place in the drain minimum for any slice that changes first-boot or town-entry flow.**

I proved the config point the hard way and record it so the next fire does not: running this suite under the **default** config fails **10/10** — including `dist has no later manifest ids`, a test no graft of mine could affect. *A red inherits its harness config; check which config a suite belongs to before believing a single one of its rows.*

### F-1210-6 (MEDIUM, mine) — this slice merged as an unlabelled sweep

`git checkout c162bd1a -- <paths>` **stages** what it writes. My later `git add tasks/... && git commit` was a **plain commit**, which commits the whole index — so this slice's two files rode into `0114f5bb`, a commit whose message describes only GG-01b ledger work. The content is correct and fully gated, but the commit message does not name it, and a future `git log` reader would not find this slice where it landed. **This review and the ledger entries are the correction.** ➡️ *After any `git checkout <ref> -- <path>`, run `git status` before committing — the index is not empty just because you did not type `git add`.*
