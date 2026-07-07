import {
  RUN_SUSPEND_KEY,
  ensureProfileState,
  installProfileStorageScope,
} from '../../game/ProfileStorage';
import {
  browserResearchStorage,
  loadResearchState,
  saveResearchState,
  setPinnedResearchTarget,
} from '../../meta/ResearchTree';
import { SoundSystem } from '../../audio/SoundSystem';
import { bindAudioSettingsControls, renderAudioSettingsControls } from '../../audio/AudioSettingsControl';
import { renderResearchChart } from '../ResearchChart';

const emblemUrl = new URL('../../../assets/processed/ui-title-emblem.png', import.meta.url).href;
const panelUrl = new URL('../../../assets/processed/ui-menu-panel.png', import.meta.url).href;
const loadBackdropUrl = () => import('../../../assets/processed/ui-menu-backdrop.png?url').then((module) => module.default);
const AUDIO_SETTINGS_IDS = {
  volume: 'start-menu-volume',
  volumeValue: 'start-menu-volume-value',
  mute: 'start-menu-mute',
};

type StartMenuOptions = {
  onNewClaim: () => void;
  onContinue: () => void;
  onEnterTown: () => void;
  onProfile: () => void;
};

export class StartMenu {
  private readonly root = document.createElement('section');
  private readonly audio = new SoundSystem();
  private disposeAudioSettings: () => void = () => undefined;
  private settingsOpen = false;
  private researchOpen = false;
  private selectedResearchNodeId: string | undefined;
  private backdropUrl: string | undefined;
  private backdropRequest: Promise<string> | undefined;

  constructor(parent: HTMLElement, private readonly options: StartMenuOptions) {
    setupProfileStorage();
    this.root.className = 'gr-start-menu';
    this.root.dataset.testid = 'start-menu';
    this.root.setAttribute('aria-label', 'Gold Rush start menu');
    this.root.style.setProperty('--gr-menu-panel', `url("${panelUrl}")`);
    this.root.addEventListener('click', this.onClick);
    this.root.addEventListener('keydown', this.onKeyDown);
    this.render();
    parent.append(this.root);
    this.loadBackdrop();
    this.firstAction()?.focus({ preventScroll: true });
  }

  dispose(): void {
    this.disposeAudioSettings();
    this.root.removeEventListener('click', this.onClick);
    this.root.removeEventListener('keydown', this.onKeyDown);
    this.audio.dispose();
    this.root.remove();
  }

  private render(): void {
    this.disposeAudioSettings();
    const hasContinue = hasSuspendedRun();
    const backdropStyle = this.backdropUrl ? ` style="background-image:url('${this.backdropUrl}')"` : '';
    this.root.className = `gr-start-menu${this.researchOpen ? ' gr-start-menu--research-open' : ''}`;
    this.root.innerHTML = `
      <div class="gr-start-menu__backdrop" data-asset-slot="ui-menu-backdrop" data-asset-state="${this.backdropUrl ? 'ready' : 'placeholder'}"${backdropStyle}></div>
      <div class="gr-start-menu__column">
        <div class="gr-start-menu__emblem" data-testid="start-menu-emblem" data-asset-slot="ui-title-emblem" data-asset-state="ready" style="background-image:url('${emblemUrl}')" aria-hidden="true"></div>
        <h1 data-testid="start-menu-wordmark">GOLD RUSH</h1>
        <p class="gr-start-menu__subtitle">an Agent Town tale</p>
        <nav class="gr-start-menu__nav" aria-label="Claim actions">
          ${
            hasContinue
              ? '<button class="gr-start-menu__button" type="button" data-menu-action="continue" data-testid="start-menu-continue">Continue</button>'
              : ''
          }
          <button class="gr-start-menu__button gr-start-menu__button--primary" type="button" data-menu-action="new" data-testid="start-menu-new-claim">New Claim</button>
          <button class="gr-start-menu__button" type="button" data-menu-action="town" data-testid="start-menu-enter-town">Enter Town</button>
          <button class="gr-start-menu__button" type="button" data-menu-action="profile" data-testid="start-menu-profile">Profile</button>
          <button class="gr-start-menu__button" type="button" data-menu-action="research" data-testid="start-menu-research">Research</button>
          <button class="gr-start-menu__button" type="button" data-menu-action="settings" data-testid="start-menu-settings">Settings</button>
        </nav>
        <section class="gr-start-menu__settings" data-testid="start-menu-settings-panel" ${this.settingsOpen ? '' : 'hidden'}>
          ${renderAudioSettingsControls(AUDIO_SETTINGS_IDS)}
        </section>
        <section class="gr-start-menu__research" data-testid="research-overlay" aria-label="Research ledger" ${
          this.researchOpen ? '' : 'hidden'
        }>${this.renderResearch()}</section>
      </div>
    `;
    this.disposeAudioSettings = bindAudioSettingsControls(this.root, AUDIO_SETTINGS_IDS);
  }

