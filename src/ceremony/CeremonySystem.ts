import './ceremony.css';
import { SoundSystem } from '../audio/SoundSystem';
import { soundManifest, type SoundManifestEntry, type SoundName } from '../audio/manifest';
import {
  activateEpoch,
  activeEpochId,
  epochIsActive,
  epochMegaprojectComplete,
  loadEpoch,
} from '../meta/ContractFamilies';
import { browserResearchStorage, loadResearchState, scienceMeter } from '../meta/ResearchTree';
import { emitStorySignal } from '../story';
import { e7SignalExitBeatReady } from '../systems/E7SignalSystem';
import { ConvoyBehavior, type ConvoyPathEntity } from '../systems/ConvoyBehavior';
import {
  CEREMONY_KEPT_IMAGE_EVENT,
  CEREMONY_SCRIPTS,
  ceremonyKeptImageKey,
  ceremonyScriptForEpoch,
  type CeremonyPhase,
  type CeremonyScript,
} from './scripts';
import { drawCeremonyStage, type StageHandState } from './stages';

export { CEREMONY_KEPT_IMAGE_EVENT, ceremonyKeptImageKey };

/** Post-crest coast factor: staging rolls the haul down to the wet sand. */
const DRIVE_COAST_FACTOR = 0.4;
const KEPT_IMAGE_WIDTH = 240;
const MAX_STAGE_DPR = 2;

export type CeremonyKeptImageDetail = {
  version: 1;
  ceremonyId: string;
  interstitial: string;
  epochId: string;
  successorId: string | null;
  caption: string;
  capturedAtMs: number;
  stored: boolean;
  key: string;
};

export type CeremonyDiagnostics = {
  registered: string[];
  doorState: 'legacy' | 'hidden' | 'needs-science' | 'needs-exit-beat' | 'ceremony-ready';
  armableId: string | null;
  open: boolean;
  ceremonyId: string | null;
  phase: string | null;
  phaseKind: string | null;
  direction: string | null;
  hand: {
    kind: string;
    held: boolean;
    holdMs: number;
    goodPulls: number;
    pullsRequired: number;
    windowOpen: boolean;
    passPulls: number;
    passPullsRequired: number;
  } | null;
  convoy: { leaderDistance: number; total: number; fraction: number; followers: number } | null;
  beats: string[];
  keptImage: { captured: boolean; stored: boolean; key: string | null };
  armCount: number;
  armedEpochId: string | null;
  armFailure: string | null;
};

type CeremonyCallbacks = {
  /** The door lives in the schoolhouse; beginning the ceremony closes it. */
  onBegin: () => void;
  /** After the seam call lands: the town re-reads its era surfaces. */
  onArmed: () => void;
  /** Overlay closed (completed or abandoned): prompts return. */
  onClosed: () => void;
};

type ActiveCeremony = {
  script: CeremonyScript;
  phaseIndex: number;
  phaseElapsedMs: number;
  elapsedMs: number;
  firedBeats: Set<string>;
  startedLoops: Set<SoundName>;
  /** The seam call landed for THIS ceremony (exactly-once, per ceremony). */
  armed: boolean;
  // hold / timed-release / drive share the held state.
  held: boolean;
  holdMs: number;
  // rhythm
  goodPulls: number;
  passPulls: number;
  pendingTaps: number;
  lastPullAtMs: number;
  // drive
  convoy: ConvoyBehavior | null;
  convoyMembers: ConvoyPathEntity[];
  convoyTotal: number;
  // typed-entry
  typedValue: string;
  typedSubmitted: boolean;
  keptImageCaptured: boolean;
  keptImageStored: boolean;
  done: boolean;
};

export class CeremonySystem {
  private readonly root = document.createElement('div');
  private readonly audio = new SoundSystem();
  private active: ActiveCeremony | null = null;
  private stageCanvas: HTMLCanvasElement | null = null;
  private stageContext: CanvasRenderingContext2D | null = null;
  private directionElement: HTMLElement | null = null;
  private handButton: HTMLButtonElement | null = null;
  private beats: string[] = [];
  private armCount = 0;
  private armedEpochId: string | null = null;
  private armFailure: string | null = null;
  private overlayCleanup: () => void = () => undefined;
  private readonly onResize = () => this.sizeStage();

