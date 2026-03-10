class LevelManager {
    constructor(difficulty, levelNum, player, playerMode = PlayerMode.SINGLE) {
        this.player = player;
        this.levelNum = levelNum;
        this.playerMode = playerMode;
        this.difficulty = difficulty; // 区分困难和简单
        // 深海场景判定：玩家购买潜水艇后解锁深海
        this.isDeepSea = this.player.hasSubmarine;

        // 1. 目标分数计算逻辑
        // 非线性增长曲线: 75n² + 125n + 50
        // 单人参考值 (EASY): L1=250, L2=600, L3=1100, L4=1750, L5=2550
        // 双人参考值 (×1.8): L1=450, L2=1080, L3=1980, L4=3150, L5=4590
        // 困难参考值 (×1.3): L1=325, L2=780,  L3=1430, L4=2275, L5=3315
        let n = levelNum;
        let baseTarget = 75 * n * n + 125 * n + 50;

        // 【新增】：困难模式下，目标分数提高，时间减少
        if (this.difficulty === Difficulty.HARD) {
            baseTarget = Math.floor(baseTarget * 1.3); // 分数要求提高 30%
            this.timeLimit = Math.max(15, 25 - levelNum); // 困难模式时间更少，且随关卡递减
        } else {
            this.timeLimit = 30 + (levelNum > 1 ? 5 : 0); // 简单模式时间相对充裕
        }

        // 双人模式目标分数 ×1.8：双钩抓取效率翻倍，需提高难度
        this.targetScore =
            this.playerMode === PlayerMode.TWO_PLAYER
                ? Math.floor(baseTarget * 1.8)
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
            this.boats.push(createVector(boatX, 195));
            this.hooks.push(new Hook(boatX, 185, p1HookImg));
            this.scores.push(0);
            this.hook = this.hooks[0];
        } else {
            let boat1X = width * 0.3;
            let boat2X = width * 0.7;

            this.boats.push(createVector(boat1X, 195));
            this.hooks.push(new Hook(boat1X, 185, p1HookImg));
            this.scores.push(0);

            this.boats.push(createVector(boat2X, 195));
            this.hooks.push(
                new Hook(
                    boat2X,
                    185,
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

        // 深海系统初始化（darknessLayer 遮罩 + 鲨鱼事件）
        if (this.isDeepSea) {
            this.darknessLayer = createGraphics(width, height);
            this.sharks = [];
            this.sharkSpawnTimer = 0;
            this.sharkSpawnInterval = floor(random(600, 800)); // 5–8 秒随机间隔
        }
    }

    spawnItems() {
        this.activeItems = [];
        let dynamicItems = [];
        let staticItems = [];

        let isHard = this.difficulty === Difficulty.HARD;
        let multiplier = this.playerMode === PlayerMode.TWO_PLAYER ? 1.5 : 1;

        // 环境常量定义
        const WATER_LEVEL = 160;
        const SHALLOW_WATER_MIN_Y = 300;
        const DEEP_WATER_MIN_Y = 350;
        const MAX_ITEMS = 30;
        const SAFE_MARGIN = 40;

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

        let treasureCount;
        if (this.isDeepSea) {
            treasureCount = Math.floor(random(4, 6) * multiplier);
        } else {
            treasureCount = Math.floor(
                random(isHard ? 2 : 3, isHard ? 4 : 5) * multiplier,
            );
        }
        let looseStoneCount;
        if (this.isDeepSea) {
            // 深海：大量石头和鱼骨作为障碍，营造压迫感
            looseStoneCount = Math.floor(random(8, 12) * multiplier);
        } else {
            looseStoneCount = Math.floor(
                (isHard ? 3 + this.levelNum : 2) * multiplier,
            );
        }
        let fishCount;
        if (this.isDeepSea) {
            // 深海鱼数量减少，但质量更高（AnglerFish + BigFish 为主）
            fishCount = 10;
        } else {
            fishCount = Math.floor((12 + this.levelNum * 2) * multiplier);
            fishCount = Math.min(fishCount, MAX_ITEMS);
        }

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
                let sx = random(SAFE_MARGIN, width - SAFE_MARGIN);
                let sy = random(DEEP_WATER_MIN_Y, height - 20);

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

        for (
            let i = 0;
            i < fishCount && this.activeItems.length < MAX_ITEMS;
            i++
        ) {
            let attempts = 0;
            while (attempts < 30) {
                let fx = random(50, width - 50);
                let fy;

                if (this.isDeepSea) {
                    fy = random(DEEP_WATER_MIN_Y, height - 100);
                } else {
                    fy = random(SHALLOW_WATER_MIN_Y, height - 100);
                }

                let fish;
                if (this.isDeepSea) {
                    // 深海场景：20% AnglerFish（移动光源+高分），55% BigFish，25% SmallFish
                    let r = random();
                    fish =
                        r < 0.2
                            ? new AnglerFish(fx, fy)
                            : r < 0.75
                              ? new BigFish(fx, fy)
                              : new SmallFish(fx, fy);
                } else {
                    // 浅海场景：70% SmallFish，30% BigFish
                    fish =
                        random() > 0.3
                            ? new SmallFish(fx, fy)
                            : new BigFish(fx, fy);
                }

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
                // 双人模式分别追踪 P1/P2 余额；单人模式走原逻辑
                if (this.playerMode === PlayerMode.TWO_PLAYER) {
                    if (i === 0) {
                        this.player.addP1Score(returnedItem.scoreValue);
                    } else {
                        this.player.addP2Score(returnedItem.scoreValue);
                    }
                } else {
                    this.player.addScore(returnedItem.scoreValue);
                }
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

                    if (d < (item.catchRadius ?? item.width / 2) + 10) {
                        if (item.canBeCaught) {
                            currentHook.grabItem(item);
                            this.activeItems.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        }

        // 深海鲨鱼事件系统
        if (this.isDeepSea) {
            this.sharkSpawnTimer++;
            if (this.sharkSpawnTimer >= this.sharkSpawnInterval) {
                this.sharks.push(new Shark());
                this.sharkSpawnTimer = 0;
                this.sharkSpawnInterval = floor(random(300, 480));
            }
            for (let i = this.sharks.length - 1; i >= 0; i--) {
                let shark = this.sharks[i];
                shark.update();
                // 检测鲨鱼与正在上升的钩子挂载物品的碰撞
                for (let hook of this.hooks) {
                    if (
                        hook.attachedItem &&
                        hook.state === HookState.MOVING_UP
                    ) {
                        let item = hook.attachedItem;
                        if (
                            shark.overlaps(
                                item.position.x,
                                item.position.y,
                                item.catchRadius ?? item.width / 2,
                            )
                        ) {
                            // 鲨鱼吃掉物品，钩子空手回收
                            this.floatingScores.push({
                                x: item.position.x,
                                y: item.position.y - 20,
                                text: "STOLEN!",
                                alpha: 255,
                                life: 90,
                                isAlert: true,
                            });
                            hook.attachedItem = null;
                        }
                    }
                }
                if (shark.done) this.sharks.splice(i, 1);
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

        // --- 背景 ---
        if (this.isDeepSea) {
            if (typeof bgImageDeepSea !== "undefined" && bgImageDeepSea) {
                image(bgImageDeepSea, 0, 0, width, height);
            } else if (typeof bgImageLevel2 !== "undefined" && bgImageLevel2) {
                image(bgImageLevel2, 0, 0, width, height);
            } else {
                background(10, 40, 80);
            }
        } else if (this.difficulty === Difficulty.HARD) {
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

        if (this.isDeepSea) {
            // 深海渲染顺序：物品 → 鲨鱼 → 黑暗遮罩 → 潜水艇+钩子
            // 物品和鲨鱼先画（被遮罩覆盖，只在光锥内可见）
            for (let item of this.activeItems) {
                item.draw();
            }

            // 鲨鱼也隐藏在黑暗遮罩之后，只在光锥内可见
            for (let shark of this.sharks) {
                shark.draw();
            }

            // 应用黑暗遮罩（内含探照灯光锥 + 鮟鱇鱼光晕的擦除孔洞）
            this._updateDarknessLayer();
            push();
            imageMode(CORNER); // 遮罩必须从 (0,0) 角落开始铺满全屏
            image(this.darknessLayer, 0, 0);
            pop();

            // 潜水艇和钩子绘制在遮罩之上
            for (let i = 0; i < this.boats.length; i++) {
                push();
                let waveSpeed = frameCount * 0.015;
                let phaseOffset = this.boats[i].x * 0.01;
                let bobY = sin(waveSpeed + phaseOffset) * 3;
                let rockAngle = cos(waveSpeed * 0.8 + phaseOffset) * 0.025;
                translate(this.boats[i].x, this.boats[i].y + bobY);
                rotate(rockAngle);
                if (typeof submarineImg !== "undefined" && submarineImg) {
                    image(submarineImg, 0, -40, 240, 130); // 上移至水面附近
                } else {
                    this._drawSubmarine(i);
                }
                pop();
                this.hooks[i].draw();
            }
        } else {
            // 普通渲染顺序（保持原有逻辑：船→钩子→物品）
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
        }
        pop();

        // --- 干净的 UI 绘制代码 (已剔除导致黑屏的重复代码) ---
        push();
        let timeLeft = Math.ceil(this.timeRemaining || 0);
        textSize(18);
        // 【修改】使用像素街机字体，如果加载失败则使用默认字体
        if (typeof pixelFont !== "undefined" && pixelFont) {
            textFont(pixelFont);
        } else {
            textFont("Courier New");
        }
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

        // 深海标记显示
        if (this.isDeepSea) {
            textSize(16);
            fill(0, 200, 255, 200);
            textAlign(CENTER, TOP);
            text("DEEP SEA", width / 2, 70);
        }

        if (this.playerMode === PlayerMode.SINGLE) {
            textAlign(LEFT, TOP);
            this.drawPixelText(
                `MONEY: ${this.player.totalScore}`,
                leftX,
                line1Y,
                this.cMoney,
            );

            let goalX = width - 180;
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
            // 双人模式 UI 布局：
            // 行1 (y=20)：P1（左） | TOTAL（中央） | P2（右）
            // 行2 (y=45)：GOAL（中央）
            // 行3 (y=70/95)：TIME（中央，深海时让位至 y=95）
            let timeLabelY = this.isDeepSea ? 95 : 70;

            textAlign(LEFT, TOP);
            this.drawPixelText(
                `P1: ${this.scores[0]}`,
                leftX,
                line1Y,
                this.cP1,
            );
            textAlign(CENTER, TOP);
            this.drawPixelText(
                `TOTAL: ${this.player.totalScore}`,
                centerX,
                line1Y,
                this.cSecondary,
            );
            textAlign(RIGHT, TOP);
            this.drawPixelText(
                `P2: ${this.scores[1]}`,
                rightX - 36, // 为暂停按钮留出空间
                line1Y,
                this.cP2,
            );
            textAlign(CENTER, TOP);
            this.drawPixelText(
                `GOAL: ${this.targetScore}`,
                centerX,
                line2Y,
                this.cPrimary,
            );
            this.drawPixelText(
                `TIME: ${timeLeft}`,
                centerX,
                timeLabelY,
                this.cP1,
                tAlpha,
            );

            this._pauseBtnBounds.cx = width - 35;
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
            if (fs.isAlert) {
                fill(255, 55, 55, fs.alpha); // 红色警告（STOLEN!）
            } else {
                fill(50, 255, 50, fs.alpha);
            }
            text(fs.text, fs.x, fs.y);

            fs.y -= 1.5;
            fs.alpha -= 4;
            fs.life -= 1;

            if (fs.life <= 0 || fs.alpha <= 0) {
                this.floatingScores.splice(i, 1);
            }
        }
        pop();

        // ── 帮助按钮（右下角固定位置）──────────────────────────────
        this._drawHelpButton();
    }

    drawPixelText(txt, x, y, col, alpha = 255) {
        push();
        fill(0, 0, 0, alpha);
        text(txt, x + 2, y + 2);
        fill(red(col), green(col), blue(col), alpha);
        text(txt, x, y);
        pop();
    }

    // 深海黑暗遮罩：填满黑色，然后用 erase() 在光源位置"挖洞"
    _updateDarknessLayer() {
        let dl = this.darknessLayer;
        dl.clear();
        dl.background(0, 0, 0, 215);
        dl.erase();
        dl.noStroke();
        dl.fill(255);

        for (let i = 0; i < this.hooks.length; i++) {
            let hook = this.hooks[i];
            let bx = this.boats[i].x;
            // 从潜水艇底部发出光锥（与 image offset -40 对齐，底部约在 boats.y + 25）
            let by = this.boats[i].y + 25;
            let coneLen = 620;      // 探照深度
            let spread = PI / 6;    // ±30° 半角
            let nearDist = 30;      // 圆台顶端距潜水艇底部的距离
            let topHalfW = 20;      // 圆台顶端半宽

            // 光锥方向单位向量 & 垂直向量
            let dx = sin(hook.angle);
            let dy = cos(hook.angle);
            let px = cos(hook.angle);
            let py = -sin(hook.angle);

            // 圆台顶端中心
            let tx = bx + dx * nearDist;
            let ty = by + dy * nearDist;

            let a1 = hook.angle - spread;
            let a2 = hook.angle + spread;

            // 圆台形光锥（梯形：顶端窄，底端宽；顶点顺时针排列避免自交叉）
            dl.quad(
                tx + px * topHalfW, ty + py * topHalfW,   // 顶端右
                bx + sin(a2) * coneLen, by + cos(a2) * coneLen, // 底端右
                bx + sin(a1) * coneLen, by + cos(a1) * coneLen, // 底端左
                tx - px * topHalfW, ty - py * topHalfW,   // 顶端左
            );
            // 顶端小圆，平滑过渡
            dl.ellipse(tx, ty, topHalfW * 2, topHalfW * 2);
            // 潜水艇周围环境光
            dl.ellipse(bx, by, 90, 90);
        }

        // 鮟鱇鱼作为移动光源（随脉冲动态变化）
        for (let item of this.activeItems) {
            if (item instanceof AnglerFish) {
                let pulse = 0.15 * sin(frameCount * 0.05 + item.glowPulse);
                let r = item.glowRadius * (1 + pulse);
                dl.ellipse(item.position.x, item.position.y, r * 2, r * 2);
            }
        }

        dl.noErase();
    }

    // 代码绘制潜水艇（无 submarineImg 资源时的 fallback，中心点在 0,0）
    _drawSubmarine(playerIndex) {
        noStroke();
        // 舰体
        fill(playerIndex === 0 ? color(60, 110, 160) : color(110, 60, 160));
        ellipse(0, 15, 210, 78);
        // 艇塔
        fill(playerIndex === 0 ? color(45, 88, 130) : color(88, 45, 130));
        rect(-22, -38, 44, 50, 6);
        // 潜望镜
        fill(35, 70, 105);
        rect(-6, -60, 12, 28);
        // 舷窗
        fill(190, 235, 255, 200);
        ellipse(38, 14, 26, 26);
        stroke(40, 90, 130);
        strokeWeight(3);
        noFill();
        ellipse(38, 14, 26, 26);
        noStroke();
        // 螺旋桨
        fill(80, 140, 175);
        ellipse(-100, 14, 18, 42);
        // 探照灯（前端发光点）
        fill(255, 240, 80, 230);
        ellipse(104, 14, 18, 18);
        fill(255, 240, 80, 80);
        ellipse(104, 14, 32, 32);
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

    // ── 帮助按钮 & 面板 ──────────────────────────────────────────────

    _drawHelpButton() {
        push();
        const btnX = width - 40;
        const btnY = height - 40;
        const btnR = 20;

        const isHovered = dist(mouseX, mouseY, btnX, btnY) < btnR;

        // 按钮阴影
        noStroke();
        fill(0, 0, 0, 140);
        circle(btnX + 3, btnY + 3, btnR * 2);

        // 按钮主体
        fill(isHovered ? color(80, 180, 255) : color(30, 120, 200));
        circle(btnX, btnY, btnR * 2);

        // 边框高光
        stroke(255, 255, 255, 150);
        strokeWeight(2);
        noFill();
        circle(btnX, btnY, btnR * 2);
        noStroke();

        // "?" 文字
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(18);
        textStyle(BOLD);
        if (typeof pixelFont !== "undefined" && pixelFont) {
            textFont(pixelFont);
        }
        text("?", btnX, btnY - 1);
        textStyle(NORMAL);

        // 悬浮时展开帮助面板
        if (isHovered) {
            this._drawHelpPanel(btnY);
        }
        pop();
    }

    _drawHelpPanel(btnY) {
        const panelW = 400;
        const panelH = 310;
        const panelX = width - panelW - 15;
        const panelY = btnY - panelH - 15;

        // 面板背景
        push();
        noStroke();
        fill(0, 0, 0, 140);
        rect(panelX + 4, panelY + 4, panelW, panelH, 12); // 阴影
        fill(5, 30, 60, 230);
        rect(panelX, panelY, panelW, panelH, 12);
        stroke(0, 160, 220);
        strokeWeight(2);
        noFill();
        rect(panelX, panelY, panelW, panelH, 12);
        noStroke();

        const lx = panelX + 18;
        let cy = panelY + 18;
        const lineH = 22;

        // ── 游戏介绍 ──
        fill(0, 220, 255);
        textAlign(LEFT, TOP);
        textSize(13);
        textStyle(BOLD);
        if (typeof pixelFont !== "undefined" && pixelFont) textFont(pixelFont);
        text("GAME INTRO", lx, cy);
        cy += lineH + 4;

        fill(190, 230, 255);
        textSize(11);
        textStyle(NORMAL);
        text("Catch fish & treasure to reach the GOAL score.", lx, cy);
        cy += lineH;
        text("Avoid stones & fish bones (0 pts).", lx, cy);
        cy += lineH;
        text("Shop between levels to buy power-ups!", lx, cy);
        cy += lineH + 10;

        // 分割线
        stroke(0, 120, 180, 180);
        strokeWeight(1);
        line(lx, cy, panelX + panelW - 18, cy);
        noStroke();
        cy += 10;

        // ── 操作说明 ──
        fill(0, 220, 255);
        textSize(13);
        textStyle(BOLD);
        text("CONTROLS", lx, cy);
        cy += lineH + 4;

        fill(190, 230, 255);
        textSize(11);
        textStyle(NORMAL);
        if (this.playerMode === PlayerMode.TWO_PLAYER) {
            text("P1 (Left  boat) : Press  S  to cast hook", lx, cy);
            cy += lineH;
            text("P2 (Right boat) : Press DOWN \u2193 to cast hook", lx, cy);
        } else {
            text("Press DOWN ARROW \u2193 to cast hook", lx, cy);
        }
        cy += lineH + 4;
        text("Pause : click the \u23F8 button (top-right)", lx, cy);
        cy += lineH + 10;

        // 分割线
        stroke(0, 120, 180, 180);
        strokeWeight(1);
        line(lx, cy, panelX + panelW - 18, cy);
        noStroke();
        cy += 10;

        // ── 道具价值参考 ──
        fill(255, 210, 50);
        textSize(11);
        textStyle(BOLD);
        text("ITEM VALUES", lx, cy);
        cy += lineH;
        fill(190, 230, 255);
        textStyle(NORMAL);
        text("Small Fish: 30-150 pts    Big Fish: 250-600 pts", lx, cy);
        cy += lineH;
        text("Treasure: 100-500 pts     Bone/Stone: 0 pts", lx, cy);

        pop();
    }
}
