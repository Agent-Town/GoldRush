"""Reuse the existing railcar renderer for matched baseline and candidate evidence."""
from pathlib import Path
import importlib.util

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
spec = importlib.util.spec_from_file_location("railcar_render", ROOT / "assets/pilots/railcar-3d/render_railcar.py")
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
for name, model in (("before-neutral", OUT / "before/assets/railcar.glb"), ("candidate-neutral", OUT / "candidate/railcar.glb")):
    renderer.GLB = model
    renderer.OUT = OUT / name
    renderer.main()
