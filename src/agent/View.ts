import { runStatSimHarness } from '../crafting/StatSimHarness';
import engineEra from '../../assets/engine-era.json' with { type: 'json' };
import { Balance } from '../game/Balance';
import type { EconomyEvent } from '../game/Economy';
import { summarizeRun } from '../game/RunManager';
import { activeContract, type ContractEnemyVariant, type ContractManifest } from '../meta/ContractFamilies';
import { DEFAULT_COAL_SEAMS } from '../systems/coalSeamDefaults';
import type { E8AtmosphereDiagnostics } from '../systems/E8PhysicsSystem';
import type { E8CrossingAirDiagnostics, E8EclipseAirDiagnostics } from '../systems/E8SuitAirSystem';
import type { E10PreserveDiagnostics, PreserveStokeRefusal } from '../systems/E10PreserveSystem';
import { deriveMechanicsManifest, type MechanicsManifest } from './MechanicsManifest';

export type AgentViewSource = {
  readonly diagnostics?: () => unknown;
  readonly economyLog?: () => readonly unknown[];
  readonly standingOrders?: () => unknown;
};

export type AgentWaveLogEntry = {
  wave: number;
  outcome: 'held' | 'works-damaged' | 'works-lost' | 'rider-down' | 'secured' | 'unobserved';
  goldDelta: number | null;
  worksHp: { current: number; max: number; delta: number } | null;
  kills: number | null;
  surprises: readonly string[];
};

export type AgentGravityView = {
  source: 'gravity' | 'zero-gravity';
  movement: 'normal' | 'floaty' | 'free-fall';
  feelG: number;
  lobArcDistanceMultiplier: number;
  lobAirTimeMultiplier: number;
  knockbackScale: number;
  orbitalReturn: boolean;
  vacuum: boolean;
};

/**
 * One air shape for all four E8 maps. The `wall`/`suit`/`domes`/`regolith` rows are the Mare
 * Claim's, unchanged. The two optional blocks are ADDITIVE and contract-scoped, present only where
 * the map declares the thing they describe (`E8SuitAirSystem`): a crossing on the Far Side and Low
 * Orbit, the shadow on the Eclipse. No view-schema version bump goes with them, and that is the
 * registry's own rule rather than an omission: `scripts/view-schema-guard.test.mjs` builds its
 * canonical field list from `the-claim`, which declares no gravity and no air, so every
 * contract-scoped field under `now` is unregistered by design (F-E8MC-1, `now.preserve` precedent).
 */
export type AgentAirView = Omit<E8AtmosphereDiagnostics, 'declared' | 'regolith'> & {
  /**
   * The regolith row, with the four WINDOW fields made non-optional. They are optional in the
   * consumers' shared shape only because `E8SuitAirSystem` (the three siblings) does not emit
   * them and this slice's firewall forbids touching that file; `readAir` fills them for every E8
   * map, so a rider reads one air shape across the era. `windowWaves: null` means the map credits
   * a worked ground whenever it is worked; a number means at most one ground counts toward the
   * latch per that many waves of run time, and `window` names which one the run clock stands in.
   */
  regolith: Omit<E8AtmosphereDiagnostics['regolith'], 'windowWaves' | 'window' | 'creditedThisWindow' | 'windowHeldPans'> & Readonly<{
    windowWaves: number | null;
    window: number;
    creditedThisWindow: number;
    windowHeldPans: number;
  }>;
  crossing?: E8CrossingAirDiagnostics;
  eclipse?: E8EclipseAirDiagnostics;
};

/**
 * E2 — the pressure gauge, published for the rider because the human has had it on the HUD since
 * the epoch shipped. F-HEAT14-3 (heat-14 rider, its own words): on the Trestle and the Incline it
 * read the union of `now` keys across its whole run and found *no pressure value, no band, no coal
 * count, no boiler fuel*, while `boiler_house` sat on its price list at 70 gold × 3 — so 210 gold of
 * boiler was "a strictly dominated purchase" and F-MAPL-1's `coalSeconds` 12 → 36 "only triples the
 * duration of a process I cannot observe". Owner ruling 2026-09-19, verbatim: **"I agree with all
 * your recommendations on the decisions - good work"**, taking option (a) — *publish pressure
 * (value, band, coal seconds) in the agent view as one additive field, named in the skill fence*.
 * His D1 of 2026-09-07 is the thread: *"AI and human users have to have the same options and tools,
 * otherwise it is unfair"*.
 *
 * Every row here is a number the HUD already draws for the human, read off the SAME sources the
 * HUD reads (`Game.activeResourceSnapshots` → `economy.resources.pressure` and
 * `PressureSystem.diagnostics`), so the two gauges cannot drift apart:
 * `stored`/`cap` are the needle and its ceiling floored exactly as `activeResourceSnapshots` floors
 * them; `safeBand` carries the HUD's own `pressure_assay` research gate and is `null` until the
 * rider buys it, like the human's; `objective` is the `PRESSURIZE n/2 · W8–12` strip. The RULES
 * behind these numbers are not repeated here — `stablePrefix.mechanics.rules` has published
 * `pressure_bands`, `pressure_auto_vent`, `pressure_generation` and `pressure_powers` all along,
 * and `pressure_reading` now names this field so a rider reading the rules finds the gauge.
 *
 * NO VENT VERB, and that is parity rather than an omission: the human has no vent key either —
 * `PressureSystem.update` vents by itself above `safeMax` ("Above the safe band, the valve vents
 * with a warm puff", `WorldInfoNotes.ts:74`). `vents` counts the puffs so a rider can read the
 * waste it is paying for.
 */
