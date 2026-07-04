# s27 — Healthy-VM sweep (s26 BINDING rider) + icons gate (s9j item 1)

**Verdict: rider DISCHARGED — vp-02c graduates from integrated-pending-sweep to INTEGRATED; both s25 env exceptions RETIRED with root causes (neither was env); one REAL production defect found and fixed at gate; permanent icons gate added (no repro of the live sighting at HEAD).**

VM: healthy era (A/B canary — the hit-pause split that failed 8× `ERR_INSUFFICIENT_RESOURCES` on s26's VM — passed 4/4 in 24.2s first try). Neighbor load rose mid-session (loadavg 1.5→2.8); per-project serial runs absorbed it (recipe below). Env: home-disk unusable era continues; built in `/tmp/gr-s27` (s26's `/tmp/gr` belongs to a dead session's UID — mode 700 nobody; use a fresh suffixed dir per session), chromium at `/tmp/pw-browsers` intact, xdamage stub rebuilt to `/tmp/locallibs-s27`.

## Rider scorecard

| Item | Result |
|---|---|
| FULL vp-02 suite (9 tests) | GREEN on final tree — rotation contract 2/2, heading sweep 1+1 (per-project), reversal 2/2, wiggle 2/2, crossfades 2/2 (×3 runs), hit-pause+one-frame 4/4, memory 2/2 (×2 runs), screenshots 2/2 (evidence refreshed in `reviews/shots-vp-02/`) |
| Canary m1-01 | 8/8 (desktop 4, mobile 2+2 split) |
| Canary visual-polish-assets | 4/4 |
| s25 exception: m2-03 timer | RETIRED — real passes desktop 9.9s / mobile 10.3s, drift assert evaluated; root cause below |
| s25 exception: vp-02 memory ±1 | RETIRED — real passes ×2 both projects; root cause below |
| Insurance canaries (renderer-memory-assert suites, after the production fix) | m1-02 3/3, m1-05 6/6 (desktop; change is projection-independent) |
| Icons regression (s9j item 1) | NO REPRO at HEAD (dev + built preview, evidence below); permanent e2e added `e2e/ui-upgrade-icons.spec.ts`, 2/2 ×2 |

## REAL production defect fixed at gate (SpriteAnimator)

**Symptom:** memory canary +1 texture, intermittent per-run (28→29 desktop, 19→20 mobile) with fades enabled, gone with `orientationFadeMs=0`.

**Mechanism (two halves):**
1. `startFade` fired on `clipChanged || orientationChanged` — but the tasks/010 mandate is "crossfade between outgoing/incoming **orientation cells**". Pure clip changes (incl. `__GR_TEST__` test clips) fading meant the overlay material pinned each freshly-retired clip's texture.
2. The overlay material kept its `map` after fade completion — a pinned, elsewhere-disposed texture gets re-uploaded whenever the overlay next renders (fps-luck), re-entering `renderer.info.memory.textures` with no owner to dispose it again.

**Fix (src/assets/SpriteAnimator.ts, 2 spots, comments in-file):** fade only `if (orientationChanged)`; release `fadeMaterial.map = null` at fade end. Clip changes return to the pre-vp-02c hard cut — which is what Robin live-judged anyway (his 8-way verdict concerned orientation smoothing; owes item 0b unchanged).

## s25 exceptions — root causes (neither was env)

**m2-03 timer ("wave reached 2 in-window"):** `expect.poll` defaults to ITS OWN 5s timeout; it does NOT inherit `test.setTimeout`. s17's 45s bump therefore never reached the poll — the recurring "env" failure tracked VM speed because 3 waves at timescale 6 take ~6s wall, right at the 5s cap. Fixed: explicit `{ timeout: 35_000 }` on the poll. The drift assert (`maxError < 0.08`) finally evaluates on slow VMs — s16/s17's actual intent.

**vp-02 memory ±1:** `renderer.info.memory.textures` is a global counter over a live lazily-loading scene — boot lazies land for seconds and vary run-to-run (traced baselines of 9 vs 28 on identical build+machine). The old test's baseline raced that ramp; VM speed decided the winner (hence s25's "±1 both directions"). Rewritten per the s10 warm-cycle law: quiesce (sheets loaded + counter stable ≥600ms) → warm both clips → one grace cycle flushes first-time uploads on the measured path → two further identical cycles must add zero textures/geometries; draw calls compared as resting floors (min over 500ms — the mandate's own language is "no NEW draw calls AT REST"; instantaneous samples carry 1-2 frame post-swap transients at headless fps). A real leak grows every cycle and still fails deterministically.

**Fade e2e (new in vp-02c, first-ever run this fire):** protocol-sampled `fadeActive` can never catch a 100ms window at headless fps — the s27 probe showed the entire fade completing inside one `moveStick`→sample round-trip (`fadeWindow` 0→1, zero sightings, samples 50-80ms apart). Rewritten: in-page rAF tracker armed BEFORE the flip, asserts via `fadeWindow` counter delta (exactly one new window, no double-fire), duration bound where observable, rest sampled PARKED (release stick → wait out the legitimate idle-snap fade → camera settle) since walking frustum drift moves scene-wide calls.

## Icons regression (s9j item 1)

No repro at HEAD: 3 offer rounds on dev server + 2 on built `vite preview` bundle — every tranche-1 family offered (plating, volley, mobility, firerate, range) rendered its icon with a decoding URL; tranche-2 (panning, prospecting) correctly clean parchment; zero console/page errors both paths. Robin's live sighting was on the s9h-era tree (mid-009-gate, the contamination window s25/s26 documented) and/or his runtime — note s26's null-cache lesson: an `ERR_INSUFFICIENT_RESOURCES`-class refusal on HIS machine would blank icons exactly like this until reload. If he sees it again: grab the console + which families.

**The debt that actually ends now:** `e2e/ui-upgrade-icons.spec.ts` pins the contract with asserts, both viewports: icon-backed family ⇒ `.upgrade-card__icon` present AND image decodes (naturalWidth>0); file-less family ⇒ clean card; ≥1 icon-backed family must appear across offers (fixed seed); zero console errors. Ground truth is a HEAD fetch with an image content-type — vite dev SPA-fallbacks unknown paths to index.html with 200, which the first version of the gate caught by failing on "panning exists" (both branches of the gate are therefore proven live).

## Recipes (new/confirmed this era)

- `/tmp/gr` from a prior session survives owned by `nobody:700` — always build in a fresh `/tmp/gr-sNN`.
- Under neighbor load (loadavg >2): run suites per-project (`--project=desktop-chrome` / `mobile-chrome`), split m1-01 mobile ["spawns Claim Jumpers|nospawn blocks" / "double restart|stress=120"]. The 27-step heading sweep exceeds its 30s test cap with 2 workers on a loaded host; per-project it passes with room.
- `expect.poll` and `expect().toPass()` have their OWN 5s default — audit any suite that "fixed" slowness with `test.setTimeout` alone (m2-03 was one; none of the other 45s-bump suites poll past 5s — checked m2-01 stress: plain expects).
- Playwright leaves a stale `.last-run.json` that can shrink a re-run to 1 test silently — full listing (`tail`, not `grep passed`) when a count looks short.

## Not done / next

- Serial lane merges (s9i): lane/m3, lane/m4, lane/perf — next fires, one lane per fire.
- tasks/012 (overwhelm valves) output gating when Robin runs the relay.
- Robin owes unchanged (012 relay, 8-way live re-judge, M1 verdict list, m2-07 veto list, jumper-sheet nod).
