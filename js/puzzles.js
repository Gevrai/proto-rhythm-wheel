/**
 * Puzzles module - Puzzle definitions
 * Each puzzle builds on the previous - keeping old patterns and adding new elements
 */

const Puzzles = (function() {
    // Beat positions:
    // Position 0: Beat 1 (top, 12 o'clock)
    // Position 2: Beat 2 (3 o'clock)
    // Position 4: Beat 3 (bottom, 6 o'clock)
    // Position 6: Beat 4 (9 o'clock)
    // Odd positions (1, 3, 5, 7): eighth notes between beats

    const puzzles = [
        // 1: Just kick on beat 1
        {
            id: 1,
            name: "The Downbeat",
            description: "Q on beat 1",
            tempo: 70,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' }
            ],
            tolerance: 220,
            loops: 2
        },

        // 2: Add kick on beat 3
        {
            id: 2,
            name: "One and Three",
            description: "Add Q on beat 3",
            tempo: 75,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 4, key: 'q', instrument: 'kick' }
            ],
            tolerance: 200,
            loops: 2
        },

        // 3: Add snare on beats 2 and 4
        {
            id: 3,
            name: "Add Backbeat",
            description: "Add W on beats 2 and 4",
            tempo: 80,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 6, key: 'w', instrument: 'snare' }
            ],
            tolerance: 180,
            loops: 2
        },

        // 4: Add hi-hat on beats 1 and 3
        {
            id: 4,
            name: "Add Hi-Hat",
            description: "Add E on beats 1 and 3",
            tempo: 80,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 0, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 4, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' }
            ],
            tolerance: 180,
            loops: 2
        },

        // 5: Add hi-hat on beats 2 and 4 too (hi-hat on all beats)
        {
            id: 5,
            name: "Full Hi-Hat",
            description: "Add E on beats 2 and 4",
            tempo: 85,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 0, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 2, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 4, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' },
                { position: 6, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 160,
            loops: 2
        },

        // 6: Add bell on beat 1
        {
            id: 6,
            name: "Add Bell",
            description: "Add R on beat 1",
            tempo: 85,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 0, key: 'e', instrument: 'hihat' },
                { position: 0, key: 'r', instrument: 'other' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 2, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 4, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' },
                { position: 6, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 150,
            loops: 2
        },

        // 7: Add eighth note hi-hats (between beats)
        {
            id: 7,
            name: "Eighth Notes",
            description: "Add E between beats",
            tempo: 80,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 0, key: 'e', instrument: 'hihat' },
                { position: 0, key: 'r', instrument: 'other' },
                { position: 1, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 2, key: 'e', instrument: 'hihat' },
                { position: 3, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 4, key: 'e', instrument: 'hihat' },
                { position: 5, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' },
                { position: 6, key: 'e', instrument: 'hihat' },
                { position: 7, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 140,
            loops: 2
        },

        // 8: Add syncopated kick on "and" of 2
        {
            id: 8,
            name: "Syncopation",
            description: "Add Q on the 'and' of 2",
            tempo: 80,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 0, key: 'e', instrument: 'hihat' },
                { position: 0, key: 'r', instrument: 'other' },
                { position: 1, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 2, key: 'e', instrument: 'hihat' },
                { position: 3, key: 'q', instrument: 'kick' },
                { position: 3, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 4, key: 'e', instrument: 'hihat' },
                { position: 5, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' },
                { position: 6, key: 'e', instrument: 'hihat' },
                { position: 7, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 130,
            loops: 2
        },

        // 9: Add bell on beat 3 too
        {
            id: 9,
            name: "Double Bell",
            description: "Add R on beat 3",
            tempo: 85,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 0, key: 'e', instrument: 'hihat' },
                { position: 0, key: 'r', instrument: 'other' },
                { position: 1, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 2, key: 'e', instrument: 'hihat' },
                { position: 3, key: 'q', instrument: 'kick' },
                { position: 3, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 4, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'r', instrument: 'other' },
                { position: 5, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' },
                { position: 6, key: 'e', instrument: 'hihat' },
                { position: 7, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 120,
            loops: 2
        },

        // 10: Faster tempo - master level
        {
            id: 10,
            name: "Full Speed",
            description: "Same pattern, faster!",
            tempo: 95,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 0, key: 'e', instrument: 'hihat' },
                { position: 0, key: 'r', instrument: 'other' },
                { position: 1, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 2, key: 'e', instrument: 'hihat' },
                { position: 3, key: 'q', instrument: 'kick' },
                { position: 3, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 4, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'r', instrument: 'other' },
                { position: 5, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' },
                { position: 6, key: 'e', instrument: 'hihat' },
                { position: 7, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 110,
            loops: 2
        }
    ];

    function getAll() {
        return puzzles;
    }

    function getById(id) {
        return puzzles.find(p => p.id === id);
    }

    function getByIndex(index) {
        return puzzles[index] || null;
    }

    function getCount() {
        return puzzles.length;
    }

    function getSymbolsAtPosition(puzzle, position) {
        return puzzle.symbols.filter(s => s.position === position);
    }

    function getActivePositions(puzzle) {
        return [...new Set(puzzle.symbols.map(s => s.position))].sort((a, b) => a - b);
    }

    return {
        getAll,
        getById,
        getByIndex,
        getCount,
        getSymbolsAtPosition,
        getActivePositions
    };
})();
