import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

// E7 PLAYBOOK ROWS — the both-engine proof and the human-parity pin.
//
// "Both engines" is the county's own definition for agent reels (`e2e/e4-roads-and-convoys.spec.ts`,
// `scripts/assay-replay.mjs:29-34`): the same `HeadlessContractSim` ridden in Node and in the
// browser runtime, one seed, one order stream, one event-log hash. The `Game.ts` world has never
// been in hash agreement with the headless door (the tick-0 seam census differs), so that is not
// claimed here either.
//
// Three proofs:
//   1. each of the four Signal maps, ridden in the BROWSER runtime with the same scripted order
//      stream the Node guard uses, reaches the same playbook digest and the same event-log hash
//      the Node ride reaches (the table is written to artifacts/);
//   2. every one of the four boots plain, with zero console/page errors, on desktop and 390px;
//   3. HUMAN PARITY, measured rather than assumed: a plain browser boot of each Signal map gives a
//      PLAYER the E7 playbook loop (record -> name -> replay, through the same two refusals and the
//      same mirror) but gives a RIDER no `PLAYBOOK_USE` and no playbook secure latch, because
//      binding either is a `Game.ts` change this slice's firewall forbids. F-E7PB-1.
const ARTIFACTS = 'artifacts/e7-playbook-rows';
// The harness page boots a module context the browser can `import()` the sim from; passed as a
// value so tsc does not try to resolve it relative to this file.
const MODULES = { sim: '/src/sim/HeadlessContractSim.ts' };
const HARNESS = (contract: string, seed: string) => `/src/replay/harness.html?debug&contract=${contract}&seed=${seed}`;

const RELAY_R1_PAD = { x: -45, z: 40 };
const harvest = (seam: string, count: number) => Array.from({ length: count }, () => ({ verb: 'HARVEST', seam }));

type Turn = { atTick: number; orders: Array<Record<string, unknown>> };

/**
 * One tick under the first 30s wave boundary (`Balance.waves.waveInterval`). THE BROWSER ARM IS
 * BOUNDED, AND THE BOUND IS MEASURED, NOT PREFERRED. `RunManager.install` builds a
 * `RunSuspendController` whenever `typeof document !== 'undefined'` (`src/game/RunManager.ts:93`)
 * and that controller snapshots a `Game` (`game.actors[0]`, `game.buildSystem`, ...) through
 * `JSON.parse(JSON.stringify(...))`. A `HeadlessContractSim` carries none of those fields, so the
 * clone throws `"undefined" is not valid JSON` at the first wave boundary past its `wave <= 0`
 * guard. In Node `document` is undefined, the controller is never installed, and the identical
 * ride runs to its terminal. Pre-existing, E7-independent, and the same wall
 * `e2e/e4-roads-and-convoys.spec.ts` bounded its own browser arm against. F-E7PB-2.
 */
const SUBWAVE_TICKS = 890;

const MAPS: ReadonlyArray<{ id: string; objective: string; script: Turn[] }> = [
  {
    id: 'e7-relay-valley',
    objective: 'relay',
    script: [{
      atTick: 0,
      orders: [
        { verb: 'PLAYBOOK_USE', name: 'light-the-relay' },
        ...harvest('gold-seam-1', 10),
        { verb: 'BUILD', what: 'sentry_beacon', where: RELAY_R1_PAD, when: { goldGte: 25 } },
      ],
    }],
  },
  {
    id: 'e7-echo-canyon',
    objective: 'mirror',
    script: [
      { atTick: 0, orders: [{ verb: 'PLAYBOOK_USE', name: 'canyon-patrol' }, ...harvest('gold-seam-1', 6), { verb: 'HOLD', pos: { x: 0, z: 10 } }] },
      { atTick: 300, orders: [{ verb: 'PLAYBOOK_USE', name: 'canyon-patrol' }, { verb: 'HOLD', pos: { x: 0, z: 10 } }] },
    ],
  },
  { id: 'e7-dead-band', objective: 'refusal', script: [{ atTick: 0, orders: [{ verb: 'PLAYBOOK_USE', name: 'old-tools' }] }] },
  {
    id: 'e7-relay-rush',
    objective: 'suspended',
    script: [{
      atTick: 0,
      orders: [
        { verb: 'PLAYBOOK_USE', name: 'relay-program' },
        ...harvest('gold-seam-1', 10),
        { verb: 'BUILD', what: 'sentry_beacon', where: RELAY_R1_PAD, when: { goldGte: 25 } },
        { verb: 'HOLD', pos: { x: -25, z: 41 } },
      ],
    }],
  },
];

