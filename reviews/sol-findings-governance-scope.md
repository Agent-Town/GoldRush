# Sol findings — governance, scope, and truth

- **Branch:** `sol/repository-audit-findings`
- **Base:** `7802ed6`
- **State:** UNTRIAGED — no implementation authorized.
- **Scope:** product-gate design, epoch sequencing, spec status, ledger scale, lore authority, and canon ontology.

## Summary

| Finding | Severity | Backlog overlap | Suggested future branch if accepted |
|---|---|---|---|
| `F-SOL-GOV-001` Ten-epoch execution outruns product-thesis validation | P1 owner/orchestrator | Epoch playtest gates exist, but not combined-product metrics | `sol/e1-e2-product-gate-proposal` |
| `F-SOL-GOV-002` One-epoch-ahead rule has already been bent | P2 governance | Explicitly documented as early E3 precedent | `sol/epoch-gate-clarification` |
| `F-SOL-GOV-003` Binding specs still declare obsolete states | P1 process | No close-spec sweep found | `sol/spec-status-reconciliation` |
| `F-SOL-GOV-004` Truth ledgers are too large for reliable agent context | P1 process | CLAUDE already says STATUS line 1 only | `sol/ledger-compaction-proposal` |
| `F-SOL-GOV-005` Lore wiki is incomplete and points to missing higher authority | P1 content governance | Lore population task implied, not complete | `sol/lore-authority-completion` |
| `F-SOL-GOV-006` Prospector's pre-E6 public vocabulary remains ambiguous | P2 canon clarification | Epoch saga supplies a retroactive turn, but not naming law | `sol/prospector-origin-adr-proposal` |

## F-SOL-GOV-001 — [P1 owner/orchestrator] The factory gates slices, not the combined product thesis

**Evidence**

- `docs/VISION-EPOCHS.md:4-19` combines living Town, calendar/family succession, science, epoch transforms, expanding worlds, AI crafting, and agent partnership.
- `specs/epoch-saga/README.md:12-25` defines ten epochs from Frontier to Deep Sky.
- `specs/epoch-saga/README.md:122-123` adds power graphs, vehicles, weather, boats/diving, hazards, playbook programming, gravity, persistent terrain mutation, procedural worlds, and the Charter Press.
- `docs/VISION-EPOCHS.md:26-33` estimates 60–150 image generations per epoch and thousands overall.
- `tasks/BACKLOG.md:109` gates each epoch on a Robin playtest, but no gate found requires unaided first-run success, correct human/Prospector understanding, second-session return, deployed AI/Assay truth, or family co-op if advertised.

**Impact**

The factory can efficiently ship many individually gated systems without proving that the intended audience understands, enjoys, and returns to the combined game.

**Recommendation for triage**

Owner/Fable proposal: before arming more E3 content, define an E1→Town→E2 product gate with new children/adults, first-build completion, role comprehension, multiple-contract play, one real AI differentiator, and voluntary return-session evidence. Keep future plates as reference; pause executable feature expansion if the gate is red.

## F-SOL-GOV-002 — [P2 governance] The one-epoch-ahead rule has an explicit exception without a durable exception policy

**Evidence**

- `tasks/BACKLOG.md:109` says fires never author more than one epoch ahead and each epoch ends with transition/aging/playtest before the next arms.
- `tasks/BACKLOG.md:101` records the E3 power graph as "SHIPPED EARLY" while the E2 transition is pending, justified by precedent/owner momentum and hidden behind a dev flag.

**Impact**

The exception may be technically safe, but it weakens the gate as a future coordination signal: agents cannot tell whether "engine-only/dormant" work is generally allowed ahead.

**Recommendation for triage**

Clarify the rule: either explicitly permit small dormant engine probes under named criteria, or reaffirm that this was a one-off owner exception. No source change is required.

## F-SOL-GOV-003 — [P1 process] Spec status lines conflict with the repository roadmap

