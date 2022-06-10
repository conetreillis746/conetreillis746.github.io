// info sur le canvas
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
    acceleration: 1,
    paddingEntitiesEnemies: 0.5,
    loose: function(){
        canvasInfo.pause = true;
        canvasInfo.showProgress('Vous avez Perdu')
    },
    win: function(){
        canvasInfo.pause = true;
        canvasInfo.showProgress('C\'est gagné !')
    },
    showProgress(titre){
        popup.setTitle(titre)

        let percentDiscover = 0

        let tab = [
            ['Kill', {style:'font-size:2em', html: canvasInfo.kill}],
            ['Temps', {style:'font-size:2em', html: getTimer(canvasInfo.time)}]
        ]

        let tr = [[],[]]
        tab.forEach(function(row){
            row.forEach(function(value,index){
                if(value.html == undefined){
                    tr[index]+= "<td width='"+Math.round(1/row.length * 100)+"%'>"+value+"</td>"
                }else{
                    tr[index]+= "<td width='"+Math.round(1/row.length * 100)+"%' style='"+value.style+"'>"+value.html+"</td>"
                }
            })
        })

        let element = '<div style="text-align: center;width:100%"><table style="width:100%"><tr>'+tr[0]+'</tr><tr>'+tr[1]+'</tr></table><button id="buttonRetry">Reessayer</button></div>'
        
        let contenu = document.createElement('div')

        popup.setContent(contenu)

        contenu.outerHTML = element

        popup.showPopup()

        // reset game
        rightEnemies = [];
        leftEnemies = [];
        heroes.reset()
        canvasInfo.reset();
        document.getElementById('buttonRetry').addEventListener('click',function(e){
            e.preventDefault();
            popup.hidePopup()
            window.setTimeout(function(){
                canvasInfo.ready = true
            },10);
        })
    },
    time: 0,
    kill: 0,
    pause: true,
    reset: function(){
        canvasInfo.kill = 0;
        canvasInfo.acceleration = 1;
        canvasInfo.time = 0;
        canvasInfo.pause = true;
    }
}
canvasInfo.baseLine = canvasInfo.height - 50;

// stockage du hero
var heroes = null;
const defaultHero = {
    actif: false,
    range: 2 * canvasInfo.tileSize,
    rangeDash: 15,
    width: 3,
    height: 10,
    dashAttack: false,
    color:255,
    detect: {
        left: false,
        right: false
    },
    maxSpeed:10,
    speed:0.2
};

// liste des enemies
var leftEnemies = [];
var rightEnemies = [];

// type d'ennemie
var typeEnnemie = {
    "normal": {
        health: 1,
        speed: 1,
        width: 3,
        height: 10,
        color: "#53ca77"
    },
    "tank": {
        health: 3,
        speed: 0.5,
        width: 5,
        height: 8,
        stopAtMax: true,
        color: "#d7f250",
        getSpeed(){
            let speed = this.speed;
            // console.log(" range - => " + (heroes.x - heroes.getRange()) + " / " + (heroes.x + heroes.getRange()) + " = > actual x : " + this.x + (heroes.x - heroes.getRange() < this.x ? "true" : "false") + "-" + (heroes.x + heroes.getRange() > this.x ? "true" : "false"));
            if(heroes.x - heroes.getRange() < this.x && heroes.x + heroes.getRange() > this.x)
                speed = 0;
            if(this.before && this.before.alive && this.before.getSpeed() < speed){
                speed = this.before.getSpeed()
            }
            // take the speed of the more slow
            return speed
        }
    },

};

var patternEnnemie = [
    /* array for two direction */
    /* array for two direction */
    [
        ["tank","normal","normal","normal",],
        ["tank","normal","normal","normal",]
    ],
    // [
    //     ["normal","normal","normal",],
    //     ["normal","normal","normal",]
    // ],
    // [
    //     ["normal","tank","normal","normal",],
    //     ["normal","tank","normal","normal",]
    // ],
];

// class
class entite{
    constructor(x,y, option){
        this.stun = 0;
        this.alive = true
        this.x = x
        this.y = y
        for(var k in option) this[k] = option[k];
        this.constructorplus(x,y,option);
    }
    constructorplus(x,y, option){}
    drawself(){
        fill(this.color)
        rect(this.x - this.getWidth()/2, canvasInfo.baseLine - this.getHeight(), this.getWidth(), this.getHeight());
    }
    draw(){
        this.drawself()
        this.update();
    }
    update(){}
    getWidth(){
        return this.width * canvasInfo.tileSize
    }
    getHeight(){
        return this.height * canvasInfo.tileSize
    }
}

