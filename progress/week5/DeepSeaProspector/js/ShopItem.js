class ShopItem {
    constructor(name, costPrice, description) {
        this.name = name;
        this.costPrice = costPrice;
        this.description = description;
        this.purchased = false; // 用于标记这关是否已经买过了
    }

    // 传入整个 levelManager，这样既可以改钩子速度，以后也可以改倒计时等
    applyEffect(levelManager) {
        if (this.name === "Strength Potion") {
            levelManager.hook.moveSpeed *= 2; // 力量药水：让钩子回收速度翻倍
        }
        //后续添加
    }
}