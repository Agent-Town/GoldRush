# Drain review — `rulings-county-2026-09-19`: five of the six county and factory rulings executed, the sixth corrected at source (attended drain, 2026-09-19)

**Slice/branch/tip:** `fix/rulings-county-2026-09-19` @ `a29848f34 (archive: pruned by the A3 rewrite)` — eight commits by a Claude Opus 5 implementer on the owner's Anthropic subscription in a scratch worktree cut from main `797052233`; master `tasks/rulings-county-2026-09-19.md`; report `artifacts/rulings-county-2026-09-19/report.md`. **Merged as** `8dd8c64ac`, null floors re-recorded, era-6 pin appended (`src/town/worldDispatches.ts` is in the engine corpus), fast-forwarded.
**Owner words, verbatim (2026-09-19):** "I agree with all your recommendations on the decisions - good work".

## VERDICT: LANDED — the county's hour is a real hour with a cap of 60, the landing page derives its rotation, the public copy says five, the codex-shim gate no longer spends the owner's Codex allowance per drain, M8-5 is keyed to a secure; F-HYG-10 was a mis-transcription in the register and is corrected here, not executed

| ruling | what landed | measured |
|---|---|---|
| F-HEAT14-7 | `functions/api/_ratelimit.ts`: `bumpCounter` stores the window start and arms the REMAINDER; `MAX_REQUESTS_PER_ANON` 30 → 60 (`standings.ts`); the six doors' signatures, limits and refusal order byte-identical, only the fixed window inherited (more permissive) | `scripts/ratelimit-window.test.mjs` 4/6 red on the base → 6/6 (the "real hour" arm runs the pre-cure body as a control and it still refuses) |
| F-2568-2 | `CURRENT_ROTATION_ID` deleted; `site/assay-office.js` derives the ISO-week id and walks back a week per 400, stops on any other refusal; `skillmd-guard`'s pin retired with an epitaph; `scripts/fire.md`'s RT-01 weekly step retired in place; five law pointers re-based by measurement (baseline diff = those five) | `scripts/landing-rotation-derivation.test.mjs` 0/6 → 6/6 |
| F-2270-3 | `site/index.html` and `marketing/outbox/launch-facts-vE1.md`: Six → Five frontier contracts (THREAD.md already said five; THREAD-v2's "six boards" is the roster, permitted; dated digests untouched) | two lines |
| F-2272-1 | the codex-shim gate split: five pure arms rooted in `test:ledger-guards`, three live arms in `server/codex-shim/serve.live.test.mjs` behind `GR_CODEX_LIVE=1` + `hasCodexAuth()`; no live arm run; `gate-caller-baseline.json` entries hand-written, 0 TODOs, audit PASS | — |
| F-E8LO-3 | `src/town/worldDispatches.ts`: `M8-5` `boss` → `contract` (Low Orbit secured); `bossKind` measured on seven contracts, Low Orbit not among them; both kinds resolve to the same predicate | `scripts/world-dispatch-boss-trigger-guard.test.mjs` 1/3 on the base → 3/3 |
| F-HYG-10 | **PARKED — F-RUL-1:** the register mis-transcribed the finding. At source (`reviews/hygiene-battery-lossless-triangles.md`, the hygiene report §209/§340) the 227 are shipped ART CELLS in 19 families that do not reproduce from their source PNGs (the F-1464-1 class, `master-divergent.json`, `--verify-downscale`), subject `assets/**` — not task masters. The task-guard audit's own predicate, re-run: 1,362 masters, 199 never ran, 103 without a guard header, ALL 103 carry a goal leaf — the invisible set is 0 and the audit is already green. A blind pass would have bannered five `building` masters including this one. | 0 masters bannered |

## Gate table
| gate | implementer (branch) | drain (merged tree) |
|---|---|---|
| tsc / build | clean / rc=0 | 0 / 0 |
| `test:accounts` / `test:mp` / `test:stats` | 43+43 / 466 / 87·320·320 | test:accounts rc=0 · test:mp rc=0 · test:stats rc=0 |
| the three new guards + `skillmd-guard` 16/16 + `law-pointer` PASS + `gate-callers` PASS | green | ℹ pass 98 ℹ fail 0 |
| e2e `transfer-board.spec.ts` | every rotation/generalization assertion passes both projects; its trailing `expect(errors).toEqual([])` fails identically with the base file restored (a `./standing-rule.js` console error under `about:blank`) — base red | reused |
| null floors | — | 83 of 83 null floors match assets/contracts/null-floors.json |
| engine era | hash rotated by `worldDispatches.ts`; attributed by revert-run-reapply; the pin is the drain's (F-RUL-2) | pin `9e54f4a3…`, guards ℹ pass 9 ℹ fail 0 |
| full `test:node-guards` | 843 / 806 pass / 30 fail: 2 mine (the pin, cured here) + 1 echo; 22 `ERR_MODULE_NOT_FOUND` while the primary's `node_modules` was being re-installed under the symlink (the vite 8.3.0 landing, 22:20 local) — 32/32 green re-run; 4 load reds 15/15 green together; 2 `gr-sim` timeouts green alone | ℹ tests 929 ℹ pass 921 ℹ fail 3 ℹ skipped 5 — reds in artifacts/rulings-county-2026-09-19/attended-gates-summary.txt (contention and the sweep's echo unless named) |

## Findings
- **F-RUL-1 (register defect, cured here):** F-HYG-10's register entry described task masters; the finding is about 227 shipped art cells whose source PNGs no longer reproduce them. The register now reads the source; the ruling "banner as archive" does not apply to a cell — the item returns to the factory as the F-1464-1 class (fire-authorable: re-derive or record by design, subject `assets/**`).
- **F-RUL-2 (drain):** the engine hash rotated on a data edit in `src/town/`; pinned same-era here (the door refuses on `meta.era`, accepts any hash in `pins`, so an append keeps every stored reel playing).
- **F-RUL-3 (factory, from the run):** a `node_modules` re-install in the primary checkout mid-battery reddens every symlinked worktree's battery with `ERR_MODULE_NOT_FOUND`; sequence installs between batteries (the vite landing did wait for the strips job, not for this one).
- **F-RUL-4 (shim):** the codex-shim's `client abort` arm shells out to `pgrep -f` internally (read-only, unique marker); noted against the pattern-kill law for whoever touches that file next.

## What was touched
`functions/api/_ratelimit.ts`, `functions/api/standings.ts`, `site/assay-office.js`, `site/index.html`, `marketing/outbox/launch-facts-vE1.md`, `server/codex-shim/serve.test.mjs` + `serve.live.test.mjs` (new), `src/town/worldDispatches.ts`, `scripts/{ratelimit-window,landing-rotation-derivation,world-dispatch-boss-trigger-guard}.test.mjs` (new), `scripts/skillmd-guard.test.mjs`, `scripts/fire.md` (one duty line), `scripts/law-pointer-baseline.json`, `scripts/gate-caller-baseline.json`, `package.json`, `artifacts/rulings-county-2026-09-19/**`; at the drain `assets/engine-era.json`, the null-floor anchors, this review, `tasks/goals.json`, `tasks/BACKLOG.md`, `STATUS.md`, the desk register (F-HYG-10 corrected).
