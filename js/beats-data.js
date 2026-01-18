/**
 * Beats data - embedded genre and puzzle definitions
 * Supports per-instrument subdivisions for polyrhythms
 *
 * Pattern format: { instrument: [positions] }
 * Example: { kick: [0, 4], snare: [2, 6], hihat: [0,1,2,3,4,5,6,7] }
 */

const BeatsData = {
  genres: [
    {
      id: "rock",
      name: "Rock",
      description: "AC/DC style rock beat",
      defaultTempo: 80,
      instrumentSubdivisions: { kick: 8, snare: 8, hihat: 8, other: 8 },
      puzzles: [
        {
          name: "The Downbeat",
          description: "Q on beat 1",
          tolerance: 220,
          pattern: {
            kick: [0],
          },
        },
        {
          name: "One and Three",
          description: "Add Q on beat 3",
          tolerance: 200,
          pattern: { kick: [0, 4] },
        },
        {
          name: "Add Backbeat",
          description: "Add W on beats 2 and 4",
          tolerance: 180,
          pattern: { kick: [0, 4], snare: [2, 6] },
        },
        {
          name: "Eighth Note Hats",
          description: "Add E on all eighth notes",
          tolerance: 160,
          pattern: {
            kick: [0, 4],
            snare: [2, 6],
            hihat: [0, 1, 2, 3, 4, 5, 6, 7],
          },
        },
        {
          name: "AC/DC Kick",
          description: "Add Q on 'and' of 3",
          tolerance: 140,
          pattern: {
            kick: [0, 4, 5],
            snare: [2, 6],
            hihat: [0, 1, 2, 3, 4, 5, 6, 7],
          },
        },
        {
          name: "Add Crash",
          description: "Add R on beat 1",
          tolerance: 130,
          pattern: {
            kick: [0, 4, 5],
            snare: [2, 6],
            hihat: [0, 1, 2, 3, 4, 5, 6, 7],
            other: [0],
          },
        },
      ],
    },
    {
      id: "dnb",
      name: "Drum & Bass",
      description: "Fast breakbeat pattern",
      defaultTempo: 174,
      instrumentSubdivisions: { kick: 16, snare: 16, hihat: 16, other: 16 },
      puzzles: [
        {
          name: "Two-Step Kick",
          description: "Q on beat 1 and right before beat 3",
          tolerance: 180,
          pattern: { kick: [0, 10] },
        },
        {
          name: "Backbeat Snare",
          description: "Add W on beats 2 and 4",
          tolerance: 150,
          pattern: { kick: [0, 10], snare: [4, 12] },
        },
        {
          name: "Hihats",
          description: "Add E on offbeats",
          tolerance: 140,
          pattern: { kick: [0, 10], snare: [4, 12], hihat: [2, 6, 8, 14] },
        },
      ],
    },
    {
      id: "electro",
      name: "Electro",
      description: "Four-on-the-floor electronic",
      defaultTempo: 128,
      instrumentSubdivisions: { kick: 4, snare: 8, hihat: 8, other: 8 },
      puzzles: [
        {
          name: "Four on Floor",
          description: "Q on every beat",
          tolerance: 180,
          pattern: { kick: [0, 1, 2, 3] },
        },
        {
          name: "Clap It",
          description: "Add W on beats 2 and 4",
          tolerance: 160,
          pattern: { kick: [0, 1, 2, 3], snare: [2, 6] },
        },
        {
          name: "Offbeat Hats",
          description: "Add E on offbeats",
          tolerance: 150,
          pattern: { kick: [0, 1, 2, 3], snare: [2, 6], hihat: [1, 3, 5, 7] },
        },
      ],
    },
    {
      id: "2-3-polyrhythm",
      name: "Simple Polyrhythm",
      description: "2 against 3 practice",
      defaultTempo: 140,
      instrumentSubdivisions: { kick: 4, snare: 3, hihat: 4, other: 3 },
      puzzles: [
        {
          name: "Feel the 2",
          description: "Q on 2 beats",
          tolerance: 220,
          pattern: { kick: [0, 2] },
        },
        {
          name: "Feel the 3",
          description: "W on 3 beats",
          tolerance: 220,
          pattern: { snare: [0, 1, 2] },
        },
        {
          name: "Combine 2 and 3",
          description: "Play both patterns together",
          tolerance: 200,
          pattern: { kick: [0, 2], snare: [0, 1, 2] },
        }
      ],
    },
  ],
};
