import type { ContractAuthoredTerrainLayer, ContractEdge, ContractManifest } from '../meta/ContractFamilies';

export type TerrainBrushTool = 'raise' | 'lower' | 'smooth' | 'zone' | 'water' | 'lane';

export type TerrainBrushAction = {
  tool: TerrainBrushTool;
  points: readonly TerrainBrushPoint[];
  radiusCells: number;
  strength: number;
  bank: 'north' | 'south';
};

export type TerrainBrushPoint = { x: number; z: number };
export type TerrainBrushResult = { changed: boolean; message: string };

type TerrainBrushPanelOptions = {
  contract: ContractManifest;
  canUndo: boolean;
  canRedo: boolean;
  onCommit: (next: ContractManifest, message: string) => boolean;
  onUndo: () => void;
  onRedo: () => void;
};

type TerrainBrushUiState = {
  version: 1;
  tool: TerrainBrushTool;
  radiusCells: number;
  strength: number;
  bank: 'north' | 'south';
  cursor: TerrainBrushPoint;
};

const GRID_DIMENSION = 41;
const MAX_DELTA = 16;
const MAX_PAINT_SHAPES = 32;
const CANVAS_SIZE = 360;
const BRUSH_STATE_KEY = 'gr.editor.brush.v1';
const TERRAIN_TOOLS: readonly TerrainBrushTool[] = ['raise', 'lower', 'smooth'];
const TOOLS: ReadonlyArray<{ id: TerrainBrushTool; label: string }> = [
  { id: 'raise', label: 'Raise' },
  { id: 'lower', label: 'Lower' },
  { id: 'smooth', label: 'Smooth' },
  { id: 'zone', label: 'Build zone' },
  { id: 'water', label: 'Spring pond' },
  { id: 'lane', label: 'Spawn edge' },
];

export function applyTerrainBrush(contract: ContractManifest, action: TerrainBrushAction): TerrainBrushResult {
  if (action.points.length === 0) return { changed: false, message: 'No survey mark was made.' };
  const size = contract.tileParams.size ?? 64;
  if (!Number.isFinite(size) || size <= 0) return { changed: false, message: 'The claim needs a positive size before it can be painted.' };
  if (TERRAIN_TOOLS.includes(action.tool)) return applyTerrainStroke(contract, action);
  if (action.tool === 'zone') return paintBuildZone(contract, action);
  if (action.tool === 'water') return paintWater(contract, action);
  return paintSpawnEdge(contract, action);
}

