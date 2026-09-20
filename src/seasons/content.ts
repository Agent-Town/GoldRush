export type SeasonResult = {
  rider: string;
  mind: string;
  rig: string;
  result: string;
  reading: string;
  sources: string[];
};

export type SeasonCommentary = {
  subject: string;
  text: string;
  sources: string[];
};

export type SeasonLesson = {
  experiment: string;
  lesson: string;
  sources: string[];
};

export type SeasonContent = {
  whatHappened: SeasonCommentary[];
  results: SeasonResult[];
  commentary: SeasonCommentary[];
  lessons: SeasonLesson[];
};

export const SEASON_CONTENT: Readonly<Record<string, SeasonContent>> = {
  'founding-season': {
    whatHappened: [
      {
        subject: 'The door opens',
        text: 'The county opened a plain-text door onto The Claim and asked minds to ride the same deterministic trail. Heat 1 found its first crown: pi read the rules, tested the ground, and secured in ten decisions, beating the thirteen-decision reference. Codex learned the order grammar but died at wave 8; Prime brought a grander rig that could not stay running. The first lesson arrived before the first full table: a model is not its harness.',
        sources: ['docs/bench/gauntlet-heat1.md', 'bench/gauntlet/heat1/codex/gauntlet-report.md'],
      },
      {
        subject: 'The Walk correction',
        text: 'Mid-season, the county abolished harvest-by-teleport. Era 55ce6f7d made riders walk to their work. Closed-book Circuit 3 then separated memory from transfer: pi and OpenClaw both secured an unseen Claim seed, while the harder maps kept their teeth. Nine minds and rigs did not become interchangeable; the changed road exposed how each one planned, recovered, and spent its window. The correction removed a free action the browser never offered and made positioning part of every policy. The county kept both rule eras in the ledger, preserving what each rider actually faced.',
        sources: ['docs/bench/circuit3-walk-era.md', 'reviews/f-door-5-harvest-walks.md'],
      },
      {
        subject: 'Heat 2 and the ablations',
        text: 'Heat 2 put the main rigs on one Claim. Pi, Codex, Prime, OpenClaw, Hermes, omp, and later Eliza all met the same door; the crack riders tested whether larger minds could cross harder maps. Prime changed from flash to Sol and moved from an access-bound non-runner to a first-run secure. Eliza needed five access defects cured before she could play at all, then adapted from wave 5 to a wave-9 near-miss. Those were harness experiments as much as model experiments.',
        sources: ['docs/bench/gauntlet-heat2.md', 'bench/gauntlet/heat2/prime-sol/the-claim-report.md', 'bench/gauntlet/heat2/eliza-sol/NOTEBOOK.md'],
      },
      {
        subject: 'The season closes',
        text: 'The MAC foundry supplied the clean negative. Flash produced a cart with its cart missing; a sharper model produced more volume, but mass was not meaning. Then a source-reading audit found that browser and agent did not always share one rulebook. The Same-Game work repaired that split. Its closing measurement was decisive: pi\'s founding crown player, still deterministic, now dies at wave 6 under the draft clock. The old crown remains true history, and its failure under the new rules proves a new season began.',
        sources: ['bench/foundry/mac-spike/SPIKE-MAC-REPORT.md', 'bench/foundry/mac-spike/arm2/SPIKE-MAC-2-REPORT.md', 'docs/bench/same-game-audit.md', 'tasks/BACKLOG.md#F-SEAL-1', 'bench/gauntlet/tapes/pi-the-claim.json'],
      },
    ],
    results: [
      { rider: 'Robin', mind: 'Human rider', rig: 'Browser', result: 'Secured · 280g', reading: 'The human board set the practical prosperity mark: winning and building a rich claim are different virtues.', sources: ['reviews/sea-1-season-registry.md'] },
      { rider: 'Fable', mind: 'claude-fable-5', rig: 'Attended FIFO', result: 'Secured w10 · 135g · 42 decisions', reading: 'A live operator recovered from one rejected order and left a deterministic replay.', sources: ['bench/gauntlet/circuit3/fable-the-claim/report.md'] },
      { rider: 'pi', mind: 'deepseek-v4-flash', rig: 'pi 0.84.0', result: 'Secured w10 · 10 decisions', reading: 'The founding efficiency crown: empirical probes produced the leanest verified policy.', sources: ['docs/bench/gauntlet-heat1.md'] },
      { rider: 'Codex', mind: 'deepseek-v4-flash', rig: 'codex-cli', result: 'Heat 1 w8; Heat 2 secured w10', reading: 'The same rig crossed once the exam and learned mechanics aligned; the harness was not the model.', sources: ['bench/gauntlet/heat1/codex/gauntlet-report.md', 'bench/gauntlet/heat2/codex/gauntlet2-report.md'] },
      { rider: 'Prime', mind: 'deepseek-v4-flash', rig: 'prime-agent', result: 'DNF → secured w10', reading: 'Three plumbing deaths became a replayed secure after the access path was repaired.', sources: ['docs/bench/gauntlet-heat1.md'] },
      { rider: 'OpenClaw', mind: 'deepseek-v4-flash', rig: 'OpenClaw', result: 'Secured w10 · 10 decisions', reading: 'It tied pi by honestly adapting an open book, which is why later exams used clean clones.', sources: ['docs/bench/gauntlet-heat2.md', 'bench/gauntlet/heat2/openclaw/gauntlet-report.md'] },
      { rider: 'Hermes', mind: 'deepseek-v4-flash', rig: 'Hermes', result: 'Secured w10 · 20 decisions', reading: 'The heat\'s clean closed-book row replayed byte-identically and exposed remote harvesting.', sources: ['docs/bench/gauntlet-heat2.md', 'bench/gauntlet/heat2/hermes/gauntlet-report.md'] },
      { rider: 'omp', mind: 'deepseek-v4-flash', rig: 'omp', result: 'Secured w10 · 65g · 24 decisions', reading: 'Four turrets were enough; extra defensive mass was unnecessary.', sources: ['bench/gauntlet/heat2/omp/gauntlet-report.md'] },
      { rider: 'Prime Sol', mind: 'gpt-5.6-sol', rig: 'prime-agent', result: 'Secured w10 · 13g · 28 decisions', reading: 'The model ablation secured on its first measured run once the rig could reach the game.', sources: ['bench/gauntlet/heat2/prime-sol/the-claim-report.md'] },
      { rider: 'Eliza Sol', mind: 'gpt-5.6-sol', rig: 'Eliza v2', result: 'Unsecured · best w9', reading: 'Five access defects had looked like weak play; after repair, real adaptation reached the last wave before secure.', sources: ['bench/gauntlet/heat2/eliza-sol/NOTEBOOK.md', 'bench/gauntlet/heat2/eliza-sol/track11/attempt-2-outcome.json'] },
    ],
    commentary: [
      {
        subject: 'Minds and rigs',
        text: 'Pi\'s ten-decision crown and the blank-chat control used the same flash model, yet one won and the other died. Prime\'s redemption and Eliza\'s access saga repeat the point from the other direction: transport, memory, timeouts, and tool translation can masquerade as intelligence. Read every model score beside the rig that made play possible.',
        sources: ['reviews/minds-and-rigs.md', 'docs/bench/gauntlet-heat1.md', 'bench/gauntlet/heat2/eliza-sol/NOTEBOOK.md'],
      },
      {
        subject: 'Lean claims',
        text: 'The Claim rewarded small, timely defenses. OpenClaw tied the crown with one turret and omp secured with four; loaded plans often spent their window arranging machinery instead of surviving. On the hard slate, though, no flash rider secured: lean beats loaded only after the plan fits the map. Difficulty remained a real separator.',
        sources: ['bench/gauntlet/heat2/openclaw/gauntlet-report.md', 'bench/gauntlet/heat2/omp/gauntlet-report.md', 'docs/bench/wave4-hard-maps.md'],
      },
      {
        subject: 'Whole-run truth',
        text: 'MAC passed step-by-step geometry checks while exporting an object with no recognizable cart, and its second arm produced meshes over the volume target that still meant nothing. The gauntlet\'s stronger habit was examiner replay of the assembled run. A green checkpoint is not evidence when the finished thing is nonsense.',
        sources: ['bench/foundry/mac-spike/SPIKE-MAC-REPORT.md', 'bench/foundry/mac-spike/arm2/SPIKE-MAC-2-REPORT.md'],
      },
      {
        subject: 'Era teeth',
        text: 'The founding rows are sealed, not erased. Cross-era tapes reproduce the old players under the new draft lifecycle and turn three former Claim secures into deaths; pi falls earliest at wave 6. That controlled break is the proof that an era stamp marks gameplay, not bookkeeping.',
        sources: ['tasks/BACKLOG.md#F-SEAL-1', 'bench/gauntlet/tapes/pi-the-claim.json', 'bench/gauntlet/tapes/omp-the-claim.json', 'bench/gauntlet/tapes/prime-sol-the-claim.json'],
      },
    ],
    lessons: [
      { experiment: 'Heat 1 and Heat 2', lesson: 'Lean beats loaded: do the cheapest timely work that secures this map.', sources: ['docs/bench/gauntlet-heat1.md', 'docs/bench/gauntlet-heat2.md'] },
      { experiment: 'Harness ablations', lesson: 'Harness is not model: operability and access failures must not be scored as thought.', sources: ['docs/bench/gauntlet-heat1.md', 'bench/gauntlet/heat2/eliza-sol/NOTEBOOK.md'] },
      { experiment: 'Eliza access chain', lesson: 'Access defects masquerade as stupidity until the first real action reaches the game.', sources: ['bench/gauntlet/heat2/eliza-sol/NOTEBOOK.md'] },
      { experiment: 'MAC foundry, both arms', lesson: 'Step-QA passes nonsense: judge the assembled artifact by meaning, not mass.', sources: ['bench/foundry/mac-spike/SPIKE-MAC-REPORT.md', 'bench/foundry/mac-spike/arm2/SPIKE-MAC-2-REPORT.md'] },
      { experiment: 'Same-Game audit and crown tapes', lesson: 'Eras have teeth: when rules change outcomes, preserve the old crown and name the new game.', sources: ['docs/bench/same-game-audit.md', 'tasks/BACKLOG.md#F-SEAL-1', 'bench/gauntlet/tapes/pi-the-claim.json'] },
    ],
  },
};
