class Node{
    pos = null
    isBombe = false
    nbBombe = null
    x = null
    y = null
    td = null
    tabRevealNoBombe = []

    constructor(td,x,y) {
        this.x = x
        this.y = y
        this.pos = y + '/' + x
        this.td = td
        this.td.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;">&nbsp;</div>'
        this.td.setAttribute('x',this.x)
        this.td.setAttribute('y',this.y)
        this.addEventListenerToTd()
    }

    countBombe(){
        if(this.nbBombe === null){
            this.nbBombe = 0
            for(let i=this.y-1;i<=this.y+1;i++){
                if(i<0 || i>=demineur.config.hauteur) continue;
                for(let j=this.x-1;j<=this.x+1;j++){
                    if(j<0 || j>=demineur.config.largeur) continue;
                    if(j!=this.x || i!=this.y){
                        let isBombe = demineur.infoNode[i][j].isBombe
                        this.nbBombe+= (isBombe?1:0)
                    }
                }
            }
        }
        return this.nbBombe
    }

    isSafe(){ // si ce n'est pas une bombe et si aucune des cases qui le touche n'est une bombe
        let isSafe = this.isBombe === false && this.countBombe() == 0
        // console.log(this.pos+ (isSafe?" is safe":" is not safe") + "->Is Bombe" + (this.isBombe?"true":"false") + "->nb bombe " + this.countBombe())
        return isSafe
    }

    addEventListenerToTd(){
        var self = this;
        if(isMobile){
            var timer_keypress = 666;
            this.td.addEventListener("touchstart", function(){
                this.pressTimer = {
                    timer: new Date().getTime(),
                    timeout: window.setTimeout(function(){
                        demineur.questionMark(self.x,self.y);
                    }, timer_keypress, self)
                }
            });
            this.td.addEventListener("touchend", function(ev){
                if(this.pressTimer.timer + timer_keypress > new Date().getTime()){
                    demineur.click(self.x,self.y);
                }
            })
            this.td.addEventListener("contextmenu", function(ev){
                ev.preventDefault();
                return false;
            })
        }else{
            this.td.addEventListener("click", function(){
                demineur.click(self.x,self.y);
            });
            this.td.addEventListener("contextmenu", function(ev){
                ev.preventDefault();
                demineur.questionMark(self.x,self.y);
                return false;
            })
        }
    }

    setBombe(x){
        this.isBombe = x
    }

    reveal(){
        if(this.isBombe){
            this.td.classList = 'reveal isbomb'
        }else{
            let nb = this.countBombe()
            this.td.classList = 'reveal'
            this.td.children[0].innerHTML = (nb > 0 ? nb : "")
        }
    }

    isReveal(){
        return this.td.classList.value.split(' ').indexOf('reveal') !== -1
    }

    revealNoBombe(level){
        let myPos = this.pos;
        if(level == 0) this.tabRevealNoBombe = []
        let pos = this.tabRevealNoBombe.indexOf(myPos)
        this.tabRevealNoBombe.push(myPos) // add node to the checkList
        if(pos !== -1){ // don't recheck the same node
            return;
        }else
        if(this.isSafe()){
            for(let i=(this.y-1);i<=(this.y+1);i++){
                if(i>=demineur.config.hauteur) break;
                if(i<0) continue; // node not in range
                for(let j=(this.x-1);j<=(this.x+1);j++){
                    if(j<0 || j>=demineur.config.largeur) continue; // node not in range
                    if(j!=this.x || i!=this.y && demineur.infoNode[i][j]){
                        demineur.infoNode[i][j].reveal()
                        demineur.infoNode[i][j].revealNoBombe(level+1)
                    }
                }
            }
        }
    }

    questionMark(){
        let questionmark = 'questionmark'
        let notQuestionmark = 'notQuestionmark'

        let listClass = this.td.classList.value.split(' ')
        
        if(this.isReveal()) return;// cannot questionmark if reveal
        toggleClass(this.td,questionmark)
        if(listClass!=''){
            toggleClass(this.td,notQuestionmark)
        }
    }
}

function toggleClass(elem, eclass){
    let toggle = null
    let classList = elem.classList.value.split(' ')

    toggle = classList.indexOf(eclass) === -1
    if(toggle){ // class exist
        classList.push(eclass)
    }else{
        classList = classList.filter(libelle => libelle != eclass)
    }
    elem.classList = classList.join(' ')
    return toggle
}

