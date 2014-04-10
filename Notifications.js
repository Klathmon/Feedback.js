function Notifications(){
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
}

Notifications.prototype.audioContext = {};
Notifications.prototype.toneEnum = {"sine": 0, "square": 1, "sawtooth": 2, "triangle": 3};
Notifications.prototype.freqEnum = {"low": 1000, "medium": 2000, "high": 3000};
Notifications.prototype.waveType = Notifications.prototype.toneEnum.square;

/**
 * This function initializes the web audio API
 *
 * This MUST be called on user interaction! (onclick, etc...)
 */
Notifications.prototype.init = function(){
    if(typeof AudioContext !== 'undefined'){
        this.audioContext = new AudioContext();
    }else{
        this.audioContext = null;
    }

    var oscillator = this.audioContext.createOscillator();
    oscillator.type = 0;
    oscillator.frequency.value = 100;
    oscillator.gain = 0;
    oscillator.connect(this.audioContext.destination);

    oscillator.start = oscillator.noteOn || oscillator.start;
    oscillator.start(0);

    setTimeout(function(){
        oscillator.stop = oscillator.noteOff || oscillator.stop;
        oscillator.stop(0);
    }, 100);
    
    //TODO: Create a sound here to init the AudioContext on iOS 6
};

/**
 * Play a single note
 * @param frequency in hertz
 * @param length in milliseconds
 */
Notifications.prototype.playTone = function(frequency, length){
    if(typeof this.audioContext !== 'null'){
        var oscillator = this.audioContext.createOscillator();
        oscillator.start = oscillator.noteOn || oscillator.start;
        oscillator.stop = oscillator.noteOff || oscillator.stop;
        oscillator.type = this.waveType;
        oscillator.frequency.value = frequency;
        oscillator.connect(this.audioContext.destination);
        oscillator.start(0);
    
        setTimeout(function(){
            oscillator.stop(0);
        }, length);
    }
};

/**
 * Vibrates the device for the given length
 * Silently fails if not supported
 * 
 * @param length in milliseconds
 */
Notifications.prototype.vibrate = function(length){
    if(typeof navigator.vibrate !== 'undefined'){
        navigator.vibrate(length);
    }
};

/**
 * Speaks the message given using the Speech Synthesis API
 * Silently fails if not supported
 * 
 * @param message
 */
Notifications.prototype.speak = function(message){
    if(typeof SpeechSynthesisUtterance !== 'undefined' && typeof speechSynthesis !== 'undefined'){
        var utterance = new SpeechSynthesisUtterance(message);
        
        speechSynthesis.speak(utterance)
    }
};
