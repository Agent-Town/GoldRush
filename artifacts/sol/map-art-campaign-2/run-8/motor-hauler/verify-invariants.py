from pathlib import Path
import subprocess,json,hashlib
r=Path(__file__).parent;base=json.loads((r/'base.json').read_text());source=Path('src/entities/Vehicle.ts').read_text();original=subprocess.check_output(['git','show',base['code']+':src/entities/Vehicle.ts'],text=True)
methods={}
for method in ['driveTo(','update(','reset(','get diagnostics','private arrive(']:
 def extract(s):
  start=s.index('  '+method);end=s.index('\n  }\n',start)+5;return s[start:end]
 assert extract(source)==extract(original),method;methods[method]=hashlib.sha256(extract(source).encode()).hexdigest()
assert subprocess.check_output(['git','diff','--name-only',base['code'],'--','src'],text=True).splitlines()==['src/entities/Vehicle.ts']
for path in ['assets/contracts','assets/engine-era.json','e2e','src/game','src/sim','src/systems','src/world']:
 assert not subprocess.check_output(['git','diff',base['code'],'--',path]),path
store='/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets'
changed=subprocess.check_output(['git','-C',store,'diff','--name-only',base['store'],'--','pilots/map-rebuild-spike'],text=True).splitlines()
added=json.loads((r/'base-added-assets.json').read_text());changed=[name for name in changed if 'assets/'+name not in added]
assert changed==['pilots/map-rebuild-spike/landmarks/landmark-source-ledger.json'],changed
oldLedger=json.loads(subprocess.check_output(['git','-C',store,'show',base['store']+':'+changed[0]],text=True));newLedger=json.loads((Path(store)/changed[0]).read_text());assert newLedger['packs'].pop('motor-hauler');assert oldLedger==newLedger
import struct
pilot=Path('assets/pilots/map-rebuild-spike');c=json.loads((pilot/'landmarks/motor-hauler/motor-hauler-landmark-pack-contract.json').read_text())['assets']['motor-hauler'];data=(pilot/c['asset']).read_bytes();n=struct.unpack_from('<I',data,12)[0];g=json.loads(data[20:20+n]);tri=sum(g['accessors'][p.get('indices',p['attributes']['POSITION'])]['count']//3 for m in g['meshes'] for p in m['primitives']);assert tri==c['triangles'] and tri<=c['triangleBudget'];assert not g.get('textures');assert len(g['materials'])==5
(r/'invariants.json').write_text(json.dumps({'onlyVehicleBodyOwnerChanged':True,'movementFuelPathResetArrivalDiagnosticsByteExact':methods,'everyExistingMapAssetUnchanged':True,'simulationContractsCollisionWorldTestsPinUnchanged':True,'newAssetHasNoTexturesOrGameplayState':True,'actualGlbTriangles':tri,'triangleBudget':c['triangleBudget'],'budgetOrigin':'New authored body ceiling, no earlier shared Vehicle GLB budget found.'},indent=2)+'\n');print('MOTOR INVARIANTS PASS')
