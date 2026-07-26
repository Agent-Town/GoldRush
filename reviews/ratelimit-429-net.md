# rf-24 — the 429 regression net

**Slice:** `tasks/lane-ratelimit-429-net.md` (goal leaf `rf-24`), FIRE-AUTHORED s1085
**Branch / tip:** `lane/e2-arsenal` (lane-c) @ `0a4f791a`
**Base:** `9d22f289`
**Merged to main:** `d16000a9c9b3a8690ee8a48d3b1b23a4a4faea0d`
**Drained by:** s1086, 2026-07-26
**Verdict: ✅ MERGE — gates green on the slice, firewall held, one pre-existing red proved not-ours.**

## What it does

It characterizes three live rate limits with tests, so that F-1080-1's eventual hoist of
`bumpCounter` into `functions/_ratelimit.ts` cannot silently break them. It is the
prerequisite s1084 ruled must land first — **tests only, zero edits under `functions/`**.

One new spec, `e2e/ratelimit-429-net.spec.ts`, self-spawns two `wrangler pages dev`
workers (redeem on 8816/8817 with `--kv TELEMETRY`; accounts on 8818/8819 with
`--kv ACCOUNTS --binding DEV_AUTH=1`, inspectors 9236–9239) and pins:

1. `redeem` — 5 well-formed-but-unknown stubs from one IP return `200 {ok:false, error:'bad_stub'}`; the **6th returns 429** `rate_limited`; a **different IP still gets 200** (per-IP keying).
2. `_accounts.requestCode` — 5 requests for one email pass; the **6th returns 429**.
3. `_accounts.requestCode` — 20 requests from one IP with **distinct** emails pass; the **21st returns 429**.

The two traps the master called out are both honoured in the code: the redeem test uses a
well-formed unknown code (`GR-A1B2C3-…`) because `redeem.ts:39-43` validates shape *before*
the limiter, and tests 2 and 3 use **different IPs** (`…100.20` vs `…100.21`) because
`_accounts:95-97` bumps both counters unconditionally, so a shared IP would contaminate.
The suite is `mode: 'serial'` and tears its workers down in `afterAll`.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0**, 3.4s |
| `npm run build` | **exit 0**, 13.3s (`✓ built in 1.05s`, asset-diet 235 GLBs 592.2→92.8 MB) |
| Battery (`ratelimit-429-net` + `bug-office-api` + `tl-01-run-telemetry`, `--workers=1`, both projects) | **28 passed / 2 failed, exit 1**, 118.0s — summary line PRESENT (F-1081-6) |
| — new net `ratelimit-429-net.spec.ts` | **6/6 green** (3 desktop-chrome + 3 mobile-chrome) |
| — adjacent `bug-office-api.spec.ts` | **8/8 green** (4 + 4) |
| — adjacent `tl-01-run-telemetry.spec.ts` | **14/16** — the 2 reds are F-1086-1, see below |
| Clean-main fingerprint of those 2 reds | **exit 1, 2 failed, identical** — see F-1086-1 |
| Plain-boot probe | **N/A and correctly so** — the diff is one e2e file; zero `src/`, zero `functions/`, zero rendering surface |
| Blob identity | copied `633422843e2050a010c76c4d76b90d8b317a57f4`, verified byte-identical to `0a4f791a:e2e/ratelimit-429-net.spec.ts` **before and after** the fingerprint run |

Codex's own report (mutation controls on `MAX_REDEEMS_PER_IP` and `MAX_REQUESTS_PER_EMAIL`
both failing verbatim `Expected: 429 / Received: 200`, then passing after restoration, with
`git diff main -- functions/` empty) is **corroboration, not the gate** — I did not re-run the
mutation controls, because the firewall makes them un-re-runnable without editing `functions/`,
which this drain may not do. ⚠️ **Recorded honestly: the mutation controls are the one piece of
this slice's evidence I am taking on report rather than measuring.** The tests themselves I ran.

## Merge classification

Base `9d22f289`. Branch diff vs main lists 12 files, but only **one** is LANE-TOUCHED —
`git diff --name-only 9d22f289 0a4f791a` returns exactly `e2e/ratelimit-429-net.spec.ts`.
Every other file (`STATUS.md`, `src/game/Game.ts`, `src/game/ProfileStorage.ts`,
`reviews/blocked-storage-access-throw.md`, `tasks/BACKLOG.md`, `tasks/goals.json`,
`logs/*`, `marketing/outbox/gazette-queue.md`, `e2e/task-024-blast-aim-presets.spec.ts`)
is **MAIN-MOVED-ONLY** — main's own rf-23 drain, which the lane forked before.

