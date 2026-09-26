# F-PP6-2 — CLOSED for the player: the native River pan banks and persists once

2026-09-26. **PASS desktop (1280×800) and phone (390×844 CSS px).** The real Last Claim wave-8 secure, bank, Charter Press wait and lever click lead to the quiet River. The first player pan writes one secured `e10-river` score, waves 0, gold 5. The Book reads **“Secured: wave 0, 5 gold.”** The run-6 bank and reload predicates now pass. Ordinary Book return and a literal reload preserve the score bytes. A second pan and a second genuinely earned lever pull leave the original River score unchanged.

| Measurement | Desktop | Phone |
| --- | ---: | ---: |
| First gold / saved score time (sim seconds) | 5.200000 | 4.733333 |
| First gold value | 5 | 5 |
| First Last Claim secure time | 240.133333 | 240.133333 |
| Warm vent at first secure, of 360 HP | 352.8 | 360.0 |
| Quiet River terminal time / gold | 35.200 / 30 | 35.200 / 30 |
| Ceremony wave / enemies | 0 / 0 | 0 / 0 |
| Second earned Last Claim secure time | 240.133333 | 240.133333 |
| Warm vent at second secure, of 360 HP | 352.8 | 342.0 |
| Gold lands after second real lever (sim seconds) | 4.833333 | 4.700000 |
| Ceremony `/api/standings` requests, both journeys | **0** | **0** |
| Console / page errors, entire paired proof | **0 / 0** | **0 / 0** |

The repeat is on the same live browser page and profile, selected through the Book, with no profile reset. Last Claim's second bank may update its own score; the River row stays byte-identical, and the complete scoreboard stays byte-identical across the second River's boot and pans. All game actions remain the shared driver's real keys and clicks. No debug flag, simulated completion, charter staging or synthesized River URL is used. The application itself launches `?contract=the-claim&nowaves=`.

## Seed root cause and proof adaptation

F-RES1-2 was a fabricated secured wave-30 River score in `seedEntries`. It both satisfies the once-only completion guard and wins score trimming over a real wave-0 River completion. The seed now omits River. A current-Scoreboard control measures the exact run-6 fresh-timestamp predicate: old seed **false**, seed without River **true**, realistic profile **true** ([control](../seed-measure.log), [instrument](../seed-measure.mjs)). No other driver logic or existing assertion changed. A seed-only opt-in enables dev county posting during this proof; requests are observed and answered locally, so zero requests tests the hold rather than the dev opt-in default.

The new wrapper observes the unchanged `nativeProof`. Its second journey intentionally encounters the old driver's “NEW River row” assertion, because a repeat must not be new. The wrapper first checks two actual ceremonies, the original row and unchanged full score bytes, the second real wave-8 secure, Book return and zero errors/requests. It then accepts **only one error with that exact banks assertion** as an expected failure. Any other failure, missing failure, changed score, extra request or browser error leaves the test red. Both commands report 2 passed, exit 0; this is not a waived failing first completion.

An initial desktop attempt proved the first ending but exited 1 on re-pull: browser history did not retain the earned Press. Its 4.700 s / 5 gold observation, screenshots, source snapshot and full output remain in [initial-desktop](../initial-desktop/). The final instrument earns the second finale instead. Consequently desktop's raw census was recorded twice across the instrument revision; both agree. Phone has one raw census. No failed attempt or evidence was discarded.

## F-RES1-3 — raw Book route still spawns enemies (measure only)

The actual Book launch button selects raw `e10-river`; no URL or launch storage is constructed for this census. Idle observations:

| Target sim time | Desktop actual / alive | Phone actual / alive |
| --- | --- | --- |
| 11.5 s | 11.566667 / **2** | 11.533333 / **2** |
| 26.5 s | 26.500000 / **2** | 26.500000 / **2** |
| 30 s | 30.000000 / **1** | 30.000000 / **1** |

This confirms the landed slice's raw-route finding; it does not describe the quiet lever ending. No spawn, route or balance fix is part of this task.

## Evidence and remaining boundary

- First completion: [desktop row](first-row-desktop-chrome.json), [phone row](first-row-mobile-chrome.json), [desktop observations](ending-desktop-chrome.json), [phone observations](ending-mobile-chrome.json). Canonical `row-*.json` copies carry the successful first bank/reload cells; `repull-row-*.json` retain the unchanged driver's expected not-new cells.
- Real repeat: [desktop](repull-desktop-chrome.json), [phone](repull-mobile-chrome.json).
- Gold landing: [desktop](pan-desktop-chrome.png), [phone](pan-mobile-chrome.png).
- Book: [desktop](book-desktop-chrome.png), [phone](book-mobile-chrome.png).
- Bank cell: [desktop](bank-cell-desktop-chrome.png), [phone](bank-cell-mobile-chrome.png).
- Raw route: [desktop](raw-desktop-chrome.png), [phone](raw-mobile-chrome.png).

**F-PP6-2 is CLOSED for the player.** The county-board half stays held until `river-assay-1` resolves replay/assay compatibility. F-RES1-3 remains with its route owner. No new ending overlay or broader art/presentation acceptance is claimed. Direct screenshot inspection also sees the phone's role label overflow its card; this is an out-of-scope UI observation, with no production edit or new-regression attribution.
