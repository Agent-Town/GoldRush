# f1660-1 — restore the F-E2S-3 de-list as cited exemptions, and assert both directions of the AP-16 mode rule

**Slice:** `f1660-1-door-readmission-repair` · **Branch:** `lane/b` @ `a923f241d` (runner commit) · **Base:** `b458dba15`
**Merged to main:** `25499e0a1e99bf306d9430daee8b501ef3690b95` · **Drained by:** s1662 fire, 2026-08-11
**Master:** `tasks/f1660-1-door-readmission-repair.md` (authored + dispatched s1660) · **Goal leaf:** `f1660-1-door-readmission-repair`

## VERDICT: MERGED — scope executed exactly as authored; one firewall-blocked residue cured in this drain (`f8a704249`), two non-blocking findings filed.

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

It does **not** revert AP-16-4 (a sound slice with one omission), does not touch the constructor gate, and does
not build the still-owed pressure-to-damage socket half.

## Evidence (measured on the MERGED tree, in a detached worktree — §3.0b)

Gate worktree `gate-s1662b` @ `207cbb2f3` (`git merge --no-ff lane/b`, **ort, zero conflicts**, 8 files
+1149/−1075). Undecided content never entered main's working tree or index; the real merge was one act, never
staged.

🔑 **The control that makes the rest of this table readable.** `git diff --name-only lane/b <merged tree>` returns
**exactly 11 paths, every one of them bookkeeping** — `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, the
master file, and 7 `logs/session-scratch/*`. **Zero source, test, script, asset or config bytes differ**, because
main's 10 commits since the merge base are all s1660/s1661 ledger work. So the merged tree and the tree the runner
tested are the same artifact for every executable byte, and my re-runs below are a **control on the runner's
headline** rather than a substitute for it.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc=0 (41.0s) |
| `npm run build` | green, rc=0, **built in 8.76s**, 2186 modules (106.7s wall under load) |
| `er01-e2-census` + `ap16-4-contract-admission`, **desktop-chrome**, `--workers=1` | **5 passed** (2.0m), rc=0 |
| same two specs, **mobile-chrome (390px)**, `--workers=1` | **5 passed** (1.6m), rc=0 |
| `scripts/skillmd-guard.test.mjs` | **5 pass / 0 fail**, green **without being edited** (17.8s) |
| `scripts/door-admission-ratchet.test.mjs` (the new guard) | **1 pass** (10.6s), and re-proven to BITE — below |
| `scripts/null-floor-anchors.test.mjs` | **RED before my fix → GREEN after** (F-1662-1) |
| `scripts/gr-sim.test.mjs` (the F-1460-1 pin carrier) | 16 tests · **12 pass** · 1 fail · 1 cancelled · 2 skipped, rc=1 in **778s** — both reds fingerprint-matched to main, below |

### The door probe, run directly rather than inferred — this is the fact the slice exists to restore

```
node scripts/gr-sim.mjs --contract=e2-hill-mine --seed=e2-hill-mine-01 --policy=idle
  → rc=1  Error: AP-07 supports only … received e2-hill-mine.
    (the derived door named in that error lists 19 ids; no railcar among them)

node scripts/gr-sim.mjs --contract=e2-hill-mine --seed=e2-hill-mine-01 --policy=idle --mode=escort
  → rc=0  emits goldrush.view.v1 carrying the "Railhead Escort" objective
```

Both directions of `specs/agent-play/ap-16-same-game-law.md:33` hold: **refused modeless, admitted through its
declared mode.** On main before this merge the first command **ran a full contract and emitted a view** — that was
the defect, and it is gone.

### The ratchet's red was re-derived here, not inherited

A new guard is invisible to the battery that ships it, so the runner's red-then-green transcript was re-run from
scratch in the gate worktree: deleting the `e2-incline` exemption block from `src/sim/HeadlessContractSim.ts`
takes the ratchet to **1 fail** (*"Door admission drifted from scripts/door-admission-baseline.json"*); restoring
it byte-identically (`sha256[0:16] = dfcdd833e3ce6363` before and after — **the same hash the runner independently
reported**) takes it back to **1 pass**. The baseline's denominator sits in a file the defect does not touch,
which is exactly why it bites where a loop over the exemption table could not.

### The two `gr-sim` reds, priced with a control rather than waved at

Both reds were reproduced on **unmerged main**, same two tests, `--test-name-pattern`, same shell:

| arm | result | `overtime … both Node engines` | `places Night Shift fixtures` |
|---|---|---|---|
| **merged tree** (`gate-s1662b`) | rc=1, 778.3s | ✖ 240025ms (its own 240s timeout) | ✖ 88362ms |
| **CONTROL — unmerged main** | rc=1, 752.5s, 2 tests / 0 pass | ✖ 240001ms | ✖ 79709ms |

**Both reds are pre-existing on main and are not this slice's.** Four independent grounds agree:

1. The control reproduces both, at near-identical timings, on a tree that does not contain the slice.
2. `scripts/gr-sim.test.mjs` contains **zero** references to `supportedContractIds` or `SUPPORTED_CONTRACTS`
   (grep-verified), so a door change cannot reach it at all.
3. The **one** `gr-sim` test that does touch a railcar — the escort-admission test at `:272–:294`, which constructs
   `e2-hill-mine` with `mode: 'escort'` — **passed**. It is a live consumer of precisely the arm the master
   forbade touching, which is why that firewall clause was right.
4. The slice's entire `src/` diff is **+12 lines inside a const object**; it cannot alter `the-claim`'s or Night
   Shift's simulation.

⚠️ **These are load casualties, and the machine said so.** The merged run took **778s against ~80s nominal (9.7×)**;
one child sim accumulated **62s of CPU and then flat-lined at 0.0% for 8+ minutes** while the machine sat at
**load average 280** — the flat-CPU hang signature. Re-run at load ~50 the same children progressed normally
(41.9% / 38.1%, CPU accumulating). lane-a's own master states the governing principle: *"a full-suite run taken
while lanes are live measures THE MACHINE, not the code (F-1270-1's load ceiling)."*

ⓘ **Pricing them cost a full control run, and it should not have.** `scripts/red-inventory-lookup.mjs` refuses any
path that is not an `e2e/*.spec.ts`, and `logs/suite-red-inventory.md` contains only playwright rows — so a
**node-guard** red has no inventory to be priced against, and every drainer that hits one pays ~12 minutes.
Recorded here for the `f1643-2` drain, which owns that instrument and is refreshing it now.

### Instrument notes (stated so none of this reads as a shortcut)

- **Both specs make zero `page.` calls** — they boot their own vite in `middlewareMode` over `process.cwd()`, so
  run from `gate-s1662b` they exercise **the merged tree**, and playwright's `baseURL` is never contacted. They
  were run with `GR_CAPTURE_EXTERNAL_SERVER=1` against a **scratch dev server on 5234** started inside the gate
  worktree, purely to satisfy `external-server-guard` without starting a competing vite on 5188 (Mistake #12).
  The guard classified it `dev` (`/@vite/client` → 200 `text/javascript`), so F-1457-1 is satisfied.
- **`--workers=1` on every playwright command** (§3.1 / F-1270-1); every command `nice -n 19`.
- **The fire shell's node is v26.4.0; the lane's is v23.11.1**, so my arm ran under a different interpreter than
  the runner's. Both green — the result is interpreter-stable here. Flagged rather than buried, because §2.0b
  names the uncontrolled interpreter swap as a real hazard.

### What was NOT run, and why — a measured refusal, not an omission

**The full `npm run test:node-guards` was deliberately not run.** lane-a was live for this entire fire on
`f1643-2`, whose deliverable is a **suite-red flake-rate snapshot that self-describes its harness**, owner-throttled
to `--workers=3 nice -n 19` so it hums quietly all day. Load average was measured at **231 → 287** with its
chromium fleet resident. A concurrent 181-second battery would have inflated the very rates that snapshot is
pinning, and F-1537-1 already requires that battery to be run **alone**.

I ran **`scripts/gr-sim.test.mjs` on its own** instead — the specific instrument F-1460-1's rule exists to protect
(the pin carrier, 44% of the battery's wall time) — and priced its reds with a main-side control. **The residual
battery is owed** and is named in the s1662 handoff as the first act for the fire that finds lane-a finished.

⚖️ **Stated plainly because it cuts against me:** this drain nevertheless put measurable load on a machine whose
live task is measuring load-sensitive reds. I minimised it (everything niced, `--workers=1`, no full battery, no
chromium beyond one) but did not eliminate it. `f1643-2`'s master anticipates exactly this and requires its report
to **state the concurrent load it ran under**, so the contamination should be visible in its own evidence rather
than silent. s1661 declined to drain for this reason and paid a fire; I drained and paid some contamination. The
next reader can judge which was right — that is why both are on the record.

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

**No file was MAIN-MOVED**, so no three-way graft was required anywhere: main's 10 commits since the base touched
only `STATUS.md`, `tasks/**` and `logs/session-scratch/**`.

The `docs/bench/same-game-audit.md` churn is large but is **regeneration, not rewriting**: the report carries
`file:line` citations on nearly every row and the lane refreshed onto a main that had moved 99 commits since the
report was last generated. Spot-checked — the moved rows are coordinate churn (`src/game/Game.ts:5727` etc.); the
substantive deltas are the three new exemption rows and `Final derived door (22 → 19)`.

## Findings

### F-1662-1 — the door change left a red guard behind a path-scoped firewall (CURED IN THIS DRAIN, `f8a704249`)

`scripts/null-floor-anchors.test.mjs` asserts that `assets/contracts/null-floors.json`'s `floors` key set
**exactly equals** bench seeds ∩ `supportedContractIds()`. Removing three ids from the door therefore reddened
that guard the instant the slice landed, and the runner could not fix it: its firewall said *"NO changes to
`assets/contracts/**`"*. It reported the conflict honestly and stopped — a **Codex firewall STOP is success**.

✓ **The firewall was right about its subject and wrong about its scope, and that distinction is the reusable half.**
Its stated rationale is *"the contract bundles are DATA; admission is a door question and editing a manifest to
change admission is the 'stretch the vocabulary' failure (Mistake #14)"* — entirely correct **about contract
bundles**. But `null-floors.json` is not a bundle. It is a **generated measurement artifact**:
`scripts/null-floor-anchors.mjs` writes it by intersecting `assets/contracts/bench-seeds.json` with
`supportedContractIds()` and spawning `gr-sim --policy=idle` per pair. Its key set is **derived from the door**, so
removing these rows does not change admission — it *follows* admission. **A firewall keyed on a PATH inherits every
file that happens to live under it**, and `assets/contracts/` holds two classes: hand-authored bundles the master
rightly protected, and generated artifacts that must follow the code.

**Cured by surgical splice, not regeneration**, deliberately: a full `node scripts/null-floor-anchors.mjs` re-runs
35 idle sims *and* rewrites `eraStamp`, which is `git merge-base HEAD main` and therefore moves on any bookkeeping
commit (F-1653-3, already open). Verified: **312 → 258 lines, 12 → 9 contracts, all 9 survivors byte-identical,
`eraStamp` untouched at `7556adb01`**, and the guard **RED before / GREEN after** on main.

### F-1662-2 — this merge ships a self-contradicting sentence in a generated report (NON-BLOCKING, corrective owed)

`scripts/same-game-audit.mjs:379` builds a paragraph whose numbers interpolate but whose tail is **hardcoded
prose**: *"…ten of those fifteen passed below and were admitted, leaving five cited exemptions."* The exemption
table it introduces now emits **eight** rows.

⚠️ **Be precise about who introduced it: on main before this merge the sentence was ACCURATE** — the table had
exactly 5 rows (`docs/bench/same-game-audit.md:46–50`). It becomes false only now. The runner flagged it and
correctly did not fix it (`same-game-audit.mjs` is firewalled *"you RUN it, you do not edit it"*).

💡 **This is the same defect class as the root cause the slice repairs, one level over.** F-1660-1's root was
*a policy encoded as a comment evaporates when its data structure is derived*. Here a **count encoded as prose**
rots when its table grows. Both store a fact outside the structure that owns it.

I did **not** hand-tune it in the drain, because the sentence is genuinely ambiguous and guessing would be the
Mistake #14 shape: *"five"* may mean **five arising from that population of fifteen** (still true — the railcars
are a different population) or **five in total** (now false). The cure is to derive the count and disambiguate the
population, which is a slice's decision, not a drainer's edit under load.

### F-1662-3 — the three exemption reasons are byte-identical, but the measured evidence differs for one (NON-BLOCKING)

All three new entries carry the same `reason`: *"Measured modeless idle run reached the wave ceiling without a
lawful terminal because no weapon reaches the railcar."* The pinned null-floor evidence disagrees for
`e2-incline`. Quoted here **for retention, because F-1662-1's cure deletes these rows** (git keeps them at
`80ace71c3`):

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

⚖️ **The exemption remains correctly authorised and no policy is affected**: its citation is **F-E2S-3, the owner
ruling naming all three contracts BY NAME**. Only the `reason` prose over-generalises — and the `reason` field is
precisely what a future reader will use to judge whether re-admission is safe, so it is worth being true.

🔑 **The error is the master's, not the runner's.** The master *ordered* the uniform phrasing, inheriting it from
F-E2S-3's proof, which s1605 measured on **`e2-hill-mine`** and generalised to the trio. The runner obeyed exactly.

## Ledger corrections made in the drain-bookkeeping commit

- **F-1608-2's reassurance is un-VOIDed.** The F-1660-1 row recorded that F-1608-2's line — *"Both maps are
  currently door-de-listed per F-E2S-3, so nothing is blocked meanwhile"* — was **VOID while the reversal stood,
  and becomes true again when the corrective lands.** It has landed; the row now says so.
- **A correction pointer on the ap16-4 SHIPPED row** (`d4fcc354`), so a reader of the row that *caused* the
  reversal learns it carried one omission. Superseded, never deleted.
- Goal leaf `f1660-1-door-readmission-repair`: `planned` → `merged` at `25499e0a1…`.
- GZ-01 news item appended for the public-door change (`public/skill.md` is the BYO-agent door doc). The copy
  deliberately says nothing about ceilings, so as not to repeat the over-generalisation filed as F-1662-3.
