# gauntlet-heat6-guests — drain review (s2296)

- **Slice:** `gauntlet-heat6-guests` (HEAT 6 guest field — four riders through the streaming shim)
- **Branch / tip:** `lane/b` @ `f5dfab0ac` (`runner(lane-b): gauntlet-heat6-guests.md`)
- **Merge-base:** `90bb8376f`
- **Merged to main at:** `e3b307aabccf6dd3e462243ccb4b1d3e33bfba1a`
- **Verdict:** ✅ **MERGE — a lawful STOP, and it carries one genuinely positive result.** The
  guest field never rode: the mandatory early submission probe came back
  `unassayable: engine-skew` and the master binds `skew -> STOP`. The runner stopped at
  attempt 0 rather than minting rows the live assayer cannot verify. Second drain of this
  fire, gated and committed strictly after drain 1 (`ecb70b457 (archive: pruned by the A3 rewrite)`).

## What it does

Banks the guest field's complete stop record, plus the one experiment that *did* complete.

**The stop.** The operator built and rode the advertised live build (`5109241a`) from a
detached worktree at `5109241a8f264a7167f26bd2b7a2f21a0b5c03f1`. Its fresh secured tape
declared that build, but its engine hash did not match the live assayer's, so the canonical
ledger removed the probe from ranking. All five riders (pi / Prime Agent 0.8.0, OMP 18.0.4,
Hermes 0.20.0, OpenClaw 2026.7.1-2, elizaOS 1.7.2) show `attempts 0 — not started: skew gate`.
Guest global configs were **untouched**, so no restoration was needed; the live OpenClaw
approvals file was not migrated or modified. Commons commits: **none**, which the note calls
"the truthful consequence of zero guest rides" — the correct entry to make.

**The result that did land — the streaming shim's EPIPE fix survived its first real socket
test.** This is worth separating from the stop, because it is the slice's only positive
evidence and a stopped field could easily bury it:

- Real `stream:true` gate: HTTP SSE completed with `HEAT6G_SSE_READY`, usage, and `[DONE]`.
  Gate model actually served: `gpt-5.6-luna`; 16,742 input + 11 output tokens.
- Abort probe: the client terminated a request at 250 ms (`curl` rc 28). **The shim stayed
  alive and immediately answered `/v1/models`** — `shim/models-after-abort.json` and
  `shim/models-final.json` are byte-identical blobs (`0d31775b`), which is the proof: the
  shim's model list is unchanged across the abort.
- Honest bound, stated by the runner and not softened here: **0 field rides / 1 deliberate
  abort.** EPIPE survival is proven at the pre-field socket level only. No guest-load verdict
  exists, and no new shim wall appeared.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check.mjs` | ✅ CLEAR — `status="queued"`, no block of any class |
| Merge strategy | `ort`, **zero conflicts** |
| Merge classification | 18 paths: **17 LANE-ONLY** (all `artifacts/`) + **1 BOTH-MOVED** (`tasks/BACKLOG.md`) · 0 MAIN-ONLY · 0 DUPLICATE |
| BOTH-MOVED resolution | verified **by content, not by structure**: after the merge `grep -c` gives lane's new headline `GUEST FIELD STOPPED LAWFULLY AT SKEW GATE` = 1, my drain-1 row `F-2296-1` = 1, s2295's `F-2295-1 CURED s2295` = 1 — all three contributions present, none clobbered |
| `npx tsc --noEmit` | **rc=0** (merged tree, detached `.gate-s2296`) |
| `npm run build` | **green, 1.34 s**; asset-diet respected |
| Run-surface delta | **ZERO** — no `src e2e functions public index.html package*.json vite.config.ts playwright.config.ts tsconfig.json` path differs from main |
| ↳ control for that empty (F-2215-1) | the unrestricted `git diff --name-only main HEAD` returns **18 paths** — so the empty run-surface result is a measurement, not a narrowed corpus |
| F-1460-1 (`test:node-guards`) | **does not fire** — no `src/sim/`, `src/systems/`, `src/entities/` in the diff |

Gated in a detached worktree per §3.0b, re-based onto drain 1's result first; merged onto
main as one act.

## Findings

### F-2296-1 (shared with `reviews/gauntlet-heat6-almanac-era.md` — filed there, corroborated here)

This drain does not file a new finding: it is the **second independent observation of the
same defect**, and that is precisely what makes it valuable.

| | almanac-era (lane-c) | guests (lane-b) |
|---|---|---|
| `tapeId` | `agent-4805aca6-edea6bfe-…` | `agent-4805aca6-1aeb7a3d-…` (**distinct**) |
| `assayedAt` | 2026-08-25T03:56:14.899Z | 2026-08-25T03:56:44.930Z (**+30.031 s**) |
| tape engine | `d48987df…` | `d48987df…` |
| assayer engine | `0be37691…` | `0be37691…` |

**Two different riders, two different tapes, two submissions 30 seconds apart, one identical
assayer identity.** So the skew is not a transient wobble in a single request — the assayer
reported the same engine identity twice, independently. Combined with drain 1's measurement
(that `d48987df…` reproduces exactly from the live build's tree and from today's main, while
`0be37691…` reproduces from no recent main tree), the picture is consistent and one-sided:
**the riders are on the advertised build and the assayer is not.**

**Bound on this evidence, stated rather than glossed:** the last observation is
2026-08-25T03:56:44Z. This fire did **not** re-probe the live assayer, because doing so means
submitting a fresh ride to production, which is the owner's call and not a drive-by act. So
this review establishes the skew *as of that timestamp*, not *as of now*. Whoever cures it
should re-probe first — the cheapest possible confirmation.

### Non-blocking observations

- **The two probes' `outcome.json` blobs are byte-identical** (`bebd7cb2`), as are their
  `post-response.json` blobs (`c305d949`), while their tapes and slips differ. That is the
  expected shape for two deterministic rides of the same contract from the same build, and it
  is a small corroboration that the sim itself is behaving deterministically across lanes —
  not a duplicate-submission error. Noted so a later reader does not mistake it for one.
- `charter.md` is retained even though the field it would have governed never ran. Correct
  under the Retention Law: it is the record of what was to be tested.
- `build-submission.mjs` lands under `artifacts/`, not `scripts/`, so it stays out of the
  `lane-usable` run surface (F-1665-1).
