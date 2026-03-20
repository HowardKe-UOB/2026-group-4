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
        let randomSize = random(40, 60);
        // Score nerfed: 70–110 (was 30–150), keeps it a "filler" item
        let calculatedScore = floor(map(randomSize, 40, 60, 70, 110));
        let calculatedWeight = map(randomSize, 40, 60, 2, 3);

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
        let randomSize = random(110, 150);
        // Score nerfed: 220–340 (was 250–600), high-risk high-reward
        let calculatedScore = floor(map(randomSize, 110, 150, 220, 340));
        let calculatedWeight = map(randomSize, 110, 150, 6, 9);

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
        super(x, y, "FishBone", 1, 1.5);
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
        let val = floor(random(190, 280));
        super(x, y, "Treasure", val, 4.5);
        this.width = 80;
        this.height = 60;

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

// 珍珠：深海底层稀有高价值物品，极小体积，极难抓取
class Pearl extends SeaItem {
    constructor(x, y) {
        // 高分值，极轻，但碰撞体积极小
        let val = floor(random(400, 600));
        super(x, y, "Pearl", val, 1.5);
        this.width = 22;
        this.height = 22;
        this.catchRadius = 8; // 极小的抓取半径，非常难命中
        // 珍珠光泽脉冲动画参数（同时用于深海遮罩层的光源挖洞）
        this.glowPhase = random(TWO_PI);
        this.glowRadius = 50; // 深海遮罩中的光晕半径，比鮟鱇鱼小但足够引人注目
        this.sprite = typeof pearlImg !== "undefined" ? pearlImg : null;
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        // 外层光晕（脉冲呼吸效果）
        let pulse = 0.2 * sin(frameCount * 0.06 + this.glowPhase);
        let glowSize = this.width * (1.8 + pulse);
        noStroke();
        fill(220, 230, 255, 40);
        ellipse(0, 0, glowSize, glowSize);

        imageMode(CENTER);
        if (this.sprite) {
            image(this.sprite, 0, 0, this.width, this.height);
        } else {
            // fallback：无图片时用代码绘制
            fill(240, 245, 255);
            ellipse(0, 0, this.width, this.height);
            fill(255, 255, 255, 200);
            ellipse(-3, -4, 6, 5);
            stroke(180, 190, 210, 100);
            strokeWeight(1);
            noFill();
            arc(0, 2, this.width * 0.6, this.height * 0.4, 0, PI);
        }

        pop();
        this.drawScoreText();
    }
}

class Stone extends SeaItem {
    constructor(x, y) {
        let val = floor(random(60, 90));
        let w = random(6, 12);

        super(x, y, "Stone", val, w);

        this.width = random(50, 80);
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

// 后期可选：锦鲤移出屏幕后删除
class KoiFish extends BaseFish {
    constructor(y) {
        // 参数
        let val = random([777, 888]);
        // 随机从屏幕左边(-100)或右边(width+100)生成
        let spawnX = random() > 0.5 ? -100 : width + 100;
        super(spawnX , y, "KoiFish", val, 3, 70);  // 体积，重量略大于小鱼

        this.playedOutSfx = false;  // 退场音效判定

        if (typeof koiFishImgs !== "undefined" && koiFishImgs.length > 0 && koiFishImgs[0]) {
            let img = koiFishImgs[0];
            let targetWidth = 70; 
            let targetHeight = targetWidth * (img.height / img.width);
            // 重新赋值高宽
            this.width = targetWidth;
            this.height = targetHeight;
        }

        this.speed = 2.33; // 移速较快
        this.direction = spawnX < 0 ? 1 : -1; // 在左边就向右游，在右边就向左游
    }

    update() {
        this.swim();
    }

    // 重写游动逻辑：一直往前游，不碰壁回头
    swim() {
        this.position.x += this.speed * this.direction;
        // 退场音效
        if (!this.playedOutSfx) {
            if ((this.direction === 1 && this.position.x > width) || 
                (this.direction === -1 && this.position.x < 0)) {
                if (koiOutSfx && !koiOutSfx.isPlaying()){
                    koiOutSfx.play();
                } 
                this.playedOutSfx = true;
            }
        }
    }
    // 重写绘制逻辑：加入动画和翻转
    draw() {
        push();
        translate(this.position.x, this.position.y);
        // 如果鱼默认是朝右的，当它向左游(direction === -1)时，水平翻转
        if (this.direction === -1) {
            scale(-1, 1);
        }
        imageMode(CENTER);
        // 实现 2 帧动画的切换 (每 15 帧换一次图)
        if (typeof koiFishImgs !== "undefined" && koiFishImgs.length === 2) {
            let frame = Math.floor(frameCount / 15) % 2;
            image(koiFishImgs[frame], 0, 0, this.width, this.height);
        } else {
            // 兜底方案：如果没有图片，画个金色的椭圆
            fill(255, 215, 0);
            ellipse(0, 0, this.width, this.height * 0.5);
        }
        pop();
        this.drawScoreText();
    }
}
