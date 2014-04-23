function Notifications(){
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
}

Notifications.prototype.audioContext = {};
Notifications.prototype.toneEnum = {"sine": 0, "square": 1, "sawtooth": 2, "triangle": 3};
Notifications.prototype.freqEnum = {"low": 1000, "medium": 2000, "high": 3000};
Notifications.prototype.waveType = Notifications.prototype.toneEnum.square;
Notifications.prototype.vibrating = false;
Notifications.prototype.makingSound = false;

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
    oscillator.start = oscillator.noteOn || oscillator.start;
    oscillator.stop = oscillator.noteOff || oscillator.stop;
    oscillator.type = 0;
    oscillator.frequency.value = 100;
    oscillator.gain = 0;
    oscillator.connect(this.audioContext.destination);

    oscillator.start(0);

    setTimeout(function(){
        oscillator.stop(0);
    }, 10);

    return this;
};

/**
 * Play a single note
 * @param frequency in hertz. Can be a single frequency, or can be an array of frequencies.
 * @param totalLengthMilliseconds The total length of the entire series of tones.
 * 
 * If you give an array of frequencies, it will play each in succession.
 */
Notifications.prototype.beep = function(frequency, totalLengthMilliseconds){
    var parent = this;
    if(typeof this.audioContext !== 'null'){
        if(!(frequency instanceof Array)){
            frequency = [frequency];
        }
        
        console.log(frequency);

        var startTime = this.audioContext.currentTime;
        var totalLengthSeconds = totalLengthMilliseconds / 1000;
        var lengthOfEachBeepSeconds = totalLengthSeconds / frequency.length;
        var oscillator = this.audioContext.createOscillator();
        oscillator.start = oscillator.noteOn || oscillator.start;
        oscillator.stop = oscillator.noteOff || oscillator.stop;
        oscillator.type = this.waveType;
        oscillator.frequency.value = frequency[0];
        
        for(var x = 1; x < frequency.length; x++){
            console.log('change to ' + frequency[x] + ' freq in ' + lengthOfEachBeepSeconds * x + ' seconds');
            oscillator.frequency.setValueAtTime(frequency[x], startTime + (lengthOfEachBeepSeconds * x))
        }
        
        
        oscillator.connect(this.audioContext.destination);
        this.makingSound = true;
        oscillator.start(startTime);
        oscillator.stop(startTime + totalLengthSeconds);

        setTimeout(function(){
            parent.makingSound = false;
        }, totalLengthMilliseconds);
    }
    
    return this;
};

/**
 * Vibrates the device for the given length
 * Silently fails if not supported
 *
 * @param length in milliseconds
 */
Notifications.prototype.vibrate = function(length){
    var parent = this;
    if(typeof navigator.vibrate !== 'undefined'){
        this.vibrating = true;
        navigator.vibrate(length);
        setTimeout(function(){
            parent.vibrating = false;
        }, length);
    }

    return this;
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

    return this;
};

Notifications.prototype.whenDone = function(functionToRunAfterDone){
    var parent = this;

    var interval = setInterval(function(){
        if(!parent.vibrating && !parent.makingSound){
            functionToRunAfterDone();
            clearInterval(interval);
        }
    }, 100);
};
