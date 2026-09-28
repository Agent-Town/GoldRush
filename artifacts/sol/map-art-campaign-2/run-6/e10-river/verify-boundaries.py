"""Verify this candidate changes only raw River material composition, not route geometry."""
from pathlib import Path
import hashlib,json,subprocess,re

root=Path.cwd();folder=Path(__file__).resolve().parent;base=json.loads((folder/'base.json').read_text())
def git(*args):return subprocess.check_output(['git',*args])
unchanged={}
for path in ['src/sim','src/game','assets/contracts','src/world/Water.ts','src/world/Terrain.ts','src/systems/E10FinaleSystem.ts','src/meta','assets/engine-era.json']:
    assert not git('diff',base['code'],'--',path).strip(),path
    unchanged[path]=True
path='src/world/Terrain3dClaimPilot.ts';current=Path(path).read_text();old=git('show',base['code']+':'+path).decode()
start=current.index('/** A material-only dawn treatment');end=current.index('/** Quiet the archive paving;',start)
without=current[:start]+current[end:]
without=without.replace('return paintRiverReturn(host);','return () => undefined;')
assert without==old,'Changes beyond material-only insertion and the fallback cleanup return'
assert not re.search(r"^\s*'e10-river':",current,re.M),'No River registry alias'
store=Path('/Users/robin/Claude/Projects/GoldRush-assets')
assert subprocess.check_output(['git','-C',str(store),'rev-parse','HEAD']).decode().strip()==base['store']
assert not subprocess.check_output(['git','-C',str(store),'status','--porcelain']).strip(),'Store must be unchanged'
contract=next(c for c in json.loads(Path('assets/contracts/epoch-10-deepsky/contracts.json').read_text())['contracts'] if c['id']=='e10-river')
pilot=Path('assets/pilots/map-rebuild-spike');claim=json.loads((pilot/'the-claim-terrain-contract.json').read_text());collisions=json.loads((pilot/'landmark-collision-contract.json').read_text())['maps']
route={'rawId':contract['id'],'rawTileId':contract['tileParams']['tileId'],'rawDimensions':contract['tileParams']['dimensions'],'rawTerrainMeshDeclaration':contract['tileParams']['render'],'rawDescription':contract['description'],'claimSculptBounds':claim['boundsMeters'],'claimSculptTileId':claim['tileId'],'claimLandmarkCount':len(claim['landmarkMounts']),'rawCollisionRegistryCount':len(collisions.get('e10-river',[])),'claimCollisionRegistryCount':len(collisions['the-claim']),'cause':'Raw e10-river has no REGISTRY entry. The absent entry, 128 m descriptor, explicit no-new-sculpt route and zero collider mounts are retained. The finale stamps the existing 64 m Claim charter. Matching tileId alone does not permit aliasing.','heldOwner':'Contract/charter and E10FinaleSystem owners via Claude choose the canonical route; UI/camera owners choose quiet finale framing.'}
assert route['rawDimensions']=={'width':128,'height':128};assert route['claimLandmarkCount']==5;assert route['claimCollisionRegistryCount']==3
(folder/'route-invariants.json').write_text(json.dumps(route,indent=2)+'\n')
proof=json.loads((folder/'material-proof.json').read_text())
(folder/'asset-budgets.json').write_text(json.dumps({'scope':'Raw River painted fallback. No new sculpt, mounted pack, asset or triangle introduced. The raw descriptor publishes no authored GLB triangleBudget.','existingMaterialTargetMeshes':proof['meshes'],'existingTargetTriangles':sum(m['triangles'] for m in proof['meshes']),'newTriangles':0,'mountedLandmarks':0,'landmarkStationBodyEmissionHudCoverage':'not applicable: zero mounted landmarks','storeBefore':base['store'],'storeAfter':base['store']},indent=2)+'\n')
(folder/'invariants.json').write_text(json.dumps({'base':base,'unchanged':unchanged,'exactRemainingRenderSource':True,'noRegistryAlias':True,'storeUnchanged':True,'renderSourceSha256':hashlib.sha256(current.encode()).hexdigest()},indent=2)+'\n')
print('RIVER ROUTE AND SOURCE BOUNDARIES PASS')
