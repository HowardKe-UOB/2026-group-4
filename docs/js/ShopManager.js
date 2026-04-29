class ShopManager {
    constructor() {
        this.goldBoxX = 260;
        this.goldBoxY = 70;
        this.nextLevelBoxX = 1020;
        this.nextLevelBoxY = 70;

        // Item positions on the counter
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

        // 1. Define base item configs (bind to fixed positions via slotIndex)
        // Non-permanent items: higher baseProb and maxProb
        // Permanent items: lower baseProb and maxProb
        this.itemConfigs = [
            { slotIndex: 0, name: "Strength Potion", basePrice: 225, baseProb: 0.5, maxProb: 0.7, desc: "A potion can bestow you with magical power!\nPulls items 1.5x faster.\n[period: 1 level]" },
            { slotIndex: 1, name: "Laser Sight", basePrice: 175, baseProb: 0.5, maxProb: 0.7, desc: "Often miss? Buy Laser Sight now!\nAdd aiming assistance, swing speed -40%.\n[period: 1 level]" },
            { slotIndex: 2, name: "Sand Clock", basePrice: 175, baseProb: 0.5, maxProb: 0.7, desc: "A fisher is never late!\nAdd 8~15 seconds based on level.\n[period: 1 level]" },
            { slotIndex: 3, name: "Submarine", basePrice: 1000, baseProb: 1.0, maxProb: 1.0, desc: "Prove to yourself that you have the strength\nand courage to explore the deep sea.\n[Permanent upgrade]" },
            { slotIndex: 4, name: "Four-Leaf Clover", basePrice: 500, baseProb: 0.15, maxProb: 0.4, desc: "You will encounter rarer treasure!\nTreasures worth 35% more.\n[Permanent upgrade]" },
            { slotIndex: 5, name: "Fishbone Collector", basePrice: 400, baseProb: 0.15, maxProb: 0.4, desc: "Museum love old fishbone and stone!\nFishbone:$20~$50, Stone value+100%.\n[Permanent upgrade]" },
            { slotIndex: 6, name: "Lucky Coin", basePrice: 300, baseProb: 0.4, maxProb: 0.6, desc: "A rare Koi Fish will appear\nat 10s in the next level!\nSpecial sound effects included!\n[period: 1 level]" },
            { slotIndex: 7, name: "Club Card", basePrice: 500, baseProb: 0.15, maxProb: 0.4, desc: "Exclusive member benefits!\nGet 10%~30% off all items.\n[Permanent upgrade]" }
        ];

        this.hitRadius = 60; // Hit detection radius
        this.availableItems = [];

        // Cheat button
        this.hitRadius = 60; // Hit detection radius
        this.availableItems = [];

        // Toggle cheat button visibility
        this.showCheatBtn = false; 

        this.resetShop(1, null);  // On init, pass null because player is not available yet
    }

    resetShop(levelNum = 1, player = null) {
        this.availableItems = [];
        let pool = [];

        // 1. Force-add Submarine (always appears every level)
        let subConfig = this.itemConfigs.find(c => c.name === "Submarine");
        pool.push(subConfig);

        // 2. Apply dynamic probabilities to other items
        // Linear ramp: grows from level 1 to 6, then stays fixed
        let progress = Math.min(levelNum, 6);
        let ratio = (progress - 1) / 5; // 0.0 (L1) to 1.0 (L6)

        this.itemConfigs.forEach(config => {
            if (config.name === "Submarine") return; // Skip submarine

            // Compute dynamic probability for current level
            let currentProb = config.baseProb + (config.maxProb - config.baseProb) * ratio;

            if (Math.random() < currentProb) {
                pool.push(config);
            }
        });

        // 3. Fallback: if fewer than 3 items (including submarine), fill randomly
        while (pool.length < 3) {
            let remainConfigs = this.itemConfigs.filter(c => !pool.includes(c));
            if (remainConfigs.length === 0) break;
            // Randomly pick one item to fill
            let randomConfig = remainConfigs[Math.floor(Math.random() * remainConfigs.length)];
            pool.push(randomConfig);
        }

        // 4. Sort by original slotIndex to keep visual positions stable
        pool.sort((a, b) => a.slotIndex - b.slotIndex);

        // 5. Instantiate items and store their slot indices
        pool.forEach(config => {
            let item = new ShopItem(
                config.name,
                config.basePrice,
                config.desc,
                levelNum,
                player
            );
            item.slotIndex = config.slotIndex; // Key: bind to original counter position
            this.availableItems.push(item);
        });
    }

    // playerMode parameter: used for two-player balance display and purchase logic
    draw(player, playerMode = PlayerMode.SINGLE, levelNum = 1) {
        // Draw background (cover mode to avoid stretching)
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

        // Money display
        push();
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textFont(pixelFont);

        if (playerMode === PlayerMode.TWO_PLAYER) {
            // Two-player mode: show P1/P2 balances and total
            textSize(10);
            textStyle(NORMAL);
            fill(255, 150, 50); // P1 orange
            text("P1:$" + player.p1Score, this.goldBoxX, this.goldBoxY-20);
            fill(80, 160, 255); // P2 blue
            text("P2:$" + player.p2Score, this.goldBoxX, this.goldBoxY+5);
            textSize(12);
            textStyle(NORMAL);
            fill(255, 165, 0); // Total in gold color
            text("Total:$" + player.totalScore, this.goldBoxX, this.goldBoxY + 30);
        } else {
            // Single-player mode
            textSize(14);
            textStyle(NORMAL);
            fill(64, 64, 64); // dark gray
            text("Gold:$" + player.totalScore, this.goldBoxX, this.goldBoxY);
        }
        pop();

        const mx = this.scaledMouseX ?? (typeof mouseX !== "undefined" ? mouseX : 0);
        const my = this.scaledMouseY ?? (typeof mouseY !== "undefined" ? mouseY : 0);

        // Next Level button hit area
        let isNextHovered =
            abs(mx - this.nextLevelBoxX) < 80 &&
            abs(my - this.nextLevelBoxY) < 35;
        // Highlight area
        if (isNextHovered) {
            noStroke();
            fill(255, 255, 255, 120);
            rectMode(CENTER);
            rect(this.nextLevelBoxX, this.nextLevelBoxY, 160, 70, 10);
        }
        push();
        fill(isNextHovered ? 0 : 255);
        textAlign(CENTER, CENTER);
        textSize(14);
        textLeading(25);
        textStyle(BOLD);
        textFont(pixelFont);
        text("Next Level", this.nextLevelBoxX, this.nextLevelBoxY);
        textStyle(NORMAL);
        pop();

        // Item hover detection and drawing
        let hoveredItem = null;

        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];
            let pos = this.itemPositions[item.slotIndex];

            let d = dist(mx, my, pos.x, pos.y);
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
                imgSize = 110;  // Increase submarine icon size only
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

            // Item name and discount display
            fill(60, 40, 20);
            textSize(16);
            textStyle(BOLD);
            if(hoveredItem.isDiscounted){
                fill(255, 50, 50);
                textStyle(BOLD);
                // Name is long when discounted; reduce font size to avoid overflow
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

            // Item description: reduce font size to avoid overflow
            textSize(10);
            textStyle(NORMAL);
            fill(100, 80, 60);
            text(hoveredItem.description, width / 2, infoY - 20);

            // If Club Card discount is active, show orange hint text
            let promptY = infoY + 20;
            if (hoveredItem.clubDiscountText !== "") {
                fill(230, 120, 0); // Orange
                textSize(12);
                text(hoveredItem.clubDiscountText, width / 2, infoY + 10);
                promptY += 10; // Move purchase hint down slightly to avoid overlap
            }

            // Purchase hint
            textSize(16);
            textStyle(NORMAL);

            // Two-player mode: only check shared totalScore affordability
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
                // Shared wallet: unified hint is simply "Click to buy"
                fill(35, 140, 35);
                text("Click to buy", width / 2, promptY);
            }
            pop();
        }
        // Draw cheat button (shown after pressing P)
        if (this.showCheatBtn) {
            push();
            let cheatBtnX = 100;
            let cheatBtnY = height - 40; // Bottom-left corner
            let cheatBtnW = 120;
            let cheatBtnH = 35;

            const mx = this.scaledMouseX ?? (typeof mouseX !== "undefined" ? mouseX : 0);
            const my = this.scaledMouseY ?? (typeof mouseY !== "undefined" ? mouseY : 0);
            let isHovered = abs(mx - cheatBtnX) < cheatBtnW / 2 && abs(my - cheatBtnY) < cheatBtnH / 2;

            rectMode(CENTER);
            fill(isHovered ? color(255, 80, 80) : color(200, 40, 40));
            rect(cheatBtnX, cheatBtnY, cheatBtnW, cheatBtnH, 8);

            fill(255);
            textAlign(CENTER, CENTER);
            textSize(12);
            textStyle(BOLD);
            if (typeof pixelFont !== 'undefined' && pixelFont) textFont(pixelFont);
            text("Cheating", cheatBtnX, cheatBtnY);

            pop();
        }           
    }

    // playerMode parameter: used for two-player differentiated purchase deduction
    handleMousePress(player, playerMode = PlayerMode.SINGLE) {
        const mx = this.scaledMouseX ?? (typeof mouseX !== "undefined" ? mouseX : 0);
        const my = this.scaledMouseY ?? (typeof mouseY !== "undefined" ? mouseY : 0);

        // Cheat button click detection
        if (this.showCheatBtn) {
            let cheatBtnX = 100;
            let cheatBtnY = height - 50;
            if (abs(mx - cheatBtnX) < 60 && abs(my - cheatBtnY) < 17.5) {
                this.activateCheat(player);
                return "CHEAT_ACTIVATED";
            }
        }

        if (abs(mx - this.nextLevelBoxX) < 100 && abs(my - this.nextLevelBoxY) < 35) {
            return "NEXT_LEVEL";
        }

        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];
            let pos = this.itemPositions[item.slotIndex];

            let d = dist(mx, my, pos.x, pos.y);
            if (d < this.hitRadius) {
                // Both single and two-player modes use totalScore for affordability
                let canAfford = player.totalScore >= item.costPrice;
                // Two-player: combined balance check; single-player: totalScore check
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
                    // Two-player: original design was P1-first then P2; single-player: original logic
                    let purchased = playerMode === PlayerMode.TWO_PLAYER
                        ? player.purchaseItemTwoPlayer(item)
                        : player.purchaseItem(item);

                    if (purchased) {
                        item.purchased = true;
                        // Submarine is a permanent upgrade; apply immediately
                        if (item.name === "Submarine") {
                            player.hasSubmarine = true;
                        }
                        // After buying Club Card, mark player as owning it immediately
                        else if (item.name === "Club Card") {
                            player.hasClubCard = true;
                            
                            // Apply discounts to other current shop items immediately
                            this.availableItems.forEach(shopItem => {
                                if (shopItem !== item && !shopItem.purchased) {
                                    // Recalculate discounted price immediately
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

    // Cheat: list all items and set to 10% price
    activateCheat(player) {
        this.showCheatBtn = false; // Hide button after click
        this.availableItems = [];  // Clear current shop

        // Iterate all item configs and list all items
        this.itemConfigs.forEach(config => {
            let item = new ShopItem(
                config.name,
                config.basePrice,
                config.desc,
                1, // levelNum fallback
                player
            );
            item.slotIndex = config.slotIndex; 
            
            // Set price to 10% (1 discount fold)
            item.costPrice = Math.max(1, Math.floor(config.basePrice * 0.1)); 
            
            // Reuse Club Card orange hint slot to show cheat effect text
            item.clubDiscountText = "DEV CHEAT: 90% OFF!"; 
            
            this.availableItems.push(item);
        });
    }

}