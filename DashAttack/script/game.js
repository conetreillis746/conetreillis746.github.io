var canvasInfo = {
    ready: true,
    width: 800,
    height: 400,
    tileSize: 10,
    color:{
        right: function(directionAttack){
            fill(255, 80, 80, (directionAttack?255:150))
        },
        left: function(directionAttack){
            fill(20, 210, 255, (directionAttack?255:150))
        }
    },
    baseAcceleration: 1,
    acceleration: 0,
    paddingEntitiesEnemies: 3,
    endGame: function(){
        canvasInfo.pause = true
        canvasInfo.showProgress('Votre Score')
    },
    showProgress(titre){
        popup.setTitle(titre)

        let tab = [
            ['Points', {style:'font-size:2em', html: canvasInfo.points}],
            ['Kill', {style:'font-size:2em', html: canvasInfo.kill}],
            ['Time', {style:'font-size:2em', html: getTimer(canvasInfo.time)}]
        ]

        let tr = [[],[]]
        tab.forEach(function(row){
            row.forEach(function(value,index){
                if(value.html == undefined){
                    tr[index]+= "<td width='"+Math.round(1/tab.length * 100)+"%'>"+value+"</td>"
                }else{
                    tr[index]+= "<td width='"+Math.round(1/tab.length * 100)+"%' style='"+value.style+"'>"+value.html+"</td>"
                }
            })
        })

        let element = '<div style="text-align: center;width:100%"><table style="width:100%"><tr>'+tr[0]+'</tr><tr>'+tr[1]+'</tr></table><button id="buttonRetry">Reessayer</button></div>'
        
        let contenu = document.createElement('div')

        popup.setContent(contenu)

        contenu.outerHTML = element

        popup.showPopup()

        document.getElementById('buttonRetry').addEventListener('click',function(e){
            e.preventDefault()
            canvasInfo.reset()

            popup.hidePopup()
            window.setTimeout(function(){
                canvasInfo.ready = true
            },10)
        })
    },
    time: 0,
    kill: 0,
    points: 0,
    pause: true,
    reset: function(){
        // reset game
        rightEnemies = []
        leftEnemies = []
        entitiesPlus = []
        heroes.reset()

        canvasInfo.kill = 0
        canvasInfo.time = 0
        canvasInfo.pause = true
    },
    lastPattern: -1,
}
canvasInfo.baseLine = canvasInfo.height - 57

