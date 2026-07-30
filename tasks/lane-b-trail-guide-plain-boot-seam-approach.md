# Task trail-guide-plain-boot-seam-approach: land the plain-boot teaching proof on the hardened hero-approach helper (LANE SLOT)
FIRE-AUTHORED s1256 (attended review welcome)
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `lane/m4`, commit prefix `test:`).
CODEX: model=gpt-5.6-sol effort=high

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time note (s1256 — **verify it yourself anyway**): `lane/m4` was 4 ahead at `307eb766`, and all four are safe dupes by content — `lane-b-lb-03-bench-seed-sets` (drained s1222 `af226e93`), `lane-bench-fields` (s1216 `b5cb6c60`), `lane-county-standings` (shipped `4c72f2e7`), `lane-b-approach-convergence-class` (s1210 `0b8db8f9`). Worktree measured clean. Driver: `logs/session-scratch/s1256/lane-safety.mjs`.

## Why — this is ATTEMPT 4, and the first three all died on a defect none of them was looking at

The owner LIFTED the gate on this proof on 2026-07-29 (`b70e410d`, BACKLOG "OWNER MORNING TRIPLE": *"Trail-guide plain-boot proof PROMOTED from DRAFT (owner's tutorial push = the go) -> queued lane-b"*). It is the Mistake #10 guarantee that a player who launches the game plainly — no `?debug`, no flags — is actually taught the first claim. Three lane attempts failed and s1206 parked it under §5 with an explicit instruction: **do not author a fourth cure until F-1206-1 separates the two readings it could not choose between.** s1256 ran that discrimination. Here is what it measured, all of it on today's main, all of it reproducible from `logs/session-scratch/s1256/`.

**The spec is stale in exactly three lines, and they are not the problem.** GG-04 (`c5a00849`) removed the greenhorn question; `greenhorn-question` now exists nowhere in `src/`, and three specs on main assert `toHaveCount(0)`. The parked spec asserts it VISIBLE. Correct those three lines to today's truth and nothing else changes.

**Arm 1 — `--workers=1`: 2/2 PASS. This proves nothing, and it is the trap.** s1205's own control was `--workers=1 --repeat-each=2` and it passed 2/2 *while the defect was live*. A green at `--workers=1` on this spec is uninformative. (This is the one place the house default of F-1212-2 inverts — see the self-check.)

**Arm 2 — the canonical arm (default workers, both projects, `--repeat-each=2`): 4/4 RED, at THREE different lines.** `:196` beat-2 poll (×2), `:200` `economy.gold` expected >0 received 0, `:219` `harvest.channeling` expected true received false. **Two of those three never touch `hud-agent-feed` at all**, so the feed-overtaking premise that attempt 3 was built on cannot explain them.

**Arm 3 — instrumented: F-1206-1 is separated, and both of its readings are wrong.** At the moment of failure the recorder held THREE entries and `feedLive` matched its last entry exactly, with `feedNodePresent: true` — **the recorder is not deaf**, so reading (a) is refuted. And `channeling: false`, `gold: 0`, `distToNearestSeam: 1.89–2.02` — **the feed was empty of the beat because the beat never fired, because the hero never worked the seam.** The `""` entry that puzzled s1206 is the spec's own dismissal at `:192-193`. Reading (b) is therefore right about the feed and wrong about the cause: this was never a news/feed defect.

**The actual defect: the spec's own `moveHeroTo` cannot put the hero on a seam.** Across 13/13 observed moves — failing runs *and passing runs alike* — it never once landed within its own stated tolerance of `0.12`. Measured misses, aiming at `{x:-9, z:6.7}`: **1.474 · 1.222 · 1.909 · 1.779 · 1.222 · 0.951 · 2.153 · 1.523 · 1.210 · 0.819 · 1.358 · 1.219 · 0.237**. Runs failed at ~1.78–2.15 and passed at ~0.95–1.47. **The proof has been passing by luck** whenever the miss happened to land inside harvest range. It aligns X by polling hero position over the wire, then aligns Z, and never re-checks X; under concurrency each round-trip stretches and the hero runs on.

**A cure was prototyped and REFUTED, and that matters more than the one that worked.** Iterating the axis alignment until it converges went **3/4, not 4/4**, and hit its 12-pass cap still 1.2–2.15 out. Twelve corrective passes cannot close a 1.2-unit gap — the target is not being overshot, it is **unoccupiable**. A seam centre is not a place the player can stand.

**The cure that worked is already in this repo, hardened, and you must reuse it rather than reinvent it.** `e2e/release-build.spec.ts:311` has a completely different `moveHeroTo`: it picks the larger-delta axis each pass, loops up to 12 passes, and — the part that matters — **presses and releases the key INSIDE the page** (`page.evaluate` + a 16 ms sampler), releasing with a braking lead of `speed / 28 + 0.08` and waiting for `speed < 0.05` before declaring arrival. No round-trip sits between "arrived" and "release". It also survives level-up overlays. **`release-build.spec.ts:306` drives to `moveHeroTo(page, -9, 6.7)` — the exact seam this spec fails on — then asserts `channeling` true at `:307`, and that suite is green (26/26, s1255).** So the product is fine and the seam is reachable-enough; the parked spec simply re-implemented a solved problem badly.

