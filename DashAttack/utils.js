function insideCircle(x, y, cx, cy, r) {
    return sq(x - cx) + sq(y - cy) < sq(r);
}

function getInRange(cx, cy, radius, entities) {
    var results = [];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        if (insideCircle(e.x, e.y, cx, cy, radius + 1 + e.getWidth() / 2)) {
            results.push(e);
        }
    }
    return results;
}

function getNearest(entities, pos, ignore) {
    var lowestDist = 10000;
    var chosen = entities[0];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        if (typeof ignore !== 'undefined' && ignore.includes(e)) continue;
        var epos = createVector(e.x,e.y)
        var dist = pos.dist(epos);
        if (dist < lowestDist) {
            lowestDist = dist;
            chosen = e;
        }
    }
    return chosen;
}

// Control
function logKey(e){
    switch(e.keyCode){
        case 32:
            canvasInfo.pause = !canvasInfo.pause;
        break;
        // How to trigger Dash
        case 37:
            heroes.leftDash();
        break;
        case 39:
            heroes.rightDash();
        break;
    }
}
function mouseClicked(event) { // leftClick
    heroes.leftDash();
}
function RightClicked(event){
    heroes.rightDash();
    event.preventDefault();
    return false;
}

class Popup{
    div = {}
    constructor(){
        this.div.popupContainer = document.createElement('div')
        this.div.popupContainer.classList = 'popup-container'
        this.div.innerContainer = document.createElement('div')
        this.div.innerContainer.classList = 'inner-container'
        this.div.popupContainer.append(this.div.innerContainer)
        this.div.header = document.createElement('div')
        this.div.header.classList = 'header'
        this.div.innerContainer.append(this.div.header)
        this.div.content = document.createElement('div')
        this.div.content.classList = 'content'
        this.div.innerContainer.append(this.div.content)
        this.div.footer = document.createElement('div')
        this.div.footer.classList = 'footer'
        this.div.innerContainer.append(this.div.footer)

        document.getElementsByTagName('body')[0].append(this.div.popupContainer)
    }

    setTitle(titre){
        this.div.header.innerHTML=titre
    }

    setContent(elem){
        this.div.content.innerHTML = ''
        this.div.content.append(elem)
    }

    showPopup(){
        this.div.popupContainer.style.visibility = "visible";
        this.div.popupContainer.style.opacity = "1";
    }

    hidePopup() {
        this.div.popupContainer.style.visibility = "hidden";
        this.div.popupContainer.style.opacity = "0";
    }
}

let popup = new Popup()

var listImage = {};
function preload() {
    listImage.keyboard = loadImage('assets/keyboard_icon_selection.jpg');
    listImage.mouseleft = loadImage('assets/mouse-left-button-svgrepo-com.svg');
    listImage.mouseright = loadImage('assets/mouse-right-button-svgrepo-com.svg');
}

var timestamp = null
function showControl(){
    timestamp = new Date().getTime()
    var opacity = (timestamp % 3600) / 3600 * (255 * 2)
    if(opacity > 255) opacity = 255 - opacity % 255

    let leftIcon = listImage.keyboard.get(4,97,89,89)
    let rightIcon = listImage.keyboard.get(194,97,89,89)

    if(timestamp % (3600*2) / 3600 <= 1){
        leftIcon = listImage.keyboard.get(4,97,89,89)
        rightIcon = listImage.keyboard.get(194,97,89,89)
        leftIcon.filter(INVERT);
        rightIcon.filter(INVERT);
        leftIcon.height *= 2
        leftIcon.width *= 2
        rightIcon.height *= 2
        rightIcon.width *= 2
    }else{
        leftIcon = listImage.mouseleft
        rightIcon = listImage.mouseright
    }
    tint(opacity)
    leftIcon.loadPixels()
    image(leftIcon,50,50,leftIcon.width / 2,leftIcon.height / 2)
    tint(opacity)
    rightIcon.loadPixels()
    image(rightIcon,canvasInfo.width - rightIcon.width / 2 - 50,50,rightIcon.width / 2,rightIcon.height / 2)
}

function getTimer(x){
    let number = Number.parseInt(x / 100)
    let minutes = (number - number%60)/60
    let secondes = number%60
    if(minutes<10) minutes = '0'+minutes
    if(secondes<10) secondes = '0'+secondes
    return minutes + ':' + secondes
}