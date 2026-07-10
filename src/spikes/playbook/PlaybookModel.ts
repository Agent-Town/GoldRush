export const PLAYBOOK_TICK_RATE = 30;
export const PLAYBOOK_GRID_WIDTH = 7;
export const PLAYBOOK_GRID_HEIGHT = 5;
export const PLAYBOOK_MAX_STEPS = 16;
export const PLAYBOOK_MAX_TICKS = 1_800;

const MOVE_TICKS_PER_CELL = 5;
const MAX_STEP_TIMEOUT_TICKS = 300;
const HASH_PATTERN = /^fnv1a32:[0-9a-f]{8}$/;
const LAB_TOOLS = ['lab.mark', 'lab.move_to'] as const;

export type LabTool = (typeof LAB_TOOLS)[number];
export type LabPoint = { x: number; z: number };
export type LabCall =
  | { tool: 'lab.move_to'; args: { target: LabPoint } }
  | { tool: 'lab.mark'; args: { label: 'signal' } };

export type LabRecordedStep = {
  atTick: number;
  call: LabCall;
};

export type LabPlaybookStep = LabRecordedStep & {
  index: number;
  timeoutTicks: number;
};

export type LabPlaybook = {
  v: 1;
  name: string;
  tickRate: typeof PLAYBOOK_TICK_RATE;
  scope: 'playbook-lab';
  start: LabPoint;
  capabilityCeiling: { tools: readonly LabTool[] };
  failure: 'halt';
  steps: readonly LabPlaybookStep[];
  provenance:
    | { kind: 'recorded'; parentHash: null; seed: null; mutation: null }
    | { kind: 'corrupted'; parentHash: string; seed: string; mutation: 'offset-target' | 'delay-step' };
  hash: string;
};

export type LabPlaybookValidation = { ok: true; value: LabPlaybook } | { ok: false; reasons: string[] };
export type LabPlaybackMode = 'agent' | 'echo';
export type LabPlaybackStatus = 'running' | 'complete' | 'failed';
export type LabPlaybackEvent =
  | { type: 'accepted'; tick: number; step: number; tool: LabTool }
  | { type: 'moved'; tick: number; position: LabPoint }
  | { type: 'marked' | 'jammed'; tick: number; position: LabPoint }
  | { type: 'complete'; tick: number }
  | { type: 'failed'; tick: number; reason: string };

export type LabPlaybackSnapshot = {
  tick: number;
  status: LabPlaybackStatus;
  cursor: number;
  position: LabPoint;
  marks: number;
  reason: string | null;
};

export function createRecordedPlaybook(name: string, start: LabPoint, recorded: readonly LabRecordedStep[]): LabPlaybook {
  const steps: LabPlaybookStep[] = [];
  let position = clonePoint(start);
  for (let index = 0; index < recorded.length; index += 1) {
    const entry = recorded[index]!;
    const timeoutTicks = entry.call.tool === 'lab.move_to' ? moveTicks(position, entry.call.args.target) + 1 : 1;
    steps.push({
      index,
      atTick: entry.atTick,
      timeoutTicks,
      call: cloneCall(entry.call),
    });
    if (entry.call.tool === 'lab.move_to') position = clonePoint(entry.call.args.target);
  }

  const payload: Omit<LabPlaybook, 'hash'> = {
    v: 1,
    name,
    tickRate: PLAYBOOK_TICK_RATE,
    scope: 'playbook-lab',
    start: clonePoint(start),
    capabilityCeiling: { tools: [...LAB_TOOLS] },
    failure: 'halt',
    steps,
    provenance: { kind: 'recorded', parentHash: null, seed: null, mutation: null },
  };
  const playbook = withHash(payload);
  const validation = validatePlaybook(playbook);
  if (!validation.ok) throw new Error(validation.reasons.join(' '));
  return validation.value;
}

