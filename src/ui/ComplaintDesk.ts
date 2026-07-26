import { gameApiUrl } from '../app/GameApi';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import { activeContract } from '../meta/ContractFamilies';
import { captureNextRenderedFrame } from '../core/Renderer';
import { canPersistProspectorSkin, grantProspectorSkin, grantReporterSet, ownedProspectorSkins } from '../game/ProspectorSkin';

export const BUG_OFFICE_COPY = {
  bounty: 'THE BOUNTY — The county will reward the three reports that help the trail most. Prize notice follows.',
} as const;

const MAX_SCREENSHOT_BYTES = 180 * 1024;

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
  private readonly upload: HTMLInputElement;
  private readonly diagnosticsLine: HTMLElement;
  private readonly status: HTMLElement;
  private readonly submitButton: HTMLButtonElement;
  private readonly prizeCode: HTMLInputElement;
  private readonly redeemButton: HTMLButtonElement;
  private screenshot = '';
  private screenshotSource: 'capture' | 'upload' = 'capture';
  private evidenceRequest = 0;
  private busy = false;
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
        <div class="complaint-desk__fields">
          <label class="complaint-desk__description">
            <span>What went wrong?</span>
            <textarea data-testid="complaint-description" maxlength="2000" rows="5" required placeholder="Tell the clerk what happened, and what you expected instead."></textarea>
          </label>
          <label>
            <span>Prospector name <small>(optional, for credit)</small></span>
            <input data-testid="complaint-name" maxlength="24" autocomplete="name" />
          </label>
          <section class="complaint-desk__moment" aria-label="The moment" data-testid="complaint-drop">
            <div>
              <strong>THE MOMENT</strong>
              <p>The scene you came in from is attached to this complaint.</p>
              <div class="complaint-desk__evidence-actions">
                <button type="button" class="death-overlay__button death-overlay__button--secondary" data-testid="complaint-retake">Retake</button>
                <label class="death-overlay__button death-overlay__button--secondary complaint-desk__upload">
                  Hand the clerk a picture
                  <input type="file" accept="image/*" data-testid="complaint-upload" />
                </label>
              </div>
              <p class="complaint-desk__upload-hint">Brought your own picture? The clerk prefers evidence from the scene of the trouble.</p>
            </div>
            <img data-testid="complaint-thumbnail" alt="The scene attached to this complaint" />
          </section>
          <p class="complaint-desk__diagnostics" data-testid="complaint-diagnostics"></p>
          <p class="complaint-desk__bounty" data-testid="complaint-bounty">${BUG_OFFICE_COPY.bounty}</p>
          <div class="complaint-desk__prize">
            <label>
              <span>Hand the clerk a prize stub</span>
              <input data-testid="prize-stub-code" maxlength="32" autocomplete="off" spellcheck="false" />
            </label>
            <button class="death-overlay__button death-overlay__button--secondary" type="button" data-testid="prize-stub-redeem">Redeem stub</button>
          </div>
        </div>
        <div class="complaint-desk__actions">
          <button class="death-overlay__button" type="submit" data-testid="complaint-submit">File complaint</button>
          <p class="complaint-desk__status" data-testid="complaint-status" aria-live="polite">The clerk is ready.</p>
        </div>
      </form>
    `;

    this.description = this.get('[data-testid="complaint-description"]');
    this.name = this.get('[data-testid="complaint-name"]');
    this.thumbnail = this.get('[data-testid="complaint-thumbnail"]');
    this.upload = this.get('[data-testid="complaint-upload"]');
    this.diagnosticsLine = this.get('[data-testid="complaint-diagnostics"]');
    this.status = this.get('[data-testid="complaint-status"]');
    this.submitButton = this.get('[data-testid="complaint-submit"]');
    this.prizeCode = this.get('[data-testid="prize-stub-code"]');
    this.redeemButton = this.get('[data-testid="prize-stub-redeem"]');
    this.root.querySelector('[data-testid="complaint-close"]')?.addEventListener('click', this.close);
    this.root.querySelector('[data-testid="complaint-retake"]')?.addEventListener('click', this.retake);
    this.redeemButton.addEventListener('click', this.redeem);
    this.upload.addEventListener('change', () => {
      const file = this.upload.files?.[0];
      this.upload.value = '';
      if (file) void this.attach(file);
    });
    const drop = this.get('[data-testid="complaint-drop"]');
    drop.addEventListener('dragover', (event) => {
      event.preventDefault();
      drop.classList.add('complaint-desk__moment--dragging');
    });
    drop.addEventListener('dragleave', () => drop.classList.remove('complaint-desk__moment--dragging'));
    drop.addEventListener('drop', (event) => {
      event.preventDefault();
      drop.classList.remove('complaint-desk__moment--dragging');
      const file = event.dataTransfer?.files[0];
      if (file) void this.attach(file);
    });
    this.root.addEventListener('submit', this.submit);
    this.root.addEventListener('keydown', this.onRootKeyDown);
    this.root.addEventListener('keyup', stopGameHotkeys);
    document.addEventListener('keydown', this.onDocumentKeyDown);
    parent.append(this.root);
  }

  focus(): void {
    const filed = this.root.dataset.state === 'filed';
    if (filed) {
      this.description.value = '';
      this.name.value = '';
      this.setStatus('The clerk is ready.', 'ready');
    }
    if (!this.busy && (this.screenshotSource !== 'upload' || filed)) this.captureMoment();
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
    if (this.busy) return;
    this.root.hidden = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.captureMoment();
      this.root.hidden = false;
      this.root.querySelector<HTMLButtonElement>('[data-testid="complaint-retake"]')?.focus();
    }));
  };

  private async attach(file: File): Promise<void> {
    if (this.busy) return;
    const request = ++this.evidenceRequest;
    if (!file.type.startsWith('image/')) {
      this.setStatus('The clerk only accepts a picture.', 'declined');
      return;
    }
    this.setBusy(true);
    this.setStatus('The clerk is fitting your picture to the ledger…', 'posting');
    try {
      const image = await createImageBitmap(file);
      const screenshot = captureJpeg(image, image.width, image.height);
      image.close();
      if (request !== this.evidenceRequest) return;
      if (!screenshot) throw new Error('Image could not be fitted');
      this.screenshot = screenshot;
      this.screenshotSource = 'upload';
      this.thumbnail.src = screenshot;
      this.thumbnail.hidden = false;
      this.setStatus('Your picture is attached.', 'ready');
    } catch {
      if (request === this.evidenceRequest) this.setStatus('The clerk could not read that picture.', 'declined');
    } finally {
      if (request === this.evidenceRequest) this.setBusy(false);
    }
  }

  private readonly submit = async (event: Event) => {
    event.preventDefault();
    if (this.busy) return;
    const description = this.description.value.trim();
    if (!description) return this.setStatus('Tell the clerk what happened first.', 'declined');
    if (!this.screenshot) return this.setStatus('The clerk needs the photograph. Retake the moment and try again.', 'declined');

    this.setBusy(true);
    this.setStatus('The clerk is filing your complaint…', 'posting');
    try {
      const response = await fetch(gameApiUrl('/api/bug-report'), {
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
      const set = grantReporterSet()
        ? " The county pays honest eyes. The Reporter's Set is yours: the Complainant's Coat and the Claim-Day Neckerchief."
        : '';
      this.setStatus(`Complaint filed. Ticket ${result.id}. The county thanks you.${set} ${BUG_OFFICE_COPY.bounty}`, 'filed');
    } catch {
      this.setStatus('The wire is down. The clerk kept your complaint on the desk — try again.', 'offline');
    } finally {
      this.setBusy(false);
    }
  };

  private readonly redeem = async () => {
    if (this.busy) return;
    const code = this.prizeCode.value.trim();
    if (!code) return this.setStatus('Hand the clerk a prize stub first.', 'declined');
    if (ownedProspectorSkins().includes('gilded')) return this.setStatus('The clerk says the Gilded Coat is already in your ledger.', 'declined');
    if (!canPersistProspectorSkin()) return this.setStatus('This browser cannot hold the coat ledger. Keep the stub and make room first.', 'declined');
    this.setBusy(true);
    this.setStatus('The clerk is checking the county seal…', 'posting');
    try {
      const response = await fetch(gameApiUrl('/api/redeem'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const result = await response.json().catch(() => ({})) as { skin?: unknown; message?: unknown };
      if (!response.ok || result.skin !== 'gilded') {
        this.setStatus(typeof result.message === 'string' ? result.message : 'The clerk declines that prize stub.', 'declined');
        return;
      }
      if (!grantProspectorSkin('gilded')) {
        this.setStatus('The clerk stamped the stub, but this browser could not hold the coat ledger.', 'declined');
        return;
      }
      this.prizeCode.value = '';
      this.setStatus('The clerk stamps the stub. The Gilded Coat is yours.', 'filed');
    } catch {
      this.setStatus('The wire is down. Keep hold of that prize stub and try again.', 'offline');
    } finally {
      this.setBusy(false);
    }
  };

  private captureMoment(): void {
    const request = ++this.evidenceRequest;
    this.screenshotSource = 'capture';
    const canvas = this.parent.querySelector<HTMLCanvasElement>('#game-canvas') ?? document.querySelector<HTMLCanvasElement>('#game-canvas');
    this.diagnostics = currentDiagnostics();
    this.diagnosticsLine.textContent = `The clerk notes: ${this.diagnostics.contractName}, wave ${this.diagnostics.wave} · position ${this.diagnostics.position.x}, ${this.diagnostics.position.z} · ${this.diagnostics.tier} · build ${this.diagnostics.version}`;
    this.screenshot = '';
    this.thumbnail.removeAttribute('src');
    this.thumbnail.hidden = true;
    if (!canvas) return this.setStatus('The clerk could not take the photograph. Retake the moment.', 'declined');
    captureNextRenderedFrame(canvas, (renderedCanvas) => {
      if (request !== this.evidenceRequest) return;
      try {
        this.screenshot = captureJpeg(renderedCanvas, renderedCanvas.width, renderedCanvas.height);
      } catch {
        this.screenshot = '';
      }
      this.thumbnail.src = this.screenshot;
      this.thumbnail.hidden = !this.screenshot;
      this.setStatus(
        this.screenshot ? 'The clerk is ready.' : 'The clerk could not take the photograph. Retake the moment.',
        this.screenshot ? 'ready' : 'declined',
      );
    });
  }

  private setStatus(message: string, state: 'ready' | 'posting' | 'filed' | 'offline' | 'declined'): void {
    this.root.dataset.state = state;
    this.status.textContent = message;
  }

  private setBusy(busy: boolean): void {
    this.busy = busy;
    this.submitButton.disabled = busy;
    this.prizeCode.disabled = busy;
    this.redeemButton.disabled = busy;
    this.upload.disabled = busy;
    const retake = this.root.querySelector<HTMLButtonElement>('[data-testid="complaint-retake"]');
    if (retake) retake.disabled = busy;
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
    version: __APP_BUILD_VARIANT__,
  };
}

function captureJpeg(source: CanvasImageSource, sourceWidth: number, sourceHeight: number): string {
  const scale = Math.min(1, 1024 / Math.max(1, sourceWidth, sourceHeight));
  const output = document.createElement('canvas');
  output.width = Math.max(1, Math.round(sourceWidth * scale));
  output.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = output.getContext('2d');
  if (!context) return '';
  context.drawImage(source, 0, 0, output.width, output.height);
  let jpeg = output.toDataURL('image/jpeg', 0.68);
  while (base64Bytes(jpeg) > MAX_SCREENSHOT_BYTES && Math.max(output.width, output.height) > 320) {
    const resize = Math.max(320 / Math.max(output.width, output.height), 0.8);
    const width = Math.max(1, Math.round(output.width * resize));
    const height = Math.max(1, Math.round(output.height * resize));
    output.width = width;
    output.height = height;
    context.drawImage(source, 0, 0, width, height);
    jpeg = output.toDataURL('image/jpeg', 0.6);
  }
  return base64Bytes(jpeg) <= MAX_SCREENSHOT_BYTES ? jpeg : '';
}

function base64Bytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return (base64.length / 4) * 3 - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function stopGameHotkeys(event: KeyboardEvent): void {
  event.stopPropagation();
}
