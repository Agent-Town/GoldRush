import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
import * as THREE from 'three';

// Run Game's actual picker with real projection/rays, without booting the scene.
const source = await readFile(process.env.DISPATCH_SOURCE ?? new URL('../src/game/Game.ts', import.meta.url), 'utf8');
const start = source.indexOf('  private prospectorDispatchTargetAt(');
const end = source.indexOf('\n  private ', start + 1);
assert.ok(start > 0 && end > start);
const js = ts.transpileModule(`class Picker { ${source.slice(start, end)} }`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

for (const height of [-4.5, 0, 6]) {
  test(`dispatch hits visible seams and sluices at terrain height ${height}`, () => {
    const terrain = { visualY: (x, _z, base = 0, radius = 0) => height + base + (x > 0 ? 3 : 0) + (radius ? 0.3 : 0) };
    const Picker = new Function('THREE', 'Terrain', 'distanceSq2', `${js}; return Picker;`)(THREE, terrain, (x, z, a, b) => (x-a)**2+(z-b)**2);
    const picker = new Picker();
    const rect = { left: 35, top: 71, width: 900, height: 700 };
    picker.canvas = { getBoundingClientRect: () => rect };
    picker.camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 200);
    picker.camera.position.set(0, 26.2, 18.3);
    picker.camera.lookAt(0, 0, 0);
    picker.camera.updateMatrixWorld();
    picker.aimPointerNdc = new THREE.Vector2();
    picker.aimRaycaster = new THREE.Raycaster();
    picker.aimGroundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    picker.pointerAimPoint = new THREE.Vector3(11, 0, 13);
    picker.harvestSnapshot = { activeNodes: [{ id: 'seam-1', active: true, position: { x: -5, z: 0 } }, { id: 'inactive', active: false, position: { x: 0, z: 0 } }] };
    picker.buildSystem = { diagnostics: { sluicePositions: [{ x: 5, z: 0 }] } };
    function click(x, y, z) {
      const point = new THREE.Vector3(x, y, z).project(picker.camera);
      return picker.prospectorDispatchTargetAt(rect.left + (point.x + 1) * rect.width / 2, rect.top + (1-point.y) * rect.height / 2);
    }
    assert.equal(click(-5, height + 0.05, 0)?.id, 'seam-1');
    assert.equal(click(5, terrain.visualY(5, 0, 0.2, 0.9), 0)?.id, 'sluice-1');
    assert.equal(click(0, height + 0.05, 0), null, 'inactive seam is not selectable');
    assert.equal(click(-8, height + 0.05, 0), null, 'outside the 2.2m target radius');
    assert.equal(picker.aimGroundPlane.constant, 0, 'blast aim plane is unchanged');
    assert.deepEqual(picker.pointerAimPoint.toArray(), [11, 0, 13], 'dispatch must not move the blast aim point');
  });
}
