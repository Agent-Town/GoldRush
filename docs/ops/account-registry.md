# Atomic account identity registry

**Landed:** the worker, atomic SQLite adapter, closed Pages gate, bootstrap dry-run and local proofs. **Deploy day:** the owner must quiesce writers, verify the export, deploy, import, and enable the binding/scope; none of those remote steps has run.

The SQLite ledger allocates account IDs with its existing unique key. Pages Functions require the `ACCOUNT_REGISTRY` Durable Object binding and `ACCOUNT_REGISTRY_SCOPE` configuration identifying their `ACCOUNTS` KV namespace. Use the KV namespace ID as the scope; deployments sharing that namespace must share its scope, and separate namespaces must have distinct scopes. The registry owns only email-to-account identity records; codes, random bearer tokens, and saves remain in `ACCOUNTS` KV. There is no KV read/write fallback. A missing scope, unavailable registry, or unbootstrapped scope returns `503 account_registry_unavailable` during verification or deletion. Without `ACCOUNTS`, the existing `503 sign_in_not_enabled` response is unchanged.

Each registration generation receives a random 128-bit account ID. Deletion retires that exact generation, so surviving old tokens and late writes cannot address a replacement account. The old single-use-code, rate-counter, and session-revocation concurrency limitations are separate from account allocation.

KV account deletion checks registry readiness before deleting saves. A missing binding/scope, unreachable registry, or unopened migration gate therefore leaves saves and sessions intact. Save cleanup then runs before identity retirement, and session revocation runs only after successful retirement. A save-cleanup failure leaves the current identity and retry session available. A failed retirement attempt retains the session; if the registry did not commit retirement, the same identity remains available for retry. This is not an atomic transaction across KV and the registry: a failure after the readiness check can leave partially or fully deleted saves, and a later session-cleanup failure can leave old-generation tokens. Those tokens cannot address a replacement account's random namespace. An ambiguous retirement response may also require signing in again; the readiness check cannot guarantee that a later remote write succeeded or failed.

## Production readiness gate

This change does not deploy or migrate anything. Keep account mutations unavailable until all steps complete. Never initialize an empty registry merely because one KV lookup returns absence. The Pages binding block in `wrangler.toml` is deliberately commented out, and no scope is set. This also avoids making normal Pages deployments depend on a worker that does not yet exist.

The following are **owner-run deploy-day commands**, not authorization to execute them during code landing. Commands were checked against local Node 26.4.0 / Wrangler 4.107.0; remote topology, maintenance controls and credentials have not been verified. Run from the repository root with `/opt/homebrew/bin` first on `PATH`, shell error handling enabled (`set -e`), and tracing disabled (`set +x`). Fill the namespace/project/branch values from the owner's deployment inventory. Never infer the account namespace from the unrelated telemetry binding.

### 1. Stop every old identity writer

Apply an owner-controlled maintenance/access rule blocking `/api/verify` and `/api/delete-account` on **every** deployment sharing the source account namespace, including branch previews, immutable deployment URLs and direct origin access. Alternatively deploy this code with its registry binding/scope absent to each such deployment and make older deployments inaccessible. Removing the email key alone does not close these routes. Drain in-flight requests; keep writers stopped through cutover and allow KV propagation and cached absence to settle before export.

The repository has no universal command for those external maintenance controls. The owner must identify and apply the actual control before proceeding. Record each deployment URL and the control in a private inventory. With a file containing every affected origin (one per line), verify the block:

```sh
umask 077
export MIGRATION_DIR="$HOME/.local/share/gold-rush-account-migration/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$MIGRATION_DIR"
chmod 700 "$MIGRATION_DIR"
# Create $MIGRATION_DIR/origins.txt from the verified deployment inventory.
while IFS= read -r origin; do
  for route in verify delete-account; do
    http_status=$(curl --silent --show-error --max-time 30 --output /dev/null --write-out '%{http_code}' \
      --request POST --header 'content-type: application/json' --data '{}' "$origin/api/$route")
    case "$http_status" in 403|503) ;; *) echo "STOP: $origin/api/$route returned $http_status"; exit 1 ;; esac
  done
done < "$MIGRATION_DIR/origins.txt"
```

**Verification:** inventory is nonempty and independently checked for completeness; the maintenance control covers both routes regardless of request body or credentials. The HTTP probe is only a cross-check: invalid JSON bodies returning 401/400 are not evidence that valid codes or sessions are blocked. Confirm no old writer remains in flight and record the time of the last mutation. Existing save/session routes can remain available.

**Rollback:** before importing or reopening any new writer, remove maintenance only after confirming the old allocator is still the sole authority; otherwise leave routes closed and investigate.

### 2. Export and independently reconcile every account

