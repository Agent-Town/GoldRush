"""The sole driver delta must be the Regatta-only movement helper and its call."""
import hashlib, json, subprocess
from pathlib import Path
base = '1168df70bd8980049fa11c2fb4bb59f50b9e24d3'
p = 'e2e/native-proofs/driver.ts'
old = subprocess.check_output(['git','show',f'{base}:{p}'], text=True)
new = Path(p).read_text()
start = new.index('// Regatta alone needs a helmed course:')
end = new.index('type KitPiece =', start)
helper = new[start:end]
call = "        if (contract.id === 'e5-regatta') await regattaJourney(page, row, contract, deadline);\n"
assert new.count(call) == 1
assert new[:start] + new[end:].replace(call, '') == old
assert '__GR_TEST__' not in helper and 'teleport' not in helper
result = dict(pass_=True, base=base, unchangedOutside='Regatta movement helper and id-guarded invocation', baseSHA256=hashlib.sha256(old.encode()).hexdigest(), driverSHA256=hashlib.sha256(new.encode()).hexdigest())
Path(__file__).with_name('driver-equivalence.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
