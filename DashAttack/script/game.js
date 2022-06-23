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
        canvasInfo.showProgress('Your score')
    },
    getTabInfo(info){
        return [
            ['Points', {style:'font-size:2em', html: info.points}],
            ['Kill', {style:'font-size:2em', html: info.kill}],
            ['Wave', {style:'font-size:2em', html: info.wave}],
            ['Time', {style:'font-size:2em', html: getTimer(info.time)}]
        ]
    },
    saveTabInfo(info){
        let string = LZString.compressToBase64(JSON.stringify({
            points: info.points,
            kill: info.kill,
            time: info.time,
            wave: info.wave,
        }));
        localStorage.setItem('bestScoreDashAttack', string);
    },
    bestTabInfo(){
        let info = LZString.decompressFromBase64(localStorage.getItem('bestScoreDashAttack'))
        return info ? JSON.parse(info) : null;
    },
    htmlTableInfo(tab){
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
        return '<table style="width:100%"><tr>'+tr[0]+'</tr><tr>'+tr[1]+'</tr></table>'
    },
    showProgress(titre){
        popup.setTitle(titre)

        let tab = canvasInfo.getTabInfo(canvasInfo)

        let bestTab = canvasInfo.bestTabInfo()
        if(bestTab == null || bestTab.points < canvasInfo.points){
            canvasInfo.saveTabInfo(canvasInfo)
        }

        let table = canvasInfo.htmlTableInfo(tab)
        if(bestTab.points > canvasInfo.points){
            table+= "<div>Last Best Score</div>" + canvasInfo.htmlTableInfo(canvasInfo.getTabInfo(bestTab))
        }
        if(bestTab.points < canvasInfo.points){
            table= "New Best Score" + table
        }
        let element = '<div style="text-align: center;width:100%">'+table+'<button id="buttonRetry">Retry</button></div>'
        
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
    wave: 0,
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
canvasInfo.baseLine = canvasInfo.height - 55