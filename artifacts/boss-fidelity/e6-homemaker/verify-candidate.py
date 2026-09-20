from pathlib import Path
import importlib.util,sys
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
spec=importlib.util.spec_from_file_location('e6_candidate_verify',ROOT/'assets/pilots/homemaker-9000-3d/verify_homemaker_9000.py');v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
v.GLB=HERE/'candidate-model/homemaker-9000.glb';v.BLEND=HERE/'candidate-model/homemaker-9000.blend';v.OUT=HERE/'candidate-validation';v.REEXPORT=v.OUT/'reexport.glb'
v.main()
