class ShopItem {
    constructor(name, basePrice, description, levelNum = 1) {
        this.name = name;
        this.description = description;
        this.purchased = false;
        this.isDiscounted = false;

        // 涨价系数
        let inflationRate = 0.15; // 每关涨价系数
        
        if (this.name === "Laser Sight") {
            inflationRate = 0;    // Laser不涨价
        } else if (this.name === "Submarine") {
            inflationRate = 0.05; // 潜水艇涨价系数
        }

        // --- 2. 计算通胀后的价格 ---
        // 从11关起，停止涨价
        let inflationLevel = Math.min(levelNum, 11);
        // 计算倍率：1 + (当前关卡-1) * 涨幅系数
        let multiplier = 1 + (inflationLevel - 1) * inflationRate;
        let finalPrice = Math.floor(basePrice * multiplier);

        // 随机打折机制，10% 的概率触发 5 折，潜水艇不参与打折
        if (this.name !== "Submarine" && Math.random() < 0.10) {
            finalPrice = Math.floor(finalPrice * 0.5);
            this.isDiscounted = true;
        }
        this.costPrice = finalPrice;
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

        // 潜水艇：永久解锁深海模式（持久化在 player 上）
        if (this.name === "Submarine") {
            levelManager.player.hasSubmarine = true;
        }
    }
}