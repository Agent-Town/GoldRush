import { PLAYBOOK_STEP_SECONDS } from '../playbook/PlaybookFormat';
import {
  RUN_TAPE_SIM_VERSION,
  readRunTapes,
  type RunTape,
} from '../game/RunTape';
import { isolateProfileStorage } from '../game/ProfileStorage';

export const LANTERN_VERSION_REFUSAL =
  'This projectionist cannot thread a reel cut for another machine. The show stays dark, but the reel remains on the shelf.';

let openShelf: HTMLElement | null = null;

export function openTapeShelf(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  onWatch: (tape: RunTape) => void,
): void {
  openShelf?.remove();
  const tapes = readRunTapes(storage);
  const root = document.createElement('section');
  openShelf = root;
  root.className = 'tape-shelf';
  root.dataset.testid = 'tape-shelf';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Run tape shelf');
  root.innerHTML = `
    <div class="tape-shelf__panel">
      <header class="tape-shelf__header">
        <div><p>Schoolhouse Lantern Room</p><h2>Run Tape Shelf</h2></div>
        <button type="button" data-tape-shelf-close data-testid="tape-shelf-close">Back</button>
      </header>
      <p class="tape-shelf__message" data-testid="tape-shelf-message" aria-live="polite"></p>
      ${
        tapes.length
          ? `<ol class="tape-shelf__list">${tapes.map(renderTape).join('')}</ol>`
          : '<p data-testid="tape-shelf-empty">No reels yet. Finish a claim and the projectionist will shelve one.</p>'
      }
    </div>`;

  const close = () => {
    if (openShelf !== root) return;
    openShelf = null;
    root.remove();
  };
  root.querySelector('[data-tape-shelf-close]')?.addEventListener('click', close);
  root.addEventListener('click', (event) => {
    const id = (event.target as HTMLElement).closest<HTMLElement>('[data-watch-tape]')?.dataset.watchTape;
    if (!id) return;
    const tape = tapes.find((entry) => entry.id === id);
    if (!tape) return;
    if (tape.simVersion !== RUN_TAPE_SIM_VERSION) {
      const message = root.querySelector<HTMLElement>('[data-testid="tape-shelf-message"]');
      if (message) {
        message.textContent = LANTERN_VERSION_REFUSAL;
        message.dataset.testid = 'tape-version-refusal';
      }
      root.querySelector<HTMLElement>(`[data-tape-id="${CSS.escape(id)}"]`)?.setAttribute('data-refused', 'true');
      return;
    }
    close();
    onWatch(tape);
  });
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    close();
  });
  (document.querySelector<HTMLElement>('#app') ?? document.body).append(root);
  root.querySelector<HTMLButtonElement>('[data-watch-tape], [data-tape-shelf-close]')?.focus({ preventScroll: true });
}

export function closeTapeShelf(): void {
  openShelf?.remove();
  openShelf = null;
}

export function isolateReplayStorage(storage: Storage): () => void {
  const restoreProfileStorage = isolateProfileStorage(storage);
  const prototype = Storage.prototype;
  const getItem = prototype.getItem;
  const setItem = prototype.setItem;
  const removeItem = prototype.removeItem;
  const clear = prototype.clear;
  prototype.getItem = function (key: string): string | null {
    return this === storage ? null : getItem.call(this, key);
  };
  prototype.setItem = function (key: string, value: string): void {
    if (this !== storage) setItem.call(this, key, value);
  };
  prototype.removeItem = function (key: string): void {
    if (this !== storage) removeItem.call(this, key);
  };
  prototype.clear = function (): void {
    if (this !== storage) clear.call(this);
  };
  return () => {
    prototype.getItem = getItem;
    prototype.setItem = setItem;
    prototype.removeItem = removeItem;
    prototype.clear = clear;
    restoreProfileStorage();
  };
}

function renderTape(tape: RunTape): string {
  const outcome = tape.outcome.secured ? 'SECURED' : tape.outcome.reason === 'rush' ? 'RUSH' : 'OVERRUN';
  return `<li class="tape-shelf__reel" data-tape-id="${escapeHtml(tape.id)}">
    <p>${escapeHtml(new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(tape.createdAt)))}</p>
    <h3>${escapeHtml(tape.contract)}</h3>
    <span>${outcome} · wave ${Math.floor(tape.outcome.waves)} · ${formatTime(tape.outcome.timeAlive)}${tape.kept ? ' · KEPT' : ''}</span>
    <button type="button" data-watch-tape="${escapeHtml(tape.id)}" data-testid="watch-run-tape">WATCH</button>
  </li>`;
}

export type LanternShowState = {
  tick: number;
  durationTicks: number;
  wave: number;
  paused: boolean;
  speed: 1 | 2 | 4;
  skipping: boolean;
  complete: boolean;
  hash: string | null;
  expectedHash: string;
};

type LanternShowActions = {
  pause: (paused: boolean) => void;
  speed: (speed: 1 | 2 | 4) => void;
  restart: () => void;
  skipWave: () => void;
  close: () => void;
  pan: (dx: number, dz: number) => void;
};

export class LanternShow {
  private readonly root = document.createElement('section');
  private readonly card: HTMLElement;
  private state: LanternShowState;
  private drag: { id: number; x: number; y: number } | null = null;

