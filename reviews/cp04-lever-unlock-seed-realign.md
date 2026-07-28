# CP-04 Lever unlock-seed realign — STOPPED LAWFULLY at scope 1(d), report landed

**Slice:** `lane-a-cp04-lever-unlock-seed-realign`
**Branch / tip:** `lane/m3` @ `65041a9c` (one commit: the 72-line run report — zero `src/`, zero `e2e/`, zero assets)
**Merged:** `556f0789`
**Drained by:** s1179 fire, 2026-07-28
**§3.0 `drain-block-check`:** `✅ CLEAR — lane-a-cp04-lever-unlock-seed-realign.md [factory-cp04-lever-unlock-seed-realign] status="queued"`, run as the first command of the drain.

## Verdict

**ACCEPTED AS A LAWFUL STOP.** The master's scope 1 was a mandatory observe-the-defect STOP
with a written classification fork, and it explicitly declared **(b) something else** a
lawful outcome. The runner observed, classified (b), applied nothing, and reported. That is
the gate working exactly as designed — and it is worth more than a cure would have been,
because the cure the authoring fire had in mind was **wrong**.

## What it found

The **shape** F-1178-1 measured is confirmed: `e2e/cp04-lever.spec.ts` runs **16 failed / 8
passed** at `--workers=1`, both projects, same split — the two `the-claim` seeded boots green,
all seven non-`the-claim` seeded boots red, plus the press-through test.

The **mechanism** is refuted. F-1178-1's hypothesis was a silent fallback to
`DEFAULT_CONTRACT_ID` behind the 07-23 unlock gate. The observation says otherwise:

```text
expected: The Dry Gulch — Build Something Big
actual:   The Dry Gulch
activeId: e1-dry-gulch
```

`activeId` is the **requested** contract. Nothing fell back. What is lost is only the
**charter-composed name** — the `Land — Story` half of it — and the same shape repeats across
the others (`Night Shift — …` → `Night Shift`, `Twin Banks — …` → `Twin Banks`,
`The Baron's Claim — …` → `The Claim-Jumper Baron`). A test cure that seeded the unlock state
would therefore have papered over a defect it does not touch.

✓ The diagnostic was temporary and removed: `git diff -- e2e/cp04-lever.spec.ts` is empty, and
`git status --porcelain` is empty for both `src/` and `assets/`.

## Findings

**F-1179-3 (measured, fire-authorable as a successor) — the seeded-boot reds are a
charter-name composition loss, not a contract fallback.** Seven of nine seeded boots render
the contract's shipped **base** name where the spec asserts the **composed** name, with the
correct `activeId` underneath. The successor master must start where this one stopped: the
composed name is produced by the charter composer and read back at `src/ui/Hud.ts:329`, and
the open question is which of the two sides drops the story half on a seeded boot. ⛔ Do not
revive this leaf — its question was answered; author a **successor** (F-1176-4's guard will
say `CLOSED` here, and this time that advice is correct).

**F-1179-4 (OWNER'S DESK — design fork, explicitly NOT fixed, as the master ordered) — the
Charter Press Lever offers five lands and honours the choice only in name.** `src/charter/
PressPanel.ts` renders all five `LEVER_LANDS` cards unconditionally and **neither imports nor
calls** `contractUnlockStatus`. In the press-through test a player picks Twin Banks, is told
`Stamped! Opening your world…`, navigates to a URL still requesting `contract=e1-twin-banks`
— **and the briefing then says `The Claim`.** So there IS a fallback, but it lives in the real
press path, not in the seeded boots. Whether the Lever should hide locked lands, show them
locked, or unlock on press is an owner design fork (§2E hard limit); the fire is not choosing.
⚠️ Note it is entangled with F-1179-3 above: an unlock-seed-only test cure would **conceal**
this rather than explain it, which is precisely why the STOP was the right call.

## Evidence

No gate battery was run and none was owed — the merge is a report, with zero `src/`, `e2e/`
and `assets/` changes (verified on the merged tree, not read off the report). The runner's own
environment record: baseline build **15.55 s** green, `uptime` load **8.45 → 4.56** across the
9.1-minute spec run, `--workers=1` stated (F-1173-5).

Merge classification: one file, `tasks/runs/20260728-183927-…`, **new on main**, no
MAIN-MOVED counterpart, no graft. Pre-flight was safe by the unique-blob invariant —
`git diff --name-only --diff-filter=A main..lane/m3` was empty before the runner's reset.
