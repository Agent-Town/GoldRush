"""Strip only the three authorized correctives; all other driver bytes must match base."""
import hashlib, json, subprocess
from pathlib import Path
base = 'cabbffa32f64fcbcbca4d5233952a7a04d92cc3b'
p = 'e2e/native-proofs/driver.ts'
old = subprocess.check_output(['git', 'show', f'{base}:{p}'], text=True)
new = Path(p).read_text()
stripped = new
# The shared motor helper keeps its original body except for the Long Road guards.
a = stripped.index('  const contract = BOARD_CONTRACTS.find', stripped.index('async function motorOpening'))
b = stripped.index('  const initial = await read(page);', a)
stripped = stripped[:a] + stripped[b:]
a = stripped.index('  if (road) {', stripped.index('async function motorOpening'))
b = stripped.index("  if (row.contract === 'e4-boneyard')", a)
stripped = stripped[:a] + stripped[b:]
a = stripped.index('async function deepwaterJourney')
b = stripped.index('// Regatta alone', a)
helper = stripped[a:b]
assert '__GR_TEST__' not in helper
stripped = stripped[:a] + stripped[b:]
for line in ["        if (contract.id === 'e4-long-road') await motorOpening(page, row);\n", "        if (contract.id === 'e5-deepwater-claim') await deepwaterJourney(page, row, contract, deadline);\n"]:
    assert stripped.count(line) == 1
    stripped = stripped.replace(line, '')
stripped = stripped.replace("const kit = contract.id === 'e5-deepwater-claim' ? [] : kitFor(contract);", 'const kit = kitFor(contract);')
stripped = stripped.replace("\n          if (contract.id === 'e5-deepwater-claim') {\n            await page.waitForTimeout(200);\n            continue;\n          }\n", '')
stripped = stripped.replace('            // This branch already observed Claim Secured. Authored boss endings can\n            // finish before secureWave; require a fresh secured score, not a later wave.\n', '')
stripped = stripped.replace('score.secured === true);', 'score.secured === true && (score.waves ?? 0) >= secureWave);')
stripped = stripped.replace('after Claim Secured (${fresh.length}', 'at >= wave ${secureWave} (${fresh.length}')
stripped = stripped.replace('        // Preserve the terminal captured before Return to Town, even if banking fails.\n', '')
stripped = stripped.replace('if (!row.finalSnapshot) row.finalSnapshot =', 'if (!row.banks.ok) row.finalSnapshot =')
assert stripped == old, 'Unexpected changes outside authorized correctives'
result = {'pass': True, 'base': base, 'unchangedOutside': 'Long Road and Deepwater id-guarded paths, secured-score predicate, frozen terminal fallback', 'baseSHA256': hashlib.sha256(old.encode()).hexdigest(), 'driverSHA256': hashlib.sha256(new.encode()).hexdigest()}
Path(__file__).with_name('driver-isolation.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result))
