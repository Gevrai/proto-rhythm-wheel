/**
 * Puzzles module - Loads beat patterns from embedded data
 * Supports per-instrument subdivisions for polyrhythms
 */

const Puzzles = (function() {
    let genres = [];
    let currentGenre = null;
    let currentPuzzles = [];
    let loaded = false;

    // Get key for instrument from Input module (with fallback)
    function getKeyForInstrument(instrument) {
        if (typeof Input !== 'undefined' && Input.getKeyForInstrument) {
            return Input.getKeyForInstrument(instrument);
        }
        // Fallback mapping
        const fallback = { kick: 'q', snare: 'w', hihat: 'e', other: 'r' };
        return fallback[instrument];
    }

    // Calculate GCD of two numbers
    function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
    }

    // Calculate LCM of two numbers
    function lcm(a, b) {
        return (a * b) / gcd(a, b);
    }

    // Calculate LCM of an array of numbers
    function lcmArray(arr) {
        return arr.reduce((acc, val) => lcm(acc, val), 1);
    }

    // Convert pattern object { kick: [0, 4], snare: [2, 6] } to symbol array
    function expandPattern(pattern) {
        const symbols = [];
        for (const [instrument, positions] of Object.entries(pattern)) {
            const key = getKeyForInstrument(instrument);
            if (!key) continue;
            for (const position of positions) {
                symbols.push({ position, key, instrument });
            }
        }
        return symbols;
    }

    async function loadBeats() {
        if (loaded) return;

        // Use embedded BeatsData (from beats-data.js)
        if (typeof BeatsData !== 'undefined' && BeatsData.genres) {
            genres = BeatsData.genres;
        } else {
            console.error('BeatsData not found, using fallback');
            genres = [{
                id: 'rock',
                name: 'Rock',
                description: 'Classic rock beat',
                defaultTempo: 80,
                instrumentSubdivisions: { kick: 8, snare: 8, hihat: 8, other: 8 },
                puzzles: [
                    { name: 'The Downbeat', description: 'Q on beat 1', tolerance: 220,
                      pattern: { kick: [0] } }
                ]
            }];
        }

        // Default to first genre (rock)
        if (genres.length > 0) {
            setGenre(genres[0].id);
        }

        loaded = true;
    }

    function setGenre(genreId) {
        const genre = genres.find(g => g.id === genreId);
        if (!genre) {
            console.error('Genre not found:', genreId);
            return false;
        }

        currentGenre = genre;

        // Get instrument subdivisions
        const instSubs = genre.instrumentSubdivisions;
        const allSubdivisions = Object.values(instSubs);

        // Calculate master subdivision (LCM of all instrument subdivisions)
        const masterSubdivision = lcmArray(allSubdivisions);

        // Convert puzzles to expected format with mapped positions
        currentPuzzles = genre.puzzles.map((puzzle, index) => {
            // Expand pattern object to symbol array
            const patternSymbols = expandPattern(puzzle.pattern);

            // Map each symbol's position to the master subdivision grid
            const mappedSymbols = patternSymbols.map(symbol => {
                const instrumentSub = instSubs[symbol.instrument] || 8;
                // Convert position from instrument grid to master grid
                const masterPosition = Math.round(symbol.position * (masterSubdivision / instrumentSub));
                return {
                    ...symbol,
                    originalPosition: symbol.position,
                    position: masterPosition,
                    instrumentSubdivisions: instrumentSub
                };
            });

            return {
                id: index + 1,
                name: puzzle.name,
                description: puzzle.description,
                tolerance: puzzle.tolerance,
                symbols: mappedSymbols,
                masterSubdivision: masterSubdivision,
                instrumentSubdivisions: instSubs,
                defaultTempo: genre.defaultTempo
            };
        });

        return true;
    }

    function getGenres() {
        return genres.map(g => ({
            id: g.id,
            name: g.name,
            description: g.description,
            defaultTempo: g.defaultTempo,
            instrumentSubdivisions: g.instrumentSubdivisions
        }));
    }

    function getCurrentGenre() {
        return currentGenre;
    }

    function getInstrumentSubdivisions() {
        return currentGenre ? currentGenre.instrumentSubdivisions : { kick: 8, snare: 8, hihat: 8, other: 8 };
    }

    function getMasterSubdivision() {
        if (!currentGenre) return 8;
        const subs = Object.values(currentGenre.instrumentSubdivisions);
        return lcmArray(subs);
    }

    function getAll() {
        return currentPuzzles;
    }

    function getById(id) {
        return currentPuzzles.find(p => p.id === id);
    }

    function getByIndex(index) {
        return currentPuzzles[index] || null;
    }

    function getCount() {
        return currentPuzzles.length;
    }

    function getSymbolsAtPosition(puzzle, position) {
        return puzzle.symbols.filter(s => s.position === position);
    }

    function getActivePositions(puzzle) {
        return [...new Set(puzzle.symbols.map(s => s.position))].sort((a, b) => a - b);
    }

    function getDefaultTempo() {
        return currentGenre ? currentGenre.defaultTempo : 80;
    }

    return {
        loadBeats,
        setGenre,
        getGenres,
        getCurrentGenre,
        getInstrumentSubdivisions,
        getMasterSubdivision,
        getAll,
        getById,
        getByIndex,
        getCount,
        getSymbolsAtPosition,
        getActivePositions,
        getDefaultTempo
    };
})();
