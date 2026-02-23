class LevelManager {
    constructor(difficulty, levelNum, player) {
        this.player = player;
        this.levelNum = levelNum; // 【修复了这里的变量保存】

        // 目标分数随关卡数增加
        this.targetScore = levelNum * 500 + (levelNum - 1) * 200;

        this.timeLimit = difficulty === Difficulty.HARD ? 45 : 60;
        this.timeRemaining = this.timeLimit;

        // 船的坐标保持在海面上
        this.playerBoat = createVector(width / 2, 120);
        this.hook = new Hook(this.playerBoat.x, this.playerBoat.y);
        
        this.activeItems = [];
        this.spawnItems();
    }

    spawnItems() {
        this.activeItems = [];
        let totalMapValue = 0; 
        let guaranteedValue = this.targetScore * 1.3; 
        let minItemsCount = 15; 

        // 只要物品不够15个，或者总金币不够保底，就继续生成
        while (this.activeItems.length < minItemsCount || totalMapValue < guaranteedValue) {
            let x = random(50, width - 50);
            let y = random(220, height - 80); 
            let rand = random();
            let newItem;

            if (rand < 0.25) { newItem = new SmallFish(x, y); }         
            else if (rand < 0.40) { newItem = new ClownFish(x, y); }    
            else if (rand < 0.65) { newItem = new Starfish(x, y); }     
            else if (rand < 0.75) { newItem = new Crab(x, y); }         
            else if (rand < 0.90) { newItem = new FishBone(x, y); }     
            else { newItem = new Treasure(x, y); }    

            this.activeItems.push(newItem);
            totalMapValue += newItem.scoreValue; 
        }
        
        // 【已修复】现在可以正确在控制台打印发了多少金币了
        console.log(`第 ${this.levelNum} 关生成完毕：目标分 ${this.targetScore}，全图总金币 ${totalMapValue}，共 ${this.activeItems.length} 个物品`);
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
                let d = dist(this.hook.position.x, this.hook.position.y, item.position.x, item.position.y);
                
                if (d < item.width / 2 + 10) {
                    if (item.canBeCaught) {
                        this.hook.grabItem(item);
                        // 抓到一个少一个
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

        if (bgImageLevel1) {
            image(bgImageLevel1, 0, 0, width, height);
        } else {
            fill(135, 206, 235);
            rectMode(CORNER);
            rect(0, 50, width, height - 50);
        }

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