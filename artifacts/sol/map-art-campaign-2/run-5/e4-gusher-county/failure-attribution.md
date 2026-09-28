# Gusher County gate attribution

The first candidate introduced a panorama-detail regression. `e2e/panorama-framing.spec.ts:117` requires the upper world row to retain a luminance deviation above 4; the 78% pigment blend returned 2.226 desktop / 2.484 phone. The exact map base (code `c258a41dfe75e9500ce23d00f18b030a937c25a3`, store `0f6ef32c9ebb7652c6796b8ccda622a282e8ffca`, engine `d9771424552e194e198257098a5c4e235d0101c5c9f063adf030d42fcd2ef0eb`) passed both projects. [Exact base bytes and candidate restoration](base-panorama.json). This was our regression, not a known red.

A 55% blend still failed (3.304 / 3.070). The final 30% blend keeps 70% of the original ground paint, preserving the world detail while reducing the coarse contrast. The protected test is unchanged; the final focused batch passes 9/10, including all three landscape aspect ratios on both projects. [Final receipt](e2e-final-own-2-gates.json).

The intermediate desktop errand attempt also lost its page execution context during navigation (`e4-roads-and-convoys.spec.ts:133`); it recurred in the final batch, then passed 2/2 in the isolated final errand retry. The final batch plus that retry cover all ten selected checks. [Isolated retry](e2e-final-errand-gates.json). No gameplay result is inferred from that failed attempt. Superseded captures were stopped and all boards/metrics were recaptured from final bytes.

The six deterministic wider Motor failures and stale atlas-census failure identified during Dust Flats remain documented there. They are not new results or claimed fixes for this map. The full node battery and engine pin remain the drain's. The requested changed-since selector includes that full battery unconditionally, so the scoped node receipt is not labelled changed-since green.
