/**
 * Turn any array of integers into a fun little melody.
 */
class Pentatonic {
	static #FADE_MS = 20;

	#context = null;
	#isPlaying = false;

	/**
	 * Lazily creates the shared AudioContext on first access, and resumes
	 * it if the browser has auto-suspended it.
	 * @type {AudioContext|null}
	 * @readonly
	 */
	get context() {
		if (!window.AudioContext && !window.webkitAudioContext) {
			return null;
		}
		if (!this.#context) {
			this.#context = new (
				window.AudioContext || window.webkitAudioContext
			)();
		}
		if (this.#context.state === "suspended") {
			this.#context.resume();
		}
		return this.#context;
	}

	/**
	 * @param {number} [key=49]
	 * @returns {number}
	 * @private
	 */
	#getFrequencyFromKeys(key = 49) {
		return 2 ** ((key - 49) / 12) * 440;
	}

	/**
	 * @param {number} number
	 * @param {number} oldMinimum
	 * @param {number} oldMaximum
	 * @param {number} newMinimum
	 * @param {number} newMaximum
	 * @returns {number}
	 * @private
	 */
	#rangeMap(number, oldMinimum, oldMaximum, newMinimum, newMaximum) {
		return (
			((number - oldMinimum) / (oldMaximum - oldMinimum)) *
				(newMaximum - newMinimum) +
			newMinimum
		);
	}

	/**
	 * Ramps a gain node up from silence, to avoid the click caused by
	 * jumping straight to an audible amplitude.
	 * @param {GainNode} amplifier
	 * @param {number} targetVolume
	 * @param {AudioContext} context
	 * @returns {void}
	 * @private
	 */
	#fadeIn(amplifier, targetVolume, context) {
		const now = context.currentTime;
		amplifier.gain.setValueAtTime(0, now);
		amplifier.gain.linearRampToValueAtTime(
			targetVolume,
			now + Pentatonic.#FADE_MS / 1000,
		);
	}

	/**
	 * Ramps an oscillator's gain node down to silence before stopping and
	 * disconnecting both, to avoid the click caused by stopping an
	 * oscillator instantaneously.
	 * @param {OscillatorNode} instrument
	 * @param {GainNode} amplifier
	 * @param {AudioContext} context
	 * @returns {void}
	 * @private
	 */
	#fadeOutAndStop(instrument, amplifier, context) {
		const now = context.currentTime;
		const stopAt = now + Pentatonic.#FADE_MS / 1000;
		amplifier.gain.cancelScheduledValues(now);
		amplifier.gain.setValueAtTime(amplifier.gain.value, now);
		amplifier.gain.linearRampToValueAtTime(0, stopAt);
		instrument.stop(stopAt);
		window.setTimeout(
			() => {
				instrument.disconnect();
				amplifier.disconnect();
			},
			Pentatonic.#FADE_MS * 2,
		);
	}

	/**
	 * @param {number[]} notes
	 * @param {number} [duration=4000]
	 * @param {number} [volume=0.5]
	 * @param {number} [keyStart=29]
	 * @param {number[]} [keyIntervals=[2, 2, 3, 2, 3]]
	 * @param {number} [keyLimit=12]
	 * @param {{real: number[], imag: number[]}} [waveform]
	 * @param {boolean} [slide=false]
	 * @returns {void}
	 */
	play(
		notes,
		duration = 4000,
		volume = 0.5,
		keyStart = 29,
		keyIntervals = [2, 2, 3, 2, 3],
		keyLimit = 12,
		waveform = { real: [0, 1], imag: [0, 0] },
		slide = false,
	) {
		if (!notes || this.#isPlaying) {
			return;
		}
		const context = this.context;
		if (!context) {
			return;
		}
		// Calculate the highest note to enforce the key limit
		let highestNote = notes.reduce((highest, current) =>
			Math.max(highest, current),
		);
		// Calculate if the highest value extends beyond the key limit
		if (highestNote > keyLimit) {
			// Range Map to the rescue
			notes = notes.reduce((array, count) => {
				return [
					...array,
					Math.round(
						this.#rangeMap(count, 0, highestNote, 0, keyLimit),
					),
				];
			}, []);
		}
		let frequencies = [this.#getFrequencyFromKeys(keyStart)];
		let keyInterval = 0;
		for (let count = 0; count < keyLimit; count++) {
			keyInterval = keyInterval + keyIntervals[count % keyIntervals.length];
			frequencies.push(this.#getFrequencyFromKeys(keyStart + keyInterval));
		}

		let instrument = context.createOscillator();
		let amplifier = context.createGain();
		let real = new Float32Array(waveform.real);
		let imag = new Float32Array(waveform.imag);
		let periodicWave = context.createPeriodicWave(real, imag);
		instrument.setPeriodicWave(periodicWave);
		instrument.connect(amplifier);
		amplifier.connect(context.destination);

		// With `slide`, glide continuously from note to note; the final
		// note has nothing to slide toward, so it just rings out for its
		// slot either way
		const startTime = context.currentTime;
		const noteSeconds = duration / 1000 / notes.length;
		const noteFrequencies = notes.map((note) => frequencies[note]);
		instrument.frequency.setValueAtTime(noteFrequencies[0], startTime);
		noteFrequencies.slice(1).forEach((frequency, index) => {
			const time = startTime + (index + 1) * noteSeconds;
			if (slide) {
				instrument.frequency.linearRampToValueAtTime(frequency, time);
			} else {
				instrument.frequency.setValueAtTime(frequency, time);
			}
		});

		instrument.start(startTime);
		this.#fadeIn(amplifier, volume, context);
		window.setTimeout(() => {
			this.#fadeOutAndStop(instrument, amplifier, context);
			this.#isPlaying = false;
		}, duration);
		// And prevent the user from blowing their ears up by stacking sounds
		this.#isPlaying = true;
	}
}

export default Pentatonic;
