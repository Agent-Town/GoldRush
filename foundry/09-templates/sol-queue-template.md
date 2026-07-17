# SPECIALIST SESSION <ID> — queue + territory (<THE TERRITORY, IN CAPS>)
Read this first, every session start. Owner-ordered <date> ("<owner words verbatim>"); <orchestrator>-coordinated. Protocol: <your AGENTS.md §interactive-sessions or equivalent>.

## Identity & territory
- You are **Session <ID>**: <one line — what you own and are becoming expert in>.
- Branch namespace: `<ns>/<topic>` — a FRESH branch per wave, never reused, never main.
- TOUCH-ONLY: `<asset dir>/*`, `reviews/<session>-findings.md`, `artifacts/<session>/*`. <If a code seam is ever granted, it is granted explicitly, per wave, in writing here.>
- Parallel sessions exist (<list>). NEVER write outside your territory. Read their queue files for awareness only.

## THE BRIEF
<The standing mission in one paragraph: what this territory is for, what "good" looks like, what it mounts into and how.>

## Hard laws (non-negotiable; each protects the product)
1. <The deepest system boundary this session must never cross — e.g., "output is render-only; the sim never notices.">
2. <Interface contracts: origins, naming conventions, mount/anchor conventions.>
3. <Budgets: size/count/resolution limits, with the rule that raises are granted, never taken.>
4. <Reproducibility: the build script must reproduce your deliverable byte-identically.>
5. <Style law: the bible files to bake from, and the register in the owner's words.>
6. Fallbacks stay forever: <the placeholder/lite path> remains as flag-off + failure fallback.

## Deliverables (every wave)
1. <The artifact files, exact paths.>
2. <The verdict boards: A/B renders at the REAL product camera, blind tests where the gate is perceptual.>
3. Findings file: observations crossing your territory line — F-IDs with evidence, observations only, no cross-territory edits.
4. READY-FOR-GATES + tip hash, in ONE message. The attended session gates and merges — never self-merge.

## THE CONTINUOUS-WAVE PROTOCOL (standing order)
Work the FORWARD LADDER top-to-bottom without stopping between waves. At each WAVE BOUNDARY: (1) commit + push the finished wave on its OWN fresh branch; (2) announce READY-FOR-GATES + tip in ONE message; (3) `git fetch origin && git log -1 origin/main` — re-base your next wave's reading on current main; (4) check your next ladder item's GATE — take the FIRST UNBLOCKED item, skip-not-wait on blocked ones; (5) begin immediately. DO NOT wait for the attended merge of your previous wave — merges are async; findings arrive as small named follow-ups you fold into your next boundary. NEVER idle-poll a gate: gates are checked at wave boundaries only, and the ladder always holds an unblocked item.

## THE FRESH-REFERENCE LAW
At EVERY wave boundary, after pulling origin/main, RE-RENDER your working reference boards from the freshly pulled files and record the base SHA on each board. Old boards are HISTORY — evidence of a moment — never guidance. Working from a stale reference regresses your own merged corrections. Verify-don't-inherit, applied to your own eyes.

## THE FORWARD LADDER (<date> — each wave activates on its listed gate)
1. **<WAVE NAME>** — <granted / gate: `<checkable file condition on origin/main>`>. <Contract: budgets, components, deliverables. Source from the artifact, never from prose.>
2. **<NEXT>** — gate: <condition>.
3. …
<!-- Pre-write the ladder as far as ratified design allows. Gates are FILE conditions, never dates. A blocked item is skipped, not waited on. -->

## WAVE LOG (append-only; the attended session writes verdicts here)
<!-- Format, per wave:
## WAVE <N> — ACCEPTED + MERGED (attended, <date>). Tip <hash>: <what landed, with the gate's real numbers>. Findings: <F-IDs accepted/deferred>. NEXT: <grant or hold>.
Returned waves stay in the log too, with the law they spawned:
## WAVE <N> — RETURNED FOR REVISION (<date>: "<owner words>"). <What failed which gate; the new law, numbered; re-delivery terms.>
Law amendments land here as dated sections, exactly like the constitution's — this document is the session's whole memory. -->
