"""Re-run selected existing assertions on exact base bytes, then restore the candidate."""
from pathlib import Path
import hashlib, json, os, subprocess, sys, time

name, base, store_base, label, pattern, *specs = sys.argv[1:]
store = Path("/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets")
root = Path('artifacts/sol/map-art-campaign-2')
out = root / 'run-8' / name
raw = root / '_raw/run-8' / (name + '-base-' + label)
raw.mkdir(parents=True, exist_ok=True)
env = {**os.environ, 'PATH': '/opt/homebrew/bin:' + os.environ['PATH'],
       'GR_CAPTURE_EXTERNAL_SERVER': '1', 'GR_CAPTURE_BASE_URL': 'http://127.0.0.1:5303'}
paths = subprocess.check_output(['git', 'diff', '--name-only', base, '--', 'src'], text=True).splitlines()
added_manifest = out / 'base-added-assets.json'
added_paths = json.loads(added_manifest.read_text()) if added_manifest.exists() else []
store_paths = subprocess.check_output(['git','-C',str(store),'diff','--name-only',store_base,'--','pilots/map-rebuild-spike'],text=True).splitlines()
paths += ['assets/'+p for p in store_paths if 'assets/'+p not in added_paths]
assert paths, 'No candidate files to attribute'
saved = {p: Path(p).read_bytes() for p in paths}
parked = {}
sha = lambda data: hashlib.sha256(data).hexdigest()
receipt = {'storeBase':store_base,'base': base, 'paths': {}, 'pattern': pattern, 'specs': specs}
def engine():
    return subprocess.check_output(['node', '--input-type=module', '-e', "import {computeEngineHash} from './scripts/assay-replay-agent.mjs'; console.log(await computeEngineHash(process.cwd()))"], env=env, text=True).strip()
receipt['candidateEngine'] = engine()
try:
    # New packs must also leave the engine inventory during an exact-base replay.
    # Keep their bytes in raw evidence and restore them even if the replay fails.
    for p in added_paths:
        assert p.startswith('assets/pilots/map-rebuild-spike/')
        absent = subprocess.run(['git', '-C', str(store), 'cat-file', '-e', f'{store_base}:{p[7:]}'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        assert absent.returncode != 0, p
        destination = raw / 'added-assets' / p
        destination.parent.mkdir(parents=True, exist_ok=True)
        assert not destination.exists(), destination
        parked[p] = {'path': destination, 'sha256': sha(Path(p).read_bytes())}
        Path(p).rename(destination)
    for p, data in saved.items():
        backup = raw / p
        backup.parent.mkdir(parents=True, exist_ok=True)
        backup.write_bytes(data)
        original = subprocess.check_output(['git','-C',str(store),'show',f'{store_base}:{p[7:]}']) if p.startswith('assets/pilots/') else subprocess.check_output(['git','show',f'{base}:{p}'])
        receipt['paths'][p] = {'candidateSha256': sha(data), 'baseSha256': sha(original)}
        Path(p).write_bytes(original)
    receipt['baseEngine'] = engine()
    if specs == ['--e1-build']:
        command = ['npm', 'run', 'build:release']
        env = {**env, 'GR_RELEASE': 'e1'}
    else:
        command = ['npx', 'playwright', 'test', '--workers=1', '--project=desktop-chrome', '--project=mobile-chrome',
                   '--trace=off', '--reporter=line', '--output=' + str(raw / 'test-results'), '--grep', pattern, *specs]
    receipt['command'] = command
    with (raw / 'tests.log').open('w') as log:
        receipt['exit'] = subprocess.run(command, env=env, stdout=log, stderr=subprocess.STDOUT, timeout=1800).returncode
finally:
    for p, data in saved.items():
        Path(p).write_bytes(data)
        assert Path(p).read_bytes() == data
    for p, record in parked.items():
        record['path'].rename(p)
        assert sha(Path(p).read_bytes()) == record['sha256']
    receipt['newAssetsAbsentDuringBase'] = {p: record['sha256'] for p, record in parked.items()}
    receipt['restoredEngine'] = engine()
    receipt['candidateRestoredExactly'] = receipt['restoredEngine'] == receipt['candidateEngine']
    receipt['log'] = str(raw / 'tests.log')
    (out / ('base-' + label + '.json')).write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt, indent=2))
