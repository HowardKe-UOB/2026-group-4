class GameManager {
    constructor() {
        this.player = new Player();
        this.currentState = GameState.TITLE_SCREEN;
        this.currentDifficulty = Difficulty.NORMAL;
        this.highScoreManager = new HighScoreManager();
        this.shopManager = new ShopManager();
        this.levelManager = null;
        this.levelNum = 1;

        this.inputText = ""; // For entering the name
    }

    startGame() {
        this.player.totalScore = 0;
        this.levelNum = 1;
        this.startLevel();
    }

    startLevel() {
        // Pass in this.player
        this.levelManager = new LevelManager(
            this.currentDifficulty,
            this.levelNum,
            this.player,
        );
        this.changeState(GameState.PLAYING);
    }

    changeState(newState) {
        this.currentState = newState;
    }

    update() {
        background(30, 144, 255); // blue background

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
                    this.changeState(GameState.SHOP);
                } else if (result === "FAIL") {
                    // Record the final score to the leaderboard
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
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(30);
        text("SHOP", width / 2, 50);
        textSize(20);
        text(`Your Money: ${this.player.totalScore}`, width / 2, 90);

        text("Click here to Next Level", width / 2, height - 50);
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

    // Interaction Handling
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
                // Tap anywhere to go to the next level
                this.levelNum++;
                this.startLevel();
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
                // Limited to ordinary character input.
                this.inputText += key;
            }
        }
    }
}