export type AgentPressureView = Readonly<{
  /** The needle, floored the way the HUD floors it (`Math.floor(balance.amount)`). */
  stored: number;
  /** The gauge's ceiling (`resourceCaps.pressure`, 100 today), floored the same way. */
  cap: number;
  band: 'empty' | 'low' | 'working' | 'high';
  /**
   * The HUD's safe band, under the HUD's own gate: `null` until `pressure_assay` is researched,
   * `{ min, max }` after — exactly what `activeResourceSnapshots` spreads onto the human's gauge.
   * The band NAMES in `band` are published unconditionally because `pressure_bands` always was.
   */
  safeBand: Readonly<{ min: number; max: number }> | null;
  /** Lumps in hand. Each one a boiler swallows buys `Balance.boilerHouse.coalSeconds` of burn. */
  coal: number;
  /** The desk's "coal seconds": `coal × coalSeconds`, the burn the lumps in hand actually buy. */
  coalSeconds: number;
  boilers: Readonly<{ built: number; hot: number; cooling: number; max: number }>;
  /** How many times the valve has blown off above the safe band this run. */
  vents: number;
  objective: Readonly<{ active: boolean; failed: boolean; complete: boolean; hotBoilers: number; waves: string }>;
  /**
   * The coal seams, live. `stablePrefix.map.coalSeams` carries the same ids and anchors as the
   * authored fact; this row is what has been dug. `marked` is the `coal_survey` ring the human
   * sees on the ground.
   */
  seams: readonly Readonly<{ id: string; x: number; z: number; harvested: boolean; progress: number; marked: boolean }>[];
}>;

/**
 * E7 — the rider's playbook row. Structural rather than imported so this module keeps its
 * render-free, sim-free import list (it already takes `E8AtmosphereDiagnostics` as a type only);
 * `HeadlessContractSim.PlaybookUseDiagnostics` is the definition and assigns into this shape.
 */
export type AgentPlaybookUseView = Readonly<{
  declared: boolean;
  objective: 'relay' | 'mirror' | 'refusal' | 'suspended';
  objectiveMet: boolean;
  shelf: readonly Readonly<{ name: string; hash: string; entries: number; uses: number }>[];
  uses: number;
  repeats: number;
  programRuns: number;
  programSuspensions: number;
  suspendedProgram: string | null;
  relaysLitByProgram: readonly string[];
  runningProgram: string | null;
  refusals: Readonly<{ suppressed: number; muted: number; unrecorded: number }>;
  last: Readonly<{ name: string; ok: boolean; reason: string | null; at: number }> | null;
}>;

export type AgentView = {
  schema: 'goldrush.view.v1';
  viewVersion: number;
  stablePrefix: {
    seed: string;
    contract: {
      id: string;
      name: string;
      briefing: { geography: string; goals: readonly string[]; rules: readonly string[] };
    };
    mechanics: MechanicsManifest;
    objective?: 'preserve';
    map: {
      claim: { x: number; z: number };
      seams: readonly { id: string; x: number; z: number }[];
      coalSeams: readonly { id: string; x: number; z: number }[];
      water: { river: boolean; ford: boolean; sources: number; descriptor: string | null };
      spawnGates: readonly { edge: string; x?: number; z?: number }[];
    };
    orders: readonly unknown[];
  };
  appendLog: readonly AgentWaveLogEntry[];
  now: {
    wave: number;
    blastReadyInMs: number;
    weapon: 'rig' | 'blast';
    pendingSecure?: true | { defaultChoice: 'bank' | 'rush'; expiresInMs: number };
    megaproject?: {
      id: string;
      stage: number;
      funded: boolean;
      cost: number;
      site: { x: number; z: number; w: number; d: number };
    };
    preserve?: { hp: number; maxHp: number; alive: boolean };
    /**
     * E8 (additive, contract-scoped — outside the canonical field set, like `preserve`): the
     * physics profile the run rides under, read off the same `E8PhysicsSystem` diagnostics both
     * engines publish. Present only where the contract declares gravity.
     */
    /**
     * ADR-005 stage 3 item 8 (additive, contract-scoped — like `preserve`, `gravity` and `air`, and
     * therefore outside the canonical `viewSchema.fields` set): the four world interactions the
     * confirm key reaches and no verb named until this slice. Present only where the engine
     * composes at least one of them — never on the headless door, which composes none and refuses
     * the four actions by name.
     */
    contextPress?: {
      readonly drill: readonly { id: 'faucet' | 'bell'; x: number; z: number }[];
      readonly assay: boolean;
      readonly preserve: readonly { id: string; verb: string; held: boolean }[];
      readonly digger: { x: number; z: number; boarded: boolean } | null;
    };
    gravity?: AgentGravityView;
    /**
     * E2 (additive, contract-scoped — outside the canonical field set, like `preserve`, `gravity`
     * and `air`, and for the same registry reason: the canonical set is built from `the-claim`,
     * which declares no pressure). Present only where the contract declares `twist.pressureEnabled`
     * AND the engine composes its consumer — i.e. exactly where the human's gauge appears, which is
     * the whole point of F-HEAT14-3. Both engines publish it: the browser off
     * `Game.diagnostics.pressure`, `gr-sim` off `HeadlessContractSim.diagnostics.pressure`.
     */
    pressure?: AgentPressureView;
    /**
     * E8 (additive, contract-scoped): air as the wall — the Prospector's suit timer, each dome
     * pad's air dial and breach state, and the regolith-run latch that opens the secure. Present
     * only where the contract declares the wall AND the engine composes its consumer (today the
     * headless door on the Mare Claim; the browser composes none and publishes none).
     */
    air?: AgentAirView;
    /**
     * E7 (additive, contract-scoped — outside the canonical field set, like `preserve` and
     * `gravity`): the playbook shelf, the running program, the counted refusals, and the one
     * objective each Signal map latches its secure on. Present only on the four contracts
     * `assets/contracts/epoch-7-signal/contracts.json` declares, and only in the engine that
     * composes the verb (today the headless door; the browser publishes none — the human-parity
     * gap `e2e/e7-playbook-rows.spec.ts` pins rather than papers over).
     */
    playbookUse?: AgentPlaybookUseView;
    /**
     * E10S-3 (additive, contract-scoped — outside the canonical field set, like `preserve` and
     * `air`): the Ember Shore's last warm vent. `preserve.warmth` falls only while
     * `now.squall.blowing` is true, `preserve.stoke` carries the price and the disc a rider must
     * stand in, and `preserve.objectiveMet` is what opens the secure.
     *
     * NOT `now.preserve`, deliberately: that field is already `twist.preserve`'s damageable warm
     * vent on `e10-last-claim` (`{ hp, maxHp, alive }`, thirty lines above). The path here mirrors
     * the CONTRACT's own `twist.emberShore.preserve` so a rider reading the twist finds the row.
     */
    emberShore?: { preserve: E10PreserveDiagnostics };
    timers: { runSeconds: number; nextWaveInSeconds: number };
    gold: number;
    hero: { hp: number; maxHp: number; x: number; z: number };
    prospector: { x: number; z: number } | null;
    works: {
      hp: number;
      maxHp: number;
      standing: number;
      wrecked: number;
      byKind: Readonly<Record<string, number>>;
      entries: readonly {
        id: string;
        index: number;
        tier: number;
        hp: number;
        maxHp: number;
        wrecked: boolean;
        position: { x: number; z: number };
      }[];
    };
    threats: {
      alive: number;
      state: string;
      edge: string | null;
      thieves: number;
      wreckers: number;
    };
    orders: readonly unknown[];
    needsRider: boolean;
    seams: readonly {
      id: string;
      active: boolean;
      remaining: number;
      x: number | null;
      z: number | null;
      anchorIndex: number | null;
    }[];
    score: ReturnType<typeof summarizeRun>;
  };
  almanac: {
    label: 'the Almanac reckons';
    estimate: true;
    nextWave: {
      wave: number;
      arrivalInSeconds: number;
      basis: 'estimated-from-wave-schedule';
      composition: readonly { id: string; label: string; count: number }[];
    };
    projection: {
      expectedLeaks: number;
      expectedWorksDamage: number;
      expectedGold: number;
      currentWorks: number;
      harnessHash: string;
    };
  };
};

