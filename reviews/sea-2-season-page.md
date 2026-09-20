# Review — SEA-2: the Season Page

- **Slice**: `sea-2-season-page` (task master `tasks/done/20260810-195615-lane-b-sea-2-season-page.md`, FIRE-AUTHORED s1637)
- **Branch / tip**: `lane/b` @ `bf77b1c44dc3f45d38c65869f006a15d7119427f`
- **Base**: `1f0dc8423e7d8f46cf0d26a8ce768834be700bf3`
- **Merge**: `68171076a58a5a26b73ae17e6ca0e67060e828c7` (s1639, `--no-ff`, one act)
- **Gated in**: detached worktree `gate-s1639` (§3.0b), scratch, `node_modules` symlinked
- **Verdict**: ✅ **MERGE**

## What it does

SEA-1 gave the county a season and nobody could see it. SEA-2 closes exactly that gap:
the season label now crosses the type boundary into `src/encyclopedia/reader.ts`, and a
**Seasons** view joins the Field Book's existing view-switcher family. The list is built
from `SEASONS` and nothing else; a season page renders all four of spec Law 3's owed
sections — *What happened* (registry `summary` + era stamps), *Results* (the county's rows
for that season, grouped by Mind and by Rig), and *Commentary* / *What we learned* as
honest county-voice "not yet written" states, because that text is SEA-3's content and this
slice builds the shelf rather than the book.

An open-ended season reads to a player as **"Since August 6, 2026 — still riding"** —
never a blank and never `null`. A season with no rows says so in county voice, and — the
part that is easy to get wrong — an *unavailable* results book says something different
again, so a network failure can never masquerade as an empty season.

