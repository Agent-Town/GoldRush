# ER-01 E6 Atomic readiness census — drain review (s1461)

- **Slice:** `lane-er01-e6-census` (E6 Atomic, on the E2/E3 template + the ERA-SOCKET LAW)
- **Branch / tip:** `lane/b` @ `de15831b` (Codex's own commit; **no runner wrapper commit**, so the F-1461-5 deletion class does not apply here — checked with `git show --stat` before merging)
- **Merged to main:** `47040343cacd9712f70a09e5256f61f37d9e6eb0`
- **Gated in:** detached worktree `gate-s1461/` (§3.0b)
- **Drain-block check:** `? UNKNOWN` — no leaf; searched by leaf id, genuinely absent (F-1461-2). Registered in the bookkeeping commit. Not a block.

## VERDICT: MERGED

## What it does

Censuses the four `epoch-6-atomic` board contracts. **Verdict: 0 AGENT-READY · 4 DATA-GAP ·
0 BROKEN.**

The root gap is named precisely: `WrangleSystem` is enabled for the **entire Atomic epoch**, but
the mechanics manifest has no wrangle vocabulary and `HeadlessContractSim` has no wrangle consumer
or capture action. Glow Mesa additionally depends on browser-only decay fields, night veins and
the Homemaker boss consumer; Picnic declares three loss stakes while both browser and headless
boot paths select the first `heroStart` marker.

The BROKEN row is 0 and the census says why in a way worth quoting: all four contracts load, accept
all seven standing-order grammar forms on both seeds, terminate by hero death under the idle
policy, and emit no captured console output — *"They are incomplete for agents, not malformed."*
That distinction is the whole point of the DATA-GAP/BROKEN split and it is applied correctly.

**Three refusals in this census are better than the numbers they produced:**

1. **Determinism is recorded as N/A, not as a hash.** *"the rejected generic model excludes the
   mechanics whose events would have to be hashed; repeating it would certify the wrong
   simulation."* A reproducible number from the wrong model is worse than no number, and this run
   declined to mint one.
2. **The forced generic runs are fenced off explicitly** — *"those runs do not establish admission
   or mechanics coverage"* — so diagnostic evidence cannot later be mistaken for an acceptance pin.
3. **It reports the interpreter split honestly and covers it.** The forced diagnostics ran on the
   lane's default Node 23.11.1, and the census states that the focused rejection guard **also
   passes on the repo-pinned Node 26.4.0** — the first census in this wave to answer **F-1458-2**
   on its own initiative rather than leaving the drain to discover it.

Every contract omits `tileParams.engineDependencies`, so none declares its missing era socket as
ER-01 requires. Recorded, deliberately not repaired here.

Files: `docs/bench/e6-readiness-census.md` (+38), `e2e/er01-e6-census.spec.ts` (+60),
`assets/contracts/bench-seeds.json` (+16).

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **green, 1.39s** |
| Own spec `er01-e6-census.spec.ts`, `--workers=1`, desktop + mobile | **8 passed (5.8s)** |
| `npm run test:node-guards` | **280 pass / 1 fail** |
| `bench-seeds.json` union after resolve | **parses; e1:4 e2:4 e3:4 e6:4, 17 keys** |

The single fail is **F-1460-1's Baron driver pin**, identical to the digit. This is the **fourth**
tree gated this fire at exactly 280/1 — pressure-socket, E3, E4, E5 and E6 all agree with each
other and with s1460's clean-main baseline, which is what makes the count usable as a control
rather than an excuse.

No screenshots: headless bench infrastructure, no player-visible surface.

## Merge classification

Base `3445d479`. `docs/bench/e6-readiness-census.md` and `e2e/er01-e6-census.spec.ts` are
**LANE-ONLY pure-add**. Two **BOTH-MOVED** files, both conflicting:

- **`assets/contracts/bench-seeds.json` — resolved as a UNION, which is the load-bearing decision
  of this drain.** Main already held E3's 16 seeds (merged earlier this fire); the lane added E6's
  16. `git`'s default resolution would have dropped one side. Per the PARALLEL-CENSUS DRAIN NOTE
  this file is an **append-only union surface and drains keep all epochs' members**, so both blocks
  were kept and the result was **parsed and counted** before commit: 17 keys, four members each for
  e1/e2/e3/e6. Verified again on main after the real merge, not only in the gate worktree.
- **`tasks/BACKLOG.md`** — resolved to HEAD, dropping the lane's `READY-FOR-GATES on lane/b` line,
  which this merge makes false (Mistake #5).

## Findings

**F-1461-6 — 🟡 THE WAVE DISAGREES WITH ITSELF ABOUT WHETHER A ZERO-ADMISSION CENSUS MINTS SEEDS.**
Across four censuses drained this fire with **identical verdicts of 0 AGENT-READY**, two wrote
seeds into `bench-seeds.json` (E3 +16, E6 +16) and two deliberately did not (E4 and E5, both
stating the rule as *"ER-01 pins two seeds per admitted contract, and this census admits none"*).
Both readings are defensible — E3/E6 call theirs *diagnostic* seeds, E4/E5 treat the file as an
*acceptance* registry — but they cannot both be the convention, and the file is a shared
append-only surface that every future era census will touch. Left as-is rather than
retro-editing merged work: the disagreement is evidence for the ruling, and normalising it now
would erase it. **Attended ruling wanted:** does `bench-seeds.json` hold acceptance pins only, or
diagnostic seeds too? Whichever way it goes, the E7–E10 masters should state it, since this wave
proves the template does not currently carry it. Non-blocking.

No blocking findings.
