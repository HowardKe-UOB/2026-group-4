class ShopItem {
    constructor(name, basePrice, description, levelNum = 1, player = null) {
        this.name = name;
        this.description = description;
        this.purchased = false;
        this.isDiscounted = false;
        this.clubCardOff = 0;
        this.clubDiscountText = "";

        // 涨价系数
        let inflationRate = 0.10; // 常规商品每关涨价系数
        
        if (this.name === "Laser Sight" || this.name === "Lucky Coin") {
            inflationRate = 0;    // Laser/幸运金币不涨价
        } else if (this.name === "Submarine") {
            inflationRate = 0.03; // 潜水艇涨价系数
        } else if (this.name === "Four-Leaf Clover" || this.name === "Fishbone Collector") {
            inflationRate = 0.05; // 四叶草/鱼骨收藏书涨价系数
        }
        // 计算通胀后的价格，从11关起，停止涨价
        let inflationLevel = Math.min(levelNum, 11);
        // 计算倍率：1 + (当前关卡-1) * 涨幅系数
        let multiplier = 1 + (inflationLevel - 1) * inflationRate;
        this.baseInflatedPrice = Math.floor(basePrice * multiplier);
        let currentPrice = this.baseInflatedPrice;

        // 存储未打折前的价格
        this.baseInflatedPrice = Math.floor(basePrice * multiplier);

        // 随机打折机制，10% 的概率触发 5 折，潜水艇不参与打折
        if (this.name !== "Submarine" && Math.random() <= 0.1) {
            this.isDiscounted = true;
            currentPrice *= 0.5;
        }

        this.costPrice = Math.floor(currentPrice);

        if (player && player.hasClubCard) {
            this.applyClubCardDiscount(player);
        }
    }

    // 提供一个公共方法，方便购买会员卡后立即刷新店里其他商品
    applyClubCardDiscount(player) {
        if (player.hasClubCard && this.name !== "Club Card" && this.clubCardOff === 0) {
            // 随机 7~9折 额外折扣
            let discounts = [10, 20, 30]; 
            this.clubCardOff = discounts[Math.floor(Math.random() * discounts.length)]; 
            let multiplier = 1 - (this.clubCardOff / 100);
            this.costPrice = Math.floor(this.costPrice * multiplier);
            // 记录要显示的文字
            this.clubDiscountText = `Club card accepted: extra ${this.clubCardOff}% off!`;
        }
    }

    applyEffect(levelManager) {
        // 遍历所有钩子，确保单/双人模式都能生效
        if (levelManager.hooks && levelManager.hooks.length > 0) {
            levelManager.hooks.forEach(h => {
                if (this.name === "Strength Potion") {
                    h.retractMultiplier = 1.5; // 提升所有玩家的回拉速度
                }
                if (this.name === "Laser Sight") {
                    h.hasLaser = true; // 所有玩家获得激光
                    h.swingSpeedMultiplier = 0.6; // 将摆动速度降为原来的 60%
                }
            });
        }

        // 沙漏增加时间逻辑
        if (this.name === "Sand Clock") {
            // 计算要增加的时间：7 + 当前关卡数，最高+15秒。
            let bonus = 7 + levelManager.levelNum;
            levelManager.timeLimit += Math.min(15, bonus);
            levelManager.timeRemaining = levelManager.timeLimit;
        }

        // 潜水艇：永久解锁深海模式（持久化在 player 上）
        if (this.name === "Submarine") {
            levelManager.player.hasSubmarine = true;
        }

        // 四叶草：永久解锁
        if (this.name === "Four-Leaf Clover") {
            levelManager.player.hasClover = true;
        }

        // 鱼骨收藏书：永久解锁
        if (this.name === "Fishbone Collector") {
            levelManager.player.hasFishboneCollector = true;
        }

        // 幸运金币
        if (this.name === "Lucky Coin") {
            levelManager.player.hasLuckyCoin = true; 
        }

        // 会员卡
        if (this.name === "Club Card"){
            levelManager.player.hasClubCard = true;
        } 
    }
}