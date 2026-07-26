# rf-25 — the rate-limiter hoist (F-1080-1)

**Slice:** `tasks/lane-ratelimit-hoist.md` (rf-25) · goal leaf `rf-25-ratelimit-hoist`
**Branch/tip:** `lane/e2-arsenal` @ `03e52f90` (`runner(lane-c): lane-ratelimit-hoist.md`)
**Merged to main as:** `e4ec2a13f85c3bd7892f896ef083dc638fac0c5e`
**Drained by:** s1087 fire, 2026-07-26

## Verdict

**PASS — merged.** The hoist does exactly what the master ruled, the firewall held, and the
slice is **baseline-neutral** against the pre-merge battery. All four rulings verified
independently this fire; both mandatory mutation controls **run by me**, not inherited.

## What it does

Collapses a fixed-window KV rate limiter that was duplicated across four Cloudflare Pages
Functions modules into one shared `functions/api/_ratelimit.ts`. `bumpCounter` was defined
5× and `clientIpHash` 4×; the new module exports one of each plus the shared
`KVNamespaceLike` type. Net **32 insertions / 65 deletions** across 5 files — the only
file added is the new shared module.

Call sites now read, uniformly:

```ts
bumpCounter(kv, key, LIMIT_CONST, RATE_TTL_SECONDS)
```

`_bugs.ts` and `telemetry.ts` keep their own local `KVNamespaceLike` as an intersection
(`RateLimitKVNamespaceLike & { list(...) }`) because they additionally need `list`.

## The four rulings — each verified

| # | Ruling | Verified how | Result |
|---|--------|--------------|--------|
| 1 | `Math.trunc` adopted in `_accounts` as a deliberate recorded change | Read `numberOrZero` on main (`isFinite && >0 ? parsed : 0`) and diffed semantics against the shared function | ✓ Sole delta is truncation |
| 2 | `bumpCounter(kv, key, limit, ttlSeconds)` — both required, **no defaults** | Read the signature; read every call site's constants | ✓ No defaults; each module passes its **own** TTL |
| 3 | `_multiplayer.ts` EXCLUDED | Absent from the diff; still holds its private 3-arg `bumpCounter` | ✓ Untouched |
| 4 | `_accounts` raw-IP keying untouched | `ratelimit:${ip}` still fed by `clientIp(request)`, not `clientIpHash` | ✓ Live KV keys stay valid |

**Ruling 2 is the one that mattered.** The 600-vs-3600 trap is closed, measured:

| module | `RATE_TTL_SECONDS` | limit passed |
|---|---|---|
| `_accounts.ts` | `10 * 60` = **600** | `MAX_REQUESTS_PER_EMAIL` 5 / `MAX_REQUESTS_PER_IP` 20 |
| `_bugs.ts` | `60 * 60` = 3600 | `MAX_REPORTS_PER_IP` 5 |
| `redeem.ts` | `60 * 60` = 3600 | `MAX_REDEEMS_PER_IP` 5 |
| `telemetry.ts` | `60 * 60` = 3600 | `MAX_REQUESTS_PER_IP` 30 |

`_accounts` still passes **600**. The silent 6× window that F-1080-1 warned about did not happen.

**Ruling 1's blast radius, stated precisely.** `numberOrZero` and the shared function differ
*only* by `Math.trunc`. The counter itself only ever writes `String(count + 1)` — an
integer — so a fractional value is reachable only from corrupt or externally-written KV
data. The change is strictly more conservative (it can only ever count a corrupt value
*lower*, never higher). Not a behaviour change any live caller can observe.

## Evidence

Gates run by s1087 on the **merged tree**, not the lane.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0** |
| `npm run build` | **exit 0**, 14.4s |
| `e2e/ratelimit-429-net.spec.ts` | **6/6**, desktop + mobile, 2.5s |
| Battery: `ratelimit-429-net` + `bug-office-api` + `tl-01-run-telemetry`, `--workers=1` | **28 passed / 2 failed**, 2.0m, summary line present (F-1081-6) |
| Pre-merge baseline off `d16000a9` (s1086) | **28 passed / 2 failed** — identical |
| `tl-01:391 › server route rate-limits bound telemetry by client IP` | **green** — live coverage of the hoisted call in `telemetry.ts` |

**The 2 failures are F-1086-1, not this slice.** `tl-01-run-telemetry.spec.ts:229`
(*plain no-debug secure return keeps telemetry invisible to gameplay*), `getByTestId('claim-secured')`
not found after 18s, **both projects** — the same test, locator and line s1086 recorded and
proved by clean-main fingerprint. Slice is baseline-neutral: 28/2 before, 28/2 after.

No screenshots: the slice touches **zero client code** (`src/` untouched), renders nothing,
and has no player-visible surface. Boot coverage comes from the 14 green `tl-01` tests,
which drive plain gameplay boots.

### Mutation controls — run this fire, by hand

s1086 flagged honestly that rf-24's controls were taken on Codex's report because that
drain's firewall forbade editing `functions/`. **This slice *is* `functions/`, so I ran them.**

