class ShopManager {
    constructor() {
        this.resetShop(1, null);  // 初始化时，因为还没有获取到玩家，传 null 进去

        this.goldBoxX = 260;
        this.goldBoxY = 70;
        this.nextLevelBoxX = 1020;
        this.nextLevelBoxY = 70;

        //道具在柜台上的位置
        this.itemPositions = [
            { x: width / 2 - 180, y: height / 2 + 110 }, // Strength Potion
            { x: width / 2 - 60, y: height / 2 + 110 }, // Laser Sight
            { x: width / 2 + 60, y: height / 2 + 110 }, // Sand Clock
            { x: width / 2 + 300, y: height / 2 + 110 }, // Submarine
            { x: width / 2 - 120, y: height / 2 - 140 }, // Clover
            { x: width / 2, y: height / 2 - 140 }, // Fishbone Collector
            { x: width / 2 + 180, y: height / 2 + 110 }, // Lucky Coin
            { x: width / 2 + 120, y: height / 2 - 140 } // Club Card
        ];

        this.hitRadius = 60; // 判定范围
    }

    resetShop(levelNum = 1, player = null) {
        this.availableItems = [
            new ShopItem(
                "Strength Potion",
                225,
                "A potion can bestow you with magical power!\nPulls items 2x faster.\n[period: 1 level]",
                levelNum, player
            ),
            new ShopItem(
                "Laser Sight",
                175,
                "Often miss? Buy Laser Sight now!\nAdd aiming assistance, swing speed -40%.\n[period: 1 level]",
                levelNum, player
            ),
            new ShopItem(
                "Sand Clock",
                175,
                "A fisher is never late!\nAdd 8~15 seconds based on level.\n[period: 1 level]",
                levelNum, player
            ),
            new ShopItem(
                "Submarine",
                10,
                "Prove to yourself that you have the strength\nand courage to explore the deep sea.\n[Permanent upgrade]",
                levelNum, player
            ),
            new ShopItem("Four-Leaf Clover",
                500,
                "You will encounter rarer treasure!\nTreasures worth 35% more.\n[Permanent upgrade]",
                levelNum, player
            ),
            new ShopItem("Fishbone Collector",
                400,
                "Museum love old fishbone and stone!\nFishbone:$20~$50, Stone value+100%.\n[Permanent upgrade]",
                levelNum, player
            ),
            new ShopItem("Lucky Coin",
                300,
                "A rare Koi Fish will appear\nat 10s in the next level!\n[period: 1 level]",
                levelNum, player
            ),
            new ShopItem("Club Card", 
                10, 
                "Exclusive member benefits!\nGet 10%~30% off all items.\n[Permanent upgrade]",
                levelNum, player
            )
        ];
    }

    // playerMode 参数：用于双人模式下显示各自余额及差异化扣款
    draw(player, playerMode = PlayerMode.SINGLE, levelNum = 1) {
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
            textSize(10);
            textStyle(NORMAL);
            fill(255, 150, 50); // P1 橙色
            text("P1:$" + player.p1Score, this.goldBoxX, this.goldBoxY-20);
            fill(80, 160, 255); // P2 蓝色
            text("P2:$" + player.p2Score, this.goldBoxX, this.goldBoxY+5);
            textSize(12);
            textStyle(NORMAL);
            fill(255, 165, 0); // 合计金色
            text("Total:$" + player.totalScore, this.goldBoxX, this.goldBoxY + 30);
        } else {
            // 单人模式
            textSize(14);
            textStyle(NORMAL);
            fill(64, 64, 64); //深灰色
            text("Gold:$" + player.totalScore, this.goldBoxX, this.goldBoxY);
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
        textSize(15);
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

            push();
            imageMode(CENTER);
            let imgSize = 80;
            if (item.name === "Submarine") {
                imgSize = 110;  //专门增加潜水艇大小
            }
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
            else if (
                item.name === "Four-Leaf Clover" && 
                typeof cloverImg !== "undefined" && 
                cloverImg
            ) {
                image(cloverImg, pos.x, pos.y, imgSize, imgSize);
            }
            else if (
                item.name === "Fishbone Collector" && 
                typeof fishboneCollectorImg !== "undefined" && 
                fishboneCollectorImg
            ) {
                image(fishboneCollectorImg, pos.x, pos.y, imgSize, imgSize);
            }
            else if (
                item.name === "Lucky Coin" && 
                typeof luckyCoinImg !== "undefined" && 
                luckyCoinImg
            ) {
                image(luckyCoinImg, pos.x, pos.y, imgSize, imgSize);
            }
            else if (
                item.name === "Club Card" && 
                typeof clubcardImg !== "undefined" && 
                clubcardImg
            ) {
                image(clubcardImg, pos.x, pos.y, imgSize, imgSize);
            }
            pop();

            let isSold =
                item.purchased ||
                (item.name === "Submarine" && player.hasSubmarine) ||
                (item.name === "Four-Leaf Clover" && player.hasClover) ||
                (item.name === "Fishbone Collector" && player.hasFishboneCollector) ||
                (item.name === "Club Card" && player.hasClubCard);
            if (isSold) {
                push();
                fill(0, 0, 0, 180);
                circle(pos.x, pos.y, imgSize + 5);
                fill(255, 50, 50);
                textSize(20);
                textStyle(BOLD);
                text("SOLD", pos.x - 30, pos.y + 10);
                textStyle(NORMAL);
                pop();
            }
        }

