class Player {
    constructor() {
        this.name = "";
        this.totalScore = 0;
        this.inventory = [];
    }

    addScore(amount) {
        this.totalScore += amount;
    }

    purchaseItem(shopItem) {
        if (this.totalScore >= shopItem.costPrice) {
            this.totalScore -= shopItem.costPrice;
            this.inventory.push(shopItem);
            return true;
        }
        return false;
    }

    consumeItems(levelManager) {
        for (let item of this.inventory) {
            item.applyEffect(levelManager);
        }
        // 因为当前“力量药水”道具有效期只有1关，应用完效果后清空玩家的背包
        this.inventory = [];
    }
}
