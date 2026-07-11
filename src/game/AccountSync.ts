import { META_PROGRESS_KEY } from './MetaProgress';
import { activeProfile, loadProfileState, type ProfileStorage } from './ProfileStorage';
import {
  expandCloudProfileTransfer,
  packActiveProfile,
  packActiveProfileForCloud,
  restoreProfileBundle,
  unpackPreview,
  type ProfileTransferEnvelope,
} from './ProfileTransfer';

type Session = {
  email: string;
  token: string;
  accountId: string;
  expiresAt: string;
  profileId?: string;
  lastSavedAt?: string;
};

type CompareChoice = {
  profileId: string;
  savedAt: string;
  line: string;
  envelope: ProfileTransferEnvelope;
};

export type AccountSyncSnapshot = {
  signedIn: boolean;
  email: string;
  label: string;
  message: string;
  pendingEmail: string;
  devCode: string;
  compare?: CompareChoice;
  busy: boolean;
  deleted: boolean;
};

type Listener = () => void;
type RequestCodeResponse = { ok: true; code?: string; dev?: true };
type VerifyResponse = { ok: true; token: string; accountId: string; expiresAt: string };
type SavePullResponse = { ok: true; profileId: string; savedAt: string; envelope: unknown };
type SavePushResponse = { ok: true; savedAt: string };
type SaveVersionSummary = { version: number | null; savedAt: string };
type SaveVersionsResponse = { ok: true; versions: SaveVersionSummary[] };
type SaveProfileSummary = { profileId: string; profileName: string; savedAt: string };
type SaveProfilesResponse = { ok: true; profiles: SaveProfileSummary[] };

const SESSION_KEY = 'gr.account.v1';
const CHANGE_EVENT = 'gr:profile-data-changed';
const SYNC_DEBOUNCE_MS = 30_000;
const MAX_KEEPALIVE_BYTES = 60 * 1024;

class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly payload: unknown = null,
  ) {
    super(message);
  }
}

class AccountSync {
  private storage?: ProfileStorage;
  private session: Session | null = null;
  private listeners = new Set<Listener>();
  private installed = false;
  private busy = false;
  private message = '';
  private pendingEmail = '';
  private devCode = '';
  private compare?: CompareChoice;
  private deleted = false;
  private syncTimer = 0;
  private suppressChangeUntil = 0;

  install(): this {
    if (this.installed) return this;
    this.installed = true;
    this.storage = browserStorage();
    this.session = this.readSession();
    globalThis.window?.addEventListener(CHANGE_EVENT, this.onProfileDataChanged);
    globalThis.window?.addEventListener('pagehide', this.onPageHide);
    globalThis.document?.addEventListener('visibilitychange', this.onVisibilityChange);
    if (this.session && !loadProfileState(this.storage!)) void this.pullStoredProfile();
    return this;
  }

