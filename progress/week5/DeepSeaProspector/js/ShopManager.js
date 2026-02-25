class ShopManager {
    constructor() {
        this.resetShop(); // 初始化商品
    }

    // 每次进入商店（或者新的一关），刷新商品状态
    resetShop() {
        this.availableItems = [
            new ShopItem("Strength Potion", 200, "Pulls items 2x faster, period: 1 level"),
            // new ShopItem("Bomb", 200, "Destroys rocks (Coming soon)")
        ];
    }

    // 负责绘制商店界面
    draw(player) {
        background(40, 40, 60); // 给商店一个不同于海底的暗色背景

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(40);
        text("SHOP", width / 2, 60);

        textSize(20);
        fill(255, 215, 0); // 金色
        text(`Your Money: ${player.totalScore}`, width / 2, 110);

        // 绘制商品列表
        let startY = 200;
        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];

            // 画商品背景框
            fill(200);
            rectMode(CENTER);
            rect(width / 2, startY + i * 80, 400, 60, 10);

            // 绘制商品图片
            if (item.name === "Strength Potion" && potionImg) {
                imageMode(CENTER);
                // 把图片画在文字的左侧，假设大小设为 40x40
                image(potionImg, width / 2 - 160, startY + i * 80, 40, 40); 
            }

            // 画商品文字（把起始 X 坐标稍微往右移一点，给图片腾出空间）
            fill(0);
            textAlign(LEFT, CENTER);
            textSize(18);
            text(`${item.name} - $${item.costPrice}`, width / 2 - 130, startY + i * 80 - 10);
            textSize(14);
            fill(80);
            text(item.description, width / 2 - 130, startY + i * 80 + 15);

            // 画购买按钮
            rectMode(CENTER);
            if (item.purchased) {
                fill(150); // 已购买，置灰
                rect(width / 2 + 140, startY + i * 80, 80, 30, 5);
                fill(255);
                textAlign(CENTER, CENTER);
                text("SOLD", width / 2 + 140, startY + i * 80);
            } else {
                fill(100, 200, 100); // 可购买，绿色
                rect(width / 2 + 140, startY + i * 80, 80, 30, 5);
                fill(0);
                textAlign(CENTER, CENTER);
                text("BUY", width / 2 + 140, startY + i * 80);
            }
        }

        // 绘制下一关按钮
        fill(100, 150, 255);
        rectMode(CENTER);
        rect(width / 2, height - 60, 200, 50, 10);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("Next Level", width / 2, height - 60);
    }

    // 负责处理商店界面的点击事件
    handleMousePress(player) {
        let startY = 200;

        // 检查是否点击了某个商品的 BUY 按钮
        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];
            let btnX = width / 2 + 140;
            let btnY = startY + i * 80;

            // 按钮宽 80，高 30，算上鼠标偏差范围
            if (!item.purchased && abs(mouseX - btnX) < 40 && abs(mouseY - btnY) < 15) {
                if (player.purchaseItem(item)) {
                    item.purchased = true;
                }
                return "BOUGHT";
            }
        }

        // 检查是否点击了 Next Level 按钮
        if (abs(mouseX - width / 2) < 100 && abs(mouseY - (height - 60)) < 25) {
            return "NEXT_LEVEL";
        }

        return "NONE";
    }
}