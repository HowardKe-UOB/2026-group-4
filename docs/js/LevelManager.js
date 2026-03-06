class LevelManager {
    constructor(difficulty, levelNum, player, playerMode = PlayerMode.SINGLE) {
        this.player = player;
        this.levelNum = levelNum;
        this.playerMode = playerMode;
        this.difficulty = difficulty; // 区分困难和简单

        // 1. 目标分数计算逻辑
        let baseTarget = levelNum === 1 ? 200 : 200 + (levelNum - 1) * 400;

        // 【新增】：困难模式下，目标分数提高，时间减少
        if (this.difficulty === Difficulty.HARD) {
            baseTarget = Math.floor(baseTarget * 1.3); // 分数要求提高 30%
            this.timeLimit = Math.max(15, 25 - levelNum); // 困难模式时间更少，且随关卡递减
        } else {
            this.timeLimit = 20 + (levelNum > 1 ? 5 : 0); // 简单模式时间相对充裕
        }

        this.targetScore =
            this.playerMode === PlayerMode.TWO_PLAYER
                ? baseTarget * 1.5
                : baseTarget;
        this.timeRemaining = this.timeLimit;

        this.boats = [];
        this.hooks = [];
        this.scores = [];

        // 分配专属钩子图片，如果没加载成功就用原来的
        let p1HookImg =
            typeof hookImg2 !== "undefined"
                ? hookImg2
                : typeof hookImg !== "undefined"
                  ? hookImg
                  : null;

        if (this.playerMode === PlayerMode.SINGLE) {
            let boatX = width / 2;
            this.boats.push(createVector(boatX, 155));
            this.hooks.push(new Hook(boatX, 155, p1HookImg));
            this.scores.push(0);
            this.hook = this.hooks[0];
        } else {
            let boat1X = width * 0.3;
            let boat2X = width * 0.7;

            this.boats.push(createVector(boat1X, 155));
            this.hooks.push(new Hook(boat1X, 155, p1HookImg));
            this.scores.push(0);

            this.boats.push(createVector(boat2X, 155));
            this.hooks.push(
                new Hook(
                    boat2X,
                    155,
                    typeof hookImg !== "undefined" ? hookImg : null,
                ),
            );
            this.scores.push(0);

            this.hook1 = this.hooks[0];
            this.hook2 = this.hooks[1];
        }

        this.activeItems = [];
        this.spawnItems();
        this.floatingScores = [];

        // UI颜色缓存
        this.cPrimary = color(0, 200, 150);
        this.cP1 = color(255, 150, 50);
        this.cP2 = color(50, 150, 255);
        this.cSecondary = color(255, 215, 0);
        this.cMoney = color(255, 220, 50);
        this._pauseBtnBounds = { cx: 0, cy: 0, w: 24, h: 24 };
    }

    spawnItems() {
        this.activeItems = [];
        let dynamicItems = [];
        let staticItems = [];

        let isHard = this.difficulty === Difficulty.HARD;
        let multiplier = this.playerMode === PlayerMode.TWO_PLAYER ? 1.5 : 1;

        // 碰撞检测辅助函数
        const checkOverlap = (newItem, list, padding) => {
            for (let item of list) {
                let d = dist(
                    newItem.position.x,
                    newItem.position.y,
                    item.position.x,
                    item.position.y,
                );
                let safeDistance = (newItem.width + item.width) / 2 + padding;
                if (d < safeDistance) return true;
            }
            return false;
        };

        let treasureCount = Math.floor(
            random(isHard ? 2 : 3, isHard ? 4 : 5) * multiplier,
        );
        let looseStoneCount = Math.floor(
            (isHard ? 3 + this.levelNum : 2) * multiplier,
        );
        let fishCount = Math.floor((12 + this.levelNum * 2) * multiplier);

        for (let i = 0; i < treasureCount; i++) {
            let attempts = 0;
            while (attempts < 30) {
                let tx = random(80, width - 80);
                let ty = height - random(30, 80);
                let treasure = new Treasure(tx, ty);

                if (!checkOverlap(treasure, staticItems, 40)) {
                    this.activeItems.push(treasure);
                    staticItems.push(treasure);

                    if (isHard) {
                        let guardCount = floor(
                            random(1, Math.min(4, 1 + this.levelNum * 0.5)),
                        );

                        for (let j = 0; j < guardCount; j++) {
                            // 在宝箱上方的半圆区域 (PI 到 TWO_PI) 生成石头形成“保护罩”
                            let angle = random(PI + 0.2, TWO_PI - 0.2);
                            let distance = random(60, 110); // 距离宝箱的半径

                            let sx = tx + cos(angle) * distance;
                            let sy = ty + sin(angle) * distance;

                            // 确保石头不要飞出屏幕或离水面太近
                            if (
                                sx > 40 &&
                                sx < width - 40 &&
                                sy > 200 &&
                                sy < height - 20
                            ) {
                                let stone = new Stone(sx, sy);
                                if (!checkOverlap(stone, staticItems, 10)) {
                                    this.activeItems.push(stone);
                                    staticItems.push(stone);
                                }
                            }
                        }
                    }
                    break;
                }
                attempts++;
            }
        }

        // 4. 生成散落的石头和鱼骨 (增加底层和中层障碍)
        for (let i = 0; i < looseStoneCount; i++) {
            let attempts = 0;
            while (attempts < 20) {
                let sx = random(50, width - 50);
                let sy = random(250, height - 20);

                // 随机决定是石头还是鱼骨
                let obstacle =
                    random() > 0.3 ? new Stone(sx, sy) : new FishBone(sx, sy);

                if (!checkOverlap(obstacle, staticItems, 20)) {
                    this.activeItems.push(obstacle);
                    staticItems.push(obstacle);
                    break;
                }
                attempts++;
            }
        }

        for (let i = 0; i < fishCount; i++) {
            let attempts = 0;
            while (attempts < 30) {
                let fx = random(50, width - 50);
                let fy = random(180, height - 100);

                let fish =
                    random() > 0.3
                        ? new SmallFish(fx, fy)
                        : new BigFish(fx, fy);

                if (isHard) {
                    fish.speed *= random(1.3, 1.8);
                }

                if (!checkOverlap(fish, dynamicItems, 5)) {
                    this.activeItems.push(fish);
                    dynamicItems.push(fish);
                    break;
                }
                attempts++;
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

        for (let i = 0; i < this.hooks.length; i++) {
            let currentHook = this.hooks[i];
            let returnedItem = currentHook.update();

            if (returnedItem) {
                this.scores[i] += returnedItem.scoreValue;
                this.player.addScore(returnedItem.scoreValue);
                this.showCatchScore(
                    returnedItem.scoreValue,
                    this.boats[i].x,
                    this.boats[i].y,
                );
                currentHook.attachedItem = null;
            }

            if (currentHook.state === HookState.MOVING_DOWN) {
                for (let j = this.activeItems.length - 1; j >= 0; j--) {
                    let item = this.activeItems[j];
                    let d = dist(
                        currentHook.position.x,
                        currentHook.position.y,
                        item.position.x,
                        item.position.y,
                    );

                    if (d < item.width / 2 + 10) {
                        if (item.canBeCaught) {
                            currentHook.grabItem(item);
                            this.activeItems.splice(j, 1);
                            break;
                        }
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

        if (this.difficulty === Difficulty.HARD) {
            if (typeof bgImageLevel2 !== "undefined" && bgImageLevel2) {
                image(bgImageLevel2, 0, 0, width, height);
            } else {
                background(20, 60, 120);
            }
        } else {
            if (typeof bgImageLevel1 !== "undefined" && bgImageLevel1) {
                image(bgImageLevel1, 0, 0, width, height);
            } else {
                background(30, 144, 255);
            }
        }

        imageMode(CENTER);
        for (let i = 0; i < this.boats.length; i++) {
            push();

            let waveSpeed = frameCount * 0.015;
            let phaseOffset = this.boats[i].x * 0.01;
            let bobY = sin(waveSpeed + phaseOffset) * 4;
            let rockAngle = cos(waveSpeed * 0.8 + phaseOffset) * 0.04;

            translate(this.boats[i].x, this.boats[i].y + bobY);
            rotate(rockAngle);

            if (i === 0 && typeof boatImg2 !== "undefined" && boatImg2) {
                image(boatImg2, 0, 0, 220, 220);
            } else if (typeof boatImg !== "undefined" && boatImg) {
                image(boatImg, 0, 0, 220, 220);
            } else {
                fill(100, 50, 0);
                rect(-50, -20, 100, 40);
            }
            pop();
            this.hooks[i].draw();
        }

        for (let item of this.activeItems) {
            item.draw();
        }
        pop();

        // --- 干净的 UI 绘制代码 (已剔除导致黑屏的重复代码) ---
        push();
        let timeLeft = Math.ceil(this.timeRemaining || 0);
        textSize(18);
        textFont("Courier New");
        textStyle(BOLD);

        let leftX = 25;
        let rightX = width - 25;
        let centerX = width / 2;
        let line1Y = 20;
        let line2Y = 45;

        let tAlpha = 255;
        if (timeLeft <= 5 && timeLeft > 0) {
            tAlpha = 150 + 105 * sin(frameCount * 0.15);
        }

        if (this.playerMode === PlayerMode.SINGLE) {
            textAlign(LEFT, TOP);
            this.drawPixelText(
                `MONEY: ${this.player.totalScore}`,
                leftX,
                line1Y,
                this.cMoney,
            );

            let goalX = width - 160;
            this.drawPixelText(
                `GOAL: ${this.targetScore}`,
                goalX,
                line1Y,
                this.cPrimary,
            );
            this.drawPixelText(
                `TIME: ${timeLeft}`,
                goalX,
                line2Y,
                this.cP1,
                tAlpha,
            );

            this._pauseBtnBounds.cx = width - 35;
            this._pauseBtnBounds.cy = line1Y + 12;
        } else {
            textAlign(LEFT, TOP);
            this.drawPixelText(
                `P1: ${this.scores[0]}`,
                leftX,
                line1Y,
                this.cP1,
            );
            textAlign(RIGHT, TOP);
            this.drawPixelText(
                `P2: ${this.scores[1]}`,
                rightX,
                line1Y,
                this.cP2,
            );
            textAlign(CENTER, TOP);
            this.drawPixelText(
                `GOAL: ${this.targetScore}`,
                centerX,
                line1Y,
                this.cSecondary,
            );
            this.drawPixelText(
                `TIME: ${timeLeft}`,
                centerX,
                line2Y,
                this.cPrimary,
                tAlpha,
            );

            this._pauseBtnBounds.cx = centerX + 110;
            this._pauseBtnBounds.cy = line1Y + 12;
        }

        // 暂停按钮
        const btnSize = 24;
        const isPaused = this.gameManager && this.gameManager.gamePaused;
        noStroke();
        fill(0, 0, 0, 150);
        rect(
            this._pauseBtnBounds.cx - btnSize / 2 + 2,
            this._pauseBtnBounds.cy - btnSize / 2 + 2,
            btnSize,
            btnSize,
            4,
        );
        fill(0, 200, 150);
        rect(
            this._pauseBtnBounds.cx - btnSize / 2,
            this._pauseBtnBounds.cy - btnSize / 2,
            btnSize,
            btnSize,
            4,
        );

        fill(255);
        if (isPaused) {
            triangle(
                this._pauseBtnBounds.cx - 5,
                this._pauseBtnBounds.cy - 6,
                this._pauseBtnBounds.cx - 5,
                this._pauseBtnBounds.cy + 6,
                this._pauseBtnBounds.cx + 4,
                this._pauseBtnBounds.cy,
            );
        } else {
            rect(
                this._pauseBtnBounds.cx - 6,
                this._pauseBtnBounds.cy - 6,
                4,
                12,
            );
            rect(
                this._pauseBtnBounds.cx + 2,
                this._pauseBtnBounds.cy - 6,
                4,
                12,
            );
        }
        pop();

        // 飘字
        push();
        textAlign(CENTER, CENTER);
        textSize(22);
        textFont("Courier New");
        textStyle(BOLD);

        for (let i = this.floatingScores.length - 1; i >= 0; i--) {
            let fs = this.floatingScores[i];
            fill(0, 0, 0, fs.alpha);
            text(fs.text, fs.x + 2, fs.y + 2);
            fill(50, 255, 50, fs.alpha);
            text(fs.text, fs.x, fs.y);

            fs.y -= 1.5;
            fs.alpha -= 4;
            fs.life -= 1;

            if (fs.life <= 0 || fs.alpha <= 0) {
                this.floatingScores.splice(i, 1);
            }
        }
        pop();
    }

    drawPixelText(txt, x, y, col, alpha = 255) {
        push();
        fill(0, 0, 0, alpha);
        text(txt, x + 2, y + 2);
        fill(red(col), green(col), blue(col), alpha);
        text(txt, x, y);
        pop();
    }

    showCatchScore(points, x, y) {
        this.floatingScores.push({
            x: x,
            y: y - 40,
            text: "+" + points,
            alpha: 255,
            life: 60,
        });
    }
}
