import relayValleyMask from '../../assets/contracts/epoch-7-signal/mask-tables/e7-relay-valley.json' with { type: 'json' };
import { Balance } from '../game/Balance';
import { stableHash } from '../mp/LockstepClient';

export const E7_SIGNAL_STATE_KEY = 'gr.e7Signal.v1';

export type E7SignalMilestone =
  | 'first-relay-linked'
  | 'first-playbook-recorded'
  | 'contract:e7-relay-valley'
  | 'contract:e7-echo-canyon'
  | 'contract:e7-dead-band'
  | 'contract:e7-relay-rush';

export type E7RelayNode = { id: string; x: number; z: number };
export type E7RelayLink = { from: string; to: string };

type Jack = { id: string; label: string; state: 'lit' | 'dark'; patched: boolean };
type Board = {
  jacks: Jack[];
  midpointReached: boolean;
  lastBeatFired: boolean;
  latestFragment: string;
  applied: E7SignalMilestone[];
};

export type E7SignalDiagnostics = {
  enabled: boolean;
  graphHash: string;
  nodes: readonly E7RelayNode[];
  links: readonly E7RelayLink[];
  linkedCoverage: boolean;
  threatVisibilityBonus: boolean;
  droneDropped: boolean;
  jacks: readonly Jack[];
  midpointReached: boolean;
  lastBeatCount: 0 | 1;
  e8ExitBeatReady: boolean;
  fragmentEvents: number;
  latestFragment: string;
};

const ANSWERS = [
  {
    milestone: 'first-relay-linked',
    id: 'lighthouse-keeper',
    label: 'Lighthouse keeper',
    fragment: 'First tower up. A wrong number answered, confused and kind. The line stays open.',
  },
  {
    milestone: 'first-playbook-recorded',
    id: 'ford-table',
    label: 'The ford table',
    fragment: 'The ford still feeds every walker. Supper is still on.',
  },
  {
    milestone: 'contract:e7-relay-valley',
    id: 'night-choir',
    label: 'Coalport night choir',
    fragment: 'Three lights on the board. The bright season carries hands to every answer.',
  },
] as const;

// STORYBOOK E7, THE SILENCES/THE RECALL: nobody hangs up first; the
// lighthouse is the first answer and therefore the last frequency kept.
const SILENCES = [
  {
    milestone: 'contract:e7-echo-canyon',
    jack: 1,
    fragment: 'A complete weather report, then quiet. ANSWER PENDING.',
  },
  {
    milestone: 'contract:e7-dead-band',
    jack: 2,
    fragment: 'COME HOME. The chief unplugs nothing. The log stays open.',
  },
  {
    milestone: 'contract:e7-relay-rush',
    jack: 0,
    fragment: 'The last voice is static now. The jack stays patched. If anybody is listening: HERE.',
  },
] as const;

const KNOWN_MILESTONES = new Set<E7SignalMilestone>([
  ...ANSWERS.map((entry) => entry.milestone),
  ...SILENCES.map((entry) => entry.milestone),
]);
const FOG_POCKETS = relayValleyMask.maskTruth.fogPockets;
const EMPTY_GRAPH_HASH = stableHash({ nodes: [], links: [] });

export class E7SignalSystem {
  private readonly root = document.createElement('section');
  private handled: E7SignalMilestone[];
  private nodes: E7RelayNode[] = [];
  private links: E7RelayLink[] = [];
  private graphHash = EMPTY_GRAPH_HASH;
  private lastRenderKey = '';
  private droneDropped = false;

  constructor(
    private readonly active: () => boolean,
    private readonly relayNodes: () => readonly E7RelayNode[],
    private readonly lineOfSight: (from: E7RelayNode, to: E7RelayNode) => boolean,
    private readonly storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
    private readonly announceFragment: (fragment: string) => void = () => {},
  ) {
    this.handled = readMilestones(storage);
    this.root.dataset.testid = 'e7-jack-board';
    this.root.setAttribute('aria-label', 'Exchange rescue jack-board');
    this.root.setAttribute('aria-live', 'polite');
    this.root.style.cssText = 'position:absolute;right:12px;top:72px;z-index:22;width:min(310px,calc(100vw - 24px));padding:10px 12px;border:1px solid rgba(218,174,84,.65);border-radius:8px;background:rgba(38,28,24,.9);color:#f0ddb1;pointer-events:none;font:13px/1.35 Georgia,serif;';
  }

