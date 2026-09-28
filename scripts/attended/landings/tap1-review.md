**Slice / branch / tip:** `e7-tape-toggle-phone-hit-target-1`, lane-a `sol/open-findings-astra`, two commits (`6693dfa37` the audit spec and evidence, `97903ef7b` the report), Astra gpt-6-astra, 131,622 tokens, 2026-09-28 03:46Z to 04:02Z. Attended landing under `land-held.sh` after the s2733 fire held it ("own 2/2, browser 46 pass / 2 controlled inheritance reds") and s2734 deferred to attended ownership.

**What it does.** One new spec, `e2e/e7-tape-toggle-phone-hit-target.spec.ts`, and its evidence under `artifacts/e7-tape-toggle-phone-hit-target-1/`. The spec boots `e7-echo-canyon` from the town board with no debug or seed flags on both projects, and at three moments (HUD mounted; during wave 1; with the Patent Office upgrade overlay open, then closed as a player closes it) reads the Tape Reel toggle's bounding box and `document.elementFromPoint` at its centre and four inset corners, recording the top element, its pointer-events and z-index; on the mobile project it asserts the toggle is the top element in the two overlay-free moments, and repeats the centre read on Relay Rush and Dead Band. No production code changed.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| Unobscured samples, both projects, three maps | 40 of 40 reached the toggle |
| Samples with the Patent Office open | 10 of 10 reached its modal overlay (expected) |
| Verdict | instrument artefact: the run-16 phone interception was the driver's `playbook-toggle.click()` timing, not a player's tap; the E7 maps are playable on a phone |
| `src/**` changed | no |
| Adjacent in the lane | 18 passed; 2 reds in `e2e/e7-playbook-surface.spec.ts` ("the tape drawer arms at the Signal Era and remains inherited afterward"), reproduced against source byte-identical to pre-task main: the pre-existing F-SPH2-2, corrective `e7-tape-drawer-inheritance-1` |
| Evidence | 646,406 B |
| tsc / build / the audit spec both projects / m2-01 / task-025 / ledger battery | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the chain cut. New: the spec and `artifacts/e7-tape-toggle-phone-hit-target-1/**`. Lane-touched: none under `src/**`, `scripts/**`, `functions/**` or `site/**`, so `hash: unchanged`. The `e7-playbook-surface` spec is deliberately not in this landing's gate while F-SPH2-2 is red on main; its corrective is the next lane-a task.

**Findings.**
- **F-TAPE: none.** The question the owner's play-proof runs raised (is the Tape Reel unreachable on a phone?) is answered no, with 40 hit-test samples.
- **F-SPH2-2 (pre-existing, recorded elsewhere):** the Tape Reel's epoch inheritance is broken on main since `7c2744e5a`; corrective `e7-tape-drawer-inheritance-1` (Astra, lane-a) queues on this landing's leaf.
- **Toolkit note:** the fires held this e2e-only landing twice for its controlled adjacent reds; the 13z-91 rule now covers e2e landings whose only reds are a recorded main finding: land attended, name the finding in the review, never excuse it.
