# fix-e5-dredge-queen-headless-socket — attempt 3 admission hold

- **Task:** `tasks/fix-e5-dredge-queen-headless-socket.md`
- **Done-move:** `tasks/done/20260815-201349-fix-e5-dredge-queen-headless-socket.md`
- **Candidate:** `save/fix-e5-dredge-queen-headless-socket-s1815-admission-hold` at `4429ea26bbefedbc3b997f450cf9f5919d0cc188`
- **Gated by:** s1815

## VERDICT: HOLD — NOT MERGED

> ⚠️ **SUPERSEDED s2078 (2026-08-20) — THE HOLD IS DISCHARGED AND THE CANDIDATE LANDED.** The admission surfaces this verdict was waiting on were completed by the attended E5-admission drain: candidate `4429ea26` reached main at **`26a364bfee4907fac6f1a96449e93adabf1dce61`**, verified BY ANCESTRY (`git merge-base --is-ancestor 26a364bfee4907fac6f1a96449e93adabf1dce61 main` → rc=0, s2078), which re-admitted `e5-deepwater-claim` (`CONTRACT_ADMISSION_EXEMPTIONS` 8 → 7) and re-asserted the census/skill/floors/audit surfaces this task's firewall correctly forbade its runner from editing. Landing review: `reviews/e5-admission-completion.md`. **The HOLD verdict above is kept VERBATIM under the retention law — it was correct when written and is simply no longer current; it must not be edited or deleted.**

Attempt 3 closes the sim defects from F-1783-1..3. The headless Prospector uses the public Deepwater verbs to reach and defeat the Dredge Queen, the socket carries the authored escort multiplier, and the early-defeat path matches the browser. Both bench seeds secure deterministically at wave 12.

The slice is still not `READY-FOR-GATES`: required E5 census/full-node admission checks assert the old exempt shape from surfaces outside the task firewall. The runner correctly stopped instead of editing unrelated e2e/public-skill/manifest assertions. No candidate path entered main history.

## Evidence

| Check | Result |
| --- | --- |
| Policy | `drain-block-check --strict`: inherited `gate-side` hold; readiness remained red |
| Candidate custody | six task paths preserved on the save branch; main restored |
| Seed 01 | secure, wave 12, `fnv1a32:c03e0d02`; same-seed runs byte-identical |
| Seed 02 | secure, wave 12, `fnv1a32:2925026b`; same-seed runs byte-identical |
| Idle proof | lawful unsecured terminal at existing headless ceiling, wave 18 / 416000 ms |
| TypeScript / build | pass / pass |
| Focused guards, null floors, same-game audit | pass |
| Plain boot desktop + 390px | pass; zero captured console/page errors |
| Required E5 census / full Node admission | red on stale no-E5-seeds/exemption expectations and stale `public/skill.md` / MechanicsManifest rows outside the firewall |

## Finding

### F-1815-2 — BLOCKING: admission assertions still encode the retired exemption

The sim proof and generated admission artifacts now describe an admitted E5, but the wider census/public contract still asserts that E5 has no bench seeds and remains exempt. Those files were not authorized by the task, so changing them drain-side would turn a scoped sim fix into an unreviewed public-contract migration.

The smallest lawful successor is an attended assertion/public-surface re-scope, followed by a detached re-land of this saved candidate and the complete E5/full-node gate. E6 remains held because it shares `HeadlessContractSim`.

## Historical closure

The earlier `save/fix-e5-dredge-queen-headless-socket-s1783-hold` remains evidence for F-1783-1..3. Attempt 3 demonstrates those three findings are closed in the candidate; only F-1815-2 prevents admission.
