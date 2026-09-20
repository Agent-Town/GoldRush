# Task f1615-1: re-scope the ten town-*-blender specs from REQUEST-laziness to MOUNT-laziness, and remove the two-id prefetch exclusion (LANE-A, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1615, 2026-08-10. Authored under the owner's 2026-08-09 ruling on F-1167-1, which names this work "FIRE-AUTHORABLE, one master".

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md:1461` (the F-1167-1 row — its mechanism paragraph and the owner ruling at its tail); `src/assets/AdvanceStream.ts` (lines 34–75, 185–232, 246–253); `src/town/TownTavernPilot.ts` (lines 8–57).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-a status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (owner ruling 2026-08-09, verbatim; mechanism re-measured and REPRODUCED s1615 2026-08-10)

The owner's ruling on F-1167-1, verbatim from `tasks/BACKLOG.md:1461`:

> ⚖️ **OWNER RULED 2026-08-09: "Prefetch wins" — branch (a): re-scope the eight `toEqual([])` specs to MOUNT-laziness and REMOVE the two-id exclusion at TownTavernPilot.ts:49 (stamp-mill + dynamo_hall get the warm-town benefit). FIRE-AUTHORABLE, one master; F-1532-2's walkthrough table unblocks behind it (author as-is once this merges).**

The prefetch is itself a verbatim owner directive (BACKLOG:879). Under "prefetch wins", **a GLB request is EXPECTED behaviour, so an assertion that no request was made is asserting the wrong thing.** What these specs should still protect is that the heavy 3D model is not *mounted* / rendered until it is needed — the facade stays up, the pilot state stays `off`/`lite`, and the render source stays `facade`.

**The contradiction is still live TODAY — verified by execution this fire, not inherited (s1614 asked for exactly this check and could not run it).** Run on main at 127.0.0.1:5188, `--project=desktop-chrome --workers=1`:

- `e2e/town-tavern-blender.spec.ts:205` ("LITE tier always keeps the facade and never fetches the GLB") **FAILED**, received `["http://127.0.0.1:5188/assets/pilots/tavern-3d/town-v3-tavern.glb"]` against expected `[]`.
- `e2e/town-tavern-blender.spec.ts:154` ("Tavern pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate") **PASSED** in the same run.

**NEW MECHANISM DETAIL — this is the part the F-1167-1 row does NOT record, and you need it to avoid "fixing" the wrong thing.** The request that breaks these specs arrives during the **MENU** phase, not the town phase:

1. Each spec's `openTown` helper boots with a bare `await page.goto('/')` (`e2e/town-tavern-blender.spec.ts:81` and the same line in all ten specs). At that moment `window.location.search` is EMPTY.
2. Booting the menu calls `advanceStream.enter({ kind: 'menu' })`, and `advanceStreamPriority` adds the town at priority 1 — `src/assets/AdvanceStream.ts:62-63` (`if (scene.kind === 'menu') { add('town', 'town', 1); ... }`).
3. The gate `threeDimensionalAssetsEnabled()` (`src/assets/AdvanceStream.ts:250-252`) reads `window.location.search` **at enter time** and is therefore OPEN on a bare `/` — no `terrain2d`, no `tier=lite`.
4. `townPrefetchUrls()` (`src/town/TownTavernPilot.ts:43-57`) returns bare `new URL(...).href` values with **no query string**, which is exactly what every spec's collector counts (`if (!url.search && ... endsWith('.glb'))`).
5. Only afterwards does the helper `history.replaceState` to `?terrain2d` / `?...&tier=lite` and click enter-town. That correctly disables *subsequent* prefetch, but it cannot un-issue the menu's.

**Consequences you must not get wrong:**
- The `tier=lite` failures are **NOT** a defect in the lite gate. The lite gate works; the request predates it. Do not "fix" the lite gate.
- The specs' existing `?terrain2d` default and `!url.search` filter are **correct for the town phase** and are not the bug. Do not remove them.
- Because it is a race between the menu prefetch and the assertion, these tests are **intermittent**: the site that asserts sooner (`:154`) passes more often than the one that waits 500 ms (`:205`). Historical blast radii agree — 20.4% vs 81.8% (`node scripts/red-inventory-lookup.mjs e2e/town-tavern-blender.spec.ts`). **A single green run is therefore NOT evidence that a site is fixed.**

Removing the exclusion at `src/town/TownTavernPilot.ts:49` (`.filter(([id]) => id !== 'stamp-mill' && id !== 'dynamo_hall')`) puts stamp-mill and dynamo-hall into the prefetch set for the first time, which is the owner's stated intent ("get the warm-town benefit"). **That will newly expose the two specs that are green today** — so all ten specs are in scope, not eight.

## Scope

1. **Remove the two-id exclusion** at `src/town/TownTavernPilot.ts:49` so `townPrefetchUrls()` includes `stamp-mill` and `dynamo_hall`. This is the only source change in this task.

2. **Re-scope every REQUEST-laziness assertion in the ten `e2e/town-*-blender.spec.ts` files to MOUNT-laziness.** These are the `expect(requests).toEqual([])` / `expect(modelRequests).toEqual([])` sites. Each must be replaced by an assertion that the model is not *mounted*, using the observable each spec already has to hand — the canvas attributes `data-town3d-pilot-state` (`off` / `lite`) and `data-town3d-pilot-render-source` (`facade`), and where the spec already uses it, `window.__GR_TOWN_DIAGNOSTICS__` visibility. Known sites (verify each, they may have drifted):
   - `e2e/town-tavern-blender.spec.ts:154` + `:205` — titles "Tavern pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate" and "LITE tier always keeps the facade and never fetches the GLB"
   - `e2e/town-plate-blender.spec.ts:71` + `:124` — "Town plate is lazy, contract-valid, keeps actors planar, and mounts in the owner all-view" and "LITE keeps painted ground and never fetches the Town plate"
   - `e2e/town-plaza-props-blender.spec.ts:48` + `:70` — "plaza props stay lazy by default and mount every layout instance with one fetch per family" and "LITE props make no model requests"
   - `e2e/town-assay-office-blender.spec.ts:150` ("Assay Office pilot is lazy, contract-valid, visual-only, and stays inside the …") + `:202` ("LITE tier always keeps the Assay Office facade and never fetches the GLB")
   - `e2e/town-chapel-blender.spec.ts:154` ("Chapel pilot is lazy, contract-valid, visual-only, and stays inside the frame-time …") + `:207` ("LITE tier always keeps the Chapel facade and never fetches the GLB")
   - `e2e/town-claim-office-blender.spec.ts:154` ("Claim Office pilot is lazy, contract-valid, visual-only, and stays inside the …") + `:205` ("LITE tier always keeps the Claim Office facade and never fetches the GLB")
   - `e2e/town-general-store-blender.spec.ts:156` ("General Store pilot is lazy, contract-valid, visual-only, and stays inside t…") + `:207` ("LITE tier always keeps the General Store facade and never fetches the GLB")
   - `e2e/town-schoolhouse-blender.spec.ts:154` ("Schoolhouse pilot is lazy, contract-valid, visual-only, and stays inside the f…") + `:206` ("LITE tier always keeps the Schoolhouse facade and never fetches the GLB")
   - `e2e/town-dynamo-hall-blender.spec.ts:116` ("LITE never mounts the Dynamo Hall GLB") + `:124` ("a pre-T2 profile never renders or mounts the 3D Dynamo Hall") — both re-based s1618 after this master's own slice shipped at `bbc35cc0b`; they read `:119`/"never **requests**" and `:130`/"renders or **requests**" when this was written, which is exactly the change this scope ordered
   - `e2e/town-stamp-mill-blender.spec.ts:158` ("Stamp Mill pilot is lazy, contract-valid, visual-only, and stays inside the fra…") + `:207` ("LITE tier always keeps the Stamp Mill facade and never fetches the GLB") + `:232` ("a pre-complete Stamp Mill never mounts its 3D model")

   **Where a test's TITLE claims something the re-scoped body no longer asserts (e.g. "never fetches the GLB", "never requests"), rename the title to state what it now checks** (e.g. "LITE tier always keeps the facade and never MOUNTS the GLB"). A title that lies is a worse defect than the one you are fixing.

3. **Make the COUNT assertions prefetch-aware.** `expect(modelRequests).toHaveLength(1)` (`e2e/town-tavern-blender.spec.ts:166`, in "Tavern pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate"), `expect(requests).toHaveLength(1)` (`e2e/town-plate-blender.spec.ts:81`, in "Town plate is lazy, contract-valid, keeps actors planar, and mounts in the owner all-view"), and `expect(requests).toHaveLength(3)` plus the per-family loop (`e2e/town-plaza-props-blender.spec.ts:58-59`, in "plaza props stay lazy by default and mount every layout instance with one fetch per family") — all three re-based s1618 after `bbc35cc0b` shipped this very scope, which rewrote them to `expect(new Set(…).size).toBe(n)` and shifted each up one line run AFTER a prefetch-ENABLED `tier=full` navigation and will now count prefetch traffic alongside the demand load. Re-scope them so they express the real invariant — **one fetch per model family, counted over DISTINCT urls** — rather than a raw request count. **Report the measured before/after counts for each of these four sites in your report.**

4. **No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

**Touch ONLY:** the ten `e2e/town-*-blender.spec.ts` files (`assay-office`, `chapel`, `claim-office`, `dynamo-hall`, `general-store`, `plate`, `plaza-props`, `schoolhouse`, `stamp-mill`, `tavern`); and `src/town/TownTavernPilot.ts` **line 49 only** (the `.filter(...)` exclusion).

**NO changes to:**
- `src/assets/AdvanceStream.ts` — the prefetch policy is a ratified owner directive and the subject of this measurement. If you believe it is wrong, that is a FINDING for your report, not an edit.
- `e2e/asset-diet.spec.ts` — **explicitly out of scope by the F-1167-1 row's own warning.** Its `townResponseBytes < 25_000_000` budget (`e2e/asset-diet.spec.ts:256`, in "town cue-window budget through player entry" — the 2026-09-05 deploy-probe cue split moved the budget assertion out of the old "honest town and claim cues…" test into this one) is a separate, real regression. Removing the exclusion adds two more prefetched models and may push it further red: **observe and report the number, do not fix it and do not re-pin it.**
- The specs' `?terrain2d` helper default, their `!url.search` collector filter, and their `page.goto('/')` boot — these are correct for the town phase (see Why). Changing them would suppress the prefetch and make the specs test a configuration no player is in, which is the opposite of the owner's ruling.
- Sim semantics; any other file under `src/`; any other `e2e/*.spec.ts`; `playwright.config.ts`; `package.json`; `tasks/**`; `scripts/**`.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- **All ten `town-*-blender` specs green, BOTH projects (`desktop-chrome` and `mobile-chrome`), with `--workers=1`** (fire/lane law §3.1 — pass it explicitly).
- **Because these sites are a RACE, run the ten specs `--repeat-each=3` and report the pass/fail tally per site.** A single green run is not evidence. If any site is bimodal, say so plainly with the numbers rather than declaring it fixed.
- Adjacent suites, unmodified-green both projects, named: `e2e/story-loop.spec.ts`, `e2e/ts-01-plaza-ground.spec.ts`, `e2e/town-t4-growth.spec.ts`, `e2e/beauty-town.spec.ts`. Run `e2e/asset-diet.spec.ts` too and **report its `townResponseBytes` number before and after your change** (it may be red both before and after — that is expected and is NOT yours to fix).
- Zero console/page errors in every spec that collects them.
- Screenshots to the paths the specs already use (`artifacts/**`, `reviews/shots-*`); no new screenshot destinations.

End: **READY-FOR-GATES** + report: (a) the per-site `--repeat-each=3` tally for all ten specs; (b) the four measured before/after request counts from scope item 3; (c) the `asset-diet` `townResponseBytes` before/after; (d) any test whose TITLE you renamed and why; (e) anything you believe is a defect in `AdvanceStream.ts` that you did NOT edit because of the firewall.
