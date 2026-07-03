import * as THREE from 'three';

export const Balance = {
  hero: {
    speed: 6.0,
    accel: 20,
    decel: 28,
    radius: 0.55,
  },
  camera: {
    fov: 42,
    offset: new THREE.Vector3(0, 22, 10),
    lag: 0.12,
    lookAhead: 1.5,
    downScreenLookOffset: 2.2,
  },
  render: {
    exposure: 1.05,
    maxDpr: 2,
  },
} as const;