type Works = AgentView['now']['works'];
type Boundary = {
  wave: number;
  runSeconds: number;
  gold: number;
  heroHp: number;
  kills: number;
  works: Works;
  surprises: readonly string[];
  endReason: string | null;
  terminal: boolean;
};
type ViewCache = {
  contractId: string;
  stablePrefix: AgentView['stablePrefix'];
  ordersKey: string;
  boundary: Boundary;
  lastLoggedWave: number;
  appendLog: AgentWaveLogEntry[];
};

const DEFAULT_NODE_ANCHORS = [
  { x: -22, z: -6.8 },
  { x: -9, z: 6.7 },
  { x: -1.5, z: -6.4 },
  { x: 7.5, z: 6.5 },
  { x: 18, z: -7 },
  { x: 25, z: 6.9 },
];
const VIEW_CACHE = new WeakMap<object, ViewCache>();

declare module './AgentStub' {
  interface AgentStub {
    readonly view: AgentView;
  }
}

export function buildView(source: AgentViewSource): AgentView {
  const diagnostics = record(source.diagnostics?.() ?? globalThis.window?.__THREE_GAME_DIAGNOSTICS__);
  const economyLog = (source.economyLog?.() ?? []) as readonly EconomyEvent[];
  const manifest = activeContract();
  const contract = record(diagnostics.contract);
  const contractId = text(contract.activeId) ?? manifest.id;
  const standingOrders = record(source.standingOrders?.());
  const boundary = readBoundary(diagnostics, standingOrders);
  const orders = readOrders(diagnostics, standingOrders);
  const ordersKey = JSON.stringify(orders);
  let cache = VIEW_CACHE.get(source);

  if (
    !cache ||
    cache.contractId !== contractId ||
    boundary.wave < cache.boundary.wave ||
    boundary.runSeconds < cache.boundary.runSeconds
  ) {
    cache = {
      contractId,
      stablePrefix: buildStablePrefix(diagnostics, manifest, orders),
      ordersKey,
      boundary,
      lastLoggedWave: 0,
      appendLog: [],
    };
    VIEW_CACHE.set(source, cache);
  } else {
    if (ordersKey !== cache.ordersKey) {
      cache.stablePrefix = { ...cache.stablePrefix, orders };
      cache.ordersKey = ordersKey;
    }
    if (boundary.wave > cache.boundary.wave) {
      const gap = boundary.wave - cache.boundary.wave;
      if (cache.boundary.wave > 0) {
        if (gap === 1) {
          cache.appendLog.push(waveEntry(cache.boundary, boundary));
        } else {
          for (let wave = cache.boundary.wave; wave < boundary.wave; wave += 1) {
            cache.appendLog.push(unobservedWaveEntry(wave));
          }
        }
        cache.lastLoggedWave = boundary.wave - 1;
      }
      cache.boundary = boundary;
    }
    if (boundary.terminal && boundary.wave > cache.lastLoggedWave) {
      cache.appendLog.push(waveEntry(cache.boundary, boundary));
      cache.lastLoggedWave = boundary.wave;
      cache.boundary = boundary;
    }
  }

  return structuredClone({
    schema: 'goldrush.view.v1',
    viewVersion: engineEra.viewSchema.version,
    stablePrefix: cache.stablePrefix,
    appendLog: cache.appendLog,
    now: buildNow(diagnostics, economyLog, orders, standingOrders, boundary),
    almanac: buildAlmanac(diagnostics, manifest, boundary),
  } satisfies AgentView);
}

function buildStablePrefix(
  diagnostics: Record<string, unknown>,
  manifest: ContractManifest,
  orders: readonly unknown[],
): AgentView['stablePrefix'] {
  const contract = record(diagnostics.contract);
  const tile = record(contract.tileParams);
  const briefing = record(contract.briefing);
  const stake = manifest.tileParams.stakeMarkers?.find((marker) => marker.heroStart);
  const roster = manifest.id === (text(contract.activeId) ?? manifest.id) ? manifest.twist.enemyRoster ?? [] : [];
  const gates = roster.flatMap((entry) => entry.spawnGates ?? []);
  const spawnEdges = strings(record(tile.lanes).spawnEdges);
  const authoredNodeAnchors = records(tile.harvestAnchors);
  const contractId = text(contract.activeId) ?? manifest.id;

  return {
    seed: readSeed(),
    ...(manifest.twist.preserve ? { objective: 'preserve' as const } : {}),
    contract: {
      id: contractId,
      name: text(contract.name) ?? manifest.name,
      briefing: {
        geography: text(briefing.geographyLine) ?? manifest.briefing.geographyLine,
        goals: strings(briefing.goals),
        rules: strings(briefing.rules),
      },
    },
    mechanics: deriveMechanicsManifest(manifest),
    map: {
      claim: {
        x: round(stake?.x ?? 0),
        z: round(stake?.z ?? 12),
      },
      seams: (authoredNodeAnchors.length > 0 ? authoredNodeAnchors : DEFAULT_NODE_ANCHORS).map((position, index) => ({
        id: `gold-seam-${index + 1}`,
        x: round(number(position.x)),
        z: round(number(position.z)),
      })),
      coalSeams: (manifest.twist.pressureEnabled === true
        ? manifest.twist.coalSeams?.length ? manifest.twist.coalSeams : DEFAULT_COAL_SEAMS
        : []).map((position, index) => ({
        id: `coal-seam-${index + 1}`,
        x: round(position.x),
        z: round(position.z),
      })),
      water: {
        river: tile.river === true,
        ford: tile.ford === true,
        sources: records(tile.waterSources).length,
        descriptor: text(record(tile.water).id),
      },
      spawnGates:
        gates.length > 0
          ? gates.map((gate) => ({ edge: gate.edge, x: round(gate.x), z: round(gate.z) }))
          : spawnEdges.map((edge) => ({ edge })),
    },
    orders,
  };
}

