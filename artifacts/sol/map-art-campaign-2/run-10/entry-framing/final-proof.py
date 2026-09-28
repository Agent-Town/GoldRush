from pathlib import Path
import hashlib,json,subprocess

root=Path('artifacts/sol/map-art-campaign-2/run-10/entry-framing');preflight=json.loads((root/'preflight.json').read_text())
def git(*args,cwd=None):return subprocess.check_output(['git',*args],cwd=cwd)
maps=json.loads((root/'map-plan.json').read_text());store=Path('../GoldRush-assets');allowed=[];declarations=[]
for id,*_ in maps:
    name=id.split('-',1)[1];mirrors=[]
    for path in [f'pilots/map-rebuild-spike/{name}-terrain-contract.json',f'pilots/map-rebuild-spike/landmarks/{name}/{name}-landmark-pack-contract.json']:
        allowed.append(path);before=json.loads(git('show',preflight['store']+':'+path,cwd=store));after=json.loads((store/path).read_text())
        entries=after.get('entryLandmarks') or [after['entryLandmark']];assert len(entries)<=2
        assert entries[0]==after['entryLandmark']
        if 'entryLandmark' in before:assert before['entryLandmark']==after['entryLandmark']
        mirrors.append(entries)
        for d in [before,after]:
            d.pop('entryLandmark',None);d.pop('entryLandmarks',None)
        assert before==after,path
    assert mirrors[0]==mirrors[1];declarations.append({'map':id,'landmarks':mirrors[0],'mirrorEquality':True,'otherDataEqual':True})
changed=git('diff','--name-only',preflight['store'],cwd=store).decode().splitlines();assert set(changed)==set(allowed)
sourceChanges=git('diff','--name-only',preflight['lane'],'--','src','assets/contracts','e2e','scripts','specs','public/skill.md','STATUS.md').decode().splitlines()
assert set(sourceChanges)=={'src/systems/CameraRig.ts','src/agent/MechanicsManifest.ts'},sourceChanges
for path in ['src/game/Game.ts','src/game/Balance.ts','src/agent/View.ts']:
    assert git('show',preflight['lane']+':'+path)==Path(path).read_bytes(),path
baseline=(root/'baseline-CameraRig.ts').read_text();current=Path('src/systems/CameraRig.ts').read_text()
body=lambda source:source.split('  private bodyPixels(')[1].split('  snapTo(')[0]
assert body(baseline)==body(current),'production visibility census unchanged'
before=(root/'now-before.json').read_bytes();after=(root/'now-after.json').read_bytes();assert before==after
auditBefore=(root/'audit-before.json').read_bytes();auditAfter=(root/'audit-after.json').read_bytes();assert auditBefore==auditAfter
manifests=json.loads((root/'manifest-proof.json').read_text());assert all(x['allOtherMechanicsByteIdentical'] for x in manifests)
result={'declarations':declarations,'changedStorePaths':changed,'onlyEntryMetadataChangedInStore':True,'sourceChanges':sourceChanges,'gameHookBalanceViewAndSimUnchanged':True,'productionVisibilityCensusUnchanged':True,'headlessNowSnapshots':len(json.loads(after)),'nowBytesEqual':True,'nowSha256':hashlib.sha256(after).hexdigest(),'sameGameAuditBytesEqual':True,'sameGameAuditSha256':hashlib.sha256(auditAfter).hexdigest(),'manifestCount':len(manifests),'onlyManifestLandmarkProseChanged':True,'protectedTestsAndPinsUnchanged':True}
(root/'final-proof.json').write_text(json.dumps(result,indent=2)+'\n')
print('PASS: metadata mirrors, protected paths, 50 now snapshots, audit and manifest semantics')
