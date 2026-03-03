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
        if (
            this.position.x < this.width ||
            this.position.x > width - this.width
        ) {
            this.direction *= -1;
        }
    }

    update() {
        this.swim();
    }
}

class SmallFish extends BaseFish {
    constructor(x, y) {
        let randomSize = random(30, 70);

        let calculatedScore = floor(map(randomSize, 30, 70, 30, 150));

        let calculatedWeight = map(randomSize, 30, 70, 1, 3);

        super(
            x,
            y,
            "Ocean Fish",
            calculatedScore,
            calculatedWeight,
            randomSize,
        );

        this.speed = random(0.2, 1.2);

        this.sprite = random(imgSmallFishes);
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        scale(-this.direction, 1);

        imageMode(CENTER);

        if (this.sprite) {
            image(this.sprite, 0, 0, this.width, this.height);
        }
        pop();

        this.drawScoreText();
    }
}

// 鱼骨头：0金币，大小40
class FishBone extends SeaItem {
    constructor(x, y) {
        super(x, y, "FishBone", 0, 1.5);
        this.width = 70;
        this.height = 40;
        this.sprite = random(imgSkeletons);
    }
    draw() {
        push();
        imageMode(CENTER);
        translate(this.position.x, this.position.y);
        image(this.sprite, 0, 0, this.width, this.height);
        pop();
    }
}

class Treasure extends SeaItem {
    constructor(x, y) {
        let val = floor(random(100, 500));
        super(x, y, "Treasure", val, 4);
        this.width = 60;
        this.height = 50;

        this.position.y = height - random(30, 50);

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
