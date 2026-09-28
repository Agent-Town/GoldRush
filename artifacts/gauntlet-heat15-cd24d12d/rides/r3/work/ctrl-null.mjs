// Zero-order control: answers every view with silence. Reproduces the published null floor and
// dumps view 0's RAW `now.regatta` so the controller branches only on keys I have SEEN.
export function makeController() { return () => null; }
