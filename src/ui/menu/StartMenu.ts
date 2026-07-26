import {
  PROFILE_DATA_KEYS,
  RUN_SUSPEND_KEY,
  createProfile,
  ensureProfileState,
  installProfileStorageScope,
  loadProfileState,
} from '../../game/ProfileStorage';
import { reconcileActiveEpoch } from '../../meta/ResearchTree';
import { SoundSystem } from '../../audio/SoundSystem';
import { bindAudioSettingsControls, renderAudioSettingsControls } from '../../audio/AudioSettingsControl';
import { bindStorySettingsControl, renderStorySettingsControl } from '../../story/settings';
import { bindPerformanceTierControl, renderPerformanceTierControl } from '../../game/PerformanceTier';
import { bindTelemetrySettingsControl, renderTelemetrySettingsControl } from '../../telemetry/payload';
import { readRunSuspend, readRunSuspendRejection } from '../../game/RunSuspend';
import {
  AUTO_SAVE_SLOT_NAME,
  deleteSaveSlot,
  readSaveSlots,
  renameSaveSlot,
  restoreSaveSlotToAuto,
  type SaveSlot,
} from '../../game/SaveSlots';
import { activeEpochId, loadContract } from '../../meta/ContractFamilies';
import { readTownName } from '../../town/TownNaming';
import { accountSync } from '../../game/AccountSync';
import { eraBackdropRef, loadEraBackdrop } from '../EraBackdrop';
import { bindProspectorSkinControl, renderProspectorSkinControl } from '../../game/ProspectorSkin';

const emblemUrl = new URL('../../../assets/processed/ui-title-emblem.png', import.meta.url).href;
const panelUrl = new URL('../../../assets/processed/ui-menu-panel.png', import.meta.url).href;
const AUDIO_SETTINGS_IDS = {
  volume: 'start-menu-volume',
  volumeValue: 'start-menu-volume-value',
  mute: 'start-menu-mute',
  music: 'start-menu-music-volume',
  musicValue: 'start-menu-music-volume-value',
};
const STORY_SETTINGS_IDS = {
  tales: 'start-menu-tales',
};
const PERFORMANCE_TIER_ID = 'start-menu-performance-tier';
const TELEMETRY_STATS_ID = 'start-menu-telemetry-stats';
const PROSPECTOR_SKIN_ID = 'start-menu-prospector-skin';

type StartMenuOptions = {
  onContinue: () => void;
  onLoadSlot: () => void;
  onEnterTown: () => void;
  onOpenLedger: () => void;
  onProfile: () => void;
};

export class StartMenu {
  private readonly root = document.createElement('section');
  private readonly audio = new SoundSystem();
  private disposeAudioSettings: () => void = () => undefined;
  private disposeStorySettings: () => void = () => undefined;
  private disposePerformanceSettings: () => void = () => undefined;
  private disposeTelemetrySettings: () => void = () => undefined;
  private disposeProspectorSkin: () => void = () => undefined;
  private storage?: Storage;
  private firstBoot = false;
  private profileMessage = '';
  private settingsOpen = false;
  private loadOpen = false;
  private loadMessage = '';
  private backdropUrl: string | undefined;
  private backdropRequest: Promise<string> | undefined;
  private backdropEpochId = '';
  private disposeAccountSync: () => void = () => undefined;

  constructor(parent: HTMLElement, private readonly options: StartMenuOptions) {
    this.storage = setupProfileStorage();
    this.firstBoot = !!this.storage && !loadProfileState(this.storage);
    this.root.className = 'gr-start-menu';
    this.root.dataset.testid = 'start-menu';
    this.root.setAttribute('aria-label', 'Gold Rush start menu');
    this.root.style.setProperty('--gr-menu-panel', `url("${panelUrl}")`);
    this.root.addEventListener('click', this.onClick);
    this.root.addEventListener('keydown', this.onKeyDown);
    this.disposeAccountSync = accountSync.subscribe(this.onAccountSync);
    this.onAccountSync();
    parent.append(this.root);
    this.loadBackdrop();
    this.audio.setLoop('title-theme', true);
    this.firstAction()?.focus({ preventScroll: true });
  }

