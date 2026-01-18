/**
 * Input module - Keyboard handling with customizable key mapping
 * Captures key presses and timestamps for hit detection
 */

const Input = (function() {
    // Default key to instrument mapping
    let keyToInstrument = {
        'q': 'kick',
        'w': 'snare',
        'e': 'hihat',
        'r': 'other'
    };

    // Reverse mapping: instrument to key
    let instrumentToKey = {
        'kick': 'q',
        'snare': 'w',
        'hihat': 'e',
        'other': 'r'
    };

    let onKeyPress = null;
    let enabled = false;
    let keyStates = {}; // Track which keys are currently pressed

    // Remapping state
    let remappingInstrument = null;
    let onRemapComplete = null;

    function init() {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }

    function getValidKeys() {
        return Object.keys(keyToInstrument);
    }

    function isValidKey(key) {
        return key in keyToInstrument;
    }

    function handleKeyDown(event) {
        const key = event.key.toLowerCase();

        // If we're remapping, handle it specially
        if (remappingInstrument) {
            handleRemapKey(key);
            event.preventDefault();
            return;
        }

        // Ignore if not a valid key or if already pressed (prevent key repeat)
        if (!isValidKey(key) || keyStates[key]) {
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

    function handleRemapKey(key) {
        // Check if it's a valid alphanumeric lowercase key
        const isAlphanumeric = /^[a-z0-9]$/.test(key);

        if (isAlphanumeric) {
            // Check if this key is already assigned to another instrument
            const existingInstrument = keyToInstrument[key];

            if (existingInstrument && existingInstrument !== remappingInstrument) {
                // Swap keys between instruments
                const oldKey = instrumentToKey[remappingInstrument];

                // Update the other instrument to use the old key
                instrumentToKey[existingInstrument] = oldKey;
                keyToInstrument[oldKey] = existingInstrument;
            } else {
                // Remove old key mapping for this instrument
                const oldKey = instrumentToKey[remappingInstrument];
                delete keyToInstrument[oldKey];
            }

            // Set new key for this instrument
            keyToInstrument[key] = remappingInstrument;
            instrumentToKey[remappingInstrument] = key;

            // Complete remapping
            const instrument = remappingInstrument;
            finishRemapping(true, instrument, key);
        } else {
            // Cancel remapping on non-alphanumeric key
            finishRemapping(false);
        }
    }

    function finishRemapping(success, instrument, newKey) {
        const callback = onRemapComplete;
        remappingInstrument = null;
        onRemapComplete = null;

        if (callback) {
            callback(success, instrument, newKey);
        }
    }

    function handleKeyUp(event) {
        const key = event.key.toLowerCase();

        if (!isValidKey(key)) {
            return;
        }

        // Mark key as released
        keyStates[key] = false;

        // Remove visual feedback
        hideKeyPress(key);
    }

    function showKeyPress(key) {
        // Find key item by instrument, not by key class
        const instrument = keyToInstrument[key];
        if (instrument) {
            const keyItem = document.querySelector(`.key-item[data-instrument="${instrument}"]`);
            if (keyItem) {
                keyItem.classList.add('pressed');
            }
        }
    }

    function hideKeyPress(key) {
        const instrument = keyToInstrument[key];
        if (instrument) {
            const keyItem = document.querySelector(`.key-item[data-instrument="${instrument}"]`);
            if (keyItem) {
                keyItem.classList.remove('pressed');
            }
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

    function getInstrumentForKey(key) {
        return keyToInstrument[key.toLowerCase()];
    }

    function getKeyForInstrument(instrument) {
        return instrumentToKey[instrument];
    }

    function startRemapping(instrument, callback) {
        remappingInstrument = instrument;
        onRemapComplete = callback;
    }

    function isRemapping() {
        return remappingInstrument !== null;
    }

    function getRemappingInstrument() {
        return remappingInstrument;
    }

    function cancelRemapping() {
        finishRemapping(false);
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
        getInstrumentForKey,
        getKeyForInstrument,
        startRemapping,
        isRemapping,
        getRemappingInstrument,
        cancelRemapping,
        destroy,
        getValidKeys
    };
})();
