import {
  install as installToolSurface,
  type AgentBuildingRef,
  type AgentCapability,
  type AgentGameAdapter,
  type AgentThiefRef,
  type AgentVec2,
  type GoldRushToolSurface,
  type ToolReceipt,
  type ToolSurfaceOptions,
} from './ToolSurface';
import { AGENT_PERMISSION_LABELS, type AgentPermissionLevel } from './PermissionLadder';
import type { BuildableId } from '../game/buildables';
import { AGENT_DISPLAY_NAME, feedLineForReceipt } from './Voice';

export type AgentStubOptions = ToolSurfaceOptions & {
  readonly tools?: GoldRushToolSurface;
  readonly debug?: boolean;
  readonly clock?: () => number;
};

export type AgentStubState = {
  name: string;
  permissionLevel: AgentPermissionLevel;
  permissionLabel: string;
  capabilities: readonly AgentCapability[];
  lastActionAt: Partial<Record<ToolReceipt['tool'], number>>;
  receiptCount: number;
  lastReceiptTool: ToolReceipt['tool'] | null;
  receiptFeed: readonly string[];
};

export type AgentReceiptListener = (receipt: ToolReceipt, state: AgentStubState) => void;

export class AgentStub {
  private readonly receipts: ToolReceipt[] = [];
  private readonly listeners = new Set<AgentReceiptListener>();
  private readonly debug: boolean;
  private readonly marker?: HTMLElement;
  private readonly receiptFeed: string[] = [];
  private readonly lastActionAt: Partial<Record<ToolReceipt['tool'], number>> = {};
  private receiptCount = 0;
  private lastReceiptTool: ToolReceipt['tool'] | null = null;

  constructor(private readonly surface: GoldRushToolSurface, options: AgentStubOptions = {}) {
    this.debug = options.debug ?? isDebugSearch();
    this.clock = options.clock;
    if (this.debug && typeof document !== 'undefined') {
      this.marker = document.createElement('div');
      this.marker.dataset.testid = 'agent-stub-marker';
      this.marker.hidden = true;
      document.body.append(this.marker);
    }
    if (this.debug && typeof window !== 'undefined') window.__GR_AGENT__ = this;
  }

  get log(): readonly ToolReceipt[] {
    return this.receipts.slice();
  }

  get state(): AgentStubState {
    const level = this.surface.permissionLevel();
    return {
      name: AGENT_DISPLAY_NAME,
      permissionLevel: level,
      permissionLabel: AGENT_PERMISSION_LABELS[level],
      capabilities: this.surface.capabilities,
      lastActionAt: { ...this.lastActionAt },
      receiptCount: this.receiptCount,
      lastReceiptTool: this.lastReceiptTool,
      receiptFeed: this.receiptFeed.slice(),
    };
  }

  subscribe(listener: AgentReceiptListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  heartbeat(): ToolReceipt<'et.goldrush.get_state', Record<string, never>> {
    const receipt = this.surface.tools.get_state();
    this.record(receipt);
    return receipt;
  }

  panAt(node: string): ToolReceipt<'et.goldrush.pan_at', { node: string }> {
    const receipt = this.surface.tools.pan_at(node);
    this.record(receipt);
    return receipt;
  }

  repair(building: AgentBuildingRef): ToolReceipt<'et.goldrush.repair', { building: AgentBuildingRef }> {
    const receipt = this.surface.tools.repair(building);
    this.record(receipt);
    return receipt;
  }

  chaseMark(thief: AgentThiefRef): ToolReceipt<'et.goldrush.chase_mark', { thief: AgentThiefRef }> {
    const receipt = this.surface.tools.chase_mark(thief);
    this.record(receipt);
    return receipt;
  }

  collectXp(): ToolReceipt<'et.goldrush.collect_xp', { minAgeS: number }> {
    const receipt = this.surface.tools.collect_xp();
    this.record(receipt);
    return receipt;
  }

  collectGold(): ToolReceipt<'et.goldrush.collect_gold', Record<string, never>> {
    const receipt = this.surface.tools.collect_gold();
    this.record(receipt);
    return receipt;
  }

  placeBuilding(
    def: BuildableId,
    pos: AgentVec2,
    rot = 0,
  ): ToolReceipt<'et.goldrush.place_building', { def: BuildableId; pos: AgentVec2; rot: number }> {
    const receipt = this.surface.tools.place_building(def, pos, rot);
    this.record(receipt);
    return receipt;
  }

  dispose(): void {
    if (typeof window !== 'undefined' && window.__GR_AGENT__ === this) window.__GR_AGENT__ = undefined;
    this.marker?.remove();
    this.listeners.clear();
    this.receipts.length = 0;
    this.receiptFeed.length = 0;
  }

  private record(receipt: ToolReceipt): void {
    this.receiptCount += 1;
    this.lastReceiptTool = receipt.tool;
    if (receipt.tool !== 'et.goldrush.get_state') this.lastActionAt[receipt.tool] = this.clock?.() ?? 0;
    const line = feedLineForReceipt(receipt, this.receiptCount);
    if (line) this.receiptFeed.unshift(`${formatRunTime(this.clock?.() ?? 0)} - ${line}`);
    if (this.receiptFeed.length > 8) this.receiptFeed.length = 8;
    if (this.debug) {
      this.receipts.push(receipt);
      console.debug('[goldrush-agent]', receipt);
    }
    const state = this.state;
    for (const listener of this.listeners) listener(receipt, state);
  }

  private readonly clock?: () => number;
}

export function install(game: AgentGameAdapter, options: AgentStubOptions = {}): AgentStub {
  const surface = options.tools ?? installToolSurface(game, options);
  const stub = new AgentStub(surface, options);
  (game as AgentGameAdapter & { agentStub?: AgentStub }).agentStub = stub;
  return stub;
}

function isDebugSearch(): boolean {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');
}

function formatRunTime(secondsAlive: number): string {
  const minutes = Math.floor(secondsAlive / 60).toString().padStart(2, '0');
  const seconds = Math.floor(secondsAlive % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}
