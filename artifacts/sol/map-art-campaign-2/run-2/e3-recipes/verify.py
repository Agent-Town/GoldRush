"""Run the actual public builder CLI in isolated output roots; compare shipped bytes/pixels."""
from pathlib import Path
import hashlib,json,subprocess,time
from PIL import Image,ImageChops
root=Path('artifacts/sol/map-art-campaign-2');out=root/'run-2/e3-recipes';raw=root/'_raw/run-2/e3-recipes';raw.mkdir(parents=True,exist_ok=True)
builder=Path('assets/pilots/map-rebuild-spike/build_landmark_packs.py');packs=['blackout-ridge','canyon-works','fairground','moth-season'];sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
shipped={p:sha(p) for name in packs for p in (Path('assets/pilots/map-rebuild-spike/landmarks')/name).glob('*') if p.is_file()};rows=[]
for name in packs:
 cmd=['/Applications/Blender.app/Contents/MacOS/Blender','--background','--python-exit-code','1','--python',str(builder),'--','--atlas-only',name,'--out',str(raw/'rebuilt')]
 log=raw/(name+'.log');start=time.time()
 with log.open('w') as f:rc=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT,timeout=300).returncode
 rebuilt=raw/'rebuilt'/name/(name+'-landmarks-atlas.png');original=Path('assets/pilots/map-rebuild-spike/landmarks')/name/(name+'-landmarks-atlas.png')
 row={'pack':name,'command':cmd,'exit':rc,'seconds':time.time()-start,'log':str(log),'shippedSha256':sha(original)}
 if rebuilt.exists():
  a,b=Image.open(original).convert('RGBA'),Image.open(rebuilt).convert('RGBA');row.update(rebuiltSha256=sha(rebuilt),reproducedBytes=sha(original)==sha(rebuilt),sameDimensions=a.size==b.size)
  if a.size==b.size:row['pixelMaxDelta8bit']=max(hi for lo,hi in ImageChops.difference(a,b).getextrema())
 rows.append(row);(out/'proof.json').write_text(json.dumps(rows,indent=2)+'\n');print(name,row,flush=True)
 assert rc==0 and row.get('reproducedBytes') and row.get('pixelMaxDelta8bit')==0
assert all(sha(p)==value for p,value in shipped.items())
(out/'production-preserved.json').write_text(json.dumps({'filesChecked':len(shipped),'allUnchanged':True,'sha256':{str(p):h for p,h in shipped.items()}},indent=2)+'\n')
