/// <reference path="./KeyDecoder.ts"/>

var decoder : KeyDecoder;

$("document").ready(() => {
    decoder = new KeyDecoder();
    console.info("Created KeyDecoder");

    decoder.init();
    console.info("Initialized KeyDecoder");
})