"""Build an isolated review candidate while runtime captures use the shipped GLB."""
from pathlib import Path
import importlib.util

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
spec = importlib.util.spec_from_file_location("crawler_candidate", ROOT / "assets/pilots/crawler-3d/build_crawler.py")
model = importlib.util.module_from_spec(spec)
spec.loader.exec_module(model)
model.OUT = OUT / "candidate"
model.BLEND = model.OUT / "crawler.blend"
model.GLB = model.OUT / "crawler.glb"
model.main()
