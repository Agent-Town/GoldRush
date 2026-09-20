"""Three fresh candidate builds must match each other and the inspected GLB."""
from pathlib import Path
import hashlib
import importlib.util
import json
import tempfile

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('land_yacht_builder', HERE / 'candidate-model/build_land_yacht.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
expected = sha(builder.GLB)
with tempfile.TemporaryDirectory(prefix='land-yacht-rebuild-') as directory:
    builder.BLEND = Path(directory) / 'land-yacht.blend'
    builder.GLB = Path(directory) / 'land-yacht.glb'
    hashes = []
    for _ in range(3):
        builder.main()
        hashes.append(sha(builder.GLB))
    assert hashes == [expected] * 3, (expected, hashes)
    (HERE / 'candidate-validation/source-determinism.json').write_text(json.dumps({
        'builderSha256': sha(Path(builder.__file__)),
        'freshBuildHashes': hashes, 'inspectedAssetSha256': expected, 'identical': True,
    }, indent=2) + '\n')
    print('Three fresh builds match the inspected candidate:', expected)
