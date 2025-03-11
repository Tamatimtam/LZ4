class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.isEnabled = true;
        this.isInitialized = false;

        // Queue for actions that happen before initialization
        this.pendingActions = [];

        // Attach user interaction handlers to init audio
        this.attachInitHandlers();
    }

    attachInitHandlers() {
        // List of common user interaction events
        const events = ['click', 'touchstart', 'keydown'];

        const initOnFirstInteraction = () => {
            if (!this.isInitialized) {
                this.init();
                // Process any pending actions
                this.pendingActions.forEach(action => action());
                this.pendingActions = [];
            }

            // Remove event listeners once initialized
            events.forEach(event => {
                document.removeEventListener(event, initOnFirstInteraction);
            });
        };

        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, initOnFirstInteraction);
        });
    }

    init() {
        try {
            // Initialize Web Audio API
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();

            // Create master volume
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.context.destination);

            this.isInitialized = true;
            console.log("AudioManager initialized with Web Audio API");
        } catch (e) {
            console.warn("Web Audio API not supported:", e);
            this.isInitialized = false;
        }
    }

    play(soundName, volume = 1.0) {
        if (!this.isEnabled) return;

        if (!this.isInitialized) {
            // Queue this action for when audio is initialized
            this.pendingActions.push(() => this.play(soundName, volume));
            return;
        }

        try {
            this.generateSound(soundName, volume);
        } catch (e) {
            console.warn(`Error playing sound ${soundName}:`, e);
        }
    }

    generateSound(soundName, volume = 1.0) {
        if (!this.context) return;

        try {
            const now = this.context.currentTime;
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            let duration = 0.1;

            // Configure sound based on type
            switch(soundName) {
                case 'click':
                    oscillator.type = 'square';
                    oscillator.frequency.value = 800;
                    duration = 0.05;
                    break;
                case 'uiAction':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 500;
                    duration = 0.1;
                    break;
                case 'reset':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.value = 300;
                    duration = 0.2;
                    break;
                case 'step':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 500;
                    duration = 0.08;  // Slightly longer
                    volume = 2;     // Increased volume
                    break;
                case 'match':
                    oscillator.type = 'triangle';
                    oscillator.frequency.value = 900;
                    duration = 0.15;
                    break;
                case 'literal':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 700;
                    duration = 0.05;
                    volume = 0.3;     // Increased volume
                    break;
                case 'success':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 1200;
                    duration = 0.4;
                    break;
                default:
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 440;
                    duration = 0.1;
            }

            // Envelope to avoid clicks
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.start(now);
            oscillator.stop(now + duration);

            return oscillator;
        } catch (e) {
            console.error(`Failed to generate sound for ${soundName}:`, e);
        }
    }

    playSuccess(ratio) {
        if (!this.isEnabled || !this.isInitialized) {
            if (!this.isInitialized) this.pendingActions.push(() => this.playSuccess(ratio));
            return;
        }

        try {
            // Generate a success sound with multiple notes based on compression ratio
            const now = this.context.currentTime;

            // Create oscillators for a simple chord
            for (let i = 0; i < 3; i++) {
                const oscillator = this.context.createOscillator();
                const gainNode = this.context.createGain();

                // Use ratio to affect the sound (higher ratio = higher pitch)
                const baseFreq = 440 + (ratio * 100);

                // Create a major chord
                if (i === 0) oscillator.frequency.value = baseFreq;
                if (i === 1) oscillator.frequency.value = baseFreq * 1.25; // major third
                if (i === 2) oscillator.frequency.value = baseFreq * 1.5;  // perfect fifth

                oscillator.type = 'sine';

                // Envelope
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.25, now + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

                oscillator.connect(gainNode);
                gainNode.connect(this.masterGain);

                oscillator.start(now);
                oscillator.stop(now + 0.5);
            }
        } catch (e) {
            console.warn("Error playing success sound:", e);
        }
    }

    playMatch(matchLength) {
        if (!this.isEnabled || !this.isInitialized) {
            if (!this.isInitialized) this.pendingActions.push(() => this.playMatch(matchLength));
            return;
        }

        try {
            // Simple ascending sound based on match length
            const now = this.context.currentTime;
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            // Higher pitch for longer matches
            const pitch = Math.min(2000, Math.max(300, 300 + matchLength * 50));

            osc.frequency.setValueAtTime(pitch - 100, now);
            osc.frequency.linearRampToValueAtTime(pitch, now + 0.1);
            osc.type = 'triangle';

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.02); // Louder
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {
            console.warn("Error playing match sound:", e);
        }
    }

    playLiteral() {
        if (!this.isEnabled || !this.isInitialized) {
            if (!this.isInitialized) this.pendingActions.push(() => this.playLiteral());
            return;
        }

        try {
            const now = this.context.currentTime;
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.frequency.value = 600;
            osc.type = 'sine';

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.01); // Louder
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {
            console.warn("Error playing literal sound:", e);
        }
    }

    playStep() {
        if (!this.isEnabled || !this.isInitialized) {
            if (!this.isInitialized) this.pendingActions.push(() => this.playStep());
            return;
        }

        try {
            const now = this.context.currentTime;
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            // Use square wave for a more distinct sound
            osc.type = 'square';
            osc.frequency.value = 450; // Slightly higher frequency

            // Maximum gain is 1.0, but we can create a louder effect by:
            // 1. Setting gain to maximum (1.0)
            // 2. Setting master gain higher in the constructor if needed
            // 3. Using a compressor to make the sound "fuller"

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(1.0, now + 0.01); // Maximum gain
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12); // Longer duration

            // Create a compressor for louder perceived volume without distortion
            const compressor = this.context.createDynamicsCompressor();
            compressor.threshold.value = -24;
            compressor.knee.value = 30;
            compressor.ratio.value = 12;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.25;

            osc.connect(gain);
            gain.connect(compressor);
            compressor.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.12); // Slightly longer
        } catch (e) {
            console.warn("Error playing step sound:", e);
        }
    }

    playReset() {
        if (!this.isEnabled || !this.isInitialized) {
            if (!this.isInitialized) this.pendingActions.push(() => this.playReset());
            return;
        }

        try {
            const now = this.context.currentTime;
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.02); // Louder
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.3);
        } catch (e) {
            console.warn("Error playing reset sound:", e);
        }
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        return this.isEnabled;
    }
}

// Initialize audio manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create the audio manager but don't initialize until user interaction
    window.audioManager = new AudioManager();

    // Connect sound toggle in UI to audio manager
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('change', function() {
            if (window.audioManager) {
                window.audioManager.isEnabled = this.checked;
            }
        });
    }

    // Create a mute button in the UI
    const controlPanel = document.querySelector('.control-panel') || document.body;
    const muteButton = document.createElement('button');
    muteButton.innerHTML = '🔊';
    muteButton.className = 'mute-button';
    muteButton.onclick = () => {
        if (window.audioManager) {
            const isEnabled = window.audioManager.toggle();
            muteButton.innerHTML = isEnabled ? '🔊' : '🔇';

            // Also update the checkbox if it exists
            if (soundToggle) {
                soundToggle.checked = isEnabled;
            }
        }
    };
    controlPanel.appendChild(muteButton);
});
