class general{
    beforeMenu = true
    atMenu = true
    optionMenu = false
    ready = true
    width = 800
    height = 400
    tileSize = 10
    color = {
        right: function(directionAttack){
            fill(255, 80, 80, (directionAttack?255:150))
        },
        left: function(directionAttack){
            fill(20, 210, 255, (directionAttack?255:150))
        }
    }
    baseAcceleration = 1
    acceleration = 0
    time = 0
    kill = 0
    points = 0
    wave= 0
    pause = true
    lastPattern = -1
    volume = 10
    maxVolume = 20
    buttonOnClick = []
    beforeTransition = null
    transition = true
    timeTransition = 0
    maxTimeTransition = 500
    loading = false
    autoPlay = false
    godMod = false
    popup = null

    constructor(){
        if(this.width > window.innerWidth){
            this.width = window.innerWidth - 10
            this.height = this.width / 2
        }
        if(this.height > window.innerHeight){
            this.height = window.innerHeight - 10
            this.width = this.height * 2
        }
        this.ratio = this.width / 800
        this.tileSize = this.ratio * 10
        this.baseLine = this.height - 55 * this.ratio
        this.paddingEntitiesEnemies = 3 * this.tileSize

        this.popup = new Popup()
    }
    endGame(){
        if(!this.godMod){
            music.stopMusic()
            this.pause = true
            this.showProgress('Your score')
        }
    }
    getTabInfo(info){
        return [
            ['Points', {style:'font-size:2em', html: info.points}],
            ['Kill', {style:'font-size:2em', html: info.kill}],
            ['Wave', {style:'font-size:2em', html: info.wave}],
            ['Time', {style:'font-size:2em', html: getTimer(info.time)}]
        ]
    }
    saveTabInfo(info){
        let string = LZString.compressToBase64(JSON.stringify({
            points: info.points,
            kill: info.kill,
            time: info.time,
            wave: info.wave,
        }))
        localStorage.setItem('bestScoreDashAttack', string);
    }
    bestTabInfo(){
        let info = LZString.decompressFromBase64(localStorage.getItem('bestScoreDashAttack'))
        return info ? JSON.parse(info) : null;
    }
    htmlTableInfo(tab){
        let tr = [[],[]]
        tab.forEach(function(row){
            row.forEach(function(value,index){
                if(value.html == undefined){
                    tr[index]+= "<td width='"+~~(1/tab.length * 100)+"%'>"+value+"</td>"
                }else{
                    tr[index]+= "<td width='"+~~(1/tab.length * 100)+"%' style='"+value.style+"'>"+value.html+"</td>"
                }
            })
        })
        return '<table style="width:100%"><tr>'+tr[0]+'</tr><tr>'+tr[1]+'</tr></table>'
    }
    showProgress(titre){
        this.popup.setTitle(titre)
        let tab = this.getTabInfo(this)
        let bestTab = this.bestTabInfo()
        if(bestTab == null || bestTab.points < this.points){
            this.saveTabInfo(this)
            bestTab = this.bestTabInfo()
        }
        let table = this.htmlTableInfo(tab)
        if(bestTab.points > this.points){
            table+= "<div>Last Best Score</div>" + this.htmlTableInfo(this.getTabInfo(bestTab))
        }
        if(bestTab.points < this.points){
            table= "New Best Score" + table
        }
        let element = '<div style="text-align: center;width:100%">'+table+'<button id="buttonRetry">Menu</button></div>'
        let contenu = document.createElement('div')
        this.popup.setContent(contenu)
        contenu.outerHTML = element
        this.popup.showPopup()
        let self = this
        document.getElementById('buttonRetry').addEventListener('click',function(e){
            e.preventDefault()
            self.reset()
            self.popup.hidePopup()
        })
    }
    reset(){
        // reset game
        rightEnemies = []
        leftEnemies = []
        entitiesPlus = []
        heroes.reset()

        this.kill = 0
        this.time = 0
        this.wave = 0
        this.pause = true
        this.lastPattern = -1
        this.atMenu = true
        window.setTimeout(function(){
            canvasInfo.ready = true
        },10)
    }
    menu(){
        let width = 150
        let height = 50
        let y = canvasInfo.height / 2
        let buttonDefaultPos = {
            x: parseInt(canvasInfo.width - width)/ 2,
            y: parseInt(y),
            width: width,
            height: height
        }
        this.buttonOnClick = []
        if(this.beforeMenu){
            push()
            let ratio = sin(millis()%2000 / 500)
            let tmp = 255 - 255 * ratio
            let textColor = color(tmp, tmp, tmp);
            let strokeColor = color(255 - tmp, 255 - tmp, 255 - tmp);
            fill(textColor)
            strokeWeight(2)
            stroke(strokeColor)
            textSize(30)
            textAlign(CENTER)
            text("Press a button", 0, buttonDefaultPos.y + 10, canvasInfo.width, buttonDefaultPos.height)
            pop()
        }else
        if(this.loading){
            push()
            width = 100
            let percentProgress = music.percentLoadedSound()
            if(percentProgress == 1) this.loading = false
            textSize(30)
            textAlign(CENTER)
            fill("#00000000")
            rect((canvasInfo.width - width) / 2, buttonDefaultPos.y + 10, width, 20)
            fill("#FFFFFF")
            rect((canvasInfo.width - width) / 2, buttonDefaultPos.y + 10, width * percentProgress, 20)
            strokeWeight(2)
            stroke("#000000")
            text("Loading", 0, buttonDefaultPos.y + 30, canvasInfo.width, buttonDefaultPos.height)
            pop()
        }else
        if(this.atMenu){
            this.buttonOnClick = [
                {
                    libelle: (this.time > 0 ? "RESUME" : "START"),
                    click: function(){
                        if(canvasInfo.wave == 0){
                            canvasInfo.startNewGame()
                        }else{
                            canvasInfo.atMenu = false
                            canvasInfo.pause = false
                        }
                    }
                },
                {
                    libelle: "OPTIONS",
                    click: function(){
                        canvasInfo.optionMenu = true
                    }
                }
            ]
            if(this.time > 0){
                this.buttonOnClick.push({
                    libelle: "RESET",
                    click: function(){
                        canvasInfo.reset()
                    }
                })
            }
            // Option
            if(this.optionMenu){
                this.buttonOnClick = [
                    {
                        libelle: "RETURN",
                        click: function(){
                            canvasInfo.optionMenu = false
                        }
                    },
                    {
                        libelle: "Volume",
                        dragged: function(){
                            let x = mouseX - this.pos.x
                            if(canvasInfo.volume != ~~(x / this.pos.width * canvasInfo.maxVolume)){
                                music.fireFx('punch')
                            }
                            canvasInfo.volume = ~~(x / this.pos.width * canvasInfo.maxVolume)
                            music.updateVolume(canvasInfo.volume)
                        },
                        draw: function(){
                            push()
                            fill('#FF00FF0A')
                            rect(this.pos.x, this.pos.y, canvasInfo.volume / canvasInfo.maxVolume * this.pos.width, this.pos.height, 5)
                            pop()
                        }
                    },
                ]
            }
            push()
            this.buttonOnClick.forEach(function(button, index){
                fill("white")
                button.pos = Object.assign({}, buttonDefaultPos)
                button.pos.y = canvasInfo.height / 2 + (height + 10) * index
                let onhover = (mouseX > button.pos.x && mouseX < button.pos.x + button.pos.width) && (mouseY > button.pos.y && mouseY < button.pos.y + button.pos.height);
                strokeWeight(onhover ? 4 : 1)
                rect(button.pos.x, button.pos.y, button.pos.width, button.pos.height, 5)
                fill("black")
                strokeWeight(1)
                textSize(30)
                textAlign(CENTER)
                text(button.libelle,button.pos.x, button.pos.y + 10, button.pos.width, button.pos.height, 5)
                if(button.draw)
                    button.draw()
            })
            pop()
        }
    }
    mouseClick(e){
        canvasInfo.firstActionUser()
        canvasInfo.buttonOnClick.every(button => {
            // console.dir(button.libelle)
            // console.log(button.pos.x+" < " + ~~(mouseX) + " < " + (button.pos.x + button.pos.width) + " __ " + button.pos.y+" < " + ~~(mouseY) + " < " + (button.pos.y + button.pos.height))
            // console.log((mouseX > button.pos.x && mouseX < button.pos.x + button.pos.width) && (mouseY > button.pos.y && mouseY < button.pos.y + button.pos.height) ? "true" : "false")
            if(
                (mouseX > button.pos.x && mouseX < button.pos.x + button.pos.width)
                && (mouseY > button.pos.y && mouseY < button.pos.y + button.pos.height)
            ){
                if(button.click){
                    button.click()
                }
                if(button.dragged){
                    button.dragged()
                }
                return false
            }
            return true // continue if no one event fired
        })
    }
    firstActionUser(){
        if(this.beforeMenu) {
            this.beforeMenu = false
            this.loading = true
            this.acceleration = this.baseAcceleration
            music.setupAudio()
        }
    }
    startNewGame(){
        if(!this.ready) return
        this.ready = false
        heroes.actif = true
        this.pause = false
        this.acceleration = this.baseAcceleration * this.ratio
        canvasInfo.atMenu = false
        this.spawn()
    }
    
