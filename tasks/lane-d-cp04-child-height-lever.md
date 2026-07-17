# Task lane-d-cp04-child-height-lever: CP-04 — the kids' Press mode (LANE-D, commit prefix "feat(press):")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; specs/charter-press/README.md (law 3 THE CHILD-HEIGHT LEVER + slice CP-04 — this task IS that slice); src/charter/** (the shipped engine: envelope, compileCharter, stampCharter, PressPanel — CP-04 is a NEW FACE on this engine, never a fork of it); e2e/cp03-press-loop.spec.ts (the loop patterns you extend).

Pre-flight (LANE-SAFETY): standard safe-dupe rules (content-on-main = SAFE DUPE → `git checkout -B lane/perf main && git clean -fd`; STOP on undrained/foreign). npm install; build green.
GROUND-TRUTH pre-flight: grep `child\|kids\|lever` in src/charter/ — no kids-mode exists = BUILD. Present = STOP SHIPPED.

## Why (charter-press CP-04; the spec's law 3 verbatim: "choose-not-configure: pick a land, pick a story, pick who visits, press")
The engine is proven (CP-01..03 merged, round-trip 5/5). The capstone's public face is the mode a child operates: E10's ceremony is four hands on ONE LEVER.

## Scope
1. **The Lever mode** behind ?editor (a mode toggle inside the existing Press panel — "Full Press" / "The Lever"): THREE choices + one button, per law 3: (a) PICK A LAND — the five E1 tiles as picture cards (use their existing board/ledger art); (b) PICK A STORY — three template charters you author as fixtures (defend / explore-quiet / big-build — each a pre-tuned E1 charter with zones/objectives set); (c) PICK WHO VISITS — three wave-flavor presets (gentle / classic / busy) mapping to existing wave params. Then THE LEVER: one large press control that stamps (validator-gated, same stampCharter path) and LAUNCHES.
2. **No blank canvas, no numbers, no failure states** (law 3): every path starts from a living template; validation failures cannot occur from the three-choice space (prove it: the fuzz spec walks ALL 5×3×3 combinations — every one stamps and boots); undo = re-pick before pressing.
3. **The template fixtures** live as data (src/charter/templates/ or assets equivalent per house style), each a valid charter passing the round-trip.
4. **Extend the Press specs additively**: e2e/cp04-lever.spec.ts — all 45 combinations stamp+boot clean (batch the boot probes sensibly: stamp all 45, boot-probe a seeded sample of 9 + assert zero validator rejections across all 45); plain boot stays byte-identical (inert law); existing cp01-03 specs unmodified-green.

## Firewall
Touch ONLY: src/charter/** (the lever mode + templates), the Press panel's mode toggle, e2e/cp04-lever.spec.ts. NO sim/game code, NO changes to compile/stamp/import logic (the engine is ratified — new face, same machine), NO existing spec edits.

## Self-check (evidence, not vibes)
tsc + build green. cp04 spec green both projects; cp01-03 + task-025 unmodified-green both projects. Zero console errors. Screenshots: reviews/shots-cp04/{lever-mode.png, land-cards.png, stamped-launch.png}.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + the 45-combination matrix result + template fixture list.
