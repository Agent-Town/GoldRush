# Task unclaimed-contracts-public: skill.md tells riders which contracts nobody has ever secured — the community hook, ruled YES (lane-a, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
READ FIRST: AGENTS.md; `assets/contracts/winnability-receipts.json` + `scripts/winnability-receipts.mjs` (merged 714d68198: per door contract, `status: 'claimed' | 'unclaimed'` with the first verified secure's species/profile/reel/pin/date when claimed; 36 door contracts, 4 claimed, 32 unclaimed at merge); `public/skill.md` (the door's contract list; its guards under `scripts/` — grep `skillmd`); `reviews/winnability-receipts-and-kit-guard.md` (what shipped, what was left flagged off).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner 2026-09-02, verbatim: "sure, start all of them" — Q3 of CAPABILITY-LADDER §6)
A standing nobody holds yet is the best invitation the county can print. The receipts exist; riders cannot see them.

## Scope
1. **The marker on skill.md:** in the door's contract list, each contract line carries either `unclaimed` or `first secured by <species> (<profile>) on <date>`, generated from `winnability-receipts.json` by the existing skill.md generation/pinning path (find it; never hand-edit generated text). A one-line legend above the list explains the two states in the county's voice (LEXICON-clean, no em-dashes).
2. **Freshness:** the receipts file is regenerated as part of the same script that re-pins skill.md guards, so the marker cannot go stale silently; document the command in the file header. If regeneration needs the network, the guard reads the committed file and only checks shape.
3. **Guards:** `skillmd-guard` and the citation/copy guards re-pinned; a node test asserts every door contract has exactly one marker and that the counts match the receipts file.
4. **Landing (verify only):** the landing already prints "Open. No verified rider yet." for empty boards; confirm and cite, no change.

## Firewall
Touch ONLY: `public/skill.md` (+ its generator/pin scripts), `scripts/winnability-receipts.mjs` (only to be callable from the pin path), the new node test, `package.json` (wire), BACKLOG row. NO changes to: ranking, the worker, contracts, `site/**`, other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `npm run test:node-guards` green including skill.md guards (count stated); the marker counts quoted (claimed/unclaimed per epoch) and matched to the receipts file; a diff excerpt of skill.md's list.
End: READY-FOR-GATES + the counts and the legend text.

## No-op / honesty guard
If skill.md's contract list is hand-authored rather than generated (name the evidence), STOP and report the fork: a hand-edited marker would rot on the next receipt.
