export type BuildRejectionDetail =
  | 'insufficient_gold'
  | 'invalid_position'
  | 'collision'
  | 'out_of_zone'
  | 'cap_reached';

let pendingBuildRejectionDetail: BuildRejectionDetail | undefined;

// ponytail: Synchronous handoff preserves boolean adapters; return structured results if build calls become async.
export function takeBuildRejectionDetail(): BuildRejectionDetail | undefined {
  const detail = pendingBuildRejectionDetail;
  pendingBuildRejectionDetail = undefined;
  return detail;
}

export function setBuildRejectionDetail(detail: BuildRejectionDetail | undefined): void {
  pendingBuildRejectionDetail = detail;
}
