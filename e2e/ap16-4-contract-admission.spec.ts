import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';

// F-E2S-3 governs the three railcars. Canyon Works predates that ruling and was
// measured lawful modelessly, so its declared escort mode remains additive.
const MODELESS_MODE_CONTRACT_EXCEPTIONS = new Set(['e3-canyon-works']);

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
    const { listBoardContracts } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { HeadlessContractSim, supportedContractIds } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const admitted = supportedContractIds();
    const views = admitted.map((contractId: string) =>
      new HeadlessContractSim({ contractId, seed: `ap16-4-${contractId}` }).currentTurn().view);

    expect(views).toHaveLength(admitted.length);
    expect(views.every(Boolean)).toBe(true);

    const modeContracts = listBoardContracts().filter((contract: { modes?: Array<{ id: string }> }) => contract.modes?.length);
    for (const contract of modeContracts) {
      const modelessBoot = { contractId: contract.id, seed: `ap16-4-modeless-${contract.id}` };
      if (MODELESS_MODE_CONTRACT_EXCEPTIONS.has(contract.id)) {
        expect(new HeadlessContractSim(modelessBoot).currentTurn().view).toBeTruthy();
      } else {
        expect(() => new HeadlessContractSim(modelessBoot)).toThrow(/AP-07 supports only/);
      }
      for (const mode of contract.modes) {
        const view = new HeadlessContractSim({ ...modelessBoot, mode: mode.id }).currentTurn().view;
        expect(view).toBeTruthy();
      }
    }
  } finally {
    await vite?.close();
    if (previousLocation === undefined) delete host.location;
    else host.location = previousLocation;
    if (previousWindow === undefined) delete host.window;
    else host.window = previousWindow;
  }
});
