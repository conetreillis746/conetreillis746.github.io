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
        this.div.popupContainer.style.visibility = "visible"
        this.div.popupContainer.style.opacity = "1"
    }

    hidePopup() {
        this.div.popupContainer.style.visibility = "hidden"
        this.div.popupContainer.style.opacity = "0"
    }
}

function insideCircle(x, y, cx, cy, r) {
    return sq(x - cx) + sq(y - cy) < sq(r)
}

function getInRange(cx, cy, radius, entities) {
    let results = []
    let e
    for (let i = 0; i < entities.length; i++) {
        e = entities[i]
        if (insideCircle(e.x, e.y, cx, cy, radius + 1 + e.getWidth() / 2)) {
            results.push(e)
        }
    }
    return results
}

function getNearest(entities, pos, ignore) {
    let lowestDist = 10000
    let chosen = entities[0]
    for (let i = 0; i < entities.length; i++) {
        let e = entities[i]
        if (typeof ignore !== 'undefined' && ignore.includes(e)) continue
        let epos = createVector(e.x,e.y)
        let dist = pos.dist(epos)
        if (dist < lowestDist) {
            lowestDist = dist
            chosen = e
        }
    }
    return chosen
}

// Control
function logKey(e){
    if(canvasInfo.beforeMenu){
        canvasInfo.firstActionUser()
    }
    switch(e.keyCode){
        case 27:
            canvasInfo.pause = true
            canvasInfo.atMenu = true
        case 32:
            // canvasInfo.pause = !canvasInfo.pause
        break
        // How to trigger Dash
        case 37:
            heroes.leftDash()
        break
        case 39:
            heroes.rightDash()
        break
    }
}
// function mouseClicked(event) { // leftClick
//     LeftClicked(event)
// }
function LeftClicked(event) { // leftClick
    heroes.leftDash()
}
function RightClicked(event){
    heroes.rightDash()
}

var listImage = {}
function preload() {
    function resizeImgControl(img, ratio){
        if(ratio == undefined) ratio = 1
        img.resize(img.width * canvasInfo.ratio * ratio, img.height * canvasInfo.ratio * ratio)
    }

    // control
    listImage.keyboard = loadImage('assets/keyboard_icon_selection.png', function(){ // wait img load and do something
        listImage.leftButton = listImage.keyboard.get(4,97,89,89)
        listImage.rightButton = listImage.keyboard.get(194,97,89,89)
        listImage.leftButton.filter(INVERT)
        listImage.rightButton.filter(INVERT)
        listImage.leftButton.height *= 3
        listImage.leftButton.width *= 3
        listImage.rightButton.height *= 3
        listImage.rightButton.width *= 3
        resizeImgControl(listImage.leftButton)
        resizeImgControl(listImage.rightButton)
    })

    listImage.mouseleft = loadImage('assets/mouse-left-button-svgrepo-com.svg', resizeImgControl)
    listImage.mouseright = loadImage('assets/mouse-right-button-svgrepo-com.svg', resizeImgControl)

    listImage.background = loadImage('assets/background.png', resizeImgControl)
    for (const [index, obj] of Object.entries(listImgPlus)) {
        listImage[index] = loadImage('assets/'+index+'.png', img => resizeImgControl(img ,obj.ratio))
    }

    // enemi
    listImage.cloud = loadImage('assets/cloud.png', resizeImgControl)
    listImage.storm = loadImage('assets/storm.png', resizeImgControl)
}

var timestamp = null
const changeImg = 3600 / 2
function showControl(direction){
    let opacity = (timestamp % changeImg) / changeImg * (255 * 2)
    if(opacity > 255) opacity = 255 - opacity % 255

    let leftIcon = null
    let rightIcon = null

    if(timestamp % (changeImg * 2) / changeImg <= 1){
        leftIcon = listImage.leftButton
        rightIcon = listImage.rightButton
    }else{
        leftIcon = listImage.mouseleft
        rightIcon = listImage.mouseright
    }
    let pos = 50 * canvasInfo.ratio
    tint(255,opacity!=undefined && direction == "right" ? 0 : opacity)
    image(leftIcon,pos,pos,leftIcon.width / 2 * canvasInfo.ratio,leftIcon.height / 2 * canvasInfo.ratio)
    tint(255,opacity!=undefined && direction == "left" ? 0 : opacity)
    image(rightIcon,canvasInfo.width - rightIcon.width / 2 * canvasInfo.ratio - pos, pos, rightIcon.width * canvasInfo.ratio / 2, rightIcon.height / 2 * canvasInfo.ratio)
}

function getTimer(x){
    let number = Number.parseInt(x / 100)
    let minutes = (number - number%60)/60
    let secondes = number%60
    if(minutes<10) minutes = '0'+minutes
    if(secondes<10) secondes = '0'+secondes
    return minutes + ':' + secondes
}