  refresh(): void {
    if (activeEpochId() !== this.backdropEpochId) this.backdropUrl = undefined;
    this.render();
    this.loadBackdrop();
  }

  dispose(): void {
    this.disposeAudioSettings();
    this.disposeStorySettings();
    this.disposePerformanceSettings();
    this.disposeTelemetrySettings();
    this.disposeProspectorSkin();
    this.disposeAccountSync();
    this.root.removeEventListener('click', this.onClick);
    this.root.removeEventListener('keydown', this.onKeyDown);
    this.audio.dispose();
    this.root.remove();
  }

  private render(): void {
    this.disposeAudioSettings();
    this.disposeStorySettings();
    this.disposePerformanceSettings();
    this.disposeTelemetrySettings();
    this.disposeProspectorSkin();
    migrateLegacySuspendResources(this.storage);
    const suspend = readRunSuspend();
    const slots = readSaveSlots(this.storage);
    const suspendRejection = readRunSuspendRejection();
    const account = accountSync.snapshot();
    const backdropStyle = this.backdropUrl ? ` style="background-image:url('${this.backdropUrl}')"` : '';
    this.root.className = `gr-start-menu${this.loadOpen ? ' gr-start-menu--load-open' : ''}${this.settingsOpen ? ' gr-start-menu--settings-open' : ''}`;
    this.root.innerHTML = `
      <div class="gr-start-menu__backdrop" data-asset-slot="ui-menu-backdrop" data-asset-state="${this.backdropUrl ? 'ready' : 'placeholder'}"${backdropStyle}></div>
      <div class="gr-start-menu__column">
        <div class="gr-start-menu__emblem" data-testid="start-menu-emblem" data-asset-slot="ui-title-emblem" data-asset-state="ready" style="background-image:url('${emblemUrl}')" aria-hidden="true"></div>
        <h1 data-testid="start-menu-wordmark">GOLD RUSH</h1>
        <p class="gr-start-menu__subtitle">an Agent Town tale</p>
        ${suspend ? `<p class="gr-start-menu__saved-claim" data-testid="start-menu-saved-claim">${escapeHtml(savedClaimLabel(suspend))}</p>` : ''}
        ${suspendRejection ? `<p class="gr-start-menu__saved-claim gr-start-menu__saved-claim--rejected" data-testid="start-menu-rejected-claim">${escapeHtml(suspendRejection.message)}</p>` : ''}
        <p class="gr-account-chip gr-account-chip--menu" data-testid="account-status-chip">${escapeHtml(account.label)}</p>
        ${
          this.firstBoot
            ? this.renderFirstBoot()
            : `<nav class="gr-start-menu__nav" aria-label="Claim actions">
          ${
            suspend
              ? `<button class="gr-start-menu__button" type="button" data-menu-action="continue" data-testid="start-menu-continue">${escapeHtml(
                  continueLabel(suspend),
                )}</button>`
              : ''
          }
          ${
            slots.manual.length > 0
              ? '<button class="gr-start-menu__button" type="button" data-menu-action="load" data-testid="start-menu-load-claim">Load a claim</button>'
              : ''
          }
          <button class="gr-start-menu__button gr-start-menu__button--primary" type="button" data-menu-action="town" data-testid="start-menu-enter-town">Enter Town</button>
          <button class="gr-start-menu__button" type="button" data-menu-action="ledger" data-menu-secondary data-testid="start-menu-claim-ledger">Claim Ledger</button>
          <button class="gr-start-menu__button" type="button" data-menu-action="profile" data-testid="start-menu-profile">Profile</button>
          <button class="gr-start-menu__button" type="button" data-menu-action="settings" data-testid="start-menu-settings">Settings</button>
        </nav>`
        }
        <section class="gr-start-menu__load" data-testid="load-claim-screen" aria-label="Load a claim" ${this.loadOpen ? '' : 'hidden'}>
          ${this.renderLoadClaims(slots.manual)}
        </section>
        <section class="gr-start-menu__settings" data-testid="start-menu-settings-panel" aria-label="Settings" ${this.settingsOpen ? '' : 'hidden'}>
          <header class="gr-start-menu__settings-header">
            <h2>Settings</h2>
            <button class="gr-start-menu__small-button" type="button" data-menu-action="settings" data-testid="start-menu-settings-close">Back</button>
          </header>
          ${renderAudioSettingsControls(AUDIO_SETTINGS_IDS)}
          ${renderStorySettingsControl(STORY_SETTINGS_IDS)}
          ${renderPerformanceTierControl(PERFORMANCE_TIER_ID)}
          ${renderProspectorSkinControl(PROSPECTOR_SKIN_ID)}
          ${renderTelemetrySettingsControl(TELEMETRY_STATS_ID)}
        </section>
      </div>
    `;
    this.disposeAudioSettings = bindAudioSettingsControls(this.root, AUDIO_SETTINGS_IDS);
    this.disposeStorySettings = bindStorySettingsControl(this.root, STORY_SETTINGS_IDS);
    this.disposePerformanceSettings = bindPerformanceTierControl(this.root, PERFORMANCE_TIER_ID);
    this.disposeProspectorSkin = bindProspectorSkinControl(this.root, PROSPECTOR_SKIN_ID);
    this.disposeTelemetrySettings = bindTelemetrySettingsControl(this.root, TELEMETRY_STATS_ID);
    this.root.querySelector<HTMLFormElement>('[data-testid="profile-create-form"]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.createFirstProfile();
    });
    this.bindLoadRenameForms();
  }

  private renderFirstBoot(): string {
    return `
      <section class="gr-start-menu__first-profile" data-testid="profile-title" aria-label="Create profile">
        <p class="death-overlay__eyebrow">Claim Ledger</p>
        <h2>Who's prospecting?</h2>
        <p>Name the claim-holder before the first claim.</p>
        ${this.profileMessage ? `<p class="gr-profile-message" data-testid="profile-message">${escapeHtml(this.profileMessage)}</p>` : ''}
        <form class="gr-profile-create gr-profile-create--first" data-testid="profile-create-form">
          <input data-testid="profile-name-input" name="profileName" maxlength="24" autocomplete="off" placeholder="Claim-holder name" />
          <fieldset class="gr-profile-greenhorn" data-testid="greenhorn-question">
            <legend>First time prospecting?</legend>
            <label><input type="radio" name="greenhornOffer" value="yes" /> Yes - ease me onto the trail</label>
            <label><input type="radio" name="greenhornOffer" value="no" checked /> No - give me the regular trail</label>
          </fieldset>
          <button class="death-overlay__button gr-profile-create__button" type="submit" data-testid="profile-create">Open ledger</button>
        </form>
      </section>
    `;
  }

  private loadBackdrop(): void {
    const epochId = activeEpochId();
    if (epochId !== this.backdropEpochId) {
      this.backdropEpochId = epochId;
      this.backdropUrl = undefined;
      this.backdropRequest = loadEraBackdrop(epochId).then((url) => url ?? '');
    }
    this.root.querySelector<HTMLElement>('.gr-start-menu__backdrop')?.setAttribute('data-era-backdrop', eraBackdropRef(epochId));
    void this.backdropRequest?.then((url) => {
      if (!url || this.backdropEpochId !== epochId) return;
      this.backdropUrl = url;
      document.documentElement.style.setProperty('--gr-era-backdrop', `url("${url}")`);
      const backdrop = this.root.querySelector<HTMLElement>('.gr-start-menu__backdrop');
      if (!backdrop) return;
      backdrop.dataset.assetState = 'ready';
      backdrop.style.backgroundImage = `url("${url}")`;
    });
  }

  private readonly onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const slotButton = target.closest<HTMLButtonElement>('[data-slot-action]');
    if (slotButton?.dataset.slotAction && slotButton.dataset.slotId) {
      this.handleSlotAction(slotButton.dataset.slotAction, slotButton.dataset.slotId);
      return;
    }
    const button = target.closest<HTMLButtonElement>('[data-menu-action]');
    const action = button?.dataset.menuAction;
    if (!action) return;
    this.audio.play('menu-tap');
    if (action === 'continue') this.options.onContinue();
    if (action === 'town') this.options.onEnterTown();
    if (action === 'ledger') this.options.onOpenLedger();
    if (action === 'profile') this.options.onProfile();
    if (action === 'load') this.toggleLoad();
    if (action === 'settings') this.toggleSettings();
  };

  private createFirstProfile(): void {
    if (!this.storage) return;
    const input = this.root.querySelector<HTMLInputElement>('[data-testid="profile-name-input"]');
    const preset = this.root.querySelector<HTMLInputElement>('[name="greenhornOffer"]:checked')?.value === 'yes' ? 'greenhorn' : 'trail';
    const profile = createProfile(this.storage, input?.value ?? '', preset);
    if (!profile) {
      this.profileMessage = 'Use a ledger name the family can read.';
      this.render();
      return;
    }
    installProfileStorageScope(this.storage);
    reconcileActiveEpoch();
    this.firstBoot = false;
    this.profileMessage = '';
    accountSync.queuePush();
    this.options.onEnterTown();
  }

  private readonly onAccountSync = () => {
    if (this.storage && loadProfileState(this.storage)) {
      installProfileStorageScope(this.storage);
    reconcileActiveEpoch();
      this.firstBoot = false;
      this.profileMessage = '';
    }
    this.render();
  };

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      if (this.loadOpen) {
        this.loadOpen = false;
        this.render();
        this.root.querySelector<HTMLElement>('[data-testid="start-menu-load-claim"]')?.focus({ preventScroll: true });
      } else if (this.settingsOpen) {
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
    if (this.settingsOpen) this.loadOpen = false;
    this.render();
    this.root
      .querySelector<HTMLElement>(this.settingsOpen ? '[data-testid="start-menu-settings-close"]' : '[data-testid="start-menu-settings"]')
      ?.focus();
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
    return [...this.root.querySelectorAll<HTMLButtonElement>('.gr-start-menu__nav [data-menu-action]:not([data-menu-secondary])')];
  }

  private toggleLoad(): void {
    this.loadOpen = !this.loadOpen;
    if (this.loadOpen) this.settingsOpen = false;
    this.render();
    this.root
      .querySelector<HTMLElement>(this.loadOpen ? '.gr-start-menu__load [data-menu-action="load"]' : '[data-testid="start-menu-load-claim"]')
      ?.focus();
  }

  private renderLoadClaims(slots: SaveSlot[]): string {
    const note = this.loadMessage ? `<p class="gr-load-claims__message" data-testid="load-claim-message">${escapeHtml(this.loadMessage)}</p>` : '';
    if (slots.length === 0) {
      return `
        <div class="gr-load-claims__header">
          <h2>Load a claim</h2>
          <button class="gr-start-menu__small-button" type="button" data-menu-action="load">Close</button>
        </div>
        ${note}
        <p class="gr-load-claims__empty">No manual claims pinned yet.</p>
      `;
    }
    return `
      <div class="gr-load-claims__header">
        <h2>Load a claim</h2>
        <button class="gr-start-menu__small-button" type="button" data-menu-action="load">Close</button>
      </div>
      ${note}
      <ol class="gr-load-claims__list">
        ${slots.map((slot) => this.renderSaveSlotCard(slot)).join('')}
      </ol>
    `;
  }

  private renderSaveSlotCard(slot: SaveSlot): string {
    return `
      <li class="gr-load-card" data-testid="save-slot-card">
        <div>
          <h3 data-testid="save-slot-name">${escapeHtml(slot.name)}</h3>
          <p data-testid="save-slot-meta">Wave ${slot.wave} · ${escapeHtml(slot.contractName)} · ${escapeHtml(
            slot.townName ?? 'unnamed town',
          )} · ${escapeHtml(ageLabel(slot.timestamp))}</p>
        </div>
        <div class="gr-load-card__actions">
          <button class="gr-start-menu__small-button" type="button" data-slot-action="load" data-slot-id="${escapeHtml(
            slot.id,
          )}" data-testid="save-slot-load">Load</button>
          <form class="gr-load-card__rename" data-slot-id="${escapeHtml(slot.id)}" data-testid="save-slot-rename-form">
            <input data-testid="save-slot-rename-input" name="slotName" maxlength="24" value="${escapeHtml(slot.name)}" />
            <button class="gr-start-menu__small-button" type="submit" data-testid="save-slot-rename">Rename</button>
          </form>
          <button class="gr-start-menu__small-button gr-start-menu__small-button--danger" type="button" data-slot-action="delete" data-slot-id="${escapeHtml(
            slot.id,
          )}" data-testid="save-slot-delete">Delete</button>
        </div>
      </li>
    `;
  }

  private bindLoadRenameForms(): void {
    this.root.querySelectorAll<HTMLFormElement>('[data-testid="save-slot-rename-form"]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = form.querySelector<HTMLInputElement>('[data-testid="save-slot-rename-input"]');
        const result = renameSaveSlot(form.dataset.slotId ?? '', input?.value ?? '', this.storage);
        this.loadMessage = result.message;
        this.render();
      });
    });
  }

  private handleSlotAction(action: string, slotId: string): void {
    if (action === 'delete') {
      const slot = readSaveSlots(this.storage).manual.find((entry) => entry.id === slotId);
      if (slot && !window.confirm(`Delete ${slot.name}?`)) return;
      const result = deleteSaveSlot(slotId, this.storage);
      this.loadMessage = result.message;
      this.render();
      return;
    }
    if (action !== 'load') return;
    const slot = readSaveSlots(this.storage).manual.find((entry) => entry.id === slotId);
    if (!slot) {
      this.loadMessage = 'That claim is no longer on the shelf.';
      this.render();
      return;
    }
    const suspend = readRunSuspend();
    if (suspend && JSON.stringify(suspend) !== JSON.stringify(slot.snapshot)) {
      const auto = `${AUTO_SAVE_SLOT_NAME} (${suspendContext(suspend)})`;
      if (!window.confirm(`Load ${slot.name} and abandon ${auto}?`)) return;
    }
    const result = restoreSaveSlotToAuto(slotId, this.storage);
    if (!result.ok) {
      this.loadMessage = result.message;
      this.render();
      return;
    }
    this.options.onLoadSlot();
  }
}

