Manual Key Decoder
==================

A web app that assists in decoding the cut depths of keys.

Try it out: https://farlepet.github.io/manualkeydecoder/

Currently supported keys:
 * Schlage
   * SC
 * Chicago
   * 1454
 * Best
   * A, D, F
   * _NOTE_: For these keys, the tip is considered the flat part behind the very tip
 * Best/Arrow/Falcon A2 and A3 bitting
 * Master Lock
   * 130K / 1B019

To add more keys, edit `src/dsd.json` If you have a key specification you would
like for me to add, just contact me, or edit dsd.json and send me a pull request.

Build and run
=============

Build requirements:
 * `sassc`
 * `make`
 * `tsc`: Typescript

Building:
 1. Run `tsc` to build typescript
 2. Run `make scss-compile` to build stylesheets
 3. Run `make copy-web` to copy static content

To run, just point a web browser to `./dist/index.html`