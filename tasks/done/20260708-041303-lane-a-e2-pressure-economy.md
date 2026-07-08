# Task e2-pressure-economy: PRESSURE — the Steamworks resource, as data (LANE-A, branch lane/m3, commit prefix "e2:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; **specs/epoch-saga/README.md §economy (one-new-resource law + the META-CURRENCY slot ruling) + e2-steamworks-bundle.md (pressure's role)**; the epoch-2 manifest socket (SCI-04 registry, `assets/contracts/epoch-2-steamworks/`); Economy (SOLE gold writer — pressure follows the same law: this task defines the DATA + the Economy-side resource plumbing, no consumers yet). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m3 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Why (WP-E2 slice ②, gate OPEN 2026-07-07; the night jam ate the authoring — attended-authored 2026-07-08 morning)
E2's economy: PRESSURE joins gold (max two active per the saga law). Buildings that consume/produce it arrive with E2 content; the RESOURCE itself — type, storage, exchange, UI chip — lands now so every later slice has the socket.

## Scope
1. **Resource plumbing (Economy-owned)**: `pressure` as a second resource in Economy (same single-writer discipline; event-logged like gold; actor-attributable). Zero in epoch-1: no UI, no earn/spend paths active (epoch-gated — the chip renders only when the active epoch declares the resource).
2. **Epoch-2 manifest data**: resource declaration (name, icon slot, cap default, ledger-voice blurb "the boilers breathe it"), Claim Office exchange rows (gold↔pressure rate placeholder-tuned per bundle; META-CURRENCY SLOT honored: the exchange table's shape allows the future overall-currency row per the owner's ruling — comment the slot, implement nothing).
3. **HUD chip (epoch-gated)**: renders beside gold ONLY when active epoch declares pressure (dev-verifiable via the epoch-2 stub + a debug epoch override — document the param).
4. **Diagnostics**: pressure balance + event log exposure (mirrors gold).

## Firewall
Touch ONLY: Economy (additive resource generalization — gold behavior byte-identical, regression-asserted), epoch-2 manifest data, the epoch-gated HUD chip, e2e, artifacts. NO consumers/producers (E2 content's job), NO epoch-1 visible changes (plain boot identical — asserted), NO meta-currency implementation (slot comment only).

## Self-check
tsc/build; new `e2e/e2-pressure-economy.spec.ts`: epoch-1 boot shows NO pressure chip + gold flows byte-identical (seeded hash) · debug epoch-2 override shows the chip + exchange rows load · pressure events log + attribute; sci-04 + m1-01 + m2-01 + task-027 unmodified green both projects; zero console errors; screenshots (chip under override, clean epoch-1 HUD) into artifacts/e2-pressure/. Commit on lane/m3. End: READY-FOR-GATES + the exchange-table shape shipped + results.
