#!/usr/bin/env python3
"""Re-point cited commit ids after the F-2742-1 re-land (the A3 precedent, 04d88f868).
Usage: repoint-ids.py <commit-map> [--apply] [--files <list>]  (--files: only these paths, e.g. a grep -lF pre-filter of the changed 7-char prefixes)
Reads filter-repo's commit-map (old new per line), then for every tracked text file under the ledger surfaces
replaces each OLD id (full 40-char and every prefix of 7 to 12 chars that appears as a whole token) with the NEW id
of the same length. Reports counts per file; writes only with --apply. Never touches artifacts/**/*.zip|png|jpg or logs/.
"""
import os, re, subprocess, sys
os.chdir('/Users/robin/Claude/Projects/Gold Rush')
cm = sys.argv[1]; apply = '--apply' in sys.argv
pairs = [l.split() for l in open(cm, encoding='utf-8') if l.strip() and not l.startswith('old')]
pairs = [(o, n) for o, n in pairs if o != n and len(o) == 40 and len(n) == 40]
if not pairs: print('no changed ids in the map'); sys.exit(0)
# tracked text surfaces that cite commit ids
if '--files' in sys.argv:
    paths = [l.rstrip('\n') for l in open(sys.argv[sys.argv.index('--files') + 1], encoding='utf-8')]
else:
    paths = subprocess.check_output(['git', 'ls-files', 'tasks', 'docs', 'reviews', 'STATUS.md', 'archive/status', 'scripts/attended/landings', 'artifacts', 'logs/runs-archive'], text=True).split('\n')
paths = [p for p in paths if p and re.search(r'\.(md|json|txt|jsonl|log|html|cjs|mjs|sh)$', p) and not p.startswith('logs/')]
by_prefix = {}
for o, n in pairs:
    for L in range(7, 13): by_prefix.setdefault(o[:L], n[:L])
    by_prefix[o] = n
rx = re.compile(r'(?<![0-9a-f])(' + '|'.join(sorted(map(re.escape, by_prefix), key=len, reverse=True)) + r')(?![0-9a-f])')
total = 0; touched = []
for p in paths:
    try: s = open(p, encoding='utf-8').read()
    except (UnicodeDecodeError, FileNotFoundError): continue
    new, n = rx.subn(lambda m: by_prefix[m.group(1)], s)
    if n:
        total += n; touched.append((p, n))
        if apply: open(p, 'w', encoding='utf-8').write(new)
print(('APPLIED' if apply else 'DRY RUN') + f': {total} citations in {len(touched)} files')
for p, n in touched[:40]: print(f'  {n:4d}  {p}')