  private loadBackdrop(): void {
    this.backdropRequest ??= loadBackdropUrl();
    void this.backdropRequest.then((url) => {
      this.backdropUrl = url;
      const backdrop = this.root.querySelector<HTMLElement>('.gr-start-menu__backdrop');
      if (!backdrop) return;
      backdrop.dataset.assetState = 'ready';
      backdrop.style.backgroundImage = `url("${url}")`;
    });
  }

  private renderResearch(): string {
    if (!this.researchOpen) return '';
    const storage = browserResearchStorage();
    const state = loadResearchState(storage);
    return `${renderResearchChart(state, this.selectedResearchNodeId)}
      <button class="gr-start-menu__small-button" type="button" data-menu-action="research-close">Close</button>`;
  }

  private readonly onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const nodeButton = target.closest<HTMLElement>('[data-research-node]');
    if (this.researchOpen && nodeButton?.dataset.researchNode) {
      this.selectResearchNode(nodeButton.dataset.researchNode);
      return;
    }
    const pinButton = target.closest<HTMLElement>('[data-research-pin]');
    if (this.researchOpen && pinButton) {
      this.pinResearchTarget(pinButton.dataset.researchPin || null);
      return;
    }
    const button = target.closest<HTMLButtonElement>('[data-menu-action]');
    const action = button?.dataset.menuAction;
    if (!action) return;
    this.audio.play(action === 'research' ? 'ledger-open' : 'menu-tap');
    if (action === 'new') this.options.onNewClaim();
    if (action === 'continue') this.options.onContinue();
    if (action === 'town') this.options.onEnterTown();
    if (action === 'profile') this.options.onProfile();
    if (action === 'settings') this.toggleSettings();
    if (action === 'research') this.toggleResearch(true);
    if (action === 'research-close') this.toggleResearch(false);
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      if (this.researchOpen) this.toggleResearch(false);
      else if (this.settingsOpen) {
        this.settingsOpen = false;
        this.render();
        this.root.querySelector<HTMLElement>('[data-testid="start-menu-settings"]')?.focus({ preventScroll: true });
      }
      return;
    }
    if (event.target instanceof HTMLInputElement) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusAction(1);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusAction(-1);
    }
  };

  private toggleSettings(): void {
    this.settingsOpen = !this.settingsOpen;
    this.render();
    this.root.querySelector<HTMLElement>('[data-testid="start-menu-settings"]')?.focus({ preventScroll: true });
  }

  private toggleResearch(open: boolean): void {
    this.researchOpen = open;
    if (open) this.selectedResearchNodeId = loadResearchState(browserResearchStorage()).pinnedTarget ?? this.selectedResearchNodeId;
    this.render();
    this.root.querySelector<HTMLElement>(open ? '[data-testid="research-overlay"]' : '[data-testid="start-menu-research"]')?.focus({
      preventScroll: true,
    });
  }

  private selectResearchNode(id: string): void {
    this.selectedResearchNodeId = id;
    this.render();
    this.root.querySelector<HTMLElement>(`[data-research-node="${id}"]`)?.focus({ preventScroll: true });
  }

  private pinResearchTarget(id: string | null): void {
    const storage = browserResearchStorage();
    const state = loadResearchState(storage);
    const next = saveResearchState(storage, setPinnedResearchTarget(state, id));
    this.selectedResearchNodeId = next.pinnedTarget ?? this.selectedResearchNodeId;
    this.render();
    this.root.querySelector<HTMLElement>('[data-testid="research-chart-pin"]')?.focus({ preventScroll: true });
  }

  private focusAction(delta: number): void {
    const actions = this.actionButtons();
    if (actions.length === 0) return;
    const current = document.activeElement;
    const index = Math.max(0, actions.findIndex((button) => button === current));
    actions[(index + delta + actions.length) % actions.length]?.focus({ preventScroll: true });
  }

  private firstAction(): HTMLButtonElement | undefined {
    return this.actionButtons()[0];
  }

  private actionButtons(): HTMLButtonElement[] {
    return [...this.root.querySelectorAll<HTMLButtonElement>('.gr-start-menu__nav [data-menu-action]')];
  }
}

export function install(parent: HTMLElement, options: StartMenuOptions): StartMenu {
  return new StartMenu(parent, options);
}

function setupProfileStorage(): Storage | undefined {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return undefined;
    ensureProfileState(storage);
    installProfileStorageScope(storage);
    return storage;
  } catch {
    return undefined;
  }
}

function hasSuspendedRun(): boolean {
  try {
    const raw = setupProfileStorage()?.getItem(RUN_SUSPEND_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && typeof parsed === 'object');
  } catch {
    return false;
  }
}