export function createTerrainBrushPanel(options: TerrainBrushPanelOptions): HTMLElement {
  const savedState = readBrushState(options.contract);
  const panel = document.createElement('section');
  panel.className = 'terrain-brush';
  panel.setAttribute('aria-labelledby', 'terrain-brush-title');
  panel.innerHTML = `
    <div class="terrain-brush__heading">
      <div>
        <p>Survey table</p>
        <h2 id="terrain-brush-title">Terrain brush</h2>
      </div>
      <div class="terrain-brush__history">
        <button type="button" data-testid="terrain-brush-undo" ${options.canUndo ? '' : 'disabled'}>Undo</button>
        <button type="button" data-testid="terrain-brush-redo" ${options.canRedo ? '' : 'disabled'}>Redo</button>
      </div>
    </div>
    <div class="terrain-brush__tools" role="toolbar" aria-label="Survey tool">
      ${TOOLS.map(({ id, label }, index) => `<button type="button" data-tool="${id}" data-testid="terrain-brush-mode-${id}" aria-pressed="${index === 0}">${label}</button>`).join('')}
    </div>
    <div class="terrain-brush__settings">
      <label>Brush size <input type="range" min="1" max="8" step="1" value="3" data-testid="terrain-brush-size"><output>3 cells</output></label>
      <label data-strength-row>Strength <input type="range" min="0.05" max="1" step="0.05" value="0.5" data-testid="terrain-brush-strength"><output>0.50</output></label>
      <label data-bank-row hidden>Zone bank <select data-testid="terrain-brush-bank"><option value="north">North</option><option value="south">South</option></select></label>
    </div>
    <canvas width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" tabindex="0" data-testid="terrain-brush-map" aria-label="Top-down claim survey. Arrow keys move the cursor; Space applies the selected tool."></canvas>
    <div class="terrain-brush__readout">
      <span aria-live="polite" data-testid="terrain-brush-coordinates">x 0.0 · z 0.0</span>
      <span>Drag terrain and zones; tap ponds and edges.</span>
    </div>
    <p class="terrain-brush__status" role="status" aria-live="polite" data-testid="terrain-brush-status">Ready to mark the descriptor.</p>`;

  const canvas = panel.querySelector<HTMLCanvasElement>('[data-testid="terrain-brush-map"]')!;
  const sizeInput = panel.querySelector<HTMLInputElement>('[data-testid="terrain-brush-size"]')!;
  const strengthInput = panel.querySelector<HTMLInputElement>('[data-testid="terrain-brush-strength"]')!;
  const bankInput = panel.querySelector<HTMLSelectElement>('[data-testid="terrain-brush-bank"]')!;
  const sizeOutput = sizeInput.nextElementSibling as HTMLOutputElement;
  const strengthOutput = strengthInput.nextElementSibling as HTMLOutputElement;
  const strengthRow = panel.querySelector<HTMLElement>('[data-strength-row]')!;
  const bankRow = panel.querySelector<HTMLElement>('[data-bank-row]')!;
  const coordinates = panel.querySelector<HTMLElement>('[data-testid="terrain-brush-coordinates"]')!;
  const status = panel.querySelector<HTMLElement>('[data-testid="terrain-brush-status"]')!;
  let tool = savedState.tool;
  let cursor = savedState.cursor;
  let pointerId: number | null = null;
  let points: TerrainBrushPoint[] = [];

  sizeInput.value = String(savedState.radiusCells);
  strengthInput.value = String(savedState.strength);
  bankInput.value = savedState.bank;
  sizeOutput.value = `${savedState.radiusCells} cells`;
  strengthOutput.value = savedState.strength.toFixed(2);
  strengthRow.hidden = !TERRAIN_TOOLS.includes(tool);
  bankRow.hidden = tool !== 'zone';
  panel.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.tool === tool));
  });

  const action = (actionPoints: readonly TerrainBrushPoint[]) => ({
    tool,
    points: actionPoints,
    radiusCells: Number(sizeInput.value),
    strength: Number(strengthInput.value),
    bank: bankInput.value as 'north' | 'south',
  });
  const commit = (actionPoints: readonly TerrainBrushPoint[]) => {
    const next = structuredClone(options.contract);
    const result = applyTerrainBrush(next, action(actionPoints));
    status.textContent = result.message;
    if (result.changed && !options.onCommit(next, result.message)) status.textContent = 'The descriptor rejected that mark.';
  };
  const updateCursor = (point: TerrainBrushPoint) => {
    cursor = point;
    coordinates.textContent = `x ${point.x.toFixed(1)} · z ${point.z.toFixed(1)}`;
  };
  const draw = () => drawSurvey(canvas, options.contract, cursor, Number(sizeInput.value), points, tool);
  const persist = () => writeBrushState(options.contract, {
    version: 1,
    tool,
    radiusCells: Number(sizeInput.value),
    strength: Number(strengthInput.value),
    bank: bankInput.value as 'north' | 'south',
    cursor,
  });

  panel.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      tool = button.dataset.tool as TerrainBrushTool;
      panel.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((entry) => entry.setAttribute('aria-pressed', String(entry === button)));
      strengthRow.hidden = !TERRAIN_TOOLS.includes(tool);
      bankRow.hidden = tool !== 'zone';
      status.textContent = `${button.textContent} selected.`;
      persist();
      draw();
    });
  });
  sizeInput.addEventListener('input', () => {
    sizeOutput.value = `${sizeInput.value} cells`;
    persist();
    draw();
  });
  strengthInput.addEventListener('input', () => {
    strengthOutput.value = Number(strengthInput.value).toFixed(2);
    persist();
  });
  bankInput.addEventListener('change', persist);
  panel.querySelector<HTMLButtonElement>('[data-testid="terrain-brush-undo"]')!.addEventListener('click', options.onUndo);
  panel.querySelector<HTMLButtonElement>('[data-testid="terrain-brush-redo"]')!.addEventListener('click', options.onRedo);

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || pointerId !== null) return;
    event.preventDefault();
    pointerId = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    updateCursor(canvasPoint(canvas, event.clientX, event.clientY, options.contract));
    points = [cursor];
    draw();
  });
  canvas.addEventListener('pointermove', (event) => {
    updateCursor(canvasPoint(canvas, event.clientX, event.clientY, options.contract));
    if (pointerId === event.pointerId) {
      if (TERRAIN_TOOLS.includes(tool)) points.push(cursor);
      else if (tool === 'zone') points = [points[0] ?? cursor, cursor];
    }
    draw();
  });
  canvas.addEventListener('pointerup', (event) => {
    if (pointerId !== event.pointerId) return;
    event.preventDefault();
    updateCursor(canvasPoint(canvas, event.clientX, event.clientY, options.contract));
    if (TERRAIN_TOOLS.includes(tool)) points.push(cursor);
    else if (tool === 'zone') points = [points[0] ?? cursor, cursor];
    else points = [cursor];
    canvas.releasePointerCapture(event.pointerId);
    pointerId = null;
    const committedPoints = points;
    points = [];
    persist();
    draw();
    commit(committedPoints);
  });
  canvas.addEventListener('pointercancel', () => {
    pointerId = null;
    points = [];
    status.textContent = 'Survey stroke cancelled.';
    draw();
  });
  canvas.addEventListener('keydown', (event) => {
    const step = brushCellSize(options.contract) * (event.shiftKey ? 4 : 1);
    if (event.key === 'ArrowLeft') cursor = { ...cursor, x: cursor.x - step };
    else if (event.key === 'ArrowRight') cursor = { ...cursor, x: cursor.x + step };
    else if (event.key === 'ArrowUp') cursor = { ...cursor, z: cursor.z + step };
    else if (event.key === 'ArrowDown') cursor = { ...cursor, z: cursor.z - step };
    else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      persist();
      commit([cursor]);
      return;
    } else return;
    event.preventDefault();
    const half = claimSize(options.contract) / 2;
    updateCursor({ x: clamp(cursor.x, -half, half), z: clamp(cursor.z, -half, half) });
    persist();
    draw();
  });

  updateCursor(cursor);
  draw();
  return panel;
}

