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
        canvasInfo.pause = true;
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
            e.preventDefault();
            canvasInfo.reset();

            popup.hidePopup()
            window.setTimeout(function(){
                canvasInfo.ready = true
            },10);
        })
    },
    time: 0,
    kill: 0,
    points: 0,
    pause: true,
    reset: function(){
        // reset game
        rightEnemies = [];
        leftEnemies = [];
        heroes.reset()

        canvasInfo.kill = 0;
        canvasInfo.time = 0;
        canvasInfo.pause = true;
    },
    lastPattern: -1,
}
canvasInfo.baseLine = canvasInfo.height - 50;

var heroes = null;
const defaultHero = {
    combo: 0,
    actif: false,
    range: 8 * canvasInfo.tileSize,
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
    speed: 0.2
};

// enemies List
var leftEnemies = [];
var rightEnemies = [];
var entitiesPlus = [];

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
            let leftDirect = this.whatDirection()=='left';
            if(leftDirect){
                let tmp = leftEnemies.shift()
                if(leftEnemies.length>0)
                    leftEnemies[0].before = null;
                rightEnemies.unshift(tmp)
                if(rightEnemies.length>1)
                    rightEnemies[1].before = tmp;
            }else{
                let tmp = rightEnemies.shift()
                if(rightEnemies.length>0)
                    rightEnemies[0].before = null;
                leftEnemies.unshift(tmp)
                if(leftEnemies.length>1)
                    leftEnemies[1].before = tmp;
            }
            let tmp = heroes.x - this.x;
            if(tmp > -heroes.range && !leftDirect)
                tmp = -heroes.range
            if(tmp < heroes.range && leftDirect)
                tmp = heroes.range
            this.x = tmp + heroes.x;
            this.stun = 80;
            this.health--;
            if(this.health <= 0)
                this.kill();
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
        getSpeed(){
            let speed = this.speed;
            // console.log(" range - => " + (heroes.x - heroes.getRange()) + " / " + (heroes.x + heroes.getRange()) + " = > actual x : " + this.x + (heroes.x - heroes.getRange() < this.x ? "true" : "false") + "-" + (heroes.x + heroes.getRange() > this.x ? "true" : "false"));
            if(heroes.x - heroes.getRange() < this.x && heroes.x + heroes.getRange() > this.x)
                speed = 0;
            if(this.before && this.before.alive && this.before.getSpeed() < speed){
                speed = this.before.getSpeed()
            }
            
            if(this.before){
                // console.log({this:this.x + this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize,before:this.before.x - this.before.getWidth() / 2});
                if(this.whatDirection()=='left' && this.x + this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize >= this.before.x - this.before.getWidth() / 2){
                    speed = 0;
                    this.x = this.before.x - this.before.getWidth() / 2 - (this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize)
                }
                if(this.whatDirection()=='right' && this.x - this.getWidth() / 2 - canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize <= this.before.x + this.before.getWidth() / 2){
                    speed = 0;
                    this.x = this.before.x + this.before.getWidth() / 2 + (this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize)
                }
            }
            // take the speed of the more slow
            return speed
        }
    },
    "speed": {
        health: 1,
        speed: 1.5,
        width: 5,
        height: 2,
        baseHeight: canvasInfo.baseLine - 7 * canvasInfo.tileSize,
        color: "#ffd966",
        speedByTime: true,
        bonusPoint(){
            return (this.time - this.time%60)/60
        }
    },
    "speed_range": {
        health: 1,
        speed: 1.5,
        width: 5,
        height: 2,
        baseHeight: canvasInfo.baseLine - 7 * canvasInfo.tileSize,
        color: "#ffff66",
        speedByTime: true,
        getWidthPos(){
            return this.getWidth() + 15 * canvasInfo.tileSize
        },
        constructorplus(x,y, option){
            this.x+= 25 * canvasInfo.tileSize * (this.whatDirection() == 'left'? -1 : 1)
        },
        bonusPoint(){
            return (this.time - this.time%60)/60
        }
    },
    "mage_range": {
        health: 1,
        speed: 1,
        width: 2,
        height: 5,
        color: "#66b3ff",
        beforeCast: 350,
        needCast: 30,
        cast: false,
        draw(){
            this.drawself()
            this.update()
            // for each x time
            if(this.time % this.beforeCast == 0 && !this.cast){
                this.cast = true
                this.time = 0
            }
            if(this.cast && this.time % this.needCast){
                entitiesPlus.push(new entite())
                this.time = 0
            }
        }
    }
};

