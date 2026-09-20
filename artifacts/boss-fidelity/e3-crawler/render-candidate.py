"""Reuse the existing crawler renderer for matched baseline and candidate evidence."""
from pathlib import Path
import importlib.util
import sys

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
spec = importlib.util.spec_from_file_location("crawler_render", ROOT / "assets/pilots/crawler-3d/render_crawler.py")
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
for name, model in (("before-neutral", OUT / "before/assets/crawler.glb"), ("candidate-neutral", OUT / "candidate/crawler.glb")):
    if "--candidate-only" in sys.argv and name != "candidate-neutral":
        continue
    renderer.GLB = model
    renderer.OUT = OUT / name
    renderer.main()
