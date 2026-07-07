import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import { disposeObject3D } from '../utils/dispose';
import { visualY } from '../world/Terrain';

export type PowerNodeKind = 'producer' | 'relay' | 'consumer';
export type PowerNodeState = 'powered' | 'browned-out' | 'dark';

export type PowerNodeInput = {
  id: string;
  kind: PowerNodeKind;
  x: number;
  z: number;
  output?: number;
  draw?: number;
};

export type PowerWireInput = {
  id?: string;
  a: string;
  b: string;
};

export type PowerGraphDefinition = {
  id: string;
  nodes: readonly PowerNodeInput[];
  wires: readonly PowerWireInput[];
};

export type PowerGraphEvent = {
  seq: number;
  tick: number;
  nodeId: string;
  from: PowerNodeState | null;
  to: PowerNodeState;
};

export type PowerGraphDiagnostics = {
  active: boolean;
  id: string | null;
  budgetMs: number;
  lastSolveMs: number;
  maxSolveMs: number;
  overBudget: boolean;
  overBudgetCount: number;
  solveCount: number;
  nodeCount: number;
  wireCount: number;
  validWireCount: number;
  invalidWireCount: number;
  totalSupply: number;
  totalDemand: number;
  nodes: Array<{
    id: string;
    kind: PowerNodeKind;
    x: number;
    z: number;
    output: number;
    draw: number;
    state: PowerNodeState;
    componentId: string;
  }>;
  wires: Array<{
    id: string;
    a: string;
    b: string;
    length: number;
    maxLength: number;
    valid: boolean;
  }>;
  components: Array<{
    id: string;
    nodeIds: string[];
    supply: number;
    demand: number;
    unusedSupply: number;
  }>;
  events: PowerGraphEvent[];
  render: {
    active: boolean;
    renderLayer: number;
    renderSlot: 'gameplay';
    spans: number;
    validSpans: number;
    invalidSpans: number;
    segments: number;
    drawCalls: number;
    asset: 'procedural-catenary';
  };
  signature: string;
};

type SolvedNode = PowerGraphDiagnostics['nodes'][number];
type SolvedWire = PowerGraphDiagnostics['wires'][number];
type SolvedComponent = PowerGraphDiagnostics['components'][number];

type SolveResult = {
  nodes: SolvedNode[];
  wires: SolvedWire[];
  components: SolvedComponent[];
  totalSupply: number;
  totalDemand: number;
  events: PowerGraphEvent[];
  signature: string;
};

const WIRE_Y = 1.45;
const WIRE_SAG = 0.42;
const WIRE_SEGMENTS = 12;
const emptyEvents: PowerGraphEvent[] = [];

export class PowerGraphSystem {
  readonly group = new THREE.Group();

  private states = new Map<string, PowerNodeState>();
  private events: PowerGraphEvent[] = [];
  private solveResult: SolveResult;
  private solveCount = 0;
  private eventSeq = 0;
  private lastSolveMs = 0;
  private maxSolveMs = 0;
  private overBudgetCount = 0;
  private renderSegments = 0;
  private renderDrawCalls = 0;

  constructor(
    private readonly definition: PowerGraphDefinition,
    private readonly maxWireLength = Balance.powerGraph.maxWireLength,
    private readonly budgetMs = Balance.powerGraph.solveBudgetMs,
  ) {
    this.group.name = `PowerGraph.${definition.id}`;
    this.solveResult = emptySolve(definition.id);
    this.createWireRender();
    this.update(0);
  }

  update(_at: number): void {
    const started = nowMs();
    const result = solvePowerGraph(this.definition, this.states, this.maxWireLength, this.solveCount + 1, this.eventSeq);
    this.lastSolveMs = nowMs() - started;
    this.maxSolveMs = Math.max(this.maxSolveMs, this.lastSolveMs);
    if (this.lastSolveMs > this.budgetMs) this.overBudgetCount += 1;
    this.solveCount += 1;
    this.eventSeq += result.events.length;
    this.solveResult = result;
    this.states = new Map(result.nodes.map((node) => [node.id, node.state]));
    if (result.events.length > 0) this.events = [...this.events, ...result.events].slice(-64);
  }

