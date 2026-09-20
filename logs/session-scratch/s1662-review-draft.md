# f1660-1 — restore the F-E2S-3 de-list as a cited exemption, and assert both directions of the AP-16 mode rule

**Slice:** `f1660-1-door-readmission-repair` · **Branch:** `lane/b` @ `a923f241d` (runner commit) · **Base:** `b458dba15`
**Merged to main:** `<MERGE_HASH>` · **Drained by:** s1662 fire, 2026-08-11
**Master:** `tasks/f1660-1-door-readmission-repair.md` (authored + dispatched s1660) · **Goal leaf:** `f1660-1-door-readmission-repair`

## VERDICT: MERGED — scope executed exactly as authored; one firewall-blocked residue cured in this drain, two non-blocking findings filed.

## What it does

An owner ruling that shipped on 2026-08-09 had been silently reversed on main for ~15 hours. F-E2S-3
(*"de-list now, socket later"*) removed `e2-hill-mine`, `e2-trestle` and `e2-incline` from the AP-07 headless
door; `f1605-1` landed it at `88530e3ef`. Then `48a0d41ab` replaced the hand-maintained `SUPPORTED_CONTRACTS`
literal with a derivation over a new `CONTRACT_ADMISSION_EXEMPTIONS` table, carried the E5/E6 refusals and
`e3-fairground` across as cited entries, and **did not carry the three railcars** — so the derivation swept them
back in. The prior policy had lived in a **code comment inside the literal**, and a comment does not survive a
derivation.

This slice restores the three as **cited exemptions** (`citation: F-E2S-3`), restores the three
`e2e/er01-e2-census.spec.ts` refusal arms that `48a0d41ab` had inverted into admission assertions, re-derives the
`public/skill.md` public door fence (22 → 19), regenerates `docs/bench/same-game-audit.md`, and adds the durable
half: a registry-derived assertion that **every mode-declaring contract is refused modelessly and admitted with
its declared mode**, plus a **baseline ratchet** (`scripts/door-admission-baseline.json` +
`scripts/door-admission-ratchet.test.mjs`, rooted in `test:node-guards`).

It does **not** revert AP-16-4, does not touch the constructor gate, and does not build the still-owed
pressure-to-damage socket half.

## Evidence (measured on the MERGED tree, in a detached worktree — §3.0b)

Gate worktree `gate-s1662b` @ `207cbb2f3` (`git merge --no-ff lane/b`, **ort, zero conflicts**, 8 files
+1149/−1075). Undecided content never entered main's working tree or index.

