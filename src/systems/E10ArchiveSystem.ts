import type { SquallDiagnostics } from './E10SquallScheduler';
import { TILE_STATE_SCHEMA_VERSION, type TileStateEntry, type TileStateStore } from '../game/TileStateStore';

export type ArchiveWing = {
  id: string;
  siteId: string;
  order: number;
  x: number;
  z: number;
  radius: number;
};

/** Ordered light holds; the caller owns the squall clock, beacon power and run-end persistence. */
export class E10ArchiveSystem {
  static restoredWingIds(entries: readonly TileStateEntry[]): string[] {
    return entries.flatMap(entry => {
      const payload = entry.payload as { wingId?: unknown } | null;
      return entry.kind === 'sim' && entry.schemaVersion === TILE_STATE_SCHEMA_VERSION
        && typeof payload?.wingId === 'string' && entry.id === `archive-wing:${payload.wingId}`
        ? [payload.wingId] : [];
    });
  }

  static create(contract: { twist: unknown; tileParams: unknown }, restoredWingIds: readonly string[] = []): E10ArchiveSystem | null {
    const record = (value: unknown): Record<string, unknown> =>
      value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
    const declaration = record(record(contract.twist).archiveWorld).lightHold;
    if (declaration === undefined) return null;
    const tile = record(contract.tileParams);
    if (!Array.isArray(declaration) || declaration.length === 0
      || !Array.isArray(tile.archiveWingZones) || !Array.isArray(tile.lightHoldSites)) {
      throw new Error('Invalid archive light-hold declaration');
    }
    const wings = declaration.map(binding => {
      const { wingId, siteId } = record(binding);
      const wing = record((tile.archiveWingZones as unknown[]).find(value => record(value).id === wingId));
      const site = record((tile.lightHoldSites as unknown[]).find(value => record(value).id === siteId));
      if (typeof wingId !== 'string' || typeof siteId !== 'string'
        || typeof wing.order !== 'number' || typeof site.x !== 'number'
        || typeof site.z !== 'number' || typeof site.radius !== 'number') {
        throw new Error('Archive hold must reference an authored wing and light site');
      }
      return { id: wingId, siteId, order: wing.order, x: site.x, z: site.z, radius: site.radius };
    });
    if (wings.length !== tile.archiveWingZones.length || wings.length !== tile.lightHoldSites.length) throw new Error('Every archive wing and light site needs exactly one binding');
    return new E10ArchiveSystem(wings, restoredWingIds);
  }

  private readonly restored = new Set<string>();
  private readonly earned = new Set<string>();
  private holding: string | null = null;
  private cycle = -1;
  private previousPhase: SquallDiagnostics['phase'] = 'calm';
  private completedHolds = 0;
  private pressureSites: readonly ArchiveWing[] = [];
  readonly wings: readonly ArchiveWing[];

  constructor(wings: readonly ArchiveWing[], restoredWingIds: readonly string[] = []) {
    this.wings = wings.map(wing => ({ ...wing })).sort((a, b) => a.order - b.order);
    const ids = new Set<string>(), sites = new Set<string>(), orders = new Set<number>();
    for (const wing of this.wings) {
      if (!wing.id || !wing.siteId || ids.has(wing.id) || sites.has(wing.siteId)
        || !Number.isInteger(wing.order) || wing.order < 1 || orders.has(wing.order)
        || ![wing.x, wing.z, wing.radius].every(Number.isFinite) || wing.radius <= 0) {
        throw new Error('Invalid archive wing configuration');
      }
      ids.add(wing.id); sites.add(wing.siteId); orders.add(wing.order);
    }
    // Accept only a contiguous authored prefix from saved state; malformed later wings cannot skip order.
    for (const wing of this.wings) {
      if (!restoredWingIds.includes(wing.id)) break;
      this.restored.add(wing.id);
    }
  }

  update(squall: Pick<SquallDiagnostics, 'declared' | 'phase' | 'cycle'>, litSiteIds: readonly string[]): void {
    this.pressureSites = squall.declared && squall.phase === 'squall'
      ? this.wings.filter(wing => litSiteIds.includes(wing.siteId)) : [];
    if (!squall.declared || this.wings.length === 0) {
      this.holding = null;
      this.previousPhase = 'calm';
      this.cycle = -1;
      return;
    }
    const enteringTelegraph = squall.phase === 'telegraph'
      && (this.previousPhase !== 'telegraph' || this.cycle !== squall.cycle);
    if (enteringTelegraph) {
      // Once all wings are restored, reaffirm the first wing to keep subsequent visits playable.
      const next = this.wings.find(wing => !this.restored.has(wing.id)) ?? this.wings[0];
      this.holding = next && litSiteIds.includes(next.siteId) ? next.id : null;
    }
    const held = this.wings.find(wing => wing.id === this.holding);
    if (held && (((squall.phase === 'telegraph' || squall.phase === 'squall') && !litSiteIds.includes(held.siteId))
      || (this.cycle !== squall.cycle && !enteringTelegraph))) this.holding = null;
    if (this.previousPhase === 'squall' && squall.phase === 'recover' && this.holding) {
      if (!this.restored.has(this.holding)) this.earned.add(this.holding);
      this.restored.add(this.holding);
      this.completedHolds += 1;
      this.holding = null;
    }
    if (squall.phase === 'calm') this.holding = null;
    this.previousPhase = squall.phase;
    this.cycle = squall.cycle;
  }

  /** Both engines steer from the previous completed tick's light and weather sample. */
  pressureTarget(enemy: Readonly<{ id: number; variantId: string | null }>): ArchiveWing | null {
    if (enemy.variantId !== 'static_mote' || this.pressureSites.length === 0) return null;
    return this.pressureSites[enemy.id % this.pressureSites.length] ?? null;
  }

  get objectiveAllowsSecure(): boolean {
    return this.wings.length === 0 || this.completedHolds > 0;
  }

  /** Call only when banking a secured run; a lost run must stage nothing. */
  get restoredThisRun(): readonly string[] { return [...this.earned]; }

  stageAtRunEnd(store: TileStateStore, contractId: string, secured: boolean): void {
    if (!secured) return;
    for (const wingId of this.earned) store.stageWrite(contractId, {
      kind: 'sim', id: `archive-wing:${wingId}`, payload: { wingId }, schemaVersion: TILE_STATE_SCHEMA_VERSION,
    });
  }

  get diagnostics() {
    return {
      restoredWingIds: this.wings.filter(wing => this.restored.has(wing.id)).map(wing => wing.id),
      restoredThisRun: this.restoredThisRun,
      holdingWingId: this.holding,
      completedHolds: this.completedHolds,
      objectiveAllowsSecure: this.objectiveAllowsSecure,
    };
  }
}
