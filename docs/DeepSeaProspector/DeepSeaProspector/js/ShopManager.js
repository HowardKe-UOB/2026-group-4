class ShopManager {
    constructor() {
        this.availableItems = [
            new ShopItem("Strength Potion", 100, "Pulls items faster"),
            new ShopItem("Bomb", 200, "Destroys rocks"),
        ];
    }

    buyItem(player, shopItem) {
        return player.purchaseItem(shopItem);
    }
}