function applyTerrainStroke(contract: ContractManifest, action: TerrainBrushAction): TerrainBrushResult {
  const layer = structuredClone(contract.tileParams.authoredTerrain ?? createAuthoredLayer(contract));
  const path = action.points.map((point) => ({
    column: clamp((point.x - layer.originX) / layer.cellSize, 0, layer.columns - 1),
    row: clamp((point.z - layer.originZ) / layer.cellSize, 0, layer.rows - 1),
  }));
  const source = layer.heightDeltas;
  const next = [...source];
  const radius = clamp(Math.round(action.radiusCells), 1, 8);
  const strength = clamp(action.strength, 0.05, 1);
  let changed = false;

  for (let row = 1; row < layer.rows - 1; row += 1) {
    for (let column = 1; column < layer.columns - 1; column += 1) {
      let weight = 0;
      const distance = distanceToPath(column, row, path);
      if (distance <= radius) weight = 1 - distance / radius;
      if (distance === 0) weight = 1;
      if (weight <= 0) continue;
      const index = row * layer.columns + column;
      const current = source[index] ?? 0;
      let value = current;
      if (action.tool === 'raise') value += strength * weight;
      else if (action.tool === 'lower') value -= strength * weight;
      else value += (neighborMean(source, layer.columns, column, row) - current) * strength * weight;
      value = quantize(clamp(value, -MAX_DELTA, MAX_DELTA));
      if (value !== current) {
        next[index] = value;
        changed = true;
      }
    }
  }

  if (!changed) return { changed: false, message: 'That stroke left the terrain unchanged.' };
  layer.heightDeltas = next;
  contract.tileParams.authoredTerrain = layer;
  return { changed: true, message: `${title(action.tool)} stroke written to the descriptor.` };
}