export function corruptPlaybook(raw: unknown, seed: string): LabPlaybookValidation {
  const validation = validatePlaybook(raw);
  if (!validation.ok) return validation;
  const source = validation.value;
  const cleanSeed = seed.trim().slice(0, 64);
  if (!cleanSeed) return { ok: false, reasons: ['corruption seed must be non-empty'] };

  const steps = source.steps.map(cloneStep);
  const targetMutations = targetMutationCandidates(source);
  let mutation: 'offset-target' | 'delay-step';

  if (targetMutations.length > 0) {
    mutation = 'offset-target';
    const choice = hashNumber(`${source.hash}:${cleanSeed}`);
    const selected = targetMutations[choice % targetMutations.length]!;
    steps[selected.stepIndex]!.call = { tool: 'lab.move_to', args: { target: clonePoint(selected.target) } };
  } else {
    mutation = 'delay-step';
    const step = steps.at(-1)!;
    const previous = steps.at(-2);
    const earliestTick = previous
      ? previous.call.tool === 'lab.move_to'
        ? previous.atTick + previous.timeoutTicks - 1
        : previous.atTick
      : 1;
    const latestTick = PLAYBOOK_MAX_TICKS - step.timeoutTicks;
    if (step.atTick < latestTick) step.atTick += 1;
    else if (step.atTick > earliestTick) step.atTick -= 1;
    else return { ok: false, reasons: ['no bounded timing mutation is available'] };
  }

  const payload: Omit<LabPlaybook, 'hash'> = {
    ...withoutHash(source),
    steps,
    provenance: { kind: 'corrupted', parentHash: source.hash, seed: cleanSeed, mutation },
  };
  return validatePlaybook(withHash(payload));
}

export function validatePlaybook(value: unknown): LabPlaybookValidation {
  const reasons: string[] = [];
  if (!isRecord(value)) return { ok: false, reasons: ['playbook must be an object'] };
  exactKeys(value, ['v', 'name', 'tickRate', 'scope', 'start', 'capabilityCeiling', 'failure', 'steps', 'provenance', 'hash'], 'playbook', reasons);
  if (value.v !== 1) reasons.push('v must be 1');
  if (typeof value.name !== 'string' || value.name.trim().length < 1 || value.name.length > 48) reasons.push('name must be 1-48 characters');
  if (value.tickRate !== PLAYBOOK_TICK_RATE) reasons.push(`tickRate must be ${PLAYBOOK_TICK_RATE}`);
  if (value.scope !== 'playbook-lab') reasons.push('scope must be playbook-lab');
  if (!validPoint(value.start)) reasons.push('start must be an in-bounds integer point');
  if (value.failure !== 'halt') reasons.push('failure must be halt');

  const ceiling = value.capabilityCeiling;
  if (!isRecord(ceiling)) reasons.push('capabilityCeiling must be an object');
  else {
    exactKeys(ceiling, ['tools'], 'capabilityCeiling', reasons);
    if (!Array.isArray(ceiling.tools) || stableStringify(ceiling.tools) !== stableStringify(LAB_TOOLS)) {
      reasons.push('capabilityCeiling.tools must equal the lab allowlist');
    }
  }

  const steps: LabPlaybookStep[] = [];
  if (!Array.isArray(value.steps) || value.steps.length < 1 || value.steps.length > PLAYBOOK_MAX_STEPS) {
    reasons.push(`steps must contain 1-${PLAYBOOK_MAX_STEPS} entries`);
  } else {
    let previousTick = 0;
    let durationTicks = 0;
    for (let index = 0; index < value.steps.length; index += 1) {
      const step = decodeStep(value.steps[index], index, reasons);
      if (!step) continue;
      if (step.atTick < previousTick) reasons.push(`steps[${index}].atTick must not move backwards`);
      previousTick = step.atTick;
      durationTicks = Math.max(durationTicks, step.atTick + step.timeoutTicks);
      steps.push(step);
    }
    if (validPoint(value.start) && steps.length === value.steps.length) {
      let position = clonePoint(value.start);
      let busyUntil = 0;
      for (const step of steps) {
        if (step.atTick < busyUntil) reasons.push(`steps[${step.index}].atTick overlaps the previous step`);
        const expectedTimeout = timeoutFor(position, step.call);
        if (step.timeoutTicks !== expectedTimeout) reasons.push(`steps[${step.index}].timeoutTicks is not canonical`);
        busyUntil = step.call.tool === 'lab.move_to' ? step.atTick + expectedTimeout - 1 : step.atTick;
        if (step.call.tool === 'lab.move_to') position = clonePoint(step.call.args.target);
      }
    }
    if (durationTicks > PLAYBOOK_MAX_TICKS) reasons.push(`playbook exceeds ${PLAYBOOK_MAX_TICKS} ticks`);
  }

  const provenance = decodeProvenance(value.provenance, reasons);
  if (typeof value.hash !== 'string' || !HASH_PATTERN.test(value.hash)) reasons.push('hash must be fnv1a32');
  if (reasons.length > 0) return { ok: false, reasons };

  const normalized: LabPlaybook = {
    v: 1,
    name: value.name as string,
    tickRate: PLAYBOOK_TICK_RATE,
    scope: 'playbook-lab',
    start: clonePoint(value.start as LabPoint),
    capabilityCeiling: { tools: [...LAB_TOOLS] },
    failure: 'halt',
    steps,
    provenance: provenance!,
    hash: value.hash as string,
  };
  if (hashPayload(withoutHash(normalized)) !== normalized.hash) return { ok: false, reasons: ['hash does not match canonical payload'] };
  return { ok: true, value: normalized };
}

