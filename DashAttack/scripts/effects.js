function createEffect(duration, template, tower) {
    var e = new Effect(duration, tower);
    // Fill in all keys
    template = typeof template === 'undefined' ? {} : template;
    var keys = Object.keys(template);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        e[key] = template[key];
    }
    return e;
}


var effects = {};


effects.slow = {
    // Display
    color: [68, 108, 179],
    // Misc
    name: 'slow',
    // Methods
    onEnd: function(e) {
        e.speed = this.oldSpeed;
    },
    onStart: function(e) {
        this.oldSpeed = e.speed;
        this.speed = e.speed / 2;
        e.speed = this.speed;
    }
};

effects.poison = {
    // Display
    color: [102, 204, 26],
    // Misc
    name: 'poison',
    // Methods
    onTick: function(e) {
        var damage = (this.tower) ? this.tower.getDamage() : 1;
        e.dealDamage(damage, 'poison');
        if(this.tower)
            this.tower.lootExp(damage);
    }
};

effects.regen = {
    // Display
    color: [210, 82, 127],
    // Misc
    name: 'regen',
    // Methods
    onTick: function(e) {
        if (e.health < e.maxHealth && random() < 0.2) e.health++;
    }
};
