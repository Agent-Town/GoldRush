# s1469 ruling — the 10 AT-RISK blobs in `gate-s1455` are SUPERSEDED NOISE, not history

s1468 left `gate-s1455` in place deliberately and asked a fire to rule on whether its
10 modified artifact blobs (gt-05 + e1-twin-banks re-renders) are worth committing.
**Ruling: no — and nothing is lost by saying so.** Evidence below; nothing was deleted.

## What the worktree holds (re-verified s1469 by sha256, not inherited from s1468)

| Path | Verdict |
|---|---|
| `artifacts/f1453-1/*` (5 files) + `e2e/f1453-crossings-hygiene.spec.ts` | **IDENTICAL-ON-MAIN** by sha256 (drained `3ff007ad`) |
| `src/entities/Enemy.ts` | **STALE, not unlanded** — differs by exactly ONE line, and the worktree holds the *pre-*`4ab48743` watchdog condition (`>= stuckWatchdogSeconds` without `&& route.blocker`). Main is AHEAD. |
| 8 PNG re-renders (gt-05, e1-twin-banks) | screenshot nondeterminism; ±4–13 KB against main's tracked copies |
| 2 wade-speed JSONs | **the only numeric content — and it is sampling noise** (retained here, both sides) |

## Why the JSONs settle it

The re-render vs main, `wade-speed-desktop-chrome.json`:

    bank.seconds   0.9999999999999964  ->  1.233333333333329
    bank.speed     5.9999999999697975  ->  5.999999962495727
    ford.seconds   0.93333333333333    ->  0.8999999999999968
    ford.speed     5.09349900732748    ->  5.099999914912172
    ratio          0.849               ->  0.85

Every speed is unchanged to 7 significant figures. `seconds` moves because the sample
lands on a different frame, and `ratio` moves in the fourth decimal. **The assertion the
artifact exists to support — the ford is slower than the bank, ratio ~0.85 — is
identical.** These are the same measurement re-taken, at a HEAD (`7c833197`, 2026-08-04)
two days behind main.

## The disposition

Committing them would **replace evidence the gt-05 and e1-twin-banks reviews cite with
noisier re-takes from a stale tree** — a net loss to the ledger, not a retention gain.
The RETENTION LAW protects factory history from deletion; these are *duplicates* of
tracked evidence that git already holds every version of.

So: the informational content (both JSONs, both sides) is retained here at ~1 KB, the
ruling is written down so the next fire need not re-litigate it, and **the worktree was
left in place — nothing was deleted.** A fire or attended session may now drop
`gate-s1455` knowing it holds nothing main lacks.

⚠️ One live process still has this worktree as its cwd: `npm exec vite --port 5241`
(observed s1469). Whoever drops the worktree should account for it. I did not kill it —
it is not mine, and a pid read earlier in a session is not a safe kill target.
