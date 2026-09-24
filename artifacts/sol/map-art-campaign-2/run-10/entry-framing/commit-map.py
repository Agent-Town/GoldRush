from pathlib import Path
import json,subprocess,sys

id=sys.argv[1];name=id.split('-',1)[1];root=Path('artifacts/sol/map-art-campaign-2/run-10/entry-framing');out=root/id
def run(args,cwd=None):return subprocess.check_output(args,cwd=cwd,text=True).strip()
store=Path('../GoldRush-assets')
paths=[f'pilots/map-rebuild-spike/{name}-terrain-contract.json',f'pilots/map-rebuild-spike/landmarks/{name}/{name}-landmark-pack-contract.json']
changed=run(['git','diff','--name-only'],store).splitlines();assert set(changed)<=set(paths),changed
assert (out/'review.md').exists()
if changed:
    run(['git','add','--',*paths],store)
    run(['git','commit','-m',f'art(store): {id} — declare entry landmarks'],store)
    run(['git','push','-u','origin','astra/entry-framing-2'],store)
storehead=run(['git','rev-parse','HEAD'],store)
(out/'store-commit.json').write_text(json.dumps({'commit':storehead,'branch':'astra/entry-framing-2','pushed':True,'paths':paths},indent=2)+'\n')
run(['git','add','--','src/systems/CameraRig.ts','src/agent/MechanicsManifest.ts','reviews/sol-map-art-current-status-20260909.md','artifacts/sol/map-art-campaign-2/report.md',str(root)])
allowed=['src/systems/CameraRig.ts','src/agent/MechanicsManifest.ts','reviews/sol-map-art-current-status-20260909.md','artifacts/sol/map-art-campaign-2/report.md']
staged=run(['git','diff','--cached','--name-only']).splitlines()
assert all(x in allowed or x.startswith(str(root)+'/') for x in staged),staged
run(['git','diff','--cached','--check','--','src/systems/CameraRig.ts','src/agent/MechanicsManifest.ts','reviews/sol-map-art-current-status-20260909.md'])
print(run(['git','commit','-m',f'feat: frame {id} entry landmarks', '-m','READY-FOR-GATES: per-map measurements, preserved holds and existing-test results are recorded in the run-10 entry review. Shared closing parity and release checks follow the six-map slice.']))
print('lane',run(['git','rev-parse','HEAD']),'store',storehead)