  constructor(private readonly callbacks: CeremonyCallbacks) {
    this.root.className = 'ceremony-layer';
    this.root.dataset.testid = 'ceremony-layer';
    this.root.hidden = true;
    document.body.append(this.root);
    window.addEventListener('resize', this.onResize);
  }

  dispose(): void {
    this.stopStartedLoops();
    this.overlayCleanup();
    window.removeEventListener('resize', this.onResize);
    this.audio.dispose();
    this.root.remove();
    this.active = null;
  }

  /** True while the ceremony stage holds the town's modal focus. */
  modalOpen(): boolean {
    return this.active !== null;
  }

  // ─── The door ──────────────────────────────────────────────────────────────
  // TRIGGER binding: the era's science ceiling + its megaproject completion +
  // the manifest successor — all read through the EXISTING functions. Returns
  // null when the active era has no framework script (T1/T2 keep their own
  // doors); otherwise the door markup ('' when nothing should show yet).
  renderDoor(): string | null {
    const activeId = activeEpochId();
    const script = ceremonyScriptForEpoch(activeId);
    if (!script) return null;
    const state = this.doorState(script);
    if (state === 'hidden') return '';
    if (state === 'needs-science') {
      const meter = this.meter(script.epochId);
      return `
        <section class="town-ui__epoch-door" data-testid="ceremony-epoch-door" data-ceremony-id="${script.id}" data-door-state="needs-science">
          <p class="town-ui__board-eyebrow">The town's next ledger</p>
          <h3>${escapeHtml(script.title)} stands ready.</h3>
          <p>The chart wants ${meter.remaining} more science${meter.remaining === 1 ? '' : 's'} before the ceremony.</p>
        </section>
      `;
    }
    if (state === 'needs-exit-beat') {
      return `
        <section class="town-ui__epoch-door" data-testid="ceremony-epoch-door" data-ceremony-id="${script.id}" data-door-state="needs-exit-beat">
          <p class="town-ui__board-eyebrow">The town's next ledger</p>
          <h3>${escapeHtml(script.title)} waits on the last signal.</h3>
          <p>The switchboard chief keeps the patched jack lit until the last frequency goes dark.</p>
        </section>
      `;
    }
    return `
      <section class="town-ui__epoch-door" data-testid="ceremony-epoch-door" data-ceremony-id="${script.id}" data-door-state="ceremony-ready">
        <p class="town-ui__board-eyebrow">The town's next ledger</p>
        <h3>${escapeHtml(script.title)} stands ready.</h3>
        <p>${escapeHtml(script.doorLine)}</p>
        <button type="button" data-begin-ceremony data-testid="begin-ceremony">Begin the ceremony</button>
      </section>
    `;
  }

  /** The player's hand on the door: opens the stage. A boot never calls this. */
  begin(): boolean {
    const script = ceremonyScriptForEpoch(activeEpochId());
    if (!script || this.active || this.doorState(script) !== 'ceremony-ready') return false;
    this.armFailure = null;
    this.active = freshCeremony(script);
    if (script.hand.kind === 'drive') this.buildConvoy(this.active, script.hand);
    this.callbacks.onBegin();
    this.openOverlay(script);
    this.enterPhase(this.active, 0);
    return true;
  }

  /** Escape hatch: before the arming lands the ceremony can be walked out of
   * and replayed — the door's arming state is derived, never consumed. After
   * the arming it is simply the way back to the town. */
  requestLeave(): void {
    if (!this.active) return;
    this.close();
  }

  update(deltaSeconds: number): void {
    const ceremony = this.active;
    if (!ceremony || ceremony.done) return;
    const deltaMs = Math.max(0, deltaSeconds) * 1000;
    ceremony.elapsedMs += deltaMs;

    const phase = ceremony.script.phases[ceremony.phaseIndex];
    if (!phase) return;
    const previousPhaseElapsed = ceremony.phaseElapsedMs;
    ceremony.phaseElapsedMs += deltaMs;

    this.fireSoundBeats(ceremony, phase, previousPhaseElapsed, ceremony.phaseElapsedMs);
    this.updateHand(ceremony, phase, deltaSeconds, deltaMs);

    if (this.phaseComplete(ceremony, phase)) this.advancePhase(ceremony);
    this.renderStage(ceremony);
  }

