import {
  PROFILE_DATA_KEYS,
  activeProfile,
  bindProfileSession,
  createProfile,
  ensureProfileState,
  installProfileStorageScope,
  loadProfileState,
  markHintSeen,
  profileDataKey,
  setActiveProfile,
  type ProfileRecord,
  type ProfileStorage,
  type ProfileState,
} from './ProfileStorage';
import { accountSync } from './AccountSync';
import { packActiveProfile, unpackPreview, unpackProfile, type ProfileTransferEnvelope } from './ProfileTransfer';
import { SAVE_SLOT_TRANSFER_MANUAL_LIMIT, readSaveSlots } from './SaveSlots';

type StartGame = () => void;
type InstallOptions = {
  showTitle?: boolean;
  skipTitle?: boolean;
};

export class ProfileManager {
  private storage?: Storage;
  private root?: HTMLElement;
  private state?: ProfileState;
  private selectedId = '';
  private started = false;
  private importEnvelope?: ProfileTransferEnvelope;
  private message = '';
  private burnConfirm = false;
  private unsubscribeAccountSync: () => void = () => undefined;

  constructor(
    private readonly startGame: StartGame,
    private readonly options: InstallOptions = {},
  ) {}

  install(): this {
    this.storage = browserStorage();
    if (!this.storage) {
      this.started = true;
      this.startGame();
      return this;
    }

    try {
      this.state = this.loadInitialState();
      if (this.state) installProfileStorageScope(this.storage);
    } catch {
      this.started = true;
      this.startGame();
      return this;
    }

    this.selectedId = this.state?.activeId ?? '';
    this.unsubscribeAccountSync = accountSync.subscribe(() => {
      this.refreshStateFromStorage();
      this.render();
    });
    this.exposeDebug();

    if (this.state && !shouldShowProfileTitle(this.options)) {
      bindProfileSession(this.selectedId);
      this.started = true;
      this.startGame();
      return this;
    }

    this.render();
    return this;
  }

  dispose(): void {
    this.root?.remove();
    this.unsubscribeAccountSync();
    if (globalThis.window?.__GR_PROFILE__) globalThis.window.__GR_PROFILE__ = undefined;
  }

  selectProfile(profileId: string): boolean {
    if (this.started || !this.storage || !this.state) return false;
    if (!setActiveProfile(this.storage, profileId)) return false;
    this.state = ensureProfileState(this.storage);
    this.selectedId = this.state.activeId;
    accountSync.queuePush();
    this.render();
    return true;
  }

  createProfile(name: string): ProfileRecord | null {
    if (this.started || !this.storage) return null;
    const profile = createProfile(this.storage, name);
    if (!profile) return null;
    this.state = ensureProfileState(this.storage);
    installProfileStorageScope(this.storage);
    this.selectedId = profile.id;
    accountSync.queuePush();
    this.render();
    return profile;
  }

  startProfile(): boolean {
    if (this.started || !this.storage || !this.selectedId) return this.started;
    if (this.selectedId) setActiveProfile(this.storage, this.selectedId);
    bindProfileSession(this.selectedId);
    this.started = true;
    this.root?.remove();
    this.root = undefined;
    this.startGame();
    return true;
  }

