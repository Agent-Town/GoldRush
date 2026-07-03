import * as THREE from 'three';
import { palette } from '../assets/palette';
import { assetSlots, tagPlaceholder, type PlaceholderFactory } from '../assets/slots';
import { createClaimProps } from './props';

export type TerrainZone = 'bank' | 'shallows' | 'river' | 'ford' | 'out';

export type Vec2 = {
  x: number;
  z: number;
};

export type TerrainSample = {
  walkable: boolean;
  speedMul: number;
  zone: TerrainZone;
};

export type TerrainBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export const CLAIM_SIZE = 64;
export const CLAIM_HALF = CLAIM_SIZE / 2;
export const RIVER_MIN_Z = -5;
export const RIVER_MAX_Z = 5;
export const FORD_MIN_X = -3;
export const FORD_MAX_X = 3;
export const SHALLOWS_WIDTH = 1.25;

export const bounds: TerrainBounds = {
  minX: -CLAIM_HALF,
  maxX: CLAIM_HALF,
  minZ: -CLAIM_HALF,
  maxZ: CLAIM_HALF,
};

export const nodeAnchors: Vec2[] = [
  { x: -22, z: -6.8 },
  { x: -9, z: 6.7 },
  { x: -1.5, z: -6.4 },
  { x: 7.5, z: 6.5 },
  { x: 18, z: -7 },
  { x: 25, z: 6.9 },
];

export function sample(x: number, z: number): TerrainSample {
  if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ) {
    return { walkable: false, speedMul: 0, zone: 'out' };
  }

  const inFord = x >= FORD_MIN_X && x <= FORD_MAX_X && z >= RIVER_MIN_Z && z <= RIVER_MAX_Z;
  if (inFord) return { walkable: true, speedMul: 0.85, zone: 'ford' };

  const inRiver = z >= RIVER_MIN_Z && z <= RIVER_MAX_Z;
  if (inRiver) return { walkable: true, speedMul: 0.55, zone: 'river' };

  const inShallows =
    (z > RIVER_MAX_Z && z <= RIVER_MAX_Z + SHALLOWS_WIDTH) ||
    (z < RIVER_MIN_Z && z >= RIVER_MIN_Z - SHALLOWS_WIDTH);
  if (inShallows) return { walkable: true, speedMul: 0.8, zone: 'shallows' };

  return { walkable: true, speedMul: 1, zone: 'bank' };
}

export function spawnEdges(): Vec2[] {
  return [
    { x: 0, z: bounds.minZ },
    { x: 0, z: bounds.maxZ },
    { x: bounds.maxX, z: 0 },
    { x: bounds.minX, z: 0 },
  ];
}

export function isBuildable(x: number, z: number): boolean {
  return sample(x, z).zone === 'bank';
}

export type TerrainView = {
  group: THREE.Group;
  update: (delta: number) => void;
};

const bankMaterial = new THREE.MeshStandardMaterial({
  color: palette.sand,
  roughness: 0.86,
  metalness: 0.01,
});

const riverMaterial = new THREE.MeshStandardMaterial({
  color: '#4f7f86',
  transparent: true,
  opacity: 0.88,
  roughness: 0.42,
  metalness: 0.02,
});

const fordMaterial = new THREE.MeshStandardMaterial({
  color: '#7fa3a4',
  transparent: true,
  opacity: 0.72,
  roughness: 0.5,
  metalness: 0.01,
});

export const createBankPlaceholder: PlaceholderFactory<THREE.Mesh> = Object.assign(
  () => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CLAIM_SIZE, CLAIM_SIZE, 1, 1), bankMaterial.clone());
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.map = createBankTexture();
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(4, 4);
    return tagPlaceholder(mesh, assetSlots.terrainBank);
  },
  { slotId: assetSlots.terrainBank },
);

export const createRiverPlaceholder: PlaceholderFactory<THREE.Mesh> = Object.assign(
  () => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CLAIM_SIZE, RIVER_MAX_Z - RIVER_MIN_Z, 1, 1), riverMaterial.clone());
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.025;
    mesh.receiveShadow = true;
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.map = createRiverTexture(false);
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(8, 1);
    return tagPlaceholder(mesh, assetSlots.terrainRiver);
  },
  { slotId: assetSlots.terrainRiver },
);

export const createFordPlaceholder: PlaceholderFactory<THREE.Mesh> = Object.assign(
  () => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(FORD_MAX_X - FORD_MIN_X, RIVER_MAX_Z - RIVER_MIN_Z, 1, 1), fordMaterial.clone());
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.04;
    mesh.receiveShadow = true;
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.map = createRiverTexture(true);
    material.map.wrapS = THREE.RepeatWrapping;
    material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set(1, 1);
    return tagPlaceholder(mesh, assetSlots.terrainFord);
  },
  { slotId: assetSlots.terrainFord },
);

export function createTerrainView(): TerrainView {
  const group = new THREE.Group();
  const bank = createBankPlaceholder();
  const river = createRiverPlaceholder();
  const ford = createFordPlaceholder();
  group.add(bank, river, ford, createClaimProps());

  return {
    group,
    update: (delta: number) => {
      scrollMap(river, delta * 0.025);
      scrollMap(ford, delta * 0.012);
    },
  };
}

function scrollMap(mesh: THREE.Mesh, amount: number): void {
  const map = (mesh.material as THREE.MeshStandardMaterial).map;
  if (map) map.offset.x = (map.offset.x + amount) % 1;
}

function createBankTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create bank texture context.');

  context.fillStyle = palette.sand;
  context.fillRect(0, 0, size, size);
  context.fillStyle = 'rgba(196, 136, 58, 0.12)';
  for (let i = 0; i < 900; i += 1) {
    const x = (i * 71) % size;
    const y = (i * 149) % size;
    context.fillRect(x, y, 1, 1);
  }
  context.strokeStyle = 'rgba(46, 27, 14, 0.13)';
  context.lineWidth = 1;
  for (let y = -size; y < size * 2; y += 18) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(size, y + size * 0.35);
    context.stroke();
  }
  context.fillStyle = 'rgba(91, 122, 83, 0.16)';
  for (let i = 0; i < 32; i += 1) {
    const x = (i * 113) % size;
    const y = (i * 197) % size;
    context.beginPath();
    context.ellipse(x, y, 5, 1.6, (i % 6) * 0.45, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createRiverTexture(shallow: boolean): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create river texture context.');

  context.fillStyle = shallow ? '#7fa3a4' : '#4f7f86';
  context.fillRect(0, 0, size, size);
  context.strokeStyle = shallow ? 'rgba(245, 230, 200, 0.18)' : 'rgba(245, 230, 200, 0.13)';
  context.lineWidth = 1;
  for (let y = 12; y < size; y += 24) {
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= size; x += 24) {
      context.lineTo(x, y + Math.sin(x * 0.06 + y) * 5);
    }
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
