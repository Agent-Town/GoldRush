import {
  RUN_SUSPEND_KEY,
  ensureProfileState,
  installProfileStorageScope,
} from '../../game/ProfileStorage';
import { availablePicks, browserResearchStorage, loadResearchState, scienceMeter } from '../../meta/ResearchTree';
import { readAudioVolume, setAudioVolume } from '../../systems/AudioSystem';

const emblemUrl = new URL('../../../assets/processed/ui-title-emblem.png', import.meta.url).href;
const backdropUrl = new URL('../../../assets/processed/ui-menu-backdrop.png', import.meta.url).href;
const panelUrl = new URL('../../../assets/processed/ui-menu-panel.png', import.meta.url).href;

type StartMenuOptions = {
  onNewClaim: () => void;
  onContinue: () => void;
  onProfile: () => void;
};

export class StartMenu {
  private readonly root = document.createElement('section');
  private settingsOpen = false;
  private researchOpen = false;

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
    this.firstAction()?.focus({ preventScroll: true });
  }

  dispose(): void {
    this.root.removeEventListener('click', this.onClick);
    this.root.removeEventListener('keydown', this.onKeyDown);
    this.root.remove();
  }

  private render(): void {
    const hasContinue = hasSuspendedRun();
    const volume = Math.round(readAudioVolume() * 100);
    this.root.innerHTML = `
      <div class="gr-start-menu__backdrop" data-asset-slot="ui-menu-backdrop" data-asset-state="ready" style="background-image:url('${backdropUrl}')"></div>
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
          <button class="gr-start-menu__button" type="button" data-menu-action="profile" data-testid="start-menu-profile">Profile</button>
          <button class="gr-start-menu__button" type="button" data-menu-action="research" data-testid="start-menu-research">Research</button>
          <button class="gr-start-menu__button" type="button" data-menu-action="settings" data-testid="start-menu-settings">Settings</button>
        </nav>
        <section class="gr-start-menu__settings" data-testid="start-menu-settings-panel" ${this.settingsOpen ? '' : 'hidden'}>
          <label>
            <span>Volume</span>
            <input data-testid="start-menu-volume" type="range" min="0" max="100" step="5" value="${volume}" />
            <output data-testid="start-menu-volume-value">${volume}%</output>
          </label>
        </section>
        <section class="gr-start-menu__research" data-testid="research-overlay" aria-label="Research ledger" ${
          this.researchOpen ? '' : 'hidden'
        }>${this.renderResearch()}</section>
      </div>
    `;
    this.root.querySelector<HTMLInputElement>('[data-testid="start-menu-volume"]')?.addEventListener('input', this.onVolumeInput);
  }

  private renderResearch(): string {
    if (!this.researchOpen) return '';
    const storage = browserResearchStorage();
    const state = loadResearchState(storage);
    const meter = scienceMeter(state);
    const picks = availablePicks(state);
    return `
      <p class="research-ledger__eyebrow">Schoolhouse Notes</p>
      <h2>Research Ledger</h2>
      <p data-testid="science-meter">${escapeHtml(meter.text)}</p>
      <div class="gr-start-menu__research-grid">
        ${
          picks.length > 0
            ? picks
                .map(
                  (node) => `
                    <article>
                      <span>${escapeHtml(researchBranchLabel(node.branch))}</span>
                      <strong>${escapeHtml(node.name)}</strong>
                      <p>${escapeHtml(node.effect)}</p>
                    </article>
                  `,
                )
                .join('')
            : '<p>The Elder has no fresh proposal in the ledger.</p>'
        }
      </div>
      <button class="gr-start-menu__small-button" type="button" data-menu-action="research-close">Close</button>
    `;
  }

  private readonly onClick = (event: MouseEvent) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-menu-action]');
    const action = button?.dataset.menuAction;
    if (!action) return;
    if (action === 'new') this.options.onNewClaim();
    if (action === 'continue') this.options.onContinue();
    if (action === 'profile') this.options.onProfile();
    if (action === 'settings') this.toggleSettings();
    if (action === 'research') this.toggleResearch(true);
    if (action === 'research-close') this.toggleResearch(false);
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
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

  private readonly onVolumeInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const volume = Math.max(0, Math.min(100, Number(input.value)));
    setAudioVolume(volume / 100);
    const output = this.root.querySelector<HTMLOutputElement>('[data-testid="start-menu-volume-value"]');
    if (output) output.textContent = `${volume}%`;
  };

  private toggleSettings(): void {
    this.settingsOpen = !this.settingsOpen;
    this.render();
    this.root.querySelector<HTMLElement>('[data-testid="start-menu-settings"]')?.focus({ preventScroll: true });
  }

  private toggleResearch(open: boolean): void {
    this.researchOpen = open;
    this.render();
    this.root.querySelector<HTMLElement>(open ? '[data-testid="research-overlay"]' : '[data-testid="start-menu-research"]')?.focus({
      preventScroll: true,
    });
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

function researchBranchLabel(branch: string): string {
  if (branch === 'Prospecting Works') return 'Economy';
  if (branch === 'Arsenal Works') return 'Arsenal';
  return 'Assay';
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