  private render(): void {
    if (this.started) return;
    const parent = globalThis.document?.querySelector<HTMLElement>('#app') ?? globalThis.document?.body;
    if (!parent) return;

    if (!this.root) {
      this.root = document.createElement('section');
      this.root.className = 'death-overlay death-overlay--visible gr-profile-title';
      this.root.dataset.testid = 'profile-title';
      this.root.setAttribute('aria-label', 'Choose profile');
      parent.append(this.root);
    }

    if (!this.state) {
      this.root.innerHTML = `
        <div class="death-overlay__panel gr-profile-title__panel">
          <p class="death-overlay__eyebrow">Claim Ledger</p>
          <h1>Who's prospecting?</h1>
          <p class="death-overlay__flavor">Name the ledger before the first claim.</p>
          ${this.message ? `<p class="gr-profile-message" data-testid="profile-message">${escapeHtml(this.message)}</p>` : ''}
          <form class="gr-profile-create gr-profile-create--first" data-testid="profile-create-form">
            <input data-testid="profile-name-input" name="profileName" maxlength="24" autocomplete="off" placeholder="Prospector name" />
            <button class="death-overlay__button gr-profile-create__button" type="submit" data-testid="profile-create">Open ledger</button>
          </form>
          ${this.renderAccountCard()}
        </div>
      `;
      this.bindCreateForm();
      this.bindAccountControls();
      this.root.querySelector<HTMLInputElement>('[data-testid="profile-name-input"]')?.focus({ preventScroll: true });
      return;
    }

    const selected = this.state.profiles.find((profile) => profile.id === this.selectedId) ?? this.state.profiles[0]!;
    const transferCapNotice = this.transferCapNotice();
    this.root.innerHTML = `
      <div class="death-overlay__panel gr-profile-title__panel">
        <p class="death-overlay__eyebrow">Claim Ledger</p>
        <h1>Profiles</h1>
        <p class="death-overlay__flavor">Saves live in this browser. Pack the ledger to keep or move them.</p>
        ${this.message ? `<p class="gr-profile-message" data-testid="profile-message">${escapeHtml(this.message)}</p>` : ''}
        <ol class="gr-profile-list" data-testid="profile-list">
          ${this.state.profiles.map((profile) => renderProfileRow(profile, profile.id === selected.id)).join('')}
        </ol>
        <form class="gr-profile-create" data-testid="profile-create-form">
          <input data-testid="profile-name-input" name="profileName" maxlength="24" autocomplete="off" placeholder="New ledger name" />
          <button class="death-overlay__button gr-profile-create__button" type="submit" data-testid="profile-create">Create</button>
        </form>
        <div class="gr-profile-transfer">
          <button class="death-overlay__button" type="button" data-testid="profile-export">Pack the ledger</button>
          <label class="gr-profile-file">
            <span>Unpack a ledger</span>
            <input type="file" data-testid="profile-import-file" accept="application/json,.json" />
          </label>
        </div>
        ${transferCapNotice}
        ${this.renderAccountCard()}
        ${this.importEnvelope ? `<div class="gr-profile-import" data-testid="profile-import-confirm">
          <p>${escapeHtml(this.message)}</p>
          <button class="death-overlay__button" type="button" data-testid="profile-import-apply">Bring them in</button>
        </div>` : ''}
        <button class="death-overlay__button" type="button" data-testid="profile-start">Enter claim as ${escapeHtml(selected.name)}</button>
      </div>
    `;

    this.root.querySelectorAll<HTMLButtonElement>('[data-profile-id]').forEach((button) => {
      button.addEventListener('click', () => this.selectProfile(button.dataset.profileId ?? ''));
    });
    this.bindCreateForm();
    this.root.querySelector<HTMLButtonElement>('[data-testid="profile-export"]')?.addEventListener('click', () => this.exportProfile());
    this.root.querySelector<HTMLInputElement>('[data-testid="profile-import-file"]')?.addEventListener('change', (event) => {
      const input = event.currentTarget as HTMLInputElement;
      void this.previewImport(input.files?.[0]);
    });
    this.root.querySelector<HTMLButtonElement>('[data-testid="profile-import-apply"]')?.addEventListener('click', () => this.applyImport());
    this.root.querySelector<HTMLButtonElement>('[data-testid="profile-start"]')?.addEventListener('click', () => this.startProfile());
    this.bindAccountControls();
  }

