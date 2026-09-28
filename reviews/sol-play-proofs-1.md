# Drain review: `sol-play-proofs-1`, the play-proofs campaign run 1: the Incline proven, Blackout Ridge half proven, three Frontier-era maps held (Astra; owner 2026-09-25)

**Branch** `sol/map-art-campaign-2` at `adac60628` · **merge** `a3beba1a8` · engine hash unchanged (`c63def1b`, no pin) · drained attended 2026-09-25 08:37Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `pp1`).

**Verdict: LANDED.**

### What it does
The first run of the play-proofs campaign the owner asked for on 2026-09-25 ("Can you do play proofs using Astra for these maps? That would be good."). Astra built a shared native driver (`e2e/native-proofs/driver.ts`: real WASD, Space, upgrade keys and HUD clicks; the secure spec's progressed-profile seeding and its permitted timescale 4; read-only diagnostics; per-map route and build orders) and one gated spec per map, and played five maps on desktop 1280x800 and phone 390x844 in fifty-five minutes. The Incline is a full proof on both projects: the Book launch selects Incline Haul, one beacon and four turrets hold the lower yard from wave 8, the ore cart is delivered at 180 of 180 HP and the railcar defeated at wave 14, the score is banked, the Book returns, a plain reload keeps the score byte for byte, zero errors. Blackout Ridge is a partial: wave 12 secured, banked, Book returned and reloaded on both projects, but the authored current-storage goal is unproved (the phone built both banks and made eight repairs, yet the banks ended wrecked and no stored energy was observed). Three maps failed two honest attempts each and are recorded as findings, not as impossibilities: the Baron (desktop died at wave 16 after seven builds; the phone reached wave 23 with the Rocket Cart still at 62 percent of its HP), Twin Banks (desktop died at wave 19, the phone held the defence and died at 18, both short of the wave-20 secure) and the Pressure Garden (all three coal seams reached; the phone commissioned three boilers but only two ran hot together, dying at wave 11 of 12). Every one of the ten final rows boots the requested contract and stays free of console and page errors. Where the player sees it: nowhere yet; this is the measurement the maps owed, and one map of nineteen now carries the full proof the eight before it carry.

### The gate stays closed
With the environment unset, the native-proof folder collects ten tests and skips all ten (an actual invocation, not a listing); the default battery's collection is unchanged at 3,428 tests in 469 files. `locked-win.spec.ts`, which asserts the real banking behaviour, is green on both projects beside the new drivers.

### Merge classification
Tests and evidence only: `e2e/native-proofs/driver.ts` and five specs (new, gated), `artifacts/sol/play-proofs/run-1/**` (the run note, a finding or proof per map with its rows and terminal boards, the gate and adjacent logs, the verification manifest), `reviews/sol-map-art-current-status-20260909.md` (five rows' second column, resolved by row key at the drain) and one dated section in the campaign report. No `src/**`, no contract, no balance, no config, no store; the engine hash did not move.

### Findings
- **F-PP1-1 (open, a hold):** the Baron, the Frontier Edition finale: two honest strategies die at wave 16 and wave 23 with the Rocket Cart at 62 percent. Either the finale is hard as designed or its first-time play is unclear; Astra's driver may also be the weak player. A planned third attempt comes at the campaign's end with what the later maps teach the driver, unless the owner says otherwise.
- **F-PP1-2 (open, a hold):** Twin Banks dies at waves 18 and 19 of 20 with seven to eight builds; same plan.
- **F-PP1-3 (open, a hold):** the Pressure Garden's boilers: three commissioned, two hot together; same plan.
- **F-PP1-4 (cured in the run):** the Incline needs the real Book launch to select escort mode; the driver now launches through the Book.
- **F-PP1-5 (open):** Blackout Ridge's authored storage goal: the banks wreck before energy is stored; the driver's repairs did not hold them. Run 2 opens with it.
- **F-PP1-6 (noted):** the runner's pre-flight clean discarded seven regenerated evidence paths (listed in the run note), all evidence churn under the F-1266-1 exception.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| e2e both projects, --workers=1 | `rc=0   2 skipped   30 passed (2.3m)  08:19Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1018 ℹ pass 1012 ℹ fail 1 ℹ skipped 5  08:37Z` |
| engine hash | `merged: c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef (pinned c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef)` |
