const defaultHero = {
    combo: 0,
    actif: false,
    range: 6 * canvasInfo.tileSize,
    rangeDash: 15,
    width: 3,
    height: 10,
    dashAttack: false,
    color:255,
    detect: {
        left: false,
        right: false
    },
    maxSpeed: 20,
    speed: 0.2,
    comboTime:0,
}

class heroe extends entite{
    showCombo(){
        if(this.comboTime > 0) this.comboTime--
        else return;
        let size = 30 * (this.comboTime / 40) + 12
        textSize(size)
        fill(255)
        stroke(0)
        text("+ " + this.combo, this.x - this.getWidth() * (this.combo<10?0.66:0.5), (this.baseHeight - this.height * canvasInfo.tileSize) / 2)
    }
    isCombo(isKilled, enemi){
        canvasInfo.points+= (1) + this.combo
        if(isKilled && enemi.maxHealth>1){
            this.comboTime = 60
            this.combo+= 1 + enemi.bonusPoint()
        }else{
            this.combo = 0
        }
    }
    showRange(){
        let height = 5
        canvasInfo.color.right(this.dashAttack == "right" || this.detect.right)
        rect(this.x, canvasInfo.baseLine + 5, this.getRange(), height)
        canvasInfo.color.left(this.dashAttack == "left" || this.detect.left)
        rect(this.x - this.getRange(), canvasInfo.baseLine + 5, this.getRange(), height)
    }
    constructorplus(x,y, option){
        this.reset = function(){
            this.x = x
            this.y = y
            this.dashAttack = false
            this.speed = 0.2
            this.actif = false
        }
    }
    getRange(){
        return canvasInfo.tileSize * this.rangeDash + this.getWidth()/2
    }
    rightDash(){
        if(canvasInfo.time == 0 && rightEnemies.length==0 && leftEnemies.length==0){
            startNewGame() // if no game start
            return
        }
        if(this.detect.right && !this.dashAttack) this.dashAttack = "right"
    }
    leftDash(){
        if(canvasInfo.time == 0 && rightEnemies.length==0 && leftEnemies.length==0){
            startNewGame() // if no game start
            return
        }
        if(this.detect.left && !this.dashAttack) this.dashAttack = "left"
    }
    update(){
        this.showRange()
        if(this.combo>1){
            this.showCombo()
        }
        if(canvasInfo.pause) return
        this.detect.left = false
        this.detect.right = false
        if(this.dashAttack !== false){ // si le heros est en train de dash
            var pos = createVector(this.x,this.y)
            var listEnemies = (this.dashAttack == "right"? rightEnemies: leftEnemies)
            let enemiToHit = getNearest(listEnemies,pos)
            this.speed+= (this.speed * 1.3) * canvasInfo.acceleration
            if(this.speed > this.maxSpeed)
                this.speed = this.maxSpeed
            var maxDist = this.x - enemiToHit.x
            if(maxDist<0) maxDist = maxDist * -1
            maxDist = maxDist - this.range - enemiToHit.getWidth()/2 - this.getWidth()/2
            if(maxDist < 0) maxDist = 0 // backDash isn't possibru
            if(this.speed > maxDist) this.speed = maxDist // cannot go futher than the ennemi
            if(this.speed == 0){ // if can hit the enemi
                let isKilled = !enemiToHit.hit()
                this.dashAttack = false
                this.speed = 0.2
                this.isCombo(isKilled, enemiToHit)
            }else{
                let speed = this.speed
                if(this.dashAttack == "right") speed = speed * -1
                moveAll(speed)
            }
        }
        // si le heros detecte un ennemi à porté
        var list = getInRange(this.x,this.y,this.getRange(),rightEnemies)
        if(list.length > 0)
            this.detect.right = true
        var list = getInRange(this.x,this.y,this.getRange(),leftEnemies)
        if(list.length > 0)
            this.detect.left = true
    }
}