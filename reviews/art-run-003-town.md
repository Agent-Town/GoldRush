# art-run-003 / task-029 — S2 Town v1 raws (s64 drain 2)

**Verdict: PASS — extracted to `processed/`, integration DEFERRED to M6.** 14 QA-accepted raws → 14 processed assets. **No contract slots wired:** M6 town is unbuilt, so there is no consumer/placeholder — wiring a town layer-contract schema now would be speculative and likely wrong when the town-render slice defines the real consumer (§7 slots-before-wiring, "never invent scope"). This drain advances the pipeline raws→processed and de-risks the gray-key extraction; the contract wiring rides the M6 town slice.

## Scope
- Task `tasks/failed/rc1-...-029-art-shift-001.md` (ART slot, assets-only), QA log `assets/requests/codex-art-run-003.md` (all 14 raws QA-accepted: gray-bg cutouts + full-bleed interior, no text/weapons, canon-clean).
- This drain: extract-alpha + LEDGER slot-board rows. No `src/`, no contracts, no e2e.

## Evidence

### Extraction
- 5 buildings `--size 1024` (key 8a8a8a): keyed 49.3–55.2%, corners transparent, warm windows/interiors preserved.
- 8 townsfolk `--size 768` (key 8a8a8a): keyed 41.6–60.0%, portrait subjects intact.
- 1 tavern interior `--full-bleed --size 0`: 1536×1024 preserved, no keying.

### Visual QA
- **Buildings** (`reviews/shots-art-run-004/town-buildings-montage.png`): tavern (swinging sign, no text), general store (porch/barrels), claim office (flag, brass-plaque shapes no letters), schoolhouse (bell tower), chapel (modest, warm not grim). Isometric Frontier-Ledger warm palette; clean alpha, no gray halo/eaten interiors.
- **Townsfolk** (`town-folk-montage.png`): 8 warm ledger-engraving busts, diverse ages/builds, no caricature, no readable text, no weapons (youngster slingshot tucked in belt per QA, not aimed). Clean cutout alpha.
- **Tavern interior** (viewed in-drain, `assets/processed/tavern-interior-backdrop.png`): warm interior, long bar + stools, lit hearth, lanterns, notice board empty of text.

### Canon (brief §9)
No firearms, no gore, warm prosperity framing, no Native American imagery, no text/letters. PASS.

## Findings
None blocking. Note (inherited from run-003 QA): `townsfolk-youngster-b` was a vertical generator canvas centered/padded to 768² — reads fine.

## Deferred (owed to M6, not this fire)
- Town layer-contract slot schema (`town.bld.*`, `town.folk.*`, `town.tavern.interior_backdrop`) — define when the M6 town-render slice gives these a consumer, so the schema matches usage. Processed assets are ready; only the wiring waits.
