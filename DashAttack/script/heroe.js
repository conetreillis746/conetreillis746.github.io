class heroe extends entite{
    showCombo(){
        if(this.comboTime > 0) this.comboTime--
        else return;
        let size = 30 * (this.comboTime / 40) + 12
        push()
        textSize(size)
        fill(255)
        stroke(0)
        text("+ " + this.combo, this.x - this.getWidth() * (this.combo<10?0.66:0.5), (this.baseHeight - this.height * canvasInfo.tileSize) / 2)
        pop()
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
        let height = 2 * canvasInfo.tileSize
        let heightDetect = 4 * canvasInfo.tileSize
        let detect = this.detect()
        canvasInfo.color.right(this.dashAttack == "right" || detect.right)
        if(detect.right){
            let width = (rightEnemies[0].x - rightEnemies[0].getWidth() / 2) - this.x - this.getWidth() / 2
            rect(this.x + this.getWidth() / 2, canvasInfo.baseLine - heightDetect, width, heightDetect)
        }else{
            rect(this.x + this.getWidth() / 2, canvasInfo.baseLine - height, this.getRange() - this.getWidth() / 2, height)
        }
        canvasInfo.color.left(this.dashAttack == "left" || detect.left)
        if(detect.left){
            let width = this.x - this.getWidth() / 2 - (leftEnemies[0].x + leftEnemies[0].getWidth() / 2)
            rect(this.x - this.getWidth() / 2 - width, canvasInfo.baseLine - heightDetect, width, heightDetect)
        }else{
            rect(this.x - this.getRange(), canvasInfo.baseLine - height, this.getRange() - this.getWidth() / 2, height)
        }
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
        return this.rangeDash + this.getWidth()/2
    }
    rightDash(){
        if(!canvasInfo.pause && canvasInfo.time == 0 && rightEnemies.length==0 && leftEnemies.length==0){
            // canvasInfo.startNewGame() // if no game start
            return
        }
        if(this.detect().right && !this.dashAttack) this.dashAttack = "right"
    }
    leftDash(){
        if(!canvasInfo.pause && canvasInfo.time == 0 && rightEnemies.length==0 && leftEnemies.length==0){
            // canvasInfo.startNewGame() // if no game start
            return
        }
        if(this.detect().left && !this.dashAttack) this.dashAttack = "left"
    }
    detect(){
        let detect = {right: false, left: false}
        let list
        // si le heros detecte un ennemi à porté
        list = getInRange(this.x,this.y,this.getRange(),rightEnemies)
        if(list.length > 0){
            detect.right = true
            if(canvasInfo.autoPlay && this.dashAttack == "")
                this.dashAttack = "right"
        }
        list = getInRange(this.x,this.y,this.getRange(),leftEnemies)
        if(list.length > 0){
            detect.left = true
            if(canvasInfo.autoPlay && this.dashAttack == "")
                this.dashAttack = "left"
        }
        return detect
    }
    update(){
        this.showRange()
        if(this.combo > 1){
            this.showCombo()
        }
        if(canvasInfo.pause) return
        if(this.dashAttack !== false){ // si le heros est en train de dash
            let pos = createVector(this.x,this.y)
            let listEnemies = (this.dashAttack == "right"? rightEnemies: leftEnemies)
            let enemiToHit = getNearest(listEnemies,pos)
            this.speed+= (this.speed * 1.3) * canvasInfo.acceleration
            if(this.speed > this.maxSpeed)
                this.speed = this.maxSpeed
            let maxDist = this.x - enemiToHit.x
            if(maxDist < 0) maxDist = maxDist * -1
            maxDist = maxDist - this.range - enemiToHit.getWidth()/2 - this.getWidth()/2
            if(maxDist < 0) maxDist = 0 // backDash isn't possibru
            if(this.speed > maxDist) this.speed = maxDist // cannot go futher than the ennemi
            if(this.speed < 0.00001){ // if can hit the enemi
                music.fireFx("punch")
                this.dashAttack = false
                this.speed = 0.2
                this.isCombo(!enemiToHit.hit(), enemiToHit)
            }else{
                let speed = this.speed * (this.dashAttack == "right"?-1:1)
                moveAll(speed)
            }
        }

        // push()
        // fill('#FF0000')
        // let width = 10
        // rect(heroes.x - width/2, heroes.y - width/2, width ,width)
        // pop()
    }
}