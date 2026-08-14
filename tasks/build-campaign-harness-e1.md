# Task build-campaign-harness-e1: implement the E1 campaign harness (MAIN slot, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (MAIN slot).
READ FIRST: AGENTS.md; **`specs/agent-play/campaign-harness-e1.md` (RATIFIED 2026-08-14 — the full 4-slice scope, gates, laws, and the VERIFIED reuse points; this task IMPLEMENTS that spec).** Also open the files it cites: `src/game/ProfileTransfer.ts` (packActiveProfile/unpackProfile), `src/meta/ContractUnlock.ts` (contractUnlockStatus), `src/sim/HeadlessContractSim.ts:114` (the `HEADLESS_META_STORAGE` stub to replace) and `:556` (RunManager storage option) and `:337` (loadContract), `scripts/gr-sim.mjs` (single-contract door + tape writer), `src/game/Medals.ts`/`src/game/MetaProgress.ts`/`src/meta/ResearchTree.ts` (storage-injectable), `src/mp/LockstepClient.ts:967` (stableHash), `assets/contracts/bench-seeds.json`, `scripts/gr-sim.test.mjs` (test conventions).

Pre-flight: `git status --short` no modified TRACKED file outside factory-churn — STOP if so. FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`; `artifacts/**`/`reviews/shots-*`/`.png`. Then `npm install --no-audit --no-fund`; `npm run build` green first.

## Why
Owner ratified the continuous-campaign benchmark (2026-08-14): an agent starts at E1, beats it, and carries a persistent PROFILE forward. This builds the E1 harness — Layer 0+1 on E1 (100% headless-admitted today), proving profile-threading end-to-end before the per-epoch engine build-out (E2+). E1 ONLY — no E2+ engine wiring.

## Scope — implement the spec's four slices; each gate is as the spec states
1. **Profile injection.** A minimal in-memory `FakeStorage` (`getItem/setItem/removeItem/key/length`) installed as `globalThis.localStorage` AND `globalThis.window.localStorage` in the campaign process; an ADDITIVE `HeadlessContractSim` constructor option to accept a real storage instead of `HEADLESS_META_STORAGE` (`:114`) — **DEFAULT UNCHANGED**. Gate: a pre-seeded FakeStorage (one research node) is READ (upgrade eligibility widens); an empty-FakeStorage run matches today's cold-start `eventLogHash` byte-for-byte.
2. **Persist across two legs** via `packActiveProfile`/`unpackProfile`. Gate: `the-claim` → `e1-dry-gulch` boots with leg-1's secured-claim + research present in the carried storage (assert between legs); leg-2 `contractUnlockStatus()` reflects leg 1.
3. **`scripts/gr-sim-campaign.mjs`** (sibling to `gr-sim.mjs`): drives E1's DAG in one process, picks each next legal leg via `contractUnlockStatus()` against carried state, threads the profile between legs, to E1's terminal. Accepts a per-leg player over the gr-sim order-generator interface; **for THIS build's gate, a MINIMAL deterministic fixture player** (NOT a claim the levels are beaten by a script — the real-agent campaign runs ON TOP later). Gate: the runner walks a legal E1 DAG path; carried profile at each leg-start reflects prior legs; one artifact per leg + one campaign artifact.
4. **Verification + resume.** Per-leg `eventLogHash` UNCHANGED; ADD a leg-boundary campaign-state hash + a whole-campaign hash-chain (`stableHash` from `LockstepClient.ts`); write the `CampaignState` JSON (ProfileTransfer envelope shape) after each secured leg (resumable). Gate: two same-seed/same-player runs → byte-identical whole-campaign hash; a killed run resumes from the last checkpoint.

**Owner Q1: do NOT reproduce the palisade-credit carry-over — a fresh leg starts with none.**

## Firewall
Touch ONLY: new `scripts/gr-sim-campaign.mjs`; a new FakeStorage module; `src/sim/HeadlessContractSim.ts` (ADDITIVE constructor option ONLY — default = today's stub); new test files under `scripts/`.
NO changes to: `scripts/gr-sim.mjs`'s single-contract logic or its `eventLogHash` contract (a control run MUST be byte-identical); ANY E2+ engine code (Layer 2); the browser `Game.ts` progression; any gameplay balance; any `CONTRACT_ADMISSION_EXEMPTIONS`; `ProfileTransfer.ts`/`ContractUnlock.ts`/`Medals.ts`/`MetaProgress.ts`/`ResearchTree.ts` internals (REUSE their existing signatures, do not reshape).

## Self-check
tsc + `npm run build` green. **CONTROL invariant:** `node scripts/gr-sim.mjs --contract e1-baron --seed e1-baron-01 --policy=idle` produces the SAME `eventLogHash` as before this change — report it, it proves the additive option didn't disturb the default path. Each slice's gate met + reported. `npm run test:node-guards` green. New tests cover: FakeStorage threading (slice 1), 2-leg persistence (slice 2), the DAG walk (slice 3), whole-campaign hash determinism + resume (slice 4). Zero console/page errors.
End: READY-FOR-GATES + report: control `eventLogHash` unchanged (before/after), each slice's gate result, the whole-campaign hash printed TWICE (byte-identical), and the resume-from-checkpoint result.

## No-op / honesty guard
If a slice can't meet its gate (profile doesn't thread cleanly, a `globalThis.localStorage` singleton collision, or the control `eventLogHash` shifts), STOP and report the exact blocker — do NOT hack around determinism or the single-contract-path invariant to force a green.

## s1771 gate corrective rider — F-1771-1

The first candidate is preserved at `save/build-campaign-harness-e1-s1771-hold`
(`87d16e350b21a90d40d9b0d500c5b23a5d971caf`). Reuse that implementation; do not rebuild it.

Its focused test was named `scripts/gr-sim-campaign.tests.mjs`, the only plural `*.tests.mjs`
under `scripts/`. Both `test:node-guards` and `gate-caller-audit.mjs` recognize the repository's
singular `*.test.mjs` convention, so the reported caller-audit green never inspected the new test.
The manufactured control is retained at
`artifacts/build-campaign-harness-e1-manufactured-red-s1771.txt`: rename-only to
`scripts/gr-sim-campaign.test.mjs` exits 1 with `NO CALLER`.

Correct only that gate topology:

1. Restore the five candidate paths from the save ref.
2. Rename the focused test to `scripts/gr-sim-campaign.test.mjs`.
3. Add that exact file to the existing `test:node-guards` command in `package.json`.
4. Run the focused test, `node scripts/gate-caller-audit.mjs --include-untracked`, and the complete
   `npm run test:node-guards` battery alone. Preserve the control and campaign hashes above.

For this corrective, `package.json` is added to the firewall. Touch nothing else beyond the five
banked candidate paths. Do not baseline or grandfather the test; it is required coverage, not an
advisory reader.
