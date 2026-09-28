# Native ground strategy — run 8

2026-09-27. **READY-FOR-GATES with recorded holds. Old Canal: desktop HELD, phone gameplay PASS; bank-cell screenshot evidence incomplete. Incline default control PASS both. Twin Banks NOT RUN under the Old Canal gate.**

Base `73b381bce`, lane `sol/map-art-campaign-2`. Diagnosis committed first as `7fbb85e38`; strategy and closeout are in the containing `test:` commit (hash in final response). [Pre-flight](preflight.md) · [Diagnosis](e9-old-canal/diagnosis.md) · [Finding](e9-old-canal/finding.md) · [Verification](verification.json).

| Map / purpose | Desktop | Phone, 390×844 CSS px |
| --- | --- | --- |
| Old Canal diagnostic, default | HELD: death wave 18, 544.400 s, 3 gold, 1 repair, 0/8 defenses standing | HELD: death wave 18, 540.667 s, 4 gold, 4 repairs, 0/8 standing |
| Old Canal, restore-ground | HELD: death wave 19, 599.733 s, 33 gold, 11 repairs, 0/7 standing | Gameplay PASS: wave 20, 600.133 s, 120.6 HP, 37 gold, 9 repairs; bank, Book, byte-identical reload; 0/7 standing |
| Twin Banks, same strategy | NOT RUN: Old Canal did not pass both projects | NOT RUN: same gate |
| Incline, strategy flag unset | PASS: wave 14, 581.733 s, 87.8 HP, 83 gold | PASS: wave 14, 579.467 s, 93 HP, 0 gold |

All six new native rows have zero console/page errors. The diagnosis pair exits 1 (two honest secure failures); the strategy pair exits 1 (desktop fails, phone passes); Incline exits 0. Exactly one diagnostic plus one changed-premise strategy ride per Old Canal project. No retries, second strategy, balance tuning, or quota/disconnect interruption.

## Strategy and outcome

`GR_NATIVE_STRATEGY=restore-ground` restores purchased defenses rather than abandoning wrecks: check every 8 simulation seconds, select the lowest HP fraction including wrecks below 80%, approach within 1.2 units of the building centre (repair radius 1.4), replenish to at least 40 gold before repair, bound repair polling to eight ticks, and stop expansion at wave 12. It retains the existing native opening kit, upgrades, circuit, funding and movement helpers. The reserve is a funding target, not a guaranteed balance after purchases. Flag unset and the existing hold-ground path retain their behavior.

Fresh diagnostics reproduced the prior attrition: all eight defenses wrecked, then hero death at wave 18, very little money, one/four repairs. The default excludes wrecks; its eight-piece cap then prevents further spending or funding. Restoration produced 11/nine repairs and more survival, but still lost every building. Repeated beacon restoration can consume time ahead of turret restoration; farming also exposes the hero. These are measured driver limits, not an impossible-balance finding. Exact killing attacker and live variant counts are not exposed in plain diagnostics; the diagnosis distinguishes the authored two-type roster from that unknown.

## Default-path comparison

[Normalized syntax equivalence](default-equivalence.json) passes: with the new flag specialized to false, the driver matches the pre-task driver's normalized TypeScript. The executable [checker](verify-default.mjs) also verifies the comparison against the recorded base; this is complemented by real Incline runs.

| Project | Run 6 final wave / time / gold | Run 8 wave / time / gold | Delta |
| --- | --- | --- | --- |
| Desktop | 14 / 591.333 / 3 | 14 / 581.733 / 83 | same wave; -9.600 s; +80 gold |
| Phone | 14 / 583.867 / 118 | 14 / 579.467 / 0 | same wave; -4.400 s; -118 gold |

