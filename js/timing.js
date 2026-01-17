/**
 * Timing module - Web Audio API lookahead scheduler
 * Uses the "Tale of Two Clocks" pattern for precise timing
 */

const Timing = (function() {
    let audioContext = null;
    let tempo = 80;
    let subdivisions = 8; // 8 positions around the wheel
    let currentSubdivision = 0;
    let nextSubdivisionTime = 0;
    let isPlaying = false;
    let schedulerTimerId = null;

    // Callbacks
    let onSubdivision = null;
    let onBeatOne = null;

    // Lookahead settings
    const SCHEDULE_AHEAD_TIME = 0.1; // How far ahead to schedule (seconds)
    const LOOKAHEAD = 25; // How often to call scheduler (ms)

    function init() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }

    function getAudioContext() {
        return audioContext;
    }

    function setTempo(newTempo) {
        tempo = newTempo;
    }

    function getTempo() {
        return tempo;
    }

    function setSubdivisions(count) {
        subdivisions = count;
    }

    function getSubdivisionDuration() {
        // Duration of one subdivision in seconds
        // 4 beats per measure, subdivisions per measure
        const beatsPerSecond = tempo / 60;
        const measureDuration = 4 / beatsPerSecond;
        return measureDuration / subdivisions;
    }

    function getCurrentSubdivision() {
        return currentSubdivision;
    }

    function getCurrentTime() {
        return audioContext ? audioContext.currentTime : 0;
    }

    function scheduler() {
        // Schedule all subdivisions that fall within the lookahead window
        while (nextSubdivisionTime < audioContext.currentTime + SCHEDULE_AHEAD_TIME) {
            scheduleSubdivision(currentSubdivision, nextSubdivisionTime);
            advanceSubdivision();
        }

        schedulerTimerId = setTimeout(scheduler, LOOKAHEAD);
    }

    function scheduleSubdivision(subdivision, time) {
        // Call the subdivision callback
        if (onSubdivision) {
            onSubdivision(subdivision, time);
        }

        // Beat 1 is at subdivision 0
        if (subdivision === 0 && onBeatOne) {
            onBeatOne(time);
        }
    }

    function advanceSubdivision() {
        nextSubdivisionTime += getSubdivisionDuration();
        currentSubdivision = (currentSubdivision + 1) % subdivisions;
    }

    function start(startDelay = 0) {
        if (isPlaying) return;

        if (!audioContext) {
            init();
        }

        // Resume audio context if suspended (required by browsers)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        isPlaying = true;
        currentSubdivision = 0;
        nextSubdivisionTime = audioContext.currentTime + startDelay;

        scheduler();
    }

    function stop() {
        isPlaying = false;
        if (schedulerTimerId) {
            clearTimeout(schedulerTimerId);
            schedulerTimerId = null;
        }
    }

    function reset() {
        stop();
        currentSubdivision = 0;
        nextSubdivisionTime = 0;
    }

    function isRunning() {
        return isPlaying;
    }

    function setOnSubdivision(callback) {
        onSubdivision = callback;
    }

    function setOnBeatOne(callback) {
        onBeatOne = callback;
    }

    // Get the expected time for a specific subdivision position
    // relative to the start of the current measure
    function getExpectedTimeForPosition(position, measureStartTime) {
        return measureStartTime + (position * getSubdivisionDuration());
    }

    return {
        init,
        getAudioContext,
        setTempo,
        getTempo,
        setSubdivisions,
        getSubdivisionDuration,
        getCurrentSubdivision,
        getCurrentTime,
        start,
        stop,
        reset,
        isRunning,
        setOnSubdivision,
        setOnBeatOne,
        getExpectedTimeForPosition
    };
})();
