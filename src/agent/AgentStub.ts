import {
  install as installToolSurface,
  type AgentGameAdapter,
  type GoldRushToolSurface,
  type ToolReceipt,
  type ToolSurfaceOptions,
} from './ToolSurface';

export type AgentStubOptions = ToolSurfaceOptions & {
  readonly tools?: GoldRushToolSurface;
  readonly debug?: boolean;
};

export class AgentStub {
  private readonly receipts: ToolReceipt[] = [];
  private readonly debug: boolean;
  private readonly marker?: HTMLElement;

  constructor(private readonly surface: GoldRushToolSurface, options: AgentStubOptions = {}) {
    this.debug = options.debug ?? isDebugSearch();
    if (this.debug && typeof document !== 'undefined') {
      this.marker = document.createElement('div');
      this.marker.dataset.testid = 'agent-stub-marker';
      this.marker.hidden = true;
      document.body.append(this.marker);
    }
  }

  get log(): readonly ToolReceipt[] {
    return this.receipts.slice();
  }

  heartbeat(): ToolReceipt<'et.goldrush.get_state', Record<string, never>> {
    const receipt = this.surface.tools.get_state();
    this.record(receipt);
    return receipt;
  }

  dispose(): void {
    this.marker?.remove();
    this.receipts.length = 0;
  }

  private record(receipt: ToolReceipt): void {
    if (!this.debug) return;
    this.receipts.push(receipt);
    console.debug('[goldrush-agent]', receipt);
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
