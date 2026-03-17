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
        // 旧版双人购买逻辑，先扣p1，再扣p2
        // const cost = shopItem.costPrice;
        // if (this.p1Score + this.p2Score < cost) {
        //     return false; // 两人合计仍不够
        // }
        // if (this.p1Score >= cost) {
        //     // P1 余额充足，全从 P1 扣
        //     this.p1Score -= cost;
        // } else {
        //     // P1 余额不足，先清空 P1，剩余从 P2 扣
        //     let remainder = cost - this.p1Score;
        //     this.p1Score = 0;
        //     this.p2Score -= remainder;
        // }
        // this.totalScore -= cost;
        // this.inventory.push(shopItem);
        // return true;
    }

    consumeItems(levelManager) {
        for (let item of this.inventory) {
            item.applyEffect(levelManager);
        }
        this.inventory = [];
    }
}
