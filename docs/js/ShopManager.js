class ShopManager {
    constructor() {
        this.resetShop();
    }

    resetShop() {
        this.availableItems = [
            new ShopItem(
                "Strength Potion",
                200,
                "Pulls items 2x faster, period: 1 level",
            ),
            new ShopItem(
                "Laser Sight",
                200, 
                "Often miss? Buy Laser Sight now! period: 1 level",
        )
        ];
    }

    draw(player) {
        push();
        background(40, 40, 60);

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(40);
        text("SHOP", width / 2, 60);

        textSize(20);
        fill(255, 215, 0);
        text(`Your Money: ${player.totalScore}`, width / 2, 110);

        let startY = 200;
        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];

            fill(200);
            rectMode(CENTER);
            rect(width / 2, startY + i * 80, 400, 60, 10);

            if (
                item.name === "Strength Potion" &&
                typeof potionImg !== "undefined" &&
                potionImg
            ) {
                imageMode(CENTER);
                image(potionImg, width / 2 - 160, startY + i * 80, 40, 40);
            }
            else if (
                item.name === "Laser Sight" &&
                typeof laserImg !== "undefined" &&
                laserImg
            ) {
                imageMode(CENTER);
                image(laserImg, width / 2 - 160, startY + i * 80, 40, 40);
            }

            fill(0);
            textAlign(LEFT, CENTER);
            textSize(18);
            text(
                `${item.name} - $${item.costPrice}`,
                width / 2 - 130,
                startY + i * 80 - 10,
            );
            textSize(14);
            fill(80);
            text(item.description, width / 2 - 130, startY + i * 80 + 15);

            rectMode(CENTER);
            let yPos = startY + i * 80 - 10;
            if (item.purchased) {
                fill(150);
                rect(width / 2 + 140, yPos, 80, 30, 5);
                fill(255);
                textAlign(CENTER, CENTER);
                text("SOLD", width / 2 + 140, yPos);
            } else {
                fill(100, 200, 100);
                rect(width / 2 + 140, yPos, 80, 30, 5);
                fill(0);
                textAlign(CENTER, CENTER);
                text("BUY", width / 2 + 140, yPos);
            }
        }

        fill(100, 150, 255);
        rectMode(CENTER);
        rect(width / 2, height - 60, 200, 50, 10);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("Next Level", width / 2, height - 60);
        pop();
    }

    handleMousePress(player) {
        let startY = 200;

        for (let i = 0; i < this.availableItems.length; i++) {
            let item = this.availableItems[i];
            let btnX = width / 2 + 140;
            let btnY = startY + i * 80;

            if (
                !item.purchased &&
                abs(mouseX - btnX) < 40 &&
                abs(mouseY - btnY) < 15
            ) {
                if (player.purchaseItem(item)) {
                    item.purchased = true;
                }
                return "BOUGHT";
            }
        }

        if (abs(mouseX - width / 2) < 100 && abs(mouseY - (height - 60)) < 25) {
            return "NEXT_LEVEL";
        }

        return "NONE";
    }
}
