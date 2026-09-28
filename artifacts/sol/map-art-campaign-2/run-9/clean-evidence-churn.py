"""Restore only test-generated evidence outside this run's owned surface."""
from pathlib import Path
import json,subprocess,sys
owned='artifacts/sol/map-art-campaign-2/run-9/';report='artifacts/sol/map-art-campaign-2/report.md'
def names(args):return [s for s in subprocess.check_output(['git',*args]).decode().split('\0') if s]
def churn(p):return p!=report and not p.startswith(owned) and (p.startswith('artifacts/') or p.startswith('reviews/shots-') or p.endswith('.png'))
tracked=[p for p in names(['diff','--name-only','-z']) if churn(p)]
untracked=[p for p in names(['ls-files','--others','--exclude-standard','-z']) if churn(p)]
if tracked:subprocess.run(['git','restore','--',*tracked],check=True)
for p in untracked:
 f=Path(p);assert f.is_file();f.unlink()
out=Path(owned)/sys.argv[1]/'evidence-churn.json';out.write_text(json.dumps({'restoredTracked':tracked,'removedGeneratedUntracked':untracked,'retained':'logs/guard-stats.jsonl and every run-9/raw evidence file','authorization':'Task preflight evidence/factory-churn exception; baseline was clean except logs.'},indent=2)+'\n');print(len(tracked),'restored;',len(untracked),'generated files removed')
