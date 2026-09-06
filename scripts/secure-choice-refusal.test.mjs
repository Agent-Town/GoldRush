// F-MCAP-1 (`reviews/mare-claim-air-prevalent.md:34`), owner ruling 2026-09-06, verbatim: "(5) both".
//
// THE LOOP THIS GUARD EXISTS FOR. The secure window accepts exactly one `SECURE_CHOICE` and
// nothing else. The adjacent `PICK_UPGRADE` rule pulls the other way: order arrays REPLACE, so a
// rider that picks an upgrade must re-send its whole plan behind the pick. A rider that carried
// that habit into the secure window submitted `[SECURE_CHOICE, ...plan]` and got NO answer at all.
// The refusal reached stderr and nothing else, and `gr-sim.readOrders` reads stdin again WITHOUT
// advancing the sim until a submission is accepted, so the pending clock never moved either.
// Re-measured on the tree before the cure (`artifacts/secure-choice-refusal/before-until-end.json`):
// 8,783 identical turns in 35 s, `expiresInMs` pinned at 20,000, no termination. The air-wall
// prover burned 14,467 of them, and a second draft burned 18 minutes at 110 % CPU (F-MCAP-2).
//
// BOTH CURES, ONE GUARD:
//   A  the refusal is VISIBLE — `now.orders[]` carries a `failed` record whose reason begins with
//      the word, so a rider that reads only THE VIEW is told; the transport prints the same words
//      on its own diagnostic line, so a log reader is told too.
//   B  the CLOCK RUNS — each refused submission spends one fixed step of the window, so
//      `expiresInMs` reaches zero and the choice defaults through the existing expiry path.
//
// The cases below are the master's: (a) refused with the word and BOUNDED, defaulted; (b) a lone
// choice still secures; (c) no refusal ever reaches the tape; (d) the line is there and parseable.

import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// The word is READ from the door rather than copied beside it: a guard that carries its own copy
// of the vocabulary passes the day someone renames the refusal (Mistake #4, verify-don't-inherit).
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let SECURE_WINDOW_REFUSAL;
let SECURE_WINDOW_REFUSAL_ID;
let SECURE_WINDOW_REFUSAL_MESSAGE;
try {
  ({ SECURE_WINDOW_REFUSAL, SECURE_WINDOW_REFUSAL_ID, SECURE_WINDOW_REFUSAL_MESSAGE } =
    await vite.ssrLoadModule('/src/agent/StandingOrders.ts'));
} finally {
  await vite.close();
}

const CONTRACT = 'the-claim';
const SEED = 'e1-the-claim-01';
// An absolute anti-hang ceiling, far above the arithmetic bound the ride itself proves
// (`window ms / 1000 * 30 + 1`, = 601 at the trail preset's 20 s). A red here is a HANG.
const NEVER_MORE_THAN = 2_000;

// The proven Claim policy (`scripts/gr-sim.test.mjs:590-611`): builds, pans, holds, secures.
const POSITIONS = {
  sentry_beacon: [{ x: 0, z: 13 }, { x: 0, z: 11 }, { x: 3, z: 12 }, { x: -3, z: 12 }, { x: 0, z: 15 }, { x: 0, z: 9 }],
  turret: [{ x: 4, z: 14 }, { x: -4, z: 14 }, { x: 4, z: 10 }, { x: -4, z: 10 }],
};
const COSTS = { sentry_beacon: [25, 35, 45, 55, 75, 95], turret: [50, 70, 95, 125] };

