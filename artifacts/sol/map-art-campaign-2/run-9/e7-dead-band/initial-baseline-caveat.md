# Initial pre-art Signal check is diagnostic only

The first selected browser control ran before live models changed, and reproduced the five expected Signal failures. However, the new frozen source-input JSON was copied into the store while that control was running. `computeEngineHash` inventories every pilot JSON, including this source recipe input; that first run therefore does not certify exact engine identity. Do not use its receipt as the final attribution.

The final exact-base replay parks this added JSON, restores every changed store file to the recorded base, asserts the complete base engine hash before running assertions, and verifies byte-exact candidate restoration. See `base-failures.json` and `browser-failure-attribution.json` for the closing evidence.
