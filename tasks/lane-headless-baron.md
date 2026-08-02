CODEX: model=gpt-5.6-sol effort=xhigh
# lane-headless-baron — the first BOSS enters the bench (E1 driver 5 of 5)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (owner 2026-08-02, E1 completion): e1-baron is the census's model boss citizen — the ENTIRE baron block is data-declared and consumed (spawn/HP/escorts via WaveSystem.ts:750-780, tauntWaves, rocketVolley, pursuitRange, medal). A baron driver completes the E1 bench AND sets the boss-driver pattern every later boss copies (vs the id-hardcoded E5/E7/E8/E9 bosses, which stay laddered until staging moves to data).
READ-FIRST: the four-driver HeadlessContractSim as merged · e1-baron entry (the baron block) · census §E1-E2 baron row · WaveSystem baron consumers · the browser baron fight code (what must run headless: volleys, escorts, medal award — and what is render-only).
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: real baron driver — cadence mult, baron spawn/fight/defeat from the DATA block, win posting incl. medal semantics (meta side-effects flagged OFF headless — bench runs must not mint medals; assert), secureWave semantics per the contract. Determinism gate. 5 pinned seeds. STOP-report any baron behavior that cannot run honestly headless.
TOUCH-ONLY: HeadlessContractSim (+ listed seams) · bench seeds · one spec. NO: browser fight behavior, Balance, meta.
SELF-CHECK: determinism gate · baron browser suites unmodified-green · full core + release suites green · tsc + build.
READY-FOR-GATES + report: a full baron headless transcript (spawn→volleys→defeat) + hashes + waves/sec.
