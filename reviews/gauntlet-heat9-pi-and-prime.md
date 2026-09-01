# Review — gauntlet-heat9-pi-and-prime (heat 9, the de-conflation ride)

- **Slice:** `tasks/gauntlet-heat9-pi-and-prime.md`
- **Branch / tip:** `lane/b` @ `0ddcdb8e20243f484ce533fd4c155ed16c1e14ff` (runner commit, 2026-09-01T07:16:51+07:00)
- **Merge:** `13750da625166b9152c3e21302de1b08230ffff1` (s2416)
- **Base:** main @ `31b460c98` (s2416 lock commit)

## Verdict

**MERGE — ACCEPT AS AN HONEST FIELD-WIDE DNF.** The runner did not ride, and it was right not to. It stopped at the master's own mandatory early skew probe, burned zero attempts, submitted no unsecured tape, and never rode one rig under the other's name — which was the entire point of the heat. The deliverable is the de-conflation receipt plus a precisely-evidenced door refusal, and both are sound.

## What it does

Heat 9 existed to undo a naming injustice: the heat-6..8 masters had conflated `pi` and Prime Agent as one rig ("pi (Prime Agent)"), after which only Prime actually rode. This slice separates them with receipts — PI is `@mariozechner/pi-coding-agent` 0.73.1, Prime Agent is the separate `prime-agent` CLI 0.8.0 — and proves the conflation from heat 8's own driver, whose key `pi` called the `prime-agent` executable and wrote Prime headers into a `pi__` notebook. Separate charters, model states, executable paths and notebook families were established before play.

Play then never started. The mandatory pre-rider skew probe found the arena's engine hash absent from era 5's registry and the public door returned HTTP 400 `reel_not_current`. Per the master's `early probe, skew → STOP`, the field was abandoned as a documented DNF.

## Evidence

| Arm | Result |
|---|---|
| Firewall | **CLEAN** — 13 files, +36,104/−0, **every path** under `artifacts/gauntlet-heat9-20260901/`; zero paths outside |
| Secret scan | **CLEAN** over all added lines (sk-/ghp_/bearer/api-key/OPENROUTER/RESEND patterns) |
| `drain-block-check` | `✅ CLEAR — status="queued"` |
| `tsc --noEmit` | **rc=0** — baseline; production surface byte-identical to main, so this arm cannot differ |
| Build / specs | **NOT DIFFERENTIAL, and recorded rather than skipped** — evidence-only slice, no source/config/spec path touched (heat-8 precedent, s2409) |
| Lane absorbed | `git log main..lane/b` → **0** after merge |

### The runner's headline, re-derived by the drain rather than inherited

The drain's own re-run is a free control, and it corroborates every load-bearing number:

| Claim | Runner | Drain's independent measurement | Agrees |
|---|---|---|---|
| Live production build | `325b7398` | `curl .../version.json` → `{"build":"325b7398","builtAt":"2026-08-31T23:25:18Z"}` | ✓ |
| Arena engine hash | `417ac150…c3c864` | `computeEngineHash(main)` → `417ac150…c3c864` | ✓ |
| Era-5 registry pin | only `c0a015ae…c237b` | `assets/engine-era.json` — era 5, **exactly one pin**, `c0a015ae…` | ✓ |
| Door refusal | `400 reel_not_current` | `probe/post-response.json` verbatim; `standings.ts:700` is the emitting site | ✓ |