function paintBuildZone(contract: ContractManifest, action: TerrainBrushAction): TerrainBrushResult {
  const zones = contract.tileParams.buildZones ?? [];
  if (zones.length >= MAX_PAINT_SHAPES) return { changed: false, message: 'The descriptor already holds 32 build zones.' };
  const size = claimSize(contract);
  const half = size / 2;
  const cellSize = brushCellSize(contract);
  const stampRadius = clamp(Math.round(action.radiusCells), 1, 8) * cellSize;
  const start = action.points[0]!;
  const end = action.points.at(-1)!;
  let minX = clamp(Math.min(start.x, end.x), -half, half);
  let maxX = clamp(Math.max(start.x, end.x), -half, half);
  let minZ = clamp(Math.min(start.z, end.z), -half, half);
  let maxZ = clamp(Math.max(start.z, end.z), -half, half);
  if (maxX - minX < cellSize) {
    minX = clamp(start.x - stampRadius, -half, half);
    maxX = clamp(start.x + stampRadius, -half, half);
  }
  if (maxZ - minZ < cellSize) {
    minZ = clamp(start.z - stampRadius, -half, half);
    maxZ = clamp(start.z + stampRadius, -half, half);
  }
  contract.tileParams.buildZones = [
    ...zones,
    { id: nextZoneId(zones.map((zone) => zone.id)), bank: action.bank, minX: quantize(minX), maxX: quantize(maxX), minZ: quantize(minZ), maxZ: quantize(maxZ) },
  ];
  return { changed: true, message: `${title(action.bank)} build zone written as a rectangle.` };
}

function paintWater(contract: ContractManifest, action: TerrainBrushAction): TerrainBrushResult {
  if (contract.tileParams.waterSources.length >= MAX_PAINT_SHAPES) {
    return { changed: false, message: 'The descriptor already holds 32 spring ponds.' };
  }
  const half = claimSize(contract) / 2;
  const maxRadius = Math.min(128, half);
  const minRadius = Math.min(brushCellSize(contract), maxRadius);
  const radius = clamp(Math.round(action.radiusCells) * brushCellSize(contract), minRadius, maxRadius);
  const point = action.points.at(-1)!;
  contract.tileParams.waterSources = [
    ...contract.tileParams.waterSources,
    {
      kind: 'spring_pond',
      x: quantize(clamp(point.x, -half + radius, half - radius)),
      z: quantize(clamp(point.z, -half + radius, half - radius)),
      radius: quantize(radius),
    },
  ];
  return { changed: true, message: 'Spring pond written as a circle.' };
}

function paintSpawnEdge(contract: ContractManifest, action: TerrainBrushAction): TerrainBrushResult {
  const edge = nearestEdge(action.points.at(-1)!, claimSize(contract) / 2);
  const edges = contract.tileParams.lanes.spawnEdges;
  if (!edges.includes(edge)) {
    contract.tileParams.lanes.spawnEdges = [...edges, edge];
    return { changed: true, message: `${title(edge)} spawn edge added.` };
  }
  if (edges.length === 1) return { changed: false, message: 'A contract must keep at least one spawn edge.' };
  contract.tileParams.lanes.spawnEdges = edges.filter((entry) => entry !== edge);
  return { changed: true, message: `${title(edge)} spawn edge removed.` };
}

function createAuthoredLayer(contract: ContractManifest): ContractAuthoredTerrainLayer {
  const size = claimSize(contract);
  return {
    version: 1,
    mode: 'visual-delta',
    columns: GRID_DIMENSION,
    rows: GRID_DIMENSION,
    cellSize: size / (GRID_DIMENSION - 1),
    originX: -size / 2,
    originZ: -size / 2,
    heightDeltas: Array(GRID_DIMENSION * GRID_DIMENSION).fill(0),
  };
}

function distanceToPath(column: number, row: number, path: ReadonlyArray<{ column: number; row: number }>): number {
  if (path.length === 1) return Math.hypot(column - path[0]!.column, row - path[0]!.row);
  let best = Number.POSITIVE_INFINITY;
  for (let index = 1; index < path.length; index += 1) {
    const from = path[index - 1]!;
    const to = path[index]!;
    const dx = to.column - from.column;
    const dy = to.row - from.row;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : clamp(((column - from.column) * dx + (row - from.row) * dy) / lengthSq, 0, 1);
    best = Math.min(best, Math.hypot(column - (from.column + dx * t), row - (from.row + dy * t)));
  }
  return best;
}

function neighborMean(values: readonly number[], columns: number, column: number, row: number): number {
  let total = 0;
  for (let z = row - 1; z <= row + 1; z += 1) {
    for (let x = column - 1; x <= column + 1; x += 1) total += values[z * columns + x] ?? 0;
  }
  return total / 9;
}