export class LabPlayback {
  private tick = 0;
  private cursor = 0;
  private position: LabPoint;
  private marks = 0;
  private status: LabPlaybackStatus = 'running';
  private reason: string | null = null;
  private activeMove: { target: LabPoint; deadline: number; cadence: number } | null = null;
  private readonly steps: readonly LabPlaybookStep[];

  constructor(raw: unknown, private readonly mode: LabPlaybackMode) {
    const validation = validatePlaybook(raw);
    if (!validation.ok) throw new Error(validation.reasons.join(' '));
    const playbook = validation.value;
    this.position = mode === 'echo' ? mirrorPoint(playbook.start) : clonePoint(playbook.start);
    this.steps = playbook.steps.map((step) => (mode === 'echo' ? mirrorStep(step) : cloneStep(step)));
  }

  get snapshot(): LabPlaybackSnapshot {
    return {
      tick: this.tick,
      status: this.status,
      cursor: this.cursor,
      position: clonePoint(this.position),
      marks: this.marks,
      reason: this.reason,
    };
  }

  advance(): LabPlaybackEvent[] {
    if (this.status !== 'running') return [];
    this.tick += 1;
    const events: LabPlaybackEvent[] = [];

    if (this.activeMove) {
      if (this.tick > this.activeMove.deadline) return this.fail('step timed out');
      this.activeMove.cadence += 1;
      if (this.activeMove.cadence >= MOVE_TICKS_PER_CELL) {
        this.activeMove.cadence = 0;
        this.position = stepToward(this.position, this.activeMove.target);
        events.push({ type: 'moved', tick: this.tick, position: clonePoint(this.position) });
      }
      if (samePoint(this.position, this.activeMove.target)) {
        this.activeMove = null;
        this.finishStep(events);
        this.startDueSteps(events);
      }
      return events;
    }
    this.startDueSteps(events);
    return events;
  }

  private startDueSteps(events: LabPlaybackEvent[]): void {
    while (this.status === 'running' && !this.activeMove) {
      const step = this.steps[this.cursor];
      if (!step || this.tick < step.atTick) return;
      if (this.tick > step.atTick) {
        events.push(...this.fail(`missed scheduled tick ${step.atTick}`));
        return;
      }
      events.push({ type: 'accepted', tick: this.tick, step: step.index, tool: step.call.tool });
      if (step.call.tool === 'lab.mark') {
        this.marks += 1;
        events.push({ type: this.mode === 'echo' ? 'jammed' : 'marked', tick: this.tick, position: clonePoint(this.position) });
        this.finishStep(events);
        continue;
      }
      this.activeMove = {
        target: clonePoint(step.call.args.target),
        deadline: this.tick + step.timeoutTicks,
        cadence: 0,
      };
      if (samePoint(this.position, this.activeMove.target)) {
        this.activeMove = null;
        this.finishStep(events);
      }
    }
  }

  private finishStep(events: LabPlaybackEvent[]): void {
    this.cursor += 1;
    if (this.steps[this.cursor]) return;
    this.status = 'complete';
    events.push({ type: 'complete', tick: this.tick });
  }

