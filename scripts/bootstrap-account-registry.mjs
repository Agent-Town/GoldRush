import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Run only against an operator-verified complete export while every old identity writer is stopped.
const [filename, count, acknowledgement] = process.argv.slice(2);
if (!filename || !/^\d+$/.test(count ?? '') || acknowledgement !== '--source-quiesced') {
  throw new Error('Usage: node scripts/bootstrap-account-registry.mjs <private-account-export.json> <expected-count> --source-quiesced');
}
const url = new URL(process.env.ACCOUNT_REGISTRY_URL ?? '');
if (url.protocol !== 'https:') throw new Error('ACCOUNT_REGISTRY_URL must use HTTPS');
const secret = process.env.ACCOUNT_REGISTRY_MIGRATION_SECRET;
if (!secret) throw new Error('ACCOUNT_REGISTRY_MIGRATION_SECRET is required');
const scope = process.env.ACCOUNT_REGISTRY_SCOPE;
if (!/^[a-zA-Z0-9_-]{1,80}$/.test(scope ?? '')) throw new Error('ACCOUNT_REGISTRY_SCOPE must identify the source ACCOUNTS namespace');
const accounts = JSON.parse(await readFile(filename, 'utf8'));
if (!Array.isArray(accounts) || accounts.length !== Number(count)) throw new Error('Export count does not match the independently verified account-key census');
const digest = createHash('sha256').update(JSON.stringify(accounts)).digest('hex');
const response = await fetch(new URL('/bootstrap', url), {
  method: 'POST',
  headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json', 'x-account-registry-scope': scope },
  body: JSON.stringify({ accounts, expectedCount: accounts.length, digest, sourceQuiesced: true, allowEmpty: accounts.length === 0 }),
});
const receipt = await response.json();
if (!response.ok || receipt.ready !== true || receipt.digest !== digest || receipt.count !== accounts.length) {
  throw new Error(`Account registry refused bootstrap (${response.status}); keep sign-in disabled and inspect the migration prerequisite`);
}
console.log(JSON.stringify({ ready: true, importedAccounts: receipt.count, digest: receipt.digest }));
