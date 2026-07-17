import {
  lockstepActionsFromSample,
  zeroLockstepSampleEdgeState,
  type LockstepAction,
  type LockstepInput,
  type LockstepSample,
  type LockstepSampleEdgeState,
} from '../mp/LockstepClient';
import {
  MAX_PLAYBOOK_INTENTS,
  MAX_PLAYBOOK_TICKS,
  PLAYBOOK_STEP_SECONDS,
  PLAYBOOK_VERSION,
  canonicalPlaybookText,
  playbookHash,
  quantizePlaybookCoordinate,
  type PlaybookEntry,
  type PlaybookRecording,
  type PlaybookTruncation,
} from './PlaybookFormat';

// Semantic outcome probes ride the audit's representation boundary: quantized
// positions at fixed tick cadence, never wall-clock, never raw log bytes.
export const PLAYBOOK_PROBE_EVERY_TICKS = 30;

export type PlaybookProbe = { t: number; x: number; z: number };

/**
 * Verbs a replaying agent may execute. Session/meta verbs (restart, death and
 * research choices, consent toggles, pausing, debug grants) stay player-only:
 * assigning wider autonomy is PB-03's rung-gated consent work, so the replay
 * actor is conservative by construction and skips them LOUDLY.
 */
export const REPLAYABLE_PLAYBOOK_ACTIONS: ReadonlySet<LockstepAction['type']> = new Set([
  'place_build',
  'weapon_toggle',
  'context_action',
]);

/**
 * Verbs the recorder refuses to re-route through the lockstep apply path while
 * recording (they defer run transitions that only the multiplayer client
 * flushes). They surface in the recording status instead of silently applying.
 */
export const RECORD_SKIP_ACTIONS: ReadonlySet<LockstepAction['type']> = new Set([
  'restart',
  'death_action',
  'secure_choice',
  'research_pick',
  'research_skip',
]);

export type PlaybookHeader = {
  contractId: string;
  seed: string;
  difficultyPreset: string;
  start: { x: number; z: number };
};

export type PlaybookRecorderStatus = {
  mode: 'record';
  finished: boolean;
  scripted: boolean;
  ticks: number;
  entries: number;
  truncated: PlaybookTruncation | null;
  skippedActions: Array<{ t: number; type: string }>;
};

export class PlaybookRecorderSession {
  private readonly entries: PlaybookEntry[] = [];
  private readonly probes: PlaybookProbe[] = [];
  private readonly script: PlaybookEntry[] | null;
  private scriptIndex = 0;
  private scriptMx = 0;
  private scriptMy = 0;
  private edgeState: LockstepSampleEdgeState = zeroLockstepSampleEdgeState();
  private tick = 0;
  private lastMx = 0;
  private lastMy = 0;
  private truncation: PlaybookTruncation | null = null;
  private stopped = false;
  readonly skippedActions: Array<{ t: number; type: string }> = [];

  constructor(
    private readonly header: PlaybookHeader,
    script: PlaybookEntry[] | null,
    private readonly probeEvery = PLAYBOOK_PROBE_EVERY_TICKS,
  ) {
    this.script = script;
  }

  get finished(): boolean {
    return this.stopped || this.truncation !== null;
  }

  get scripted(): boolean {
    return this.script !== null;
  }

  get probeSamples(): readonly PlaybookProbe[] {
    return this.probes;
  }

  get ticks(): number {
    return this.tick;
  }

  /** Scripted recordings replace the live sample entirely (deterministic e2e drive). */
  nextScriptSample(): LockstepSample | null {
    if (!this.script) return null;
    const queuedActions: LockstepAction[] = [];
    while (this.scriptIndex < this.script.length && this.script[this.scriptIndex].t === this.tick) {
      const entry = this.script[this.scriptIndex];
      this.scriptMx = entry.mx;
      this.scriptMy = entry.my;
      queuedActions.push(...entry.a);
      this.scriptIndex += 1;
    }
    return {
      mx: this.scriptMx,
      my: this.scriptMy,
      confirm: false,
      upgrade: false,
      rotateBuild: false,
      weaponToggle: false,
      build: false,
      cancel: false,
      buildSlot: null,
      restart: false,
      pause: false,
      pauseTarget: null,
      debugSpawn: false,
      debugXp: false,
      queuedActions,
    };
  }

  /**
   * Consumes one tick's sample at the intent seam. Returns the LockstepInput
   * the sim must consume this tick, or null once the tape is closed (bounds
   * law 6 — the caller falls back to plain solo consumption).
   */
  recordTick(sample: LockstepSample, position: { x: number; z: number }): LockstepInput | null {
    if (this.finished) return null;
    if (this.tick >= MAX_PLAYBOOK_TICKS) {
      this.truncate('max-ticks');
      return null;
    }
    const { actions, next } = lockstepActionsFromSample(sample, this.edgeState);
    this.edgeState = next;
    const input: LockstepInput = { mx: sample.mx, my: sample.my, actions };
    const moved = input.mx !== this.lastMx || input.my !== this.lastMy;
    if (moved || input.actions.length > 0) {
      if (this.entries.length >= MAX_PLAYBOOK_INTENTS) {
        this.truncate('max-entries');
        return null;
      }
      this.entries.push({ t: this.tick, mx: input.mx, my: input.my, a: input.actions.map(cloneAction) });
      this.lastMx = input.mx;
      this.lastMy = input.my;
    }
    if (this.tick % this.probeEvery === 0) {
      this.probes.push({
        t: this.tick,
        x: quantizePlaybookCoordinate(position.x),
        z: quantizePlaybookCoordinate(position.z),
      });
    }
    this.tick += 1;
    return input;
  }

