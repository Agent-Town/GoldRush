"""Offline contract checks: mock only external nginx/curl; use the real bash/node."""
from pathlib import Path
import os
import subprocess

root = Path(__file__).resolve().parents[2]
fixtures = Path(__file__).resolve().parent / 'fixtures'
fixtures.mkdir(exist_ok=True)
(fixtures / 'nginx').write_text('''#!/usr/bin/env python3
import os, sys
assert sys.argv[1:] == ['-t']
sys.exit(1 if os.environ['SCENARIO'] == 'nginx-fails' else 0)
''')
(fixtures / 'curl').write_text('''#!/usr/bin/env python3
import os, sys
args=sys.argv[1:]; url=args[-1]; scenario=os.environ['SCENARIO']
assert '--noproxy' in args and '--max-time' in args
if url.startswith('https://agenttown.app'):
    assert '--resolve' in args and 'agenttown.app:443:127.0.0.1' in args
assert not any(a in args for a in ['-L', '-k', '--insecure', '--location'])
if url.startswith('http://127.0.0.1'):
    assert 'Host: agenttown.app' in args
    print('HTTP/1.1 301 Moved\\r\\nLocation: https://agenttown.app/goldrush/\\r\\n')
    sys.exit(0)
if scenario=='network-fails': sys.exit(7)
head='-I' in args
if '/assets/' in url:
    assert url.endswith('/goldrush/assets/index-AbCd1234.js')
    mime='application/javascript'; body='export {}'; cache='public, max-age=31536000, immutable'
    if scenario=='cache-conflict': cache+=', no-cache'
    if scenario=='asset-html': mime='text/html'
elif url.endswith('/version.json'):
    mime='application/json'; cache='no-cache'
    build='abcdef123'
    if scenario=='build-mismatch' and 'pages.dev' in url: build='123456789'
    body='{"build":"'+build+'"}'
    if scenario=='bad-json': body='<html>fallback</html>'
elif url.endswith('/skill.md'):
    mime='text/html' if scenario=='skill-html' else 'text/markdown'; body='# Skill'; cache='no-cache'
elif url.endswith('/api/stats'):
    mime='application/json'; cache='no-cache'; body='{"ok":true,"players":3}'
    if scenario=='api-error': body='{"error":"broken"}'
else:
    assert url.endswith('/goldrush/')
    mime='text/html'; cache='no-cache'; body='<script src="./assets/index-AbCd1234.js"></script>'
    if scenario=='no-asset': body='<html>wrong landing</html>'
if head: print('HTTP/2 200\\r\\nContent-Type: '+mime+'\\r\\nCache-Control: '+cache+'\\r\\n')
else: print(body)
''')
for name in ('nginx', 'curl'):
    (fixtures / name).chmod(0o755)
scenarios = ['healthy', 'nginx-fails', 'network-fails', 'cache-conflict', 'asset-html',
             'build-mismatch', 'bad-json', 'skill-html', 'api-error', 'no-asset']
for scenario in scenarios:
    env = dict(os.environ, PATH=str(fixtures)+os.pathsep+os.environ['PATH'], SCENARIO=scenario)
    result = subprocess.run(['bash', str(root / 'ops/droplet/verify-goldrush-route.sh')],
                            env=env, capture_output=True, text=True, timeout=40)
    (fixtures / (scenario+'.log')).write_text(result.stdout+result.stderr)
    assert result.returncode == (0 if scenario=='healthy' else 1), (scenario, result)
    assert ('FAIL' in result.stdout) == (scenario!='healthy'), (scenario, result.stdout)
    if scenario=='healthy': assert result.stdout.count('| PASS')==7, result.stdout
    print(f'PASS {scenario}: exit {result.returncode}')
print(f'{len(scenarios)} verifier scenarios passed; no network or nginx process used.')