class heroe extends entite{
    draw(){
        this.drawself()
        this.showRange()
    }
    showRange(){
        let height = 5;
        canvasInfo.color.right(this.dashAttack == "right" || this.detect.right);
        rect(this.x, canvasInfo.baseLine + 5, this.getRange(), height);
        canvasInfo.color.left(this.dashAttack == "left" || this.detect.left);
        rect(this.x - this.getRange(), canvasInfo.baseLine + 5, this.getRange(), height);
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
        if(this.detect.right) this.dashAttack = "right"
    }
    leftDash(){
        if(canvasInfo.time == 0 && rightEnemies.length==0 && leftEnemies.length==0){
            startNewGame() // if no game start
            return
        }
        if(this.detect.left) this.dashAttack = "left"
    }
    update(){
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
                enemiToHit.hit();
                this.dashAttack = false;
                this.speed = 0.2;
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
    getSpeed(){
        let speed = this.speed;
        // if(this.before && this.before.getSpeed() < this.speed){
        //     speed = this.before.getSpeed()
        // }
        if(this.before){
            // console.log({this:this.x + this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize,before:this.before.x - this.before.getWidth() / 2});
            if(this.x < heroes.x && this.x + this.getWidth() / 2 + canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize >= this.before.x - this.before.getWidth() / 2)
                speed = 0;
            if(this.x > heroes.x && this.x - this.getWidth() / 2 - canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize <= this.before.x + this.before.getWidth() / 2)
                speed = 0;
        }
        // take the speed of the more slow closer to the hero
        return speed
    }
    update(){
        this.showHealtBar()
        if(this.before && false){
            // distance from me and ennemi closer to the hero before
            fill(255);
            rect(this.x < heroes.x? this.x + this.getWidth() / 2 : this.x - this.getWidth() / 2 - 5,this.y,canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize,5);
        }
        if(canvasInfo.pause) return // not update if game is pause
        if(this.stun > 0){
            this.stun--;
            return;
        }
        let speed = this.getSpeed();
        // move to the hero
        let changePosition = speed * canvasInfo.acceleration;
        if(this.x < heroes.x){
            this.x += changePosition
        }
        if(this.x > heroes.x){
            this.x -= changePosition
        }
        // cannot bypass the hero
        let hero_mid_witdh = heroes.getWidth() / 2
        let my_mid_witdh = this.getWidth() / 2

        // si enemy x + enemy width < heros x - hero width
        if(this.x < heroes.x && this.x + my_mid_witdh > heroes.x - hero_mid_witdh){
            canvasInfo.loose()
        }
        if(this.x > heroes.x && this.x - my_mid_witdh < heroes.x + hero_mid_witdh){
            canvasInfo.loose()
        }
    }
    showHealtBar(){
        let height = 5;
        let width = 20;
        var y = canvasInfo.baseLine + 15
        for(let i = 1; i <= this.health; i++){
            y+=2+height
            if(this.x > heroes.x) canvasInfo.color.right(true)
            else canvasInfo.color.left(true);
            rect(this.x - width/2, y, width, height)
        }
    }
    getWidth(){
        return this.width * canvasInfo.tileSize
    }
    hit(){
        this.stun = 20;
        this.health--;
        if(this.health <= 0)
            this.kill();
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

// each time
function draw() {
    clear();
    if(canvasInfo.time ==0){
        showControl();
    }
    if(canvasInfo.time > 0 && rightEnemies.length == 0 && leftEnemies.length ==0){
        spawn(); // respawn if game is in progress and after all enemies are killed
    }
    heroes.draw();
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
    heroes.update();

    if(!canvasInfo.pause) canvasInfo.time++;
}

function startNewGame(){
    if(!canvasInfo.ready) return
    canvasInfo.ready = false;
    heroes.actif = true
    canvasInfo.pause = false
    spawn();
}

// create ennemy
function spawn(){
    canvasInfo.acceleration+=0.1;
    var left = 0;
    var right = canvasInfo.width;
    let random = (Math.random() * patternEnnemie.length);
    random-=random%1;
    let dir = Math.random() < 0.5 ? "left" : "right";
    for(let i = 0; i < patternEnnemie[random][0].length; i++){
        for(let j = 0;j <= 1;j++){
            let x = dir == "left" && j==0 || dir == "right" && j==1 ? left : right
            if(patternEnnemie[random][j][i] !== ""){
                let enemi = new enemy(x,canvasInfo.baseLine,typeEnnemie[patternEnnemie[random][j][i]]);
                if(dir == "left" && j==0 || dir == "right" && j==1){
                    if(leftEnemies.length>0)
                        enemi.before = leftEnemies[leftEnemies.length-1];
                    leftEnemies.push(enemi);
                    left-= leftEnemies[leftEnemies.length-1].getWidth();
                }
                else{
                    if(rightEnemies.length>0)
                        enemi.before = rightEnemies[rightEnemies.length-1];
                    rightEnemies.push(enemi);
                    right+= rightEnemies[rightEnemies.length-1].getWidth();
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