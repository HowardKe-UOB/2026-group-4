class ShopItem {
    constructor(name, costPrice, description) {
        this.name = name;
        this.costPrice = costPrice;
        this.description = description;
        this.purchased = false;
    }

    applyEffect(levelManager) {
        if (this.name === "Strength Potion") {
            levelManager.hook.retractMultiplier = 2; 
            //console.log("Strength Potion applied: Retract speed increased!");
        }
        if (this.name === "Laser Sight") {
        levelManager.hook.hasLaser = true; 
        }
    }
}
