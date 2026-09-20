import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
async function census(root) {
  const groups = new Map();
  const files = (await readdir(root, { recursive: true })).filter(p => p.endsWith('.glb')).sort();
  let images = 0, embeddedBytes = 0, glbBytes = 0;
  for (const file of files) {
    const glb = await readFile(path.join(root, file));
    glbBytes += glb.length;
    let json, bin;
    for (let off = 12; off < glb.length;) {
      const length = glb.readUInt32LE(off), type = glb.readUInt32LE(off + 4);
      const chunk = glb.subarray(off + 8, off + 8 + length);
      if (type === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8'));
      if (type === 0x004e4942) bin = chunk;
      off += 8 + length;
    }
    for (const [index, image] of (json.images ?? []).entries()) {
      if (image.bufferView === undefined) continue;
      const view = json.bufferViews[image.bufferView];
      const data = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
      const hash = createHash('sha256').update(data).digest('hex');
      const group = groups.get(hash) ?? { hash, bytes: data.length, mimeType: image.mimeType, images: [] };
      group.images.push(`${file}#image-${index}`);
      groups.set(hash, group);
      images++; embeddedBytes += data.length;
    }
  }
  const duplicates = [...groups.values()].filter(g => g.images.length > 1);
  return { root, glbs: files.length, glbBytes, images, embeddedBytes, uniqueImages: groups.size, duplicateGroups: duplicates.length, redundantImageBytes: duplicates.reduce((s, g) => s + g.bytes * (g.images.length - 1), 0), duplicates };
}
const result = { source: await census('assets/pilots'), productionBuild: await census('dist/assets') };
await writeFile('artifacts/shared-atlas-dedupe/census.json', JSON.stringify(result, null, 2) + '\n');
for (const { duplicates, ...summary } of Object.values(result)) console.log(summary);
