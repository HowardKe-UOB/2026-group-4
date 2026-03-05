class LevelManager {
    constructor(difficulty, levelNum, player, playerMode = PlayerMode.SINGLE) {
        this.player = player;
        this.levelNum = levelNum;
        this.playerMode = playerMode;
        this.difficulty = difficulty; // 【保存难度供换背景使用】

        let baseTarget = levelNum === 1 ? 200 : 200 + (levelNum - 1) * 400;
        this.targetScore = this.playerMode === PlayerMode.TWO_PLAYER ? baseTarget * 1.5 : baseTarget;

        this.timeLimit = 20;
        this.timeRemaining = this.timeLimit;

        this.boats = [];
        this.hooks = [];
        this.scores = []; 

        // 分配专属钩子图片，如果没加载成功就用原来的
        let p1HookImg = typeof hookImg2 !== "undefined" ? hookImg2 : (typeof hookImg !== "undefined" ? hookImg : null);

        if (this.playerMode === PlayerMode.SINGLE) {
            let boatX = width / 2;
            this.boats.push(createVector(boatX, 155));
            this.hooks.push(new Hook(boatX, 155, p1HookImg)); 
            this.scores.push(0); 
            this.hook = this.hooks[0]; 
        } else {
            let boat1X = width * 0.3;
            let boat2X = width * 0.7;

            // 左边玩家 1 (用新武器)
            this.boats.push(createVector(boat1X, 155));
            this.hooks.push(new Hook(boat1X, 155, p1HookImg)); 
            this.scores.push(0);

            // 右边玩家 2 (用老武器)
            this.boats.push(createVector(boat2X, 155));
            this.hooks.push(new Hook(boat2X, 155, typeof hookImg !== "undefined" ? hookImg : null)); 
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
        let totalMapValue = 0;
        let multiplier = this.playerMode === PlayerMode.TWO_PLAYER ? 1.5 : 1;
        let targetItemsCount = Math.floor((15 + this.levelNum * 2) * multiplier);

        while (this.activeItems.length < targetItemsCount) {
            let newItem = null;
            let attempts = 0;
            let maxAttempts = 50;
            let isOverlapping = true;

            while (isOverlapping && attempts < maxAttempts) {
                let x = random(50, width - 50);
                let y;
                let rand = random();

                if (rand < 0.2) {
                    y = random(370, height - 80);
                    newItem = new BigFish(x, y);
                } else if (rand < 0.6) {
                    y = random(220, height - 80);
                    newItem = new SmallFish(x, y);
                } else if (rand < 0.8) {
                    y = random(220, height - 80);
                    newItem = new FishBone(x, y);
                } else {
                    y = random(height - 60, height - 25);
                    newItem = new Treasure(x, y);
                }

                isOverlapping = false;
                for (let existingItem of this.activeItems) {
                    let d = dist(newItem.position.x, newItem.position.y, existingItem.position.x, existingItem.position.y);
                    let safeDistance = (newItem.width + existingItem.width) / 2 + 20;
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
                this.showCatchScore(returnedItem.scoreValue, this.boats[i].x, this.boats[i].y);
                currentHook.attachedItem = null;
            }

            if (currentHook.state === HookState.MOVING_DOWN) {
                for (let j = this.activeItems.length - 1; j >= 0; j--) {
                    let item = this.activeItems[j];
                    let d = dist(currentHook.position.x, currentHook.position.y, item.position.x, item.position.y);

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
        
        // 简单模式且双人时，使用新背景 ocean_bg2
        if (this.difficulty === Difficulty.EASY && this.playerMode === PlayerMode.TWO_PLAYER) {
            if (typeof bgImageLevel2 !== "undefined") {
                image(bgImageLevel2, 0, 0, width, height);
            } else {
                background(30, 144, 255);
            }
        } else {
            if (typeof bgImageLevel1 !== "undefined") {
                image(bgImageLevel1, 0, 0, width, height);
            } else {
                background(30, 144, 255);
            }
        }

        imageMode(CENTER);
        for (let i = 0; i < this.boats.length; i++) {
            push(); 
            // 海浪摇摆 (慢速版)
            let waveSpeed = frameCount * 0.015; 
            let phaseOffset = this.boats[i].x * 0.01; 
            let bobY = sin(waveSpeed + phaseOffset) * 4; 
            let rockAngle = cos(waveSpeed * 0.8 + phaseOffset) * 0.04; 
            
            translate(this.boats[i].x, this.boats[i].y + bobY);
            rotate(rockAngle);

            // 左侧玩家(或单人)使用新图片 boatImg2
            if (i === 0 && typeof boatImg2 !== "undefined" && boatImg2) {
                image(boatImg2, 0, 0, 220, 220);
            } 
            else if (typeof boatImg !== "undefined" && boatImg) {
                image(boatImg, 0, 0, 220, 220);
            } 
            else {
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
            this.drawPixelText(`MONEY: ${this.player.totalScore}`, leftX, line1Y, this.cMoney);
            
            let goalX = width - 160; 
            this.drawPixelText(`GOAL: ${this.targetScore}`, goalX, line1Y, this.cPrimary);
            this.drawPixelText(`TIME: ${timeLeft}`, goalX, line2Y, this.cP1, tAlpha);
            
            this._pauseBtnBounds.cx = width - 35; 
            this._pauseBtnBounds.cy = line1Y + 12; 
        } else {
            textAlign(LEFT, TOP);
            this.drawPixelText(`P1: ${this.scores[0]}`, leftX, line1Y, this.cP1);
            textAlign(RIGHT, TOP);
            this.drawPixelText(`P2: ${this.scores[1]}`, rightX, line1Y, this.cP2);
            textAlign(CENTER, TOP);
            this.drawPixelText(`GOAL: ${this.targetScore}`, centerX, line1Y, this.cSecondary);
            this.drawPixelText(`TIME: ${timeLeft}`, centerX, line2Y, this.cPrimary, tAlpha);

            this._pauseBtnBounds.cx = centerX + 110; 
            this._pauseBtnBounds.cy = line1Y + 12; 
        }

        // 暂停按钮
        const btnSize = 24;
        const isPaused = this.gameManager && this.gameManager.gamePaused;
        noStroke();
        fill(0, 0, 0, 150);
        rect(this._pauseBtnBounds.cx - btnSize / 2 + 2, this._pauseBtnBounds.cy - btnSize / 2 + 2, btnSize, btnSize, 4);
        fill(0, 200, 150);
        rect(this._pauseBtnBounds.cx - btnSize / 2, this._pauseBtnBounds.cy - btnSize / 2, btnSize, btnSize, 4);
        
        fill(255);
        if (isPaused) {
            triangle(this._pauseBtnBounds.cx - 5, this._pauseBtnBounds.cy - 6, this._pauseBtnBounds.cx - 5, this._pauseBtnBounds.cy + 6, this._pauseBtnBounds.cx + 4, this._pauseBtnBounds.cy);
        } else {
            rect(this._pauseBtnBounds.cx - 6, this._pauseBtnBounds.cy - 6, 4, 12);
            rect(this._pauseBtnBounds.cx + 2, this._pauseBtnBounds.cy - 6, 4, 12);
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