var patternEnnemie = [
    /* array of array for two direction */
    [
        ["tank","normal","normal","normal",],
        ["tank","normal","normal","normal",]
    ],
    [
        ["","","","","speed_range","speed_range"],
        ["speed_range","","","speed_range","speed_range","",""]
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
        ["normal","normal","normal","normal","normal","normal","normal","normal","normal","",],
        ["","","","","","","","","","speed_range",]
    ],
];

class entite{
    constructor(x,y, option){
        this.time = 0
        this.stun = 0
        this.alive = true
        this.baseHeight = canvasInfo.baseLine
        this.x = x
        this.y = y
        for(var k in option) this[k] = option[k]
        this.constructorplus(x,y,option)
    }
    constructorplus(x,y, option){}
    drawself(){
        fill(this.color)
        rect(this.x - this.getWidth()/2, this.baseHeight - this.getHeight(), this.getWidth(), this.getHeight());
    }
    draw(){
        this.drawself()
        this.update();
    }
    update(){}
    getWidth(){
        return this.width * canvasInfo.tileSize
    }
    getWidthPos(){
        return this.getWidth()
    }
    getHeight(){
        return this.height * canvasInfo.tileSize
    }
}

class heroe extends entite{
    showCombo(){
        textSize(32);
        fill(255);
        stroke(0);
        text("+ " + this.combo, this.x - this.getWidth() * (this.combo<10?0.66:0.5), (this.baseHeight - this.height * canvasInfo.tileSize) / 2);
    }
    isCombo(isKilled, enemi){
        canvasInfo.points+= (1) + this.combo
        if(isKilled){
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
        return canvasInfo.tileSize * this.rangeDash + this.getWidth()/2;
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
        this.showRange();
        if(this.combo>1){
            this.showCombo()
        }
        if(canvasInfo.pause) return
        this.detect.left = false;
        this.detect.right = false;
        if(this.dashAttack !== false){ // si le heros est en train de dash
            var pos = createVector(this.x,this.y)
            var listEnemies = (this.dashAttack == "right"? rightEnemies: leftEnemies);
            let enemiToHit = getNearest(listEnemies,pos);
            this.speed+= (this.speed * 1.3) * canvasInfo.acceleration;
            if(this.speed > this.maxSpeed)
                this.speed = this.maxSpeed
            var maxDist = this.x - enemiToHit.x;
            if(maxDist<0) maxDist = maxDist * -1;
            maxDist = maxDist - this.range - enemiToHit.getWidth()/2 - this.getWidth()/2
            if(maxDist < 0) maxDist = 0 // backDash isn't possibru
            if(this.speed > maxDist) this.speed = maxDist; // cannot go futher than the ennemi
            if(this.speed == 0){ // if can hit the enemi
                let isKilled = !enemiToHit.hit()
                this.dashAttack = false;
                this.speed = 0.2;
                this.isCombo(isKilled, enemiToHit)
            }else{
                let speed = this.speed;
                if(this.dashAttack == "right") speed = speed * -1;
                moveAll(speed);
            }
        }
        // si le heros detecte un ennemi à porté
        var list = getInRange(this.x,this.y,this.getRange(),rightEnemies);
        if(list.length > 0)
            this.detect.right = true;
        var list = getInRange(this.x,this.y,this.getRange(),leftEnemies);
        if(list.length > 0)
            this.detect.left = true;
    }
}

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
        let speed = this.speed;
        if(this.speedByTime){
            speed = speed * (1 + (this.time%20)/20);
            this.time++;
        }
        if(this.before){
            // console.log({this:this.x + this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize,before:this.before.x - this.before.getWidth() / 2});
            if(this.whatDirection()=='left' && this.x + this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize >= this.before.x - this.before.getWidth() / 2){
                speed = 0;
                this.x = this.before.x - this.before.getWidth() / 2 - (this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize)
            }
            if(this.whatDirection()=='right' && this.x - this.getWidth() / 2 - canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize <= this.before.x + this.before.getWidth() / 2){
                speed = 0;
                this.x = this.before.x + this.before.getWidth() / 2 + (this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize)
            }
        }
        // take the speed of the more slow closer to the hero
        return speed
    }
    update(){
        this.showHealtBar()
        if(this.before && false){
            // distance from me and ennemi before if exist
            fill(255);
            rect(this.x < heroes.x? this.x + this.getWidth() / 2 : this.x - this.getWidth() / 2 - 5,this.y,canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize,5);
        }
        if(canvasInfo.pause) return // not update if game is pause
        if(this.stun > 0){
            this.stun -= 1 * canvasInfo.acceleration;
            return;
        }
        // cannot bypass the hero
        let hero_mid_witdh = heroes.getWidth() / 2
        let my_mid_witdh = this.getWidth() / 2

        // move to the hero
        let changePosition = this.getSpeed() * canvasInfo.acceleration;
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
        let height = 5;
        let width = 20;
        var y = canvasInfo.baseLine + 15
        for(let i = 1; i <= this.health; i++){
            y+= 2 + height
            if(this.whatDirection()=='left') canvasInfo.color.left(true)
            else canvasInfo.color.right(true);
            rect(this.x - width/2, y, width, height)
        }
    }
    getWidth(){
        return this.width * canvasInfo.tileSize
    }
    hit(){
        this.stun += 20;
        this.health--;
        if(this.health <= 0)
            this.kill();
        return this.alive
    }
    kill(){
        this.alive = false
        if(this.x > heroes.x){
            rightEnemies.shift();
            if(rightEnemies.length>0)
                delete rightEnemies[0].before
        }else{
            leftEnemies.shift();
            if(leftEnemies.length>0)
                delete leftEnemies[0].before
        }
        canvasInfo.kill++;
    }
}

