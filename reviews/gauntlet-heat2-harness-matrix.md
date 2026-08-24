# Review — gauntlet-heat2-harness-matrix (s2270 drain 3)

**Slice:** `gauntlet-heat2-harness-matrix` · **Branch:** `lane/d` · **Tip:** `0ac6030f7157a297afa8a6294c89832cd289280c`
**Merged to main at:** `a7e09690dc37c7ea699c4ae98d99c787a15b0ba8` (fast-forward of the gated commit)
**Gate worktree:** `.gate-s2270` (detached, §3.0b)

## VERDICT: MERGE — a heat that scored zero and is worth more than the one that scored two.

## What it does

Three guest harnesses ride the public door on the same seeds as heat-1, at the same deployed build
`b42c0fbcc`. **35 launches · 29 terminal tapes · 1 locally secured outcome · 0 accepted submissions ·
0 verified standings.** The operator explicitly did not author any rider's standing orders and is
declared in no rider stack — which is the whole point: this measures ap-15's **operability** axis,
whether a stranger's harness can set itself up from `skill.md` alone.

| arm | contracts | harness wall | reported cost |
|---|---|---:|---|
| codex · `gpt-5.6-luna` | all six | 17m12s | 8,008,752 in (7,795,200 cached) · 45,646 out |
| Hermes · `openai-codex/gpt-5.6-sol` | short program (3) | 16m11s | 3,757,711 total · 54 calls |
| OpenClaw · `openai/gpt-5.5` | short program (3) | 19m01s | aggregate not exposed |

A DNF-heavy board is the honest result and it was **recorded as such**: no submission or slip exists
for any DNF, because manufacturing one would violate the secured-only rule. The single secured tape
was submitted **once**, was refused, and that contract's lane **stopped** — exactly what the master's
honesty guard requires.

⭐ **The arm that did the most work is the one that reports a guest's own metadata against the guest's
own prose:** OpenClaw's narrative said its provider/model was unavailable; `result.json` records
`openai` / `gpt-5.5`. The heat recorded **the actual decider rather than the task's stale
expectation** (the master had anticipated an Anthropic route). That is the discipline this factory
asks for, applied by a slice to its own subject.

## Evidence

| Gate | Result |
|---|---|
| Firewall | **PERFECT** — all 97 changed paths are `artifacts/gauntlet-heat2-20260824/**` or `tasks/BACKLOG.md` |
| `npx tsc --noEmit` | **rc=0** on the merged tree |
| `npm run build` | **rc=0** — `✓ built in 1.30s` |
| Retention | per-attempt tapes, `.jsonl` event streams, rider drivers, charters, usage files, the POST response and the slip — all committed |

Zero executable source changes, so tsc + build is the whole applicable battery; both were run on the
merged tree rather than argued away.

**No GZ-01 item is owed and that is a verdict, not an omission.** The filter law is *"the review
names a player-visible change"* — this heat landed **zero** verified standings, so the board a
visitor sees is byte-identical before and after. Filing news for it would be reporting an intention.

## Merge classification

Base `797ec034d` + tip `0ac6030f7`, one **conflict**, in `tasks/BACKLOG.md` only — both sides
appended a row at the file tail (main: `E10S-1c EMBER SHORE`; lane: its `HEAT 2` row). Resolved
**keeping both**, verified after resolution that all three of `E10S-1c`, `HEAT 2` and my own
`F-2270-3` survive. `git log main..lane/d` is **empty**.

## Findings

🚨 **F-2270-4 — LAUNCH-GATING, AND IT IS A CURE THAT MOVED ITS OWN DEFECT ONE FIELD SIDEWAYS: A
PERFECTLY-PLAYED RUN IS STRUCTURALLY UNPOSTABLE. The door refuses the best outcome it can produce.**

Luna banked at the wave-20 boundary on `e1-dry-gulch` — secured, wave 20 — and the row **cannot
exist**. Retained, unedited, in the merge:

- the POST response, verbatim: `{"ok":false,"error":"bad_payload","message":"Standing not accepted."}`
- the slip: `"httpStatus": 400`, `"assay": "not-queued"`, `"ranked": false`
- the mechanism, from the operator's own note: the tape carries `durationTicks: 18001` with
  `SECURE_CHOICE` at tick `18000`.

I verified the other half in the code rather than inheriting it: **`functions/api/standings.ts:1051`
is `integerInRange(value.durationTicks, 0, 18_000)`** — inclusive. A run that plays all the way to
the horizon writes horizon+1 and is refused, and production returns only a generic `bad_payload`
that names nothing.

⚠️ **THIS IS F-ASSAY-E2E-2 WEARING A DIFFERENT FIELD, AND THE BACKLOG RECORDS THAT FINDING AS
CURED.** That finding was *"the documented SECURE_CHOICE verb records at t=durationTicks, one past
the validator cap → the door's own grammar 400s"*, and the cure is logged as *"the SECURE_CHOICE cap
honest."* **The cure worked — and only on the half it named.** The `SECURE_CHOICE` tick is now 18000,
inside the cap; `durationTicks` is 18001, outside it. The defect did not survive the cure, it
*relocated*: from the event's tick to the duration field one line over.

⚖️ **SEVERITY, STATED HONESTLY AND BOUNDED BY A CONTROL RATHER THAN INFLATED: this does NOT refuse
every wave-20 run.** Heat-1's `e1-dry-gulch` secured at wave 20 and **verified** (`fnv1a32:08ad7db2`)
in the same season on the same seed at the same build. So the trigger is not the wave — it is
**securing at the final tick**, i.e. running to the horizon instead of banking before it. That
narrows the class and makes it *worse*, not better: **the harder a rider plays, the more likely the
door is to refuse it**, and the refusal is a generic `bad_payload` that tells them nothing.

➡️ **CORRECTIVE OWED — fire-authorable, no owner word needed** (it is a boundary repair, not a
fairness ruling): decide at which end the off-by-one is wrong — either `gr-sim` should record
`durationTicks: 18000` for a run that ends at the horizon, or the validator's range should be
`0..18_001` — and fix **that** end, with a test that posts a horizon-secured tape. ⚠️ **Do not fix it
by widening the cap without deciding which is authoritative**, and do not let a passing generic
`bad_payload` stand in for a reason: the reason the guest could not self-diagnose this in a 19-minute
run is that the door refused without naming the field.

ⓘ **Three further door findings from the guests, all kept and none blocking:**

1. **The turn terminator is operationally ambiguous** — `skill.md` says one JSON array + newline; the
   charter/L3 pattern says an empty line ends a turn. Direct PTY attempts stalled in **all three
   arms**; OpenClaw's two-newline adapter recorded stale/defaulted upgrades. **This is heat-1's
   finding #1 reproduced independently by three more riders**, which upgrades it from one rider's
   nit to a measured property of the door. The example and the sentence must agree.
2. **Hill Mine's published coal is not actionable from the public grammar** — Luna found
   `stablePrefix.map.coalSeams`, `HARVEST` on those published ids was refused, and the manual names
   no coal-specific order. All three riders ended at waves 1–3. *(Note it rides on top of F-2270-3:
   Hill Mine is an E2 contract that was in this program only because the heat-1 master listed it as
   E1.)*
3. **Harness provenance and setup overhead are first-class results** — Hermes spent 3.76M tokens for
   seven terminal tapes; OpenClaw refused Node 23 and loaded an unrelated global workspace prompt.
   Both still completed without operator-written orders, which is the operability axis answering
   *yes, expensively*.