  private renderAccountCard(): string {
    const account = accountSync.snapshot();
    const disabled = account.busy ? ' disabled' : '';
    if (!account.signedIn) {
      return `
        <section class="gr-account-card" data-testid="account-card">
          <p class="gr-account-chip" data-testid="account-status-chip">${escapeHtml(account.label)}</p>
          <form class="gr-account-form" data-testid="account-email-form">
            <input data-testid="account-email" name="accountEmail" type="email" autocomplete="email" placeholder="family@email.com" value="${escapeHtml(
              account.pendingEmail,
            )}"${disabled} />
            <button class="death-overlay__button" type="submit" data-testid="account-request-code"${disabled}>Send code</button>
          </form>
          ${
            account.pendingEmail
              ? `<form class="gr-account-form" data-testid="account-code-form">
                <input data-testid="account-code" name="accountCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="6-digit code"${disabled} />
                <button class="death-overlay__button" type="submit" data-testid="account-verify"${disabled}>Sign in</button>
              </form>
              ${account.devCode ? `<p class="gr-account-dev-code" data-testid="account-dev-code">${escapeHtml(account.devCode)}</p>` : ''}`
              : ''
          }
          <p class="gr-account-note" data-testid="account-message">${escapeHtml(account.message)}</p>
        </section>
      `;
    }

    return `
      <section class="gr-account-card" data-testid="account-card">
        <p class="gr-account-chip" data-testid="account-status-chip">${escapeHtml(account.label)}</p>
        <p class="gr-account-note" data-testid="account-message">${escapeHtml(account.message)}</p>
        ${account.compare ? `<div class="gr-account-compare" data-testid="account-compare-card">
          <p>${escapeHtml(account.compare.line)}</p>
          <button class="death-overlay__button" type="button" data-testid="account-use-cloud"${disabled}>Use cloud</button>
          <button class="death-overlay__button" type="button" data-testid="account-keep-local"${disabled}>Keep local</button>
        </div>` : ''}
        <div class="gr-account-actions">
          <button class="death-overlay__button" type="button" data-testid="account-sync-now"${disabled}>Back up now</button>
          <button class="death-overlay__button" type="button" data-testid="account-sign-out"${disabled}>Sign out</button>
          <button class="death-overlay__button gr-account-danger" type="button" data-testid="account-burn"${disabled}>Burn cloud ledger</button>
        </div>
        ${this.burnConfirm ? `<div class="gr-account-burn" data-testid="account-burn-confirm-card">
          <p>Delete the cloud account and its saved ledgers? This browser stays local.</p>
          <button class="death-overlay__button gr-account-danger" type="button" data-testid="account-burn-confirm"${disabled}>Burn it</button>
          <button class="death-overlay__button" type="button" data-testid="account-burn-cancel"${disabled}>Keep it</button>
        </div>` : ''}
      </section>
    `;
  }

  private loadInitialState(): ProfileState | undefined {
    if (!this.storage) return undefined;
    const saved = loadProfileState(this.storage);
    if (saved) return saved;
    if (shouldSeedDefaultProfile() || hasLegacyProfileData(this.storage)) return ensureProfileState(this.storage);
    return undefined;
  }

  private transferCapNotice(): string {
    if (!this.storage) return '';
    const slots = readSaveSlots(this.storage).manual.length;
    if (slots <= SAVE_SLOT_TRANSFER_MANUAL_LIMIT) return '';
    return `<p class="gr-profile-transfer__note" data-testid="profile-transfer-cap-note">Pack keeps the ${SAVE_SLOT_TRANSFER_MANUAL_LIMIT} most recent manual claims when the ledger is large; oldest slots stay on this device.</p>`;
  }

  private refreshStateFromStorage(): void {
    if (this.started || !this.storage) return;
    const saved = loadProfileState(this.storage);
    if (!saved) return;
    this.state = saved;
    this.selectedId = saved.activeId;
    installProfileStorageScope(this.storage);
  }