  diagnostics(): CeremonyDiagnostics {
    const ceremony = this.active;
    const script = ceremony?.script ?? ceremonyScriptForEpoch(activeEpochId());
    const doorState = script ? this.doorState(script) : 'legacy';
    const phase = ceremony ? ceremony.script.phases[ceremony.phaseIndex] ?? null : null;
    return {
      registered: CEREMONY_SCRIPTS.map((entry) => entry.id),
      doorState: script ? doorState : 'legacy',
      armableId: script && doorState === 'ceremony-ready' ? script.id : null,
      open: !!ceremony,
      ceremonyId: ceremony?.script.id ?? null,
      phase: ceremony?.done ? 'done' : phase?.id ?? null,
      phaseKind: ceremony?.done ? 'done' : phase?.kind ?? null,
      direction: phase?.direction ?? null,
      hand: ceremony
        ? {
            kind: ceremony.script.hand.kind,
            held: ceremony.held,
            holdMs: Math.round(ceremony.holdMs),
            goodPulls: ceremony.goodPulls,
            pullsRequired: ceremony.script.hand.kind === 'rhythm' ? ceremony.script.hand.pulls : 0,
            windowOpen: this.rhythmWindow(ceremony)?.open ?? false,
            passPulls: ceremony.passPulls,
            passPullsRequired: passPullsRequired(ceremony),
          }
        : null,
      convoy: ceremony?.convoy
        ? {
            leaderDistance: ceremony.convoy.diagnostics().leaderDistance,
            total: round3(ceremony.convoyTotal),
            fraction: round3(this.convoyFraction(ceremony)),
            followers: ceremony.convoyMembers.length - 1,
          }
        : null,
      beats: [...this.beats],
      keptImage: {
        captured: ceremony?.keptImageCaptured ?? false,
        stored: ceremony?.keptImageStored ?? false,
        key: ceremony ? ceremonyKeptImageKey(ceremony.script.id) : null,
      },
      armCount: this.armCount,
      armedEpochId: this.armedEpochId,
      armFailure: this.armFailure,
    };
  }

  // ─── Arming state (derived, never persisted) ───────────────────────────────

  private doorState(script: CeremonyScript): 'hidden' | 'needs-science' | 'needs-exit-beat' | 'ceremony-ready' {
    const epoch = loadEpoch(script.epochId);
    if (!epoch.successor || epochIsActive(epoch.successor)) return 'hidden';
    if (!epochMegaprojectComplete(epoch)) return 'hidden';
    if (!this.meter(script.epochId).complete) return 'needs-science';
    if (script.epochId === 'epoch-7-signal' && !e7SignalExitBeatReady()) return 'needs-exit-beat';
    return 'ceremony-ready';
  }

  private meter(epochId: string) {
    const storage = browserResearchStorage();
    return scienceMeter(loadResearchState(storage, storage, {}, epochId));
  }

  // ─── The phase machine ─────────────────────────────────────────────────────

  private enterPhase(ceremony: ActiveCeremony, index: number): void {
    ceremony.phaseIndex = index;
    ceremony.phaseElapsedMs = 0;
    const phase = ceremony.script.phases[index];
    if (!phase) return;
    this.root.dataset.phase = phase.id;
    this.root.dataset.phaseKind = phase.kind;
    if (this.directionElement) this.directionElement.textContent = phase.direction;
    this.syncHandButton(phase);
    this.fireSoundBeats(ceremony, phase, -1, 0);
    if (phase.kind === 'arm') this.armThroughSeam(ceremony);
  }

  private advancePhase(ceremony: ActiveCeremony): void {
    const next = ceremony.phaseIndex + 1;
    if (next >= ceremony.script.phases.length) {
      this.finish(ceremony);
      return;
    }
    this.enterPhase(ceremony, next);
  }

  private phaseComplete(ceremony: ActiveCeremony, phase: CeremonyPhase): boolean {
    switch (phase.kind) {
      case 'hand':
        // The played-not-watched law as machinery: no clock ever finishes this.
        return this.handComplete(ceremony);
      case 'beat': {
        if (ceremony.phaseElapsedMs < phase.durationMs) return false;
        // The pass holds until the rhythm lands — the hand stays in. The phase
        // clock keeps running (never clamp it: the pull windows cycle on it).
        return !phase.rhythmContinues || ceremony.passPulls >= phase.rhythmContinues.minPulls;
      }
      case 'kept-image': {
        if (ceremony.phaseElapsedMs >= phase.delayMs && !ceremony.keptImageCaptured) this.captureKeptImage(ceremony);
        return ceremony.keptImageCaptured && ceremony.phaseElapsedMs >= phase.delayMs + 500;
      }
      case 'arm':
        return ceremony.armed && ceremony.phaseElapsedMs >= 600;
    }
  }

