"""Run the frozen-input recipe into evidence scratch, never over the live pack."""
from pathlib import Path
import sys,re,json,hashlib
args=sys.argv[sys.argv.index('--')+1:];name,recipe,*ids=args
P=Path.cwd()/'assets/pilots/map-rebuild-spike';pack=name.removeprefix('e7-')
source=P/f'sources/{name}-fidelity-2'/recipe
raw=Path.cwd()/'artifacts/sol/map-art-campaign-2/_raw/run-9'/(name+'-recipe-proof');raw.mkdir(exist_ok=True)
code=source.read_text();code,n=re.subn(r"PACK=P/'landmarks/[^']+'",'PACK=Path('+repr(str(raw))+')',code);assert n==1,n
sys.argv=sys.argv[:sys.argv.index('--')]
exec(compile(code,str(source),'exec'),{'__file__':str(source),'__name__':'__main__'})
rows=[]
for id in ids:
 a=(raw/(id+'.glb')).read_bytes();b=(P/f'landmarks/{pack}'/(id+'.glb')).read_bytes();assert a==b,id
 rows.append({'id':id,'recipeReproducesGlbExactly':True,'sha256':hashlib.sha256(a).hexdigest()})
out=Path('artifacts/sol/map-art-campaign-2/run-9')/name/'recipe-verification.json';out.write_text(json.dumps(rows,indent=2)+'\n');print('RECIPE PROOF PASS',name)