function drawSurvey(
  canvas: HTMLCanvasElement,
  contract: ContractManifest,
  cursor: TerrainBrushPoint,
  radiusCells: number,
  stroke: readonly TerrainBrushPoint[],
  tool: TerrainBrushTool,
): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const size = claimSize(contract);
  const half = size / 2;
  const toX = (x: number) => ((x + half) / size) * canvas.width;
  const toY = (z: number) => ((half - z) / size) * canvas.height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#f5e6c8';
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (contract.tileParams.river) {
    context.fillStyle = 'rgba(91, 138, 138, 0.24)';
    context.fillRect(0, toY(5), canvas.width, toY(-5) - toY(5));
  }
  const layer = contract.tileParams.authoredTerrain;
  if (layer) {
    const cell = canvas.width / (layer.columns - 1);
    for (let row = 0; row < layer.rows; row += 1) {
      for (let column = 0; column < layer.columns; column += 1) {
        const value = layer.heightDeltas[row * layer.columns + column] ?? 0;
        if (value === 0) continue;
        const alpha = Math.min(0.72, 0.16 + Math.abs(value) / MAX_DELTA);
        context.fillStyle = value > 0 ? `rgba(196, 136, 58, ${alpha})` : `rgba(91, 138, 138, ${alpha})`;
        context.fillRect(column * cell - cell / 2, canvas.height - row * cell - cell / 2, cell, cell);
      }
    }
  }
  for (const zone of contract.tileParams.buildZones ?? []) {
    context.fillStyle = zone.bank === 'north' ? 'rgba(196, 136, 58, 0.25)' : 'rgba(160, 82, 45, 0.22)';
    context.strokeStyle = zone.bank === 'north' ? '#8b7d3c' : '#a0522d';
    const x = toX(zone.minX);
    const y = toY(zone.maxZ);
    const width = toX(zone.maxX) - x;
    const height = toY(zone.minZ) - y;
    context.fillRect(x, y, width, height);
    context.strokeRect(x, y, width, height);
  }
  for (const source of contract.tileParams.waterSources) {
    context.beginPath();
    context.fillStyle = 'rgba(91, 138, 138, 0.42)';
    context.strokeStyle = '#3f7778';
    context.arc(toX(source.x), toY(source.z), (source.radius / size) * canvas.width, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
  drawSpawnEdges(context, contract.tileParams.lanes.spawnEdges, canvas.width, canvas.height);

  context.strokeStyle = 'rgba(111, 87, 50, 0.22)';
  context.lineWidth = 1;
  for (let index = 0; index <= 8; index += 1) {
    const at = (index / 8) * canvas.width;
    context.beginPath(); context.moveTo(at, 0); context.lineTo(at, canvas.height); context.stroke();
    context.beginPath(); context.moveTo(0, at); context.lineTo(canvas.width, at); context.stroke();
  }
  if (stroke.length > 1 && tool === 'zone') {
    const start = stroke[0]!;
    const end = stroke.at(-1)!;
    context.strokeStyle = '#a0522d';
    context.setLineDash([6, 4]);
    context.strokeRect(toX(Math.min(start.x, end.x)), toY(Math.max(start.z, end.z)), Math.abs(toX(end.x) - toX(start.x)), Math.abs(toY(end.z) - toY(start.z)));
    context.setLineDash([]);
  } else if (stroke.length > 1) {
    context.beginPath();
    context.strokeStyle = '#a0522d';
    context.lineWidth = 3;
    context.moveTo(toX(stroke[0]!.x), toY(stroke[0]!.z));
    for (const point of stroke.slice(1)) context.lineTo(toX(point.x), toY(point.z));
    context.stroke();
  }
  context.beginPath();
  context.strokeStyle = '#2e1b0e';
  context.lineWidth = 2;
  context.arc(toX(cursor.x), toY(cursor.z), (radiusCells * brushCellSize(contract) / size) * canvas.width, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = '#2e1b0e';
  context.font = 'bold 13px Georgia';
  context.fillText('N', canvas.width / 2 - 5, 16);
  context.strokeStyle = '#2e1b0e';
  context.lineWidth = 2;
  context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
}

function drawSpawnEdges(context: CanvasRenderingContext2D, edges: readonly ContractEdge[], width: number, height: number): void {
  context.strokeStyle = '#5b8a8a';
  context.lineWidth = 7;
  for (const edge of edges) {
    context.beginPath();
    if (edge === 'north') { context.moveTo(width * 0.35, 4); context.lineTo(width * 0.65, 4); }
    else if (edge === 'south') { context.moveTo(width * 0.35, height - 4); context.lineTo(width * 0.65, height - 4); }
    else if (edge === 'east') { context.moveTo(width - 4, height * 0.35); context.lineTo(width - 4, height * 0.65); }
    else { context.moveTo(4, height * 0.35); context.lineTo(4, height * 0.65); }
    context.stroke();
  }
}

function canvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number, contract: ContractManifest): TerrainBrushPoint {
  const rect = canvas.getBoundingClientRect();
  const size = claimSize(contract);
  const half = size / 2;
  return {
    x: clamp(((clientX - rect.left) / rect.width) * size - half, -half, half),
    z: clamp(half - ((clientY - rect.top) / rect.height) * size, -half, half),
  };
}

function nearestEdge(point: TerrainBrushPoint, half: number): ContractEdge {
  const distances: Array<[ContractEdge, number]> = [
    ['north', half - point.z],
    ['south', point.z + half],
    ['east', half - point.x],
    ['west', point.x + half],
  ];
  distances.sort((left, right) => left[1] - right[1]);
  return distances[0]![0];
}

function readBrushState(contract: ContractManifest): TerrainBrushUiState {
  const fallback: TerrainBrushUiState = {
    version: 1,
    tool: 'raise',
    radiusCells: 3,
    strength: 0.5,
    bank: 'north',
    cursor: { x: 0, z: 0 },
  };
  try {
    const raw = sessionStorage.getItem(brushStateKey(contract.id));
    if (!raw || raw.length > 512) return fallback;
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      Object.keys(value).length !== 6 ||
      value.version !== 1 ||
      !TOOLS.some((entry) => entry.id === value.tool) ||
      !Number.isInteger(value.radiusCells) ||
      (value.radiusCells as number) < 1 ||
      (value.radiusCells as number) > 8 ||
      typeof value.strength !== 'number' ||
      !Number.isFinite(value.strength) ||
      value.strength < 0.05 ||
      value.strength > 1 ||
      (value.bank !== 'north' && value.bank !== 'south') ||
      !isRecord(value.cursor) ||
      Object.keys(value.cursor).length !== 2 ||
      typeof value.cursor.x !== 'number' ||
      !Number.isFinite(value.cursor.x) ||
      typeof value.cursor.z !== 'number' ||
      !Number.isFinite(value.cursor.z)
    ) {
      return fallback;
    }
    const half = claimSize(contract) / 2;
    return {
      version: 1,
      tool: value.tool as TerrainBrushTool,
      radiusCells: value.radiusCells as number,
      strength: value.strength,
      bank: value.bank,
      cursor: { x: clamp(value.cursor.x, -half, half), z: clamp(value.cursor.z, -half, half) },
    };
  } catch {
    return fallback;
  }
}

function writeBrushState(contract: ContractManifest, state: TerrainBrushUiState): void {
  try {
    sessionStorage.setItem(brushStateKey(contract.id), JSON.stringify(state));
  } catch {}
}

function brushStateKey(contractId: string): string {
  return `${BRUSH_STATE_KEY}:${contractId}`;
}

function nextZoneId(ids: readonly string[]): string {
  for (let index = 1; index <= MAX_PAINT_SHAPES; index += 1) {
    const id = `editor-zone-${index}`;
    if (!ids.includes(id)) return id;
  }
  return `editor-zone-${MAX_PAINT_SHAPES}`;
}

function claimSize(contract: ContractManifest): number {
  const size = contract.tileParams.size ?? 64;
  return Number.isFinite(size) && size > 0 ? size : 64;
}

function brushCellSize(contract: ContractManifest): number {
  return contract.tileParams.authoredTerrain?.cellSize ?? claimSize(contract) / (GRID_DIMENSION - 1);
}

function quantize(value: number): number {
  const result = Math.round(value * 1_000) / 1_000;
  return Object.is(result, -0) ? 0 : result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function title(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
