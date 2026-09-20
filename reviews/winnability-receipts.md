# winnability-receipts-and-kit-guard — drain review (s2457)

**Slice:** `winnability-receipts-and-kit-guard` (S1 of the ladder + story batch, attended 2026-09-02)
**Branch:** `lane/a` · **lane tip:** `1e3aba54e` (`runner(lane-a): winnability-receipts-and-kit-guard.md`)
**Base:** `32ea34d51` · **Merge:** `714d68198f7bf540c491295dc58d48c982f006fb`
**Gated in:** detached worktree `gate-s2457` (§3.0b — undecided content never entered main's tree)

## Verdict

**MERGE — PART-DELIVERED BY DESIGN, NOT PART-FAILED.** Scope 1 (the receipts ledger) is complete and
its artifact reproduces byte-for-byte from the live standings. Scope 2 (the kit-vs-boss guard) was
**not** written, and that is the master's own instruction rather than a shortfall: its *No-op /
honesty guard* reads *"If the starting kit cannot be derived deterministically from code (name the
ambiguity with file:line), **STOP after the receipts ledger** and report the fork; a guessed kit is
worse than no guard."* The runner named the ambiguity at four file:line sites, stopped exactly
there, left scope 3 flagged-off and unpublished as ordered, and filed the fork as F-WIN-1/F-WIN-2.
This is the honesty path executed in full — a runner that reports a defect instead of fixing it is a
firewall success, and reject-don't-stretch is the house law (Mistake #14).

## What it does

`scripts/winnability-receipts.mjs` derives, for every door-admitted contract that `public/skill.md`
publishes, whether anyone has ever *verified-secured* it: the first verified secure on the live
standings (species, profile, reel id, engine pin, date), or `unclaimed`. Output is the tracked
`assets/contracts/winnability-receipts.json`, regenerated on demand and never at build time. A
`--offline` mode reads `scripts/fixtures/winnability-standings.json` so any future guard need not
touch the network.

Today the county's honest answer is **36 contracts, 4 claimed, 32 unclaimed** — `e1-baron`,
`e1-night-shift`, `e2-hill-mine`, `the-claim`. Nothing is published to the player: the per-contract
`unclaimed` marker stays behind its flag, off, per scope 3's desk gate.

Two facts worth the ledger, both the lane's: `public/skill.md` publishes **36** door contracts where
the task and spec both say **39**; and `e1-drill-yard` is admitted but `functions/api/standings.ts`
rejects it by construction (`practice.standings:false`), so its receipt is explicitly
`unclaimed / standings-disabled` rather than silently absent.

## Evidence

| Leg | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **rc=0**, 8.1 s, zero output |
| `npm run build` (merged tree) | **rc=0**, 38.1 s, `✓ built in 3.62s`; inline `[asset-diet]` pass (herald 1,158,214 B under the 1,500,000 B ceiling) |
| receipts **offline**, two runs | **rc=0** both; output **byte-identical** (sha256/16 `ad32ea92c4e8b3f5`, 4,405 B) — deterministic |
| receipts **online** vs the committed artifact | **rc=0**, 13.0 s; sha256/16 `706772b061b484a4` — **reproduces the committed file byte-for-byte** |
| committed artifact well-formedness | 36 contracts · 4 claimed · 32 unclaimed · **0 claimed rows missing a pin** |
| adjacent suites (9 guards that read `assets/contracts/`) | **9 green / 0 red** — `glob-fallback-completeness` 0.3 s · `null-floor-anchors` 5.0 s · `skillmd-guard` 7.2 s · `reaching-contract-extent-guard` 0.2 s · `picnic-hold-contract-scope` 1.1 s · `component-boss-secure` 3.5 s · `e3-mask-tables` 0.2 s · `same-game-audit` 55.5 s · `bench-seeds` 0.5 s |
| console/page errors | **N/A and the master says so** — no UI in this slice (zero `src/`, zero `e2e/`) |

**Two gate legs deliberately not run, with the reason stated rather than implied:**

- `npm run test:node-guards` is **not path-mandated** here. The §3 trigger is a diff touching
  `src/sim/`, `src/systems/` or `src/entities/`; this diff touches **none of them** (4 files, +373,
  −0, no `src/` at all, no `package.json`). No guard was added, so there is nothing new in that
  battery to exercise. `npm run test:ledger-guards` runs as this fire's last act regardless.
- `gr-sim.test.mjs` / `gr-sim-campaign.test.mjs` read `assets/contracts` but were excluded from the
  adjacent set: they are sim-replay suites (265 s+) and **nothing imports the new JSON** — verified,
  not assumed: the only reference to `winnability-receipts` anywhere in `src/ scripts/ e2e/ public/
  functions/` is the generating script itself. The new file joins three established top-level
  siblings in that directory (`bench-seeds.json`, `frontier-registry.json`, `null-floors.json`).

## Merge classification

Base `32ea34d51`; three-dot and two-dot diffs agree exactly (4 files, +373, −0, zero deletions).

| File | Class | Resolution |
|---|---|---|
| `assets/contracts/winnability-receipts.json` | LANE-ONLY (new) | 207 added lines, all absent from main |
| `scripts/winnability-receipts.mjs` | LANE-ONLY (new) | 128 added lines, all absent from main |
| `scripts/fixtures/winnability-standings.json` | LANE-ONLY (new) | 37 added lines, all absent from main |
| `tasks/BACKLOG.md` | BOTH-MOVED | 1 added line (the F-WIN row); auto-merged by `ort`, no conflict, main's rows untouched |

`main..lane/a` is now empty — the lane is fully absorbed, not tip-grafted.

## Findings

**F-WIN-1 / F-WIN-2 — OWNER-GATED DESIGN FORK (the lane's, carried to the desk).** The guard half
cannot be written truthfully from the named code. `HeadlessContractSim.ts:819` says the Steamworks
arsenal is not a floor or grant and a virgin profile leaves all three shooters disabled;
`Game.ts:1563` gates them on research plus the Baron medal. Conversely `CombatSystem.ts:891` routes
ordinary bolts into every live enemy and `Enemy.ts:774` has no railcar immunity — so removing
`twist.pressureEnabled` **cannot** make a literal "can damage" guard red, and the requested E2
mutation proof has no code fact to derive. The ruling picks the invariant: **(a)** add a real
standalone pressure-arsenal floor in a separately scoped balance/grant slice and guard *that*, or
**(b)** define "can hurt" as generic projectile damage and replace the mutation proof. Do not encode
`pressureEnabled` as an arsenal grant while the runtime says it is not one. **Not fire-authorable —
this is a design fork (§7.3).** Nothing is broken while it waits; the receipts half stands alone.

**F-2457-2 — the e10 sequencing gate greps COMMIT SUBJECTS (Mistake #16), and this drain is the one
that had to satisfy it.** `tasks/e10-preserve-objective.md:5` gates on
`git log --oneline main | grep -q 'winnability-receipts-and-kit-guard'`. `--oneline` reads subjects
only, so the gate is satisfied not by the dependency *landing* but by a future drainer happening to
spell the 41-character slug in a subject line. It fails toward STOP, so it can never ship a defect —
but it can deadlock the E10 slice indefinitely with its dependency already merged, and each blind
retry costs ~37 k tokens. **Handled by construction here: this merge's subject carries the literal
slug, and the gate was verified satisfied with the master's own command — `grep -c` returns 2, was
0.** The durable cure is to probe the leaf (`drain-block-check winnability-receipts-and-kit-guard.md`
→ status + mergeHash) or the artifact, never the message; recorded rather than patched, because the
master is attended-authored and an attended session is live (§7.6, serialize).
