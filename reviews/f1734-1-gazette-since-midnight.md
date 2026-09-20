# F-1734-1 — Gazette sweep calendar-window repair

## Verdict — CLOSED

Direct fire-side instrument corrective on `main`, code commit `e710eb19ee03bbd320a66ff86622c00f9c905eaa`.

## What changed

`gazette-backfill-sweep.mjs` now converts date-only `--since` values to local midnight before passing them to Git. Explicit timestamps remain unchanged.

## Evidence

Against the unchanged s1727 handoff tip `62a3901d003fc6b7d5f93713e7f14df70338baeb`:

| Revision limit | Player-path merges |
| --- | ---: |
| `2026-08-05T00:00:00+07:00` | 97 |
| `2026-08-05T06:29:00+07:00` | 97 |
| `2026-08-05T14:20:00+07:00` | 88 |
| bare `2026-08-05` at 14:20 local | 88 |

The history did not move; Git supplied the current clock time to the bare date and silently dropped nine morning commits.

After the repair, both the default invocation and `--since=2026-08-05` print `since 2026-08-05T00:00:00` and agree at 97 player-path merges: 97 cited, 87 reported, 10 dismissed, 0 candidates.

## Gates

- `node --test scripts/gazette-backfill-sweep.test.mjs` — 2/2 passed.
- `node scripts/gazette-backfill-sweep.mjs` — 97/97 cited, 0 candidates.
- `node scripts/gazette-backfill-sweep.mjs --since=2026-08-05` — identical.
- `git diff --check` — clean.

## Finding

- **F-1734-1 — closed:** a date-named audit window was actually a moving time-of-day window. The fix lives at the single input-normalization boundary and keeps the advisory classifier unchanged.

No gameplay, player-visible content, Gazette item, or deploy is involved.
