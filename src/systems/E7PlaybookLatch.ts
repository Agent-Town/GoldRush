import signalContracts from '../../assets/contracts/epoch-7-signal/contracts.json' with { type: 'json' };
import type { ContractManifest } from '../meta/ContractFamilies';
import { POWERED_RELAY_KINDS, type FrontWork } from './InterferenceFrontSystem';

export type E7PlaybookObjective = 'relay' | 'mirror' | 'refusal' | 'suspended';

const CONTRACT_IDS = new Set((signalContracts.contracts as readonly { id: string }[]).map(({ id }) => id));

/** The four Signal-map secure rules, shared by the browser and headless engines. */
export class E7PlaybookLatch {
  readonly objective: E7PlaybookObjective | null;
  private readonly sites: readonly Readonly<{ id: string; minX: number; maxX: number; minZ: number; maxZ: number }>[];
  private readonly lit = new Set<string>();

  constructor(contract: ContractManifest) {
    this.sites = (contract.tileParams.buildZones ?? [])
      .filter((zone) => typeof zone?.id === 'string' && zone.id.startsWith('relay-site')
        && [zone.minX, zone.maxX, zone.minZ, zone.maxZ].every(Number.isFinite))
      .map((zone) => ({
        id: zone.id,
        minX: Math.min(zone.minX, zone.maxX), maxX: Math.max(zone.minX, zone.maxX),
        minZ: Math.min(zone.minZ, zone.maxZ), maxZ: Math.max(zone.minZ, zone.maxZ),
      }));
    this.objective = CONTRACT_IDS.has(contract.id)
      ? contract.twist.signalSuppression?.playbooks === false ? 'refusal'
        : contract.twist.broadcastMirror ? 'mirror'
          : contract.twist.interferenceFront ? 'suspended'
            : this.sites.length > 0 ? 'relay' : null
      : null;
  }

  syncProgramRelays(running: boolean, works: readonly FrontWork[]): void {
    if (!running) return;
    for (const site of this.sites) {
      if (this.lit.has(site.id)) continue;
      if (works.some((work) => work.active && work.hp > 0 && POWERED_RELAY_KINDS.includes(work.family)
        && work.position.x >= site.minX && work.position.x <= site.maxX
        && work.position.z >= site.minZ && work.position.z <= site.maxZ)) this.lit.add(site.id);
    }
  }

  allowsSecure(signals: Readonly<{ suppressedUses: number; fieldedMirrors: number; mutedUses: number }>): boolean {
    switch (this.objective) {
      case 'refusal': return signals.suppressedUses > 0;
      case 'mirror': return signals.fieldedMirrors > 0;
      case 'suspended': return signals.mutedUses > 0;
      case 'relay': return this.lit.size > 0;
      default: return true;
    }
  }

  get relaysLitByProgram(): readonly string[] { return [...this.lit].sort(); }

  reset(): void { this.lit.clear(); }
}
