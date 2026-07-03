import * as THREE from 'three';
import { palette } from '../assets/palette';
import { assetSlots, tagPlaceholder, type PlaceholderFactory } from '../assets/slots';

const rockMaterial = new THREE.MeshStandardMaterial({
  color: '#8c7f6d',
  roughness: 0.9,
  metalness: 0.02,
});

const stumpMaterial = new THREE.MeshStandardMaterial({
  color: palette.wood,
  roughness: 0.82,
  metalness: 0.01,
});

const cutMaterial = new THREE.MeshStandardMaterial({
  color: palette.sandDeep,
  roughness: 0.78,
  metalness: 0.01,
});

export const createRockPlaceholder: PlaceholderFactory<THREE.Group> = Object.assign(
  () => {
    const group = new THREE.Group();
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), rockMaterial);
    rock.scale.set(1.25, 0.55, 0.9);
    rock.position.y = 0.24;
    rock.rotation.set(0.2, 0.4, -0.08);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
    return tagPlaceholder(group, assetSlots.propRock);
  },
  { slotId: assetSlots.propRock },
);

export const createStumpPlaceholder: PlaceholderFactory<THREE.Group> = Object.assign(
  () => {
    const group = new THREE.Group();
    const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.55, 7), stumpMaterial);
    stump.position.y = 0.28;
    stump.castShadow = true;
    stump.receiveShadow = true;
    group.add(stump);

    const cut = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.025, 7), cutMaterial);
    cut.position.y = 0.57;
    cut.receiveShadow = true;
    group.add(cut);
    return tagPlaceholder(group, assetSlots.propStump);
  },
  { slotId: assetSlots.propStump },
);

export const createClaimPostPlaceholder: PlaceholderFactory<THREE.Group> = Object.assign(
  () => {
    const group = new THREE.Group();
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.25, 0.18), stumpMaterial);
    post.position.y = 0.62;
    post.castShadow = true;
    post.receiveShadow = true;
    group.add(post);

    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.18, 0.12), stumpMaterial);
    rail.position.set(0.18, 1.08, 0);
    rail.rotation.z = -0.08;
    rail.castShadow = true;
    rail.receiveShadow = true;
    group.add(rail);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.24, 4), cutMaterial);
    cap.position.y = 1.36;
    cap.rotation.y = Math.PI / 4;
    cap.castShadow = true;
    group.add(cap);
    return tagPlaceholder(group, assetSlots.propClaimPost);
  },
  { slotId: assetSlots.propClaimPost },
);

export function createClaimProps(): THREE.Group {
  const group = new THREE.Group();
  const placements: Array<[PlaceholderFactory<THREE.Group>, number, number, number, number]> = [
    [createRockPlaceholder, -23, -11, 0.9, 0.1],
    [createRockPlaceholder, -13, 8.5, 0.65, 1.7],
    [createRockPlaceholder, 17, -9, 0.8, 0.5],
    [createRockPlaceholder, 26, 7.2, 0.7, 2.2],
    [createStumpPlaceholder, -27, 6, 0.9, -0.3],
    [createStumpPlaceholder, -9, -10.5, 0.75, 1.1],
    [createStumpPlaceholder, 8.5, 11, 0.8, -0.8],
    [createStumpPlaceholder, 22, -12, 0.65, 0.6],
    [createRockPlaceholder, 3.5, -15, 0.55, 2.7],
    [createClaimPostPlaceholder, -4.5, -7.2, 1, -0.25],
  ];

  for (const [factory, x, z, scale, rotation] of placements) {
    const prop = factory();
    prop.position.set(x, 0, z);
    prop.scale.setScalar(scale);
    prop.rotation.y = rotation;
    group.add(prop);
  }

  return group;
}
