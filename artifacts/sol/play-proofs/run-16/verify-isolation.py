"""Strip only the five-map additions and compare all original driver bytes."""
import pathlib, subprocess, hashlib, json
root=pathlib.Path(__file__).parent
base='a2e0e6f089c3fa90485cf7ee3dd89b7823e64330'
name='e2e/native-proofs/driver.ts'
original=subprocess.check_output(['git','show',f'{base}:{name}']).decode()
s=pathlib.Path(name).read_text()
current=s
s=s.replace("import showroomTerrain from '../../assets/pilots/map-rebuild-spike/showroom-terrain-contract.json' with { type: 'json' };\nimport { PICNIC_HOLD_RADIUS } from '../../src/systems/PicnicHoldSystem';\n\n",'')
s=s.replace("const zone = contract.id === 'e6-showroom' ? zones.find(z => z.id === 'model-home-village') : contract.id === 'e9-old-canal'", "const zone = contract.id === 'e9-old-canal'")
start=s.index("    if (row.contract === 'e6-picnic') {")
end=s.index('    if (now) for (const node',start)
s=s[:start]+s[end:]
start=s.index("    if (row.contract === 'e6-picnic' &&")
end=s.index("    await page.keyboard.press('Space');",start)
s=s[:start]+s[end:]
start=s.index('async function tapeDemonstration(')
end=s.index('async function motorStop(',start)
s=s[:start]+s[end:]
s='\n'.join(line for line in s.split('\n') if not any(marker in line for marker in ["if (contract.id === 'e6-showroom') { centre.x", "if (row.contract === 'e6-showroom') await", "if (contract.id === 'e6-showroom') await", "if (contract.id === 'e6-picnic') await", "if (contract.id === 'e6-picnic') return", "if (['e7-dead-band', 'e7-echo-canyon', 'e7-relay-rush'].includes(contract.id)) await"]))
receipt={'base':base,'path':name,'baseSha256':hashlib.sha256(original.encode()).hexdigest(),'currentSha256':hashlib.sha256(current.encode()).hexdigest(),'strippedByteIdentical':s==original}
(root/'driver-isolation.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
assert s==original
