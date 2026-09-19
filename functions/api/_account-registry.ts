import type { AccountRecord, AccountRegistryNamespace } from './_accounts';

type State = Pick<import('@cloudflare/workers-types').DurableObjectState, 'storage'>;
type RegistryEnv = { ACCOUNT_REGISTRY?: AccountRegistryNamespace; ACCOUNT_REGISTRY_MIGRATION_SECRET?: string };
const MAX_IMPORT_ACCOUNTS = 1_000;

// ponytail: one registry serializes the family-scale identity directory; shard only with a measured need.
export class AccountRegistry {
  constructor(private readonly state: State) {
    state.storage.sql.exec('CREATE TABLE IF NOT EXISTS accounts (email_hash TEXT PRIMARY KEY, account_id TEXT UNIQUE NOT NULL, record TEXT NOT NULL)');
    state.storage.sql.exec('CREATE TABLE IF NOT EXISTS bootstrap (id INTEGER PRIMARY KEY CHECK(id = 1), digest TEXT NOT NULL, count INTEGER NOT NULL)');
  }

  async fetch(request: Request): Promise<Response> {
    const operation = new URL(request.url).pathname;
    if (operation === '/status' && request.method === 'GET') return this.status();
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    try {
      if (!(request.headers.get('content-type') ?? '').startsWith('application/json')) return json({ error: 'bad_request' }, 400);
      const text = await request.text();
      if (new TextEncoder().encode(text).length > 1_048_576) return json({ error: 'payload_too_large' }, 413);
      const body = JSON.parse(text);
      if (operation === '/bootstrap') return await this.bootstrap(body);
      if (!this.isReady()) return json({ error: 'account_registry_not_ready' }, 503);
      if (operation === '/resolve') {
        if (!await validAccount(body)) return json({ error: 'invalid_account' }, 400);
        return this.state.storage.transactionSync(() => {
          this.state.storage.sql.exec('INSERT INTO accounts (email_hash, account_id, record) VALUES (?, ?, ?) ON CONFLICT(email_hash) DO NOTHING', body.emailHash, body.accountId, JSON.stringify(body));
          const row = this.state.storage.sql.exec<{ record: string }>('SELECT record FROM accounts WHERE email_hash = ?', body.emailHash).one();
          return json(JSON.parse(row.record));
        });
      }
      if (operation === '/retire') {
        if (!body || !/^[a-f0-9]{64}$/.test(body.emailHash) || !/^[a-f0-9]{32}$/.test(body.accountId)) return json({ error: 'bad_request' }, 400);
        const rows = this.state.storage.sql.exec('DELETE FROM accounts WHERE email_hash = ? AND account_id = ? RETURNING email_hash', body.emailHash, body.accountId).toArray();
        return json(rows.length === 1);
      }
      return json({ error: 'not_found' }, 404);
    } catch {
      return json({ error: 'account_registry_error' }, 500);
    }
  }

  private isReady(): boolean {
    return this.state.storage.sql.exec('SELECT id FROM bootstrap WHERE id = 1').toArray().length === 1;
  }

  private status(): Response {
    const receipt = this.state.storage.sql.exec<{ digest: string; count: number }>('SELECT digest, count FROM bootstrap WHERE id = 1').toArray()[0];
    return json(receipt ? { ready: true, ...receipt } : { ready: false });
  }

  private async bootstrap(body: unknown): Promise<Response> {
    if (!body || typeof body !== 'object') return json({ error: 'bad_import' }, 400);
    const input = body as { accounts?: unknown; expectedCount?: unknown; digest?: unknown; sourceQuiesced?: unknown; allowEmpty?: unknown };
    if (!Array.isArray(input.accounts) || input.accounts.length > MAX_IMPORT_ACCOUNTS || input.expectedCount !== input.accounts.length || input.sourceQuiesced !== true || (!input.accounts.length && input.allowEmpty !== true)) return json({ error: 'bad_import' }, 400);
    const accounts = input.accounts;
    if (!(await Promise.all(accounts.map(validAccount))).every(Boolean)) return json({ error: 'invalid_account' }, 400);
    if (new Set(accounts.map((account) => account.emailHash)).size !== accounts.length || new Set(accounts.map((account) => account.accountId)).size !== accounts.length) return json({ error: 'identity_conflict' }, 409);
    const digest = await sha256(JSON.stringify(accounts));
    if (input.digest !== digest) return json({ error: 'import_digest_mismatch' }, 400);
    return this.state.storage.transactionSync(() => {
      const receipt = this.state.storage.sql.exec<{ digest: string }>('SELECT digest FROM bootstrap WHERE id = 1').toArray()[0];
      if (receipt) return receipt.digest === digest ? this.status() : json({ error: 'already_bootstrapped' }, 409);
      // A closed registry must be empty: never overwrite a partial or unexpected identity directory.
      if (this.state.storage.sql.exec('SELECT email_hash FROM accounts LIMIT 1').toArray().length) return json({ error: 'identity_conflict' }, 409);
      for (const account of accounts) {
        this.state.storage.sql.exec('INSERT INTO accounts (email_hash, account_id, record) VALUES (?, ?, ?)', account.emailHash, account.accountId, JSON.stringify(account));
      }
      this.state.storage.sql.exec('INSERT INTO bootstrap (id, digest, count) VALUES (1, ?, ?)', digest, accounts.length);
      return this.status();
    });
  }
}

async function validAccount(value: unknown): Promise<boolean> {
  if (!value || typeof value !== 'object') return false;
  const account = value as AccountRecord;
  return account.version === 1 && typeof account.email === 'string' && account.email === account.email.trim().toLowerCase()
    && account.email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)
    && typeof account.accountId === 'string' && /^[a-f0-9]{32}$/.test(account.accountId)
    && typeof account.createdAt === 'string' && Number.isFinite(Date.parse(account.createdAt))
    && account.emailHash === await sha256(account.email);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { 'cache-control': 'no-store' } });
}

export default {
  async fetch(request: Request, env: RegistryEnv): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path !== '/bootstrap' && path !== '/status') return json({ error: 'not_found' }, 404);
    const secret = env.ACCOUNT_REGISTRY_MIGRATION_SECRET;
    if (!secret || !env.ACCOUNT_REGISTRY) return json({ error: 'migration_disabled' }, 503);
    const supplied = request.headers.get('authorization') ?? '';
    const expected = await sha256(`Bearer ${secret}`);
    const actual = await sha256(supplied);
    let difference = 0;
    for (let index = 0; index < expected.length; index += 1) difference |= expected.charCodeAt(index) ^ actual.charCodeAt(index);
    if (difference) return json({ error: 'unauthorized' }, 401);
    const scope = request.headers.get('x-account-registry-scope') ?? '';
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(scope)) return json({ error: 'invalid_registry_scope' }, 400);
    return env.ACCOUNT_REGISTRY.get(env.ACCOUNT_REGISTRY.idFromName(`accounts-v1:${scope}`)).fetch(request);
  },
};
