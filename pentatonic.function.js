import Pentatonic from "./pentatonic.js";

const pentatonic = new Pentatonic();

/**
 * Turn any array of integers into a fun little melody.
 * @param {number[]} notes
 * @param {number} [duration=4000]
 * @param {number} [volume=0.5]
 * @param {number} [keyStart=29]
 * @param {number[]} [keyIntervals=[2, 2, 3, 2, 3]]
 * @param {number} [keyLimit=12]
 * @param {{real: number[], imag: number[]}} [waveform]
 * @returns {void}
 */
export default (...args) => pentatonic.play(...args);
