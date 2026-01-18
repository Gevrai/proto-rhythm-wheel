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
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' }
            ],
            tolerance: 220
        },

        // 2: Add kick on beat 3
        {
            id: 2,
            name: "One and Three",
            description: "Add Q on beat 3",
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 4, key: 'q', instrument: 'kick' }
            ],
            tolerance: 200
        },

        // 3: Add snare on beats 2 and 4
        {
            id: 3,
            name: "Add Backbeat",
            description: "Add W on beats 2 and 4",
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 6, key: 'w', instrument: 'snare' }
            ],
            tolerance: 180
        },

        // 4: Add hi-hat on beats 1 and 3
        {
            id: 4,
            name: "Add Hi-Hat",
            description: "Add E on beats 1 and 3",
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 1, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 5, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' }
            ],
            tolerance: 180
        },

        // 5: Add hi-hat on "and" of 2 and 4 (positions 3 and 7)
        {
            id: 5,
            name: "Full Hi-Hat",
            description: "Add E on 2.5 and 4.5",
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 1, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 3, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 5, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' },
                { position: 7, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 160
        },

        // 6: Add bell on beat 1
        {
            id: 6,
            name: "Add Bell",
            description: "Add R on beat 1",
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 0, key: 'r', instrument: 'other' },
                { position: 1, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 3, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 5, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' },
                { position: 7, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 150
        },

        // 7: Add syncopated kick on "and" of 2
        {
            id: 7,
            name: "Syncopation",
            description: "Add Q on the 'and' of 2",
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 0, key: 'r', instrument: 'other' },
                { position: 1, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 3, key: 'q', instrument: 'kick' },
                { position: 3, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 5, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' },
                { position: 7, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 140
        },

        // 8: Add bell on beat 3 too
        {
            id: 8,
            name: "Double Bell",
            description: "Add R on beat 3",
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 0, key: 'r', instrument: 'other' },
                { position: 1, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 3, key: 'q', instrument: 'kick' },
                { position: 3, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 4, key: 'r', instrument: 'other' },
                { position: 5, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' },
                { position: 7, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 130
        },

        // 9: Same pattern, tighter tolerance
        {
            id: 9,
            name: "Precision",
            description: "Tighter timing!",
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 0, key: 'r', instrument: 'other' },
                { position: 1, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 3, key: 'q', instrument: 'kick' },
                { position: 3, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 4, key: 'r', instrument: 'other' },
                { position: 5, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'w', instrument: 'snare' },
                { position: 7, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 80
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
