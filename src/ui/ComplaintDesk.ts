import { performanceTierDiagnostics } from '../game/PerformanceTier';
import { activeContract } from '../meta/ContractFamilies';
import { captureNextRenderedFrame } from '../core/Renderer';

export const BUG_OFFICE_COPY = {
  bounty: 'THE BOUNTY — The county will reward the three reports that help the trail most. Prize notice follows.',
} as const;

type ComplaintDiagnostics = {
  contractId: string;
  contractName: string;
  wave: number;
  position: { x: number; z: number };
  tier: 'FULL' | 'BALANCED' | 'LITE';
  version: string;
};

export class ComplaintDeskPanel {
  private readonly root = document.createElement('section');
  private readonly description: HTMLTextAreaElement;
  private readonly name: HTMLInputElement;
  private readonly thumbnail: HTMLImageElement;
  private readonly diagnosticsLine: HTMLElement;
  private readonly status: HTMLElement;
  private readonly submitButton: HTMLButtonElement;
  private screenshot = '';
  private diagnostics = currentDiagnostics();

  constructor(private readonly parent: HTMLElement) {
    this.root.className = 'complaint-desk town-ui__board-shell';
    this.root.dataset.testid = 'complaint-desk';
    this.root.dataset.assayOfficeSurface = '';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-label', 'The Complaints Desk');
    this.root.innerHTML = `
      <header class="complaint-desk__header">
        <div>
          <p class="complaint-desk__eyebrow">Assay Office · testing ledger</p>
          <h2>THE COMPLAINTS DESK</h2>
          <p>The clerk takes the trouble exactly where you found it.</p>
        </div>
        <button class="complaint-desk__close" type="button" aria-label="Close The Complaints Desk" data-testid="complaint-close">✕</button>
      </header>
      <form class="complaint-desk__body" data-testid="complaint-form">
        <label class="complaint-desk__description">
          <span>What went wrong?</span>
          <textarea data-testid="complaint-description" maxlength="2000" rows="5" required placeholder="Tell the clerk what happened, and what you expected instead."></textarea>
        </label>
        <label>
          <span>Prospector name <small>(optional, for credit)</small></span>
          <input data-testid="complaint-name" maxlength="24" autocomplete="name" />
        </label>
        <section class="complaint-desk__moment" aria-label="The moment">
          <div>
            <strong>THE MOMENT</strong>
            <p>The scene you came in from is attached to this complaint.</p>
            <button type="button" class="death-overlay__button death-overlay__button--secondary" data-testid="complaint-retake">Retake</button>
          </div>
          <img data-testid="complaint-thumbnail" alt="The scene attached to this complaint" />
        </section>
        <p class="complaint-desk__diagnostics" data-testid="complaint-diagnostics"></p>
        <p class="complaint-desk__bounty" data-testid="complaint-bounty">${BUG_OFFICE_COPY.bounty}</p>
        <div class="complaint-desk__actions">
          <button class="death-overlay__button" type="submit" data-testid="complaint-submit">File complaint</button>
          <p class="complaint-desk__status" data-testid="complaint-status" aria-live="polite">The clerk is ready.</p>
        </div>
      </form>
    `;

    this.description = this.get('[data-testid="complaint-description"]');
    this.name = this.get('[data-testid="complaint-name"]');
    this.thumbnail = this.get('[data-testid="complaint-thumbnail"]');
    this.diagnosticsLine = this.get('[data-testid="complaint-diagnostics"]');
    this.status = this.get('[data-testid="complaint-status"]');
    this.submitButton = this.get('[data-testid="complaint-submit"]');
    this.root.querySelector('[data-testid="complaint-close"]')?.addEventListener('click', this.close);
    this.root.querySelector('[data-testid="complaint-retake"]')?.addEventListener('click', this.retake);
    this.root.addEventListener('submit', this.submit);
    this.root.addEventListener('keydown', this.onRootKeyDown);
    this.root.addEventListener('keyup', stopGameHotkeys);
    document.addEventListener('keydown', this.onDocumentKeyDown);
    parent.append(this.root);
  }

  focus(): void {
    if (this.root.dataset.state === 'filed') {
      this.description.value = '';
      this.name.value = '';
      this.setStatus('The clerk is ready.', 'ready');
    }
    this.captureMoment();
    this.root.hidden = false;
    this.description.focus();
  }

  dispose(): void {
    document.removeEventListener('keydown', this.onDocumentKeyDown);
    this.root.remove();
  }

  private readonly close = () => {
    this.root.hidden = true;
  };

