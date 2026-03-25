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
        let calculatedScore = floor(map(randomSize, 40, 60, 75, 115));
        let calculatedWeight = map(randomSize, 40, 60, 1.5, 2.5);

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
        // Score nerfed (was 250–600), high-risk high-reward
        let calculatedScore = floor(map(randomSize, 110, 150, 190, 240)); // 原本是 240, 340
        let calculatedWeight = map(randomSize, 110, 150, 3, 4);

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
        let val = floor(random(300, 380));
        super(x, y, "Treasure", val, 4);
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
        let val = 1000;
        super(x, y, "Pearl", val, 1);
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

        // 外层光晕（径向渐变，与鮟鱇鱼同款柔和射灯效果）
        let pulse = 0.2 * sin(frameCount * 0.06 + this.glowPhase);
        let r = this.glowRadius * (1 + pulse * 0.5);
        {
            let ctx = drawingContext;
            ctx.save();
            let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.3);
            grad.addColorStop(0, "rgba(220,230,255,0.38)");
            grad.addColorStop(0.5, "rgba(200,215,255,0.16)");
            grad.addColorStop(1, "rgba(180,200,255,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

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
        let w = random(3.5, 4);

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
        super(spawnX, y, "KoiFish", val, 2.33, 60); // 体积，重量设定

        this.playedOutSfx = false; // 退场音效判定

        if (
            typeof koiFishImgs !== "undefined" &&
            koiFishImgs.length > 0 &&
            koiFishImgs[0]
        ) {
            let img = koiFishImgs[0];
            let targetWidth = 70;
            let targetHeight = targetWidth * (img.height / img.width);
            // 重新赋值高宽
            this.width = targetWidth;
            this.height = targetHeight;
        }

        this.speed = 2.33; // 移速较快
        this.direction = spawnX < 0 ? 1 : -1; // 在左边就向右游，在右边就向左游

        this.glowPhase = random(TWO_PI);
        this.glowRadius = 60;
    }

    update() {
        this.swim();
    }

    // 重写游动逻辑：一直往前游，不碰壁回头
    swim() {
        this.position.x += this.speed * this.direction;
        // 退场音效
        if (!this.playedOutSfx) {
            if (
                (this.direction === 1 && this.position.x > width) ||
                (this.direction === -1 && this.position.x < 0)
            ) {
                if (koiOutSfx && !koiOutSfx.isPlaying()) {
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

        // 金色径向发光光晕（与 AnglerFish 同款效果）
        let pulse = 0.15 * sin(frameCount * 0.05 + this.glowPhase);
        let r = this.glowRadius * (1 + pulse);
        let ctx = drawingContext;
        ctx.save();
        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.3);
        grad.addColorStop(0, "rgba(255,200,50,0.28)");
        grad.addColorStop(0.5, "rgba(255,200,50,0.13)");
        grad.addColorStop(1, "rgba(255,200,50,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (this.direction === -1) {
            scale(-1, 1);
        }
        imageMode(CENTER);
        if (typeof koiFishImgs !== "undefined" && koiFishImgs.length === 2) {
            let frame = Math.floor(frameCount / 15) % 2;
            image(koiFishImgs[frame], 0, 0, this.width, this.height);
        } else {
            fill(255, 215, 0);
            ellipse(0, 0, this.width, this.height * 0.5);
        }
        pop();
        this.drawScoreText();
    }
}

// 游动的贝壳：继承 BaseFish 复用 swim() 逻辑，高价值可见目标
class SwimmingPearlShell extends BaseFish {
    constructor(x, y) {
        // 在 SwimmingPearlShell 类的 constructor 中
        super(x, y, "Moving Shell", floor(random(750, 900)), 2, 42); // 原本是 1000
        this.speed = random(2.5, 3.8);
        // 动画帧序列：1-2-3-4-3-2-1（ping-pong 循环）
        this._framePingPong = [0, 1, 2, 3, 2, 1];
        this._frameInterval = 8; // 每 8 帧切换一次图
        // 深海模式发光参数（与 Pearl 保持一致风格）
        this.glowPhase = random(TWO_PI);
        this.glowRadius = 55;
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        // 深海光晕（径向渐变，与鮟鱇鱼同款柔和射灯效果）
        let pulse = 0.2 * sin(frameCount * 0.06 + this.glowPhase);
        let r = this.glowRadius * (1 + pulse * 0.5);
        {
            let ctx = drawingContext;
            ctx.save();
            let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.3);
            grad.addColorStop(0, "rgba(200,240,255,0.32)");
            grad.addColorStop(0.5, "rgba(180,230,255,0.14)");
            grad.addColorStop(1, "rgba(160,220,255,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.direction === -1) {
            scale(-1, 1);
        }

        imageMode(CENTER);

        const hasImgs =
            typeof pearlShellImgs !== "undefined" &&
            pearlShellImgs.length > 0 &&
            pearlShellImgs[0];

        if (hasImgs) {
            let seqIndex =
                Math.floor(frameCount / this._frameInterval) %
                this._framePingPong.length;
            let frameIdx = this._framePingPong[seqIndex];
            let img = pearlShellImgs[frameIdx];
            if (img) image(img, 0, 0, this.width, this.height);
        } else {
            // Fallback：代码绘制打开的贝壳 + 发光珍珠
            noStroke();

            // 下半贝壳
            fill(220, 190, 150);
            arc(0, 5, this.width, this.height * 0.7, 0, PI);

            // 上半贝壳（向上打开）
            fill(240, 210, 170);
            arc(0, -8, this.width, this.height * 0.65, PI, TWO_PI);

            // 贝壳纹路
            stroke(180, 150, 110, 160);
            strokeWeight(1);
            for (let i = -1; i <= 1; i++) {
                line(i * 10, -18, i * 12, 10);
            }
            noStroke();

            // 珍珠光晕
            fill(220, 230, 255, 60);
            ellipse(0, 0, 22 + pulse * 8, 22 + pulse * 8);

            // 珍珠主体
            fill(240, 245, 255);
            ellipse(0, 0, 14, 14);
            fill(255, 255, 255, 200);
            ellipse(-2, -3, 5, 4);
        }

        pop();
        this.drawScoreText();
    }
}
