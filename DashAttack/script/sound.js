class configMusic{
    fx = {}
    music = {}
    LoadedSound = 0
    actualSound = null

    startMusic(){
        if(this.actualSound != null) this.actualSound.stop()
        let tab = Object.keys(this.music)
        this.actualSound = this.music[random(tab)]
        this.actualSound.play()
    }
    
    musicIsFinish(){
        return this.actualSound == null || !this.actualSound.isPlaying()
    }
    
    stopMusic(){
        this.actualSound.fade(0,4)
    }
    
    setupAudio(){
        this.LoadingSound()
    }
    
    updateVolume(value){
        canvasInfo.volume = value
        this.setVolume()
    }
    
    muteMusic(){
        this.setVolume(0)
    }
    
    showMusic(){
        pop()
        let textColor = color(0, 0, 0);
        fill(textColor)
        text(this.actualSound.file.replace("assets/music/",''),5,13)
        push()
    }
    
    setVolume(){
        var self = this
        let value = 1 / Math.pow(1.5,20 - canvasInfo.volume)
        Object.keys(self.fx).every(function(item){
            self.fx[item].setVolume(value)
            return true
        })
        Object.keys(self.music).every(function(item){
            self.music[item].setVolume(value)
            return true
        })
    }
    
    percentLoadedSound(){
        return this.LoadedSound > 1 ? this.LoadedSound / (Object.keys(this.fx).length + Object.keys(this.music).length) : 0
    }
    
    LoadingSound(){
        var self = this
        function loaded(){
            self.LoadedSound++
            if(self.LoadedSound == Object.keys(self.fx).length + Object.keys(self.music).length){
                self.setVolume()
            }
        }
        this.fx.punch = loadSound('assets/fx/short_punch.wav',loaded)
        this.music.flames = loadSound('assets/music/Sound Stabs - ONE - 01 Flames.mp3',loaded)
        this.music.freedom = loadSound('assets/music/Sound Stabs - ONE - 02 Freedom.mp3',loaded)
        this.music.chainsaw = loadSound('assets/music/Sound Stabs - ONE - 03 Chainsaw.mp3',loaded)
        this.music.zombies = loadSound('assets/music/Sound Stabs - ONE - 04 The Attack of The Hipster Zombies.mp3',loaded)
        this.music.theCannery = loadSound('assets/music/The Cannery.mp3',loaded)
    }

    draw(){
        if(this.musicIsFinish()){
            this.startMusic()
        }else{
            this.showMusic()
        }
    }

    fireFx(id){
        this.fx[id].play()
    }
}
var music = new configMusic()