  private bindCreateForm(): void {
    this.root?.querySelector<HTMLFormElement>('[data-testid="profile-create-form"]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = this.root?.querySelector<HTMLInputElement>('[data-testid="profile-name-input"]');
      const profile = this.createProfile(input?.value ?? '');
      if (profile && input) input.value = '';
      else {
        this.message = 'Use a ledger name the family can read.';
        this.render();
      }
    });
  }

  private bindAccountControls(): void {
    this.root?.querySelector<HTMLFormElement>('[data-testid="account-email-form"]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = this.root?.querySelector<HTMLInputElement>('[data-testid="account-email"]');
      void accountSync.requestCode(input?.value ?? '');
    });
    this.root?.querySelector<HTMLFormElement>('[data-testid="account-code-form"]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = this.root?.querySelector<HTMLInputElement>('[data-testid="account-code"]');
      void accountSync.verifyCode(input?.value ?? '');
    });
    this.root?.querySelector<HTMLButtonElement>('[data-testid="account-sync-now"]')?.addEventListener('click', () => {
      void accountSync.pushNow();
    });
    this.root?.querySelector<HTMLButtonElement>('[data-testid="account-use-cloud"]')?.addEventListener('click', () => {
      void accountSync.useCloud();
    });
    this.root?.querySelector<HTMLButtonElement>('[data-testid="account-keep-local"]')?.addEventListener('click', () => {
      void accountSync.keepLocal();
    });
    this.root?.querySelector<HTMLButtonElement>('[data-testid="account-sign-out"]')?.addEventListener('click', () => {
      this.burnConfirm = false;
      accountSync.signOut();
      this.render();
    });
    this.root?.querySelector<HTMLButtonElement>('[data-testid="account-burn"]')?.addEventListener('click', () => {
      this.burnConfirm = true;
      this.render();
    });
    this.root?.querySelector<HTMLButtonElement>('[data-testid="account-burn-cancel"]')?.addEventListener('click', () => {
      this.burnConfirm = false;
      this.render();
    });
    this.root?.querySelector<HTMLButtonElement>('[data-testid="account-burn-confirm"]')?.addEventListener('click', () => {
      this.burnConfirm = false;
      void accountSync.deleteAccount();
    });
  }

  private exportProfile(): void {
    if (!this.storage || !this.state) return;
    const { envelope, filename } = packActiveProfile(this.storage);
    const blob = new Blob([`${JSON.stringify(envelope, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private async previewImport(file: File | undefined): Promise<void> {
    if (!file) return;
    const preview = unpackPreview(await file.text());
    if ('ok' in preview) {
      this.importEnvelope = undefined;
      this.message = preview.message;
      this.render();
      return;
    }
    this.importEnvelope = preview.envelope;
    this.message = preview.line;
    this.render();
  }

  private applyImport(): void {
    if (!this.storage || !this.importEnvelope) return;
    const result = unpackProfile(this.storage, this.importEnvelope);
    this.importEnvelope = undefined;
    if (!result.ok) {
      this.message = result.message;
      this.render();
      return;
    }
    this.state = ensureProfileState(this.storage);
    this.selectedId = result.profile.id;
    this.message = `${result.profile.name} joined the ledger.`;
    accountSync.queuePush();
    this.render();
  }

  private exposeDebug(): void {
    if (!this.storage || !isDebugPage()) return;
    globalThis.window.__GR_PROFILE__ = {
      state: () => loadProfileState(this.storage!) ?? { version: 2, activeId: '', profiles: [] },
      active: () => activeProfile(this.storage!),
      createProfile: (name) => this.createProfile(name)?.id ?? null,
      switchProfile: (id) => this.selectProfile(id),
      start: () => this.startProfile(),
      storageKey: (logicalKey, profileId) => profileDataKey(profileId ?? (loadProfileState(this.storage!)?.activeId ?? ''), logicalKey),
      markHintSeen: (hintId) => markHintSeen(this.storage!, hintId),
    };
  }
}

export function install(startGame: StartGame, options: InstallOptions = {}): ProfileManager {
  return new ProfileManager(startGame, options).install();
}

function renderProfileRow(profile: ProfileRecord, selected: boolean): string {
  return `
    <li>
      <button class="gr-profile-row" type="button" data-testid="profile-row" data-profile-id="${escapeHtml(profile.id)}" aria-pressed="${selected}">
        <span>${escapeHtml(profile.name)}</span>
        <small>${escapeHtml(profile.difficultyPreset)}</small>
      </button>
    </li>
  `;
}

function shouldShowProfileTitle(options: InstallOptions): boolean {
  if (options.showTitle) return true;
  if (options.skipTitle) return false;
  const search = globalThis.location?.search ?? '';
  const params = new URLSearchParams(search);
  return params.has('profiles') || search === '';
}

function shouldSeedDefaultProfile(): boolean {
  const search = globalThis.location?.search ?? '';
  if (!search) return false;
  const params = new URLSearchParams(search);
  return !params.has('profiles');
}

function hasLegacyProfileData(storage: ProfileStorage): boolean {
  for (const key of PROFILE_DATA_KEYS) {
    try {
      if (storage.getItem(key) !== null) return true;
    } catch {}
  }
  return false;
}

function isDebugPage(): boolean {
  return new URLSearchParams(globalThis.location?.search ?? '').has('debug');
}

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
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
