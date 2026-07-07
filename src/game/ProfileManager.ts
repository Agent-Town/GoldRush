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
import { packActiveProfile, unpackPreview, unpackProfile, type ProfileTransferEnvelope } from './ProfileTransfer';

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
    if (globalThis.window?.__GR_PROFILE__) globalThis.window.__GR_PROFILE__ = undefined;
  }

  selectProfile(profileId: string): boolean {
    if (this.started || !this.storage || !this.state) return false;
    if (!setActiveProfile(this.storage, profileId)) return false;
    this.state = ensureProfileState(this.storage);
    this.selectedId = this.state.activeId;
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
        </div>
      `;
      this.bindCreateForm();
      this.root.querySelector<HTMLInputElement>('[data-testid="profile-name-input"]')?.focus({ preventScroll: true });
      return;
    }

    const selected = this.state.profiles.find((profile) => profile.id === this.selectedId) ?? this.state.profiles[0]!;
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
  }

  private loadInitialState(): ProfileState | undefined {
    if (!this.storage) return undefined;
    const saved = loadProfileState(this.storage);
    if (saved) return saved;
    if (shouldSeedDefaultProfile() || hasLegacyProfileData(this.storage)) return ensureProfileState(this.storage);
    return undefined;
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
