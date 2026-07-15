export type ClaimBoatAnchor = Readonly<{ id: string; x: number; z: number }>;
export type ClaimBoatPad = Readonly<{ id: string; x: number; z: number }>;
export type ClaimBoatPlacement = Readonly<{
  buildingId: string;
  padId: string;
  x: number;
  z: number;
}>;

export type ClaimBoatConfig = Readonly<{
  id: string;
  initialAnchorId: string;
  anchors: readonly ClaimBoatAnchor[];
  pads: readonly ClaimBoatPad[];
}>;

export type ClaimBoatSnapshot = Readonly<{
  id: string;
  anchor: ClaimBoatAnchor;
  pads: readonly (ClaimBoatPad & { occupied: boolean })[];
  buildings: readonly ClaimBoatPlacement[];
}>;

export class ClaimBoat {
  private anchor: ClaimBoatAnchor;
  private readonly buildings = new Map<string, string>();

  constructor(readonly config: ClaimBoatConfig) {
    const anchorIds = new Set(config.anchors.map((anchor) => anchor.id));
    const padIds = new Set(config.pads.map((pad) => pad.id));
    if (
      config.id.length === 0
      || config.anchors.length === 0
      || config.pads.length === 0
      || anchorIds.size !== config.anchors.length
      || padIds.size !== config.pads.length
    ) throw new Error('Invalid Claim-Boat config.');
    const initial = config.anchors.find((anchor) => anchor.id === config.initialAnchorId);
    if (!initial) throw new Error('Missing initial Claim-Boat anchor.');
    this.anchor = initial;
  }

  placeBuilding(padId: string, buildingId: string): boolean {
    if (!buildingId || this.buildings.has(padId) || !this.config.pads.some((pad) => pad.id === padId)) return false;
    this.buildings.set(padId, buildingId);
    return true;
  }

  reanchor(anchorId: string): boolean {
    const next = this.config.anchors.find((anchor) => anchor.id === anchorId);
    if (!next || next.id === this.anchor.id) return false;
    this.anchor = next;
    return true;
  }

  snapshot(): ClaimBoatSnapshot {
    return {
      id: this.config.id,
      anchor: this.anchor,
      pads: this.config.pads.map((pad) => ({ ...pad, occupied: this.buildings.has(pad.id) })),
      buildings: this.config.pads.flatMap((pad) => {
        const buildingId = this.buildings.get(pad.id);
        return buildingId ? [{ buildingId, padId: pad.id, x: this.anchor.x + pad.x, z: this.anchor.z + pad.z }] : [];
      }),
    };
  }
}