        if (hoveredItem) {
            push();
            textFont(pixelFont);
            textAlign(CENTER, CENTER);
            let infoY = height - 90;

            // 商品名称 和 商品打折显示
            fill(60, 40, 20);
            textSize(16);
            textStyle(BOLD);
            if(hoveredItem.isDiscounted){
                fill(255, 50, 50);
                textStyle(BOLD);
                // Fishbone Collector 打折时名称较长，缩小字体避免溢出
                if (hoveredItem.name === "Fishbone Collector" || hoveredItem.name === "Four-Leaf Clover") {
                    textSize(14);
                } else {
                    textSize(16);
                }
                text(hoveredItem.name + " - $" + hoveredItem.costPrice + " 50%OFF!", width / 2, infoY - 55);
            }else{
                textSize(16);
                text(hoveredItem.name + " - $" + hoveredItem.costPrice, width / 2, infoY - 55);
            }

            // 商品描述-字体太大会溢出区域
            textSize(11);
            textStyle(NORMAL);
            fill(100, 80, 60);
            text(hoveredItem.description, width / 2, infoY - 20);

            // 如果触发了会员卡折扣，显示橘色提示文字
            let promptY = infoY + 20;
            if (hoveredItem.clubDiscountText !== "") {
                fill(230, 120, 0); // 橘色
                textSize(12);
                text(hoveredItem.clubDiscountText, width / 2, infoY + 10);
                promptY += 10; // 把购买提示稍微往下一点，防止重叠
            }

            // 购买提示
            textSize(16);
            textStyle(NORMAL);

            // 双人模式：现在只看共享的 totalScore 是否够钱
            let canAfford = player.totalScore >= hoveredItem.costPrice;

            let alreadyOwned =
                hoveredItem.purchased ||
                (hoveredItem.name === "Submarine" && player.hasSubmarine) ||
                (hoveredItem.name === "Four-Leaf Clover" && player.hasClover) ||
                (hoveredItem.name === "Fishbone Collector" && player.hasFishboneCollector) ||
                (hoveredItem.name === "Club Card" && player.hasClubCard);

            if (alreadyOwned) {
                fill(150, 0, 0);
                text("Already Purchased", width / 2, promptY);
            } else if (!canAfford) {
                fill(180, 50, 50);
                text("Not enough Gold!", width / 2, promptY);
            } else {
                // 因为是共享钱包，提示统一改为 Click to buy 即可
                fill(35, 140, 35);
                text("Click to buy", width / 2, promptY);
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
                // 单人，双人模式都由totalScore判断
                let canAfford = player.totalScore >= item.costPrice;
                // 双人模式：用两人合计判断；单人模式：用 totalScore
                // let canAfford = playerMode === PlayerMode.TWO_PLAYER
                //     ? (player.p1Score + player.p2Score >= item.costPrice)
                //     : (player.totalScore >= item.costPrice);

                let alreadyOwned =
                    item.purchased ||
                    (item.name === "Submarine" && player.hasSubmarine) ||
                    (item.name === "Four-Leaf Clover" && player.hasClover) ||
                    (item.name === "Fishbone Collector" && player.hasFishboneCollector) ||
                    (item.name === "Club Card" && player.hasClubCard);

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
                        // 购买会员卡后，立即标记玩家拥有会员卡
                        else if (item.name === "Club Card") {
                            player.hasClubCard = true;
                            
                            // 让当前店里的其他商品立即享受折扣
                            this.availableItems.forEach(shopItem => {
                                if (shopItem !== item && !shopItem.purchased) {
                                    // 立即重新计算该商品的折扣价
                                    shopItem.applyClubCardDiscount(player);
                                }
                            });
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