  private fail(reason: string): LabPlaybackEvent[] {
    this.status = 'failed';
    this.reason = reason;
    return [{ type: 'failed', tick: this.tick, reason }];
  }
}

function decodeStep(value: unknown, index: number, reasons: string[]): LabPlaybookStep | null {
  const label = `steps[${index}]`;
  if (!isRecord(value)) {
    reasons.push(`${label} must be an object`);
    return null;
  }
  exactKeys(value, ['index', 'atTick', 'timeoutTicks', 'call'], label, reasons);
  if (value.index !== index) reasons.push(`${label}.index must be ${index}`);
  if (!integerInRange(value.atTick, 1, PLAYBOOK_MAX_TICKS)) reasons.push(`${label}.atTick is out of range`);
  if (!integerInRange(value.timeoutTicks, 1, MAX_STEP_TIMEOUT_TICKS)) reasons.push(`${label}.timeoutTicks is out of range`);
  const call = decodeCall(value.call, label, reasons);
  if (!call || !integerInRange(value.atTick, 1, PLAYBOOK_MAX_TICKS) || !integerInRange(value.timeoutTicks, 1, MAX_STEP_TIMEOUT_TICKS)) return null;
  return {
    index,
    atTick: value.atTick as number,
    timeoutTicks: value.timeoutTicks as number,
    call,
  };
}

function decodeCall(value: unknown, label: string, reasons: string[]): LabCall | null {
  if (!isRecord(value)) {
    reasons.push(`${label}.call must be an object`);
    return null;
  }
  exactKeys(value, ['tool', 'args'], `${label}.call`, reasons);
  if (value.tool !== 'lab.move_to' && value.tool !== 'lab.mark') {
    reasons.push(`${label}.call.tool is not allowed`);
    return null;
  }
  if (!isRecord(value.args)) {
    reasons.push(`${label}.call.args must be an object`);
    return null;
  }
  if (value.tool === 'lab.move_to') {
    exactKeys(value.args, ['target'], `${label}.call.args`, reasons);
    if (!validPoint(value.args.target)) {
      reasons.push(`${label}.call.args.target is invalid`);
      return null;
    }
    return { tool: 'lab.move_to', args: { target: clonePoint(value.args.target) } };
  }
  exactKeys(value.args, ['label'], `${label}.call.args`, reasons);
  if (value.args.label !== 'signal') {
    reasons.push(`${label}.call.args.label must be signal`);
    return null;
  }
  return { tool: 'lab.mark', args: { label: 'signal' } };
}

function decodeProvenance(value: unknown, reasons: string[]): LabPlaybook['provenance'] | null {
  if (!isRecord(value)) {
    reasons.push('provenance must be an object');
    return null;
  }
  exactKeys(value, ['kind', 'parentHash', 'seed', 'mutation'], 'provenance', reasons);
  if (value.kind === 'recorded' && value.parentHash === null && value.seed === null && value.mutation === null) {
    return { kind: 'recorded', parentHash: null, seed: null, mutation: null };
  }
  if (
    value.kind === 'corrupted' &&
    typeof value.parentHash === 'string' &&
    HASH_PATTERN.test(value.parentHash) &&
    typeof value.seed === 'string' &&
    value.seed.length >= 1 &&
    value.seed.length <= 64 &&
    (value.mutation === 'offset-target' || value.mutation === 'delay-step')
  ) {
    return {
      kind: 'corrupted',
      parentHash: value.parentHash,
      seed: value.seed,
      mutation: value.mutation,
    };
  }
  reasons.push('provenance is inconsistent');
  return null;
}

function withHash(payload: Omit<LabPlaybook, 'hash'>): LabPlaybook {
  return { ...payload, hash: hashPayload(payload) };
}

function withoutHash(playbook: LabPlaybook): Omit<LabPlaybook, 'hash'> {
  const { hash: _hash, ...payload } = playbook;
  return payload;
}

function hashPayload(payload: Omit<LabPlaybook, 'hash'>): string {
  return `fnv1a32:${hashNumber(stableStringify(payload)).toString(16).padStart(8, '0')}`;
}

