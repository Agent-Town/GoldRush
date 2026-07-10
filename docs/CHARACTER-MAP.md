# THE CHARACTER MAP — authority, coverage, and asset selection

This is an orientation index, not a second character bible and not an asset
inventory. Read `docs/CONTENT-MAP.md` first. Character facts remain owned by
`lore/`; current asset state remains owned by `assets/LEDGER.md`; shipped roster
and animation state remain owned by their registries. This file explains how
those layers relate and how to detect an unsafe selection.

Actionable evidence is tracked separately in
`reviews/sol-findings-character-orientation.md`.

## 1. Authority order

| Question | Source of truth |
|---|---|
| Who a character is, what is true about them, and how they speak | `lore/characters.md`, then `lore/story-arc.md` |
| What future-era role or encounter is design-locked | the relevant `specs/epoch-saga/e*-bundle.md` |
| Which town actors and names are shipped today | `src/town/townsfolk.ts` |
| Which visual was generated, accepted, superseded, processed, or integrated | `assets/LEDGER.md` and its cited request/run note |
| Which locomotion art the game can actually load | `assets/layer-contracts/characters.v2.json` plus `assets/processed/` |
| Which art slot a rendered actor owns | `src/assets/slots.ts` |
| What may appear in public campaign material | `specs/marketing/README.md` |

A shipped name is a runtime fact, not automatically universe canon. When code,
an old prompt, and ratified lore disagree, do not average them: use the newer
ratified lore and record the implementation mismatch as a finding.

## 2. Asset layers

Character files are intentionally layered:

- **Identity plates** — `assets/raw/codex-*` establish face, silhouette, role,
  and age continuity. Review them together in
  `artifacts/art-batch-016/contact-sheet.png`.
- **Turnarounds** — `assets/raw/turn-*` are conditioning inputs for motion,
  sprites, and future 3D work. Core and completion sheets are collected in
  `artifacts/art-batch-017/contact-sheet.png` and
  `artifacts/art-batch-018/contact-sheet.png`.
- **Runtime art** — `assets/processed/` is what the game may load. The binding
  mapping and activation flags live in `assets/layer-contracts/characters.v2.json`.
- **Motion evidence** — `assets/motion-pilot/production-*/` holds selected
  stills, Seedance videos, contacts, measurements, and run notes. A finished
  video or raw sheet is not integrated art until the ledger and layer contract
  say so.
- **Town portraits** — `assets/raw/townsfolk-*` and their processed copies own
  the shipped E1 ensemble. Placement, names, and barks live in
  `src/town/townsfolk.ts`.
- **Era concepts** — `assets/raw/plate-e*` visualize future outfits, opponents,
  bosses, and townsfolk. They are campaign/reference stock, not proof that the
  character or encounter is playable.
- **Marketing stock** — `marketing/raw/` and `assets/raw/mkt-*` are downstream
  consumers. They never outrank the codex or lore.

Use these status words precisely: **live** (player sees it), **registered
dormant** (processed and mapped, flag off), **raw/reference** (conditioning or
review input), **concept-only** (future design visualization), **superseded**
(provenance only), and **blocked** (unsafe to select).

## 3. Character families

| Family | Narrative job | Best visual anchors | Selection rule |
|---|---|---|---|
| **Hero** | The labor arc: claim-holder, founder, elder stateswoman, giver of the Charter Press | Hero codex identity chain, era outfits, and turnarounds | Never call her the Prospector. Internal references, runtime capture, and public finals have different gates; check §4 and the current findings before selecting art. |
| **Prospector** | The agent/deputy and trust arc; the founding line that reaches the Calculating House and Ark | Prospector codices, turnaround, portrait, and hover evidence | Keep the agent visually and verbally distinct from the Hero; prove current gameplay state through the layer contract. |
| **Baron and Claim Jumpers** | E1 antagonist thread, recurring pride wound, and the outlaw opponent family | Baron codex/turnarounds/kit, Claim Jumper sheets, contract plate | Check lore before promising a return and the layer contract before calling motion playable. |
| **E1 town ensemble** | Human-scale voices for contracts, economy, research, civic life, and return comfort | townsfolk portraits, codices/turnarounds, shipped actor registry | Read names and shipped behavior from the actor registry, but promote neither into universe canon without a wiki ruling. |
| **Generations** | Makes time visible from the E1 youngsters through the Moon-born child and the final inheritance | youngster codices, turnarounds, aging references, and era townsfolk plates | Treat future lineage names as design facts until promoted to lore; clarify the marketing law before selecting any fictional minor. |
| **Era opponents and bosses** | Gives each epoch its own pressure while the Baron remains an event rather than wallpaper | each epoch bundle plus epoch enemy and boss plates | A concept plate is a world preview, not proof of playable content. |
| **Agent Town heritage cast** | Broader universe/platform ensemble and possible future citizens | Gold Rush heritage catalog plus Portal hero-cast and Agentfolk libraries | Reusable as upstream style/story reference only. None is automatically a Gold Rush gameplay character. |

