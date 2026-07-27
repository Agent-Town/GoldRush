# vp-02g — west-capture null rate: make the instrument say what it saw

- **Slice:** `lane-vp-02g-west-capture-null-rate`
- **Branch / tip:** `lane/m4` @ `43d72990` (runner(lane-b), 2026-07-27T21:51:45+07:00)
- **Base (merge-base with main):** `4155cdbf`
- **Drained by:** s1141 fire, 2026-07-27
- **§3.0 drain-block-check:** ✅ CLEAR (`lane-vp-02g-west-capture-null-rate`, status `queued`)

## VERDICT: **ACCEPT — merged.** Diagnostic-only; delivers the classification the task existed to get. One non-blocking finding (F-1141-1) spawned.

## What it does

`canvasCaptureAtHeroFrame` polled for three simultaneous conditions and, on timeout,
threw `Timed out waiting for <dir> <key>` — discarding every observation it had made.
That discard is the sole reason F-1137-2 stayed open across three fires. This slice
accumulates the distinct observed `{direction, frameKey, fadeActive}` tuples (deduped,
capped at 20) plus a `framesPolled` count, and includes them in the throw.

**The success condition is untouched.** No product code, no assertion change, no retry.
18 insertions / 1 deletion in exactly one file.

## The diagnosis it bought — classification (c), the crossfade gate

Heading *does* reach `w` and the wanted `r1c0` *does* appear — but only ever with
`fadeActive:true`; the sequence then settles on the west idle `rotation2-f-r1c3` with
`fadeActive:false`. `framesPolled` 237–240 means the poll is healthy: the **condition**
is wrong, not the sampling.

⚠️ **It also overturned the inherited "mobile-only" claim.** At `--repeat-each=10`:
**desktop 5/10 failed vs mobile 2/10** — desktop is *worse*. s1137 and s1139 both
carried "mobile-only"; three fires running were corrected by nothing but a larger n.

## Evidence (s1141, measured on main after merge — not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green (built in 1.36s) |
| `vp-02-sprite-animation.spec.ts`, desktop+mobile, `--workers=1` | **19 passed / 3 failed (4.8m)** — identical to the runner's own table |
| Known-red `:724` `char.claim_jumper` desktop + mobile | ✅ still red at `:731`, unchanged (2 of the 3) |
| `:566` east-heading desktop | 🟠 red — the subject under study; re-ran `--repeat-each=3` → 1 fail / 2 pass, then `--repeat-each=2` → 0 fail. Consistent with the measured ~50% desktop rate. |
| Adjacent suites | **Not run, by construction:** the diff is one `e2e/` spec file and **zero `src/`**, so no shared module exists through which another suite could regress. Stated, not skipped. |
| Console/page errors | ✅ the 19 passing tests carry `openGame`'s error assertions |
| Dev server | scratch port **5253**, external server (`GR_CAPTURE_EXTERNAL_SERVER=1`) — **5188 belongs to the lane runners** (Mistake #12) |

## REJECT bar (s1139's, re-checked by s1141 at source — not inherited from s1140)

- ✅ `:566`/`:549` **not** made to pass — still red at its measured rate
- ✅ three-clause success condition and the `2_000` ms window **byte-unchanged** (read in the diff)
- ✅ no `test.retry` / `test.skip` / `.fixme` (`git grep` on the lane tip)
- ✅ zero `src/` — the runner commit's stat is one file
- ✅ scope-5 positive control **reverted**: `r9c9` and `west-capture-timeout` both absent by `git grep` on the tip

## Merge classification

Single file, `e2e/vp-02-sprite-animation.spec.ts`. `git log 4155cdbf..main -- <file>` is
**empty** — main never moved it, so this is LANE-TOUCHED-ONLY with no 3-way graft needed.
Applied with `git checkout 43d72990 -- <file>`; every other path in the two-dot diff
(`STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `scripts/tmp-s1140-*`) is
**MAIN-MOVED-ONLY** and was deliberately not carried back.

## Findings

### F-1141-1 (🟠 non-blocking, corrective owed) — the enriched message is **unreachable** in a normal failing run

Both call sites swallow it:

```ts
// e2e/vp-02-sprite-animation.spec.ts:579,584
const west = await canvasCaptureAtHeroFrame(page, 'w', '…r1c0.png').catch(() => null);
const east = await canvasCaptureAtHeroFrame(page, 'e', '…r0c2.png').catch(() => null);
```

`.catch(() => null)` discards the error, so the test dies at `expect(west).not.toBeNull()`
and the report shows only `Received: null`. **Verified this fire**, not inferred: the
`error-context.md` from my own desktop `:566` failure contains exactly
`Error: expect(received).not.toBeNull()` and **no observed-sequence anywhere**. The runner
got its verbatim dumps only via a *temporary* error exposure that scope 5 correctly
required it to revert — so the shipped state has a better message with no path to the report.

**This is not a firewall violation:** the task's TOUCH-ONLY named the helper at `:174-194`,
and `:579`/`:584` are outside it. The runner obeyed its contract.

🔑 **Same class as F-1140-1** (`confirmBuild()`'s `false` thrown away by
`debugPlaceAssayOffice`). Two fires in a row, the signal that names the bug was being
computed and then discarded by its caller. **Blast radius checked:** `git grep` finds this
shape at exactly these 2 sites; the third hit (`m5-04-offline-queue.spec.ts:33`) is
`response.json().catch(() => null)`, a genuinely different thing (body parsing). The cure is
~6 lines — capture the error text and pass it as the `expect` message — and it must not
change the retry-at-attempt-0 control flow, which legitimately depends on the null.

### F-1141-2 (➡️ routed, not a test finding) — the cure for the flake itself is a **design** question

Classification (c) makes this product-side: the capture wants a settled, non-crossfading
frame and the test's 2 000 ms window doesn't guarantee one. Whoever owns sprite crossfade
decides whether the fade should complete faster, whether `fadeActive` should gate the
published snapshot, or whether the harness should wait on fade completion explicitly.
**Not fire-authorable** — it bends a rendering contract. Owner/design routing.

## Gazette

Diagnostic-only merge, no player-visible change → **no GZ-01 item** (the filter law wants
a player-visible merge).
