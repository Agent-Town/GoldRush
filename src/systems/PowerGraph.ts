export type PowerNodeKind = 'producer' | 'relay' | 'consumer';
export type PowerNodeState = 'powered' | 'browned-out' | 'dark';
export type PowerComponentState = 'lit' | 'brown' | 'dark';
export type PowerWireState = 'intact' | 'cut';

type PowerNodeBase = {
  id: string;
  labelKey: string;
  x: number;
  z: number;
  online: boolean;
};

export type PowerNodeInput =
  | (PowerNodeBase & { kind: 'producer'; outputWatts: number })
  | (PowerNodeBase & { kind: 'relay' })
  | (PowerNodeBase & { kind: 'consumer'; drawWatts: number; priority: number });

export type PowerWireInput = {
  a: string;
  b: string;
  state: PowerWireState;
};

export type PowerGraphDefinition = {
  id: string;
  nodes: readonly PowerNodeInput[];
  wires: readonly PowerWireInput[];
};

export type PowerGraphCommand =
  | { type: 'set-wire-state'; wireId: string; state: PowerWireState }
  | { type: 'set-node-online'; nodeId: string; online: boolean }
  | { type: 'set-priority'; nodeId: string; priority: number };

export type PowerGraphEvent = Readonly<{
  seq: number;
  tick: number;
  nodeId: string;
  from: PowerNodeState | null;
  to: PowerNodeState;
}>;

export type PowerNodeSnapshot = Readonly<{
  id: string;
  labelKey: string;
  kind: PowerNodeKind;
  x: number;
  z: number;
  online: boolean;
  outputWatts: number;
  demandWatts: number;
  priority: number;
  state: PowerNodeState;
  allocatedWatts: number;
  allocationRatio: number;
  componentId: string;
}>;

export type PowerWireSnapshot = Readonly<{
  id: string;
  a: string;
  b: string;
  state: PowerWireState;
  length: number;
  maxLength: number;
}>;

export type PowerComponentSnapshot = Readonly<{
  id: string;
  nodeIds: readonly string[];
  supplyWatts: number;
  demandWatts: number;
  unusedWatts: number;
  state: PowerComponentState;
  shedOrder: readonly string[];
}>;

export type PowerGridSnapshot = Readonly<{
  id: string;
  tick: number;
  topologyRevision: number;
  allocationRevision: number;
  totalSupplyWatts: number;
  totalDemandWatts: number;
  nodes: readonly PowerNodeSnapshot[];
  wires: readonly PowerWireSnapshot[];
  components: readonly PowerComponentSnapshot[];
  signature: string;
}>;

export type PowerWireViewDiagnostics = Readonly<{
  active: boolean;
  renderLayer: number;
  renderSlot: 'gameplay';
  topologyRevision: number;
  rebuildCount: number;
  spans: number;
  intactSpans: number;
  cutSpans: number;
  segments: number;
  drawCalls: number;
  asset: 'procedural-catenary';
}>;

export type PowerGraphDiagnostics = PowerGridSnapshot & {
  active: boolean;
  budgetMs: number;
  lastSolveMs: number;
  maxSolveMs: number;
  lastStepMs: number;
  maxStepMs: number;
  overBudget: boolean;
  overBudgetCount: number;
  solveCount: number;
  nodeCount: number;
  wireCount: number;
  intactWireCount: number;
  cutWireCount: number;
  events: readonly PowerGraphEvent[];
  render: PowerWireViewDiagnostics;
};

export type PowerGraphValidationCode =
  | 'definition-shape'
  | 'definition-id'
  | 'node-limit'
  | 'node-shape'
  | 'node-id'
  | 'node-duplicate'
  | 'node-value'
  | 'wire-limit'
  | 'wire-shape'
  | 'wire-self'
  | 'wire-missing-node'
  | 'wire-duplicate'
  | 'wire-too-long'
  | 'limit-value';

