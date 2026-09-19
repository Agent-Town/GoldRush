import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

test('human tape preserves the Prospector dispatch input', async () => {
  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { normalizeLockstepAction } = await vite.ssrLoadModule('/src/mp/LockstepClient.ts');
    const { RunTapeRecorder } = await vite.ssrLoadModule('/src/game/RunTape.ts');
    const action = normalizeLockstepAction({ type: 'prospector_dispatch', node: 'gold-seam-1' });
    assert.deepEqual(action, { type: 'prospector_dispatch', node: 'gold-seam-1' });
    const recorder = new RunTapeRecorder({
      contract: 'the-claim', seed: 'same-laws', difficulty: 'trail', start: { x: 0, z: 12 },
    });
    recorder.recordAction(action);
    recorder.recordAction(action);
    recorder.record({
      move: { x: 0, y: 0 }, confirm: false, upgrade: false, rotateBuild: false, weaponToggle: false,
      build: false, cancel: false, buildSlot: null, restart: false, pause: false, mute: false,
      debugSpawn: false, debugXp: false, debugPlant: false,
    }, { x: 0, z: 12 });
    const tape = recorder.snapshot(
      { reason: 'dead', secured: false, waves: 0, timeAlive: 0, gold: 0 },
      { probes: [], kills: 0, gold: 0, wave: 0, economy: {} },
    );
    assert.deepEqual(tape.inputLog.entries[0].a, [action, action]);
  } finally {
    await vite.close();
  }
});
