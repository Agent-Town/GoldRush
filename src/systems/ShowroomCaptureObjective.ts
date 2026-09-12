import type { ContractManifest } from '../meta/ContractFamilies';

export type ShowroomCaptureDiagnostics = Readonly<{
  declared: boolean;
  captures: number;
  quota: number | null;
  complete: boolean;
  objectiveAllowsSecure: boolean;
}>;

export class ShowroomCaptureObjective {
  private captures = 0;

  private constructor(private readonly quota: number | null) {}

  static create(contract: Pick<ContractManifest, 'twist'>): ShowroomCaptureObjective {
    const quota = contract.twist.showroom?.captureQuota;
    return new ShowroomCaptureObjective(typeof quota === 'number' && Number.isSafeInteger(quota) && quota > 0 ? quota : null);
  }

  recordCapture(): void {
    if (this.quota !== null) this.captures += 1;
  }

  reset(): void {
    this.captures = 0;
  }

  /** RunSuspend validates the count before restoring any simulation state. */
  restoreSuspend(captures: number): void {
    this.captures = this.quota === null ? 0 : captures;
  }

  get objectiveAllowsSecure(): boolean {
    return this.quota === null || this.captures >= this.quota;
  }

  get diagnostics(): ShowroomCaptureDiagnostics {
    return {
      declared: this.quota !== null,
      captures: this.captures,
      quota: this.quota,
      complete: this.quota !== null && this.captures >= this.quota,
      objectiveAllowsSecure: this.objectiveAllowsSecure,
    };
  }
}
