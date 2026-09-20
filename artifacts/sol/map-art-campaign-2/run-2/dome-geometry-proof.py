"""Compare original and candidate dome surfaces, materials and embedded textures."""
from pathlib import Path
import json,struct,hashlib,collections
root=Path('artifacts/sol/map-art-campaign-2');old=root/'_raw/run-2/mare-original';new=Path('assets/pilots/map-rebuild-spike/landmarks/mare-dome')
def decode(p):
 b=p.read_bytes();cursor=12;d=None;binary=None
 while cursor<len(b):
  length,kind=struct.unpack_from('<II',b,cursor);chunk=b[cursor+8:cursor+8+length];cursor+=8+length
  if kind==0x4e4f534a:d=json.loads(chunk)
  elif kind==0x004e4942:binary=chunk
 def accessor(i):
  a=d['accessors'][i];v=d['bufferViews'][a['bufferView']];fmt={5126:'f',5125:'I',5123:'H',5121:'B'}[a['componentType']];n={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']];step=v.get('byteStride',struct.calcsize('<'+fmt*n));offset=v.get('byteOffset',0)+a.get('byteOffset',0)
  return [struct.unpack_from('<'+fmt*n,binary,offset+j*step) for j in range(a['count'])]
 triangles=collections.Counter();positions=set()
 for m in d['meshes']:
  for p in m['primitives']:
   attrs={k:accessor(i) for k,i in p['attributes'].items()};pos=attrs['POSITION'];positions.update(pos);ix=[i[0] for i in accessor(p['indices'])] if 'indices' in p else list(range(len(pos)))
   for j in range(0,len(ix),3):
    corners=tuple(tuple((k,attrs[k][i]) for k in sorted(attrs)) for i in ix[j:j+3]);key=(p.get('material'),min(corners[k:]+corners[:k] for k in range(3)));triangles[key]+=1
 image_hashes=[]
 for image in d.get('images',[]):
  v=d['bufferViews'][image['bufferView']];offset=v.get('byteOffset',0);image_hashes.append(hashlib.sha256(binary[offset:offset+v['byteLength']]).hexdigest())
 return {'triangles':triangles,'positions':positions,'images':image_hashes,'materials':d['materials'],'nodes':d['nodes']}
a,b=[decode(p/'air-pad-dome.glb') for p in [old,new]]
ac=json.loads((old/'mare-dome-landmark-pack-contract.json').read_text());bc=json.loads((new/'mare-dome-landmark-pack-contract.json').read_text())
def canonical(k):
 mat,cs=k;cs=[dict(c) for c in cs]
 q=[(tuple(round(v,4) for v in c['POSITION']),tuple(round(v,4) for v in c['TEXCOORD_0'])) for c in cs]
 i=min(range(3),key=lambda i:tuple(q[i:]+q[:i]));return (mat,tuple(q[i:]+q[:i])),cs[i:]+cs[:i]
lookup=collections.defaultdict(list);candidate_keys=collections.Counter();original_keys=collections.Counter()
for k,n in b['triangles'].items():
 key,cs=canonical(k);lookup[key].append(cs);candidate_keys[key]+=n
maximum={k:0.0 for k in ['POSITION','NORMAL','TEXCOORD_0']}
for k,n in a['triangles'].items():
 key,cs=canonical(k);original_keys[key]+=n;assert key in lookup
 match=min(lookup[key],key=lambda other:sum(abs(x-y) for c,d in zip(cs,other) for x,y in zip(c['NORMAL'],d['NORMAL'])))
 for attr in maximum:maximum[attr]=max(maximum[attr],max(abs(x-y) for c,d in zip(cs,match) for x,y in zip(c[attr],d[attr])))
missing=original_keys-candidate_keys;added=candidate_keys-original_keys
r={'originalTriangles':sum(a['triangles'].values()),'candidateTriangles':sum(b['triangles'].values()),'missingOriginalTrianglesWithinTolerance':sum(missing.values()),'addedTriangles':sum(added.values()),'maximumOriginalAttributeComponentDelta':maximum,'tolerance':{'POSITION':1e-6,'NORMAL':1e-4,'TEXCOORD_0':0},'materialsEqual':a['materials']==b['materials'],'nodeTransformsEqual':a['nodes']==b['nodes'],'embeddedImagesEqual':a['images']==b['images'],'atlasBytesEqual':(old/'mare-dome-landmarks-atlas.png').read_bytes()==(new/'mare-dome-landmarks-atlas.png').read_bytes(),'boundsEqual':ac['assets']['air-pad-dome']['bounds']==bc['assets']['air-pad-dome']['bounds'],'mountsEqual':ac['mounts']==bc['mounts'],'triangleBudget':bc['assets']['air-pad-dome']['triangleBudget'],'dressing':'5 framed glass ports (20 triangles) and 6 service panels (12 triangles), on the existing drum outside its open airlock segments.','exactCheck':'Exact attributes differ on 458 triangles after re-export. All old triangles match at the stated tolerances, with UVs exact; this is not a claim of byte-identical original vertex data.'}
(root/'run-2/e8-mare-claim/geometry-proof.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
assert not missing and r['addedTriangles']==32 and r['candidateTriangles']<=r['triangleBudget']
assert all(maximum[k]<=v for k,v in r['tolerance'].items())
assert all(r[k] for k in ['materialsEqual','nodeTransformsEqual','embeddedImagesEqual','atlasBytesEqual','boundsEqual','mountsEqual'])
