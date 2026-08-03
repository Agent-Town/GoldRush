CODEX: model=gpt-5.6-sol effort=high
# lane-a-f1429-1-uninspectable-fixture-signal — the never-electric guard reports its blind spot by throwing, on a code path every player boots through (F-1429-1)
FIRE-AUTHORED s1430 (attended review welcome)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.

WHY (F-1429-1, measured s1429 while draining `f1428-2`; the blast radius below was measured by forcing the throw and booting the town, not reasoned about):

`f1428-2` cured the owner's F-BW-3 clause — *"E1 town must read FLAME, never electric — audit all
glow elements"* — whose guard could not fire. The old filter opened `if (!material.isMeshBasicMaterial) return false;`
so every fixture was discarded **before its colour was examined**, and the counter was structurally
`0` for any colour. **That cure is correct and must not be undone.**

The master rightly forbade a silent `return false` and ordered that a guard which cannot see its
subject must SAY so. The runner obeyed with a `throw`. The problem is *where that throw executes*:

- `townLightDiagnostics()` is **not test-only**. It is reached from `publishDiagnostics()`, which
  has **no debug gate** and is called from ~20 sites **including the town boot path**.
- So the throw runs in **every normal player session**, not only under a spec.

s1429 forced it and booted the town. The result was not a graceful red:

```
[Unhandled rejection] Error: PROBE-s1429 uninspectable fixture TownPropLanternGlow
Test timeout of 90000ms exceeded  (page.waitForFunction)
```

**The town never finishes mounting.** A diagnostics concern became a hung boot.

Today it cannot fire — both fixtures carry `.color`. The hazard is **latent**: one future swap to a
colourless material type (`ShaderMaterial`, `MeshDepthMaterial`, a custom shader on the beads) turns
an audit signal into **player-facing town breakage**. This is CLAUDE.md Mistake #10 inverted —
debug-only code reaching the player.

⚠️ **This is NOT runner disobedience.** It is the ordered cure meeting a call graph the master did
not account for. The fix is to keep the guard **loud to the specs and silent to the player**.

READ-FIRST (paths — open each one, do not work from this summary):
- `src/town/TownScene.ts` — `townLightDiagnostics()` and the `lightGrammar` diagnostics type.
  Cite BY CONTENT per F-1310-1, and grep each of these before you start:
  - `      if (!color) throw new Error(` (expect **1**) — the line this task replaces.
  - `      coolWhiteEmissiveFixtures: number;` (expect **1**) — the type block you extend.
  - `        lightGrammar: this.townLightDiagnostics(),` (expect **1**) — the publish site that
    proves this runs outside tests.
- `e2e/beauty-town.spec.ts` — the two `toMatchObject` blocks on `town.dressing.lightGrammar`, one
  in the day-boot test and one in the `?townDusk` test. Grep `    coolWhiteEmissiveFixtures: 0,`
  (expect **2** — day and dusk; both are yours to extend).
- `reviews/f1428-2-never-electric-guard.md` — the slice this ladders from, and the reason the
  counter exists at all.