  private finish(ceremony: ActiveCeremony): void {
    ceremony.done = true;
    this.root.dataset.phase = 'done';
    this.root.dataset.phaseKind = 'done';
    if (this.directionElement) {
      const epoch = loadEpoch(ceremony.script.epochId);
      const successor = epoch.successor ? loadEpoch(epoch.successor) : null;
      this.directionElement.textContent = successor
        ? `${successor.displayName} is open. The ledger keeps this page.`
        : 'The ceremony is done.';
    }
    if (this.handButton) this.handButton.hidden = true;
    const leave = this.root.querySelector<HTMLButtonElement>('[data-ceremony-leave]');
    if (leave) {
      leave.textContent = 'Return to the town';
      leave.dataset.testid = 'ceremony-return';
      leave.focus({ preventScroll: true });
    }
  }

  // ─── THE HAND primitives ───────────────────────────────────────────────────

  private updateHand(ceremony: ActiveCeremony, phase: CeremonyPhase, deltaSeconds: number, deltaMs: number): void {
    const hand = ceremony.script.hand;
    const inHandPhase = phase.kind === 'hand';
    const rhythmContinues = phase.kind === 'beat' && !!phase.rhythmContinues;

    if (hand.kind === 'hold' || hand.kind === 'timed-release') {
      if (inHandPhase && ceremony.held) ceremony.holdMs += deltaMs;
    } else if (hand.kind === 'drive' && ceremony.convoy) {
      const handIndex = ceremony.script.phases.findIndex((entry) => entry.kind === 'hand');
      if (inHandPhase) {
        // Movement happens ONLY while the hand is held — the drive primitive.
        if (ceremony.held) ceremony.convoy.update(deltaSeconds);
      } else if (ceremony.phaseIndex > handIndex && this.convoyFraction(ceremony) < 1) {
        // Post-crest ONLY: the haul coasts down to the wet sand (staging, not
        // hand). Before the hand's phase nothing moves — played, not watched.
        ceremony.convoy.update(deltaSeconds * DRIVE_COAST_FACTOR);
      }
    } else if (hand.kind === 'rhythm') {
      const window = this.rhythmWindow(ceremony);
      while (ceremony.pendingTaps > 0) {
        ceremony.pendingTaps -= 1;
        if (!window?.open) continue;
        if (inHandPhase && ceremony.goodPulls < hand.pulls) {
          ceremony.goodPulls += 1;
          ceremony.lastPullAtMs = ceremony.elapsedMs;
          this.recordBeat(`${ceremony.script.id}:pull-${ceremony.goodPulls}`);
          this.audio.play('stockpile-deposit', 0.7);
        } else if (rhythmContinues) {
          ceremony.passPulls += 1;
          ceremony.lastPullAtMs = ceremony.elapsedMs;
          this.recordBeat(`${ceremony.script.id}:pass-pull-${ceremony.passPulls}`);
          this.audio.play('stockpile-deposit', 0.55);
        }
      }
      if (!inHandPhase && !rhythmContinues) ceremony.pendingTaps = 0;
    } else if (hand.kind === 'typed-entry') {
      // Completion is checked in handComplete; input arrives via the overlay.
    }
  }

  private handComplete(ceremony: ActiveCeremony): boolean {
    const hand = ceremony.script.hand;
    switch (hand.kind) {
      case 'hold':
        return ceremony.holdMs >= hand.durationMs;
      case 'timed-release':
        return !ceremony.held && ceremony.holdMs >= hand.chargeMs && ceremony.holdMs <= hand.chargeMs + hand.windowMs;
      case 'drive':
        return this.convoyFraction(ceremony) >= hand.crestAt;
      case 'rhythm':
        return ceremony.goodPulls >= hand.pulls;
      case 'typed-entry':
        return ceremony.typedSubmitted && ceremony.typedValue.trim().toLowerCase() === hand.expected.trim().toLowerCase();
    }
  }

