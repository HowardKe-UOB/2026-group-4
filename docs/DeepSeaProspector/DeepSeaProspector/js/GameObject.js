class GameObject {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.sprite = null; // Reserved for subsequent image loading.
    }

    draw() {
        // subclasses will override this method.
        fill(255);
        circle(this.position.x, this.position.y, 20);
    }
}
