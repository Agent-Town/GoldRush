# redeem-harden — the prize clerk keeps an honest ledger

- **Slice:** `redeem-harden` (MAIN slot, fire-authored s1079 as the corrective for its own drain's findings)
- **Branch/tip:** main slot — uncommitted working-tree output from run `20260726-172905-main-redeem-harden.md.log`
- **Merge:** `2962577194e4c1d8d8362198925ae30ae4384cb7`
- **Drained:** s1080, 2026-07-26

## Verdict

**PASS — merged.** All four scope items landed inside the firewall, and the headline fix is proven by a
mutation control rather than by a green test alone. Two non-blocking findings (F-1080-1, F-1080-2) and one
process finding against the authoring fire (F-1080-3), none blocking the merge.

## What it does

`functions/api/redeem.ts` shipped 30 minutes before this task was written, in the `cosmetic-grants` merge
(`52fa15ad`). The s1079 gate read it as a security surface and found three real defects. This slice closes
all three plus a fourth latent one, in the one file, before the owner mints a single real prize stub.

The player-facing shape of the change: **a prize stub can no longer be destroyed by a dropped network
response.** Previously the clerk tore the stub up (`kv.delete`) and *then* told you what you had won; if
that answer never arrived, the code was dead forever and every retry read "this one is no county prize."
Now the clerk stamps the stub instead of destroying it, and stamping it twice is harmless.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green, 1.01s** |
| `e2e/cosmetic-grants.spec.ts` (own spec) | **8/8** — 4 tests × desktop-chrome + mobile-chrome(390) |
| zero console/page | asserted **inside** the spec (`expect(errors).toEqual({console:[],page:[]})`) |
| `e2e/bug-office-api.spec.ts` + `e2e/bug-office-desk.spec.ts` (adjacent) | **16/16 unmodified-green** |
| Firewall | only `functions/api/redeem.ts` + `e2e/cosmetic-grants.spec.ts` — both TOUCH-ONLY |

### Mutation control on F-1079-2 (the reason this is a PASS and not a shrug)

A green test proves nothing about a fix if the test would pass either way. Reverting **only** the added
`await` on line 34 and re-running the live-worker test:

```
Expected: 400
Received: 500
> 107 |   expect(tooMany.status).toBe(400);
1 failed
```

Restored → `1 passed (3.0s)`. So the defect was real, the fix is load-bearing, and the new assertion at
`cosmetic-grants.spec.ts:102` is a genuine regression net. This is the s1057 lesson applied.

### Scope items — what changed behaviour vs. what was already correct

1. **F-1079-2, `return await mint(...)`** — behaviour changed (500 → 400, proven above).
2. **F-1079-3, idempotent redemption** — behaviour changed. `kv.delete` replaced by
   `kv.put('prize:'+code, 'redeemed:<iso>|<skin>')`; both a fresh and an already-claimed stub now return
   `ok:true` + skin. The spec's re-redeem assertion at `:120` flipped from `bad_stub` to `ok:true`, which
   is the **intended supersession** the master pre-authorised — not a weakened test.
3. **Stored skin instead of a literal** — behaviour changed in two ways: the response now carries the KV
   value rather than a hardcoded `'gilded'`, and the guard moved from `=== null` to falsy, so an
   empty-string value reads `bad_stub` where it would previously have passed as a valid prize.
4. **F-1079-4, rate limit** — behaviour changed. The public redeem path gates on
   `bumpCounter(kv, 'redeem:ratelimit:' + await clientIpHash(request))`, 5/IP/hour, 429 — matching
   `_bugs.ts` exactly (same `RATE_TTL_SECONDS = 60*60`, same `MAX_* = 5`, same key shape, same message
   shape). The authenticated **mint** path is deliberately not throttled: the rate check sits after the
   `'codes' in body` branch has already returned.

### Flake risk checked and cleared (not assumed)

The new rate limit counts every real redeem, and the spec performs 2 per run — so a cap of 5 raised the
question of whether a *second* gate run within the hour would go red on a persisted counter. Read the rig
rather than guessing: `cosmetic-grants.spec.ts:24-26` uses a **per-project** `--persist-to` path and
`rm(persistPath, {recursive:true, force:true})` **before** spawning wrangler, on **separate ports per
project** (8816/8817). The counter therefore starts at 0 on every run of every project. No accumulation,
no cross-project bleed. ✓ VERIFIED by reading the rig, not by the run passing once.

Port contention was also cleared before gating: 8816/8817 had no listeners. The `wrangler` processes on
:8788/:8799 and the `playwright --config playwright.accounts.config.ts` process are the known dead
zombies (16 and 8 days elapsed respectively) — not live attended work.

## Findings

**F-1080-1 (non-blocking, duplication is the lawful choice here).** `bumpCounter` and `clientIpHash` are
now defined a **fourth** time — `_bugs.ts:184/192`, `telemetry.ts`, `_accounts.ts`, and now `redeem.ts`.
Codex copied rather than imported, and that was **correct under its firewall**: `_bugs.ts` declares both
helpers as plain `async function`, *not* `export`, so importing them would have required editing a file the
master explicitly forbade touching. The right fix is a follow-up that promotes them into a shared
`functions/api/_ratelimit.ts` and re-points all four call sites — one small task, no behaviour change, and
it should be authored as such rather than smuggled into the next endpoint. Recorded in BACKLOG; not queued
this fire (the §2E authoring slot went unused for a reason — see F-1080-3).

**F-1080-2 (non-blocking, worth an owner word before the first real mint).** The rate limit is keyed on
`CF-Connecting-IP`, so a household behind one NAT shares one bucket of 5 redeems/hour. That is the same
bucket size the complaints desk uses, so it is house-consistent, and 5 prize redemptions per hour per
household is far above any plausible honest use. Flagging it only because the failure mode is a *legitimate
player being told "the prize desk has your stack already"* on a gift they were given — the one place where
a rate limit and a reward collide. No change recommended; recorded so it is not a surprise later.

**F-1080-3 (process, against s1079 — the authoring fire).** `tasks/redeem-harden.md` was authored without
adding its leaf to `tasks/goals.json`, which the **GOAL REGISTRATION LAW** requires *in the same commit* as
the authoring. The leaf did not exist at drain time; this fire created `rf-16-redeem-harden` and closed it
with the merge hash in one step. Worth noting because the law's failure mode is silent — a master with no
leaf simply never appears in the goal tree, so nothing ever reports it as missing. The authoring fire's own
handoff described the task as queued and was otherwise accurate; only the leaf was skipped.

## Merge classification

Main-slot output, so no graft was involved: the runner leaves its work as uncommitted working-tree dirt
plus a done-move, and both dirty tracked source files matched the master's TOUCH-ONLY list exactly
(`functions/api/redeem.ts`, `e2e/cosmetic-grants.spec.ts`). No `src/` was touched, no `scripts/deploy.sh`
(F-1073-1 holds), no ProspectorSkin/wardrobe files — which matters because `lane-tailor-wagon` was running
concurrently in lane-d and owns that surface. Remaining working-tree churn is screenshot/log artifacts from
the adjacent suites, committed only for `artifacts/cosmetic-grants/`.

## Still true after this merge

- The endpoint remains **unreachable in production**: no KV binding is configured and no code has been
  minted. Every one of these fixes is pre-emptive, which is exactly when they are cheapest.
- **F-1079-5 stands** — both coats still render as the stock sheet, because the contract asks for
  `...-hover8.png` and the salvaged art is `hover4`. Nothing here changes that.
