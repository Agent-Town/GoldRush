"""Full damage extents, using the existing neutral renderer and unchanged asset."""
from pathlib import Path
import importlib.util

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
spec = importlib.util.spec_from_file_location("crawler_render", ROOT / "assets/pilots/crawler-3d/render_crawler.py")
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)
r.GLB = ROOT / "assets/pilots/crawler-3d/crawler.glb"
r.OUT = HERE / "candidate-neutral"
r.reset_scene()
crawler = r.import_crawler()
r.add_box("Damage ground", (12, 12, .1), (0, 0, -.07), r.material("Damage review ledge", (.18, .095, .04, 1)))
camera = r.setup_scene((700, 620))
camera.data.type = "PERSP"
camera.data.angle = r.math.radians(46)
target = r.Vector((-.4, 0, 1.02))
r.aim(camera, target + r.Vector((-2.25, 5.5, 3.03)).normalized() * 8.5, target)
paths = []
for node, morph in r.COMPONENTS.items():
    r.set_all_morphs(crawler, 0)
    crawler[node].data.shape_keys.key_blocks[morph].value = 1
    path = r.OUT / f"full-damage-{node}.png"
    r.render(path)
    paths.append(path)
r.save_grid(paths, r.OUT / "crawler-full-damage-states.png", 1, 3)