export type PowerGraphValidationResult =
  | { ok: true; definition: PowerGraphDefinition }
  | { ok: false; code: PowerGraphValidationCode };

export const POWER_GRAPH_LIMITS = Object.freeze({
  maxNodes: 128,
  maxWires: 256,
  maxNodeWatts: Math.floor(Number.MAX_SAFE_INTEGER / 128),
  maxWireLength: 9,
  solveBudgetMs: 0.5,
});

type SolveResult = Omit<PowerGridSnapshot, 'tick' | 'topologyRevision' | 'allocationRevision'> & {
  states: ReadonlyMap<string, PowerNodeState>;
  events: readonly PowerGraphEvent[];
};

const EMPTY_RENDER_DIAGNOSTICS: PowerWireViewDiagnostics = Object.freeze({
  active: false,
  renderLayer: 0,
  renderSlot: 'gameplay',
  topologyRevision: -1,
  rebuildCount: 0,
  spans: 0,
  intactSpans: 0,
  cutSpans: 0,
  segments: 0,
  drawCalls: 0,
  asset: 'procedural-catenary',
});

export class PowerGraphSystem {
  private readonly initialDefinition: PowerGraphDefinition;
  private readonly maxWireLength: number;
  private readonly budgetMs: number;
  private definition: PowerGraphDefinition;
  private pendingDefinition: PowerGraphDefinition | null = null;
  private states = new Map<string, PowerNodeState>();
  private events: PowerGraphEvent[] = [];
  private currentSnapshot!: PowerGridSnapshot;
  private topologyRevision = 0;
  private allocationRevision = 0;
  private solveCount = 0;
  private eventSeq = 0;
  private lastSolveMs = 0;
  private maxSolveMs = 0;
  private lastStepMs = 0;
  private maxStepMs = 0;
  private overBudgetCount = 0;

  constructor(
    definition: unknown,
    maxWireLength = POWER_GRAPH_LIMITS.maxWireLength,
    budgetMs = POWER_GRAPH_LIMITS.solveBudgetMs,
  ) {
    const parsed = normalizePowerGraphDefinition(definition, maxWireLength);
    if (!parsed.ok) throw new Error(`Invalid power graph: ${parsed.code}`);
    if (!Number.isFinite(budgetMs) || budgetMs <= 0) throw new Error('Invalid power graph: limit-value');
    this.maxWireLength = maxWireLength;
    this.budgetMs = budgetMs;
    this.initialDefinition = parsed.definition;
    this.definition = parsed.definition;
    this.reset(0);
  }

  queueCommand(value: unknown): boolean {
    const command = normalizePowerGraphCommand(value);
    if (!command) return false;
    const preview = this.pendingDefinition ?? this.definition;
    const next = applyPowerGraphCommand(preview, command);
    if (!next) return false;
    this.pendingDefinition = next;
    return true;
  }

  step(tick: number): boolean {
    const started = nowMs();
    const safeTick = cleanTick(tick);
    if (!this.pendingDefinition) {
      this.publishTick(safeTick);
      this.recordStep(started);
      return false;
    }

    const previous = this.definition;
    const next = this.pendingDefinition;
    this.pendingDefinition = null;
    if (definitionsEqual(previous, next)) {
      this.publishTick(safeTick);
      this.recordStep(started);
      return false;
    }

    if (!topologiesEqual(previous, next)) this.topologyRevision += 1;
    this.allocationRevision += 1;
    this.definition = next;
    this.solve(safeTick);
    this.recordStep(started);
    return true;
  }

  reset(tick = 0): void {
    const started = nowMs();
    this.definition = this.initialDefinition;
    this.pendingDefinition = null;
    this.states = new Map();
    this.events = [];
    this.topologyRevision = 0;
    this.allocationRevision = 0;
    this.solveCount = 0;
    this.eventSeq = 0;
    this.lastSolveMs = 0;
    this.maxSolveMs = 0;
    this.lastStepMs = 0;
    this.maxStepMs = 0;
    this.overBudgetCount = 0;
    this.solve(cleanTick(tick));
    this.recordStep(started);
  }

