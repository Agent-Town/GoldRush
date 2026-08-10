# FOUNDRY SPIKE ARM 2: MAC × sharper minds (owner: "could we use it with codex subscription? lets try it", 2026-08-10)

You are the driver, running as gpt-5.6-sol xhigh on the owner's subscription. Arm 1 (driver + MAC both on deepseek-v4-flash) FAILED before style could be judged: read `SPIKE-MAC-REPORT.md` and `SPIKE-MAC.md` (the original brief — its pipeline, style laws, and directory rules all still bind) FIRST. This arm answers ONE question: **was flash the bottleneck, or is MAC?** Same prop (the E2 ore mine-cart), same tail, sharper minds at both layers.

## What changes from arm 1
1. **MAC's internal LLM = OpenRouter `deepseek/deepseek-v4-pro`** (env `OPENROUTER_API_KEY`, never printed). Not flash. Record per-attempt token/cost from MAC's own logs.
2. **You are the sharper driver.** Arm 1's driver burned 3.9M tokens on environment friction. Yours is pre-cleared below — do not re-discover it.
3. **THE SEMANTIC GATE (the finding arm 1 earned — this is now YOUR job, because MAC provably does not do it):** after EVERY attempt that produces an STL, run in `mac-app/venv`: trimesh-load the STL, compute mesh volume, and compare against MAC's own `temp_measurements_*.json` frame+hopper spec volume. Arm 1 shipped 2.33% fill (1,704 cm³ of a 14,000 cm³ spec) and MAC's QA passed it. **An attempt passes ONLY if mesh volume ≥ 50% of the spec'd frame+hopper volume AND a rendered view shows a recognizable open-top cart body.** Fail → feed the fill % and the missing-part diagnosis back into the next MAC attempt. ≤4 attempts total.

## Environment intelligence from arm 1 (verified, do not re-derive)
- Venv EXISTS at `mac-app/venv` (python3.11). Reuse it. pip cache permission warnings are harmless noise.
- **build123d 0.11.1 is INCOMPATIBLE with its installed OCP** (`TopoDS_Shape has no attribute HashCode` — killed attempt 3; `Rectangle(700,400)` dies in `topology.py:2170`). Before anything else: downgrade build123d in the venv until this 3-line smoke test passes: `from build123d import Rectangle, import_step; Rectangle(700.0, 400.0)`. Try the 0.9.x family first. Record the working pin in the report.
- macOS has NO `timeout` command. Never use it. Long-running python: run bare, or use python-internal limits.
- trimesh 5.0.0 + matplotlib work headless (Agg) in the venv. `simplify_quadric_decimation` needs `fast_simplification` which is NOT installed — pip install it into the venv if you decimate, or skip decimation if ≤8k tris already.
- Render recipe proven in arm 1's salvage: `plot_trisurf(v[:,0], v[:,1], v[:,2], triangles=f)` — three views (three-quarter/side/front), county paper background #f3e9d8, iron #7a4a32. Model: `bench-foundry-render` pattern in the game repo `bench/foundry/mac-spike/` — but write your own small script in `mac-tail/`.
- MAC attempts go to `mac-app/attempts2/attempt-N/` (arm 1's `attempts/` is evidence — do not touch it).

## Deliverables (retention law: keep every attempt, every log)
1. Per-attempt: STEP/STL + measurements + **fill-% line** + MAC token JSON.
2. First attempt that passes the semantic gate: run the tail (`mac-tail/`) → county-palette `.glb` ≤8k tris → 3-view render `spike-mac2-verdict/ore-cart-mac2-views.png`.
3. `SPIKE-MAC-2-REPORT.md`: working build123d pin · per-attempt fill table (arm 1's 2.33% as row zero) · Effort Law table (your tokens vs arm 1's 3.9M; MAC's v4-pro cost vs flash) · verdict paragraph: **did the sharper mind produce a true cart, and which layer was the bottleneck?** A second negative stated plainly is a full success.
4. If an attempt passes the gate, STOP after the render — the in-game stand-beside (arm 1 §4) is a separate owner-gated step; report READY-FOR-STYLE-VERDICT instead.

Do not touch anything outside `mac-app/`, `mac-tail/`, `spike-mac2-verdict/`, and the two report files. No network beyond OpenRouter. Never print the key.
