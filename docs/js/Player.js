class Player {
    constructor() {
        this.name = "";
        this.totalScore = 0;
        this.p1Score = 0; // P1 独立余额（双人模式）
        this.p2Score = 0; // P2 独立余额（双人模式）
        this.inventory = [];
        this.hasSubmarine = false;
        this.hasClover = false;
        this.hasFishboneCollector = false;
        this.hasLuckyCoin = false;
        this.hasClubCard = false;
    }

    addScore(amount) {
        this.totalScore += amount;
    }

    // 双人模式：P1 捕获物品时调用
    addP1Score(amount) {
        this.p1Score += amount;
        this.totalScore += amount;
    }

    // 双人模式：P2 捕获物品时调用
    addP2Score(amount) {
        this.p2Score += amount;
        this.totalScore += amount;
    }

    // 单人购买逻辑（原逻辑）
    purchaseItem(shopItem) {
        if (this.totalScore >= shopItem.costPrice) {
            this.totalScore -= shopItem.costPrice;
            this.inventory.push(shopItem);
            return true;
        }
        return false;
    }

    // 双人购买逻辑：改为只扣除共享总金额 (totalScore)，P1和P2的历史记录不减少
    purchaseItemTwoPlayer(shopItem) {
        return this.purchaseItem(shopItem);
    }

    consumeItems(levelManager) {
        for (let item of this.inventory) {
            item.applyEffect(levelManager);
        }
        this.inventory = [];
    }
}
