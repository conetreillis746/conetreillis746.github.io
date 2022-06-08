function getInRange(cx, cy, radius, entities) {
    var results = [];
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        if (insideCircle(e.pos.x, e.pos.y, cx, cy, (radius + 1) * ts)) {
            results.push(e);
        }
    }
    return results;
}