**Control 1 — `MAX_REDEEMS_PER_IP` 5 → 6.** Net went **RED**: the 6th stub returned
`200` instead of `429` at `ratelimit-429-net.spec.ts:91`. Reverted; `redeem.ts` blob
re-verified identical to the lane blob afterwards.

This control proves two things at once: the net reads **this** tree (not a stub, and not a
foreign listener — `lsof` confirmed nothing held 8816–8819, so the spec spawned its own
wrangler workers), and the `limit` argument is genuinely threaded through the hoisted
function. Had the hoist hardcoded or dropped the limit, this mutation would have survived.

**Control 2 — the TTL, by hand.** F-1086-2 records that `RATE_TTL_SECONDS` is not
observable over HTTP, so no e2e can see it. I drove the real shipped `bumpCounter`
(via `node --experimental-strip-types`) with a recording KV stub:

```
TTL forwarding: [{"k":"x","v":"1","ttl":600},{"k":"x","v":"2","ttl":3600}]
limit=5 verdicts: true,true,true,true,true,false,false
trunc behaviour:  seed="4.9" -> wrote 5 | "-3" -> wrote 1 | "abc" -> wrote 1 | "" -> wrote 1 | "5" -> denied
```

TTL is forwarded verbatim to `kv.put`; the limit boundary allows exactly N then denies;
`Math.trunc` plus the `> 0` guard handle fractional, negative, junk and empty values.

## Merge classification

Merge-base `3e7a2ecf` (s1086's own bookkeeping commit) — the lane branched from very fresh
main. Main moved **only `STATUS.md`** since then (s1087's lock).

| file | classification |
|---|---|
| `functions/api/_accounts.ts` | LANE-TOUCHED-ONLY |
| `functions/api/_bugs.ts` | LANE-TOUCHED-ONLY |
| `functions/api/_ratelimit.ts` | LANE-TOUCHED-ONLY (new file) |
| `functions/api/redeem.ts` | LANE-TOUCHED-ONLY |
| `functions/api/telemetry.ts` | LANE-TOUCHED-ONLY |

**Zero overlap ⇒ pure graft, no 3-way.** All five files materialised from the lane blobs
and **blob-verified identical** to `lane/e2-arsenal` before gating. Firewall held: the
master barred `e2e/` entirely and the branch contains no `e2e/` change — the tests remained
the instrument and were not adjusted to fit the refactor.

## Findings

**F-1087-1 — nothing in this repo typechecks `functions/`. (non-blocking, recorded)**

`tsconfig.json` has `"include": ["src", "e2e", "playwright.config.ts"]`, and there is no
tsconfig anywhere under `functions/`. ✓ VERIFIED by reading both. So `npx tsc --noEmit`
exit 0 — a headline gate on every drain — says **nothing** about a slice that lives
entirely in `functions/`, and `npm run build` (vite) doesn't bundle Pages Functions either.

This matters specifically for **ruling 2**. The master's stated reason for making
`ttlSeconds` a required parameter was that "the 600-vs-3600 trap becomes a **type error**
instead of a silent 6×". That property is real — but **no gate in this factory would ever
observe it.** The safety is currently enforced only by an editor, or by a human reading
the call site.

I verified the slice is type-neutral by running `tsc` over `functions/` **standalone** and
fingerprinting against main's versions of the same files:

```
CLEAN-MAIN BASELINE  exit 2: _accounts(397,37/51/64) TS2365/TS2365/TS2322 · redeem(49,10) TS18047
GRAFTED TREE         exit 2: _accounts(399,37/51/64) TS2365/TS2365/TS2322 · redeem(46,10) TS18047
```

Identical error set — same codes, same columns; only line numbers shift, exactly as the
added import and deleted functions would move them. **The slice introduces zero new type
errors.**

⚠️ **The 4 pre-existing errors are NOT a diagnosis.** They came out of an ad-hoc lib
selection (`--lib ES2022,DOM`) with no `@cloudflare/workers-types` installed; under the
correct Workers types some or all may vanish. I am recording the *gap*, not those errors.

**The corrective is therefore not a one-liner and I did not author it blind:** adding
`functions/` to a typecheck needs the right Workers type package chosen first, or it
lands 4 red herrings on the board. Recommended shape: install `@cloudflare/workers-types`,
add `functions/tsconfig.json`, re-measure, then wire it into the gate. Fire-authorable
once someone confirms the types package is acceptable to add.

**F-1087-2 — the 429 net's ports are hardcoded. (non-blocking, latent)**

`ratelimit-429-net.spec.ts` pins 8816–8819 with no fallback, and `waitForWorker` treats
*any* successful `fetch` as "my worker is up" — a foreign listener on those ports would be
measured instead of this tree (the F-1077-3 shape). Not realised this fire: `lsof` showed
8816–8819 free before the run. Worth a port-probe or a cwd assertion if it ever bites.

## Duties

- Goal leaf `rf-25-ratelimit-hoist` flipped `queued` → `merged` with the full 40-char hash,
  in the drain's bookkeeping commit.
- Done-move renamed `shipped-s1087-*`.
- **No gazette item, correctly** — a server-side refactor with zero player-visible change;
  the GZ-01 filter law excludes it.
- **No deploy, correctly** — nothing gameplay-affecting merged.