Plain-boot click path (no `?debug`, no query flags — Mistake #10): **start menu → Claim
Ledger → Seasons → The Founding Season.** The spec asserts `new URL(page.url()).search === ''`,
so the reachability claim is structural rather than narrated.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (rc=0) |
| `npm run build` | green, built in 2.19s |
| `e2e/sea-2-season-page.spec.ts` | **6/6** desktop + 390px mobile |
| `e2e/field-book.spec.ts` (**the load-bearing negative — UNCHANGED**) | **8/8** desktop + 390px |
| Adjacent: `lb-01-county-standings`, `en-01-claim-ledger`, `wd03-ledger`, `en-03-epoch-pages` | **28/28** desktop + 390px |
| Plain boot `_s106-prospector-boot-probe`, `f1297-2-plain-boot-tape-button` | **4/4**, zero console/page errors |
| `claimed-spec-harness-guard` | OK, 0 live offenders (1268-file corpus) |
| `whole-suite-collection.test.mjs` | 1 pass / 0 fail — the new spec is collectible |
| Playwright workers | `--workers=1` on every run (§3.1) |
| Screenshots | `reviews/shots-sea-2/{list,page}-{desktop,mobile}-chrome.png` (4, in the merge) |

**Adjacent set was DERIVED, not inherited.** The master's own list names `field-book`; that
is scoped to the defect. This cure also widens two runtime validators (`isFieldBookCell`,
`isCountyStanding`), so the suites that actually exercise those row shapes had to be added:
`lb-01-county-standings` (SEA-1's spec, the standings row) plus the three specs that import
the reader module (`grep -rln "encyclopedia/reader" e2e/`).

`npm run test:node-guards` was **not** run and this is deliberate, not an omission: F-1460-1
keys that duty on a diff touching `src/sim/`, `src/systems/` or `src/entities/`, and this
diff touches none of them — its two source files are `src/encyclopedia/reader.{ts,css}`. No
node guard reads the encyclopedia reader (verified by grep over `scripts/*.mjs`).

## Proofs I hold rather than inherited

**Law 5 (removability) — proven by MANUFACTURING the defect.** The runner reported
"flag-off proof: 2/2"; a green somebody else ran is not evidence about the red. Flipping
`SEASONS_ENABLED` at `src/encyclopedia/reader.ts:145` to `false` reds **all 6** SEA-2 tests
(the `claim-ledger-seasons` tab does not exist to click) while `field-book` stays **8/8** —
which is the exact shape the owner's *"if users don't like we can later remove it"* asks
for: **pages hidden, DATA untouched.** Reverted byte-identical, blob
`78b87a44ae85154dbf8dfd10ed1101f89f2133cd` — the same hash as the lane's, so the restoration
is corroborated by the merge itself. The flag has three sites and the other two are the
reason it is genuinely one line: `:219` walks a player whose persisted view was `seasons`
back to the ledger, and `:294` renders the tab.

**Reuse (scope 4b, "do not fork it") — proven structurally.** `renderFieldBookCell` has
**one** definition (`:672`) and **two** call sites: the new season matrix (`:515`) and the
existing Minds/Rigs view (`:651`). Same code path, not a copy.

**No hardcoded season (scope 3).** The list's length is asserted as `SEASONS.length`, and
the only `season` string literal in the reader is a type-level `Omit`. `src/seasons/registry.ts`
is byte-untouched (`git diff main lane/b -- src/seasons/registry.ts` empty), so the master's
"you may NOT add a season or give Season 2 a start date" held without needing to be enforced.

**Scope 5 both ways.** A seasoned row appears under its season; a legacy row with no `season`
key is absent from the season's results (`season-results-board` `not.toContainText('Legacy Rider')`)
and still present in County Standings (`county-standings-row-2`).

## Merge classification

Base `1f0dc842`, 7 paths, **ALL LANE-ONLY**, `DUPLICATE 0 · MAIN-ONLY 0 · BOTH-MOVED 0`.

| Path | Class |
|---|---|
| `src/encyclopedia/reader.ts` | LANE-ONLY (`base=9b9837d8 lane=78b87a44 main=9b9837d8`) |
| `src/encyclopedia/reader.css` | LANE-ONLY (`base=d9e4f9de lane=ee95640c main=d9e4f9de`) |
| `e2e/sea-2-season-page.spec.ts` | LANE-ONLY (new) |
| `reviews/shots-sea-2/*.png` ×4 | LANE-ONLY (new) |

**No graft was needed and that is a measured fact, not an assumption:** for both source
files `main` blob == `base` blob, i.e. main never moved either file while the lane held it.
The gate tree was built as main + the lane's blobs and each of the 7 was hash-compared
against `lane/b:<path>` before a single test ran. Post-merge `main..lane/b` is **empty**.

Firewall clean: no `functions/**`, no `src/sim/**`, `src/agent/**` or `public/skill.md`
(lanes c and d hold undrained commits on those — the master forbade them precisely to avoid
a pile), no `e2e/field-book.spec.ts` edit, no `package.json`, no `scripts/same-game-audit.mjs`.

## Findings

**🔵 F-1639-1 — the grouped API keeps ONE cell per group×contract, so a second season's page
will under-report. NON-BLOCKING; vacuous today; GATED on Season 2 getting a start date.**
The runner reported this honestly as "the grouped API loses cross-season cells", and I
verified it in code rather than taking it: `functions/api/standings.ts:324` guards cell
creation with `if (!group.contracts.has(contractId))`, so the first row wins and the cell
carries **only that row's** season. The reader then filters cells with `cell.season === season`
and drops a row whose cells all fall away. Consequence the day Season 2 opens: a Mind whose
best ride on a contract was in Season 1 has **no** cell for Season 2, so it vanishes from
Season 2's page — and if that empties the page, the honest-empty message *"No rides were
posted for this season"* becomes a **false statement**, which is the sharp edge. It cannot
be fixed here: the cure lives in `functions/**`, which this master firewalled by name
("if you find yourself wanting a new field, you are solving it in the wrong place"), and
the fix is a per-season cell projection, i.e. a SEA-1 follow-up or SEA-4 scope.
**GATE: before any season is given a `startsAt` that makes two seasons live simultaneously.**

**🔵 F-1639-2 — a MISSING KV binding presents as an honest-looking empty county; a
per-contract throw does not. NON-BLOCKING, PRE-DATES SEA-2, recorded for accuracy.**
The runner's second claim was that the API "masks per-contract KV failures". Half true, and
the half matters: at `functions/api/standings.ts:171` an absent binding yields
`kv ? await readBoard(...) : []` for every contract and the response is `ok: true` with zero
rows — indistinguishable from a genuinely empty county. But a `readBoard` **throw** rejects
the `Promise.all` and surfaces as a 500 *"The county book is unavailable"* through the outer
catch, so real per-contract failures are not swallowed. Neither behaviour is introduced by
this slice; SEA-2's client already separates *unavailable* from *empty* on its own side.

## Where the player sees this, in a plain boot

Start menu → **Claim Ledger** → **Seasons** tab → **The Founding Season**. Asserted with
no debug flag and an empty query string, desktop and 390px, in the merged tree.