/**
 * ADR-005 stage 3 item 8 — THE CONFIRM KEY'S OWN MENU, published so a rider learns it the way a
 * player does: by seeing what is offered, not by pressing and being refused.
 *
 * `Game.confirmAction` reaches four world interactions no verb named until this slice — the drill
 * yard's faucet and bell, the assay office's bench, the E10 Static's kept meanings and the Old
 * Digger's deck. This row names which of the four THIS ENGINE composes and, where the consumer
 * already reports it, where they stand. Additive and contract-scoped, exactly like `preserve`,
 * `gravity` and `air`: absent entirely where none of the four is composed, which is every GR-SIM
 * contract today (the headless door composes no drill yard, no bench and neither E10 boss, and its
 * CONTEXT_ACTION handler says so in the refusal).
 *
 * MEASURED GAP, published rather than hidden: the E10 Static's own diagnostics carry no site
 * COORDINATES (`E10StaticBossDiagnostics.sites` is id/kind/verb/meaning/held/protectedFor/
 * interactions), so `preserve` names the sites and their verbs but cannot say where they are. A
 * rider walks to them the way a player does — the sites are authored props on one map. Giving them
 * coordinates means editing that system, which is outside this slice's firewall.
 */
function readContextPress(diagnostics: Record<string, unknown>): AgentView['now']['contextPress'] {
  const yard = record(diagnostics.drillYard);
  const faucet = record(yard.faucet);
  const bell = record(yard.bell);
  const stations: { id: 'faucet' | 'bell'; x: number; z: number }[] = [];
  if (typeof faucet.x === 'number' && typeof faucet.z === 'number') stations.push({ id: 'faucet', x: round(faucet.x), z: round(faucet.z) });
  if (typeof bell.x === 'number' && typeof bell.z === 'number') stations.push({ id: 'bell', x: round(bell.x), z: round(bell.z) });

  const staticBoss = record(diagnostics.e10Static);
  const sites = Array.isArray(staticBoss.sites)
    ? staticBoss.sites.flatMap((entry) => {
        const site = record(entry);
        const id = text(site.id);
        const verb = text(site.verb);
        return id && verb ? [{ id, verb, held: site.held === true }] : [];
      })
    : [];
  const preserveSites = staticBoss.enabled === true ? sites : [];

  const digger = record(diagnostics.oldDiggerBoss);
  const diggerAt = record(digger.position);
  const diggerRow = digger.active === true && typeof diggerAt.x === 'number' && typeof diggerAt.z === 'number'
    ? { x: round(diggerAt.x), z: round(diggerAt.z), boarded: digger.boarded === true }
    : null;

  const assay = diagnostics.assayBenchInReach === true;
  if (stations.length === 0 && preserveSites.length === 0 && diggerRow === null && !assay) return undefined;
  return { drill: stations, assay, preserve: preserveSites, digger: diggerRow };
}

function buildNow(
  diagnostics: Record<string, unknown>,
  economyLog: readonly EconomyEvent[],
  orders: readonly unknown[],
  standingOrders: Record<string, unknown>,
  boundary: Boundary,
): AgentView['now'] {
  const hero = point(diagnostics.heroPos);
  const prospectorPosition = record(record(record(diagnostics.agent).embodiment).position);
  const prospector =
    typeof prospectorPosition.x === 'number' && Number.isFinite(prospectorPosition.x) &&
    typeof prospectorPosition.z === 'number' && Number.isFinite(prospectorPosition.z)
      ? { x: round(prospectorPosition.x), z: round(prospectorPosition.z) }
      : null;
  const steal = record(diagnostics.steal);
  const wreck = record(diagnostics.wreck);
  const run = record(diagnostics.run);
  const megaproject = record(diagnostics.megaproject);
  const site = record(megaproject.siteFootprint);
  const pendingSecure = run.pendingSecure === true ? true : undefined;
  const preserve = record(diagnostics.preserve);
  const preserveState = typeof preserve.hp === 'number'
    && Number.isFinite(preserve.hp)
    && typeof preserve.maxHp === 'number'
    && Number.isFinite(preserve.maxHp)
    && typeof preserve.alive === 'boolean'
    ? { hp: round(preserve.hp), maxHp: round(preserve.maxHp), alive: preserve.alive }
    : undefined;
  const project = megaproject.active === true && megaproject.unlocked === true && text(megaproject.id) &&
    ['x', 'z', 'w', 'd'].every((key) => typeof site[key] === 'number' && Number.isFinite(site[key]))
    ? {
        id: text(megaproject.id)!,
        stage: integer(megaproject.stage),
        funded: megaproject.funded === true,
        cost: integer(record(megaproject.materials).gold),
        site: { x: number(site.x), z: number(site.z), w: number(site.w), d: number(site.d) },
      }
    : undefined;
  const gravity = readGravity(record(diagnostics.e8Physics));
  const pressure = readPressure(record(diagnostics.pressure), record(diagnostics.economy));
  const air = readAir(record(diagnostics.e8Atmosphere));
  const emberShore = readEmberShore(record(diagnostics.preserveVent));
  const contextPress = readContextPress(diagnostics);
  return {
    wave: boundary.wave,
    blastReadyInMs: Math.max(0, Math.round(number(diagnostics.blastReadyInMs))),
    weapon: readWeapon(diagnostics),
    ...(pendingSecure ? { pendingSecure } : {}),
    ...(project ? { megaproject: project } : {}),
    ...(preserveState ? { preserve: preserveState } : {}),
    ...(gravity ? { gravity } : {}),
    ...(pressure ? { pressure } : {}),
    ...(air ? { air } : {}),
    ...(emberShore ? { emberShore } : {}),
    ...(contextPress ? { contextPress } : {}),
    timers: {
      runSeconds: round(boundary.runSeconds),
      nextWaveInSeconds: round(number(diagnostics.nextWaveInSim)),
    },
    gold: boundary.gold,
    hero: {
      hp: boundary.heroHp,
      maxHp: number(diagnostics.maxHp),
      x: round(hero.x),
      z: round(hero.z),
    },
    prospector,
    works: boundary.works,
    threats: {
      alive: integer(diagnostics.enemiesAlive),
      state: text(diagnostics.waveState) ?? 'quiet',
      edge: text(diagnostics.edge),
      thieves: integer(steal.thieves),
      wreckers: integer(wreck.wreckers),
    },
    orders,
    needsRider: readNeedsRider(diagnostics, standingOrders),
    seams: records(record(diagnostics.harvest).activeNodes).map((node) => {
      const position = record(node.position);
      const anchorIndex = number(node.anchorIndex, -1);
      const active = node.active === true && anchorIndex !== -1;
      return {
        id: text(node.id) ?? 'seam',
        active,
        remaining: round(number(node.remaining)),
        x: active ? round(number(position.x)) : null,
        z: active ? round(number(position.z)) : null,
        anchorIndex: active ? anchorIndex : null,
      };
    }),
    score: summarizeRun(economyLog, boundary.wave),
  };
}

