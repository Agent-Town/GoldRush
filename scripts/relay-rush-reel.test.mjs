import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

// RELAY RUSH — THE TWO REELS, AND WHY ONE OF THEM IS HISTORY.
//
// Heat 11's Opus ride secured `e7-relay-rush` on 2026-09-04 and its row stood verified on the
// county board. On 2026-09-06 the ADR-004 re-assay could not replay it: three instrument attempts
// each said "tape ran out after 36001 steps with the run still alive", and the row was retired
// with a lineage reason. Bisected by instrument (`artifacts/relay-rush-replays-again/bisect/`),
// the first commit that changes that reel's outcome is `b38d60295` — the e7-playbook-rows merge,
// which landed one hour after the ride and made the era's own errand the price of the claim:
// `autoSecureWaveForRun` gained `|| !this.playbookObjectiveAllowsSecure`
// (`src/sim/HeadlessContractSim.ts:1473`), and on THIS map that clause reads
// `interferenceFront.refusals.playbooks > 0` — the rider must have had a playbook muted by the
// static wall. Heat 11's rider carries no `PLAYBOOK_USE` at all (the verb did not exist for E7
// when it rode), so its run can no longer secure at any wave. That is ADR-004 rule 2 working, not
// a regression: an INTENDED composition change, retiring a row recorded on the old composition.
//
// This guard pinned BOTH halves as LIVE REPLAYS until 2026-09-18: the retired reel still failing
// for THAT reason (wave 20 reached, 200 gold banked, `refusals.playbooks` still 0, run alive at the
// end of its own tape), and heat 12's reel — recorded AFTER the merge, with one `PLAYBOOK_USE` in
// it — still replaying to its declared score and event-log hash.
//
// ⚠️ NEITHER REPLAY RUNS TODAY, AND NEITHER MAY (F-DRB-11 item 1, re-pointed 2026-09-18). ADR-005
// stage 3 (owner 2026-09-07) removed `MOVE_TO`, `HOLD` and `FALLBACK_IF` from the door grammar, and
// heat 12's plans carry `HOLD` — the strict validator now reads that reel as malformed, and the
// heat-11 reel is refused one step earlier still, on a `runStart.research.epochId` the door no longer
// installs. ADR-005 consequence 3 and amendment clause 6: "Existing tapes that use removed verbs no
// longer replay and retire under ADR-004 … retired rows are never repaired." So both tests below
// now pin the REFUSAL and its measured cause instead of the replay. The alarm is unchanged in
// direction: a change that let either reel replay again would have put the retired grammar — or an
// installable historical epoch pointer — back into the door, and owes the board a re-assay.
//
// 💰 COST — THE TWO EXPENSIVE HALVES ARE GONE WITH THE REPLAYS THEY PAID FOR (2026-09-18). The
// 40.4 s and 31.0 s rows below were the price of RUNNING the two reels; the door refuses both at
// construction now, so what is left is a boot and a throw. The reasoning underneath is kept
// verbatim because it is still the right reasoning — it is why nothing here was "trimmed as
// derivable" while the replays were possible, and why a future re-ride must pay the full price
// again rather than assert its way out.
//
// 💰 COST, RE-MEASURED 2026-09-07 AND DELIBERATELY KEPT (`spec-hygiene-batch` scope 6, which asked
// whether the retired-reel replay could be trimmed as derivable from the other tests; it CANNOT).
// One `node --test` on this Mac, whole file 72.1 s:
//     the E7 latch                                    0.38 s
//     the two reels differ by exactly the verb        0.004 s   (static read of both tapes)
//     the reel envelope admits the retired tape        0.16 s   (static length check)
//     heat 12 still replays to its declared score     40.4 s   (RETIRED 2026-09-18, see above)
//     the retired reel reaches wave 20 …              31.0 s   (RETIRED 2026-09-18, see above)
// ⚠️ THE THREE CHEAP TESTS ARE ALL STATIC, AND THAT IS EXACTLY WHY THEY CANNOT STAND IN. Together
// they cost 0.54 s and prove things about the FILES: which verbs each reel carries, how long they
// are. The 31 s test proves something about the ENGINE — that replaying the retired reel TODAY still
// reaches wave 20 with its declared 200 gold, still leaves the hero alive past the end of its own
// tape, and still reports `refusals.playbooks === 0` — which is the whole of the lineage reason the
// county's retirement cites. No amount of reading the tape can tell you what the current engine does
// with it, and "the first quietly passes again" (the invariant two paragraphs up) is undetectable
// without running it. Trimming it would save 31 s and delete the guard's only load-bearing half.
// The larger 40.4 s is heat 12's replay, the "this map is still winnable" half — equally irreplaceable
// for the same reason. So the whole file stays; it is a slow guard because the fact is a slow fact.

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (relative) => JSON.parse(readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8'));

/** The retired standing: heat 11's ride, `agent-bf8cd86d…`, verified 2026-09-04T23:17:57Z. */
const RETIRED = 'artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/work/attempt-1-tape.json';
/** The ride that secures under the current composition: heat 12, `agent-e8c4f218…`. */
const CURRENT = 'artifacts/gauntlet-heat12-20260905/rides/e7-relay-rush/submission.json';

/**
 * The ADR-005 retirement ledger, computed before the grammar removal landed and pinned against the
 * landed door by `rider-parity-retirement.test.mjs`. Read here for this reel's own row.
 */
const LEDGER = read('artifacts/rider-parity-grammar/retirement-ledger.json');

/** One vite server per test: the boot is ~10 s and the seam is read three ways off it. */
async function loadSeam(tape) {
  const location = new URL(`http://relay-rush-reel.test/?debug&contract=${tape.contract}&seed=${tape.seed}`);
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  const { AgentTapeReplaySession } = await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
  const { validateRunTape } = await vite.ssrLoadModule('/src/game/RunTape.ts');
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  return { AgentTapeReplaySession, validateRunTape, HeadlessContractSim, close: () => vite.close() };
}

/** Every order the tape ever submits, flattened; the tape's whole vocabulary in one list. */
function verbsOf(tape) {
  const verbs = [];
  for (const entry of tape.inputLog.entries) {
    for (const act of entry.a) for (const order of act.orders ?? []) verbs.push(order.verb);
  }
  return verbs;
}

test('the E7 latch: Relay Rush is latched on a MUTED playbook, and nothing else is', async () => {
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { E7PlaybookLatch } = await vite.ssrLoadModule('/src/systems/E7PlaybookLatch.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const manifest = loadContract('e7-relay-rush', 'epoch-7-signal');
    assert.equal(manifest.id, 'e7-relay-rush');
    const latch = new E7PlaybookLatch(manifest);
    // `twist.interferenceFront` selects the `suspended` clause — the map's OWN declaration, not a
    // per-map list somebody typed. The other three Signal maps pick their own clauses the same way.
    assert.equal(latch.objective, 'suspended');
    const signals = { suppressedUses: 0, fieldedMirrors: 0, mutedUses: 0 };
    assert.equal(latch.allowsSecure(signals), false, 'a run with no muted playbook cannot secure');
    assert.equal(latch.allowsSecure({ ...signals, mutedUses: 1 }), true, 'one muted playbook opens it');
    // The controls: neither of the other two signals discharges THIS map's errand.
    assert.equal(latch.allowsSecure({ ...signals, suppressedUses: 3 }), false);
    assert.equal(latch.allowsSecure({ ...signals, fieldedMirrors: 3 }), false);
    // And nothing off the Signal bundle grew a latch (F-1471-1: a declaration with no completion
    // path pins a run unsecurable forever).
    const claim = loadContract('the-claim');
    assert.equal(new E7PlaybookLatch(claim).objective, null);
    assert.equal(new E7PlaybookLatch(claim).allowsSecure(signals), true);
  } finally {
    await vite.close();
  }
});

test('the two reels differ by exactly the verb the latch asks for', () => {
  const retired = read(RETIRED);
  const current = read(CURRENT).tape;

  assert.equal(retired.id, 'agent-bf8cd86d-75f73cc6-ae0e-4f79-ae6f-167c3085475e');
  assert.equal(current.id, 'agent-e8c4f218-4307b4e1-08a4-457f-92ae-70f84329c564');
  for (const tape of [retired, current]) {
    assert.equal(tape.contract, 'e7-relay-rush');
    assert.equal(tape.seed, 'e7-relay-rush-01');
    assert.deepEqual(tape.outcome, { reason: 'secured', secured: true, waves: 20, timeAlive: 600, gold: 200 });
  }

  const retiredVerbs = verbsOf(retired);
  const currentVerbs = verbsOf(current);
  assert.equal(retiredVerbs.filter((verb) => verb === 'PLAYBOOK_USE').length, 0,
    'the retired reel rode before the verb existed on this map');
  assert.equal(currentVerbs.filter((verb) => verb === 'PLAYBOOK_USE').length, 1,
    'heat 12 used the playbook once, which is what the wall had to mute');

  // The envelope difference, and why it is NOT a second cause. The retired reel answered
  // SECURE_CHOICE AT the terminal tick, so its log runs one tick past the last step it caused
  // (`gr-sim.mjs:279`) and `durationTicks` is 18001 — which is also why the replay's ceiling is
  // 36001 rather than 36000. Its own ride warned that this would be refused as
  // `reel_duration_exceeded` against a flat `MAX_PLAYBOOK_TICKS` of 18000
  // (`artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/summary.json`, `doorRisk`). That
  // warning is STALE: the dome-basin envelope cure made the inclusive-endpoint slack unconditional
  // (`src/playbook/PlaybookFormat.ts:98`), so this contract's ceiling is 18002 and 18001 fits.
  // Pinned here so nobody re-derives a second cause from a stale note: the composition change is
  // the ONLY thing between this reel and a verified row.
  assert.equal(retired.inputLog.durationTicks, 18001);
  assert.equal(current.inputLog.durationTicks, 18000);
  assert.equal(retiredVerbs.at(-1), 'SECURE_CHOICE');
  assert.ok(!currentVerbs.includes('SECURE_CHOICE'), 'heat 12 let the secure default');
});

test('the reel envelope admits the retired tape: its length was never the reason', async () => {
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
    const envelope = runTapeEnvelopeForContract('e7-relay-rush');
    assert.equal(envelope.maxTicks, 18_002);
    assert.ok(read(RETIRED).inputLog.durationTicks <= envelope.maxTicks);
  } finally {
    await vite.close();
  }
});

