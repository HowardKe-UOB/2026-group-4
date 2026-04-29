class Player {
    constructor() {
        this.name = "";
        this.totalScore = 0;
        this.p1Score = 0; // P1 independent balance (two-player mode)
        this.p2Score = 0; // P2 independent balance (two-player mode)
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

    // Two-player mode: call when P1 captures an item
    addP1Score(amount) {
        this.p1Score += amount;
        this.totalScore += amount;
    }

    // Two-player mode: call when P2 captures an item
    addP2Score(amount) {
        this.p2Score += amount;
        this.totalScore += amount;
    }

    // Single-player purchase logic (original behavior)
    purchaseItem(shopItem) {
        if (this.totalScore >= shopItem.costPrice) {
            this.totalScore -= shopItem.costPrice;
            this.inventory.push(shopItem);
            return true;
        }
        return false;
    }

    // Two-player purchase logic: deduct only shared totalScore;
    // keep P1/P2 historical balances unchanged
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
