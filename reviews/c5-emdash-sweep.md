# c5-emdash-sweep — no em-dashes in anything a player or visitor reads

**Slice:** `c5-emdash-sweep` (lane-c) · **branch:** `lane/c` · **tip:** `6a7bafb26` · **base:** `baa00a12d`
**Gated:** s2235, 2026-08-23 · **Merge:** NONE — see verdict
**Gated in:** detached worktree `gate-s2235`, checked out at the **real merge commit** `d6e42a32f` (§3.0b custody). Checking out the merge — rather than materialising lane blobs with `git show` — keeps every file TRACKED in the gate, which avoids the vacuous-green class where a tracked-subject guard reads nothing about the slice it is gating.

## VERDICT: HOLD — NOT MERGED

> ✅ **SUPERSEDED s2237 — THE HOLD IS DISCHARGED AND BOTH COMMITS ARE MERGED AT `ddcde57f0613fde99d986e884e0c471d02de18af`.** The verdict below is kept verbatim as the record of what was measured at s2235; it was correct when written. The corrective `c5b-emdash-pin-and-determinism` cured F-2235-4 and F-2235-5 exactly as this file prescribed, and both were re-gated together on the merged tree — see **`reviews/c5b-emdash-pin-and-determinism.md`** for the re-drain's evidence, the four-failure attribution, and the updated merge classification (main had moved 33 commits, not 18, by the time of the re-drain).

The slice is 95% good work and its player-facing intent is exactly the owner's ruling. It is held for **one measured defect and one design question it exposes**, both in `assets/contracts/*/contracts.json`, both invisible to the gates the runner ran. `src/**` and `public/**` are clean and are not the problem.

**The master pre-committed the runner to stop on precisely this condition** (self-check, verbatim): *"`node scripts/null-floor-anchors.mjs --check` clean (**text fields must not move sim outcomes — if it moves, you changed more than copy: STOP**)."* The runner reported that check red, attributed it to an unrelated era-stamp mismatch, and shipped `READY-FOR-GATES`. The stamp explanation may well be true for null-floor; it is not true for what follows.

## What it does

Executes the owner's ruling of 2026-08-23, verbatim: *"can you also remove the emdashes from the page, game and everything? They scream 'this was made by AI' and that is not necessary."* The site half shipped attended the same day; this is the **game half**. 84 files: `public/skill.md` + `llms.txt` + `robots.txt`, the human-text fields of three `assets/contracts/*/contracts.json`, and rendered string literals across `src/ui/**`, `src/news/**`, `src/encyclopedia/**`, `src/town/**`, `src/systems/**`, plus playbook/buildable/medal copy. Rewrites are **editorial, never transliteration**. Code comments are out of scope by the master's own wording. 34 e2e specs that pin changed copy move in the same commit, and a new guard, `scripts/no-emdash-guard.test.mjs`, is rooted in `test:node-guards`.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **clean**, 0 errors |
| `npm run build` (merged tree) | **green**, vite 1.13 s |
| `node --test scripts/no-emdash-guard.test.mjs` | **1 pass / 0 fail**, 42.7 ms |
| New guard proven to have teeth | **yes** — manufactured defects, table below |
| `npm run test:node-guards` (merged tree) | **rc=1** — 531 tests / 522 pass / **4 fail** / 5 skipped, 489 s |
| 3 highest-risk pin specs, merged, `--workers=1`, both projects | 22 passed / 20 failed |
| Same 3 specs, **control** (main content, same root) | 22 passed / 20 failed — **set-identical titles** |
| Firewall: non-copy edits in `src/`/`public/`/`assets/` | **0** |
| `src/systems` + `src/entities` + `src/sim` changed lines | 28, **all** string literals |
| `package.json` 3-way merge | **correct** — one token added, main's roster preserved |

### The e2e reds are inherited — proven, not argued

`red-inventory-lookup` reports all three specs KNOWN-RED at the 2026-08-11 snapshot with **exactly** the 10 titles that failed here. But it refuses to exonerate on membership alone (F-1444-2) and flagged its snapshot 12 days stale across 138 commits, so membership was treated as corroboration and converted to proof by a control: same worktree, same dev server, same command, with all 79 pre-existing slice paths reverted to main's blob (verified — **0** tracked `e2e/`/`src/`/`public/`/`assets/` paths differed from main).

