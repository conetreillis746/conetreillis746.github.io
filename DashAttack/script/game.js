var base = window.innerWidth / window.innerHeight

class general{
    ready = true
    width = 800
    height = 400
    tileSize = 10
    color = {
        right: function(directionAttack){
            fill(255, 80, 80, (directionAttack?255:150))
        },
        left: function(directionAttack){
            fill(20, 210, 255, (directionAttack?255:150))
        }
    }
    baseAcceleration = 1
    acceleration = 0
    time = 0
    kill = 0
    points = 0
    wave= 0
    pause = true
    lastPattern = -1

    constructor(){
        if(this.width > window.innerWidth){
            this.width = window.innerWidth - 10
            this.height = this.width / 2
        }
        if(this.height > window.innerHeight){
            this.height = window.innerHeight - 10
            this.width = this.height * 2
        }
        this.ratio = this.width / 800
        this.tileSize = this.ratio * 10
        this.baseLine = this.height - 55 * this.ratio
        this.paddingEntitiesEnemies = 3 * this.tileSize
    }
    endGame(){
        this.pause = true
        this.showProgress('Your score')
    }
    getTabInfo(info){
        return [
            ['Points', {style:'font-size:2em', html: info.points}],
            ['Kill', {style:'font-size:2em', html: info.kill}],
            ['Wave', {style:'font-size:2em', html: info.wave}],
            ['Time', {style:'font-size:2em', html: getTimer(info.time)}]
        ]
    }
    saveTabInfo(info){
        let string = LZString.compressToBase64(JSON.stringify({
            points: info.points,
            kill: info.kill,
            time: info.time,
            wave: info.wave,
        }))
        localStorage.setItem('bestScoreDashAttack', string);
    }
    bestTabInfo(){
        let info = LZString.decompressFromBase64(localStorage.getItem('bestScoreDashAttack'))
        return info ? JSON.parse(info) : null;
    }
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
    }
    showProgress(titre){
        popup.setTitle(titre)

        let tab = this.getTabInfo(this)

        let bestTab = this.bestTabInfo()
        if(bestTab == null || bestTab.points < this.points){
            this.saveTabInfo(this)
        }

        let table = this.htmlTableInfo(tab)
        if(bestTab.points > this.points){
            table+= "<div>Last Best Score</div>" + this.htmlTableInfo(this.getTabInfo(bestTab))
        }
        if(bestTab.points < this.points){
            table= "New Best Score" + table
        }
        let element = '<div style="text-align: center;width:100%">'+table+'<button id="buttonRetry">Retry</button></div>'
        
        let contenu = document.createElement('div')

        popup.setContent(contenu)

        contenu.outerHTML = element

        popup.showPopup()
        var self = this

        document.getElementById('buttonRetry').addEventListener('click',function(e){
            e.preventDefault()
            self.reset()
            popup.hidePopup()
            window.setTimeout(function(){
                this.ready = true
            },10)
        })
    }
    reset(){
        // reset game
        rightEnemies = []
        leftEnemies = []
        entitiesPlus = []
        heroes.reset()

        this.kill = 0
        this.time = 0
        this.wave = 0
        this.pause = true
        this.lastPattern = -1
        canvasInfo.ready = true
    }
}
var canvasInfo = new general()