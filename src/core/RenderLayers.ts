export const RenderLayers = {
  backdrop: -2,
  terrainBackdrop: -1,
  terrain: 0,
  groundShadows: 0.5,
  groundDecals: 1,
  gameplay: 2,
  gameplayFade: 2.01,
  companion: 2.5,
  impactVfx: 3,
  worldUi: 4,
} as const;

export type RenderLayerName = keyof typeof RenderLayers;

export function renderLayerOf(name: string): number | null {
  return Object.prototype.hasOwnProperty.call(RenderLayers, name) ? RenderLayers[name as RenderLayerName] : null;
}