🔑 **The control that makes the rest of this table readable.** `git diff --name-only lane/b <merged>` returns
**exactly 11 paths, every one of them bookkeeping** — `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, the
master file, and 7 `logs/session-scratch/*`. **Zero source, test, script, asset or config bytes differ**, because
main's 10 commits since the merge base are all s1660/s1661 ledger work. So the merged tree and the tree the runner
tested are the same artifact for every executable byte, and my re-runs below are a **control on the runner's
headline**, not a substitute for it.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc=0 (41.0s) |
| `npm run build` | green, rc=0, **built in 8.76s**, 2186 modules (106.7s wall under load) |
| `er01-e2-census` + `ap16-4-contract-admission`, **desktop-chrome**, `--workers=1` | **5 passed** (2.0m), rc=0 |
| same two specs, **mobile-chrome (390px)**, `--workers=1` | **5 passed** (1.6m), rc=0 |
| `scripts/skillmd-guard.test.mjs` | **5 pass / 0 fail**, green **without being edited** (17.8s) |
| `scripts/door-admission-ratchet.test.mjs` (the new guard) | **1 pass** (10.6s) |
| `scripts/null-floor-anchors.test.mjs` | **RED before my fix → GREEN after** (see F-1662-1) |
| `scripts/gr-sim.test.mjs` (the F-1460-1 pin carrier) | <GRSIM> |

### The door probe, run directly rather than inferred — this is the fact the slice exists to restore

```
node scripts/gr-sim.mjs --contract=e2-hill-mine --seed=e2-hill-mine-01 --policy=idle
  → rc=1  Error: AP-07 supports only … received e2-hill-mine.
    (the derived door named in that error lists 19 ids; no railcar among them)

node scripts/gr-sim.mjs --contract=e2-hill-mine --seed=e2-hill-mine-01 --policy=idle --mode=escort
  → rc=0  emits goldrush.view.v1 with the "Railhead Escort" objective
```

Both directions of `ap-16-same-game-law.md:33` hold: refused modeless, admitted through its declared mode. On main
today the first command **runs a full contract and emits a view** — that is the defect, and it is gone.

### I re-derived the ratchet's red rather than inheriting the runner's transcript

A new guard is invisible to the battery that ships it, so the runner's red-then-green was re-run here from
scratch: deleting the `e2-incline` exemption block from `src/sim/HeadlessContractSim.ts` takes the ratchet to
**1 fail** (*"Door admission drifted from scripts/door-admission-baseline.json"*); restoring it byte-identically
(`sha256[0:16] = dfcdd833e3ce6363` before and after — the same hash the runner reported) takes it back to
**1 pass**. The baseline's denominator sits in a file the defect does not touch, which is why it bites where a
loop over the exemption table could not.

### Instrument notes (stated so neither reads as a shortcut)

- **Both specs make zero `page.` calls** — they boot their own vite in `middlewareMode` over `process.cwd()`, so
  run from `gate-s1662b` they exercise **the merged tree**, and playwright's `baseURL` is never contacted. They
  were run with `GR_CAPTURE_EXTERNAL_SERVER=1` against a **scratch dev server on 5234** started inside the gate
  worktree, purely so the run would not start a competing vite on 5188 while lane-a was live (Mistake #12). The
  external-server guard classified it `dev` (`/@vite/client` → 200 `text/javascript`), so F-1457-1 is satisfied.
- **`--workers=1` on every playwright command** (§3.1 / F-1270-1), and every command `nice -n 19`.
- **The fire shell's node is v26.4.0; the lane's is v23.11.1.** My arm therefore ran the specs under a different
  interpreter than the runner's. Both were green, which is the useful reading: the result is interpreter-stable
  here. Flagged rather than buried, because §2.0b names the uncontrolled interpreter swap as a real hazard.

### What was NOT run, and why — stated as a measured refusal, not an omission

**The full `npm run test:node-guards` was deliberately not run this fire.** lane-a was live throughout on
`f1643-2`, whose entire deliverable is a **suite-red flake-rate snapshot that self-describes its harness**; the
owner throttled it to `--workers=3 nice -n 19` precisely so it hums quietly all day. Load average was measured at
**231 → 287** across this fire with lane-a's chromium fleet resident. A concurrent 181-second battery would have
inflated the very flake rates that snapshot is pinning — Mistake #12 in both directions, on a measurement the
factory will trust for a long time — and F-1537-1 already requires that battery to be run **alone**.

Instead I ran **`scripts/gr-sim.test.mjs` on its own**, which is the specific instrument F-1460-1's rule exists to
protect (it is the pin carrier and 44% of the battery's wall time). The remaining coverage gap is named in the
handoff as an owed act for the first fire that finds lane-a finished.

## Merge classification

Base `b458dba15`; `git merge --no-ff lane/b`, **ort strategy, zero conflicts**.

| file | class | note |
|---|---|---|
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED | +12, the three exemption entries only; constructor gate untouched |
| `e2e/ap16-4-contract-admission.spec.ts` | LANE-TOUCHED | +19, registry-derived both-direction mode assertions |
| `e2e/er01-e2-census.spec.ts` | LANE-TOUCHED | +1/−2, the three refusal arms restored |
| `public/skill.md` | LANE-TOUCHED | −3, inside the `door-contracts` fence only |
| `docs/bench/same-game-audit.md` | LANE-TOUCHED | regenerated, +1072/−1069 |
| `scripts/door-admission-baseline.json` | NEW | 19 sorted ids |
| `scripts/door-admission-ratchet.test.mjs` | NEW | rooted in `test:node-guards` |
| `package.json` | LANE-TOUCHED | the `test:node-guards` list only, to root the new guard |

**No file was MAIN-MOVED.** Main's 10 commits since the base touched only `STATUS.md`, `tasks/**` and
`logs/session-scratch/**`, so no three-way graft was required anywhere.

The `docs/bench/same-game-audit.md` churn is large (+1072/−1069) but is **regeneration, not rewriting**: the report
carries `file:line` citations on nearly every row, and the lane refreshed onto a main that had moved 99 commits
since the report was last generated. Spot-checked: the moved rows are coordinate churn
(`src/game/Game.ts:5727` etc.), and the substantive deltas are the three new exemption rows and the
`Final derived door (22 → 19)` line.

## Findings

### F-1662-1 — the door change left a red guard behind a path-scoped firewall (CURED IN THIS DRAIN)

`scripts/null-floor-anchors.test.mjs` asserts that `assets/contracts/null-floors.json`'s `floors` key set
**exactly equals** bench seeds ∩ `supportedContractIds()`. Removing three ids from the door therefore made that
guard red the instant the slice landed, and the runner could not fix it: its firewall said
*"NO changes to `assets/contracts/**`"*. It reported the conflict honestly and stopped, which is a **Codex firewall
STOP = success**, not a failure.

✓ **The firewall was right about its subject and wrong about its scope, and the distinction is the reusable half.**
Its stated rationale is *"the contract bundles are DATA; admission is a door question and editing a manifest to
change admission is the 'stretch the vocabulary' failure (Mistake #14)"* — entirely correct **about contract
bundles**. But `null-floors.json` is not a bundle. It is a **generated measurement artifact**: `scripts/null-floor-anchors.mjs`
writes it by intersecting `assets/contracts/bench-seeds.json` with `supportedContractIds()` and spawning
`gr-sim --policy=idle` per pair. Its key set is **derived from the door**. Removing the three rows does not change
admission — it *follows* admission. **A firewall keyed on a PATH inherits every file that happens to live under it,
and `assets/contracts/` holds two file classes: hand-authored bundles the master rightly protected, and generated
artifacts that must follow the code.**

**Cured here by surgical splice, not regeneration**, deliberately: a full `node scripts/null-floor-anchors.mjs`
would re-run 35 idle sims *and* rewrite `eraStamp`, which is `git merge-base HEAD main` and therefore moves on any
bookkeeping commit (F-1653-3, already open). The splice produces exactly the key set the generator would, and
nothing else. 312 → 258 lines, 12 → 9 contracts. Verified **RED before / GREEN after**, with the guard's own
message (*"floors must equal bench seeds intersected with supported contracts"*).

### F-1662-2 — this merge ships a self-contradicting sentence in a generated report (NON-BLOCKING, corrective owed)

`scripts/same-game-audit.mjs:379` builds a paragraph whose numbers interpolate but whose tail is **hardcoded
prose**: *"…ten of those fifteen passed below and were admitted, leaving five cited exemptions."* The exemption
table it introduces now emits **eight** rows.

⚠️ **Be precise about who introduced it: on main today the sentence is ACCURATE** — the table has exactly 5 rows.
It becomes false only after this merge. The runner flagged it and correctly did not fix it (`same-game-audit.mjs`
is firewalled *"you RUN it, you do not edit it"*).

💡 **This is the same defect class as the root cause this slice repairs, one level over.** F-1660-1's root was
*a policy encoded as a comment evaporates when its data structure is derived*. Here a **count encoded as prose**
rots when its table grows. Both store a fact outside the structure that owns it.

I did **not** hand-tune it in the drain, because the sentence is genuinely ambiguous and guessing would be the
Mistake #14 shape: "five" may mean *five arising from that population of fifteen* (still true — the railcars are a
different population) or *five in total* (now false). Resolving that needs the slice to decide the semantics and
derive the count, not a drainer editing generator prose under load.

### F-1662-3 — the three exemption reasons are byte-identical, but the measured evidence differs for one (NON-BLOCKING)

All three new entries carry the same `reason`: *"Measured modeless idle run reached the wave ceiling without a
lawful terminal because no weapon reaches the railcar."* The pinned null-floor evidence disagrees for
`e2-incline`. Quoted here **for retention, because F-1662-1's cure deletes these rows**:

| seed | secured | waves | timeMs | kills |
|---|---|---:|---:|---:|
| `e2-hill-mine-01` | false | **18** | **540000** | 132 |
| `e2-hill-mine-02` | false | **18** | **540000** | 198 |
| `e2-trestle-01` | false | **18** | **540000** | 177 |
| `e2-trestle-02` | false | **18** | **540000** | 169 |
| `e2-incline-01` | false | **2** | **82633** | 19 |
| `e2-incline-02` | false | **2** | **76733** | 20 |

`e2-hill-mine` and `e2-trestle` sit at the ceiling on both seeds (540000ms is the cap). `e2-incline` terminated at
**wave 2 in ~80 seconds** on both — which is not a ceiling.

⚖️ **The exemption is still correctly authorised, and this changes no policy**: its citation is **F-E2S-3, the
owner ruling naming all three contracts BY NAME**. Only the `reason` prose over-generalises — and the `reason`
field is precisely what a future reader will use to judge whether re-admission is safe, so it is worth being true.

🔑 **The error is the master's, not the runner's.** The master *ordered* the uniform phrasing, and it inherited
that from F-E2S-3's proof, which s1605 measured on **`e2-hill-mine`** and generalised to the trio. The runner
obeyed its master exactly.

## Ledger corrections made in the drain commit

- **F-1608-2's reassurance is un-VOIDed.** The F-1660-1 BACKLOG row recorded that F-1608-2's line — *"Both maps are
  currently door-de-listed per F-E2S-3, so nothing is blocked meanwhile"* — was **VOID while the reversal stood,
  and becomes true again when the corrective lands.** It has landed; the row is corrected accordingly.
- Goal leaf `f1660-1-door-readmission-repair`: `planned` → `merged` with this drain's merge hash.
- GZ-01 news item appended for the public-door change (`public/skill.md` is the BYO-agent door doc).