  recordSkippedAction(type: string): void {
    this.skippedActions.push({ t: this.tick, type });
  }

  truncate(reason: PlaybookTruncation['reason']): void {
    if (this.finished) return;
    this.truncation = { reason, atTick: this.tick };
    // Loud-truncation law (no silent caps): the cut is announced, flagged in
    // the status surface, and stamped into the tape itself.
    console.warn(`[playbook] recording truncated: ${reason} at tick ${this.tick}`);
  }

  finish(name: string): { playbook: PlaybookRecording; text: string; hash: string } {
    this.stopped = true;
    const playbook: PlaybookRecording = {
      version: PLAYBOOK_VERSION,
      name: name.trim() || 'untitled',
      contractId: this.header.contractId,
      seed: this.header.seed,
      difficultyPreset: this.header.difficultyPreset,
      stepSeconds: PLAYBOOK_STEP_SECONDS,
      start: {
        x: quantizePlaybookCoordinate(this.header.start.x),
        z: quantizePlaybookCoordinate(this.header.start.z),
      },
      durationTicks: this.truncation ? this.truncation.atTick : this.tick,
      entries: this.entries.map((entry) => ({ ...entry, a: entry.a.map(cloneAction) })),
      truncated: this.truncation,
    };
    return { playbook, text: canonicalPlaybookText(playbook), hash: playbookHash(playbook) };
  }

  status(): PlaybookRecorderStatus {
    return {
      mode: 'record',
      finished: this.finished,
      scripted: this.scripted,
      ticks: this.tick,
      entries: this.entries.length,
      truncated: this.truncation,
      skippedActions: [...this.skippedActions],
    };
  }
}

export type PlaybookReplayStatus = {
  mode: 'replay';
  name: string;
  hash: string;
  tick: number;
  durationTicks: number;
  complete: boolean;
  stopped: boolean;
  appliedActions: number;
  skippedActions: Array<{ t: number; type: string }>;
};

export class PlaybookReplaySession {
  private index = 0;
  private tick = 0;
  private mx = 0;
  private my = 0;
  private stopped = false;
  private applied = 0;
  private readonly probes: PlaybookProbe[] = [];
  readonly skippedActions: Array<{ t: number; type: string }> = [];
  readonly hash: string;

  constructor(
    readonly playbook: PlaybookRecording,
    private readonly probeEvery = PLAYBOOK_PROBE_EVERY_TICKS,
  ) {
    this.hash = playbookHash(playbook);
  }

  get complete(): boolean {
    return this.tick >= this.playbook.durationTicks;
  }

  get active(): boolean {
    return !this.stopped;
  }

  get probeSamples(): readonly PlaybookProbe[] {
    return this.probes;
  }

  stop(): void {
    this.stopped = true;
  }

  /**
   * Advances one tick and returns the input the replay actor consumes. After
   * the tape ends the actor idles (zero input) so the world stays coherent;
   * null only after an explicit stop.
   */
  step(position: { x: number; z: number } | null): LockstepInput | null {
    if (this.stopped) return null;
    if (this.complete) {
      this.tick += 1;
      return { mx: 0, my: 0, actions: [] };
    }
    const actions: LockstepAction[] = [];
    while (this.index < this.playbook.entries.length && this.playbook.entries[this.index].t === this.tick) {
      const entry = this.playbook.entries[this.index];
      this.mx = entry.mx;
      this.my = entry.my;
      for (const action of entry.a) {
        if (REPLAYABLE_PLAYBOOK_ACTIONS.has(action.type)) {
          actions.push(cloneAction(action));
        } else {
          // No privileged paths AND no silent drops: unsupported verbs are logged.
          this.skippedActions.push({ t: this.tick, type: action.type });
        }
      }
      this.index += 1;
    }
    if (position && this.tick % this.probeEvery === 0) {
      this.probes.push({
        t: this.tick,
        x: quantizePlaybookCoordinate(position.x),
        z: quantizePlaybookCoordinate(position.z),
      });
    }
    this.applied += actions.length;
    this.tick += 1;
    return { mx: this.mx, my: this.my, actions };
  }

  status(): PlaybookReplayStatus {
    return {
      mode: 'replay',
      name: this.playbook.name,
      hash: this.hash,
      tick: this.tick,
      durationTicks: this.playbook.durationTicks,
      complete: this.complete,
      stopped: this.stopped,
      appliedActions: this.applied,
      skippedActions: [...this.skippedActions],
    };
  }
}

function cloneAction(action: LockstepAction): LockstepAction {
  return structuredClone(action);
}
