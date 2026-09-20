# Heat 10 preflight

- Safe-dupe: `lane/b` had three commits whose content was already on `origin/main`; `git checkout -B lane/b main` refreshed it without destroying lane-only work. The tree was clean. F-1407-1 acknowledged; no factory-churn dirt was present.
- Local gate: `npm install --no-audit --no-fund` and `npm run build` green on lane `main` (2,214 modules; asset-diet green).
- Live production at run time: `https://gold-rush-3in.pages.dev/version.json` returned build `c13b4c24`, built `2026-09-01T08:25:06Z`.
- Detached arena: `/tmp/heat10-c13b4c24` at `c13b4c24d`. Era gate read Era 5, **the Replayed Board**, with registered current pin `25040ad58451125adfa7d1d6c19c70f40ce17cd8cc6d377134e0a545922ca2ca`.
- Shim SSE returned `"content":"OK"`, `"finish_reason":"stop"`, and `data: [DONE]`. Deliberate abort returned curl rc 28; the same process immediately served `/v1/models`. After shutdown, curl returned rc 7.
- **HARD STOP — invalid early probe arena:** the operator ran `npm install --prefix /tmp/heat10-c13b4c24` from the lane instead of running npm with the detached arena as cwd. npm rewrote the arena's tracked `package-lock.json` (111 additions, 111 deletions), changing its root version to `file:../../private/tmp/heat10-c13b4c24` and prefixing package keys with that path.
- `package-lock.json` is the first member of `ENGINE_SOURCE_INPUTS`. The resulting probe minted build `c13b4c24d`, Era 5, engine `1934d6e52b9a93cc25ecf55451c3f74a3b595c6eaca45d73a92812e6b91f8cc1`, not registered pin `25040ad5…`.
- Production refused the submission exactly: `{"ok":false,"error":"reel_not_current","message":"This reel's engine pin is not recorded in era 5 'the Replayed Board'."}`
- Attribution: this does **not** demonstrate that the deployed pin cure regressed; the probe was locally contaminated before `gr-sim` computed its engine hash. It nevertheless triggered the master's unconditional `skew → STOP` gate. No rider completion or gameplay attempt started.

