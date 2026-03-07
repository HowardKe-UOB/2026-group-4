class ShopManager {
    constructor() {
        this.resetShop();

        // [修改] 提取商店界面的坐标变量，便于后续调整
        this.goldBoxX = 188; // [在这里微调坐标] 左上方木框中心 X（对齐背景图木框）
        this.goldBoxY = 35; // [在这里微调坐标] 左上方木框中心 Y
        this.nextLevelBoxX = 1080; // [在这里微调坐标] 右上方绿色黑板中心 X
        this.nextLevelBoxY = 30; // [在这里微调坐标] 右上方绿色黑板中心 Y

        // [修改] 道具显示位置 - 增加 Y 坐标使其贴合柜台桌面
        this.itemPositions = [
            { x: width / 2 - 125, y: height / 2 + 120 }, // [在这里微调坐标] Strength Potion
            { x: width / 2, y: height / 2 + 120 }, // [在这里微调坐标] Laser Sight
            { x: width / 2 + 125, y: height / 2 + 120 }, // [在这里微调坐标] Sand Clock
        ];

        this.hitRadius = 60;
    }

    resetShop() {
        this.availableItems = [
            new ShopItem(
                "Strength Potion",
                200,
                "Pulls items 2x faster.\nperiod: 1 level",
            ),
            new ShopItem(
                "Laser Sight",
                200,
                "Often miss? Buy Laser Sight now!\nperiod: 1 level",
            ),
            new ShopItem(
                "Sand Clock",
                250,
                "Get extra 10 seconds.\nperiod: 1 level",
            ),
        ];
    }

    draw(player) {
        push();

        // 1. Draw background (cover mode to prevent stretching)
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

        // Gold display
        textAlign(CENTER, CENTER);
        textSize(20);
        textStyle(BOLD);
        textFont(pixelFont);
        fill(150, 80, 0);
        text("Gold: " + player.totalScore, this.goldBoxX, this.goldBoxY);

        // Next Level button
        let isNextHovered =
            abs(mouseX - this.nextLevelBoxX) < 70 &&
            abs(mouseY - this.nextLevelBoxY) < 30;

        if (isNextHovered) {
            noStroke();
            fill(255, 255, 255, 120);
            rectMode(CENTER);
            rect(this.nextLevelBoxX, this.nextLevelBoxY, 140, 50, 10);
        }

        fill(isNextHovered ? 0 : 255);
        textAlign(CENTER, CENTER);
        textSize(20);
        textStyle(BOLD);
        textFont(pixelFont);
        text("Next Level", this.nextLevelBoxX, this.nextLevelBoxY);
        textStyle(NORMAL);

        // Item hover detection and drawing
        let hoveredItem = null;

        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];
            let pos = this.itemPositions[i];

            let d = dist(mouseX, mouseY, pos.x, pos.y);
            let isHovered = d < this.hitRadius;

            if (isHovered) {
                hoveredItem = item;
                noStroke();
                fill(255, 255, 255, 100);
                circle(pos.x, pos.y, this.hitRadius * 2);
            }

            imageMode(CENTER);
            let imgSize = 80;

            if (
                item.name === "Strength Potion" &&
                typeof potionImg !== "undefined" &&
                potionImg
            ) {
                image(potionImg, pos.x, pos.y, imgSize, imgSize);
            } else if (
                item.name === "Laser Sight" &&
                typeof laserImg !== "undefined" &&
                laserImg
            ) {
                image(laserImg, pos.x, pos.y, imgSize, imgSize);
            } else if (
                item.name === "Sand Clock" &&
                typeof clockImg !== "undefined" &&
                clockImg
            ) {
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

        // Bottom info text on hover
        if (hoveredItem) {
            textFont(pixelFont);
            textAlign(CENTER, CENTER);
            let infoY = height - 105;

            fill(60, 40, 20);
            textSize(24);
            textStyle(BOLD);
            text(
                hoveredItem.name + "  -  $" + hoveredItem.costPrice,
                width / 2,
                infoY - 20,
            );
            textStyle(NORMAL);

            textSize(18);
            fill(80, 60, 40);
            text(hoveredItem.description, width / 2, infoY + 15);

            textSize(16);
            if (hoveredItem.purchased) {
                fill(150, 0, 0);
                text("Already Purchased", width / 2, infoY + 50);
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
        if (
            abs(mouseX - this.nextLevelBoxX) < 70 &&
            abs(mouseY - this.nextLevelBoxY) < 30
        ) {
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