function hashNumber(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (!isRecord(value)) return JSON.stringify(value);
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string, reasons: string[]): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (stableStringify(actual) !== stableStringify(wanted)) reasons.push(`${label} has unexpected or missing fields`);
}

function integerInRange(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}

function validPoint(value: unknown): value is LabPoint {
  return (
    isRecord(value) &&
    exactPointKeys(value) &&
    integerInRange(value.x, 0, PLAYBOOK_GRID_WIDTH - 1) &&
    integerInRange(value.z, 0, PLAYBOOK_GRID_HEIGHT - 1)
  );
}

function exactPointKeys(value: Record<string, unknown>): boolean {
  return stableStringify(Object.keys(value).sort()) === stableStringify(['x', 'z']);
}

function moveTicks(from: LabPoint, to: LabPoint): number {
  return (Math.abs(to.x - from.x) + Math.abs(to.z - from.z)) * MOVE_TICKS_PER_CELL;
}

function stepToward(from: LabPoint, to: LabPoint): LabPoint {
  if (from.x !== to.x) return { x: from.x + Math.sign(to.x - from.x), z: from.z };
  if (from.z !== to.z) return { x: from.x, z: from.z + Math.sign(to.z - from.z) };
  return clonePoint(from);
}

function mirrorPoint(point: LabPoint): LabPoint {
  return { x: PLAYBOOK_GRID_WIDTH - 1 - point.x, z: point.z };
}

function mirrorStep(step: LabPlaybookStep): LabPlaybookStep {
  const copy = cloneStep(step);
  if (copy.call.tool === 'lab.move_to') copy.call.args.target = mirrorPoint(copy.call.args.target);
  return copy;
}

function samePoint(left: LabPoint, right: LabPoint): boolean {
  return left.x === right.x && left.z === right.z;
}

function clonePoint(point: LabPoint): LabPoint {
  return { x: point.x, z: point.z };
}

function cloneCall(call: LabCall): LabCall {
  return call.tool === 'lab.move_to'
    ? { tool: 'lab.move_to', args: { target: clonePoint(call.args.target) } }
    : { tool: 'lab.mark', args: { label: 'signal' } };
}

function cloneStep(step: LabPlaybookStep): LabPlaybookStep {
  return { ...step, call: cloneCall(step.call) };
}

function targetMutationCandidates(source: LabPlaybook): Array<{ stepIndex: number; target: LabPoint }> {
  const candidates: Array<{ stepIndex: number; target: LabPoint }> = [];
  let position = clonePoint(source.start);
  const offsets = [
    { x: -1, z: -1 },
    { x: 0, z: -1 },
    { x: 1, z: -1 },
    { x: -1, z: 0 },
    { x: 1, z: 0 },
    { x: -1, z: 1 },
    { x: 0, z: 1 },
    { x: 1, z: 1 },
  ];
  for (const step of source.steps) {
    if (step.call.tool !== 'lab.move_to') continue;
    const target = step.call.args.target;
    for (const offset of offsets) {
      const candidate = { x: target.x + offset.x, z: target.z + offset.z };
      if (!validPoint(candidate)) continue;
      if (timeoutFor(position, { tool: 'lab.move_to', args: { target: candidate } }) !== step.timeoutTicks) continue;
      if (!preservesCanonicalTimeouts(source, step.index, candidate)) continue;
      candidates.push({ stepIndex: step.index, target: candidate });
    }
    position = clonePoint(target);
  }
  return candidates;
}

function preservesCanonicalTimeouts(source: LabPlaybook, mutatedStepIndex: number, target: LabPoint): boolean {
  let position = clonePoint(source.start);
  for (const step of source.steps) {
    const call =
      step.index === mutatedStepIndex
        ? ({ tool: 'lab.move_to', args: { target } } as const)
        : step.call;
    if (timeoutFor(position, call) !== step.timeoutTicks) return false;
    if (call.tool === 'lab.move_to') position = clonePoint(call.args.target);
  }
  return true;
}

function timeoutFor(position: LabPoint, call: LabCall): number {
  return call.tool === 'lab.move_to' ? moveTicks(position, call.args.target) + 1 : 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
