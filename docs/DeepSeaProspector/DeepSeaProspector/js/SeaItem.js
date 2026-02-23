// Base Ocean Item Class
class SeaItem extends GameObject {
    constructor(x, y, itemName, scoreValue, weight) {
        super(x, y);
        this.itemName = itemName;
        this.scoreValue = scoreValue;
        this.weight = weight; // Determine the pull-back speed.
        this.width = 40;
        this.height = 30;
    }

    update() {}

    draw() {
        rectMode(CENTER);
        rect(this.position.x, this.position.y, this.width, this.height);
        this.drawScoreText();
    }

    drawScoreText() {
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(12);
        text(this.scoreValue, this.position.x, this.position.y);
    }
}

class Fish extends SeaItem {
    constructor(x, y) {
        let val = floor(random(30, 80));
        super(x, y, "Fish", val, 1);
        this.width = 30;
        this.height = 20;

        // Swimming attribute
        this.speed = random(1, 2.5); // Random swimming speed
        this.direction = random() > 0.5 ? 1 : -1; // 1 for right, -1 for left
    }

    swim() {
        // If the fish is not caught by the hook, it will swim
        this.position.x += this.speed * this.direction;

        // Reverse direction after hitting the screen edge.
        if (this.position.x < 30 || this.position.x > width - 30) {
            this.direction *= -1;
        }
    }

    update() {
        this.swim();
    }

    draw() {
        fill(100, 200, 255);

        ellipse(this.position.x, this.position.y, this.width, this.height);

        fill(80, 180, 235);
        let tailX = this.position.x - (this.width / 2) * this.direction;
        triangle(
            tailX,
            this.position.y,
            tailX - 10 * this.direction,
            this.position.y - 10,
            tailX - 10 * this.direction,
            this.position.y + 10,
        );

        this.drawScoreText();
    }
}

class Treasure extends SeaItem {
    constructor(x, y) {
        let val = floor(random(200, 500));
        super(x, y, "Treasure", val, 3.5);
        this.width = 50;
        this.height = 40;
    }

    draw() {
        fill(255, 215, 0);
        rectMode(CENTER);
        rect(this.position.x, this.position.y, this.width, this.height);
        this.drawScoreText();
    }
}

class Junk extends SeaItem {
    constructor(x, y) {
        let val = floor(random(5, 15));
        super(x, y, "Junk", val, 4.5);
        this.width = 35;
        this.height = 35;
    }

    draw() {
        fill(100, 100, 100);
        circle(this.position.x, this.position.y, this.width);

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(10);
        text(this.scoreValue, this.position.x, this.position.y);
    }
}
