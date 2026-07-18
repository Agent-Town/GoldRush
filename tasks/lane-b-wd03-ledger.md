# Task lane-b-wd03-ledger: Dispatch engine — World Outside ledger pages (LANE-B, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; specs/world-dispatches/README.md (the WD-03 vehicle spec — THE LAW: reveal-through-progress, nearest-earlier-milestone-wins, never dump); lore/world-dispatches.md (the COMPLETE content tables E1-E10 — your data source; NEVER invent lines; the wiring notes bind); the surface you bind to (the Claim Ledger/encyclopedia (era-locked entries) — find the real seam, cite file:line in your report).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (`git checkout -B lane/m4 main && git clean -fd` on content-on-main; STOP on undrained/foreign). npm install; build green.
GROUND-TRUTH pre-flight: grep the WD-03 binding in src/ — absent = BUILD; present = STOP SHIPPED.

## Why: seven eras of dispatch content shipped with no delivery engine — the world's story is written and unread. WD-03 is one of three vehicles (siblings ride other lanes; do NOT build theirs).
## Scope: 1. The WD-03 binding per its spec section: parse the tables (deterministic build-time import or generated module), map each entry's milestone to the REAL progress event (era activation, boss defeat, science ceiling, contract completion — nearest-earlier law when ids differ), deliver through the existing surface (no new UI surfaces). 2. Era-lock: entries never fire before their era is REACHED. 3. Dupe-guard: each entry fires at most once per profile. 4. Spec e2e/wd03-ledger.spec.ts (GATE-AUTHORSHIP, both projects): a debug-driven milestone fires exactly its entry once; pre-era entries silent; LEXICON law asserted; plain boot unchanged until a milestone fires.
## Firewall: the binding module + the minimal seam hook (<=30 lines) + the spec. NO table edits, NO new UI, NO other WD vehicles.
## Self-check: tsc+build green · spec green both projects · task-025 unmodified-green · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the seam (file:line) + the milestone-mapping table + any nearest-earlier fallbacks used.
