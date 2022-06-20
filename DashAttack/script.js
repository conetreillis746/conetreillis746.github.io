/*
    VARIABLES
*/
var leftEnemies = []
var rightEnemies = []
var entitiesPlus = []

var heroes = null
var mapInfo = {
    map: null,
    x: 0
}

// start creation
function setup() {
    createCanvas(canvasInfo.width, canvasInfo.height)
    heroes = new heroe((canvasInfo.width - defaultHero.width) / 2, canvasInfo.baseLine, defaultHero)

    // controller heroe
    document.addEventListener('mousedown', function(e){
        if(e.buttons==1){
            LeftClicked()
        }
        if(e.buttons==2){
            RightClicked()
        }
    })
    document.addEventListener('contextmenu', function(e){
        e.preventDefault()
        return false
    })
    document.onkeydown = logKey

    mapInfo.map = listImage.background.get()
    mapInfo.map.resize(canvasInfo.width, canvasInfo.height)
}

var tab_fps = []
function showMeFPS(){
    let fps = frameRate()
    tab_fps.push(fps)
    if(tab_fps.length > 60)
        tab_fps.shift()
    let total_fps = tab_fps.reduce(function(prev,curr,tab){
        return prev + curr
    }) / tab_fps.length
    
    textSize(12)
    fill(255)
    stroke(0)
    text("FPS: " + fps.toFixed(0), 10, 30)
    text("avg FPS: " + total_fps.toFixed(0), 10, 15)
}

// each time
function draw() {
    clear() // clear the canvas

    tint(255)
    mapInfo.x = (mapInfo.x + canvasInfo.width) % canvasInfo.width
    let mapx = mapInfo.x
    let mapx2 = mapx - canvasInfo.width
    image(mapInfo.map,mapx , 0,canvasInfo.width,canvasInfo.height)
    image(mapInfo.map, mapx2 , 0,canvasInfo.width,canvasInfo.height)

    if(canvasInfo.time ==0){ // game doesn't start
        showControl()
    }
    if(canvasInfo.time > 0 && rightEnemies.length == 0 && leftEnemies.length ==0){
        spawn() // respawn if game is in progress and after all enemies are killed
    }
    // show the line bottom
    // strokeWeight(1)
    // fill(255)
    // rect(0, canvasInfo.baseLine, canvasInfo.width, 2)

    // game updater
    rightEnemies.forEach(function(enemi){
        if(!canvasInfo.pause)enemi.update()
        enemi.draw()
    })
    leftEnemies.forEach(function(enemi){
        if(!canvasInfo.pause)enemi.update()
        enemi.draw()
    })
    entitiesPlus.forEach(function(enemi, index){
        if(!canvasInfo.pause)enemi.update()
        enemi.draw()
        if(!enemi.alive) entitiesPlus.splice(index,1)
    })
    heroes.draw()

    if(!canvasInfo.pause) canvasInfo.time++
    // showMeFPS()
}

function startNewGame(){
    if(!canvasInfo.ready) return
    canvasInfo.ready = false
    heroes.actif = true
    canvasInfo.pause = false
    canvasInfo.acceleration = canvasInfo.baseAcceleration
    spawn()
}

function getTypeEnnemie(libelle){
    var moreAttribute = {
        health:0,
        multhealth: 1,
    }
    while(libelle.indexOf('+') >= 0){
        moreAttribute.health++
        libelle = libelle.replace('+','')
    }
    while(libelle.indexOf('*') >= 0){
        moreAttribute.multhealth++
        libelle = libelle.replace('*','')
    }
    var retour = Object.assign({}, typeEnnemie[libelle])
    retour.health += moreAttribute.health
    retour.health = retour.health * moreAttribute.multhealth
    return retour
}

// create ennemy
function spawn(){
    canvasInfo.acceleration+=0.1
    var left = 0
    var right = canvasInfo.width
    let random = canvasInfo.lastPattern
    while(random == canvasInfo.lastPattern && patternEnnemie.length>1 || random<0){ // not 2 times the same pattern or 1 patern availlable (test)
        random = (Math.random() * patternEnnemie.length)
        random-=random%1
    }
    canvasInfo.lastPattern = random
    let dir = Math.random() < 0.5 ? "left" : "right"
    var tab
    for(let i = 0; i < patternEnnemie[random][0].length; i++){
        for(let j = 0;j <= 1;j++){
            let x = dir == "left" && j==0 || dir == "right" && j==1 ? left : right
            let maxDist = 0
            if(patternEnnemie[random][j][i] !== ""){
                var typeEnemy = getTypeEnnemie(patternEnnemie[random][j][i])
                let enemi = new enemy(x,canvasInfo.baseLine,typeEnemy)
                if(dir == "left" && j==0 || dir == "right" && j==1){
                    if(leftEnemies.length>0)
                        enemi.before = leftEnemies[leftEnemies.length-1]
                    leftEnemies.push(enemi)
                    let addToLeft =leftEnemies[leftEnemies.length-1].getWidthPos()
                    left-= addToLeft
                    if(maxDist < addToLeft) maxDist = addToLeft
                }
                else{
                    if(rightEnemies.length>0)
                        enemi.before = rightEnemies[rightEnemies.length-1]
                    rightEnemies.push(enemi)
                    let addToRight =rightEnemies[rightEnemies.length-1].getWidthPos()
                    right+= addToRight
                    if(maxDist < addToRight) maxDist = addToRight
                }
            }
        }
        left-= canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize
        right+= canvasInfo.paddingEntitiesEnemies * canvasInfo.tileSize

        tab = [
            left * -1,
            right - canvasInfo.width
        ]
        if(tab[0] > tab[1])right = -left + canvasInfo.width
        if(tab[1] > tab[0])left = -(right - canvasInfo.width)
    }
}

// move entites except heroe to 
function moveAll(move){
    for (var i = 0; i < rightEnemies.length; i++) {
        rightEnemies[i].x+=move
    }
    for (var i = 0; i < leftEnemies.length; i++) {
        leftEnemies[i].x+=move
    }
    for (var i = 0; i < entitiesPlus.length; i++) {
        entitiesPlus[i].x+=move
    }
    mapInfo.x+=move
}