  private rhythmWindow(ceremony: ActiveCeremony): { open: boolean; fraction: number } | null {
    const hand = ceremony.script.hand;
    if (hand.kind !== 'rhythm') return null;
    const phase = ceremony.script.phases[ceremony.phaseIndex];
    const eligible = phase && (phase.kind === 'hand' || (phase.kind === 'beat' && phase.rhythmContinues));
    if (!eligible) return { open: false, fraction: 0 };
    const inCycle = ceremony.phaseElapsedMs % hand.intervalMs;
    return { open: inCycle < hand.windowMs, fraction: Math.min(1, inCycle / hand.windowMs) };
  }

  private buildConvoy(ceremony: ActiveCeremony, hand: Extract<CeremonyScript['hand'], { kind: 'drive' }>): void {
    const start = hand.route[0]!;
    ceremony.convoyMembers = Array.from({ length: hand.followers + 1 }, (_, index) => ({
      id: index === 0 ? 'the-boat-hauler' : `valley-vehicle-${index}`,
      position: { x: start.x, z: start.z },
      maxSpeed: index === 0 ? hand.speed : hand.speed * 1.15,
    }));
    ceremony.convoy = new ConvoyBehavior(ceremony.convoyMembers, { id: `${ceremony.script.id}-route`, points: [...hand.route] }, hand.spacing);
    ceremony.convoyTotal = routeTotal(hand.route);
  }

  private convoyFraction(ceremony: ActiveCeremony): number {
    if (!ceremony.convoy || ceremony.convoyTotal <= 0) return 0;
    return Math.min(1, ceremony.convoy.diagnostics().leaderDistance / ceremony.convoyTotal);
  }

  // ─── SOUND beats ───────────────────────────────────────────────────────────

  private fireSoundBeats(ceremony: ActiveCeremony, phase: CeremonyPhase, fromMs: number, toMs: number): void {
    for (const beat of ceremony.script.sound) {
      if (beat.phase !== phase.id || ceremony.firedBeats.has(beat.beat)) continue;
      if (beat.atMs > fromMs && beat.atMs <= toMs) {
        ceremony.firedBeats.add(beat.beat);
        this.recordBeat(beat.beat);
        if (beat.silence) {
          this.stopStartedLoops(ceremony);
        } else if (beat.sound) {
          if ((soundManifest[beat.sound] as SoundManifestEntry).loop) {
            this.audio.setLoop(beat.sound, true);
            ceremony.startedLoops.add(beat.sound);
          } else {
            this.audio.play(beat.sound);
          }
        }
      }
    }
  }

  private stopStartedLoops(ceremony: ActiveCeremony | null = this.active): void {
    if (!ceremony) return;
    for (const name of ceremony.startedLoops) this.audio.setLoop(name, false);
    ceremony.startedLoops.clear();
  }

  private recordBeat(beat: string): void {
    this.beats.push(beat);
    if (this.beats.length > 64) this.beats.shift();
  }

  // ─── THE KEPT IMAGE ────────────────────────────────────────────────────────

  private captureKeptImage(ceremony: ActiveCeremony): void {
    if (ceremony.keptImageCaptured) return;
    ceremony.keptImageCaptured = true;
    const key = ceremonyKeptImageKey(ceremony.script.id);
    const epoch = loadEpoch(ceremony.script.epochId);
    let dataUrl = '';
    try {
      const source = this.stageCanvas;
      if (source && source.width > 0) {
        const thumb = document.createElement('canvas');
        thumb.width = KEPT_IMAGE_WIDTH;
        thumb.height = Math.max(1, Math.round((source.height / source.width) * KEPT_IMAGE_WIDTH));
        thumb.getContext('2d')?.drawImage(source, 0, 0, thumb.width, thumb.height);
        dataUrl = thumb.toDataURL('image/png');
      }
    } catch {
      dataUrl = '';
    }
    const detail: CeremonyKeptImageDetail = {
      version: 1,
      ceremonyId: ceremony.script.id,
      interstitial: ceremony.script.interstitial,
      epochId: ceremony.script.epochId,
      successorId: epoch.successor,
      caption: ceremony.script.keptImage.caption,
      capturedAtMs: Math.round(ceremony.elapsedMs),
      stored: false,
      key,
    };
    try {
      localStorage.setItem(key, JSON.stringify({ ...detail, stored: true, dataUrl }));
      detail.stored = true;
      ceremony.keptImageStored = true;
    } catch {
      detail.stored = false;
    }
    this.recordBeat(`${ceremony.script.id}:kept-image`);
    try {
      window.dispatchEvent(new CustomEvent(CEREMONY_KEPT_IMAGE_EVENT, { detail }));
    } catch {}
  }

