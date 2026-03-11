class SeaItem extends GameObject {
    constructor(x, y, itemName, scoreValue, weight) {
        super(x, y);
        this.itemName = itemName;
        this.scoreValue = scoreValue;
        this.weight = weight;
        this.width = 40;
        this.height = 30;
        this.canBeCaught = true;
    }

    update() {}

    draw() {
        rectMode(CENTER);
        fill(200);
        rect(this.position.x, this.position.y, this.width, this.height);
        this.drawScoreText();
    }

    drawScoreText() {}
}

class BaseFish extends SeaItem {
    constructor(x, y, itemName, scoreValue, weight, size) {
        super(x, y, itemName, scoreValue, weight);
        this.width = size;
        this.height = size;
        this.speed = random(1, 2.5);
        this.direction = random() > 0.5 ? 1 : -1;
    }

    swim() {
        this.position.x += this.speed * this.direction;

        if (this.position.x < this.width / 2 && this.direction === -1) {
            this.direction = 1;
        } else if (
            this.position.x > width - this.width / 2 &&
            this.direction === 1
        ) {
            this.direction = -1;
        }
    }

    update() {
        this.swim();
    }
}

class SmallFish extends BaseFish {
    constructor(x, y) {
        let randomSize = random(30, 70);
        // Score nerfed: 10–50 (was 30–150), keeps it a "filler" item
        let calculatedScore = floor(map(randomSize, 30, 70, 10, 50));
        let calculatedWeight = map(randomSize, 30, 70, 1, 3);

        super(
            x,
            y,
            "Small Fish",
            calculatedScore,
            calculatedWeight,
            randomSize,
        );

        this.speed = random(1.2, 1.6);
        this.fishIndex = floor(random(imgSmallFishes.length)); // 0–42 → fish1–fish43
        this.frames = imgSmallFishes[this.fishIndex];
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        scale(-this.direction, 1);
        imageMode(CENTER);

        if (this.frames && this.frames.length === 2) {
            let frameIndex = floor(frameCount / 15) % 2;
            image(this.frames[frameIndex], 0, 0, this.width, this.height);
        }
        pop();
        this.drawScoreText();
    }
}

class BigFish extends BaseFish {
    constructor(x, y) {
        let randomSize = random(90, 160);
        // Score nerfed: 150–350 (was 250–600), high-risk high-reward
        let calculatedScore = floor(map(randomSize, 90, 160, 150, 350));
        let calculatedWeight = map(randomSize, 90, 160, 5, 9);

        super(x, y, "Big Fish", calculatedScore, calculatedWeight, randomSize);

        this.speed = random(0.3, 0.8);
        this.fishIndex = floor(random(imgBigFishes.length)); // 0–20 → fish44–fish64
        this.frames = imgBigFishes[this.fishIndex];
        this.catchRadius = this.width * 0.35; // tighter hitbox: ~32–56px vs visual 45–80px
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        scale(-this.direction, 1);
        imageMode(CENTER);

        if (this.frames && this.frames.length === 2) {
            let frameIndex = floor(frameCount / 20) % 2;
            image(this.frames[frameIndex], 0, 0, this.width, this.height);
        }
        pop();
        this.drawScoreText();
    }
}

class FishBone extends SeaItem {
    constructor(x, y) {
        super(x, y, "FishBone", 0, 1.5);
        this.width = 70;
        this.height = 40;
        this.sprite = imgSkeleton;
    }
    draw() {
        push();
        translate(this.position.x, this.position.y);
        imageMode(CENTER);
        image(this.sprite, 0, 0, this.width, this.height);
        pop();
    }
}

class Treasure extends SeaItem {
    constructor(x, y) {
        // Score range widened: 50–400 (was 100–500), mystery-box feel
        let val = floor(random(50, 400));
        super(x, y, "Treasure", val, 4);
        this.width = 60;
        this.height = 50;

        this.sprite = treasureChest;
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        imageMode(CENTER);

        if (this.sprite) {
            image(this.sprite, 0, 0, this.width, this.height);
        }
        pop();

        this.drawScoreText();
    }
}

class Stone extends SeaItem {
    constructor(x, y) {
        let val = floor(random(10, 30));
        let w = random(6, 12);

        super(x, y, "Stone", val, w);

        this.width = random(50, 90);
        this.height = this.width;

        if (typeof stones !== "undefined" && stones.length > 0) {
            this.sprite = random(stones);
        } else {
            this.sprite = null;
        }
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        if (this.sprite) {
            imageMode(CENTER);

            image(this.sprite, 0, 0, this.width, this.height);
        } else {
            noStroke();
            fill(90, 90, 95);
            ellipse(0, 0, this.width, this.height);

            fill(120, 120, 125);
            ellipse(
                -this.width * 0.15,
                -this.height * 0.15,
                this.width * 0.4,
                this.height * 0.3,
            );
            fill(60, 60, 65);
            ellipse(
                this.width * 0.15,
                this.height * 0.2,
                this.width * 0.5,
                this.height * 0.2,
            );
        }

        pop();
        this.drawScoreText();
    }
}
