import { PLAYBOOKS_KEY, type PlaybookShelfEntry } from './PlaybookStore';
import './playbook-surface.css';

type PlaybookSurfaceStatus = {
  recording: { finished: boolean; ticks: number; truncated: { reason: string } | null } | null;
  replay: { name: string; complete: boolean; stopped: boolean } | null;
};

type PlaybookSurfaceOptions = {
  capacity: number;
  list: () => PlaybookShelfEntry[];
  status: () => PlaybookSurfaceStatus;
  startRecording: () => { ok: boolean; reason?: string };
  stopRecording: (name: string) => { ok: boolean; saved?: boolean; reason?: string; saveReason?: string | null };
  startReplay: (name: string) => { ok: boolean; reason?: string };
  stopReplay: () => { ok: boolean };
};

/** E7's player-facing tape drawer: do a job once, name it, hand it to an agent. */
export class PlaybookSurface {
  readonly element = document.createElement('div');
  private readonly toggle: HTMLButtonElement;
  private readonly panel: HTMLElement;
  private readonly nameInput: HTMLInputElement;
  private readonly recordButton: HTMLButtonElement;
  private readonly shelf: HTMLOListElement;
  private readonly message: HTMLElement;
  private pendingName = '';
  private tapes: PlaybookShelfEntry[] = [];
  private shelfDirty = true;
  private shelfRenderKey = '';

  constructor(mount: HTMLElement, private readonly options: PlaybookSurfaceOptions) {
    this.element.className = 'playbook-surface';
    this.element.innerHTML = `
      <button class="playbook-surface__toggle" type="button" data-testid="playbook-toggle" aria-controls="playbook-library" aria-expanded="false">
        <span aria-hidden="true">●</span> Tape Reel
      </button>
      <section class="playbook-surface__panel" id="playbook-library" data-testid="playbook-library" aria-label="Playbook Library" hidden>
        <div class="playbook-surface__heading">
          <div><small>The Signal Era</small><h2>Playbook Library</h2></div>
          <button type="button" data-playbook-close aria-label="Close Playbook Library">×</button>
        </div>
        <p>Do a job once. Name it. Hand the tape to an agent.</p>
        <div class="playbook-surface__recorder">
          <label for="playbook-name">Tape name</label>
          <div>
            <input id="playbook-name" data-testid="playbook-name" autocomplete="off" placeholder="Morning round" />
            <button type="button" data-testid="playbook-record">Record</button>
          </div>
        </div>
        <p class="playbook-surface__message" data-testid="playbook-message" aria-live="polite"></p>
        <ol class="playbook-surface__shelf" data-testid="playbook-shelf"></ol>
      </section>
    `;
    this.toggle = this.get('[data-testid="playbook-toggle"]');
    this.panel = this.get('[data-testid="playbook-library"]');
    this.nameInput = this.get('[data-testid="playbook-name"]');
    this.recordButton = this.get('[data-testid="playbook-record"]');
    this.shelf = this.get('[data-testid="playbook-shelf"]');
    this.message = this.get('[data-testid="playbook-message"]');
    this.toggle.addEventListener('click', this.onToggle);
    this.recordButton.addEventListener('click', this.onRecord);
    this.shelf.addEventListener('click', this.onShelfClick);
    this.get<HTMLButtonElement>('[data-playbook-close]').addEventListener('click', this.onToggle);
    this.panel.addEventListener('keydown', this.onPanelKeyDown);
    this.panel.addEventListener('keyup', this.stopGameHotkeys);
    window.addEventListener('gr:profile-data-changed', this.onProfileDataChanged);
    mount.append(this.element);
    this.update();
  }

  update(): void {
    const status = this.options.status();
    const recording = this.pendingName !== '' && status.recording !== null;
    const replaying = status.replay?.stopped === false;
    this.nameInput.disabled = recording || replaying;
    this.recordButton.disabled = replaying;
    this.recordButton.textContent = recording ? 'Save Tape' : 'Record';
    this.recordButton.dataset.recording = String(recording);
    if (recording) {
      this.message.textContent = status.recording?.truncated
        ? `${this.pendingName} stopped at the ${status.recording.truncated.reason} bound. Save the tape.`
        : `Recording ${this.pendingName} · ${status.recording?.ticks ?? 0} ticks`;
    }
    if (!this.panel.hidden) this.renderShelf(status.replay?.stopped === false ? status.replay.name : null, recording);
  }

