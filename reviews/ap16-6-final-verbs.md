# AP-16-6 — final verbs (gate-side HOLD)

**Slice:** `lane-d-ap16-6-verbs`  
**Lane tip:** `6f92826659e14261e83963aab30baceef7038b64`  
**Lane base:** `5bcea8b537936d0fab250eda8630271171750bbc`  
**Gate candidate:** `cc5da5cd00918afbeb538af7c024278bad3f883e` in detached worktree `gate-s1694`  
**Salvage ref:** `save/ap16-6-s1694-6f928266`

## Verdict

**HOLD — NOT MERGED.** The implementation completes the requested grammar, audit, documentation, and direct happy-path tests, but an independent review reproduced three direct semantic regressions and found three incomplete execution paths. Per the FIRE gate law, the candidate stays out of main and is re-landed through corrective `ap16-6b-final-verbs-reland`.

No candidate content entered main's working tree while undecided. The lane tip is preserved on the salvage ref above before any lane reset.

## What the candidate gets right

- Adds validated, idempotent `SET_WEAPON`, window-gated `SECURE_CHOICE`, and priced `CONTEXT_ACTION` standing orders.
- Exposes the headless weapon, secure window, works entries, and megaproject state in THE VIEW.
- Keeps the tested explicit-rush and `--overtime` direct-sim hashes equal at `fnv1a32:e8f80526`.
- Moves the generated class-8 audit from `agent-lacks 439 / equal 641` to `agent-lacks 373 / equal 707`, including the four cited exemptions.
- Verifies `skip_ceremony` is presentation-only in the headless path.

## Blocking findings

### F-1694-1 — automatic blast and `BLAST_AT` do not share a cooldown

`HeadlessContractSim` registers an automatic blast shooter with CombatSystem's private timer while explicit `BLAST_AT` checks `blastReadyAt`. The independent probe selected blast mode, submitted `BLAST_AT` with an enemy present, advanced two ticks, and observed `combat.blastsAlive === 2` inside one nominal 2.5-second cooldown. `now.blastReadyInMs` therefore describes only one of the two paths.

### F-1694-2 — runtime rush is still capped as a non-overtime CLI run

The sim records an in-run `SECURE_CHOICE rush`, but `scripts/gr-sim.mjs` chooses its termination ceiling from the original `options.overtime`. A normal invocation that chooses rush at runtime was killed at wave 12 with `endReason: "wave-ceiling"`; the pre-run `--overtime` path is allowed the 50-wave overtime ceiling. The direct constructor hash test does not exercise this CLI branch, so the required rush-equivalence proof is incomplete.

### F-1694-3 — unrelated orders execute while the secure window is frozen

The pending-secure branch freezes sim time but calls `prospector.updateSimulation(0, ...)`, which ticks the whole installed standing-order set. Build, harvest, blast, and context actions can therefore execute while enemies, waves, and sim time are paused. The human secure choice is a modal pause; only the secure choice may act in that window.

### F-1694-4 — browser-owned agent seats have grammar without handlers

`HeadlessContractSim` binds the three handlers only onto the singleton executor installed by its own ToolSurface. `AgentRiderBody` constructs a separate `StandingOrdersExecutor` for browser-owned rooms and never binds the final verbs. Those orders validate but report unavailable, and the seat cannot observe or answer the secure window. AP-16's same-game law applies to both door executions.

## Non-blocking incompleteness folded into the re-land

### F-1694-5 — standalone CLI funding has no research-progress input

`HeadlessContractSim` accepts `scienceSteps`, but `gr-sim.mjs` never supplies it. Standalone CLI runs therefore boot with zero research and cannot lawfully expose or fund a megaproject; only direct constructor tests can make the new `fund` action succeed.

### F-1694-6 — shared browser views always report `weapon: "rig"`

`View.ts` reads `diagnostics.weapon`, while browser Game diagnostics publish weapon state under actor diagnostics. Human browser and browser-owned-seat views therefore fall back to `rig` after switching to blast. The headless-only test is green because HeadlessContractSim happens to add the top-level field.

## Gate evidence

| Gate | Candidate result |
|---|---:|
| `node scripts/drain-block-check.mjs tasks/done/20260812-043415-lane-d-ap16-6-verbs.md` | `CLEAR`, live leaf `queued` |
| `npm run test:node-guards` under pinned Node 26.4.0, alone | **457 tests / 452 pass / 0 fail / 5 skip**, rc 0, 459.8 s |
| `npx tsc --noEmit` | rc 0, 4.4 s |
| `npm run build` | rc 0, 18.0 s |
| affected always-on guards | **4/4**, rc 0 |
| AP-16-6 + blast + water + death + build-menu + desktop/390px boot, `--workers=1` | **40/40**, rc 0, 222.4 s |
| fresh `codex review --commit cc5da5cd` using Codex 0.147.0 | **6 findings**: four P1, two P2 |
| `e2e/agent-view.spec.ts`, candidate | **4 pass / 1 fail** |
| same `agent-view` suite on clean main `9a57975c9` | **4 pass / 1 fail**, proving the large manifest/snapshot drift predates AP-16-6; candidate additionally adds its required `weapon` and works-entry fields |

Full gate transcript: `artifacts/ap16-6-gate-s1694.txt`.

## Merge classification

The lane changes nine paths. Main changed 26 paths after the lane base; the intersection is empty. All nine lane paths are lane-touched/new, with no three-way conflict required. The hold is semantic, not a merge-shape objection.

The original task's TOUCH-ONLY list omitted `scripts/same-game-audit.mjs`, although scope 5 explicitly required changing the generated audit mapping and exemption rows. Its 21-line source diff is confined to that named scope, but the corrective firewall names it explicitly so the runner no longer has to choose between the scope and the firewall.

## Disposition

The original goal leaf becomes `blocked` with `blockClass: "gate-side"`. The exact implementation is retained at `save/ap16-6-s1694-6f928266`; the corrective reuses it on current main, resolves F-1694-1 through F-1694-6, and makes the stale shared-view snapshot truthful rather than deleting its assertion.
