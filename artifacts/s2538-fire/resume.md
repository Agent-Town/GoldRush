# Continue the MAIN story-readiness drain

This is the six-wait corrective only. It does not contain the held chapter screenshot-writer patch or the M1 debug-consent corrective.

Candidate: `83f1429f6ff2dc26254f0c18225466991b6454ea`, detached at `/private/tmp/gr-gate-s2538`. Base: `ac555e02ac6015a56a9b58693b65621535c6ac89`. Exact patch and declared paths are beside this note. The original done-move is `tasks/done/20260907-172449-main-chapter-story-readiness.md`.

Before any continuation, run the policy check for `main-chapter-story-readiness.md`, compare current main with the base, and check whether the completed source diff still matches `readiness.patch`. A passing gate belongs only to the source tree it measured. Never reset main or a lane to recover this candidate.

The implementer used Node 23.11.1. The fire uses `/Users/robin/.nvm/versions/node/v26.4.0/bin` first on PATH and file concurrency one. Read `core-gates.log` for every final exit code. The generic wrapper terminated the optional Node attempt after 900 seconds; its result is incomplete. See `gate-scope.md` for the governing test-only gate scope and the direct full-Node command required if a future diff changes simulation code.

Browser acceptance is the twelve Frontier exclusion cases across both Chrome projects, three repeated mobile E7 cases, task-025 plus M1 plus M2 on both projects, and the plain desktop/390px boot probe. Use a checked-free private port with the existing gate-battery driver and an independent Vite cache. The M1 debug-consent failures have a separate done-move; any M2 edge-touch recurrence requires current-base classification. No broadened screenshot-writer patch is accepted by these gates.

Final s2538 state: required own checks 12/12 plus 3/3 and both boots pass. Candidate adjacency 29/32 versus complete base 30/32 leaves M2 unproven; the six waits are backed up on origin/save/main-chapter-readiness-s2538 and removed from main. The goal is blocked gate-side. Do not repeat the chapter task; the registered MAIN M2 diagnostic owns the next measurement. See `reviews/main-chapter-story-readiness.md`.