var typeEnnemie = {
    "normal": {
        health: 1,
        speed: 1,
        width: 3,
        height: 10,
        color: "#53ca77"
    },
    "reverse": {
        health: 3,
        speed: 1,
        width: 2,
        height: 7,
        color: "#53ca77",
        hit(){
            let leftDirect = this.whatDirection()=='left'
            if(leftDirect){
                let tmp = leftEnemies.shift()
                if(leftEnemies.length>0)
                    leftEnemies[0].before = null
                rightEnemies.unshift(tmp)
                if(rightEnemies.length>1)
                    rightEnemies[1].before = tmp
            }else{
                let tmp = rightEnemies.shift()
                if(rightEnemies.length>0)
                    rightEnemies[0].before = null
                leftEnemies.unshift(tmp)
                if(leftEnemies.length>1)
                    leftEnemies[1].before = tmp
            }
            let tmp = heroes.x - this.x
            if(tmp > -heroes.range && !leftDirect)
                tmp = -heroes.range
            if(tmp < heroes.range && leftDirect)
                tmp = heroes.range
            this.x = tmp + heroes.x
            this.stun = 80
            this.health--
            if(this.health <= 0)
                this.kill()
            return this.alive
        },
        showHealtBar(){
            let height = 5
            let width = 20
            var y = canvasInfo.baseLine + 15
            let directionLeft = this.whatDirection()=='left'
            for(let i = 1; i <= this.health; i++){
                y+=2+height
                if(directionLeft) canvasInfo.color.left(true)
                else canvasInfo.color.right(true)
                rect(this.x - width/2, y, width, height)
                directionLeft = !directionLeft
            }
        }
    },
    "tank": {
        health: 3,
        speed: 0.7,
        width: 5,
        height: 8,
        color: "#d7f250",
        stopAtRange: true,
        getSpeed(){
            let speed = this.speed
            if(heroes.x - heroes.getRange() < this.x && heroes.x + heroes.getRange() > this.x)
                speed = 0
            if(this.before && this.before.alive && this.before.getSpeed() < speed){
                speed = this.before.getSpeed()
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
            // take the speed of the more slow
            return speed
        }
    },
    "speed": {
        health: 1,
        speed: 1,
        width: 5,
        height: 2,
        baseHeight: canvasInfo.baseLine - 7 * canvasInfo.tileSize,
        color: "#ffd966",
        speedByTime: true,
        bonusPoint(){
            return (this.time - this.time%200)/200
        }
    },
    "speed_range": {
        health: 1,
        speed: 1,
        width: 5,
        height: 2,
        baseHeight: canvasInfo.baseLine - 7 * canvasInfo.tileSize,
        color: "#ffff66",
        speedByTime: true,
        constructorplus(x,y, option){
            this.x+= 25 * canvasInfo.tileSize * (this.whatDirection() == 'left'? -1 : 1)
        },
        bonusPoint(){
            return (this.time - this.time%200)/200
        },
        getWidthPos(){
            return this.getWidth() + 25 * canvasInfo.tileSize
        }
    },
    "mage_storm": {
        health: 1,
        speed: 1,
        width: 2,
        height: 5,
        color: "#66b3ff",
        beforeCast: 350,
        needCast: 150,
        cast: false,
        stopAtRange: true,
        time: 200,
        draw(){
            this.drawself()
            
            // for each x time
            if(this.time % this.beforeCast == 0 && !this.cast){
                this.cast = true
                this.time = 0
            }
            if(this.cast && this.time % this.needCast == 0){
                entitiesPlus.push(new entite(heroes.x, canvasInfo.baseLine - 15 * canvasInfo.tileSize, projectiles["storm"]))
                this.time = 0
            }
        }
    }
}

var patternEnnemie = [
    /* array of array for two direction */
    [
        ["tank","normal","normal","normal",],
        ["tank","normal","normal","normal",]
    ],
    [
        ["","speed_range","","speed_range",""],
        ["speed_range","","speed_range","","speed_range"]
    ],
    [
        ["reverse","normal","normal",],
        ["reverse","normal","normal",]
    ],
    [
        ["normal","tank","normal","normal",],
        ["normal","tank","normal","normal",]
    ],
    [
        ["normal","normal","normal","normal","normal","normal","normal","normal","normal",],
        ["","","","","","","","","speed_range",]
    ],
    [
        ["normal","tank","normal","mage_storm",],
        ["normal","tank","normal","mage_storm",]
    ],
    [
        ["reverse","reverse","reverse","reverse","reverse++",],
        ["reverse","reverse","reverse","reverse","reverse++",]
    ],
    [
        ["tank***","mage_storm",],
        ["tank***","mage_storm",]
    ],
]

var projectiles = {
    "storm" : {
        y: canvasInfo.baseLine + 20 * canvasInfo.tileSize,
        baseHeight: canvasInfo.baseLine - 15 * canvasInfo.tileSize,
        width: 5,
        height: 2,
        charge:0,
        range: 1,
        maxCharge: 120,
        chargeColor: ['#9999ff','#6666ff','#4d4dff'],
        color: '#9999ff',
        drawself(){
            let cloud = listImage.cloud.get()
            cloud.resize(25 * 3,12 * 3)
            image(cloud, this.x - cloud.width / 2, this.baseHeight - this.getHeight())
        },
        draw(){
            this.drawself()
        },
        update(){
            this.charge++
            let etape = this.maxCharge/this.chargeColor.length
            // this.color = this.chargeColor[(this.charge-this.charge%etape)/etape]
            if(this.charge>=this.maxCharge){
                this.fire()
            }
            if(this.charge - this.maxCharge - 5 >= 0) {
                this.alive = false
                this.charge = 0
            }
        },
        fire(){
            fill("#0000FF")
            let width = 5 * canvasInfo.tileSize
            let height = canvasInfo.baseLine - this.y
            rect(this.x - width/2, this.baseHeight - height, width, height)
            
            if(heroes.x > this.x - this.range / 2 && heroes.x < this.x + this.range / 2){
                canvasInfo.endGame()
            }
        },
    }
}