  private readonly onRootKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
    event.stopPropagation();
  };

  private readonly onDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || this.root.hidden) return;
    event.preventDefault();
    this.close();
    event.stopPropagation();
  };

  private readonly retake = () => {
    this.root.hidden = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.captureMoment();
      this.root.hidden = false;
      this.root.querySelector<HTMLButtonElement>('[data-testid="complaint-retake"]')?.focus();
    }));
  };

  private readonly submit = async (event: Event) => {
    event.preventDefault();
    const description = this.description.value.trim();
    if (!description) return this.setStatus('Tell the clerk what happened first.', 'declined');
    if (!this.screenshot) return this.setStatus('The clerk needs the photograph. Retake the moment and try again.', 'declined');

    this.submitButton.disabled = true;
    this.setStatus('The clerk is filing your complaint…', 'posting');
    try {
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          description,
          ...(this.name.value.trim() ? { prospectorName: this.name.value.trim() } : {}),
          screenshot: this.screenshot,
          diagnostics: {
            contractId: this.diagnostics.contractId,
            wave: this.diagnostics.wave,
            position: this.diagnostics.position,
            tier: this.diagnostics.tier,
            version: this.diagnostics.version,
          },
        }),
      });
      const result = await response.json().catch(() => ({})) as { id?: unknown; message?: unknown };
      if (!response.ok || typeof result.id !== 'string') {
        this.setStatus(typeof result.message === 'string' ? result.message : 'The clerk declined that page. Check it and try again.', 'declined');
        return;
      }
      this.setStatus(`Complaint filed. Ticket ${result.id}. The county thanks you. ${BUG_OFFICE_COPY.bounty}`, 'filed');
    } catch {
      this.setStatus('The wire is down. The clerk kept your complaint on the desk — try again.', 'offline');
    } finally {
      this.submitButton.disabled = false;
    }
  };

  private captureMoment(): void {
    const canvas = this.parent.querySelector<HTMLCanvasElement>('#game-canvas') ?? document.querySelector<HTMLCanvasElement>('#game-canvas');
    this.diagnostics = currentDiagnostics();
    this.diagnosticsLine.textContent = `The clerk notes: ${this.diagnostics.contractName}, wave ${this.diagnostics.wave} · position ${this.diagnostics.position.x}, ${this.diagnostics.position.z} · ${this.diagnostics.tier} · build ${this.diagnostics.version}`;
    this.screenshot = '';
    this.thumbnail.removeAttribute('src');
    this.thumbnail.hidden = true;
    if (!canvas) return this.setStatus('The clerk could not take the photograph. Retake the moment.', 'declined');
    captureNextRenderedFrame(canvas, (renderedCanvas) => {
      try {
        this.screenshot = captureJpeg(renderedCanvas);
      } catch {
        this.screenshot = '';
      }
      this.thumbnail.src = this.screenshot;
      this.thumbnail.hidden = !this.screenshot;
      if (!this.screenshot) this.setStatus('The clerk could not take the photograph. Retake the moment.', 'declined');
    });
  }

  private setStatus(message: string, state: 'ready' | 'posting' | 'filed' | 'offline' | 'declined'): void {
    this.root.dataset.state = state;
    this.status.textContent = message;
  }

  private get<T extends HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing complaint desk element: ${selector}`);
    return element;
  }
}

function currentDiagnostics(): ComplaintDiagnostics {
  const contract = activeContract();
  const run = window.__THREE_GAME_DIAGNOSTICS__;
  const town = window.__GR_TOWN_DIAGNOSTICS__;
  const position = run?.heroPos ?? town?.player ?? { x: 0, z: 0 };
  return {
    contractId: contract.id,
    contractName: contract.name,
    wave: Math.max(0, Math.trunc(run?.wave ?? 0)),
    position: { x: round2(position.x), z: round2(position.z) },
    tier: performanceTierDiagnostics().tier.toUpperCase() as ComplaintDiagnostics['tier'],
    version: __APP_BUILD__,
  };
}

function captureJpeg(source: HTMLCanvasElement): string {
  const scale = Math.min(1, 1024 / Math.max(1, source.width));
  const output = document.createElement('canvas');
  output.width = Math.max(1, Math.round(source.width * scale));
  output.height = Math.max(1, Math.round(source.height * scale));
  const context = output.getContext('2d');
  if (!context) return '';
  context.drawImage(source, 0, 0, output.width, output.height);
  let jpeg = output.toDataURL('image/jpeg', 0.68);
  while (jpeg.length > 240_000 && output.width > 320) {
    const width = Math.max(320, Math.round(output.width * 0.8));
    const height = Math.max(1, Math.round(output.height * width / output.width));
    output.width = width;
    output.height = height;
    context.drawImage(source, 0, 0, width, height);
    jpeg = output.toDataURL('image/jpeg', 0.6);
  }
  return jpeg;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function stopGameHotkeys(event: KeyboardEvent): void {
  event.stopPropagation();
}
