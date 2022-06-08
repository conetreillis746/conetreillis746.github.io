class Board {
    constructor (){

    }
    start(){

    }
}

class Tower {
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.power = 5;
        this.speed = 1;
        this.level = 1;
        this.exp = 0;
    }

    levelUp(){
        if(this.exp > 70^(this.level+1)){
            this.level++;
        }
    }

    power(){
        return this.power * this.level;
    }
    
    speed(){
        return this.speed * this.level;
    }
}