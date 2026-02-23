class LevelManager {
    // Pass in the player object
    constructor(difficulty, levelNum, player) {
        this.player = player;

        // The target score increases with the level number
        this.targetScore = levelNum * 500 + (levelNum - 1) * 200;

        this.timeLimit = difficulty === Difficulty.HARD ? 45 : 60;
        this.timeRemaining = this.timeLimit;

        this.playerBoat = createVector(width / 2, 50);
        this.hook = new Hook(this.playerBoat.x, this.playerBoat.y);
        this.activeItems = [];

        this.spawnItems();
    }

    spawnItems() {
        this.activeItems = [];
        let totalItems = 15;

        for (let i = 0; i < totalItems; i++) {
            let x = random(50, width - 50);
            let y = random(150, height - 50);

            let rand = random();
            if (rand < 0.5) {
                this.activeItems.push(new Fish(x, y));
            } else if (rand < 0.7) {
                this.activeItems.push(new Treasure(x, y));
            } else {
                this.activeItems.push(new Junk(x, y));
            }
        }
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
            // Add the score directly to the player's total score.
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
                if (d < 30) {
                    this.hook.grabItem(item);
                    this.activeItems.splice(i, 1);
                    break;
                }
            }
        }
        return this.checkWinCondition();
    }

    checkWinCondition() {
        if (this.timeRemaining <= 0) {
            // At settlement, check if the player's total score has reached the target score for the current level
            return this.player.totalScore >= this.targetScore ? "PASS" : "FAIL";
        }
        return "PLAYING";
    }

    draw() {
        fill(135, 206, 235);
        rectMode(CORNER);
        rect(0, 50, width, height - 50);

        fill(139, 69, 19);
        rectMode(CENTER);
        rect(this.playerBoat.x, this.playerBoat.y, 100, 40);

        for (let item of this.activeItems) {
            item.draw();
        }

        this.hook.draw();

        fill(255);
        textSize(20);
        textAlign(LEFT, TOP);
        text(`Score: ${this.player.totalScore} / ${this.targetScore}`, 10, 10);
        textAlign(RIGHT, TOP);
        text(`Time: ${this.timeRemaining}`, width - 10, 10);
    }
}
