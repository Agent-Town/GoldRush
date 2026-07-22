# Task lane-release-build: RF-05b — THE PHYSICAL FRONTIER build variant (LADDER after RF-01, commit prefix "feat:")
You are Codex (worktree per queue lane). CODEX: model=gpt-5.6-sol effort=xhigh
READ FIRST: specs/release-e1/README.md §THE FRONTIER IS PHYSICAL (the law) · vite config + the content glob sites (contracts import.meta.glob, plate/GLB globs, ceremony scripts registry, epoch manifests) · the debug gate (isDebugEnabled + __GR_TEST__ install) · scripts/deploy.sh (the release variant needs its own build command, never the default).
Pre-flight: standard safe-dupe; npm i; tsc+build green.
## Scope
1. `GR_RELEASE=e1 npm run build:release` — a build mode where: epoch-2+ content is NOT EMITTED (env-scoped globs/registry filters at build time — verify by grepping the dist bundle: zero epoch-2+ manifest ids, zero e2+ plate/GLB assets in the output), the debug gate compiles to false (?debug, &era, __GR_TEST__ inert — dead-code-eliminated where possible), the frontier flag baked on.
2. The DEFAULT build is byte-identical in behavior to today (assert: normal build still contains everything; the variant is additive).
3. Spec e2e/release-build.spec.ts (runs against a release-built preview): the five E1 doors boot green · ?debug&era=5 changes nothing (no seam, no epoch) · dist contains no epoch-2 manifest string (build assertion script) · an imported ledger with activeEpoch epoch-7 clamps to the frontier and PLAYS (heal law) · zero console.
## Firewall: build config + glob scoping + the gate compile-out + spec + a build:release script. NO gameplay changes, NO default-build changes.
END: READY-FOR-GATES + the dist-diff table (what the release bundle excludes, by count/size).
