> ⏸️ **TRUNCATED DRAFT — DO NOT QUEUE.** Found untracked and incomplete by the s1621 fire (2026-08-10), unchanged since it was written ~04:5x that morning by an attended Cowork session that then moved on to bench work. **This file ENDS MID-SENTENCE** and carries no Scope, no Firewall and no Self-check, so it fails the CLAUDE.md §6 task-master bar on three counts. Its first line reads like a valid master, which is exactly the trap: a NEVER-RAN-master sweep that judges by line 1 would dispatch it and buy a STOP or a flail.

⚠️ **COMMITTED RATHER THAN DELETED, PER THE RETENTION LAW** (CLAUDE.md §4.10b) — it was untracked, so it would have died with the disk. Its intent (make `gr-sim` emit a `RunTape` that satisfies `validateTape` in `functions/api/standings.ts`) is sound and worth authoring properly; **re-author it from scratch against a current premise, do not repair this fragment.** Two drafts of the same task exist — this one and its sibling; neither is complete.

---
# Task agentreel-1: the door records its own reel — gr-sim --tape (LANE-D, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; src/game/RunTape.ts (the RunTape shape: version 1, simVersion 1, inputLog = PlaybookRecording & {primarySlot, streams}, eventLogHash `fnv1a32:`, outcome) and its RunTapeRecorder for how the browser fills it; src/playbook/PlaybookFormat.ts (PlaybookRecording — the ORDER-SUBMISSION half of the input log; read `canonicalPlaybookText`/`playbookHash`); functions/api/standings.ts:527-560 (`validateTape`/`validTapeOutcome`/`validTapeInput` — the EXACT constraints your emitted tape must satisfy; read `validTapeInput`'s full key set and entry validation before writing an