  snapshot(): PowerGridSnapshot {
    return this.currentSnapshot;
  }

  definitionSnapshot(): PowerGraphDefinition {
    return cloneDefinition(this.definition);
  }

  diagnostics(render: PowerWireViewDiagnostics = EMPTY_RENDER_DIAGNOSTICS): PowerGraphDiagnostics {
    const snapshot = this.currentSnapshot;
    return {
      ...snapshot,
      active: true,
      budgetMs: this.budgetMs,
      lastSolveMs: this.lastSolveMs,
      maxSolveMs: this.maxSolveMs,
      lastStepMs: this.lastStepMs,
      maxStepMs: this.maxStepMs,
      overBudget: this.lastStepMs > this.budgetMs,
      overBudgetCount: this.overBudgetCount,
      solveCount: this.solveCount,
      nodeCount: snapshot.nodes.length,
      wireCount: snapshot.wires.length,
      intactWireCount: snapshot.wires.filter((wire) => wire.state === 'intact').length,
      cutWireCount: snapshot.wires.filter((wire) => wire.state === 'cut').length,
      events: this.events.map((event) => ({ ...event })),
      render: { ...render },
    };
  }

  private solve(tick: number): void {
    const started = nowMs();
    const result = solveDefinition(this.definition, this.states, this.maxWireLength, tick, this.eventSeq);
    this.lastSolveMs = nowMs() - started;
    this.maxSolveMs = Math.max(this.maxSolveMs, this.lastSolveMs);
    this.solveCount += 1;
    this.eventSeq += result.events.length;
    this.states = new Map(result.states);
    if (result.events.length > 0) this.events = [...this.events, ...result.events].slice(-64);
    this.currentSnapshot = freezeSnapshot({
      id: result.id,
      tick,
      topologyRevision: this.topologyRevision,
      allocationRevision: this.allocationRevision,
      totalSupplyWatts: result.totalSupplyWatts,
      totalDemandWatts: result.totalDemandWatts,
      nodes: result.nodes,
      wires: result.wires,
      components: result.components,
      signature: result.signature,
    });
  }

  private publishTick(tick: number): void {
    if (this.currentSnapshot.tick === tick) return;
    this.currentSnapshot = Object.freeze({ ...this.currentSnapshot, tick });
  }

  private recordStep(started: number): void {
    this.lastStepMs = nowMs() - started;
    this.maxStepMs = Math.max(this.maxStepMs, this.lastStepMs);
    if (this.lastStepMs > this.budgetMs) this.overBudgetCount += 1;
  }
}