  mount(parent: HTMLElement): void {
    parent.append(this.root);
    this.render(true);
  }

  update(): void {
    const next = this.active() ? buildRelayGraph(this.relayNodes(), this.lineOfSight) : { nodes: [], links: [], hash: EMPTY_GRAPH_HASH };
    this.nodes = next.nodes;
    this.links = next.links;
    this.graphHash = next.hash;
    if (this.links.length > 0) this.recordMilestone('first-relay-linked');
    this.render();
  }

  recordMilestone(milestone: E7SignalMilestone): boolean {
    if (!this.active() || this.handled.includes(milestone)) return false;
    const projected = projectBoard([...this.handled, milestone]);
    if (!projected.applied.includes(milestone)) return false;
    this.handled.push(milestone);
    this.storage.setItem(E7_SIGNAL_STATE_KEY, JSON.stringify({ version: 1, milestones: this.handled }));
    this.announceFragment(projected.latestFragment);
    this.render(true);
    return true;
  }

  recordContractWin(contractId: string): boolean {
    const milestone = `contract:${contractId}` as E7SignalMilestone;
    return KNOWN_MILESTONES.has(milestone) && this.recordMilestone(milestone);
  }

  relayLinked(id: string): boolean {
    return this.links.some((link) => link.from === id || link.to === id);
  }

  coverageAt(position: { x: number; z: number }): boolean {
    if (!this.active()) return true;
    const linked = new Set(this.links.flatMap((link) => [link.from, link.to]));
    return this.nodes.some((node) => linked.has(node.id) && Math.hypot(node.x - position.x, node.z - position.z) <= Balance.e7Signal.coverageRadius);
  }

  droneCanOperate(position: { x: number; z: number }): boolean {
    const covered = this.coverageAt(position);
    this.droneDropped = this.active() && !covered;
    return covered;
  }

  clearDroneDrop(): void {
    this.droneDropped = false;
  }

  graphFor(nodes: readonly E7RelayNode[]): Pick<E7SignalDiagnostics, 'graphHash' | 'nodes' | 'links'> {
    const graph = buildRelayGraph(nodes, this.lineOfSight);
    return { graphHash: graph.hash, nodes: graph.nodes, links: graph.links };
  }

  get diagnostics(): E7SignalDiagnostics {
    const board = projectBoard(this.handled);
    return {
      enabled: this.active(),
      graphHash: this.graphHash,
      nodes: this.nodes,
      links: this.links,
      linkedCoverage: this.links.length > 0,
      threatVisibilityBonus: this.links.length > 0,
      droneDropped: this.droneDropped,
      jacks: board.jacks,
      midpointReached: board.midpointReached,
      lastBeatCount: board.lastBeatFired ? 1 : 0,
      e8ExitBeatReady: board.lastBeatFired,
      fragmentEvents: board.applied.length,
      latestFragment: board.latestFragment,
    };
  }

  dispose(): void {
    this.root.remove();
  }

  private render(force = false): void {
    const board = projectBoard(this.handled);
    const key = JSON.stringify([this.active(), this.graphHash, board]);
    if (!force && key === this.lastRenderKey) return;
    this.lastRenderKey = key;
    this.root.hidden = !this.active();
    if (this.root.hidden) return;
    this.root.innerHTML = `<strong style="letter-spacing:.08em">THE EXCHANGE · RESCUE BOARD</strong>
      <p style="margin:4px 0 7px">${this.links.length > 0 ? 'SIGNAL LINKED · THREATS CHARTED' : 'SEARCHING · RELAYS NEED A CLEAR LINE'}</p>
      <ol style="margin:0;padding-left:20px">${board.jacks.map((jack) => `<li data-jack-id="${jack.id}" data-jack-state="${jack.state}">${jack.state === 'lit' ? '●' : jack.patched ? '◉' : '○'} ${jack.label} — ${jack.state === 'lit' ? 'ANSWERING' : jack.patched ? 'PATCHED · ANSWER PENDING' : 'ANSWER PENDING'}</li>`).join('')}</ol>
      <p data-testid="e7-signal-fragment" style="margin:7px 0 0;font-style:italic">${board.latestFragment}</p>`;
  }
}

