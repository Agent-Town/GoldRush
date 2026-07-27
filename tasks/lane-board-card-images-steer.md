# Task lane-board-card-images-steer (rf-37 site 10): THE LAST BLIND TIMED TOWN WALK — CONVERT IT BEFORE IT FLAKES

**FIRE-AUTHORED (attended review welcome) — s1113, 2026-07-27.** This is the tenth and final site of rf-37's
nine-site sweep, which shipped at **`e52b4fde`**. The runner that did those nine named this one as owed and
now-unblocked in its own closing report: *"`board-card-images` site 10 remains an owed, now-unblocked corrective."*

You are Codex (worktrees/lane-a).

CODEX: model=gpt-5.6-sol effort=medium

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4).
> `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run
> falls back to `effort=medium` without telling anyone.

## ⚠️ READ THIS FIRST — THIS TEST IS **GREEN** TODAY. THAT IS THE POINT, AND IT SETS YOUR BAR.

s1113 measured it on a quiet box at `--workers=1` before authoring this task:
**`board-card-images.spec.ts:8` PASSES in 6.1s.** You are **not** fixing a failure. You are removing a
**latent race** from a passing test, and the *only* acceptable outcome is that it still passes.

**If your change makes it red, you have failed the task — revert and STOP.** Do not "fix" the newly-red
test by touching anything else.

## WHY (the evidence chain, quoted)

`e2e/board-card-images.spec.ts:17-18` walks to the tavern by wall clock:

```ts
await hold(page, 'KeyA', 850);
await hold(page, 'KeyW', 850);
await expect.poll(() => ...activePrompt, { timeout: 8_000 }).toBe('tavern');
```

`hold()` (`:59-62`) presses a key, waits a fixed 850 ms, then **releases it** — and only *then* does the
poll start looking for arrival. Once the key is up nothing moves, so the poll can only ever observe a hero
who already arrived. Under load fewer frames render inside a fixed `waitForTimeout`, less distance is
travelled, and the poll times out against a hero standing still. **A bigger number changes the odds, not
the shape** — this is rf-37's verbatim finding, and raising `850` or `8_000` is a FIREWALL VIOLATION here.

That this test is green today only means the race has not yet been lost on this box. s1113's own drains
watched contention fake **five** reds in a single battery (F-1113-4), including a guard the slice never
touched. This is exactly the class of latent timing debt that turns a gate battery into a coin toss.

## THE CURE — COPY THE MERGED PATTERN, DO NOT INVENT ONE

The pattern below is **already on main** at `e2e/town-t1-square.spec.ts:47-64` (merged `e52b4fde`).
Read that file first and mirror it. Resolve the target against **`plaza.slots`** — *not* `buildings`
(`stamp-mill` is not a legal `TownBuildingId`; two prior attempts stopped lawfully on that exact confusion,
see F-1111-1). `tavern` is present in both, but stay consistent with the shipped nine.

```ts
const target = await page.evaluate((id) => {
  const diagnostics = window.__GR_TOWN_DIAGNOSTICS__!;
  const slot = diagnostics.plaza.slots.find((candidate) => candidate.id === id);
  return slot?.approach ?? slot?.position;
}, 'tavern');
if (!target) throw new Error('tavern is absent from town plaza diagnostics');
for (let step = 0; step < 48; step += 1) {
  if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === 'tavern') break;
  const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.player);
  const keys: string[] = [];
  if (Math.abs(target.x - position.x) > 0.6) keys.push(target.x > position.x ? 'KeyD' : 'KeyA');
  if (Math.abs(target.z - position.z) > 0.6) keys.push(target.z > position.z ? 'KeyS' : 'KeyW');
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(160);
  for (const key of keys.reverse()) await page.keyboard.up(key);
}
```

Keep the existing `expect.poll(...).toBe('tavern')` assertion at `:19` **exactly as it is** — it is the
arrival proof and it must stay.

## SCOPE (numbered, each testable)

1. In `e2e/board-card-images.spec.ts`, replace the two `hold(...)` calls at `:17-18` with the
   steer-to-arrival loop above, targeting `'tavern'` via `plaza.slots`. **No coordinate literals. No
   teleport. No `page.evaluate` that sets player position directly.**
2. Delete the now-unused `hold()` helper at `:59-62` **only if nothing else in the file calls it.**
   Grep first. If anything still calls it, leave it and say so in your report.
3. Add **no** new imports unless step 1 genuinely requires one (it should not — the file already has
   `type Page` and `expect`).

## FIREWALL

**TOUCH-ONLY:** `e2e/board-card-images.spec.ts`

**NO — stopping conditions, each a lawful STOP, not a failure:**
- **NO `src/**` changes of any kind.** If `plaza.slots` lacks `tavern` at runtime, **STOP and report** —
  do not add it. That would be a product change wearing a test's clothes.
- **NO** other `e2e/` file. The other nine sites already shipped at `e52b4fde`.
- **NO** raising `850`, `8_000`, `48`, `160`, or `0.6` to make something pass.
- **NO** touching the frozen `contract-chapter-tab-epoch-2-steamworks` literal at `:35`. It is
  **deliberate** — that assertion checks one specific chapter's art (`e2-trestle`), so the literal is the
  point, not debt. Leave it alone.
- **NO** touching `seedProfile()` (`:40-52`). It omits the epoch key on purpose: the test opens every
  chapter via `?debug&epoch=epoch-10-deepsky` at `:14`, so F-1112-1's scoped-seed cure does **not** apply
  here and adding it would be cargo-culting.

## PRE-FLIGHT (run these, in order, and STOP if any fails)

Measured by s1113 at author time — **re-confirm, do not trust**:
- `lane/m3` was `2a31504c`, **1 ahead of main but its content is fully merged** (rf-37 landed `e52b4fde`;
  `git diff main lane/m3 -- e2e/072-era-activation.spec.ts …` is empty for all seven rf-37 files).
  **The reset below is therefore loss-free.** Re-verify before resetting:

```
git -C worktrees/lane-a fetch --all
git -C worktrees/lane-a diff main lane/m3 -- src/ e2e/     # expect: EMPTY or main-newer only
```

- If that diff shows **lane-only content that is not on main**, **STOP** — a predecessor is undrained and
  `reset --hard` would destroy it (this is the w1-03 / polish-02 loss, Mistake #2).
- Otherwise reset to current main and confirm `e2e/board-card-images.spec.ts` matches main byte-for-byte.
- **Run the test BEFORE you edit it** and bank the result. It must be green (s1113 measured 6.1s). If it is
  already red on your box, **STOP and report** — the premise of this task is gone.

## SELF-CHECK (name the numbers in your report)

1. `npx tsc --noEmit` — clean. (`tsconfig.json` includes `e2e`, so this is a real gate here.)
2. `npm run build` — green.
3. `npx playwright test --project=desktop-chrome e2e/board-card-images.spec.ts --workers=1` —
   **must pass**, and report its duration against the 6.1s banked baseline.
4. Same spec on `--project=mobile-chrome --workers=1` — report pass/fail either way.
5. **Repeat the desktop run 3×** and report all three. A steer fix that passes once proves nothing; the
   whole point is flake removal. Report the durations, not just "green".
6. Zero console/page errors — the spec already asserts `expect(errors).toEqual([])` at `:37`; confirm it
   held.
7. `git diff --stat` — **exactly one file changed.** Paste it.
8. Confirm no coordinate literal and no teleport was added (`git diff` and say so explicitly).

⚠️ **Use `--workers=1` for every measurement above.** s1113's F-1113-4: at the default worker count on a
loaded box this repo's specs redden for contention alone, and a false red here would send the next fire
chasing a bug that does not exist.

**READY-FOR-GATES** — report: the before/after durations across all three desktop repeats, the mobile
result, the one-file diffstat, whether `hold()` was removable, and anything you observed about
`plaza.slots` that the next author should know.