type RideResult = {
  objective: string;
  objectiveMet: boolean;
  uses: number;
  repeats: number;
  programRuns: number;
  programSuspensions: number;
  relaysLitByProgram: readonly string[];
  refusals: Record<string, number>;
  shelfHashes: readonly string[];
  recordedUses: number | null;
  pendingMirrors: number | null;
  tickHash: string;
};

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

/**
 * The one ride body, shipped into the page as a closure argument. It is a transcription of
 * `playbookSubWaveDigest` in `scripts/e7-playbook-digest.mjs`, which is what the Node arm runs;
 * the two are compared field for field below, so a drift between them fails rather than hides.
 */
async function rideInBrowser(page: Page, contract: string, script: Turn[], ticks: number): Promise<RideResult> {
  return page.evaluate(async ({ contract: id, script: turns, modules, ticks: budget }) => {
    const { HeadlessContractSim } = await import(/* @vite-ignore */ modules.sim);
    const sim = new HeadlessContractSim({ contractId: id, seed: `${id}-01` });
    const pending = [...turns];
    for (let tick = 0; tick <= budget; tick += 1) {
      while (pending.length > 0 && pending[0].atTick === tick) sim.submitOrders(pending.shift()!.orders);
      if (tick < budget) sim.advanceOneTick();
    }
    const row = sim.currentTurn().view.now.playbookUse;
    const mirror = sim.currentTurn().view.now.broadcastMirror ?? null;
    return {
      objective: row.objective,
      objectiveMet: row.objectiveMet,
      uses: row.uses,
      repeats: row.repeats,
      programRuns: row.programRuns,
      programSuspensions: row.programSuspensions,
      relaysLitByProgram: row.relaysLitByProgram,
      refusals: row.refusals,
      shelfHashes: row.shelf.map((tape: { name: string; hash: string; uses: number }) => `${tape.name}:${tape.hash}:${tape.uses}`),
      recordedUses: mirror ? mirror.recordedUses : null,
      pendingMirrors: mirror ? mirror.pending.length : null,
      tickHash: sim.tickHash(budget),
    } as RideResult;
  }, { contract, script, modules: MODULES, ticks });
}

test('the four Signal maps run the playbook verb identically in the browser runtime and in Node', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const errors = collectErrors(page);
  const table: Array<Record<string, unknown>> = [];
  // The Node side, in its own process and its own module graph, from the SAME script table the
  // browser rides below (`scripts/e7-playbook-digest.mjs` exports both).
  const node = JSON.parse(execFileSync(process.execPath, ['scripts/e7-playbook-digest.mjs', '--all', '--sub-wave'],
    { encoding: 'utf8', timeout: 280_000 }).trim().split('\n').at(-1)!);
  for (const map of MAPS) {
    // Settle on a blank page first: the harness boots its own navigation from `?contract=`, and
    // under parallel workers that pending navigation interrupts the NEXT map's goto.
    await page.goto('about:blank');
    await page.goto(HARNESS(map.id, `${map.id}-01`));
    await page.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
    const browser = await rideInBrowser(page, map.id, map.script, SUBWAVE_TICKS);
    expect(browser.objective).toBe(map.objective);
    // THE BOTH-ENGINES CLAIM: same sim, same seed, same order stream, two runtimes, one answer,
    // down to the sim's own per-tick determinism fingerprint at the bound.
    expect(browser).toEqual(node[map.id]);
    table.push({ contract: map.id, seed: `${map.id}-01`, ticks: SUBWAVE_TICKS, node: node[map.id], browser });
    console.log(`[e7-both-engines] ${map.id} tickHash node=${node[map.id].tickHash} browser=${browser.tickHash} `
      + `met=${browser.objectiveMet} uses=${browser.uses} runs=${browser.programRuns} `
      + `relays=${JSON.stringify(browser.relaysLitByProgram)} refusals=${JSON.stringify(browser.refusals)}`);
  }
  // The two maps whose proof lands inside the bound are asserted here as well as in the Node
  // guard, so the browser arm is not merely "agrees" but "agrees about the mechanic firing".
  expect(node['e7-relay-valley'].relaysLitByProgram).toEqual(['relay-site-r1']);
  expect(node['e7-relay-valley'].objectiveMet).toBe(true);
  expect(node['e7-dead-band'].refusals.suppressed).toBe(1);
  expect(node['e7-dead-band'].objectiveMet).toBe(true);
  await mkdir(ARTIFACTS, { recursive: true });
  await writeFile(path.join(ARTIFACTS, `both-engines-${testInfo.project.name}.json`), `${JSON.stringify(table, null, 2)}\n`);
  expect(errors).toEqual([]);
});

