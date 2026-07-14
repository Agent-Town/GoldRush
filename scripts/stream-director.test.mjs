import assert from 'node:assert/strict';
import test from 'node:test';
import { connectObs, directShowcase, obsAuthentication } from './stream-director.mjs';

class FakeWebSocket {
  static last;
  sent = [];
  switches = [];
  constructor() { FakeWebSocket.last = this; queueMicrotask(() => this.emit({ op:0, d:{ authentication:{ salt:'salt', challenge:'challenge' } } })); }
  emit(message) { this.onmessage?.({ data:JSON.stringify(message) }); }
  send(raw) {
    const message = JSON.parse(raw); this.sent.push(message);
    if (message.op === 1) queueMicrotask(() => this.emit({ op:2, d:{ negotiatedRpcVersion:1 } }));
    if (message.op === 6) {
      if (message.d.requestType === 'SetCurrentProgramScene') this.switches.push(message.d.requestData.sceneName);
      const responseData = message.d.requestType === 'GetSceneList' ? { scenes:[{ sceneName:'AUTOPILOT' }, { sceneName:'FACTORY' }] } : {};
      queueMicrotask(() => this.emit({ op:7, d:{ requestId:message.d.requestId, requestStatus:{ result:true, code:100 }, responseData } }));
    }
  }
  close() { this.onclose?.(); }
}

test('OBS v5 authentication, scene discovery, and switch request use one websocket', async () => {
  const obs = await connectObs({ password:'secret', WebSocketImpl:FakeWebSocket });
  assert.equal(FakeWebSocket.last.sent[0].d.authentication, obsAuthentication('secret', { salt:'salt', challenge:'challenge' }));
  assert.deepEqual(await obs.scenes(), ['AUTOPILOT', 'FACTORY']);
  await obs.switchScene('FACTORY');
  assert.deepEqual(FakeWebSocket.last.switches, ['FACTORY']);
  obs.close();
});

test('failed preconditions are silent no-ops', async () => {
  let connects = 0;
  assert.equal(await directShowcase('anything', { displayReady:false, connect:async () => { connects++; } }), false);
  assert.equal(connects, 0);
});

test('missing spec, websocket, or required scenes never enter FACTORY', async () => {
  let switches = 0;
  const noScenes = { scenes:async () => ['AUTOPILOT'], switchScene:async () => { switches++; }, close() {} };
  assert.equal(await directShowcase('not-a-real-slice', { displayReady:true, connect:async () => noScenes }), false);
  assert.equal(await directShowcase('_s106-prospector-boot-probe', { displayReady:true, connect:async () => { throw new Error('offline'); } }), false);
  assert.equal(await directShowcase('_s106-prospector-boot-probe', { displayReady:true, connect:async () => noScenes }), false);
  assert.equal(switches, 0);
});

test('green showcase switches FACTORY, dwells, and always restores AUTOPILOT', async () => {
  const calls = [];
  const obs = { scenes:async () => ['AUTOPILOT', 'FACTORY'], switchScene:async (scene) => calls.push(scene), close:() => calls.push('close') };
  const ok = await directShowcase('_s106-prospector-boot-probe', {
    displayReady:true, connect:async () => obs, showcase:async () => { calls.push('showcase'); return 0; }, sleep:async (ms) => calls.push(ms),
  });
  assert.equal(ok, true);
  assert.deepEqual(calls, ['FACTORY', 'showcase', 10_000, 'AUTOPILOT', 'close']);
});

test('red showcase skips dwell and restores AUTOPILOT', async () => {
  const calls = [];
  const obs = { scenes:async () => ['AUTOPILOT', 'FACTORY'], switchScene:async (scene) => calls.push(scene), close:() => calls.push('close') };
  const ok = await directShowcase('_s106-prospector-boot-probe', {
    displayReady:true, connect:async () => obs, showcase:async () => 1, sleep:async () => calls.push('dwell'),
  });
  assert.equal(ok, false);
  assert.deepEqual(calls, ['FACTORY', 'AUTOPILOT', 'close']);
});