export function normalizePowerGraphDefinition(value: unknown, maxWireLength = POWER_GRAPH_LIMITS.maxWireLength): PowerGraphValidationResult {
  if (!Number.isFinite(maxWireLength) || maxWireLength <= 0) return rejection('limit-value');
  if (!exactRecord(value, ['id', 'nodes', 'wires'])) return rejection('definition-shape');
  if (!shortIdentifier(value.id)) return rejection('definition-id');
  if (!Array.isArray(value.nodes) || value.nodes.length > POWER_GRAPH_LIMITS.maxNodes) return rejection('node-limit');
  if (!Array.isArray(value.wires) || value.wires.length > POWER_GRAPH_LIMITS.maxWires) return rejection('wire-limit');

  const nodes: PowerNodeInput[] = [];
  const nodeErrors = new Set<PowerGraphValidationCode>();
  const nodeIds = new Set<string>();
  for (const candidate of value.nodes) {
    if (!isRecord(candidate)) {
      nodeErrors.add('node-shape');
      continue;
    }
    if (!shortIdentifier(candidate.id)) {
      nodeErrors.add('node-id');
      continue;
    }
    const node = normalizeNode(candidate);
    if (!node) {
      nodeErrors.add('node-value');
      continue;
    }
    if (nodeIds.has(node.id)) nodeErrors.add('node-duplicate');
    nodeIds.add(node.id);
    nodes.push(node);
  }
  const nodeError = firstValidationError(nodeErrors, ['node-shape', 'node-id', 'node-value', 'node-duplicate']);
  if (nodeError) return rejection(nodeError);
  nodes.sort((left, right) => asciiCompare(left.id, right.id));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  const wires: PowerWireInput[] = [];
  const wireErrors = new Set<PowerGraphValidationCode>();
  const wireIds = new Set<string>();
  for (const candidate of value.wires) {
    if (!exactRecord(candidate, ['a', 'b', 'state']) || !shortIdentifier(candidate.a) || !shortIdentifier(candidate.b)) {
      wireErrors.add('wire-shape');
      continue;
    }
    if (candidate.state !== 'intact' && candidate.state !== 'cut') {
      wireErrors.add('wire-shape');
      continue;
    }
    if (candidate.a === candidate.b) {
      wireErrors.add('wire-self');
      continue;
    }
    const a = nodeById.get(candidate.a);
    const b = nodeById.get(candidate.b);
    if (!a || !b) {
      wireErrors.add('wire-missing-node');
      continue;
    }
    const wire = canonicalWire({ a: candidate.a, b: candidate.b, state: candidate.state });
    const id = powerWireId(wire);
    if (wireIds.has(id)) wireErrors.add('wire-duplicate');
    if (Math.hypot(a.x - b.x, a.z - b.z) > maxWireLength) wireErrors.add('wire-too-long');
    wireIds.add(id);
    wires.push(wire);
  }
  const wireError = firstValidationError(wireErrors, ['wire-shape', 'wire-self', 'wire-missing-node', 'wire-too-long', 'wire-duplicate']);
  if (wireError) return rejection(wireError);
  wires.sort((left, right) => asciiCompare(powerWireId(left), powerWireId(right)));
  return { ok: true, definition: freezeDefinition({ id: value.id, nodes, wires }) };
}

export function powerWireId(wire: Pick<PowerWireInput, 'a' | 'b'>): string {
  return asciiCompare(wire.a, wire.b) <= 0 ? `${wire.a}--${wire.b}` : `${wire.b}--${wire.a}`;
}

export function devPowerGraphDefinition(): PowerGraphDefinition {
  return {
    id: 'e3-dev-power-graph',
    nodes: [
      { id: 'consumer-alpha', labelKey: 'consumer-alpha', kind: 'consumer', x: -2, z: 6, online: true, drawWatts: 3, priority: 10 },
      { id: 'consumer-beta', labelKey: 'consumer-beta', kind: 'consumer', x: 4, z: 6, online: true, drawWatts: 4, priority: 20 },
      { id: 'consumer-gamma', labelKey: 'consumer-gamma', kind: 'consumer', x: 18, z: 12, online: true, drawWatts: 6, priority: 30 },
      { id: 'producer-alpha', labelKey: 'producer-alpha', kind: 'producer', x: -8, z: 10, online: true, outputWatts: 5 },
      { id: 'relay-east', labelKey: 'relay-east', kind: 'relay', x: 4, z: 12, online: true },
      { id: 'relay-west', labelKey: 'relay-west', kind: 'relay', x: -2, z: 12, online: true },
    ],
    wires: [
      { a: 'producer-alpha', b: 'relay-west', state: 'intact' },
      { a: 'relay-west', b: 'relay-east', state: 'intact' },
      { a: 'relay-west', b: 'consumer-alpha', state: 'intact' },
      { a: 'relay-east', b: 'consumer-beta', state: 'intact' },
    ],
  };
}

