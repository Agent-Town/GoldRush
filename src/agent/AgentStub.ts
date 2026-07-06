import {
  install as installToolSurface,
  type AgentBuildingRef,
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
};

export type AgentStubState = {
  name: string;
  permissionLevel: AgentPermissionLevel;
  permissionLabel: string;
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
  private receiptCount = 0;
  private lastReceiptTool: ToolReceipt['tool'] | null = null;

  constructor(private readonly surface: GoldRushToolSurface, options: AgentStubOptions = {}) {
    this.debug = options.debug ?? isDebugSearch();
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
    const line = feedLineForReceipt(receipt, this.receiptCount);
    if (line) this.receiptFeed.unshift(line);
    if (this.receiptFeed.length > 3) this.receiptFeed.length = 3;
    if (this.debug) {
      this.receipts.push(receipt);
      console.debug('[goldrush-agent]', receipt);
    }
    const state = this.state;
    for (const listener of this.listeners) listener(receipt, state);
  }
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