s1256 also confirmed a stop-when-actually-harvesting variant goes **4/4 green at the canonical arm, replicated 4/4 in a second independent battery (8/8 total)** — but that is a workaround, and the hardened sibling is the engineered answer. Prefer the sibling; the workaround is your fallback if the sibling genuinely cannot be reused.

## Scope (numbered; each item independently checkable)

1. **Extract the hardened approach helper into a shared module** — `e2e/helpers/hero-approach.ts` (new file), lifted from `e2e/release-build.spec.ts:311-365` with its in-page press/release, braking lead and level-up handling intact. Keep its behaviour identical; this is a move, not a redesign.
2. **Land the plain-boot proof** as `e2e/trail-guide-plain-boot.spec.ts`, taken from `archive/lane-m4-trail-guide-observed-beats:e2e/trail-guide-plain-boot.spec.ts` (tip `45f78f6e`; a byte-identical copy is at `logs/session-scratch/s1256/parked-trail-guide-plain-boot.spec.ts`, sha256 `f13241fbfb2395ca`), with **exactly two changes**: (a) its three greenhorn-question lines replaced by `await expect(page.getByTestId('greenhorn-question')).toHaveCount(0);`, and (b) its local `moveHeroTo`/`pressUntil` deleted in favour of the shared helper from scope 1. **Every assertion, every timeout and the whole feed-recorder stay exactly as they are.**
3. **Report the miss distances your run actually achieves**, the same way s1256 did — aimed vs landed vs miss for each approach. This is the number that decides whether the fix is real; a green without it is not reportable. If your misses are still ~1.0+ and the spec passes anyway, **say so plainly** — that means it is passing inside harvest range rather than arriving, and the drain needs to know.
4. **⛔ STOP-AND-REPORT if the beat track still reds at the canonical arm.** Do not raise a timeout, do not weaken an assertion, do not fall back to checking `hintsSeen` alone (that proves the beat fired, not that a player could see it — the entire point of this proof), and do not touch `src/`. Three attempts have already died by curing the wrong thing; a fourth red is a finding, not a licence to improvise.
5. **Report the duplication you are leaving behind.** After scope 1 there are two callers' worth of history: the new shared helper and the copy still inlined in `release-build.spec.ts`. **Do NOT refactor `release-build.spec.ts` in this slice** (see the firewall — it is config-owned and ~160 s). State in your report that the duplicate remains, so the drain can raise it as a follow-up.

## Firewall

**TOUCH-ONLY:** `e2e/helpers/hero-approach.ts` (new) · `e2e/trail-guide-plain-boot.spec.ts` (new) · `artifacts/trail-guide-plain-boot/` screenshots.

**NO:** ⛔ **zero `src/` bytes — this slice changes no product code whatsoever** · do not touch `e2e/release-build.spec.ts` (config-owned release suite, `playwright.release.config.ts`, ~160 s — the duplication is scope 5's *report*, not its work) · do not touch `e2e/trail-guide.spec.ts` (GG-04 renamed tests there and `tasks/BACKLOG.md` cites them; s1255 F-1255-2) · do not touch `playwright.config.ts` or any timeout constant · do not edit `logs/suite-red-inventory.md` · no new dependencies.

## Self-check (name the exact commands and both projects)

- `npx tsc --noEmit` clean · `npm run build` green.
- 🚨 **THE GATING RUN IS THE CANONICAL ARM, NOT `--workers=1`.** Run `npx playwright test e2e/trail-guide-plain-boot.spec.ts --repeat-each=2` with **default workers, both projects** and report all four results. **This inverts the usual drain config on purpose**: F-1212-2's `--workers=1` rule exists because load produces false REDS, but on this spec `--workers=1` produced a false GREEN through three attempts. Report the `--workers=1` run too, as the contrast — but it is not the gate.
- Report `uptime` loadavg before and after; a green on a quiet box is the weakest evidence available here.
- Adjacent, at `--workers=1`: `npx playwright test e2e/trail-guide.spec.ts --workers=1` green both projects (the sibling suite that shares this subject).
- Zero console/page errors — the spec already asserts this at its last line; do not remove it.
- Screenshots desktop **and** 390px into `artifacts/trail-guide-plain-boot/`.

## READY-FOR-GATES + report

Report: the canonical-arm result (all four runs, pass or fail) · your measured aimed/landed/miss numbers per approach · loadavg before/after · the two changes you made to the parked spec and nothing else · confirmation that `src/` is untouched (`git diff --stat` proves it) · the `release-build.spec.ts` duplication left standing per scope 5 · and, if you stopped under scope 4, exactly which line red and what the recorder held at that moment.
