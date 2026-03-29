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

        // 设置（从 localStorage 恢复）
        this.settingsOpen = false;
        const savedVol = parseFloat(localStorage.getItem('ds_volume'));
        const savedSfx = parseFloat(localStorage.getItem('ds_sfx_volume'));
        const savedBright = parseFloat(localStorage.getItem('ds_brightness'));
        this.volumeLevel = isNaN(savedVol) ? 0.8 : constrain(savedVol, 0, 1);
        this.sfxVolumeLevel = isNaN(savedSfx) ? 0.8 : constrain(savedSfx, 0, 1);
        this.brightnessLevel = isNaN(savedBright) ? 1 : constrain(savedBright, 0, 1);
        this._settingsVolumeDragging = false;
        this._settingsSfxVolumeDragging = false;
        this._settingsBrightnessDragging = false;
        this.scaledMouseX = 0;
        this.scaledMouseY = 0;
        this.nameInputFocused = false;

        /** 每关进入 PLAYING 时的 totalScore（index = levelNum - 1） */
        this.perLevelScoreAtStart = [];
        /** 每关增收：离开 PLAYING 时 totalScore − 关初（含失败前已打的钱） */
        this.perLevelEarned = [];
        /** 每关开局生成时 activeItems 的 scoreValue 总和（与上一字段同下标） */
        this.perLevelSpawnValue = [];
    }

    _applyVolume() {
        const v = this.volumeLevel;
        if (typeof titleBgm !== 'undefined' && titleBgm) titleBgm.setVolume(v);
        if (typeof shopBgm !== 'undefined' && shopBgm) shopBgm.setVolume(v);
        if (typeof gameplayBgm !== 'undefined' && gameplayBgm) gameplayBgm.setVolume(v);
        try { localStorage.setItem('ds_volume', String(v)); } catch (_) {}
    }

    _applySfxVolume() {
        const v = this.sfxVolumeLevel;
        if (typeof koiInSfx !== 'undefined' && koiInSfx) koiInSfx.setVolume(v);
        if (typeof koiOutSfx !== 'undefined' && koiOutSfx) koiOutSfx.setVolume(v);
        if (typeof buySfx !== 'undefined' && buySfx) buySfx.setVolume(v);
        if (typeof catchSfx !== 'undefined' && catchSfx) catchSfx.setVolume(v);
        if (typeof ballCatchSfx !== 'undefined' && ballCatchSfx) ballCatchSfx.setVolume(v);
        if (typeof sharkStolenSfx !== 'undefined' && sharkStolenSfx)
            sharkStolenSfx.setVolume(v);
        try { localStorage.setItem('ds_sfx_volume', String(v)); } catch (_) {}
    }

    _saveBrightness() {
        try { localStorage.setItem('ds_brightness', String(this.brightnessLevel)); } catch (_) {}
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
        list.push({
            key: 'KoiFish',
            label: 'Koi Fish',
            getImg: () => (typeof koiFishImgs !== 'undefined' && koiFishImgs.length > 0 && koiFishImgs[0]) ? koiFishImgs[0] : null,
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
            'KoiFish': { en: 'Koi Fish', zh: '锦鲤' },
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
        this.player.hasClubCard = false;  // 避免沿用上一局的会员卡
        this.gameSessionFishCaught = {};
        this.levelNum = 1;
        this.perLevelScoreAtStart = [];
        this.perLevelEarned = [];
        this.perLevelSpawnValue = [];
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
        this._recordLevelSpawnTotal();
        this._snapshotLevelStartScore();
        this.changeState(GameState.PLAYING);
    }

    _recordLevelSpawnTotal() {
        const i = this.levelNum - 1;
        while (this.perLevelSpawnValue.length <= i) {
            this.perLevelSpawnValue.push(undefined);
        }
        const total =
            this.levelManager &&
            typeof this.levelManager.initialSpawnValueTotal === "number"
                ? this.levelManager.initialSpawnValueTotal
                : 0;
        this.perLevelSpawnValue[i] = total;
    }

    _snapshotLevelStartScore() {
        const i = this.levelNum - 1;
        while (this.perLevelScoreAtStart.length <= i) {
            this.perLevelScoreAtStart.push(undefined);
            this.perLevelEarned.push(undefined);
        }
        this.perLevelScoreAtStart[i] = this.player.totalScore;
    }

    _finalizeCurrentLevelEarnings() {
        const i = this.levelNum - 1;
        if (i < 0 || this.perLevelScoreAtStart[i] === undefined) return;
        this.perLevelEarned[i] =
            this.player.totalScore - this.perLevelScoreAtStart[i];
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
            this.inputText = '';
            this.nameExistsCheck = null;
            this.lastCheckedName = '';
            this.nameInputFocused = false;
        }
        if (
            newState === GameState.DIFFICULTY_SELECT ||
            newState === GameState.PLAYER_MODE_SELECT
        ) {
            this.menuSelectionIndex = 0;
        }

        // ==========================================
        // 🎵 统一音乐大管家 (彻底解决音乐打架)
        // ==========================================
        this._applyVolume(); // 统一在这里刷新一次音量，下面就不写了

        // 1. 首页背景音乐
        const menuStates = [
            GameState.NAME_ENTRY,
            GameState.DIFFICULTY_SELECT,
            GameState.PLAYER_MODE_SELECT,
        ];
        if (menuStates.includes(this.currentState)) {
            if (typeof titleBgm !== 'undefined' && titleBgm && !titleBgm.isPlaying()) titleBgm.loop();
        } else {
            // 只要不是首页这三个状态，立刻闭嘴！(下面都是纯 else)
            if (typeof titleBgm !== 'undefined' && titleBgm && titleBgm.isPlaying()) titleBgm.stop();
        }

        // 2. 游戏中背景音乐
        if (this.currentState === GameState.PLAYING) {
            if (typeof gameplayBgm !== 'undefined' && gameplayBgm && !gameplayBgm.isPlaying()) gameplayBgm.loop();
        } else {
            if (typeof gameplayBgm !== 'undefined' && gameplayBgm && gameplayBgm.isPlaying()) gameplayBgm.stop();
        }

        // 3. 商店音乐
        if (this.currentState === GameState.SHOP) {
            if (typeof shopBgm !== 'undefined' && shopBgm && !shopBgm.isPlaying()) shopBgm.loop();
        } else {
            if (typeof shopBgm !== 'undefined' && shopBgm && shopBgm.isPlaying()) shopBgm.stop();
        }

        // 4. 通关结算页面音乐
        if (this.currentState === GameState.LEVEL_PASS_CELEBRATION) {
            if (typeof victoryBgm !== 'undefined' && victoryBgm && !victoryBgm.isPlaying()) {
                // 🌟 这里修改了：把 play() 改成了 loop()，这样音乐就会一直循环播放，直到玩家点击屏幕进入商店！
                victoryBgm.loop(); 
            }
        } else {
            if (typeof victoryBgm !== 'undefined' && victoryBgm && victoryBgm.isPlaying()) {
                victoryBgm.stop();
            }
        }

        // 5. 目标分数展示页音乐
        if (this.currentState === GameState.NEXT_LEVEL_TARGET) {
            if (typeof targetBgm !== 'undefined' && targetBgm && !targetBgm.isPlaying()) targetBgm.loop(); 
        } else {
            if (typeof targetBgm !== 'undefined' && targetBgm && targetBgm.isPlaying()) targetBgm.stop();
        }

        // iPad Magic Keyboard: focus canvas when entering keyboard-driven states
        const keyboardStates = [
            GameState.NAME_ENTRY,
            GameState.DIFFICULTY_SELECT,
            GameState.PLAYER_MODE_SELECT,
            GameState.PLAYING,
        ];
        if (keyboardStates.includes(newState)) {
            const c = document.querySelector('#game-container canvas');
            if (c) c.focus();
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
    // 🌟 新增：只画左下角的返回箭头
    // 🌟 修改：放大返回图片，扩大点击范围
    _drawMenuBackButton() {
        push();
        imageMode(CORNER);
        rectMode(CORNER);

        // 🌟 把尺寸调大！你可以随意修改这两个数字，直到看起来舒服为止
        const btnW = 170;
        const btnH = 60;// 图片高度
        const btnX = 20; // 距离左边框的距离
        const btnY = height - 20 - btnH; // 距离下边框的距离

        if (typeof backImg !== 'undefined' && backImg) {
            image(backImg, btnX, btnY, btnW, btnH);
        } else {   
        }

        // 把新的大尺寸记录下来，点击判定范围也会跟着变大！
        this._menuBackBtnBounds = { x: btnX, y: btnY, w: btnW, h: btnH };
        pop();
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
                        this._finalizeCurrentLevelEarnings();
                        this._mergeFishCaught();
                        this.shopManager.resetShop(this.levelNum, this.player);
                        this.changeState(GameState.LEVEL_PASS_CELEBRATION);
                    } else if (result === 'FAIL') {
                        this._finalizeCurrentLevelEarnings();
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
                            this.perLevelEarned,
                            this.perLevelSpawnValue,
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
            case GameState.LEVEL_PASS_CELEBRATION:
                this.drawLevelPassCelebration();
                break;
            case GameState.LEVEL_RESULT:
                this.drawLevelResult();
                break;
            case GameState.HIGH_SCORE:
                this.drawHighScore();
                break;
            case GameState.NEXT_LEVEL_TARGET:
                this.drawNextLevelTarget();
                break;
        }

        // 设置按钮（难度选择、模式选择不显示）
        const settingsStates = [
            GameState.NAME_ENTRY,
            GameState.HOW_TO_PLAY,
            GameState.PLAYING,
            GameState.SHOP,
            GameState.LEVEL_PASS_CELEBRATION,
            GameState.LEVEL_RESULT,
            GameState.HIGH_SCORE,
        ];
        if (settingsStates.includes(this.currentState)) {
            this.drawSettingsButton();
        }

        // 设置面板（覆盖在最上层）
        if (this.settingsOpen) {
            this.drawSettingsPanel();
        }

        // 亮度遮罩（根据 brightnessLevel 调节）
        if (this.brightnessLevel < 1) {
            push();
            noStroke();
            fill(0, 0, 0, (1 - this.brightnessLevel) * 200);
            rect(0, 0, width, height);
            pop();
        }
    }

    drawSettingsButton() {
        const settingsSize = 48;
        const settingsX = 16;
        const settingsY = height - 36 - settingsSize / 2;
        push();
        noSmooth();
        noStroke();
        fill(255, 230, 180);
        textSize(32);
        textAlign(CENTER, CENTER);
        text('⚙', settingsX + settingsSize / 2, height - 36);
        pop();
        this._settingsButtonBounds = { x: settingsX, y: settingsY, w: settingsSize, h: settingsSize };

        const hovered =
            this._settingsButtonBounds &&
            mouseX >= this._settingsButtonBounds.x &&
            mouseX <= this._settingsButtonBounds.x + this._settingsButtonBounds.w &&
            mouseY >= this._settingsButtonBounds.y &&
            mouseY <= this._settingsButtonBounds.y + this._settingsButtonBounds.h;
        if (hovered) {
            push();
            textSize(10);
            const tip = 'Settings';
            const tipW = textWidth(tip) + 12;
            const tipH = 20;
            const tipX = settingsX + settingsSize / 2;
            const tipY = height - 36 - 28;
            fill(10, 35, 65, 235);
            stroke(80, 160, 220);
            strokeWeight(1);
            rect(tipX - tipW / 2, tipY - tipH - 4, tipW, tipH, 4);
            noStroke();
            fill(200, 235, 255);
            textAlign(CENTER, CENTER);
            text(tip, tipX, tipY - tipH / 2 - 4);
            pop();
        }
    }

    drawSettingsPanel() {
        push();
        noSmooth();
        rectMode(CORNER);

        // 半透明背景遮罩
        fill(0, 0, 0, 150);
        rect(0, 0, width, height);

        const panelW = 380;
        const panelH = 325;
        const panelX = (width - panelW) / 2;
        const panelY = (height - panelH) / 2;

        // 像素风面板：外阴影 + 主体 + 粗边框
        fill(0, 0, 0, 180);
        rect(panelX + 6, panelY + 6, panelW, panelH, 8);
        fill(15, 45, 85, 250);
        rect(panelX, panelY, panelW, panelH, 8);
        stroke(0, 0, 0);
        strokeWeight(4);
        noFill();
        rect(panelX, panelY, panelW, panelH, 8);
        stroke(80, 160, 220);
        strokeWeight(2);
        rect(panelX + 4, panelY + 4, panelW - 8, panelH - 8, 6);
        noStroke();

        if (typeof pixelFont !== 'undefined' && pixelFont) textFont(pixelFont);
        fill(255, 220, 100);
        textSize(16);
        textAlign(CENTER, TOP);
        text('SETTINGS', panelX + panelW / 2, panelY + 18);

        const barW = 260;
        const barH = 20;
        const barX = panelX + (panelW - barW) / 2;
        const barY1 = panelY + 68;
        const barY2 = barY1 + 65;
        const barY3 = barY2 + 65;

        // 背景音乐
        fill(200, 230, 255);
        textSize(10);
        textAlign(LEFT, CENTER);
        text('MUSIC', panelX + 40, barY1 - 25);
        fill(30, 60, 90);
        rect(barX, barY1, barW, barH, 4);
        fill(80, 160, 220);
        rect(barX, barY1, barW * this.volumeLevel, barH, 4);
        stroke(0, 0, 0);
        strokeWeight(2);
        noFill();
        rect(barX, barY1, barW, barH, 4);
        noStroke();
        fill(255, 230, 180);
        const thumb1X = barX + barW * this.volumeLevel - 8;
        rect(thumb1X, barY1 - 4, 16, barH + 8, 4);
        this._settingsVolumeBar = { x: barX, y: barY1, w: barW, h: barH };

        // 音效（非 BGM）
        fill(200, 230, 255);
        text('SFX', panelX + 40, barY2 - 25);
        fill(30, 60, 90);
        rect(barX, barY2, barW, barH, 4);
        fill(120, 200, 160);
        rect(barX, barY2, barW * this.sfxVolumeLevel, barH, 4);
        stroke(0, 0, 0);
        strokeWeight(2);
        noFill();
        rect(barX, barY2, barW, barH, 4);
        noStroke();
        fill(255, 230, 180);
        const thumbSfxX = barX + barW * this.sfxVolumeLevel - 8;
        rect(thumbSfxX, barY2 - 4, 16, barH + 8, 4);
        this._settingsSfxVolumeBar = { x: barX, y: barY2, w: barW, h: barH };

        // 亮度条
        fill(200, 230, 255);
        text('BRIGHTNESS', panelX + 40, barY3 - 25);
        fill(30, 60, 90);
        rect(barX, barY3, barW, barH, 4);
        fill(255, 220, 100);
        rect(barX, barY3, barW * this.brightnessLevel, barH, 4);
        stroke(0, 0, 0);
        strokeWeight(2);
        noFill();
        rect(barX, barY3, barW, barH, 4);
        noStroke();
        fill(255, 230, 180);
        const thumb2X = barX + barW * this.brightnessLevel - 8;
        rect(thumb2X, barY3 - 4, 16, barH + 8, 4);
        this._settingsBrightnessBar = { x: barX, y: barY3, w: barW, h: barH };

        // 关闭按钮
        const closeBtnW = 100;
        const closeBtnH = 36;
        const closeBtnX = panelX + (panelW - closeBtnW) / 2;
        const closeBtnY = panelY + panelH - 55;
        fill(60, 120, 80);
        rect(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 4);
        stroke(0, 0, 0);
        strokeWeight(2);
        noFill();
        rect(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 4);
        noStroke();
        fill(255);
        textSize(10);
        textAlign(CENTER, CENTER);
        text('CLOSE', closeBtnX + closeBtnW / 2, closeBtnY + closeBtnH / 2 + 1);
        this._settingsCloseBounds = { x: closeBtnX, y: closeBtnY, w: closeBtnW, h: closeBtnH };

        pop();
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
        const showCursor = frameCount % 60 < 30;
        if (this.inputText) {
            fill(240, 248, 255);
            text(this.inputText, width / 2, boxY);
            if (showCursor) {
                fill(0, 220, 255);
                const txtW = textWidth(this.inputText);
                const pipeW = textWidth('|');
                const cursorX = width / 2 + txtW / 2 + pipeW / 2 + 2;
                text('|', cursorX, boxY);
            }
        } else if (this.nameInputFocused) {
            if (showCursor) {
                fill(0, 220, 255);
                text('|', width / 2, boxY);
            }
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

        // 右下角小奖杯，点击进入高分榜（设置按钮由 drawSettingsButton 统一绘制）
        const trophySize = 28;
        const trophyX = width - 36;
        const trophyY = height - 36;
        textSize(trophySize);
        text('🏆', trophyX, trophyY);
        this._trophyButtonBounds = { cx: trophyX, cy: trophyY, w: 44, h: 44 };
        pop();

        // Hover 提示：奖杯（仅 NAME_ENTRY 有奖杯）
        const mx = this.scaledMouseX ?? 0, my = this.scaledMouseY ?? 0;
        const trophyHover =
            this._trophyButtonBounds &&
            this.isPointInRect(
                mx,
                my,
                this._trophyButtonBounds.cx,
                this._trophyButtonBounds.cy,
                this._trophyButtonBounds.w,
                this._trophyButtonBounds.h,
            );
        if (trophyHover) {
            push();
            textSize(10);
            const tip = 'Leaderboard';
            const tipW = textWidth(tip) + 12;
            const tipH = 20;
            const tipX = trophyX;
            const tipY = height - 36 - 28;
            fill(10, 35, 65, 235);
            stroke(80, 160, 220);
            strokeWeight(1);
            rect(tipX - tipW / 2, tipY - tipH - 4, tipW, tipH, 4);
            noStroke();
            fill(200, 235, 255);
            textAlign(CENTER, CENTER);
            text(tip, tipX, tipY - tipH / 2 - 4);
            pop();
        }
    }

    drawDifficultySelect() {
        if (typeof modeSelectBgImg !== 'undefined' && modeSelectBgImg) {
            this.drawCoverBackground(modeSelectBgImg);
        } else {
            this.drawOceanMenuBackground();
        }
        // 🌟 新增下面这一行
        this._drawMenuBackButton();
    }

    drawPlayerModeSelect() {
        if (typeof modeSelectBgImg !== 'undefined' && modeSelectBgImg) {
            this.drawCoverBackground(modeSelectBgImg);
        } else {
            this.drawOceanMenuBackground();
        }
        // 🌟 新增下面这一行
        this._drawMenuBackButton();
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
        text("Pearl / Moving Shell: 1000 pts", lx, cy);
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

    _getCelebrationRankInfo() {
        const levelsCompleted = this.levelNum;
        const score = this.player.totalScore;
        const name = this.player.name || 'Anon';
        const currentEntry = new ScoreEntry(
            name,
            score,
            levelsCompleted,
            this.currentDifficulty,
            this.currentPlayerMode,
            this.gameSessionFishCaught || {},
        );
        const combined = [...this.highScoreManager.topScores, currentEntry];
        combined.sort((a, b) => {
            if (b.levelsCompleted !== a.levelsCompleted) return b.levelsCompleted - a.levelsCompleted;
            return b.score - a.score;
        });
        const myIndex = combined.findIndex(
            (e) => e.playerName === name && e.score === score && e.levelsCompleted === levelsCompleted,
        );
        const rank = myIndex >= 0 ? myIndex + 1 : combined.length;
        const nextEntry = myIndex > 0 ? combined[myIndex - 1] : null;
        return { rank, currentEntry, nextEntry, nextRank: rank - 1 };
    }

    drawLevelPassCelebration() {
        push();
        if (typeof pixelFont !== 'undefined' && pixelFont) textFont(pixelFont);
        rectMode(CORNER);
        noSmooth();

        // 1. 画海底背景图
        if (typeof passcelebrationImg !== 'undefined' && passcelebrationImg) {
            imageMode(CORNER);
            image(passcelebrationImg, 0, 0, width, height);
        }

        // 2. 暗色遮罩
        fill(0, 0, 0, 80); 
        rect(0, 0, width, height);

        // ==========================================
        // 🌟 背景动画层：气泡与星光
        for (let i = 0; i < 20; i++) {
            let bx = ((i * 107 + frameCount * 0.5) % (width + 200)) - 100; 
            let by = height - ((i * 57 + frameCount * (1 + i % 2)) % (height + 50));
            let br = 4 + (i % 5) * 2;
            fill(255, 255, 255, 40 + sin(frameCount * 0.05 + i) * 40);
            ellipse(bx, by, br, br);

            if (i % 2 === 0) {
                let sx = i < 10 ? (i * 35 + frameCount) % 350 : width - ((i * 35 + frameCount) % 350); 
                let sy = (i * 77 + frameCount * 0.2) % height;
                let alpha = 150 + 100 * sin(frameCount * 0.1 + i);
                fill(255, 220, 100, alpha);
                textAlign(CENTER, CENTER);
                textSize(10 + (i % 3) * 4);
                text("✦", sx, sy);
            }
        }

        // ==========================================
        // 🦈 核心动画：【大白鲨极速追杀 + 气泡尾流】
        if (typeof koiFishImgs !== 'undefined' && koiFishImgs.length > 0) {
            
            // 逃窜的锦鲤
            let koiSpeed = 4.5; 
            let kx = ((frameCount * koiSpeed) % (width + 1000)) - 400; 
            let ky = height - 120; 
            let frameIdx = floor((frameCount / 4) % koiFishImgs.length); 
            
            push();
            translate(kx, ky);
            imageMode(CENTER);
            image(koiFishImgs[frameIdx], 0, 0, 100, 100); 
            pop();

            // 紧追的大白鲨与气泡
            push();
            let sharkX = kx - 260; 
            translate(sharkX, ky); 

            // 淡淡的黑色水流阴影压迫感
            fill(0, 0, 0, 50);
            noStroke();
            ellipse(-30, 0, 320, 120);

            // 尾翼剧烈搅动产生的湍流气泡
            let tailX = -130; 
            for (let i = 0; i < 20; i++) {
                let flowOffset = (frameCount * 5 + i * 15) % 300; 
                let bubbleX = tailX - flowOffset; 
                let spread = flowOffset * 0.15; 
                let bubbleY = sin(frameCount * 0.2 + i) * spread * 15; 
                let bAlpha = map(flowOffset, 0, 300, 200, 0); 
                let bSize = map(sin(frameCount * 0.1 + i * 3), -1, 1, 4, 16);
                
                fill(255, 255, 255, bAlpha);
                ellipse(bubbleX, bubbleY, bSize, bSize);

                let microY = cos(frameCount * 0.15 + i * 7) * spread * 20;
                fill(255, 255, 255, bAlpha * 0.6);
                ellipse(bubbleX - 10, microY, bSize * 0.4, bSize * 0.4);
            }
            pop();

            // 画出鲨鱼本体 (带摆动动画)
            push();
            translate(sharkX, ky); 
            imageMode(CENTER);
            
            if (typeof sharkImg !== 'undefined' && sharkImg) {
                let sharkFrameIdx = floor((frameCount / 10) % sharkImgs.length);
                let currentSharkImg = sharkImgs[sharkFrameIdx];

                if (typeof sharkJawsImg !== 'undefined' && sharkJawsImg && frameCount % 60 < 20) {
                    currentSharkImg = sharkJawsImg; 
                } else if (!currentSharkImg) {
                    currentSharkImg = sharkImg;
                }
                
                rotate(cos(frameCount * 0.1) * 0.05); 
                image(currentSharkImg, 0, 0, 300, 300); 
            }
            pop();
        }

        // ==========================================
        // 🌟 核心布局：面板 700x500
        const panelW = 700; 
        const panelH = 500; 
        const panelX = (width - panelW) / 2;
        const panelY = 40; 
        const itemCenterY = panelY + panelH / 2; 

        // ==========================================
        // 💎 财富点缀层
        imageMode(CENTER);
        
        // 【左边：内部金币刺眼闪光大宝箱】
        if (typeof treasureChest !== 'undefined' && typeof Treasure_Chest2 !== 'undefined') {
            let chestY = itemCenterY + sin(frameCount * 0.04) * 12; 
            
            push();
            translate(160, chestY); 
            noStroke();
            
            let isChestOpen = floor(frameCount / 25) % 2 === 0;
            let currentChestImg = Treasure_Chest2; 
            if (isChestOpen) {
                currentChestImg = treasureChest;
            }

            fill(255, 200, 0, 20 + sin(frameCount * 0.05) * 10);
            ellipse(0, 0, 180, 180);
            image(currentChestImg, 0, 0, 240, 240);

            if (isChestOpen) {
                push();
                translate(0, -15); 
                let glarePulse = abs(sin(frameCount * 0.15)); 
                fill(255, 255, 255, 180 + 75 * glarePulse);
                ellipse(0, 0, 50 + 20 * glarePulse, 50 + 20 * glarePulse);
                fill(255, 220, 0, 120 + 80 * glarePulse);
                ellipse(0, 0, 90 + 30 * glarePulse, 90 + 30 * glarePulse);
                fill(255, 255, 255, 200 + 55 * glarePulse);
                let flareW = 160 + 80 * glarePulse; 
                let flareH = 6; 
                ellipse(0, 0, flareW, flareH);
                ellipse(0, 0, flareH, flareW);
                rotate(PI / 4);
                ellipse(0, 0, flareW * 0.5, flareH * 0.8);
                ellipse(0, 0, flareH * 0.8, flareW * 0.5);
                pop();

                for (let j = 0; j < 4; j++) {
                    let px = sin(frameCount * 0.1 + j * 2) * 55;
                    let py = cos(frameCount * 0.13 + j * 3) * 35 - 15;
                    let pSize = 3 + sin(frameCount * 0.2 + j) * 2;
                    fill(255, 255, 255, 220); 
                    quad(px, py - pSize*2, px + pSize, py, px, py + pSize*2, px - pSize, py);
                }
            }
            pop();
        }

        // ==========================================
        // 💎 财富点缀层
        imageMode(CENTER);
        
        // 【左边：内部金币刺眼闪光大宝箱】
        // ... (这部分代码保持不变，不需要修改) ...

        // 【右边：开合大珍珠】
        if (typeof pearlShellImgs !== 'undefined' && pearlShellImgs.length > 0) {
            let shellY = itemCenterY + cos(frameCount * 0.04) * 12; 
            let frameIdx = floor((frameCount / 12) % pearlShellImgs.length);
            push();
            translate(width - 160, shellY); 
            noStroke();
            let pearlPulse = cos(frameCount * 0.05);
            
            // 🌟 1. 按比例缩小背后的冰蓝光晕，显得更协调
            // 这里修改了，基础半径和脉冲幅度都缩小了，以适应变小的贝壳
            let maxPR = 120 + pearlPulse * 15; // 👈 这里修改了，从 160+p*20 改为 120+p*15
            for (let r = maxPR; r > 0; r -= 10) { // 👈 减少步长以适应更小的半径，把 -= 15 改为 -= 10，让光晕更细腻
                let alpha = map(r, 0, maxPR, 40, 0);
                let rCol = map(r, 0, maxPR, 180, 0);
                let gCol = map(r, 0, maxPR, 255, 200);
                let bCol = map(r, 0, maxPR, 255, 255);
                fill(rCol, gCol, bCol, alpha);
                ellipse(0, 0, r * 2, r * 2);
            }
            
            push();
            scale(-1, 1); 
            // 🌟 2. 贝壳尺寸从 240 缩小到 180
            // 这里修改了，让贝壳图像显示得更小
            image(pearlShellImgs[frameIdx], 0, 0, 180, 180); // 👈 这里修改了，从 240x240 改为 180x180
            pop();
            
            if (typeof pearlImg !== 'undefined' && pearlImg && frameIdx > 0) {
                // 这里修改了，按比例缩小珍珠的垂直偏移和脉冲幅度
                let pearlOffsetY = -11 + sin(frameCount * 0.15) * 6; // 👈 这里修改了，从 -15+s*8 改为 -11+s*6
                let pearlAlpha = map(frameIdx, 1, pearlShellImgs.length - 1, 100, 255);
                push();
                tint(255, pearlAlpha); 
                // 🌟 3. 里面的珍珠也按比例从 85 缩小到 64
                // 这里修改了，让珍珠图像显示得更小
                image(pearlImg, 0, pearlOffsetY, 64, 64); // 👈 这里修改了，从 85x85 改为 64x64
                pop();
            }
            pop();
        }
        imageMode(CORNER);

        // ==========================================
        // 🌟 面板底框质感绘制
        noStroke();
        fill(0, 0, 0, 150);
        rect(panelX + 10, panelY + 10, panelW, panelH, 12);
        fill(8, 35, 65, 245); 
        rect(panelX, panelY, panelW, panelH, 12);
        stroke(30, 90, 140);
        strokeWeight(2);
        noFill();
        rect(panelX + 6, panelY + 6, panelW - 12, panelH - 12, 10);
        stroke(0, 230, 255); 
        strokeWeight(4);
        rect(panelX, panelY, panelW, panelH, 12);
        noStroke();

        // ==========================================
        // 🌟 文字立体像素化（干掉黑框蓝框，全立体阴影）
        textAlign(CENTER, CENTER);

        // 1. 第一行标题 (22px 不越界)
        const pulseTitle = 0.03 * sin(frameCount * 0.08);
        const scaleFactorTitle = 1 + pulseTitle;
        push();
        translate(width / 2, panelY + 70); 
        scale(scaleFactorTitle);
        noStroke(); 
        textSize(22); 
        fill(0); 
        text('CONGRATS! YOU ADVANCED!', -2, 0);
        text('CONGRATS! YOU ADVANCED!', 2, 0);
        text('CONGRATS! YOU ADVANCED!', 0, -2);
        text('CONGRATS! YOU ADVANCED!', 0, 2);
        fill(255, 230, 80);
        text('CONGRATS! YOU ADVANCED!', 0, 0);
        pop();
        
        // ==========================================
        // 🌟 文字排版：完美右下角3D立体像素阴影
        // ... (保留前面的 1. 标题 部分) ...
        
        const rankInfo = this._getCelebrationRankInfo();
        let cy = panelY + 150; 

        // ==========================================
        // 【当前玩家信息模块】
        // 1. 醒目的当前排位
        textSize(36); 
        fill(20, 60, 20, 200);
        text(`🏆 Rank: #${rankInfo.rank}`, width / 2 + 3, cy + 3);
        fill(255, 215, 0); 
        text(`🏆 Rank: #${rankInfo.rank}`, width / 2, cy);
        
        cy += 50; // 🌟 大间距：把排位和具体数据区隔开

        // 2. 玩家名字 (和下方的数据紧密组合)
        textSize(24); 
        let myNameLine = `⭐ ${this.player.name || 'Anon'}`;
        fill(20, 60, 20, 200);
        text(myNameLine, width / 2 + 2, cy + 2);
        fill(200, 255, 200); 
        text(myNameLine, width / 2, cy);
        
        cy += 40; // 🌟 小间距：让名字和分数紧紧抱团，变成一个整体！

        // 3. 玩家分数与关卡
        textSize(16); 
        let myDataLine = `Score: ${this.player.totalScore}   |   Lv.${this.levelNum}`;
        fill(20, 60, 20, 200);
        text(myDataLine, width / 2 + 2, cy + 2);
        fill(170, 230, 170); 
        text(myDataLine, width / 2, cy);
        
        cy += 40; // 🌟 大间距：数据块结束，准备画分割线

        // ==========================================
        // 【目标玩家信息模块】
        if (rankInfo.nextEntry) {
            // 分割线
            stroke(0, 150, 220, 180);
            strokeWeight(2);
            line(panelX + 70, cy, panelX + panelW - 70, cy);
            noStroke();
            
            cy += 40; // 分割线到下一区域的距离
            
            // 4. "Next up" 提示
            textSize(14); 
            fill(40, 20, 20, 200);
            text('- Next up -', width / 2 + 2, cy + 2);
            fill(255, 180, 50); 
            text('- Next up -', width / 2, cy);
            
            cy += 50; // 小间距
            
            // 5. 目标玩家排名与名字 (统一格式，看起来更专业)
            textSize(20); 
            let line1 = `⚔️ Rank: #${rankInfo.nextRank}  -  ${rankInfo.nextEntry.playerName}`;
            fill(40, 20, 20, 200);
            text(line1, width / 2 + 2, cy + 2);
            fill(255, 120, 150); 
            text(line1, width / 2, cy);
            
            cy += 40; // 🌟 小间距：和当前玩家一样，名字和分数紧密抱团！
            
            // 6. 目标玩家分数与关卡
            textSize(16); 
            let line2 = `Score: ${rankInfo.nextEntry.score}   |   Lv.${rankInfo.nextEntry.levelsCompleted ?? 0}`;
            fill(40, 20, 20, 200);
            text(line2, width / 2 + 2, cy + 2);
            fill(255, 160, 180); 
            text(line2, width / 2, cy);
        }

        // 5. 点击提示
        cy = panelY + panelH - 45; 
        textSize(11); 
        fill(0);
        text('Click anywhere to continue', width / 2 - 2, cy);
        text('Click anywhere to continue', width / 2 + 2, cy);
        text('Click anywhere to continue', width / 2, cy - 2);
        text('Click anywhere to continue', width / 2, cy + 2);
        fill(180, 255, 180, (sin(frameCount * 0.04) * 127 + 128)); 
        text('Click anywhere to continue', width / 2, cy);
        pop();
    }
    // 🌟 绝对居中终极版：向左回滚，整体上移，微缩间距
    drawNextLevelTarget() {
        push();
        if (typeof pixelFont !== 'undefined' && pixelFont) textFont(pixelFont);
        rectMode(CENTER);
        noSmooth();

        // 1. 画背景图
        if (typeof nextLevelBgImg !== 'undefined' && nextLevelBgImg) {
            imageMode(CORNER);
            image(nextLevelBgImg, 0, 0, width, height);
        }

        // ==========================================
        // 🕹️ 核心微调区 (保留你完美的调参数值)
        // ==========================================
        let offsetX = 32; 
        let offsetY = -165; 

        textAlign(CENTER, CENTER);
        const cx = width / 2 + offsetX;
        let textCy = height / 2 + offsetY; 

        // ==========================================

        // -- 1. 关卡标题 (取消缩放，固定不动) --
        noStroke(); 
        textSize(26); 
        fill(20, 60, 20, 200); 
        text('LEVEL ' + this.levelNum, cx + 2, textCy + 2); // 阴影
        fill(255, 230, 80);    
        text('LEVEL ' + this.levelNum, cx, textCy);         // 主字
        
        // 🚨 收紧间距
        textCy += 50; 

        // -- 2. 目标分数提示 --
        textSize(14); 
        fill(40, 20, 20, 200);
        text("TARGET SCORE:", cx + 2, textCy + 2);
        fill(255, 120, 0); 
        text("TARGET SCORE:", cx, textCy);
        
        // 🚨 收紧间距
        textCy += 50; 

        // -- 3. 超大目标分数数据 (✨转移到这里：呼吸缩放闪烁) --
        let n = this.levelNum;
        const goldFishEff = 26.67; 
        let totalTarget = 0;
        for (let i = 1; i <= n; i++) {
            let stdTime = (this.currentDifficulty === Difficulty.HARD) ? Math.min(35, 24 + i) : Math.min(40, 29 + i);
            let factorLevel = Math.min(i, 10);
            let skillFactor = 0.5 + (factorLevel - 1) * (0.4 / 9);
            let growthFactor = 1 + (factorLevel - 1) * 0.05;
            totalTarget += stdTime * goldFishEff * skillFactor * growthFactor;
        }
        if (this.currentDifficulty === Difficulty.HARD) totalTarget *= 1.20;
        if (this.currentPlayerMode === PlayerMode.TWO_PLAYER) totalTarget *= 1.75;
        let targetScore = Math.floor(totalTarget / 10) * 10; 
        
        textSize(48); 
        const pulseScore = 0.03 * sin(frameCount * 0.08); 
        push();
        translate(cx, textCy);
        scale(1 + pulseScore); // ✨ 给目标分数加上动态缩放
        fill(40, 10, 30, 200);
        text(`${targetScore}`, 3, 3);
        fill(255, 100, 200);
        text(`${targetScore}`, 0, 0);
        pop();
        
        // 🚨 收紧间距
        textCy += 60; 

        // -- 4. 当前分数 --
        textSize(14); 
        fill(10, 30, 60, 200);
        text(`Current Score: ${this.player.totalScore}`, cx + 2, textCy + 2);
        fill(150, 220, 255); 
        text(`Current Score: ${this.player.totalScore}`, cx, textCy);
        
        // 🚨 收紧间距
        textCy += 70; 

        // -- 5. 呼吸闪烁的启动提示 --
        textSize(8); 
        fill(10, 30, 30, 200);
        text('Click anywhere to start level', cx + 2, textCy + 2);
        
        // 🌟 核心修改：把 0.1 改成了 0.04！数字越小，闪烁越慢！
        let mainAlpha = (sin(frameCount * 0.04) * 127 + 128); 
        fill(180, 255, 180, mainAlpha); 
        text('Click anywhere to start level', cx, textCy);

        pop();
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

        if (typeof pixelFont !== 'undefined' && pixelFont) textFont(pixelFont);
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
            const rankStr = String(i + 1);
            const rankPad = 10;
            text(rankStr, rowX + rankPad, ry);
            const rankW = textWidth(rankStr);
            const contentStartX = rowX + rankPad + rankW + 10;

            const avatarX = contentStartX + 11;
            const modeIconX = contentStartX + 11 + 22 + 8;
            const nameX = contentStartX + 11 + 22 + 8 + 18 + 6;

            this.drawScoreAvatar(avatarX, ry, entry.playerName);
            this.drawModeIcon(modeIconX, ry, entry.difficulty, entry.playerMode);
            textSize(14);
            text(entry.playerName, nameX, ry);

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
        const settingsStates = [
            GameState.NAME_ENTRY,
            GameState.HOW_TO_PLAY,
            GameState.PLAYING,
            GameState.SHOP,
            GameState.LEVEL_PASS_CELEBRATION,
            GameState.LEVEL_RESULT,
            GameState.HIGH_SCORE,
        ];

        if (settingsStates.includes(this.currentState)) {
            if (this.settingsOpen) {
                if (
                    this._settingsCloseBounds &&
                    mouseX >= this._settingsCloseBounds.x &&
                    mouseX <= this._settingsCloseBounds.x + this._settingsCloseBounds.w &&
                    mouseY >= this._settingsCloseBounds.y &&
                    mouseY <= this._settingsCloseBounds.y + this._settingsCloseBounds.h
                ) {
                    this.settingsOpen = false;
                    if (this.currentState === GameState.PLAYING) this.gamePaused = false;
                    return;
                }
                if (this._settingsVolumeBar) {
                    const b = this._settingsVolumeBar;
                    if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y - 8 && mouseY <= b.y + b.h + 8) {
                        this._settingsVolumeDragging = true;
                        this.volumeLevel = constrain((mouseX - b.x) / b.w, 0, 1);
                        this._applyVolume();
                    }
                }
                if (!this._settingsVolumeDragging && this._settingsSfxVolumeBar) {
                    const bs = this._settingsSfxVolumeBar;
                    if (mouseX >= bs.x && mouseX <= bs.x + bs.w && mouseY >= bs.y - 8 && mouseY <= bs.y + bs.h + 8) {
                        this._settingsSfxVolumeDragging = true;
                        this.sfxVolumeLevel = constrain((mouseX - bs.x) / bs.w, 0, 1);
                        this._applySfxVolume();
                    }
                }
                if (
                    this._settingsBrightnessBar &&
                    !this._settingsVolumeDragging &&
                    !this._settingsSfxVolumeDragging
                ) {
                    const b2 = this._settingsBrightnessBar;
                    if (mouseX >= b2.x && mouseX <= b2.x + b2.w && mouseY >= b2.y - 8 && mouseY <= b2.y + b2.h + 8) {
                        this._settingsBrightnessDragging = true;
                        this.brightnessLevel = constrain((mouseX - b2.x) / b2.w, 0, 1);
                        this._saveBrightness();
                    }
                }
                return;
            }
            if (
                this._settingsButtonBounds &&
                mouseX >= this._settingsButtonBounds.x &&
                mouseX <= this._settingsButtonBounds.x + this._settingsButtonBounds.w &&
                mouseY >= this._settingsButtonBounds.y &&
                mouseY <= this._settingsButtonBounds.y + this._settingsButtonBounds.h
            ) {
                this.settingsOpen = true;
                if (this.currentState === GameState.PLAYING) this.gamePaused = true;
                return;
            }
        }

        switch (this.currentState) {
            case GameState.NAME_ENTRY: {
                const mx = this.scaledMouseX ?? 0, my = this.scaledMouseY ?? 0;
                if (
                    this._trophyButtonBounds &&
                    this.isPointInRect(
                        mx,
                        my,
                        this._trophyButtonBounds.cx,
                        this._trophyButtonBounds.cy,
                        this._trophyButtonBounds.w,
                        this._trophyButtonBounds.h,
                    )
                ) {
                    this.changeState(GameState.HIGH_SCORE);
                    break;
                }
                if (this.isPointInRect(mx, my, width / 2, height / 2 + 25, 260, 50)) {
                    this.nameInputFocused = true;
                }
                break;
            }
            case GameState.DIFFICULTY_SELECT:
                if (this._menuBackBtnBounds && 
                    mouseX >= this._menuBackBtnBounds.x && mouseX <= this._menuBackBtnBounds.x + this._menuBackBtnBounds.w && 
                    mouseY >= this._menuBackBtnBounds.y && mouseY <= this._menuBackBtnBounds.y + this._menuBackBtnBounds.h) {
                    this.changeState(GameState.NAME_ENTRY); // 退回到输入名字
                    break;
                }
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
                if (this._menuBackBtnBounds && 
                    mouseX >= this._menuBackBtnBounds.x && mouseX <= this._menuBackBtnBounds.x + this._menuBackBtnBounds.w && 
                    mouseY >= this._menuBackBtnBounds.y && mouseY <= this._menuBackBtnBounds.y + this._menuBackBtnBounds.h) {
                    this.changeState(GameState.DIFFICULTY_SELECT); // 退回到选择难度
                    break;
                }
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
                    
                    // 1. 点击了“继续游戏”的 X 按钮
                    if (bc && mouseX >= bc.x && mouseX <= bc.x + bc.w && mouseY >= bc.y && mouseY <= bc.y + bc.h) {
                        this.gamePaused = false;
                        // 🎵 恢复音乐播放
                        if (typeof gameplayBgm !== 'undefined' && gameplayBgm && !gameplayBgm.isPlaying()) {
                            gameplayBgm.loop();
                        }
                        break;
                    }
                    // 2. 点击了“结束当前关卡/放弃游戏”
                    if (b1 && mouseX >= b1.x && mouseX <= b1.x + b1.w && mouseY >= b1.y && mouseY <= b1.y + b1.h) {
                        this.gamePaused = false;
                        this._finalizeCurrentLevelEarnings();
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
                            this.perLevelEarned,
                            this.perLevelSpawnValue,
                        );
                        this.changeState(GameState.LEVEL_RESULT);
                        break;
                    }
                    // 3. 点击了“重新开始游戏” (返回主菜单)
                    if (b2 && mouseX >= b2.x && mouseX <= b2.x + b2.w && mouseY >= b2.y && mouseY <= b2.y + b2.h) {
                        this.gamePaused = false;
                        this.changeState(GameState.NAME_ENTRY);
                        break;
                    }
                } else {
                    const pb = this.levelManager._pauseBtnBounds;
                    // 4. 点击了右上角的【暂停按钮】
                    if (
                        pb &&
                        this.isPointInRect(mouseX, mouseY, pb.cx, pb.cy, pb.w, pb.h)
                    ) {
                        this.gamePaused = !this.gamePaused; // 切换暂停状态
                        
                        // 🎵 处理音乐的停止与恢复
                        if (typeof gameplayBgm !== 'undefined' && gameplayBgm) {
                            if (this.gamePaused) {
                                // 如果进入暂停，停止音乐
                                if (gameplayBgm.isPlaying()) {
                                    gameplayBgm.pause(); 
                                }
                            } else {
                                // 取消暂停时恢复
                                if (!gameplayBgm.isPlaying()) {
                                    gameplayBgm.loop(); 
                                }
                            }
                        }
                    }
                }
                break;
            }
            case GameState.SHOP: {
                let shopResult = this.shopManager.handleMousePress(this.player, this.currentPlayerMode);
                if (shopResult === 'NEXT_LEVEL') {
                    this.levelNum++;
                    // 🌟 重点：这里不要直接调用 startLevel，而是切到目标展示页
                    this.changeState(GameState.NEXT_LEVEL_TARGET); 
                }
                break;
            }
            case GameState.NEXT_LEVEL_TARGET: {
                this.startLevel();
                this.player.consumeItems(this.levelManager);
                this.shopManager.resetShop(this.levelNum, this.player);
                break;
            }
            case GameState.LEVEL_PASS_CELEBRATION:
                this.changeState(GameState.SHOP);
                break;
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
        if (this.settingsOpen) {
            if (this._settingsVolumeDragging && this._settingsVolumeBar) {
                const b = this._settingsVolumeBar;
                this.volumeLevel = constrain((mouseX - b.x) / b.w, 0, 1);
                this._applyVolume();
                return;
            }
            if (this._settingsSfxVolumeDragging && this._settingsSfxVolumeBar) {
                const bs = this._settingsSfxVolumeBar;
                this.sfxVolumeLevel = constrain((mouseX - bs.x) / bs.w, 0, 1);
                this._applySfxVolume();
                return;
            }
            if (this._settingsBrightnessDragging && this._settingsBrightnessBar) {
                const b = this._settingsBrightnessBar;
                this.brightnessLevel = constrain((mouseX - b.x) / b.w, 0, 1);
                this._saveBrightness();
                return;
            }
        }
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
        this._settingsVolumeDragging = false;
        this._settingsSfxVolumeDragging = false;
        this._settingsBrightnessDragging = false;
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
            this.nameInputFocused = true;
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
