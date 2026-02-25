// ==========================================
// 1. 基础海洋物品类 (静止物品的基类)
// ==========================================
class SeaItem extends GameObject {
    constructor(x, y, itemName, scoreValue, weight) {
        super(x, y);
        this.itemName = itemName;
        this.scoreValue = scoreValue;
        this.weight = weight; // 决定拉回来的速度
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

    drawScoreText() {
    }
}

// ==========================================
// 2. 基础游动生物类 (提取游动逻辑)
// ==========================================
class BaseFish extends SeaItem {
    constructor(x, y, itemName, scoreValue, weight, size) {
        super(x, y, itemName, scoreValue, weight);
        this.width = size;
        this.height = size * 0.6; 
        this.speed = random(1, 2.5); 
        this.direction = random() > 0.5 ? 1 : -1; 
    }

    swim() {
        this.position.x += this.speed * this.direction;
        if (this.position.x < this.width || this.position.x > width - this.width) {
            this.direction *= -1;
        }
    }

    update() {
        this.swim();
    }
}

// ==========================================
// 3. 具体生物与物品类
// ==========================================

// 小鱼：30金币，大小30
class SmallFish extends BaseFish {
    constructor(x, y) {
        super(x, y, "Small Fish", 30, 1, 30);
        // 【核心修改2：大幅降低小鱼速度】 原来是 0.5~1.2
        this.speed = random(0.2, 0.6); 
    }
    draw() {
        fill(100, 200, 255);
        ellipse(this.position.x, this.position.y, this.width, this.height);
        fill(80, 180, 235);
        let tailX = this.position.x - (this.width / 2) * this.direction;
        triangle(tailX, this.position.y, tailX - 10 * this.direction, this.position.y - 10, tailX - 10 * this.direction, this.position.y + 10);
        this.drawScoreText();
    }
}

// 小丑鱼：50金币，大小40
class ClownFish extends BaseFish {
    constructor(x, y) {
        super(x, y, "Clownfish", 50, 1.5, 40);
        // 【核心修改3：大幅降低小丑鱼速度】 原来是 2.0~3.5
        this.speed = random(0.6, 1.2); 
    }
    draw() {
        fill(255, 140, 0);
        ellipse(this.position.x, this.position.y, this.width, this.height);
        fill(255); 
        rectMode(CENTER);
        rect(this.position.x, this.position.y, 6, this.height * 0.9);
        this.drawScoreText();
    }
}

// 海星：80金币，大小45
class Starfish extends BaseFish {
    constructor(x, y) {
        super(x, y, "Starfish", 80, 2, 45);
        this.speed = random(0.1, 0.4); // 海星更慢一点
        this.height = 45; // 海星等宽高
    }
    draw() {
        fill(255, 180, 180); 
        circle(this.position.x, this.position.y, this.width); 
        this.drawScoreText();
    }
}

// 螃蟹：150金币，大小50
class Crab extends BaseFish {
    constructor(x, y) {
        super(x, y, "Crab", 150, 3, 50);
        this.speed = random(0.3, 0.7);
    }
    draw() {
        fill(220, 50, 50); 
        rectMode(CENTER);
        rect(this.position.x, this.position.y, this.width, this.height, 10); 
        this.drawScoreText();
    }
}

// 鱼骨头：0金币，大小40
class FishBone extends SeaItem {
    constructor(x, y) {
        super(x, y, "FishBone", 0, 1.5);
        this.width = 40;
        this.height = 20;
        // 保持贴底
        this.position.y = height - random(20, 40); 
    }
    draw() {
        fill(200);
        rectMode(CENTER);
        rect(this.position.x, this.position.y, this.width, this.height); 
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(10);
        text("Bone", this.position.x, this.position.y);
    }
}

// 宝箱：随机金币，大小60
class Treasure extends SeaItem {
    constructor(x, y) {
        let val = floor(random(100, 500)); 
        super(x, y, "Treasure", val, 4);   
        this.width = 60;                   
        this.height = 50;
        // 保持贴底
        this.position.y = height - random(30, 50); 
    }
    draw() {
        fill(255, 215, 0); 
        rectMode(CENTER);
        rect(this.position.x, this.position.y, this.width, this.height);
        this.drawScoreText();
    }
}