  // ─── The seam ──────────────────────────────────────────────────────────────
  // One writer: activateEpoch() in ContractFamilies is the ONLY era-arming
  // call in this framework, the same seam T1 and T2 already go through.

  private armThroughSeam(ceremony: ActiveCeremony): void {
    if (ceremony.armed) return;
    const epoch = loadEpoch(ceremony.script.epochId);
    const successorId = epoch.successor;
    if (!successorId) {
      this.armFailure = 'manifest-has-no-successor';
      return;
    }
    if (!activateEpoch(successorId)) {
      this.armFailure = 'activateEpoch-refused';
      return;
    }
    ceremony.armed = true;
    this.armCount += 1;
    this.armedEpochId = successorId;
    emitStorySignal({ type: 'epoch-activated', epochId: successorId, displayName: loadEpoch(successorId).displayName });
    this.callbacks.onArmed();
  }

  // ─── The overlay ───────────────────────────────────────────────────────────

  private openOverlay(script: CeremonyScript): void {
    this.root.hidden = false;
    this.root.dataset.ceremonyId = script.id;
    this.root.innerHTML = `
      <div class="ceremony-frame" role="dialog" aria-modal="true" aria-label="${escapeHtml(script.title)}">
        <header class="ceremony-header">
          <p class="ceremony-eyebrow">${escapeHtml(script.interstitial)} · the era's turn</p>
          <h2>${escapeHtml(script.title)}</h2>
        </header>
        <canvas class="ceremony-stage" data-testid="ceremony-stage"></canvas>
        <p class="ceremony-direction" data-testid="ceremony-direction"></p>
        <div class="ceremony-hand">
          <button type="button" class="ceremony-hand-input" data-ceremony-hand data-testid="ceremony-hand-input">${escapeHtml(
            script.hand.label,
          )}</button>
        </div>
        <button type="button" class="ceremony-leave" data-ceremony-leave data-testid="ceremony-leave">Step back</button>
      </div>
    `;
    this.stageCanvas = this.root.querySelector('canvas');
    this.stageContext = this.stageCanvas?.getContext('2d') ?? null;
    this.directionElement = this.root.querySelector('[data-testid="ceremony-direction"]');
    this.handButton = this.root.querySelector('[data-ceremony-hand]');
    this.sizeStage();

    const handDown = (event: Event) => {
      event.preventDefault();
      this.handInputDown();
    };
    const handUp = () => this.handInputUp();
    const onLeave = () => this.requestLeave();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.requestLeave();
        return;
      }
      if (event.repeat) return;
      if (event.key === ' ' || event.key === 'Enter' || event.code === 'KeyW' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.handInputDown();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter' || event.code === 'KeyW' || event.key === 'ArrowUp') this.handInputUp();
    };

