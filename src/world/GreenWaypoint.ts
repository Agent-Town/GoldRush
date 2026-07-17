import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import type { GreenWaypointPayload } from '../game/TileStateStore';
import * as Terrain from './Terrain';

/**
 * THE HEX LAW (E9 bundle, banked 2026-07-07): "the green that spreads is E1's
 * exact riverbank green (sample it — literally the same swatch)". Measured
 * 2026-07-17 as the dominant color of assets/processed/terrain-river-tile.png
 * (full-pixel histogram, 5-bit buckets). Every future green-spread consumer
 * checks against THIS constant, not a re-sample.
 */
export const E1_RIVERBANK_GREEN = '#848c6c';

/** Render mount for one planted-green waypoint (TP-02) — visuals only, no sim reach. */
export function createGreenWaypointSwatch(waypoint: GreenWaypointPayload): THREE.Group {
  const group = new THREE.Group();
  group.name = 'GreenWaypointSwatch';
  const y = Terrain.visualY(waypoint.x, waypoint.z, 0, waypoint.r);

  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(waypoint.r, 40),
    new THREE.MeshStandardMaterial({ color: E1_RIVERBANK_GREEN, roughness: 0.92, metalness: 0.01 }),
  );
  disc.name = 'GreenWaypointDisc';
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(waypoint.x, y + 0.03, waypoint.z);
  disc.renderOrder = RenderLayers.groundDecals;
  disc.receiveShadow = true;
  group.add(disc);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(waypoint.r * 0.94, waypoint.r * 1.16, 40),
    new THREE.MeshBasicMaterial({ color: E1_RIVERBANK_GREEN, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
  );
  ring.name = 'GreenWaypointRing';
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(waypoint.x, y + 0.026, waypoint.z);
  ring.renderOrder = RenderLayers.groundDecals;
  group.add(ring);

  return group;
}
