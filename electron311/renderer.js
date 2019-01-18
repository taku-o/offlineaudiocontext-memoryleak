// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var fs = require('fs');

function toArrayBuffer(buf) {
    var _aBuffer = new ArrayBuffer(buf.length);
    var view = new Uint8Array(_aBuffer);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return _aBuffer;
}

var btn = document.getElementById('play');
btn.addEventListener('click', function(elm, ev) {
    console.log('click play');

    // read
    fs.readFile('./voice.wav', function(err, bufWav) {
        if (err) {
            console.log('failed to read wav. path %s', './voice.wav');
            return false;
        }
        console.log('read wav');

        // decode audio
        var audioCtx = new window.AudioContext();
        var aBuffer = toArrayBuffer(bufWav);
        audioCtx.decodeAudioData(aBuffer).then(function(decodedData) {
            console.log('decode wav');

            // process audio
            var offlineCtx = new OfflineAudioContext(decodedData.numberOfChannels, decodedData.length, decodedData.sampleRate);

            var inSourceNode = offlineCtx.createBufferSource();
            inSourceNode.buffer = decodedData;

            var gainNode = offlineCtx.createGain();
            gainNode.gain.value = 0.4;
            inSourceNode.connect(gainNode);
            gainNode.connect(offlineCtx.destination);

            inSourceNode.start(0);

            // offlineCtx rendering
            offlineCtx.startRendering().then(function(renderedBuffer) {
                console.log('process wav');

                // play
                var audioNode = audioCtx.createBufferSource();
                audioNode.buffer = renderedBuffer;
                audioNode.connect(audioCtx.destination);
                audioNode.onended = function(evEnd) {
                  console.log('play processed wav ended');

                  inSourceNode.disconnect();
                  gainNode.disconnect();
                  audioNode.disconnect();
                  audioCtx.close();
                  global.gc();
                  console.log('close audio node');
                };
                audioNode.start(0);
                console.log('play processed wav');
            });
        });
    });

}, false);