The lane-touched file is **absent from main** (`git cat-file -e main:… ` → *does not exist*),
so this is a **pure add: no 3-way, no conflict, nothing overwritten.** 154 insertions,
0 deletions — not a Silent No-Op (Mistake #1).

**Firewall held:** the master forbade every file under `functions/` and barred creating
`_ratelimit.ts`. The lane commit touches neither. ✓ VERIFIED by the commit's own file list.

## Findings

### 🔴 F-1086-1 — `tl-01-run-telemetry.spec.ts:229` is RED ON MAIN in both projects, it is a REGRESSION, and it is the Mistake-#10 test

✓ VERIFIED by clean-main fingerprint, not inherited. Test:
`plain no-debug secure return keeps telemetry invisible to gameplay`. Failure:

```
expect(locator).toBeVisible() failed
Locator: getByTestId('claim-secured')
Error: element(s) not found   (timeout 18000ms)
  at e2e/tl-01-run-telemetry.spec.ts:236
```

**Method:** I moved the new spec out of `e2e/` so the tracked tree was byte-identical to main,
re-ran that single test at `--workers=1`, and got **exit 1, 2 failed, same locator, same line,
both projects** — then restored the file and re-verified its blob hash. So it is not rf-24's.

**It is NOT F-1084-1.** That finding names three *other* suites (`m3-06-demo-profiles`,
`task-024-blast-aim-presets`, `tp00-tile-persistence`), all **desktop-chrome only**, all
**load-sensitive** and green at `--workers=1`. This one fails **at `--workers=1`, in
isolation, in BOTH projects** — a deterministic red, a different animal.

**It is a regression, and that is the part that matters.** `reviews/tl-01.md:18` records this
exact test **passing** at ship (s257): *"tl-01 test `plain no-debug secure return keeps
telemetry invisible to gameplay` PASS — no `?debug` boot, toggle player-visible, beacon
invisible"*. It is not in BACKLOG as a known red anywhere (grepped). So it broke silently
somewhere between s257 and now, and no battery has been looking at it.

⚠️ **Why this deserves owner attention rather than a quiet ticket:** this is precisely the
**Mistake #10** test — the no-`?debug` plain-boot assertion that a real player can reach
"claim secured". Its red says *either* the plain boot path can no longer secure a claim
(a live gameplay regression the family would hit), *or* the harness drifted. **Which one is
unknown, and I did not investigate** — diagnosing it is outside a drain's budget and outside
this slice's firewall. It needs a bisect, which is exactly the shape of work
`F-1081-3` (the ladder regression net) exists to make cheap.

**A LEAD, ✓ verified by reading, and explicitly NOT sufficient.** The helper
`openBoardAndLaunchPlain` (`tl-01:71-98`) forces a fast win by setting
**`Balance.run.secureWave = 1`** through a runtime source import, then launches
**`contract-launch-the-claim`**. That contract is `DEFAULT_CONTRACT_ID = 'the-claim'`
(`ContractFamilies.ts:701`) and now carries **`twist: { secureWave: 10 }`**
(`ContractFamilies.ts:1857`) — and `Game.ts:4532` resolves
`this.activeContract.twist.secureWave ?? Balance.run.secureWave`, so **the twist wins and
the harness's global mutation is silently ignored** (chain: `RunManager.ts:266` →
`host.secureWave()` → `RunManager.ts:511` → `Game.ts:4532`). A test that believes it set
the secure wave to 1 is really running a contract that secures at 10.
⚠️ **I am not calling this the cause. The arithmetic does not close:** the same helper sets
`waves.waveInterval = 0.25`, so wave 10 should still arrive in **~2.5 s**, far inside the
18 s budget. Either something else also changed, or the twist path affects cadence in a way
I did not trace. **Confirm or kill this lead with one instrumented run before bisecting.**

**Non-blocking for rf-24** (predates it, unrelated file, and holding an additive test file
hostage to it would help nobody). **No corrective queued by me** — a bisect task authored
blind would be inventing scope; it wants either an attended session or an owner *go*.

### 🟠 F-1086-2 — the net cannot see the divergence that makes F-1080-1 dangerous (carried forward, not new)

The master already recorded this and I am re-stating it so the hoist's author cannot miss it:
`RATE_TTL_SECONDS` is **not observable over HTTP** without waiting out the window, so this net
pins *limits* but **not TTLs**. The 600s-vs-3600s divergence at `_accounts.ts:72` — the thing
that would silently 6× the account rate-limit window — **remains uncovered by any test** and
must be caught by code review when F-1080-1 is authored, with TTL **and** limit as parameters
and an explicit ruling on `Math.trunc` vs `numberOrZero`. `_multiplayer.ts` also still has
**no 429 coverage**; this net covers `redeem` and `_accounts` only, as scoped.

## Where does the player see this?

**Nowhere, correctly.** This is a test-only slice: no `src/`, no `functions/`, no rendering,
no player-visible change. Per the GZ-01 filter law it therefore gets **no gazette item**, and
per DEPLOY LAW it is **not gameplay-affecting**, so no deploy was attempted.
