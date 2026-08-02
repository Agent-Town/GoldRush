CODEX: model=gpt-5.6-sol effort=high
# lane-escort-mode-as-data — F-CEN-8: the E2 escort stops living in the URL
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
WHY (census F-CEN-8, promoted 2026-08-02 as the E2 bench prerequisite): escort mode activates only via ?mode=escort (Game.ts:3725-3729, WaveSystem.ts:180-184; town injects it from modes[0].id) — unreachable headless, undeclarable in a manifest. The mode becomes sim-boot state.
READ-FIRST: census §E1-E2 gap 7 · the cited sites · HeadlessContractSim boot contract · TownScene.ts:2059 (the injector) · the E2 modes[] data.
PRE-FLIGHT (LANE-SAFETY invariant): dirty tracked blobs must be reachable in git, else STOP.
SCOPE: mode is a first-class boot field (launch seam carries it; URL param becomes one WRITER of the field, not the field); headless boot accepts --mode; manifest deriver exposes modes[]; behavior byte-identical in browser (URL path still works; suites prove).
TOUCH-ONLY: the boot/launch seam · Game/WaveSystem mode reads · gr-sim arg plumbing · manifest fixture updates · specs. NO: escort gameplay, rewards.
SELF-CHECK: E2 escort suites unmodified-green both projects · tsc + build · release suite green (E2 stripped — prove no leak).
READY-FOR-GATES + report: the field's path from data→boot→consumers.
