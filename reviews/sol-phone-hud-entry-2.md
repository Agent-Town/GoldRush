# Drain review: `sol-phone-hud-entry-2`, the 390 px HUD census and cure extended to the four E1/E2 maps the first pass did not list (Astra, lane-b, the owner's 2026-09-24 rulings)

**Task:** `sol-phone-hud-entry-2` · lane-b, gpt-6-astra xhigh on the owner's ChatGPT subscription · code branch `sol/wave-lane-b` · authored 2026-09-24 on the owner's rulings on F-F2-39 (item 1) and queued beside `sol-entry-framing-2` in lane-c. UI code only: the census's map list and bodies, the 390 px media queries within the first pass's bounds; no testid, number, control, sim rule, contract or null floor moves; no store change.

## LANDED `d8705dc6e` (2026-09-24 05:09Z)

**Branch tip** `8b89e4231` · **store main** `5793a96` (unchanged; the scratch store worktree at it) · **merge** `d8705dc6e` · same-era pin #56 `dcc407be`

### What it does
Four maps, one CSS file and the census: `scripts/phone-hud-entry-census.mjs` now lists Night Shift, Twin Banks, the Baron and the Trestle with their entry bodies, its guard pins the union, and `src/ui/theme.css` gains 25 lines of 390 px rules inside the first pass's bounds (the confirmation target compacts from 76 to 60 px, the joystick's backing and glow go while its bounds, ring, knob and input stay fixed, the Baron's status rail starts below the fort's parapet). No testid, number, control or sim rule moved; desktop coverage unchanged on every map; the painted union unchanged at 11.28% phone and 13.92% desktop (13.31% / 15.15% on the Trestle). E1 payload 34,319,307 B (+761 B: 543 B of CSS, 218 B of terrain bundle from the store advance).

**Night Shift: CENSUS PASS, browser acceptance HELD.** The rig's persistent coverage at 390 px falls from 13.09% to 8.03% (the centred confirmation target compacts); desktop 15.09% unchanged. The entry crop and the contract and art holds stay where they are (HM-01 and F-SEF2-4).

**Twin Banks: CENSUS PASS, browser acceptance HELD.** The river's persistent coverage at 390 px falls from 22.84% to 6.16% (the joystick's backing and glow removed without moving the stick); desktop 75.00% unchanged. The offscreen braid, house and rig, and the art and contract holds, remain (F-TB-1, HM-05).

**The Claim-Jumper Baron: CENSUS PASS, browser acceptance HELD.** The fort's persistent coverage at 390 px falls from 68.14% to 0%: the status rail now begins below the fort's visible parapet. Desktop 19.71% unchanged. The width clipping, the offscreen rigs and the occupied-valley composition remain camera and contract holds (HM-02).

**The Trestle: CENSUS PASS, no CSS cure.** The bridge is offscreen at the plain phone entry before and after, so there is nothing for the HUD to uncover and no Trestle rule was written; desktop 58.68% unchanged. The bridge, the stock and the approach station stay with the camera owner (the entry-framing glance shows the span for 2.5 s; the rest is HM-05's question).
Where the player sees it: on a phone at 390 px, at the plain entry of Night Shift, Twin Banks, the Baron and the Trestle, the panels fold or compact where the entry body was covered; desktop unchanged.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| merge | `clean, no conflicts` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34341349 bytes` |
| engine hash | `dcc407bec54d01d4…`; same-era pin #56 `dcc407be`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (305.8s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards (skill.md, same-game audit, view schema, gate callers, citations, no-emdash) + the census guard in the battery | `ℹ pass 92 ℹ fail 0` |
| e2e both projects, `--workers=1` (the four maps' own specs, m2-01 build menu, the mobile HUD polish, the mobile overlay input, task-025, the agent view, the release build) | `rc=1   11 failed   1 skipped   82 passed (9.6m)  04:56Z` |
| e2e reds | `1) [desktop-chrome] › e2e/e1-baron.spec.ts:411:1 › Baron manifest loads and taunts fire at waves 5, 12, and 18 `<br>`2) [desktop-chrome] › e2e/e1-night-shift.spec.ts:271:1 › loads Night Shift contract data and ramps full, dusk, dark, dawn lighting `<br>`3) [desktop-chrome] › e2e/e1-twin-banks.spec.ts:64:1 › loads Twin Banks contract with two fords, two build zones, and one loss stake `<br>`4) [desktop-chrome] › e2e/e1-twin-banks.spec.ts:103:1 › builds sluices and stockpiles on both banks against one gold pool `<br>`5) [desktop-chrome] › e2e/e1-twin-banks.spec.ts:122:1 › routes enemies through both west and east fords `<br>`6) [mobile-chrome] › e2e/e1-baron.spec.ts:411:1 › Baron manifest loads and taunts fire at waves 5, 12, and 18 `<br>`7) [mobile-chrome] › e2e/e1-night-shift.spec.ts:271:1 › loads Night Shift contract data and ramps full, dusk, dark, dawn lighting `<br>`8) [mobile-chrome] › e2e/e1-night-shift.spec.ts:372:1 › lantern post is Night Shift gated and relights a true-dark light ring `<br>`9) [mobile-chrome] › e2e/e1-twin-banks.spec.ts:64:1 › loads Twin Banks contract with two fords, two build zones, and one loss stake `<br>`10) [mobile-chrome] › e2e/e1-twin-banks.spec.ts:103:1 › builds sluices and stockpiles on both banks against one gold pool `<br>`11) [mobile-chrome] › e2e/e1-twin-banks.spec.ts:122:1 › routes enemies through both west and east fords `<br>Attribution: Attribution: pre-attributed by a control of this drain's specs on main `4f9e278a6` with the store's main at `c092e3d` before the merge (`drain-e2e-control-main.log`: rc=1, 12 failure lines); every red on the merged tree below matches a line of that control by file, test line and project, and nothing in this task's diff touches those tests' subjects. |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 955 ℹ pass 948 ℹ fail 2 ℹ skipped 5  05:04Z` |
| battery reds | `✖ all 152 scripts/*.test.mjs fixture owners remove their temp directories (246496.940125ms)`<br>`✖ failing tests:`<br>`✖ the live board is green under this guard (baseline is honest) (221.079875ms)` (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `scripts/phone-hud-entry-census.mjs` and its guard (the four maps and their bodies), `src/ui/theme.css` and `src/styles.css` (the 390 px queries), the status doc, the campaign report and `run-10/phone-hud/**`.

### Findings
- **F-HUD2-1 (camera, not HUD):** the Trestle's bridge is offscreen at the plain phone entry, so the census passes with no cure and the hold moves to the camera: the entry-framing-2 glance reveals the span for 2.5 s and returns; a lasting read needs a spawn or station move (HM-05 in `specs/held-maps/README.md`, decided from the entry-framing numbers).
- **F-HUD2-2 (attributed):** Astra's full HUD battery on its tree read 532 passed, 50 failed, 114 skipped, and the four-map mobile suite 19 passed, 7 failed; its pre-cure controls reproduce the failures with the original CSS, and the drain's own control on main (`drain-e2e-control-main.log`) carries the same E1 rows (F-SEF2-5: root-caused, the test-side six in `tasks/e1-spec-truth-1.md`, the Twin Banks data change on the desk as F-TB-1). The drain's e2e on the merged tree is judged against that control, not against Astra's count.
- **F-HUD2-3 (drain shape):** the phone-HUD drain shape lacked the key-based three-way for the campaign report and the status doc that the store drains carry, so the merge stopped on those two files; resolved by hand with `md-3way.cjs` and the case added to the shape for the code-presentation drain.
