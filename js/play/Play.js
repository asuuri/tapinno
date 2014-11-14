define([
    'dojo/on',
    'dojo/has'
], function(on, has){
    var context, oscillator;
    return {
        init: function() {
            try {
                window.AudioContext = window.AudioContext||window.webkitAudioContext;
                context = new AudioContext();
            }
                catch(e) {
                alert('Web Audio API is not supported in this browser');
            }

            var that = this;
            var eventName = 'mousedown';

            if (has('touch')) {
                eventName = 'touchstart';
            }

            on(window, eventName, function() {
                that.play(493.88);
            });
        },

        ADSREnvelope: function(param, startTime, minValue, maxValue, attack, decay, sustainValue, sustain, release) {
            // http://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope
            param.setValueAtTime(0, startTime);

            var attackTime = startTime;
            if (attack > 0) {
                attackTime = startTime + 1/attack;
            }
            param.linearRampToValueAtTime(maxValue, attackTime);
            // Decay
            var decayTime = attackTime + 1/decay;
            sustainValue = sustainValue || minValue;
            param.linearRampToValueAtTime(sustainValue, decayTime);
            if (sustainValue > 0 && sustain > 0 && release > 0) {
                // Sustain
                // Don't do anything except calculate the sustain time.
                var sustainTime = decayTime + 1/sustain;
                // Release
                var releaseTime = sustainTime + 1/release;
                param.linearRampToValueAtTime(minValue, releaseTime);
                return releaseTime;
            }

            return decayTime;
        },

        play: function(note) {
            var oscillator = context.createOscillator();
            var gainNode = context.createGain();
            oscillator.type = 0;
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            oscillator.frequency.value = note;

            var endTime = this.ADSREnvelope(gainNode.gain, context.currentTime, 0, 1, 1000, 1000, 0.6, 3, 10);

            oscillator.start(context.currentTime);
            oscillator.stop(endTime);

            return oscillator;
        }
    };
});