  constructor(parent: HTMLElement, private readonly tape: RunTape, private readonly actions: LanternShowActions) {
    this.state = {
      tick: 0,
      durationTicks: tape.inputLog.durationTicks,
      wave: 0,
      paused: false,
      speed: 1,
      skipping: false,
      complete: false,
      hash: null,
      expectedHash: tape.eventLogHash,
    };
    this.root.className = 'lantern-show';
    this.root.dataset.testid = 'lantern-show';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-label', 'The Lantern Show replay');
    this.root.innerHTML = `
      <div class="lantern-show__stage" data-lantern-pan aria-label="Drag to pan the lantern view"></div>
      <div class="lantern-show__frame" aria-hidden="true"></div>
      <header class="lantern-show__title"><p>Schoolhouse Lantern Room</p><h1>The Lantern Show</h1></header>
      <div class="lantern-show__intertitle" data-testid="lantern-intertitle" role="status" hidden></div>
      <div class="lantern-show__controls">
        <button type="button" data-lantern-action="pause" data-testid="lantern-pause">Pause</button>
        <div class="lantern-show__speeds" aria-label="Playback speed">
          ${([1, 2, 4] as const).map((speed) => `<button type="button" data-lantern-speed="${speed}" data-testid="lantern-speed-${speed}">${speed}×</button>`).join('')}
        </div>
        <button type="button" data-lantern-action="restart" data-testid="lantern-restart">Restart</button>
        <button type="button" data-lantern-action="wave" data-testid="lantern-wave-skip">Next wave</button>
        <button type="button" data-lantern-action="close" data-testid="lantern-close">Back to shelf</button>
        <output data-testid="lantern-playback-status" aria-live="polite"></output>
      </div>`;
    this.card = this.root.querySelector<HTMLElement>('[data-testid="lantern-intertitle"]')!;
    this.root.addEventListener('click', this.onClick);
    const stage = this.root.querySelector<HTMLElement>('[data-lantern-pan]')!;
    stage.addEventListener('pointerdown', this.onPointerDown);
    stage.addEventListener('pointermove', this.onPointerMove);
    stage.addEventListener('pointerup', this.onPointerUp);
    stage.addEventListener('pointercancel', this.onPointerUp);
    window.addEventListener('keydown', this.onKeyDown, true);
    parent.classList.add('lantern-show-active');
    parent.append(this.root);
    this.update(this.state);
  }

  update(state: LanternShowState): void {
    this.state = state;
    this.root.dataset.playback = state.complete ? 'complete' : state.skipping ? 'skipping' : state.paused ? 'paused' : 'playing';
    this.root.dataset.speed = String(state.speed);
    this.root.dataset.tick = String(state.tick);
    this.root.dataset.wave = String(state.wave);
    const pause = this.root.querySelector<HTMLButtonElement>('[data-testid="lantern-pause"]');
    if (pause) pause.textContent = state.paused ? 'Play' : 'Pause';
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-lantern-speed]')) {
      button.setAttribute('aria-pressed', String(Number(button.dataset.lanternSpeed) === state.speed));
    }
    const status = this.root.querySelector<HTMLOutputElement>('[data-testid="lantern-playback-status"]');
    if (status) {
      status.textContent = state.complete
        ? `Reel ended · ${state.hash === state.expectedHash ? 'replay matched' : 'replay differed'}`
        : `${formatTime(state.tick * PLAYBOOK_STEP_SECONDS)} / ${formatTime(state.durationTicks * PLAYBOOK_STEP_SECONDS)} · wave ${state.wave}${state.skipping ? ' · finding next wave' : ''}`;
      status.dataset.hash = state.hash ?? '';
      status.dataset.expectedHash = state.expectedHash;
    }
    const atMs = state.tick * PLAYBOOK_STEP_SECONDS * 1000;
    const annotation = this.tape.annotations?.find((entry) => entry.atMs <= atMs && atMs < entry.atMs + 2500);
    this.card.hidden = !annotation;
    this.card.textContent = annotation?.text ?? '';
  }

  dispose(): void {
    this.root.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown, true);
    this.root.parentElement?.classList.remove('lantern-show-active');
    this.root.remove();
  }

  private readonly onClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-lantern-action], [data-lantern-speed]');
    if (!target) return;
    const speed = Number(target.dataset.lanternSpeed);
    if (speed === 1 || speed === 2 || speed === 4) return this.actions.speed(speed);
    if (target.dataset.lanternAction === 'pause') return this.actions.pause(!this.state.paused);
    if (target.dataset.lanternAction === 'restart') return this.actions.restart();
    if (target.dataset.lanternAction === 'wave') return this.actions.skipWave();
    if (target.dataset.lanternAction === 'close') this.actions.close();
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if ((event.target as HTMLElement | null)?.matches('input, textarea, select')) return;
    const pan = event.code === 'ArrowLeft' || event.code === 'KeyA'
      ? [-1, 0]
      : event.code === 'ArrowRight' || event.code === 'KeyD'
        ? [1, 0]
        : event.code === 'ArrowUp' || event.code === 'KeyW'
          ? [0, -1]
          : event.code === 'ArrowDown' || event.code === 'KeyS'
            ? [0, 1]
            : null;
    if (pan) this.actions.pan(pan[0]!, pan[1]!);
    else if (event.code === 'Space') this.actions.pause(!this.state.paused);
    else if (event.code === 'Digit1') this.actions.speed(1);
    else if (event.code === 'Digit2') this.actions.speed(2);
    else if (event.code === 'Digit4') this.actions.speed(4);
    else if (event.code === 'KeyR') this.actions.restart();
    else if (event.code === 'KeyN') this.actions.skipWave();
    else if (event.code === 'Escape') this.actions.close();
    else return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private readonly onPointerDown = (event: PointerEvent) => {
    this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    if (!this.drag || this.drag.id !== event.pointerId) return;
    this.actions.pan((this.drag.x - event.clientX) * 0.025, (this.drag.y - event.clientY) * 0.025);
    this.drag.x = event.clientX;
    this.drag.y = event.clientY;
  };

  private readonly onPointerUp = (event: PointerEvent) => {
    if (this.drag?.id === event.pointerId) this.drag = null;
  };
}

function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