function plan(view) {
  const orders = [];
  for (const kind of ['sentry_beacon', 'turret']) {
    const built = view.now.works.byKind[kind] ?? 0;
    for (let index = built; index < POSITIONS[kind].length; index += 1) {
      orders.push({ verb: 'BUILD', what: kind, where: POSITIONS[kind][index], when: { goldGte: COSTS[kind][index] } });
    }
  }
  for (const seam of view.now.seams.filter(({ active, remaining }) => active && remaining > 0)) {
    for (let count = 0; count < 4; count += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  }
  orders.push({ verb: 'HOLD', pos: { x: 0, z: 12 } });
  return orders.slice(0, 32);
}

/** The submission F-MCAP-1 measured: the choice with the rider's whole plan concatenated behind it. */
function concatenated(view) {
  return [{ verb: 'SECURE_CHOICE', choice: 'bank' }, ...plan(view)].slice(0, 32);
}

/**
 * Rides `gr-sim` over stdin exactly as a rider does, answering with `answer(view, secureTurn)`
 * once the secure window is up. Returns every secure-window view, what was submitted against each
 * of them, the diagnostics the transport printed, and whether stdout stayed strict NDJSON.
 */
function ride({ answer, tapePath = null, capMs = 180_000 }) {
  return new Promise((resolvePromise, reject) => {
    const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--policy=stdin'];
    if (tapePath) args.push('--tape', tapePath);
    const child = spawn(process.execPath, args, { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
    let buffer = '';
    let stderr = '';
    let outcome = null;
    let stdoutLines = 0;
    let unparseable = 0;
    let submissionsSent = 0;
    // Both rides here end on `bank`, which is terminal, so the window closing IS the end of the
    // ride: gr-sim prints one last view and breaks without reading stdin again. Answering it would
    // count a submission the transport never consumed and make the tape arithmetic below lie.
    let windowClosed = false;
    const secureViews = [];
    const sentInWindow = [];
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`gr-sim did not terminate within ${capMs} ms after ${secureViews.length} secure-window turns.`));
    }, capMs);
    const send = (orders) => {
      submissionsSent += 1;
      child.stdin.write(`${JSON.stringify(orders)}\n`);
    };

    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        stdoutLines += 1;
        let message;
        try {
          message = JSON.parse(line);
        } catch {
          unparseable += 1;
          continue;
        }
        if (message.schema !== 'goldrush.view.v1') { outcome = message; continue; }
        if (!message.now.pendingSecure) {
          if (secureViews.length > 0) { windowClosed = true; continue; }
          send(plan(message));
          continue;
        }
        secureViews.push(message);
        if (secureViews.length > NEVER_MORE_THAN) {
          clearTimeout(timer);
          child.kill('SIGKILL');
          reject(new Error(`the secure window did not close within ${NEVER_MORE_THAN} turns.`));
          return;
        }
        const orders = answer(message, secureViews.length);
        sentInWindow.push(orders);
        send(orders);
      }
    });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.on('close', (status) => {
      clearTimeout(timer);
      const refusalLines = stderr.split('\n').filter((line) => line.startsWith('gr-sim rejected orders:'));
      resolvePromise({ status, stderr, outcome, secureViews, sentInWindow, refusalLines, stdoutLines, unparseable, submissionsSent, windowClosed });
    });
  });
}

const refusalRecord = (view) => view.now.orders.find((record) => record.id === SECURE_WINDOW_REFUSAL_ID) ?? null;
const firstNonChoice = (orders) => orders.find((order) => order.verb !== 'SECURE_CHOICE') ?? orders[0];

