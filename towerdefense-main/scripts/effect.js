class Effect {
    constructor(duration, tower) {
        // Display
        this.color = [0, 0, 0];
        this.tower = tower;
        // Misc
        this.alive = true;
        this.duration = duration;
        this.name = 'status';
    }

    isDead() {
        return !this.alive;
    }

    kill() {
        this.alive = false;
    }

    onEnd(e) {}
    onStart(e) {}
    onTick(e) {}

    update(e) {
        this.onTick(e);
        if (this.duration > 0) this.duration--;
        if (this.duration === 0) {
            this.onEnd(e);
            this.kill();
        }
    }
}
