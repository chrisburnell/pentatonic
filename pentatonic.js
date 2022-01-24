const getFrequencyFromKeys = (key = 49) => {
    return 2 ** ((key - 49) / 12) * 440
}

let rangeMap = (number, oldMinimum, oldMaximum, newMinimum, newMaximum) => {
    return ((number - oldMinimum) / (oldMaximum - oldMinimum)) * (newMaximum - newMinimum) + newMinimum
}

let isPlaying = false

const pentatonic = (notes, duration = 4000, volume = 0.5, keyStart = 29, keyIntervals = [2, 2, 3, 2, 3], keyLimit = 12, waveform = { real: [0, 1], imag: [0, 0] }) => {
    if ((!window.AudioContext && !window.webkitAudioContext) || !notes || isPlaying) {
        return
    }
    // Calculate the highest note to enforce the key limit
    let highestNote = notes.reduce((highest, current) => Math.max(highest, current))
    // Calculate if the highest value extends beyond the key limit
    if (highestNote > keyLimit) {
        // Range Map to the rescue
        notes = notes.reduce((array, count) => {
            return [...array, Math.round(rangeMap(count, 0, highestNote, 0, keyLimit))]
        }, [])
    }
    let frequencies = [getFrequencyFromKeys(keyStart)]
    let keyInterval = 0
    for (let count = 0; count < keyLimit; count++) {
        keyInterval = keyInterval + keyIntervals[count % keyIntervals.length]
        frequencies.push(getFrequencyFromKeys(keyStart + keyInterval))
    }
    let output = new (window.AudioContext || window.webkitAudioContext)()
    let instrument = output.createOscillator()
    let amplifier = output.createGain()
    let noteLength = Math.floor(duration / notes.length)
    let note = 0
    let playNotes = () => {
        try {
            if (note < notes.length) {
                instrument.frequency.value = frequencies[notes[note]]
                note = note + 1
            } else {
                amplifier.gain.value = 0
            }
            window.setTimeout(playNotes, noteLength)
        } catch {
            amplifier.gain.value = 0
            isPlaying = false
        }
    }
    let real = new Float32Array(waveform.real)
    let imag = new Float32Array(waveform.imag)
    let periodicWave = output.createPeriodicWave(real, imag)
    instrument.setPeriodicWave(periodicWave)
    instrument.start()
    instrument.connect(amplifier)
    // Set the volume to the correct value
    amplifier.gain.value = volume
    amplifier.connect(output.destination)
    // Start playing notes!
    playNotes()
    // And prevent the user from blowing their ears up by stacking sounds
    isPlaying = true
    window.setTimeout(() => {
        isPlaying = false
    }, duration)
}

export default pentatonic
