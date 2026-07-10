import {
  CONTRACT_EDITOR_PARAM,
  CONTRACT_EDITOR_REJECTION_LINE,
  contractDescriptorJson,
  contractNumberRange,
  activeContract,
  loadContract,
  parseContractDescriptor,
  type ContractManifest,
} from '../meta/ContractFamilies';
import './descriptor-inspector.css';

type JsonRecord = Record<string, unknown>;

const ENUMS: Record<string, readonly string[]> = {
  'tileParams.render.terrainMesh': ['required', 'preferred', 'off'],
  'tileParams.heightfield.mode': ['visual'],
  'tileParams.waterSources[].kind': ['spring_pond'],
  'tileParams.buildZones[].bank': ['north', 'south'],
  'tileParams.rails[].style': ['placeholder', 'steamworks', 'mine-spur'],
  'tileParams.prePlacedBuildables[].id': ['lantern_post'],
  'tileParams.lanes.spawnEdges[]': ['north', 'south', 'east', 'west'],
};

export function installDescriptorInspector(root: HTMLElement): void {
  const contract = structuredClone(activeContract());
  const template = loadContract(contract.id);
  const shell = document.createElement('aside');
  shell.className = 'descriptor-inspector';
  shell.dataset.testid = 'descriptor-inspector';
  shell.innerHTML = `
    <header class="descriptor-inspector__header">
      <p>Charter Press · Engine floor</p>
      <h1>Contract Inspector</h1>
      <strong data-testid="editor-contract-name"></strong>
      <span>Waves are paused while this page is open.</span>
    </header>
    <div class="descriptor-inspector__fields" data-testid="editor-fields"></div>
    <section class="descriptor-inspector__transfer">
      <h2>Descriptor page</h2>
      <div class="descriptor-inspector__actions">
        <button type="button" data-testid="editor-copy">Copy descriptor JSON</button>
        <button type="button" data-testid="editor-download">Download JSON</button>
      </div>
      <label class="descriptor-inspector__load-file">Load JSON file<input type="file" accept="application/json,.json" data-testid="editor-import-file"></label>
      <textarea rows="7" spellcheck="false" aria-label="Paste descriptor JSON" data-testid="editor-import-text"></textarea>
      <button type="button" class="descriptor-inspector__apply" data-testid="editor-import-apply">Apply pasted JSON</button>
      <p class="descriptor-inspector__status" role="status" data-testid="editor-status">Ready.</p>
      <div class="descriptor-inspector__damage" role="alert" data-testid="editor-rejection" hidden></div>
    </section>`;

  shell.querySelector<HTMLElement>('[data-testid="editor-contract-name"]')!.textContent = `${contract.name} · ${contract.id}`;
  const fields = shell.querySelector<HTMLElement>('[data-testid="editor-fields"]')!;
  renderSections(fields, contract, () => applyDescriptor(contract));

  const status = shell.querySelector<HTMLElement>('[data-testid="editor-status"]')!;
  const rejection = shell.querySelector<HTMLElement>('[data-testid="editor-rejection"]')!;
  const textarea = shell.querySelector<HTMLTextAreaElement>('[data-testid="editor-import-text"]')!;
  const showRejection = (message: string) => {
    rejection.hidden = false;
    rejection.textContent = message;
    status.textContent = 'The open contract was left untouched.';
  };
  const importText = (text: string) => {
    const parsed = parseContractDescriptor(text, template);
    if (!parsed.ok) {
      showRejection(parsed.message);
      return;
    }
    rejection.hidden = true;
    status.textContent = 'Applying the imported descriptor…';
    applyDescriptor(parsed.contract);
  };

  shell.querySelector<HTMLButtonElement>('[data-testid="editor-copy"]')!.addEventListener('click', async () => {
    const text = contractDescriptorJson(contract);
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Descriptor JSON copied.';
    } catch {
      textarea.value = text;
      textarea.select();
      document.execCommand('copy');
      status.textContent = 'Descriptor JSON selected and copied.';
    }
  });
  shell.querySelector<HTMLButtonElement>('[data-testid="editor-download"]')!.addEventListener('click', () => {
    downloadDescriptor(contract);
    status.textContent = 'Descriptor page downloaded.';
  });
  shell.querySelector<HTMLButtonElement>('[data-testid="editor-import-apply"]')!.addEventListener('click', () => importText(textarea.value));
  shell.querySelector<HTMLInputElement>('[data-testid="editor-import-file"]')!.addEventListener('change', async (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (file) importText(await file.text());
  });

  root.append(shell);
  const rawOverride = new URLSearchParams(location.search).get(CONTRACT_EDITOR_PARAM);
  if (rawOverride && !parseContractDescriptor(rawOverride, template).ok) showRejection(CONTRACT_EDITOR_REJECTION_LINE);
  window.__GR_EDITOR__ = { descriptorJson: () => contractDescriptorJson(contract), wavesPaused: true };
}

function renderSections(root: HTMLElement, contract: ContractManifest, apply: () => void): void {
  const tileParams = contract.tileParams as JsonRecord;
  const basics: JsonRecord = {};
  for (const [key, value] of Object.entries(tileParams)) {
    if (isLeaf(value) || isColorTuple(key, value)) basics[key] = value;
  }
  const commit = () => {
    Object.assign(tileParams, basics);
    apply();
  };
  root.append(section('Tile', basics, 'tileParams', commit));
  for (const [key, value] of Object.entries(tileParams)) {
    if (key in basics) continue;
    root.append(section(label(key), value, `tileParams.${key}`, commit));
  }
}

