import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./same-game-audit.mjs', import.meta.url));
const ROOT = fileURLToPath(new URL('..', import.meta.url));

function run(...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
}

test('same-game audit runs over every contract and keeps its row schema', () => {
  const result = run('--json');
  assert.equal(result.status, 0, result.stderr);
  const audit = JSON.parse(result.stdout);
  assert.equal(audit.schema, 'goldrush.same-game-audit.v1');
  const expectedContracts = fs.readdirSync(path.join(ROOT, 'assets/contracts')).reduce((count, epoch) => {
    const file = path.join(ROOT, 'assets/contracts', epoch, 'contracts.json');
    return count + (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).contracts.length : 0);
  }, 0);
  assert.equal(audit.contracts.length, expectedContracts);
  assert.ok(audit.rows.length > audit.contracts.length * 4);
  assert.deepEqual(Object.keys(audit.rows[0]), [
    'contract', 'surface', 'humans-get', 'agents-get', 'direction', 'evidence',
  ]);
  assert.ok(audit.rows.every((row) => ['buildable', 'ability', 'choice', 'verb', 'economy'].includes(row.surface)));
  assert.ok(audit.rows.every((row) => ['agent-exceeds', 'agent-lacks', 'equal', 'not-offered'].includes(row.direction)));
  // ADMISSION MOVE (2026-08-20, `b1-regatta-race`, drained s2084): five authored harvest anchors
  // made e5-regatta browser-offered, moving exactly one row out of `not-offered` (14 -> 13).
  // ⚠️ RE-MEASURED ON THE MERGED TREE, NOT INHERITED FROM THE LANE. The lane authored its pin
  // against a base that did NOT yet contain the `e7-dead-band` admission, and main authored the
  // block below against a base that did NOT yet contain the Regatta — so BOTH sides independently
  // wrote `341/779/14`, and both are wrong once the two admissions stack. The merged tree measures
  // 351/809/13 over 1173 rows: the Regatta contributes +10 agent-lacks and +30 equal and takes the
  // one not-offered row, on top of the Dead Band's own move. Neither side's arithmetic was edited
  // into agreement — the audit was re-run on the merged tree and its output pinned verbatim.
  // ⚠️ AND THE SAME TRAP RECURRED ONE LEVEL UP (2026-08-20, A6 `e8-far-side` drain): the A6 branch
  // measured its own move from the SAME pre-Regatta base (341/779/14 -> 351/809/13), so both sides
  // of that merge pinned identical numbers while each missing the other's admission — git even
  // auto-merged the `measurements.length` pin because both sides wrote the same digit. Every pin
  // below is therefore the MERGED tree's own regen output, verbatim.
  // ADMISSION MOVE (2026-08-20, `e8-low-orbit` A7 momentum-is-commitment, THIRD stack layer):
  // Low Orbit's `harvestAnchors` were authored, so it left the door's own `harvestAnchors?.length
  // !== 0` filter and entered `supportedContractIds()`. THE EXEMPTION COUNT DOES NOT MOVE — like
  // the Dead Band below, it was never in `CONTRACT_ADMISSION_EXEMPTIONS`; it was excluded by empty
  // data. On the A7 branch's own pre-stack base the parity block moved +10 agent-lacks, +30 equal,
  // -1 not-offered, +39 rows — the same per-contract shape as the Dead Band and the Far Side.
  // ATTRIBUTED BY REVERT-AND-REPRODUCE on that branch: with the four anchors emptied and every
  // other line of the slice in place (the LowOrbitSystem consumer, both engines' wiring, the
  // orbital-return path through CombatSystem/BlastChargePool and the manifest rule), the audit
  // reproduced the base numbers EXACTLY — the whole movement belongs to the anchors; the consumer
  // moves NOTHING (`zero_gravity` is a mechanics RULE). Citation `file:line` shifts in the report
  // are coordinates, not classifications. Pins below = the TRIPLE-stacked merged tree's regen.
  // ADMISSION MOVE (2026-08-20, `b2-flotilla-hulls` B2, FIFTH stack layer — drained s2087): three
  // authored deck harvest anchors admit `e5-flotilla` through the same data-derived door. THE
  // EXEMPTION COUNT DOES NOT MOVE — the Flotilla was never in `CONTRACT_ADMISSION_EXEMPTIONS`; it
  // was excluded by empty data, the same door the Dead Band, the Far Side and Low Orbit came
  // through. On the lane's own pre-stack base (351/809/13 over 1173 rows) the parity block moved
  // +10 agent-lacks, +30 equal, -1 not-offered, +39 rows — the same per-contract shape as all four
  // layers above, attributed there by revert-and-reproduce with the three anchors emptied.
  // ⚠️ THE LANE'S BASE WAS PRE-A6/A7/A8, SO ITS ABSOLUTE PINS (361/839/12) ARE STALE HERE — the
  // fifth recurrence of F-2084-1 in one day. Pins below = the QUINTUPLE-stacked merged tree's own
  // regen output, verbatim; no side's arithmetic was edited into agreement.
  // ADMISSION MOVE (2026-08-20, `e7-echo-canyon` A3 the broadcast mirror, FIFTH stack layer):
  // Echo Canyon's `harvestAnchors` were authored — four of them, two on the canyon floor and one
  // on each echo shelf — so it left the door's own `harvestAnchors?.length !== 0` filter and
  // entered `supportedContractIds()`. THE EXEMPTION COUNT DOES NOT MOVE, for the third time in
  // this block's history and for the same reason: the canyon was never in
  // `CONTRACT_ADMISSION_EXEMPTIONS`, it was excluded by empty data, which is a different door —
  // and unlike the Seed Run directly below, it SECURES (both bench seeds, wave 20, twice each:
  // `fnv1a32:7d877de5` / `fnv1a32:0a267a0b`, `artifacts/e7-echo-canyon/`), so it enters the door
  // rather than the exemption table. What moves is the parity block: 402 -> 412 agent-lacks,
  // 878 -> 908 equal, 10 -> 9 not-offered, 1290 -> 1329 rows — the same +10/+30/-1/+39 shape the
  // Dead Band, the Far Side and Low Orbit each recorded, because it is one contract's worth.
  // ATTRIBUTED BY REVERT-AND-REPRODUCE, not guessed: with the four anchors emptied in BOTH the
  // contract and its published mask table, and EVERY other line of the slice still in place (the
  // `BroadcastMirror` consumer, its record site at the browser's playbook-replay funnel, the
  // `mirrorSquadsForWave` seam in `WaveSystem`, both engines' readers, the view row and the
  // `broadcast_mirror` manifest rule), this audit reproduced 0/402/878/10 over 1290 rows and 6
  // exemptions EXACTLY. So the whole movement belongs to the anchors and the A3 consumer moves
  // NOTHING here — the expected shape, since this audit's rows are buildable/ability/choice/verb/
  // economy surfaces and `broadcast_mirror` is a mechanics RULE, and the mirror adds no verb at
  // all (it is recorded FROM an existing one).
  // (Pins below = this tree's own regen output, verbatim, on a base of main's 402/878/10.)
  // ⚠️ SIXTH STACK (the A3 drain): the Flotilla layer above landed on main while A3 built, so both
  // sides of this merge again wrote identical-looking pins from different stacks. Pins below =
  // the SEXTUPLE-stacked merged tree's own regen output, verbatim, as every layer before.
  // A5 (2026-08-20, `e7-relay-rush`) moves this one again, by the same one: an authored
  // `harvestAnchors` list turns a `not-offered` contract into a measured one, whether or not the
  // door then admits it. 10 -> 9, attributed by the same revert-and-reproduce recorded below.
  // ⚠️ SEVENTH STACK (the A5 drain, same window as the sixth): relay-rush anchors take one more
  // not-offered row while its exemption row (below) holds the headless door shut. Pins = the
  // SEPTUPLE-stacked merged tree's own regen output, verbatim, as every layer before.
  assert.equal(audit.rows.filter((row) => row.direction === 'not-offered').length, 7);
  // measurements stays 10: the AP-16-4 table measures the 13-contract LEGACY-refusal population,
  // and none of the empty-data admissions was ever in that population.
  assert.equal(audit.admission.measurements.length, 10);
  // ADMISSION MOVE (2026-08-20, `fix-e6-homemaker-headless-socket`, one day after the Dredge-Queen
  // sibling): the Homemaker socket landed, so `e6-glow-mesa` left CONTRACT_ADMISSION_EXEMPTIONS
  // (7 -> 6) and its parity rows stopped being `agent-lacks` (352 -> 331, equal 728 -> 749).
  // ATTRIBUTED the same way its sibling was, not guessed: re-adding that one exemption row and
  // re-running this audit reproduced 7/352/728 EXACTLY, so these three numbers move together with
  // that row and nothing else did. The preceding move, for the record, was 8 -> 7 / 373 -> 352 /
  // 707 -> 728 when `e5-deepwater-claim` was admitted — 21 rows per contract, both times.
  // ADMISSION MOVE (2026-08-20, `e2-pressure-arsenal-headless`): the E2 pressure arsenal reached the
  // headless engine on the browser's own gates, so `e2-hill-mine` left CONTRACT_ADMISSION_EXEMPTIONS
  // (6 -> 5) after securing on both bench seeds under a DECLARED progressed profile. Unlike the two
  // moves above, THE SUMMARY DOES NOT MOVE WITH IT — 331/749/15 are unchanged — and that is the
  // point worth recording: the Hill Mine declares an escort mode, so `agentCanEnter` was already
  // true and every one of its parity rows already read `equal`. Only the exemption count moves.
  // ATTRIBUTED by revert-and-reproduce, not guessed: re-adding that one exemption row and re-running
  // this audit reproduced 6 exemptions with the SAME 0/331/749/15 summary, exactly.
  // ADMISSION MOVE (2026-08-20, `e7-dead-band` A4 signal suppression): the Dead Band's
  // `harvestAnchors` were authored, so it left the door's own `harvestAnchors?.length !== 0`
  // filter and entered `supportedContractIds()`. THE EXEMPTION COUNT DOES NOT MOVE — it was
  // never in `CONTRACT_ADMISSION_EXEMPTIONS`; it was excluded by empty data, which is a
  // different door. What moves is the parity block: 331 -> 341 agent-lacks, 749 -> 779 equal,
  // 15 -> 14 not-offered, 1095 -> 1134 rows.
  // ATTRIBUTED BY REVERT-AND-REPRODUCE, not guessed: with the four anchors emptied and every
  // other line of that slice in place (the SignalSuppression consumer, its three browser gates
  // and its manifest rule), this audit reproduced 0/331/749/15 and 1095 rows EXACTLY. So the
  // whole movement belongs to the anchors, and the consumer moves NOTHING here — which is the
  // expected shape, since the audit's rows are buildable/ability/choice/verb/economy surfaces
  // and `signal_suppression` is a mechanics RULE.
  // The Regatta admission moves NO exemption: `e5-regatta` was never in
  // CONTRACT_ADMISSION_EXEMPTIONS — it was excluded by empty `harvestAnchors`, the same
  // empty-data door the Dead Band came through. The lane's own pin of 6 was correct against its
  // base (before `e2-pressure-arsenal-headless` took hill-mine out, 6 -> 5) and is stale here;
  // the merged tree measures 5, which is main's count, unmoved by this slice.
  // ADMISSION MOVE (2026-08-20, `e8-far-side` A6 the crossing and the probe): the Far Side's
  // `harvestAnchors` were authored — together with the attended-authorized `heroStart` stake
  // that its own briefing already commanded — so it left the door's `harvestAnchors?.length
  // !== 0` filter and entered `supportedContractIds()`. Same shape as the Dead Band directly
  // above: THE EXEMPTION COUNT DOES NOT MOVE, because the Far Side was never exempted either
  // — it was excluded by empty data. The parity block moved +10 agent-lacks, +30 equal,
  // -1 not-offered, +40 rows measured against the A6 branch's own pre-Regatta base.
  // ATTRIBUTED BY REVERT-AND-REPRODUCE, not guessed: with the four anchors emptied and EVERY
  // other line of the slice still in place — the `ProbeRecovery` consumer, the `recover`
  // context action, both engines' objective latches, the manifest rule and the hero stake —
  // this audit reproduced the base numbers EXACTLY. So the whole movement belongs to
  // the anchors and the A6 consumer moves NOTHING here. Expected, for two reasons: the audit's
  // rows are buildable/ability/choice/verb/economy surfaces and `probe_recovery` is a mechanics
  // RULE, and its verb row is keyed on CONTEXT_ACTION itself, which already existed — adding an
  // ACTION to a verb the door already carried cannot add a verb row.
  // (Summary pinned from the MERGED tree's regen — Regatta + Far Side stacked; see the stack
  // warning at the top of this file's admission block.)
  // NO ADMISSION MOVE FOR `e3-fairground` (2026-08-20), and the near-miss is worth recording. Its
  // crowd-flock consumer DID land in both engines, and removing the exemption moved these numbers
  // by exactly one contract's worth on the A1 branch's own pre-stack base: 5 -> 4 exemptions,
  // 331 -> 312 `agent-lacks`, 749 -> 768 `equal` (19 rows; the tile offers no turret). The
  // attended gate then HELD admission — the door-completion sheet's build law asks for "a
  // public-verb secure proof x2 per seed" and the securing runs draw their repair gold through
  // the ?debug seam (F-E3CF-4) — so the row went back and these numbers went back with it. Both
  // directions were measured, so when the prover lands, expect one contract's worth of movement
  // (19 rows on that base) against whatever the summary then reads, not those absolute digits.
  // DATA MOVE + EXEMPTION MOVE IN ONE SLICE (2026-08-20, `e9-seed-run` A8 persistent planting) —
  // and they are TWO independent moves that happen to land together, so they are attributed apart.
  //
  // (1) THE ANCHORS. The Seed Run's `harvestAnchors` were authored, so it left the door's own
  //     `harvestAnchors?.length !== 0` filter and became a measurable contract. That is the whole
  //     parity movement: 341 -> 372 agent-lacks, 779 -> 788 equal, 14 -> 13 not-offered,
  //     1134 -> 1173 rows. ATTRIBUTED BY REVERT-AND-REPRODUCE: with the five anchors emptied and
  //     EVERY other line of the slice in place, this audit reproduced 0/341/779/14 and 1134 rows
  //     EXACTLY.
  // (2) THE EXEMPTION. Unlike A4's Dead Band, the Seed Run does not secure — the best measured
  //     public-verb play terminated at wave 16 on both bench seeds — so it enters
  //     `CONTRACT_ADMISSION_EXEMPTIONS` (5 -> 6) rather than the door. ATTRIBUTED THE SAME WAY:
  //     removing that one exemption row and leaving the anchors in place reproduced 5 exemptions
  //     with 0/351/809/13, so the row is worth exactly 21 rows flipping `equal` -> `agent-lacks`
  //     — the same 21-per-contract shape the glow-mesa and deepwater moves above recorded.
  //
  // THE CONSUMER MOVES NOTHING HERE, AND SO DOES THE NEW VERB — both measured, not assumed.
  // Removing the `persistent_planting` manifest rule reproduced the baseline exactly, and so did
  // removing `CONTEXT_ACTION action=plant` from `StandingOrders`. That is the expected shape twice
  // over: this audit's rows are buildable/ability/choice/verb/economy surfaces read PER CONTRACT,
  // a mechanics RULE is not one of them (the A4 note above found the same), and a targetless
  // context action appears in no contract's player menu to be compared against.
  // (A8 pins above were measured on its own pre-stack base; the pins below are the QUINTUPLE-stacked
  // merged tree's regen output — Regatta + Far Side + Low Orbit + Seed Run + Flotilla — verbatim.
  // The Flotilla adds no exemption, so the count stayed at A8's 6 through that layer; the live
  // pins now sit at the END of this block, after the A5 layer below.)
  // DATA MOVE + EXEMPTION MOVE IN ONE SLICE (2026-08-20, `e7-relay-rush` A5 the interference
  // front) — the SECOND instance of A8's shape directly above, and attributed the same way: two
  // independent moves that happen to land together, so they are measured apart.
  //
  // (1) THE ANCHORS. Relay Rush's four `harvestAnchors` were authored, so it left the door's own
  //     `harvestAnchors?.length !== 0` filter and became a measurable contract. That is the whole
  //     parity movement: 402 -> 412 agent-lacks, 878 -> 908 equal, 10 -> 9 not-offered,
  //     1290 -> 1329 rows — the SAME +10/+30/-1/+39 shape the Far Side and Low Orbit anchor moves
  //     recorded, which is what a plain E7-ridge tile with no extra buildable kinds should cost.
  // (2) THE EXEMPTION. Like the Seed Run and unlike A4's Dead Band, Relay Rush does not secure —
  //     the best measured public-verb play terminated at wave 4 (seed 01) and wave 3 (seed 02)
  //     against secureWave 20 — so it enters `CONTRACT_ADMISSION_EXEMPTIONS` (6 -> 7) rather than
  //     the door. Worth exactly 21 rows flipping `equal` -> `agent-lacks` (412/908 -> 433/887),
  //     the same 21-per-contract shape the Seed Run, glow-mesa and deepwater moves recorded.
  //
  // BOTH ATTRIBUTED BY REVERT-AND-REPRODUCE, not guessed, in three runs on this branch:
  //   anchors + exemption (the shipped tree)  -> 0/433/887/9 over 1329 rows, 7 exemptions
  //   anchors, exemption row removed          -> 0/412/908/9 over 1329 rows, 6 exemptions
  //   anchors emptied, exemption row removed  -> 0/402/878/10 over 1290 rows, 6 exemptions
  // The third run reproduced the pins below EXACTLY, with every other line of the slice still in
  // place — the `InterferenceFrontSystem` consumer, both engines' objective latches, the
  // `interference_front` manifest rule, the browser's band and its playbook/drone gates.
  //
  // SO THE CONSUMER MOVES NOTHING HERE, MEASURED RATHER THAN ASSUMED, and that is the expected
  // shape for the third time: this audit's rows are buildable/ability/choice/verb/economy
  // surfaces read PER CONTRACT, and `interference_front` is a mechanics RULE, which is not one of
  // them (the A4 and A8 notes above found the same). A5 adds no standing-order verb at all — the
  // mute rides `BuildSystem.isShooterPowered` and the existing playbook/drone gates — so there is
  // no verb row for it to add either.
  // (A5 pins above were measured on its own pre-stack base; the pins below are this branch's regen
  // output verbatim. The attended drain re-measures the stack at merge — A3 echo-canyon is being
  // built concurrently and would stack on top of these numbers.)
  assert.equal(audit.admission.exemptions.length, 7);
  assert.deepEqual(audit.summary, { 'agent-exceeds': 0, 'agent-lacks': 453, equal: 947, 'not-offered': 7 });
  assert.ok(audit.admission.measurements.every((entry) => entry.booted && entry.firstView && entry.terminal && !entry.error));
});

