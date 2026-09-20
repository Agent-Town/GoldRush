from pathlib import Path
from datetime import datetime,timezone
import subprocess,shutil,json,hashlib
ROOT=Path.cwd();HERE=ROOT/'artifacts/boss-fidelity/e6-homemaker';OUT=HERE/'bundle-preview-v12';PROJECT=OUT/'project'
assert not PROJECT.exists(),'Keep existing preview inputs immutable; choose a new output directory.'
PROJECT.mkdir(parents=True)
for name in ['src','assets','public','scripts','e2e','functions','lore','news','site','server']:
 if (ROOT/name).exists():subprocess.run(['/bin/cp','-cR',str(ROOT/name),str(PROJECT/name)],check=True)
for name in ['package.json','package-lock.json','tsconfig.json','vite.config.ts','playwright.config.ts','playwright.preview.config.ts','index.html']:
 shutil.copy2(ROOT/name,PROJECT/name)
for name in ['artifacts/sol/mp-balance-harness/first-report.json','artifacts/shared-atlas-dedupe/browser-harness.ts']:
 if (ROOT/name).exists():
  (PROJECT/name).parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/name,PROJECT/name)
(PROJECT/'node_modules').symlink_to((ROOT/'node_modules').resolve(),target_is_directory=True)
model=Path('assets/pilots/homemaker-9000-3d/homemaker-9000.glb')
assert (ROOT/model).stat().st_ino!=(PROJECT/model).stat().st_ino,'Do not mutate hard-linked source files.'
shutil.copy2(HERE/'candidate-runtime/HomemakerBossSystem.ts',PROJECT/'src/systems/HomemakerBossSystem.ts')
game=(PROJECT/'src/game/Game.ts').read_text();sync='this.dredgeQueenBoss.syncRenderPresentation();';bounds='this.dredgeQueenBoss.modelBounds(groupId)';assert game.count(sync)==1 and game.count(bounds)==1
game=game.replace(sync,sync+'\n    this.homemakerBoss.syncRenderPresentation();').replace(bounds,bounds+' ?? this.homemakerBoss.modelBounds(groupId)');(PROJECT/'src/game/Game.ts').write_text(game)
for name in ['homemaker-9000.glb','homemaker-9000.blend']:
 shutil.copy2(HERE/'candidate-model'/name,PROJECT/'assets/pilots/homemaker-9000-3d'/name)
builder=(HERE/'candidate-model/build_homemaker_9000.py').read_text().replace('HERE.parent / "candidate-material/atlas-silver-v5.png"','ROOT / "assets/raw/homemaker-atlas-fidelity-e6.png"');(PROJECT/'assets/pilots/homemaker-9000-3d/build_homemaker_9000.py').write_text(builder)
shutil.copy2(HERE/'candidate-material/atlas-silver-v5.png',PROJECT/'assets/raw/homemaker-atlas-fidelity-e6.png')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
inputs={str(p.relative_to(PROJECT)):sha(p) for base in ['src','assets','scripts','functions','lore','public'] for p in (PROJECT/base).rglob('*') if p.is_file()}
inputs.update({name:sha(PROJECT/name) for name in ['package.json','package-lock.json','tsconfig.json','vite.config.ts','index.html']})
(OUT/'inputs-sha256.json').write_text(json.dumps(inputs,indent=2)+'\n')
(OUT/'preparation.json').write_text(json.dumps({'at':datetime.now(timezone.utc).isoformat(),'scope':'Isolated APFS clone with intended E6 source/model/atlas changes. Original E5 production inputs untouched. Full development-variant production bundle build; not E1 release or production adoption.','project':str(PROJECT),'filesHashed':len(inputs),'assetSha256':sha(PROJECT/model)},indent=2)+'\n')
print(PROJECT)