  dispose(): void {
    this.toggle.removeEventListener('click', this.onToggle);
    this.recordButton.removeEventListener('click', this.onRecord);
    this.shelf.removeEventListener('click', this.onShelfClick);
    this.panel.removeEventListener('keydown', this.onPanelKeyDown);
    this.panel.removeEventListener('keyup', this.stopGameHotkeys);
    window.removeEventListener('gr:profile-data-changed', this.onProfileDataChanged);
    this.element.remove();
  }

  private readonly onToggle = () => {
    const open = this.panel.hidden;
    this.panel.hidden = !open;
    this.toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      this.refreshShelf();
      this.update();
      this.nameInput.focus();
    }
  };

  private readonly onPanelKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.closePanel();
    }
    event.stopPropagation();
  };

  private readonly stopGameHotkeys = (event: KeyboardEvent) => event.stopPropagation();

  private readonly onProfileDataChanged = (event: Event) => {
    if ((event as CustomEvent<{ key?: string }>).detail?.key !== PLAYBOOKS_KEY) return;
    this.shelfDirty = true;
    if (!this.panel.hidden) {
      this.refreshShelf();
      this.update();
    }
  };

  private readonly onRecord = () => {
    const recording = this.pendingName !== '' && this.options.status().recording !== null;
    if (recording) {
      const result = this.options.stopRecording(this.pendingName);
      this.message.textContent = result.ok && result.saved
        ? `${this.pendingName} shelved. The agent can replay it now.`
        : `Tape not shelved: ${result.saveReason ?? result.reason ?? 'unknown error'}.`;
      this.pendingName = '';
      this.nameInput.value = '';
      this.shelfDirty = true;
      this.refreshShelf();
      this.update();
      return;
    }

    const name = this.nameInput.value.trim();
    if (!name) {
      this.message.textContent = 'Name the tape before recording.';
      this.nameInput.focus();
      return;
    }
    this.refreshShelf();
    const tapes = this.tapes;
    if (tapes.length >= this.options.capacity && !tapes.some((tape) => tape.name === name)) {
      this.message.textContent = `The ${this.options.capacity}-tape drawer is full.`;
      return;
    }
    const result = this.options.startRecording();
    if (!result.ok) {
      this.message.textContent = `Recording refused: ${result.reason ?? 'unknown error'}.`;
      return;
    }
    this.pendingName = name;
    this.update();
    this.closePanel();
  };

  private readonly onShelfClick = (event: Event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-playbook-name]');
    if (!button) return;
    const name = button.dataset.playbookName ?? '';
    const replay = this.options.status().replay;
    const result = replay?.stopped === false && replay.name === name
      ? this.options.stopReplay()
      : this.options.startReplay(name);
    this.message.textContent = result.ok
      ? replay?.stopped === false && replay.name === name
        ? `${name} stopped.`
        : `${name} handed to the agent.`
      : `Replay refused: ${'reason' in result ? result.reason ?? 'unknown error' : 'unknown error'}.`;
    this.update();
  };

  private renderShelf(activeReplay: string | null, recording: boolean): void {
    const renderKey = JSON.stringify([activeReplay, recording, this.tapes]);
    if (renderKey === this.shelfRenderKey) return;
    this.shelfRenderKey = renderKey;
    const items = this.tapes.map((tape) => {
      const item = document.createElement('li');
      const copy = document.createElement('span');
      const name = document.createElement('strong');
      const detail = document.createElement('small');
      const replay = document.createElement('button');
      name.textContent = tape.name;
      detail.textContent = `${Math.ceil(tape.durationTicks / 30)}s · ${tape.entries} marks`;
      copy.append(name, detail);
      replay.type = 'button';
      replay.dataset.playbookName = tape.name;
      replay.dataset.testid = `playbook-replay-${tape.name}`;
      replay.disabled = recording || (activeReplay !== null && activeReplay !== tape.name);
      replay.textContent = activeReplay === tape.name ? 'Stop' : 'Replay';
      item.append(copy, replay);
      return item;
    });
    if (items.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'playbook-surface__empty';
      empty.textContent = 'The drawer is empty. Record the first round.';
      items.push(empty);
    }
    this.shelf.replaceChildren(...items);
  }

  private refreshShelf(): void {
    if (!this.shelfDirty) return;
    this.tapes = this.options.list();
    this.shelfDirty = false;
    this.shelfRenderKey = '';
  }

  private closePanel(): void {
    this.panel.hidden = true;
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.focus();
  }

  private get<T extends HTMLElement>(selector: string): T {
    const element = this.element.querySelector<T>(selector);
    if (!element) throw new Error(`Missing playbook surface element: ${selector}`);
    return element;
  }
}
