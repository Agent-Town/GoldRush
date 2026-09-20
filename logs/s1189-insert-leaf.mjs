import fs from 'node:fs';

const path = 'tasks/goals.json';
const j = JSON.parse(fs.readFileSync(path, 'utf8'));

const leaf = {
  id: 'factory-m3-05c-run-ledger-meta-earned',
  title:
    'F-1131-1 residual (1): the Run Ledger ships every column the M3-05 master asked for EXCEPT meta earned — record the four-track MetaPayout already computed at RunManager.ts:429 into the history entry and render its non-zero tracks, with metaEarned OPTIONAL ON READ so no already-banked run vanishes',
  taskFile: 'lane-a-m3-05c-run-ledger-meta-earned.md',
  status: 'queued',
  lane: 'lane-a',
  authoredBy: 's1189 fire (FIRE-AUTHORED, attended review welcome)',
  predecessor: 'factory-m3-05b-run-ledger (merged f68a62159d5d20c648beb35ed914bdc4f881c9a7)',
  spec:
    'tasks/lane-a-m3-05-run-history.md (the original master, now a DO-NOT-QUEUE guard, residual item 1) + reviews/m3-05b-run-ledger.md; subjects src/ui/RunLedger.ts:6-15 (RunHistoryEntry), :75-97 (normalizeEntry), :123-140 (renderEntry), src/game/RunManager.ts:257-270 (run-end append) and :421-433 (awardSecuredClaim writes this.lastPayout at :429); datum src/game/MetaProgress.ts:2 META_TRACKS / :5 MetaPayout; test e2e/m3-05b-run-ledger.spec.ts',
  authorNotes:
    'AUTHORED FROM A MEASURED RESIDUAL, NOT A LADDER RUNG. s1189 was sent to retire the stale NOT-SHIPPED header on tasks/lane-a-m3-05-run-history.md (a standing desk item, Mistake-#8 shape) and re-measured the master against main at the files rather than the messages: f68a6215 shipped date/contract/outcome/waves/gold-split/duration and NOT meta earned. VERIFIED ABSENT, not inferred: RunHistoryEntry (RunLedger.ts:6-15) has no meta field and renderEntry (:123) renders no meta row, while META_PROGRESS_KEY=gr.meta.v1 exists at MetaProgress.ts:1 and awardSecuredClaim stores a full four-track MetaPayout in this.lastPayout at :429 — three lines ABOVE the appendRunHistory call at :260 that omits it. So the datum is unrecorded, not missing. The master other listed column, weapon split, is NOT owed: the m4-08 per-actor split superseded it, exactly as the master own re-scope note anticipated. THE BINDING RULE IS A TRAP THE PREDECESSOR AVOIDED AND THIS SLICE COULD RE-OPEN: normalizeEntry (:75) returns null on any validation failure and readRunHistory filters nulls out, so adding metaEarned to that closed validation gate would silently DELETE every run the player has already banked, and no existing test would fail — the F-1174-1 vocabulary-trap shape, a field added as a requirement instead of a sibling. metaEarned must be OPTIONAL ON READ FOREVER, the value spread preserved, and scope 4b demands an e2e seeded with a pre-slice entry carrying no metaEarned key at all to prove it. Non-secured runs (death, rush) never call awardSecuredClaim so they legitimately earn nothing: write NO field rather than a zero-filled object, and omit the rendered row entirely so a death card looks exactly as it does today. FIREWALLED WITH A STOP RATHER THAN AN EDIT: MetaProgress.ts, Balance.meta, awardSecuredClaim body, summarizeRun and the RunSuspend.ts:2684 payout codec are all untouched — this slice REPORTS meta, it does not change what a run pays, and ADR-002 reserves the agent track interpretation to M4, so display it and do not interpret it. Also firewalled: src/ui/DeathOverlay.ts, because F-1189-1 filed by the same fire — every ended run IS written to the ledger at RunManager.ts:260, but the sole open-run-ledger button sits on the SECURED overlay at :398, and DeathOverlay.ts:209 has no ledger entry point, so a player who dies cannot read the run they just banked — is an OWNER design call, not this runner to fix. A naming STOP is pre-declared as a SUCCESS: if the four track names territory/science/hero/agent are not player-facing vocabulary anywhere in the UI, the runner must stop with the evidence rather than invent player-facing nouns per canon 9.4, and formatMetaProgress plus the Claim Office are named as the places to look for existing vocabulary. LANE-SAFETY pre-proved by the unique-blob invariant, not the ahead-count: lane/m3 was 1 ahead at 371ce258 whose content shipped as 85650741, and git diff --name-only --diff-filter=A main..lane/m3 was EMPTY, so the reset destroys nothing. Routed to lane-a because lane-c was LIVE on the eight-winds row-order survey, and lane/perf on lane-d uniquely holds logs/suite-red-inventory-raw.json, preserved byte-identical on archive/suite-red-inventory-raw-171mb at blob e5ea5932, so it must not be reset casually.',
};

let done = false;

function walk(node) {
  if (done) return;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i += 1) {
      const child = node[i];
      if (child && child.id === 'factory-m3-05b-run-ledger') {
        node.splice(i + 1, 0, leaf);
        done = true;
        return;
      }
      walk(child);
      if (done) return;
    }
    return;
  }
  if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      walk(node[key]);
      if (done) return;
    }
  }
}

walk(j);

if (!done) {
  console.error('ANCHOR NOT FOUND — no write performed');
  process.exit(1);
}

fs.writeFileSync(path, `${JSON.stringify(j, null, 2)}\n`);
console.log('leaf inserted after factory-m3-05b-run-ledger');
