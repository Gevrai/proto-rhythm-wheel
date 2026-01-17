/**
 * Puzzles module - Puzzle definitions
 * Contains all puzzle data for the game
 */

const Puzzles = (function() {
    // Beat positions:
    // Position 0: Beat 1 (top, 12 o'clock)
    // Position 2: Beat 2 (3 o'clock)
    // Position 4: Beat 3 (bottom, 6 o'clock)
    // Position 6: Beat 4 (9 o'clock)
    // Odd positions (1, 3, 5, 7): eighth notes between beats

    const puzzles = [
        {
            id: 1,
            name: "First Beat",
            description: "Press Q on beat 1",
            tempo: 80,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' }
            ],
            tolerance: 200, // ms hit window (generous for beginners)
            loops: 2 // How many loops to complete
        },
        {
            id: 2,
            name: "One and Three",
            description: "Press Q on beats 1 and 3",
            tempo: 80,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 4, key: 'q', instrument: 'kick' }
            ],
            tolerance: 180,
            loops: 2
        },
        {
            id: 3,
            name: "Backbeat",
            description: "Press W on beats 2 and 4",
            tempo: 85,
            subdivisions: 8,
            symbols: [
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 6, key: 'w', instrument: 'snare' }
            ],
            tolerance: 180,
            loops: 2
        },
        {
            id: 4,
            name: "Rock Beat",
            description: "Kick on 1 and 3, snare on 2 and 4",
            tempo: 90,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'q', instrument: 'kick' },
                { position: 2, key: 'w', instrument: 'snare' },
                { position: 4, key: 'q', instrument: 'kick' },
                { position: 6, key: 'w', instrument: 'snare' }
            ],
            tolerance: 150,
            loops: 2
        },
        {
            id: 5,
            name: "Hi-Hat Time",
            description: "Hi-hats on every beat",
            tempo: 85,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 150,
            loops: 2
        },
        {
            id: 6,
            name: "Full Kit",
            description: "Kick, snare, and hi-hat together",
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
            tolerance: 150,
            loops: 2
        },
        {
            id: 7,
            name: "Eighth Notes",
            description: "Hi-hats on every eighth note",
            tempo: 75,
            subdivisions: 8,
            symbols: [
                { position: 0, key: 'e', instrument: 'hihat' },
                { position: 1, key: 'e', instrument: 'hihat' },
                { position: 2, key: 'e', instrument: 'hihat' },
                { position: 3, key: 'e', instrument: 'hihat' },
                { position: 4, key: 'e', instrument: 'hihat' },
                { position: 5, key: 'e', instrument: 'hihat' },
                { position: 6, key: 'e', instrument: 'hihat' },
                { position: 7, key: 'e', instrument: 'hihat' }
            ],
            tolerance: 120,
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

    // Get all unique positions that have symbols in a puzzle
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
