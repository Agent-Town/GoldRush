# MP-07c-4 — THE RECKONING

**Slice:** `build-mp07c4-the-reckoning.md` · **Lane:** `lane/b` · **Base:** `385899fda980c1eaefbde6c03ce1ac540532e97c` · **Tip:** `22b9a89636500e7b06026f1333ebca17923bf862` · **Custody merge:** `61f6f3593776bd7a374343593623151bb68ebb71`

> **GATE VERDICT: HOLD — three attribution defects block MP-07c-4.**

The candidate carries validated self-declared stack metadata through the relay and submits mixed rides through the existing party-standing schema. Its normal path is not honest enough to merge yet: an agent can still appear as an undeclared human-shaped rider, per-run attribution survives a retry, and more than one browser may post the same team secure.

## Evidence

| Check | Result |
|---|---|
| `node scripts/drain-block-check.mjs tasks/done/20260814-214944-build-mp07c4-the-reckoning.md --strict` | `CLEAR` |
| Detached merge on current main | clean, 10 paths, +233/-25 |
| TypeScript | clean |
| `npm run test:mp` | 466 checks passed |
| `e2e/mp-07c-4-reckoning.spec.ts`, both projects, `--workers=1` | 2/2 passed |
| Independent `codex review --commit 61f6f359…` | P1 + two P2 findings; verdict HOLD |

The focused green is useful but incomplete: its mixed-party fixture supplies a stack manually and calls the party helper directly, so it never traverses the copied invitation command or the `Game` reset/submission-authority lifecycle.

## Findings

### F-1773-1 — the ordinary invited-agent path is still undeclared (blocking)

`TownScene` copies `gr-sim --room … --origin …`; the new CLI makes every stack field optional, and `rideSeated()` omits `player.stack` when those flags are absent. The relay still admits that headless rider. `multiplayerStandingParty()` then emits no rider stack, so the Field Book reads the team as human-only rather than as a human plus an unregistered agent. That violates the ratified gate: a mixed secure carries its agent declaration. The smallest honest cure is to make every headless rider an agent declaration even when its optional rig details are absent; detailed model/harness fields remain self-declared, and agents-only benchmark payloads must remain byte-identical.

### F-1773-2 — a departed rider leaks across `resetRun()` (blocking)

`multiplayerStandingRoster` accumulates contributors so a rider who drops late still receives honest credit for that run. `resetRun()` clears the agent bodies and view state but not this map. After the multiplayer client falls back to solo, a later Try Again can therefore submit the prior run's agent and stack on a fully solo secure. Clear the per-run roster on reset, then repopulate it only from an active roster.

### F-1773-3 — every browser can submit the same room standing (blocking)

Every browser instance executes `submitCountyStanding()` after the shared secure. Each device owns a different `countyAnonId()`, so the existing per-anon dedupe cannot collapse them; two browsers can create duplicate party rows or race the KV read/modify/write. Elect one deterministic browser submitter from roster order. Preserve the remaining-browser path after a peer drops.

## Custody and next action

The lane tip is preserved at `save/mp07c4-reckoning-s1773-attribution-hold`. Nothing from the candidate entered main. Corrective master: `tasks/lane-b-mp07c4-attribution-corrective.md`.
