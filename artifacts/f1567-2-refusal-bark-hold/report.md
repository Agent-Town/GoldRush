# f1567-2 — refusal bark hold

## Cure

Chose the accepted `nextSurveyAt` shape. `handleReceipt` reuses `voiceKindForReceipt`; when `say` receives the typed `refusal` kind it raises the existing absolute survey deadline to at least `simulationAt + Balance.agent.refusalHoldSeconds`. No refusal vocabulary is duplicated outside `Voice.ts`.

`Balance.agent.refusalHoldSeconds = 8`. Eight sim-seconds covers the 7-second first-survey deadline with one second of reading margin, while remaining well below the normal 19-second idle-survey cadence.

Survey starvation is impossible under the existing timer invariant: a refusal can only raise one absolute deadline; once it expires, the unchanged survey branch speaks and sets `nextSurveyAt = at + surveyCooldownSeconds`.

## Manufactured RED and AFTER verdict

- BEFORE runtime change: `2 failed` — desktop and mobile both failed `permission-denied bark survives the first idle survey` with `Expected value: "ledger"` against `['held', 'ask me', 'no trust']`.
- AFTER runtime change, focused: `2 passed (6.8s)` — desktop and mobile.
- AFTER runtime change, full named path `e2e/m4-06-embodiment.spec.ts`: `20 passed (1.4m)` — 10 desktop and 10 mobile.
- Zero console errors and zero page errors in the new test on both projects.

## Gates

- `npx tsc --noEmit`: rc 0.
- `npm run build`: green; Herald dev-path art `1,158,214 / 1,500,000` bytes.
- `npm run test:node-guards`, pinned `.nvmrc` Node 26.4.0 and run alone: primary battery `393 tests / 393 pass / 0 fail / 0 cancelled / 0 skipped`; ticker stats passed; findings-state `400 declared / 253 closed / 147 open / 0 double-state`; blocker panel `30 rows / 25 with F-ID / 344 closed census / 0 closed-on-panel`; ruling propagation `3 ruled / 30 refusing leaves / 0 stale`; desk declaration lawfully skipped on ACTIVE line 1; NUL audit clean.
- An initial invocation under the ambient Node 23.11.1 was invalid against `.nvmrc` and reported `393 / 390 / 3`; two failures explicitly diagnosed Node 23 file-level timeout semantics. No test was changed or re-pinned; the exact battery was rerun under installed Node 26.4.0 as above.
- `git diff --check`: clean.
- Independent `codex review --uncommitted`: no findings; independently reproduced the baseline red and reran typecheck, build, focused Playwright, and the 20-case full spec green.

## Drift and adjacent overwrite paths

No numeric `expect` argument moved; both `0.4` assertions are byte-unchanged. The full gate observed `driftAbs=0.3722002149381437` and `gapClosed=0.37139096406706074` on both projects, below the unchanged bounds.

The refusal should suppress only the survey. No second idle-bark route exists in `Embodiment.ts`. The only other `say` entry is explicit `speak`, currently used for the lifecycle line `Prospector ready`; later player/agent receipts are new input and should be allowed to replace a refusal, so widening the hold would hide useful feedback without evidence.

## Screenshots

- `reviews/shots-f1567-2/desktop-chrome-held-refusal.png` — SHA-256 `0510c1fe18c38653f538160776b8afe526b2bf7a1cef41afcdce6d925c380c01`
- `reviews/shots-f1567-2/mobile-chrome-held-refusal.png` — SHA-256 `d24037c9be4fa5ecd34fa245eaad7ff3ddf6fc549e1ce23d4f216c117311d696`
