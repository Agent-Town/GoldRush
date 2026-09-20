import * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import { DeepwaterArsenal, type DeepwaterArsenalDiagnostics } from '../entities/DeepwaterArsenal';
import type { EnemyPool } from '../entities/pools';
import { Balance } from '../game/Balance';
import type { ContractManifest } from '../meta/ContractFamilies';
import type { CombatSystem } from '../systems/CombatSystem';
import { FlotillaHullSystem, type FlotillaHullDiagnostics } from '../systems/FlotillaHullSystem';
import { NoiseHuntSystem, type NoiseHuntDiagnostics } from '../systems/NoiseHuntSystem';
import { RegattaRaceSystem, regattaRacer, type RegattaRaceDiagnostics } from '../systems/RegattaRaceSystem';
import { createDeepwaterClaimTile, deepwaterFrontCarriesWave, type CorsairSkiffWave, type DeepwaterClaimTile } from '../world/DeepwaterClaimTile';

/**
 * ER-01 E5 era socket — the headless consumer for the Deepwater Claim.
 *
 * The browser boots the flagship through `DeepwaterClaimTile` (water regions, the Claim-Boat,
 * the storm/corsair scheduler) and `DeepwaterArsenal`. This socket runs those same two consumers
 * headlessly, in the browser's own relative tick order:
 *
 *   Game.update: syncDeepwaterClaim -> [DredgeQueen.onStormWave] -> spawn corsairs
 *                -> deepwaterArsenal.update -> waveSystem.update
 *                -> recycleDeepwaterCorsairsAtExit -> combat.update -> arsenal.resolveTreatments
 *
 * A missing boss handoff is never silent: every storm wave at or beyond the authored boss wave
 * is counted in `bossHandoffsRefused`.
 */
export type DeepwaterBossHandoff = (wave: CorsairSkiffWave) => false | number;

export type DeepwaterSocketDiagnostics = Readonly<{
  contractId: string;
  tileId: string;
  size: number;
  anchor: { id: string; x: number; z: number };
  anchors: readonly { id: string; x: number; z: number }[];
  pads: readonly { id: string; occupied: boolean }[];
  boatBuildings: readonly { buildingId: string; padId: string; x: number; z: number }[];
  storm: ReturnType<DeepwaterClaimTile['snapshot']>['storm'];
  corsairWaves: number;
  corsairsSpawned: number;
  corsairsRecycledAtExit: number;
  wrecks: readonly string[];
  bossHandoffsRefused: number;
  arsenal: DeepwaterArsenalDiagnostics;
  race?: RegattaRaceDiagnostics;
  flotilla?: FlotillaHullDiagnostics;
  noiseHunt?: NoiseHuntDiagnostics;
}>;

/**
 * A2: the two readings the noise-hunt needs that live in the HOST rather than on this socket.
 * Both engines seat the same two, so the hunt is one rule and not two implementations.
 */
export type DeepwaterNoisePorts = Readonly<{
  /** `HarvestSnapshot.channeling` — the pan MACHINE is engaged (the hand-pan verb is not). */
  panChanneling: () => boolean;
}>;

export class DeepwaterSocket {
  private readonly arsenal: DeepwaterArsenal;
  private readonly race: RegattaRaceSystem | null;
  private readonly flotilla: FlotillaHullSystem | null;
  private readonly noise: NoiseHuntSystem | null;
  private corsairWavesSpawned = 0;
  private corsairsSpawned = 0;
  private corsairsRecycledAtExit = 0;
  private bossHandoffsRefused = 0;

  private constructor(
    readonly tile: DeepwaterClaimTile,
    private readonly contract: ContractManifest,
    private readonly enemies: EnemyPool,
    combat: CombatSystem,
    private readonly heroPosition: () => THREE.Vector3,
    private readonly emitWaveStarted: (wave: number, at: number) => void,
    private readonly bossHandoff: DeepwaterBossHandoff | null,
    noisePorts: DeepwaterNoisePorts,
  ) {
    this.race = RegattaRaceSystem.create(contract);
    this.flotilla = this.tile.flotilla;
    // A2 — the noise-hunt reads the boat and the deck from this socket's own tile, the ballista
    // from its own arsenal, and the pan channel from the host. A knocked-out deck leaves through
    // the SAME `loseHull` seam the Flotilla already uses.
    this.noise = NoiseHuntSystem.create(contract, {
      anchor: () => this.tile.snapshot().boat.anchor,
      panChanneling: noisePorts.panChanneling,
      harpoonFires: () => this.arsenal.harpoonShots,
      prospectorPosition: () => heroPosition(),
      deckBuildings: () => this.tile.snapshot().boat.buildings,
      onDeckLost: (padId) => this.tile.loseHull(padId),
    });
    this.arsenal = new DeepwaterArsenal(
      combat,
      heroPosition,
      () => this.tile.snapshot().boat.buildings,
      // The browser gates on `activeEpoch.id === 'epoch-5-deepwater' && !multiplayerActive()`.
      // A constructed socket already means an authored Deepwater contract, and GR-SIM is single-seat.
      () => true,
      () => true,
      () => false,
      () => this.heroInDiveZone(heroPosition()),
    );
  }