Tape metadata read directly (not through a glob — F-2409-1's lesson): `probe/tape.json` stamps `engineHash 417ac150…`, `era 5`, `buildId 325b73987`, id `agent-0b91cbb4-4ff68392-…`, matching the note row for row. **One** tape in the slice; nothing secured was withheld and nothing unsecured was posted (the single submission was door-refused before storage, so no verified slip and no rank exist to claim).

## Merge classification

Base main; all 13 files **LANE-ONLY** (`lane-usable` reported "HELD LANE-ONLY" for every path, each with all added lines absent from main). Main has never touched `artifacts/gauntlet-heat9-*`, so there were no MAIN-MOVED files and no conflicts to resolve.

## Findings

### 🚨 F-2416-1 — F-2408-1'S SCOPING SENTENCE IS NOW STALE: THE ENGINE-PIN SKEW HAS REACHED THE **DEPLOY**, AND THIS HEAT IS ITS FIRST REALISED COST

F-2409-1 scoped the defect precisely and correctly *when written*: *"The defect is invisible to anything riding the deploy and bites everything riding main."* Heat 8 rode deployed build `4675cfd7b`, which predated the divergence, and all three of its submissions verified cleanly.

**That is no longer true.** The live deploy is now `325b7398`, built 2026-08-31T23:25:18Z — which is **s2414's own handoff commit**, i.e. a fire's routine bookkeeping. It carries the divergent hash. Measured: the deployed arena stamps `417ac150…`, `computeEngineHash` on main returns the same `417ac150…`, and era 5 pins only `c0a015ae…`.

**Realised cost, first instance:** an entire two-rig field abandoned before a single attempt — 0/3 on four maps × two rigs, both notebooks blank, on a heat the owner asked for by name ("But you skipped prime intellect's agent this time? I also don't see PI which took some high placements last time."). Nothing rideable can score while this stands, because production itself now produces unrankable reels.

### 🚨 F-2416-2 — THE REMEDY'S RATIONALE IS INCOMPLETE: THERE ARE NOW **TWO** CAUSES IN THE LINEAGE, AND ONE APPENDED PIN WOULD BLESS BOTH

F-2408-1/F-2409-1 recommended *append-a-pin*, on the stated grounds that *"a test-script name cannot change what the headless replay executes."* That reasoning covered the only cause then known. It no longer covers the corpus.

Measured over every first-parent commit touching `ENGINE_SOURCE_INPUTS` since the era-5 pin (2026-08-31T13:37:49+07:00) — **three** commits, two causes:

| Commit | Corpus delta | Class |
|---|---|---|
| `daae36dc7` (s2406) | `package.json` +1/−1 — one guard filename | **False positive** — F-1300-4 *mandates* this edit |
| `50a661cf3` (s2412) | `package.json` +1/−1 — one guard filename | **False positive** — same mechanism |
| `b80253bff` | **`src/playbook/PlaybookFormat.ts` +4/−1** | **A real source change** |

That third one is a genuine `src/` edit: `runTapeEnvelopeForContract`'s tick budget widened `+1` → `+2`, so a run that records a lawful accepted order at the terminal instant is no longer rejected by an exclusive end-bound. On reading, it changes what the **door accepts**, not what the **sim computes** — the same character as era 5's own declared note ("a board-law change… simulation behaviour did not change") — but that is a judgement, and it is the owner's, not a fire's.

**Why it matters for the ruling:** a single appended pin blesses the false positive and the real source change in one row, laundering the twice-escalated `package.json` question into era 5's lineage and making the red vanish without the ruling F-2408-1 exists to obtain. This is exactly the restraint s2411 took (F-2411-1) and it is re-affirmed here with a sharper reason: the count of causes has gone from one to two, and they want different answers.

⚠️ **Method note, paid for in this fire and worth more than the finding:** `git show --stat <merge> -- <paths>` returned **empty** for `b80253bff`, which reads exactly like "this commit touched no corpus path". It is a **merge commit**, and `--stat` is blind to merges by default. Had I stopped there I would have reported "both causes are `package.json`, append-a-pin is clean" — a confident wrong answer that would have made the owner's decision look easier than it is. The discriminator is `git diff <sha>^1 <sha> -- <paths>`.

### ⓘ Not findings, recorded so they are not re-chased

- The heat's own conduct is **exemplary and needs no corrective**: it hit a stop condition its master had pre-authorised, and reported a DNF instead of manufacturing a ride. The no-op honesty guard worked.
- PI's identity question is **answered**, and that answer survives the DNF — it is the durable half of this slice.
- PI's notebook carries a local-only commons commit `73bbf60` recording the non-generation; Prime's is untouched because Prime never launched. Correct on both counts.

## Owner's desk

Both findings above sharpen an **already-open** owner item rather than adding a new one. The question is unchanged in shape and now larger in consequence:

1. **Append `417ac150…` as a second era-5 pin**, or **bump to era 6**? Reading the three commits makes the sim-behaviour case easy (two guard filenames and a door-envelope endpoint), but an era bump is player-visible news by definition (GZ-01), and one pin now blesses two distinct causes.
2. **The deeper fork, still unruled and now twice-demonstrated:** should `package.json` be in `ENGINE_SOURCE_INPUTS` at all, when F-1300-4 *requires* every ledger-writing fire to append its new guard to that very file? Two of the three corpus movements since the era-5 pin were exactly that edit. This will keep happening on a schedule.

**Recommendation (a fire's read, not a ruling):** append the pin *and* remove `package.json` from the identity corpus in the same act, so the false positive stops recurring instead of being re-blessed every few fires. Re-derive the hash against main at ruling time — it has moved twice since s2408 and will move again.
