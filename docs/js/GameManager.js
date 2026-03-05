class GameManager {
    constructor() {
        this.player = new Player();
        this.currentState = GameState.NAME_ENTRY;
        this.currentDifficulty = Difficulty.EASY;
        this.currentPlayerMode = PlayerMode.SINGLE;
        this.highScoreManager = new HighScoreManager();
        this.shopManager = new ShopManager();
        this.levelManager = null;
        this.levelNum = 1;

        this.inputText = ''; // For entering the name

        this.highScoreScrollY = 0;
        this.highScoreScrollDragging = false;

        this.gamePaused = false;
    }

    isPreGameMenu() {
        return [
            GameState.NAME_ENTRY,
            GameState.DIFFICULTY_SELECT,
            GameState.PLAYER_MODE_SELECT,
        ].includes(this.currentState);
    }

    startGame() {
        this.player.totalScore = 0;
        this.levelNum = 1;
        const buttonOverlay = document.getElementById('button-overlay');
        if (buttonOverlay) {
            buttonOverlay.classList.add('hidden');
            buttonOverlay.classList.remove('active'); // 确保完全禁用点击
        }

        this.startLevel();
    }

    startLevel() {
        const effectiveDifficulty = this.currentDifficulty;
        this.levelManager = new LevelManager(
            effectiveDifficulty,
            this.levelNum,
            this.player,
            this.currentPlayerMode,
        );
        this.levelManager.gameManager = this;
        this.gamePaused = false;

        // 如果上面 ShopItem 报错，下面这行就永远跑不到
        this.player.consumeItems(this.levelManager);
        this.changeState(GameState.PLAYING);
    }

changeState(newState) {
    this.currentState = newState;
    // 只有状态改变时，才主动调用一次 UI 同步
    if (this._syncOverlay) {
        this._syncOverlay();
    }
        if (newState === GameState.HIGH_SCORE) {
            this.highScoreScrollY = 0;
            this.highScoreManager.fetchFromSupabase();
        }

        //首页背景音乐
        const menuStates = [
            GameState.NAME_ENTRY,
            GameState.DIFFICULTY_SELECT,
            GameState.PLAYER_MODE_SELECT,
        ];
        if (menuStates.includes(this.currentState)) {
            if (
                typeof titleBgm !== 'undefined' &&
                titleBgm &&
                !titleBgm.isPlaying()
            ) {
                titleBgm.loop();
            }
        } else if (this.currentState === GameState.PLAYING) {
            if (
                typeof titleBgm !== 'undefined' &&
                titleBgm &&
                titleBgm.isPlaying()
            ) {
                titleBgm.stop();
            }
        }
        //商店音乐
        if (this.currentState === GameState.SHOP) {
            if (
                typeof shopBgm !== 'undefined' &&
                shopBgm &&
                !shopBgm.isPlaying()
            ) {
                shopBgm.loop();
            }
        } else if (this.currentState === GameState.PLAYING) {
            if (
                typeof shopBgm !== 'undefined' &&
                shopBgm &&
                shopBgm.isPlaying()
            ) {
                shopBgm.stop();
            }
        }
    }

    // 图片背景：按比例缩放填满画布（cover）
    drawCoverBackground(img) {
        if (!img || !img.width) return;
        let scale = max(width / img.width, height / img.height);
        let dw = img.width * scale;
        let dh = img.height * scale;
        imageMode(CENTER);
        image(img, width / 2, height / 2, dw, dh);
    }

    // 海洋主题菜单背景：渐变 + 气泡 + 波浪底
    drawOceanMenuBackground() {
        push();
        rectMode(CORNER);
        noStroke();
        for (let y = 0; y <= height; y += 2) {
            let t = y / height;
            fill(lerpColor(color(8, 28, 55), color(30, 100, 160), t));
            rect(0, y, width, 3);
        }
        // 底部波浪/海床
        fill(30, 80, 60);
        beginShape();
        vertex(0, height);
        for (let x = 0; x <= width + 20; x += 25) {
            let wave =
                sin(x * 0.02 + frameCount * 0.03) * 15 + sin(x * 0.05) * 8;
            vertex(x, height - 30 + wave);
        }
        vertex(width + 50, height + 50);
        vertex(-10, height + 50);
        endShape(CLOSE);
        // 浮动气泡
        for (let i = 0; i < 12; i++) {
            let px = ((i * 73 + frameCount * 0.5) % (width + 40)) - 20;
            let py = height - ((i * 47 + frameCount * 0.3) % (height + 30));
            let r = 4 + (i % 3) * 2;
            fill(255, 255, 255, 60 + sin(frameCount * 0.05 + i) * 30);
            ellipse(px, py, r * 2, r * 2);
        }

        // 游动的鱼
        const fishData = [
            {
                seed: 11,
                yBase: 0.25,
                len: 25,
                spd: 0.4,
                dir: 1,
                col: [100, 200, 255],
            },
            {
                seed: 23,
                yBase: 0.4,
                len: 20,
                spd: 0.3,
                dir: -1,
                col: [255, 180, 100],
            },
            {
                seed: 37,
                yBase: 0.55,
                len: 30,
                spd: 0.5,
                dir: 1,
                col: [150, 220, 180],
            },
            {
                seed: 51,
                yBase: 0.35,
                len: 18,
                spd: 0.25,
                dir: -1,
                col: [255, 220, 180],
            },
            {
                seed: 67,
                yBase: 0.65,
                len: 22,
                spd: 0.35,
                dir: 1,
                col: [180, 150, 255],
            },
            {
                seed: 83,
                yBase: 0.2,
                len: 28,
                spd: 0.45,
                dir: -1,
                col: [255, 140, 100],
            },
        ];
        for (let f of fishData) {
            let fx =
                ((f.seed * 50 + frameCount * f.spd * f.dir + width * 2) %
                    (width + 80)) -
                40;
            let fy = height * f.yBase + sin(frameCount * 0.02 + f.seed) * 8;
            this.drawDecorFish(fx, fy, f.len, f.dir, f.col);
        }

        // 含珍珠的贝壳（贴近底部）
        const shellData = [
            { x: width * 0.15, y: height - 45 },
            { x: width * 0.55, y: height - 50 },
            { x: width * 0.85, y: height - 42 },
        ];
        for (let s of shellData) {
            let sy = s.y + sin(frameCount * 0.03 + s.x) * 3;
            this.drawDecorShell(s.x, sy);
        }

        // 金币
        for (let i = 0; i < 8; i++) {
            let cx = ((i * 97 + 31) % (width - 40)) + 20;
            let cy =
                height * (0.5 + (i % 3) * 0.15) +
                sin(frameCount * 0.04 + i * 2) * 5;
            this.drawDecorCoin(cx, cy);
        }

        // 宝箱
        this.drawDecorChest(
            width * 0.3,
            height - 75 + sin(frameCount * 0.02) * 4,
        );
        this.drawDecorChest(
            width * 0.72,
            height - 70 + sin(frameCount * 0.025) * 4,
        );

        pop();
    }

    drawDecorFish(x, y, len, dir, col) {
        push();
        translate(x, y);
        scale(dir, 1);
        noStroke();
        fill(col[0], col[1], col[2], 200);
        ellipse(0, 0, len * 1.8, len * 0.8);
        fill(col[0] * 0.8, col[1] * 0.8, col[2] * 0.8);
        triangle(-len, 0, -len - 12, -6, -len - 12, 6);
        fill(255, 255, 200);
        ellipse(len * 0.4, -2, 4, 4);
        pop();
    }

    drawDecorShell(x, y) {
        push();
        translate(x, y);
        noStroke();
        fill(220, 190, 150);
        ellipse(-8, 0, 18, 22);
        ellipse(8, 0, 18, 22);
        fill(200, 170, 130);
        ellipse(0, 0, 20, 14);
        fill(255, 250, 240);
        ellipse(5, -1, 10, 10);
        fill(255, 255, 255);
        ellipse(6, -2, 5, 5);
        pop();
    }

    drawDecorCoin(x, y) {
        push();
        translate(x, y);
        rotate(sin(frameCount * 0.05) * 0.1);
        noStroke();
        fill(255, 215, 0, 230);
        ellipse(0, 0, 14, 14);
        fill(255, 200, 0);
        ellipse(0, 0, 10, 10);
        fill(255, 230, 100);
        ellipse(-2, -2, 4, 4);
        pop();
    }

    drawDecorChest(x, y) {
        push();
        translate(x, y);
        rectMode(CENTER);
        noStroke();
        fill(139, 90, 43);
        rect(0, 5, 50, 25, 4);
        fill(160, 110, 60);
        rect(0, -8, 44, 10, 3);
        fill(255, 215, 0);
        ellipse(0, -5, 12, 8);
        fill(200, 160, 80);
        rect(0, -18, 6, 10);
        pop();
    }

    // 海洋风格按钮
    drawOceanButton(cx, cy, w, h, label, col1, col2) {
        rectMode(CENTER);
        noStroke();
        // 阴影
        fill(0, 0, 0, 80);
        rect(cx + 4, cy + 4, w, h, 14);
        // 主色
        fill(col1);
        rect(cx, cy, w, h, 14);
        // 顶部高光条
        fill(255, 255, 255, 50);
        rect(cx, cy - h / 4, w - 20, h / 4, 4);
        // 描边
        stroke(255, 255, 255, 150);
        strokeWeight(2);
        noFill();
        rect(cx, cy, w, h, 14);
        noStroke();
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(18);
        text(label, cx, cy);
    }

    // 矩形点击检测（rectMode CENTER）
    isPointInRect(px, py, cx, cy, w, h) {
        return (
            px >= cx - w / 2 &&
            px <= cx + w / 2 &&
            py >= cy - h / 2 &&
            py <= cy + h / 2
        );
    }

    update() {
        if (this.currentState === GameState.PLAYING) {
            background(30, 144, 255);
        } else if (
            [
                GameState.NAME_ENTRY,
                GameState.DIFFICULTY_SELECT,
                GameState.PLAYER_MODE_SELECT,
            ].includes(this.currentState)
        ) {
            background(8, 28, 55);
        } else {
            background(30, 144, 255);
        }

        switch (this.currentState) {
            case GameState.NAME_ENTRY:
                this.drawNameEntry();
                break;
            case GameState.DIFFICULTY_SELECT:
                this.drawDifficultySelect();
                break;
            case GameState.PLAYER_MODE_SELECT:
                this.drawPlayerModeSelect();
                break;
            case GameState.PLAYING:
                if (!this.gamePaused) {
                    let result = this.levelManager.update();
                    if (result === 'PASS') {
                        this.changeState(GameState.SHOP);
                    } else if (result === 'FAIL') {
                        const levelsCompleted = Math.max(0, this.levelNum - 1);
                        this.highScoreManager.checkNewHighScore(
                            this.player.totalScore,
                            this.player.name || 'Anon',
                            levelsCompleted,
                        );
                        this.changeState(GameState.LEVEL_RESULT);
                    }
                }
                this.levelManager.draw();
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

    drawNameEntry() {
        if (typeof nameEntryBgImg !== 'undefined' && nameEntryBgImg) {
            imageMode(CORNER);
            image(nameEntryBgImg, 0, 0, width, height);
        } else {
            this.drawOceanMenuBackground();
        }
        push();
        fill(255);
        textAlign(CENTER, CENTER);
        rectMode(CENTER);
        noStroke();
        fill(30, 60, 90, 200);
        rect(width / 2, height / 2 - 20, 260, 50, 8);
        fill(255, 255, 255, 80);
        rect(width / 2, height / 2 - 22, 256, 46, 6);
        textSize(20);
        if (this.inputText) {
            fill(240, 248, 255);
            text(
                this.inputText + (frameCount % 60 < 30 ? '|' : ''),
                width / 2,
                height / 2 - 20,
            );
        } else {
            fill(180, 180, 200, 180);
            text('enter your name', width / 2, height / 2 - 20);
        }

        fill(200, 230, 255);
        textSize(16);
        text('Press ENTER to cast off', width / 2, height / 2 + 50);
        pop();
    }

    drawDifficultySelect() {
        if (typeof modeSelectBgImg !== 'undefined' && modeSelectBgImg) {
            this.drawCoverBackground(modeSelectBgImg);
        } else {
            this.drawOceanMenuBackground();
        }
    }

    drawPlayerModeSelect() {
        if (typeof modeSelectBgImg !== 'undefined' && modeSelectBgImg) {
            this.drawCoverBackground(modeSelectBgImg);
        } else {
            this.drawOceanMenuBackground();
        }
    }

    drawShop() {
        push();
        this.shopManager.draw(this.player);
        pop();
    }

    drawLevelResult() {
        if (
            typeof levelFailedImg !== 'undefined' &&
            levelFailedImg &&
            levelFailedImg.width
        ) {
            this.drawCoverBackground(levelFailedImg);
            push();
            textFont('Press Start 2P');
            textSize(10);
            fill(255, 200, 200, 230);
            textAlign(CENTER, CENTER);
            text('click to view the leaderboard', width / 2, height / 2 + 200);
            pop();
        } else {
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(40);
            text('LEVEL FAILED!', width / 2, height / 2 - 50);
            textSize(20);
            text('Click to view High Scores', width / 2, height / 2 + 50);
        }
    }

    drawHighScore() {
        push();
        rectMode(CORNER);
        noStroke();

        const panelW = 520;
        const panelH = 420;
        const panelX = (width - panelW) / 2;
        const panelY = 60;
        const rowH = 68;
        const startY = panelY + 75;
        const listAreaH = panelH - (startY - panelY) - 15;
        const rowW = panelW - 72;
        const rowX = panelX + 24;
        const scrollbarW = 14;
        const scrollbarX = panelX + panelW - scrollbarW - 16;
        const scrollbarY = startY;
        const scrollbarH = listAreaH;

        const totalH = this.highScoreManager.topScores.length * rowH;
        const maxScroll = max(0, totalH - listAreaH);
        this.highScoreScrollY = constrain(this.highScoreScrollY, 0, maxScroll);

        fill(8, 28, 55);
        rect(0, 0, width, height);

        fill(0, 0, 0, 60);
        rect(panelX + 6, panelY + 6, panelW, panelH, 16);
        fill(40, 100, 180);
        rect(panelX, panelY, panelW, panelH, 16);
        stroke(80, 150, 220);
        strokeWeight(2);
        noFill();
        rect(panelX, panelY, panelW, panelH, 16);
        noStroke();

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(28);
        textStyle(BOLD);
        text('🏆 LEADERBOARD', width / 2, panelY + 35);
        textStyle(NORMAL);

        push();
        const listClip = () => {
            const c = document.querySelector('canvas');
            if (c && c.getContext) {
                const ctx = c.getContext('2d');
                ctx.save();
                ctx.beginPath();
                ctx.rect(rowX, startY, rowW + scrollbarW + 24, listAreaH);
                ctx.clip();
            }
        };
        const listUnclip = () => {
            const c = document.querySelector('canvas');
            if (c && c.getContext) c.getContext('2d').restore();
        };
        listClip();

        for (let i = 0; i < this.highScoreManager.topScores.length; i++) {
            let entry = this.highScoreManager.topScores[i];
            let rowTop = startY + i * rowH - this.highScoreScrollY;
            let ry = rowTop + rowH / 2;

            if (ry < startY - rowH / 2 || ry > startY + listAreaH + rowH / 2)
                continue;

            let isCurrent =
                entry.playerName === (this.player.name || 'Anon') &&
                entry.score === this.player.totalScore;
            const levelsCompleted =
                entry.levelsCompleted != null ? entry.levelsCompleted : 0;

            if (isCurrent) {
                fill(50, 180, 80, 220);
            } else {
                fill(60, 120, 200, 180);
            }
            rect(rowX, rowTop + 4, rowW, rowH - 8, 12);

            fill(255);
            textAlign(LEFT, CENTER);
            textSize(22);
            text(i + 1, rowX + 28, ry);

            this.drawScoreAvatar(rowX + 70, ry, entry.playerName);

            textSize(18);
            text(entry.playerName, rowX + 115, ry);

            textAlign(RIGHT, CENTER);
            fill(255, 215, 0);
            textSize(16);
            const scoreText =
                levelsCompleted > 0
                    ? `🏆 ${entry.score}  Lv.${levelsCompleted}`
                    : `🏆 ${entry.score}`;
            text(scoreText, rowX + rowW - 20, ry);
        }
        listUnclip();
        pop();

        if (totalH > listAreaH) {
            fill(30, 60, 120, 200);
            rect(scrollbarX, scrollbarY, scrollbarW, scrollbarH, 7);

            const thumbRatio = listAreaH / totalH;
            const thumbH = max(30, scrollbarH * thumbRatio);
            const thumbRange = scrollbarH - thumbH;
            const thumbY =
                scrollbarY +
                (maxScroll > 0
                    ? (this.highScoreScrollY / maxScroll) * thumbRange
                    : 0);

            fill(100, 160, 220);
            rect(scrollbarX + 2, thumbY + 2, scrollbarW - 4, thumbH - 4, 5);

            this._scrollbarBounds = {
                x: scrollbarX,
                y: scrollbarY,
                w: scrollbarW,
                h: scrollbarH,
                thumbH: thumbH,
                maxScroll: maxScroll,
            };
        } else {
            this._scrollbarBounds = null;
        }

        textAlign(CENTER, CENTER);
        fill(180, 220, 255);
        textSize(16);
        text('Click outside list to return', width / 2, height - 35);
        pop();
    }

    drawScoreAvatar(cx, cy, name) {
        push();
        noStroke();
        fill(255, 220, 150);
        ellipse(cx, cy, 36, 36);
        fill(60, 100, 150);
        textAlign(CENTER, CENTER);
        textSize(16);
        text((name.charAt(0) || '?').toUpperCase(), cx, cy + 1);
        pop();
    }

    // Interaction Handling
    handleMousePress() {
        switch (this.currentState) {
            case GameState.DIFFICULTY_SELECT:
                if (
                    this.isPointInRect(
                        mouseX,
                        mouseY,
                        width / 2,
                        height / 2 - 50,
                        220,
                        52,
                    )
                ) {
                    this.currentDifficulty = Difficulty.EASY;
                    this.changeState(GameState.PLAYER_MODE_SELECT);
                } else if (
                    this.isPointInRect(
                        mouseX,
                        mouseY,
                        width / 2,
                        height / 2 + 50,
                        220,
                        52,
                    )
                ) {
                    this.currentDifficulty = Difficulty.HARD;
                    this.changeState(GameState.PLAYER_MODE_SELECT);
                }
                break;
            case GameState.PLAYER_MODE_SELECT:
                if (
                    this.isPointInRect(
                        mouseX,
                        mouseY,
                        width / 2,
                        height / 2 - 50,
                        220,
                        52,
                    )
                ) {
                    this.currentPlayerMode = PlayerMode.SINGLE;
                    this.startGame(); // 去掉了只允许 Easy 的限制
                } else if (
                    this.isPointInRect(
                        mouseX,
                        mouseY,
                        width / 2,
                        height / 2 + 50,
                        220,
                        52,
                    )
                ) {
                    this.currentPlayerMode = PlayerMode.TWO_PLAYER;
                    this.startGame(); // 【新增】：让双人模式也能启动游戏！
                }
                break;
            case GameState.PLAYING: {
                const pb = this.levelManager._pauseBtnBounds;
                if (
                    pb &&
                    this.isPointInRect(mouseX, mouseY, pb.cx, pb.cy, pb.w, pb.h)
                ) {
                    this.gamePaused = !this.gamePaused;
                }
                break;
            }
            case GameState.SHOP: {
                let shopResult = this.shopManager.handleMousePress(this.player);
                if (shopResult === 'NEXT_LEVEL') {
                    this.levelNum++;
                    this.startLevel();
                    this.player.consumeItems(this.levelManager);
                    this.shopManager.resetShop();
                }
                break;
            }
            case GameState.LEVEL_RESULT:
                this.changeState(GameState.HIGH_SCORE);
                break;
            case GameState.HIGH_SCORE: {
                const panelX = (width - 520) / 2;
                const panelY = 60;
                const panelW = 520;
                const panelH = 420;
                const inPanel =
                    mouseX >= panelX &&
                    mouseX <= panelX + panelW &&
                    mouseY >= panelY &&
                    mouseY <= panelY + panelH;
                if (!inPanel) {
                    this.changeState(GameState.NAME_ENTRY);
                } else if (this._scrollbarBounds) {
                    const sb = this._scrollbarBounds;
                    const thumbRange = sb.h - sb.thumbH;
                    const thumbY =
                        sb.y +
                        (sb.maxScroll > 0
                            ? (this.highScoreScrollY / sb.maxScroll) *
                              thumbRange
                            : 0);
                    if (
                        mouseX >= sb.x &&
                        mouseX <= sb.x + sb.w &&
                        mouseY >= thumbY &&
                        mouseY <= thumbY + sb.thumbH
                    ) {
                        this.highScoreScrollDragging = true;
                    }
                }
                break;
            }
        }
    }

    handleMouseWheel(event) {
        if (this.currentState !== GameState.HIGH_SCORE) return;
        const panelX = (width - 520) / 2;
        const panelW = 520;
        if (mouseX >= panelX && mouseX <= panelX + panelW) {
            this.highScoreScrollY -= event.delta;
            const rowH = 68;
            const listAreaH = 420 - 75 - 15;
            const totalH = this.highScoreManager.topScores.length * rowH;
            this.highScoreScrollY = constrain(
                this.highScoreScrollY,
                0,
                max(0, totalH - listAreaH),
            );
        }
    }

    handleMouseDragged() {
        if (
            this.currentState !== GameState.HIGH_SCORE ||
            !this.highScoreScrollDragging ||
            !this._scrollbarBounds
        )
            return;
        const sb = this._scrollbarBounds;
        const thumbRange = sb.h - sb.thumbH;
        if (thumbRange <= 0) return;
        const localY = mouseY - sb.y;
        const t = constrain((localY - sb.thumbH / 2) / thumbRange, 0, 1);
        this.highScoreScrollY = t * sb.maxScroll;
    }

    handleMouseReleased() {
        this.highScoreScrollDragging = false;
    }

    handleKeyPress(key, keyCode) {
        if (this.currentState === GameState.PLAYING) {
            // --- 1. 双人模式逻辑 (不分难度) ---
            if (this.currentPlayerMode === PlayerMode.TWO_PLAYER) {
                // 左边玩家 P1：只能用 S 键
                if (key === 's' || key === 'S') {
                    if (this.levelManager && this.levelManager.hook1) {
                        this.levelManager.hook1.deployDown();
                    }
                    return;
                }
                // 右边玩家 P2：只能用 向下键
                if (keyCode === DOWN_ARROW) {
                    if (this.levelManager && this.levelManager.hook2) {
                        this.levelManager.hook2.deployDown();
                    }
                    return;
                }
            }
            // --- 2. 单人模式逻辑 (不分难度) ---
            else {
                // 只能使用 向下键，去掉了对 S 键的判定
                if (keyCode === DOWN_ARROW) {
                    if (this.levelManager && this.levelManager.hook) {
                        this.levelManager.hook.deployDown();
                    }
                    return;
                }
            }
        }

        // --- 3. 姓名输入界面逻辑 (保持不变) ---
        if (this.currentState === GameState.NAME_ENTRY) {
            if (keyCode === BACKSPACE) {
                this.inputText = this.inputText.substring(
                    0,
                    this.inputText.length - 1,
                );
            } else if (keyCode === ENTER) {
                const name = this.inputText.trim();
                if (name) {
                    this.player.name = name;
                    this.changeState(GameState.DIFFICULTY_SELECT);
                }
            } else if (key.length === 1) {
                if (this.inputText.length < 12) {
                    this.inputText += key;
                }
            }
        }
    }
}