  diagnostics(): PowerGraphDiagnostics {
    const validWireCount = this.solveResult.wires.filter((wire) => wire.valid).length;
    const invalidWireCount = this.solveResult.wires.length - validWireCount;
    return {
      active: true,
      id: this.definition.id,
      budgetMs: this.budgetMs,
      lastSolveMs: round3(this.lastSolveMs),
      maxSolveMs: round3(this.maxSolveMs),
      overBudget: this.lastSolveMs > this.budgetMs,
      overBudgetCount: this.overBudgetCount,
      solveCount: this.solveCount,
      nodeCount: this.solveResult.nodes.length,
      wireCount: this.solveResult.wires.length,
      validWireCount,
      invalidWireCount,
      totalSupply: this.solveResult.totalSupply,
      totalDemand: this.solveResult.totalDemand,
      nodes: this.solveResult.nodes.map((node) => ({ ...node })),
      wires: this.solveResult.wires.map((wire) => ({ ...wire })),
      components: this.solveResult.components.map((component) => ({
        ...component,
        nodeIds: [...component.nodeIds],
      })),
      events: [...this.events],
      render: {
        active: this.group.visible,
        renderLayer: RenderLayers.gameplay,
        renderSlot: 'gameplay',
        spans: this.definition.wires.length,
        validSpans: validWireCount,
        invalidSpans: invalidWireCount,
        segments: this.renderSegments,
        drawCalls: this.renderDrawCalls,
        asset: 'procedural-catenary',
      },
      signature: this.solveResult.signature,
    };
  }

  dispose(): void {
    disposeObject3D(this.group);
  }

  private createWireRender(): void {
    const validVertices = wireVertices(this.definition, this.maxWireLength, true);
    const invalidVertices = wireVertices(this.definition, this.maxWireLength, false);
    this.renderSegments = validVertices.length / 6 + invalidVertices.length / 6;

    if (validVertices.length > 0) {
      this.group.add(createLineSegments('PowerGraph.ValidWires', validVertices, '#5b8a8a', 0.88));
      this.renderDrawCalls += 1;
    }
    if (invalidVertices.length > 0) {
      this.group.add(createLineSegments('PowerGraph.InvalidWires', invalidVertices, '#a0522d', 0.55));
      this.renderDrawCalls += 1;
    }
  }
}

