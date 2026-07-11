import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import type { PowerGridSnapshot, PowerNodeSnapshot, PowerWireSnapshot, PowerWireViewDiagnostics } from '../systems/PowerGraph';
import { disposeObject3D } from '../utils/dispose';
import { visualY } from './Terrain';

const WIRE_Y = 1.45;
const WIRE_SAG = 0.42;
const WIRE_SEGMENTS = 12;

export class PowerWireView {
  readonly group = new THREE.Group();

  private appliedId = '';
  private appliedRevision = -1;
  private rebuildCount = 0;
  private spans = 0;
  private intactSpans = 0;
  private cutSpans = 0;
  private segments = 0;
  private drawCalls = 0;

  update(snapshot: PowerGridSnapshot): boolean {
    if (this.appliedId === snapshot.id && this.appliedRevision === snapshot.topologyRevision) return false;
    disposeObject3D(this.group);
    this.group.clear();
    this.group.name = `PowerWireView.${snapshot.id}`;

    const nodes = new Map(snapshot.nodes.map((node) => [node.id, node]));
    const intactVertices = wireVertices(snapshot.wires, nodes, 'intact');
    const cutVertices = wireVertices(snapshot.wires, nodes, 'cut');
    if (intactVertices.length > 0) this.group.add(createLineSegments('PowerWireView.Intact', intactVertices, '#5b8a8a', 0.88));
    if (cutVertices.length > 0) this.group.add(createLineSegments('PowerWireView.Cut', cutVertices, '#a0522d', 0.62));

    this.appliedId = snapshot.id;
    this.appliedRevision = snapshot.topologyRevision;
    this.rebuildCount += 1;
    this.spans = snapshot.wires.length;
    this.intactSpans = snapshot.wires.filter((wire) => wire.state === 'intact').length;
    this.cutSpans = this.spans - this.intactSpans;
    this.segments = (intactVertices.length + cutVertices.length) / 6;
    this.drawCalls = Number(intactVertices.length > 0) + Number(cutVertices.length > 0);
    return true;
  }

  diagnostics(): PowerWireViewDiagnostics {
    return {
      active: this.group.visible,
      renderLayer: RenderLayers.gameplay,
      renderSlot: 'gameplay',
      topologyRevision: this.appliedRevision,
      rebuildCount: this.rebuildCount,
      spans: this.spans,
      intactSpans: this.intactSpans,
      cutSpans: this.cutSpans,
      segments: this.segments,
      drawCalls: this.drawCalls,
      asset: 'procedural-catenary',
    };
  }

  invalidate(): void {
    this.appliedId = '';
    this.appliedRevision = -1;
  }

  dispose(): void {
    disposeObject3D(this.group);
    this.group.clear();
  }
}

function wireVertices(
  wires: readonly PowerWireSnapshot[],
  nodes: ReadonlyMap<string, PowerNodeSnapshot>,
  state: PowerWireSnapshot['state'],
): number[] {
  const vertices: number[] = [];
  for (const wire of wires) {
    if (wire.state !== state) continue;
    const a = nodes.get(wire.a);
    const b = nodes.get(wire.b);
    if (!a || !b) continue;
    for (let index = 0; index < WIRE_SEGMENTS; index += 1) {
      pushCatenaryPoint(vertices, a, b, index / WIRE_SEGMENTS);
      pushCatenaryPoint(vertices, a, b, (index + 1) / WIRE_SEGMENTS);
    }
  }
  return vertices;
}

function pushCatenaryPoint(vertices: number[], a: PowerNodeSnapshot, b: PowerNodeSnapshot, t: number): void {
  const x = THREE.MathUtils.lerp(a.x, b.x, t);
  const z = THREE.MathUtils.lerp(a.z, b.z, t);
  const groundY = visualY(x, z, WIRE_Y);
  vertices.push(x, groundY - Math.sin(Math.PI * t) * WIRE_SAG, z);
}

function createLineSegments(name: string, vertices: readonly number[], color: string, opacity: number): THREE.LineSegments {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: false });
  const lines = new THREE.LineSegments(geometry, material);
  lines.name = name;
  lines.renderOrder = RenderLayers.gameplay;
  lines.frustumCulled = false;
  return lines;
}
