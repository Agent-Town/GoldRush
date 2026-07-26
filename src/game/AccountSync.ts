import { GAME_API_ORIGIN } from '../app/GameApi';
import { META_PROGRESS_KEY } from './MetaProgress';
import { activeProfile, bindProfileSession, loadProfileState, type ProfileStorage } from './ProfileStorage';
import {
  CloudProfileTooLargeError,
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
  savedAtByProfile?: Record<string, string>;
  syncError?: string;
};

type CompareChoice = {
  profileId: string;
  savedAt: string;
  line: string;
  envelope: ProfileTransferEnvelope;
};

export type CloudProfileSummary = { profileId: string; profileName: string; savedAt: string };

export type AccountSyncSnapshot = {
  signedIn: boolean;
  email: string;
  label: string;
  message: string;
  pendingEmail: string;
  devCode: string;
  cloudProfiles: CloudProfileSummary[];
  compare?: CompareChoice;
  busy: boolean;
  deleted: boolean;
};

type Listener = () => void;
type RequestCodeResponse = { ok: true; code?: string; dev?: true };
type VerifyResponse = { ok: true; token: string; accountId: string; expiresAt: string };
type SavePullResponse = { ok: true; profileId: string; savedAt: string; envelope: unknown };
type SavePushResponse = { ok: true; savedAt: string };
type SaveProfilesResponse = { ok: true; profiles: CloudProfileSummary[] };

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
  private cloudProfiles: CloudProfileSummary[] = [];
  private compare?: CompareChoice;
  private deleted = false;
  private syncTimer = 0;
  private suppressChangeUntil = 0;

  install(): this {
    if (this.installed) return this;
    this.installed = true;
    this.storage = browserStorage();
    this.session = this.readSession();
    this.message = typeof this.session?.syncError === 'string' ? this.session.syncError : '';
    globalThis.window?.addEventListener(CHANGE_EVENT, this.onProfileDataChanged);
    globalThis.window?.addEventListener('pagehide', this.onPageHide);
    globalThis.document?.addEventListener('visibilitychange', this.onVisibilityChange);
    if (this.session) {
      if (loadProfileState(this.storage!)) void this.refreshCloudProfiles();
      else void this.pullStoredProfile();
    }
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
      cloudProfiles: [...this.cloudProfiles],
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
    this.cloudProfiles = [];
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
    const session = this.session;
    await this.run(async () => {
      let envelope: ProfileTransferEnvelope;
      try {
        ({ envelope } = await packActiveProfileForCloud(this.storage!));
      } catch (err) {
        if (!this.isCurrentSession(session)) return;
        if (err instanceof CloudProfileTooLargeError) {
          this.session = { ...this.session!, syncError: err.message };
          this.writeSession();
        }
        throw err;
      }
      if (!this.isCurrentSession(session)) return;
      let response: SavePushResponse;
      try {
        const profileCursor =
          session.savedAtByProfile?.[envelope.profile.id] ??
          (session.profileId === envelope.profile.id ? (session.lastSavedAt ?? null) : null);
        response = await this.request<SavePushResponse>(
          '/api/save/push',
          {
            profileId: envelope.profile.id,
            envelope: toServerEnvelope(envelope),
            baseSavedAt: options.force ? undefined : profileCursor,
            acknowledgeConflict: options.force === true,
          },
          session.token,
          { keepalive: options.keepalive },
        );
      } catch (err) {
        if (!this.isCurrentSession(session)) return;
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
      if (!this.isCurrentSession(session)) return;
      this.session = withProfileCursor(this.session!, envelope.profile.id, response.savedAt, { syncError: undefined });
      this.rememberCloudProfile({ profileId: envelope.profile.id, profileName: envelope.profile.name, savedAt: response.savedAt });
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
      bindProfileSession(restored.profile.id);
      this.session = withProfileCursor(this.session!, this.compare!.profileId, this.compare!.savedAt, { syncError: undefined });
      this.message = `cloud ledger restored ${checkMark()}`;
      this.compare = undefined;
      this.writeSession();
    });
  }

  async selectCloudProfile(profileId: string): Promise<void> {
    this.install();
    const summary = this.cloudProfiles.find((profile) => profile.profileId === profileId);
    if (!this.session || !summary) return;
    const session = this.session;
    await this.run(async () => {
      const cloud = await this.pull(summary.profileId, session);
      if (!this.isCurrentSession(session)) return;
      if (!cloud) throw new Error('That cloud ledger is no longer available.');
      this.compare = {
        profileId: summary.profileId,
        savedAt: cloud.savedAt,
        envelope: cloud.envelope,
        line: cloudLine(cloud.envelope, cloud.savedAt),
      };
      this.message = `${summary.profileName}'s cloud ledger is ready. Choose how to open it.`;
    });
  }

  async keepLocal(): Promise<void> {
    const compareProfileId = this.compare?.profileId;
    this.compare = undefined;
    if (!compareProfileId || this.currentProfileId() !== compareProfileId) {
      this.message = 'Cloud ledger left untouched.';
      this.emit();
      return;
    }
    await this.pushNow({ force: true });
  }

  async deleteAccount(): Promise<void> {
    this.install();
    if (!this.session) return;
    await this.run(async () => {
      await this.request<{ ok: true }>('/api/delete-account', {}, this.session!.token);
      this.session = null;
      this.cloudProfiles = [];
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
    const session = this.session;
    if (!session) return;
    const cloudProfiles = await this.listProfiles(session);
    if (!cloudProfiles) return;
    this.cloudProfiles = cloudProfiles;
    const profileId = this.currentProfileId() ?? session.profileId;
    if (!profileId) {
      this.message = this.cloudProfilePrompt();
      return;
    }
    if (!this.isCurrentSession(session)) return;
    this.session = { ...this.session!, profileId };
    this.writeSession();
    if (!cloudProfiles.some((profile) => profile.profileId === profileId)) {
      await this.pushNow();
      return;
    }
    const cloud = await this.pull(profileId, session);
    if (!this.isCurrentSession(session)) return;
    if (!cloud) return;
    const local = this.localEnvelope();
    if (local && sameLedgerContent(local, cloud.envelope)) {
      this.session = withProfileCursor(this.session!, profileId, cloud.savedAt, { syncError: undefined });
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
    const session = this.session;
    if (!session || !this.storage) return;
    try {
      const cloudProfiles = await this.listProfiles(session);
      if (!cloudProfiles) return;
      this.cloudProfiles = cloudProfiles;
      if (!session.profileId) {
        this.message = this.cloudProfilePrompt();
        this.emit();
        return;
      }
      if (!cloudProfiles.some((profile) => profile.profileId === session.profileId)) {
        this.message = this.cloudProfilePrompt();
        this.emit();
        return;
      }
      const cloud = await this.pull(session.profileId, session).catch(() => null);
      if (!this.isCurrentSession(session)) return;
      if (!cloud) {
        this.message = this.cloudProfilePrompt();
        this.emit();
        return;
      }
      const local = this.localEnvelope();
      if (local) {
        const same = sameLedgerContent(local, cloud.envelope);
        this.compare = {
          profileId: session.profileId,
          savedAt: cloud.savedAt,
          envelope: cloud.envelope,
          line: cloudLine(cloud.envelope, cloud.savedAt),
        };
        this.message = same
          ? `ledger backed up ${checkMark()} ${timeAgo(cloud.savedAt)}`
          : 'Cloud ledger found. Choose how to open it.';
        this.session = same
          ? withProfileCursor(session, session.profileId, cloud.savedAt, { syncError: undefined })
          : session;
        this.writeSession();
        this.emit();
        return;
      }
      if (loadProfileState(this.storage)) {
        this.compare = {
          profileId: session.profileId,
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
        bindProfileSession(restored.profile.id);
        this.session = withProfileCursor(session, session.profileId, cloud.savedAt, { syncError: undefined });
        this.writeSession();
        this.message = `cloud ledger restored ${checkMark()}`;
        this.emit();
      } else {
        this.message = restored.message;
        this.emit();
      }
    } catch {
      if (!this.isCurrentSession(session)) return;
      this.message = "the wire's down - your ledger stays safe here.";
      this.emit();
    }
  }

  private async openCloudCompare(profileId: string, message: string): Promise<void> {
    const session = this.session;
    if (!session) return;
    const cloud = await this.pull(profileId, session);
    if (!this.isCurrentSession(session)) return;
    if (!cloud) {
      this.message = message;
      return;
    }
    const local = this.localEnvelope();
    if (local && sameLedgerContent(local, cloud.envelope)) {
      this.session = withProfileCursor(this.session!, profileId, cloud.savedAt, { syncError: undefined });
      this.compare = undefined;
      this.message = `ledger backed up ${checkMark()} ${timeAgo(cloud.savedAt)}`;
      this.writeSession();
      return;
    }
    this.compare = { profileId, savedAt: cloud.savedAt, envelope: cloud.envelope, line: cloudLine(cloud.envelope, cloud.savedAt) };
    this.message = message;
    this.writeSession();
  }

  private async pull(profileId: string, session: Session): Promise<{ savedAt: string; envelope: ProfileTransferEnvelope } | null> {
    try {
      const response = await this.request<SavePullResponse>('/api/save/pull', { profileId }, session.token);
      if (!this.isCurrentSession(session)) return null;
      const envelope = await fromServerEnvelope(response.envelope);
      if (!this.isCurrentSession(session)) return null;
      if (!envelope) return null;
      this.rememberCloudProfile({ profileId, profileName: envelope.profile.name, savedAt: response.savedAt });
      return { savedAt: response.savedAt, envelope };
    } catch (err) {
      if (!this.isCurrentSession(session)) return null;
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  private async refreshCloudProfiles(): Promise<void> {
    try {
      const session = this.session;
      if (!session) return;
      const cloudProfiles = await this.listProfiles(session);
      if (!cloudProfiles) return;
      this.cloudProfiles = cloudProfiles;
      this.emit();
    } catch {
      // The signed-in ledger stays usable; the picker can retry after the next sign-in or reload.
    }
  }

  private cloudProfilePrompt(): string {
    return this.cloudProfiles.length
      ? 'Cloud ledgers found. Choose one to restore on this device.'
      : 'Signed in. Create a ledger, then it can back up.';
  }

  private rememberCloudProfile(profile: CloudProfileSummary): void {
    this.cloudProfiles = [profile, ...this.cloudProfiles.filter((entry) => entry.profileId !== profile.profileId)];
  }

  private isCurrentSession(session: Pick<Session, 'token' | 'accountId'>): boolean {
    return this.session?.token === session.token && this.session.accountId === session.accountId;
  }

  private async listProfiles(session: Session): Promise<CloudProfileSummary[] | null> {
    try {
      const response = await this.request<SaveProfilesResponse>('/api/save/profiles', {}, session.token);
      if (!this.isCurrentSession(session)) return null;
      return response.profiles.filter(isSaveProfileSummary);
    } catch (err) {
      if (!this.isCurrentSession(session)) return null;
      throw err;
    }
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
    if (this.session.syncError) return 'ledger backup needs attention';
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

function withProfileCursor(
  session: Session,
  profileId: string,
  savedAt: string,
  updates: Pick<Partial<Session>, 'syncError'> = {},
): Session {
  return {
    ...session,
    ...updates,
    profileId,
    lastSavedAt: savedAt,
    savedAtByProfile: { ...session.savedAtByProfile, [profileId]: savedAt },
  };
}

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
  if (err instanceof CloudProfileTooLargeError) return err.message;
  if (err instanceof ApiError && err.code === 'payload_too_large') return 'That ledger is too large to back up; finish the current claim or remove an older manual claim, then try again.';
  if (err instanceof Error && err.message) return err.message;
  return "the wire's down - your ledger stays safe here.";
}

function apiBase(): string {
  const raw = import.meta.env.VITE_ACCOUNTS_API_URL;
  return typeof raw === 'string' && raw.trim() ? raw.trim().replace(/\/+$/, '') : GAME_API_ORIGIN;
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

function isSaveProfileSummary(value: unknown): value is CloudProfileSummary {
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
