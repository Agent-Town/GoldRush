"""Audit measured rides, frozen counters, artifact scope and the authorized ride ceiling."""
import json, subprocess
from pathlib import Path
root=Path(__file__).parent
base='cabbffa32f64fcbcbca4d5233952a7a04d92cc3b'
measurements=[]
for rowfile in sorted(root.glob('e*/*/row-*.json')):
    row=json.loads(rowfile.read_text())
    snapshot=row['finalSnapshot']
    objective=json.loads(rowfile.with_name(rowfile.name.replace('row-','objective-')).read_text())
    assert row['consoleErrors']==[] and row['pageErrors']==[] and row['clean']['ok']
    assert row['boots']['ok']
    assert '?debug' not in objective['url'] and 'seed=' not in objective['url'] and 'debug=' not in objective['url']
    assert row['simAtEnd']==snapshot['sim'] and row['hpAtEnd']==snapshot['hp'] and row['goldAtEnd']==snapshot['gold']
    if 'sim' in objective:
        assert abs(row['simAtEnd']-objective['sim']) < 0.001
        assert row['hpAtEnd']==objective['hp'] and row['goldAtEnd']==objective['gold']
        assert snapshot['repairs']==objective['repairs']
    raw=json.loads(Path(row['rawEvidence']).read_text())
    assert all(row[k]==raw[k] for k in ['finalSnapshot','secures','banks','board','reload','consoleErrors','pageErrors'])
    for key,shot in [('secures','terminal'),('board','board'),('banks','bank-cell')]:
        if row[key]['ok']:
            assert rowfile.with_name(f'{shot}-{row["project"]}.jpg').is_file()
    assert rowfile.with_name(f'terminal-{row["project"]}.jpg').is_file() or rowfile.parent.name=='default' and rowfile.parents[1].name=='e6-glow-mesa'
    measurements.append({'contract':row['contract'],'project':row['project'],'strategy':rowfile.parent.name,'wave':row['peakWave'],'simSeconds':row['simAtEnd'],'hp':row['hpAtEnd'],'purse':row['goldAtEnd'],'repairs':snapshot['repairs'],'standing':sum(not b['wrecked'] and b['hp']>0 for b in snapshot['defences']),'total':len(snapshot['defences']),'builds':len(row['builds']),'secures':row['secures']['ok'],'banks':row['banks']['ok'],'book':row['board']['ok'],'reload':row['reload']['ok'],'consoleErrors':0,'pageErrors':0,'row':str(rowfile.relative_to(root))})
for id in ['e4-long-road','e5-deepwater-claim','e6-glow-mesa']:
    for project in ['desktop-chrome','mobile-chrome']:
        rides=[r for r in measurements if r['contract']==id and r['project']==project]
        assert 1<=len(rides)<=2
        assert any(r['strategy']=='default' for r in rides)
        if len(rides)==2:
            first=next(r for r in rides if r['strategy']=='default')
            assert first['hp']==0 and not first['secures']
            assert any(r['strategy']=='restore-ground' for r in rides)
assert json.loads((root/'driver-equivalence.json').read_text())['pass']
for note in [root/'run-note.md',root.parent/'run-14/run-note.md']:
    table=note.read_text().split('| Map | Campaign verdict | Deciding run | Finding / evidence |',1)[1].split('\n## ',1)[0]
    rows=[line for line in table.splitlines() if line.startswith('| ') and not line.startswith('| ---')]
    assert len(rows)==42 and len({line.split('|')[1].strip() for line in rows})==42
paths=sorted(set(subprocess.check_output(['git','diff','--name-only',base],text=True).splitlines() + subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines()))
allowed={'e2e/native-proofs/driver.ts',*[f'e2e/native-proofs/{id}.spec.ts' for id in ['e4-long-road','e5-deepwater-claim','e6-glow-mesa']],'artifacts/sol/play-proofs/run-14/run-note.md'}
assert all(p in allowed or p.startswith('artifacts/sol/play-proofs/run-15/') for p in paths), paths
assert all(int((root/file).read_text())==0 for file in ['tsc-final.exit','build-final.exit','task-guards.exit','task-guards-main.exit'])
(root/'measurements.json').write_text(json.dumps(measurements,indent=2)+'\n')
result={'pass':True,'rides':len(measurements),'scope':paths,'qualification':'Verifies recorded measurements and applicable screenshots, not gameplay success on held maps. Deepwater deck-expansion follow-up has no additional ride.'}
(root/'verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