Merged 20 failed / 22 passed · Control 20 failed / 22 passed · compared **element-wise, not by count**, because equal totals can mask a swap: **0 titles fail only on the merged tree, 0 only on the control.** Both arms asserted their own validity before the comparison was believed (control 54,060 B, merged tail 2,818 B — neither was silent).

### The new guard is not a vacuous green

| Arm (manufactured on a self-contained fixture root) | Result |
|---|---|
| CONTROL — clean board | rc=0, pass 1 / fail 0 |
| ARM 1 — em-dash in `public/*.md` | **rc=1, fail 1** |
| ARM 2 — em-dash in a listed contracts text field | **rc=1, fail 1** |
| ARM 3 — em-dash in an **unlisted** text key | rc=0 — blind, see F-2235-1 |

## THE BLOCKER — F-2235-5

`test:node-guards` on the merged tree is **rc=1 with 4 failures**. Two match s2234's main baseline exactly and are **inherited** (F-2234-3: `blocker-panel-closed-guard` *"reds on the pre-strike ledger…"*, plus the `fixture-teardown` cascade its leftover temp dir trips). **Two are new, and both are this slice's** — established by isolating one variable at a time in the same root, not by argument:

| Arm | `src/` | `assets/` | Baron determinism test |
|---|---|---|---|
| full slice (merged) | swept | swept | **FAIL** — `fnv1a32:9a7d4dfd` |
| `src/` reverted | main | swept | **FAIL** — `fnv1a32:9a7d4dfd` |
| `assets/` reverted | swept | main | **PASS** (rc=0) |
| full control | main | main | **PASS** (rc=0) |

**The three `assets/contracts/*/contracts.json` text edits are the sole cause. The `src/**` copy sweep is innocent** — reverting all 38 changed `src/` files does not move the hash.

**Mechanism, read from the code rather than guessed.** `HeadlessContractSim.ts:1198` computes `eventLogHash = stableHash({ … events: canonicalReplayEvents(this.replayEvents) … })`. The Baron test secures at wave 20, which awards a medal, and the medal event carries contract prose. The swept line is `epoch-1-frontier/contracts.json`:

- was: `"medalBlurb": "The Rocket Cart — captured. He'll be back — with machines."`
- now: `"medalBlurb": "The Rocket Cart, captured. He'll be back with machines."`

**Contract prose is inside the determinism envelope.**

⚖️ **Priced honestly, because the direction matters and I do not want this over-read: gameplay outcome did NOT change.** Every scalar in the assertion is byte-identical across arms — `kills: 862`, `waves: 20`, `timeMs: 528400`, `gold: 0`, `secured: true`, `defaultedPicks: 21`, `defaultedSecure: 1`. **Only the log hash moved.** So this is not a sim regression; it is prose entering a hash that exists to detect sim regressions.

**Why that is still a HOLD and not a re-pin-and-merge.** Re-pinning a determinism hash is lawful *only with a named cause* (F-1441-3), and I have one. But the history says this is a **new category**: `git log -S` shows the current pin was last set by `94921076a` (`ap16-2b-draft-reaches-door`), a functional slice. This pin has tracked behaviour, never copy. Accepting a prose-driven move silently establishes that **every future copy edit is a determinism event** — a real design question about whether player-facing prose belongs inside `eventLogHash` at all. Deciding that inside a drain, under time pressure, would launder a judgement into a green. That is the same call s2234 made on F-2234-3, and for the same reason.

## F-2235-4 — a missed pin, unambiguous and in scope

`scripts/gr-sim-campaign.test.mjs:164` still pins the **old** em-dash text:

```
['e3-canyon-works', 'Contract "e3-canyon-works" is locked: The Voltage Age awaits — raise the Dynamo Hall.'],
```