export function emptyPowerGraphDiagnostics(): PowerGraphDiagnostics {
  return {
    active: false,
    id: '',
    tick: 0,
    topologyRevision: 0,
    allocationRevision: 0,
    totalSupplyWatts: 0,
    totalDemandWatts: 0,
    nodes: [],
    wires: [],
    components: [],
    signature: '',
    budgetMs: POWER_GRAPH_LIMITS.solveBudgetMs,
    lastSolveMs: 0,
    maxSolveMs: 0,
    lastStepMs: 0,
    maxStepMs: 0,
    overBudget: false,
    overBudgetCount: 0,
    solveCount: 0,
    nodeCount: 0,
    wireCount: 0,
    intactWireCount: 0,
    cutWireCount: 0,
    events: [],
    render: EMPTY_RENDER_DIAGNOSTICS,
  };
}

function solveDefinition(
  definition: PowerGraphDefinition,
  previousStates: ReadonlyMap<string, PowerNodeState>,
  maxWireLength: number,
  tick: number,
  eventSeqStart: number,
): SolveResult {
  const nodeById = new Map(definition.nodes.map((node) => [node.id, node]));
  const adjacency = new Map(definition.nodes.filter((node) => node.online).map((node) => [node.id, [] as string[]]));
  const wires = definition.wires.map((wire): PowerWireSnapshot => {
    const a = nodeById.get(wire.a)!;
    const b = nodeById.get(wire.b)!;
    if (wire.state === 'intact' && a.online && b.online) {
      adjacency.get(a.id)!.push(b.id);
      adjacency.get(b.id)!.push(a.id);
    }
    return Object.freeze({
      id: powerWireId(wire),
      a: wire.a,
      b: wire.b,
      state: wire.state,
      length: round3(Math.hypot(a.x - b.x, a.z - b.z)),
      maxLength: maxWireLength,
    });
  });
  for (const neighbors of adjacency.values()) neighbors.sort(asciiCompare);

  const componentByNode = new Map<string, string>();
  const components: PowerComponentSnapshot[] = [];
  for (const node of definition.nodes) {
    if (!node.online || componentByNode.has(node.id)) continue;
    const id = `component-${components.length + 1}`;
    const nodeIds = collectComponent(node.id, adjacency, componentByNode, id);
    const supplyWatts = sum(nodeIds, (nodeId) => nodeOutput(nodeById.get(nodeId)!));
    const demandWatts = sum(nodeIds, (nodeId) => nodeDemand(nodeById.get(nodeId)!));
    components.push(Object.freeze({
      id,
      nodeIds: Object.freeze(nodeIds),
      supplyWatts,
      demandWatts,
      unusedWatts: 0,
      state: componentState(supplyWatts, demandWatts),
      shedOrder: Object.freeze(
        nodeIds
          .map((nodeId) => nodeById.get(nodeId)!)
          .filter((entry): entry is Extract<PowerNodeInput, { kind: 'consumer' }> => entry.kind === 'consumer')
          .sort((left, right) => right.priority - left.priority || asciiCompare(left.id, right.id))
          .map((entry) => entry.id),
      ),
    }));
  }

  const stateByNode = new Map<string, PowerNodeState>();
  const allocationByNode = new Map<string, number>();
  const ratioByNode = new Map<string, number>();
  const solvedComponents: PowerComponentSnapshot[] = [];
  for (const component of components) {
    let remaining = component.supplyWatts;
    const consumers = component.nodeIds
      .map((id) => nodeById.get(id)!)
      .filter((node): node is Extract<PowerNodeInput, { kind: 'consumer' }> => node.kind === 'consumer')
      .sort((left, right) => left.priority - right.priority || asciiCompare(left.id, right.id));

    for (const nodeId of component.nodeIds) {
      const node = nodeById.get(nodeId)!;
      if (node.kind === 'consumer') continue;
      const powered = component.supplyWatts > 0;
      stateByNode.set(node.id, powered ? 'powered' : 'dark');
      allocationByNode.set(node.id, 0);
      ratioByNode.set(node.id, powered ? 1 : 0);
    }
    for (const node of consumers) {
      const allocated = Math.min(node.drawWatts, remaining);
      remaining -= allocated;
      const ratio = allocated / node.drawWatts;
      allocationByNode.set(node.id, allocated);
      ratioByNode.set(node.id, ratio);
      stateByNode.set(node.id, ratio === 1 ? 'powered' : ratio > 0 ? 'browned-out' : 'dark');
    }
    solvedComponents.push(Object.freeze({ ...component, unusedWatts: remaining }));
  }

  const nodes = definition.nodes.map((node): PowerNodeSnapshot => {
    const online = node.online;
    const componentId = online ? componentByNode.get(node.id) ?? '' : '';
    const state = online ? stateByNode.get(node.id) ?? 'dark' : 'dark';
    return Object.freeze({
      id: node.id,
      labelKey: node.labelKey,
      kind: node.kind,
      x: node.x,
      z: node.z,
      online,
      outputWatts: nodeOutput(node),
      demandWatts: nodeDemand(node),
      priority: node.kind === 'consumer' ? node.priority : 0,
      state,
      allocatedWatts: online ? allocationByNode.get(node.id) ?? 0 : 0,
      allocationRatio: online ? ratioByNode.get(node.id) ?? 0 : 0,
      componentId,
    });
  });
  const states = new Map(nodes.map((node) => [node.id, node.state]));
  const events: PowerGraphEvent[] = [];
  for (const node of nodes) {
    const from = previousStates.get(node.id) ?? null;
    if (from !== node.state) {
      events.push(Object.freeze({ seq: eventSeqStart + events.length + 1, tick, nodeId: node.id, from, to: node.state }));
    }
  }
  const totalSupplyWatts = sum(nodes, (node) => (node.online ? node.outputWatts : 0));
  const totalDemandWatts = sum(nodes, (node) => (node.online ? node.demandWatts : 0));
  const signature = powerSignature(definition.id, nodes, wires, solvedComponents);
  return {
    id: definition.id,
    totalSupplyWatts,
    totalDemandWatts,
    nodes,
    wires,
    components: solvedComponents,
    signature,
    states,
    events,
  };
}

