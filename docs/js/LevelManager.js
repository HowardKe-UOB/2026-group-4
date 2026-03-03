class LevelManager {
    constructor(difficulty, levelNum, player) {
        this.player = player;
        this.levelNum = levelNum;

        this.targetScore = levelNum === 1 ? 200 : 200 + (levelNum - 1) * 400;

        this.timeLimit = 20;
        this.timeRemaining = this.timeLimit;

        this.playerBoat = createVector(width / 2, 120);
        this.hook = new Hook(this.playerBoat.x, this.playerBoat.y);

        this.activeItems = [];
        this.spawnItems();
    }

    spawnItems() {
        this.activeItems = [];
        let totalMapValue = 0;
        let targetItemsCount = 15 + this.levelNum * 2;

        while (this.activeItems.length < targetItemsCount) {
            let newItem = null;
            let attempts = 0;
            let maxAttempts = 50;
            let isOverlapping = true;

            while (isOverlapping && attempts < maxAttempts) {
                let x = random(50, width - 50);
                let y = random(220, height - 80);
                let rand = random();

                if (rand < 0.5) {
                    newItem = new SmallFish(x, y);
                } else if (rand < 0.85) {
                    newItem = new FishBone(x, y);
                } else {
                    newItem = new Treasure(x, y);
                }

                isOverlapping = false;

                for (let existingItem of this.activeItems) {
                    let d = dist(
                        newItem.position.x,
                        newItem.position.y,
                        existingItem.position.x,
                        existingItem.position.y,
                    );

                    let safeDistance =
                        (newItem.width + existingItem.width) / 2 + 10;

                    if (d < safeDistance) {
                        isOverlapping = true;
                        break;
                    }
                }
                attempts++;
            }

            if (newItem) {
                this.activeItems.push(newItem);
                totalMapValue += newItem.scoreValue;
            }
        }

        console.log(
            `Level ${this.levelNum} generated: Target Score ${this.targetScore}, Total Map Value ${totalMapValue}, Total Items ${this.activeItems.length}`,
        );
    }

    update(deltaTime) {
        if (frameCount % 60 === 0 && this.timeRemaining > 0) {
            this.timeRemaining--;
        }

        for (let item of this.activeItems) {
            item.update();
        }

        let returnedItem = this.hook.update();
        if (returnedItem) {
            this.player.addScore(returnedItem.scoreValue);
            this.hook.attachedItem = null;
        }

        if (this.hook.state === HookState.MOVING_DOWN) {
            for (let i = this.activeItems.length - 1; i >= 0; i--) {
                let item = this.activeItems[i];
                let d = dist(
                    this.hook.position.x,
                    this.hook.position.y,
                    item.position.x,
                    item.position.y,
                );

                if (d < item.width / 2 + 10) {
                    if (item.canBeCaught) {
                        this.hook.grabItem(item);

                        this.activeItems.splice(i, 1);
                        break;
                    }
                }
            }
        }
        return this.checkWinCondition();
    }

    checkWinCondition() {
        if (this.timeRemaining <= 0) {
            return this.player.totalScore >= this.targetScore ? "PASS" : "FAIL";
        }
        return "PLAYING";
    }

    draw() {
        // 1. 基础游戏场景绘制
        push();
        imageMode(CORNER);
        image(bgImageLevel1, 0, 0, width, height);

        // 绘制小船
        fill(139, 69, 19);
        rectMode(CENTER);
        rect(this.playerBoat.x, this.playerBoat.y - 10, 40, 20);
        rect(this.playerBoat.x, this.playerBoat.y, 100, 30, 5);

        // 绘制鱼和钩子
        for (let item of this.activeItems) {
            item.draw();
        }
        this.hook.draw();
        pop();

        // ==========================================
        // 2. 精致 UI（字号缩小、慢速闪烁）
        // ==========================================
        push();
        let timeLeft = Math.ceil(this.timeRemaining || 0);
        
        textStyle(BOLD);
        textSize(24);            // 【修改】字号从 32 缩小到 24，更精致
        textFont('Verdana');

        // --- A. 绘制左上角分数 (深金色) ---
        let scoreTxt = `SCORE: ${this.player.totalScore} / ${this.targetScore}`;
        textAlign(LEFT, TOP);
        
        // 黑色细描边
        fill(0);
        text(scoreTxt, 19, 20); text(scoreTxt, 21, 20);
        text(scoreTxt, 20, 19); text(scoreTxt, 20, 21);
        
        // 主文字
        fill(255, 180, 0); 
        text(scoreTxt, 20, 20);

        // --- B. 绘制右上角时间 (蓝色 + 低频闪烁) ---
        let timeTxt = `TIME: ${timeLeft}`;
        textAlign(RIGHT, TOP);
        
        let timeAlpha = 255;
        if (timeLeft <= 5 && timeLeft > 0) {
            // 【修改】闪烁频率从 0.4 降到 0.15，变得更舒缓，不再那么频繁刺眼
            timeAlpha = 140 + 115 * abs(sin(frameCount * 0.15)); 
        }

        // 黑色细描边
        fill(0, 0, 0, timeAlpha);
        text(timeTxt, width - 19, 20); text(timeTxt, width - 21, 20);
        text(timeTxt, width - 20, 19); text(timeTxt, width - 20, 21);
        
        // 主文字颜色：柔和的蓝色
        if (timeLeft <= 5) {
            fill(100, 230, 255, timeAlpha); // 亮青蓝色
        } else {
            fill(100, 180, 255);             // 柔和天蓝色
        }
        text(timeTxt, width - 20, 20);

        pop();
    }
}