  /** Mirrors `createDeepwaterClaimTile`: null for every contract the browser would not socket. */
  static create(
    contract: ContractManifest,
    enemies: EnemyPool,
    combat: CombatSystem,
    heroPosition: () => THREE.Vector3,
    emitWaveStarted: (wave: number, at: number) => void,
    bossHandoff: DeepwaterBossHandoff | null = null,
    // Defaulted so every existing caller — and the census probe — keeps compiling unchanged. A
    // contract with no `tileParams.stillwater` never builds a noise-hunt, so the default is
    // never read there.
    noisePorts: DeepwaterNoisePorts = { panChanneling: () => false },
  ): DeepwaterSocket | null {
    const tile = createDeepwaterClaimTile(contract);
    return tile
      ? new DeepwaterSocket(tile, contract, enemies, combat, heroPosition, emitWaveStarted, bossHandoff, noisePorts)
      : null;
  }

  /** Game.syncDeepwaterClaim: advance the storm track, then spawn whatever it scheduled. */
  advance(at: number): void {
    const snapshot = this.tile.advance(at);
    // A2 — steer BEFORE the enemy pool moves, so the trail set this tick is the one walked this
    // tick. The leviathan is the roster's depth traveller, named from the contract rather than
    // hardcoded, exactly as the corsair archetype is looked up below.
    this.noise?.advance(at, this.enemies.all, this.leviathanVariantId);
    const pending = snapshot.corsairWaves.slice(this.corsairWavesSpawned);
    this.corsairWavesSpawned = snapshot.corsairWaves.length;
    const baron = this.contract.twist.baron;
    for (const wave of pending) {
      const bossWave = baron?.variantId === 'dredge_queen' ? baron.wave : Number.POSITIVE_INFINITY;
      const escortMultiplier = this.offerToBoss(wave, bossWave);
      if (deepwaterFrontCarriesWave(wave)) this.emitWaveStarted(wave.wave, wave.scheduledAt);
      this.spawnCorsairs(wave, escortMultiplier);
    }
  }

  /** Game.update: deepwaterArsenal.update, after the claim sync and before the wave system. */
  updateArsenal(at: number): void {
    this.arsenal.update(at);
  }

  /**
   * Game.update measures racers after their movement, before the arsenal and wave updates.
   *
   * SLICE 2 — THE RACE COUNTS THE BOAT (law 3, F-RB1-1 closed). This used to hand the course
   * `[hero, the boat's MOORING]`: the hero scored gates no boat had reached (a body swimming the
   * course won it) and `boat.anchor` — which stopped following the hull when slice 1 made her
   * steerable — scored the start beacon it is moored on, for free, on every idle run. Now the ONE
   * racer is whatever `regattaRacer` answers for the hull's live `motion`, and the browser twin
   * (`Game.update`) calls the same function on the same field.
   */
  advanceRace(at: number, wave: number): void {
    this.race?.advance(at, wave, regattaRacer(this.tile.snapshot().boat.motion));
  }

  /** Game.recycleDeepwaterCorsairsAtExit: skiffs that reached the far edge leave the board. */
  recycleCorsairsAtExit(): void {
    const lastWave = this.tile.snapshot().corsairWaves.at(-1);
    if (!lastWave) return;
    const variantId = this.contract.twist.enemyRoster?.find((entry) => entry.unitClass === 'vehicle' && entry.travelClass === 'boat')?.id;
    for (const enemy of this.enemies.all) {
      if (enemy.isAlive && enemy.variantId === variantId && enemy.position.x >= lastWave.toX - 2) {
        this.enemies.recycle(enemy);
        this.corsairsRecycledAtExit += 1;
      }
    }
  }

  /** Game.update: arsenal.resolveTreatments, immediately after combat.update. */
  resolveTreatments(): void {
    this.arsenal.resolveTreatments();
  }

  resolveHullContacts(at: number, onAllLost: () => void): void {
    if (this.flotilla?.advance(at, this.enemies.all)) onAllLost();
  }

  targetPosition(fallback: THREE.Vector3): THREE.Vector3 {
    const target = this.flotilla?.targetPosition(fallback) ?? fallback;
    return new THREE.Vector3(target.x, fallback.y, target.z);
  }

