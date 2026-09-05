import { FIXED_SIM_STEP_SECONDS, MAX_FIXED_STEPS_PER_FRAME, Loop, type LoopFrame } from '../core/Loop';
import { RUN_TAPE_SIM_VERSION, type RunTape } from '../game/RunTape';
import { isAgentOrdersAction } from '../playbook/PlaybookFormat';
import { LanternShow, readReplayEraMeta, type LanternShowState, type LanternWorldView } from '../ui/LanternShow';
import { BrowserAgentTapeReplay } from './BrowserAgentTapeReplay';
import type { AgentTapeReplaySnapshot } from './AgentTapeReplay';
import { engineEraIncludes } from './EngineEraLineage.mjs';
import engineEra from '../../assets/engine-era.json' with { type: 'json' };

export type LanternReplayState = {
  tape: RunTape;
  speed: 1 | 2 | 4;
  skipWave: number | null;
  complete: boolean;
  hash: string | null;
  agentTape: boolean;
  divergedAtWave: number | null;
  trueDriver: BrowserAgentTapeReplay | null;
  snapshot: AgentTapeReplaySnapshot | null;
  requestedTick: number;
  requestPending: boolean;
  winding: boolean;
  eraRefusal: LanternShowState['eraRefusal'];
};

/** Same legacy/agent boundary used by Game; no terrain or sim imports in this module. */
export function usesLanternWorker(tape: RunTape): boolean {
  const recordings = [tape.inputLog, ...tape.inputLog.streams];
  const hasAgentOrders = recordings.some((recording) => recording.entries.some((entry) => entry.a.some(isAgentOrdersAction)));
  const meta = readReplayEraMeta(tape);
  const carriesEraStamp = meta?.era !== undefined || meta?.engineHash !== undefined;
  const eraRefused = carriesEraStamp && Boolean(replayEraRefusal(tape));
  return (tape.inputLog.playbookUses?.length ?? 0) === 0 && Boolean((hasAgentOrders && meta?.engineHash && meta.era) || eraRefused);
}

function replayEraRefusal(tape: RunTape): LanternShowState['eraRefusal'] {
  const meta = readReplayEraMeta(tape);
  return !meta?.engineHash || meta.era !== engineEra.era || !engineEraIncludes(engineEra, meta.engineHash)
    ? { tapeHash: meta?.engineHash && meta.era ? meta.engineHash : `unstamped build ${meta?.buildId ?? 'unknown'}`, currentHash: engineEra.engineHash, tapeEra: meta?.engineHash && meta.era ? meta.era : null, currentEra: engineEra.era }
    : null;
}

/** Presentation and worker pacing shared by the standalone watch route and Game's agent replay. */
export class LanternController {
  readonly replay: LanternReplayState;
  private readonly show: LanternShow;
  private readonly loop: Loop;
  private paused = false;
  private disposed = false;

  constructor(parent: HTMLElement, tape: RunTape, options: {
    close: () => void;
    shareUrl?: string;
    tactical: boolean;
    world?: LanternWorldView;
    heightAt?: (x: number, z: number) => number;
    pan?: (dx: number, dz: number) => void;
    render?: (frame: Readonly<LoopFrame>, snapshot: AgentTapeReplaySnapshot | null, paused: boolean, speed: number) => void;
  }) {
    if (tape.simVersion !== RUN_TAPE_SIM_VERSION) throw new Error('Run tape sim version mismatch.');
    this.replay = {
      tape, speed: 1, skipWave: null, complete: false, hash: null, agentTape: true, divergedAtWave: null,
      trueDriver: null, snapshot: null, requestedTick: 0, requestPending: false, winding: false, eraRefusal: null,
    };
    this.loop = new Loop(() => this.step(), (frame) => {
      options.render?.(frame, this.replay.snapshot, this.paused || this.replay.complete, this.replay.speed);
    }, { stepSeconds: FIXED_SIM_STEP_SECONDS, maxStepsPerFrame: MAX_FIXED_STEPS_PER_FRAME });
    this.show = new LanternShow(parent, tape, {
      pause: (paused) => this.pause(paused), speed: (speed) => this.speed(speed), restart: () => this.restart(),
      skipWave: () => this.skipWave(), close: options.close, pan: options.pan ?? (() => undefined),
    }, options.shareUrl, { tactical: options.tactical, world: options.world, heightAt: options.heightAt });
    this.restart();
    this.loop.start();
  }

