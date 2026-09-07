# Review: story-correctives-batch — the bosses answer their own acts, the eleven silent portraits speak, Chalk is canon (scratch worktree, Claude Opus 5 implementer, attended drain 2026-09-07 morning)

**Slice/branch/tip:** `story-correctives-batch` · `feat/story-correctives-batch` · commit `fdf33cff6` on base `e6c52b296` · merged to main: see the ledger row (first-parent merge; collisions `src/story/beats.ts` (one comment block: the engine merge's F-SS06-2 note kept, its cited range re-based) and the ledger; 22 in-file beat citations re-derived on the merged file by the drain, 7 of them moved by the engine merge's eleven-line note in E5).
**Verdict:** MERGED. Owner rulings, verbatim: "fix these story parts please" (2026-09-06) and "yes, lets do 1, 2, and 3" (2026-09-07, part 2). Eighteen new beats, every one appended at the END of its chapter table and every one citing the storybook line it draws from. THE BOSS ACTS (7): every act the three boss systems report now reaches exactly one beat: the Claw's `paperwork`, `crown`, `winch`, `anchor-feet` (E8, `STORYBOOK.md:505-508`, spoken by the clerk, the Prospector, the suit-fitter and the tavernkeeper), the Digger's `boarding` and `swap` (E9, `:563-564`, the Prospector and the canal-reeve), the Quiet's `approach` (E10, `:612`, the Prospector). THE SILENT FACES (11): all eleven speak, none left silent: `e2-tavern-welcome`, `e2-boiler-fed-line`, `e2-press-first-run` (Wei), `e2-held-galley` (Lan's own line `:85` verbatim: "It will keep. Truth keeps better than fear."), `e3-lantern-walk-home` (preacher-e3, the one assignment resting on the file's convention rather than a named appearance, stated), `e5-cannery-hand-paper-boat`, `e5-shipwright-drydock`, `e5-pearl-diver-ladder`, `e8-he3-assay-opens`, `e10-heir-always-said-so`, `e10-charter-keeper-first-charter`; triggers are existing era signals only. The Boilerwright speaks to her trade and never to the wedding, so neither the plate (a woman) nor `:91`'s pairing is contradicted. CHALK: `STORYBOOK.md:421` PROPOSAL → CANON with the date, ruling #13 and the wiki line (F-SS08-2); the drain corrected the second tag at `:466` the firewall had excluded (F-STC-2).

## Evidence
| Gate | Where | Result |
|---|---|---|
| Specs | worktree, port 5303, both projects | the six touched chapter specs 58/58 on the committed tree (21.3 m), each boss act proved act by act (ss-09 four, ss-10 three, ss-11 two); 14 plain-boot 390 px screenshots inside the town (`reviews/shots-story-correctives-batch/`) |
| Guards | worktree | tsc clean; build green; `no-emdash-guard` (289 src TS); `no-emdash-scan-space-guard` 8/8 |
| Citations | worktree | 31 in-file coordinates the appends pushed down re-derived by locating each symbol, verified 36/36 exact; the record appended below every coordinate it describes |
| Engine era | worktree hash `cd7617b8…` | re-measured on the merged tree (`54263985`, main had moved) and pinned by the drain (story presentation only) |
| Attended on the merged tree | see the drain commit and the ledger row | tsc clean; era-5 pin `54263985` 5/5; build green; `no-emdash` ×2 + `law-pointer` 31/31; e2e `ss-03` + `ss-04` + `ss-06` + `ss-09` + `ss-10` + `ss-11` on both projects (counts in the ledger row) |

## Merge classification
Base `e6c52b296`; main moved by the engine merge (`beats.ts`: the E5 post-run beats' `when` and an eleven-line note) and the aging merge before it. `src/story/beats.ts`: LANE-TOUCHED and MAIN-MOVED (one comment conflict resolved; citations re-derived). `lore/STORYBOOK.md`, the six chapter specs: LANE-TOUCHED. `reviews/shots-story-correctives-batch/*`: NEW. `tasks/BACKLOG.md`: unioned.

## Findings
- **F-STC-1 (master correction):** the master said "the Claw (E5)"; the Salvage King's Claw is E8's boss (`STORYBOOK.md:504-508`, `Game.ts:1112`); its acts landed in the E8 table.
- **F-STC-2 (cured by the drain):** the second Chalk tag at `STORYBOOK.md:466`.
- **F-STC-3 (fire-authorable):** thirteen registered speakers outside the eleven still carry no beat: `kitchen-chemist-e6`, `appliance-wrangler-e6`, `diner-carhop-e6`, `depot-clerk-e6`, `playbook-librarian-e7`, `drone-keeper-e7`, `tape-courier-e7`, `combine-defector-e7`, `launch-master-e8`, `dome-gardener-e8`, `moon-born-child-e8`, `ice-quarry-chief-e9`, `weather-warden-e9`.
- **F-STC-4:** `preacher-e3` rests on convention, not a named appearance (line cited, reasoning in-file).
- **F-STC-5:** the Quiet's Act 0 (fading portrait) and Act 1 (squalls) still have no state in any system; `e10-portrait-fades` / `e10-unraveled-board` stay on the return chain.
