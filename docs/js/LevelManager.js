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
        push();

        imageMode(CORNER);
        image(bgImageLevel1, 0, 0, width, height);

        fill(139, 69, 19);
        rectMode(CENTER);
        rect(this.playerBoat.x, this.playerBoat.y - 10, 40, 20);
        rect(this.playerBoat.x, this.playerBoat.y, 100, 30, 5);

        for (let item of this.activeItems) {
            item.draw();
        }

        this.hook.draw();
        pop();

        fill(255);
        textSize(20);
        textAlign(LEFT, TOP);
        text(`Score: ${this.player.totalScore} / ${this.targetScore}`, 10, 10);
        textAlign(RIGHT, TOP);
        text(`Time: ${this.timeRemaining}`, width - 10, 10);
    }
}
