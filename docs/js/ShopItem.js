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
        if (this.name === "Sand Clock") {
        // 增加总限时
        levelManager.timeLimit += 10; 
        // 同时要把当前剩余时间也补上这10秒，否则倒计时会立刻少掉10秒
        levelManager.timeRemaining = levelManager.timeLimit; 
        }
    }
}
