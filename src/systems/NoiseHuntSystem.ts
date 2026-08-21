import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { ContractManifest } from '../meta/ContractFamilies';

/**
 * A2 — THE NOISE-HUNT (door-completion-sheet §A2, RATIFIED 2026-08-20).
 *
 * `e5-stillwater` declares three machines, two quiet zones and a fog that covers the map, and
 * says the leviathan hunts by ear. This is the consumer for exactly that declaration — the same
 * shape `FlotillaHullSystem` uses for the Flotilla's hulls: authored data in, a frozen rules
 * constant for everything the data does NOT declare, one `advance`, one diagnostics surface.
 *
 * THE THREE MACHINES AND WHAT MAKES EACH ONE RUN, each read off a seam that already exists in
 * BOTH engines so the rule is one implementation rather than two:
 *   air-pump       the harvest CHANNEL is engaged (`HarvestSnapshot.channeling`) — the machine
 *                  works the pan. The public HARVEST verb (`panAt`) is a single-tick HAND pan and
 *                  never engages the channel, which is the sheet's "hand-pan = harvest without
 *                  pump noise" seam, live for free.
 *   engine         the boat is under way — `onReanchor(at)` opens a window of
 *                  `NOISE_HUNT_RULES.engineSeconds`. Called from each engine's REANCHOR lever.
 *   harpoon-reload the deck ballista fired — the cumulative `DeepwaterArsenal.fires.harpoonBallista`
 *                  counter moved, opening `NOISE_HUNT_RULES.harpoonReloadSeconds` of clatter.
 *
 * THE MACHINES RIDE THE ANCHOR. Every declared source position is authored against the boat's
 * INITIAL anchor, so the offset is what is real — exactly as deck buildings ride it
 * (`ClaimBoat.snapshot`: "world position = anchor + pad offset"). This is not decoration: the
 * contract's second anchor, `open-water` at (-24,12), lies INSIDE the declared `hand-pan-drift`
 * quiet zone, so REANCHOR — an existing public verb — is the map's own way to take the whole
 * boat quiet. A source whose world position sits in any declared quiet zone emits nothing.
 *
 * THE TRAIL is a two-state machine over declared radii. A running, unsilenced source is as loud
 * as it reaches: `level = radius`. The loudest audible source becomes the trail; ties break by
 * DECLARED ORDER, never by iteration order, so the hash cannot move. When every source falls
 * silent a quiet clock runs, and the trail is dropped after `trailHoldSeconds` — the sheet's
 * "losing the trail after 8s of quiet".
 *
 * THE STRIKE NEVER TOUCHES THE HERO, structurally rather than by tuning: it can only reduce deck
 * integrity, and a knocked-out deck leaves through the tile's existing `loseHull(padId)` seam —
 * the same one the Flotilla uses. The hero's danger on this map is the ordinary contact the
 * leviathan already carries, resolved where it has always been resolved, in `CombatSystem`.
 *
 * THE FOG IS PRESENTATION-THIN AND PUBLISHED, WITH NO STEERING EFFECT, AND THAT IS DELIBERATE.
 * The sheet asks for "watch radius capped; render haze", and this system caps and publishes the
 * watch radius for riders and the render side. It does NOT cap what the leviathan can find,
 * because an untrailed leviathan that cannot see would make a SILENT run — which is precisely
 * what an idle run is — safer than a played one. Law 2 forbids shipping that blind, so the fog
 * shrouds the eye of the reader, not the ear of the hunter.
 */
type Zone = Readonly<{ id: string; minX: number; maxX: number; minZ: number; maxZ: number }>;
type SourceConfig = Readonly<{ id: string; x: number; z: number; radius: number }>;

type StillwaterFields = Readonly<{
  fogZone: Zone;
  quietZones: readonly Zone[];
  noiseSources: readonly SourceConfig[];
}>;

export type NoiseHuntPorts = Readonly<{
  /** The Claim-Boat's live anchor. Every machine rides it. */
  anchor: () => Readonly<{ x: number; z: number }>;
  /** `HarvestSnapshot.channeling` — the pan machine is engaged. */
  panChanneling: () => boolean;
  /** `DeepwaterArsenal.diagnostics.fires.harpoonBallista` — cumulative, never reset mid-run. */
  harpoonFires: () => number;
  /** The Prospector, for published quiet-zone membership. */
  prospectorPosition: () => Readonly<{ x: number; z: number }>;
  /** Deck placements as the tile reports them, already filtered of knocked-out pads. */
  deckBuildings: () => readonly Readonly<{ padId: string; buildingId: string; x: number; z: number }>[];
  /** Knock a pad out through the tile's own seam. */
  onDeckLost: (padId: string) => void;
}>;

