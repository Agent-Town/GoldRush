# F-1590-1 — the lever that arms vite's re-optimization, proved by manufacture

Recorded s1590, 2026-08-09, during the drain of `f1589-4-dep-reoptimize-stall`.
Instrument: `artifacts/f1590-1-arm-lever/probe.mjs` (in this directory), repo root, scratch port 5234.
Vite v8.0.13. Each run: patch (or not) `node_modules/.vite/deps/_metadata.json`, start a fresh
server, capture 9 s of output, SIGTERM, re-read the metadata.

## Run 1 — lever `stale-hash` (ARMED, rc=0)

```
lever=stale-hash
lockfileHash-before=6c42fd2c
lockfileHash-written=deadbeef
--- server log ---
8:21:45 AM [vite] (client) Re-optimizing dependencies because lockfile has changed

  VITE v8.0.13  ready in 97 ms

  ➜  Local:   http://127.0.0.1:5234/
--- verdict ---
optimization-line-present=true
lockfileHash-after=6c42fd2c
self-healed=true
```

This is the predecessor's premise line reproduced verbatim on demand
(`artifacts/f1587-2-cold-start/arm-a-server.log` line 1, same wording, same `(client)` prefix).
`self-healed=true`: vite rewrote the correct hash as part of re-optimizing, so the lever leaves
no residue and needs no restore step.

## Run 2 — lever `control`, taken immediately after run 1 (rc=1)

```
lever=control
lockfileHash-before=6c42fd2c
lockfileHash-written=<unchanged, control arm>
--- server log ---
8:22:00 AM [vite] (client) Re-optimizing dependencies because vite config has changed

  VITE v8.0.13  ready in 87 ms
--- verdict ---
optimization-line-present=false
lockfileHash-after=6c42fd2c
self-healed=true
```

Not silent, but **not the lockfile line either** — the probe's regex is keyed on the lockfile
wording and correctly returned false. The cache was still converging from whatever wrote it
before the probe (and from run 1's SIGTERM mid-optimize); see run 3.

## Run 3 — lever `control`, converged (rc=1)

```
lever=control
lockfileHash-before=6c42fd2c
--- server log ---
VITE v8.0.13  ready in 85 ms
--- verdict ---
optimization-line-present=false
```

Fully silent — vite's `Hash is consistent. Skipping.` path.

## Why the two levers f1589-4 was given could never work

Read from vite's own source, `node_modules/vite/dist/node/chunks/node.js`:

- `:31487` — the message is printed **inside `if (cachedMetadata)`**. Deleting or renaming
  `node_modules/.vite` removes `_metadata.json`, so `cachedMetadata` is undefined and the
  branch is **unreachable by construction**. A cold cache optimizes silently; it never
  *re*-optimizes.
- `:32019-32031` — `getLockfileHash()` is `getHash(readFileSync(lockfilePath, 'utf-8'))`, i.e.
  over the lockfile's **content**. Touching its mtime cannot move the hash. (`checkPatchesDir`
  adds a patches-dir mtime for the formats that declare one; the base term is content.)

So `f1589-4`'s COULD-NOT-ARM was **forced by its master's prescribed levers**, not by its runner.

## The lever that does work

Keep `deps/` intact and stale only the stored hash:

```js
const meta = 'node_modules/.vite/deps/_metadata.json'
const m = JSON.parse(readFileSync(meta, 'utf-8'))
writeFileSync(meta, JSON.stringify({ ...m, lockfileHash: 'deadbeef' }, null, 2))
```

`node_modules/**` is untracked, so this touches no tracked byte and needs no lockfile edit —
it satisfies the firewall that forbade changing `package-lock.json` content, and it reproduces
exactly the state vite finds after a real `npm install` moved the lockfile.
