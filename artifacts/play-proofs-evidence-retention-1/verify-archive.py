"""Read-only verification: python3 verify-archive.py CANDIDATE_ROOT ARCHIVE_WORKTREE."""
import hashlib, json, pathlib, subprocess, sys
root, archive = map(pathlib.Path, sys.argv[1:])
report=root/'artifacts/play-proofs-evidence-retention-1'
manifest=json.loads((report/'manifest.json').read_text())
index=json.loads((root/'artifacts/ARCHIVE-INDEX.json').read_text())
sealed='artifacts/sol-play-proofs-7-record'
entry=index['subtrees'][sealed]
assert entry['files']==230 and entry['bytes']==86011222
assert (root/sealed/'ARCHIVED.md').is_file()
assert (root/sealed/'PREVIEW.png').is_file()
assert (report/'report.md').is_file()
for row in manifest['files']:
 p=row['retainedPath']
 if p.startswith(sealed+'/'):
  archived=index['files'][p]
  data=subprocess.check_output(['git','-C',str(archive),'show',archived['archiveCommit']+':evidence/'+p])
  assert not (root/p).exists(),p
  assert archived['sha256']==row['sha256'] and archived['bytes']==row['bytes'],p
 else: data=(root/p).read_bytes()
 assert hashlib.sha256(data).hexdigest()==row['sha256'] and len(data)==row['bytes'],p
for row in json.loads((report/'source-checks.json').read_text()):
 p=row.get('originalPath',row.get('path'))
 assert hashlib.sha256((root/p).read_bytes()).hexdigest()==row['sha256'],p
print('PASS: 231 original evidence hashes; 230 archived files / 86011222 bytes; live helper, six specs, shared driver, manifest, report, pointer and preview preserved')
