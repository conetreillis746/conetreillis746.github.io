class enemy extends entite{
    constructorplus(x,y, option){
        this.maxHealth = this.health
    }
    whatDirection(){
        return (this.x < heroes.x?"left":"right")
    }
    bonusPoint(){
        return 0
    }
    getSpeed(){
        let speed = this.speed
        if(this.stopAtRange && heroes.x - heroes.getRange() < this.x && heroes.x + heroes.getRange() > this.x)
            speed = 0
        if(this.speedByTime){
            speed = speed * (1 + (this.time - this.time%10)/150)
            this.time++
        }
        if(this.before){
            if(this.whatDirection()=='left' && this.x + this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize >= this.before.x - this.before.getWidth() / 2){
                speed = 0
                this.x = this.before.x - this.before.getWidth() / 2 - (this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize)
            }
            if(this.whatDirection()=='right' && this.x - this.getWidth() / 2 - canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize <= this.before.x + this.before.getWidth() / 2){
                speed = 0
                this.x = this.before.x + this.before.getWidth() / 2 + (this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize)
            }
        }
        // take the speed of the more slow closer to the hero
        return speed
    }
    update(){
        this.time++
        this.showHealtBar()
        if(this.before && false){
            // distance from me and ennemi before if exist
            fill(255)
            rect(this.x < heroes.x? this.x + this.getWidth() / 2 : this.x - this.getWidth() / 2 - 5,this.y,canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize,5)
        }
        if(canvasInfo.pause) return // not update if game is pause
        if(this.stun > 0){
            this.stun -= 1 * canvasInfo.acceleration
            return
        }
        // cannot bypass the hero
        let hero_mid_witdh = heroes.getWidth() / 2
        let my_mid_witdh = this.getWidth() / 2

        // move to the hero
        let changePosition = this.getSpeed() * canvasInfo.acceleration
        if(this.whatDirection() == "left"){
            this.x += changePosition
            // if enemy x + enemy width < heros x - hero width
            if(this.x + my_mid_witdh > heroes.x - hero_mid_witdh){
                canvasInfo.endGame()
            }
        }
        if(this.whatDirection() == "right"){
            this.x -= changePosition
            // if enemy x + enemy width < heros x - hero width
            if(this.x - my_mid_witdh < heroes.x + hero_mid_witdh){
                canvasInfo.endGame()
            }
        }
    }
    showHealtBar(){
        let height = 5
        let width = 20
        var y = canvasInfo.baseLine + 15
        for(let i = 1; i <= this.health; i++){
            y+= 2 + height
            if(this.whatDirection()=='left') canvasInfo.color.left(true)
            else canvasInfo.color.right(true)
            rect(this.x - width/2, y, width, height)
        }
    }
    getWidth(){
        return this.width * canvasInfo.tileSize
    }
    hit(){
        this.stun += 20
        this.health--
        if(this.health <= 0)
            this.kill()
        return this.alive
    }
    kill(){
        this.alive = false
        if(this.x > heroes.x){
            rightEnemies.shift()
            if(rightEnemies.length>0)
                delete rightEnemies[0].before
        }else{
            leftEnemies.shift()
            if(leftEnemies.length>0)
                delete leftEnemies[0].before
        }
        canvasInfo.kill++
    }
}