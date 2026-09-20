from pathlib import Path
import importlib.util,sys
root=Path.cwd();path=root/'assets/pilots/salvage-claw-3d/build_salvage_claw_detail_opus5.py'
spec=importlib.util.spec_from_file_location('claw_candidate',path);m=importlib.util.module_from_spec(spec);sys.modules[spec.name]=m;spec.loader.exec_module(m)
out=root/'artifacts/boss-fidelity/e8-salvage-claw/candidate-v10';out.mkdir(exist_ok=True)
m.GLB=out/'salvage-claw.glb';m.BLEND=out/'salvage-claw.blend';m.main()
