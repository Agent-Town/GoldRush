# F-2299-1 — the droplet sync shipped FIVE live credentials, and the leak was in the RUNBOOK, not the new leg

Measured s2299 (2026-08-25), local and READ-ONLY with respect to production: no ssh was opened
to the box, nothing was deployed, and no credential value was printed, logged or committed.

## 1. What was inherited, and what is corrected

s2298 filed F-2298-1 reading: *"the leg ships a DENYLIST where `docs/ops/agenttown-server.md:40`
prescribes an ALLOWLIST"*, and named the secret as **"a live Cloudflare token"**.

Both halves are corrected here, and each correction moves the decision:

| | inherited (s2298) | measured (s2299) |
|---|---|---|
| provenance | a divergence introduced by the new leg | **byte-identical to the runbook's OWN recipe at `:57`** |
| payload | "a live Cloudflare token" | **FIVE credentials** |

### 1a. The runbook contains TWO contradictory sync recipes

- `:40` — an ALLOWLIST ("rsync the lean tree: `package*.json vite.config.ts index.html tsconfig* src/ scripts/ assets/ public/ site/`")
- `:57` — a DENYLIST, `rsync -az --delete` minus nine names

`scripts/deploy.sh:170` implements `:57`. After normalising whitespace and dropping
`--timeout=60`, the two command strings are **BYTE-IDENTICAL** (verified by extracting both
from their files and comparing, not by eye).

➡️ **Therefore the exposure is NOT a defect the new leg introduced.** It is a defect in the
documented hand recipe, which predates the leg and which the owner may have run by hand at any
point since the box was set up. That widens the exposure window from "since 12:21 today" to
"unknown", and it is why the fix had to land in BOTH files.

### 1b. The payload is five credentials, not one

`.env.local` — 428 B, mode 600, untracked, ignored by `.gitignore:3` — carries:

    ELEVENLABS_API_KEY, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID,
    OPENROUTER_API_KEY, CLAUDE_CODE_OAUTH_TOKEN

Key names only; no values were read, printed or stored. **`CLAUDE_CODE_OAUTH_TOKEN` is the
factory's own Claude subscription credential** — i.e. the thing that pays for every fire and
every lane runner. That was not in the desk item's pricing.

## 2. Proof it was actually sent (not inferred from reading the exclude list)

A local `rsync --dry-run` reproducing the deploy leg's **exact** exclude set — read out of
`scripts/deploy.sh` at run time rather than retyped, so the probe cannot drift from its subject:

    node /tmp/s2299-rsync-probe.mjs      # recipe reproduced in §5 below

The probe asserts its own validity before any result is believed (F-2215-1): the first run
returned `0 lines` and **REFUSED** rather than reporting a clean result — `rsync -n` prints
nothing without an itemiser. That refusal is the reason this measurement can be trusted; a
probe whose failure mode is an empty list is indistinguishable from good news.

| | transfer list | `.env.local` present? |
|---|---|---|
| pre-cure (9 excludes) | **55,661** files | **YES — CONFIRMED SENT** |
| post-cure (10 excludes) | **55,660** files | no |

**Exactly one file removed.** That difference is the whole evidence for "strictly subtractive":
the fix cannot break the sync under any reading, because it changes the payload by one file and
that file is the secret.

## 3. Why the exclude is safe — nothing box-side reads it

Verified by reading, not assumed:

- `goldrush-assay.service` takes its env from `/etc/goldrush-assay.env` (runbook `:32`)
- `goldrush-ledger.service` uses `EnvironmentFile=/etc/goldrush-ledger.env` (runbook `:60`)
- both are **outside** `/opt/goldrush/`, i.e. outside the synced tree — which is exactly where
  the leg's own `sed -i` writes the `ASSAY_BUILD_ID` pin
- `grep -rn "env.local" server/ scripts/assay-worker* scripts/ledger*` → **zero hits**

So `/opt/goldrush/.env.local` was pure liability: consumed by nothing, reachable by anything
that reads the deploy tree.

## 4. What the cure does NOT do — stated plainly, because it bounds the owner's remaining work

**rsync protects excluded names from `--delete` by default.** This is the same property s2298
correctly used to refute the `node_modules` scare — and here it cuts the other way:

➡️ **If any earlier run of the runbook's `:57` recipe already placed `.env.local` on the box,
this fix will NOT remove it.** The exclude prevents future pushes only.

Two acts therefore remain OWNER-side and are named on the desk:

1. `ssh root@<droplet> 'ls -la /opt/goldrush/.env.local'` — establish whether a copy is
   already there (a fire has no authorization to ssh to production, so this is uncloseable here)
2. if it is: `rm` it **and rotate all five credentials** — a token that has sat on a public-IP
   box must be treated as disclosed, regardless of whether anyone read it

## 5. Reproduce (local, ~10 s, no network, no ssh)

    cd "<repo root>"
    # extract the leg's exclude set from the file itself, run rsync in dry-run to a scratch dir,
    # and list every dotfile at the repo root that would be transferred:
    node - <<'EOF'
    import('node:child_process').then(({spawnSync})=>{
      const fs=require('fs');
      const line=fs.readFileSync('scripts/deploy.sh','utf8').split('\n').find(l=>l.includes('rsync -az --delete'));
      const ex=[...line.matchAll(/--exclude (\S+)/g)].map(m=>m[1]);
      const r=spawnSync('rsync',['-azn','--delete','--out-format=%n',...ex.flatMap(e=>['--exclude',e]),'./','/tmp/s2299-probe/'],{encoding:'utf8',maxBuffer:512<<20});
      const lines=r.stdout.split('\n').filter(Boolean);
      if(lines.length<100) throw new Error('REFUSING — implausibly short list; did you forget --out-format?');
      console.log('excludes',ex.length,'files',lines.length,'env?',lines.some(l=>l.trim()==='.env.local'));
    });
    EOF

## 6. Scope deliberately NOT taken

The 7.73 GB payload question (option (b): adopt an allowlist) is **left open on the desk,
untouched**. s2298's reasoning against a drive-by rewrite is sound and was re-verified here:
switching to an explicit source list while keeping `--delete` would strip
`/opt/goldrush/node_modules` on a git-less box, because with an explicit source list that
directory is neither in the source nor exclude-protected. This fire changed one exclude and
nothing else; `bash -n scripts/deploy.sh` parses clean.

The second `ssh` still lacks `ConnectTimeout` (s2298's note) — also left, also on the desk.
