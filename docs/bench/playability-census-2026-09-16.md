# Playability census — 2026-09-16 (standing duty, s2583 fire)

> ⏱️ **SUPERSEDED ON THREE OF ITS FOUR ROWS, SEVEN HOURS AFTER IT WAS WRITTEN — READ THIS BEFORE THE RESULT
> LINE (F-2588-1, appended s2588; the census below is UNCHANGED and was honest when written).** This file is
> named for the DAY and measures an INSTANT: its subject is main `e55c1aee1` at 01:26, and at **08:09** the
> attended session merged `2d053781c` (`reviews/playability-first-wave-e2-e6.md`), which cures three of the
> exact four rows below. **Applying THIS DOCUMENT'S OWN staleness predicate** — the `src/ assets/ public/
> functions/ site/ index.html e2e/` diff it uses further down to argue nothing observable had moved —
> `e55c1aee1..HEAD` is **NOT empty: 6 files, +386/−61**, including both failing contracts' data *and the
> census harness itself* (`e2e/playability-smoke.spec.ts` +102, which declares the Drill Yard exemption).
> 📊 **MEASURED, not inferred — the drain re-ran this same smoke over these same four contracts on the merged
> tree, both projects: `6 passed / 2 failed`.** e2-trestle wave 2 at 86.3–87.1 s (3/3 × 2) · e2-incline wave 2
> at 80.8–81.7 s (3/3 × 2) · e1-drill-yard PASS under its declared practice exemption (3/3 × 2) · **e6-picnic
> unchanged red (37.5 / 37.7 s) — F-PLAY-E6-1 is the sole survivor and is on the OWNER'S DESK as A21.**
> ⚠️ **SO DO NOT READ THE RESULT LINE AS TODAY'S STATE.** "None of yesterday's recovered" is true of 01:26 and
> false of HEAD, and it makes a 1-of-4 residue look like a 4-of-4 failure — which misprices the one decision
> this census actually put on the owner's desk. The `82 of 84` that a full re-run would presumably now report
> is an **INFERENCE and is labelled one**: only the four-contract subset was re-measured, not all 42.
> 🚫 **NOT RE-RUN, BY LAW:** the standing duty is *"on a dry board, at most once per day and never beside
> another battery"*, so the correction is this note and not a fresh census. The next census is tomorrow's.

**Method:** `npm run test:playability` (`e2e/playability-smoke.spec.ts`: every board contract booted the way a
human boots it — no `?debug`, no test seam — and asked six questions: boots, briefing, HUD, moves, reaches
wave 2, no console/page errors) on a **detached worktree** (`gate-census-s2583`) at main `e55c1aee1`, both
projects, one worker, **28.7 min wall**, board dry, machine otherwise idle (load 1.60 at launch; nothing else
running — checked before launch, and deliberately nothing was run beside it, per F-2462-1). Transcript:
`artifacts/playability-census-2026-09-16/census-desktop-and-mobile.log`.

**Result: 76 of 84 runs pass; the same 4 contracts fail on both projects, all at the same question
("reaches wave 2"). No new failing contract, and none of yesterday's recovered.**

| contract | epoch | desktop | mobile | what the run reported |
|---|---|---|---|---|
| e1-drill-yard | 1 | ✗ | ✗ | reached wave 0, `runState=playing` — the Drill Yard has no waves to reach (F-PLAY-E1-1) |
| e2-trestle | 2 | ✗ | ✗ | `runState=dead` before wave 2 (F-PLAY-E2-1) |
| e2-incline | 2 | ✗ | ✗ | `runState=dead` before wave 2 (F-PLAY-E2-2) |
| e6-picnic | 6 | ✗ | ✗ | `runState=dead` before wave 2 (F-PLAY-E6-1) |
| the other 38 | 1–10 | ✓ | ✓ | |

## This run was a reproducibility control, and that is its whole value

The census subject was **byte-identical** to the 2026-09-15 run: `git diff 585719e1d..e55c1aee1` over
`src/ assets/ public/ functions/ site/ index.html e2e/` is **empty**, and the whole-tree diff is 9 files, all
of them ledger, law and marketing. Nothing the census can observe had moved. So this run could not discover a
regression — what it could do is tell us whether yesterday's four rows are **real defects or load artifacts**,
which matters because the owner is about to spend Opus implementer time on three of them.

**They are real.** Same four contracts, both projects, same failing question, same run states, twice, on two
different days at different machine loads.

## ⚠️ But the DURATIONS in these rows are not a key, and yesterday's row text reads as if they were

Every "N s sim" figure this census prints is **wall-clock-derived and load-dependent**. Read from the spec
rather than inferred: the harness moves the hero by holding keys for a fixed **1000 ms of wall clock**
(`hold(page, 'KeyD', 1_000)`, `hold(page, 'KeyW', 1_000)`) while the game runs at `timescale=4`, then watches
for wave 2 by polling every 500 ms against a wall-clock deadline (`while (Date.now() < deadline)`). How much
sim advances inside those wall-clock windows depends on frame rate, i.e. on machine load — so where the hero
ends up, and how long the run survives, move from run to run.

Measured across the two runs of the identical tree:

| contract | 09-15 | 09-16 desktop | 09-16 mobile | spread |
|---|---|---|---|---|
| e2-trestle | 59 s | **50.3 s** | **61.1 s** | ~20% |
| e2-incline | 71 s | **69.6 s** | **70.9 s** | ~2% |
| e6-picnic | 38 s | **34.7 s** | **27.2 s** | ~29% |
| e1-drill-yard | 374 s | **374.4 s** | **374.9 s** | ~0.2% |

**And `reached` moves too, not just the duration.** Yesterday e6-picnic reported wave 1 on both projects;
today it reported wave 1 on desktop and **wave 0** on mobile. Same contract, same `runState=dead`, same
defect — a slightly unluckier run died a little earlier.

**e1-drill-yard is stable for a different reason and must not be read as evidence of determinism:** it never
dies, so its figure is just "how much sim fits in the harness's fixed wall budget", which is stable when the
frame rate is. It is the one row whose number means something repeatable, and it is also the one row that is
a census defect rather than a map defect.

➡️ **Therefore, binding for whoever writes or reads these rows: key an F-PLAY row on the VERDICT — which of
the six questions failed, and the run state — never on the duration.** A future census quoting "dead at 50 s"
against yesterday's "dead at 59 s" has measured the machine, not the map. Quote a band if a number is wanted.
This is F-2452-1's lesson (*a scalar cost is a measurement with a hidden parameter*) on a new subject, and the
hidden parameter here is the same one: machine load.

⚠️ **Do not "fix" this by pinning the durations or tightening the wave timeout.** The spec is measuring a real
thing (can a plain human player reach wave 2), and the variance is in the harness's pacing, not in the sim.
Making the numbers agree would be F-1410-2 in its named costume.

## Findings — no new rows

All four ids already exist from the 2026-09-15 census and are **re-confirmed, not re-filed**:

- **F-PLAY-E1-1** — e1-drill-yard: the smoke asks for wave 2 on a contract that has no waves. A census defect;
  the master `tasks/playability-smoke-practice-exemption.md` is banked against it and waits on an attended
  Opus implementer while the CODEX-WALL stands.
- **F-PLAY-E2-1** — e2-trestle: an unassisted plain-boot hero dies before wave 2.
- **F-PLAY-E2-2** — e2-incline: same.
- **F-PLAY-E6-1** — e6-picnic: same.

Per the standing duty, **nothing was fixed in this fire.**

---
*s2583 fire, 2026-09-16. Detached worktree `gate-census-s2583` at `e55c1aee1`, removed after the run.
84 runs, 76 pass, 8 fail, 28.7 min. Subject byte-identical to the 2026-09-15 census tree.*
