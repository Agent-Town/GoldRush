import * as THREE from 'three';

export const assetSlots = {
  charHero: 'char.hero',
  charClaimJumper: 'char.claim_jumper',
  charBanditBase: 'char.bandit_base',
  charBanditThief: 'char.bandit_thief',
  charE2RailTough: 'char.e2.rail_tough',
  charE2SteamWrecker: 'char.e2.steam_wrecker',
  charE2CoalThief: 'char.e2.coal_thief',
  charE6FeralToaster: 'char.e6.feral_toaster',
  charE6LawnShepherd: 'char.e6.lawn_shepherd',
  charE6Glowjack: 'char.e6.glowjack',
  charE7RogueAutomaton: 'char.e7.rogue_automaton',
  charE7DataRustler: 'char.e7.data_rustler',
  charE8ScrapCorsair: 'char.e8.scrap_corsair',
  charE8SunGlareShambler: 'char.e8.sun_glare_shambler',
  charBaron: 'char.baron',
  charProspectorAgent: 'char.prospector_agent',
  charTownTavernkeeper: 'char.town.tavernkeeper',
  charTownStorekeeper: 'char.town.storekeeper',
  charTownElder: 'char.town.elder',
  charTownPreacher: 'char.town.preacher',
  charTownSchoolteacher: 'char.town.schoolteacher',
  charTownAssayClerk: 'char.town.assay_clerk',
  charTownYoungsterA: 'char.town.youngster_a',
  charTownYoungsterB: 'char.town.youngster_b',
  terrainBank: 'terrain.bank',
  terrainRiver: 'terrain.river',
  terrainFord: 'terrain.ford',
  nodeGoldSeam: 'node.gold_seam',
  propRock: 'prop.rock',
  propStump: 'prop.stump',
  propClaimPost: 'prop.claim_post',
  propBaronBanner: 'prop.baron_banner',
  propRocketCart: 'prop.rocket_cart',
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
