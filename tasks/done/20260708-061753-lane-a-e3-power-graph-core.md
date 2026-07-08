# Task e3-power-graph-core: the wire — E3's power graph engine, generic and dark (LANE-A, branch lane/m3, commit prefix "e3:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; **specs/epoch-saga/e3-voltage-bundle.md (the power graph: producers, pylons/wire-spans, consumers, brown-outs — this task builds the ENGINE, zero E3 content)** + specs/epoch-saga/README.md engine ladder; 045's Megaproject.ts (THE pattern: engine early behind a flag, dev-manifest-tested, content at era — replicate it exactly); the epoch socket (registry-driven activation). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m3 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Why (owner momentum order 2026-07-08: "Lets keep pushing E3 into the queue after E2" — engine slices authorized early per the 045 precedent; E3 CONTENT stays gated on E2-shipped+played)
E3's era-defining system is the power graph. Landing the engine now (flagged, invisible, dev-tested) means E3's content wave plugs into proven plumbing — the same trick that made the Stamp Mill land in hours.

## Scope (ENGINE ONLY — no E3 content, no player-facing anything in E1/E2)
1. **`src/systems/PowerGraph.ts`**: nodes (producers with output, consumers with draw, relays/pylons) + edges (wire spans, max length per Balance knob); graph solve per sim tick budget: connected-component supply/demand → each consumer powered|browned-out|dark; deterministic iteration order (id-sorted); event-logged state changes.
2. **Building integration seam** (dormant): buildings MAY declare power needs/production via their defs — zero existing buildings do (E1/E2 defs untouched; the seam waits for E3 content).
3. **Wire-span entity** (data+render stub): declarative spans between node positions rendered as catenary lines (cheap line geometry, RenderLayers-correct) — dev-tile only via `?debug&power=dev` (a hand-authored dev graph on gt-test-basin: 1 producer, 2 pylons, 3 consumers, one deliberately-overloaded branch proving brown-out).
4. **Determinism + perf**: solve is pure/deterministic (seeded e2e two-run identical); dev-graph solve cost measured (<0.5ms budget stated); flag-off = zero cost (bench delta <1%).
5. Diagnostics: per-node power state exposure.

## Firewall
Touch ONLY: new PowerGraph system + wire render stub, the dormant building-def seam (additive, unused), the dev-graph data + debug param, e2e, artifacts. NO E1/E2 behavior changes (byte-identity asserted on plain boot + seeded run), NO Balance beyond the new namespaced knobs, NO epoch content, NO UI beyond the dev rendering.

## Self-check
tsc/build; new `e2e/e3-power-graph.spec.ts`: flag-off plain boot = zero power anything (asserted) · dev graph solves correctly (supply/demand states asserted incl. the brown-out branch) · determinism two-run identical · perf budget stated; m1-01 + m2-01 + task-025 + e2-pressure unmodified green both projects; zero console errors; screenshots (the dev graph's catenary lines over the basin) into artifacts/e3-power/. Commit on lane/m3. End: READY-FOR-GATES + the graph-solve approach + results.
