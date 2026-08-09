# f1611-1 — the two BUILD-rejection assertions learn to read a detail

- **Slice:** `f1611-1-stale-build-rejection-assertions` (master `tasks/lane-f1611-1-stale-build-rejection-assertions.md`, FIRE-AUTHORED s1611)
- **Branch / tip:** `lane/b` @ `73ffcfbe4` (runner auto-commit, 2026-08-10T02:45:25+07:00)
- **Base:** `ccaf00a983be41095452c396a83cd66d66e26fa6` (the s1611 dispatch commit)
- **Merged:** `13d79edfad2860a0279c39585c32a449705eb65e` (s1612, 2026-08-10)
- **Cures:** F-1611-1
- **VERDICT: MERGED.** Gates green, the cure was proved to bite by a drain-side manufactured red, and the class fix reached both sites.

## What it does

`e2e/ap-standing-orders.spec.ts` carried the literal
`toContain('FAILED: BUILD action was rejected')` at two sites. The door has emitted
`FAILED (<detail>): BUILD action was rejected.` since f-door-2 made `detail` additive and
optional, so the literal was stale in the ordinary sense — written before the thing it
describes existed, and never widened when it landed.

Both sites now read

```
expect(<order>?.reason).toMatch(/^FAILED( \([a-z_]+\))?: BUILD action was rejected/);
```

which accepts the optional parenthetical while *strengthening* the old check in one
respect: it is anchored at `^FAILED`, where `toContain` was not. At `:408` a second
assertion additionally checks any emitted detail against the door's five-value
vocabulary (`insufficient_gold`, `out_of_reach`, `out_of_zone`, `collision`,
`cap_reached`, or absent).

The class half is the point. `:408` (inside `:342`, "plain-boot production orders pan a
seam and place a real building") was **red on main**. `:218` (inside `:123`, "seeded
standing orders obey priority, gates, legal actions, surprises, and the live rung") was
**green**, and green only because its BUILD fails on a revoked rung — a path that emits
no `detail` at all. It was a latent copy that would red the moment that path gained one.
Both were widened; curing only the red site would have left the defect alive in the sibling.

## Evidence

Gated in a detached worktree `gate-s1612` (§3.0b) against an **external, pre-warmed** dev
server on 5188, all playwright at `--workers=1` (§3.1).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.19s** |
| Target `ap-standing-orders`, desktop-chrome | **6/6** (17.6s) |
| Target `ap-standing-orders`, mobile-chrome | **6/6** (17.9s) |
| Adjacent `m4-01-tool-surface` + `m4-05-agent-closeout` + `m4-10-agent-actions-integrity`, desktop | **11/11** (33.2s) |
| Same three, mobile | **11/11** (35.6s) |
| Console / page errors | zero — these specs assert their own buckets and passed |
| `main..lane/b` after merge | empty |

**`test:node-guards` not in this battery, deliberately and by rule.** F-1460-1 keys that
duty on the diff touching `src/sim/`, `src/systems/` or `src/entities/`. This diff is
`e2e/ap-standing-orders.spec.ts` alone — 5 insertions, 2 deletions, one file. No sim
behaviour moves, so no cross-cutting pin can go stale.

### The manufactured red, re-run drain-side

The master required the runner to prove the cure bites; the runner did, and reported
`Expected value: "insufficient_gold"`. I did not take that on trust — a passing assertion
never executes its violation path, so its green is not evidence about its red. Installed
**by file edit** (not through a shell-quoted probe) in the gate worktree: removed
`'insufficient_gold'` from the vocabulary array, ran `:342` desktop.

```
Error: expect(received).toContain(expected) // indexOf
Expected value: "insufficient_gold"
Received array: ["out_of_reach", "out_of_zone", "collision", "cap_reached", undefined]
  at e2e/ap-standing-orders.spec.ts:409:82
```

This does more than reproduce the runner's message. It settles the one way this cure could
have been worthless: **the membership assertion is live, not vacuous.** `undefined` is a
legal member of that array, so had the regex failed to capture a detail the assertion would
have passed no matter what the door emitted. The red proves the captured value is really
`insufficient_gold`. Probe reverted by file edit; `git diff` then showed only the intended
change.

**Detail determinism:** the runner reported `insufficient_gold` on both of its focused
runs; my four gate runs of `:342` (2 clean desktop, 1 clean mobile, 1 probed) agree. Banked
as an observation, not a gate, per the master's scope 3.

## Merge classification

One path, and it is unambiguous. `git log <base>..main --name-only -- e2e/ap-standing-orders.spec.ts`
returns **nothing**: main moved three commits since the base (`98a923551`, `9c7bcaf5b`,
`5a6b61a20`) and none of them touched this file. So the path is **LANE-TOUCHED only**, main
never moved it, and the `ort` merge is trivially correct rather than merely conflict-free.
`lane-usable.mjs` had independently classified it `HELD LANE-ONLY, 4 of 5 added lines absent
from main` before the merge.

Note that `98a923551` is *about* this file — it repaired citation titles pointing at
`:408` — but edits the ledger, not the spec. The assertion remains at line 408 after the
merge and the two test titles are unchanged, so those citations did not rot.

**Discarded (F-1266-1 evidence-artifact exception):** `reviews/shots-ap-06b-adapter-reland/plain-boot-{desktop,mobile}-chrome.png`,
regenerated by my own gate runs. Screenshots are never byte-identity gated. The merge
carries the spec change and nothing else.

## Findings

**None blocking.** No new F-IDs. The slice did exactly its scope, the firewall held (`git diff main...lane/b`
touched one file, the door untouched), and the runner reported honestly — including that it
skipped an optional helper import because direct assertions covered the requirement, which
is a legitimate call and not a shortfall.

F-1611-1 is **CLOSED** by this merge: its gate read *"a one-line corrective widens the
assertion at `e2e/ap-standing-orders.spec.ts:408` … to the detail-bearing form"*, and the
delivered cure exceeds it by also widening the latent sibling at `:218`.