**Evidence**

- `CLAUDE.md:75-76` says M1/M2 are signed off and M3 science is complete.
- `specs/m1-core-loop/README.md:9-13` still contains a "Next Agent Prompt" saying the milestone is paused awaiting M1 sign-off.
- `specs/science-dimension/README.md:3` still says DRAFT for owner ratification.
- `specs/building-tiers/README.md:3` says DRAFT, while `:28-31` says ratification answered and the spec is law.
- `specs/town-v1/README.md:2` still says DRAFT although T1–T6 behavior is described as shipped throughout BACKLOG/reviews.

**Impact**

Agents reading the required spec before code can follow obsolete instructions or reopen settled decisions. The spec is meant to be binding, so status drift is not cosmetic.

**Recommendation for triage**

Run a close-spec/status reconciliation using shipped code/reviews as evidence. Preserve rationale and owner rulings; remove stale "next prompt" execution instructions rather than rewriting history.

## F-SOL-GOV-004 — [P1 process] Core truth files have become context and drift hazards

**Evidence**

- `STATUS.md` measured 1,068,548 bytes.
- `tasks/BACKLOG.md` measured 105,621 bytes.
- `assets/LEDGER.md` measured 93,521 bytes.
- `CLAUDE.md:7-13` already tells agents to read STATUS line 1 only because the full file is not a practical session-start source.
- BACKLOG lines contain many complete historical gate narratives alongside current scheduling truth.

**Impact**

Important current facts are buried in append-only history; grep hits can inherit superseded beliefs; model context and human review cost grow continuously.

**Recommendation for triage**

Proposal only: keep small current-state ledgers and archive immutable history by milestone/date with generated indexes. Preserve evidence links and git history; do not delete another agent's record or silently rewrite rulings.

## F-SOL-GOV-005 — [P1 content governance] The declared lore truth hierarchy cannot currently be followed

**Evidence**

- `lore/README.md:11-16` requires `institutions.md`, `places.md`, and `eras.md`.
- The `lore/` directory currently contains only `README.md`, `canon-rules.md`, `characters.md`, and `story-arc.md`.
- `CLAUDE.md:78` calls `lore/` the source of truth for all content facts.
- `docs/GOLD_RUSH_BRIEF.md:275-297` says canonical Portal-repo design-pack files win on disagreement.
- The cited local path `docs/design/agent-town-design-pack/` is absent from this repository.

**Impact**

An agent cannot resolve content conflicts solely from required local reads; missing pages invite duplicated or contradictory canon.

**Recommendation for triage**

Complete the three declared lore pages from cited owner/spec evidence and state one local precedence chain. If external Portal files remain authoritative, vendor a stable digest/reference or clearly document how an agent can access them.

## F-SOL-GOV-006 — [P2 canon clarification] The E6 retroactive origin still leaves E1–E5 public vocabulary ambiguous

**Evidence**

- `docs/decisions/ADR-003-agent-origin.md:3-7` says agents "as the universe knows them" begin at Epoch 6's Calculating House.
- `lore/characters.md:8-11` calls the E1 Prospector "THE agent" and says it is present when agents begin at E6.
- `specs/epoch-saga/README.md:37` supplies the intended reconciliation: the E1 Prospector is a brass hover-automaton/helper, and E6 retroactively tells how recruited agents become era-canon.
- No local naming rule says whether E1–E5 dialogue/marketing should call that helper an agent, automaton, deputy, or proto-agent before the reveal.

**Impact**

Dialogue and marketing can spoil the E6 lore turn or overcorrect by denying the E1 partnership; different agents can make opposite copy choices while each citing canon.

**Recommendation for triage**

Attended clarification only: add one public-vocabulary sentence to the existing E6 reconciliation and cross-link ADR-003/`characters.md`. Do not reopen the already-specified retroactive origin or let an implementation branch decide terminology implicitly.
