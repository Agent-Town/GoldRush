from pathlib import Path
import json, subprocess
root=Path('artifacts/sol/map-art-campaign-2/run-8/entry-framing')
base='ba330ec92f4bbd644f540184f5e9c88da133275e';storeBase='adf6bd1a22582459e64c2ddc1a37b1bd707ffa14';store=Path('../GoldRush-assets')
allowed={'src/systems/CameraRig.ts','src/game/Game.ts','src/agent/MechanicsManifest.ts','public/skill.md','reviews/sol-map-art-current-status-20260909.md','artifacts/sol/map-art-campaign-2/report.md'}
paths=subprocess.check_output(['git','diff','--name-only',base],text=True).splitlines()
assert all(p in allowed or p.startswith(str(root)+'/') for p in paths),[p for p in paths if p not in allowed and not p.startswith(str(root)+'/')]
num=subprocess.check_output(['git','diff','--numstat',base,'--','src/game/Game.ts'],text=True).split();assert num[:2]==['6','0']
storePaths=subprocess.check_output(['git','-C',str(store),'diff','--name-only',storeBase],text=True).splitlines();assert len(storePaths)==6
for rel in storePaths:
 assert rel.endswith('-contract.json')
 a=json.loads(subprocess.check_output(['git','-C',str(store),'show',storeBase+':'+rel],text=True));b=json.loads((store/rel).read_text());entry=b.pop('entryLandmark');assert set(entry)=={'mountId','reason'};assert a==b
assert not subprocess.check_output(['git','-C',str(store),'status','--porcelain'],text=True)
report={'baseCode':base,'sourcePaths':[p for p in paths if p.startswith('src/') or p=='public/skill.md'],'gameHookAddedLines':6,'gameHookRemovedLines':0,'allCodePathsAuthorized':True,'storeBase':storeBase,'changedStorePaths':storePaths,'onlyEntryMetadataChanged':True,'allGlbTextureBlendBytesUnchanged':True,'balanceHeroStartSimViewSchemaTestsPinsUnchanged':True,'storeClean':True}
(root/'scope-proof.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
