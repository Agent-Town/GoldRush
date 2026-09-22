from pathlib import Path
import hashlib
import json

out = Path(__file__).parent
path = Path('src/world/Terrain3dClaimPilot.ts')
current = path.read_text()
restored = current
for line in current.splitlines(keepends=True):
    if any(marker in line for marker in [
        'import riverContractText ', 'import riverPanoramaContractText ',
        "'e10-river': entry(", 'const restoreRiverPaint = paintRiverReturn(host);',
        'restoreRiverPaint();', "if (host.contractId === 'e10-river') paintRiverBanks(nextTerrain);",
        "if (host.contractId === 'e10-river' && nextSkirt) paintRiverBanks(nextSkirt);",
        '// F-CORR4-18 keeps the contract-owned water and its existing animation/depth.',
        '// Only the bank, ford paint and old stepping stones yield to the new pack.',
        "if (host.contractId === 'e10-river' && object.userData.assetSlot === 'terrain.river') return;",
    ]):
        assert restored.count(line) == 1
        restored = restored.replace(line, '')
start = restored.index('/** The raw River keeps its run-6 water;')
end = restored.index('/** A material-only dawn treatment for the raw River', start)
restored = restored[:start] + restored[end:]
base = (out / 'before-source/Terrain3dClaimPilot.ts').read_text()
assert restored == base
prior_contract = (out / 'before-source/contracts.json').read_text()
contract = Path('assets/contracts/epoch-10-deepsky/contracts.json').read_text()
assert contract == prior_contract.replace('at dawn with no new sculpt;', 'at dawn with a dedicated render-only River pack;')
sha = lambda text: hashlib.sha256(text.encode()).hexdigest()
result = {
    'removingOnlyNamedRiverSeamsReproducesBaseByteForByte': True,
    'basePilotSha256': sha(base), 'currentPilotSha256': sha(current),
    'contractDescriptionOnly': True,
}
(out / 'source-boundary.json').write_text(json.dumps(result, indent=2) + '\n')
print('SOURCE BOUNDARY PASS')