test('every Signal map still boots clean for a player, and the E7 board is where the player sees it', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  for (const map of MAPS) {
    // `&epoch=epoch-7-signal` is what RESOLVES these contracts: three of the four board rows are
    // locked behind an earlier secure, so a bare `?contract=` falls back to The Claim
    // (`e2e/er01-e7-census.spec.ts` asserts exactly that).
    await page.goto(`/?debug&epoch=epoch-7-signal&contract=${map.id}&seed=${map.id}-01`);
    await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId !== undefined);
    const briefing = page.getByTestId('contract-briefing');
    if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
    // Mistake #10: where does the PLAYER see this? The Exchange rescue board, which
    // `E7SignalSystem.render` unhides exactly when the ACTIVE EPOCH is the Signal Era.
    await expect(page.getByTestId('e7-jack-board')).toBeVisible();
    expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe(map.id);
    expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal.enabled)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('HUMAN PARITY, measured: the plain browser gives the PLAYER the loop and the RIDER no verb (F-E7PB-1)', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  await page.goto('/?epoch=epoch-7-signal&contract=e7-relay-valley&seed=e7-parity-plain');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId !== undefined);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();

  const plain = await page.evaluate(() => ({
    // The PLAYER's half of the loop is present in a plain boot: the shelf-and-replay surface the
    // Exchange publishes, and the jack-board the era's milestones light.
    board: Boolean(document.querySelector('[data-testid="e7-jack-board"]')),
    // The RIDER's half is not: no headless playbook row reaches this engine's diagnostics, because
    // `Game.ts` composes no `playbookUse` handler and no playbook secure latch.
    playbookUseDiagnostics: (window.__THREE_GAME_DIAGNOSTICS__ as unknown as Record<string, unknown>).playbookUse ?? null,
    testSeam: typeof window.__GR_TEST__,
  }));
  expect(plain.board).toBe(true);
  // THE GAP, stated as a measurement. A browser PLAYER can already record, name and replay a
  // playbook by hand, and that path runs the same two refusals and the same `BroadcastMirror`.
  // What the browser has NOT got is the rider verb and the four secure latches, which live in
  // `HeadlessContractSim` only. So the four Signal maps decide their secure differently in the two
  // engines today. Closing it is a `Game.ts` change this slice's firewall forbids; the corrective
  // is on the desk in BACKLOG. This assertion is the change detector: the day the browser composes
  // the row it goes red, and it SHOULD, because that is the day this row can say "parity".
  expect(plain.playbookUseDiagnostics).toBeNull();
  expect(plain.testSeam).toBe('undefined');
  console.log(`[e7-parity] plain boot board=${plain.board} riderPlaybookRow=${JSON.stringify(plain.playbookUseDiagnostics)}`);
  expect(errors).toEqual([]);
});
