import { stageCharterLaunch, clearCharterLaunch, type ContractManifest } from '../meta/ContractFamilies';
import { activeProfileName } from '../game/ProfileStorage';
import { charterLineageRootId, importContract, type Charter, type CharterClock } from './CharterSchema';
import { stampCharter } from './CharterStamp';
import { addCharterToShelf, readCharterShelf } from './CharterShelf';

type PressPanelOptions = {
  contract: ContractManifest;
  template: ContractManifest;
  clock?: CharterClock;
};

// The Press panel lives behind ?editor only (charter-press law 6): it stamps
// the inspector's live contract into a profile-scoped shelf and launches a
// stamped charter as a real run through the ordinary contract-launch path.
// The wall clock here is persistence metadata, never sim input.
export function createPressPanel({ contract, template, clock }: PressPanelOptions): HTMLElement {
  const stampClock: CharterClock = clock ?? (() => new Date().toISOString());
  const panel = document.createElement('section');
  panel.className = 'charter-press-panel';
  panel.dataset.testid = 'charter-press-panel';
  panel.innerHTML = `
    <header class="charter-press-panel__heading">
      <div><p>Charter Press · The Stamp floor</p><h2>Press a charter</h2></div>
      <span data-testid="press-lineage"></span>
    </header>
    <p class="charter-press-panel__return" data-testid="press-return-banner" hidden></p>
    <label class="charter-press-panel__control">
      <span>Charter name</span>
      <input type="text" autocomplete="off" data-testid="press-charter-name">
    </label>
    <p class="charter-press-panel__author" data-testid="press-author"></p>
    <button type="button" data-testid="press-stamp">Stamp this charter</button>
    <p class="charter-press-panel__status" role="status" data-testid="press-status">The press is ready.</p>
    <ul class="charter-press-panel__reasons" data-testid="press-reasons" hidden></ul>
    <section class="charter-press-panel__shelf">
      <h3>The shelf</h3>
      <ul data-testid="press-shelf"></ul>
    </section>`;

  panel.querySelector<HTMLElement>('[data-testid="press-lineage"]')!.textContent = `Pressing from ${template.name} · ${template.id}`;
  const author = activeProfileName();
  panel.querySelector<HTMLElement>('[data-testid="press-author"]')!.textContent = `Pressed by ${author}`;
  const nameInput = panel.querySelector<HTMLInputElement>('[data-testid="press-charter-name"]')!;
  nameInput.value = contract.name;
  const status = panel.querySelector<HTMLElement>('[data-testid="press-status"]')!;
  const reasonList = panel.querySelector<HTMLUListElement>('[data-testid="press-reasons"]')!;
  const shelfList = panel.querySelector<HTMLUListElement>('[data-testid="press-shelf"]')!;

  const returnBanner = panel.querySelector<HTMLElement>('[data-testid="press-return-banner"]')!;
  const pressReturn = new URLSearchParams(location.search).get('press');
  if (pressReturn?.startsWith('return-')) {
    returnBanner.hidden = false;
    returnBanner.textContent =
      pressReturn === 'return-secured'
        ? 'The run came home secured. The Press kept your place.'
        : 'The run was overrun. The Press kept your place.';
    clearCharterLaunch();
  }

  const renderShelf = () => {
    shelfList.replaceChildren();
    const entries = readCharterShelf(localStorage);
    if (entries.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'charter-press-panel__empty';
      empty.textContent = 'No charters stamped yet.';
      shelfList.append(empty);
      return;
    }
    entries.forEach((entry, index) => {
      const row = document.createElement('li');
      row.dataset.testid = 'press-shelf-row';
      const label = document.createElement('span');
      label.textContent = `${entry.charter.contract.name} — ${entry.charter.envelope.provenance.author}, ${entry.charter.envelope.provenance.createdAt.slice(0, 10)}`;
      const launch = document.createElement('button');
      launch.type = 'button';
      launch.dataset.testid = `press-launch-${index}`;
      launch.textContent = 'Launch';
      launch.addEventListener('click', () => launchCharter(entry.charter));
      row.append(label, launch);
      shelfList.append(row);
    });
  };

  const showReasons = (reasons: readonly { code: string; message: string; path?: string }[]) => {
    reasonList.replaceChildren(
      ...reasons.map((reason) => {
        const item = document.createElement('li');
        item.dataset.reasonCode = reason.code;
        item.textContent = reason.message;
        return item;
      }),
    );
    reasonList.hidden = reasons.length === 0;
  };

  panel.querySelector<HTMLButtonElement>('[data-testid="press-stamp"]')!.addEventListener('click', () => {
    const draft = structuredClone(contract);
    draft.name = nameInput.value.trim() || contract.name;
    const charter = importContract(draft, { author, clock: stampClock });
    const result = stampCharter(charter);
    if (!result.ok) {
      showReasons(result.reasons);
      status.textContent = 'The Assayer refused this charter. Nothing was stamped.';
      return;
    }
    const shelved = addCharterToShelf(localStorage, { envelope: charter.envelope, contract: result.contract });
    if (!shelved.ok) {
      showReasons([]);
      status.textContent = shelved.message;
      return;
    }
    showReasons([]);
    status.textContent = `Stamped to the shelf (${shelved.count} held).`;
    renderShelf();
  });

  const launchCharter = (charter: Charter) => {
    const result = stampCharter(charter);
    if (!result.ok) {
      showReasons(result.reasons);
      status.textContent = 'This shelved charter no longer passes the gate. It was not launched.';
      return;
    }
    const rootId = charterLineageRootId(charter);
    if (!stageCharterLaunch(rootId, result.document)) {
      status.textContent = 'The launch ledger could not hold this charter.';
      return;
    }
    const next = new URLSearchParams();
    next.set('contract', rootId);
    if (charter.envelope.seedPolicy.mode === 'fixed') next.set('seed', charter.envelope.seedPolicy.seed);
    location.href = `${location.pathname}?${next.toString()}`;
  };

  renderShelf();
  return panel;
}