    // create ennemy
    spawn(){
        this.wave++
        this.acceleration*=1.01

        this.newWave = timestamp

        let left = 0
        let right = this.width
        let random = this.lastPattern

        while(random == this.lastPattern && patternEnnemie.length>1 || random<0){ // not 2 times the same pattern or 1 patern availlable (test)
            random = (Math.random() * patternEnnemie.length)
            random-=random%1
        }

        let dir = Math.random() < 0.5 ? "left" : "right"
        if(this.wave <= 3 && patternEnnemie.length>1){
            switch(this.wave){
                case 1:
                    random = 0
                    dir = "left"
                    break;
                case 2:
                    random = 0
                    dir = "right"
                    break;
                case 3:
                    random = 1
                    break;
            }
        }
        this.lastPattern = random
        let tab
        let typeEnemy
        for(let i = 0; i < patternEnnemie[random][0].length; i++){
            for(let j = 0;j <= 1;j++){
                let x = dir == "left" && j==0 || dir == "right" && j==1 ? left : right
                let maxDist = 0
                if(patternEnnemie[random][j][i] !== ""){
                    typeEnemy = getTypeEnnemie(patternEnnemie[random][j][i])
                    let enemi = new enemy(x,this.baseLine,typeEnemy)
                    if(dir == "left" && j==0 || dir == "right" && j==1){
                        if(leftEnemies.length>0)
                            enemi.before = leftEnemies[leftEnemies.length-1]
                        leftEnemies.push(enemi)
                        let addToLeft =leftEnemies[leftEnemies.length-1].getWidthPos()
                        left-= addToLeft
                        if(maxDist < addToLeft) maxDist = addToLeft
                    }
                    else{
                        if(rightEnemies.length>0)
                            enemi.before = rightEnemies[rightEnemies.length-1]
                        rightEnemies.push(enemi)
                        let addToRight =rightEnemies[rightEnemies.length-1].getWidthPos()
                        right+= addToRight
                        if(maxDist < addToRight) maxDist = addToRight
                    }
                }
            }
            left-= this.paddingEntitiesEnemies
            right+= this.paddingEntitiesEnemies

            tab = [
                left * -1,
                right - this.width
            ]
            if(tab[0] > tab[1])right = -left + this.width
            if(tab[1] > tab[0])left = -(right - this.width)
        }
    }
}

function mouseDragged(e){ // onclick + onmove
    canvasInfo.buttonOnClick.every(function(button){
        if(
            (mouseX > button.pos.x && mouseX < button.pos.x + button.pos.width)
            && (mouseY > button.pos.y && mouseY < button.pos.y + button.pos.height)
        ){
            if(button.dragged){
                // console.log("mousePressed -> " + button.libelle)
                button.dragged()
            }
            return false
        }
        return true // continue if no one event fired
    })
}

// canvasInfo.godMod = true;
// canvasInfo.autoPlay = true;