The runtime string comes from `src/meta/ContractUnlock.ts`, which the slice swept to `: raise`. The test was not updated, so it fails on a regex mismatch. Scope item 3 of the master is explicit — *"any e2e/test that pins a changed string … is updated with the new copy in the same slice"* — and this is such a test. **Root cause: the runner scoped its pin sweep to `e2e/` and never grepped `scripts/*.test.mjs`.** The em-dash string exists **only** in the test file, in the whole repo, which is exactly why a source-side grep missed it.

This one is a one-line fix with no judgement in it.

## Findings

**F-2235-5 (BLOCKING).** Contract prose is inside `eventLogHash`; the em-dash sweep of `assets/contracts/*` moves the Baron determinism pin with gameplay outcome provably unchanged. Needs a ruling: re-pin with the named cause, or exclude prose fields from the replay-event hash, or leave contract text unswept. **Recommendation: re-pin.** The hash's purpose is replay-identity, the prose genuinely is part of the replayed event stream, and the alternative (excluding prose) weakens a determinism guard to protect a copy edit. But it should be an authored decision with the cause recorded at the pin site, not a drain's drive-by.

**F-2235-4 (BLOCKING, trivial).** `scripts/gr-sim-campaign.test.mjs:164` pins pre-sweep copy. Fix in the same corrective.

**F-2235-1 (non-blocking, LATENT).** `no-emdash-guard.test.mjs` walks a **hardcoded** `HUMAN_TEXT_KEYS` set of 20 names; an em-dash in any unlisted text key passes silently (proven, ARM 3 — not inferred). Priced against live data rather than asserted: human-text-shaped keys outside the list — **0**; live misses today — **0**. So **LATENT, not live**, and the master directed this design explicitly, so it is not a scope violation. The cure when anyone wants it is to **invert the test**: walk every string field and exempt a small id/key **denylist**, so a newly-added text key is covered by default. That fails safe where the current shape fails blind.

**F-2235-2 (non-blocking, declared).** `src/**` rendered strings carry no mechanical guard by design — a raw grep would false-positive on comments, which are deliberately in the corpus and out of scope. The runner named the 11 strings across 7 files it left guard-free (`src/sim/HeadlessContractSim.ts`, `SeatOrders.ts`, `SeatedLockstepSim.ts`, `src/game/RunSuspend.ts`, `src/agent/MechanicsManifest.ts`, `src/world/Water.ts`, `SteamPlume.ts`) — all internal diagnostics or shader source, none player-facing. Recorded so the gap is declared rather than discovered.

**F-2235-3 (method, live, no mechanism proposed).** A gate piped into `tail` reports the **pipe's** exit code, not the battery's. The first merged-tree spec run was `npx playwright test … | tail -30`; the harness reported **exit 0** while playwright had exited **1** with 20 failures, because a shell pipeline's status is its last stage's and `tail` always succeeds. This is the *"gate-refused mid-`&&` fakes success"* family one stage over, and it is dangerous precisely because a fire branching on rc reads it as a clean gate. Every later battery in this drain was invoked through `execFileSync` so the child's real status was captured. **No mechanism proposed:** the fix is a reading habit at the call site, and a guard on shell composition would fire on every legitimate `| head` in the corpus.

## Merge classification (recorded for the re-drain)

Base `baa00a12d`, 18 commits of main movement. `lane-usable`: `ahead=1 behind=18`, 84 paths, **all HELD LANE-ONLY** — main had moved none. The `ort` merge produced **no conflicts**.

The one file both sides touched is `package.json`. Verified rather than trusted: main's `test:node-guards` roster and the lane's base roster are byte-identical, and the merged value differs from main by exactly one inserted token (`scripts/no-emdash-guard.test.mjs`). No main-side roster addition was lost.

**When this re-drains, that classification still holds** unless main moves those 84 paths — it has not in 18 commits.

## What the next fire should do

1. Dispatch the corrective `tasks/c5b-emdash-pin-and-determinism.md` (banked, leaf registered) to **lane-c with the BUILD-ON-PREDECESSOR opt-in** — lane/c is `ahead=1` holding this exact work, so an ordinary refill pre-flight would `reset --hard` and destroy it (Mistake #2).
2. It fixes F-2235-4 (one line) and lands the F-2235-5 ruling at the pin site with its cause written out.
3. Then re-drain both commits together. Everything else in this slice is gated and green.
