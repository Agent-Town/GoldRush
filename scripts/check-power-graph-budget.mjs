import assert from 'node:assert/strict';
import {
  POWER_GRAPH_LIMITS,
  PowerGraphSystem,
  powerWireId,
} from '../src/systems/PowerGraph.ts';

const nodes = Array.from({ length: POWER_GRAPH_LIMITS.maxNodes }, (_, index) => {
  const id = `node-${String(index).padStart(3, '0')}`;
  const x = (index % 16) * 0.4;
  const z = Math.floor(index / 16) * 0.4;
  return index === 0
    ? { id, labelKey: id, kind: 'producer', x, z, online: true, outputWatts: 64 }
    : { id, labelKey: id, kind: 'consumer', x, z, online: true, drawWatts: 1, priority: index % 4 };
});
const wires = [];
for (let a = 0; a < nodes.length && wires.length < POWER_GRAPH_LIMITS.maxWires; a += 1) {
  for (let b = a + 1; b < nodes.length && wires.length < POWER_GRAPH_LIMITS.maxWires; b += 1) {
    wires.push({ a: nodes[a].id, b: nodes[b].id, state: 'intact' });
  }
}

const system = new PowerGraphSystem({ id: 'power-budget', nodes, wires });
assert.equal(system.snapshot().nodes.length, POWER_GRAPH_LIMITS.maxNodes);
assert.equal(system.snapshot().wires.length, POWER_GRAPH_LIMITS.maxWires);
const wireId = powerWireId(system.snapshot().wires[0]);
const samples = [];
for (let index = 0; index < 224; index += 1) {
  assert.equal(system.queueCommand({
    type: 'set-wire-state',
    wireId,
    state: index % 2 === 0 ? 'cut' : 'intact',
  }), true);
  system.step(index + 1);
  if (index >= 64) samples.push(system.diagnostics().lastStepMs);
}

samples.sort((left, right) => left - right);
const p95 = samples[Math.ceil(samples.length * 0.95) - 1];
assert.ok(
  p95 <= POWER_GRAPH_LIMITS.solveBudgetMs,
  `power graph fixed-step p95 ${p95.toFixed(3)}ms exceeded ${POWER_GRAPH_LIMITS.solveBudgetMs.toFixed(3)}ms`,
);
console.log(`power-graph-budget: PASS p95=${p95.toFixed(3)}ms samples=${samples.length}`);
