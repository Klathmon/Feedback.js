function Feedback(){
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
}

Feedback.prototype.audioContext = {};
Feedback.prototype.toneEnum = {"sine": 0, "square": 1, "sawtooth": 2, "triangle": 3};
Feedback.prototype.freqEnum = {"low": 1000, "medium": 2000, "high": 3000};
Feedback.prototype.waveType = Feedback.prototype.toneEnum.square;
Feedback.prototype.volume = 100;
Feedback.prototype.makingSound = false;
Feedback.prototype.vibrating = false;
Feedback.prototype.speaking = false;


/**
 * This function initializes the web audio API
 *
 * This MUST be called on user interaction! (onclick, etc...)
 */
Feedback.prototype.init = function(){

    this.audioContext = this.createAudioContext();

    var thisObject = this;

    this.volume = 0;
    this.beep(0, 10);
    setTimeout(function(){
        thisObject.volume = 100
    }, 20);

    return this;
};

/**
 * Play a single note
 * @param frequency in hertz. Can be a single frequency, or can be an array of frequencies.
 * @param totalLengthMilliseconds The total length of the entire series of tones.
 * @param vibrate bool, if true it vibrates with each tone, if false or null it doesn't.
 *
 * If you give an array of frequencies, it will play each in succession.
 */
Feedback.prototype.beep = function(frequency, totalLengthMilliseconds, vibrate){

    var thisObject = this;
    if(typeof this.audioContext !== 'null'){
        if(!(frequency instanceof Array)){
            frequency = [frequency];
        }

        var startTime = this.audioContext.currentTime;
        var totalLengthSeconds = totalLengthMilliseconds / 1000;
        var lengthOfEachBeepSeconds = totalLengthSeconds / frequency.length;
        var lengthOfEachBeepMilliseconds = lengthOfEachBeepSeconds * 1000;

        var gainNode = this.createGainNode();

        var oscillatorNode = this.createOscillatorNode();
        oscillatorNode.frequency.value = frequency[0];

        for(var x = 1; x < frequency.length; x++){
            oscillatorNode.frequency.setValueAtTime(frequency[x], startTime + (lengthOfEachBeepSeconds * x));
            if(vibrate){
                setTimeout(function(){
                    thisObject.vibrate(lengthOfEachBeepMilliseconds);
                }, lengthOfEachBeepMilliseconds * x);
            }
        }

        oscillatorNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        this.makingSound = true;

        oscillatorNode.start(startTime);
        oscillatorNode.stop(startTime + totalLengthSeconds);

        setTimeout(function(){
            thisObject.makingSound = false;
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
Feedback.prototype.vibrate = function(length){
    var thisObject = this;
    if(typeof navigator.vibrate !== 'undefined'){
        this.vibrating = true;
        navigator.vibrate(length);
        setTimeout(function(){
            thisObject.vibrating = false;
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
Feedback.prototype.speak = function(message){

    var thisObject = this;
    if(typeof SpeechSynthesisUtterance !== 'undefined' && 'speechSynthesis' in window){

        var voices = window.speechSynthesis.getVoices();

        var utterance = new SpeechSynthesisUtterance();

        utterance.text = message;
        utterance.volume = thisObject.volume;

        this.speaking = true;
        speechSynthesis.speak(utterance);
        
        utterance.onend = function(){
            thisObject.speaking = false;
        };
    }

    return this;
};

/**
 * Will execute the given function once all feedback is done. 
 * 
 * @param functionToRunAfterDone
 */
Feedback.prototype.done = function(functionToRunAfterDone){
    var thisObject = this;

    var interval = setInterval(function(){
        if(!thisObject.vibrating && !thisObject.makingSound && !thisObject.speaking){
            functionToRunAfterDone();
            clearInterval(interval);
        }
    }, 100);
};


Feedback.prototype.createOscillatorNode = function(){
    var oscillatorNode = this.audioContext.createOscillator();

    oscillatorNode.start = oscillatorNode.noteOn || oscillatorNode.start;
    oscillatorNode.stop = oscillatorNode.noteOff || oscillatorNode.stop;

    oscillatorNode.type = this.waveType;

    return oscillatorNode;
};

Feedback.prototype.createGainNode = function(){
    var gainNode = this.audioContext.createGain();

    gainNode.start = gainNode.noteOn || gainNode.start;
    gainNode.stop = gainNode.noteOff || gainNode.stop;
    gainNode.gain.value = this.volume / 100;

    return gainNode;

};

Feedback.prototype.createAudioContext = function(){

    var audioContext;

    if(typeof window.AudioContext !== 'undefined'){
        audioContext = new window.AudioContext();
    }else{
        audioContext = null;
    }

    return audioContext;
};