export function e7SignalExitBeatReady(storage: Pick<Storage, 'getItem'> = localStorage): boolean {
  return projectBoard(readMilestones(storage)).lastBeatFired;
}

function buildRelayGraph(
  source: readonly E7RelayNode[],
  lineOfSight: (from: E7RelayNode, to: E7RelayNode) => boolean,
): { nodes: E7RelayNode[]; links: E7RelayLink[]; hash: string } {
  const nodes = source
    .map((node) => ({ id: node.id, x: round3(node.x), z: round3(node.z) }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const links: E7RelayLink[] = [];
  for (let left = 0; left < nodes.length; left += 1) {
    for (let right = left + 1; right < nodes.length; right += 1) {
      const from = nodes[left]!;
      const to = nodes[right]!;
      if (Math.hypot(to.x - from.x, to.z - from.z) > Balance.e7Signal.linkRange) continue;
      if (!lineOfSight(from, to) || FOG_POCKETS.some((pocket) => crossesPocket(from, to, pocket))) continue;
      links.push({ from: from.id, to: to.id });
    }
  }
  return { nodes, links, hash: stableHash({ nodes, links }) };
}

function crossesPocket(from: E7RelayNode, to: E7RelayNode, pocket: (typeof FOG_POCKETS)[number]): boolean {
  if (inside(from, pocket) || inside(to, pocket)) return false;
  // ponytail: authored pockets are >=16wu wide; use exact clipping if future masks become narrower than this sampling stride.
  for (let step = 1; step < 12; step += 1) {
    const t = step / 12;
    if (inside({ x: from.x + (to.x - from.x) * t, z: from.z + (to.z - from.z) * t }, pocket)) return true;
  }
  return false;
}

function inside(point: { x: number; z: number }, pocket: (typeof FOG_POCKETS)[number]): boolean {
  return point.x >= pocket.minX && point.x <= pocket.maxX && point.z >= pocket.minZ && point.z <= pocket.maxZ;
}

function projectBoard(milestones: readonly E7SignalMilestone[]): Board {
  const board: Board = { jacks: [], midpointReached: false, lastBeatFired: false, latestFragment: '', applied: [] };
  for (const milestone of milestones) {
    const answer = ANSWERS.find((entry) => entry.milestone === milestone);
    if (answer && !board.jacks.some((jack) => jack.id === answer.id)) {
      board.jacks.push({ id: answer.id, label: answer.label, state: 'lit', patched: false });
      board.latestFragment = answer.fragment;
      board.applied.push(milestone);
      board.midpointReached = board.jacks.length >= Balance.e7Signal.midpointJackCount;
      continue;
    }
    const silence = SILENCES.find((entry) => entry.milestone === milestone);
    const jack = silence && board.midpointReached ? board.jacks[silence.jack] : undefined;
    if (!silence || !jack || jack.state === 'dark') continue;
    jack.state = 'dark';
    jack.patched = silence.jack === 0;
    board.latestFragment = silence.fragment;
    board.applied.push(milestone);
    board.lastBeatFired = board.jacks.length > 0 && board.jacks.every((entry) => entry.state === 'dark');
  }
  return board;
}

function readMilestones(storage: Pick<Storage, 'getItem'>): E7SignalMilestone[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(E7_SIGNAL_STATE_KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object' || !('milestones' in parsed) || !Array.isArray(parsed.milestones)) return [];
    const unique = [...new Set(parsed.milestones.filter((entry): entry is E7SignalMilestone => typeof entry === 'string' && KNOWN_MILESTONES.has(entry as E7SignalMilestone)))];
    return projectBoard(unique).applied;
  } catch {
    return [];
  }
}

function round3(value: number): number {
  return Math.round(value * 1_000) / 1_000;
}
