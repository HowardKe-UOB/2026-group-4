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

    consumeItem(shopItem) {
        //Logic for using items
    }
}
