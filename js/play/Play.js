define([
    'dojo/on',
    'dojo/has',
    'dojo/query',
    'dojo/dom-construct'
], function(on, has, query, domConstruct){
    var context;
    return {
        container: null,
        
        init: function(container) {  
            try {
                window.AudioContext = window.AudioContext||window.webkitAudioContext;
                context = new AudioContext();
            }
                catch(e) {
                alert('Web Audio API is not supported in this browser');
            }
            
            this.container = query(container)[0];
            this.renderContent();

            var that = this;
            var eventName = 'mousedown';

            if (has('touch')) {
                eventName = 'touchstart';
            }

            on(window, eventName, function(event) {
                var key = event.target;
                var volume = (event.clientY/key.scrollHeight);
                that.play(key.dataset.note, volume);
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

        play: function(note, volume) {
            if (volume < 0 && volume > 1) {
                throw new Error('Invalid volume value.');
            }
            volume = volume * 1.8;
            var oscillator = context.createOscillator();
            var gainNode = context.createGain();
            oscillator.type = 0;
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            oscillator.frequency.value = note;

            var endTime = this.ADSREnvelope(gainNode.gain, context.currentTime, 0, volume, 1000, 1000, volume * 0.6, 2, 10);

            oscillator.start(context.currentTime);
            oscillator.stop(endTime);

            return oscillator;
        },
        
        renderContent: function() {
            var keyCount = 12;
            var keyboardNode = domConstruct.create(
                'ul', 
                {className: 'keyboard'}, 
                this.container, 
                'only'
            );
            var width = this.container.scrollWidth / keyCount;
            var keyIndex = -9;
            for(var i=0; i < keyCount; i++) {
                var keyNode = domConstruct.create(
                    'li', 
                    {
                        className: 'key',
                        style: 'width: ' + width + 'px;'
                    }, 
                    keyboardNode, 
                    'last'
                );
        
                console.dir(keyNode);
                keyNode.dataset.note = Math.pow(2, (keyIndex/12)) * 440;
                keyIndex++;
            }
        }
    };
});