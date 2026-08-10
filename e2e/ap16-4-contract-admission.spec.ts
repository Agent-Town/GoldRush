import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';

test('every derived door contract boots and emits its first view', async () => {
  test.setTimeout(60_000);
  const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
  const previousLocation = host.location;
  const previousWindow = host.window;
  const location = new URL('http://gr-sim.local/?debug');
  let vite: ViteDevServer | undefined;

  host.location = location;
  host.window = { location };
  try {
    vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
    const { HeadlessContractSim, supportedContractIds } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const admitted = supportedContractIds();
    const views = admitted.map((contractId: string) =>
      new HeadlessContractSim({ contractId, seed: `ap16-4-${contractId}` }).currentTurn().view);

    expect(views).toHaveLength(admitted.length);
    expect(views.every(Boolean)).toBe(true);
  } finally {
    await vite?.close();
    if (previousLocation === undefined) delete host.location;
    else host.location = previousLocation;
    if (previousWindow === undefined) delete host.window;
    else host.window = previousWindow;
  }
});