## 4. Selection hazards and current report

The time-stamped reconciliation lives in
`reviews/sol-findings-character-orientation.md`. Recheck its findings against
the ledger and registries before acting; do not copy its snapshot back into this
map as a permanent roster.

- **Identity disagreement blocks the affected output, not every use.** A
  runtime mismatch blocks gameplay capture; a superseded campaign image blocks
  that image; raw codex/turnaround art may still guide internal continuity. A
  public final always needs the owner verdict required by the marketing plan.
- **A locomotion replacement is not a complete character replacement.** Review
  idle, hit, pan, build, aim, fallbacks, and direction aliases as one visible
  state set before activating or capturing a revised identity.
- **An obvious filename is not provenance.** Follow the ledger to its cited run
  note, verdict, and supersession chain before copying or conditioning from raw
  art.
- **Shipped names are not automatically story canon.** Runtime behavior belongs
  to the actor registry; universe identity belongs to the wiki.
- **Future gaps authorize nothing.** Missing motion, outfits, aging passes, or
  era plates must become an attended task before generation or integration.

## 5. Text and reveal laws

Any character copy rendered in game must follow the **063 voice law** from
`docs/CONTENT-MAP.md`: only in-world truth a child could overhear in the tavern;
no filenames, batch ids, dates, citations, or canon instructions. Character
Ledger pages take their quote from the `QUOTE:` lines in `lore/characters.md`.
The executable assertion pattern lives in `e2e/en-02-e1-coverage.spec.ts`.

Locked contract appearances involving characters also follow the **mystery
law**: name, dimmed art, one rumor, and unlock terms only. Goals and rules appear
after unlock. The same e2e file owns the locked-versus-unlocked assertion.

Story beats remain attributable to a face, brief, non-blocking, and based on
existing triggers. The governing story shape is in `specs/story-spine/README.md`;
the current speaker and beat tables live under `src/story/`.

## 6. Marketing and video selection

- The campaign premise may lead with the **Hero + Prospector** partnership.
  Female-Hero codices and turnarounds may guide internal drafts, but their
  ledger state is raw/pending-consumption: they are not public-final approval.
  Current gameplay capture and older Hero key art require the specific blockers
  in the findings report to be closed.
- The Prospector is the first character package to evaluate for a low-risk cut;
  verify its current animation, portrait, footage, and audio state at selection
  time and still obtain publication approval.
- Use Baron material for the existing villain beat and E1/E2 story only; do not
  promise an exact later cadence while `lore/story-arc.md` still carries open
  cadence and E10 questions.
- Treat era character, enemy, and boss plates as **world previews** unless their
  corresponding gameplay manifest is shipped.
- `specs/marketing/README.md` says “Kids never appear,” but does not distinguish
  real-family privacy from fictional minors. Get an owner scope ruling before
  putting a fictional youngster in public campaign material.
- Publication still requires owner approval. This map authorizes no asset
  replacement, generation, or post.

## 7. External upstream libraries

The deeper Agent Town character bank remains useful but non-binding. Its main
homes are `/Users/robin/Projects/Portal/reports/`, the Portal hero-cast branch,
and the `agent-town-branding` / `agent-town-assets` repositories. Read each
library's own status before reuse; external approval does not automatically
make a character Gold Rush canon or gameplay art.

Prefer the curated in-repo heritage catalog at
`assets/reference/agent-town-heritage/CATALOG.md` before reaching into those
external folders.

## 8. Fast review path

1. Read `lore/characters.md` and `lore/story-arc.md` for identity and arc.
2. Review the three character contact sheets named in §2.
3. Check `assets/LEDGER.md` for the selected character’s current status.
4. Check `assets/layer-contracts/characters.v2.json` before calling any sprite
   live or dormant.
5. Read the relevant epoch bundle before using a future-era plate.
6. Apply §5 and the marketing approval law before writing copy or assembling a
   cut.
