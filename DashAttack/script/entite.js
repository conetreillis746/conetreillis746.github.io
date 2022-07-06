class entite{
    constructor(x,y, option){
        this.time = 0
        this.stun = 0
        this.alive = true
        this.baseHeight = canvasInfo.baseLine
        this.x = x
        this.y = y
        for(let k in option) this[k] = option[k]
        this.constructorplus(x,y,option)
    }
    constructorplus(x,y, option){}
    drawself(){
        fill(this.color)
        rect(this.x - this.getWidth()/2, this.baseHeight - this.getHeight(), this.getWidth(), this.getHeight());
        this.showHealtBar()
    }
    showHealtBar(){}
    draw(){
        this.drawself()
        this.update();
    }
    update(){}
    getWidth(){
        return this.width * canvasInfo.tileSize
    }
    getWidthPos(){
        return this.width * canvasInfo.tileSize
    }
    getHeight(){
        return this.height * canvasInfo.tileSize
    }
    whatDirection(){
        return (this.x < heroes.x?"left":"right")
    }
}