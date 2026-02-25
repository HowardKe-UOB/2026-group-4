class LevelManager {
    // 传入 player 对象，以便直接操作总分数
    constructor(difficulty, levelNum, player) {
        this.player = player;

        // 目标分数随关卡数增加（例如：第一关 500，第二关 1200，第三关 2100...）
        this.targetScore = levelNum * 300 + (levelNum - 1) * 150;

        this.timeLimit = difficulty === Difficulty.HARD ? 20 : 30;
        this.timeRemaining = this.timeLimit;

        this.playerBoat = createVector(width / 2, 50);
        this.hook = new Hook(this.playerBoat.x, this.playerBoat.y);
        this.activeItems = [];

        this.spawnItems();
    }

    spawnItems() {
        this.activeItems = [];

        // ===== 生成区域（每种物品可分配不同范围）=====
        const zones = {
            midWater: { xMin: 60, xMax: width - 60, yMin: 140, yMax: height * 0.55 },
            nearBottom: { xMin: 60, xMax: width - 60, yMin: height * 0.55, yMax: height - 70 },
            deep: { xMin: 80, xMax: width - 80, yMin: height * 0.68, yMax: height - 90 },
        };

        // ===== 可选稀有物品（如果你还没在 SeaItem.js 里加类，这里会自动跳过）=====
        const hasOceanTear = typeof OceanTear !== "undefined";
        const hasPearlNest = typeof PearlNest !== "undefined";

        // ===== 数量配置（保证总数大约 15 个；有稀有物品时自动调整）=====
        const fishCount = hasOceanTear || hasPearlNest ? 7 : 8;
        const junkCount = hasOceanTear || hasPearlNest ? 3 : 4;
        const treasureCount = 3;

        const configs = [
            // Fish：中层海域，间距较小
            { count: fishCount, minDist: 55, zone: zones.midWater, make: (x, y) => new Fish(x, y) },

            // Treasure：偏底部，间距更大
            { count: treasureCount, minDist: 80, zone: zones.nearBottom, make: (x, y) => new Treasure(x, y) },

            // Junk：底部
            { count: junkCount, minDist: 70, zone: zones.nearBottom, make: (x, y) => new Junk(x, y) },
        ];

        // 稀有高价值小体积物品（更深、更稀少、更难抓——需要你在 SeaItem.js 里实现对应类/逻辑）
        if (hasOceanTear) {
            configs.push({ count: 1, minDist: 110, zone: zones.deep, make: (x, y) => new OceanTear(x, y) });
        }
        if (hasPearlNest) {
            configs.push({ count: 1, minDist: 130, zone: zones.deep, make: (x, y) => new PearlNest(x, y) });
        }

        const padding = 6; // 额外安全间距，减少“擦边重叠”

        for (const cfg of configs) {
            this._spawnUniformNonOverlapping(cfg, padding);
        }
    }

    // ===== 更均匀的生成：网格分层 + 抖动（jitter）+ 非重叠检查 =====
    _spawnUniformNonOverlapping(cfg, padding) {
        const { zone, minDist, count, make } = cfg;

        // 1) 构建网格候选点（更均匀）
        const cell = minDist;
        const candidates = [];
        for (let y = zone.yMin + cell * 0.5; y <= zone.yMax; y += cell) {
            for (let x = zone.xMin + cell * 0.5; x <= zone.xMax; x += cell) {
                candidates.push({ x, y });
            }
        }

        // p5.js 提供 shuffle；这里用复制版避免改动原数组
        const pts = typeof shuffle !== "undefined" ? shuffle(candidates, true) : candidates;

        // 2) 在候选点附近抖动，避免“太网格化”
        const jitter = cell * 0.35;

        let spawned = 0;
        for (let i = 0; i < pts.length && spawned < count; i++) {
            const x = constrain(pts[i].x + random(-jitter, jitter), zone.xMin, zone.xMax);
            const y = constrain(pts[i].y + random(-jitter, jitter), zone.yMin, zone.yMax);

            const item = make(x, y);
            if (this._isPositionFree(item, this.activeItems, padding)) {
                this.activeItems.push(item);
                spawned++;
            }
        }

        // 3) 兜底：若候选点不足或冲突太多，随机补齐
        let tries = 0;
        while (spawned < count && tries < 400) {
            tries++;
            const x = random(zone.xMin, zone.xMax);
            const y = random(zone.yMin, zone.yMax);
            const item = make(x, y);
            if (this._isPositionFree(item, this.activeItems, padding)) {
                this.activeItems.push(item);
                spawned++;
            }
        }
    }

    // ===== 生成时非重叠检查：用“半径”近似碰撞 =====
    _isPositionFree(newItem, items, padding) {
        const rNew = this._getItemRadius(newItem);

        for (const it of items) {
            const rIt = this._getItemRadius(it);
            const d = dist(
                newItem.position.x, newItem.position.y,
                it.position.x, it.position.y
            );
            if (d < rNew + rIt + padding) return false;
        }
        return true;
    }

    _getItemRadius(item) {
        // 如果你在 SeaItem.js 里实现了 getRadius()，这里会自动用更准确的
        if (item && typeof item.getRadius === "function") return item.getRadius();

        // 否则用宽高近似
        const w = item && item.width ? item.width : 40;
        const h = item && item.height ? item.height : 30;
        return max(w, h) * 0.5;
    }

    update(deltaTime) {
        if (frameCount % 60 === 0 && this.timeRemaining > 0) {
            this.timeRemaining--;
        }

        // 让所有海里的物品更新（鱼会游动）
        for (let item of this.activeItems) {
            item.update();
        }

        let returnedItem = this.hook.update();
        if (returnedItem) {
            // 直接将分数加到玩家的总分上
            this.player.addScore(returnedItem.scoreValue);
            this.hook.attachedItem = null;
        }

        // ===== 抓取逻辑：支持 blocksHook / canBeGrabbed；否则回退到旧逻辑 d<30 =====
        if (this.hook.state === HookState.MOVING_DOWN) {
            // 1) 先处理“会阻挡钩子”的特殊物品（例如：PearlNest 石环）
            for (const item of this.activeItems) {
                if (item && typeof item.blocksHook === "function" && item.blocksHook(this.hook)) {
                    this.hook.retractUp(); // 撞到障碍 -> 强制收钩（浪费时间）
                    return this.checkWinCondition();
                }
            }

            // 2) 再处理可抓取物品：选“最贴合”的目标
            let bestIndex = -1;
            let bestMetric = Infinity;

            for (let i = 0; i < this.activeItems.length; i++) {
                const item = this.activeItems[i];

                // 如果实现了 canBeGrabbed，就用它（不同物品不同难度）
                if (item && typeof item.canBeGrabbed === "function") {
                    if (!item.canBeGrabbed(this.hook)) continue;

                    const d = dist(
                        this.hook.position.x, this.hook.position.y,
                        item.position.x, item.position.y
                    );
                    const gr = item.getGrabRadius && typeof item.getGrabRadius === "function"
                        ? item.getGrabRadius()
                        : 30;

                    const metric = d / max(1, gr);
                    if (metric < bestMetric) {
                        bestMetric = metric;
                        bestIndex = i;
                    }
                } else {
                    // 回退：旧逻辑（兼容你当前未改 SeaItem.js 的版本）
                    const d = dist(
                        this.hook.position.x, this.hook.position.y,
                        item.position.x, item.position.y
                    );
                    if (d < 30) {
                        bestIndex = i;
                        break;
                    }
                }
            }

            if (bestIndex !== -1) {
                const item = this.activeItems[bestIndex];
                this.hook.grabItem(item);
                this.activeItems.splice(bestIndex, 1);
            }
        }

        return this.checkWinCondition();
    }

    checkWinCondition() {
        if (this.timeRemaining <= 0) {
            // 结算时，判断【玩家总分】是否达到了【当前关卡目标分】
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

        // UI 显示更新：现在显示的是玩家总分 vs 目标分
        fill(255);
        textSize(20);
        textAlign(LEFT, TOP);
        text(`Score: ${this.player.totalScore} / ${this.targetScore}`, 10, 10);
        textAlign(RIGHT, TOP);
        text(`Time: ${this.timeRemaining}`, width - 10, 10);
    }
}