class Demineur {
    config = {
        hauteur: 10,
        largeur: 10,
        mode: "easy"
    }
    listMode = {
        "easy": {bombe: 10, h: 10, l: 10, color: '#8afd6d'},
        "medium": {bombe: 20, h: 15, l: 20, color: '#c6c8ff'},
        "hard": {bombe: 25, h: 20, l: 35, color: '#db3219'}
    }
    infoNode = []
    buttonMode = null

    timer = null
    divInfoGame = null
    intervalTimer = null
    
    gameStatus = "stop"
    gameTab = null
    nbBombe = null
    popup = null

    pressTimer = null

    constructor() {
        console.log("test");
        this.popup = new Popup()
        
        function disableHover() {
            document.body.classList.remove('hasHover')
        }
        document.body.classList.add('hasHover')
        document.addEventListener('touchstart', disableHover, true)
    }

    setSize(h,l){
        var tmp = Math.pow(h, 2) + Math.pow(l, 2)
        if(window.innerHeight > window.innerWidth){
            console.dir((window.innerHeight / window.innerWidth))
            h = tmp / (window.innerHeight / window.innerWidth)
            l = tmp - h
        }else{
            console.dir((window.innerWidth / window.innerHeight))
            l = tmp / (window.innerWidth / window.innerHeight)
            h = tmp - l
        }
        h = Math.round(Math.sqrt(h))
        l = Math.round(Math.sqrt(l) + h%1)
        this.config.hauteur = h
        this.config.largeur = l
    }

    setZone(id){
        let elem = document.getElementById(id)
        if(elem){
            this.div = elem
            demineur.createZone()
        }else
            throw('Veuillez rensiegné un id existant')
    }

    getTimer(){
        let number = Number.parseInt(this.timer)
        let minutes = (number - number%60)/60
        let secondes = number%60
        if(minutes<10) minutes = '0'+minutes
        if(secondes<10) secondes = '0'+secondes
        return minutes + ':' + secondes
    }

    chronometre(self) {
        if(self.gameStatus == 'start'){
            self.divInfoGame.style['font-size'] = '30px';
            self.divInfoGame.innerText = self.getTimer() + ' - Bombe : ' + self.nbBombe
            self.timer++
        }
    }

    createButton(){
        let td
        this.div.innerHTML = ''
        let tableButtons = document.createElement('table')
        tableButtons.classList = 'tableButtons'
        let rowButtons = document.createElement('tr')
        
        this.buttonMode = document.createElement('button')
        this.buttonMode.classList = 'ucfirst'
        this.buttonMode.addEventListener("click", () => {demineur.changeMode()})

        let buttonReset = document.createElement('button')
        buttonReset.classList = 'ucfirst'
        buttonReset.innerHTML = 'Reset'
        buttonReset.addEventListener("click", () => {demineur.reset()})
        
        this.setMode()

        td = document.createElement('td')
        td.append(this.buttonMode)
        td.append(buttonReset)
        rowButtons.append(td)
        

        td = document.createElement('td')
        this.divInfoGame = document.createElement('div')
        this.divInfoGame.classList = 'timer'
        this.timer = 0
        td.append(this.divInfoGame)
        rowButtons.append(td)
        
        tableButtons.append(rowButtons)
        this.div.append(tableButtons)
    }

    reset(){
        this.stopGame()
        this.createZone()
    }

    createZone (){
        this.createButton()
        
        this.infoNode = []
        this.gameTab = document.createElement('table')
        this.gameTab.classList = 'GameTab '+this.config.mode
        for(let i=0;i<this.config.hauteur;i++){
            let row = document.createElement('tr')
            this.infoNode.push([])
            for(let j=0;j<this.config.largeur;j++){
                let td = document.createElement('td')
                row.append(td)
                this.infoNode[i][j] = new Node(td,j,i)
                this.infoNode[i][j].demineur = this
            }
            this.gameTab.append(row)
        }
        this.div.style['width'] = 'max-content';
        this.div.style['margin'] = 'auto';
        this.div.append(this.gameTab)
    }

