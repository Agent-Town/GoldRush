# Character orientation findings

Scope: read-only reconciliation of `docs/CONTENT-MAP.md`, character lore,
runtime registries, visual ledgers, motion evidence, marketing rules, and the
external Agent Town character bank. No art, runtime, lore, or publication state
was changed.

Snapshot: Gold Rush `230fb98`, 2026-07-10. Re-verify mutable status against the
current ledger and registries before implementation or publication.

## F-SOL-CHAR-001 — P0 — Active Hero locomotion contradicts ratified identity

**Evidence:** `lore/characters.md:3-6` makes the Hero a young woman.
`assets/layer-contracts/characters.v2.json:49-68` marks walk4 ACTIVE and walk8
disabled. Visual inspection of `assets/raw/char-hero-sheet-walk4-a.png` and
`char-hero-sheet-walk4-b.png` shows the older male Hero. The all-female v3
walk8 cells are processed but dormant.

**Impact:** ordinary gameplay and every fresh gameplay capture can contradict
the character wiki. Direction/state changes may also combine identities from
different generations of Hero art.

**Next action:** an attended owner verdict on the all-female v3 sheet, followed
by one narrowly scoped runtime/art task that reconciles the complete visible
state set: locomotion, idle, hit, pan, build, aim, fallbacks, and direction
aliases. Do not treat simple flag activation as pre-approved, and block fresh
Hero gameplay captures until the resulting state set is visually gated.

## F-SOL-CHAR-002 — P1 — Hero walk8 raw source points at a superseded mixed sheet

**Evidence:** `assets/raw/char-hero-sheet-walk8.png` has SHA-256
`54cce3c4c8b05c3c7b39d6d33d8c7b3a2fcf54f05c9ce5f44977b31fa9a5506e`,
identical to the failed original under
`assets/motion-pilot/production-hero/char-hero-sheet-walk8.png`. It visibly
mixes male and female rows. The all-female v3 source that passed production QA
remains at
`assets/motion-pilot/production-hero-v3/char-hero-sheet-walk8.png` with SHA-256
`9ef82f6f12e1f5f7cc48c6de6355b331b045d247184f07a89360f0154dfe5f2d`.
`assets/LEDGER.md:225` names v3 as the accepted source, while line 232 records a
later re-extraction that overwrote the raw filename. The processed v3 cells are
unchanged and walk8 remains disabled.

**Impact:** future extraction, conditioning, or copying from the obvious raw
path can silently reintroduce the rejected identity even though runtime is safe
today.

**Next action:** restore the v3 production-QA source through the normal art
lane, retain the mixed sheet under an explicit superseded name, and reconcile
both ledger rows in the same commit. Keep runtime activation as a separate
owner-verdicted decision.

## F-SOL-CHAR-003 — P1 — Shipped town names are not yet in the character wiki

**Evidence:** `src/town/townsfolk.ts:48-200` names the shipped E1 ensemble.
`lore/characters.md:23-31` still groups most of those characters by role. The
wiki declares itself the home for every named soul and requires same-commit
canon.

**Impact:** story cards, Ledger quotes, marketing copy, and future aging chains
can diverge between archetypal roles and personal identities.

**Next action:** attended reconciliation only: decide which shipped names are
canon, then add cited entries to the wiki without silently rewriting ratified
arcs or runtime behavior.

## F-SOL-CHAR-004 — P1 — Newsie identity is simultaneously shipped and unresolved

**Evidence:** `src/town/townsfolk.ts:175-187` ships `Pip Quick` using the Pip /
Youngster A slot. `specs/gazette-house/README.md:15-17` still asks whether the
newsie is an existing youngster or a new child. `lore/agent-town-heritage.md:9`
contains `newsie (Juniper?)`. There is no dedicated newsie entry or `QUOTE:`
line in `lore/characters.md`.

**Impact:** the game can present Pip and Pip Quick as two simultaneous people
with one identity, while future Pony Express art could be conditioned on a
different youngster.

**Next action:** owner chooses existing Pip, Juniper, or a new character. The
choice should land with the wiki entry, quote, actor definition, Ledger entry,
and dedicated/reused art ruling together.

## F-SOL-CHAR-005 — P1 — Current campaign key art carries the old male-Hero canon

**Evidence:** `assets/requests/codex-art-run-009.md:46-57` describes the player
as a homesteader/prospector and predates the young-woman ruling. The resulting
`assets/raw/mkt-*` family visually follows that older Hero. Current canon says
“Prospector” belongs only to the agent.

**Impact:** using the existing key art as the public Hero image would repeat the
same identity error as the active walk4 runtime.

**Next action:** keep the files as historical composition references. Female
codex/turnaround art may guide internal drafts, but remains raw and
pending-consumption; select no public Hero final without the owner verdict.

## F-SOL-CHAR-006 — P2 — Future story promises need sequencing and status checks

**Evidence:** `docs/CONTENT-MAP.md` presents the Baron pride wound and a rough
return cadence as orientation. `lore/story-arc.md:24-30` still marks the exact
cadence and E10 kinship beat as recommendations/questions. The Elder is planned
to pass early in E2 (`lore/characters.md:19-21`), while shipped E2 beats give
her transition and Railcar-aftercare lines; those facts do not establish an
order for her passing.

**Impact:** a trailer or character thread could turn a proposal into a promise,
or imply an Elder sequence that has not been explicitly ordered.

**Next action:** market only ratified Baron material and avoid narrating the
Elder's E2 order. Resolve later cadence, kinship, and Elder sequencing in lore
before writing future-era character narration.

## F-SOL-CHAR-007 — P2 — Character asset coverage is uneven and easy to overstate

**Evidence:** at this snapshot, the Assay Clerk, Preacher, and Schoolteacher
have no walk8 sheets; the Preacher and Schoolteacher also lack turnarounds. The
Bandit Wrecker has a turnaround but no motion sheet. Hero and Prospector outfit
chains have no explicit E2/E10 plates; E9 townsfolk did not land; and E10's
final cast/Quiet presentation remains chiefly written design. The layer
contract and Ledger remain authoritative if this list later changes.

**Impact:** a concept-rich folder can be mistaken for a playable or
video-conditioned cast, causing campaign claims or generation briefs to start
from the wrong layer.

**Next action:** describe future plates as world previews, prove playable state
through manifests, and turn any chosen gap into an attended task rather than
assuming permission to generate.

## Standing selection guardrails

- `specs/marketing/README.md:36-41` says “Kids never appear,” but its scope is
  ambiguous between real-family privacy and fictional minors; using a fictional
  youngster publicly needs an owner clarification.
- `docs/CONTENT-MAP.md:22-25` and `e2e/en-02-e1-coverage.spec.ts:29-36,141-175`
  own the 063 quote/internal-text checks.
- Concept plates and finished Seedance source are not playable proof; the
  ledger and layer contract decide live versus dormant.
- Owner approval remains mandatory for every publication and every new spend.
