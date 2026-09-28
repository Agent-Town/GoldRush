"""Rebuild both GLBs in an isolated asset tree from the frozen recipe inputs."""
from pathlib import Path
import subprocess,json,hashlib
root=Path.cwd();p=root/'assets/pilots/map-rebuild-spike';s=p/'sources/e3-canyon-works-fidelity-2';out=Path(__file__).parent
raw=root/'artifacts/sol/map-art-campaign-2/_raw/run-9/canyon-recipe-rebuild';raw.mkdir(exist_ok=True);target=raw/'assets/pilots/map-rebuild-spike';(target/'landmarks/canyon-works').mkdir(parents=True,exist_ok=True)
(raw/'assets/raw').symlink_to((root/'assets/raw').resolve()) if not (raw/'assets/raw').exists() else None
(target/'canyon-works-terrain-atlas.png').write_bytes((p/'canyon-works-terrain-atlas.png').read_bytes())
rows=[]
for recipe,file in [('refine-canyon.py','landmarks/canyon-works/sub-hall-dynamo-house.glb'),('dress-canyon-rim.py','canyon-works-panorama.glb')]:
 with (raw/(recipe+'.log')).open('w') as log:rc=subprocess.run(['/Applications/Blender.app/Contents/MacOS/Blender','--background','--python',str(s/recipe)],cwd=raw,stdout=log,stderr=subprocess.STDOUT).returncode
 assert rc==0,recipe
 rebuilt=(target/file).read_bytes();delivered=(p/file).read_bytes();assert rebuilt==delivered,recipe
 rows.append({'recipe':recipe,'exit':rc,'glb':file,'rebuiltByteIdentically':True,'sha256':hashlib.sha256(rebuilt).hexdigest()})
(out/'recipe-reproduction.json').write_text(json.dumps({'rows':rows,'isolatedRoot':str(raw.relative_to(root)),'liveStoreWritten':False},indent=2)+'\n');print('BOTH CANYON RECIPES REPRODUCE EXACT GLBS')
