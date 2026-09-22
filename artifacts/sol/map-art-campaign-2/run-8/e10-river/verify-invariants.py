from pathlib import Path
import hashlib,json,subprocess
out=Path(__file__).parent;pilot=Path('assets/pilots/map-rebuild-spike');store=Path('/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets');base=json.loads((out/'base.json').read_text())
old=lambda p:subprocess.check_output(['git','-C',str(store),'show',base['store']+':pilots/map-rebuild-spike/'+p])
paths=['river-'+kind+suffix for kind in ['terrain','panorama'] for suffix in ['.glb','.blend','-contract.json','-atlas.png']]+['river-fallback-height-grid.json','landmark-collision-contract.json','landmarks/river/river-landmarks-atlas.png']
unchanged={}
for p in paths:
 data=(pilot/p).read_bytes();assert data==old(p),p;unchanged[p]=hashlib.sha256(data).hexdigest()
prior=json.loads(old('landmarks/river/river-landmark-pack-contract.json'));current=json.loads((pilot/'landmarks/river/river-landmark-pack-contract.json').read_text())
for key in ['mounts','acceptanceStations','atlas']:
 assert prior.get(key)==current.get(key),key
for key in prior['assets']:
 assert prior['assets'][key]['triangleBudget']==current['assets'][key]['triangleBudget']
 assert prior['assets'][key]['blocking']==current['assets'][key]['blocking']
ledger=json.loads((pilot/'landmarks/landmark-source-ledger.json').read_text());original=json.loads(old('landmarks/landmark-source-ledger.json'));ledger['packs'].pop('river');original['packs'].pop('river');assert ledger==original
source=Path('src/world/Terrain3dClaimPilot.ts').read_text();original=subprocess.check_output(['git','show',base['code']+':src/world/Terrain3dClaimPilot.ts'],text=True)
source=source.replace("          if (host.contractId === 'e10-river') paintRiverStones(model);\n",'')
a=source.index('/** The original stones');b=source.index('/** A material-only dawn',a);source=source[:a]+source[b:]
def without_water(s):
 a=s.index('function paintRiverReturn(');b=s.index('\nfunction ',a+10);return s[:a]+s[b:]
assert without_water(source)==without_water(original),'outside River-only paint changed'
authorities=['src/game','src/sim','assets/contracts','src/world/Terrain.ts','src/world/Water.ts','src/world/LandmarkCollision.ts','src/systems','src/entities','e2e','assets/engine-era.json']
for path in authorities:assert not subprocess.check_output(['git','diff',base['code'],'--',path]),path
registry=[s for s in source.splitlines() if s.lstrip().startswith(tuple("'e%d-"%i for i in range(2,11))) and ': entry(' in s];assert len(registry)==36 and all(s.rstrip().endswith('),') for s in registry)
import struct
from collections import Counter
def glb(data):
    n=struct.unpack_from('<I',data,12)[0];return json.loads(data[20:20+n]),data[28+n:]
def triangles(data):
    doc,binary=glb(data)
    def values(index):
        a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']];kind={5126:'f',5125:'I',5123:'H'}[a['componentType']];count={'SCALAR':1,'VEC3':3}[a['type']];fmt='<'+kind*count;size=struct.calcsize(fmt);start=v.get('byteOffset',0)+a.get('byteOffset',0)
        return [struct.unpack_from(fmt,binary,start+i*v.get('byteStride',size)) for i in range(a['count'])]
    result=[]
    for mesh in doc['meshes']:
        for primitive in mesh['primitives']:
            verts=values(primitive['attributes']['POSITION']);idx=[v[0] for v in values(primitive['indices'])]
            result += [tuple(sorted(verts[j] for j in idx[i:i+3])) for i in range(0,len(idx),3)]
    return sorted(result)
def images(data):
    doc,binary=glb(data);result=[]
    for image in doc['images']:
        v=doc['bufferViews'][image['bufferView']];start=v.get('byteOffset',0);result.append(binary[start:start+v['byteLength']])
    return result
for id in current['assets']:
 path='landmarks/river/'+id+'.glb'
 prior_faces=Counter(triangles(old(path)));final_faces=Counter(triangles((pilot/path).read_bytes()))
 assert all(final_faces[face]>=count for face,count in prior_faces.items()),id
(out/'invariants.json').write_text(json.dumps({'unchangedBytes':unchanged,'terrainHeightsMasksWaterTablesExact':True,'allOriginalBodyTriangleSurfacesRetained':True,'mountsStationsBudgetsCollisionUnchanged':True,'otherPackLedgerEntriesExact':True,'onlyRiverPaintChanged':True,'singleLineRegistryEntries':len(registry),'protectedAuthorities':authorities},indent=2)+'\n');print('RIVER INVARIANTS PASS')
