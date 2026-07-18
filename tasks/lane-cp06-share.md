# Task lane-cp06-share: CP-06 THE POST — charters travel (export/import sharing) (LANE-A, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · specs/charter-press/README.md (laws; CP-01..05 ALL MERGED — schema, validator, loop, lever, THE RIVER; Q3 is ANSWERED: owner 2026-07-18 "we don't have to park charter sharing... lets also work on that") · src/charter/** (envelope: provenance + lineage — "already shaped for sharing" per the spec) · e2e/cp01-charter-roundtrip.spec.ts + cp05-river.spec.ts (gate grammar) · src/game/ProfileStorage.ts (the charter shelf, profile-scoped).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (owner 2026-07-18: sharing un-parked — "We are fully in the process of finishing things up")
The Press prints charters; now they must TRAVEL. Client-only game (static hosting): sharing is FILES AND CODES, no server ever.

## Scope
1. EXPORT: a stamped charter exports as a downloadable `.charter.json` file AND as a copyable compact code (base64 of the charter JSON — one string, clipboard-friendly). Provenance travels intact (author, lineage root, stamp clock).
2. IMPORT: the Press accepts a dropped/picked `.charter.json` file AND a pasted code; every import runs the FULL CP-02 validator gate before it may stamp (no imported charter that stamps may fail to boot — the law holds for foreign charters); imported charters land on the profile's charter shelf marked with their foreign provenance (author preserved, never rewritten).
3. LINEAGE HONESTY: re-stamping an imported charter extends its lineage (the importer becomes a link, never the root author).
4. Spec e2e/cp06-share.spec.ts (both projects): export→import round-trip is byte-equivalent · a pasted code re-creates the identical charter · a tampered/corrupt code is REFUSED with a reason (validator, no crash) · an imported charter stamps and boots clean (zero console) · THE RIVER exports/imports intact (the flagship fixture).
## Firewall: TOUCH-ONLY src/charter/**, ProfileStorage charter-shelf surface, your spec. NO server/network code of any kind, NO URL-parameter sharing of charter payloads, NO shipped-contract byte changes, NO sim changes.
## Self-check: tsc+build · cp01..06 ALL green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the export/import surfaces + the refusal evidence line.
