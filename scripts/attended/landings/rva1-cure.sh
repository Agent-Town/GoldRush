#!/bin/bash
# rva1 cure (in the chain after the merge): F-RVA1-6 ledgered as a finding with its corrective Astra task; F-RVA1-2/-3 noted.
G=$1
python3 - <<'PY'
p='tasks/BACKLOG.md'; s=open(p,encoding='utf-8').read()
if 'F-RVA1-6 — MEASURED' not in s:
    row='🔎 **F-RVA1-6 — MEASURED 2026-09-26 by the river-assay-1 implementer, pre-existing, EVERY contract: a pause press is recorded in the reel as `set_pause paused:true` and the resume is never recorded (`RunTape.ts:171` passes no `pauseTarget`, so `LockstepClient.ts:859` writes `true`); a replay applies the pause (`Game.ts:3779`) and never advances, so ANY human standing whose player paused is unassayable today.** The tree\'s one real human standing (`artifacts/ops/seedrun-board-backup-20260822.json` row 0, the seed run of 2026-08-20, rejected then with "instrument exited 143") stops at tick 274 on base and tip; a River run with one pause and one resume records one `set_pause paused:true` and its replay stops at tick 51, while the same reel with that action removed reproduces the live hash and verifies. A pause changes nothing in the event log, so the fix moves no hash: the reel stops recording pause presses (as the playbook recorder already does, `Game.ts:4128`) or replays skip `set_pause`. Corrective: `tape-pause-fix-1` (Astra, lane-c, authored 2026-09-26, queued behind this landing). Until it lands a paused River run ranks while pending then drops, like every other contract.\n'
    i=s.find('🧭 **OWNER RULING 2026-09-26 21:50Z'); s=s[:i]+row+s[i:]; open(p,'w',encoding='utf-8').write(s); print('F-RVA1-6 row added')
PY
if ! git diff --quiet -- tasks/BACKLOG.md; then git add -- tasks/BACKLOG.md && git commit -q -m "drain: river-assay-1 — F-RVA1-6 ledgered (a pause makes any human reel unassayable; corrective tape-pause-fix-1 for Astra)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure rva1: F-RVA1-6 row committed $(git rev-parse --short HEAD)" >> "$G" || { echo "cure rva1: commit failed — needs hands" >> "$G"; exit 1; }; else echo "cure rva1: row already present" >> "$G"; fi
