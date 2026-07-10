import {
  LabPlayback,
  PLAYBOOK_GRID_HEIGHT,
  PLAYBOOK_GRID_WIDTH,
  PLAYBOOK_TICK_RATE,
  corruptPlaybook,
  createRecordedPlaybook,
  type LabCall,
  type LabPlaybackEvent,
  type LabPlaybook,
  type LabPoint,
  type LabRecordedStep,
} from './PlaybookModel';

type LabPhase = 'idle' | 'recording' | 'ready' | 'agent-replay' | 'echo-replay';
type LabHandle = {
  snapshot: () => {
    tick: number;
    phase: LabPhase;
    steps: number;
    hash: string | null;
    corruptedHash: string | null;
    player: LabPoint;
    agent: LabPoint;
    echo: LabPoint;
  };
  dispose: () => void;
};
type LabWindow = Window & { __GR_PLAYBOOK_LAB__?: LabHandle };

const START: LabPoint = { x: 1, z: 2 };
const STEP_MS = 1_000 / PLAYBOOK_TICK_RATE;
const MAX_STEPS_PER_FRAME = 5;

export function installPlaybookLab(root: HTMLElement = document.body): LabHandle | null {
  const target = window as LabWindow;
  if (target.__GR_PLAYBOOK_LAB__) return target.__GR_PLAYBOOK_LAB__;
  const params = new URLSearchParams(window.location.search);
  if (!params.has('debug') || !params.has('playbook')) return null;

  installStyle();
  const shell = document.createElement('section');
  shell.className = 'playbook-lab';
  shell.dataset.testid = 'playbook-lab';
  shell.innerHTML = `
    <header class="playbook-lab__header">
      <div>
        <p class="playbook-lab__eyebrow">Signal Era · throwaway semantics lab</p>
        <h1>The Punch-Tape Lab</h1>
        <p>Record a patrol, validate the tape, hand it to an agent, then let the Echo corrupt one bounded instruction.</p>
      </div>
      <button type="button" class="playbook-lab__close" data-testid="lab-close" aria-label="Close playbook lab">×</button>
    </header>
    <div class="playbook-lab__body">
      <main class="playbook-lab__stage">
        <div class="playbook-lab__objective">
          <strong>Objective</strong>
          <span>Record at least one move and one signal mark. Click cells or use WASD/arrow keys; press Space to mark.</span>
        </div>
        <div class="playbook-lab__grid" data-testid="lab-grid" role="grid" aria-label="Playbook demonstration grid"></div>
        <div class="playbook-lab__legend" aria-label="Grid legend">
          <span><b class="token token--player">P</b> player</span>
          <span><b class="token token--agent">A</b> agent replay</span>
          <span><b class="token token--echo">E</b> Echo mirror</span>
          <span><b class="token token--mark">✦</b> signal / jam</span>
        </div>
        <div class="playbook-lab__controls">
          <button type="button" data-testid="lab-start">Start recording</button>
          <button type="button" data-testid="lab-mark">Mark signal</button>
          <button type="button" data-testid="lab-finish">Finish + validate</button>
          <button type="button" data-testid="lab-replay">Replay agent</button>
          <button type="button" data-testid="lab-corrupt">Corrupt once</button>
          <button type="button" data-testid="lab-echo">Run Echo</button>
          <button type="button" data-testid="lab-reset">Reset</button>
        </div>
      </main>
      <aside class="playbook-lab__ledger">
        <dl>
          <div><dt>fixed tick</dt><dd data-testid="lab-tick">0</dd></div>
          <div><dt>state</dt><dd data-testid="lab-phase">idle</dd></div>
          <div><dt>validation</dt><dd data-testid="lab-status">Not recorded.</dd></div>
          <div><dt>recorded hash</dt><dd data-testid="lab-hash">—</dd></div>
          <div><dt>corrupted hash</dt><dd data-testid="lab-corrupt-hash">—</dd></div>
        </dl>
        <h2>Canonical tape</h2>
        <pre data-testid="lab-json">{}</pre>
        <h2>Receipts</h2>
        <ol data-testid="lab-log"></ol>
      </aside>
    </div>
  `;
  root.append(shell);

  const grid = required<HTMLElement>(shell, '[data-testid="lab-grid"]');
  const cells = new Map<string, HTMLButtonElement>();
  for (let z = 0; z < PLAYBOOK_GRID_HEIGHT; z += 1) {
    for (let x = 0; x < PLAYBOOK_GRID_WIDTH; x += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'playbook-lab__cell';
      cell.dataset.testid = `lab-cell-${x}-${z}`;
      cell.dataset.x = String(x);
      cell.dataset.z = String(z);
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Move demonstration to ${x}, ${z}`);
      cell.addEventListener('click', () => queuePlayerCall({ tool: 'lab.move_to', args: { target: { x, z } } }));
      grid.append(cell);
      cells.set(pointKey({ x, z }), cell);
    }
  }

  const tickOut = required<HTMLElement>(shell, '[data-testid="lab-tick"]');
  const phaseOut = required<HTMLElement>(shell, '[data-testid="lab-phase"]');
  const statusOut = required<HTMLElement>(shell, '[data-testid="lab-status"]');
  const hashOut = required<HTMLElement>(shell, '[data-testid="lab-hash"]');
  const corruptHashOut = required<HTMLElement>(shell, '[data-testid="lab-corrupt-hash"]');
  const jsonOut = required<HTMLElement>(shell, '[data-testid="lab-json"]');
  const logOut = required<HTMLOListElement>(shell, '[data-testid="lab-log"]');
  const startButton = required<HTMLButtonElement>(shell, '[data-testid="lab-start"]');
  const markButton = required<HTMLButtonElement>(shell, '[data-testid="lab-mark"]');
  const finishButton = required<HTMLButtonElement>(shell, '[data-testid="lab-finish"]');
  const replayButton = required<HTMLButtonElement>(shell, '[data-testid="lab-replay"]');
  const corruptButton = required<HTMLButtonElement>(shell, '[data-testid="lab-corrupt"]');
  const echoButton = required<HTMLButtonElement>(shell, '[data-testid="lab-echo"]');
  const resetButton = required<HTMLButtonElement>(shell, '[data-testid="lab-reset"]');

  let phase: LabPhase = 'idle';
  let tick = 0;
  let recordingStartTick = 0;
  let player = clonePoint(START);
  let agent = clonePoint(START);
  let echo = mirrorPoint(START);
  let recorded: LabRecordedStep[] = [];
  let playbook: LabPlaybook | null = null;
  let corrupted: LabPlaybook | null = null;
  let manual: LabPlayback | null = null;
  let manualCall: LabCall | null = null;
  let manualAtTick = 0;
  let replay: LabPlayback | null = null;
  let status = 'Not recorded.';
  const playerMarks = new Set<string>();
  const agentMarks = new Set<string>();
  const echoMarks = new Set<string>();
  const receipts: string[] = [];
  let lastFrame = performance.now();
  let accumulator = 0;
  let frame = 0;
  let disposed = false;

  function startRecording(): void {
    resetState();
    phase = 'recording';
    recordingStartTick = tick;
    status = 'Recording accepted semantic calls.';
    addReceipt('recording opened at a fixed-tick boundary');
    render();
  }

  function queuePlayerCall(call: LabCall): void {
    if (phase !== 'recording' || manual) return;
    if (call.tool === 'lab.move_to' && samePoint(call.args.target, player)) return;
    const acceptedAt = tick + 1;
    manualAtTick = Math.max(1, acceptedAt - recordingStartTick);
    manualCall = cloneCall(call);
    const oneStep = createRecordedPlaybook('manual command', player, [{ atTick: 1, call }]);
    manual = new LabPlayback(oneStep, 'agent');
    addReceipt(`queued ${formatCall(call)} for tick ${acceptedAt}`);
    render();
  }

  function finishRecording(): void {
    if (phase !== 'recording' || manual) return;
    if (recorded.length < 1) {
      status = 'Record at least one accepted call.';
      render();
      return;
    }
    try {
      playbook = createRecordedPlaybook('Ridge patrol', START, recorded);
      corrupted = null;
      phase = 'ready';
      status = `VALID · ${recorded.length} steps · authority unchanged`;
      addReceipt(`validator accepted ${playbook.hash}`);
    } catch (error) {
      status = `REJECTED · ${error instanceof Error ? error.message : String(error)}`;
    }
    render();
  }

  function replayAgent(): void {
    if (!playbook) return;
    replay = new LabPlayback(playbook, 'agent');
    agent = clonePoint(replay.snapshot.position);
    agentMarks.clear();
    phase = 'agent-replay';
    status = 'Agent replay is consuming the validated tape.';
    addReceipt(`agent accepted ${playbook.hash}`);
    render();
  }

  function corruptOnce(): void {
    if (!playbook) return;
    const result = corruptPlaybook(playbook, 'static-wave-7');
    if (!result.ok) {
      status = `CORRUPTION REJECTED · ${result.reasons.join(' ')}`;
      render();
      return;
    }
    corrupted = result.value;
    status = `VALID CORRUPTION · ${corrupted.provenance.mutation} · same tool allowlist`;
    addReceipt(`bounded mutator produced ${corrupted.hash}`);
    render();
  }

  function replayEcho(): void {
    const tape = corrupted ?? playbook;
    if (!tape) return;
    replay = new LabPlayback(tape, 'echo');
    echo = clonePoint(replay.snapshot.position);
    echoMarks.clear();
    phase = 'echo-replay';
    status = 'Echo is mirroring a validated tape through an enemy-only adapter.';
    addReceipt(`Echo accepted ${tape.hash}; player tools remain unreachable`);
    render();
  }

  function resetState(): void {
    phase = 'idle';
    tick = 0;
    recordingStartTick = 0;
    player = clonePoint(START);
    agent = clonePoint(START);
    echo = mirrorPoint(START);
    recorded = [];
    playbook = null;
    corrupted = null;
    manual = null;
    manualCall = null;
    manualAtTick = 0;
    replay = null;
    status = 'Not recorded.';
    playerMarks.clear();
    agentMarks.clear();
    echoMarks.clear();
    receipts.length = 0;
    render();
  }

  function fixedUpdate(): void {
    tick += 1;
    if (manual) {
      const events = manual.advance();
      player = clonePoint(manual.snapshot.position);
      for (const event of events) {
        if (event.type === 'marked') playerMarks.add(pointKey(event.position));
      }
      if (manual.snapshot.status === 'complete' && manualCall) {
        recorded.push({ atTick: manualAtTick, call: cloneCall(manualCall) });
        addReceipt(`recorded ${formatCall(manualCall)} at step ${recorded.length - 1}`);
        manual = null;
        manualCall = null;
      }
    }

    if (replay) {
      const events = replay.advance();
      if (phase === 'agent-replay') agent = clonePoint(replay.snapshot.position);
      if (phase === 'echo-replay') echo = clonePoint(replay.snapshot.position);
      consumeReplayEvents(events);
      if (replay.snapshot.status !== 'running') {
        status = replay.snapshot.status === 'complete' ? `${phase === 'echo-replay' ? 'Echo' : 'Agent'} replay complete.` : `Replay failed: ${replay.snapshot.reason}`;
        addReceipt(status);
        replay = null;
        phase = 'ready';
      }
    }
    render();
  }

  function consumeReplayEvents(events: readonly LabPlaybackEvent[]): void {
    for (const event of events) {
      if (event.type === 'marked') agentMarks.add(pointKey(event.position));
      if (event.type === 'jammed') echoMarks.add(pointKey(event.position));
      if (event.type === 'accepted') addReceipt(`${phase === 'echo-replay' ? 'Echo' : 'agent'} step ${event.step}: ${event.tool}`);
    }
  }

  function loop(now: number): void {
    if (disposed) return;
    accumulator += Math.min(250, now - lastFrame);
    lastFrame = now;
    let steps = 0;
    while (accumulator >= STEP_MS && steps < MAX_STEPS_PER_FRAME) {
      fixedUpdate();
      accumulator -= STEP_MS;
      steps += 1;
    }
    frame = requestAnimationFrame(loop);
  }

  function render(): void {
    tickOut.textContent = String(tick);
    phaseOut.textContent = phase;
    statusOut.textContent = status;
    hashOut.textContent = playbook?.hash ?? '—';
    corruptHashOut.textContent = corrupted?.hash ?? '—';
    jsonOut.textContent = JSON.stringify(corrupted ?? playbook ?? {}, null, 2);
    startButton.disabled = phase === 'recording' || phase === 'agent-replay' || phase === 'echo-replay';
    markButton.disabled = phase !== 'recording' || Boolean(manual);
    finishButton.disabled = phase !== 'recording' || Boolean(manual) || recorded.length === 0;
    replayButton.disabled = !playbook || phase === 'recording' || Boolean(replay);
    corruptButton.disabled = !playbook || phase === 'recording' || Boolean(replay);
    echoButton.disabled = !playbook || phase === 'recording' || Boolean(replay);

    for (const [key, cell] of cells) {
      const tokens: string[] = [];
      if (key === pointKey(player)) tokens.push('<span class="token token--player" data-testid="lab-player">P</span>');
      if (key === pointKey(agent)) tokens.push('<span class="token token--agent" data-testid="lab-agent">A</span>');
      if (key === pointKey(echo)) tokens.push('<span class="token token--echo" data-testid="lab-echo-token">E</span>');
      if (playerMarks.has(key) || agentMarks.has(key) || echoMarks.has(key)) {
        const kind = echoMarks.has(key) ? 'jam' : 'mark';
        tokens.push(`<span class="token token--mark" data-mark-kind="${kind}">✦</span>`);
      }
      cell.innerHTML = tokens.join('');
      cell.disabled = phase !== 'recording' || Boolean(manual);
    }

    logOut.replaceChildren(
      ...receipts.map((line) => {
        const item = document.createElement('li');
        item.textContent = line;
        return item;
      }),
    );
  }

  function addReceipt(line: string): void {
    receipts.unshift(`t${tick.toString().padStart(4, '0')} · ${line}`);
    if (receipts.length > 10) receipts.length = 10;
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (phase !== 'recording' || manual) return;
    const directions: Record<string, LabPoint> = {
      ArrowUp: { x: 0, z: -1 },
      KeyW: { x: 0, z: -1 },
      ArrowDown: { x: 0, z: 1 },
      KeyS: { x: 0, z: 1 },
      ArrowLeft: { x: -1, z: 0 },
      KeyA: { x: -1, z: 0 },
      ArrowRight: { x: 1, z: 0 },
      KeyD: { x: 1, z: 0 },
    };
    if (event.code === 'Space') {
      event.preventDefault();
      queuePlayerCall({ tool: 'lab.mark', args: { label: 'signal' } });
      return;
    }
    const direction = directions[event.code];
    if (!direction) return;
    event.preventDefault();
    const targetPoint = { x: player.x + direction.x, z: player.z + direction.z };
    if (targetPoint.x < 0 || targetPoint.x >= PLAYBOOK_GRID_WIDTH || targetPoint.z < 0 || targetPoint.z >= PLAYBOOK_GRID_HEIGHT) return;
    queuePlayerCall({ tool: 'lab.move_to', args: { target: targetPoint } });
  };

  startButton.addEventListener('click', startRecording);
  markButton.addEventListener('click', () => queuePlayerCall({ tool: 'lab.mark', args: { label: 'signal' } }));
  finishButton.addEventListener('click', finishRecording);
  replayButton.addEventListener('click', replayAgent);
  corruptButton.addEventListener('click', corruptOnce);
  echoButton.addEventListener('click', replayEcho);
  resetButton.addEventListener('click', resetState);
  shell.querySelector('[data-testid="lab-close"]')?.addEventListener('click', () => handle.dispose());
  document.addEventListener('keydown', onKeyDown);

  const handle: LabHandle = {
    snapshot: () => ({
      tick,
      phase,
      steps: recorded.length,
      hash: playbook?.hash ?? null,
      corruptedHash: corrupted?.hash ?? null,
      player: clonePoint(player),
      agent: clonePoint(agent),
      echo: clonePoint(echo),
    }),
    dispose: () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      shell.remove();
      if (target.__GR_PLAYBOOK_LAB__ === handle) target.__GR_PLAYBOOK_LAB__ = undefined;
    },
  };

  target.__GR_PLAYBOOK_LAB__ = handle;
  render();
  frame = requestAnimationFrame(loop);
  return handle;
}

function installStyle(): void {
  if (document.querySelector('[data-playbook-lab-style]')) return;
  const style = document.createElement('style');
  style.dataset.playbookLabStyle = '';
  style.textContent = `
    .playbook-lab { position: fixed; inset: 0; z-index: 10000; overflow: auto; color: #2b2118; background: radial-gradient(circle at 20% 0%, #f6d99a, #c38c4f 52%, #5c4434); font-family: Georgia, serif; }
    .playbook-lab * { box-sizing: border-box; }
    .playbook-lab__header { display: flex; justify-content: space-between; gap: 1rem; padding: 1.2rem clamp(1rem, 4vw, 3rem); color: #fdf0c8; background: #2b2118; border-bottom: 3px solid #a96c3b; }
    .playbook-lab__header h1 { margin: .1rem 0 .3rem; font-size: clamp(1.5rem, 4vw, 2.5rem); }
    .playbook-lab__header p { max-width: 54rem; margin: 0; line-height: 1.35; }
    .playbook-lab__eyebrow { color: #7fd0c5; font: 700 .75rem/1.2 ui-monospace, monospace; letter-spacing: .12em; text-transform: uppercase; }
    .playbook-lab__close { align-self: start; min-width: 44px; min-height: 44px; border: 1px solid #f3d592; border-radius: 50%; color: #fdf0c8; background: transparent; font-size: 1.5rem; }
    .playbook-lab__body { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(18rem, .8fr); gap: 1rem; width: min(1180px, 100%); margin: 0 auto; padding: 1rem; }
    .playbook-lab__stage, .playbook-lab__ledger { border: 2px solid #5d3b27; border-radius: 12px; background: #f4dfad; box-shadow: 0 12px 36px #2b211866; }
    .playbook-lab__stage { padding: clamp(.8rem, 2vw, 1.25rem); }
    .playbook-lab__objective { display: grid; gap: .2rem; margin-bottom: .8rem; padding: .7rem .8rem; border-left: 5px solid #267d78; background: #fff0c8; }
    .playbook-lab__grid { display: grid; grid-template-columns: repeat(${PLAYBOOK_GRID_WIDTH}, minmax(38px, 1fr)); aspect-ratio: ${PLAYBOOK_GRID_WIDTH} / ${PLAYBOOK_GRID_HEIGHT}; max-height: 55vh; border: 3px double #5d3b27; background: #c89555; }
    .playbook-lab__cell { position: relative; display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 38px; border: 1px dashed #68482f88; background: linear-gradient(135deg, #eac987, #d4a765); }
    .playbook-lab__cell:not(:disabled):hover, .playbook-lab__cell:not(:disabled):focus-visible { outline: 3px solid #267d78; outline-offset: -3px; background: #f7e1aa; }
    .playbook-lab__controls { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .9rem; }
    .playbook-lab__controls button { min-height: 44px; padding: .55rem .75rem; border: 1px solid #4a3122; border-radius: 6px; color: #fff4d4; background: #5a3c29; font: 700 .82rem/1.1 ui-monospace, monospace; }
    .playbook-lab__controls button:disabled { opacity: .42; }
    .playbook-lab__legend { display: flex; flex-wrap: wrap; gap: .8rem; margin-top: .65rem; font: .8rem/1.2 ui-monospace, monospace; }
    .token { display: inline-grid; place-items: center; width: 1.55rem; height: 1.55rem; border-radius: 50%; font: 800 .8rem/1 ui-monospace, monospace; box-shadow: 0 2px 4px #2b211855; }
    .token--player { color: #fff4d4; background: #8d4a2b; }
    .token--agent { color: #082f2e; background: #72d4c7; }
    .token--echo { color: #f6df9e; background: #47385f; }
    .token--mark { position: absolute; right: .15rem; bottom: .1rem; color: #fff0a8; background: #267d78; }
    .playbook-lab__ledger { min-width: 0; padding: 1rem; }
    .playbook-lab__ledger dl { display: grid; gap: .35rem; margin: 0 0 1rem; }
    .playbook-lab__ledger dl div { display: grid; grid-template-columns: 8rem 1fr; gap: .5rem; border-bottom: 1px dotted #68482f; padding-bottom: .3rem; }
    .playbook-lab__ledger dt { font: 700 .75rem/1.2 ui-monospace, monospace; text-transform: uppercase; }
    .playbook-lab__ledger dd { min-width: 0; margin: 0; overflow-wrap: anywhere; }
    .playbook-lab__ledger h2 { margin: .8rem 0 .35rem; font-size: 1rem; }
    .playbook-lab__ledger pre { max-height: 16rem; margin: 0; overflow: auto; padding: .65rem; color: #d7f4e8; background: #2b2118; font: .7rem/1.4 ui-monospace, monospace; white-space: pre-wrap; }
    .playbook-lab__ledger ol { max-height: 11rem; margin: 0; overflow: auto; padding-left: 1.25rem; font: .72rem/1.45 ui-monospace, monospace; }
    @media (max-width: 760px) { .playbook-lab__body { grid-template-columns: 1fr; } .playbook-lab__header { position: sticky; top: 0; z-index: 2; } .playbook-lab__grid { max-height: none; } .playbook-lab__ledger pre { max-height: 12rem; } }
  `;
  document.head.append(style);
}

function required<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing playbook lab element: ${selector}`);
  return element;
}

function pointKey(point: LabPoint): string {
  return `${point.x}:${point.z}`;
}

function samePoint(left: LabPoint, right: LabPoint): boolean {
  return left.x === right.x && left.z === right.z;
}

function mirrorPoint(point: LabPoint): LabPoint {
  return { x: PLAYBOOK_GRID_WIDTH - 1 - point.x, z: point.z };
}

function clonePoint(point: LabPoint): LabPoint {
  return { x: point.x, z: point.z };
}

function cloneCall(call: LabCall): LabCall {
  return call.tool === 'lab.move_to'
    ? { tool: 'lab.move_to', args: { target: clonePoint(call.args.target) } }
    : { tool: 'lab.mark', args: { label: 'signal' } };
}

function formatCall(call: LabCall): string {
  return call.tool === 'lab.move_to' ? `move_to(${call.args.target.x},${call.args.target.z})` : 'mark(signal)';
}
