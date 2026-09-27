"""Failure injection on the detached scratch copy; always restore exact original bytes."""
import hashlib, json, os, pathlib, subprocess
base = pathlib.Path(__file__).resolve().parent
root = base.parent.parent
arena = base / 'control-arena'
target = arena / 'scripts/gr-sim-campaign.test.mjs'
candidate = root / 'scripts/gr-sim-campaign.test.mjs'
original = target.read_bytes()
source = candidate.read_text()
original_hash = hashlib.sha256(original).hexdigest()
candidate_hash = hashlib.sha256(candidate.read_bytes()).hexdigest()
expected = {'first-helper': 'CONTROLLED_FIRST_HELPER', 'second-helper': 'CONTROLLED_SECOND_HELPER', 'resume-assertion': 'CONTROLLED_RESUME_ASSERTION', 'live-child': 'CONTROLLED_LIVE_CHILD', 'startup': 'spawn /nonexistent/campaign-cleanup-node ENOENT', 'early-exit': 'campaign exited 9 before its first checkpoint', 'contract-helper': 'CONTROLLED_CONTRACT_HELPER'}
results = []
env = dict(os.environ, PATH='/opt/homebrew/bin:' + os.environ['PATH'])
env.pop('NODE_TEST_CONTEXT', None)

def changed(part, old, new):
    assert old in part, old
    return part.replace(old, new, 1)

def helper_failure(name, statement):
    start = source.index('async function ' + name)
    return source[:start] + changed(source[start:], "  const output = join(dir, 'out');", statement + "\n  const output = join(dir, 'out');")

cases = [
    ('first-helper', 'campaign walks', helper_failure('runCampaign', "  assert.fail('CONTROLLED_FIRST_HELPER');")),
    ('second-helper', 'campaign walks', changed(helper_failure('runCampaign', "  if (++campaignRuns === 2) assert.fail('CONTROLLED_SECOND_HELPER');"), "const PLAYER =", "let campaignRuns = 0;\nconst PLAYER =")),
    ('resume-assertion', 'a killed campaign', changed(source, '  assert.equal(saved.campaign.legs.length, 1);', "  assert.fail('CONTROLLED_RESUME_ASSERTION');")),
    ('live-child', 'a killed campaign', changed(source, "  let buffer = '';", "  assert.fail('CONTROLLED_LIVE_CHILD');\n  let buffer = '';")),
    ('startup', 'a killed campaign', changed(source, 'child = spawn(process.execPath, [', "child = spawn('/nonexistent/campaign-cleanup-node', [")),
    ('early-exit', 'a killed campaign', changed(source, "child = spawn(process.execPath, [\n    'scripts/gr-sim-campaign.mjs'", "child = spawn(process.execPath, [\n    '--campaign-cleanup-invalid-option'")),
    ('contract-helper', '--contract selects', helper_failure('runContract', "  assert.fail('CONTROLLED_CONTRACT_HELPER');")),
]
try:
    for name, pattern, injected in cases:
        scratch = base / ('injection-' + name)
        scratch.mkdir(exist_ok=True)
        target.write_text(injected)
        command = ['/opt/homebrew/bin/node', '--test', '--test-reporter=spec', '--test-name-pattern=' + pattern, 'scripts/gr-sim-campaign.test.mjs']
        run = subprocess.run(command, cwd=arena, env=dict(env, TMPDIR=str(scratch)), capture_output=True, text=True)
        (base / ('injection-' + name + '.txt')).write_text(run.stdout + run.stderr)
        survivors = [p.name for p in scratch.iterdir() if p.name.startswith('gr-campaign-')]
        results.append(dict(name=name, command=command, exit=run.returncode, survivors=survivors))
        assert run.returncode != 0, (name, 'injection unexpectedly passed')
        assert expected[name] in run.stdout + run.stderr, (name, 'wrong failure fingerprint')
        assert not survivors, (name, survivors)
finally:
    target.write_bytes(original)
    restoration = dict(scratchBefore=original_hash, scratchAfter=hashlib.sha256(target.read_bytes()).hexdigest(), candidateBefore=candidate_hash, candidateAfter=hashlib.sha256(candidate.read_bytes()).hexdigest())
    (base / 'injection-results.json').write_text(json.dumps(dict(results=results, restoration=restoration), indent=2) + '\n')
    assert restoration['scratchBefore'] == restoration['scratchAfter']
    assert restoration['candidateBefore'] == restoration['candidateAfter']
print(json.dumps(results, indent=2))
