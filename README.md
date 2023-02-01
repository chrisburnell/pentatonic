# Pentatonic

> Turn any array of integers into a fun little melody

## What?

**Pentatonic** is a small JavaScript file that will play music generated from an array of integers from anywhere in your DOM.

## Why?

Why not?

No, but really though, there’s no serious reason for this. It’s just fun.

## Installation

-   **With npm:** `npm install @chrisburnell/pentatonic`
-   **Direct download:** [https://github.com/chrisburnell/pentatonic/archive/master.zip](https://github.com/chrisburnell/pentatonic/archive/master.zip)

## Usage

_pentatonic.js_ gives you a function, `pentatonic()` to use, like so:

```js
for (let target of document.querySelectorAll(".pentatonic")) {
    target.addEventListener("click", () => {
        pentatonic(target.dataset.values.split(","))
    })
}
```

The function takes six parameters:

0. `notes` — an array of positive integers _(required)_
1. `duration` — the length of time to play the audio for, represented in milliseconds _(default = 4000)_
2. `volume` — controls the _gain_ of the audio, represented by a 0–1 range _(default = 0.5)_
3. `keyStart` — the zero-index of the key on a standard keyboard from which the scale should start _(default = 29 / C♯3 / D♭3)_
4. `keyIntervals` — an array of integers which represent half-steps in a loop which composes the desired scale _(default = [2, 3, 2, 2, 3] / a pentatonic scale)_
5. `keyLimit` — represents the highest index in the desired scale by which input is bound by _(default = 12)_

## Contributing

Contributions of all kinds are welcome! Please [submit an Issue on GitHub](https://github.com/chrisburnell/pentatonic/issues) or [get in touch with me](https://chrisburnell.com/about/#contact) if you’d like to do so.

## License

This project is licensed under a CC0 license.
