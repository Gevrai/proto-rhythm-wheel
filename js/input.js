/**
 * Input module - QWER keyboard handling
 * Captures key presses and timestamps for hit detection
 */

const Input = (function() {
    const VALID_KEYS = ['q', 'w', 'e', 'r'];
    let onKeyPress = null;
    let enabled = false;
    let keyStates = {}; // Track which keys are currently pressed

    function init() {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }

    function handleKeyDown(event) {
        const key = event.key.toLowerCase();

        // Ignore if not a valid key or if already pressed (prevent key repeat)
        if (!VALID_KEYS.includes(key) || keyStates[key]) {
            return;
        }

        // Mark key as pressed
        keyStates[key] = true;

        // Visual feedback on key element
        showKeyPress(key);

        // Only process game input if enabled
        if (!enabled) return;

        // Get high-precision timestamp
        const timestamp = Timing.getCurrentTime();

        if (onKeyPress) {
            onKeyPress({
                key: key,
                timestamp: timestamp,
                originalEvent: event
            });
        }
    }

    function handleKeyUp(event) {
        const key = event.key.toLowerCase();

        if (!VALID_KEYS.includes(key)) {
            return;
        }

        // Mark key as released
        keyStates[key] = false;

        // Remove visual feedback
        hideKeyPress(key);
    }

    function showKeyPress(key) {
        const keyItem = document.querySelector(`.key-${key}`);
        if (keyItem) {
            keyItem.classList.add('pressed');
        }
    }

    function hideKeyPress(key) {
        const keyItem = document.querySelector(`.key-${key}`);
        if (keyItem) {
            keyItem.classList.remove('pressed');
        }
    }

    function setOnKeyPress(callback) {
        onKeyPress = callback;
    }

    function enable() {
        enabled = true;
    }

    function disable() {
        enabled = false;
    }

    function isEnabled() {
        return enabled;
    }

    function getKeyInstrument(key) {
        const keyMap = {
            'q': 'kick',
            'w': 'snare',
            'e': 'hihat',
            'r': 'other'
        };
        return keyMap[key.toLowerCase()];
    }

    function destroy() {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
    }

    return {
        init,
        setOnKeyPress,
        enable,
        disable,
        isEnabled,
        getKeyInstrument,
        destroy,
        VALID_KEYS
    };
})();