/** `E8PhysicsSystem.diagnostics`, both engines: present on the view only while `active`. */
function readGravity(physics: Record<string, unknown>): AgentGravityView | undefined {
  if (physics.active !== true) return undefined;
  const source = physics.source === 'zero-gravity' ? 'zero-gravity' : 'gravity';
  const movement = physics.movement === 'free-fall' ? 'free-fall' : physics.movement === 'floaty' ? 'floaty' : 'normal';
  return {
    source,
    movement,
    feelG: number(physics.feelG, 1),
    lobArcDistanceMultiplier: number(physics.lobArcDistanceMultiplier, 1),
    lobAirTimeMultiplier: number(physics.lobAirTimeMultiplier, 1),
    knockbackScale: number(physics.knockbackScale, 1),
    orbitalReturn: physics.orbitalReturn === true,
    vacuum: physics.vacuum === true,
  };
}

/**
 * `E10PreserveSystem.diagnostics`: present on the view only while the consumer is declared, i.e.
 * only on the Ember Shore. Read FIELD BY FIELD rather than passed through, which is `readAir`'s
 * own discipline: the browser hands this builder a diagnostics blob, and a rider's view should
 * never be able to carry whatever a render-side bug happened to put in it.
 */
function readEmberShore(preserve: Record<string, unknown>): { preserve: E10PreserveDiagnostics } | undefined {
  if (preserve.declared !== true) return undefined;
  const stoke = record(preserve.stoke);
  const refused = record(stoke.refusals);
  const pressure = record(preserve.motePressure);
  const at = preserve.position === null ? null : point(preserve.position);
  const guttered = preserve.guttered === true;
  return {
    preserve: {
      declared: true,
      stakeId: text(preserve.stakeId),
      position: at,
      warmth: number(preserve.warmth),
      maxWarmth: number(preserve.maxWarmth),
      alight: preserve.alight === true,
      guttered,
      gutteredAtSeconds: guttered ? number(preserve.gutteredAtSeconds) : null,
      decayPerSecond: number(preserve.decayPerSecond),
      decaying: preserve.decaying === true,
      warmthLost: number(preserve.warmthLost),
      warmthRestored: number(preserve.warmthRestored),
      stoke: {
        action: 'STOKE',
        goldCost: integer(stoke.goldCost),
        warmthRestore: number(stoke.warmthRestore),
        radius: number(stoke.radius),
        uses: integer(stoke.uses),
        refusals: {
          undeclared: integer(refused.undeclared),
          guttered: integer(refused.guttered),
          'out-of-reach': integer(refused['out-of-reach']),
          'insufficient-gold': integer(refused['insufficient-gold']),
          'already-warm': integer(refused['already-warm']),
        },
        lastRefusal: (text(stoke.lastRefusal) as PreserveStokeRefusal | null),
      },
      squallsSurvived: integer(preserve.squallsSurvived),
      squallsRequired: integer(preserve.squallsRequired),
      motePressure: {
        multiplier: number(pressure.multiplier, 1),
        active: pressure.active === true,
        pressShare: number(pressure.pressShare),
      },
      objectiveMet: preserve.objectiveMet === true,
    },
  };
}

/**
 * `PressureSystem.diagnostics`, both engines: present on the view only where the contract declares
 * `twist.pressureEnabled` and the consumer is live — which is exactly where the human's HUD gauge
 * appears, because `enabled` is the SAME predicate `Game.activeResourceSnapshots` filters the
 * gauge on (`Game.ts:7412`). F-HEAT14-3, owner-ruled 2026-09-19.
 *
 * The needle and its ceiling come from the economy rather than from `PressureDiagnostics`, which
 * does not carry them, and they are floored here the way the HUD floors them so the rider's number
 * and the human's number are the same integer. `Balance` supplies only `coalSeconds`, the same
 * constant `stablePrefix.mechanics.rules.pressure_generation` already publishes.
 */
function readPressure(pressure: Record<string, unknown>, economy: Record<string, unknown>): AgentPressureView | undefined {
  if (pressure.enabled !== true) return undefined;
  const balance = record(record(economy.resources).pressure);
  const stored = Math.floor(number(balance.amount));
  const band = record(pressure.safeBand);
  const objective = record(pressure.objective);
  const boilers = records(pressure.boilers);
  const coal = integer(pressure.coal);
  return {
    stored,
    cap: Math.floor(number(balance.cap)),
    band:
      stored <= 0 ? 'empty'
      : stored < Balance.boilerHouse.safeMin ? 'low'
      : stored <= Balance.boilerHouse.safeMax ? 'working'
      : 'high',
    safeBand:
      typeof band.min === 'number' && Number.isFinite(band.min) && typeof band.max === 'number' && Number.isFinite(band.max)
        ? { min: number(band.min), max: number(band.max) }
        : null,
    coal,
    coalSeconds: round(coal * Balance.boilerHouse.coalSeconds),
    boilers: {
      built: boilers.filter((boiler) => boiler.active === true).length,
      hot: boilers.filter((boiler) => boiler.hot === true).length,
      cooling: boilers.filter((boiler) => boiler.cooling === true).length,
      max: Balance.boilerHouse.maxCount,
    },
    vents: integer(pressure.vents),
    objective: {
      active: objective.active === true,
      failed: objective.failed === true,
      complete: objective.complete === true,
      hotBoilers: integer(objective.hotBoilers),
      waves: text(objective.waves) ?? '',
    },
    seams: records(pressure.seams).map((seam, index) => ({
      id: `coal-seam-${index + 1}`,
      x: round(number(seam.x)),
      z: round(number(seam.z)),
      harvested: seam.harvested === true,
      progress: round(number(seam.progress)),
      marked: seam.marked === true,
    })),
  };
}

