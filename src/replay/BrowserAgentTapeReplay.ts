import type { AgentTapeReplayResult, AgentTapeReplaySnapshot } from './AgentTapeReplay';

type WorkerReply = {
  id: number;
  snapshot?: AgentTapeReplaySnapshot;
  result?: AgentTapeReplayResult;
  error?: string;
};

export class BrowserAgentTapeReplay {
  private readonly worker = new Worker(new URL('./BrowserAgentTapeWorker.ts', import.meta.url), { type: 'module' });
  private readonly pending = new Map<number, { resolve: (reply: WorkerReply) => void; reject: (error: Error) => void }>();
  private nextId = 1;

  constructor(private readonly tape: unknown) {
    this.worker.onmessage = ({ data }: MessageEvent<WorkerReply>) => {
      const request = this.pending.get(data.id);
      if (!request) return;
      this.pending.delete(data.id);
      if (data.error) request.reject(new Error(data.error));
      else request.resolve(data);
    };
    this.worker.onerror = ({ message }) => {
      for (const request of this.pending.values()) request.reject(new Error(message));
      this.pending.clear();
    };
  }

  start(): Promise<WorkerReply> {
    return this.send({ type: 'start', tape: this.tape, search: location.search });
  }

  advance(targetTick: number, stopAfterWave?: number): Promise<WorkerReply> {
    return this.send({ type: 'advance', targetTick, stopAfterWave });
  }

  dispose(): void {
    this.worker.terminate();
    for (const request of this.pending.values()) request.reject(new Error('agent replay disposed'));
    this.pending.clear();
  }

  private send(message: Record<string, unknown>): Promise<WorkerReply> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ ...message, id });
    });
  }
}
