import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const i = lines.findIndex((l) => l.startsWith('🔺 **F-1167-1 — OWNER'));
if (i < 0) {
  console.error('F-1167-1 row not found');
  process.exit(1);
}

let row = lines[i];
row = row.replace(
  /^🔺 \*\*F-1167-1 — OWNER'S DESK, A FORK, NOT A REPAIR:/,
  "🔧 **F-1167-1 — RULED 2026-08-09, NOW WORK NOT A QUESTION (head flipped 🔺→🔧 s1615; the fork text below is kept verbatim as provenance):",
);

row +=
  ' ✅ **PRECONDITION DISCHARGED s1615 (2026-08-10) — THE CONTRADICTION IS STILL LIVE, REPRODUCED RATHER THAN INHERITED.**' +
  ' s1614 carried this item forward with an explicit caveat — *"MEASURE BEFORE AUTHORING: confirm those eight assertions are actually still present and still contradicting (I did not run that suite — it is a claim from F-1167-1\'s own text)"*.' +
  ' s1615 ran it: `e2e/town-tavern-blender.spec.ts:205` ("LITE tier always keeps the facade and never fetches the GLB") **FAILED** on main, desktop-chrome, `--workers=1`, received `["http://127.0.0.1:5188/assets/pilots/tavern-3d/town-v3-tavern.glb"]`;' +
  ' its sibling `:154` ("Tavern pilot is lazy, contract-valid, visual-only, and stays inside the frame-time gate") **PASSED in the same run** — the timing gradient this row\'s own blast radii predicted (81.8% vs 20.4%).' +
  ' 🔑 **NEW MECHANISM THIS ROW DID NOT RECORD, and it changes what a runner must NOT touch: the offending request is issued in the MENU phase, not the town phase.**' +
  ' `advanceStreamPriority` adds the town at priority 1 for `scene.kind===\'menu\'` (`src/assets/AdvanceStream.ts:62-63`), and the gate `threeDimensionalAssetsEnabled()` (`:250-252`) reads `window.location.search` **at enter time** — which is EMPTY on the specs\' bare `await page.goto(\'/\')` (all ten specs).' +
  ' The helper\'s later `history.replaceState` to `?terrain2d` / `tier=lite` correctly disables *subsequent* prefetch but cannot un-issue the menu\'s.' +
  ' ⚠️ **Therefore the `tier=lite` failures are NOT a lite-gate defect, and the specs\' `?terrain2d` default and `!url.search` collector filter are NOT the bug** — a fire "fixing" the helper would suppress the prefetch and make the specs test a configuration no player is in, i.e. the opposite of the ruling. The cure is the ASSERTIONS, exactly as the owner ruled.' +
  ' 🆕 **AUTHORED: `f1615-1-prefetch-wins-mount-laziness` → lane-a, QUEUED** (scope covers **ten** specs, not eight — removing the `:49` exclusion newly exposes `stamp-mill` and `dynamo-hall`, which are green today only because they are excluded).' +
  ' 🔻 **DESK-DROPPED s1615: this is work with a ruling behind it, not a question awaiting a word.**';

lines[i] = row;

const newRow =
  '🟢 **F-1615-1 (s1615 2026-08-10, MEASURED BY EXECUTION ON A BOARD WITH NO DRAIN — AN INHERITED "STRONGEST LEAD" WAS RIGHT ABOUT THE DEFECT AND WRONG ABOUT ITS LOCATION, AND ACTING ON IT AS WRITTEN WOULD HAVE CURED THE WRONG SURFACE.)**' +
  ' 🧭 **HOW IT AROSE:** s1614 handed over NEXT (C) — *"prefetch wins" means the eight `town-*-blender` specs\' `expect(requests).toEqual([])` assertions are what gives* — with an honest caveat that it had not run the suite. Verifying instead of inheriting (Mistake #4) turned up three facts.' +
  ' ⓵ **The 16 `toEqual([])` assertions are NOT reachable by the TOWN prefetch at all:** every one sits behind a prefetch-DISABLED query — the helper defaults to `?terrain2d` (`e2e/town-tavern-blender.spec.ts:77` and the same line in all eight) or the test passes `tier=lite`, and `src/assets/AdvanceStream.ts:250-252` disables the stream on exactly those two flags (`:217-218` then leaves `targets=[]`).' +
  ' A static reader stops here and concludes the contradiction was already reconciled. **That conclusion is wrong**, which is why the run mattered.' +
  ' ⓶ **The leak is the MENU boot.** All ten specs boot with a bare `await page.goto(\'/\')`; the gate reads `window.location.search` at enter time and is OPEN there; `advanceStreamPriority` adds the town at priority 1 for the menu scene (`src/assets/AdvanceStream.ts:62-63`); and `townPrefetchUrls()` (`src/town/TownTavernPilot.ts:43-57`) returns bare `new URL(...).href` values **with no query string** — precisely what every collector counts via `!url.search`.' +
  ' ⓷ **REPRODUCED:** `e2e/town-tavern-blender.spec.ts:205` FAILED with the bare `town-v3-tavern.glb` url while `:154` PASSED in the same run — a race, matching the 81.8%/20.4% blast radii in `logs/suite-red-inventory.md`.' +
  ' 💡 **THE TRANSFERABLE PART: the red inventory gave the right coordinates and the wrong causal story, and BOTH halves of the static reading were individually true while the conjunction was false.** The `toEqual([])` sites really are behind disabled gates; the requests really do arrive anyway. Only executing the thing distinguished them.' +
  ' ⚠️ **A `--workers=1` single green is NOT evidence here** — the sibling site passes most runs; the authored master therefore requires `--repeat-each=3` with a per-site tally.' +
  ' ✅ **DISCHARGED: F-1167-1\'s head flipped 🔺→🔧 and dropped from the desk; `f1615-1-prefetch-wins-mount-laziness` authored to lane-a under the owner\'s branch-(a) ruling.**' +
  ' ⓘ **COUPLING THE NEXT FIRE MUST NOT MISS:** the ruling ends *"F-1532-2\'s walkthrough table unblocks behind it (author as-is once this merges)"*, but s1614 authored that table (`f1614-1`, running in lane-b now) BEFORE this merges.' +
  ' `f1615-1` CHANGES the prefetch set (it removes the two-id exclusion), so `f1614-1`\'s door-by-door table measures a configuration this master will alter. **Drain f1614-1 on its own terms, then re-measure the table after f1615-1 lands — do not treat the first table as final.**' +
  ' **GATE: none owed to the owner; both masters are fire-authorable work with rulings behind them.**';

lines.unshift(newRow);
fs.writeFileSync(p, lines.join('\n'));
console.log('BACKLOG updated: F-1167-1 head flipped, F-1615-1 row prepended');
