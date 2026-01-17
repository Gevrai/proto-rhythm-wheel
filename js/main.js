/**
 * Main module - Game initialization and orchestration
 * Continuous gameplay: wheel always spins, auto-advances after 2 perfect loops
 */

const Game = (function() {
    let currentPuzzleIndex = 0;
    let currentPuzzle = null;

    // Timing tracking
    let measureStartTime = 0;
    let expectedHits = []; // Hits expected this measure
    let previousMeasureHits = []; // Store previous measure for completion check
    let consecutiveSuccessfulLoops = 0; // Track perfect loops in a row
    let isFirstMeasure = true; // Skip checking the very first measure

    // DOM elements
    let puzzleNameEl, puzzleTempoEl, statusMessageEl;

    // Animation frame for visual sync
    let animationFrameId = null;

    let started = false;

    function init() {
        // Initialize all modules
        const audioContext = Timing.init();
        Synth.init(audioContext);
        Wheel.init();
        Input.init();
        Feedback.init();

        // Get DOM elements
        puzzleNameEl = document.getElementById('puzzle-name');
        puzzleTempoEl = document.getElementById('puzzle-tempo');
        statusMessageEl = document.getElementById('status-message');

        // Set up timing callbacks
        Timing.setOnSubdivision(handleSubdivision);
        Timing.setOnBeatOne(handleBeatOne);

        // Set up input callback
        Input.setOnKeyPress(handleKeyPress);

        // Load first puzzle (visual only)
        loadPuzzle(0);

        // Wait for user interaction to start (browser audio policy)
        statusMessageEl.textContent = 'Click anywhere to start';
        document.addEventListener('click', startOnClick, { once: true });
        document.addEventListener('keydown', startOnClick, { once: true });

        console.log('Rhythm Wheel initialized - continuous mode');
    }

    function startOnClick() {
        if (started) return;
        started = true;
        startPlaying();
    }

    function loadPuzzle(index) {
        currentPuzzleIndex = index;
        currentPuzzle = Puzzles.getByIndex(index);

        if (!currentPuzzle) {
            // No more puzzles - loop back to first
            currentPuzzleIndex = 0;
            currentPuzzle = Puzzles.getByIndex(0);
            showCompletion();
        }

        // Configure timing (don't stop, just update)
        Timing.setTempo(currentPuzzle.tempo);
        Timing.setSubdivisions(currentPuzzle.subdivisions);

        // Render wheel symbols
        Wheel.renderSymbols(currentPuzzle.symbols);
        Wheel.clearSymbolStates();

        // Update UI
        puzzleNameEl.textContent = `Puzzle ${currentPuzzle.id}: ${currentPuzzle.name}`;
        puzzleTempoEl.textContent = `${currentPuzzle.tempo} BPM`;
        statusMessageEl.textContent = currentPuzzle.description;

        // Reset tracking for new puzzle
        consecutiveSuccessfulLoops = 0;
        expectedHits = [];
        previousMeasureHits = [];
        isFirstMeasure = true;
    }

    function startPlaying() {
        // Enable input
        Input.enable();

        // Start the timing scheduler
        if (!Timing.isRunning()) {
            Timing.start(0.1);
        }

        // Start visual update loop
        startVisualLoop();
    }

    function startVisualLoop() {
        function update() {
            animationFrameId = requestAnimationFrame(update);
        }
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(update);
        }
    }

    function handleSubdivision(subdivision, time) {
        // Schedule visual highlight for this position
        const delay = (time - Timing.getCurrentTime()) * 1000;
        setTimeout(() => {
            Wheel.highlightPosition(subdivision);
        }, Math.max(0, delay));

        // At subdivision 0 (beat 1), check previous measure and start new one
        if (subdivision === 0) {
            // Check previous measure completion (skip the very first measure)
            if (!isFirstMeasure && expectedHits.length > 0) {
                // Store current hits before resetting
                previousMeasureHits = [...expectedHits];
                checkMeasureCompletion();
            }
            isFirstMeasure = false;

            measureStartTime = time;

            // Build expected hits for this new measure
            expectedHits = currentPuzzle.symbols.map(s => ({
                ...s,
                expectedTime: time + (s.position * Timing.getSubdivisionDuration()),
                hit: false
            }));
        }
    }

    function handleBeatOne(time) {
        // Schedule center light pulse
        const delay = (time - Timing.getCurrentTime()) * 1000;
        setTimeout(() => {
            Wheel.pulseCenterLight();
        }, Math.max(0, delay));
    }

    function checkMeasureCompletion() {
        // Check if all symbols were hit correctly (use previousMeasureHits)
        const allHit = previousMeasureHits.every(e => e.hit);
        const anyMissed = previousMeasureHits.some(e => !e.hit);

        if (allHit && previousMeasureHits.length > 0) {
            consecutiveSuccessfulLoops++;

            // Show progress with visual indicator
            if (consecutiveSuccessfulLoops === 1) {
                statusMessageEl.textContent = `${currentPuzzle.description} - 1/2`;
                showLoopSuccess();
            }

            // Advance after 2 consecutive successful loops
            if (consecutiveSuccessfulLoops >= 2) {
                advanceToNextPuzzle();
            }
        } else if (anyMissed) {
            // Reset streak on miss
            consecutiveSuccessfulLoops = 0;
            statusMessageEl.textContent = currentPuzzle.description;
        }

        // Clear symbol completed states for next loop
        Wheel.clearSymbolStates();
    }

    function showLoopSuccess() {
        // Flash the wheel with a success indicator
        const wheel = document.getElementById('wheel');
        wheel.classList.add('loop-success');
        setTimeout(() => {
            wheel.classList.remove('loop-success');
        }, 400);
    }

    function advanceToNextPuzzle() {
        // Show brief success feedback
        statusMessageEl.textContent = 'Nice!';

        // Small delay before advancing to show success
        setTimeout(() => {
            loadPuzzle(currentPuzzleIndex + 1);
        }, 300);
    }

    function handleKeyPress(event) {
        const { key, timestamp } = event;

        // Always play the sound immediately
        Synth.playByKey(key);

        // Find the closest expected hit for this key (keep reference to original)
        const candidates = expectedHits
            .filter(e => e.key === key && !e.hit)
            .map(e => ({
                original: e, // Keep reference to original object
                timingError: (timestamp - e.expectedTime) * 1000 // Convert to ms
            }))
            .sort((a, b) => Math.abs(a.timingError) - Math.abs(b.timingError));

        const match = candidates[0];

        if (match) {
            const tolerance = currentPuzzle.tolerance;
            const timingError = match.timingError;

            if (Math.abs(timingError) <= tolerance) {
                // Hit! Mark the ORIGINAL object
                match.original.hit = true;
                Feedback.evaluateHit(timingError, tolerance);

                // Visual feedback on symbol
                Wheel.highlightSymbol(match.original.position, true);
                Wheel.markSymbolComplete(match.original.position);
            } else {
                // Too early or too late
                if (timingError < -tolerance) {
                    Feedback.showEarly();
                } else {
                    Feedback.showLate();
                }
                // Reset streak on bad timing
                consecutiveSuccessfulLoops = 0;
                statusMessageEl.textContent = currentPuzzle.description;
            }
        } else {
            // Wrong key or already hit this position
            Feedback.showWrongKey();
            // Reset streak on wrong key
            consecutiveSuccessfulLoops = 0;
            statusMessageEl.textContent = currentPuzzle.description;
        }
    }

    function showCompletion() {
        puzzleNameEl.textContent = 'All Puzzles Complete!';
        statusMessageEl.textContent = 'Starting over...';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init,
        getCurrentPuzzle: () => currentPuzzle
    };
})();
