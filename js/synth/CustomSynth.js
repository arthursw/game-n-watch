import './CustomOscillator.js'

/**
 *  @class  Tone.CustomSynth is composed simply of a Tone.OmniOscillator
 *          routed through a Tone.AmplitudeEnvelope.
 *          <img src="https://docs.google.com/drawings/d/1-1_0YW2Z1J2EPI36P8fNCMcZG7N1w1GZluPs4og4evo/pub?w=1163&h=231">
 *
 *  @constructor
 *  @extends {Tone.Monophonic}
 *  @param {Object} [options] the options available for the synth
 *                          see defaults below
 *  @example
 * var synth = new Tone.CustomSynth().toMaster();
 * synth.triggerAttackRelease("C4", "8n");
 */
Tone.CustomSynth = function(options){

	//get the defaults
	options = Tone.defaultArg(options, Tone.CustomSynth.defaults);
	Tone.Monophonic.call(this, options);

	/**
	 *  The oscillator.
	 *  @type {Tone.OmniOscillator}
	 */
	this.oscillator = new Tone.CustomOscillator(options.oscillator);

	/**
	 *  The frequency control.
	 *  @type {Frequency}
	 *  @signal
	 */
	this.frequency = this.oscillator.frequency;

	/**
	 *  The detune control.
	 *  @type {Cents}
	 *  @signal
	 */
	this.detune = this.oscillator.detune;

	/**
	 *  The amplitude envelope.
	 *  @type {Tone.AmplitudeEnvelope}
	 */
	this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

	//connect the oscillators to the output
	this.oscillator.chain(this.envelope, this.output);
	this._readOnly(["oscillator", "frequency", "detune", "envelope"]);
};

Tone.extend(Tone.CustomSynth, Tone.Monophonic);

/**
 *  @const
 *  @static
 *  @type {Object}
 */
Tone.CustomSynth.defaults = {
	"oscillator" : {
		"type" : "triangle"
	},
	"envelope" : {
		"attack" : 0.005,
		"decay" : 0.1,
		"sustain" : 0.3,
		"release" : 1
	}
};

/**
 *  start the attack portion of the envelope
 *  @param {Time} [time=now] the time the attack should start
 *  @param {number} [velocity=1] the velocity of the note (0-1)
 *  @returns {Tone.CustomSynth} this
 *  @private
 */
Tone.CustomSynth.prototype._triggerEnvelopeAttack = function(time, velocity){
	//the envelopes
	this.envelope.triggerAttack(time, velocity);
	// this.oscillator.frequencyModulator.disconnect(0);
	this.oscillator.start(time);
	//if there is no release portion, stop the oscillator
	if (this.envelope.sustain === 0){
		this.oscillator.stop(time + this.envelope.attack + this.envelope.decay);
	}
	return this;
};

/**
 *  start the release portion of the envelope
 *  @param {Time} [time=now] the time the release should start
 *  @returns {Tone.CustomSynth} this
 *  @private
 */
Tone.CustomSynth.prototype._triggerEnvelopeRelease = function(time){
	time = this.toSeconds(time);
	this.envelope.triggerRelease(time);
	this.oscillator.stop(time + this.envelope.release);
	return this;
};

/**
 *  clean up
 *  @returns {Tone.CustomSynth} this
 */
Tone.CustomSynth.prototype.dispose = function(){
	Tone.Monophonic.prototype.dispose.call(this);
	this._writable(["oscillator", "frequency", "detune", "envelope"]);
	this.oscillator.dispose();
	this.oscillator = null;
	this.envelope.dispose();
	this.envelope = null;
	this.frequency = null;
	this.detune = null;
	return this;
};