// start creation
function setup() {
    createCanvas(canvasInfo.width, canvasInfo.height);
    heroes = new heroe((canvasInfo.width - defaultHero.width) / 2, canvasInfo.baseLine, defaultHero);

    // controller heroe
    document.addEventListener('contextmenu', RightClicked);
    document.onkeydown = logKey;
}

var tab_fps = []

function showMeFPS(){
    let fps = frameRate();
    tab_fps.push(fps)
    if(tab_fps.length > 60)
        tab_fps.shift()
    let total_fps = tab_fps.reduce(function(prev,curr,tab){
        return prev + curr;
    }) / tab_fps.length
    fill(255);
    stroke(0);
    text("FPS: " + fps.toFixed(0), 10, 20);
    text("avg FPS: " + total_fps.toFixed(0), 10, 10);
}

// each time
function draw() {
    clear();
    
    if(canvasInfo.time ==0){ // game doesn't start
        showControl();
    }
    if(canvasInfo.time > 0 && rightEnemies.length == 0 && leftEnemies.length ==0){
        spawn(); // respawn if game is in progress and after all enemies are killed
    }
    // show the line bottom
    strokeWeight(1)
    fill(255)
    rect(0, canvasInfo.baseLine, canvasInfo.width, 2);

    // game updater
    rightEnemies.forEach(function(enemi){
        enemi.update();
        enemi.draw();
    });
    leftEnemies.forEach(function(enemi){
        enemi.update();
        enemi.draw();
    });
    heroes.draw();

    if(!canvasInfo.pause) canvasInfo.time++;
    // showMeFPS();
}

function startNewGame(){
    if(!canvasInfo.ready) return
    canvasInfo.ready = false;
    heroes.actif = true
    canvasInfo.pause = false
    canvasInfo.acceleration = canvasInfo.baseAcceleration
    spawn();
}

// create ennemy
function spawn(){
    canvasInfo.acceleration+=0.1;
    var left = 0;
    var right = canvasInfo.width;
    let random = canvasInfo.lastPattern
    while(random == canvasInfo.lastPattern && patternEnnemie.length>1 || random<0){ // not 2 times the same pattern or 1 patern availlable (test)
        random = (Math.random() * patternEnnemie.length);
        random-=random%1;
    }
    canvasInfo.lastPattern = random;
    let dir = Math.random() < 0.5 ? "left" : "right";
    for(let i = 0; i < patternEnnemie[random][0].length; i++){
        for(let j = 0;j <= 1;j++){
            let x = dir == "left" && j==0 || dir == "right" && j==1 ? left : right
            let maxDist = 0
            if(patternEnnemie[random][j][i] !== ""){
                let enemi = new enemy(x,canvasInfo.baseLine,typeEnnemie[patternEnnemie[random][j][i]]);
                if(dir == "left" && j==0 || dir == "right" && j==1){
                    if(leftEnemies.length>0)
                        enemi.before = leftEnemies[leftEnemies.length-1];
                    leftEnemies.push(enemi);
                    left-= leftEnemies[leftEnemies.length-1].getWidthPos();
                    if(maxDist != 0) left-= maxDist
                    if(maxDist > left) maxDist = -left
                }
                else{
                    if(rightEnemies.length>0)
                        enemi.before = rightEnemies[rightEnemies.length-1];
                    rightEnemies.push(enemi);
                    right+= rightEnemies[rightEnemies.length-1].getWidthPos();
                    if(maxDist != 0) right= maxDist
                    if(maxDist > left) maxDist = right
                }
            }
        }
        left-= canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize;
        right+= canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize;
    }
}

function moveAll(move){
    for (var i = 0; i < rightEnemies.length; i++) {
        rightEnemies[i].x+=move;
    }
    for (var i = 0; i < leftEnemies.length; i++) {
        leftEnemies[i].x+=move;
    }
}