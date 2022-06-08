// info sur le canvas
var canvasInfo = {
    width: 800,
    height: 400,
    tileSize: 10,
    color:{
        right: function(directionAttack){
            fill(255, 80, 80, (directionAttack?255:150))
        },
        left: function(directionAttack){
            fill(0, 153, 255, (directionAttack?255:150))
        }
    }
}
canvasInfo.baseLine = canvasInfo.height - 50;

// liste des ennemies
var leftEnnemies = [];
var rightEnnemies = [];

// type d'ennemie
var typeEnnemie = {
    "normal": {
        health: 1,
        speed: 1
    },
    "tank": {
        health: 3,
        speed: 2
    }
};

var patternEnnemie = {

};

// stockage du hero
var heroes = null;
const defaultHero = {
    range : 10,
    width: 2,
    height: 10,
    dashAttack: false,
};

// class
class entite{
    constructor(x,y, option){
        this.x = x
        this.y = y
        for(var k in option) this[k] = option[k];
    }
}

class heroe extends entite{
    draw(){
        fill(255)
        rect(this.x, canvasInfo.baseLine - this.height * canvasInfo.tileSize, this.width * canvasInfo.tileSize, this.height * canvasInfo.tileSize);
        this.showRange()
    }

    showRange(){
        canvasInfo.color.right(this.dashAttack == false || this.dashAttack == "right");
        rect(this.x + this.width * canvasInfo.tileSize, canvasInfo.baseLine + 10, this.getRange(), 10);
        canvasInfo.color.left(this.dashAttack == false || this.dashAttack == "left");
        rect(this.x - this.getRange(), canvasInfo.baseLine + 10, this.getRange(), 10);
    }

    getRange(){
        return canvasInfo.tileSize * this.range;
    }
}

class enemy extends entite{
}

// start creation
function setup() {
    createCanvas(canvasInfo.width, canvasInfo.height);
    heroes = new heroe(canvasInfo.width / 2, canvasInfo.baseLine, defaultHero);

    canvas.addEventListener('contextmenu', RightClicked);
}

// each time
function draw() {
    clear();
    heroes.draw();
    // show the line bottom
    fill(255)
    rect(0, canvasInfo.baseLine, canvasInfo.width, 2);
}

function mouseClicked(event) { // leftClick
    console.log(event);
}

function RightClicked(event){
    event.preventDefault();
    alert('success!');
    return false;
}