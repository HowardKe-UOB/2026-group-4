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

        // 名字重复检测：null=未检测/检测中, true=已存在, false=不存在
        this.nameExistsCheck = null;
        this.lastCheckedName = '';

        this.highScoreScrollY = 0;
        this.highScoreScrollDragging = false;

        this.gamePaused = false;

        this.menuSelectionIndex = 0;

        // Fish gallery: ScoreEntry when a leaderboard row is clicked, null otherwise
        this.fishGalleryEntry = null;

        // 游戏失败后进入排行榜时，用不同颜色高亮最新玩家
        this.lastGameFailed = false;
    }

    // Fish gallery: fish1–fish64 + Angler Fish
    static get FISH_GALLERY_TYPES() {
        const list = [];
        for (let i = 1; i <= 43; i++) {
            const idx = i - 1;
            const names = GameManager.FISH_NAMES[`fish${i}`];
            list.push({
                key: `fish${i}`,
                label: names ? names.en : `Fish ${i}`,
                getImg: () => (typeof imgSmallFishes !== 'undefined' && imgSmallFishes[idx]) ? imgSmallFishes[idx][0] : null,
            });
        }
        for (let i = 44; i <= 64; i++) {
            const idx = i - 44;
            const names = GameManager.FISH_NAMES[`fish${i}`];
            list.push({
                key: `fish${i}`,
                label: names ? names.en : `Fish ${i}`,
                getImg: () => (typeof imgBigFishes !== 'undefined' && imgBigFishes[idx]) ? imgBigFishes[idx][0] : null,
            });
        }
        list.push({
            key: 'Angler Fish',
            label: 'Angler Fish',
            getImg: () => (typeof anglerFishImgs !== 'undefined' && anglerFishImgs.length > 0) ? anglerFishImgs[0] : null,
        });
        return list;
    }

    // Fish names: fish1–fish43 (by asset index), for hover tooltip in gallery
    static get FISH_NAMES() {
        return {
            fish1: { en: 'European Anchovy', zh: '欧洲鳀鱼' },
            fish2: { en: 'Neon Tetra', zh: '霓虹脂鲤 / 红绿灯鱼' },
            fish3: { en: 'Ocellaris Clownfish', zh: '眼斑双锯鱼 / 小丑鱼' },
            fish4: { en: 'Purple Firefish', zh: '紫雷达' },
            fish5: { en: 'Green Chromis', zh: '青魔' },
            fish6: { en: 'Yellowtail Damselfish', zh: '黄尾雀鲷' },
            fish7: { en: 'Ribbon Eel', zh: '黑身管鼻鯙 / 彩带鳗' },
            fish8: { en: 'Royal Gramma', zh: '皇家神仙' },
            fish9: { en: 'Pilot Fish', zh: '领航鱼' },
            fish10: { en: 'Antarctic Krill', zh: '南极磷虾' },
            fish11: { en: 'Sea Goldie', zh: '海金鱼' },
            fish12: { en: 'Blue Tang', zh: '副刺尾鱼 / 蓝吊' },
            fish13: { en: 'Yellow Tang', zh: '黄高鳍刺尾鱼 / 黄三角' },
            fish14: { en: 'Seahorse', zh: '海马' },
            fish15: { en: 'Sea Urchin', zh: '海胆' },
            fish16: { en: 'Lemonpeel Angelfish', zh: '柠檬神仙' },
            fish17: { en: 'Asian Arowana', zh: '亚洲龙鱼 / 金龙鱼' },
            fish18: { en: 'Common Squid', zh: '普通鱿鱼' },
            fish19: { en: 'Channel Catfish', zh: '斑点叉尾鮰 / 鲶鱼' },
            fish20: { en: 'Flounder', zh: '比目鱼' },
            fish21: { en: 'Atlantic Mackerel', zh: '大西洋鲭鱼' },
            fish22: { en: 'Red Snapper', zh: '红笛鲷' },
            fish23: { en: 'Goldfish', zh: '金鱼' },
            fish24: { en: 'Porcupinefish', zh: '密斑刺鲀' },
            fish25: { en: 'Red Lionfish', zh: '红狮子鱼 / 蓑鲉' },
            fish26: { en: 'Red-bellied Piranha', zh: '红腹食人鱼' },
            fish27: { en: 'Swordfish', zh: '剑鱼' },
            fish28: { en: 'Axolotl', zh: '美西螈 / 六角恐龙' },
            fish29: { en: 'Common Octopus', zh: '普通章鱼' },
            fish30: { en: 'Flying Fish', zh: '飞鱼' },
            fish31: { en: 'Coral Grouper', zh: '豹纹鳃棘鲈 / 东星斑' },
            fish32: { en: 'Green Pufferfish', zh: '绿河鲀' },
            fish33: { en: 'Emperor Angelfish', zh: '主刺盖鱼 / 国王神仙' },
            fish34: { en: 'Moorish Idol', zh: '镰鱼 / 角蝶' },
            fish35: { en: 'Parrotfish', zh: '鹦嘴鱼' },
            fish36: { en: 'Deep Sea Anglerfish', zh: '深海𩽾𩾌鱼' },
            fish37: { en: 'Orange Roughy', zh: '长寿鱼 / 红胸燧鲷' },
            fish38: { en: 'Footballfish', zh: '足球鱼' },
            fish39: { en: 'Wrasse', zh: '隆头鱼' },
            fish40: { en: 'Great Barracuda', zh: '大鳞魣 / 海狼鱼' },
            fish41: { en: 'Yellow Boxfish', zh: '粒突箱鲀' },
            fish42: { en: 'Golden Trevally', zh: '黄鹂无齿鲹' },
            fish43: { en: 'Flame Angelfish', zh: '火焰神仙鱼' },
            fish44: { en: 'Coelacanth', zh: '腔棘鱼 / 活化石' },
            fish45: { en: 'Great White Shark', zh: '大白鲨' },
            fish46: { en: 'Manta Ray', zh: '巨型鬼蝠魟 / 魔鬼鱼' },
            fish47: { en: 'Laser Shark', zh: '镭射鲨鱼 / 机械改造鲨' },
            fish48: { en: 'Arapaima', zh: '巨骨舌鱼 / 海象鱼' },
            fish49: { en: 'Humphead Wrasse', zh: '苏眉鱼' },
            fish50: { en: 'Ocean Sunfish', zh: '翻车鱼 / 曼波鱼' },
            fish51: { en: 'Giant Mekong Catfish', zh: '湄公河巨鲶' },
            fish52: { en: 'Purple Queen Anthias', zh: '紫皇后鱼' },
            fish53: { en: 'Mahi-Mahi', zh: '鲯鳅 / 鬼头刀' },
            fish54: { en: 'Leafy Seadragon', zh: '叶海龙' },
            fish55: { en: 'Giant Trevally', zh: '珍鲹 / GT' },
            fish56: { en: 'Goliath Grouper', zh: '伊氏石斑鱼' },
            fish57: { en: 'Red Coelacanth', zh: '红色腔棘鱼' },
            fish58: { en: 'Green Coelacanth', zh: '绿色腔棘鱼' },
            fish59: { en: 'Hairy Angler', zh: '多毛鮟鱇' },
            fish60: { en: 'Giant Pufferfish', zh: '巨型河鲀' },
            fish61: { en: 'Bluefin Tuna', zh: '蓝鳍金枪鱼' },
            fish62: { en: 'Fangtooth', zh: '尖牙鱼' },
            fish63: { en: 'Lancetfish', zh: '帆蜥鱼' },
            fish64: { en: 'Viperfish', zh: '毒蛇鱼' },
            'Angler Fish': { en: 'Angler Fish', zh: '鮟鱇鱼' },
        };
    }

    _mergeFishCaught() {
        if (!this.levelManager || !this.levelManager.fishCaught) return;
        this.gameSessionFishCaught = this.gameSessionFishCaught || {};
        for (const k in this.levelManager.fishCaught) {
            this.gameSessionFishCaught[k] = (this.gameSessionFishCaught[k] || 0) + (this.levelManager.fishCaught[k] || 0);
        }
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
        this.player.p1Score = 0;  // 重置双人各自余额
        this.player.p2Score = 0;
        this.player.hasSubmarine = false;  // 避免沿用上一局的潜水艇
        this.player.hasClover = false;  // 避免沿用上一局的四叶草
        this.player.hasFishboneCollector = false;   // 避免沿用上一局的鱼骨收藏书
        this.gameSessionFishCaught = {};
        this.levelNum = 1;
        const buttonOverlay = document.getElementById('button-overlay');
        if (buttonOverlay) {
            buttonOverlay.classList.add('hidden');
            buttonOverlay.classList.remove('active'); // 确保完全禁用点击
        }

        // 先展示操作说明，点击后再真正开始
        this.changeState(GameState.HOW_TO_PLAY);
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
            this.fishGalleryEntry = null;
            this.highScoreManager.hasFetchedMore = false;
            this.highScoreManager.fetchFromSupabase();
        }
        if (newState === GameState.NAME_ENTRY) {
            this.inputText = '';  // 返回名字输入时清空，不显示上一盘的名字
            this.nameExistsCheck = null;
            this.lastCheckedName = '';
        }
        if (
            newState === GameState.DIFFICULTY_SELECT ||
            newState === GameState.PLAYER_MODE_SELECT
        ) {
            this.menuSelectionIndex = 0;
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
        //游戏中背景音乐
        if (this.currentState === GameState.PLAYING) {
            if (
                typeof gameplayBgm !== 'undefined' &&
                gameplayBgm &&
                !gameplayBgm.isPlaying()
            ) {
                gameplayBgm.loop();
            }
        } else {
            if (
                typeof gameplayBgm !== 'undefined' &&
                gameplayBgm &&
                gameplayBgm.isPlaying()
            ) {
                gameplayBgm.stop();
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

    // 名字重复检测：优先 fetch 远程，失败则用 localStorage
    _triggerNameCheck() {
        const name = (this.inputText || '').trim();
        if (!name) {
            this.nameExistsCheck = null;
            this.lastCheckedName = '';
            return;
        }
        if (name === this.lastCheckedName) return;
        this.lastCheckedName = name;
        this.nameExistsCheck = null;
        this._checkNameExists(name).then((exists) => {
            if (this.lastCheckedName === name) {
                this.nameExistsCheck = exists;
            }
        });
    }

    async _checkNameExists(name) {
        const n = name.trim().toLowerCase();
        if (!n) return false;

        const cfg =
            typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : null;
        if (typeof isProdOrigin === 'function' && isProdOrigin() && cfg && cfg.url && cfg.anonKey && !cfg.url.includes('YOUR_')) {
            try {
                const res = await fetch(
                    `${cfg.url}/rest/v1/scores?select=player_name&limit=200`,
                    {
                        method: 'GET',
                        headers: {
                            apikey: cfg.anonKey,
                            Authorization: `Bearer ${cfg.anonKey}`,
                        },
                    },
                );
                if (res.ok) {
                    const rows = await res.json();
                    const names = (rows || []).map((r) =>
                        (r.player_name || '').trim().toLowerCase(),
                    );
                    return names.includes(n);
                }
            } catch (_e) {
                /* Supabase fetch 失败，回退到 localStorage */
            }
        }

        const local = this.highScoreManager.topScores || [];
        return local.some(
            (e) => (e.playerName || '').trim().toLowerCase() === n,
        );
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
                this._triggerNameCheck();
                this.drawNameEntry();
                break;
            case GameState.DIFFICULTY_SELECT:
                this.drawDifficultySelect();
                break;
            case GameState.PLAYER_MODE_SELECT:
                this.drawPlayerModeSelect();
                break;
            case GameState.HOW_TO_PLAY:
                this.drawHowToPlay();
                break;
            case GameState.PLAYING:
                if (!this.gamePaused) {
                    let result = this.levelManager.update();
                    if (result === 'PASS') {
                        this._mergeFishCaught();
                        this.shopManager.resetShop(this.levelNum);
                        this.changeState(GameState.SHOP);
                    } else if (result === 'FAIL') {
                        this._mergeFishCaught();
                        this.lastGameFailed = true;
                        const levelsCompleted = Math.max(0, this.levelNum - 1);
                        this.highScoreManager.checkNewHighScore(
                            this.player.totalScore,
                            this.player.name || 'Anon',
                            levelsCompleted,
                            this.currentDifficulty,
                            this.currentPlayerMode,
                            this.gameSessionFishCaught || {},
                        );
                        this.changeState(GameState.LEVEL_RESULT);
                    }
                }
                this.levelManager.draw();
                if (this.gamePaused) this.drawPauseMenu();
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
        const boxY = height / 2 + 25;
        fill(30, 60, 90, 200);
        rect(width / 2, boxY, 260, 50, 8);
        fill(255, 255, 255, 80);
        rect(width / 2, boxY - 2, 256, 46, 6);
        textSize(20);
        if (this.inputText) {
            fill(240, 248, 255);
            text(
                this.inputText + (frameCount % 60 < 30 ? '|' : ''),
                width / 2,
                boxY,
            );
        } else {
            fill(180, 180, 200, 180);
            text('enter your name', width / 2, boxY);
        }

        // 名字已存在时显示红色提示
        if (this.nameExistsCheck === true) {
            fill(255, 80, 80);
            textSize(12);
            text('name already exists', width / 2, boxY + 55);
        }

        fill(200, 230, 255);
        textSize(16);
        text('Press ENTER to cast off', width / 2, boxY + 75);

        // 右下角小奖杯，点击进入高分榜
        const trophySize = 28;
        const trophyX = width - 36;
        const trophyY = height - 36;
        textSize(trophySize);
        text('🏆', trophyX, trophyY);
        this._trophyButtonBounds = { cx: trophyX, cy: trophyY, w: 44, h: 44 };
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

    drawPlayerModeSelect() {
        if (typeof modeSelectBgImg !== 'undefined' && modeSelectBgImg) {
            this.drawCoverBackground(modeSelectBgImg);
        } else {
            this.drawOceanMenuBackground();
        }
    }

    drawHowToPlay() {
        // 深海背景
        background(5, 20, 45);

        push();
        if (typeof pixelFont !== 'undefined' && pixelFont) textFont(pixelFont);
        rectMode(CORNER);
        noSmooth();

        // 居中面板
        const panelW = 520;
        const panelH = 680;
        const panelX = (width - panelW) / 2;
        const panelY = (height - panelH) / 2;

        // 面板背景
        noStroke();
        fill(0, 0, 0, 140);
        rect(panelX + 4, panelY + 4, panelW, panelH, 12);
        fill(5, 30, 60, 230);
        rect(panelX, panelY, panelW, panelH, 12);
        stroke(0, 160, 220);
        strokeWeight(2);
        noFill();
        rect(panelX, panelY, panelW, panelH, 12);
        noStroke();

        const lx = panelX + 24;
        const maxW = panelW - 48; // 文字可用宽度
        let cy = panelY + 24;
        const lineH = 24;

        // 标题
        fill(0, 220, 255);
        textAlign(LEFT, TOP);
        textSize(13);
        textStyle(BOLD);
        text("HOW TO PLAY", lx, cy);
        cy += lineH + 8;

        // GAME INTRO
        fill(255, 210, 50);
        textSize(11);
        text("GAME INTRO", lx, cy);
        cy += lineH;
        fill(190, 230, 255);
        textStyle(NORMAL);
        text("Catch fish & treasure to reach", lx, cy);
        cy += lineH;
        text("the GOAL score.", lx, cy);
        cy += lineH;
        text("Stone: 70-110 pts. Fish bone: 0 pts", lx, cy);
        cy += lineH;
        text("  (20-50 with Fishbone Collector).", lx, cy);
        cy += lineH + 8;

        // SHOP & DEEP SEA
        fill(255, 210, 50);
        textSize(11);
        textStyle(BOLD);
        text("SHOP & DEEP SEA", lx, cy);
        cy += lineH;
        fill(190, 230, 255);
        textStyle(NORMAL);
        text("Pass a level to enter the shop.", lx, cy);
        cy += lineH;
        text("Submarine: unlocks Deep Sea mode", lx, cy);
        cy += lineH;
        text("  (dark waters, high-value fish).", lx, cy);
        cy += lineH;
        text("Sharks in Deep Sea: steal your catch", lx, cy);
        cy += lineH;
        text("  while reeling up!", lx, cy);
        cy += lineH + 8;

        // 分割线
        stroke(0, 120, 180, 180);
        strokeWeight(1);
        line(lx, cy, panelX + panelW - 24, cy);
        noStroke();
        cy += 12;

        // CONTROLS
        fill(255, 210, 50);
        textSize(11);
        textStyle(BOLD);
        text("CONTROLS", lx, cy);
        cy += lineH;
        fill(190, 230, 255);
        textStyle(NORMAL);
        if (this.currentPlayerMode === PlayerMode.TWO_PLAYER) {
            text("P1 (Left  boat) : Press S", lx, cy);
            cy += lineH;
            text("P2 (Right boat) : Press DOWN \u2193", lx, cy);
            cy += lineH;
        } else {
            text("Press DOWN ARROW \u2193 to cast the hook", lx, cy);
            cy += lineH;
        }
        text("Pause : click the \u23F8 button (top-right)", lx, cy);
        cy += lineH + 8;

        // 分割线
        stroke(0, 120, 180, 180);
        strokeWeight(1);
        line(lx, cy, panelX + panelW - 24, cy);
        noStroke();
        cy += 12;

        // ITEM VALUES
        fill(255, 210, 50);
        textSize(11);
        textStyle(BOLD);
        text("ITEM VALUES", lx, cy);
        cy += lineH;
        fill(190, 230, 255);
        textStyle(NORMAL);
        text("Small Fish: 60-90 pts", lx, cy);
        cy += lineH;
        text("Big Fish / Angler Fish: 220-800 pts", lx, cy);
        cy += lineH;
        text("Treasure: 190-280 pts", lx, cy);
        cy += lineH;
        text("Pearl: 500-800 pts", lx, cy);
        cy += lineH;
        text("  (rare, tiny hitbox!)", lx, cy);
        cy += lineH;
        text("Stone: 70-110 pts", lx, cy);
        cy += lineH;
        text("Fish bone: 0 pts (20-50 w/ Collector)", lx, cy);
        cy += lineH + 16;

        // 闪烁提示
        let blinkAlpha = 150 + 105 * sin(frameCount * 0.08);
        fill(0, 220, 180, blinkAlpha);
        textAlign(CENTER, TOP);
        textSize(11);
        textStyle(BOLD);
        text("CLICK ANYWHERE TO START", width / 2, cy);

        pop();
    }

    drawShop() {
        push();
        this.shopManager.draw(this.player, this.currentPlayerMode, this.levelNum);
        pop();
    }

    drawPauseMenu() {
        push();
        if (typeof pixelFont !== 'undefined') textFont(pixelFont);
        rectMode(CORNER);
        noSmooth();

        fill(0, 0, 0, 160);
        rect(0, 0, width, height);

        const panelW = 380;
        const panelH = 220;
        const panelX = (width - panelW) / 2;
        const panelY = (height - panelH) / 2;

        if (typeof pauseMenuBgImg !== 'undefined' && pauseMenuBgImg && pauseMenuBgImg.width) {
            imageMode(CORNER);
            image(pauseMenuBgImg, panelX, panelY, panelW, panelH);
        } else {
            const px = 4;
            fill(28, 28, 50);
            rect(panelX + px, panelY + px, panelW, panelH, 0);
            fill(15, 45, 85);
            rect(panelX, panelY, panelW, panelH, 0);
            stroke(80, 150, 220);
            strokeWeight(4);
            noFill();
            rect(panelX, panelY, panelW, panelH, 0);
            noStroke();
        }

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(8);
        textStyle(BOLD);
        this._drawPixelTextOutline('PAUSED', width / 2, panelY + 50);
        textStyle(NORMAL);

        const btnW = 180;
        const btnH = 38;
        const btnGap = 20;
        const btn1X = (width - btnW) / 2;
        const titleH = 56;
        const btnBlockH = btnH * 2 + btnGap;
        const btnStartY = panelY + titleH + (panelH - titleH - btnBlockH) / 2 - 10;
        const btn1Y = btnStartY;
        const btn2Y = btnStartY + btnH + btnGap;

        const closeBtnSize = 22;
        const closeBtnX = panelX + panelW - closeBtnSize - 6;
        const closeBtnY = panelY + 6;
        this._drawPixelButton(closeBtnX, closeBtnY, closeBtnSize, closeBtnSize, [80, 120, 160], [50, 80, 120]);
        fill(255);
        textSize(10);
        textAlign(CENTER, CENTER);
        text('X', closeBtnX + closeBtnSize / 2, closeBtnY + closeBtnSize / 2);
        this._pauseMenuBtnClose = { x: closeBtnX, y: closeBtnY, w: closeBtnSize, h: closeBtnSize };

        this._drawPixelButton(btn1X, btn1Y, btnW, btnH, [180, 60, 60], [140, 40, 40]);
        fill(255, 220, 220);
        textSize(8);
        text('FINISH THE GAME', width / 2, btn1Y + btnH / 2);

        this._drawPixelButton(btn1X, btn2Y, btnW, btnH, [60, 140, 80], [40, 100, 60]);
        fill(220, 255, 220);
        textSize(8);
        text('RESTART GAME', width / 2, btn2Y + btnH / 2);

        this._pauseMenuBtn1 = { x: btn1X, y: btn1Y, w: btnW, h: btnH };
        this._pauseMenuBtn2 = { x: btn1X, y: btn2Y, w: btnW, h: btnH };

        pop();
    }

    _drawPixelButton(x, y, w, h, baseCol, shadowCol) {
        noStroke();
        fill(shadowCol[0], shadowCol[1], shadowCol[2]);
        rect(x + 4, y + 4, w, h, 0);
        fill(baseCol[0], baseCol[1], baseCol[2]);
        rect(x, y, w, h, 0);
        stroke(40, 40, 60);
        strokeWeight(4);
        noFill();
        rect(x, y, w, h, 0);
        noStroke();
    }

    _drawPixelTextOutline(txt, cx, cy) {
        fill(28, 28, 50);
        text(txt, cx - 2, cy - 2);
        text(txt, cx + 2, cy - 2);
        text(txt, cx - 2, cy + 2);
        text(txt, cx + 2, cy + 2);
        fill(255);
        text(txt, cx, cy);
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

        // 使用水下像素艺术背景图
        if (
            typeof leaderboardBgImg !== 'undefined' &&
            leaderboardBgImg &&
            leaderboardBgImg.width
        ) {
            this.drawCoverBackground(leaderboardBgImg);
        } else {
            fill(8, 28, 55);
            rect(0, 0, width, height);
        }

        // 适配 1280x720：居中卡片，留白和谐
        const panelW = min(580, width * 0.45);
        const panelH = min(500, height * 0.7);
        const panelX = (width - panelW) / 2;
        const panelY = (height - panelH) / 2 - 20;
        const rowH = 58;
        const startY = panelY + 70;
        const listAreaH = panelH - (startY - panelY) - 20;
        const rowW = panelW - 64;
        const rowX = panelX + 16;
        const scrollbarW = 12;
        const scrollbarX = panelX + panelW - scrollbarW - 20;
        const scrollbarY = startY;
        const scrollbarH = listAreaH;

        const totalH =
            (this.highScoreManager.topScores.length +
                (this.highScoreManager.isLoadingMore ? 1 : 0)) *
            rowH;
        const maxScroll = max(0, totalH - listAreaH);
        if (this.highScoreManager._scrollAfterLoadMore != null) {
            this.highScoreScrollY = constrain(
                this.highScoreManager._scrollAfterLoadMore,
                0,
                maxScroll,
            );
            this.highScoreManager._scrollAfterLoadMore = null;
        } else {
            this.highScoreScrollY = constrain(
                this.highScoreScrollY,
                0,
                maxScroll,
            );
        }

        if (
            isProdOrigin() &&
            this.highScoreManager.hasMoreScores &&
            !this.highScoreManager.isLoadingMore &&
            maxScroll > 0 &&
            this.highScoreScrollY >= maxScroll - 80
        ) {
            this.highScoreManager.fetchMoreFromSupabase();
        }

        // 半透明遮罩，提升面板可读性，同时保留背景氛围
        fill(0, 25, 50, 70);
        rect(0, 0, width, height);

        // 毛玻璃风格面板：与水下主题协调
        fill(0, 0, 0, 45);
        rect(panelX + 6, panelY + 6, panelW, panelH, 16);
        fill(15, 45, 85, 200);
        rect(panelX, panelY, panelW, panelH, 16);
        stroke(60, 140, 200, 220);
        strokeWeight(2);
        noFill();
        rect(panelX, panelY, panelW, panelH, 16);
        noStroke();

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        textStyle(BOLD);
        text('🏆 LEADERBOARD', width / 2, panelY + 32);
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

        this._leaderboardRowBounds = [];
        for (let i = 0; i < this.highScoreManager.topScores.length; i++) {
            let entry = this.highScoreManager.topScores[i];
            let rowTop = startY + i * rowH - this.highScoreScrollY;
            let ry = rowTop + rowH / 2;

            if (ry >= startY - rowH / 2 && ry <= startY + listAreaH + rowH / 2) {
                this._leaderboardRowBounds.push({
                    index: i,
                    entry: entry,
                    x: rowX,
                    y: rowTop + 4,
                    w: rowW,
                    h: rowH - 8,
                });
            }
            if (ry < startY - rowH / 2 || ry > startY + listAreaH + rowH / 2)
                continue;

            let isCurrent =
                entry.playerName === (this.player.name || 'Anon') &&
                entry.score === this.player.totalScore;
            const levelsCompleted =
                entry.levelsCompleted != null ? entry.levelsCompleted : 0;

            if (isCurrent && this.lastGameFailed) {
                fill(200, 100, 60, 240);
            } else if (isCurrent) {
                fill(40, 160, 120, 230);
            } else {
                fill(25, 70, 120, 200);
            }
            rect(rowX, rowTop + 4, rowW, rowH - 8, 12);

            fill(255);
            textAlign(LEFT, CENTER);
            textSize(13);
            text(i + 1, rowX + 10, ry);

            this.drawScoreAvatar(rowX + 42, ry, entry.playerName);

            this.drawModeIcon(rowX + 72, ry, entry.difficulty, entry.playerMode);

            textSize(14);
            text(entry.playerName, rowX + 98, ry);

            textAlign(RIGHT, CENTER);
            fill(255, 215, 0);
            textSize(14);
            const scoreText =
                levelsCompleted > 0
                    ? `🏆 ${entry.score}  Lv.${levelsCompleted}`
                    : `🏆 ${entry.score}`;
            text(scoreText, rowX + rowW - 20, ry);
        }

        if (this.highScoreManager.isLoadingMore) {
            const loadingRowTop = startY + this.highScoreManager.topScores.length * rowH - this.highScoreScrollY;
            const loadingRy = loadingRowTop + rowH / 2;
            if (loadingRy >= startY - rowH / 2 && loadingRy <= startY + listAreaH + rowH / 2) {
                fill(25, 70, 120, 200);
                rect(rowX, loadingRowTop + 4, rowW, rowH - 8, 12);
                fill(200, 230, 255);
                textAlign(CENTER, CENTER);
                textSize(14);
                const dots = '.'.repeat((Math.floor(frameCount / 20) % 3) + 1);
                text(`Loading${dots}`, rowX + rowW / 2, loadingRy);
                textAlign(LEFT, CENTER);
            }
        }

        listUnclip();
        pop();

        if (totalH > listAreaH) {
            fill(15, 45, 85, 220);
            rect(scrollbarX, scrollbarY, scrollbarW, scrollbarH, 7);

            const thumbRatio = listAreaH / totalH;
            const thumbH = max(30, scrollbarH * thumbRatio);
            const thumbRange = scrollbarH - thumbH;
            const thumbY =
                scrollbarY +
                (maxScroll > 0
                    ? (this.highScoreScrollY / maxScroll) * thumbRange
                    : 0);

            fill(70, 140, 200, 240);
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
        fill(200, 235, 255);
        textSize(14);
        let hint = 'Click row to view catch · Click outside to return';
        if (
            typeof isProdOrigin === 'function' &&
            isProdOrigin() &&
            this.highScoreManager.hasMoreScores
        ) {
            hint += ' · Scroll down to load more';
        }
        text(hint, width / 2, height - 40);
        pop();

        if (this.fishGalleryEntry) {
            this.drawFishGallery(this.fishGalleryEntry);
        }
    }

    drawFishGallery(entry) {
        push();
        noStroke();
        fill(0, 0, 0, 180);
        rect(0, 0, width, height);

        const cols = 8;
        const cellW = 72;
        const cellH = 68;
        const panelW = cols * cellW + 48;
        const rows = Math.ceil(GameManager.FISH_GALLERY_TYPES.length / cols);
        const panelH = rows * cellH + 80;
        const panelX = (width - panelW) / 2;
        const panelY = (height - panelH) / 2 - 20;

        fill(15, 45, 85, 200);
        rect(panelX, panelY, panelW, panelH, 16);
        stroke(60, 140, 200, 220);
        strokeWeight(2);
        noFill();
        rect(panelX, panelY, panelW, panelH, 16);
        noStroke();

        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        textStyle(BOLD);
        text(`${entry.playerName}'s Fish Gallery`, width / 2, panelY + 28);
        textStyle(NORMAL);

        const raw = entry.catchHistory || {};
        const catchHistory = { ...raw };
        if (raw['Treasure Chest'] != null && catchHistory['Treasure'] == null) {
            catchHistory['Treasure'] = raw['Treasure Chest'];
        }
        const types = GameManager.FISH_GALLERY_TYPES;
        const startX = panelX + 24 + cellW / 2;
        const startY = panelY + 52 + cellH / 2;

        let hoveredIndex = -1;
        const cellPad = 4;
        const cellRectW = cellW - 8;
        const cellRectH = cellH - 8;

        for (let i = 0; i < types.length; i++) {
            const t = types[i];
            const count = catchHistory[t.key] || 0;
            const caught = count > 0;
            const col = i % cols;
            const row = floor(i / cols);
            const cx = startX + col * cellW;
            const cy = startY + row * cellH;

            const cellLeft = cx - cellW / 2 + cellPad;
            const cellTop = cy - cellH / 2 + cellPad;
            if (
                mouseX >= cellLeft &&
                mouseX <= cellLeft + cellRectW &&
                mouseY >= cellTop &&
                mouseY <= cellTop + cellRectH
            ) {
                hoveredIndex = i;
            }

            if (caught) fill(25, 90, 70);
            else fill(40, 40, 55);
            rect(cellLeft, cellTop, cellRectW, cellRectH, 8);

            const img = t.getImg();
            if (img && img.width) {
                push();
                if (!caught) tint(80, 80, 90);
                imageMode(CENTER);
                const imgSize = Math.min(44, img.width, img.height);
                image(img, cx, cy - 6, imgSize, imgSize);
                if (!caught) noTint();
                pop();
            } else {
                fill(caught ? 120 : 60);
                textSize(10);
                text(t.key, cx, cy - 6);
            }

            textSize(10);
            textAlign(CENTER, CENTER);
            if (caught) {
                fill(255, 215, 0);
                text(`×${count}`, cx, cy + 22);
            } else {
                fill(120, 120, 130);
                text('?', cx, cy + 22);
            }
        }

        // Hover tooltip: show English + Chinese names in small font
        if (hoveredIndex >= 0) {
            const t = types[hoveredIndex];
            const names = GameManager.FISH_NAMES[t.key];
            if (names) {
                const col = hoveredIndex % cols;
                const row = floor(hoveredIndex / cols);
                const cx = startX + col * cellW;
                const cy = startY + row * cellH;

                textSize(10);
                const tipW = max(textWidth(names.en), textWidth(names.zh)) + 16;
                const tipH = 36;
                let tipX = cx - tipW / 2;
                let tipY = cy - cellH / 2 - tipH - 8;

                if (tipX < panelX + 8) tipX = panelX + 8;
                if (tipX + tipW > panelX + panelW - 8) tipX = panelX + panelW - tipW - 8;
                if (tipY < panelY + 8) tipY = cy + cellH / 2 + 8;

                fill(10, 35, 65, 235);
                stroke(80, 160, 220);
                strokeWeight(1);
                rect(tipX, tipY, tipW, tipH, 6);
                noStroke();

                fill(255);
                textSize(10);
                textAlign(CENTER, CENTER);
                text(names.en, tipX + tipW / 2, tipY + 10);
                fill(200, 230, 255);
                textSize(9);
                text(names.zh, tipX + tipW / 2, tipY + 26);
            }
        }

        fill(200, 235, 255);
        textSize(12);
        text('Click anywhere to close', width / 2, height - 40);

        this._fishGalleryBounds = { x: panelX, y: panelY, w: panelW, h: panelH };
        pop();
    }

    drawScoreAvatar(cx, cy, name) {
        push();
        noStroke();
        fill(255, 230, 180);
        ellipse(cx, cy, 22, 22);
        fill(25, 70, 120);
        textAlign(CENTER, CENTER);
        textSize(11);
        text((name.charAt(0) || '?').toUpperCase(), cx, cy + 1);
        pop();
    }

    drawModeIcon(cx, cy, difficulty, playerMode) {
        push();
        noStroke();
        const isEasy = (difficulty || "easy").toString().toLowerCase() === "easy";
        const isTwo = (playerMode || "single").toString().toLowerCase().includes("two");
        fill(isEasy ? 60 : 220, isEasy ? 200 : 60, isEasy ? 80 : 60);
        const r = 5;
        ellipse(cx - (isTwo ? 5 : 0), cy, r * 2, r * 2);
        if (isTwo) ellipse(cx + 5, cy, r * 2, r * 2);
        pop();
    }

    // Interaction Handling
    handleMousePress() {
        switch (this.currentState) {
            case GameState.NAME_ENTRY:
                if (
                    this._trophyButtonBounds &&
                    this.isPointInRect(
                        mouseX,
                        mouseY,
                        this._trophyButtonBounds.cx,
                        this._trophyButtonBounds.cy,
                        this._trophyButtonBounds.w,
                        this._trophyButtonBounds.h,
                    )
                ) {
                    this.changeState(GameState.HIGH_SCORE);
                }
                break;
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
            case GameState.HOW_TO_PLAY:
                // 点击任意位置开始游戏
                this.startLevel();
                break;
            case GameState.PLAYING: {
                if (this.gamePaused) {
                    const bc = this._pauseMenuBtnClose;
                    const b1 = this._pauseMenuBtn1;
                    const b2 = this._pauseMenuBtn2;
                    if (bc && mouseX >= bc.x && mouseX <= bc.x + bc.w && mouseY >= bc.y && mouseY <= bc.y + bc.h) {
                        this.gamePaused = false;
                        break;
                    }
                    if (b1 && mouseX >= b1.x && mouseX <= b1.x + b1.w && mouseY >= b1.y && mouseY <= b1.y + b1.h) {
                        this.gamePaused = false;
                        this._mergeFishCaught();
                        this.lastGameFailed = true;
                        const levelsCompleted = Math.max(0, this.levelNum - 1);
                        this.highScoreManager.checkNewHighScore(
                            this.player.totalScore,
                            this.player.name || 'Anon',
                            levelsCompleted,
                            this.currentDifficulty,
                            this.currentPlayerMode,
                            this.gameSessionFishCaught || {},
                        );
                        this.changeState(GameState.LEVEL_RESULT);
                        break;
                    }
                    if (b2 && mouseX >= b2.x && mouseX <= b2.x + b2.w && mouseY >= b2.y && mouseY <= b2.y + b2.h) {
                        this.gamePaused = false;
                        this.changeState(GameState.NAME_ENTRY);
                        break;
                    }
                } else {
                    const pb = this.levelManager._pauseBtnBounds;
                    if (
                        pb &&
                        this.isPointInRect(mouseX, mouseY, pb.cx, pb.cy, pb.w, pb.h)
                    ) {
                        this.gamePaused = !this.gamePaused;
                    }
                }
                break;
            }
            case GameState.SHOP: {
                let shopResult = this.shopManager.handleMousePress(this.player, this.currentPlayerMode);
                if (shopResult === 'NEXT_LEVEL') {
                    this.levelNum++;
                    this.startLevel();
                    this.player.consumeItems(this.levelManager);
                    this.shopManager.resetShop(this.levelNum);
                }
                break;
            }
            case GameState.LEVEL_RESULT:
                this.changeState(GameState.HIGH_SCORE);
                break;
            case GameState.HIGH_SCORE: {
                if (this.fishGalleryEntry) {
                    this.fishGalleryEntry = null;
                    break;
                }
                const panelW = min(580, width * 0.45);
                const panelX = (width - panelW) / 2;
                const panelH = min(500, height * 0.7);
                const panelY = (height - panelH) / 2 - 20;
                const inPanel =
                    mouseX >= panelX &&
                    mouseX <= panelX + panelW &&
                    mouseY >= panelY &&
                    mouseY <= panelY + panelH;
                if (!inPanel) {
                    this.lastGameFailed = false;
                    this.changeState(GameState.NAME_ENTRY);
                } else if (this._leaderboardRowBounds) {
                    for (const rb of this._leaderboardRowBounds) {
                        if (
                            mouseX >= rb.x &&
                            mouseX <= rb.x + rb.w &&
                            mouseY >= rb.y &&
                            mouseY <= rb.y + rb.h
                        ) {
                            this.fishGalleryEntry = rb.entry;
                            break;
                        }
                    }
                }
                if (this.fishGalleryEntry) break;
                if (this._scrollbarBounds) {
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
        const panelW = min(580, width * 0.45);
        const panelX = (width - panelW) / 2;
        if (mouseX >= panelX && mouseX <= panelX + panelW) {
            this.highScoreScrollY += event.delta;
            const panelH = min(500, height * 0.7);
            const listAreaH = panelH - 70 - 20;
            const rowH = 58;
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
        if (this.currentState === GameState.DIFFICULTY_SELECT) {
            if (keyCode === UP_ARROW) {
                this.menuSelectionIndex = 0;
                return;
            }
            if (keyCode === DOWN_ARROW) {
                this.menuSelectionIndex = 1;
                return;
            }
            if (keyCode === ENTER) {
                userStartAudio();
                if (this.menuSelectionIndex === 0) {
                    this.currentDifficulty = Difficulty.EASY;
                } else {
                    this.currentDifficulty = Difficulty.HARD;
                }
                this.changeState(GameState.PLAYER_MODE_SELECT);
                return;
            }
        }
        if (this.currentState === GameState.PLAYER_MODE_SELECT) {
            if (keyCode === UP_ARROW) {
                this.menuSelectionIndex = 0;
                return;
            }
            if (keyCode === DOWN_ARROW) {
                this.menuSelectionIndex = 1;
                return;
            }
            if (keyCode === ENTER) {
                userStartAudio();
                if (this.menuSelectionIndex === 0) {
                    this.currentPlayerMode = PlayerMode.SINGLE;
                    this.startGame();
                } else {
                    this.currentPlayerMode = PlayerMode.TWO_PLAYER;
                    this.startGame();
                }
                return;
            }
        }

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
                    if (this.nameExistsCheck !== false) return;
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
