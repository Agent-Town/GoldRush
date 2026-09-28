"""Restore test PNG churn; retain every untracked generated image in raw evidence."""
from pathlib import Path
import subprocess,json,sys
name=sys.argv[1];owned='artifacts/sol/map-art-campaign-2/run-9/';raw=Path('artifacts/sol/map-art-campaign-2/_raw/run-9')/(name+'-test-churn')
def paths(cmd):return [p for p in subprocess.check_output(['git',*cmd]).decode().split('\0') if p]
def churn(p):return not p.startswith(owned) and p.endswith('.png') and (p.startswith('artifacts/') or p.startswith('reviews/shots-'))
tracked=[p for p in paths(['diff','--name-only','-z']) if churn(p)]
if tracked:subprocess.run(['git','restore','--',*tracked],check=True)
moved=[]
for p in paths(['ls-files','--others','--exclude-standard','-z']):
 if churn(p):
  target=raw/p;target.parent.mkdir(parents=True,exist_ok=True);assert not target.exists(),target;Path(p).rename(target);moved.append({'from':p,'retainedAt':str(target)})
(Path(owned)/name/'evidence-churn.json').write_text(json.dumps({'restoredTrackedPngs':tracked,'retainedGeneratedUntrackedPngs':moved,'initialAllowedFactoryChurn':['logs/guard-stats.jsonl']},indent=2)+'\n');print(len(tracked),'tracked PNGs restored;',len(moved),'untracked PNGs retained')