  subscribe(listener: Listener): () => void {
    this.install();
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  snapshot(): AccountSyncSnapshot {
    this.install();
    const session = this.session;
    const label = this.label();
    return {
      signedIn: Boolean(session),
      email: session?.email ?? '',
      label,
      message: this.message || label,
      pendingEmail: this.pendingEmail,
      devCode: this.devCode,
      compare: this.compare,
      busy: this.busy,
      deleted: this.deleted,
    };
  }

  async requestCode(email: string): Promise<void> {
    this.install();
    const clean = email.trim().toLowerCase();
    if (!clean) return this.setMessage('Enter the family email first.');
    await this.run(async () => {
      const response = await this.request<RequestCodeResponse>('/api/request-code', { email: clean, revokeSessions: false });
      this.pendingEmail = clean;
      this.devCode = response.code ?? '';
      this.message = response.dev && response.code ? `Dev code: ${response.code}` : 'Check the email for the 6-digit code.';
    });
  }

  async verifyCode(code: string): Promise<void> {
    this.install();
    const cleanCode = code.trim();
    if (!this.pendingEmail || !/^\d{6}$/.test(cleanCode)) return this.setMessage('Enter the 6-digit code.');
    await this.run(async () => {
      const response = await this.request<VerifyResponse>('/api/verify', { email: this.pendingEmail, code: cleanCode });
      const profileId = this.currentProfileId() ?? undefined;
      this.session = {
        email: this.pendingEmail,
        token: response.token,
        accountId: response.accountId,
        expiresAt: response.expiresAt,
        profileId,
      };
      this.writeSession();
      this.pendingEmail = '';
      this.devCode = '';
      this.deleted = false;
      await this.pullAfterSignIn();
    });
  }

  signOut(): void {
    this.session = null;
    this.compare = undefined;
    this.message = '';
    this.deleted = false;
    this.writeSession();
    this.emit();
  }

  queuePush(): void {
    this.install();
    if (!this.session || this.compare || Date.now() < this.suppressChangeUntil) return;
    window.clearTimeout(this.syncTimer);
    this.syncTimer = window.setTimeout(() => {
      this.syncTimer = 0;
      void this.pushNow();
    }, SYNC_DEBOUNCE_MS);
  }

  async pushNow(options: { force?: boolean; keepalive?: boolean } = {}): Promise<void> {
    this.install();
    if (this.syncTimer) {
      window.clearTimeout(this.syncTimer);
      this.syncTimer = 0;
    }
    if (!this.session || !this.storage || !loadProfileState(this.storage)) return;
    if (this.compare && !options.force) return this.setMessage('Choose cloud or local ledger before backing up.');
    await this.run(async () => {
      const { envelope } = await packActiveProfileForCloud(this.storage!);
      let response: SavePushResponse;
      try {
        response = await this.request<SavePushResponse>(
          '/api/save/push',
          {
            profileId: envelope.profile.id,
            envelope: toServerEnvelope(envelope),
            baseSavedAt: options.force ? undefined : (this.session!.lastSavedAt ?? null),
            acknowledgeConflict: options.force === true,
          },
          this.session!.token,
          { keepalive: options.keepalive },
        );
      } catch (err) {
        if (err instanceof ApiError && err.code === 'stale_save') {
          if (options.keepalive) {
            this.message = 'Cloud has a newer ledger. Reopen to choose before backing up.';
            this.writeSession();
            return;
          }
          await this.openCloudCompare(envelope.profile.id, 'Cloud has a newer ledger. Pick one before backing up.');
          return;
        }
        throw err;
      }
      this.session = { ...this.session!, profileId: envelope.profile.id, lastSavedAt: response.savedAt };
      this.compare = undefined;
      this.message = `ledger backed up ${checkMark()} ${timeAgo(response.savedAt)}`;
      this.writeSession();
    });
  }

  async useCloud(): Promise<void> {
    this.install();
    if (!this.compare || !this.storage) return;
    await this.run(async () => {
      this.suppressChangeUntil = Date.now() + 1500;
      const restored = restoreProfileBundle(this.storage!, this.compare!.envelope);
      if (!restored.ok) throw new Error(restored.message);
      this.session = { ...this.session!, profileId: this.compare!.profileId, lastSavedAt: this.compare!.savedAt };
      this.message = `cloud ledger restored ${checkMark()}`;
      this.compare = undefined;
      this.writeSession();
    });
  }

  async keepLocal(): Promise<void> {
    this.compare = undefined;
    await this.pushNow({ force: true });
  }

  async deleteAccount(): Promise<void> {
    this.install();
    if (!this.session) return;
    await this.run(async () => {
      await this.request<{ ok: true }>('/api/delete-account', {}, this.session!.token);
      this.session = null;
      this.compare = undefined;
      this.deleted = true;
      this.message = 'Cloud ledger burned. This browser keeps its local ledger.';
      this.writeSession();
    });
  }

  private readonly onProfileDataChanged = () => this.queuePush();
  private readonly onPageHide = () => this.flushQueuedPush();
  private readonly onVisibilityChange = () => {
    if (globalThis.document?.visibilityState === 'hidden') this.flushQueuedPush();
  };

  private flushQueuedPush(): void {
    if (!this.syncTimer) return;
    window.clearTimeout(this.syncTimer);
    this.syncTimer = 0;
    void this.pushNow({ keepalive: true });
  }

  private async pullAfterSignIn(): Promise<void> {
    const profileId = this.currentProfileId() ?? this.session?.profileId;
    if (!profileId) {
      const [profile] = await this.listProfiles();
      if (!profile) return this.setMessage('Signed in. Create a ledger, then it can back up.');
      const cloud = await this.pull(profile.profileId);
      if (!cloud) return this.setMessage('Signed in. Create a ledger, then it can back up.');
      this.session = { ...this.session!, profileId: profile.profileId, lastSavedAt: cloud.savedAt };
      this.compare = { profileId: profile.profileId, savedAt: cloud.savedAt, envelope: cloud.envelope, line: cloudLine(cloud.envelope, cloud.savedAt) };
      this.message = 'Cloud ledger found. Choose how to open it.';
      this.writeSession();
      return;
    }
    this.session = { ...this.session!, profileId };
    this.writeSession();
    if (!(await this.hasCloudSave(profileId))) {
      await this.pushNow();
      return;
    }
    const cloud = await this.pull(profileId);
    if (!cloud) return;
    const local = this.localEnvelope();
    if (local && sameLedgerContent(local, cloud.envelope)) {
      this.session = { ...this.session!, lastSavedAt: cloud.savedAt };
      this.message = `ledger backed up ${checkMark()} ${timeAgo(cloud.savedAt)}`;
      this.writeSession();
      return;
    }
    if (!local) {
      this.compare = { profileId, savedAt: cloud.savedAt, envelope: cloud.envelope, line: cloudLine(cloud.envelope, cloud.savedAt) };
      this.message = 'Cloud ledger found. Choose how to open it.';
      return;
    }
    this.compare = { profileId, savedAt: cloud.savedAt, envelope: cloud.envelope, line: cloudLine(cloud.envelope, cloud.savedAt) };
    this.message = 'Cloud and local ledgers differ. Pick one.';
  }

  private async pullStoredProfile(): Promise<void> {
    try {
      if (!this.session?.profileId || !this.storage) return;
      if (!(await this.hasCloudSave(this.session.profileId).catch(() => false))) return;
      const cloud = await this.pull(this.session.profileId).catch(() => null);
      if (!cloud) return;
      const local = this.localEnvelope();
      if (local) {
        this.compare = {
          profileId: this.session.profileId,
          savedAt: cloud.savedAt,
          envelope: cloud.envelope,
          line: cloudLine(cloud.envelope, cloud.savedAt),
        };
        this.message = sameLedgerContent(local, cloud.envelope)
          ? `ledger backed up ${checkMark()} ${timeAgo(cloud.savedAt)}`
          : 'Cloud ledger found. Choose how to open it.';
        this.session = { ...this.session, lastSavedAt: cloud.savedAt };
        this.writeSession();
        this.emit();
        return;
      }
      if (loadProfileState(this.storage)) {
        this.compare = {
          profileId: this.session.profileId,
          savedAt: cloud.savedAt,
          envelope: cloud.envelope,
          line: cloudLine(cloud.envelope, cloud.savedAt),
        };
        this.message = 'Cloud ledger found. Choose how to open it.';
        this.emit();
        return;
      }
      this.suppressChangeUntil = Date.now() + 1500;
      const restored = restoreProfileBundle(this.storage, cloud.envelope);
      if (restored.ok) {
        this.session = { ...this.session, lastSavedAt: cloud.savedAt };
        this.writeSession();
        this.message = `cloud ledger restored ${checkMark()}`;
        this.emit();
      } else {
        this.message = restored.message;
        this.emit();
      }
    } catch {
      this.message = "the wire's down - your ledger stays safe here.";
      this.emit();
    }
  }

  private async openCloudCompare(profileId: string, message: string): Promise<void> {
    const cloud = await this.pull(profileId);
    if (!cloud) {
      this.message = message;
      return;
    }
    const local = this.localEnvelope();
    if (local && sameLedgerContent(local, cloud.envelope)) {
      this.session = { ...this.session!, profileId, lastSavedAt: cloud.savedAt };
      this.compare = undefined;
      this.message = `ledger backed up ${checkMark()} ${timeAgo(cloud.savedAt)}`;
      this.writeSession();
      return;
    }
    this.compare = { profileId, savedAt: cloud.savedAt, envelope: cloud.envelope, line: cloudLine(cloud.envelope, cloud.savedAt) };
    this.session = { ...this.session!, profileId, lastSavedAt: cloud.savedAt };
    this.message = message;
    this.writeSession();
  }

  private async pull(profileId: string): Promise<{ savedAt: string; envelope: ProfileTransferEnvelope } | null> {
    try {
      const response = await this.request<SavePullResponse>('/api/save/pull', { profileId }, this.session?.token);
      const envelope = await fromServerEnvelope(response.envelope);
      return envelope ? { savedAt: response.savedAt, envelope } : null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  private async hasCloudSave(profileId: string): Promise<boolean> {
    const response = await this.request<SaveVersionsResponse>('/api/save/versions', { profileId }, this.session?.token);
    const current = response.versions.find((version) => version.version === null);
    if (current && this.session) {
      this.session = { ...this.session, lastSavedAt: current.savedAt };
      this.writeSession();
    }
    return response.versions.length > 0;
  }

  private async listProfiles(): Promise<SaveProfileSummary[]> {
    const response = await this.request<SaveProfilesResponse>('/api/save/profiles', {}, this.session?.token);
    return response.profiles.filter(isSaveProfileSummary);
  }

  private localEnvelope(): ProfileTransferEnvelope | null {
    if (!this.storage || !loadProfileState(this.storage)) return null;
    try {
      return packActiveProfile(this.storage).envelope;
    } catch {
      return null;
    }
  }

  private currentProfileId(): string | null {
    if (!this.storage) return null;
    const state = loadProfileState(this.storage);
    if (!state) return null;
    return state.activeId || activeProfile(this.storage).id;
  }

  private async run(work: () => Promise<void>): Promise<void> {
    this.busy = true;
    this.message = this.message || 'checking the ledger wire...';
    this.emit();
    try {
      await work();
    } catch (err) {
      this.message = friendlyError(err);
    } finally {
      this.busy = false;
      this.emit();
    }
  }

  private async request<T extends { ok: true }>(
    route: string,
    body: unknown,
    token?: string,
    options: { keepalive?: boolean } = {},
  ): Promise<T> {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (token) headers.authorization = `Bearer ${token}`;
    const bodyText = JSON.stringify(body);
    const request = { method: 'POST', headers, body: bodyText };
    const response = await fetch(`${apiBase()}${route}`, {
      ...request,
      keepalive: options.keepalive === true && byteLength(bodyText) <= MAX_KEEPALIVE_BYTES,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !isRecord(payload) || payload.ok !== true) {
      throw new ApiError(
        response.status,
        isRecord(payload) && typeof payload.error === 'string' ? payload.error : 'request_failed',
        isRecord(payload) && typeof payload.message === 'string' ? payload.message : 'The ledger office did not answer.',
        payload,
      );
    }
    return payload as T;
  }

  private label(): string {
    if (!this.session) return this.deleted ? 'cloud ledger burned' : 'ledger local only';
    if (this.compare) return 'choose cloud or local ledger';
    if (this.busy) return 'checking the ledger wire...';
    if (this.message.startsWith('the wire')) return this.message;
    const savedAt = this.session.lastSavedAt;
    return savedAt ? `ledger backed up ${checkMark()} ${timeAgo(savedAt)}` : 'ledger ready to back up';
  }

  private setMessage(message: string): void {
    this.message = message;
    this.emit();
  }

  private readSession(): Session | null {
    if (!this.storage) return null;
    try {
      const raw = this.storage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!isRecord(parsed) || typeof parsed.token !== 'string' || typeof parsed.email !== 'string') return null;
      if (typeof parsed.expiresAt === 'string' && Date.parse(parsed.expiresAt) <= Date.now()) {
        this.storage.removeItem(SESSION_KEY);
        return null;
      }
      return parsed as Session;
    } catch {
      return null;
    }
  }

  private writeSession(): void {
    if (!this.storage) return;
    try {
      if (this.session) this.storage.setItem(SESSION_KEY, JSON.stringify(this.session));
      else this.storage.removeItem(SESSION_KEY);
    } catch {
      // Session metadata is best-effort; the local ledger remains the source of truth.
    }
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

export const accountSync = new AccountSync();

function toServerEnvelope(envelope: ProfileTransferEnvelope): Record<string, unknown> {
  return { ...envelope, kind: 'gold-rush-ledger-bundle' };
}

async function fromServerEnvelope(value: unknown): Promise<ProfileTransferEnvelope | null> {
  if (!isRecord(value)) return null;
  const kind = value.kind;
  const translated = kind === 'gold-rush-ledger-bundle' ? { ...value, kind: 'goldrush.profile.ledger' } : value;
  const preview = unpackPreview(JSON.stringify(translated));
  return 'ok' in preview ? null : expandCloudProfileTransfer(preview.envelope);
}

function sameLedgerContent(left: ProfileTransferEnvelope, right: ProfileTransferEnvelope): boolean {
  return JSON.stringify(ledgerContent(left)) === JSON.stringify(ledgerContent(right));
}

function ledgerContent(envelope: ProfileTransferEnvelope): Omit<ProfileTransferEnvelope, 'exportedAt'> {
  return {
    kind: envelope.kind,
    version: envelope.version,
    profile: envelope.profile,
    data: envelope.data,
  };
}

function cloudLine(envelope: ProfileTransferEnvelope, savedAt: string): string {
  const data = envelope.data;
  const town = typeof data['gr.town.name.v1'] === 'string' && data['gr.town.name.v1'].trim() ? data['gr.town.name.v1'].trim() : 'unnamed town';
  const science = scienceLevel(data[META_PROGRESS_KEY]);
  return `Cloud has ${town} at science ${science} (${envelope.profile.name}) from ${timeAgo(savedAt)}.`;
}

function scienceLevel(value: unknown): number {
  if (isRecord(value) && isRecord(value.tracks) && typeof value.tracks.science === 'number') return Math.floor(value.tracks.science);
  if (isRecord(value) && typeof value.science === 'number') return Math.floor(value.science);
  return 0;
}

function friendlyError(err: unknown): string {
  if (err instanceof ApiError && err.code === 'sign_in_not_enabled') return 'sign-in is not enabled yet; your ledger stays safe here.';
  if (err instanceof ApiError && err.code === 'payload_too_large') return 'That ledger is too large to back up; oldest manual claims stay on this device.';
  if (err instanceof Error && err.message) return err.message;
  return "the wire's down - your ledger stays safe here.";
}

function apiBase(): string {
  const raw = import.meta.env.VITE_ACCOUNTS_API_URL;
  return typeof raw === 'string' && raw.trim() ? raw.trim().replace(/\/+$/, '') : '';
}

function timeAgo(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 60_000) return 'just now';
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

function checkMark(): string {
  return '\u2713';
}

function browserStorage(): ProfileStorage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function isSaveProfileSummary(value: unknown): value is SaveProfileSummary {
  return (
    isRecord(value) &&
    typeof value.profileId === 'string' &&
    typeof value.profileName === 'string' &&
    typeof value.savedAt === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
