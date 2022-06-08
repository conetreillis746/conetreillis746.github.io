class Tower {
    constructor(col, row) {
        // Display
        this.baseOnTop = true;      // render base over barrel
        this.border = [0, 0, 0];    // border color
        this.color = [0, 0, 0];     // main color
        this.drawLine = true;       // draw line to enemy on attack
        this.follow = true;         // follow target even when not firing
        this.hasBarrel = true;
        this.hasBase = true;
        this.length = 0.7;          // barrel length in tiles
        this.radius = 1;            // radius in tiles
        this.secondary = [0, 0, 0]; // secondary color
        this.weight = 2;            // laser stroke weight
        this.width = 0.3;           // barrel width in tiles

        // Misc
        this.alive = true;
        this.name = 'tower';
        this.sound = null;          // sound to play on fire
        this.title = 'Tower';

        // Position
        this.angle = 0;
        this.gridPos = createVector(col, row);
        this.pos = createVector(col*ts + ts/2, row*ts + ts/2);
        
        // Stats
        this.cooldownMax = 0;
        this.cooldownMin = 0;
        this.cost = 0;
        this.damageMax = 20;
        this.damageMin = 1;
        this.range = 3;
        this.totalCost = 0;
        this.type = 'physical';     // damage type
        this.upgrades = [];

        this.level = 1;
        this.exp = 0;
    }

    // Adjust angle to point towards pixel position
    aim(x, y) {
        this.angle = atan2(y - this.pos.y, x - this.pos.x);
    }

    // Deal damage to enemy
    attack(e) {
        var damage = this.getAttackDamage();
        damage = e.dealDamage(damage, this.type); // modification de damage avec les forces et faiblesses de l'ennemie
        if (!muteSounds && sounds.hasOwnProperty(this.sound)) {
            sounds[this.sound].play();
        }
        this.onHit(e, damage);
    }

    getAttackDamage(){
        var damage = random(this.damageMin, this.damageMax);
        damage+= damage * 0.01 * (this.level - 1);
        return damage;
    }

    // Check if cooldown is completed
    canFire() {
        return this.cd === 0;
    }

    draw() {
        // Draw turret base
        if (this.hasBase && !this.baseOnTop) this.drawBase();
        // Draw barrel
        if (this.hasBarrel) {
            push();
            translate(this.pos.x, this.pos.y);
            rotate(this.angle);
            this.drawBarrel();
            pop();
        }
        // Draw turret base
        if (this.hasBase && this.baseOnTop) this.drawBase();
        this.drawCoolDown();
    }

    // Draw barrel of tower (moveable part)
    drawBarrel() {
        stroke(this.border);
        fill(this.secondary);
        rect(0, -this.width * ts / 2, this.length * ts, this.width * ts);
    }

    // Draw base of tower (stationary part)
    drawBase() {
        stroke(this.border);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.radius * ts, this.radius * ts);
    }

    // Returns damage range
    getDamage() {
        var min = this.damageMin + this.damageMin * 0.01 * (this.level - 1);
        var max = this.damageMax + this.damageMax * 0.01 * (this.level - 1);
        min = Number.parseFloat(min).toFixed(max>100 || min === 0 ? 1 : 3);
        max = Number.parseFloat(max).toFixed(max>100 || min === 0 ? 1 : 3);
        return rangeText(min , max);
    }

    // Returns average cooldown in seconds
    getCooldown() {
        return (this.cooldownMin + this.cooldownMax) / 120;
    }

    kill() {
        this.alive = false;
    }

    isDead() {
        return !this.alive;
    }

    // Functionality once entity has been targeted
    onAim(e) {
        if (this.canFire() || this.follow) this.aim(e.pos.x, e.pos.y);
        if (stopFiring) return;
        if (!this.canFire()) return;
        this.resetCooldown();
        this.attack(e);
        // Draw line to target
        if (!this.drawLine) return;
        stroke(this.color);
        strokeWeight(this.weight);
        line(this.pos.x, this.pos.y, e.pos.x, e.pos.y);
        strokeWeight(1);
    }

    onCreate() {
        this.cd = 0;                // current cooldown left
        this.maxcd = 0;             // current max cooldown
    }

    onHit(e, damage) {
        this.lootExp(damage);
    }

    lootExp(damage){
        this.exp = Number.parseFloat(Number.parseFloat(this.exp) + damage * 5) ;
        if(this.expNextLevel() < this.exp){
            this.exp -= Number.parseFloat(this.expNextLevel());
            if(this.exp < 1) this.exp = 0;
            this.level++;
        }
    }

    expNextLevel(){
        return (this.level * 8 - 4) * (50 + this.cost);
    }

    getExperience(){
        var exp = Number.parseFloat(this.exp).toFixed(1);
        var nextLevel = this.expNextLevel();
        if(exp > 1000000) exp = Number.parseFloat(exp/1000000).toFixed(1) + 'M';
        else if(exp > 1000) exp = Number.parseFloat(exp/1000).toFixed(1) + 'k';
        if(nextLevel > 1000000) nextLevel = Number.parseFloat(nextLevel/1000000).toFixed(1) + 'M';
        else if(nextLevel > 1000) nextLevel = Number.parseFloat(nextLevel/1000).toFixed(1) + 'k';
        return '<span class="border-bottom:1px solid black">' + exp + '</span><br><span>' + nextLevel + '</span>';
    }

    getRange(){
        return this.range + this.range * 0.01 * (this.level - 1);
    }

    resetCooldown() {
        var cooldown = round(random(this.cooldownMin, this.cooldownMax));
        this.cd = cooldown;
        this.maxcd = cooldown;
    }
    
    // Draw health bar
    drawCoolDown() {
        var percent = this.cd / this.maxcd;
        if (percent === 0) return;
        
        push();
        translate(this.pos.x, this.pos.y);

        stroke(255);
        fill(207, 0, 15);
        var edge = 0.7 * ts / 2;
        var width = floor(edge * percent * 2);
        var top = 0.2 * ts;
        var height = 0.15 * ts;
        rect(-edge, top, edge * percent * 2, height);

        pop();
    }

    // Sell price
    sellPrice() {
        return floor(this.totalCost * sellConst);
    }

    // Target correct enemy
    target(entities) {
        entities = this.visible(entities);
        if (entities.length === 0) return;
        var t = getTaunting(entities);
        if (t.length > 0) entities = t;
        var e = getFirst(entities);
        if (typeof e === 'undefined') return;
        this.onAim(e);
    }

    update() {
        if (this.cd > 0) this.cd--;
    }

    // Use template to set attributes
    upgrade(template) {
        template = typeof template === 'undefined' ? {} : template;
        var keys = Object.keys(template);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            this[key] = template[key];
        }
        if (template.cost) this.totalCost += template.cost;
    }

    // Returns array of visible entities out of passed array
    visible(entities) {
        return getInRange(this.pos.x, this.pos.y, this.getRange(), entities);
    }
}
