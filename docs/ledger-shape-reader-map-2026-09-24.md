# Reader map for the ledger split and the evidence offload (owner rulings 13a and 14a, 2026-09-24)

Measured on `main` at `cdfca600c` by an attended-spawned Opus reader on 2026-09-24; every access pattern below is quoted from source. This is the READ FIRST for `tasks/ledger-shape-1.md` and `tasks/evidence-offload-1.md`. Line numbers rot; verify by the quoted code, never the coordinate.

## 0. Corpus facts (the premises, re-checked)
| Premise | Measured |
| --- | --- |
| STATUS.md 20.5 MB / 4,408 lines | 20,496,878 B / 4,409 lines; 3,179 `(line-1 archive)` bullets + 18 `s9<letter>` law bullets |
| BACKLOG title "about line 2896" | the first `# ` H1 is line 2915 (`# Task backlog — the refill ladder (COMPLETE work ledger)`) |
| artifacts 7.4 GB | 8.1 GB, 26,175 files, 26,163 tracked |
| STATUS archive bytes by month | 2026-07 4.72 MB · 2026-08 8.67 MB · 2026-09 5.62 MB · 175 unstamped bullets 0.52 MB · other lines 0.54 MB |

Only three live scripts carry the archive-bullet regex `line-1 archive`: `status-line1.mjs`, `status-archive-audit.mjs`, `desk-carryforward-guard.mjs`.

## A1. STATUS.md line 1 (every reader INDIFFERENT to a rotation of the bullets)
`dashboard-gen.sh` (`LOCK=$(head -1 STATUS.md | cut -c1-300 | esc)`), `health-watch.sh` (`head -c 120 STATUS.md`; `l1="$(head -1 STATUS.md)"`; `find STATUS.md -mmin +50`), `fire-runner.sh` (`head -1 STATUS.md | grep -qE '^ACTIVE|lock ACTIVE| ACTIVE \(s[0-9]+ fire\)'`), `lane-runner-v3.sh` (`l1=$(head -1 "$ROOT/STATUS.md")`), `lane-usable.mjs` (`split('\n')[0].match(/\(s(\d+) fire\)/)`), `corpus-tree.mjs` (`git show main:STATUS.md`, compares line 1 only), `desk-declaration-guard.mjs` (`deskIds(statusText)` reads `split('\n')[0]`), `desk-birth-guard.mjs` (`const line1 = statusText.split('\n')[0]`), `desk-state-audit.mjs` (final desk segment of line 1), the three launchd plists (thin `/bin/bash <script>` wrappers, `StartInterval`, no `WatchPaths`), `drain/SKILL.md` and `scripts/fire.md` (line 1 first; the `s9*` bullets already retired to `docs/law/status-law-bullets-archive-2026-09-24.md`).

## A2. STATUS.md archive bullets (the rotation's real readers)
| Script | Access pattern | Under the new shape |
| --- | --- | --- |
| `status-archive-audit.mjs` | `headBlob = readFileSync(\`${REPO}/STATUS.md\`,"utf8")`, then `rec.permanent = rec.lostSession === null ? !headBlob.includes(rec.lost) : !new RegExp(\`s${rec.lostSession} [^(]*\\(line-1 archive\`).test(headBlob)`; `process.exit(drops.length === 0 ? 0 : 1)` | WOULD RED. Must scan `STATUS.md` plus `archive/status/*.md` as one `headBlob`. Its per-commit arm (`if (childBlob.includes(before)) continue`) reads historical blobs and is safe. |
| `desk-carryforward-guard.mjs` | `previousDesk()`: `line.match(/^- \*\*s(\d+) handoff \(line-1 archive\)/)`, newest wins; null leads to `'REFUSING — no previous handoff desk could be read'` and `process.exit(2)` | WOULD RED at a month boundary unless a trailing window of bullets stays in STATUS.md, or it also scans `archive/status/*.md`. |
| `status-line1.mjs` (writer) | `const firstArchive = lines.findIndex((line,index) => index > 0 && /^- \*\*.+ \(line-1 archive\):\*\*/.test(line)); lines.splice(firstArchive === -1 ? ARCHIVE_INDEX : firstArchive, 0, …)` with `const ARCHIVE_INDEX = 3` | indifferent while one bullet stays; a fully drained file would splice mid-document. `ARCHIVE_INDEX` should become `2`. |
| `_rotate_status.mjs` | legacy, no caller | leave in place (Retention Law); do not extend. |
| `law-pointer-guard.mjs` | `NOT_SCANNED = new Map([['STATUS.md', 'Its lettered \`s9<letter>\` law bullets ARE live law …']])`; live vs frozen split on `/^- \*\*s\d+[a-z]+\s/` | exit-neutral; the frozen count drops. The 18 `s9<letter>` bullets stay where the reason text says they are. |
| `desk-birth-guard.mjs` | `git log --format=%H\t%s -- STATUS.md` filtered `/^s\d+ handoff/` on the subject | indifferent while handoffs keep touching line 1. |
| 11 hermetic tests | write `STATUS.md` into `mkdtemp` fixtures | indifferent. |

