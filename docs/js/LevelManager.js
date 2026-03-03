class LevelManager {
    constructor(difficulty, levelNum, player) {
        this.player = player;
        this.levelNum = levelNum;

        this.targetScore = levelNum === 1 ? 200 : 200 + (levelNum - 1) * 400;

        this.timeLimit = 20;
        this.timeRemaining = this.timeLimit;

        this.playerBoat = createVector(width / 2, 170);
        this.hook = new Hook(this.playerBoat.x, this.playerBoat.y);

        this.activeItems = [];
        this.spawnItems();
        
        // 存放屏幕上漂浮分数的数组
        this.floatingScores = [];
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
                    let d = dist(
                        newItem.position.x,
                        newItem.position.y,
                        existingItem.position.x,
                        existingItem.position.y,
                    );

                    let safeDistance =
                        (newItem.width + existingItem.width) / 2 + 20;

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
            `Level ${this.levelNum} generated. Total Items: ${this.activeItems.length}`,
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
            
            // 【触发特效】：加分的同时，在船上方生成飘字
            this.showCatchScore(returnedItem.scoreValue);
            
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
        // 1. 游戏场景绘制
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

        // ==========================================
        // 2. 经典矿工 UI (左两行，右一行)
        // ==========================================
        push();
        let timeLeft = Math.ceil(this.timeRemaining || 0);
        
        // 像素风排版配置
        textSize(18);             
        textFont('Courier New');  
        textStyle(BOLD);

        let leftX = 25;
        let rightX = width - 25;
        let line1Y = 20;          
        let line2Y = 45;          

        // --- 颜色定义 ---
        let primaryColor = color(0, 200, 150);     // 亮青绿色 (Money & Time)
        let secondaryColor = color(120, 160, 170); // 灰蓝色 (Goal)

        // --- 绘制左边 (MONEY 和 GOAL) ---
        textAlign(LEFT, TOP);
        this.drawPixelText(`MONEY: ${this.player.totalScore}`, leftX, line1Y, primaryColor);
        this.drawPixelText(`GOAL:  ${this.targetScore}`, leftX, line2Y, secondaryColor);

        // --- 绘制右边 (TIME) ---
        textAlign(RIGHT, TOP);
        
        // 闪烁逻辑 (最后5秒平缓闪烁)
        let tAlpha = 255;
        if (timeLeft <= 5 && timeLeft > 0) {
            tAlpha = 150 + 105 * sin(frameCount * 0.15);
        }
        this.drawPixelText(`TIME: ${timeLeft}`, rightX, line1Y, primaryColor, tAlpha);
        pop();

        // ==========================================
        // 3. 绘制加分飘字特效
        // ==========================================
        push();
        textAlign(CENTER, CENTER);
        textSize(22);
        textFont('Courier New');
        textStyle(BOLD);

        // 倒序遍历数组，方便在动画结束时删除元素
        for (let i = this.floatingScores.length - 1; i >= 0; i--) {
            let fs = this.floatingScores[i];
            
            // 绘制像素阴影
            fill(0, 0, 0, fs.alpha);
            text(fs.text, fs.x + 2, fs.y + 2);
            // 绘制主颜色：亮绿色表示加分
            fill(50, 255, 50, fs.alpha); 
            text(fs.text, fs.x, fs.y);
            
            // 动画更新：向上飘，并逐渐变透明
            fs.y -= 1.5;        
            fs.alpha -= 4;      
            fs.life -= 1;       
            
            // 如果动画结束或完全透明，从数组中移除
            if (fs.life <= 0 || fs.alpha <= 0) {
                this.floatingScores.splice(i, 1);
            }
        }
        pop();
    }

    // --- 像素风字体投影辅助函数 ---
    drawPixelText(txt, x, y, col, alpha = 255) {
        push();
        // 1. 绘制纯黑硬投影 (右下角偏移 2px)
        fill(0, 0, 0, alpha);
        text(txt, x + 2, y + 2);
        
        // 2. 绘制彩色主文字
        let finalCol = color(red(col), green(col), blue(col), alpha);
        fill(finalCol);
        text(txt, x, y);
        pop();
    }

    // --- 在船上方生成飘字 ---
    showCatchScore(points) {
        this.floatingScores.push({
            x: this.playerBoat.x,
            y: this.playerBoat.y - 40, 
            text: "+" + points,        
            alpha: 255,                
            life: 60                   
        });
    }
}