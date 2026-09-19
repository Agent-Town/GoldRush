import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Run only against an operator-verified complete export while every old identity writer is stopped.
const [filename, count, ...flags] = process.argv.slice(2);
const dryRun = flags.includes('--dry-run');
if (!filename || !/^\d+$/.test(count ?? '') || !Number.isSafeInteger(Number(count))
  || flags.some((flag) => !['--source-quiesced', '--dry-run'].includes(flag))
  || (!dryRun && !flags.includes('--source-quiesced'))) {
  throw new Error('Usage: node scripts/bootstrap-account-registry.mjs <private-account-export.json> <expected-count> --source-quiesced [--dry-run] (dry-run alone is also allowed)');
}
const accounts = JSON.parse(await readFile(filename, 'utf8'));
if (!Array.isArray(accounts) || accounts.length !== Number(count)) throw new Error('Export count does not match the independently verified account-key census');
if (accounts.length > 1_000) throw new Error('More than 1,000 accounts requires a separately reviewed migration');
for (const account of accounts) {
  if (!account || account.version !== 1 || typeof account.email !== 'string'
    || account.email !== account.email.trim().toLowerCase() || account.email.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)
    || typeof account.accountId !== 'string' || !/^[a-f0-9]{32}$/.test(account.accountId)
    || typeof account.createdAt !== 'string' || !Number.isFinite(Date.parse(account.createdAt))
    || account.emailHash !== createHash('sha256').update(account.email).digest('hex')) {
    throw new Error('Export contains an invalid account; reconcile the source before importing');
  }
}
if (new Set(accounts.map((account) => account.emailHash)).size !== accounts.length
  || new Set(accounts.map((account) => account.accountId)).size !== accounts.length) {
  throw new Error('Export contains conflicting email or account identities');
}
const digest = createHash('sha256').update(JSON.stringify(accounts)).digest('hex');
const body = JSON.stringify({ accounts, expectedCount: accounts.length, digest, sourceQuiesced: true, allowEmpty: accounts.length === 0 });
if (Buffer.byteLength(body) > 1_048_576) throw new Error('Import exceeds the 1 MiB request limit');
if (dryRun) {
  // No environment, credentials or network access is needed for local validation.
  console.log(JSON.stringify({ dryRun: true, accounts: accounts.length, digest, bytes: Buffer.byteLength(body) }));
  process.exit(0);
}
const url = new URL(process.env.ACCOUNT_REGISTRY_URL ?? '');
if (url.protocol !== 'https:' || url.username || url.password) throw new Error('ACCOUNT_REGISTRY_URL must use HTTPS without embedded credentials');
const secret = process.env.ACCOUNT_REGISTRY_MIGRATION_SECRET;
if (!secret) throw new Error('ACCOUNT_REGISTRY_MIGRATION_SECRET is required');
const scope = process.env.ACCOUNT_REGISTRY_SCOPE;
if (!/^[a-zA-Z0-9_-]{1,80}$/.test(scope ?? '')) throw new Error('ACCOUNT_REGISTRY_SCOPE must identify the source ACCOUNTS namespace');
const response = await fetch(new URL('/bootstrap', url), {
  method: 'POST',
  redirect: 'error',
  signal: AbortSignal.timeout(30_000),
  headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json', 'x-account-registry-scope': scope },
  body,
});
const receipt = await response.json();
if (!response.ok || receipt.ready !== true || receipt.digest !== digest || receipt.count !== accounts.length) {
  throw new Error(`Account registry refused bootstrap (${response.status}); keep sign-in disabled and inspect the migration prerequisite`);
}
console.log(JSON.stringify({ ready: true, importedAccounts: receipt.count, digest: receipt.digest }));
