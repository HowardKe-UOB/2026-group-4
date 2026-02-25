// 基础海洋物品类
class SeaItem extends GameObject {
    constructor(x, y, itemName, scoreValue, weight) {
        super(x, y);
        this.itemName = itemName;
        this.scoreValue = scoreValue;
        this.weight = weight; // 决定拉回来的速度
        this.width = 40;
        this.height = 30;
    }

    update() {}

    draw() {
        // 默认绘制逻辑（会被子类覆盖）
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

        // 游动属性
        this.speed = random(1, 2.5); // 随机游动速度
        this.direction = random() > 0.5 ? 1 : -1; // 1 向右，-1 向左
    }

    swim() {
        // 如果鱼没有被钩子抓住，它就会游动
        this.position.x += this.speed * this.direction;

        // 碰到屏幕边缘后反转方向
        if (this.position.x < 30 || this.position.x > width - 30) {
            this.direction *= -1;
        }
    }

    update() {
        this.swim();
    }

    draw() {
        fill(100, 200, 255);
        // 简单的椭圆代表鱼
        ellipse(this.position.x, this.position.y, this.width, this.height);

        // 画个小尾巴指示方向
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

// 具体类：宝箱 (高价值，重量大 -> 拉得慢)
class Treasure extends SeaItem {
    constructor(x, y) {
        let val = floor(random(200, 500));
        super(x, y, "Treasure", val, 3.5);
        this.width = 50;
        this.height = 40;
    }

    draw() {
        fill(255, 215, 0); // 金色
        rectMode(CENTER);
        rect(this.position.x, this.position.y, this.width, this.height);
        this.drawScoreText();
    }
}

// 具体类：垃圾/石头 (极低价值，重量极大 -> 纯粹浪费时间)
class Junk extends SeaItem {
    constructor(x, y) {
        let val = floor(random(5, 15)); // 低价值，不再是负数
        super(x, y, "Junk", val, 4.5); // 非常重！惩罚玩家的时间
        this.width = 35;
        this.height = 35;
    }

    draw() {
        fill(100, 100, 100); // 深灰色
        circle(this.position.x, this.position.y, this.width);

        fill(255); // 深色背景上用白色字
        textAlign(CENTER, CENTER);
        textSize(10);
        text(this.scoreValue, this.position.x, this.position.y);
    }
}
