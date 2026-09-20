# F-1552-1 Wrangler version assertion evidence

- `npx tsc --noEmit`: exit 0.
- `npm run build`: green; Vite built 2,184 modules and asset-diet passed.
- `node --test scripts/wrangler-version-assert.test.mjs`: 4 tests, 4 pass, 0 fail. Arms: positive, violation, missing, escape.
- `npm run test:mp`: `multiplayer relay checks passed (462)`; artifact recorded `wranglerVersion: 4.107.0`.
- `npm run test:stats`: `stats worker checks passed (87)`.
- `npm run test:accounts`: `accounts worker checks passed (43)`.
- `node scripts/agent-seat.test.mjs`: 5 tests, 5 pass, 0 fail.
- `npm run test:node-guards`: 387 tests, 385 pass, 2 fail. Both failures are the same pre-existing F-1507-1 runtime mismatch: Node 23.11.1 applies `--test-timeout` at file granularity; `.nvmrc` pins Node 26.4.0. No existing assertion was edited.
- `node scripts/gate-caller-audit.mjs`: pass.

Live manufactured drift message:

```text
test:mp: found Wrangler 9.9.9; expected 4.107.0; resolved path /opt/homebrew/bin/wrangler. Install Wrangler 4.107.0 on PATH or set GR_WRANGLER_ANY=1 for an explicit one-run override.
```

The demonstration injected the version reader and did not edit the helper; final helper SHA-256 is `4cf49a10263c767ad217f417239d0393d06de09d4c528f4436e2a03595c42e84`. `test-multiplayer.mjs` reuses its former version probe through the assertion, so it adds no second version process. All four scripts are wired once before their first Wrangler spawn.

`package.json` dependency blocks and `package-lock.json` are untouched.
