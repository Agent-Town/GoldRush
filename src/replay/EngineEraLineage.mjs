// @ts-check

/** @typedef {{ pins: readonly { engineHash: string, aliases?: readonly string[] }[] }} EngineEraLineage */

/** @param {EngineEraLineage} lineage @param {string} engineHash */
export function engineEraIncludes(lineage, engineHash) {
  return lineage.pins.some((pin) => pin.engineHash === engineHash || pin.aliases?.includes(engineHash));
}
