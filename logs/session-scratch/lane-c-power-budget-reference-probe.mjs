import assert from 'node:assert/strict';
import {
  POWER_GRAPH_LIMITS,
  PowerGraphSystem,
  powerWireId,
} from '../../src/systems/PowerGraph.ts';

const REFERENCE_ITERATIONS = 400_000;
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

function referenceLoop() {
  let value = 0x12345678;
  const started = performance.now();
  for (let index = 0; index < REFERENCE_ITERATIONS; index += 1) {
    value = (Math.imul(value ^ index, 1_664_525) + 1_013_904_223) | 0;
  }
  return { ms: performance.now() - started, value };
}

function percentile(values, fraction) {
  values.sort((left, right) => left - right);
  return values[Math.ceil(values.length * fraction) - 1];
}

const system = new PowerGraphSystem({ id: 'power-budget-probe', nodes, wires });
assert.equal(system.snapshot().nodes.length, POWER_GRAPH_LIMITS.maxNodes);
assert.equal(system.snapshot().wires.length, POWER_GRAPH_LIMITS.maxWires);
const wireId = powerWireId(system.snapshot().wires[0]);
const powerSamples = [];
for (let index = 0; index < 224; index += 1) {
  assert.equal(system.queueCommand({
    type: 'set-wire-state',
    wireId,
    state: index % 2 === 0 ? 'cut' : 'intact',
  }), true);
  system.step(index + 1);
  if (index >= 64) powerSamples.push(system.diagnostics().lastStepMs);
}

let checksum = 0;
for (let index = 0; index < 64; index += 1) checksum = referenceLoop().value;
const referenceSamples = [];
for (let index = 0; index < 160; index += 1) {
  const sample = referenceLoop();
  referenceSamples.push(sample.ms);
  checksum = (checksum + sample.value + index) | 0;
}

const p95 = percentile(powerSamples, 0.95);
const referenceMedian = percentile(referenceSamples, 0.5);
assert.notEqual(checksum, 0, 'reference loop checksum must be consumed');
console.log(
  `power-graph-reference-probe: p95=${p95.toFixed(3)}ms ref=${referenceMedian.toFixed(3)}ms ` +
  `ratio=${(p95 / referenceMedian).toFixed(3)} checksum=${checksum}`,
);
