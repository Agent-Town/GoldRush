# SS-03 Steamworks beats

- `npx tsc --noEmit`: green
- `npm run build`: green (standing chunk-size warning only)
- `e2e/ss-03-beats.spec.ts`: 4/4 green, desktop + mobile
- `e2e/ss-02-beats.spec.ts`: 6/6 green, desktop + mobile
- `e2e/072-era-activation.spec.ts`: 5/5 green (one intentional mobile skip)
- `e2e/ss-01-beats.spec.ts`: 6/8 green; the same existing first-contract assertion fails on desktop + mobile because `ledger-page:town_tavernkeeper` is queued ahead of it. SS-03 does not alter that signal, beat, or spec.
- Console/page errors in the SS-03 thread: zero

## Trigger map

- `epoch-activated`: rail arrival / first Depot graduate; Gazette press
- `contract-unlocked` (`e2-hill-mine`): Hill Mine first visit; Elder's empty chair, chalk, and cottonwood; Depot wedding and the Prospector's place; Iron Correction rumor 1
- `run-return-town`: Iron Correction rumors 2 and 3, one per later return
- `boss-defeat` (`e2-hill-mine`): the captured crate reaches the Schoolhouse as Pride's Tuition

All nine SS-03 beats are once per profile. The three rumors reveal only a cash timetable, an overweight rail presence, and a rich man's question about the year; no railcar rules or component solution are disclosed.
