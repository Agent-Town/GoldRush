# e3-05-tram — rail follower v2 (lane-c; commit prefix "feat:")
ROLE: gameplay system. WORKDIR: lane-c. CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — E3 spine 4/6.
Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.
## READ-FIRST: the E2 ore-cart/escort rail follower (the v1 this generalizes) · e3-voltage-bundle §B (tram: powered path entity carrying capacitor crates up switchbacks; draws watts while moving) · the power-graph consumer API.
## SCOPE: (1) TramPath entity: follows an authored path, needs POWER (registers as a graph consumer; brown-out = tram stops where it stands), carries cargo slots (escort-grammar compatible); (2) v1 escort carts UNCHANGED (the generalization must not touch E2 behavior — adapter, not rewrite); (3) harness: ?debug&tram runs a loop on the dev tile with a toggleable generator; (4) e2e: tram moves powered / halts dark / resumes, cargo survives halts, E2 escort suite unmodified-green, zero console; both projects.
## Firewall: the tram module + harness + spec + artifacts ONLY. NO escort/E2 changes, NO tiles, NO graph internals.
## Self-check: tsc+build green · new + escort + power suites green. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the consumer-draw numbers.
