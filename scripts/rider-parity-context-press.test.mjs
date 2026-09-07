import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * ADR-005 STAGE 3 ITEM 8 — THE RIDER PRESSES THE SAME KEY, AT THE SAME PLACES, FROM ITS OWN BODY.
 *
 * Owner ruling 2026-09-07, verbatim: "no, AI and human users have to have the same options and
 * tools, otherwise it is unfair. fairness is crucial."
 *
 * `Game.confirmAction` reached four world interactions no verb named: the drill yard's stations,
 * the assay office's bench, the E10 Static's kept meanings and the Old Digger's deck. They are
 * `CONTEXT_ACTION` actions now, and the ONLY way they can stay 1:1 is if both callers reach the
 * same method with the same reach. This guard holds them to that, in source, because the rider's
 * press arrives over the lockstep wire and a browser test cannot drive it from a plain boot
 * (`e2e/rider-parity-context-press.spec.ts` carries the human half end to end).
 *
 * SOURCE, NOT PROSE: every pair below is the METHOD CALL, matched with its argument, so a re-point
 * to another body or another consumer reds this file. The manufactured-defect control at the bottom
 * proves it bites rather than merely passing.
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url));
// The manufactured-defect arm below re-runs this file against a DRIFTED copy of Game.ts, so the
// subject is read from the environment when one is handed over. Everything else is the real tree.
const GAME = process.env.GR_CONTEXT_PRESS_GAME ?? path.join(ROOT, 'src/game/Game.ts');
const SIM = path.join(ROOT, 'src/sim/HeadlessContractSim.ts');
const ORDERS = path.join(ROOT, 'src/agent/StandingOrders.ts');
const VIEW = path.join(ROOT, 'src/agent/View.ts');

/** action -> [the call the CONFIRM KEY makes, the call the RIDER makes]. */
const PAIRS = {
  drill: [
    'this.drillYard?.interact(this.actionActor.group.position)',
    'this.drillYard?.interact(actor.group.position)',
  ],
  assay: [
    'this.buildSystem.assayOfficeInRange(this.actionActor.group.position)',
    'this.buildSystem.assayOfficeInRange(actor.group.position)',
  ],
  preserve: [
    'this.e10StaticBoss.tryPreserve(this.actionActor.group.position, this.timeAlive)',
    'this.e10StaticBoss.tryPreserve(actor.group.position, this.timeAlive)',
  ],
  digger: [
    'this.oldDiggerBoss.tryInteract(this.actionActor.group.position, this.timeAlive)',
    'this.oldDiggerBoss.tryInteract(actor.group.position, this.timeAlive)',
  ],
};

test('the four confirm-key interactions are declared in the door grammar', () => {
  const source = readFileSync(ORDERS, 'utf8');
  for (const action of Object.keys(PAIRS)) {
    assert.ok(source.includes(`| { verb: 'CONTEXT_ACTION'; action: '${action}' }`),
      `${action} is not declared in the StandingOrder union`);
    assert.ok(source.includes(`if (value.action === '${action}' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: '${action}' };`),
      `${action} is declared but not validated, so a rider could not submit it`);
  }
});

test('the human key and the rider order call the SAME method, each from its own body', () => {
  const game = readFileSync(GAME, 'utf8');
  for (const [action, [human, rider]] of Object.entries(PAIRS)) {
    assert.ok(game.includes(human), `${action}: the confirm key no longer makes the call this guard pairs (${human})`);
    assert.ok(game.includes(rider), `${action}: the rider no longer makes the same call from its own body (${rider})`);
  }
  // The rider's branch is inside the RIDER's handler, not the key's: assert the ordering rather
  // than trusting two independent `includes`.
  const riderHandler = game.indexOf('private agentRiderFinalVerbs(playerId: string) {');
  const riderHandlerEnd = game.indexOf('private useNamedPlaybookForRider(', riderHandler);
  assert.ok(riderHandler > 0 && riderHandlerEnd > riderHandler, 'the rider verb handler moved');
  const block = game.slice(riderHandler, riderHandlerEnd);
  for (const [action, [, rider]] of Object.entries(PAIRS)) {
    assert.ok(block.includes(rider), `${action}: the rider's call is outside agentRiderFinalVerbs`);
    assert.ok(block.includes(`order.action === '${action}'`), `${action}: the rider handler does not branch on it`);
  }
});

test('GR-SIM composes none of the four and refuses them BY NAME rather than pretending', async () => {
  const sim = readFileSync(SIM, 'utf8');
  for (const action of Object.keys(PAIRS)) {
    assert.ok(sim.includes(`  ${action}: '`), `${action} is missing from CONFIRM_KEY_CONSUMERS, so its refusal cannot name the gap`);
  }
  assert.ok(sim.includes("if (order.action === 'drill' || order.action === 'assay' || order.action === 'preserve' || order.action === 'digger') {"),
    'the headless refusal branch moved');
  // And the engine really composes none of them: no consumer, no field, nothing to bind.
  for (const consumer of ['this.drillYard', 'this.e10StaticBoss', 'this.oldDiggerBoss', 'assayOfficeInRange']) {
    assert.equal(sim.includes(consumer), false,
      `${consumer} is composed in GR-SIM now, so the by-name refusal is a lie and this guard must be re-derived`);
  }
});

test('the menu is published on the view, derived from the consumers rather than re-typed', () => {
  const view = readFileSync(VIEW, 'utf8');
  assert.ok(view.includes('function readContextPress('), 'now.contextPress lost its reader');
  for (const key of ['diagnostics.drillYard', 'diagnostics.e10Static', 'diagnostics.oldDiggerBoss', 'diagnostics.assayBenchInReach']) {
    assert.ok(view.includes(key), `contextPress no longer reads ${key}; a re-typed menu can drift from the world`);
  }
  assert.ok(view.includes('...(contextPress ? { contextPress } : {}),'),
    'contextPress is derived but not published, so a rider still cannot read the menu');
});

test('the guard BITES a rider branch re-pointed at another body (manufactured defect)', { skip: process.env.GR_CONTEXT_PRESS_GAME ? 'running as the manufactured-defect child' : false }, () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'gold-rush-context-press-'));
  try {
    const drifted = path.join(directory, 'Game.ts');
    writeFileSync(drifted, readFileSync(GAME, 'utf8').replace(
      'this.drillYard?.interact(actor.group.position)',
      'this.drillYard?.interact(this.localActor.group.position)',
    ));
    // NODE_TEST_CONTEXT MUST BE STRIPPED (the s1493 lesson, `scripts/skillmd-guard.test.mjs:137`):
    // a child that inherits it reports over IPC to a parent that is not listening and EXITS 0 even
    // though its assertions failed, so the naive control is vacuous inside `test:node-guards` and
    // green by hand. Measured here too: status 0 with it set, status 1 with it unset.
    const env = { ...process.env, GR_CONTEXT_PRESS_GAME: drifted };
    delete env.NODE_TEST_CONTEXT;
    const child = spawnSync(process.execPath, ['--test', fileURLToPath(import.meta.url)], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 240_000,
      killSignal: 'SIGKILL',
      env,
    });
    assert.notEqual(child.status, 0, 'a rider branch reaching from the LOCAL player must red this guard');
    assert.match(`${child.stdout}${child.stderr}`, /drill: the rider no longer makes the same call from its own body/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