test('heat 12 is retired too, at the door, for the HOLD its plans carry', async () => {
  // RE-POINTED 2026-09-18 (F-DRB-11 item 1, `tasks/hygiene-battery-lossless-triangles.md`). This
  // test was "heat 12 still replays to its declared score through the assayer own seam", and it
  // replayed the reel for 18,600 steps to its declared `fnv1a32:d381ebe2`. It cannot any more, and
  // the reason is a RULING, not a regression: ADR-005 stage 3 (owner 2026-09-07, "Humans cannot
  // control the positioning of the Prospector, just the rider") removed `MOVE_TO`, `HOLD` and
  // `FALLBACK_IF` from the door grammar, and this reel's plans carry `HOLD`. The strict validator
  // therefore reads the tape as malformed and the session refuses to boot. ADR-005 consequence 3
  // and amendment clause 6 are explicit about what happens next: "Existing tapes that use removed
  // verbs no longer replay and retire under ADR-004 … retired rows are never repaired." So the
  // fact this guard can still hold is the REFUSAL and its named cause — which is exactly the
  // "quietly passes again" alarm the file was built for, pointed the other way: if a future change
  // let this reel replay, the retired grammar would be back in the door.
  const tape = read(CURRENT).tape;
  assert.ok(verbsOf(tape).includes('HOLD'), 'the heat-12 reel is the one that carries the retired verb');

  // THE RETIREMENT LEDGER'S OWN ROW for this exact tape (`submission.json` and
  // `work/attempt-1-tape.json` are the same reel, `agent-e8c4f218…`), computed before the removal
  // landed and pinned by `rider-parity-retirement.test.mjs` against the landed door.
  const row = LEDGER.rows.find((entry) => entry.ride === 'e7-relay-rush' && entry.tape === 'attempt-1-tape.json');
  assert.ok(row, 'the ADR-005 retirement ledger no longer names this ride');
  assert.deepEqual(row.removedVerbs, ['HOLD']);
  assert.equal(row.afterGrammar, 'REFUSED_AT_SUBMISSION');
  assert.equal(row.firstRefusal.message, 'orders[30].verb "HOLD" is unknown.');

  // The score it DID reach, kept as history rather than re-proven: the row's own declaration.
  assert.deepEqual(tape.outcome, { reason: 'secured', secured: true, waves: 20, timeAlive: 600, gold: 200 });
  assert.equal(tape.eventLogHash, 'fnv1a32:d381ebe2');

  const { AgentTapeReplaySession, validateRunTape, close } = await loadSeam(tape);
  try {
    assert.equal(validateRunTape(tape), null, 'the strict validator still admits a HOLD-carrying reel');
    assert.throws(() => new AgentTapeReplaySession(tape), /malformed tape/,
      'the assayer seam booted a reel written in the retired grammar');
    // THE CONTROL, so this cannot pass by refusing everything: the heat-11 reel below carries no
    // removed verb and the same validator admits it.
    assert.notEqual(validateRunTape(read(RETIRED)), null, 'the validator refuses every tape, so the refusal above proves nothing');
  } finally {
    await close();
  }
});

