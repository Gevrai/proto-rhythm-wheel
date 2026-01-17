/**
 * Main module - Game initialization and orchestration
 * Coordinates all game systems and manages game state
 */

const Game = (function() {
    // Game states
    const STATE = {
        IDLE: 'idle',
        COUNTDOWN: 'countdown',
        PLAYING: 'playing',
        SUCCESS: 'success',
        FAILURE: 'failure'
    };

    let state = STATE.IDLE;
    let currentPuzzleIndex = 0;
    let currentPuzzle = null;

    // Timing tracking
    let measureStartTime = 0;
    let currentLoop = 0;
    let expectedHits = []; // Hits expected this measure
    let hitsThisMeasure = []; // Track which symbols were hit this measure

    // Statistics
    let perfectHits = 0;
    let goodHits = 0;
    let okHits = 0;
    let misses = 0;

    // DOM elements
    let startBtn, retryBtn, nextBtn;
    let puzzleNameEl, puzzleTempoEl, statusMessageEl;
    let countdownOverlay, countdownNumber;

    // Animation frame for visual sync
    let animationFrameId = null;

    function init() {
        // Initialize all modules
        const audioContext = Timing.init();
        Synth.init(audioContext);
        Wheel.init();
        Input.init();
        Feedback.init();

        // Get DOM elements
        startBtn = document.getElementById('start-btn');
        retryBtn = document.getElementById('retry-btn');
        nextBtn = document.getElementById('next-btn');
        puzzleNameEl = document.getElementById('puzzle-name');
        puzzleTempoEl = document.getElementById('puzzle-tempo');
        statusMessageEl = document.getElementById('status-message');
        countdownOverlay = document.getElementById('countdown-overlay');
        countdownNumber = document.getElementById('countdown-number');

        // Set up event listeners
        startBtn.addEventListener('click', handleStart);
        retryBtn.addEventListener('click', handleRetry);
        nextBtn.addEventListener('click', handleNext);

        // Set up timing callbacks
        Timing.setOnSubdivision(handleSubdivision);
        Timing.setOnBeatOne(handleBeatOne);

        // Set up input callback
        Input.setOnKeyPress(handleKeyPress);

        // Load first puzzle (but don't start)
        loadPuzzle(0);

        console.log('Rhythm Wheel initialized');
    }

    function loadPuzzle(index) {
        currentPuzzleIndex = index;
        currentPuzzle = Puzzles.getByIndex(index);

        if (!currentPuzzle) {
            // No more puzzles - show completion
            showCompletion();
            return;
        }

        // Configure timing
        Timing.setTempo(currentPuzzle.tempo);
        Timing.setSubdivisions(currentPuzzle.subdivisions);

        // Render wheel symbols
        Wheel.renderSymbols(currentPuzzle.symbols);
        Wheel.clearSymbolStates();

        // Update UI
        puzzleNameEl.textContent = `Puzzle ${currentPuzzle.id}: ${currentPuzzle.name}`;
        puzzleTempoEl.textContent = `${currentPuzzle.tempo} BPM`;
        statusMessageEl.textContent = currentPuzzle.description;

        // Reset state
        resetStats();
    }

    function resetStats() {
        perfectHits = 0;
        goodHits = 0;
        okHits = 0;
        misses = 0;
        currentLoop = 0;
        hitsThisMeasure = [];
        expectedHits = [];
    }

    function handleStart() {
        if (state !== STATE.IDLE && state !== STATE.SUCCESS && state !== STATE.FAILURE) {
            return;
        }

        // Disable start button during play
        startBtn.disabled = true;
        retryBtn.disabled = true;
        nextBtn.disabled = true;

        // Start countdown
        startCountdown();
    }

    function startCountdown() {
        state = STATE.COUNTDOWN;
        countdownOverlay.classList.remove('hidden');

        let count = 3;
        countdownNumber.textContent = count;

        const countInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownNumber.textContent = count;
                Synth.playClick();
            } else {
                clearInterval(countInterval);
                countdownOverlay.classList.add('hidden');
                startPlaying();
            }
        }, 60000 / currentPuzzle.tempo); // Use tempo for countdown timing
    }

    function startPlaying() {
        state = STATE.PLAYING;
        currentLoop = 0;
        hitsThisMeasure = [];

        // Clear any previous states
        Wheel.clearSymbolStates();
        Feedback.clear();

        // Enable input
        Input.enable();

        // Start the timing scheduler
        Timing.start(0.1); // Small delay to let things settle

        // Start visual update loop
        startVisualLoop();

        statusMessageEl.textContent = 'Play!';
    }

    function startVisualLoop() {
        function update() {
            // Visual updates synced to animation frame
            // Could add playhead indicator here
            animationFrameId = requestAnimationFrame(update);
        }
        animationFrameId = requestAnimationFrame(update);
    }

    function stopVisualLoop() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function handleSubdivision(subdivision, time) {
        // Schedule visual highlight for this position
        const delay = (time - Timing.getCurrentTime()) * 1000;
        setTimeout(() => {
            Wheel.highlightPosition(subdivision);
        }, Math.max(0, delay));

        // Track measure start time
        if (subdivision === 0) {
            measureStartTime = time;
            hitsThisMeasure = [];

            // Build expected hits for this measure
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

        // Check if we completed a loop (except first beat of first loop)
        if (currentLoop > 0 || time > measureStartTime + 0.1) {
            checkMeasureCompletion();
        }

        currentLoop++;

        // Check if puzzle is complete
        if (currentLoop > currentPuzzle.loops) {
            endPuzzle(true);
        }
    }

    function checkMeasureCompletion() {
        // Check for missed notes (symbols that weren't hit)
        expectedHits.forEach(expected => {
            if (!expected.hit) {
                misses++;
                // Don't show miss feedback here - player might have played wrong key
            }
        });
    }

    function handleKeyPress(event) {
        if (state !== STATE.PLAYING) return;

        const { key, timestamp } = event;
        const instrument = Input.getKeyInstrument(key);

        // Always play the sound immediately
        Synth.playByKey(key);

        // Find the closest expected hit for this key
        const matchingExpected = expectedHits
            .filter(e => e.key === key && !e.hit)
            .map(e => ({
                ...e,
                timingError: (timestamp - e.expectedTime) * 1000 // Convert to ms
            }))
            .sort((a, b) => Math.abs(a.timingError) - Math.abs(b.timingError))[0];

        if (matchingExpected) {
            const tolerance = currentPuzzle.tolerance;
            const timingError = matchingExpected.timingError;

            if (Math.abs(timingError) <= tolerance) {
                // Hit!
                matchingExpected.hit = true;
                const result = Feedback.evaluateHit(timingError, tolerance);

                // Update stats
                if (result === 'perfect') perfectHits++;
                else if (result === 'good') goodHits++;
                else if (result === 'ok') okHits++;

                // Visual feedback on symbol
                Wheel.highlightSymbol(matchingExpected.position, true);
                Wheel.markSymbolComplete(matchingExpected.position);
            } else {
                // Too early or too late
                if (timingError < -tolerance) {
                    Feedback.showEarly();
                } else {
                    Feedback.showLate();
                }
                misses++;
            }
        } else {
            // Wrong key or already hit this position
            Feedback.showWrongKey();
            misses++;
        }
    }

    function endPuzzle(completed) {
        state = completed ? STATE.SUCCESS : STATE.FAILURE;

        // Stop timing and input
        Timing.stop();
        Input.disable();
        stopVisualLoop();

        // Calculate final misses from last measure
        if (completed) {
            checkMeasureCompletion();
        }

        // Determine success
        const totalNotes = currentPuzzle.symbols.length * currentPuzzle.loops;
        const totalHits = perfectHits + goodHits + okHits;
        const successRate = totalHits / totalNotes;

        // Need at least 70% to pass
        const passed = successRate >= 0.7;

        // Update UI
        if (passed) {
            statusMessageEl.textContent = `Success! ${Math.round(successRate * 100)}% accuracy`;
            nextBtn.disabled = false;
        } else {
            statusMessageEl.textContent = `Try again! ${Math.round(successRate * 100)}% accuracy`;
        }

        startBtn.disabled = false;
        retryBtn.disabled = false;

        // Update button text
        startBtn.textContent = 'Restart';
    }

    function handleRetry() {
        // Reset and reload current puzzle
        Timing.reset();
        loadPuzzle(currentPuzzleIndex);
        state = STATE.IDLE;
        startBtn.textContent = 'Start';
        startBtn.disabled = false;
        retryBtn.disabled = true;
        nextBtn.disabled = true;
    }

    function handleNext() {
        // Load next puzzle
        Timing.reset();
        loadPuzzle(currentPuzzleIndex + 1);
        state = STATE.IDLE;
        startBtn.textContent = 'Start';
        startBtn.disabled = false;
        retryBtn.disabled = true;
        nextBtn.disabled = true;
    }

    function showCompletion() {
        puzzleNameEl.textContent = 'Congratulations!';
        puzzleTempoEl.textContent = '';
        statusMessageEl.textContent = 'You completed all puzzles!';
        startBtn.disabled = true;
        retryBtn.disabled = false;
        nextBtn.disabled = true;

        // Reset to first puzzle on retry
        retryBtn.onclick = () => {
            currentPuzzleIndex = -1;
            handleNext();
            retryBtn.onclick = handleRetry;
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init,
        getState: () => state,
        getCurrentPuzzle: () => currentPuzzle
    };
})();
