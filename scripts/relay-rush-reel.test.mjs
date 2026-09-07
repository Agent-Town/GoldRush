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
// This guard pins BOTH halves as fixtures, because either one moving alone would be a lie:
//   - the retired reel still fails, and still for THAT reason (wave 20 reached, 200 gold banked,
//     `refusals.playbooks` still 0, run still alive at the end of its own tape);
//   - heat 12's reel — recorded AFTER the merge, with one `PLAYBOOK_USE` in it — still replays to
//     its declared score and its declared event-log hash, so the map is still winnable and the
//     county still has a Relay Rush reel that verifies.
// A change that breaks the second, or that quietly makes the first pass again, has moved this
// map's composition and owes the board a re-assay either way.
//
// 💰 COST, RE-MEASURED 2026-09-07 AND DELIBERATELY KEPT (`spec-hygiene-batch` scope 6, which asked
// whether the retired-reel replay could be trimmed as derivable from the other tests; it CANNOT).
// One `node --test` on this Mac, whole file 72.1 s:
//     the E7 latch                                    0.38 s
//     the two reels differ by exactly the verb        0.004 s   (static read of both tapes)
//     the reel envelope admits the retired tape        0.16 s   (static length check)
//     heat 12 still replays to its declared score     40.4 s
//     the retired reel reaches wave 20 …              31.0 s
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

/** One vite server for the whole file: the two replays below cost ~20 s each, the boot ~10 s. */
async function loadSeam(tape) {
  const location = new URL(`http://relay-rush-reel.test/?debug&contract=${tape.contract}&seed=${tape.seed}`);
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  const { AgentTapeReplaySession } = await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
  return { AgentTapeReplaySession, close: () => vite.close() };
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

test('heat 12 still replays to its declared score through the assayer own seam', async () => {
  const tape = read(CURRENT).tape;
  const { AgentTapeReplaySession, close } = await loadSeam(tape);
  try {
    const session = new AgentTapeReplaySession(tape);
    const ceiling = session.durationTicks + 18_000;
    let steps = 0;
    while (!session.complete && steps < ceiling) { session.advanceOneTick(); steps += 1; }
    const result = session.result();
    assert.equal(result.eventLogHash, tape.eventLogHash);
    assert.equal(result.eventLogHash, 'fnv1a32:d381ebe2');
    assert.deepEqual(result.outcome, { secured: true, waves: 20, gold: 200, timeAlive: 600 });
    // The county compares the reel's DECLARED score against this snapshot; on a run that banks at
    // the secure tick they are the same object (`HeadlessContractSim.ts:2205-2213`).
    assert.deepEqual(result.securedSnapshot, { waves: 20, gold: 200, timeAlive: 600 });
    assert.equal(steps, 18_600);
  } finally {
    await close();
  }
});

test('the retired reel reaches wave 20 with its purse and still cannot secure', async () => {
  const tape = read(RETIRED);
  const { AgentTapeReplaySession, close } = await loadSeam(tape);
  try {
    const session = new AgentTapeReplaySession(tape);
    // Stepped to just past the end of its OWN tape rather than to the seam's 36001-step ceiling:
    // the fact under test is that the run is alive when its declared duration runs out, and paying
    // for another 18,000 dead steps would only restate it at three times the cost.
    let steps = 0;
    while (!session.complete && steps < tape.inputLog.durationTicks + 100) { session.advanceOneTick(); steps += 1; }
    assert.equal(session.complete, false, 'the run is still alive when its own tape runs out');
    const snapshot = session.snapshot();
    assert.equal(snapshot.wave, 20, 'it did reach the secure wave');
    assert.equal(Math.round(snapshot.gold), 200, 'with the purse its row declared');
    assert.ok(snapshot.hero.alive, 'and the rider never lost the hero');
    // THE NAMED CAUSE, read off the engine rather than asserted: no playbook was ever muted, so the
    // era's errand is undischarged and `autoSecureWaveForRun` refuses the secure at every wave.
    const front = session.sim.interferenceFront.diagnostics;
    assert.equal(front.refusals.playbooks, 0);
    assert.equal(front.objectiveMet, true, 'the RELAY deadline it was riding for was met (3 of 4 lit)');
    assert.equal(session.sim.currentTurn().view.now.playbookUse.objectiveMet, false);
    assert.throws(() => session.result(), /still alive/);
  } finally {
    await close();
  }
});