test('the retired reel is now refused one step earlier: its declared runStart is not installable', async () => {
  // RE-POINTED 2026-09-18 (F-DRB-11 item 1). This test was "the retired reel reaches wave 20 with
  // its purse and still cannot secure" and it replayed 18,101 steps to read `refusals.playbooks`
  // off the engine. The reel is a heat-11 ride, already retired under ADR-004 on 2026-09-06 for a
  // DIFFERENT cause (the e7-playbook-rows composition change, `b38d60295`, the file header above).
  // A second, later refusal now stands in front of that one, measured here rather than assumed:
  // the tape declares `runStart.research.epochId: "epoch-1-frontier"` while the door reconstructs
  // `epoch-7-signal` for this contract — both on a virgin sim and after installing the tape's own
  // declared meta+research — so `bootDeclaredRun` (`src/replay/AgentTapeReplay.ts:224-237`) cannot install
  // the declared start and the run never begins. ADR-005 amendment clause 6: "retired rows are
  // never repaired". So the honest pin is the refusal and its cause; the wave-20 purse claim stays
  // in this file's header as the history it is, and `rider-parity-retirement.test.mjs` holds the
  // door's own grammar half.
  const tape = read(RETIRED);
  assert.equal(tape.runStart.research.epochId, 'epoch-1-frontier', 'the heat-11 reel declared the E1 epoch pointer');
  const { AgentTapeReplaySession, HeadlessContractSim, validateRunTape, close } = await loadSeam(tape);
  try {
    // Its GRAMMAR is clean — this reel rode before ADR-005's verbs existed on this map, so the
    // refusal below is the runStart's, not the door vocabulary's.
    assert.notEqual(validateRunTape(tape), null);
    assert.throws(() => new AgentTapeReplaySession(tape), /declared runStart is not installable by this door/);
    const virgin = new HeadlessContractSim({ contractId: tape.contract, seed: tape.seed });
    assert.equal(virgin.runStart.research.epochId, 'epoch-7-signal',
      'the door no longer derives the active epoch from the contract; re-read this refusal if so');
  } finally {
    await close();
  }
});
