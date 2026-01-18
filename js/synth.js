/**
 * Synth module - Web Audio drum synthesis
 * Creates kick, snare, hi-hat, and other sounds without audio files
 */

const Synth = (function() {
    let audioContext = null;
    let snareNoiseBuffer = null;
    let hihatNoiseBuffer = null;

    function init(ctx) {
        audioContext = ctx;
        // Pre-create noise buffers to avoid lag
        snareNoiseBuffer = createNoiseBuffer(0.2);
        hihatNoiseBuffer = createNoiseBuffer(0.15);
    }

    function ensureAudioContext() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }

    function playKick(time) {
        if (!audioContext) return;
        ensureAudioContext();

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

        osc.start(time);
        osc.stop(time + 0.3);
    }

    function playSnare(time) {
        if (!audioContext || !snareNoiseBuffer) return;
        ensureAudioContext();

        // Noise component (snare wires)
        const noise = audioContext.createBufferSource();
        noise.buffer = snareNoiseBuffer;

        const noiseFilter = audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.5, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioContext.destination);

        // Tone component (snare body)
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);

        oscGain.gain.setValueAtTime(0.7, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.connect(oscGain);
        oscGain.connect(audioContext.destination);

        noise.start(time);
        noise.stop(time + 0.2);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    function playHihat(time) {
        if (!audioContext || !hihatNoiseBuffer) return;
        ensureAudioContext();

        const noise = audioContext.createBufferSource();
        noise.buffer = hihatNoiseBuffer;

        const highpass = audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 5000;

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        noise.connect(highpass);
        highpass.connect(gain);
        gain.connect(audioContext.destination);

        noise.start(time);
        noise.stop(time + 0.15);
    }

    function playOther(time) {
        if (!audioContext) return;
        ensureAudioContext();

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, time);
        osc.frequency.exponentialRampToValueAtTime(440, time + 0.1);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

        osc.start(time);
        osc.stop(time + 0.25);
    }

    function createNoiseBuffer(duration) {
        if (!audioContext) return null;
        const sampleRate = audioContext.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    function playSound(instrument, time) {
        if (!audioContext) return;
        time = time || audioContext.currentTime;

        switch (instrument) {
            case 'kick':
                playKick(time);
                break;
            case 'snare':
                playSnare(time);
                break;
            case 'hihat':
                playHihat(time);
                break;
            case 'other':
                playOther(time);
                break;
        }
    }

    function playByKey(key, time) {
        if (!audioContext) return;

        // Use Input module's key mapping if available, fallback to defaults
        let instrument;
        if (typeof Input !== 'undefined' && Input.getInstrumentForKey) {
            instrument = Input.getInstrumentForKey(key);
        } else {
            const keyMap = { 'q': 'kick', 'w': 'snare', 'e': 'hihat', 'r': 'other' };
            instrument = keyMap[key.toLowerCase()];
        }

        if (instrument) {
            playSound(instrument, time || audioContext.currentTime);
        }
    }

    function playClick(time, isDownbeat = false) {
        if (!audioContext) return;
        ensureAudioContext();

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = 'sine';
        osc.frequency.value = isDownbeat ? 1000 : 800;

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        osc.start(time);
        osc.stop(time + 0.05);
    }

    return {
        init,
        playSound,
        playByKey,
        playClick,
        playKick,
        playSnare,
        playHihat,
        playOther
    };
})();
