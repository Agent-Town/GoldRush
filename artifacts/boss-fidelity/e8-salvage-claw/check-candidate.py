"""Check candidate export identity, cost and preserved texture against banked E8."""
from pathlib import Path
import hashlib,json,struct,sys
root=Path('artifacts/boss-fidelity/e8-salvage-claw')
def inspect(path):
 data=path.read_bytes();n=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+n]);binary=data[28+n:]
 view=doc['bufferViews'][doc['images'][0]['bufferView']];offset=view.get('byteOffset',0);atlas=binary[offset:offset+view['byteLength']]
 meshes=doc['meshes'];assert len(meshes)==3 and len(doc['materials'])==1
 expected={'winch':'Landing_SprungWinch','anchor_feet':'Landing_SettledAnchorFeet','crown':'Landing_DarkCrown'}
 found={}
 for node in doc['nodes']:
  if 'mesh' not in node:continue
  mesh=meshes[node['mesh']];name=node['name'];assert name in expected
  assert len(mesh['primitives'])==1 and mesh['extras']['targetNames']==[expected[name]]
  assert node.get('translation',[0,0,0])==[0,0,0] and node.get('scale',[1,1,1])==[1,1,1]
  primitive=mesh['primitives'][0];assert len(primitive['targets'])==1
  found[name]=doc['accessors'][primitive['indices']]['count']//3
 assert set(found)==set(expected) and sum(found.values())<=45000
 return {'sha256':hashlib.sha256(data).hexdigest(),'atlasSha256':hashlib.sha256(atlas).hexdigest(),'triangles':sum(found.values()),'components':found}
report={'before':inspect(root/'before/assets/pilots/salvage-claw-3d/salvage-claw-detail-opus5.glb'),'candidate':inspect(Path(sys.argv[1]))}
if '--new-atlas' not in sys.argv:
 assert report['before']['atlasSha256']==report['candidate']['atlasSha256']
else:
 report['atlasChangedIntentionally']=True
 report['rawAtlasSha256']=hashlib.sha256(Path('assets/raw/salvage-claw-atlas-fidelity-e8.png').read_bytes()).hexdigest()
Path(sys.argv[1]).with_name('structure-check.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
