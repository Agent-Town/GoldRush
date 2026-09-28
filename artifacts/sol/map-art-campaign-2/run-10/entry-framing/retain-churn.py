from pathlib import Path
import subprocess,json,shutil,sys
root=Path('artifacts/sol/map-art-campaign-2/run-10/entry-framing');out=root/sys.argv[1]/'test-evidence-churn';out.mkdir(parents=True,exist_ok=True)
paths=subprocess.check_output(['git','diff','--name-only'],text=True).splitlines();saved=[]
for path in paths:
    if path.startswith('artifacts/') and not path.startswith('artifacts/sol/map-art-campaign-2/'):
        target=out/path;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,target)
        subprocess.run(['git','restore','--',path],check=True);saved.append(path)
(out/'receipt.json').write_text(json.dumps({'regeneratedEvidenceRetainedThenRestored':saved},indent=2)+'\n')
