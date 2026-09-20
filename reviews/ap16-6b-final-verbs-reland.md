# AP-16-6B — final verbs corrective re-land (gate-side HOLD)

**Slice:** `lane-d-ap16-6b-final-verbs-reland`
**Lane tip:** `9cf0bad00fd626c86fda3132d1a3696fc2e5ee66`
**Lane base:** `d30a23a3de0fc130c24fb87951c9f8456f38302d`
**Detached gate candidate:** `4b17d6fd5b8d50a8791fa6b0677a7738ba78ca62`
**Salvage ref:** `save/ap16-6b-s1697-9cf0bad0`

## Verdict

**HOLD — NOT MERGED.** AP-16-6B resolves the six findings from the first AP-16-6 review, but its new terminal boundary expects `run.lastRunEndedReason` while `HeadlessContractSim.diagnostics()` never publishes that field. Two existing deterministic contract drivers therefore finish banked runs with an agent receipt of `held` instead of `secured`.

The candidate was gated only in detached custody. No AP-16-6B source content entered main. The exact lane tip is preserved on the salvage ref above for a minimal AP-16-6C re-land.

## Blocking finding

### F-1697-1 — headless bank terminals omit the reason consumed by the shared view boundary

AP-16-6B correctly stopped treating `runState: "secured"` as terminal because both the pending bank/rush choice and live overtime can carry that state. `src/agent/View.ts` now uses `run.lastRunEndedReason` to distinguish a true terminal receipt. The browser diagnostic publishes that field; the headless diagnostic still emits only `{ secured, pendingSecure }`.

The smallest root-cause correction is at the missing diagnostic seam: headless `run.lastRunEndedReason` is `"secured"` only once `secureChoice === "bank"`, and remains `null` for pending choice and rush. Do not restore the ambiguous `runState === "secured"` fallback in `View.ts`.

## Gate evidence

| Gate | Candidate result |
|---|---:|
| exact `drain-block-check` on successor master | `CLEAR`, live leaf `queued` |
| lane/main path intersection since base | **0 / 14**; clean ort merge in detached custody |
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0 |
| full `npm run test:node-guards` alone, repo-pinned Node 26.4.0 | **459 total / 452 pass / 2 fail / 5 skip**, rc 1 |
| isolated failing titles under Node 26.4.0 | **0 / 2**, both `actual: held`, `expected: secured` |
| power budget | p95 0.682 ms > 0.500 ms; no PowerGraph path touched, not disposition-driving |

The two deterministic reds are:

- `the Claim driver consumes declared water and posts RunManager secure at wave 10`
- `Twin Banks consumes its declared crossings and build zones before securing at wave 20`

Full gate transcript: `artifacts/ap16-6b-gate-s1697.txt`.

## Disposition

The `ap16-6b-final-verbs-reland` goal leaf becomes `blocked` with `blockClass: "gate-side"`. AP-16-6C replays the saved candidate on fresh main and adds only the missing terminal diagnostic plus the smallest focused assertion needed to keep pending/rush nonterminal. AP-16-7 remains sequenced behind that merge.
