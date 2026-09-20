// Independent, offline confirmation of the runtime closed/open verdict (F-ASTRA-9).
// Reads the GLBs directly with @gltf-transform and re-derives edge manifoldness + signed volume.
import { NodeIO } from '@gltf-transform/core';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.argv[2];
const io = new NodeIO();
const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.glb')) files.push(full);
  }
})(root);
files.sort();

const rows = [];
for (const file of files) {
  const doc = await io.read(file);
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const position = prim.getAttribute('POSITION');
      const indices = prim.getIndices();
      if (!position) continue;
      const count = indices ? indices.getCount() : position.getCount();
      const weld = new Map();
      const welded = new Int32Array(position.getCount());
      const pts = [];
      const tmp = [0, 0, 0];
      for (let i = 0; i < position.getCount(); i += 1) {
        position.getElement(i, tmp);
        const key = `${Math.round(tmp[0] * 1e4)},${Math.round(tmp[1] * 1e4)},${Math.round(tmp[2] * 1e4)}`;
        let id = weld.get(key);
        if (id === undefined) { id = pts.length / 3; weld.set(key, id); pts.push(tmp[0], tmp[1], tmp[2]); }
        welded[i] = id;
      }
      const at = (slot) => welded[indices ? indices.getScalar(slot) : slot];
      const edges = new Map();
      const n = pts.length / 3;
      let volume = 0; let degenerate = 0;
      for (let s = 0; s < count; s += 3) {
        const a = at(s), b = at(s + 1), c = at(s + 2);
        if (a === b || b === c || a === c) { degenerate += 1; continue; }
        for (const [f, t] of [[a, b], [b, c], [c, a]]) {
          const key = Math.min(f, t) * n + Math.max(f, t);
          edges.set(key, (edges.get(key) ?? 0) + 1);
        }
        const ax = pts[a * 3], ay = pts[a * 3 + 1], az = pts[a * 3 + 2];
        const bx = pts[b * 3], by = pts[b * 3 + 1], bz = pts[b * 3 + 2];
        const cx = pts[c * 3], cy = pts[c * 3 + 1], cz = pts[c * 3 + 2];
        volume += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
      }
      let boundary = 0; let nonManifold = 0;
      for (const shared of edges.values()) { if (shared === 1) boundary += 1; else if (shared > 2) nonManifold += 1; }
      const material = prim.getMaterial();
      rows.push({
        file: path.relative(process.cwd(), file),
        mesh: mesh.getName(),
        triangles: Math.floor(count / 3),
        rawVertices: position.getCount(),
        weldedVertices: n,
        boundaryEdges: boundary,
        nonManifoldEdges: nonManifold,
        degenerateTriangles: degenerate,
        signedVolume: +volume.toFixed(6),
        doubleSided: material ? material.getDoubleSided() : null,
        verdict: boundary === 0 && nonManifold === 0 && volume > 0 ? 'closed' : (boundary || nonManifold ? 'open-edges' : 'inverted-winding'),
      });
    }
  }
}
writeFileSync(process.argv[3], `${JSON.stringify(rows, null, 2)}\n`);
const closed = rows.filter((row) => row.verdict === 'closed').length;
const double = rows.filter((row) => row.doubleSided).length;
console.log(`primitives=${rows.length} closed=${closed} open=${rows.length - closed} doubleSidedInGlb=${double}`);
for (const row of rows.filter((r) => r.verdict !== 'closed')) console.log('  OPEN:', row.file, row.mesh, 'boundary', row.boundaryEdges, 'nonManifold', row.nonManifoldEdges, 'vol', row.signedVolume);