Keep exports and receipts outside this repository, the vault, and all mirrored directories. Use a private directory and mode-600 files. The following uses Wrangler's fully paginated key listing, retrieves each value, and checks the key/value hash correspondence. It preserves complete records including extra fields; the bootstrap digest covers their JSON representation, not whitespace in the source values.

```sh
export ACCOUNT_REGISTRY_SCOPE='REPLACE_WITH_SOURCE_ACCOUNTS_KV_NAMESPACE_ID'
wrangler kv key list --remote --namespace-id "$ACCOUNT_REGISTRY_SCOPE" --prefix 'account:' \
  > "$MIGRATION_DIR/account-keys.json"
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const directory = process.env.MIGRATION_DIR;
const keys = JSON.parse(readFileSync(`${directory}/account-keys.json`, 'utf8'));
assert(Array.isArray(keys));
assert.equal(new Set(keys.map(key => key.name)).size, keys.length);
const accounts = keys.map(({ name }) => {
  assert(name.startsWith('account:'));
  const account = JSON.parse(execFileSync('wrangler', ['kv', 'key', 'get', name, '--text', '--remote',
    '--namespace-id', process.env.ACCOUNT_REGISTRY_SCOPE], { encoding: 'utf8' }));
  assert.equal(name, `account:${account.emailHash}`);
  return account;
});
writeFileSync(`${directory}/account-export.json`, JSON.stringify(accounts), { mode: 0o600, flag: 'wx' });
JS
# A separate complete census, while writers are STILL stopped:
wrangler kv key list --remote --namespace-id "$ACCOUNT_REGISTRY_SCOPE" --prefix 'account:' \
  > "$MIGRATION_DIR/account-census.json"
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const directory = process.env.MIGRATION_DIR;
const names = file => JSON.parse(readFileSync(`${directory}/${file}`, 'utf8')).map(key => key.name).sort();
const exported = names('account-keys.json'), census = names('account-census.json');
assert.equal(new Set(census).size, census.length);
assert.deepEqual(exported, census);
writeFileSync(`${directory}/verified-count.txt`, `${census.length}\n`, { mode: 0o600, flag: 'wx' });
JS
VERIFIED_COUNT=$(cat "$MIGRATION_DIR/verified-count.txt")
node scripts/bootstrap-account-registry.mjs "$MIGRATION_DIR/account-export.json" "$VERIFIED_COUNT" --dry-run \
  > "$MIGRATION_DIR/dry-run.json"
chmod 600 "$MIGRATION_DIR"/*
```

**Verification:** the owner independently reconciles the export against the full census and known namespace history, after quiescence/propagation. Two immediate scans can share stale data and cannot establish completeness by themselves. Follow every cursor if using the API instead of Wrangler. Dry-run must succeed with matching count, valid email hashes, unique identities and at most 1,000 records / 1 MiB for the complete import request. It makes no network calls, requires no URL or secret, changes no files, and prints only count/digest/size, never records or a readiness receipt. Zero is allowed only after independently establishing that the authoritative namespace contains zero accounts. A larger or inconsistent export requires a separately reviewed migration.

**Rollback:** discard an invalid export privately, retain the source unchanged, and repeat the export/census after resolving inconsistencies; do not bootstrap.

### 3. Deploy the worker with its gate closed

```sh
wrangler deploy --config wrangler.account-registry.toml
# Use the URL returned by deployment; do not guess the account subdomain.
export ACCOUNT_REGISTRY_URL='https://REPLACE_WITH_DEPLOYED_WORKER_HOST'
node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))' \
  > "$MIGRATION_DIR/migration-secret.txt"
chmod 600 "$MIGRATION_DIR/migration-secret.txt"
wrangler secret put ACCOUNT_REGISTRY_MIGRATION_SECRET --config wrangler.account-registry.toml \
  < "$MIGRATION_DIR/migration-secret.txt"
export ACCOUNT_REGISTRY_MIGRATION_SECRET=$(cat "$MIGRATION_DIR/migration-secret.txt")
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
const response = await fetch(new URL('/status', process.env.ACCOUNT_REGISTRY_URL), {
  headers: { authorization: `Bearer ${process.env.ACCOUNT_REGISTRY_MIGRATION_SECRET}`,
    'x-account-registry-scope': process.env.ACCOUNT_REGISTRY_SCOPE }, redirect: 'error',
  signal: AbortSignal.timeout(30_000),
});
assert.equal(response.status, 200);
assert.deepEqual(await response.json(), { ready: false });
console.log('Registry exists; migration gate is closed.');
JS
```

**Verification:** authenticated `/status` is exactly `ready:false` for the source scope. A previously ready scope is a stop for receipt reconciliation, not permission to reset it. The public worker exposes only authenticated `/bootstrap` and `/status`; allocation/retirement are binding-only operations. The migration secret must remain private, outside command arguments and logs.

