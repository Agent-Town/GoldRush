# Drain review — `sprites-split-land` (A19 stage 1): the sprite-roster branch's tooling, prose and non-payload families, landed by selective checkout (attended drain, 2026-09-14)

**Slice/branch/tip:** `feat/sprites-split-land` @ `df1a0edcc` — five commits by a Claude Opus 5 implementer on the owner's Anthropic subscription (owner 2026-09-14: "only the Anthropic subscription"), in a scratch worktree cut from main `9382083d3`; master `tasks/sprites-split-land.md`; the implementer's full report and per-family tables: `artifacts/sprites-split-land/report.md`.
**Merged as** `314fa2fa3d` into the era-6 chain (`git merge --no-ff`; `assets/LEDGER.md` unioned; `package.json` stage-1 roots and `scripts/gate-caller-baseline.json` reasons unioned by hand from the two sides), landed by fast-forward with the map campaign at the hash the ledger row names.
**Owner rulings, verbatim:** 2026-09-13 "A19 - that is ok" (option (b): re-cut the heavy town-cast sheets, land the rest by a split master) · 2026-09-13 "I like the new sprites I saw, I think there is still a lot of work to do but I don't have too many tokens right now" · 2026-09-14 "Lets get the updated parts of epoch one into the live version."

## VERDICT: LANDED — 30 families, nothing the first town declares, the halo guard kept strict

## 1. What landed and what did not (the implementer's measurements, spot-checked at the drain)
| landed (30 families, 664 files) | held (145 families) |
|---|---|
| bandits `char-bandit-{base,thief}` walk8/walkdiag8 (4); the Baron `walk4-a/b`, `walkdiag8`, `walk8` (4, the pale halo leaves the figure: 373,196 opaque px beyond the edge move by a mean Δ30, hue held); coalthief / railtough ×2 / steamwrecker (4); the E6–E9 enemy walk8 sheets (9); claim jumper `char-jumper-*` (7); `char-prospector-sheet-hover4-{a,b}` (2) | every family `assets/first-town-payload.json` declares (37, +19.8 MB → stage 2, `tasks/town-cast-walk8-hard-alpha-recut.md`); `char-hero-*` (12, incl. the marigold Elder variant, F-SPRDR-10, never); 86 `townsfolk-*` portraits that are pixel-identical re-encodes; `char-prospector-{complainant,gilded}-sheet-hover8` (regenerations that grow the figure 220 → 226 / 224 px — **F-SSL-3, owner's eye**); `boss-railcar-*` + `enemy-claim-jumper` (+104 KB for 0–6 changed pixels, F-SSL-5); every ADDED family with no reference (F-SPRDR-4b) |

Earned on this tree: **90,691 visible violet-key pixels → 0** and **4,489,119 key pixels under fully transparent pixels → 0** across the landed families. Shipped bytes under `assets/processed` +17.3 MB, none of it in the first town's gated groups.

## 2. Gate table
| gate | result |
|---|---|
| `node scripts/first-town-payload.mjs` on the release build | **33,856,374 B** — +89 B against main's 33,856,285 (allowance 8,000): nothing leaked |
| `scripts/halo-reextraction-check.mjs` | PASS 459 cured / 160 held / 456 regenerated-and-cured / 1,400 scanned (main: 811 / 232 / 32 / 1,400); the branch's relaxed invariant was refused, every landed re-extraction declared in `REGENERATED_SHEETS` with its cause; on the combined chain the denominator reads 1,401 (the map campaign's `terrain-e5-open-sea-tile.png`) |
| `scripts/gate-caller-audit.test.mjs` | 45/45 — 14 of the taken guards rooted in the FIRST battery stage; the six `review-*.test.mjs` own their own server and are red for want of a `repair` block in `assets/master-divergent.json` (F-SSL-4), so they carry measured baseline reasons instead |
| `npx tsc --noEmit` | clean |
| e2e, both projects, one worker (task-025, m1-01, m2-01, the E6–E9 roster specs) | **58 passed / 0 failed**; plain boot 0 console/page/request errors desktop + 390 px |
| full `test:node-guards`, Node 26, on the combined era-6 chain | see `reviews/maps-campaign-land-era6.md` §2 (one battery for both lands) |

## 3. Findings
- **F-SSL-1 (drain decision):** the master ordered `scripts/town-patrol-monument.test.mjs` rooted although it is RED on main by a real pre-existing town-data defect ("newsie segment 5 enters the monument"); `run-node-guards.mjs` has no known-red allowlist, so a rooted red reddens every battery. At the drain it stays un-rooted with that reason in the gate-caller baseline; the defect is recorded in `logs/suite-red-inventory.md`; the corrective belongs in `src/town/townsfolk.ts` (BACKLOG row).
- **F-SSL-2:** `scripts/master-repair-check.test.mjs` is a sixth src-dependent guard the 2026-09-12 review missed; held on the branch.
- **F-SSL-3 (owner's eye):** the two prospector `hover8` regenerations change the agent's silhouette (figure +4–6 px); held.
- **F-SSL-4:** the six `review-*.test.mjs` need a `repair` block in `assets/master-divergent.json` (main 26 cells / 0, the branch 420 / 420); reasoned, not rooted.
- **F-SSL-5:** eight families re-encoded larger for 0–6 changed pixels; held.
- Two 2026-09-12 review leftovers closed by this run: the UNATTRIBUTED `m1-01:83` / `m2-01:178` reds were load flakes (green here), and `tasks/PROPOSED-sprite-source-assertions-20260908.md`'s premise does not hold on main (all four roster specs pass).

## 4. What was touched
Everything on `feat/sprites-split-land` (the implementer's five commits: scripts, LEDGER prose, the 30 families, `scripts/halo-reextraction-check.mjs` declarations, `package.json` roots, `scripts/gate-caller-baseline.json` reasons, `logs/suite-red-inventory.md`, `artifacts/sprites-split-land/**`); at the drain: the union of `package.json` / `gate-caller-baseline.json` / `LEDGER.md` with the era-6 chain, F-SSL-1's un-rooting, the halo denominator 1,401.