Placement matters: `law-pointer-guard.mjs` scans `<root>/*.md`, `scripts/*.md`, `.claude/skills/*/SKILL.md`. Archives at `archive/status/*.md` are invisible to it; a root-level `STATUS-2026-07.md` would appear as NOT SCANNED with about 1,300 citations and `reason: NONE DECLARED`.

## A3. tasks/BACKLOG.md whole-file readers
| Script | Access pattern | Under a split |
| --- | --- | --- |
| `citation-title-guard.mjs` | corpus `git ls-files tasks` filtered `.md`; offender key `${r.file}::${r.raw}`; `const allowed = baseline[key] || 0` | WOULD RED: 72 of the 74 `tasks/BACKLOG.md::` baseline keys occur only below line 2915. Re-key the baseline mechanically in the split commit; never `--update-baseline` (it regenerates the whole map and would grandfather a genuinely new bare citation). The corpus itself stays covered if the split lives under `tasks/`. |
| `gate-caller-audit.mjs` | `ledger = fs.readFileSync(path.join(ROOT,'tasks/BACKLOG.md'),'utf8')`; `const missing = ids.filter(id => !ledger.includes(id)); if (missing.length === ids.length) unrouted.push(…)` then `process.exit(1)` | WOULD RED: the `npm:test:asset-diet` escalation ids `F-1253-1` (rows 2941/3333/3602/3886) and `F-1251-1` (3802/3893) are all below 2915. Read the split files too, or keep one of those rows above the cut. |
| `desk-declaration-guard.mjs` | `declaredIds()`: first line whose 90-char subject zone carries the id wins | conditional: today's desk resolves to rows 259 (`F-2642-3`) and 202 (`b1-device-verdict-rows`), both at the top. Every declaring row of a current or foreseeable desk item stays. |
| `findings-state-guard.mjs` | scans every line's subject zone; reds only on `double-state` | fail-open narrowing (664 declared / 480 closed / 184 open / 0 double today; 1,236 of 2,497 F-ID rows are below 2915). |
| `blocker-panel-closed-guard.mjs`, `row-quote-currency.mjs` (51 of 69 probed OPEN rows are below 2915, max line 5971), `stale-ready-for-gates-guard.mjs` (124 carriers to 83, no empty-corpus refusal), `ghost-ladder-row-guard.mjs` (29 lead-clipboard rows to 21), `ruling-propagation-guard.mjs` (129 RULED rows to 82), `stale-open-candidates.mjs`, `desk-surface-blindspot-probe.mjs`, `desk-carryforward-guard.mjs` (closure cross-check for dropped ids) | whole-file reads | all fail OPEN: they narrow silently and hide defects. Widen each to `tasks/BACKLOG.md` plus `tasks/backlog/**`. |
| `drain-block-check.mjs` | `backlogMentions()` is advisory context; the SHIPPED verdict comes from `tasks/goals.json` and `tasks/done/` | never reds. |
| `dashboard-gen.sh` | `grep -E 'GATE: ' tasks/BACKLOG.md` (891 rows to 475) and `grep '^OWNER:' tasks/BACKLOG.md` (the single row is below 2915) | widen both greps. |
| `desk-birth-guard.mjs` | `git diff <prev>..HEAD -- tasks/BACKLOG.md` | widen the pathspec to `tasks/BACKLOG.md tasks/backlog`. |
| `master-shipped-classifier.mjs`, `task-guard-audit.mjs` | flat `readdirSync(tasksDir).filter(f => f.endsWith('.md') && f !== 'BACKLOG.md')` | SAFE only for a SUBDIRECTORY (`tasks/backlog/`, the entry `backlog` fails `.endsWith('.md')`). A flat `tasks/BACKLOG-2026-07.md` becomes a phantom master in both. |
| three tests pin historical blobs (`git show 2844a9083…:tasks/BACKLOG.md`, `87649873:`, `b4dea8ae^:`) | immutable | break only under a history rewrite. NEVER split by rewriting history. |
| `finding-id-pattern-guard.test.mjs` positive control | `F-1543-1` row 2725, `F-DOOR-3` row 2738 | both above 2915. |
| `desk-birth-gate-distance-guard.test.mjs` | `rows.length > 500` | 1,448 of 2,771 rows survive above 2915. |
| `author-task/SKILL.md` line 6 | "corroborate with a grep of `tasks/BACKLOG.md`" | the law text gains `tasks/backlog/**`. |
| 107 `scripts/tmp-*` and `scripts/_s*` one-shots | various | no caller anywhere; retained history, never re-run. |

