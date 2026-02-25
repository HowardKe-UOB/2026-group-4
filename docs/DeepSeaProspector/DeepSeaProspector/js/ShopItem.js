class ShopItem {
    constructor(name, costPrice, description) {
        this.name = name;
        this.costPrice = costPrice;
        this.description = description;
        this.purchased = false;
    }

    applyEffect(levelManager) {
        if (this.name === "Strength Potion") {
            levelManager.hook.moveSpeed *= 2;
        }
    }
}
