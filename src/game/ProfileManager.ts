import {
  activeProfile,
  bindProfileSession,
  createProfile,
  ensureProfileState,
  installProfileStorageScope,
  markHintSeen,
  profileDataKey,
  setActiveProfile,
  type ProfileRecord,
  type ProfileState,
} from './ProfileStorage';

type StartGame = () => void;

export class ProfileManager {
  private storage?: Storage;
  private root?: HTMLElement;
  private state?: ProfileState;
  private selectedId = '';
  private started = false;

  constructor(private readonly startGame: StartGame) {}

  install(): this {
    this.storage = browserStorage();
    if (!this.storage) {
      this.started = true;
      this.startGame();
      return this;
    }

    try {
      this.state = ensureProfileState(this.storage);
      installProfileStorageScope(this.storage);
    } catch {
      this.started = true;
      this.startGame();
      return this;
    }

    this.selectedId = this.state.activeId;
    this.exposeDebug();

    if (!shouldShowProfileTitle()) {
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
    this.selectedId = profile.id;
    this.render();
    return profile;
  }

  startProfile(): boolean {
    if (this.started || !this.storage) return this.started;
    if (this.selectedId) setActiveProfile(this.storage, this.selectedId);
    bindProfileSession(this.selectedId);
    this.started = true;
    this.root?.remove();
    this.root = undefined;
    this.startGame();
    return true;
  }

  private render(): void {
    if (this.started || !this.state) return;
    const parent = globalThis.document?.querySelector<HTMLElement>('#app') ?? globalThis.document?.body;
    if (!parent) return;

    if (!this.root) {
      this.root = document.createElement('section');
      this.root.className = 'death-overlay death-overlay--visible gr-profile-title';
      this.root.dataset.testid = 'profile-title';
      this.root.setAttribute('aria-label', 'Choose profile');
      parent.append(this.root);
    }

    const selected = this.state.profiles.find((profile) => profile.id === this.selectedId) ?? this.state.profiles[0]!;
    this.root.innerHTML = `
      <div class="death-overlay__panel gr-profile-title__panel">
        <p class="death-overlay__eyebrow">Claim Ledger</p>
        <h1>Gold Rush</h1>
        <p class="death-overlay__flavor">Choose the ledger riding this claim.</p>
        <ol class="gr-profile-list" data-testid="profile-list">
          ${this.state.profiles.map((profile) => renderProfileRow(profile, profile.id === selected.id)).join('')}
        </ol>
        <form class="gr-profile-create" data-testid="profile-create-form">
          <input data-testid="profile-name-input" name="profileName" maxlength="24" autocomplete="off" placeholder="New ledger name" />
          <button class="death-overlay__button gr-profile-create__button" type="submit" data-testid="profile-create">Create</button>
        </form>
        <button class="death-overlay__button" type="button" data-testid="profile-start">Enter claim as ${escapeHtml(selected.name)}</button>
      </div>
    `;

    this.root.querySelectorAll<HTMLButtonElement>('[data-profile-id]').forEach((button) => {
      button.addEventListener('click', () => this.selectProfile(button.dataset.profileId ?? ''));
    });
    this.root.querySelector<HTMLFormElement>('[data-testid="profile-create-form"]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = this.root?.querySelector<HTMLInputElement>('[data-testid="profile-name-input"]');
      const profile = this.createProfile(input?.value ?? '');
      if (profile && input) input.value = '';
    });
    this.root.querySelector<HTMLButtonElement>('[data-testid="profile-start"]')?.addEventListener('click', () => this.startProfile());
  }

  private exposeDebug(): void {
    if (!this.storage || !isDebugPage()) return;
    globalThis.window.__GR_PROFILE__ = {
      state: () => ensureProfileState(this.storage!),
      active: () => activeProfile(this.storage!),
      createProfile: (name) => this.createProfile(name)?.id ?? null,
      switchProfile: (id) => this.selectProfile(id),
      start: () => this.startProfile(),
      storageKey: (logicalKey, profileId) => profileDataKey(profileId ?? ensureProfileState(this.storage!).activeId, logicalKey),
      markHintSeen: (hintId) => markHintSeen(this.storage!, hintId),
    };
  }
}

export function install(startGame: StartGame): ProfileManager {
  return new ProfileManager(startGame).install();
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

function shouldShowProfileTitle(): boolean {
  const search = globalThis.location?.search ?? '';
  const params = new URLSearchParams(search);
  return params.has('profiles') || search === '';
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
