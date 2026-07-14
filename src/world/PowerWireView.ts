import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import type { PowerGridSnapshot, PowerNodeSnapshot, PowerWireViewDiagnostics } from '../systems/PowerGraph';
import { disposeObject3D } from '../utils/dispose';
import { visualY } from './Terrain';

const WIRE_Y = 1.45;
const WIRE_SAG = 0.42;
const WIRE_SEGMENTS = 12;
const WIRE_WIDTH = 0.055;
const UNIT_Z = new THREE.Vector3(0, 0, 1);

type WireSegment = Readonly<{ start: THREE.Vector3; end: THREE.Vector3 }>;

export class PowerWireView {
  readonly group = new THREE.Group();

  private appliedId = '';
  private appliedAllocationRevision = -1;
  private appliedTopologyRevision = -1;
  private appliedVisualSignature = '';
  private rebuildCount = 0;
  private spans = 0;
  private poweredSpans = 0;
  private darkSpans = 0;
  private intactSpans = 0;
  private cutSpans = 0;
  private poweredSegments = 0;
  private darkSegments = 0;
  private drawCalls = 0;

  update(snapshot: PowerGridSnapshot): boolean {
    if (this.appliedId === snapshot.id && this.appliedAllocationRevision === snapshot.allocationRevision) return false;
    const nodes = new Map(snapshot.nodes.map((node) => [node.id, node]));
    const componentStates = new Map(snapshot.components.map((component) => [component.id, component.state]));
    const energizedByWire = new Map(snapshot.wires.map((wire) => {
      const a = nodes.get(wire.a);
      const b = nodes.get(wire.b);
      return [wire.id, Boolean(a && b
        && wire.state === 'intact'
        && a.componentId === b.componentId
        && componentStates.get(a.componentId) !== 'dark')] as const;
    }));
    const visualSignature = `${snapshot.topologyRevision}|${snapshot.wires.map((wire) => `${wire.id}:${Number(energizedByWire.get(wire.id))}`).join('|')}`;
    this.appliedAllocationRevision = snapshot.allocationRevision;
    if (this.appliedId === snapshot.id && this.appliedVisualSignature === visualSignature) return false;

    disposeObject3D(this.group);
    this.group.clear();
    this.group.name = `PowerWireView.${snapshot.id}`;
    const powered: WireSegment[] = [];
    const dark: WireSegment[] = [];
    this.poweredSpans = 0;
    this.darkSpans = 0;
    for (const wire of snapshot.wires) {
      const a = nodes.get(wire.a);
      const b = nodes.get(wire.b);
      if (!a || !b) continue;
      const energized = energizedByWire.get(wire.id) === true;
      catenarySegments(a, b, energized ? powered : dark);
      if (energized) this.poweredSpans += 1;
      else this.darkSpans += 1;
    }
    if (powered.length > 0) this.group.add(createSegmentMesh('PowerWireView.Powered', powered, '#4f817b'));
    if (dark.length > 0) this.group.add(createSegmentMesh('PowerWireView.Dark', dark, '#625f56'));

    this.appliedId = snapshot.id;
    this.appliedTopologyRevision = snapshot.topologyRevision;
    this.appliedVisualSignature = visualSignature;
    this.rebuildCount += 1;
    this.spans = snapshot.wires.length;
    this.intactSpans = snapshot.wires.filter((wire) => wire.state === 'intact').length;
    this.cutSpans = this.spans - this.intactSpans;
    this.poweredSegments = powered.length;
    this.darkSegments = dark.length;
    this.drawCalls = Number(powered.length > 0) + Number(dark.length > 0);
    return true;
  }

  diagnostics(): PowerWireViewDiagnostics {
    return {
      active: this.group.visible,
      renderLayer: RenderLayers.gameplay,
      renderSlot: 'gameplay',
      topologyRevision: this.appliedTopologyRevision,
      allocationRevision: this.appliedAllocationRevision,
      rebuildCount: this.rebuildCount,
      spans: this.spans,
      poweredSpans: this.poweredSpans,
      darkSpans: this.darkSpans,
      intactSpans: this.intactSpans,
      cutSpans: this.cutSpans,
      segments: this.poweredSegments + this.darkSegments,
      poweredSegments: this.poweredSegments,
      darkSegments: this.darkSegments,
      drawCalls: this.drawCalls,
      asset: 'procedural-catenary',
    };
  }

  invalidate(): void {
    this.appliedId = '';
    this.appliedAllocationRevision = -1;
    this.appliedTopologyRevision = -1;
    this.appliedVisualSignature = '';
  }

  dispose(): void {
    disposeObject3D(this.group);
    this.group.clear();
  }
}

function catenarySegments(a: PowerNodeSnapshot, b: PowerNodeSnapshot, segments: WireSegment[]): void {
  const startY = visualY(a.x, a.z, WIRE_Y);
  const endY = visualY(b.x, b.z, WIRE_Y);
  for (let index = 0; index < WIRE_SEGMENTS; index += 1) {
    segments.push({
      start: catenaryPoint(a, b, startY, endY, index / WIRE_SEGMENTS),
      end: catenaryPoint(a, b, startY, endY, (index + 1) / WIRE_SEGMENTS),
    });
  }
}

function catenaryPoint(a: PowerNodeSnapshot, b: PowerNodeSnapshot, startY: number, endY: number, t: number): THREE.Vector3 {
  return new THREE.Vector3(
    THREE.MathUtils.lerp(a.x, b.x, t),
    THREE.MathUtils.lerp(startY, endY, t) - Math.sin(Math.PI * t) * WIRE_SAG,
    THREE.MathUtils.lerp(a.z, b.z, t),
  );
}

function createSegmentMesh(name: string, segments: readonly WireSegment[], color: string): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color }),
    segments.length,
  );
  mesh.name = name;
  mesh.renderOrder = RenderLayers.gameplay;
  mesh.frustumCulled = false;

  const matrix = new THREE.Matrix4();
  const midpoint = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index]!;
    midpoint.copy(segment.start).add(segment.end).multiplyScalar(0.5);
    direction.copy(segment.end).sub(segment.start);
    const length = Math.max(0.001, direction.length());
    rotation.setFromUnitVectors(UNIT_Z, direction.normalize());
    scale.set(WIRE_WIDTH, WIRE_WIDTH, length);
    matrix.compose(midpoint, rotation, scale);
    mesh.setMatrixAt(index, matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}