    setMode(){
        if(this.gameTab)
            this.gameTab.classList = 'GameTab '+this.config.mode
        this.buttonMode.innerHTML = this.config.mode
        this.buttonMode.style.backgroundColor = this.listMode[this.config.mode].color
        this.setSize(this.listMode[this.config.mode].h,this.listMode[this.config.mode].l)
    }
    
    changeMode(){
        this.stopGame()
        let keys = Object.keys(this.listMode)
        let key = keys.indexOf(this.config.mode)
        if(keys.length - 1 == key) key = 0
        else key++
        this.config.mode = keys[key]

        this.createZone()
    }

    ratioBomb (){
        return this.listMode[this.config.mode].bombe / 100
    }

    startGame (){
        this.gameStatus = 'start'
        this.createZone()
        this.nbBombe = 0
        // launches the bomb
        let ratio = this.ratioBomb()
        for(let i=0;i<this.config.hauteur;i++){
            for(let j=0;j<this.config.largeur;j++){
                let rand = Math.random()
                let isBombe = rand < ratio
                if(isBombe){
                    this.nbBombe += 1
                    this.infoNode[i][j].setBombe(isBombe)
                }
            }
        }
        if(this.nbBombe == 0){
            // console.log("No Bombe Luls!");
            return this.startGame()
        }
        if(this.intervalTimer == null)
            this.intervalTimer = setInterval(this.chronometre, 1000, this)
        this.chronometre(this)
    }

    click(x,y){
        if(this.gameStatus == "stop"){
            this.startGame()
            while(!this.infoNode[y][x].isSafe()){
                // console.log("Première touche pas fun!");
                this.startGame()
            }
            // console.log("is Good")
        }
        if(this.gameStatus != "start") return
        let elem = this.infoNode[y][x]
        elem.reveal()
        if(elem.isBombe){
            this.stopGame()
            this.showProgress('Vous avez Perdu')
        }else{
            elem.revealNoBombe(0)
            if(this.isWin()){
                this.stopGame()
                this.showProgress('C\'est gagné !')
            }
        }
    }

    stopGame(){
        this.gameStatus = "stop"
        clearInterval(this.intervalTimer)
        this.intervalTimer = null
    }

    questionMark(x,y){
        if(this.gameStatus != "start") return
        let elem = this.infoNode[y][x]
        elem.questionMark()
    }

    nbDiscover(){
        let nb_cover = 0
        for(let i=0;i<this.config.hauteur;i++){
            for(let j=0;j<this.config.largeur;j++){
                nb_cover+= !this.infoNode[i][j].isBombe && this.infoNode[i][j].isReveal() ? 1 : 0
            }
        }
        return nb_cover
    }

    isWin(){
        let isUndercover = false
        for(let i=0;i<this.config.hauteur;i++){
            for(let j=0;j<this.config.largeur;j++){
                isUndercover = !this.infoNode[i][j].isBombe && !this.infoNode[i][j].isReveal() || isUndercover
            }
        }
        return !isUndercover
    }

    showProgress(titre){
        this.popup.setTitle(titre)

        let nbTuile = (this.config.hauteur * this.config.largeur) - this.nbBombe

        let percentDiscover = Number.parseInt(this.nbDiscover() / nbTuile * 100)

        let tab = [
            ['Progression', {style:'font-size:2em', html: percentDiscover}],
            ['Temps', {style:'font-size:2em', html: this.getTimer()}]
        ]

        let tr = [[],[]]
        tab.forEach(function(row){
            row.forEach(function(value,index){
                if(value.html == undefined){
                    tr[index]+= "<td>"+value+"</td>"
                }else{
                    tr[index]+= "<td style='"+value.style+"'>"+value.html+"</td>"
                }
            })
        })

        let element = '<div style="text-align: center;width:100%"><table style="width:100%"><tr>'+tr[0]+'</tr><tr>'+tr[1]+'</tr></table><button id="buttonRetry">Reessayer</button></div>'
        
        let contenu = document.createElement('div')

        this.popup.setContent(contenu)

        contenu.outerHTML = element

        this.popup.showPopup()

        document.getElementById('buttonRetry').addEventListener('click',function(){
            demineur.createZone()
            demineur.popup.hidePopup()
        })
    }
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