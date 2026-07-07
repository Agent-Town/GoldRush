# Gold Rush Accounts API

Cloudflare Pages Functions live under `/api/*` and use one KV namespace binding named `ACCOUNTS`.

Owner setup:

```sh
wrangler kv namespace create ACCOUNTS
```

Production also needs the Resend secret in Cloudflare Pages. Without `DEV_AUTH=1` or `RESEND_API_KEY`, `/api/request-code` returns `503 sign_in_not_enabled`; the game remains offline-first.

## CORS

Allowed origins only:

- `https://gold-rush-3in.pages.dev`
- `https://agenttown.app`
- `https://www.agenttown.app`
- `http://localhost:*`
- `http://127.0.0.1:*`

All endpoints are `POST` with `Content-Type: application/json`. Authenticated endpoints accept `Authorization: Bearer <sessionToken>`.

## Save Envelope

AC-02 should send this envelope as the `envelope` field. The profile-first-boot export module has not landed yet, so this is the worker-side contract to reconcile against:

```json
{
  "kind": "gold-rush-ledger-bundle",
  "version": 1,
  "exportedAt": "2026-07-07T00:00:00.000Z",
  "profile": {
    "id": "robin",
    "name": "Robin",
    "updatedAt": 1760000000000
  },
  "data": {
    "gr.meta.v1": {},
    "gr.run.v1": null
  }
}
```

`profile.id` must match the request `profileId`. The full request body for save push is capped at 200KB.

## Endpoints

### `/api/request-code`

Request:

```json
{ "email": "family@example.com", "revokeSessions": false }
```

Response:

```json
{ "ok": true }
```

With `DEV_AUTH=1`, the response includes `{ "code": "123456", "dev": true }` and skips Resend.

`revokeSessions: true` is stored with the code and takes effect only after `/api/verify` succeeds.

### `/api/verify`

Request:

```json
{ "email": "family@example.com", "code": "123456" }
```

Response:

```json
{ "ok": true, "token": "<64 hex chars>", "accountId": "<id>", "expiresAt": "..." }
```

### `/api/session`

Request body may be `{}` when using the bearer header, or `{ "token": "<64 hex chars>" }`.

Response:

```json
{ "ok": true, "accountId": "<id>", "expiresAt": "..." }
```

### `/api/save/push`

Request:

```json
{ "profileId": "robin", "envelope": { "kind": "gold-rush-ledger-bundle", "version": 1 } }
```

Response:

```json
{ "ok": true, "profileId": "robin", "savedAt": "..." }
```

Each push stores the new current save and rotates the previous current through `v1..v5`.

### `/api/save/pull`

Request:

```json
{ "profileId": "robin", "version": 1 }
```

Omit `version` for current. Response includes the saved envelope:

```json
{ "ok": true, "profileId": "robin", "version": 1, "savedAt": "...", "envelope": {} }
```

### `/api/save/versions`

Request:

```json
{ "profileId": "robin" }
```

Response:

```json
{
  "ok": true,
  "profileId": "robin",
  "versions": [{ "version": null, "savedAt": "...", "byteLength": 1024, "profileName": "Robin" }]
}
```

`version: null` is current; numbered versions are rollback copies.

### `/api/delete-account`

Authenticated request body: `{}`.

Deletes account record, code, attempts, sessions, current saves, and save versions for the account.

## Error Codes

- `400 bad_json`, `bad_request`, `bad_envelope`, `invalid_email`
- `401 invalid_code`, `unauthorized`
- `403 cors_forbidden`
- `404 not_found`
- `405 method_not_allowed`
- `413 payload_too_large`
- `415 unsupported_media_type`
- `429 rate_limited`, `too_many_attempts`
- `503 sign_in_not_enabled`, `email_unavailable`

All error responses use:

```json
{ "ok": false, "error": "code", "message": "human readable" }
```

## KV Keys

- `account:<emailHash>` stores the account record. Plaintext email lives only here for sending codes.
- `code:<emailHash>` stores the hashed 6-digit code with a 10-minute TTL.
- `attempts:<emailHash>` stores verify attempts with a 10-minute cooldown.
- `ratelimit:<ip>` stores the IP fixed-window counter.
- `ratelimit:email:<emailHash>` stores the per-email fixed-window counter.
- `session:<token>` stores the 30-day session record.
- `save:<accountId>:<profileId>` stores the current save.
- `save:<accountId>:<profileId>:v1` through `:v5` store rollback versions.