Run 6's initial controls were desktop 14 / 590.267 / 3 and phone 14 / 576.800 / 3. Both new times fall inside that observed four-row time range. Gold is timing-sensitive: run 6 phone alone varied by 115 gold; this phone is 3 gold below the old pooled 3–118 range. There is no documented formal gold-variance tolerance, so this report does **not** assert an exact gold-range gate passed. Both full control journeys and the stronger flag-unset syntax equivalence passed; no behavior change was found. Carts remain 180/180 in both new final snapshots.

## Evidence and checks

- `npx tsc --noEmit`: exit 0 ([log](tsc-final.log)).
- `npm run build`: exit 0 ([log](build-final.log)); existing Vite/chunk/asset-quantization warnings only.
- Env-unset `npx playwright test --list --workers=1`: exit 0, 3,502 tests / 473 files ([log](default-list.log)). Listing alone cannot show runtime skips.
- Actual env-unset native battery, both projects: **44 skipped**, exit 0 ([log](gate-unset.log)).
- Incline flag-unset paired run: **2 passed**, exit 0 ([log](incline.log)).
- Unmodified adjacent `m2-05-base-damage-repair.spec.ts --grep 'repair dwell spends exact sink'`: **2 passed**, exit 0 ([log](adjacent.log)). Its regenerated review PNGs were copied to `adjacent-shots/`, then restored outside the firewall; no review files are committed.
- Scope/saved-row/unchanged-assertion/diagnosis-before-strategy verifier: `python3 artifacts/sol/play-proofs/run-8/verify.py`, PASS for those checks. It explicitly reports the separate evidence gate as HELD.
- `git diff --check`: exit 0.
- Direct visual inspection: Old Canal phone terminal and Book; terminal confirms wave 20 / 121 HP / 37 gold. Book screenshot shows the initial Dome Basin card. Terminal/Book/last screenshots and all rows are retained, including failed journeys.
- **Missing requested artifact:** separate Old Canal phone best-score/bank-cell screenshot. The gameplay/storage assertion passed but is not a substitute for that image. No reconstructed screenshot is presented. This prevents claiming the whole requested evidence package is complete.

Own Vite PID 7878 at `http://127.0.0.1:5303`, stopped at closeout. All browser commands used one worker, desktop before phone, trace off. Native runs used no debug URL, real keyboard/HUD actions and the existing progressed-profile seed. Adjacent repair test retains its own existing debug fixture. No production, contract, balance, art-store, ledger or protected assertion changes. Task firewall excludes vault writes; this directory is the durable handoff.

Native command pattern (each paired invocation has `--project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line`):

```sh
GR_NATIVE_PROOF=1 GR_NATIVE_RUN=8 GR_NATIVE_STRATEGY=restore-ground \
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 \
npx playwright test e2e/native-proofs/e9-old-canal.spec.ts \
--project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line \
--output=artifacts/sol/play-proofs/run-8/e9-old-canal/results
```

Diagnostic command: strategy unset, `GR_NATIVE_DIAG=1 GR_NATIVE_RUN=8/diagnostic`. Incline command: strategy/diagnostic flags explicitly unset, `GR_NATIVE_RUN=8`, `e2-incline.spec.ts`. Full command outcomes are above and logs alongside.

## Recommendation and REMAINING LIST IN ORDER

Keep this one strategy opt-in. **Only Old Canal phone is newly demonstrated to unlock; no other held map is proven to benefit.** Desktop's near-terminal death suggests targeted human/strategy review, not a balance change. Orbital movement/air, traversal, storage and escort-specific holds remain separate design or driver questions; this ground result cannot settle them. No global balance conclusion follows.

1. Old Canal desktop secure/bank/Book/reload remains HELD. No more rides were taken after the diagnostic and strategy attempt per project.
2. The separate Old Canal phone bank-cell image remains unrecorded. A future authorized proof should capture `contract-best-e9-old-canal` in the original successful browser context; do not recreate state from the row.
3. Twin Banks remains untested with restore-ground because the Old Canal both-project prerequisite did not pass.
4. Gold control variance has no documented numeric tolerance; exact deltas and syntax-equivalence proof are supplied for review, rather than declaring an invented threshold.
