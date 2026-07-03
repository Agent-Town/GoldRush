import * as THREE from 'three';

export const assetSlots = {
  charHero: 'char.hero',
  terrainBank: 'terrain.bank',
  terrainRiver: 'terrain.river',
  terrainFord: 'terrain.ford',
  propRock: 'prop.rock',
  propStump: 'prop.stump',
  propClaimPost: 'prop.claim_post',
} as const;

export type AssetSlotId = (typeof assetSlots)[keyof typeof assetSlots];

export type PlaceholderFactory<T extends THREE.Object3D = THREE.Object3D> = (() => T) & {
  slotId: AssetSlotId;
};

export function tagPlaceholder<T extends THREE.Object3D>(object: T, slotId: AssetSlotId): T {
  object.userData.assetSlot = slotId;
  object.traverse((child) => {
    child.userData.assetSlot = slotId;
  });
  return object;
}