/** `E8AtmosphereSystem.diagnostics`: present on the view only while the consumer is declared. */
function readAir(atmosphere: Record<string, unknown>): AgentAirView | undefined {
  if (atmosphere.declared !== true) return undefined;
  const suit = record(atmosphere.suit);
  const regolith = record(atmosphere.regolith);
  const wall = atmosphere.wall === 'suit-timer' || atmosphere.wall === 'suit-only' ? atmosphere.wall : null;
  const crossing = readCrossing(atmosphere);
  const eclipse = readEclipse(atmosphere);
  return {
    wall,
    suit: {
      // THE HUMAN'S DIAL since 2026-09-07 (owner directive; `E8HumanSuit`). The body a rider steers
      // with `MOVE_HERO` is the one that breathes on these maps, so `body` reads 'hero' and there
      // is no second dial: the Prospector is a made agent and its old suit is gone rather than
      // renamed, which is the only way a rider cannot read the wrong one.
      body: 'hero',
      seconds: number(suit.seconds),
      capacity: number(suit.capacity),
      refillPerSecond: number(suit.refillPerSecond),
      // Null where the contract authors no harm, which is the pre-directive behaviour and the
      // default a contract that authors nothing still gets. A rider that reads a number here knows
      // an empty suit costs hp; a rider that reads null knows it does not.
      harmPerSecond: Number.isInteger(suit.harmPerSecond) ? (suit.harmPerSecond as number) : null,
      inDome: text(suit.inDome),
      empty: suit.empty === true,
      drainedTotal: number(suit.drainedTotal),
      emptySeconds: number(suit.emptySeconds),
      harmDealt: number(suit.harmDealt),
      harmTicks: integer(suit.harmTicks),
    },
    domes: records(atmosphere.domes).map((dome) => ({
      id: text(dome.id) ?? 'dome',
      air: number(dome.air),
      breached: dome.breached === true,
      breaches: integer(dome.breaches),
      siegers: integer(dome.siegers),
    })),
    regolith: {
      grounds: integer(regolith.grounds),
      required: integer(regolith.required),
      worked: Array.isArray(regolith.worked) ? regolith.worked.filter((entry): entry is number => Number.isInteger(entry)) : [],
      runsOnAir: integer(regolith.runsOnAir),
      breathlessPans: integer(regolith.breathlessPans),
      complete: regolith.complete === true,
      // Always present, on all four E8 maps: a consumer that emits no window publishes the absence
      // as `null` rather than dropping the field, so `now.air` stays ONE shape a rider can read.
      windowWaves: Number.isInteger(regolith.windowWaves) ? (regolith.windowWaves as number) : null,
      window: integer(regolith.window),
      creditedThisWindow: integer(regolith.creditedThisWindow),
      windowHeldPans: integer(regolith.windowHeldPans),
    },
    ...(crossing ? { crossing } : {}),
    ...(eclipse ? { eclipse } : {}),
  };
}

/**
 * `E8SuitAirSystem.diagnostics.crossing`: present only where the contract authors crossing zones
 * (the Far Side's probe crater, Low Orbit's scaffold decks). Absent everywhere else, so no other
 * map's air row grows a field.
 */
function readCrossing(air: Record<string, unknown>): E8CrossingAirDiagnostics | undefined {
  if (!('crossing' in air)) return undefined;
  const crossing = record(air.crossing);
  return {
    zones: strings(crossing.zones),
    required: integer(crossing.required),
    reached: strings(crossing.reached),
    credited: integer(crossing.credited),
    breathlessEntries: integer(crossing.breathlessEntries),
    // The window, read FIELD BY FIELD like the regolith row above and for the same reason: a
    // consumer that authors no window publishes the absence as `null` rather than dropping the
    // field, so `now.air.crossing` stays ONE shape a rider can read on either crossing map.
    windowWaves: Number.isInteger(crossing.windowWaves) ? (crossing.windowWaves as number) : null,
    window: integer(crossing.window),
    creditedThisWindow: integer(crossing.creditedThisWindow),
    windowHeldEntries: integer(crossing.windowHeldEntries),
    complete: crossing.complete === true,
  };
}

/** `E8SuitAirSystem.diagnostics.eclipse`: the Eclipse alone, and only once the shadow is scheduled. */
function readEclipse(air: Record<string, unknown>): E8EclipseAirDiagnostics | undefined {
  if (!('eclipse' in air)) return undefined;
  const eclipse = record(air.eclipse);
  const arrivedAtWave = eclipse.arrivedAtWave;
  return {
    arrived: eclipse.arrived === true,
    arrivedAtWave: typeof arrivedAtWave === 'number' && Number.isFinite(arrivedAtWave) ? arrivedAtWave : null,
    offline: strings(eclipse.offline),
    reserve: text(eclipse.reserve),
    solar: eclipse.solar === 'offline' ? 'offline' : 'online',
    groundsWorkedAfter: integer(eclipse.groundsWorkedAfter),
    requiredAfter: integer(eclipse.requiredAfter),
  };
}

function readWeapon(diagnostics: Record<string, unknown>): 'rig' | 'blast' {
  if (diagnostics.weapon === 'rig' || diagnostics.weapon === 'blast') return diagnostics.weapon;
  const arsenal = record(diagnostics.arsenal).active;
  if (arsenal === 'rig' || arsenal === 'blast') return arsenal;
  const actor = records(diagnostics.actors).find((entry) => entry.local === true);
  return actor?.weapon === 'blast' ? 'blast' : 'rig';
}