export type NoiseHuntDiagnostics = Readonly<{
  sources: readonly Readonly<{
    id: string;
    x: number;
    z: number;
    radius: number;
    running: boolean;
    silenced: boolean;
    level: number;
  }>[];
  trail: Readonly<{
    target: string | null;
    x: number;
    z: number;
    quietSeconds: number;
    strikes: number;
  }>;
  quietZones: readonly Readonly<Zone & { boatInside: boolean; prospectorInside: boolean }>[];
  prospectorQuietZoneId: string | null;
  fog: Readonly<{ id: string; watchRadius: number; prospectorInside: boolean }>;
  decks: readonly Readonly<{ padId: string; buildingId: string; integrity: number }>[];
}>;

/**
 * Everything the contract does NOT declare. Authored here rather than in the JSON on purpose:
 * the sheet's DEFAULTS are the consumer's tuning, and a manifest rule sourced to raw authored
 * data would be the reject-don't-stretch failure `er01-e5-census` exists to catch.
 */
export const NOISE_HUNT_RULES = Object.freeze({
  /** A source must reach at least this far to be heard at all. Below every declared radius (14). */
  audibleRadius: 12,
  /** Sheet default: 8s of quiet shakes the trail. */
  trailHoldSeconds: 8,
  /** How long the boat is under way after a REANCHOR. */
  engineSeconds: 6,
  /** How long the ballista's reload clatters after a shot. */
  harpoonReloadSeconds: 3,
  /** How close the head must come to the emitter before it can strike. */
  strikeRange: 7,
  strikeCooldownSeconds: 4,
  /** Tuned to threaten machines, not the hero: it can only ever reduce deck integrity. */
  strikeDamage: 16,
  deckIntegrity: 96,
  /** Fog: the shroud caps how far anything is WATCHED. Published; never steers the hunt. */
  watchRadius: 22,
});

const contains = (zone: Zone, x: number, z: number): boolean =>
  x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ;

export class NoiseHuntSystem {
  private readonly offsets: readonly Readonly<{ id: string; dx: number; dz: number; radius: number }>[];
  private readonly deckIntegrity = new Map<string, number>();
  private engineUntil = -1;
  private harpoonUntil = -1;
  private lastHarpoonFires = 0;
  private trailTarget: string | null = null;
  private trailX = 0;
  private trailZ = 0;
  private quietSince = -1;
  private nextStrikeAt = 0;
  private strikes = 0;
  private currentAt = 0;

  private constructor(
    private readonly data: StillwaterFields,
    private readonly ports: NoiseHuntPorts,
    initialAnchor: Readonly<{ x: number; z: number }>,
  ) {
    this.offsets = data.noiseSources.map(({ id, x, z, radius }) => ({
      id,
      dx: x - initialAnchor.x,
      dz: z - initialAnchor.z,
      radius,
    }));
  }

  /** Null for every contract that does not declare the noise-hunt — the `FlotillaHullSystem.create` shape. */
  static create(contract: ContractManifest, ports: NoiseHuntPorts): NoiseHuntSystem | null {
    const data = contract.id === 'e5-stillwater' ? contract.tileParams.stillwater : undefined;
    if (!data) return null;
    const anchors = contract.tileParams.deepwater?.claimBoat;
    const initial = anchors?.anchors.find(({ id }) => id === anchors.initialAnchorId);
    if (
      !initial
      || !data.fogZone?.id
      || data.quietZones.length === 0
      || data.noiseSources.length === 0
      || data.noiseSources.some(({ id, x, z, radius }) => !id || !Number.isFinite(x + z) || radius <= 0)
      || data.quietZones.some((zone) => !zone.id || zone.maxX <= zone.minX || zone.maxZ <= zone.minZ)
    ) throw new Error('The Stillwater noise data is incomplete.');
    return new NoiseHuntSystem(data, ports, initial);
  }

  /** Opened by each engine's REANCHOR lever: the boat is under way and the engine is heard. */
  onReanchor(at: number): void {
    this.engineUntil = at + NOISE_HUNT_RULES.engineSeconds;
  }

  advance(at: number, enemies: readonly ClaimJumperEnemy[], leviathanVariantId: string | undefined): void {
    this.currentAt = at;
    const fires = this.ports.harpoonFires();
    if (fires > this.lastHarpoonFires) this.harpoonUntil = at + NOISE_HUNT_RULES.harpoonReloadSeconds;
    this.lastHarpoonFires = fires;

    const levels = this.levels();
    // Ties break by DECLARED ORDER — `reduce` keeps the first strict maximum, never the last.
    const loudest = levels.reduce<typeof levels[number] | null>(
      (best, entry) => (entry.level >= NOISE_HUNT_RULES.audibleRadius && (!best || entry.level > best.level) ? entry : best),
      null,
    );
    if (loudest) {
      this.trailTarget = loudest.id;
      this.trailX = loudest.x;
      this.trailZ = loudest.z;
      this.quietSince = -1;
    } else if (this.trailTarget !== null) {
      if (this.quietSince < 0) this.quietSince = at;
      else if (at - this.quietSince >= NOISE_HUNT_RULES.trailHoldSeconds) {
        this.trailTarget = null;
        this.quietSince = -1;
      }
    }
    this.steer(at, enemies, leviathanVariantId);
  }

