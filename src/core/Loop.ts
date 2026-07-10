export const FIXED_SIM_STEP_SECONDS = 1 / 30;
export const MAX_FIXED_STEPS_PER_FRAME = 5;

export type LoopFrame = {
  deltaSeconds: number;
  presentationDeltaSeconds: number;
  alpha: number;
  steps: number;
  droppedSeconds: number;
};

export type LoopDiagnostics = {
  fixed: boolean;
  stepSeconds: number;
  alpha: number;
  stepsLastFrame: number;
  totalSteps: number;
  droppedSeconds: number;
  droppedTicks: number;
};

type LoopOptions = {
  stepSeconds?: number;
  maxStepsPerFrame?: number;
};

const MAX_PRESENTATION_DELTA_SECONDS = 0.05;
const STEP_EPSILON = 1e-9;

export class Loop {
  private frameId = 0;
  private lastTime = 0;
  private running = false;
  private accumulator = 0;
  private readonly frame: LoopFrame = {
    deltaSeconds: 0,
    presentationDeltaSeconds: 0,
    alpha: 1,
    steps: 0,
    droppedSeconds: 0,
  };
  private readonly state: LoopDiagnostics;
  private readonly stepSeconds: number;
  private readonly maxStepsPerFrame: number;

  constructor(
    private readonly update: (deltaSeconds: number) => boolean | void,
    private readonly render: (frame: Readonly<LoopFrame>) => void,
    options: LoopOptions = {},
  ) {
    this.stepSeconds = finitePositive(options.stepSeconds) ?? 0;
    this.maxStepsPerFrame = Math.max(1, Math.floor(finitePositive(options.maxStepsPerFrame) ?? 1));
    this.state = {
      fixed: this.stepSeconds > 0,
      stepSeconds: this.stepSeconds,
      alpha: this.stepSeconds > 0 ? 0 : 1,
      stepsLastFrame: 0,
      totalSteps: 0,
      droppedSeconds: 0,
      droppedTicks: 0,
    };
  }

  get diagnostics(): Readonly<LoopDiagnostics> {
    return this.state;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.resetTiming();
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  resetTiming(): void {
    this.accumulator = 0;
    this.frame.deltaSeconds = 0;
    this.frame.presentationDeltaSeconds = 0;
    this.frame.alpha = this.stepSeconds > 0 ? 0 : 1;
    this.frame.steps = 0;
    this.frame.droppedSeconds = 0;
    this.state.alpha = this.frame.alpha;
    this.state.stepsLastFrame = 0;
    this.state.totalSteps = 0;
    this.state.droppedSeconds = 0;
    this.state.droppedTicks = 0;
  }

  /** Drives the same frame path as requestAnimationFrame; debug gates use this after stop(). */
  advanceFrame(deltaSeconds: number): void {
    this.runFrame(deltaSeconds, false);
  }

  private readonly tick = (time: number) => {
    if (!this.running) return;
    const deltaSeconds = Math.max(0, (time - this.lastTime) / 1000);
    this.lastTime = time;
    this.runFrame(deltaSeconds, true);
    if (this.running) this.frameId = requestAnimationFrame(this.tick);
  };

  private runFrame(deltaSeconds: number, stopAware: boolean): void {
    const delta = Number.isFinite(deltaSeconds) ? Math.max(0, deltaSeconds) : 0;
    this.frame.deltaSeconds = delta;
    this.frame.presentationDeltaSeconds = Math.min(delta, MAX_PRESENTATION_DELTA_SECONDS);
    this.frame.steps = 0;
    this.frame.droppedSeconds = 0;

    if (this.stepSeconds <= 0) {
      this.update(this.frame.presentationDeltaSeconds);
      this.frame.steps = 1;
      this.frame.alpha = 1;
      this.state.totalSteps += 1;
    } else {
      this.accumulator += delta;
      while (
        this.accumulator + STEP_EPSILON >= this.stepSeconds &&
        this.frame.steps < this.maxStepsPerFrame &&
        (!stopAware || this.running)
      ) {
        if (this.update(this.stepSeconds) === false) break;
        this.accumulator -= this.stepSeconds;
        if (this.accumulator < 0 && this.accumulator > -STEP_EPSILON) this.accumulator = 0;
        this.frame.steps += 1;
        this.state.totalSteps += 1;
      }

      if (this.frame.steps === this.maxStepsPerFrame && this.accumulator + STEP_EPSILON >= this.stepSeconds) {
        const droppedTicks = Math.floor((this.accumulator + STEP_EPSILON) / this.stepSeconds);
        const droppedSeconds = droppedTicks * this.stepSeconds;
        this.accumulator = Math.max(0, this.accumulator - droppedSeconds);
        this.frame.droppedSeconds = droppedSeconds;
        this.state.droppedSeconds += droppedSeconds;
        this.state.droppedTicks += droppedTicks;
      }
      this.frame.alpha = Math.min(1, Math.max(0, this.accumulator / this.stepSeconds));
    }

    this.state.alpha = this.frame.alpha;
    this.state.stepsLastFrame = this.frame.steps;
    if (!stopAware || this.running) this.render(this.frame);
  }
}

function finitePositive(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}
