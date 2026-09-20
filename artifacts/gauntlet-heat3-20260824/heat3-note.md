---
build: 2e92d4ed6344bb41edf2f13b8a0fd516cf219d14
date: 2026-08-24
operator: codex
---

# Gauntlet heat 3 — full field

Live deploy was read from `https://gold-rush-3in.pages.dev/version.json` at run time. All rides use detached worktree `/tmp/heat3-2e92d4ed`.

## Matrix

| arm | install | config | contract | attempts | result | tapeId | verdict | wall |
| --- | --- | --- | --- | ---: | --- | --- | --- | ---: |
| Prime Agent `0.8.0` | current official verified tarball | endpoint reached; requires streaming | `the-claim` | 0 | DNF (config: `400 Streaming is not supported`) | — | not submitted | 0s ride; 15.0s probe |
| Prime Agent `0.8.0` | current official verified tarball | endpoint reached; requires streaming | `e1-night-shift` | 0 | DNF (config) | — | not submitted | 0s ride |
| Prime Agent `0.8.0` | current official verified tarball | endpoint reached; requires streaming | `e2-hill-mine` | 0 | DNF (config) | — | not submitted | 0s ride |
| OMP `18.0.4` | current official release binary | endpoint reached; requires streaming | `the-claim` | 0 | DNF (config: `400 Streaming is not supported`) | — | not submitted | 0s ride; 0.646s probe |
| OMP `18.0.4` | current official release binary | endpoint reached; requires streaming | `e1-night-shift` | 0 | DNF (config) | — | not submitted | 0s ride |
| OMP `18.0.4` | current official release binary | endpoint reached; requires streaming | `e2-hill-mine` | 0 | DNF (config) | — | not submitted | 0s ride |
| elizaOS `1.7.2` | package installed; executable non-operable | not reached | `the-claim` | 0 | DNF (install: alias export error; direct CLI hung >60s) | — | not submitted | 0s ride |
| elizaOS `1.7.2` | package installed; executable non-operable | not reached | `e1-night-shift` | 0 | DNF (install) | — | not submitted | 0s ride |
| elizaOS `1.7.2` | package installed; executable non-operable | not reached | `e2-hill-mine` | 0 | DNF (install) | — | not submitted | 0s ride |
| Hermes `0.20.0` | already installed | endpoint reached; requires streaming | `the-claim` | 0 | DNF (config: `HTTP 400: Streaming is not supported`) | — | not submitted | 0s ride; 2.396s probe |
| Hermes `0.20.0` | already installed | endpoint reached; requires streaming | `e1-night-shift` | 0 | DNF (config) | — | not submitted | 0s ride |
| Hermes `0.20.0` | already installed | endpoint reached; requires streaming | `e2-hill-mine` | 0 | DNF (config) | — | not submitted | 0s ride |
| OpenClaw `2026.7.1-2` | already installed | isolated config valid; endpoint reached; requires streaming | `the-claim` | 0 | DNF (config: `400 Streaming is not supported`) | — | not submitted | 0s ride; 2.958s probe |
| OpenClaw `2026.7.1-2` | already installed | isolated config valid; endpoint reached; requires streaming | `e1-night-shift` | 0 | DNF (config) | — | not submitted | 0s ride |
| OpenClaw `2026.7.1-2` | already installed | isolated config valid; endpoint reached; requires streaming | `e2-hill-mine` | 0 | DNF (config) | — | not submitted | 0s ride |

No ride process started, no tape was produced, and no unsecured submission was attempted. The first-secured-ride skew probe therefore never became reachable.

## Paper harness recon

| harness | public code | Gold Rush compatibility | verdict |
| --- | --- | --- | --- |
| Tycho (`f68912a764372ead0a610db2e1c011d41ce5197e`) | Yes: [NIMI-research/Tycho](https://github.com/NIMI-research/Tycho) | Coupled to ARC-AGI-3 rendered 64x64 frames, ARC actions, containerized world models, and ARC scorecards; no generic stdin environment adapter. | Recon DNF (contract incompatible); adapting it would be new harness engineering. |
| VISTA | No runnable release linked from the [project page](https://vista-research.github.io/) | Published method consumes raw PNG observations plus lossless visual memory through Claude Code/Codex; no install or public CLI can target `gr-sim`. | Recon DNF (code unreleased). |
| AVO (arXiv `2603.24517`) | No official repository or install linked from the [paper](https://arxiv.org/abs/2603.24517) | Seven-day evolutionary search around B200 attention-kernel editing/evaluation, not an interactive game harness. | Recon DNF (code unreleased and contract incompatible). |

## Shim observations

- Pre-flight round trip: `gpt-5.6-luna`, 4.275 s, usage fields present.
- Three-way concurrency smoke: 6.546 s / 6.475 s / 5.613 s.
- Prime Agent, OMP, Hermes, and OpenClaw all reached `POST /v1/chat/completions` with `stream: true`. The shim rejected each before launching `codex exec`, so arm cost was **0 subscription tokens**.
- Operator-only shim gate cost: 16,647 prompt + 8 completion = 16,655 tokens. No arm reached a model completion.

## Install recon

- Prime Agent: official installer resolved and checksum-verified `0.8.0`. A custom daemon socket avoided disturbing a pre-existing service, then was shut down.
- OMP: the Bun package installed but failed to parse under Bun `1.2.20`; upstream requires Bun >= `1.3.14`. The official `darwin-arm64` binary installed successfully as `omp/18.0.4`; the broken duplicate was removed.
- elizaOS: current `1.7.2`. The alias failed with `ERR_PACKAGE_PATH_NOT_EXPORTED`; direct `@elizaos/cli` installed but its version command hung without output for more than 60 seconds. The alias duplicate was removed; the direct package remains installed.
- Hermes: `0.20.0` (distribution `2026.8.3`), existing install.
- OpenClaw: `2026.7.1-2` (`0790d9f`), existing install.

## Cost by arm

| arm | subscription tokens | setup/config wall | ride wall |
| --- | ---: | ---: | ---: |
| Prime Agent | 0 | 15.0s probe | 0s |
| OMP | 0 | 0.646s probe | 0s |
| elizaOS | 0 | >60s executable probe | 0s |
| Hermes | 0 | 2.396s probe | 0s |
| OpenClaw | 0 | 2.958s probe | 0s |
| Tycho / VISTA / AVO | 0 | recon only | 0s |

## Door findings

- **Heat-3a compatibility blocker:** the shim is non-streaming while every runnable guest tested requires streaming. Per task law, it was not patched mid-heat.
- **OpenClaw isolation leak:** startup migrated live `~/.openclaw/exec-approvals.json` despite isolated state/config paths. It was restored immediately and verified present with no `.migrated` remainder.
- **elizaOS install surface:** both current canonical npm names fail differently on this machine (alias export error; direct CLI hang).
- **OMP install surface:** the package-manager route does not enforce its stated Bun minimum before installing; the official binary route is healthy.
- The standings door was not exercised because no guest produced a secured tape. No claim about assayer build skew or verification is made.

Guest model/config state was isolated per run. The live OpenClaw approvals file was restored. Machine-level Prime Agent, OMP binary, and direct elizaOS CLI installs remain because the owner ordered them.
