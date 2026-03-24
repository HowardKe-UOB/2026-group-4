class LevelManager {
    constructor(difficulty, levelNum, player, playerMode = PlayerMode.SINGLE) {
        this.player = player;
        this.levelNum = levelNum;
        this.playerMode = playerMode;
        this.difficulty = difficulty; // 区分困难和简单
        // 深海场景判定：玩家购买潜水艇后解锁深海
        this.isDeepSea = this.player.hasSubmarine;

        // 目标分数计算逻辑【旧版】
        // 非线性增长曲线: 75n² + 125n + 50
        // 单人参考值 (EASY): L1=250, L2=600, L3=1100, L4=1750, L5=2550
        // 双人参考值 (×1.8): L1=450, L2=1080, L3=1980, L4=3150, L5=4590
        // 困难参考值 (×1.3): L1=325, L2=780,  L3=1430, L4=2275, L5=3315
        // let n = levelNum;
        // let baseTarget = 75 * n * n + 125 * n + 50;

        let n = levelNum;

        // 核心基准定义
        const goldFishEff = 26.67; // 微调效率常数，使第一关更接近 400 分
        let totalTarget = 0;

        // 累加计算目标分 (1 到 n 关的增量之和)
        for (let i = 1; i <= n; i++) {
            // A. 确定该关卡的“标准时间” (计算分数专用，不读取沙漏修改后的值)
            let stdTime = 0;
            if (this.difficulty === Difficulty.HARD) {
                stdTime = Math.min(35, 24 + i); // 困难模式 25~35s
            } else {
                stdTime = Math.min(40, 29 + i); // 简单模式 30~40s
            }

            // B. 获取封顶关卡数 (用于系数计算，最高到 10)
            let factorLevel = Math.min(i, 10);

            // C. 计算技能系数 (0.5 -> 0.9 封顶)
            let skillFactor = 0.5 + (factorLevel - 1) * (0.4 / 9);

            // D. 计算物资密度/成长补偿 (1.0 -> 1.45 封顶)
            let growthFactor = 1 + (factorLevel - 1) * 0.05;

            // E. 累加本关增量
            let increment = stdTime * goldFishEff * skillFactor * growthFactor;
            totalTarget += increment;
        }

        // 难度与游玩人数修正
        if (this.difficulty === Difficulty.HARD) {
            totalTarget *= 1.20; // 困难模式整体要求提高 20%
        }
        if (this.playerMode === PlayerMode.TWO_PLAYER) {
            totalTarget *= 1.75; // 双人模式倍率
        }

        // 最终赋值 (10 的倍数)
        this.targetScore = Math.floor(totalTarget / 10) * 10;

        // 设定实际关卡时间 (这部分会被沙漏道具在外部修改，但不影响上面已算好的分数)
        if (this.difficulty === Difficulty.HARD) {
            this.timeLimit = Math.min(35, 24 + n);// 困难模式时间:25~35秒
        } else {
            this.timeLimit = Math.min(40, 29 + n);// 简单模式时间:30~40秒
        }
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

        let startY = 180;

        if (this.isDeepSea) {
            p1HookImg = typeof newhookImg !== "undefined" ? newhookImg : null;
            startY = 183; // 潜水艇吃水深，发射点往下移，如果不喜欢可以改回185
        }
        // ───────────────────────────────────────────────────

        if (this.playerMode === PlayerMode.SINGLE) {
            let boatX = width / 2;
            this.boats.push(createVector(boatX, 195));
            this.hooks.push(new Hook(boatX, startY, p1HookImg));
            this.scores.push(0);
            this.hook = this.hooks[0];
        } else {
            let boat1X = width * 0.3;
            let boat2X = width * 0.7;

            // 左边玩家 (P1)
            this.boats.push(createVector(boat1X, 195));
            this.hooks.push(new Hook(boat1X, startY, p1HookImg));
            this.scores.push(0);

            // 右边玩家 (P2)
            this.boats.push(createVector(boat2X, 195));

            // ─── 核心修改：给右边玩家专属的新鱼钩 ───
            let p2HookImg = typeof hookImg !== "undefined" ? hookImg : null;
            let p2StartY = 185;

            if (this.isDeepSea) {
                p2HookImg =
                    typeof newhook2Img !== "undefined" ? newhook2Img : null;
                p2StartY = 179; // 提上高度，完美镶嵌在潜水艇肚子下
            }

            this.hooks.push(new Hook(boat2X, p2StartY, p2HookImg));
            this.scores.push(0);

            this.hook1 = this.hooks[0];
            this.hook2 = this.hooks[1];
        }
        this.activeItems = [];
        this.fishCaught = {};
        this.spawnItems();
        this.floatingScores = [];
        this.koiSpawned = false;

        // 每关将有小概率自然生成一条锦鲤
        this.hasRandomKoi = random() < 0.1; // 10% 的几率生成
        this.randomKoiTime = random(8, 16);  // 8~16秒随机出现
        this.randomKoiSpawned = false;       // 标记自然生成的锦鲤是否已出现

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

        let isHard = this.difficulty === Difficulty.HARD;
        let multiplier = this.playerMode === PlayerMode.TWO_PLAYER ? 1.5 : 1;

        // ═══════════════════════════════════════════════════════════
        // 分层生成系统（Layered Spawning）
        // 将屏幕垂直划分为三个生成层，各类物品有专属区间
        // ═══════════════════════════════════════════════════════════
        const SAFE_MARGIN = 40;
        const LAYER_SHALLOW = { minY: 320, maxY: 380 }; // 浅层：小鱼活动区
        const LAYER_MID = { minY: 360, maxY: 500 }; // 中层：大鱼 + 障碍物
        const LAYER_DEEP = { minY: 480, maxY: height - 20 }; // 深层：宝箱 + 珍珠 + 石头

        // 分类独立上限，不再使用全局 MAX_ITEMS 硬性总上限
        // 让海洋显得生机勃勃又充满挑战
        const MAX_OBSTACLES = 12; // 宝箱 + 石头 + 鱼骨上限（两种模式统一）

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

        // 用于分层碰撞检测的独立列表
        let staticItems = []; // 障碍物（宝箱、石头、鱼骨、珍珠）
        let dynamicItems = []; // 生物（鱼类）

        // ─── 第一阶段：计算各类物品数量（重新平衡） ───
        // 宝箱：普通 2-3，深海 3-4
        let treasureCount = this.isDeepSea
            ? Math.floor(random(3, 5) * multiplier)
            : Math.floor(random(2, 4) * multiplier);

        // 散落石头/鱼骨：固定 5-7 个
        let looseStoneCount = Math.floor(random(5, 8) * multiplier);

        // 大鱼/鮟鱇鱼：4-5 条，严格限制在中深水区
        let bigFishCount = Math.floor(random(4, 6) * multiplier);

        // 小鱼：8-10 条，浅水区和中水区干扰视线
        let smallFishCount = Math.floor(random(8, 11) * multiplier);

        // 珍珠：每局固定 1 个（50% 概率生成）
        let pearlCount = random() < 0.5 ? 1 : 0;

        // ─── 第二阶段：生成宝箱（深层底部） ───
        for (
            let i = 0;
            i < treasureCount && staticItems.length < MAX_OBSTACLES;
            i++
        ) {
            let attempts = 0;
            while (attempts < 30) {
                let tx = random(80, width - 80);
                let ty = height - random(30, 80); // 宝箱始终贴近海底
                let treasure = new Treasure(tx, ty);

                if (!checkOverlap(treasure, staticItems, 40)) {
                    this.activeItems.push(treasure);
                    staticItems.push(treasure);

                    // 困难模式：宝箱周围生成守卫石头
                    if (isHard) {
                        let guardCount = floor(
                            random(1, Math.min(4, 1 + this.levelNum * 0.5)),
                        );
                        for (let j = 0; j < guardCount; j++) {
                            let angle = random(PI + 0.2, TWO_PI - 0.2);
                            let distance = random(60, 110);
                            let sx = tx + cos(angle) * distance;
                            let sy = ty + sin(angle) * distance;

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

        // ─── 第三阶段：生成散落石头和鱼骨（中层 + 深层） ───
        for (
            let i = 0;
            i < looseStoneCount && staticItems.length < MAX_OBSTACLES;
            i++
        ) {
            let attempts = 0;
            while (attempts < 20) {
                let sx = random(SAFE_MARGIN, width - SAFE_MARGIN);
                // 障碍物分布在中层和深层之间
                let sy = random(LAYER_MID.minY, LAYER_DEEP.maxY);

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

        // ─── 第四阶段：生成珍珠（仅限深层底部，极深位置） ───
        for (let i = 0; i < pearlCount; i++) {
            let attempts = 0;
            while (attempts < 30) {
                let px = random(SAFE_MARGIN + 20, width - SAFE_MARGIN - 20);
                // 珍珠必须在屏幕最底部区域（深海底层）
                let py = random(height - 80, height - 25);
                let pearl = new Pearl(px, py);

                if (!checkOverlap(pearl, staticItems, 30)) {
                    this.activeItems.push(pearl);
                    staticItems.push(pearl);
                    break;
                }
                attempts++;
            }
        }

        // ─── 第四阶段 B：生成游动贝壳（50% 概率，中深水区） ───
        if (random() < 0.5) {
            let attempts = 0;
            while (attempts < 30) {
                let sx = random(SAFE_MARGIN + 30, width - SAFE_MARGIN - 30);
                let sy = random(LAYER_MID.minY, LAYER_DEEP.maxY - 40);
                let shell = new SwimmingPearlShell(sx, sy);

                if (!checkOverlap(shell, dynamicItems, 50)) {
                    this.activeItems.push(shell);
                    dynamicItems.push(shell);
                    break;
                }
                attempts++;
            }
        }

        // ─── 第五阶段：生成大鱼/鮟鱇鱼（独立配额，严格限制在中深水区） ───
        for (let i = 0; i < bigFishCount; i++) {
            let attempts = 0;
            while (attempts < 30) {
                let fx = random(50, width - 50);
                let fy = random(LAYER_DEEP.minY, LAYER_DEEP.maxY - 60);
                let fish;

                if (this.isDeepSea) {
                    // 深海：约 40% 鮟鱇鱼，60% 大鱼
                    fish =
                        random() < 0.4
                            ? new AnglerFish(fx, fy)
                            : new BigFish(fx, fy);
                } else {
                    fish = new BigFish(fx, fy);
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

        // ─── 第六阶段：生成小鱼（浅水区 + 中水区，干扰视线的移动障碍） ───
        for (let i = 0; i < smallFishCount; i++) {
            let attempts = 0;
            while (attempts < 30) {
                let fx = random(50, width - 50);
                let fy = random(LAYER_SHALLOW.minY, LAYER_MID.maxY);
                let fish = new SmallFish(fx, fy);

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
                // 如果抓上来的是宝箱，且玩家有四叶草，金额增加
                if (
                    this.player.hasClover &&
                    returnedItem.itemName === "Treasure"
                ) {
                    returnedItem.scoreValue = Math.floor(
                        returnedItem.scoreValue * 1.35
                    );
                }
                // 鱼骨收藏书：对鱼骨获得20~50金币，对石头获得+100%金币
                if (this.player.hasFishboneCollector){
                    if(returnedItem.itemName === "FishBone"){
                        returnedItem.scoreValue = Math.floor(random(20, 51));
                    }else if(returnedItem.itemName === "Stone"){
                        returnedItem.scoreValue = Math.floor(
                            returnedItem.scoreValue * 2
                        );
                    }
                }
                // 播放抓中音效
                if (typeof catchSfx !== "undefined" && catchSfx) {
                    if (catchSfx.isPlaying()) catchSfx.stop();
                    catchSfx.play();
                }
                let key = returnedItem.itemName || "Unknown";
                if (
                    returnedItem.itemName === "Small Fish" &&
                    returnedItem.fishIndex != null
                ) {
                    key = `fish${returnedItem.fishIndex + 1}`; // fishIndex 0–42 → fish1–fish43
                } else if (
                    returnedItem.itemName === "Big Fish" &&
                    returnedItem.fishIndex != null
                ) {
                    key = `fish${44 + returnedItem.fishIndex}`; // fishIndex 0–20 → fish44–fish64
                }
                this.fishCaught[key] = (this.fishCaught[key] || 0) + 1;
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
                            if (ballCatchSfx && !ballCatchSfx.isPlaying()) {
                                ballCatchSfx.play();
                            }
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
                // 检测鲨鱼头部与正在上升的钩子挂载物品的碰撞
                for (let hook of this.hooks) {
                    if (
                        hook.attachedItem &&
                        hook.state === HookState.MOVING_UP
                    ) {
                        let item = hook.attachedItem;

                        // 石头或鱼骨，鲨鱼直接无视，不触发抢夺
                        let isStoneOrBone =
                            item instanceof Stone || item instanceof FishBone;

                        // ─── 鲨鱼头部碰撞判定 ───
                        // 根据鲨鱼朝向计算头部坐标（中心点向前方偏移 35% 身长）
                        let headX =
                            shark.x + shark.direction * shark.width * 0.35;
                        let headY = shark.y;
                        const SHARK_BITE_RADIUS = 25; // 咬合判定半径（仅头部小圆）
                        let itemRadius = item.catchRadius ?? item.width / 2;
                        let headDist = dist(
                            headX,
                            headY,
                            item.position.x,
                            item.position.y,
                        );

                        if (
                            !isStoneOrBone &&
                            headDist < SHARK_BITE_RADIUS + itemRadius
                        ) {
                            // 鲨鱼吃掉物品，钩子空手回收
                            if (sharkStolenSfx && !sharkStolenSfx.isPlaying()) {
                                sharkStolenSfx.play();
                            }
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
        // 锦鲤
        let timePassed = this.timeLimit - this.timeRemaining;
        // 关卡内10s后生成锦鲤
        if (this.player.hasLuckyCoin && timePassed >= 10 && !this.koiSpawned) {
            let koi = new KoiFish(random(375, 475));  // 生成高度，中浅层区
            this.activeItems.push(koi);
            this.koiSpawned = true; // 标记本关已生成
            this.player.hasLuckyCoin = false; // 消耗掉道具
            if (koiInSfx && !koiInSfx.isPlaying()) {
                koiInSfx.play();  // 入场音效
            }
        }

        // 只有当玩家本关没有购买 Lucky Coin 时，才有小概率随机生成锦鲤
        if (this.hasRandomKoi && !this.randomKoiSpawned && timePassed >= this.randomKoiTime) {
            if (!this.player.hasLuckyCoin) { 
                let randomKoi = new KoiFish(random(375, 475));
                this.activeItems.push(randomKoi);
                this.randomKoiSpawned = true;
                
                if (koiInSfx && !koiInSfx.isPlaying()) {
                    koiInSfx.play();
                }
            } else {
                // 如果买了道具，就直接废弃本关的随机锦鲤机会
                this.randomKoiSpawned = true; 
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
                // ─── 核心修改开始：P2 用新潜水艇，P1 用老潜水艇 ───
                if (
                    i === 1 &&
                    typeof submarineImg2 !== "undefined" &&
                    submarineImg2
                ) {
                    // P2 (右边玩家) 用新的 submarineImg2
                    image(submarineImg2, 0, -40, 240, 130);
                } else if (
                    typeof submarineImg !== "undefined" &&
                    submarineImg
                ) {
                    // P1 (左边玩家) 或单人模式用老潜水艇
                    image(submarineImg, 0, -40, 240, 130);
                } else {
                    this._drawSubmarine(i);
                }
                // ─── 核心修改结束 ───
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

            // 关卡编号显示在顶部中央
            textAlign(CENTER, TOP);
            this.drawPixelText(
                `LV.${this.levelNum}`,
                centerX,
                line1Y,
                this.cPrimary,
            );

            let goalX = width - 180;
            this.drawPixelText(
                `GOAL: ${this.targetScore}`,
                goalX - 50,
                line1Y,
                this.cPrimary,
            );
            this.drawPixelText(
                `TIME: ${timeLeft}`,
                goalX - 50,
                line2Y,
                this.cP1,
                tAlpha,
            );

            this._pauseBtnBounds.cx = width - 35;
            this._pauseBtnBounds.cy = line1Y + 12;
        } else {
            // 双人模式 UI 布局：
            // 行1 (y=20)：P1（左） | TOTAL（中央） | P2（右）
            // 行2 (y=45)：LV.X（左） | GOAL（中央）
            // 行3 (y=70/95)：TIME（中央，深海时让位至 y=95）
            let timeLabelY = this.isDeepSea ? 95 : 70;

            textAlign(CENTER, TOP);
            this.drawPixelText(
                `TOTAL: ${this.player.totalScore}`,
                centerX,
                line1Y,
                this.cSecondary,
            );
            textAlign(LEFT, TOP);
            this.drawPixelText(
                `P1: ${this.player.p1Score}`,
                leftX,
                line1Y,
                this.cP1,
            );
            // 【修改前】：`P2: ${this.scores[1]}`
            textAlign(RIGHT, TOP);
            this.drawPixelText(
                `P2: ${this.player.p2Score}`,
                rightX - 50, // 为暂停按钮留出空间
                line1Y,
                this.cP2,
            );
            // 关卡编号显示在左侧第二行
            textAlign(LEFT, TOP);
            this.drawPixelText(
                `LV.${this.levelNum}`,
                leftX,
                line2Y,
                this.cPrimary,
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

    // 深海黑暗遮罩：填满黑色，然后用 destination-out 渐变在光源位置"挖洞"
    _updateDarknessLayer() {
        let dl = this.darknessLayer;
        dl.clear();
        dl.background(0, 0, 0, 215);
        let ctx = dl.drawingContext;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';

        for (let i = 0; i < this.hooks.length; i++) {
            let hook = this.hooks[i];
            let bx = this.boats[i].x;
            let by = this.boats[i].y + 25;
            let coneLen = 620;
            let spread = PI / 6;
            let nearDist = 30;
            let topHalfW = 20;

            let dx = sin(hook.angle);
            let dy = cos(hook.angle);
            let px = cos(hook.angle);
            let py = -sin(hook.angle);

            let tx = bx + dx * nearDist;
            let ty = by + dy * nearDist;

            let a1 = hook.angle - spread;
            let a2 = hook.angle + spread;

            // 潜水艇周围柔和径向渐变光晕（主晕影效果）
            let ambientR = 130;
            let ambientGrad = ctx.createRadialGradient(bx, by, 0, bx, by, ambientR);
            ambientGrad.addColorStop(0,    'rgba(0,0,0,1)');
            ambientGrad.addColorStop(0.5,  'rgba(0,0,0,0.9)');
            ambientGrad.addColorStop(0.82, 'rgba(0,0,0,0.45)');
            ambientGrad.addColorStop(1,    'rgba(0,0,0,0)');
            ctx.fillStyle = ambientGrad;
            ctx.beginPath();
            ctx.arc(bx, by, ambientR, 0, Math.PI * 2);
            ctx.fill();

            // 光锥：梯形路径 + 沿锥长方向线性渐变（近强远弱）+ 模糊柔化侧边
            let farCx = bx + dx * coneLen;
            let farCy = by + dy * coneLen;
            let coneGrad = ctx.createLinearGradient(bx, by, farCx, farCy);
            coneGrad.addColorStop(0,    'rgba(0,0,0,0.85)');
            coneGrad.addColorStop(0.55, 'rgba(0,0,0,0.6)');
            coneGrad.addColorStop(1,    'rgba(0,0,0,0)');
            ctx.filter = 'blur(18px)';
            ctx.fillStyle = coneGrad;
            ctx.beginPath();
            ctx.moveTo(tx + px * topHalfW, ty + py * topHalfW);
            ctx.lineTo(bx + Math.sin(a2) * coneLen, by + Math.cos(a2) * coneLen);
            ctx.lineTo(bx + Math.sin(a1) * coneLen, by + Math.cos(a1) * coneLen);
            ctx.lineTo(tx - px * topHalfW, ty - py * topHalfW);
            ctx.closePath();
            ctx.fill();
            ctx.filter = 'none';
        }

        // 鮟鱇鱼：柔和径向发光（随脉冲动态变化）
        for (let item of this.activeItems) {
            if (item instanceof AnglerFish) {
                let pulse = 0.15 * sin(frameCount * 0.05 + item.glowPulse);
                let r = item.glowRadius * (1 + pulse);
                let grad = ctx.createRadialGradient(item.position.x, item.position.y, 0, item.position.x, item.position.y, r);
                grad.addColorStop(0,   'rgba(0,0,0,0.85)');
                grad.addColorStop(0.5, 'rgba(0,0,0,0.45)');
                grad.addColorStop(1,   'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(item.position.x, item.position.y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            // 珍珠：柔和蓝白光晕
            if (item instanceof Pearl) {
                let pulse = 0.25 * sin(frameCount * 0.06 + item.glowPhase);
                let r = item.glowRadius * (1 + pulse);
                let grad = ctx.createRadialGradient(item.position.x, item.position.y, 0, item.position.x, item.position.y, r);
                grad.addColorStop(0,   'rgba(0,0,0,0.85)');
                grad.addColorStop(0.5, 'rgba(0,0,0,0.45)');
                grad.addColorStop(1,   'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(item.position.x, item.position.y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            if (item instanceof KoiFish) {
                let pulse = 0.15 * sin(frameCount * 0.05 + item.glowPhase);
                let r = item.glowRadius * (1 + pulse);
                let grad = ctx.createRadialGradient(item.position.x, item.position.y, 0, item.position.x, item.position.y, r);
                grad.addColorStop(0,   'rgba(0,0,0,0.85)');
                grad.addColorStop(0.5, 'rgba(0,0,0,0.45)');
                grad.addColorStop(1,   'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(item.position.x, item.position.y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            if (item instanceof SwimmingPearlShell) {
                let pulse = 0.2 * sin(frameCount * 0.06 + item.glowPhase);
                let r = item.glowRadius * (1 + pulse);
                let grad = ctx.createRadialGradient(item.position.x, item.position.y, 0, item.position.x, item.position.y, r);
                grad.addColorStop(0,   'rgba(0,0,0,0.8)');
                grad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
                grad.addColorStop(1,   'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(item.position.x, item.position.y, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
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
        const panelW = 430;
        const panelH = 600;
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
        // 【修复】拆分过长的目标句
        text("Catch fish & treasure to reach", lx, cy);
        cy += lineH;
        text("the GOAL score.", lx, cy);
        cy += lineH;
        text("Stone: 70-110 pts. Fish bone: 0 pts", lx, cy);
        cy += lineH;
        text("  (20-50 with Fishbone Collector).", lx, cy);
        cy += lineH + 6;

        // ── 商店与深海 ──
        fill(255, 210, 50);
        textSize(11);
        textStyle(BOLD);
        text("SHOP & DEEP SEA", lx, cy);
        cy += lineH + 4;
        fill(190, 230, 255);
        textStyle(NORMAL);
        text("Pass a level to enter the shop.", lx, cy);
        cy += lineH;
        text("Submarine: unlocks Deep Sea mode", lx, cy);
        cy += lineH;
        text("  (dark waters, high-value fish).", lx, cy);
        cy += lineH;
        text("Sharks: steal your catch while", lx, cy);
        cy += lineH;
        text("  reeling up!", lx, cy);
        cy += lineH + 8;

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
            text("P1 (Left  boat) : Press S", lx, cy);
            cy += lineH;
            text("P2 (Right boat) : Press DOWN \u2193", lx, cy);
            cy += lineH;
        } else {
            // 【修复】拆分过长的单人操作句
            text("Press DOWN ARROW \u2193 to cast", lx, cy);
            cy += lineH;
        }

        // 【修复】拆分过长的暂停说明句
        text("Pause : click the \u23F8 button", lx, cy);
        cy += lineH;
        text("(top-right)", lx, cy);
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
        // 【修复】左右排列太长会超出边界，改为分4行上下排列
        text("Small Fish: 60-90 pts", lx, cy);
        cy += lineH;
        text("Big Fish / Angler: 220-800 pts", lx, cy);
        cy += lineH;
        text("Treasure: 190-280 pts", lx, cy);
        cy += lineH;
        text("Stone: 70-110 pts", lx, cy);
        cy += lineH;
        text("Pearl / Moving Shell: 1000 pts", lx, cy);
        cy += lineH;
        text("Fish bone: 0 pts (20-50 w/ Collector)", lx, cy);

        pop();
    }
}
