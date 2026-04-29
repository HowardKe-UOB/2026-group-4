class ShopItem {
    constructor(name, basePrice, description, levelNum = 1, player = null) {
        this.name = name;
        this.description = description;
        this.purchased = false;
        this.isDiscounted = false;
        this.clubCardOff = 0;
        this.clubDiscountText = "";

        // Price inflation rate
        let inflationRate = 0.10; // Default per-level inflation for regular items
        
        if (this.name === "Laser Sight" || this.name === "Lucky Coin") {
            inflationRate = 0;    // Laser Sight / Lucky Coin do not inflate
        } else if (this.name === "Submarine") {
            inflationRate = 0.03; // Submarine inflation rate
        } else if (this.name === "Four-Leaf Clover" || this.name === "Fishbone Collector") {
            inflationRate = 0.05; // Four-Leaf Clover / Fishbone Collector inflation rate
        }
        // Compute inflation-adjusted price; stop increasing from level 11 onward
        let inflationLevel = Math.min(levelNum, 11);
        // Compute multiplier: 1 + (currentLevel - 1) * inflationRate
        let multiplier = 1 + (inflationLevel - 1) * inflationRate;
        this.baseInflatedPrice = Math.floor(basePrice * multiplier);
        let currentPrice = this.baseInflatedPrice;

        // Store pre-discount inflated price
        this.baseInflatedPrice = Math.floor(basePrice * multiplier);

        // Random discount: 10% chance for 50% off (Submarine excluded)
        if (this.name !== "Submarine" && Math.random() <= 0.1) {
            this.isDiscounted = true;
            currentPrice *= 0.5;
        }

        this.costPrice = Math.floor(currentPrice);

        if (player && player.hasClubCard) {
            this.applyClubCardDiscount(player);
        }
    }

    // Public helper to refresh discounts after purchasing Club Card
    applyClubCardDiscount(player) {
        if (player.hasClubCard && this.name !== "Club Card" && this.clubCardOff === 0) {
            // Random extra discount: 10%/20%/30% off
            let discounts = [10, 20, 30]; 
            this.clubCardOff = discounts[Math.floor(Math.random() * discounts.length)]; 
            let multiplier = 1 - (this.clubCardOff / 100);
            this.costPrice = Math.floor(this.costPrice * multiplier);
            // Save text displayed in the shop UI
            this.clubDiscountText = `Club card accepted: extra ${this.clubCardOff}% off!`;
        }
    }

    applyEffect(levelManager) {
        // Apply effects to all hooks so both single/two-player modes are covered
        if (levelManager.hooks && levelManager.hooks.length > 0) {
            levelManager.hooks.forEach(h => {
                if (this.name === "Strength Potion") {
                    h.retractMultiplier = 1.5; // Increase retract speed for all players
                }
                if (this.name === "Laser Sight") {
                    h.hasLaser = true; // Grant laser to all players
                    h.swingSpeedMultiplier = 0.6; // Reduce swing speed to 60% of original
                }
            });
        }

        // Sand Clock time bonus logic
        if (this.name === "Sand Clock") {
            // Added time = 7 + current level, capped at +15 seconds.
            let bonus = 7 + levelManager.levelNum;
            levelManager.timeLimit += Math.min(15, bonus);
            levelManager.timeRemaining = levelManager.timeLimit;
        }

        // Submarine: permanently unlock deep-sea mode (persisted on player)
        if (this.name === "Submarine") {
            levelManager.player.hasSubmarine = true;
        }

        // Four-Leaf Clover: permanently unlock
        if (this.name === "Four-Leaf Clover") {
            levelManager.player.hasClover = true;
        }

        // Fishbone Collector: permanently unlock
        if (this.name === "Fishbone Collector") {
            levelManager.player.hasFishboneCollector = true;
        }

        // Lucky Coin
        if (this.name === "Lucky Coin") {
            levelManager.player.hasLuckyCoin = true; 
        }

        // Club Card
        if (this.name === "Club Card"){
            levelManager.player.hasClubCard = true;
        } 
    }
}