function buildAlmanac(
  diagnostics: Record<string, unknown>,
  manifest: ContractManifest,
  boundary: Boundary,
): AgentView['almanac'] {
  const nextWave = boundary.wave + 1;
  const waveCount = scheduledWaveCount(nextWave, manifest);
  const roster = eligibleRoster(manifest, nextWave);
  const composition = scheduledComposition(waveCount, roster, manifest);
  const baron = manifest.twist.baron;
  if (baron?.wave === nextWave) {
    const escorts = Math.max(0, Math.floor(baron.escortCount));
    if (escorts > 0) composition.push({ id: 'baron_escort', label: 'Baron Escorts', count: escorts });
    composition.push({
      id: baron.variantId ?? 'baron',
      label: baron.variantLabel ?? 'The Baron',
      count: Math.max(1, baron.components?.length ?? 1),
    });
  }

  const progression = record(record(diagnostics.progression).stats);
  const statRun = runStatSimHarness(
    {
      id: 'almanac-current-loadout',
      name: 'Current loadout',
      blurb: 'The rider as equipped now.',
      kind: 'tool',
      rarity: 'common',
      cost: 0,
      stats: {
        damageMult: number(progression.damageMult, 1) - 1,
        fireRateMult: number(progression.fireRateMult, 1) - 1,
        rangeMult: number(progression.rangeMult, 1) - 1,
        moveSpeedMult: number(progression.moveSpeedMult, 1) - 1,
        panTickMult: number(progression.panTickMult, 1) - 1,
        maxHpBonus: number(progression.maxHpBonus),
      },
    },
    { seed: `${readSeed()}:almanac:${nextWave}` },
  );
  const build = record(diagnostics.build);
  const standingWorks = records(build.hp).filter((entry) => entry.wrecked !== true && number(entry.hp) > 0);
  const worksDps = standingWorks.reduce(
    (sum, entry) =>
      sum +
      (entry.id === 'sentry_beacon'
        ? (Balance.beacon.damage + Balance.beacon.damagePerWave * nextWave) *
          Balance.beacon.fireRate *
          number(progression.beaconFireRateMult, 1)
        : number(entry.effectiveDamage) * number(entry.effectiveFireRate)),
    0,
  );
  const cadence = Math.max(0.1, manifest.twist.waveCadenceMult ?? 1);
  const windowSeconds = Math.max(0.1, Balance.waves.waveInterval / cadence);
  const totalEnemies = composition.reduce((sum, entry) => sum + entry.count, 0);
  const totalEnemyHp = estimatedEnemyHp(composition, roster, manifest, nextWave);
  const enemyHp = totalEnemyHp / Math.max(1, totalEnemies);
  const stopped = Math.min(totalEnemies, Math.floor(((statRun.measured.dps + worksDps) * windowSeconds) / enemyHp));
  const leaks = Math.max(0, totalEnemies - stopped);
  const sluiceGoldRate = standingWorks.reduce((sum, entry) => {
    if (entry.id !== 'sluice') return sum;
    return sum + number(entry.yieldPerCycle) * number(entry.panRateMult, 1) / Balance.sluice.cycleSeconds;
  }, 0);

  return {
    label: 'the Almanac reckons',
    estimate: true,
    nextWave: {
      wave: nextWave,
      arrivalInSeconds: round(number(diagnostics.nextWaveInSim)),
      basis: 'estimated-from-wave-schedule',
      composition,
    },
    projection: {
      expectedLeaks: leaks,
      expectedWorksDamage: round(Math.min(boundary.works.hp, leaks * Balance.enemy.contactDamage)),
      expectedGold: round(Math.max(0, (statRun.measured.goldRate + sluiceGoldRate) * windowSeconds)),
      currentWorks: boundary.works.standing,
      harnessHash: statRun.hash,
    },
  };
}

function readBoundary(
  diagnostics: Record<string, unknown>,
  standingOrders: Record<string, unknown>,
): Boundary {
  const runState = text(diagnostics.runState);
  const run = record(diagnostics.run);
  const endedReason = text(run.lastRunEndedReason);
  return {
    wave: integer(diagnostics.wave),
    runSeconds: number(diagnostics.timeAlive),
    gold: number(record(diagnostics.economy).gold),
    heroHp: number(diagnostics.hp),
    kills: integer(diagnostics.kills),
    works: readWorks(diagnostics),
    surprises: readSurprises(diagnostics, standingOrders),
    endReason: endedReason,
    terminal: runState === 'dead' || endedReason !== null || number(diagnostics.hp) <= 0,
  };
}

function readWorks(diagnostics: Record<string, unknown>): Works {
  const hp = records(record(diagnostics.build).hp);
  const byKind: Record<string, number> = {};
  let current = 0;
  let max = 0;
  let standing = 0;
  let wrecked = 0;
  for (const entry of hp) {
    const id = text(entry.id) ?? 'works';
    byKind[id] = (byKind[id] ?? 0) + 1;
    current += number(entry.hp);
    max += number(entry.maxHp);
    if (entry.wrecked === true || number(entry.hp) <= 0) wrecked += 1;
    else standing += 1;
  }
  return {
    hp: round(current),
    maxHp: round(max),
    standing,
    wrecked,
    byKind,
    entries: hp.map((entry) => ({
      id: text(entry.id) ?? 'works',
      index: integer(entry.index),
      tier: integer(entry.tier),
      hp: round(number(entry.hp)),
      maxHp: round(number(entry.maxHp)),
      wrecked: entry.wrecked === true,
      position: point(entry.position),
    })),
  };
}

function waveEntry(before: Boundary, after: Boundary): AgentWaveLogEntry {
  const worksDelta = round(after.works.hp - before.works.hp);
  return {
    wave: before.wave,
    outcome:
      after.endReason === 'secured'
        ? 'secured'
        : after.endReason === 'rush' || after.endReason === 'death' || after.heroHp <= 0
        ? 'rider-down'
        : before.works.maxHp > 0 && after.works.hp <= 0
          ? 'works-lost'
          : worksDelta < 0
            ? 'works-damaged'
            : 'held',
    goldDelta: round(after.gold - before.gold),
    worksHp: { current: after.works.hp, max: after.works.maxHp, delta: worksDelta },
    kills: Math.max(0, after.kills - before.kills),
    surprises: after.surprises.slice(before.surprises.length),
  };
}