function normalizeNode(value: unknown): PowerNodeInput | null {
  if (!isRecord(value) || !shortIdentifier(value.id) || !shortText(value.labelKey) || !finite(value.x) || !finite(value.z) || typeof value.online !== 'boolean') {
    return null;
  }
  const base = { id: value.id, labelKey: value.labelKey, x: value.x, z: value.z, online: value.online };
  if (value.kind === 'producer') {
    return exactRecord(value, ['id', 'kind', 'labelKey', 'online', 'outputWatts', 'x', 'z']) && whole(value.outputWatts, 0, POWER_GRAPH_LIMITS.maxNodeWatts)
      ? { ...base, kind: 'producer', outputWatts: value.outputWatts }
      : null;
  }
  if (value.kind === 'relay') {
    return exactRecord(value, ['id', 'kind', 'labelKey', 'online', 'x', 'z']) ? { ...base, kind: 'relay' } : null;
  }
  if (value.kind === 'consumer') {
    return exactRecord(value, ['drawWatts', 'id', 'kind', 'labelKey', 'online', 'priority', 'x', 'z']) && whole(value.drawWatts, 1, POWER_GRAPH_LIMITS.maxNodeWatts) && whole(value.priority, 0, 255)
      ? { ...base, kind: 'consumer', drawWatts: value.drawWatts, priority: value.priority }
      : null;
  }
  return null;
}

