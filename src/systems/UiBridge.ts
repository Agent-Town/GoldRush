import { Balance } from '../game/Balance';
import type { BuildableId } from '../game/buildables';
import type { CompassEdge } from '../entities/Enemy';
import type { GameState, RunState } from '../game/GameState';
import type { AgentConsentSnapshot } from '../agent/AgentConsent';
import type { AgentCapability, GoldRushToolName } from '../agent/ToolSurface';

export type WaveState = 'quiet' | 'warning' | 'active' | 'cleared';
export type AnnouncementKind = 'wave' | 'baron' | 'baron-defeat';

export type UiSnapshot = {
  hp: number;
  maxHp: number;
  gold: number;
  bankCap: number;
  resources: Array<{
    id: string;
    name: string;
    amount: number;
    cap: number;
    iconSlot: string;
    ledgerBlurb: string;
  }>;
  xp: number;
  xpNeed: number;
  level: number;
  wave: number;
  waveState: WaveState;
  announcement: string | null;
  announcementAt: number;
  announcementDurationSeconds: number;
  announcementEdge: CompassEdge | null;
  announcementKind: AnnouncementKind;
  announcementTitle: string | null;
  enemiesAlive: number;
  timeAlive: number;
  state: RunState;
  paused: boolean;
  buildMode: boolean;
  buildMenuOpen: boolean;
  selectedBuildable: BuildableId;
  buildables: Array<{
    id: BuildableId;
    displayName: string;
    blurb?: string;
    cost: number;
    count: number;
    maxCount: number;
    canAfford: boolean;
    selected: boolean;
    iconSlot: `ui.build.icon.${BuildableId}`;
    portraitSlug?: string;
    tierLine?: string;
  }>;
  stockpileCount: number;
  beaconCount: number;
  beaconMax: number;
  nextBeaconCost: number;
  canAffordBeacon: boolean;
  weapon: 'rig' | 'blast';
  agent: {
    name: string;
    permissionLevel: number;
    permissionLabel: string;
    capabilities: readonly AgentCapability[];
    lastActionAt: Partial<Record<GoldRushToolName, number>>;
    autonomyTrack: number;
    policySlotBonus: number;
    receiptFeed: readonly string[];
    consent: AgentConsentSnapshot;
  } | null;
};

export class UiBridge {
  private readonly snapshot: UiSnapshot = {
    hp: 100,
    maxHp: 100,
    gold: 0,
    bankCap: Balance.economy.bankCap,
    resources: [],
    xp: 0,
    xpNeed: Balance.xp.needBase,
    level: 1,
    wave: 0,
    waveState: 'quiet',
    announcement: 'Stake your claim.',
    announcementAt: 0,
    announcementDurationSeconds: 4,
    announcementEdge: null,
    announcementKind: 'wave',
    announcementTitle: null,
    enemiesAlive: 0,
    timeAlive: 0,
    state: 'boot',
    paused: false,
    buildMode: false,
    buildMenuOpen: false,
    selectedBuildable: 'sentry_beacon',
    buildables: [],
    stockpileCount: 0,
    beaconCount: 0,
    beaconMax: Balance.beacon.maxCount,
    nextBeaconCost: Balance.beacon.costBase,
    canAffordBeacon: false,
    weapon: 'rig',
    agent: null,
  };

  announce(
    text: string,
    atSim: number,
    edge: CompassEdge | null = null,
    durationSeconds = 4,
    kind: AnnouncementKind = 'wave',
    title: string | null = null,
  ): void {
    this.snapshot.announcement = text;
    this.snapshot.announcementAt = atSim;
    this.snapshot.announcementDurationSeconds = durationSeconds;
    this.snapshot.announcementEdge = edge;
    this.snapshot.announcementKind = kind;
    this.snapshot.announcementTitle = title;
  }

  build(
    state: GameState,
    timeAlive: number,
    hp: number,
    maxHp: number,
    enemiesAlive: number,
    gold: number,
    bankCap: number,
    resources: UiSnapshot['resources'],
    xp: number,
    xpNeed: number,
    level: number,
    wave: number,
    waveState: WaveState,
    buildMode: boolean,
    buildMenuOpen: boolean,
    selectedBuildable: BuildableId,
    buildables: UiSnapshot['buildables'],
    stockpileCount: number,
    beaconCount: number,
    beaconMax: number,
    nextBeaconCost: number,
    canAffordBeacon: boolean,
    weapon: 'rig' | 'blast',
    agent: UiSnapshot['agent'],
  ): UiSnapshot {
    this.snapshot.gold = gold;
    this.snapshot.bankCap = bankCap;
    this.snapshot.resources = resources;
    this.snapshot.xp = xp;
    this.snapshot.xpNeed = xpNeed;
    this.snapshot.level = level;
    this.snapshot.timeAlive = timeAlive;
    this.snapshot.state = state.current;
    this.snapshot.paused = state.isPaused;
    this.snapshot.hp = hp;
    this.snapshot.maxHp = maxHp;
    this.snapshot.enemiesAlive = enemiesAlive;
    this.snapshot.wave = wave;
    this.snapshot.waveState = waveState;
    this.snapshot.buildMode = buildMode;
    this.snapshot.buildMenuOpen = buildMenuOpen;
    this.snapshot.selectedBuildable = selectedBuildable;
    this.snapshot.buildables = buildables;
    this.snapshot.stockpileCount = stockpileCount;
    this.snapshot.beaconCount = beaconCount;
    this.snapshot.beaconMax = beaconMax;
    this.snapshot.nextBeaconCost = nextBeaconCost;
    this.snapshot.canAffordBeacon = canAffordBeacon;
    this.snapshot.weapon = weapon;
    this.snapshot.agent = agent;
    return this.snapshot;
  }
}
