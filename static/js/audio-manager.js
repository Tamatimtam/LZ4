/**
 * Audio Manager for LZ4 Compression Visualizer
 * Handles sound effects to create a satisfying, award-winning experience
 */
class AudioManager {
    constructor() {
        this.enabled = true;
        this.soundsLoaded = false;
        this.sounds = {};

        // Try to load sound setting from localStorage
        const savedSoundSetting = localStorage.getItem('sound-enabled');
        if (savedSoundSetting !== null) {
            this.enabled = savedSoundSetting === 'true';

            // Update the checkbox to match saved preference
            const soundToggle = document.getElementById('sound-toggle');
            if (soundToggle) {
                soundToggle.checked = this.enabled;
            }
        }

        this.initSounds();
        this.setupEventListeners();
    }

    initSounds() {
        // Create base64-encoded sounds
        const soundData = {
            // UI sounds
            click: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGDgCtra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2tra2t//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYlAAAAAAAABg6zoGNmAAAAAAD/+9DEAAAIwAF99AAAIgQAL78wAABEQEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
            uiAction: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFIwC1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQhAAAAAAAABSNd6xfXAAAAAAD/+9DEAAAAvwBvAAABpBXgDeAAAASBn8l7kHn5k3OLCAgQxCIcWQs',

            // Process sounds
            step: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFIwC1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQAAAAAAAAAAAALCwsLCwsLCwsLCwsLCws=',
            match: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAADAAAJSwBtbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW3V1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dX///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJARCAAAAAAAACUvGuLHsAAAAAAD/+9DEAAAFzAdu9BEAJS8C798wkAGEEH6LVz5S8+vKbP42y4tFwxFG8mH8Og',
            literal: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGAgCZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAMAAAAAAAAAAgCR+83qAAAA',

            // Success sounds
            success: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAEAAAJRQDMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM////////////////////////////////////////////////////////////////////////////////////////////////////////AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJARDAAAAAAAACUUDEtCZAAAAAAD/+9DEAAAJqCNrdBAAA6MDrS/BgBGEUz5QIFQmKxOTNVUfvlky4vR0f4/5c3or9HLO+jtOzVF7Z4+XJ0en//KnZ2an/y7p2dIduzTtumbVW1h2kqjMsmeljIeba9dLRe2nUuhI',
            goodMatch: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAJRgCZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAP9AAAAAAAA',
            reset: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGAgCZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAMAAAAAAAAAAgCR+83qAAAAA'
        };

        // Load all the sounds
        for (const [name, dataUrl] of Object.entries(soundData)) {
            this.sounds[name] = new Audio(dataUrl);

            // Set volume for different sound types
            if (['click', 'uiAction'].includes(name)) {
                this.sounds[name].volume = 0.3; // UI sounds are quieter
            } else if (['success', 'goodMatch'].includes(name)) {
                this.sounds[name].volume = 0.5; // Success sounds are medium
            } else {
                this.sounds[name].volume = 0.4; // Process sounds are normal
            }
        }

        this.soundsLoaded = true;
    }

    setupEventListeners() {
        // Set up sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                this.enabled = e.target.checked;
                // Save to localStorage
                localStorage.setItem('sound-enabled', this.enabled);

                // Play a sound if enabled
                if (this.enabled) {
                    this.play('click');
                }
            });
        }

        // Add click sounds to buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                this.play('click');
            });
        });
    }

    play(soundName) {
        if (!this.enabled || !this.soundsLoaded || !this.sounds[soundName]) {
            return;
        }

        // Stop and reset the sound before playing again
        const sound = this.sounds[soundName];
        sound.pause();
        sound.currentTime = 0;

        // Play with a promise to catch any errors
        const playPromise = sound.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Audio playback error:', error);
            });
        }
    }

    // Helper methods for common sounds
    playStep() {
        this.play('step');
    }

    playMatch(matchLength) {
        // Play different sounds based on match length
        if (matchLength > 8) {
            this.play('goodMatch');
        } else {
            this.play('match');
        }
    }

    playLiteral() {
        this.play('literal');
    }

    playSuccess(compressionRatio) {
        // Play success sound with different variants based on compression
        if (compressionRatio > 2.0) {
            // Really good compression!
            this.play('success');
        } else {
            // Normal success
            this.play('uiAction');
        }
    }

    playReset() {
        this.play('reset');
    }
}

// Initialize the audio manager as a global object
window.audioManager = new AudioManager();
