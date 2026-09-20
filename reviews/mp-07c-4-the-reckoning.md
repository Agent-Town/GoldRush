# MP-07c-4 — THE RECKONING

**Slice:** `build-mp07c4-the-reckoning.md` · **Corrective:** `lane-b-mp07c4-attribution-corrective.md` · **Lane:** `lane/b` · **Merge:** `1db41847c82665b6a2f899f0cfce439a687de905`

> **GATE VERDICT: PASS — MERGED. F-1773-1..3 are closed by the attribution corrective.**

Mixed rides now carry validated self-declared stack metadata through the relay and submit through the existing party-standing schema. A detail-less headless rider is still declared as an agent, retry attribution is rebuilt from the active roster, and exactly one active browser submits the team secure.

## s1773 hold evidence

| Check | Result |
|---|---|
| `node scripts/drain-block-check.mjs tasks/done/20260814-214944-build-mp07c4-the-reckoning.md --strict` | `CLEAR` |
| Detached merge on current main | clean, 10 paths, +233/-25 |
| TypeScript | clean |
| `npm run test:mp` | 466 checks passed |
| `e2e/mp-07c-4-reckoning.spec.ts`, both projects, `--workers=1` | 2/2 passed |
| Independent `codex review --commit 61f6f359…` | P1 + two P2 findings; verdict HOLD |

The focused green is useful but incomplete: its mixed-party fixture supplies a stack manually and calls the party helper directly, so it never traverses the copied invitation command or the `Game` reset/submission-authority lifecycle.

## Findings (closed s1774)

### F-1773-1 — the ordinary invited-agent path was undeclared (closed)

`TownScene` copies `gr-sim --room … --origin …`; the new CLI makes every stack field optional, and `rideSeated()` omits `player.stack` when those flags are absent. The relay still admits that headless rider. `multiplayerStandingParty()` then emits no rider stack, so the Field Book reads the team as human-only rather than as a human plus an unregistered agent. That violates the ratified gate: a mixed secure carries its agent declaration. The smallest honest cure is to make every headless rider an agent declaration even when its optional rig details are absent; detailed model/harness fields remain self-declared, and agents-only benchmark payloads must remain byte-identical.

Closed by emitting an empty declaration only in mixed standings; the relay wire still omits absent metadata, preserving agents-only benchmark bytes.

### F-1773-2 — a departed rider leaked across `resetRun()` (closed)

`multiplayerStandingRoster` accumulates contributors so a rider who drops late still receives honest credit for that run. `resetRun()` clears the agent bodies and view state but not this map. After the multiplayer client falls back to solo, a later Try Again can therefore submit the prior run's agent and stack on a fully solo secure. Clear the per-run roster on reset, then repopulate it only from an active roster.

Closed by clearing the recorded map and repopulating it from the active multiplayer roster during `resetRun()`.

### F-1773-3 — every browser could submit the same room standing (closed)

Every browser instance executes `submitCountyStanding()` after the shared secure. Each device owns a different `countyAnonId()`, so the existing per-anon dedupe cannot collapse them; two browsers can create duplicate party rows or race the KV read/modify/write. Elect one deterministic browser submitter from roster order. Preserve the remaining-browser path after a peer drops.

Closed by electing the first active browser in roster order; the next browser becomes eligible when that rider leaves.

## s1774 corrective gate

| Check | Result |
|---|---|
| `drain-block-check --strict` | `CLEAR` |
| Detached merge on current main | clean; exact ten-path firewall; +277/-25 |
| `npx tsc --noEmit` / `npm run build` | pass / pass |
| `npm run test:mp` | 466 checks passed |
| Complete Node battery under `.nvmrc` Node 26.4.0 | 464 tests: 457 pass, 5 expected fire-shell skips, 2 pre-existing site-anchor failures |
| Untouched-main site control | reproduces `news.html` → missing `index.html#teaser`; candidate changes none of the three site inputs |
| Corrective + adjacent Playwright, both projects, `--workers=1` | 25 passed, 1 expected mobile agent-seat skip |
| Plain boot, desktop + 390px, `--workers=1` | 2/2; zero console/page errors |
| Runner mutation control | inverted submit-authority predicate failed both browser projects, then restored byte-identically |

The corrected source merged at `1db41847c82665b6a2f899f0cfce439a687de905`. The pre-corrective tip remains at `archive/mp07c4-reckoning-s1773-attribution-hold` as retained evidence.
