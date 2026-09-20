# E2 escort multiplayer posture

The cart is deliberately single-player gated for this slice: `mode=escort` is not exposed through multiplayer setup, and cart future-state is not yet part of RunSuspend v2. Before multiplayer enables this mode, snapshot state must include path segment/progress, HP, repair progress, objective loss, arrivals, and payout settlement so reconnect cannot duplicate a railhead payout.