  reset(): void {
    this.deckIntegrity.clear();
    this.engineUntil = -1;
    this.harpoonUntil = -1;
    this.lastHarpoonFires = 0;
    this.trailTarget = null;
    this.trailX = 0;
    this.trailZ = 0;
    this.quietSince = -1;
    this.nextStrikeAt = 0;
    this.strikes = 0;
    this.currentAt = 0;
  }

  get diagnostics(): NoiseHuntDiagnostics {
    const prospector = this.ports.prospectorPosition();
    const anchor = this.ports.anchor();
    const quietZone = this.data.quietZones.find((zone) => contains(zone, prospector.x, prospector.z));
    return {
      sources: this.levels().map(({ id, x, z, radius, running, silenced, level }) => ({
        id, x, z, radius, running, silenced, level,
      })),
      trail: {
        target: this.trailTarget,
        x: this.trailX,
        z: this.trailZ,
        quietSeconds: this.quietSince < 0 ? 0 : Math.max(0, this.currentAt - this.quietSince),
        strikes: this.strikes,
      },
      quietZones: this.data.quietZones.map((zone) => ({
        ...zone,
        boatInside: contains(zone, anchor.x, anchor.z),
        prospectorInside: contains(zone, prospector.x, prospector.z),
      })),
      prospectorQuietZoneId: quietZone?.id ?? null,
      fog: {
        id: this.data.fogZone.id,
        watchRadius: NOISE_HUNT_RULES.watchRadius,
        prospectorInside: contains(this.data.fogZone, prospector.x, prospector.z),
      },
      decks: this.ports.deckBuildings().map(({ padId, buildingId }) => ({
        padId,
        buildingId,
        integrity: this.deckIntegrity.get(padId) ?? NOISE_HUNT_RULES.deckIntegrity,
      })),
    };
  }

  /** Which machines run, where they are, and how far each is heard. */
  private levels(): readonly Readonly<{
    id: string; x: number; z: number; radius: number; running: boolean; silenced: boolean; level: number;
  }>[] {
    const anchor = this.ports.anchor();
    return this.offsets.map(({ id, dx, dz, radius }) => {
      const x = anchor.x + dx;
      const z = anchor.z + dz;
      const running = this.isRunning(id);
      const silenced = this.data.quietZones.some((zone) => contains(zone, x, z));
      return { id, x, z, radius, running, silenced, level: running && !silenced ? radius : 0 };
    });
  }

  private isRunning(sourceId: string): boolean {
    if (sourceId === 'engine') return this.currentAt < this.engineUntil;
    if (sourceId === 'harpoon-reload') return this.currentAt < this.harpoonUntil;
    // Every other declared machine is the pan: the channel is the machine, the hand is not.
    return this.ports.panChanneling();
  }

  /**
   * Reuses the movement archetype the Deepwater corsairs already ride (`Enemy.scriptMoveTo`), so
   * the hunt adds no AI. Releasing is the zero-point route the same entity already implements
   * (`Enemy.scriptMoveRoute`: `this.scripted = this.scriptedRoute.length > 0`), which hands the
   * head straight back to ordinary pursuit.
   */
  private steer(at: number, enemies: readonly ClaimJumperEnemy[], leviathanVariantId: string | undefined): void {
    if (!leviathanVariantId) return;
    let arrived = false;
    for (const enemy of enemies) {
      if (!enemy.isAlive || enemy.variantId !== leviathanVariantId) continue;
      if (this.trailTarget === null) {
        enemy.scriptMoveRoute([], enemy.moveSpeed);
        continue;
      }
      enemy.scriptMoveTo(this.trailX, this.trailZ, enemy.moveSpeed, { ignoreTerrain: true });
      const reach = NOISE_HUNT_RULES.strikeRange + enemy.hitRadius;
      if (Math.hypot(enemy.position.x - this.trailX, enemy.position.z - this.trailZ) <= reach) arrived = true;
    }
    if (!arrived || at < this.nextStrikeAt) return;
    this.nextStrikeAt = at + NOISE_HUNT_RULES.strikeCooldownSeconds;
    this.strike();
  }

  /** The struck machine is the one that called: the deck nearest the trailed emitter. */
  private strike(): void {
    const decks = this.ports.deckBuildings();
    if (decks.length === 0) return;
    const hit = decks.reduce((best, deck) =>
      Math.hypot(deck.x - this.trailX, deck.z - this.trailZ) < Math.hypot(best.x - this.trailX, best.z - this.trailZ)
        ? deck
        : best);
    const remaining = (this.deckIntegrity.get(hit.padId) ?? NOISE_HUNT_RULES.deckIntegrity) - NOISE_HUNT_RULES.strikeDamage;
    this.strikes += 1;
    this.deckIntegrity.set(hit.padId, Math.max(0, remaining));
    if (remaining <= 0) this.ports.onDeckLost(hit.padId);
  }
}
