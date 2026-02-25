class GameManager {
    constructor() {
        this.player = new Player();
        this.currentState = GameState.TITLE_SCREEN;
        this.currentDifficulty = Difficulty.NORMAL;
        this.highScoreManager = new HighScoreManager();
        this.shopManager = new ShopManager();
        this.levelManager = null;
        this.levelNum = 1;

        this.inputText = ""; // 用于输入名字
    }

    startGame() {
        this.player.totalScore = 0;
        this.levelNum = 1;
        this.startLevel();
    }

    startLevel() {
        // 传入 this.player
        this.levelManager = new LevelManager(
            this.currentDifficulty,
            this.levelNum,
            this.player,
        );
        this.changeState(GameState.PLAYING);
    }

    changeState(newState) {
    this.currentState = newState;

    // 定义哪些状态属于“菜单界面”
    const menuStates = [
        GameState.TITLE_SCREEN, 
        GameState.NAME_ENTRY, 
        GameState.DIFFICULTY_SELECT,
        GameState.SHOP // 如果你希望商店也有音乐，也可以加在这里
    ];

    if (menuStates.includes(this.currentState)) {
        // 如果在菜单状态，且音乐没在播，就让它播
        if (titleBgm && !titleBgm.isPlaying()) {
            titleBgm.loop();
        }
    } else if (this.currentState === GameState.PLAYING) {
        // 进入关卡，停止主页音乐
        if (titleBgm && titleBgm.isPlaying()) {
            titleBgm.stop();
        }
    }
    }

    update() {
        background(30, 144, 255); // 海水蓝背景

        switch (this.currentState) {
            case GameState.TITLE_SCREEN:
                this.drawTitleScreen();
                break;
            case GameState.NAME_ENTRY:
                this.drawNameEntry();
                break;
            case GameState.DIFFICULTY_SELECT:
                this.drawDifficultySelect();
                break;
            case GameState.PLAYING:
                let result = this.levelManager.update();
                this.levelManager.draw();

                if (result === "PASS") {
                    // 注意：这里删除了之前加分的代码，因为 LevelManager 里已经实时把分数加给 player 了
                    this.changeState(GameState.SHOP);
                } else if (result === "FAIL") {
                    // 记录最终得分到排行榜
                    this.highScoreManager.checkNewHighScore(
                        this.player.totalScore,
                        this.player.name || "Anon",
                    );
                    this.changeState(GameState.LEVEL_RESULT);
                }
                break;
            case GameState.SHOP:
                this.drawShop();
                break;
            case GameState.LEVEL_RESULT:
                this.drawLevelResult();
                break;
            case GameState.HIGH_SCORE:
                this.drawHighScore();
                break;
        }
    }

    // --- 各个画面的绘制逻辑 ---
    drawTitleScreen() {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(40);
        text("DEEP SEA PROSPECTOR", width / 2, height / 2 - 50);
        textSize(20);
        text("Click anywhere to start", width / 2, height / 2 + 50);
    }

    drawNameEntry() {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(30);
        text("Your name please:", width / 2, height / 2 - 50);

        fill(200);
        rectMode(CENTER);
        rect(width / 2, height / 2, 200, 40);
        fill(0);
        text(
            this.inputText + (frameCount % 60 < 30 ? "|" : ""),
            width / 2,
            height / 2,
        );

        fill(255);
        text("Press ENTER to confirm", width / 2, height / 2 + 80);
    }

    drawDifficultySelect() {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(30);
        text("Select Difficulty", width / 2, height / 4);

        // Normal Button
        fill(100, 200, 100);
        rect(width / 2, height / 2 - 40, 200, 50);
        fill(0);
        text("NORMAL", width / 2, height / 2 - 40);

        // Hard Button
        fill(200, 100, 100);
        rect(width / 2, height / 2 + 40, 200, 50);
        fill(0);
        text("HARD", width / 2, height / 2 + 40);
    }

    drawShop() {
        // 直接调用 shopManager 中的绘制，并把 player 传入进去，读取金币
        this.shopManager.draw(this.player); 
    }

    drawLevelResult() {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(40);
        text("LEVEL FAILED!", width / 2, height / 2 - 50);
        textSize(20);
        text("Click to view High Scores", width / 2, height / 2 + 50);
    }

    drawHighScore() {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(30);
        text("HIGH SCORES", width / 2, 50);

        let y = 120;
        textSize(20);
        for (let i = 0; i < this.highScoreManager.topScores.length; i++) {
            let entry = this.highScoreManager.topScores[i];
            text(
                `${i + 1}. ${entry.playerName} - ${entry.score}`,
                width / 2,
                y,
            );
            y += 40;
        }

        text("Click to Return to Title", width / 2, height - 50);
    }

    // --- 交互处理 ---
    handleMousePress() {
        switch (this.currentState) {
            case GameState.TITLE_SCREEN:
                this.changeState(GameState.NAME_ENTRY);
                break;
            case GameState.DIFFICULTY_SELECT:
                if (mouseY < height / 2) {
                    this.currentDifficulty = Difficulty.NORMAL;
                } else {
                    this.currentDifficulty = Difficulty.HARD;
                }
                this.startGame();
                break;
            case GameState.PLAYING:
                this.levelManager.hook.deployDown();
                break;
            case GameState.SHOP:
                // 让 shopManager 接管点击处理
                let shopResult = this.shopManager.handleMousePress(this.player);
                
                if (shopResult === "NEXT_LEVEL") {
                    this.levelNum++;
                    this.startLevel(); // 这句会创建一个全新的 levelManager 和 hook
                    
                    // 关键点：新关卡创建好后，立刻消耗背包里的道具，将效果附加给新的 levelManager
                    this.player.consumeItems(this.levelManager);
                    
                    // 刷新商店，保证过了这一关后，下次再进商店时可以重新购买
                    this.shopManager.resetShop(); 
                }
                break;
            case GameState.LEVEL_RESULT:
                this.changeState(GameState.HIGH_SCORE);
                break;
            case GameState.HIGH_SCORE:
                this.changeState(GameState.TITLE_SCREEN);
                break;
        }
    }

    handleKeyPress(key, keyCode) {
        if (this.currentState === GameState.NAME_ENTRY) {
            if (keyCode === BACKSPACE) {
                this.inputText = this.inputText.substring(
                    0,
                    this.inputText.length - 1,
                );
            } else if (keyCode === ENTER) {
                this.player.name = this.inputText;
                this.changeState(GameState.DIFFICULTY_SELECT);
            } else if (key.length === 1) {
                // 限制为普通字符输入
                this.inputText += key;
            }
        }
    }
}
