"""The same failing assertion leaks on the original source and cleans up on the fix."""
import hashlib, json, os, pathlib, subprocess
base = pathlib.Path(__file__).resolve().parent
arena = base / 'control-arena'
target = arena / 'scripts/gr-sim-campaign.test.mjs'
original = target.read_bytes()
original_hash = hashlib.sha256(original).hexdigest()
candidate = (base.parent.parent / 'scripts/gr-sim-campaign.test.mjs').read_bytes()
results = []
env = dict(os.environ, PATH='/opt/homebrew/bin:' + os.environ['PATH'])
env.pop('NODE_TEST_CONTEXT', None)
try:
    for name, source, expected in [('before', original, 1), ('after', candidate, 0)]:
        anchor = "  const checkpoint = join(dir, 'checkpoint.json');"
        text = source.decode()
        assert text.count(anchor) == 1
        target.write_text(text.replace(anchor, anchor + "\n  assert.fail('CONTROLLED_SAME_ASSERTION');"))
        scratch = base / ('same-assertion-' + name)
        scratch.mkdir()
        command = ['/opt/homebrew/bin/node', '--test', '--test-reporter=spec', '--test-name-pattern=a killed campaign', 'scripts/gr-sim-campaign.test.mjs']
        run = subprocess.run(command, cwd=arena, env=dict(env, TMPDIR=str(scratch)), capture_output=True, text=True)
        (base / ('same-assertion-' + name + '.txt')).write_text(run.stdout + run.stderr)
        survivors = [p.name for p in scratch.iterdir() if p.name.startswith('gr-campaign-resume-')]
        results.append(dict(source=name, command=command, exit=run.returncode, survivors=survivors))
        assert run.returncode != 0 and 'CONTROLLED_SAME_ASSERTION' in run.stdout + run.stderr
        assert len(survivors) == expected
finally:
    target.write_bytes(original)
    restored_hash = hashlib.sha256(target.read_bytes()).hexdigest()
    (base / 'same-assertion-results.json').write_text(json.dumps(dict(results=results, originalSha256=original_hash, restoredSha256=restored_hash), indent=2) + '\n')
    assert original_hash == restored_hash
print(json.dumps(results, indent=2))
