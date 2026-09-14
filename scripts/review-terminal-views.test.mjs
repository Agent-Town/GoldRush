import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = ts.createSourceFile('Game.ts', readFileSync(`${root}src/game/Game.ts`, 'utf8'), ts.ScriptTarget.Latest, true);
const gameClass = source.statements.find((node) => ts.isClassDeclaration(node) && node.name?.text === 'Game');
const member = (name) => gameClass.members.find((node) => node.name?.getText(source) === name);
const terminalListener = gameClass.members.find(ts.isConstructorDeclaration).body.statements.find((node) =>
  ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)
  && node.expression.expression.getText(source) === 'this.events.on'
  && node.expression.arguments[0]?.text === 'run_ended'
  && node.getText(source).includes('this.agentRiderTerminal ='));
assert.ok(terminalListener, 'run-ended receipt listener exists');
// Execute the actual view-state reset statements; unrelated renderer/world resets need no fixture.
const resetViewState = member('resetRun').body.statements.filter((node) => node.getText(source).includes('this.agentRiderViewState'));
const compile = (body) => ts.transpileModule(body, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const ProbeGame = new Function('buildView', `${compile(`class ProbeGame {
  ${member('serveAgentRiderViews').getText(source)}
  installTerminalListener() { ${terminalListener.getText(source)} }
  resetViewState() { ${resetViewState.map((node) => node.getText(source)).join('\n')} }
}`)}; return ProbeGame;`)((viewSource) => ({ appendLog: [], now: { wave: viewSource.wave } }));

class Socket {
  listeners = new Map();
  sent = [];
  closed = null;
  accept() {}
  addEventListener(name, callback) { this.listeners.set(name, [...(this.listeners.get(name) ?? []), callback]); }
  send(message) { this.sent.push(JSON.parse(message)); }
  close(code, reason) { this.closed = { code, reason }; this.emit('close', {}); }
  emit(name, event) { for (const callback of this.listeners.get(name) ?? []) callback(event); }
}

test('terminal views wait for every seat relay deadline and survive the secured reset', async () => {
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, hmr: false } });
  const originals = { Response, WebSocketPair: globalThis.WebSocketPair, setTimeout, dateNow: Date.now, performanceNow: performance.now };
  let clock = 10_000;
  let server;
  try {
    Date.now = () => clock;
    performance.now = () => clock;
    globalThis.setTimeout = (callback, ms) => originals.setTimeout(callback, ms).unref();
    globalThis.WebSocketPair = class { constructor() { this[0] = new Socket(); this[1] = server = new Socket(); } };
    globalThis.Response = class extends originals.Response {
      constructor(body, init) { super(body, init?.status === 101 ? { status: 200 } : init); }
    };
    const { MultiplayerRoom } = await vite.ssrLoadModule('/functions/api/_multiplayer.ts');
    const runSource = ts.createSourceFile('RunManager.ts', readFileSync(`${root}src/game/RunManager.ts`, 'utf8'), ts.ScriptTarget.Latest, true);
    const runClass = runSource.statements.find((node) => ts.isClassDeclaration(node) && node.name?.text === 'RunManager');
    const securedMethod = runClass.members.find((node) => node.name?.getText(runSource) === 'endSecuredRun');
    const ProbeManager = new Function(`${compile(`class ProbeManager { ${securedMethod.getText(runSource)} }`)}; return ProbeManager;`)();

    for (const reason of ['death', 'secured']) {
      clock += 10_000;
      const start = clock;
      const room = new MultiplayerRoom();
      const code = 'A'.repeat(24);
      const setup = { contractId: 'the-claim', seed: 'seed', difficultyPreset: 'trail', meta: {}, research: {} };
      room.code = code;
      room.connect(new Request(`http://test/api/multiplayer/connect?code=${code}`, { headers: { Upgrade: 'websocket' } }));
      const hostSocket = server;
      const sendHost = (message) => hostSocket.emit('message', { data: JSON.stringify({ v: 3, ...message }) });
      sendHost({ type: 'join', code, setup, client: 'browser', player: { name: 'Host', town: 'Home' } });
      const host = hostSocket.sent.find((message) => message.type === 'joined').playerId;
      const bodies = new Map();
      let onEnded;
      let pendingSecure = false;
      const game = Object.assign(Object.create(ProbeGame.prototype), {
        mpClient: {
          state: () => ({ connected: true, playerId: host, roster: room.roster() }),
          sendView: (to, seq, body) => sendHost({ type: 'view', to, seq, body }),
        },
        events: { on: (_name, callback) => { onEnded = callback; } },
        tileStateStore: { commitAtRunEnd() {} },
        secureClaimChoicePending: () => pendingSecure,
        state: { current: 'playing', isPaused: false },
        agentRiderTerminal: null,
        agentRiderBodies: bodies,
        agentRiderViewState: new Map(),
        waveSystem: { diagnostics: { wave: 1 } },
        agentRiderViewSequence: 0,
        agentRiderViewSource: () => ({ wave: game.waveSystem.diagnostics.wave }),
      });
      game.installTerminalListener();
      const joinSeat = () => {
        const socket = new Socket();
        const id = room.join(socket, { code, setup, client: 'headless', player: { name: 'Rig', town: 'Home' } });
        bodies.set(id, { snapshot: () => ({ orders: [], needsRider: false }) });
        return { id, socket, views: () => socket.sent.filter((message) => message.type === 'view') };
      };
      const first = joinSeat();
      game.serveAgentRiderViews();
      assert.equal(first.views().length, 1);
      clock = start + 500;
      const second = joinSeat();
      game.serveAgentRiderViews();
      assert.equal(second.views().length, 1);
      clock = start + 1_000;
      pendingSecure = true;
      game.serveAgentRiderViews();
      assert.equal(first.views().length, 1, 'ordinary escalation is also throttled');
      assert.equal(second.views().length, 1);

      const endRun = () => { pendingSecure = false; onEnded({ reason, summary: { deepestWave: 9, wavesSurvived: 8 } }); };
      if (reason === 'secured') {
        const manager = Object.assign(Object.create(ProbeManager.prototype), {
          securedRunId: 1, runId: 1, awardSecuredClaim() {}, hideSecureOverlay() {}, endRun,
          host: {
            at: () => 10, secureWave: () => 9,
            setPaused: (paused) => { game.state.isPaused = paused; },
            resetRun: () => { game.resetViewState(); game.waveSystem.diagnostics.wave = 0; },
          },
        });
        assert.equal(manager.endSecuredRun(), true);
        assert.equal(game.state.isPaused, true);
      } else {
        endRun();
        game.state.current = 'dead';
      }
      const receipt = game.agentRiderTerminal;
      for (clock of [start + 1_000, start + 1_999]) {
        game.serveAgentRiderViews();
        assert.equal(hostSocket.closed, null, `${reason}: host stays connected before the deadline`);
        assert.equal(first.views().length, 1, `${reason}: no early terminal`);
        assert.equal(second.views().length, 1);
        assert.equal(game.agentRiderTerminal, receipt, 'receipt stays pending');
        assert.equal(game.agentRiderViewState.get(first.id).terminal, false);
      }
      clock = start + 2_000;
      game.serveAgentRiderViews();
      assert.equal(first.views().length, 2, 'first seat receives its terminal at the deadline');
      assert.equal(second.views().length, 1, 'second seat retains its own deadline');
      assert.equal(game.agentRiderTerminal, receipt, 'one delivered seat cannot consume another seat receipt');
      clock = start + 2_499;
      game.serveAgentRiderViews();
      assert.equal(first.views().length, 2, 'waiting for another seat does not repeat the terminal');
      assert.equal(second.views().length, 1);
      clock = start + 2_500;
      game.serveAgentRiderViews();
      assert.equal(second.views().length, 2);
      assert.equal(game.agentRiderTerminal, null);
      for (const seat of [first, second]) {
        assert.deepEqual(seat.views().at(-1).body.appendLog, [{
          wave: 9, outcome: reason === 'secured' ? 'secured' : 'rider-down',
          goldDelta: null, worksHp: null, kills: null, surprises: [],
        }], 'terminal retains the ended run outcome and deepest wave after reset');
      }
      clock += 3_000;
      game.serveAgentRiderViews();
      assert.equal(first.views().length, 2);
      assert.equal(second.views().length, 2);
      assert.equal(hostSocket.closed, null);
      assert.equal(hostSocket.sent.some((message) => message.type === 'error'), false);
      assert.equal(room.players.size, 3);

      // A subsequent run can end before any ordinary view clears the prior terminal flags.
      onEnded({ reason, summary: { deepestWave: 10, wavesSurvived: 9 } });
      game.serveAgentRiderViews();
      assert.equal(first.views().length, 3);
      assert.equal(second.views().length, 3);
      assert.equal(first.views().at(-1).body.appendLog[0].wave, 10);
    }
  } finally {
    globalThis.Response = originals.Response;
    globalThis.WebSocketPair = originals.WebSocketPair;
    globalThis.setTimeout = originals.setTimeout;
    Date.now = originals.dateNow;
    performance.now = originals.performanceNow;
    await vite.close();
  }
});
