# Task engine-era-law-v3: the engine only changes at announced era boundaries (lane-a, prefix "feat:")
### FIRE-AUTHORED s2303 (attended review welcome) — supersedes `tasks/engine-era-law-v2.md`, which STOPPED lawfully by reporting a firewall omission instead of fixing out of scope (F-2302-2). That STOP was CORRECT and must not be retried (§7.5). This master changes the PREMISE — a wider firewall and a ruled design question — which is what makes it a lawful fourth attempt.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in **worktrees/lane-a**.

READ FIRST (paths, in this order):
- `AGENTS.md`
- `tasks/engine-era-law-v2.md` — the superseded master. Its **Why**, its **Scope**, its **Ordering law** and its **honesty guard** are REUSED here, largely verbatim. Read it in full; this file states only what CHANGED.
- `tasks/BACKLOG.md` → row **F-2303-1** (why this master exists; the complete per-scope-item × validator audit), then **F-2302-2** (the five sites banked by the previous fire), **F-2301-1** (the registry-home cure) and **F-2300-1** (the first STOP).
- `tasks/runs/20260825-141255-lane-a-engine-era-law-v2.md.log` — v2's lawful STOP, last 60 lines. **Your predecessor's report is CORRECT and much of its work is already PROVEN — see "What v2 already proved" below. You are not repairing it; you are finishing it behind a firewall that now contains every validator.**
- `scripts/assay-replay-agent.mjs` — `ENGINE_SOURCE_INPUTS` (`:36–48`) and `computeEngineHash` (`:66`). **REUSE `computeEngineHash`; never write a second derivation.**
- `specs/agent-play/ap-15-assay-of-minds.md` Law 3 (frontiers are era-scoped artifacts — this law is its engine-side sibling).
- The **owner's puzzle this cures** (2026-08-25, verbatim): *"Should I create reference tapes again for the new deploy? this inconsistency leaves me puzzled"*.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
Standard safe-dupe template: ahead content already on main = SAFE DUPE → `git checkout -B lane/a main && git clean -fd`, PROCEED. **STOP on un-merged ahead content or foreign edits.** FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list them, proceed. Then `npm install --no-audit --no-fund`; build green.

**Freshness gate (F-1424-3 — a STOP, not a warning):** run
`grep -Fc "FOUR MORE SURFACES THE BANKED AUDIT NEVER NAMED" tasks/BACKLOG.md`
It must print **1**. If it prints 0 your lane predates this master's evidence commit: **STOP and report "lane stale — F-2303-1 row absent"**; do not reset, do not guess, do not proceed on a tree that cannot see your own WHY.

## Why
Unchanged from v2 — read its **Why** section in full. Tapes and reference recordings must die only at VISIBLE, NAMED boundaries, never silently; three engine changes shipped in one week with no declared boundary and the owner lost track of what still held.

**What changed since v2, and why you can finish where it correctly stopped.** v2's scope required a one-field `meta.era` stamp on tapes, but every surface that VALIDATES tape meta was outside its TOUCH-ONLY list, so the stamp was refused the moment it was written. The runner reported this rather than reaching outside its firewall — exactly right. The previous fire then banked five gate sites; **this fire re-verified all five by reading the code and found FOUR MORE** (see F-2303-1). This master's firewall now contains every one of them, and the one genuine design question is RULED below instead of being left to the implementer.

