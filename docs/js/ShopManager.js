class ShopManager {
    constructor() {
        this.resetShop();
        
        this.itemPositions = [
            { x: width / 2 - 125, y: height / 2 + 65 }, // Strength Potion
            { x: width / 2,       y: height / 2 + 65 }, // Laser Sight
            { x: width / 2 + 125, y: height / 2 + 65 }  // Sand Clock
        ];

        this.hitRadius = 60; 
    }

    resetShop() {
        this.availableItems = [
            // \n 换行
            new ShopItem("Strength Potion", 200, "Pulls items 2x faster. \nperiod: 1 level"),
            new ShopItem("Laser Sight", 200, "Often miss? Buy Laser Sight now! \nperiod: 1 level"),
            new ShopItem("Sand Clock", 250, "Get extra 10 seconds. \nperiod: 1 level")
        ];
    }

    draw(player) {
        push();
        
        // --- 1. 绘制背景 (Cover 模式防止拉伸) ---
        if (typeof shopBgImg !== "undefined" && shopBgImg) {
            let imgRatio = shopBgImg.width / shopBgImg.height;
            let canvasRatio = width / height;
            let drawW, drawH, drawX, drawY;

            if (imgRatio > canvasRatio) {
                drawH = height;
                drawW = height * imgRatio;
            } else {
                drawW = width;
                drawH = width / imgRatio;
            }
            drawX = (width - drawW) / 2;
            drawY = (height - drawH) / 2;

            imageMode(CORNER);
            image(shopBgImg, drawX, drawY, drawW, drawH);
        } else {
            background(40, 40, 60); 
        }

        // 金币显示
        textAlign(CENTER, CENTER);
        textSize(20);
        textStyle(BOLD);
        fill(150, 80, 0); 
        text(`Gold: ${player.totalScore}`, 90, 60); 

        // “下一关”按钮
        let nextBtnX = width - 90;
        let nextBtnY = 60;
        
        // 判定鼠标是否在“下一关”文字区域
        let isNextHovered = (abs(mouseX - nextBtnX) < 70 && abs(mouseY - nextBtnY) < 30);
        
        if (isNextHovered) {
            noStroke();
            fill(255, 255, 255, 120); // 白色亮底
            rectMode(CENTER);
            rect(nextBtnX, nextBtnY, 140, 50, 10);
        }
        fill(0); // 文字设为黑色或深色，配合白底更显眼
        if (!isNextHovered) fill(255); // 非悬停时保持白色或根据你背景图调整
        
        textAlign(CENTER, CENTER);
        textSize(20);
        textStyle(BOLD);
        text("Next Level", nextBtnX, nextBtnY);
        textStyle(NORMAL);

        // 商品绘制与悬停逻辑
        let hoveredItem = null;

        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];
            let pos = this.itemPositions[i];
            
            let d = dist(mouseX, mouseY, pos.x, pos.y);
            let isHovered = (d < this.hitRadius);

            if (isHovered) {
                hoveredItem = item;
                noStroke();
                fill(255, 255, 255, 100);
                circle(pos.x, pos.y, this.hitRadius * 2);
            }

            imageMode(CENTER);
            let imgSize = 80; 
            
            if (item.name === "Strength Potion" && typeof potionImg !== "undefined" && potionImg) {
                image(potionImg, pos.x, pos.y, imgSize, imgSize);
            }
            else if (item.name === "Laser Sight" && typeof laserImg !== "undefined" && laserImg) {
                image(laserImg, pos.x, pos.y, imgSize, imgSize);
            }
            else if (item.name === "Sand Clock" && typeof clockImg !== "undefined" && clockImg) {
                image(clockImg, pos.x, pos.y, imgSize, imgSize);
            }

            if (item.purchased) {
                fill(0, 0, 0, 180);
                circle(pos.x, pos.y, imgSize + 5);
                fill(255, 50, 50);
                textSize(20);
                textStyle(BOLD);
                text("SOLD", pos.x, pos.y);
                textStyle(NORMAL);
            }
        }

        // 底部柜台文本
        if (hoveredItem) {
            fill(60, 40, 20); 
            textAlign(CENTER, CENTER);
            let infoY = height - 105; 

            textSize(24);
            textStyle(BOLD);
            text(`${hoveredItem.name}  -  $${hoveredItem.costPrice}`, width / 2, infoY - 20);
            textStyle(NORMAL);

            textSize(18);
            fill(80, 60, 40);
            text(hoveredItem.description, width / 2, infoY + 15);

            textSize(16);
            if (hoveredItem.purchased) {
                fill(150, 0, 0);
                text("Already Purchased", width / 2, infoY + 50); // Y越大越靠下
            } else if (player.totalScore < hoveredItem.costPrice) {
                fill(150, 0, 0);
                text("Not enough Gold!", width / 2, infoY + 50);
            } else {
                fill(0, 120, 0);
                text("Click to buy", width / 2, infoY + 50);
            }
        }

        pop();
    }

    handleMousePress(player) {
        // 同步修改“下一关”按钮的点击判定中心和范围
        let nextBtnX = width - 90; // 与 draw 保持一致
        let nextBtnY = 60;        // 与 draw 保持一致
        
        if (abs(mouseX - nextBtnX) < 70 && abs(mouseY - nextBtnY) < 30) {
            return "NEXT_LEVEL"; 
        }

        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];
            let pos = this.itemPositions[i];

            let d = dist(mouseX, mouseY, pos.x, pos.y);
            if (d < this.hitRadius) {
                if (!item.purchased && player.totalScore >= item.costPrice) {
                    if (player.purchaseItem(item)) {
                        item.purchased = true;
                    }
                }
                return "BOUGHT";
            }
        }
        return "NONE";
    }
}