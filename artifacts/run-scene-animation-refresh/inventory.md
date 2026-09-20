# Run-scene animation inventory

| Run actor | Previously/currently wired | Newest QA-passed raw + processed | Result | LEDGER |
|---|---|---|---|---|
| Hero | walk4 male sheets | `char-hero-sheet-walk8.png` + 32 `walk8` cells; female fallback/action `*-f` package | Activated approved walk8 and female fallbacks/actions | rows 38-39 |
| Prospector agent | hover8 | `char-prospector-sheet-hover8.png` + 32 cells | Already current; unchanged | row 40 |
| Claim Jumper | walk8 | `char-jumper-sheet-walk8.png` + 32 cells | Already current; unchanged | row 41 |
| Baron | walk4 | `char-baron-sheet-walk8.png` + 32 cells | Activated approved walk8 | row 42 |
| Rail Tough | procedural/tinted Claim Jumper | no QA-passed character sheet | Deferred | row 52 |
| Steam Wrecker | procedural/tinted Claim Jumper | no QA-passed character sheet | Deferred | row 53 |
| Coal Thief | procedural/tinted Claim Jumper | no QA-passed character sheet | Deferred | row 54 |

QA-passed generic `char-bandit-base` and `char-bandit-thief` sheets (rows 48-49) are not wired as E2 substitutes: they do not satisfy the dedicated Rail Tough / Coal Thief ledger slots. `char-bandit-wrecker` is missing (row 50).

E1 wiring update (2026-07-12): the generic base and thief sheets now distinguish the Outlaw Runner and thief runtime from `char.claim_jumper`; they remain deliberately unavailable to E2. The missing wrecker remains unchanged.

## Generation requests

- Dedicated `char.e2.rail_tough` sheet.
- Dedicated `char.e2.steam_wrecker` sheet.
- Dedicated `char.e2.coal_thief` sheet.
- Generic `char.bandit_wrecker` walk8 sheet if the generic bandit trio is still wanted.
- Hero pose idle8/work8/attack8 remains QA-blocked and was not wired.

Old capture: `artifacts/066/{desktop,mobile}-chrome-hero-walk4-unchanged.png`.
New capture: `{desktop,mobile}-chrome-hero-walk8-new.png` in this directory.