function section(title: string, value: unknown, path: string, apply: () => void): HTMLElement {
  const details = document.createElement('details');
  details.className = 'descriptor-inspector__section';
  details.dataset.editorPath = path;
  details.open = path === 'tileParams' || path.endsWith('.heightfield') || path.endsWith('.palette');
  const summary = document.createElement('summary');
  summary.textContent = title;
  details.append(summary);
  renderValue(details, value, path, apply);
  return details;
}

function renderValue(root: HTMLElement, value: unknown, path: string, apply: () => void): void {
  if (Array.isArray(value)) {
    if (isColorTuple(path.split('.').at(-1) ?? '', value)) {
      root.append(colorControl(value, path, apply));
      return;
    }
    if (value.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'descriptor-inspector__empty';
      empty.textContent = 'No entries';
      root.append(empty);
      return;
    }
    value.forEach((entry, index) => {
      const itemPath = `${path}[]`;
      if (isLeaf(entry)) root.append(control(value as unknown as JsonRecord, String(index), itemPath, entry, apply, `${index + 1}`));
      else root.append(section(`${label(path.split('.').at(-1) ?? 'entry')} ${index + 1}`, entry, itemPath, apply));
    });
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (isColorTuple(key, child)) root.append(colorControl(child, childPath, apply));
    else if (isLeaf(child)) root.append(control(value, key, childPath, child, apply));
    else root.append(section(label(key), child, childPath, apply));
  }
}

function control(owner: JsonRecord, key: string, path: string, value: unknown, apply: () => void, name = label(key)): HTMLElement {
  const row = document.createElement('label');
  row.className = 'descriptor-inspector__control';
  row.append(Object.assign(document.createElement('span'), { textContent: name }));
  const choices = ENUMS[path];
  if (choices) {
    const select = document.createElement('select');
    select.dataset.editorPath = path;
    choices.forEach((choice) => select.add(new Option(label(choice), choice, false, choice === value)));
    select.addEventListener('change', () => {
      owner[key] = select.value;
      apply();
    });
    row.append(select);
  } else if (typeof value === 'boolean') {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value;
    input.dataset.editorPath = path;
    input.addEventListener('change', () => {
      owner[key] = input.checked;
      apply();
    });
    row.append(input);
  } else if (typeof value === 'number') {
    const range = contractNumberRange(path, value);
    const slider = numberInput('range', value, range, path);
    const number = numberInput('number', value, range, path);
    slider.addEventListener('input', () => { number.value = slider.value; });
    slider.addEventListener('change', () => { owner[key] = Number(slider.value); apply(); });
    number.addEventListener('change', () => { owner[key] = Number(number.value); apply(); });
    const pair = document.createElement('span');
    pair.className = 'descriptor-inspector__number';
    pair.append(slider, number);
    row.append(pair);
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = String(value);
    input.dataset.editorPath = path;
    input.addEventListener('change', () => {
      owner[key] = input.value;
      apply();
    });
    row.append(input);
  }
  return row;
}

function colorControl(value: number[], path: string, apply: () => void): HTMLElement {
  const row = document.createElement('label');
  row.className = 'descriptor-inspector__control';
  row.append(Object.assign(document.createElement('span'), { textContent: label(path.split('.').at(-1) ?? 'color') }));
  const input = document.createElement('input');
  input.type = 'color';
  input.value = rgbToHex(value);
  input.dataset.editorPath = path;
  input.addEventListener('change', () => {
    const rgb = hexToRgb(input.value);
    value.splice(0, 3, ...rgb);
    apply();
  });
  row.append(input);
  return row;
}

function numberInput(type: 'range' | 'number', value: number, range: ReturnType<typeof contractNumberRange>, path: string): HTMLInputElement {
  const input = document.createElement('input');
  input.type = type;
  input.value = String(value);
  input.min = String(range.min);
  input.max = String(range.max);
  input.step = String(range.step);
  input.dataset.editorPath = path;
  return input;
}

function applyDescriptor(contract: ContractManifest): void {
  const url = new URL(location.href);
  url.searchParams.set('editor', '');
  url.searchParams.set('contract', contract.id);
  url.searchParams.set(CONTRACT_EDITOR_PARAM, contractDescriptorJson(contract));
  location.replace(url);
}

function downloadDescriptor(contract: ContractManifest): void {
  const link = document.createElement('a');
  link.download = `${contract.id}-descriptor.json`;
  link.href = URL.createObjectURL(new Blob([contractDescriptorJson(contract)], { type: 'application/json' }));
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

function rgbToHex(value: number[]): string {
  return `#${value.slice(0, 3).map((channel) => Math.round(Math.max(0, Math.min(1, channel)) * 255).toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgb(value: string): number[] {
  return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255);
}

function isColorTuple(key: string, value: unknown): value is number[] {
  return /(?:^|\.)tint$/i.test(key) && Array.isArray(value) && value.length === 3 && value.every((entry) => typeof entry === 'number');
}

function isLeaf(value: unknown): value is string | number | boolean {
  return ['string', 'number', 'boolean'].includes(typeof value);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function label(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase());
}
