# F-1489-1 — measurements (s1491, 2026-08-06)

**Question asked by the GATE:** *"bisect when the quiet-green property was lost and either
re-establish it or re-classify the red with a named cause."*

**Answer: the property was never lost, so there is nothing to bisect. Re-established below,
18/20 instances. A commit bisect run as instructed would have convicted an innocent commit.**

## Arrangement (held constant unless named)

- Tree: detached worktree `gate-s1491` at **`720035960`** (current main; contains the halo-cure
  merge `ed6dafbd8`). Main's own tree was never used — §3.0b custody + Mistake #12 attribution.
- Server: external `vite --port 5234 --strictPort` (5188 deliberately avoided: `lane-a` was
  **BUSY** the whole session and holds 5188 under `strictPort`).
- `--workers=1` on every run (§3.1, F-1270-1).
- Box was **not** quiet: a Codex lane task ran throughout. That makes the green arms *stronger*,
  not weaker — they greened under more load than s1489's "nothing else running" control.
- Probe: `artifacts/f1489-1/probe.mjs` — one file, so the predicate cannot drift between runs.

## The six runs

| # | arm | server | result |
|---|-----|--------|--------|
| 1 | isolated `-g "warmed test clip swaps"` | warm | **2 passed / 0 failed** |
| 2 | isolated, `--repeat-each=3` (F-1146-6's recipe **verbatim**) | warm | **6 passed / 0 failed** — 3/3 desktop, 3/3 mobile |
| 3 | **battery**: `vp-02-sprite-animation` + `vp-02b-rotation-resolver` + `run3d-rail-elements` | warm | 45 passed / **1 failed** — `:461` textures **28→29** |
| 4 | battery (identical to 3) | warm | 42 passed / **4 failed** — `:461` desktop **32→33**, `:461` mobile **28→29**, plus `:320` and `:566` |
| 5 | isolated, `--repeat-each=3` | **cold** (server restarted, `.vite` purged) | 4 passed / **2 failed** — `:467` draw calls, desktop **84→85** and mobile **61→62**, both on **repeat1** |
| 6 | isolated, `--repeat-each=3` | **cold** (identical to 5) | **6 passed / 0 failed** |

**Quiet-arm tally: 18 of 20 instances PASS. Battery arm: RED in 2 of 2 runs.**

## What this establishes

1. **The documented quiet-GREEN property REPRODUCES.** Run 2 is F-1146-6's recipe executed
   verbatim and returns its documented result exactly: 3/3 both projects. Runs 1 and 6 agree.
2. **The documented contended-RED half also reproduces**, reliably (2/2), under the *battery*
   composition — which is the composition s1489's own evidence table names
   (`reviews/f1486-1.md:29`).
3. **So the fingerprint is intact in both directions.** The next fire meeting this red *can*
   retire it the documented way. F-1489-1's premise — *"on this box today it reds quiet"* — does
   not reproduce.

## Two hypotheses I raised and then killed with my own data

- **"Composition is the discriminator"** (after runs 1–4). Plausible, and it fit: F-1146-6's
  "isolated" means *one test via `-g`*, while s1489's control ran the 3-spec battery, so the two
  fires may simply have meant different things by the same word. **Run 5 broke it**: an isolated
  run went red too.
- **"A cold dev server is the discriminator"** (after run 5). This one was seductive — both
  failures were `repeat1`, the *first* instance of each project, greening on repeats 2 and 3, and
  mobile's **61→62** is *exactly* the number s1489 reported. A tidy mechanism, a matching number,
  and a first-instance signature all pointing one way. **Run 6 broke it**: same cold arrangement,
  6/6 green.

⚠️ **Neither hypothesis survived a re-run of its own arrangement, and both would have read as
solid findings if I had stopped one run earlier.** The house law *"re-run the SAME commit before
bisecting a number — two answers ⇒ noise, so no commit can be blamed"* is usually cited about the
subject under test; here it applied to **my own explanations**, twice in one session.

## Why a bisect must NOT be run

The GATE asks for one, and it is the wrong instrument for this subject:

- In the **quiet** arm the predicate is non-deterministic (18/20), so a bisect step can flip on
  noise alone.
- In the **battery** arm the predicate is red at *current main* and was red at *pre-merge main*
  (s1489's own control), i.e. **all-BAD** — and an all-BAD bisect converges on an innocent commit
  by construction.

Both failure modes are already written down as house law. This is the first time they have been
**measured** rather than cited, which is the durable half of this fire.

## Named cause (the GATE's second branch)

`vp-02-sprite-animation:405` is a **load- and arrangement-sensitive flake**, unchanged in kind
since F-1136-1. Its assertions compare a `baseline` sample against an `after` sample of
`renderer.textures` / `renderer.calls`; the harness's own comment records that boot-time lazy
uploads "land for seconds and vary run-to-run". When the box or the harness is slow enough, one
lazy upload crosses the baseline boundary and the count is off by exactly one — which is why the
signature is always **+1**, why it moves between the texture assert (`:461`) and the draw-call
assert (`:467`), and why the absolute counts drift as the game grows (30→32→84 desktop).

**It is not a regression, it is not a re-pin candidate, and it does not belong to any commit.**