function unobservedWaveEntry(wave: number): AgentWaveLogEntry {
  return {
    wave,
    outcome: 'unobserved',
    goldDelta: null,
    worksHp: null,
    kills: null,
    surprises: [],
  };
}

function scheduledWaveCount(wave: number, manifest: ContractManifest): number {
  const linear = Balance.waves.pulseBase + Balance.waves.pulsePerWave * wave;
  const knee = Math.max(0, Balance.waves.kneeWave);
  const budget =
    wave <= knee
      ? linear
      : Math.min(
          Balance.waves.budgetCeiling,
          Balance.waves.budgetCeiling -
            (Balance.waves.budgetCeiling - (Balance.waves.pulseBase + Balance.waves.pulsePerWave * knee)) *
              Math.exp(
                -Math.max(0, linear - (Balance.waves.pulseBase + Balance.waves.pulsePerWave * knee)) /
                  Math.max(0.01, Balance.waves.kneeSharpness),
              ),
        );
  const edges = Math.max(1, Math.min(manifest.tileParams.lanes.spawnEdges.length, Math.floor(Balance.waves.edgesPerPulse)));
  return Math.max(Math.floor(Balance.waves.pulsesPerWave) * edges, Math.round(budget));
}

function eligibleRoster(manifest: ContractManifest, wave: number): readonly ContractEnemyVariant[] {
  return (manifest.twist.enemyRoster ?? []).filter((entry) => wave >= (entry.waveMin ?? 1));
}

function scheduledComposition(
  count: number,
  roster: readonly ContractEnemyVariant[],
  manifest: ContractManifest,
): Array<{ id: string; label: string; count: number }> {
  if (roster.length === 0) return [{ id: 'claim_jumper', label: 'Claim Jumpers', count }];
  const weights = new Map<string, number>();
  for (const edge of manifest.tileParams.lanes.spawnEdges) {
    const edgeRoster = roster.filter((entry) => !entry.spawnEdges || entry.spawnEdges.includes(edge));
    const candidates = edgeRoster.length > 0 ? edgeRoster : roster;
    for (const entry of candidates) weights.set(entry.id, (weights.get(entry.id) ?? 0) + 1 / candidates.length);
  }
  const totalWeight = [...weights.values()].reduce((sum, weight) => sum + weight, 0);
  const variants = [...new Map(roster.map((entry) => [entry.id, entry])).values()];
  const rows = variants.map((entry) => {
    const exact = totalWeight > 0 ? count * (weights.get(entry.id) ?? 0) / totalWeight : 0;
    return { entry, exact, count: Math.floor(exact) };
  });
  let extra = count - rows.reduce((sum, row) => sum + row.count, 0);
  rows.sort((a, b) => (b.exact - b.count) - (a.exact - a.count));
  for (const row of rows) {
    if (extra-- <= 0) break;
    row.count += 1;
  }
  return rows
    .filter((row) => row.count > 0)
    .map(({ entry, count: entryCount }) => ({ id: entry.id, label: entry.label, count: entryCount }));
}

function estimatedEnemyHp(
  composition: readonly { id: string; count: number }[],
  roster: readonly ContractEnemyVariant[],
  manifest: ContractManifest,
  wave: number,
): number {
  const baseHp = Balance.enemy.hp * Math.pow(Balance.waves.hpScalePerWave, wave);
  const baron = manifest.twist.baron?.wave === wave ? manifest.twist.baron : undefined;
  return composition.reduce((sum, row) => {
    if (row.id === 'baron_escort') {
      const averageScale =
        roster.length > 0 ? roster.reduce((total, entry) => total + (entry.hpScale ?? 1), 0) / roster.length : 1;
      return sum + row.count * baseHp * averageScale;
    }
    if (baron && row.id === (baron.variantId ?? 'baron')) {
      const components = baron.components ?? [];
      if (components.length > 0) {
        return sum + components.reduce((total, component) => {
          const exact =
            baron.variantId === 'homemaker_9000'
              ? number((Balance.homemaker.componentHp as Record<string, number>)[component.id])
              : 0;
          return total + (exact || baseHp * baron.hpScale * component.hpScale);
        }, 0);
      }
      return sum + baseHp * baron.hpScale;
    }
    const variant = roster.find((entry) => entry.id === row.id);
    return sum + row.count * baseHp * (variant?.hpScale ?? 1);
  }, 0);
}

function readOrders(
  diagnostics: Record<string, unknown>,
  standingOrders: Record<string, unknown>,
): readonly unknown[] {
  const agent = record(diagnostics.agent);
  const embodiment = record(agent.embodiment);
  for (const value of [standingOrders.orders, agent.orders, embodiment.orders, embodiment.standingOrders, diagnostics.orders]) {
    if (Array.isArray(value)) return structuredClone(value);
  }
  return [];
}

function readNeedsRider(
  diagnostics: Record<string, unknown>,
  standingOrders: Record<string, unknown>,
): boolean {
  const agent = record(diagnostics.agent);
  const embodiment = record(agent.embodiment);
  return (
    standingOrders.needsRider === true ||
    agent.needsRider === true ||
    embodiment.needsRider === true ||
    diagnostics.needsRider === true
  );
}

function readSurprises(
  diagnostics: Record<string, unknown>,
  standingOrders: Record<string, unknown>,
): readonly string[] {
  const agent = record(diagnostics.agent);
  const embodiment = record(agent.embodiment);
  const orderSurprises = records(standingOrders.log)
    .filter((entry) => entry.type === 'surprise')
    .map((entry) => text(entry.surprise) ?? text(entry.reason) ?? 'surprise');
  const value = agent.surprises ?? embodiment.surprises ?? diagnostics.surprises ?? orderSurprises;
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    if (typeof entry === 'string') return entry;
    const item = record(entry);
    return text(item.reason) ?? text(item.message) ?? text(item.type) ?? 'surprise';
  });
}

function readSeed(): string {
  if (typeof window === 'undefined') return 'gold-rush';
  return new URLSearchParams(window.location.search).get('seed') ?? 'gold-rush';
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(record) : [];
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function integer(value: unknown): number {
  return Math.max(0, Math.floor(number(value)));
}

function point(value: unknown): { x: number; z: number } {
  const item = record(value);
  return { x: number(item.x), z: number(item.z) };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
