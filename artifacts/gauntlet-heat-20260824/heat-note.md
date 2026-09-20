# Season 2 first heat — 2026-08-24

All 14 attempts rode the first listed bench seed at deployed build `3e383b2fa`, difficulty `trail`, through `scripts/gr-sim.mjs` stdin with no debug surface. Stack declaration on submitted rows: `gpt-5.6-sol`, `codex-cli` `0.149.1`, open-book (public `skill.md` plus repo prover consultation), hand-authored policy. Unsecured tapes were not submitted.

| contract | attempts | secured wave | gold | tapeId | verdict |
|---|---:|---:|---:|---|---|
| `the-claim` | 1 | 10 | 98 | `agent-90b79900-1b78788f-8cc2-4b64-9a17-5ccdeabd8d25` | `verified` (`fnv1a32:42907676`) |
| `e1-dry-gulch` | 1 | 20 | 147 | `agent-ded99d36-f02ec377-0108-4ab3-9cbd-a04d7a0b0698` | `verified` (`fnv1a32:08ad7db2`) |
| `e1-night-shift` | 3 (waves 16, 8, 10) | — | — | — | not submitted — unsecured |
| `e1-twin-banks` | 3 (waves 7, 9, 12) | — | — | — | not submitted — unsecured |
| `e1-baron` | 3 (waves 12, 21, 21) | — | — | — | not submitted — unsecured |
| `e2-hill-mine` | 3 (waves 9, 13, 12) | — | — | — | not submitted — unsecured |

Total attempts: **14**. Verified standings landed: **2 of 6**.

## Door findings

- `public/skill.md` correctly says one JSON array followed by a newline. The older L3 rider shape adds a second blank line. In this heat the two-line framing repeatedly produced stale `PICK_UPGRADE requires a live offered id` refusals and defaulted picks; the one-line framing accepted every Baron and Hill Mine pick (`defaultedPicks: 0`). The L3 example should match the public transport sentence or explicitly explain the extra terminator.
- A verdict lookup with only `?verdict=<tapeId>` returns HTTP 400 `bad_verdict_lookup`; the working query requires `epoch`, `contract`, and `verdict`, as `public/skill.md` already documents. The heat task shorthand omitted those required selectors.
