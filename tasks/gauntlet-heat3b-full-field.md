# Task gauntlet-heat3b-full-field: pi, omp, Eliza and the paper harnesses join the gauntlet — all on the subscription shim (lane-b, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. You are the OPERATOR of the widest field yet, and no rider yourself (your models rode heats 1-2).

SEQUENCING LAW (hard gate): `server/codex-shim/serve.mjs` must exist on main with its round-trip test green (heat-3a's deliverable). Verify by running the shim + one completion BEFORE anything else. Not there or not green → STOP "shim not landed".
READ FIRST: AGENTS.md; tasks/gauntlet-heat3a-codex-backend-shim.md + docs/ops/codex-shim.md (the backend every guest uses); tasks/gauntlet-heat2-harness-matrix.md (the charter-prompt pattern, the DNF law, the skew law — all inherited); docs/bench/harness-era-implications.md (the paper trio this heat scouts: Tycho arXiv:2607.28287, AVO arXiv:2603.24517, VISTA vista-research.github.io).

Pre-flight: standard safe-dupe template + F-1407-1 churn exception; npm install; build green. Own ride worktree `/tmp/heat3-<deployed-build>` at the CURRENT production commit — read `https://gold-rush-3in.pages.dev/version.json` at run time and use THAT commit (the skew law tracks deploys; do not inherit b42c0fbc if production moved) — and confirm the droplet's ASSAY_BUILD_ID matches it via a probe submission... NO: you cannot read the droplet env. Instead: submit your FIRST secured ride early and poll its verdict — `unassayable: build-skew` means the pin drifted: STOP and report (attended re-pins), do not burn the field against a skewed assayer.

## Why (owner 2026-08-24, verbatim: "we need PI, omp, Eliza as well - we want to run hermes, openclaw and all of them on Codex/subscription" + "I also shared a ton of new papers with you about new harnesses - maybe we can look into that direction as well, ah, and prime intellect's prime agent is also needed in the gauntlet")
The county's board is species-blind and the field should show it: every harness the machine can honestly run, all drawing on the subscription backend, same maps, same seeds.

## The field (install what's missing; every arm independent; DNFs are heat history)
1. **Install recon per harness** — pi (Prime Intellect's prime agent), omp (Oh My Pi — the old board ran 17.2.12), eliza (elizaOS): find each's canonical install (npm/pip/uv/brew — web research allowed and expected), install the CURRENT version, record exact versions in the note. An uninstallable harness = DNF (install stage) with the exact error — never force a broken install.
2. **The paper trio recon** — Tycho, AVO, VISTA: does PUBLIC runnable code exist? If yes and it can drive a stdin/CLI game loop headlessly, install + ride the short program; if code is unreleased or fundamentally incompatible (e.g. vision-only against our JSON views), record the recon verdict per paper in the note — that verdict is a deliverable the owner asked for ("maybe we can look into that direction").
3. **Backend law**: EVERY guest (hermes and openclaw included — re-ridden here on the shim) gets its OpenAI-compatible base URL pointed at the heat-3a shim; models = the mapping the shim documents. No guest rides its own key in this heat; a guest that cannot target a custom base URL = DNF (config stage). Never edit a guest's global config destructively — use env/per-run config, restore anything you must touch.
4. **The program**: short program each (the-claim, night-shift, hill-mine; first seeds — the heats 1-2 comparison set), 3 attempts, ~20 min wall per attempt, charter prompt per heat-2's pattern. Secured → submit → poll to `verified`. Stack declared truthfully per arm (harness + version + the model the SHIM actually served it).
5. Evidence: `artifacts/gauntlet-heat3-20260824/` — per arm: tapes, submissions, slips, and `heat3-note.md` with the full matrix (arm | install | config | contract | attempts | result | tapeId | verdict | wall) + the paper-trio recon verdicts + shim latency observations.

## Firewall
Touch ONLY: `artifacts/gauntlet-heat3-20260824/**`, tasks/BACKLOG.md (your row). Guest installs are MACHINE-level (owner ordered them) but repo-wise: NO src/scripts/functions/assets/e2e/specs. Never echo any credential; the shim's port is the only secret-adjacent thing a guest sees.

## Self-check (evidence, not vibes)
Every submitted row polls `verified` (slips quoted); the matrix complete (row or staged-DNF for every arm including the paper trio's recon verdicts); guests' global configs restored; worktree removed. End: READY-FOR-GATES + report: the matrix, per-arm token/wall costs, the paper-trio verdicts, door findings from fresh eyes.

## No-op / honesty guard
Operator ≠ rider: never ghost-write orders for a guest. A DNF-heavy field is a publishable heat. If the shim buckles under a guest's call pattern, capture it as a heat-3a finding and DNF the arm — do not hand-patch the shim mid-heat.
