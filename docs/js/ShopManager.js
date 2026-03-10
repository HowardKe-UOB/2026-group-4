class ShopManager {
    constructor() {
        this.resetShop();

        this.goldBoxX = 260;
        this.goldBoxY = 70;
        this.nextLevelBoxX = 1020;
        this.nextLevelBoxY = 70;

        // --- 道具在柜台上的位置 ---
        this.itemPositions = [
            { x: width / 2 - 187, y: height / 2 + 110 }, // Strength Potion
            { x: width / 2 - 62, y: height / 2 + 110 }, // Laser Sight
            { x: width / 2 + 62, y: height / 2 + 110 }, // Sand Clock
            { x: width / 2 + 187, y: height / 2 + 110 }, // Submarine
        ];

        this.hitRadius = 60; // 判定范围
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
            new ShopItem(
                "Submarine",
                200,
                "Dive into deep sea!\nPermanent upgrade.",
            ),
        ];
    }

    // playerMode 参数：用于双人模式下显示各自余额及差异化扣款
    draw(player, playerMode = PlayerMode.SINGLE) {
        // 绘制背景（使用覆盖模式以防止拉伸）
        push();
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
        pop();

        // ── 金额显示 ──────────────────────────────────────────────────
        push();
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textFont(pixelFont);

        if (playerMode === PlayerMode.TWO_PLAYER) {
            // 双人模式：分别显示 P1 / P2 余额，及合计
            textSize(30);
            fill(255, 150, 50); // P1 橙色
            text("P1: $" + player.p1Score, this.goldBoxX - 110, this.goldBoxY);
            fill(80, 160, 255); // P2 蓝色
            text("P2: $" + player.p2Score, this.goldBoxX + 110, this.goldBoxY);
            textSize(22);
            fill(255, 215, 0); // 合计金色
            text("Total: $" + player.totalScore, this.goldBoxX, this.goldBoxY + 32);
        } else {
            // 单人模式：原逻辑
            textSize(34);
            fill(150, 80, 0);
            text("Gold: " + player.totalScore, this.goldBoxX, this.goldBoxY);
        }
        pop();

        // Next Level button 检测区域
        let isNextHovered =
            abs(mouseX - this.nextLevelBoxX) < 80 &&
            abs(mouseY - this.nextLevelBoxY) < 35;
        // 高亮区域
        if (isNextHovered) {
            noStroke();
            fill(255, 255, 255, 120);
            rectMode(CENTER);
            rect(this.nextLevelBoxX, this.nextLevelBoxY, 160, 70, 10);
        }
        push();
        fill(isNextHovered ? 0 : 255);
        textAlign(CENTER, CENTER);
        textSize(28);
        textStyle(BOLD);
        textFont(pixelFont);
        text("Next Level", this.nextLevelBoxX, this.nextLevelBoxY);
        textStyle(NORMAL);
        pop();

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
            } else if (
                item.name === "Submarine" &&
                typeof submarineImg !== "undefined" &&
                submarineImg
            ) {
                image(submarineImg, pos.x, pos.y, imgSize, imgSize);
            }

            let isSold =
                item.purchased ||
                (item.name === "Submarine" && player.hasSubmarine);
            if (isSold) {
                fill(0, 0, 0, 180);
                circle(pos.x, pos.y, imgSize + 5);
                fill(255, 50, 50);
                textSize(20);
                textStyle(BOLD);
                text("SOLD", pos.x - 30, pos.y + 10);
                textStyle(NORMAL);
            }
        }

        if (hoveredItem) {
            push();
            textFont(pixelFont);
            textAlign(CENTER, CENTER);
            let infoY = height - 120;

            // 商品名称
            fill(60, 40, 20);
            textSize(34);
            textStyle(BOLD);
            text(hoveredItem.name + "  -  $" + hoveredItem.costPrice, width / 2, infoY - 45);

            // 商品描述
            textSize(24);
            textStyle(NORMAL);
            fill(100, 80, 60);
            text(hoveredItem.description, width / 2, infoY);

            // 购买提示
            textSize(28);
            textStyle(BOLD);
            let promptY = infoY + 40;

            // 双人模式：用两人合计判断是否够钱
            let canAfford = playerMode === PlayerMode.TWO_PLAYER
                ? (player.p1Score + player.p2Score >= hoveredItem.costPrice)
                : (player.totalScore >= hoveredItem.costPrice);

            let alreadyOwned =
                hoveredItem.purchased ||
                (hoveredItem.name === "Submarine" && player.hasSubmarine);

            if (alreadyOwned) {
                fill(150, 0, 0);
                text("Already Purchased", width / 2, promptY);
            } else if (!canAfford) {
                fill(180, 50, 50);
                text("Not enough Gold!", width / 2, promptY);
            } else {
                // 双人模式提示从谁扣款
                if (playerMode === PlayerMode.TWO_PLAYER) {
                    fill(35, 140, 35);
                    if (player.p1Score >= hoveredItem.costPrice) {
                        text("Click to buy  (P1 pays)", width / 2, promptY);
                    } else {
                        text("Click to buy  (P1+" + (hoveredItem.costPrice - player.p1Score) + " from P2)", width / 2, promptY);
                    }
                } else {
                    fill(35, 140, 35);
                    text("Click to buy", width / 2, promptY);
                }
            }
            pop();
        }
    }

    // playerMode 参数：用于双人模式下的差异化扣款逻辑
    handleMousePress(player, playerMode = PlayerMode.SINGLE) {
        if (
            abs(mouseX - this.nextLevelBoxX) < 80 &&
            abs(mouseY - this.nextLevelBoxY) < 35
        ) {
            return "NEXT_LEVEL";
        }

        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];
            let pos = this.itemPositions[i];

            let d = dist(mouseX, mouseY, pos.x, pos.y);
            if (d < this.hitRadius) {
                // 双人模式：用两人合计判断；单人模式：用 totalScore
                let canAfford = playerMode === PlayerMode.TWO_PLAYER
                    ? (player.p1Score + player.p2Score >= item.costPrice)
                    : (player.totalScore >= item.costPrice);

                let alreadyOwned =
                    item.purchased ||
                    (item.name === "Submarine" && player.hasSubmarine);

                if (!alreadyOwned && canAfford) {
                    // 双人：优先扣 P1，不足从 P2 补；单人：原逻辑
                    let purchased = playerMode === PlayerMode.TWO_PLAYER
                        ? player.purchaseItemTwoPlayer(item)
                        : player.purchaseItem(item);

                    if (purchased) {
                        item.purchased = true;
                        // 潜水艇是永久升级，立即生效
                        if (item.name === "Submarine") {
                            player.hasSubmarine = true;
                        }
                        if (buySfx && buySfx.isPlaying()) {
                            buySfx.stop();
                        }
                        buySfx.play();
                    }
                }
                return "BOUGHT";
            }
        }
        return "NONE";
    }
}