## A4. artifacts/** in three classes
Class 1, READ BY A TEST OR THE BUILD (must stay in the tree or be mirrored back before any gate; about 480 MB of 8.1 GB): `asset-diet` (`first-town-request-families.test.mjs`, `first-town-payload.mjs`), `sol/mp-balance-harness` (an `import … with { type: 'json' }` in an e2e spec, tsc-load-bearing), `shared-atlas-dedupe` (35 MB, an e2e spec imports `/artifacts/shared-atlas-dedupe/browser-harness.ts` at runtime through vite, tsc-load-bearing), `board-tape-gold`, `browser-door-held-gold`, `e5-stillwater` (holds the executable `prover.mjs`), `f1450-4` (holds two executables the halo checks run), `hero-move-verb`, `e5-regatta-boat{,-02,-03}`, `f2135-canyon-census`, `rider-parity-grammar`, `beauty-far-ground`, `assay-e2e-20260822`, `gauntlet-heat2-20260824`, `gauntlet-heat5-20260824`, `gauntlet-heat5b-20260825`, `gauntlet-heat6-20260825`, `gauntlet-heat6-guests-r2-20260825`, `gauntlet-heat7-20260830`, `gauntlet-heat11-20260903` (129 MB), `gauntlet-heat12-20260905` (56 MB), `gauntlet-heat15-cd24d12d`, `claude-debut-20260831`, `claude-debut-20260901`, and exactly three files under `sol/map-art-campaign-2` (`run-6/<map>/capture-config.json`, `run-8/phone-hud/before.json`, `run-8/phone-hud/after.json`, read by `phone-hud-entry-census.mjs` and its test). `artifacts/ledger-backups/` is a write target that must stay creatable. `e3-moth-season` is read only under `GR_REFRESH_EVIDENCE=1`.
Class 2, WRITE TARGETS (must remain writable): `agent-seat-room.mjs`, `beauty-board.mjs`, `beauty-far-ground.mjs`, `campaign-map-dossier.mjs`, `check-crawler-presentation.mjs`, `f2135-canyon-census-player.mjs`, `f2135-canyon-epoch3-checkpoint.mjs`, the `review-*.mjs` family, `rounded-scale-halo-cure.mjs`, `stream-capture.mjs`, `stream-showcase.mjs`, `test-accounts.mjs`, `test-multiplayer.mjs`, `e2e/045-megaproject.spec.ts`, and `author-task/SKILL.md`'s "the report under `artifacts/<id>/report.md`".
Class 3, CITED ONLY (may move behind an index): everything else, above all `sol/map-art-campaign-2` less its three files (5,628 MB / 10,339 files), `map-art-inventory-20260908` (330 MB), `gauntlet-heat14-e3949bfa` (169 MB), `needs-cells-art-batch` (151 MB), `perf-survey` (137 MB), `gauntlet-heat13-569a41f9` (102 MB), `boss-fidelity` (94 MB), `heat13` (74 MB), `landmark-lighting-calibration` (70 MB), `post-open-maps-correctives` (64 MB) and the long tail. `reviews/*.md` carry 1,744 `artifacts/…` citations across 522 subtrees.
One law-text exception: `.claude/skills/drain/SKILL.md` names `artifacts/sol/map-art-campaign-2/report.md` as a shared campaign document resolved by key with `md-3way.cjs`; it stays, or the law is re-pointed.

