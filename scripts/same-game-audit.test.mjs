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
  assert.equal(audit.rows.filter((row) => row.direction === 'not-offered').length, 13);
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
  // ADMISSION MOVE (2026-08-20, `e8-far-side` A6 the crossing and the probe): the Far Side's
  // `harvestAnchors` were authored — together with the attended-authorized `heroStart` stake
  // that its own briefing already commanded — so it left the door's `harvestAnchors?.length
  // !== 0` filter and entered `supportedContractIds()`. Same shape as the Dead Band directly
  // above: THE EXEMPTION COUNT DOES NOT MOVE, because the Far Side was never exempted either
  // — it was excluded by empty data. The parity block moves: 341 -> 351 agent-lacks,
  // 779 -> 809 equal, 14 -> 13 not-offered, 1134 -> 1173 rows (+40 parity rows, -1 refusal).
  // ATTRIBUTED BY REVERT-AND-REPRODUCE, not guessed: with the four anchors emptied and EVERY
  // other line of the slice still in place — the `ProbeRecovery` consumer, the `recover`
  // context action, both engines' objective latches, the manifest rule and the hero stake —
  // this audit reproduced 0/341/779/14 and 1134 rows EXACTLY. So the whole movement belongs to
  // the anchors and the A6 consumer moves NOTHING here. Expected, for two reasons: the audit's
  // rows are buildable/ability/choice/verb/economy surfaces and `probe_recovery` is a mechanics
  // RULE, and its verb row is keyed on CONTEXT_ACTION itself, which already existed — adding an
  // ACTION to a verb the door already carried cannot add a verb row.
  assert.equal(audit.admission.exemptions.length, 5);
  assert.deepEqual(audit.summary, { 'agent-exceeds': 0, 'agent-lacks': 351, equal: 809, 'not-offered': 13 });
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
