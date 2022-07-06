const AudioContext = window.AudioContext || window.webkitAudioContext
const audioElement = document.querySelector('audio')
const volumeControl = document.querySelector('#volume')
const event_input = new Event('input')
var track, gainNode, audioContext

function setupAudio(){
    audioContext = new AudioContext()
    track = audioContext.createMediaElementSource(audioElement)
    track.connect(audioContext.destination)

    gainNode = audioContext.createGain()
    track.connect(gainNode).connect(audioContext.destination)
    volumeControl.addEventListener('input', function() {
        updateVolume(this.value)
    }, false)
    
    volumeControl.dispatchEvent(event_input)

    LoadingSound()
}

function updateVolume(value){
    volumeControl.value = value
    canvasInfo.volume = value
    value = 1 / Math.pow(1.5,20 - value)
    setVolume(value)
}

function muteMusic(){
    volumeControl.value = 0
}

var fx = {}
function LoadingSound(){
    fx.punch = loadSound('assets/fx/short_punch.wav');
}

const playButton = document.querySelector('button')
if(playButton)
playButton.addEventListener('click', function() {
    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume()
    }
    // play or pause track depending on state
    if (this.dataset.playing === 'false') {
        audioElement.play()
        this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
        audioElement.pause()
        this.dataset.playing = 'false'
    }
}, false)