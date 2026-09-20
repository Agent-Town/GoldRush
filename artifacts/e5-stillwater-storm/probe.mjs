import { readFileSync, writeFileSync } from 'node:fs';
const [file, mode] = process.argv.slice(2);
let text = readFileSync(file, 'utf8');
const start = text.indexOf('"id": "e5-stillwater"');
const end = text.indexOf('"id": "e5-flotilla"');
if (start < 0 || end < 0 || end < start) throw new Error('block not found');
let block = text.slice(start, end);
const before = block;
// era cadence, copied verbatim from the three EXERCISING E5 maps
block = block.replace('"cycleSeconds": 3600', '"cycleSeconds": 24')
  .replace('"clearSeconds": 3599', '"clearSeconds": 5')
  .replace('"telegraphSeconds": 0.25', '"telegraphSeconds": 3')
  .replace('"stormSeconds": 0.25', '"stormSeconds": 10')
  .replace('"stormMovementMultiplier": 1', '"stormMovementMultiplier": 0.72')
  .replace('"stormVisibilityMultiplier": 1', '"stormVisibilityMultiplier": 0.58')
  .replace('"hazeStrength": 0\n', '"hazeStrength": 0.28\n');
if (mode === 'crewed') {
  block = block.replace('"corsairWaveSize": 0', '"corsairWaveSize": 3');
  // the boat-class archetype `DeepwaterClaimTile.corsairsFor` requires, copied from e5-deepwater-claim
  block = block.replace('"enemyRoster": [\n          {', `"enemyRoster": [
          {
            "id": "corsair_skiff",
            "label": "Corsair Skiff",
            "waveMin": 1,
            "hpScale": 1,
            "speedMult": 1,
            "visualScale": 1,
            "tint": "#7c5a3a",
            "spawnEdges": ["west"],
            "unitClass": "vehicle",
            "vehicleChassis": "e4-hauler",
            "travelClass": "boat",
            "waterRegions": ["open-water", "lagoon-shallows", "reef-gap", "wreck-shelf"],
            "art": "placeholder"
          },
          {`);
}
if (block === before) throw new Error('no mutation applied');
writeFileSync(file, text.slice(0, start) + block + text.slice(end));
JSON.parse(readFileSync(file, 'utf8'));
console.log('mutated:', mode);