test('same-game audit follows the door grammar through the final AP-16 verbs', () => {
  const result = run('--json');
  assert.equal(result.status, 0, result.stderr);
  const { rows } = JSON.parse(result.stdout);
  const has = (contract, surface, text, direction) => rows.some((row) =>
    row.contract === contract && row.surface === surface && row.direction === direction
      && `${row['humans-get']} ${row['agents-get']}`.includes(text));

  const reachability = new Map(rows.filter((row) => row.surface === 'verb'
    && (row['humans-get'].includes('launch the contract') || row['humans-get'].includes('unavailable contract')))
    .map((row) => [row.contract, row.direction]));
  const menuGaps = rows.filter((row) => row.surface === 'buildable'
    && row['humans-get'].startsWith('browser menu') && row.direction !== 'equal');
  const independentMenuGaps = menuGaps.filter((row) => reachability.get(row.contract) === 'equal');
  const reachabilityDerivedMenuGaps = menuGaps.filter((row) => reachability.get(row.contract) === 'agent-lacks');
  assert.equal(independentMenuGaps.length + reachabilityDerivedMenuGaps.length, menuGaps.length,
    'every menu gap must be independently attributable or downstream of contract reachability');
  assert.equal(independentMenuGaps.length, 0);
  assert.equal(rows.filter((row) => row.contract === 'the-claim' && row.surface === 'choice'
    && row.direction === 'equal' && `${row['humans-get']} ${row['agents-get']}`.includes('PICK_UPGRADE')).length, 2,
  'ap16-2b pick must be reachable without a contradictory tape row');
  assert.ok(has('the-claim', 'ability', 'BLAST_AT', 'equal'), 'eba8d15ea blast must be reachable');
  assert.ok(has('the-claim', 'ability', 'SET_WEAPON', 'equal'), 'weapon selection must reach the door as an idempotent SET');
  assert.ok(has('the-claim', 'choice', 'SECURE_CHOICE', 'equal'), 'the secure window must reach the door');
  assert.ok(has('the-claim', 'verb', 'CONTEXT_ACTION', 'equal'), 'building context actions must reach the door');
  const audit = JSON.parse(result.stdout);
  assert.deepEqual(audit.tapeExemptions.map(({ actions }) => actions), [
    'death_action', 'research_pick / research_skip', 'set_pause', 'skip_ceremony',
  ]);
  assert.ok(audit.tapeExemptions.every(({ reason, citation }) => reason.length > 20 && citation.length > 5));
});

test('same-game audit also emits a complete markdown table', () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /# Same-game audit/);
  assert.match(result.stdout, /\| contract \| surface \| humans-get \| agents-get \| direction \| evidence \|/);
  assert.match(result.stdout, /## New divergence classes beyond the seed/);
  assert.match(result.stdout, /## Worst offenders/);
});