test('a concatenated plan is refused with the word, told on both wires, and the clock runs it out',
  { timeout: 240_000 }, async () => {
    // The broken policy, run to its end: it NEVER learns, and re-submits the same concatenation
    // every turn. Before the cure this did not terminate at all.
    const result = await ride({ answer: (view) => concatenated(view) });

    assert.equal(result.status, 0, result.stderr);

    // (a) BOUNDED, and bounded by the WINDOW rather than by a number this guard invented: one
    // fixed step (1/30 s) is spent per refusal, so the ride is over once the window's own
    // milliseconds are gone, plus the one submission that is finally accepted.
    const windowMs = result.secureViews[0].now.pendingSecure.expiresInMs;
    assert.ok(windowMs > 0, 'the first secure-window turn must advertise a window');
    assert.equal(result.secureViews.length, Math.round((windowMs / 1000) * 30) + 1);
    assert.ok(result.secureViews.length <= NEVER_MORE_THAN);

    // (a) the clock RUNS: strictly down, one fixed step at a time, to zero.
    const expiries = result.secureViews.map((view) => view.now.pendingSecure.expiresInMs);
    assert.equal(expiries[0], windowMs);
    assert.equal(expiries.at(-1), 0);
    for (let index = 1; index < expiries.length; index += 1) {
      assert.ok(expiries[index] < expiries[index - 1],
        `the pending clock stalled at turn ${index}: ${expiries[index - 1]} -> ${expiries[index]}`);
    }

    // (a) DEFAULTED, through the existing expiry path, and the run ENDED.
    assert.equal(result.outcome.defaultedSecure, 1);
    assert.equal(typeof result.outcome.secured, 'boolean');

    // (A) the refusal is visible to a rider that reads nothing but THE VIEW, in the same
    // `{ status, reason }` shape every other refusal uses, and it names the order that caused it.
    assert.equal(refusalRecord(result.secureViews[0]), null, 'nothing is refused before the first submission');
    for (let index = 1; index < result.secureViews.length; index += 1) {
      const record = refusalRecord(result.secureViews[index]);
      assert.ok(record, `turn ${index} published no refusal`);
      assert.equal(record.status, 'failed');
      assert.equal(record.reason, SECURE_WINDOW_REFUSAL_MESSAGE);
      assert.ok(record.reason.startsWith(`${SECURE_WINDOW_REFUSAL}: `), record.reason);
      assert.equal(record.order.verb, firstNonChoice(result.sentInWindow[index - 1]).verb,
        'the receipt names the first order that is not the choice');
    }
    // It is a RECEIPT, not an order: it never joins, replaces or deletes the plan the rider
    // already had standing (the loop's own views showed submission 36 still there).
    assert.ok(result.secureViews.at(-1).now.orders.some((record) => record.id.startsWith('orders-')),
      'the plan the rider already had accepted survives the refusal');

    // (d) the transport's own line: one per refusal, in its `gr-sim <what happened>` shape,
    // carrying the same word, and every stdout line still parses as the NDJSON it claims to be.
    assert.equal(result.refusalLines.length, result.secureViews.length - 1);
    for (const line of result.refusalLines) {
      assert.equal(line, `gr-sim rejected orders: ${SECURE_WINDOW_REFUSAL_MESSAGE}`);
      // Parseable: the word is the first colon-delimited field of the reason it carries.
      const [word] = line.slice('gr-sim rejected orders: '.length).split(':');
      assert.equal(word, SECURE_WINDOW_REFUSAL);
    }
    assert.equal(result.unparseable, 0, 'stdout stayed strict NDJSON');
    assert.ok(result.stdoutLines > result.secureViews.length);
  });

test('a lone SECURE_CHOICE still secures, and no refusal reaches the tape', { timeout: 240_000 }, async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'secure-choice-refusal-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const tapePath = join(directory, 'refused-then-answered.json');

  // Three refusals, then the lawful answer. The refusals must leave no trace on the reel.
  const REFUSALS = 3;
  const result = await ride({
    answer: (view, secureTurn) => (secureTurn <= REFUSALS ? concatenated(view) : [{ verb: 'SECURE_CHOICE', choice: 'bank' }]),
    tapePath,
  });

  // (b) the lone choice is still the accepted submission, and it still banks the claim.
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.secureViews.length, REFUSALS + 1);
  assert.equal(result.outcome.secured, true);
  assert.equal(result.outcome.defaultedSecure, 0);
  assert.equal(result.refusalLines.length, REFUSALS);
  assert.notEqual(refusalRecord(result.secureViews[REFUSALS]), null, 'the last refusal was published');

  // (c) THE TAPE. Its input log carries only submissions the door TOOK, its event-log hash is
  // folded from `orders_replaced` events alone, and the refusal appears nowhere in it.
  const tapeText = readFileSync(tapePath, 'utf8');
  assert.equal(tapeText.includes(SECURE_WINDOW_REFUSAL), false, 'the refusal word reached the tape');
  assert.equal(tapeText.includes(SECURE_WINDOW_REFUSAL_ID), false, 'the refusal receipt reached the tape');
  const tape = JSON.parse(tapeText);
  const submissions = tape.inputLog.entries.flatMap((entry) => entry.a.filter((action) => action.kind === 'agent_orders'));
  assert.equal(submissions.length, result.submissionsSent - REFUSALS, 'the tape holds exactly the accepted submissions');
  assert.equal(
    submissions.filter((action) => action.orders.length > 1 && action.orders.some((order) => order.verb === 'SECURE_CHOICE')).length,
    0,
    'no concatenated submission reached the tape',
  );

  // And the reel still replays: a refused submission changed nothing the assay office reads.
  const replay = spawnSync(process.execPath, ['scripts/assay-replay.mjs', tapePath], {
    cwd: ROOT, encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL',
  });
  assert.equal(replay.status, 0, replay.stderr);
  assert.equal(JSON.parse(replay.stdout).eventLogHash, tape.eventLogHash);
});