export function install(parent: HTMLElement, options: StartMenuOptions): StartMenu {
  return new StartMenu(parent, options);
}

function setupProfileStorage(): Storage | undefined {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return undefined;
    if (!loadProfileState(storage) && hasLegacyProfileData(storage)) ensureProfileState(storage);
    if (loadProfileState(storage)) {
      installProfileStorageScope(storage);
      reconcileActiveEpoch();
    }
    return storage;
  } catch {
    return undefined;
  }
}

function hasLegacyProfileData(storage: Storage): boolean {
  for (const key of PROFILE_DATA_KEYS) {
    if (storage.getItem(key) !== null) return true;
  }
  return false;
}

function migrateLegacySuspendResources(storage?: Storage): void {
  if (!storage) return;
  try {
    const raw = storage.getItem(RUN_SUSPEND_KEY);
    if (!raw) return;
    const suspend = JSON.parse(raw) as { economy?: { resources?: unknown } };
    if (!suspend.economy || suspend.economy.resources !== undefined) return;
    suspend.economy.resources = {};
    storage.setItem(RUN_SUSPEND_KEY, JSON.stringify(suspend));
  } catch {}
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

function continueLabel(suspend: { wave: number; contractId: string }): string {
  return `Continue — ${suspendContext(suspend)}`;
}

function savedClaimLabel(suspend: { wave: number; contractId: string }): string {
  return `Saved claim: ${suspendContext(suspend)}. Closing the tab keeps your place.`;
}

function suspendContext(suspend: { wave: number; contractId: string }): string {
  const parts = [`wave ${suspend.wave}`, contractName(suspend.contractId)];
  const townName = readTownName();
  if (townName) parts.push(townName);
  return parts.join(' · ');
}

function contractName(contractId: string): string {
  try {
    return loadContract(contractId).name;
  } catch {
    return contractId;
  }
}

function ageLabel(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
