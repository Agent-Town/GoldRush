/**
 * THE REEL BYTE BUDGET GUARD (F-HEAT12-2).
 *
 * `runTapeEnvelopeForContract` prices a reel on three axes. Two of them, ticks and entries, are
 * derived from the contract clock. The third, bytes, used to be derived from the ENTRY count at a
 * flat 160 B, a figure calibrated on the retained Baron proof (140.7 B/entry) whose entries carry
 * one small standing order each. An order-array rider states a whole policy per change-point and
 * measures up to 2,162 B for one entry, so the byte axis bound a POLICY CLASS rather than a size:
 * a reel could sit at 7% of the entry ceiling and still be refused on bytes.
 *
 * WHAT THIS GUARD HOLDS, and why each arm exists:
 *
 *   1. THE ARITHMETIC IS THE ARITHMETIC. maxTicks and maxEntries did not move; maxTapeBytes is
 *      the two-class sum. Pinned by recomputation, not by a copied number.
 *   2. NOTHING THAT FITTED STOPS FITTING. The new budget is >= the old single-class budget for
 *      EVERY contract in the registry. The surcharge is additive by construction and this is the
 *      assertion that keeps it so.
 *   3. THE TWO NAMED FIXTURES ARE ADMITTED. Heat 12's Dome Basin w16 reel and heat 11's Relay
 *      Valley tune-1 reel both pass the county's own `validateTape`.
 *   4. THE MEASUREMENT IS TAKEN ON THE SUBMITTED FORM. Both blockers sized those reels from the
 *      PRETTY-PRINTED file on disk (`gr-sim.mjs` writes `JSON.stringify(tape, null, 2)`), which is
 *      ~2.9x what the door measures, and both concluded a refusal that does not happen. This arm
 *      pins the ratio so the premise cannot silently come back.
 *   5. PADDING IS STILL REFUSED. A reel inside maxTicks and maxEntries but over the byte ceiling
 *      is rejected, so the cure did not open the cap.
 *   6. THE OUTER WALL STILL CONTAINS THE WIDEST REEL. `MAX_JSON_BYTES` is derived from the same
 *      envelope, so the transport cap and the per-contract ceiling cannot drift apart.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DOME_BASIN_W16 = 'artifacts/gauntlet-heat12-20260905/rides/e9-dome-basin.attempt-1/work/tune-3-tape.json';
const RELAY_VALLEY_TUNE1 = 'artifacts/gauntlet-heat11-20260903/rides/e7-relay-valley/opus/work/tune-1.json';
// The budget before F-HEAT12-2: one flat price for every entry, 16 KiB of fixed overhead.
const LEGACY_FIXED_BYTES = 16 * 1024;
const LEGACY_BYTES_PER_ENTRY = 160;

async function withVite(run) {
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    return await run(vite);
  } finally {
    await vite.close();
  }
}

function readTape(relative) {
  const raw = readFileSync(path.join(ROOT, relative), 'utf8');
  return { raw, fileBytes: statSync(path.join(ROOT, relative)).size, tape: JSON.parse(raw) };
}

function compactBytes(value) {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

test('the door envelope prices two classes of entry and its arithmetic is pinned', async () => {
  await withVite(async (vite) => {
    const { runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
    assert.deepEqual(runTapeEnvelopeForContract('e9-dome-basin'), {
      maxTicks: 18_002,
      maxEntries: 3_601,
      // 16,384 + 3,601 * 160 + ceil(18,002 / 30) * (2,400 - 160)
      maxTapeBytes: 16_384 + 3_601 * 160 + 601 * 2_240,
    }, 'Dome Basin: the tick and entry axes are unchanged and the byte axis is the two-class sum');
    assert.equal(runTapeEnvelopeForContract('e9-dome-basin').maxTapeBytes, 1_938_784);
    assert.equal(runTapeEnvelopeForContract('e1-baron').maxTapeBytes, 2_188_544, 'the Baron clock is longer, so its budget is larger');
  });
});

test('no reel that fitted the single-class budget can stop fitting', async () => {
  await withVite(async (vite) => {
    const { CONTRACT_BUNDLES, runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
    const ids = CONTRACT_BUNDLES.flatMap((bundle) => bundle.contracts.map((contract) => contract.id));
    assert.ok(ids.length >= 36, `the registry should carry every contract, saw ${ids.length}`);
    const shrunk = ids.filter((id) => {
      const envelope = runTapeEnvelopeForContract(id);
      return envelope.maxTapeBytes < LEGACY_FIXED_BYTES + envelope.maxEntries * LEGACY_BYTES_PER_ENTRY;
    });
    assert.deepEqual(shrunk, [], 'the order-array surcharge is added to the movement budget, never substituted for it');
  });
});

test('neither blocker fixture was ever refused for its SIZE, and they were always measured on the wrong artifact', async () => {
  // RE-POINTED 2026-09-18 (F-DRB-11 item 1, `tasks/hygiene-battery-lossless-triangles.md`). The
  // title was "both blocker fixtures are admitted", and both were, when this was written. One of
  // the two is not admitted any more: ADR-005 stage 3 (owner 2026-09-07) removed `HOLD` from the
  // door grammar and the Dome Basin reel's plans carry it, so the county door and the strict
  // validator both refuse it — `artifacts/rider-parity-grammar/retirement-ledger.json` carries its
  // row (`e9-dome-basin.attempt-1` / `tune-3-tape.json`, first refusal `orders[18].verb "HOLD" is
  // unknown.`), and ADR-005 amendment clause 6 says retired rows are never repaired.
  //
  // That refusal does not touch what this test is FOR. The two blockers claimed these reels broke
  // the byte ceiling; the measurement below says they never did, on any axis, and still says it.
  // The admission half is therefore split rather than dropped: each reel's door verdict is asserted
  // as the verdict it actually has, WITH the reason, so a silent flip in either direction reds.
  await withVite(async (vite) => {
    const { runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
    const { validateTape } = await vite.ssrLoadModule('/functions/api/standings.ts');
    const { validateRunTape, submittedRunTape } = await vite.ssrLoadModule('/src/game/RunTape.ts');

    for (const [label, relative, entries, doorVerdict] of [
      ['Dome Basin w16 (heat 12)', DOME_BASIN_W16, 265, 'refused-adr005'],
      ['Relay Valley tune-1 (heat 11)', RELAY_VALLEY_TUNE1, 415, 'admitted'],
    ]) {
      const { fileBytes, tape } = readTape(relative);
      const envelope = runTapeEnvelopeForContract(tape.contract);
      const compact = compactBytes(tape);
      assert.equal(tape.inputLog.entries.length, entries, `${label}: the fixture is the reel the blocker measured`);
      assert.ok(compact <= envelope.maxTapeBytes, `${label}: ${compact} B must fit the ${envelope.maxTapeBytes} B ceiling`);
      assert.ok(tape.inputLog.entries.length <= envelope.maxEntries, `${label}: inside the entry axis`);
      assert.ok(tape.inputLog.durationTicks <= envelope.maxTicks, `${label}: inside the tick axis`);

      const verbs = tape.inputLog.entries.flatMap(({ a }) => a.flatMap(({ orders }) => (orders ?? []).map(({ verb }) => verb)));
      if (doorVerdict === 'refused-adr005') {
        assert.ok(verbs.includes('HOLD'), `${label}: the reel that ADR-005 retired is the one carrying HOLD`);
        assert.equal(validateTape(tape, tape.contract, tape.seed, tape.difficulty), null, `${label}: the county door still admits a HOLD-carrying reel`);
        assert.equal(validateRunTape(tape), null, `${label}: the local validator still admits a HOLD-carrying reel`);
      } else {
        assert.ok(!verbs.some((verb) => ['MOVE_TO', 'HOLD', 'FALLBACK_IF'].includes(verb)), `${label}: the control reel carries no retired verb`);
        assert.notEqual(validateTape(tape, tape.contract, tape.seed, tape.difficulty), null, `${label}: the county door admits it`);
        assert.notEqual(validateRunTape(tape), null, `${label}: the local validator admits it`);
      }
      // The submission gate reads the envelope, not the grammar, so it admits BOTH — which is the
      // cleanest statement left of "the size was never the reason".
      assert.notEqual(submittedRunTape(tape), undefined, `${label}: the submission gate admits it`);
      // THE PREMISE THAT WAS NEVER TRUE. Both blockers compared the file on disk against the
      // ceiling; the door re-serialises compactly. Keep the gap visible.
      assert.ok(fileBytes > compact * 2, `${label}: the pretty file on disk is far larger than the submitted form (${fileBytes} vs ${compact})`);
    }
  });
});

test('a reel padded past the byte ceiling is still refused on every axis that should refuse it', async () => {
  await withVite(async (vite) => {
    const { runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
    const { validateTape, MAX_JSON_BYTES } = await vite.ssrLoadModule('/functions/api/standings.ts');
    const { submittedRunTape } = await vite.ssrLoadModule('/src/game/RunTape.ts');
    const { tape } = readTape(DOME_BASIN_W16);
    const envelope = runTapeEnvelopeForContract(tape.contract);

    // Lawful on ticks and entries, gross on bytes: every entry carries the widest standing-order
    // array the grammar permits, on a change-point cadence no rider could think with.
    const order = { verb: 'HARVEST', seam: 'g'.repeat(80) };
    const fat = Array.from({ length: 32 }, () => order);
    const padded = {
      ...tape,
      inputLog: {
        ...tape.inputLog,
        durationTicks: envelope.maxTicks - 1,
        entries: Array.from({ length: envelope.maxEntries }, (_, index) => ({ t: index * 5, mx: 0, my: 0, a: [{ kind: 'agent_orders', orders: fat }] }))
          .filter((entry) => entry.t < envelope.maxTicks - 1),
      },
    };
    assert.ok(padded.inputLog.entries.length <= envelope.maxEntries, 'the padded reel stays inside the entry axis');
    assert.ok(padded.inputLog.durationTicks <= envelope.maxTicks, 'the padded reel stays inside the tick axis');
    assert.ok(compactBytes(padded) > envelope.maxTapeBytes, 'the padded reel is over the byte ceiling, which is the point');
    assert.equal(validateTape(padded, padded.contract, padded.seed, padded.difficulty), null, 'the county door refuses it');
    assert.equal(submittedRunTape(padded), undefined, 'the submission gate refuses it');
    assert.ok(compactBytes(padded) > MAX_JSON_BYTES, 'and it is over the outer wall as well');
  });
});

test('the outer wall stays derived from, and above, the widest per-contract ceiling', async () => {
  await withVite(async (vite) => {
    const { CONTRACT_BUNDLES, runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
    const { MAX_JSON_BYTES } = await vite.ssrLoadModule('/functions/api/standings.ts');
    const widest = Math.max(...CONTRACT_BUNDLES.flatMap((bundle) => bundle.contracts
      .map((contract) => runTapeEnvelopeForContract(contract.id).maxTapeBytes)));
    assert.equal(MAX_JSON_BYTES, widest + 44 * 1024, 'the reader cap is the widest reel plus its request metadata');
    assert.equal(MAX_JSON_BYTES, 2_531_360);
    assert.equal(widest, 2_486_304, 'e2-trestle carries the longest clock in the registry');
  });
});
