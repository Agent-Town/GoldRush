import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import * as THREE from 'three';

test('relay lamp follows live lighting, local mute, global suppression and late mounts without writing state', async () => {
  const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { RelaySignalPresentation } = await vite.ssrLoadModule('/src/systems/RelaySignalPresentation.ts');
    const scene = new THREE.Scene(), originalRender = scene.onBeforeRender;
    let state = { sites: [1, 2, 3, 4].map(i => Object.freeze({ id: `relay-site-r${i}`, lit: i === 2, muted: false })) };
    let suppression = false, terrainState = 'pending';
    const owner = new RelaySignalPresentation(scene, () => state, () => suppression, () => terrainState);
    owner.sync(0); // A plain boot starts before the asynchronous frames arrive.
    const materials = [];
    for (let i = 1; i <= 4; i++) {
      const material = new THREE.MeshStandardMaterial({ map: new THREE.Texture() });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), material);
      mesh.name = `rush-relay-r${i}-frame`; scene.add(mesh); materials.push(material);
    }
    terrainState = 'mounted';
    const bytes = JSON.stringify(state); owner.sync(0);
    assert.equal(JSON.stringify(state), bytes);
    assert.deepEqual(materials.map(m => m.userData.relaySignal.value), [0, 1.05, 0, 0]);
    owner.sync(1 / 3); assert.equal(materials[1].userData.relaySignal.value, 1.35);
    state = { sites: state.sites.map(s => Object.freeze({ ...s, muted: s.lit })) };
    owner.sync(0); assert.ok(materials.every(m => m.userData.relaySignal.value === 0));
    state = { sites: state.sites.map(s => Object.freeze({ ...s, muted: false })) };
    suppression = true; owner.sync(0); assert.ok(materials.every(m => m.userData.relaySignal.value === 0));
    suppression = false; owner.sync(0); assert.equal(materials[1].userData.relaySignal.value, 1.05);
    state = { sites: state.sites.map(s => Object.freeze({ ...s, lit: false })) };
    owner.sync(0); assert.ok(materials.every(m => m.userData.relaySignal.value === 0), 'reset/wreck extinguishes the lamp');
    const shader = { uniforms: {}, fragmentShader: THREE.ShaderLib.standard.fragmentShader, vertexShader: THREE.ShaderLib.standard.vertexShader };
    materials[1].onBeforeCompile(shader, {});
    assert.equal(shader.uniforms.relaySignal, materials[1].userData.relaySignal);
    assert.match(shader.fragmentShader, /step\(0.5, vMapUv.y\)/, 'the authored lamp cell, not whole-body emission');
    assert.equal(scene.children.length, 4, 'no light, sprite, draw or new scene child');
    for (const material of materials) material.dispose();
    assert.equal(scene.onBeforeRender, originalRender, 'terrain disposal releases the render hook');
    assert.ok(materials.every(m => !m.userData.relaySignal));
    owner.dispose();
    const partialScene = new THREE.Scene(), partialRender = partialScene.onBeforeRender;
    const partial = new RelaySignalPresentation(partialScene, () => state, () => false);
    const partialMaterial = new THREE.MeshStandardMaterial({ map: new THREE.Texture() });
    const first = new THREE.Mesh(new THREE.PlaneGeometry(), partialMaterial); first.name = 'rush-relay-r1-frame'; partialScene.add(first);
    partial.sync(0); partialMaterial.dispose();
    assert.equal(partialScene.onBeforeRender, partialRender, 'leaving during an incomplete load releases the hook');
    assert.equal(partialMaterial.userData.relaySignal, undefined);
    for (const terrainState of ['off', 'lite', 'failed', 'disposed']) {
      const fallback = new THREE.Scene(), original = fallback.onBeforeRender;
      const owner = new RelaySignalPresentation(fallback, () => { throw Error('fallback must not read the sim'); }, () => false, () => terrainState);
      owner.sync(0); assert.equal(fallback.onBeforeRender, original);
    }
    const waiting = new THREE.Scene(); let visits = 0; waiting.getObjectByName = () => { visits++; };
    const pending = new RelaySignalPresentation(waiting, () => state, () => false, () => 'pending');
    for (let i = 0; i < 100; i++) pending.sync(i);
    assert.equal(visits, 0); pending.dispose();
    const empty = new THREE.Scene(), emptyRender = empty.onBeforeRender;
    new RelaySignalPresentation(empty, () => state, () => false).sync(0);
    assert.equal(empty.onBeforeRender, emptyRender, 'a mounted pack without frames stops discovery');
    assert.equal(RelaySignalPresentation.terrainState({ dataset: { terrain3dPilotState: 'off', terrain3dPilotLandmarkLoadState: 'mounted' } }, false), 'off');
  } finally { await vite.close(); }
});