  movementMultiplier(position: { x: number; z: number }): number {
    return this.race?.movementMultiplierAt(position.x, position.z) ?? 1;
  }

  /** Real lever — Game's `place_boat_build` action. Rejects unknown and occupied pads. */
  placeBoatBuilding(padId: string, buildingId: string): boolean {
    return this.tile.placeBoatBuilding(padId, buildingId);
  }

  /** Real lever — Game's `reanchor` action. Rejects unknown anchors and the current one. */
  reanchor(anchorId: string, at = 0): boolean {
    const moved = this.tile.reanchor(anchorId, [this.heroPosition()]);
    // A2: the boat only makes engine noise when it actually gets under way, so a REFUSED
    // reanchor is silent. Free on every contract without a noise-hunt (`this.noise` is null).
    if (moved) this.noise?.onReanchor(at);
    return moved;
  }

  /** The roster's depth traveller — `machine_leviathan` on the Stillwater, absent elsewhere. */
  private get leviathanVariantId(): string | undefined {
    return this.contract.twist.enemyRoster?.find((entry) => entry.travelClass === 'depth')?.id;
  }

  /** Game.heroInDeepwaterDiveZone — the depth classes that seal the hero's rig. */
  heroInDiveZone(position: THREE.Vector3): boolean {
    const depthClass = this.tile.sample(position.x, position.z, 'depth')?.depthClass;
    return depthClass === 'reef' || depthClass === 'wreck' || depthClass === 'trench';
  }

  get diagnostics(): DeepwaterSocketDiagnostics {
    const snapshot = this.tile.snapshot();
    return {
      contractId: snapshot.contractId,
      tileId: snapshot.tileId,
      size: snapshot.size,
      anchor: { ...snapshot.boat.anchor },
      anchors: this.tile.reanchorTargets().map((anchor) => ({ ...anchor })),
      pads: snapshot.boat.pads.map(({ id, occupied }) => ({ id, occupied })),
      boatBuildings: snapshot.boat.buildings.map((building) => ({ ...building })),
      storm: snapshot.storm,
      corsairWaves: snapshot.corsairWaves.length,
      corsairsSpawned: this.corsairsSpawned,
      corsairsRecycledAtExit: this.corsairsRecycledAtExit,
      wrecks: snapshot.wrecks.map(({ id }) => id),
      bossHandoffsRefused: this.bossHandoffsRefused,
      arsenal: this.arsenal.diagnostics,
      ...(this.race ? { race: this.race.diagnostics } : {}),
      ...(this.flotilla ? { flotilla: this.flotilla.diagnostics } : {}),
      ...(this.noise ? { noiseHunt: this.noise.diagnostics } : {}),
    };
  }

  /**
   * The event-log slice. Presentation-only arsenal fields (`visuals`, `silhouette`) are excluded
   * for the same reason `crawler3dState` is excluded from the crawler's: a render decision must
   * never move a determinism hash.
   */
  get simulationSnapshot(): unknown {
    const { arsenal, ...rest } = this.diagnostics;
    const { visuals: _visuals, silhouette: _silhouette, ...simulationArsenal } = arsenal;
    return { ...rest, arsenal: simulationArsenal };
  }

  private offerToBoss(wave: CorsairSkiffWave, bossWave: number): false | number {
    if (this.bossHandoff) return this.bossHandoff(wave);
    // Count a missing handoff instead of hiding it.
    if (wave.wave >= bossWave) this.bossHandoffsRefused += 1;
    return false;
  }

  private spawnCorsairs(wave: CorsairSkiffWave, bossEscortMultiplier: false | number): void {
    const roster = this.contract.twist.enemyRoster?.find((entry) => entry.unitClass === 'vehicle' && entry.travelClass === 'boat');
    for (let copy = 0; copy < (bossEscortMultiplier || 1); copy += 1) {
      for (const skiff of wave.enemies) {
        const z = skiff.z + copy * 1.2;
        const enemy: ClaimJumperEnemy | null = this.enemies.spawn(
          new THREE.Vector3(skiff.x, Balance.enemy.groundY, z),
          {
            hpScale: roster?.hpScale,
            speedScale: roster?.speedMult,
            visualScale: roster?.visualScale,
            tint: roster?.tint,
            variantId: roster?.id,
            variantLabel: bossEscortMultiplier !== false ? 'Dredge-Queen Escort' : roster?.label,
          },
        );
        if (!enemy) continue;
        if (!this.flotilla) enemy.scriptMoveTo(wave.toX - 2, z, enemy.moveSpeed, { ignoreTerrain: true });
        this.corsairsSpawned += 1;
      }
    }
  }
}