    const button = this.handButton;
    const stage = this.stageCanvas;
    const leave = this.root.querySelector<HTMLButtonElement>('[data-ceremony-leave]');
    button?.addEventListener('pointerdown', handDown);
    stage?.addEventListener('pointerdown', handDown);
    for (const type of ['pointerup', 'pointercancel'] as const) {
      button?.addEventListener(type, handUp);
      stage?.addEventListener(type, handUp);
    }
    button?.addEventListener('pointerleave', handUp);
    leave?.addEventListener('click', onLeave);
    this.root.addEventListener('keydown', onKeyDown);
    this.root.addEventListener('keyup', onKeyUp);
    this.overlayCleanup = () => {
      button?.removeEventListener('pointerdown', handDown);
      stage?.removeEventListener('pointerdown', handDown);
      for (const type of ['pointerup', 'pointercancel'] as const) {
        button?.removeEventListener(type, handUp);
        stage?.removeEventListener(type, handUp);
      }
      button?.removeEventListener('pointerleave', handUp);
      leave?.removeEventListener('click', onLeave);
      this.root.removeEventListener('keydown', onKeyDown);
      this.root.removeEventListener('keyup', onKeyUp);
      this.overlayCleanup = () => undefined;
    };
    button?.focus({ preventScroll: true });
  }

  private close(): void {
    const successorId = this.active?.armed ? loadEpoch(this.active.script.epochId).successor : null;
    this.stopStartedLoops();
    this.overlayCleanup();
    this.active = null;
    this.root.hidden = true;
    this.root.innerHTML = '';
    delete this.root.dataset.ceremonyId;
    delete this.root.dataset.phase;
    delete this.root.dataset.phaseKind;
    this.stageCanvas = null;
    this.stageContext = null;
    this.directionElement = null;
    this.handButton = null;
    this.callbacks.onClosed();
    if (successorId) {
      emitStorySignal({ type: 'epoch-activated', epochId: successorId, displayName: loadEpoch(successorId).displayName, postscriptOnly: true });
    }
  }

  private handInputDown(): void {
    const ceremony = this.active;
    if (!ceremony || ceremony.done) return;
    ceremony.held = true;
    if (ceremony.script.hand.kind === 'rhythm') ceremony.pendingTaps += 1;
  }

  private handInputUp(): void {
    const ceremony = this.active;
    if (!ceremony) return;
    ceremony.held = false;
    const hand = ceremony.script.hand;
    if (hand.kind === 'timed-release' && (ceremony.holdMs < hand.chargeMs || ceremony.holdMs > hand.chargeMs + hand.windowMs)) {
      ceremony.holdMs = 0;
    }
  }

  private syncHandButton(phase: CeremonyPhase): void {
    if (!this.handButton) return;
    const handLive = phase.kind === 'hand' || (phase.kind === 'beat' && !!phase.rhythmContinues);
    this.handButton.disabled = !handLive;
    this.handButton.dataset.handLive = handLive ? 'true' : 'false';
  }

  private sizeStage(): void {
    const canvas = this.stageCanvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(MAX_STAGE_DPR, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  private renderStage(ceremony: ActiveCeremony): void {
    const ctx = this.stageContext;
    const canvas = this.stageCanvas;
    if (!ctx || !canvas) return;
    this.sizeStage();
    const phase = ceremony.script.phases[Math.min(ceremony.phaseIndex, ceremony.script.phases.length - 1)]!;
    const window = this.rhythmWindow(ceremony);
    const hand: StageHandState = {
      held: ceremony.held,
      holdFraction:
        ceremony.script.hand.kind === 'hold' ? Math.min(1, ceremony.holdMs / ceremony.script.hand.durationMs) : 0,
      convoyPositions: ceremony.convoyMembers.map((member) => member.position),
      routeFraction: this.convoyFraction(ceremony),
      goodPulls: ceremony.goodPulls,
      pullsRequired: ceremony.script.hand.kind === 'rhythm' ? ceremony.script.hand.pulls : 0,
      windowOpen: window?.open ?? false,
      windowFraction: window?.fraction ?? 0,
      passPulls: ceremony.passPulls,
      lastPullAgoMs: ceremony.lastPullAtMs >= 0 ? ceremony.elapsedMs - ceremony.lastPullAtMs : Number.MAX_SAFE_INTEGER,
    };
    drawCeremonyStage(ctx, canvas.width, canvas.height, {
      script: ceremony.script,
      phaseId: ceremony.done ? 'done' : phase.id,
      phaseElapsedMs: ceremony.phaseElapsedMs,
      phaseDurationMs: phase.kind === 'beat' ? phase.durationMs : 0,
      elapsedMs: ceremony.elapsedMs,
      hand,
    });
  }
}

function freshCeremony(script: CeremonyScript): ActiveCeremony {
  return {
    script,
    phaseIndex: 0,
    phaseElapsedMs: 0,
    elapsedMs: 0,
    firedBeats: new Set(),
    startedLoops: new Set(),
    armed: false,
    held: false,
    holdMs: 0,
    goodPulls: 0,
    passPulls: 0,
    pendingTaps: 0,
    lastPullAtMs: -1,
    convoy: null,
    convoyMembers: [],
    convoyTotal: 0,
    typedValue: '',
    typedSubmitted: false,
    keptImageCaptured: false,
    keptImageStored: false,
    done: false,
  };
}

function passPullsRequired(ceremony: ActiveCeremony): number {
  for (const phase of ceremony.script.phases) {
    if (phase.kind === 'beat' && phase.rhythmContinues) return phase.rhythmContinues.minPulls;
  }
  return 0;
}

function routeTotal(points: readonly { x: number; z: number }[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += Math.hypot(points[index]!.x - points[index - 1]!.x, points[index]!.z - points[index - 1]!.z);
  }
  return total;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    if (char === '"') return '&quot;';
    return '&#39;';
  });
}