function normalizePowerGraphCommand(value: unknown): PowerGraphCommand | null {
  if (!isRecord(value) || typeof value.type !== 'string') return null;
  if (value.type === 'set-wire-state') {
    if (!exactRecord(value, ['state', 'type', 'wireId']) || typeof value.wireId !== 'string' || value.wireId.length > 200) return null;
    return value.state === 'intact' || value.state === 'cut' ? { type: value.type, wireId: value.wireId, state: value.state } : null;
  }
  if (value.type === 'set-node-online') {
    return exactRecord(value, ['nodeId', 'online', 'type']) && shortIdentifier(value.nodeId) && typeof value.online === 'boolean'
      ? { type: value.type, nodeId: value.nodeId, online: value.online }
      : null;
  }
  if (value.type === 'set-priority') {
    return exactRecord(value, ['nodeId', 'priority', 'type']) && shortIdentifier(value.nodeId) && whole(value.priority, 0, 255)
      ? { type: value.type, nodeId: value.nodeId, priority: value.priority }
      : null;
  }
  return null;
}

function applyPowerGraphCommand(definition: PowerGraphDefinition, command: PowerGraphCommand): PowerGraphDefinition | null {
  if (command.type === 'set-wire-state') {
    const index = definition.wires.findIndex((wire) => powerWireId(wire) === command.wireId);
    if (index < 0 || definition.wires[index].state === command.state) return null;
    const wires = [...definition.wires];
    wires[index] = Object.freeze({ ...wires[index], state: command.state });
    return Object.freeze({ ...definition, wires: Object.freeze(wires) });
  }
  const index = definition.nodes.findIndex((node) => node.id === command.nodeId);
  if (index < 0) return null;
  const target = definition.nodes[index];
  if (command.type === 'set-node-online') {
    if (target.online === command.online) return null;
    const nodes = [...definition.nodes];
    nodes[index] = Object.freeze({ ...target, online: command.online });
    return Object.freeze({ ...definition, nodes: Object.freeze(nodes) });
  }
  if (target.kind !== 'consumer' || target.priority === command.priority) return null;
  const nodes = [...definition.nodes];
  nodes[index] = Object.freeze({ ...target, priority: command.priority });
  return Object.freeze({ ...definition, nodes: Object.freeze(nodes) });
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
  }
  return nodeIds.sort(asciiCompare);
}

function powerSignature(
  id: string,
  nodes: readonly PowerNodeSnapshot[],
  wires: readonly PowerWireSnapshot[],
  components: readonly PowerComponentSnapshot[],
): string {
  let hashA = 0x811c9dc5;
  let hashB = 5381;
  let tokens = 0;
  const write = (value: string | number | boolean) => {
    const text = `${value}\0`;
    tokens += 1;
    for (let index = 0; index < text.length; index += 1) {
      const code = text.charCodeAt(index);
      hashA = Math.imul(hashA ^ code, 0x01000193);
      hashB = Math.imul(hashB, 33) ^ code;
    }
  };
  write(id);
  for (const node of nodes) {
    write(node.id); write(node.labelKey); write(node.kind); write(node.x); write(node.z); write(node.online);
    write(node.outputWatts); write(node.demandWatts); write(node.priority); write(node.state);
    write(node.allocatedWatts); write(node.allocationRatio); write(node.componentId);
  }
  for (const wire of wires) {
    write(wire.id); write(wire.a); write(wire.b); write(wire.state); write(wire.length); write(wire.maxLength);
  }
  for (const component of components) {
    write(component.id);
    for (const nodeId of component.nodeIds) write(nodeId);
    write(component.supplyWatts); write(component.demandWatts); write(component.unusedWatts);
  }
  return `${tokens}:${(hashA >>> 0).toString(16).padStart(8, '0')}${(hashB >>> 0).toString(16).padStart(8, '0')}`;
}

function freezeDefinition(definition: PowerGraphDefinition): PowerGraphDefinition {
  return Object.freeze({
    id: definition.id,
    nodes: Object.freeze(definition.nodes.map((node) => Object.freeze({ ...node }))),
    wires: Object.freeze(definition.wires.map((wire) => Object.freeze(canonicalWire(wire)))),
  });
}

function cloneDefinition(definition: PowerGraphDefinition): PowerGraphDefinition {
  return freezeDefinition({ id: definition.id, nodes: definition.nodes.map((node) => ({ ...node })), wires: definition.wires.map((wire) => ({ ...wire })) });
}

