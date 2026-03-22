class ShopManager {
    constructor() {
        this.shopItemCount = 4;
        this.availableItems = [];
        this.displayPositions = [];

        this.goldBoxX = 260;
        this.goldBoxY = 70;
        this.nextLevelBoxX = 1020;
        this.nextLevelBoxY = 70;
        this.hitRadius = 60;

        this.resetShop(1, null);
    }

    createItemDefinitions() {
        return [
            {
                name: "Strength Potion",
                basePrice: 225,
                description:
                    "A potion can bestow you with magical power!\nPulls items 2x faster.\n[period: 1 level]",
            },
            {
                name: "Laser Sight",
                basePrice: 175,
                description:
                    "Often miss? Buy Laser Sight now!\nAdd aiming assistance, swing speed -40%.\n[period: 1 level]",
            },
            {
                name: "Sand Clock",
                basePrice: 175,
                description:
                    "A fisher is never late!\nAdd 8~15 seconds based on level.\n[period: 1 level]",
            },
            {
                name: "Submarine",
                basePrice: 10,
                description:
                    "Prove to yourself that you have the strength\nand courage to explore the deep sea.\n[Permanent upgrade]",
            },
            {
                name: "Four-Leaf Clover",
                basePrice: 500,
                description:
                    "You will encounter rarer treasure!\nTreasures worth 35% more.\n[Permanent upgrade]",
            },
            {
                name: "Fishbone Collector",
                basePrice: 400,
                description:
                    "Museum love old fishbone and stone!\nFishbone:$20~$50, Stone value+100%.\n[Permanent upgrade]",
            },
            {
                name: "Lucky Coin",
                basePrice: 300,
                description:
                    "A rare Koi Fish will appear\nat 10s in the next level!\nSpecial sound effects included!\n[period: 1 level]",
            },
            {
                name: "Club Card",
                basePrice: 500,
                description:
                    "Exclusive member benefits!\nGet 10%~30% off all items.\n[Permanent upgrade]",
            },
        ];
    }

    isPermanentItem(itemName) {
        return [
            "Submarine",
            "Four-Leaf Clover",
            "Fishbone Collector",
            "Club Card",
        ].includes(itemName);
    }

    isAlreadyOwned(itemName, player) {
        if (!player) {
            return false;
        }

        return (
            (itemName === "Submarine" && player.hasSubmarine) ||
            (itemName === "Four-Leaf Clover" && player.hasClover) ||
            (itemName === "Fishbone Collector" &&
                player.hasFishboneCollector) ||
            (itemName === "Club Card" && player.hasClubCard)
        );
    }

    shuffleItems(items) {
        let shuffled = [...items];

        for (let i = shuffled.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }

    getDisplayPositions(itemCount = this.availableItems.length) {
        if (itemCount <= 0) {
            return [];
        }

        if (itemCount <= 4) {
            if (itemCount <= 2) {
                let gap = 210;
                let startX = width / 2 - ((itemCount - 1) * gap) / 2;

                return Array.from({ length: itemCount }, (_, index) => ({
                    x: startX + index * gap,
                    y: height / 2 - 10,
                }));
            }

            let topRowCount = Math.ceil(itemCount / 2);
            let bottomRowCount = itemCount - topRowCount;
            let gap = 210;
            let topStartX = width / 2 - ((topRowCount - 1) * gap) / 2;
            let bottomStartX = width / 2 - ((bottomRowCount - 1) * gap) / 2;
            let positions = [];

            for (let i = 0; i < topRowCount; i++) {
                positions.push({
                    x: topStartX + i * gap,
                    y: height / 2 - 140,
                });
            }

            for (let i = 0; i < bottomRowCount; i++) {
                positions.push({
                    x: bottomStartX + i * gap,
                    y: height / 2 + 80,
                });
            }

            return positions;
        }

        let topRowCount = Math.ceil(itemCount / 2);
        let bottomRowCount = itemCount - topRowCount;
        let gap = 190;
        let topStartX = width / 2 - ((topRowCount - 1) * gap) / 2;
        let bottomStartX = width / 2 - ((bottomRowCount - 1) * gap) / 2;
        let positions = [];

        for (let i = 0; i < topRowCount; i++) {
            positions.push({
                x: topStartX + i * gap,
                y: height / 2 - 140,
            });
        }

        for (let i = 0; i < bottomRowCount; i++) {
            positions.push({
                x: bottomStartX + i * gap,
                y: height / 2 + 80,
            });
        }

        return positions;
    }

    resetShop(levelNum = 1, player = null) {
        let itemPool = this.createItemDefinitions()
            .filter(
                (definition) =>
                    !this.isPermanentItem(definition.name) ||
                    !this.isAlreadyOwned(definition.name, player),
            )
            .map(
                (definition) =>
                    new ShopItem(
                        definition.name,
                        definition.basePrice,
                        definition.description,
                        levelNum,
                        player,
                    ),
            );

        this.availableItems = this.shuffleItems(itemPool).slice(
            0,
            Math.min(this.shopItemCount, itemPool.length),
        );
        this.displayPositions = this.getDisplayPositions(
            this.availableItems.length,
        );
    }

    draw(player, playerMode = PlayerMode.SINGLE, levelNum = 1) {
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

        push();
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textFont(pixelFont);

        if (playerMode === PlayerMode.TWO_PLAYER) {
            textSize(10);
            textStyle(NORMAL);
            fill(255, 150, 50);
            text("P1:$" + player.p1Score, this.goldBoxX, this.goldBoxY - 20);
            fill(80, 160, 255);
            text("P2:$" + player.p2Score, this.goldBoxX, this.goldBoxY + 5);
            textSize(12);
            textStyle(NORMAL);
            fill(255, 165, 0);
            text(
                "Total:$" + player.totalScore,
                this.goldBoxX,
                this.goldBoxY + 30,
            );
        } else {
            textSize(14);
            textStyle(NORMAL);
            fill(64, 64, 64);
            text("Gold:$" + player.totalScore, this.goldBoxX, this.goldBoxY);
        }
        pop();

        let isNextHovered =
            abs(mouseX - this.nextLevelBoxX) < 80 &&
            abs(mouseY - this.nextLevelBoxY) < 35;
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

        let hoveredItem = null;
        let itemPositions = this.displayPositions;

        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];
            let pos = itemPositions[i] || { x: width / 2, y: height / 2 };

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
                imgSize = 110;
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
            } else if (
                item.name === "Four-Leaf Clover" &&
                typeof cloverImg !== "undefined" &&
                cloverImg
            ) {
                image(cloverImg, pos.x, pos.y, imgSize, imgSize);
            } else if (
                item.name === "Fishbone Collector" &&
                typeof fishboneCollectorImg !== "undefined" &&
                fishboneCollectorImg
            ) {
                image(fishboneCollectorImg, pos.x, pos.y, imgSize, imgSize);
            } else if (
                item.name === "Lucky Coin" &&
                typeof luckyCoinImg !== "undefined" &&
                luckyCoinImg
            ) {
                image(luckyCoinImg, pos.x, pos.y, imgSize, imgSize);
            } else if (
                item.name === "Club Card" &&
                typeof clubcardImg !== "undefined" &&
                clubcardImg
            ) {
                image(clubcardImg, pos.x, pos.y, imgSize, imgSize);
            }
            pop();

            let isSold =
                item.purchased || this.isAlreadyOwned(item.name, player);
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

            fill(60, 40, 20);
            textSize(16);
            textStyle(BOLD);
            if (hoveredItem.isDiscounted) {
                fill(255, 50, 50);
                textStyle(BOLD);
                if (
                    hoveredItem.name === "Fishbone Collector" ||
                    hoveredItem.name === "Four-Leaf Clover"
                ) {
                    textSize(14);
                } else {
                    textSize(16);
                }
                text(
                    hoveredItem.name +
                        " - $" +
                        hoveredItem.costPrice +
                        " 50%OFF!",
                    width / 2,
                    infoY - 55,
                );
            } else {
                textSize(16);
                text(
                    hoveredItem.name + " - $" + hoveredItem.costPrice,
                    width / 2,
                    infoY - 55,
                );
            }

            textSize(9);
            textStyle(NORMAL);
            fill(100, 80, 60);
            text(hoveredItem.description, width / 2, infoY - 20);

            let promptY = infoY + 20;
            if (hoveredItem.clubDiscountText !== "") {
                fill(230, 120, 0);
                textSize(12);
                text(hoveredItem.clubDiscountText, width / 2, infoY + 10);
                promptY += 10;
            }

            textSize(16);
            textStyle(NORMAL);

            let canAfford = player.totalScore >= hoveredItem.costPrice;
            let alreadyOwned =
                hoveredItem.purchased ||
                this.isAlreadyOwned(hoveredItem.name, player);

            if (alreadyOwned) {
                fill(150, 0, 0);
                text("Already Purchased", width / 2, promptY);
            } else if (!canAfford) {
                fill(180, 50, 50);
                text("Not enough Gold!", width / 2, promptY);
            } else {
                fill(35, 140, 35);
                text("Click to buy", width / 2, promptY);
            }
            pop();
        }
    }

    handleMousePress(player, playerMode = PlayerMode.SINGLE) {
        if (
            abs(mouseX - this.nextLevelBoxX) < 80 &&
            abs(mouseY - this.nextLevelBoxY) < 35
        ) {
            return "NEXT_LEVEL";
        }

        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];
            let pos = this.displayPositions[i] || {
                x: width / 2,
                y: height / 2,
            };

            let d = dist(mouseX, mouseY, pos.x, pos.y);
            if (d < this.hitRadius) {
                let canAfford = player.totalScore >= item.costPrice;
                let alreadyOwned =
                    item.purchased || this.isAlreadyOwned(item.name, player);

                if (!alreadyOwned && canAfford) {
                    let purchased =
                        playerMode === PlayerMode.TWO_PLAYER
                            ? player.purchaseItemTwoPlayer(item)
                            : player.purchaseItem(item);

                    if (purchased) {
                        item.purchased = true;
                        if (item.name === "Submarine") {
                            player.hasSubmarine = true;
                        } else if (item.name === "Club Card") {
                            player.hasClubCard = true;

                            this.availableItems.forEach((shopItem) => {
                                if (shopItem !== item && !shopItem.purchased) {
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
