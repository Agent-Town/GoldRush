import * as THREE from 'three';

export const assetSlots = {
  charHero: 'char.hero',
  charClaimJumper: 'char.claim_jumper',
  charProspectorAgent: 'char.prospector_agent',
  terrainBank: 'terrain.bank',
  terrainRiver: 'terrain.river',
  terrainFord: 'terrain.ford',
  nodeGoldSeam: 'node.gold_seam',
  propRock: 'prop.rock',
  propStump: 'prop.stump',
  propClaimPost: 'prop.claim_post',
  vfxBolt: 'vfx.bolt',
  bldSentryBeacon: 'bld.sentry_beacon',
  bldPortraitPalisade: 'bld.portrait.palisade',
  bldPortraitSluice: 'bld.portrait.sluice',
  bldPortraitStockpile: 'bld.portrait.stockpile',
  bldPortraitTurret: 'bld.portrait.turret',
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
