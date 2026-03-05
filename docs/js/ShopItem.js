class ShopItem {
    constructor(name, costPrice, description) {
        this.name = name;
        this.costPrice = costPrice;
        this.description = description;
        this.purchased = false;
    }

    applyEffect(levelManager) {
        // 【核心修复】：遍历所有钩子，确保单/双人模式都能生效
        if (levelManager.hooks && levelManager.hooks.length > 0) {
            levelManager.hooks.forEach(h => {
                if (this.name === "Strength Potion") {
                    h.retractMultiplier = 2; // 提升所有玩家的回拉速度
                }
                if (this.name === "Laser Sight") {
                    h.hasLaser = true; // 所有玩家获得激光
                }
            });
        }

        // 沙漏增加时间逻辑（不依赖钩子，保持原样即可）
        if (this.name === "Sand Clock") {
            levelManager.timeLimit += 10; 
            levelManager.timeRemaining = levelManager.timeLimit; 
        }
    }
}