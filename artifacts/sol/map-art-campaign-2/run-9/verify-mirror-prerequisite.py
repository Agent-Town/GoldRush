"""Verify the unmodified mirror assertion in an isolated tree with proposed filters.
Never edits production scripts. Original-tree failure remains a held prerequisite.
"""
from pathlib import Path
import difflib,hashlib,json,os,subprocess,tempfile,sys
root=Path.cwd();out=root/'artifacts/sol/map-art-campaign-2/run-9';raw=root/'artifacts/sol/map-art-campaign-2/_raw/run-9'
map_name=sys.argv[1] if len(sys.argv)>1 else None
proof_out=out/map_name if map_name else out
original=(root/'scripts/deploy.sh').read_text()
main=subprocess.check_output(['git','rev-parse','main'],text=True).strip()
proposed=subprocess.check_output(['git','show',main+':scripts/deploy.sh'],text=True)
assert 'map-rebuild-spike/sources/**.png' in proposed and 'map-rebuild-spike/sources/**.json' in proposed
(out/'mirror-prerequisite-from-main.patch').write_text(''.join(difflib.unified_diff(original.splitlines(keepends=True),proposed.splitlines(keepends=True),fromfile='a/scripts/deploy.sh',tofile='b/scripts/deploy.sh')))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();receipt={'originalDeploySha256':sha(root/'scripts/deploy.sh'),'originalTestSha256':sha(root/'scripts/deploy-mirror-allowlist.test.mjs'),'productionScriptEdited':False,'testAssertionsChanged':False,'canonicalMain':main,'requiredMainCommits':['214a54568','82c226185'],'scope':'Exact current-main deploy script in isolated test tree; original lane script remains untouched. The main branch already carries the required F-FID1-5/F-FID1-8 includes.'}
with tempfile.TemporaryDirectory(prefix='gr9-mirror-proposal-') as t:
 clone=Path(t)
 for item in root.iterdir():
  if not item.name.startswith('.') and item.name!='scripts':(clone/item.name).symlink_to(item.resolve(),target_is_directory=item.is_dir())
 (clone/'scripts').mkdir()
 for item in (root/'scripts').iterdir():
  if item.name not in ['deploy.sh','deploy-mirror-allowlist.test.mjs']:(clone/'scripts'/item.name).symlink_to(item.resolve(),target_is_directory=item.is_dir())
 (clone/'scripts/deploy.sh').write_text(proposed)
 (clone/'scripts/deploy-mirror-allowlist.test.mjs').write_bytes((root/'scripts/deploy-mirror-allowlist.test.mjs').read_bytes())
 assert sha(clone/'scripts/deploy-mirror-allowlist.test.mjs')==receipt['originalTestSha256']
 env={**os.environ,'PATH':'/opt/homebrew/bin:'+os.environ['PATH']}
 log=raw/(f'mirror-{map_name}-current-main-filters.log' if map_name else 'mirror-current-main-filters.log')
 with log.open('w') as f:receipt['currentMainFilterTestExit']=subprocess.run(['node','--test','scripts/deploy-mirror-allowlist.test.mjs'],cwd=clone,env=env,stdout=f,stderr=subprocess.STDOUT).returncode
receipt['log']=str(log.relative_to(root));assert sha(root/'scripts/deploy.sh')==receipt['originalDeploySha256'];(proof_out/'mirror-prerequisite-proof.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2));assert receipt['currentMainFilterTestExit']==0
