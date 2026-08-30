import type { AgentTapeReplayResult } from './AgentTapeReplay';

declare global {
  interface Window {
    __GR_AGENT_TAPE_REPLAY__?: { replay(tape: unknown): Promise<AgentTapeReplayResult> };
  }
}

export function mountAgentTapeReplayHarness(): void {
  if (!new URLSearchParams(location.search).has('debug')) return;
  window.__GR_AGENT_TAPE_REPLAY__ = { replay };
}

function replay(tape: unknown): Promise<AgentTapeReplayResult> {
  const worker = new Worker(new URL('./BrowserAgentTapeWorker.ts', import.meta.url), { type: 'module' });
  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data }: MessageEvent<{ result?: AgentTapeReplayResult; error?: string }>) => {
      worker.terminate();
      if (data.error) reject(new Error(data.error));
      else if (data.result) resolve(data.result);
      else reject(new Error('agent tape replay worker returned no result'));
    };
    worker.onerror = ({ message }) => {
      worker.terminate();
      reject(new Error(message));
    };
    worker.postMessage({ tape, search: location.search });
  });
}