**Rollback:** remove the migration secret with `wrangler secret delete ACCOUNT_REGISTRY_MIGRATION_SECRET --config wrangler.account-registry.toml`, leave Pages binding/scope disabled and routes closed; do not delete the Durable Object or migration history.

### 4. Import once and verify the receipt

```sh
VERIFIED_COUNT=$(cat "$MIGRATION_DIR/verified-count.txt")
node scripts/bootstrap-account-registry.mjs "$MIGRATION_DIR/account-export.json" "$VERIFIED_COUNT" --source-quiesced \
  > "$MIGRATION_DIR/receipt.json"
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const directory = process.env.MIGRATION_DIR;
const dry = JSON.parse(readFileSync(`${directory}/dry-run.json`, 'utf8'));
const receipt = JSON.parse(readFileSync(`${directory}/receipt.json`, 'utf8'));
assert.equal(receipt.ready, true);
assert.equal(receipt.importedAccounts, dry.accounts);
assert.equal(receipt.digest, dry.digest);
console.log('Receipt count and digest match the verified export.');
JS
```

**Verification:** count and digest match the private dry-run and authoritative export. Import is one transaction: invalid records, duplicate identities, count/digest mismatch and conflicting repeat imports are refused. An identical retry returns the original receipt without modifying active identities. If the command times out, keep routes closed and retry the identical export to resolve the ambiguous response.

**Rollback:** keep routes closed and retain the receipt/export. There is no destructive reset command; a wrong source/scope or changed export needs an explicit reviewed recovery migration.

### 5. Enable each Pages environment, smoke-test, then reopen

Keep the external maintenance control active, permitting only the owner's test session during this step. Repeat for every account namespace/environment; independent namespaces need their own verified import first. Uncomment the four-line `ACCOUNT_REGISTRY` binding block in `wrangler.toml` and configure `ACCOUNT_REGISTRY_SCOPE` to the corresponding source namespace ID in each Pages environment's variables. Check the resolved deployment settings preserve `ACCOUNTS`, telemetry and multiplayer bindings. Never point a preview's separate namespace at production's scope.

```sh
# The owner supplies actual deployment project/branch values after inventory.
export PAGES_PROJECT='REPLACE_WITH_PAGES_PROJECT'
export PAGES_BRANCH='REPLACE_WITH_APPROVED_BRANCH'
npm run build
wrangler pages deploy dist --project-name "$PAGES_PROJECT" --branch "$PAGES_BRANCH"
```

**Verification:** with a known pre-migration account, use the ordinary sign-in UI, compare its account ID to the private export and load an existing saved profile. Exercise a disposable test account through signup, save, deletion and re-registration; the replacement must have a different ID and no prior-generation saves. Existing sessions should still load their saves. Verify both production and preview settings before lifting maintenance. If any check fails, stop with writes still closed.

Only after successful smoke checks, lift the maintenance control and disable the public migration surface:

```sh
wrangler secret delete ACCOUNT_REGISTRY_MIGRATION_SECRET --config wrangler.account-registry.toml
unset ACCOUNT_REGISTRY_MIGRATION_SECRET
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
const response = await fetch(new URL('/status', process.env.ACCOUNT_REGISTRY_URL), {
  redirect: 'error', signal: AbortSignal.timeout(30_000),
});
assert.equal(response.status, 503);
assert.equal((await response.json()).error, 'migration_disabled');
console.log('Public migration surface disabled.');
JS
```

Record the worker/Pages deployment IDs, scope, maintenance window and receipt privately. Recheck ordinary sign-in after secret removal: binding operations do not depend on that secret. New identities exist only in the registry; stale KV account copies are never read by this code.

**Rollback:** immediately close identity routes again, retaining the registry and KV data. Rolling back to the old KV allocator after any registry writes is unsafe because the copies can diverge. An explicit identity/save migration is required before changing authority or alternating SQLite and KV backends. Removing the binding/scope safely stops mutations but does not migrate identities back.

## Local checks

```sh
node --test scripts/review-account-creation.test.mjs
GR_GUARD_NO_ARTIFACT=1 npm run test:accounts
node --test artifacts/sol/account-registry-land/closed-gate.test.mjs artifacts/sol/account-registry-land/bootstrap-dry-run.test.mjs
```

Use Node 26.4.0 and the repository's pinned Wrangler. These execute the actual SQLite adapter and a real SQLite-backed Durable Object through local workerd. Fixture state contains only synthetic data; no production namespace is read or written. See `artifacts/sol/account-registry-land/report.md` for the base, complete gate results and the manufactured-defect proof.
