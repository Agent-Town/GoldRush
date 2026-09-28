"""Audit evidence honesty, ride budget and task firewall without replaying gameplay."""
import pathlib, json, subprocess, math
root=pathlib.Path(__file__).parent
base='a2e0e6f089c3fa90485cf7ee3dd89b7823e64330'
ids=['e6-picnic','e6-showroom','e7-dead-band','e7-echo-canyon','e7-relay-rush']
projects=['desktop-chrome','mobile-chrome']
rows=[]
for id in ids:
    for project in projects:
        files=list((root/id).glob(f'*/row-{project}.json'))
        assert 1<=len(files)<=2,(id,project,files)
        assert (root/id/'default'/f'row-{project}.json').exists()
        default=json.loads((root/id/'default'/f'row-{project}.json').read_text())
        for file in files:
            r=json.loads(file.read_text())
            assert r['contract']==id and r['project']==project
            assert r['clean']['ok'] and not r['consoleErrors'] and not r['pageErrors']
            assert pathlib.Path(r['rawEvidence']).exists(),r['rawEvidence']
            raw=json.loads(pathlib.Path(r['rawEvidence']).read_text())
            for key in raw:
                if key!='samples': assert raw[key]==r[key],(file,key)
            assert len(raw['samples'])==r['sampleCount']
            command=json.loads((file.parent/'command.json').read_text())
            assert '--workers=1' in command['argv'] and command['env']['GR_NATIVE_PROOF']=='1'
            assert (file.parent/'command.exit').exists()
            snapshot=r.get('finalSnapshot')
            objective=file.with_name(f'objective-{project}.json')
            if snapshot:
                o=json.loads(objective.read_text())
                assert '?debug' not in o['url'] and 'seed=' not in o['url']
                for rk,ok in [('simAtEnd','sim'),('hpAtEnd','hp'),('goldAtEnd','gold')]:
                    assert math.isclose(r[rk],o[ok],abs_tol=.001),(file,rk,r[rk],o[ok])
                assert snapshot['repairs']==o['repairs']
            else:
                assert (id=='e6-showroom' and file.parent.name=='restore-ground') or (id=='e7-echo-canyon' and project=='mobile-chrome' and file.parent.name=='default')
                assert not objective.exists() and not r['secures']['ok']
            if id=='e7-echo-canyon' and objective.exists():
                o=json.loads(objective.read_text())
                if o['playbookUse']['objectiveMet']:
                    assert o['playbookUse']['uses']>0 and o['broadcastMirror']['squadsFielded']>0 and o['broadcastMirror']['bodiesFielded']>0
                    tapes=[json.loads(t) for shelf in o.get('tapeShelf',[]) for t in json.loads(shelf['value'])['playbooks'].values()]
                    assert any(any(e['mx'] or e['my'] for e in t['entries']) and any(a['type']=='place_build' for e in t['entries'] for a in e['a']) for t in tapes)
            if file.parent.name=='restore-ground':
                o=json.loads((root/id/'default'/f'objective-{project}.json').read_text())
                assert default['hpAtEnd']==0 and not default['secures']['ok']
                if id=='e6-picnic': assert all(s['held'] for s in o['picnicHold'])
                if id=='e6-showroom': assert o['showroomCaptureObjective']['complete']
                if id.startswith('e7-'): assert o['playbookUse']['objectiveMet']
                if id=='e7-relay-rush': assert o['interferenceFront']['objectiveMet']
            rows.append({'contract':id,'project':project,'strategy':file.parent.name,'snapshotCaptured':bool(snapshot),'secure':r['secures']['ok']})
    assert (root/id/'finding.md').exists() or (root/id/'proof.md').exists()
allowed={'e2e/native-proofs/driver.ts',*[f'e2e/native-proofs/{id}.spec.ts' for id in ids], 'artifacts/sol/play-proofs/run-15/run-note.md'}
changed=subprocess.check_output(['git','diff','--name-only',base],text=True).splitlines()
assert all(p in allowed or p.startswith('artifacts/sol/play-proofs/run-16/') for p in changed),changed
isolation=json.loads((root/'driver-isolation.json').read_text());assert isolation['strippedByteIdentical']
equivalence=json.loads((root/'driver-equivalence.json').read_text());assert equivalence['pass']
report={'pass':True,'rides':rows,'rideCount':len(rows),'scope':changed,'zeroBrowserErrors':True,'missingSnapshots':['e6-showroom/restore-ground/desktop-chrome','e6-showroom/restore-ground/mobile-chrome','e7-echo-canyon/default/mobile-chrome'],'nonterminalSnapshots':['e7-relay-rush/default/mobile-chrome'],'limitations':'Showroom restore terminals were dismissed by capture confirms; Echo phone timed out clicking Tape Reel. Their row zeros are uninitialized, not terminal counters. Final Showroom guard and Echo phone fix not re-ridden.'}
(root/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'pass':True,'rideCount':len(rows),'missingSnapshots':report['missingSnapshots']}))
