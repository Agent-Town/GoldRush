import { cleanPlate } from '../needs-cells-art-batch/clean-plate.mjs';
import { extractToBand } from '../needs-cells-art-batch/extract.mjs';
const row = { id: 'w-r1', grid: '2x2', cell: 512, band: [228, 252], aim: 242 };
const src = 'artifacts/needs-cells-codex-strips/native/wrecker-retake1-exec-e4c2acae.png';
const swept = 'artifacts/needs-cells-codex-strips/swept/wrecker-retake1.png';
console.log('swept:', await cleanPlate(src, swept, { grid: '2x2' }));
console.log(JSON.stringify(await extractToBand(row, swept, { out: 'artifacts/needs-cells-codex-strips/probe', stem: 'wrecker-retake1' }), null, 1));