export function solvePowerGraph(
  graph: PowerGraphDefinition,
  previousStates = new Map<string, PowerNodeState>(),
  maxWireLength = Balance.powerGraph.maxWireLength,
  tick = 1,
  eventSeqStart = 0,
): SolveResult {
  const nodes = [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const wires = graph.wires.map((wire) => solveWire(wire, nodeById, maxWireLength)).sort((a, b) => a.id.localeCompare(b.id));
  const adjacency = new Map(nodes.map((node) => [node.id, [] as string[]]));
  for (const wire of wires) {
    if (!wire.valid) continue;
    adjacency.get(wire.a)?.push(wire.b);
    adjacency.get(wire.b)?.push(wire.a);
  }
  for (const neighbors of adjacency.values()) neighbors.sort();

  const componentByNode = new Map<string, string>();
  const components: SolvedComponent[] = [];
  for (const node of nodes) {
    if (componentByNode.has(node.id)) continue;
    const nodeIds = collectComponent(node.id, adjacency, componentByNode, `component-${components.length + 1}`);
    const supply = sum(nodeIds, (id) => Math.max(0, cleanNumber(nodeById.get(id)?.output)));
    const demand = sum(nodeIds, (id) => (nodeById.get(id)?.kind === 'consumer' ? Math.max(0, cleanNumber(nodeById.get(id)?.draw)) : 0));
    components.push({ id: `component-${components.length + 1}`, nodeIds, supply, demand, unusedSupply: 0 });
  }

  const nodeStates = new Map<string, PowerNodeState>();
  for (const component of components) {
    let remainingSupply = component.supply;
    const consumers = component.nodeIds
      .map((id) => nodeById.get(id)!)
      .filter((node) => node.kind === 'consumer')
      .sort((a, b) => a.id.localeCompare(b.id));

    for (const nodeId of component.nodeIds) {
      const node = nodeById.get(nodeId)!;
      if (node.kind !== 'consumer') nodeStates.set(node.id, component.supply > 0 ? 'powered' : 'dark');
    }
    for (const node of consumers) {
      const draw = Math.max(0, cleanNumber(node.draw));
      if (component.supply <= 0) {
        nodeStates.set(node.id, 'dark');
      } else if (draw <= remainingSupply) {
        nodeStates.set(node.id, 'powered');
        remainingSupply -= draw;
      } else if (remainingSupply > 0) {
        nodeStates.set(node.id, 'browned-out');
        remainingSupply = 0;
      } else {
        nodeStates.set(node.id, 'dark');
      }
    }
    component.unusedSupply = round1(remainingSupply);
  }

  const events: PowerGraphEvent[] = [];
  for (const node of nodes) {
    const to = nodeStates.get(node.id) ?? 'dark';
    const from = previousStates.get(node.id) ?? null;
    if (from !== to) events.push({ seq: eventSeqStart + events.length + 1, tick, nodeId: node.id, from, to });
  }

  const solvedNodes = nodes.map((node): SolvedNode => ({
    id: node.id,
    kind: node.kind,
    x: round1(node.x),
    z: round1(node.z),
    output: Math.max(0, cleanNumber(node.output)),
    draw: Math.max(0, cleanNumber(node.draw)),
    state: nodeStates.get(node.id) ?? 'dark',
    componentId: componentByNode.get(node.id) ?? 'component-0',
  }));

  return {
    nodes: solvedNodes,
    wires,
    components,
    totalSupply: sum(nodes, (node) => Math.max(0, cleanNumber(node.output))),
    totalDemand: sum(nodes, (node) => (node.kind === 'consumer' ? Math.max(0, cleanNumber(node.draw)) : 0)),
    events,
    signature: powerSignature(solvedNodes, wires, components),
  };
}

export function emptyPowerGraphDiagnostics(): PowerGraphDiagnostics {
  return {
    active: false,
    id: null,
    budgetMs: Balance.powerGraph.solveBudgetMs,
    lastSolveMs: 0,
    maxSolveMs: 0,
    overBudget: false,
    overBudgetCount: 0,
    solveCount: 0,
    nodeCount: 0,
    wireCount: 0,
    validWireCount: 0,
    invalidWireCount: 0,
    totalSupply: 0,
    totalDemand: 0,
    nodes: [],
    wires: [],
    components: [],
    events: emptyEvents,
    render: {
      active: false,
      renderLayer: RenderLayers.gameplay,
      renderSlot: 'gameplay',
      spans: 0,
      validSpans: 0,
      invalidSpans: 0,
      segments: 0,
      drawCalls: 0,
      asset: 'procedural-catenary',
    },
    signature: '',
  };
}

export function devPowerGraphDefinition(): PowerGraphDefinition {
  return {
    id: 'e3-dev-power-graph',
    nodes: [
      { id: 'consumer-alpha', kind: 'consumer', x: -2, z: 6, draw: 3 },
      { id: 'consumer-beta', kind: 'consumer', x: 4, z: 6, draw: 4 },
      { id: 'consumer-gamma', kind: 'consumer', x: 18, z: 12, draw: 6 },
      { id: 'producer-alpha', kind: 'producer', x: -8, z: 10, output: 5 },
      { id: 'relay-east', kind: 'relay', x: 4, z: 12 },
      { id: 'relay-west', kind: 'relay', x: -2, z: 12 },
    ],
    wires: [
      { a: 'producer-alpha', b: 'relay-west' },
      { a: 'relay-west', b: 'relay-east' },
      { a: 'relay-west', b: 'consumer-alpha' },
      { a: 'relay-east', b: 'consumer-beta' },
      { a: 'relay-east', b: 'consumer-gamma' },
    ],
  };
}

function emptySolve(id: string): SolveResult {
  return {
    nodes: [],
    wires: [],
    components: [],
    totalSupply: 0,
    totalDemand: 0,
    events: [],
    signature: id,
  };
}

function solveWire(wire: PowerWireInput, nodeById: ReadonlyMap<string, PowerNodeInput>, maxWireLength: number): SolvedWire {
  const a = nodeById.get(wire.a);
  const b = nodeById.get(wire.b);
  const length = a && b ? Math.hypot(a.x - b.x, a.z - b.z) : Number.POSITIVE_INFINITY;
  const id = wire.id ?? [wire.a, wire.b].sort().join('--');
  return {
    id,
    a: wire.a,
    b: wire.b,
    length: round1(length),
    maxLength: maxWireLength,
    valid: Boolean(a && b && length <= maxWireLength),
  };
}

function collectComponent(
  firstId: string,
  adjacency: ReadonlyMap<string, readonly string[]>,
  componentByNode: Map<string, string>,
  componentId: string,
): string[] {
  const queue = [firstId];
  const nodeIds: string[] = [];
  componentByNode.set(firstId, componentId);
  while (queue.length > 0) {
    const id = queue.shift()!;
    nodeIds.push(id);
    for (const neighbor of adjacency.get(id) ?? []) {
      if (componentByNode.has(neighbor)) continue;
      componentByNode.set(neighbor, componentId);
      queue.push(neighbor);
    }
    queue.sort();
  }
  return nodeIds.sort();
}

function wireVertices(graph: PowerGraphDefinition, maxWireLength: number, valid: boolean): number[] {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const vertices: number[] = [];
  for (const wire of graph.wires) {
    const a = nodeById.get(wire.a);
    const b = nodeById.get(wire.b);
    if (!a || !b) continue;
    const length = Math.hypot(a.x - b.x, a.z - b.z);
    if ((length <= maxWireLength) !== valid) continue;
    for (let i = 0; i < WIRE_SEGMENTS; i += 1) {
      pushCatenaryPoint(vertices, a, b, i / WIRE_SEGMENTS);
      pushCatenaryPoint(vertices, a, b, (i + 1) / WIRE_SEGMENTS);
    }
  }
  return vertices;
}

function pushCatenaryPoint(vertices: number[], a: PowerNodeInput, b: PowerNodeInput, t: number): void {
  const x = THREE.MathUtils.lerp(a.x, b.x, t);
  const z = THREE.MathUtils.lerp(a.z, b.z, t);
  const groundY = visualY(x, z, WIRE_Y);
  const y = groundY - Math.sin(Math.PI * t) * WIRE_SAG;
  vertices.push(x, y, z);
}

function createLineSegments(name: string, vertices: readonly number[], color: string, opacity: number): THREE.LineSegments {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.name = name;
  lines.renderOrder = RenderLayers.gameplay;
  lines.frustumCulled = false;
  return lines;
}

function powerSignature(nodes: readonly SolvedNode[], wires: readonly SolvedWire[], components: readonly SolvedComponent[]): string {
  return [
    nodes.map((node) => `${node.id}:${node.state}:${node.componentId}`).join(','),
    wires.map((wire) => `${wire.id}:${wire.valid ? '1' : '0'}:${wire.length}`).join(','),
    components.map((component) => `${component.id}:${component.supply}/${component.demand}/${component.unusedSupply}`).join(','),
  ].join('|');
}

function sum<T>(values: readonly T[], select: (value: T) => number): number {
  let total = 0;
  for (const value of values) total += select(value);
  return round1(total);
}

function cleanNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function nowMs(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
