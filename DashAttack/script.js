/*
    VARIABLES
*/
var leftEnemies = []
var rightEnemies = []
var entitiesPlus = []
var canvasP5

var heroes = null
var mapInfo = {
    map: null,
    x: 0
}

var canvasInfo = new general()

const defaultHero = {
    combo: 0,
    actif: false,
    range: 6 * canvasInfo.tileSize,
    rangeDash: 15 * canvasInfo.tileSize,
    width: 2.5,
    height: 8,
    dashAttack: false,
    color:255,
    maxSpeed: 20,
    speed: 0.2,
    comboTime:0,
}

var isMobile = false;
(function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))isMobile=true})(navigator.userAgent||navigator.vendor||window.opera,'http://detectmobilebrowser.com/mobile');

// start creation
function setup() {
    canvasP5 = createCanvas(canvasInfo.width, canvasInfo.height)
    heroes = new heroe((canvasInfo.width - defaultHero.width) / 2, canvasInfo.baseLine, defaultHero)

    // controller heroe
    if(isMobile){
        function logInfo(e){
             // event on touch
            if(e.changedTouches[0].clientX - e.target.offsetLeft < 0){
                LeftClicked()
            }else{
                RightClicked()
            }
        }
        canvas.addEventListener('touchstart', logInfo)
        // log('Initialisation.')
    }else{
        document.addEventListener('mousedown', function(e){
             // event on press
            if(e.buttons==1){
                LeftClicked()
            }
            if(e.buttons==2){
                RightClicked()
            }
        })
        document.onkeydown = logKey
    }
    document.addEventListener('contextmenu', function(e){
        e.preventDefault()
        return false
    })

    mapInfo.map = listImage.background.get()
    mapInfo.map.resize(canvasInfo.width, canvasInfo.height)
    canvasP5.mousePressed(canvasInfo.mouseClick)
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
    
    textSize(10)
    fill(255)
    stroke(0)
    text("FPS: " + fps.toFixed(0) + " (~" + total_fps.toFixed(0) + ")", 10, 15)
}

const listImgPlus = {
    "phare": { ratio: 0.33 }
}

function showMap(){
    tint(255)

    push() // background blue
    fill("#6096ff")
    rect(0,0,canvasInfo.width,canvasInfo.height)
    pop()
    let diffMapx
    for (const [index, img] of Object.entries(listImgPlus)) {
        if(img.x == undefined){
            img.x = random(0,canvasInfo.width)
            img.y = canvasInfo.height - listImage[index].height
        }
        diffMapx = canvasInfo.width - img.x + listImage[index].width
        copy(listImage[index], diffMapx, 0, img.x, listImage[index].height, 0, img.y, img.x, listImage[index].height)
        copy(listImage[index], 0, 0, diffMapx, listImage[index].height, img.x, img.y, diffMapx, listImage[index].height)
        if(listImgPlus[index].x < -listImage[index].width) listImgPlus[index].x = canvasInfo.width
    }

    mapInfo.x = (mapInfo.x + canvasInfo.width) % canvasInfo.width
    diffMapx = canvasInfo.width - mapInfo.x

    // use only usefull image => use less ressources : more fps (than use fn image)
    copy(mapInfo.map, diffMapx, 0, mapInfo.x, mapInfo.map.height, 0, 0, mapInfo.x, canvasInfo.height)
    copy(mapInfo.map, 0, 0, diffMapx, mapInfo.map.height, mapInfo.x, 0, diffMapx, canvasInfo.height)
}

// each time
function draw() {
    timestamp = new Date().getTime()
    clear() // clear the canvas

    showMap()

    if(!canvasInfo.atMenu){
        if(canvasInfo.wave <= 2 && canvasInfo.wave > 0){
            showControl(leftEnemies.length > 0 ? "left" : "right")
        }
        if(canvasInfo.time > 0 && rightEnemies.length == 0 && leftEnemies.length ==0){
            canvasInfo.spawn() // respawn if game is in progress and after all enemies are killed
        }
        /* show the line bottom */
        // strokeWeight(1)
        // fill(255)
        // rect(0, canvasInfo.baseLine, canvasInfo.width, 2)
        /* game updater */
        rightEnemies.forEach(function(enemi){
            if(!canvasInfo.pause)enemi.update()
            enemi.draw()
        })
        leftEnemies.forEach(function(enemi){
            if(!canvasInfo.pause)enemi.update()
            enemi.draw()
        })
        heroes.draw()
        entitiesPlus.forEach(function(enemi, index){
            if(!canvasInfo.pause)enemi.update()
            enemi.draw()
            if(!enemi.alive) entitiesPlus.splice(index,1)
        })

        if(!canvasInfo.pause) // don't draw or start music if game paused
            music.draw()
    }
    showWave()

    if(!canvasInfo.pause) canvasInfo.time++
    // showMeFPS()
    test()
    
    canvasInfo.menu()
}

function showWave(){
    if(canvasInfo.newWave + 1500 > timestamp){
        let opacity = (timestamp - canvasInfo.newWave) / 1500 * 255
        let size = 30
        push()
        textSize(size)
        fill(255, 300 - opacity)
        let txt = "Wave " + canvasInfo.wave;
        text("Wave " + canvasInfo.wave, heroes.x - (txt.length * size / 4), canvasInfo.height - heroes.y)
        pop()
    }
}

function test(){
    // width = 5
    // rect(heroes.x , heroes.y , width, width)
    // if(entitiesPlus.length>0){
    //     triangle(heroes.x, heroes.y, entitiesPlus[0].x, entitiesPlus[0].y, entitiesPlus[0].x , heroes.y)
    //     rect(entitiesPlus[0].x , entitiesPlus[0].y , width, width)
    //     rect(entitiesPlus[0].x , heroes.y , width, width)
    // }
}

function getTypeEnnemie(libelle){
    let moreAttribute = {
        health: 0,
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
    let retour = Object.assign({}, typeEnnemie[libelle])
    retour.health += moreAttribute.health
    retour.health = retour.health * moreAttribute.multhealth
    return retour
}

// move entites except heroe to 
function moveAll(move, onlyOneDirection){
    if(onlyOneDirection != undefined){
        if(onlyOneDirection == "right"){
            for (let i = 0; i < rightEnemies.length; i++) {
                rightEnemies[i].x+= move
            }
        }else{
            for (let i = 0; i < leftEnemies.length; i++) {
                leftEnemies[i].x-= move
            }
        }
    }else{
        for (let i = 0; i < rightEnemies.length; i++) {
            rightEnemies[i].x+= move
        }
        for (let i = 0; i < leftEnemies.length; i++) {
            leftEnemies[i].x+= move
        }
        for (let i = 0; i < entitiesPlus.length; i++) {
            entitiesPlus[i].x+= move
        }
        mapInfo.x+= move
        for (const [index, img] of Object.entries(listImgPlus)) {
            img.x+= move / 2
        }
    }
}