  restart(): void {
    this.replay.trueDriver?.dispose();
    const eraRefusal = replayEraRefusal(this.replay.tape);
    const driver = eraRefusal ? null : new BrowserAgentTapeReplay(this.replay.tape);
    Object.assign(this.replay, {
      speed: 1, skipWave: null, complete: eraRefusal !== null, hash: null, trueDriver: driver,
      snapshot: null, requestedTick: 0, requestPending: driver !== null, winding: driver !== null, eraRefusal,
    });
    this.paused = eraRefusal !== null;
    this.loop.setTimeScale(1);
    if (driver) void driver.start().then((reply) => {
      if (this.disposed || this.replay.trueDriver !== driver) return;
      this.replay.snapshot = reply.snapshot ?? null;
      this.replay.requestedTick = this.replay.snapshot?.tick ?? 0;
      this.replay.requestPending = false;
      this.replay.winding = false;
      this.sync();
    }).catch((error) => { if (!this.disposed && this.replay.trueDriver === driver) this.fail(error); });
    this.sync();
  }

  private step(): boolean {
    if (!this.replay.trueDriver || this.replay.complete || this.paused) return false;
    this.replay.requestedTick += 1;
    this.pump();
    return true;
  }

  private pump(): void {
    const current = this.replay;
    const driver = current.trueDriver;
    if (!driver || current.complete || current.requestPending) return;
    current.requestPending = true;
    const target = current.skipWave === null ? current.requestedTick : current.tape.inputLog.durationTicks + 18_000;
    void driver.advance(target, current.skipWave ?? undefined).then((reply) => {
      if (this.disposed || current.trueDriver !== driver) return;
      current.requestPending = false;
      current.snapshot = reply.snapshot ?? current.snapshot;
      current.winding = false;
      if (current.skipWave !== null && (current.snapshot?.wave ?? 0) >= current.skipWave) {
        current.skipWave = null;
        current.requestedTick = current.snapshot?.tick ?? current.requestedTick;
        this.loop.setTimeScale(current.speed);
      }
      if (reply.result) {
        current.hash = reply.result.eventLogHash;
        current.complete = true;
        current.skipWave = null;
        this.paused = true;
        this.loop.setTimeScale(1);
      } else if (!this.paused && (current.skipWave !== null || current.requestedTick > (current.snapshot?.tick ?? 0))) this.pump();
      this.sync();
    }).catch((error) => { if (!this.disposed && current.trueDriver === driver) this.fail(error); });
  }

  private fail(error: unknown): void {
    console.error('[lantern-show] true replay failed', error);
    this.replay.requestPending = false;
    this.replay.winding = false;
    this.replay.complete = true;
    this.paused = true;
    this.sync();
  }

  pause(paused: boolean): void {
    if (this.replay.complete) return;
    this.replay.skipWave = null;
    this.paused = paused;
    this.loop.setTimeScale(this.replay.speed);
    this.sync();
    if (!paused) this.pump();
  }

  speed(speed: 1 | 2 | 4): void {
    if (this.replay.complete) return;
    this.replay.speed = speed;
    this.replay.skipWave = null;
    this.loop.setTimeScale(speed);
    this.sync();
  }

  skipWave(): void {
    if (this.replay.complete) return;
    this.replay.skipWave = (this.replay.snapshot?.wave ?? 0) + 1;
    this.paused = false;
    this.loop.setTimeScale(16);
    this.sync();
  }

  sync(): void {
    const replay = this.replay;
    this.show.update({
      tick: Math.min(replay.snapshot?.tick ?? 0, replay.tape.inputLog.durationTicks),
      durationTicks: replay.tape.inputLog.durationTicks, wave: replay.snapshot?.wave ?? 0,
      paused: !replay.complete && this.paused, speed: replay.speed, skipping: replay.skipWave !== null,
      complete: replay.complete, hash: replay.hash, expectedHash: replay.tape.eventLogHash,
      agentTape: true, divergedAtWave: null, snapshot: replay.snapshot, winding: replay.winding, eraRefusal: replay.eraRefusal,
    });
  }

  dispose(): void {
    this.disposed = true;
    this.loop.stop();
    this.replay.trueDriver?.dispose();
    this.show.dispose();
  }
}