function freezeSnapshot(snapshot: PowerGridSnapshot): PowerGridSnapshot {
  return Object.freeze({
    ...snapshot,
    nodes: Object.freeze([...snapshot.nodes]),
    wires: Object.freeze([...snapshot.wires]),
    components: Object.freeze([...snapshot.components]),
  });
}

function canonicalWire(wire: PowerWireInput): PowerWireInput {
  return asciiCompare(wire.a, wire.b) <= 0 ? { ...wire } : { a: wire.b, b: wire.a, state: wire.state };
}

function definitionsEqual(left: PowerGraphDefinition, right: PowerGraphDefinition): boolean {
  if (left === right) return true;
  if (left.id !== right.id || left.nodes.length !== right.nodes.length || left.wires.length !== right.wires.length) return false;
  if (left.nodes !== right.nodes) {
    for (let index = 0; index < left.nodes.length; index += 1) {
      const a = left.nodes[index];
      const b = right.nodes[index];
      if (a === b) continue;
      if (a.id !== b.id || a.kind !== b.kind || a.labelKey !== b.labelKey || a.x !== b.x || a.z !== b.z || a.online !== b.online) return false;
      if (a.kind === 'producer' && (b.kind !== 'producer' || a.outputWatts !== b.outputWatts)) return false;
      if (a.kind === 'consumer' && (b.kind !== 'consumer' || a.drawWatts !== b.drawWatts || a.priority !== b.priority)) return false;
    }
  }
  if (left.wires !== right.wires) {
    for (let index = 0; index < left.wires.length; index += 1) {
      const a = left.wires[index];
      const b = right.wires[index];
      if (a !== b && (a.a !== b.a || a.b !== b.b || a.state !== b.state)) return false;
    }
  }
  return true;
}

function topologiesEqual(left: PowerGraphDefinition, right: PowerGraphDefinition): boolean {
  if (left.nodes !== right.nodes) {
    for (let index = 0; index < left.nodes.length; index += 1) {
      const a = left.nodes[index];
      const b = right.nodes[index];
      if (a.id !== b.id || a.x !== b.x || a.z !== b.z) return false;
    }
  }
  if (left.wires !== right.wires) {
    for (let index = 0; index < left.wires.length; index += 1) {
      const a = left.wires[index];
      const b = right.wires[index];
      if (a.a !== b.a || a.b !== b.b || a.state !== b.state) return false;
    }
  }
  return true;
}

function nodeOutput(node: PowerNodeInput): number {
  return node.kind === 'producer' ? node.outputWatts : 0;
}

function nodeDemand(node: PowerNodeInput): number {
  return node.kind === 'consumer' ? node.drawWatts : 0;
}

function componentState(supplyWatts: number, demandWatts: number): PowerComponentState {
  if (supplyWatts <= 0) return 'dark';
  return demandWatts <= supplyWatts ? 'lit' : 'brown';
}

function rejection(code: PowerGraphValidationCode): PowerGraphValidationResult {
  return { ok: false, code };
}

function exactRecord(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return isRecord(value) && Object.keys(value).length === keys.length && [...keys].sort().every((key, index) => Object.keys(value).sort()[index] === key);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function shortIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 96 && !value.includes('--') && /^[A-Za-z0-9][A-Za-z0-9:_./-]*$/.test(value);
}

function shortText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 96;
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function whole(value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

function firstValidationError(
  errors: ReadonlySet<PowerGraphValidationCode>,
  precedence: readonly PowerGraphValidationCode[],
): PowerGraphValidationCode | null {
  return precedence.find((code) => errors.has(code)) ?? null;
}

function sum<T>(values: readonly T[], select: (value: T) => number): number {
  let total = 0;
  for (const value of values) total += select(value);
  return total;
}

function cleanTick(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function asciiCompare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function nowMs(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function round3(value: number): number {
  return Math.round(value * 1_000) / 1_000;
}