- `tasks/BACKLOG.md` finding **F-1429-1** — grep `THE ORDERED CURE IS LOUD IN THE ONE PLACE` (expect **1**).
ⓘ This lane was refreshed to main by s1430 immediately before dispatch, and every grep above was
verified to return the stated count **on main and in this lane** before the queue copy. **If any
grep returns 0, STOP and report — the lane drifted after dispatch and the premise needs re-checking.**

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
> **FACTORY-CHURN EXCEPTION (F-1407-1) — ALWAYS EXPECTED, NEVER A STOP; list them and proceed:** `logs/**` (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`) and `artifacts/**` / `reviews/shots-*` / any `.png`. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

SCOPE (each item separately checkable):

1. **REPLACE THE THROW WITH A COUNTED SIGNAL.** In `townLightDiagnostics()`, a fixture whose
   material carries no `.color` must **no longer throw**. Count it instead, and report the count as
   a new `uninspectableFixtures` field on the `lightGrammar` diagnostics object (add it to the type
   beside `coolWhiteEmissiveFixtures`).
   ⚠️ **An uninspectable fixture must NOT be counted as cool-white, and must NOT be silently
   dropped from the denominator without being counted somewhere.** The whole finding is that a
   fixture the guard cannot see must remain *visible as such*.

2. **ASSERT IT IN BOTH BEAUTY-TOWN LIGHT-GRAMMAR BLOCKS.** Add `uninspectableFixtures: 0` to the
   `toMatchObject` in the day-boot test **and** in the `?townDusk` test — the same two places that
   already assert `coolWhiteEmissiveFixtures: 0`. A guard nobody asserts on is the F-1428-2 defect
   returning in a new costume.

3. **ACCEPTANCE IS A MANUFACTURED RED *PLUS* A SURVIVING BOOT — BOTH ARMS, NOT ONE.** In the
   report, show:
   a. **The red:** force one fixture's material to a colourless type (or delete its `.color`),
      then state `uninspectableFixtures` **non-zero** and the beauty-town light-grammar assertion
      **RED**, quoting the assertion message.
   b. **The boot survives:** in that same forced state, the town **still finishes mounting** —
      **no unhandled rejection, and no `waitForFunction` timeout.** Quote the console/page error
      arrays. This is the entire point of the finding: s1429's probe produced
      `[Unhandled rejection] … uninspectable fixture TownPropLanternGlow` followed by
      `Test timeout of 90000ms exceeded`, and a fix that still hangs the boot has fixed nothing.
   c. **Restored:** `uninspectableFixtures` back to **0**, both beauty-town tests green.
   d. Probe **reverted**, `git diff` empty on `src/` and `e2e/` afterwards.
   ⚠️ **A report showing only passing tests is a pre-declared REJECT.** A passing guard never
   executes its violation path.

4. **PROVE YOU DID NOT RE-OPEN F-1428-2.** With the tree restored, run the s1429 probe once more:
   set the E1 `lanternGlass` to a cool white and confirm `coolWhiteEmissiveFixtures` still reports
   **2 at day and 2 at dusk** and the tests still go **RED**. State the denominator.
   Then **revert it** — this is a probe, not a change.

TOUCH-ONLY:
- `src/town/TownScene.ts` — `townLightDiagnostics()` and the `lightGrammar` diagnostics type only.
- `e2e/beauty-town.spec.ts` — the two light-grammar `toMatchObject` blocks only.

NO (firewall — report, do not fix):
- 🚫 **Do NOT restore `return false` in the fixture filter.** That re-opens F-1428-2 exactly: a
  guard that silently reports `0` while blind. The cure is a counted sentinel, not a quieter guard.
- 🚫 **Do NOT change any `townEraAccents` colour, opacity, intensity or flicker value, nor the
  era→family mapping.** The owner ruled on how the town LOOKS and it shipped; changing a colour to
  move a test inverts the task.
- 🚫 **Do NOT add either counter to the E3/Voltage test.** Arc light is *supposed* to read cool and
  pale; asserting `0` cool-white fixtures there would encode the opposite of the owner's grammar.
  If you believe E3 needs an assertion, **STOP and report** — do not choose.
- 🚫 Do NOT add a debug gate to `publishDiagnostics()` as the fix. The diagnostics object is
  consumed by specs on the plain boot path; gating it would blind every town spec at once. If you
  think this is the right shape, **STOP and report** rather than doing it.
- Any other `src/**`, `e2e/**` or `scripts/**` file; `playwright.config.ts`; `package.json`.

SELF-CHECK before READY-FOR-GATES (name the real numbers):
- `npx tsc --noEmit` → rc 0.
- `npm run build` → green.
- `npx playwright test e2e/beauty-town.spec.ts --workers=1` → state pass counts, **both projects**.
- `npx playwright test e2e/town-era-switch.spec.ts --workers=1` → state pass counts, both projects.
- The scope-3 red / surviving-boot / restored triple, quoted verbatim.
- The scope-4 denominator (`2` day, `2` dusk) and its red.
- `git diff -- playwright.config.ts package.json scripts` → **EMPTY**.
- Console and page error arrays asserted `[]` in the specs you ran.

READY-FOR-GATES + report: the scope-3 triple verbatim (especially the boot-survives evidence), the scope-4 denominator, the two suites' pass counts on both projects, and anything you had to STOP on.
