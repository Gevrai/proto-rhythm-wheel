/**
 * Synth module - Web Audio drum synthesis
 * Creates kick, snare, hi-hat, and other sounds without audio files
 */

const Synth = (function() {
    let audioContext = null;

    function init(ctx) {
        audioContext = ctx;
    }

    function playKick(time) {
        if (!audioContext) return;

        // Create oscillator for the kick body
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Kick drum: sine wave with fast pitch drop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

        // Envelope
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

        osc.start(time);
        osc.stop(time + 0.3);
    }

    function playSnare(time) {
        if (!audioContext) return;

        // Noise component (snare wires)
        const noiseBuffer = createNoiseBuffer(0.2);
        const noise = audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

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
        if (!audioContext) return;

        // Hi-hat is filtered noise
        const noiseBuffer = createNoiseBuffer(0.1);
        const noise = audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        // Bandpass filter for metallic sound
        const bandpass = audioContext.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 10000;
        bandpass.Q.value = 1;

        // Highpass for extra brightness
        const highpass = audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 7000;

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

        noise.connect(bandpass);
        bandpass.connect(highpass);
        highpass.connect(gain);
        gain.connect(audioContext.destination);

        noise.start(time);
        noise.stop(time + 0.1);
    }

    function playOther(time) {
        if (!audioContext) return;

        // "Other" - a synthetic cowbell-like sound
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc1.type = 'square';
        osc2.type = 'square';
        osc1.frequency.value = 800;
        osc2.frequency.value = 540;

        const bandpass = audioContext.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 800;
        bandpass.Q.value = 3;

        osc1.connect(bandpass);
        osc2.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(audioContext.destination);

        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.15);
        osc2.stop(time + 0.15);
    }

    function createNoiseBuffer(duration) {
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
        time = time || (audioContext ? audioContext.currentTime : 0);

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
        const keyMap = {
            'q': 'kick',
            'w': 'snare',
            'e': 'hihat',
            'r': 'other'
        };

        const instrument = keyMap[key.toLowerCase()];
        if (instrument) {
            playSound(instrument, time);
        }
    }

    // Play a click/metronome sound for countdown
    function playClick(time, isDownbeat = false) {
        if (!audioContext) return;

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