### What v2 already PROVED — reuse it, do not re-derive it
Recorded in v2's stop note and its run log; treat as established and say so in your report rather than spending tokens re-establishing it:
- The out-of-corpus registry at `assets/engine-era.json` is **stable at its post-mechanism hash** (F-2301-1's cure, CONFIRMED in flight).
- The new guard's **manufactured undeclared-change RED and declared-bump GREEN both passed**.
- `npx tsc --noEmit` and `npm run build` passed; the worker suite was **9/9**.

If any of the above fails to reproduce on today's main, that is a FINDING — report it, do not paper over it.

## The ruling you do NOT have to make (§7.4, owner absent + reversible + inside a ratified law)
`functions/api/standings.ts:383–384` rebuilds the **public WATCH-reel** meta as `{ buildId }` alone whenever `reel.meta.engineHash !== undefined`, which would silently drop `era` from every public reel.

**RULING: RETAIN `era` in the public projection; continue to OMIT `engineHash`.** An era is an *announced* boundary and skew verdicts exist to name it, so hiding it defeats the law's purpose; `engineHash` stays worker-only detail. Change the projection to `{ buildId: reel.meta.buildId, ...(reel.meta.era !== undefined ? { era: reel.meta.era } : {}) }` or equivalent.

Two supporting facts, measured s2303 — quote them if anyone asks why:
1. Without this ruling the public surface would be **inconsistent by producer**: browser tapes carry no `engineHash`, so the projection never fires for them and any era they carried would be public, while node tapes would have theirs stripped.
2. It is **one line and reversible**. Attended or the owner may veto with one word; if vetoed, the projection stays `{ buildId }` and this master is otherwise unchanged.

## Scope
Items 1, 2, 4 and the Ordering law are **carried from v2 unchanged** — read them there. Items 3 and 5 are restated because they are what moved.

3. **The visibility.** `scripts/gr-sim.mjs` stamps `meta.era` alongside `engineHash` (additive, one field). `scripts/assay-replay-agent.mjs` normalizes the new key. `functions/api/standings.ts` accepts it at `validTapeMeta` and projects it per the ruling above. The worker's skew verdict names ERAS rather than raw hashes — enrich the reason strings in `scripts/assay-worker.mjs` (e.g. *"engine era 3 'the Honest Hypot', tape from era 2"*). Add ONE line to the GZ-01 filter examples in `scripts/fire.md` noting that an era bump is player-visible news by definition; cite this master.

   ⚖️ **The BROWSER era stamp is DEFERRED, deliberately, and is OUT of scope.** `src/game/Game.ts:7132` stamps `meta: { buildId: __APP_BUILD__ }` and the browser tape has never carried `engineHash` at all (`RunTapeMeta` at `src/game/RunTape.ts:69–71` is `{ buildId }`). Reaching it would additionally require a new `vite.config.ts` define, a `src/vite-env.d.ts` declaration, the `RunTapeMeta` type and the `validateTapeMeta` allowlist — five more surfaces for a field whose only consumer already has a node-side era. **A browser reel simply makes no era claim, and that is honest, not a gap.** Do NOT "fix" it. If you believe it belongs in this slice, say so in your report; the follow-up is named in F-2303-1.

5. **Tests**, both directions, and this is where v2's omission actually bites — these files assert the OLD shape and are IN your firewall:
   - `scripts/agent-reels.test.mjs` — loads `validateTape` from `functions/api/standings.ts`; add the era-accepted and unknown-key-still-refused cases.
   - `scripts/assay-worker.test.mjs` — `:137` asserts the skew reason string **verbatim** (`engine-skew (tape …, assayer …)`), and `:121/:129/:131` build tape meta by hand. Your reason-string change WILL red this file; update it to assert the era-named reason.
   - `scripts/assay-replay.test.mjs` — `:57–58` assert the recorded meta shape; add the era assertion.
   - Plus v2's own requirement: a manufactured engine change without a registry bump = RED, the same change with a bump = GREEN (scratch-worktree pattern — do not mutate the real tree to prove a red).

   ⚠️ Any new `scripts/*.test.mjs` you create MUST remove its temp directories — `test:node-guards` carries a fixture-teardown guard over every fixture owner, and a leaked temp dir reds it.

## Firewall
**TOUCH ONLY** — v2's list PLUS the four surfaces it omitted (marked ➕):
`assets/engine-era.json` (new) · the new guard file under `scripts/` · `package.json` (battery wiring leg ONLY) · `scripts/gr-sim.mjs` (the one-field stamp) · `scripts/assay-replay-agent.mjs` (tape-metadata normalization for the new `era` key ONLY) · `scripts/assay-worker.mjs` (reason strings ONLY) · `scripts/fire.md` (the one GZ-01 example line) · the BACKLOG row · ➕ `functions/api/standings.ts` (`validTapeMeta`'s allowlist at `:993` and the WATCH-reel projection at `:383–384` ONLY) · ➕ `scripts/agent-reels.test.mjs` · ➕ `scripts/assay-worker.test.mjs` · ➕ `scripts/assay-replay.test.mjs`.

**NO**: no sim-content or balance changes (nothing that alters what the simulation DOES) · no verdict semantics beyond the reason STRINGS · no era beyond the seeded 3 · **no editing `ENGINE_SOURCE_INPUTS` and no excluding any file from the identity to make a number come out right** · no touching `tasks/engine-era-law.md` or `tasks/engine-era-law-v2.md` (retained history) · no gauntlet-repo edits · **no `src/**` edits at all, and no `vite.config.ts` / `src/vite-env.d.ts`** — that is the deferred browser stamp, and reaching it is the scope creep that killed three predecessors · no other `hasOnlyKeys` allowlist in `functions/api/standings.ts` (there are ~25; you want exactly the one at `:993`).

⚠️ **Do NOT "fix" the coupling by narrowing the engine identity.** That the `package.json` `scripts` block is inside the identity is a known, measured cost (F-2297-1) and it is an **OWNER fork that is UNRULED**. Your slice must work under today's identity. If you believe narrowing is right, say so in your report; do not implement it.

## Self-check (evidence, not vibes)
- `npx tsc --noEmit` clean; `npm run build` green.
- The new guard **green on the landed tree**, and **proven RED under a manufactured engine edit in a scratch worktree** — report both, with the actual message the red prints.
- **The stability assertion**: after the registry is written, `computeEngineHash` returns the registry's own value byte-identically. Report the hash.
- **A round-trip proof for the new key**: a tape stamped with `meta.era` is ACCEPTED by `validateTape`, and a tape carrying an unknown meta key is still REFUSED. Report both.
- **The projection proof**: a reel with `engineHash` is served publicly with `era` present and `engineHash` absent. Report the served object.
- `npm run test:node-guards` green — **you did NOT touch `src/`, so §3's src-trigger does not fire; run it anyway** because you touched `package.json`, `scripts/**` and `functions/**`. Run it ALONE; it is ~9 minutes.
- Floors `--check` byte-clean — this is your proof that identity moved while **behaviour did not**. If floors move, you changed the sim: STOP and report.
- Boot probe: zero console/page errors, desktop **and** 390px, screenshots to `reviews/shots-engine-era-law-v3/`.

End with **READY-FOR-GATES** + report: the seeded registry verbatim, the guard's two-direction proof (both messages), the stability assertion's hash, the round-trip and projection proofs, the floors `--check` result, and the exact era-registry line the almanac should mirror.

## No-op / honesty guard (carried VERBATIM from v2 and v1 — it is what made all three stops cheap and legible)
If the engineHash source-set turns out to include files this master must touch (a circularity), STOP and report the set — never quietly exclude a file from identity to make the guard pass.

**Second clause (from v2):** if you find yourself writing a hash into a file that is itself hashed — i.e. the registry's value will not hold still when you re-compute it — **STOP and report**. Do not iterate toward a fixed point (there is none), do not special-case the registry out of the corpus, and do not round, truncate or defer the value.

**Third clause, added s2303 — the lesson of the three stops, aimed at the exact shape that produced them:** if you find that a value this master tells you to write is REFUSED, DROPPED or RESHAPED by any validator, guard, type or test **outside the TOUCH-ONLY list above**, that is a firewall omission: **STOP and report the site by path and line, with the code that refuses.** Do not widen your own firewall, and do not work around the refusal. Three predecessors stopped exactly here for 463,363 tokens and zero diff, and every one of them was RIGHT to. A fourth such report is a success, not a failure — it means the audit is still one indirection short, and that is worth knowing.
