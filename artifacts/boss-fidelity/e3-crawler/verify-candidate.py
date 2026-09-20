from pathlib import Path
import importlib.util

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
spec = importlib.util.spec_from_file_location('crawler_verify', ROOT / 'assets/pilots/crawler-3d/verify_crawler.py')
verifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)
verifier.GLB = HERE / 'candidate/crawler.glb'
verifier.BLEND = HERE / 'candidate/crawler.blend'
verifier.OUT = HERE / 'candidate-verification'
verifier.REEXPORT = HERE / 'candidate-verification/reexport.glb'
verifier.main()
