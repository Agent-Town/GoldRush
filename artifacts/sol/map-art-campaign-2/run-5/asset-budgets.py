"""Count indexed/non-indexed GLB triangles against each authored contract budget."""
import json,struct,sys
from pathlib import Path
base=Path('assets/pilots/map-rebuild-spike');name=sys.argv[1];folder=Path('artifacts/sol/map-art-campaign-2/run-5')/sys.argv[2];rows=[]
def triangles(p):
 b=p.read_bytes();n,t=struct.unpack_from('<II',b,12);assert t==0x4e4f534a;d=json.loads(b[20:20+n]);total=0
 for m in d['meshes']:
  for p in m['primitives']:
   assert p.get('mode',4)==4
   total+=d['accessors'][p.get('indices',p['attributes']['POSITION'])]['count']//3
 return total
for kind in ['terrain','panorama']:
 p=base/f'{name}-{kind}-contract.json';d=json.loads(p.read_text());n=triangles(base/d['asset']);rows.append({'kind':kind,'asset':d['asset'],'actualTriangles':n,'declaredTriangles':d['triangles'],'budget':d['triangleBudget']});assert n==d['triangles'] and n<=d['triangleBudget']
p=base/f'landmarks/{name}/{name}-landmark-pack-contract.json'
if p.exists():
 for id,d in json.loads(p.read_text())['assets'].items():
  n=triangles(base/d['asset']);rows.append({'kind':'landmark','id':id,'asset':d['asset'],'actualTriangles':n,'declaredTriangles':d['triangles'],'budget':d['triangleBudget']});assert n==d['triangles'] and n<=d['triangleBudget']
folder.mkdir(exist_ok=True);(folder/'asset-budgets.json').write_text(json.dumps(rows,indent=2)+'\n');print(rows)
