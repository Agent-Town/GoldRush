# The Epoch Substrate — ten eras through ONE data contract
Status: DRAFT 2026-07-10 (attended; answers F-SOL-MP-001 [P0] — `reviews/sol-findings-masterplan.md`: "072 activates Steamworks, but it does not create a reusable ten-era progression engine"). Decisions below are DECIDED; implementers escalate with evidence, never relitigate.

## The gap (Sol's evidence, verified)
`activateEpoch()` hard-requires `epoch-2-steamworks` (`ContractFamilies.ts:562-570`); the research tree is one static Frontier array (`ResearchTree.ts:75-210`); `EpochManifest` has no research channel; megaproject/transition targets are 072-hardcoded. Every era after E2 would need attended engine surgery — that's the spine bottleneck.

## Design decisions
1. **The manifest carries the era.** `EpochBundle` gains typed fields: `research` (three era-named branches; nodes: id, name, icon-key, effect-ref, cost, requires), `scienceThreshold` (steps to "epoch science complete", overflow banks per SCI law), `megaproject` (id, building/surface ref, cost {gold, banked science}, raise-action text), `transition` (ceremony beat id, kit art key, display name), `successor` (next epoch id). `loadEpoch()` validates ALL of it — reject-don't-stretch (assayer law): an invalid manifest is a loud error at load, never a partial era.
2. **Activation is generic.** `activateEpoch(target)` is legal iff `target === current.successor` AND the current era's megaproject-complete record exists. Zero hardcoded epoch ids in engine code. One-way in v1 (the 072 rule generalized).
3. **Research goes data-driven, Frontier becomes data.** `RESEARCH_NODES` = the ACTIVE epoch's manifest branches; today's static Frontier array moves VERBATIM into epoch-1's manifest (byte-equal node semantics — the migration proof: existing profiles' research state reads identically). Banked steps/records become per-epoch keyed (`gr.research.<epochId>.v1`, with the legacy key mapped to epoch-1 on first read).
4. **The chart follows.** ResearchChart renders the active epoch's branches + the 060 icon registry + Continued Study/banked overflow (saga README laws). The "next epoch awaits" column derives from `successor` + megaproject state — no Steamworks-specific strings in the component.
5. **072 is grandfathered, not rewritten.** Its persisted keys (ACTIVE_EPOCH_KEY, EPOCH_CEREMONY_KEY, the mill records) become the generic records' first instances; the generic code READS them (mapping shim), so E2-active profiles stay valid untouched.
6. **E2 gets its science as the proof content.** Extract the e2 bundle's science manifest (steam-era branches) into epoch-2's manifest data. THE PROOF GATE: a fresh-E2 profile researches steam nodes → banks the threshold → raises E3's megaproject target → `epoch-activated: epoch-3-voltage` fires — all WITHOUT engine edits beyond this slice. (E3 CONTENT beyond the manifest stub is NOT this slice.)
7. **Determinism untouched**: all meta-side; the run-sim reads era through the same loadContract paths 072 already routed. Hash asserted unchanged.

## Integration map
Touches: ContractFamilies (manifest schema+validation+activation), ResearchTree (data-driven), ResearchChart (generic render), epoch-1+2 manifest data, migration shims, e2e. UNTOUCHED: sim tick, Balance values, save schema beyond additive keys, MP, all E3+ content.

## Implementer
Task 077 (lane-b, sol@high). After it: each era's WP = manifest data + content + art — the spine Sol's review demanded.
