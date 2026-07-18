import { stageCharterLaunch, clearCharterLaunch, type ContractManifest } from '../meta/ContractFamilies';
import { activeProfileName } from '../game/ProfileStorage';
import { charterLineageRootId, importContract, type Charter, type CharterClock } from './CharterSchema';
import { stampCharter } from './CharterStamp';
import { addCharterToShelf, readCharterShelf } from './CharterShelf';
import {
  createLeverCharter,
  LEVER_LANDS,
  LEVER_STORIES,
  LEVER_VISITORS,
  type LeverLandId,
  type LeverStoryId,
  type LeverVisitorsId,
} from './templates/LeverTemplates';
import './press-panel.css';

type PressPanelOptions = {
  contract: ContractManifest;
  template: ContractManifest;
  clock?: CharterClock;
  nameDraft?: string;
  onNameDraftChanged?: (name: string) => void;
  onStamped?: (contract: ContractManifest) => void;
};

// The Press panel lives behind ?editor only (charter-press law 6): it stamps
// the inspector's live contract into a profile-scoped shelf and launches a
// stamped charter as a real run through the ordinary contract-launch path.
// The wall clock here is persistence metadata, never sim input.
export function createPressPanel({ contract, template, clock, nameDraft, onNameDraftChanged, onStamped }: PressPanelOptions): HTMLElement {
  const stampClock: CharterClock = clock ?? (() => new Date().toISOString());
  const panel = document.createElement('section');
  panel.className = 'charter-press-panel';
  panel.dataset.testid = 'charter-press-panel';
  panel.innerHTML = `
    <header class="charter-press-panel__heading">
      <div><p>Charter Press · The Stamp floor</p><h2 data-testid="press-title">Press a charter</h2></div>
      <span data-testid="press-lineage"></span>
    </header>
    <nav class="charter-press-panel__modes" aria-label="Press mode">
      <button type="button" data-testid="press-mode-full" aria-pressed="true">Full Press</button>
      <button type="button" data-testid="press-mode-lever" aria-pressed="false">The Lever</button>
    </nav>
    <p class="charter-press-panel__return" data-testid="press-return-banner" hidden></p>
    <div class="charter-press-panel__face charter-press-panel__full" data-testid="press-full-mode">
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
      </section>
    </div>
    <div class="charter-press-panel__face charter-lever" data-testid="press-lever-mode" hidden>
      <p class="charter-lever__intro">Pick what feels right. You can change any choice until you pull the lever.</p>
      <fieldset data-testid="lever-land-cards">
        <legend>Pick a land</legend>
        <div class="charter-lever__choices charter-lever__lands">
          ${LEVER_LANDS.map((choice, index) => `<button class="charter-lever__choice charter-lever__land" type="button" data-lever-land="${choice.id}" data-testid="lever-land-${choice.id}" aria-pressed="${index === 0}"><img src="${choice.imageUrl}" alt=""><span>${choice.label}</span><small>${choice.blurb}</small></button>`).join('')}
        </div>
      </fieldset>
      <fieldset>
        <legend>Pick a story</legend>
        <div class="charter-lever__choices">
          ${LEVER_STORIES.map((choice, index) => `<button class="charter-lever__choice" type="button" data-lever-story="${choice.id}" data-testid="lever-story-${choice.id}" aria-pressed="${index === 0}"><span>${choice.label}</span><small>${choice.blurb}</small></button>`).join('')}
        </div>
      </fieldset>
      <fieldset>
        <legend>Pick who visits</legend>
        <div class="charter-lever__choices">
          ${LEVER_VISITORS.map((choice, index) => `<button class="charter-lever__choice" type="button" data-lever-visitors="${choice.id}" data-testid="lever-visitors-${choice.id}" aria-pressed="${index === 0}"><span>${choice.label}</span><small>${choice.blurb}</small></button>`).join('')}
        </div>
      </fieldset>
      <button class="charter-lever__press" type="button" data-testid="lever-press">PRESS THE LEVER</button>
      <p class="charter-lever__status" role="status" data-testid="lever-status">The Press is ready when you are.</p>
    </div>`;

  panel.querySelector<HTMLElement>('[data-testid="press-lineage"]')!.textContent = `Pressing from ${template.name} · ${template.id}`;
  const author = activeProfileName();
  panel.querySelector<HTMLElement>('[data-testid="press-author"]')!.textContent = `Pressed by ${author}`;
  const nameInput = panel.querySelector<HTMLInputElement>('[data-testid="press-charter-name"]')!;
  nameInput.value = nameDraft ?? contract.name;
  nameInput.addEventListener('input', () => onNameDraftChanged?.(nameInput.value));
  const status = panel.querySelector<HTMLElement>('[data-testid="press-status"]')!;
  const reasonList = panel.querySelector<HTMLUListElement>('[data-testid="press-reasons"]')!;
  const shelfList = panel.querySelector<HTMLUListElement>('[data-testid="press-shelf"]')!;
  const fullMode = panel.querySelector<HTMLElement>('[data-testid="press-full-mode"]')!;
  const leverMode = panel.querySelector<HTMLElement>('[data-testid="press-lever-mode"]')!;
  const title = panel.querySelector<HTMLElement>('[data-testid="press-title"]')!;

  const setMode = (mode: 'full' | 'lever') => {
    fullMode.hidden = mode !== 'full';
    leverMode.hidden = mode !== 'lever';
    panel.querySelector<HTMLButtonElement>('[data-testid="press-mode-full"]')!.setAttribute('aria-pressed', String(mode === 'full'));
    panel.querySelector<HTMLButtonElement>('[data-testid="press-mode-lever"]')!.setAttribute('aria-pressed', String(mode === 'lever'));
    title.textContent = mode === 'full' ? 'Press a charter' : 'The Lever';
  };
  panel.querySelector<HTMLButtonElement>('[data-testid="press-mode-full"]')!.addEventListener('click', () => setMode('full'));
  panel.querySelector<HTMLButtonElement>('[data-testid="press-mode-lever"]')!.addEventListener('click', () => setMode('lever'));

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

  const launchStampedCharter = (charter: Charter, document: string): boolean => {
    const rootId = charterLineageRootId(charter);
    if (!stageCharterLaunch(rootId, document)) return false;
    const next = new URLSearchParams();
    next.set('contract', rootId);
    if (charter.envelope.seedPolicy.mode === 'fixed') next.set('seed', charter.envelope.seedPolicy.seed);
    if (charter.envelope.runPolicy?.waves === 'none') next.set('nowaves', '');
    location.href = `${location.pathname}?${next.toString()}`;
    return true;
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
    onStamped?.(result.contract);
    renderShelf();
  });

  const launchCharter = (charter: Charter) => {
    const result = stampCharter(charter);
    if (!result.ok) {
      showReasons(result.reasons);
      status.textContent = 'This shelved charter no longer passes the gate. It was not launched.';
      return;
    }
    if (!launchStampedCharter(charter, result.document)) {
      status.textContent = 'The launch ledger could not hold this charter.';
    }
  };

  let selectedLand: LeverLandId = LEVER_LANDS[0].id;
  let selectedStory: LeverStoryId = LEVER_STORIES[0].id;
  let selectedVisitors: LeverVisitorsId = LEVER_VISITORS[0].id;
  for (const choice of LEVER_LANDS) {
    panel.querySelector<HTMLButtonElement>(`[data-lever-land="${choice.id}"]`)!.addEventListener('click', () => {
      selectedLand = choice.id;
      panel.querySelectorAll<HTMLButtonElement>('[data-lever-land]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.leverLand === choice.id)));
    });
  }
  for (const choice of LEVER_STORIES) {
    panel.querySelector<HTMLButtonElement>(`[data-lever-story="${choice.id}"]`)!.addEventListener('click', () => {
      selectedStory = choice.id;
      panel.querySelectorAll<HTMLButtonElement>('[data-lever-story]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.leverStory === choice.id)));
    });
  }
  for (const choice of LEVER_VISITORS) {
    panel.querySelector<HTMLButtonElement>(`[data-lever-visitors="${choice.id}"]`)!.addEventListener('click', () => {
      selectedVisitors = choice.id;
      panel.querySelectorAll<HTMLButtonElement>('[data-lever-visitors]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.leverVisitors === choice.id)));
    });
  }

  const leverStatus = panel.querySelector<HTMLElement>('[data-testid="lever-status"]')!;
  panel.querySelector<HTMLButtonElement>('[data-testid="lever-press"]')!.addEventListener('click', () => {
    const charter = createLeverCharter(selectedLand, selectedStory, selectedVisitors, { author, clock: stampClock });
    const result = stampCharter(charter);
    if (!result.ok) {
      leverStatus.textContent = 'The Press needs a grown-up to check its paper.';
      return;
    }
    const shelved = addCharterToShelf(localStorage, { envelope: charter.envelope, contract: result.contract });
    if (!shelved.ok) {
      leverStatus.textContent = 'The charter is safe, but the shelf needs a grown-up.';
      return;
    }
    leverStatus.textContent = 'Stamped! Opening your world…';
    if (!launchStampedCharter(charter, result.document)) leverStatus.textContent = 'The world is ready, but the launch ledger needs a grown-up.';
  });

  renderShelf();
  return panel;
}
