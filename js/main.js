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
    let puzzleNameEl, statusMessageEl, genreSelectEl;

    // Animation frame for visual sync
    let animationFrameId = null;

    let started = false;
    let paused = false;
    let previewActive = false;
    let lastTapTime = 0;

    async function init() {
        // Initialize all modules
        const audioContext = Timing.init();
        Synth.init(audioContext);
        Wheel.init();
        Input.init();
        Feedback.init();

        // Get DOM elements
        puzzleNameEl = document.getElementById('puzzle-name');
        statusMessageEl = document.getElementById('status-message');
        genreSelectEl = document.getElementById('genre-select');

        // Load beats from JSON
        statusMessageEl.textContent = 'Loading beats...';
        await Puzzles.loadBeats();

        // Populate genre selector
        populateGenreSelector();

        // Set up timing callbacks
        Timing.setOnSubdivision(handleSubdivision);
        Timing.setOnBeatOne(handleBeatOne);

        // Set up input callback
        Input.setOnKeyPress(handleKeyPress);

        // Hidden level navigation (J = previous, K = next)
        document.addEventListener('keydown', handleLevelNav);

        // Genre selector change
        if (genreSelectEl) {
            genreSelectEl.addEventListener('change', handleGenreChange);
        }

        // Set initial tempo and subdivisions from genre
        Timing.setTempo(Puzzles.getDefaultTempo());
        Timing.setSubdivisions(Puzzles.getMasterSubdivision());

        // Tap tempo on center circle (use event delegation on SVG)
        const wheelSvg = document.getElementById('wheel');
        if (wheelSvg) {
            wheelSvg.addEventListener('click', (event) => {
                const centerLight = wheelSvg.querySelector('.center-light');
                if (!centerLight) return;

                // Check if clicked on center light or center text
                const rect = centerLight.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const radius = rect.width / 2;
                const dx = event.clientX - centerX;
                const dy = event.clientY - centerY;

                if (dx * dx + dy * dy <= radius * radius) {
                    handleTapTempo(centerLight);
                }
            });
        }

        // Load first puzzle (visual only)
        loadPuzzle(0);

        // Wait for instrument key to start (browser audio policy)
        statusMessageEl.textContent = 'Press Q, W, E, or R to start';
        document.addEventListener('keydown', startOnFirstKey);

        console.log('Rhythm Wheel initialized - continuous mode');
    }

    function populateGenreSelector() {
        if (!genreSelectEl) return;

        const genres = Puzzles.getGenres();
        genreSelectEl.innerHTML = '';

        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelectEl.appendChild(option);
        });
    }

    function handleGenreChange(event) {
        const genreId = event.target.value;
        changeGenre(genreId);
    }

    function changeGenre(genreId) {
        // Stop current playback
        const wasRunning = Timing.isRunning();
        if (wasRunning) {
            Timing.stop();
        }

        // Switch genre
        Puzzles.setGenre(genreId);

        // Update timing for new genre
        Timing.setTempo(Puzzles.getDefaultTempo());
        Timing.setSubdivisions(Puzzles.getMasterSubdivision());

        // Reset to first puzzle of new genre
        currentPuzzleIndex = 0;
        loadPuzzle(0);

        // Restart if was running
        if (wasRunning && started && !paused) {
            Timing.start(0.1);
        }
    }

    function startOnFirstKey(event) {
        if (started) return;

        const key = event.key.toLowerCase();
        const validKeys = ['q', 'w', 'e', 'r'];

        if (!validKeys.includes(key)) return;

        started = true;
        document.removeEventListener('keydown', startOnFirstKey);

        // Play the instrument sound
        Synth.playByKey(key);

        // Start the game
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

        // Update subdivisions for this puzzle (use master subdivision for timing)
        const masterSubdivision = currentPuzzle.masterSubdivision || Puzzles.getMasterSubdivision();
        const instrumentSubdivisions = currentPuzzle.instrumentSubdivisions || Puzzles.getInstrumentSubdivisions();
        Timing.setSubdivisions(masterSubdivision);

        // Render wheel symbols with per-instrument subdivisions
        Wheel.renderSymbols(currentPuzzle.symbols, instrumentSubdivisions, masterSubdivision);
        Wheel.clearSymbolStates();

        // Update UI
        puzzleNameEl.textContent = currentPuzzle.name;
        updateTempoDisplay();
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

        // If preview is active, play sounds for this subdivision
        if (previewActive && currentPuzzle) {
            const symbolsAtPosition = currentPuzzle.symbols.filter(s => s.position === subdivision);
            symbolsAtPosition.forEach(symbol => {
                Synth.playSound(symbol.instrument, time);
            });
        }

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

    function handleLevelNav(event) {
        const key = event.key.toLowerCase();

        // When paused, any instrument key or space restarts
        if (paused) {
            const validKeys = ['q', 'w', 'e', 'r'];
            if (validKeys.includes(key)) {
                Synth.playByKey(key);
                restartCurrentLevel();
                return;
            } else if (event.code === 'Space') {
                event.preventDefault();
                restartCurrentLevel();
                return;
            }
        }

        if (key === 'j') {
            goToPreviousPuzzle();
        } else if (key === 'k') {
            goToNextPuzzle();
        } else if (key === 'p') {
            previewBeat();
        } else if (event.code === 'Space') {
            event.preventDefault();
            togglePause();
        }
    }

    function togglePause() {
        if (!started) return;

        if (paused) {
            // Restart current level
            restartCurrentLevel();
        } else {
            // Pause the game
            pauseGame();
        }
    }

    function pauseGame() {
        paused = true;
        Timing.stop();
        Input.disable();
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        statusMessageEl.textContent = 'PAUSED - Press Space to restart';
    }

    function restartCurrentLevel() {
        paused = false;
        loadPuzzle(currentPuzzleIndex);
        startPlaying();
    }

    function goToNextPuzzle() {
        const nextIndex = currentPuzzleIndex + 1;
        if (nextIndex < Puzzles.getCount()) {
            loadPuzzle(nextIndex);
        }
    }

    function goToPreviousPuzzle() {
        const prevIndex = currentPuzzleIndex - 1;
        if (prevIndex >= 0) {
            loadPuzzle(prevIndex);
        }
    }

    function previewBeat() {
        if (!currentPuzzle) return;

        if (previewActive) {
            stopPreview();
        } else {
            previewActive = true;
            statusMessageEl.textContent = 'Preview (P to stop)';
        }
    }

    function stopPreview() {
        previewActive = false;
        if (currentPuzzle) {
            statusMessageEl.textContent = currentPuzzle.description;
        }
    }

    function handleTapTempo(centerLight) {
        // Visual feedback
        centerLight.classList.add('tap');
        setTimeout(() => {
            centerLight.classList.remove('tap');
        }, 20);

        const now = performance.now();
        const timeSinceLastTap = now - lastTapTime;

        // If more than 2 seconds since last tap, start fresh
        if (timeSinceLastTap < 2000 && lastTapTime > 0) {
            // Calculate BPM from interval
            const bpm = Math.round(60000 / timeSinceLastTap);
            // Clamp to reasonable range
            const clampedBpm = Math.max(40, Math.min(200, bpm));
            Timing.setTempo(clampedBpm);
            updateTempoDisplay();
        }

        lastTapTime = now;
    }

    function updateTempoDisplay() {
        Wheel.setCenterText(Timing.getTempo());
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init,
        changeGenre,
        getCurrentPuzzle: () => currentPuzzle
    };
})();
