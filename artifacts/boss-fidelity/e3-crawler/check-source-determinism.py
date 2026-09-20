"""Three fresh source builds must produce identical GLB bytes; never writes production assets."""
from pathlib import Path
import hashlib
import importlib.util
import json
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
spec = importlib.util.spec_from_file_location('crawler_builder', ROOT / 'assets/pilots/crawler-3d/build_crawler.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
with tempfile.TemporaryDirectory(prefix='crawler-rebuild-') as directory:
    builder.OUT = Path(directory)
    builder.BLEND = builder.OUT / 'crawler.blend'
    builder.GLB = builder.OUT / 'crawler.glb'
    hashes = []
    for _ in range(3):
        builder.main()
        hashes.append(hashlib.sha256(builder.GLB.read_bytes()).hexdigest())
    assert len(set(hashes)) == 1, hashes
    (HERE / 'source-determinism.json').write_text(json.dumps({'freshBuildHashes': hashes, 'identical': True}, indent=2) + '\n')
    print('Three fresh source builds are byte-identical:', hashes[0])