## A5. The evidence audits
| Script | Access pattern | Under an offload |
| --- | --- | --- |
| `review-evidence-audit.mjs` | `EVIDENCE_PREFIXES = ['artifacts','reviews/shots-']`; tracked → `TRACKED`, present-but-untracked → `ON-DISK-UNTRACKED`, else `ABSENT`; `if (args.strict && result.buckets['ON-DISK-UNTRACKED'].length) process.exitCode = 1`. Live `--all`: paths 1200, citations 2123, TRACKED 911, ON-DISK-UNTRACKED 4, ABSENT 652, SKIPPED 556 | needs an `ARCHIVED` bucket resolved against the index. Moving out of git but leaving files on disk flips 911 citations to `ON-DISK-UNTRACKED` and `--strict` reds on every drain (`drain/SKILL.md` §4 runs it); moving out of git and disk without an index flips them to `ABSENT` and the instrument goes blind. Move out of git AND disk in ONE step, with the index. |
| `modified-tracked-evidence-census.mjs` | `EVIDENCE_PREFIXES = ['artifacts/','reviews/','tasks/runs/','logs/runs-archive/']`; buckets `AT RISK / SAFE / LOCAL-REF-ONLY / UNREFERENCED` by presence on refs | must learn the archive remote, or 26,163 files read AT RISK / UNREFERENCED. |
| `deploy.sh` `MIRROR_FILTERS`, `deploy-mirror-allowlist.test.mjs` | no `artifacts` include; the closure roots at `scripts/assay-worker.mjs`, `scripts/assay-replay.mjs`, `src/main.ts`, `vite.config.ts` plus `ENGINE_SOURCE_INPUTS` | indifferent. |
| `assay-replay-agent.mjs` `ENGINE_SOURCE_INPUTS` | `['scripts/assay-replay-agent.mjs','assets/contracts','assets/crafting-queue/contract.v1.json','assets/crafting-queue/approved','assets/layer-contracts','assets/pilots/map-rebuild-spike','src']` | no `artifacts/` path: the offload cannot move the engine hash; no re-assay, no era pin. |
| `.claude/settings.json` | `permissions.allow` carries bare Read/Glob/Grep/Edit/Write | writing `archive/status/**` and `tasks/backlog/**` needs no new grant. |
| `ops/` | only the game's assay DB path | zero STATUS/BACKLOG/artifacts references. |

## 1. The shortest safe plan for STATUS (two scripts change, one new tool; the writer does not change)
1. New `scripts/status-rotate-month.mjs`: move every `- **s<N> … (line-1 archive):**` bullet whose stamp month is CLOSED into `archive/status/<YYYY-MM>.md` (newest first), keeping line 1, the 18 `s9<letter>` law bullets, the current month, and ALWAYS a trailing window of the newest 40 bullets (about 0.6 MB) so a month boundary never leaves the carry-forward guard without a predecessor. The 175 unstamped bullets are keyed by `s<N>` against their neighbours, never by a guessed date.
2. `status-archive-audit.mjs`: the `headBlob` becomes STATUS.md plus every `archive/status/*.md`, joined; the always-printed declaration names both corpora; the "unreadable on disk" refusal names both. The per-commit arm stays as it is. Baseline before: `--limit 40 --quiet` prints `CLEAN … 0 drops, 0 transient, 39 same-session rewrites excluded, of 40 replacements across 40 STATUS.md commits`, rc 0.
3. `desk-carryforward-guard.mjs` `previousDesk()` falls through to `archive/status/*.md` when STATUS.md yields no handoff bullet with a desk (optional with the trailing window; four lines; removes the exit(2) cliff).
4. `scripts/fire.md`'s handoff line ("Move the previous line 1 to a `- **s<N-1> handoff (line-1 archive):** …` bullet") gains one clause naming `archive/status/` as where closed months live.
5. `status-line1.mjs` `ARCHIVE_INDEX` 3 to 2.
Result: STATUS.md 20.5 MB to about 6.7 MB immediately, bounded thereafter.

## 2. The shortest safe plan for BACKLOG
A SUBDIRECTORY, `tasks/backlog/<key>.md`, never flat siblings; never a history rewrite. Split by STATE, not position: move only rows whose subject zone leads with a closed mark (✅, struck, `~~`); keep every open, desk, gate and RULED row in `tasks/BACKLOG.md` regardless of age. That keeps the 51 below-the-title OPEN rows, the `^OWNER:` row and every first-key declaration in place, and reduces the required code change to two scripts: the citation baseline re-key (mechanical, same commit, no `--update-baseline`) and `gate-caller-audit.mjs` reading the split files. Widen the fail-open readers and the two dashboard greps and the desk-birth pathspec in the same commit; the law text in `author-task/SKILL.md` gains `tasks/backlog/**`.

## 3. Evidence: must stay vs may move
MUST STAY: the Class 1 list above (about 480 MB) plus Class 2 write paths creatable. MAY MOVE behind an index: everything else (about 7.6 GB). Move out of git AND disk in one step; teach `review-evidence-audit.mjs` and `modified-tracked-evidence-census.mjs` an `ARCHIVED` verdict against the index; keep `artifacts/sol/map-art-campaign-2/report.md`.

UNVERIFIED by the reader: the exact month-boundary red window of `status-archive-audit` (the code path was read, the failing pair not manufactured); whether any of the 266 e2e files that write into `artifacts/` also reads a fixture through a `page.goto('/artifacts/…')` form beyond the `shared-atlas-dedupe` dynamic import (the reader filtered on import/readFileSync/existsSync/readdirSync/statSync and found the three readers above).
