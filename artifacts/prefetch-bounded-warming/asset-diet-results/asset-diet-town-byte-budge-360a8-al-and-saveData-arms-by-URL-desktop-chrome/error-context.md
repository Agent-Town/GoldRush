# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asset-diet.spec.ts >> town byte budget reports normal and saveData arms by URL
- Location: e2e/asset-diet.spec.ts:277:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 9326887
Received:    16343695
```

# Test source

```ts
  366 |   const rows = changedUrls.map(([url, normalUrlBytes, saveDataUrlBytes]) =>
  367 |     `| ${url.replaceAll('|', '\\|')} | ${normalUrlBytes} | ${saveDataUrlBytes} | ${normalUrlBytes - saveDataUrlBytes} |`);
  368 |   const cueTestMeasurementsMeasuredInThisRun = cueTestMeasurementsByProject.has(testInfo.project.name);
  369 |   const cueTestArtifactPath = path.join(ARTIFACT_DIR, `town-transfer-${testInfo.project.name}.json`);
  370 |   // F-1629-1: map hit = this run's cue test measured it; clean map miss = committed town-transfer-<project>.json.
  371 |   const cueTestMeasurements = cueTestMeasurementsByProject.get(testInfo.project.name)
  372 |     ?? JSON.parse(await readFile(cueTestArtifactPath, 'utf8')) as TownTransferMeasurements;
  373 |   const cueTestMeasurementProvenance = cueTestMeasurementsMeasuredInThisRun
  374 |     ? 'measured in this run'
  375 |     : await matchesCommittedFile(cueTestArtifactPath)
  376 |       ? 'read from the committed artifact'
  377 |       : 'read from the on-disk fallback artifact (not measured in this run)';
  378 |   const cueTestStats = responseStats(cueTestMeasurements.cueWindowResponses);
  379 |   const settledMeasurements = [
  380 |     { label: 'cue test', measurement: cueTestMeasurements.settled },
  381 |     { label: 'normal', measurement: normal.settled },
  382 |     { label: 'saveData', measurement: saveData.settled },
  383 |     ...decompositionBytes.map((cell) => ({
  384 |       label: `prefetchWait=${cell.prefetchWait}, cacheDisabled=${cell.cacheDisabled}`,
  385 |       measurement: cell.measurements.settled,
  386 |     })),
  387 |   ];
  388 |   const settledMeasurementStats = settledMeasurements.map(({ label, measurement }) => ({ label, measurement, stats: responseStats(measurement.responses) }));
  389 |   const report = [
  390 |     `# Town byte budget — ${testInfo.project.name}`,
  391 |     '',
  392 |     '## Release-gated cue-window transfer total',
  393 |     '',
  394 |     '| Release-gated cue-window arm | provenance | cueWindowTotalBytes | cueWindowUniqueBytes | cueWindowDuplicateBytes | Headroom against 25,000,000 |',
  395 |     '| --- | --- | ---: | ---: | ---: | ---: |',
  396 |     `| cue test | ${cueTestMeasurementProvenance} | ${cueTestStats.totalBytes} | ${cueTestStats.uniqueBytes} | ${cueTestStats.duplicateBytes} | ${TOWN_TRANSFER_CEILING_BYTES - cueTestStats.totalBytes} |`,
  397 |     '',
  398 |     '## A/B cue-window transfer totals (recorded, not release-gated)',
  399 |     '',
  400 |     '| A/B cue-window arm | cueWindowTotalBytes | cueWindowUniqueBytes | cueWindowDuplicateBytes |',
  401 |     '| --- | ---: | ---: | ---: |',
  402 |     `| normal | ${normalCueWindowBytes} | ${normalCueStats.uniqueBytes} | ${normalCueStats.duplicateBytes} |`,
  403 |     `| saveData | ${saveDataCueWindowBytes} | ${saveDataCueStats.uniqueBytes} | ${saveDataCueStats.duplicateBytes} |`,
  404 |     '',
  405 |     'Desktop normal measured 24,604,025 bytes at f1621-1 (`fb1bdf72d`), 26,115,186 in the f1625-1 runner, and 23,259,297 at the f1625-1 drain: a 12.3% swing across the 25,000,000 ceiling.',
  406 |     '',
  407 |     `Cue-window delta (normal - saveData): **${normalCueWindowBytes - saveDataCueWindowBytes} bytes**.`,
  408 |     '',
  409 |     '## Settled <=20 s transfer totals (recorded, not gated)',
  410 |     '',
  411 |     '| Settled arm | settledTotalBytes | settledUniqueBytes | settledDuplicateBytes | settled duplicate URL count | settle duration (ms) | settleCapHit |',
  412 |     '| --- | ---: | ---: | ---: | ---: | ---: | --- |',
  413 |     ...settledMeasurementStats.map(({ label, measurement, stats }) =>
  414 |       `| ${label} | ${stats.totalBytes} | ${stats.uniqueBytes} | ${stats.duplicateBytes} | ${stats.duplicateUrls.length} | ${measurement.settleDurationMs} | ${measurement.settleCapHit} |`),
  415 |     '',
  416 |     '### URLs fetched more than once',
  417 |     '',
  418 |     '| Settled arm | URL | fetch count |',
  419 |     '| --- | --- | ---: |',
  420 |     ...settledMeasurementStats.flatMap(({ label, stats }) => stats.duplicateUrls.length
  421 |       ? stats.duplicateUrls.map(([url, response]) => `| ${label} | ${url.replaceAll('|', '\\|')} | ${response.count} |`)
  422 |       : [`| ${label} | _none_ | 0 |`]),
  423 |     '',
  424 |     'The saveData arm is a lower bound, not a clean isolation of the two bulk halls: it also narrows advance-stream prefetch to priority one.',
  425 |     '',
  426 |     '| URL | normal settled bytes | saveData settled bytes | settled delta |',
  427 |     '| --- | ---: | ---: | ---: |',
  428 |     ...rows,
  429 |     '',
  430 |     '## Normal-arm decomposition',
  431 |     '',
  432 |     '| prefetchWait | cacheDisabled | cueWindowTotalBytes | settledTotalBytes | settledUniqueBytes | settledDuplicateBytes | settled delta from false/false | settleCapHit |',
  433 |     '| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |',
  434 |     ...decompositionBytes.map((cell) =>
  435 |       `| ${cell.prefetchWait} | ${cell.cacheDisabled} | ${cell.cueStats.totalBytes} | ${cell.settledStats.totalBytes} | ${cell.settledStats.uniqueBytes} | ${cell.settledStats.duplicateBytes} | ${cell.settledStats.totalBytes - decompositionBaseline} | ${cell.measurements.settled.settleCapHit} |`),
  436 |     '',
  437 |     '## Missing or unparseable content-length audit',
  438 |     '',
  439 |     ...contentLengthAudit('Cue test — cue-window sample', cueTestMeasurements.cueWindowResponses),
  440 |     ...contentLengthAudit('Cue test — settled <=20 s capture', cueTestMeasurements.settled.responses),
  441 |     ...contentLengthAudit('A/B normal — cue-window sample', normal.cueWindowResponses),
  442 |     ...contentLengthAudit('A/B normal — settled <=20 s capture', normal.settled.responses),
  443 |     ...contentLengthAudit('A/B saveData — cue-window sample', saveData.cueWindowResponses),
  444 |     ...contentLengthAudit('A/B saveData — settled <=20 s capture', saveData.settled.responses),
  445 |     ...decompositionBytes.flatMap((cell) => contentLengthAudit(
  446 |       `A/B normal settled <=20 s cell (prefetchWait=${cell.prefetchWait}, cacheDisabled=${cell.cacheDisabled})`,
  447 |       cell.measurements.settled.responses,
  448 |     )),
  449 |   ].join('\n');
  450 |   await mkdir(ARTIFACT_DIR, { recursive: true });
  451 |   await writeFile(path.join(ARTIFACT_DIR, `town-budget-${testInfo.project.name}.md`), report);
  452 | 
  453 |   expectNoConsoleErrors(normalArm.watch, 'normal');
  454 |   expectNoConsoleErrors(saveDataArm.watch, 'saveData');
  455 |   await normalArm.context.close();
  456 |   await saveDataArm.context.close();
  457 |   // Gate only the cue test's release quantity, also asserted at its own site. The A/B cue-window
  458 |   // totals stay recorded, not release-gated: F-1627-2 measured desktop normal at 24,604,025
  459 |   // (f1621-1), 26,115,186 (f1625-1 runner), and 23,259,297 (f1625-1 drain), straddling the ceiling.
  460 |   // Refusing that flaky gate is deliberate; F-1625-4 is the open owner fork.
  461 |   // F-1629-1: the assertion message names whether it gated fresh bytes or the fallback artifact.
  462 |   expect(
  463 |     cueTestStats.totalBytes,
  464 |     `release-gated cue test bytes were ${cueTestMeasurementProvenance}`,
  465 |   ).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES);
> 466 |   expect(saveDataCueWindowBytes).toBeLessThanOrEqual(normalCueWindowBytes);
      |                                  ^ Error: expect(received).toBeLessThanOrEqual(expected)
  467 | });
  468 | 
```