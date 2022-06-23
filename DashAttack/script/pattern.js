
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
    },
    "sword_thrower": {
        health: 1,
        speed: 2,
        width: 2,
        range: defaultHero.range + 5,
        height: 8,
        color: "#66b3ff",
        beforeCast: 200,
        needCast: 50,
        cast: false,
        stopAtRange: true,
        lastPosX: 0,
        time: 150,
        draw(){
            let range = this.getWidth() / 2 + this.range * canvasInfo.tileSize
            if(this.whatDirection()=='left' && this.x + range < heroes.x - heroes.getWidth() / 2){
                this.time = 0 
            }
            if(this.whatDirection()=='right' && this.x - range > heroes.x + heroes.getWidth() / 2){
                this.time = 0 
            }
            this.drawself()
            // for each x time
            if(this.time > 0 && this.time % this.beforeCast == 0 && !this.cast){ // time before cast
                this.cast = true
                this.time = 0
            }
            if(this.time > 0 && this.cast && this.time % this.needCast == 0){ // time to cast
                this.cast = false
                entitiesPlus.push(new entite(this.x, this.y - this.getHeight(), projectiles["sword_throwing"]))
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
    [
        ["tank***++","sword_thrower",],
        ["tank***++","sword_thrower",]
    ]
]

// test
// patternEnnemie = [
//     [
//         ["tank***++","sword_thrower",],
//         ["tank***++","sword_thrower",]
//     ]
// ]

var projectiles = {
    "storm" : {
        y: canvasInfo.baseLine + 20 * canvasInfo.tileSize,
        baseHeight: canvasInfo.baseLine - 15 * canvasInfo.tileSize,
        width: 5,
        height: 2,
        charge:0,
        range: 3 * canvasInfo.tileSize,
        maxCharge: 120,
        maxTime: 8,
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
            if(this.charge - this.maxCharge - (4 * this.maxTime / 4) >= 0) {
                this.alive = false
                this.charge = 0
            }
        },
        fire(){
            fill("#0000FF")
            let width = listImage.storm.width / 4 - 3 // - 3 to not move the animation of storm
            let height = listImage.storm.height
            let frame = (this.charge - this.maxCharge)
            frame = (frame - frame%(this.maxTime / 4)) / (this.maxTime / 4)

            copy(listImage.storm, width * frame, 0, width, height, this.x - width / 2, 200, width , height)

            if(frame > 2 && heroes.x > this.x - this.range / 2 && heroes.x < this.x + this.range / 2){
                canvasInfo.endGame()
            }
        },
    },
    "sword_throwing" : {
        width: 3,
        height: 1.2,
        charge:0,
        range: 2.8 * canvasInfo.tileSize,
        maxCharge: 120,
        maxTime: 100,
        color: '#FF2222',
        stage: 0,
        rotate: 0,
        speed: 0,
        maxSpeed: 2,
        tab_length: null, // length of right triangle
        tab_angle: null, // rad angle of right triangle
        baseDirection: null,
        constructorplus(x,y,option){
            this.baseDirection = this.whatDirection()
            this.x = this.x + (this.baseDirection == "left" ?  this.getWidth()/2 : this.getWidth()/2)
            this.baseHeight = y
            this.maxY = y - 20 * canvasInfo.tileSize
            this.rotate = this.baseDirection == "left" ? 2 : 1
            this.puissance = 0
        },
        drawself(){
            let max_length = this.orientationToTheHeroe()
            push()
            let tmp = color(this.color)
            tmp.setAlpha(255 - this.time/this.maxTime * 255)
            fill(tmp)
            let base = createVector(this.x, this.y)
            translate(base.x,base.y)
            rotate(this.rotate)
            rect(0-this.getWidth()/2, 0-this.getHeight()/2, this.getWidth(), this.getHeight())
            if(this.stage == 3){
                let tmp = color(this.color)
                tmp.setAlpha(100)
                fill(tmp)
                rect(-this.getWidth() / 2, -this.getHeight(), max_length + this.getWidth(), this.getHeight() * 2)
            }
            pop()
        },
        draw(){
            this.drawself()
        },
        orientationToTheHeroe(angle){
            if(this.stage < 3){
                this.tab_length = {'a': null, 'b': heroes.y - this.y, 'c': heroes.x - this.x} // a : hypothenuse
                this.tab_angle = {'A': Math.PI/2, 'B': null, 'C': null}
                if(this.tab_length['b'] < 0) this.tab_length['b'] *= -1
                if(this.tab_length['c'] < 0) this.tab_length['c'] *= -1
                this.tab_length['a'] = Math.sqrt(Math.pow(this.tab_length['b'],2) + Math.pow(this.tab_length['c'],2) - (2 * this.tab_length['b'] * this.tab_length['c'] * Math.cos(this.tab_angle['A'])))
                this.tab_angle['C'] = Math.acos((Math.pow(this.tab_length['a'],2) + Math.pow(this.tab_length['b'],2) - Math.pow(this.tab_length['c'],2)) / (2 * this.tab_length['a'] * this.tab_length['b']))
            }
            // push()
            // triangle(this.x + (this.baseDirection == "left" ? 1 : -1) * this.tab_length['c'], this.y + this.tab_length['b'], this.x, this.y, this.x , this.y + this.tab_length['b'])
            // pop()
            return angle ? Math.PI / 2 + (this.baseDirection == "left" ? - this.tab_angle['C'] : + this.tab_angle['C']) : this.tab_length['a']
        },
        update(){
            if(this.stage == 0){
                this.puissance = (this.y - this.maxY + canvasInfo.tileSize) / canvasInfo.tileSize
                let speed = this.maxSpeed * this.puissance * -1
                this.rotate+=  (this.baseDirection == "left" ? 1 / this.puissance : -1 / this.puissance)
                this.y += speed / 10 * canvasInfo.acceleration;
                this.x += (heroes.x - this.x) * 0.02
                if(this.y - 2 * canvasInfo.tileSize <= this.maxY) this.stage = 1
            }
            if(this.stage == 1 || this.stage == 2){
                this.puissance-= this.puissance * 0.1;
                if(this.stage == 1 && this.puissance < 0.5){
                    this.stage = 2
                    this.maxrotate = this.orientationToTheHeroe(true)
                    this.rotate = this.rotate % (Math.PI * 2)
                }
                if(this.stage == 2){
                    // this.rotate = this.maxrotate
                    let tab = {
                        puissance: this.puissance,
                        rotate: this.rotate,
                        'actual + 10 frame': this.puissance * 10 + this.rotate, // actual rotate
                        'maxrotate':this.maxrotate + (this.baseDirection == "left" ? -1 : 1) * this.puissance * 10
                    }
                    if(this.baseDirection == "left" ? tab[0] < tab[1] : tab[0] > tab[1]){ // 
                        this.puissance+= this.puissance / 0.1
                    }
                    if(this.rotate = this.maxrotate){
                        this.stage = 3
                        this.speed = 0
                    }
                }else
                    this.rotate+= (this.baseDirection == "left" ? this.puissance : this.puissance)
            }
            if(this.stage == 3){
                this.speed += 0.019 * canvasInfo.acceleration
                let speed = this.speed / 100
                // let tab = [
                //     this.x + (this.baseDirection == "left" ? 1 : -1) * this.tab_length['c'], this.y + this.tab_length['b'], // finish
                //     this.x, this.y, // actual
                //     this.x , this.y + this.tab_length['b'] // angle
                // ]
                let x = speed * (this.baseDirection == "left" ? 1 : -1) * this.tab_length['c']
                let y = speed * this.tab_length['b']
                this.tab_length['a'] -= Math.sqrt(Math.pow(x,2) + Math.pow(y,2))
                this.x += x
                this.y += y
                if(this.y > canvasInfo.baseLine){
                    this.stage = 4
                    this.time = 0
                }
            }
            if(this.stage == 4){
                this.time++
                if(this.maxTime < this.time) this.alive = false
            }else       
            if((heroes.y - heroes.getHeight()) > this.y + this.getHeight() / 2 || (heroes.y + heroes.getHeight()) < this.y - this.getHeight() / 2){
                // can't hit if not at the correct height
            }else
            if(heroes.x > this.x - this.range / 2 && heroes.x < this.x + this.range / 2){
                canvasInfo.endGame()
            }
        },
    }
}
