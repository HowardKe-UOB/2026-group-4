class LevelManager {
    constructor(difficulty, levelNum, player, playerMode = PlayerMode.SINGLE) {
        this.player = player;
        this.levelNum = levelNum;
        this.playerMode = playerMode;
        this.difficulty = difficulty; // Distinguish hard and easy modes
        // Deep-sea scene check: unlocked after buying the submarine
        this.isDeepSea = this.player.hasSubmarine;

        // Target-score calculation logic (legacy notes)
        // Nonlinear growth curve: 75n^2 + 125n + 50
        // Single-player reference (EASY): L1=250, L2=600, L3=1100, L4=1750, L5=2550
        // Two-player reference (x1.8): L1=450, L2=1080, L3=1980, L4=3150, L5=4590
        // Hard-mode reference (x1.3): L1=325, L2=780, L3=1430, L4=2275, L5=3315
        // let n = levelNum;
        // let baseTarget = 75 * n * n + 125 * n + 50;

        let n = levelNum;

        // Core baseline definitions
        const goldFishEff = 26.67; // Tuned efficiency constant to make level 1 close to 400 points
        let totalTarget = 0;

        // Accumulate target score (sum of per-level increments from 1 to n)
        for (let i = 1; i <= n; i++) {
            // A. Determine this level's standard time (score calculation only; ignore hourglass changes)
            let stdTime = 0;
            if (this.difficulty === Difficulty.HARD) {
                stdTime = Math.min(35, 24 + i); // Hard mode: 25~35s
            } else {
                stdTime = Math.min(40, 29 + i); // Easy mode: 30~40s
            }

            // B. Get capped level index for coefficients (max 10)
            let factorLevel = Math.min(i, 10);

            // C. Compute skill coefficient (capped from 0.5 to 0.9)
            let skillFactor = 0.5 + (factorLevel - 1) * (0.4 / 9);

            // D. Compute resource-density/growth compensation (capped from 1.0 to 1.45)
            let growthFactor = 1 + (factorLevel - 1) * 0.05;

            // E. Add this level's increment
            let increment = stdTime * goldFishEff * skillFactor * growthFactor;
            totalTarget += increment;
        }

        // Difficulty and player-count adjustments
        if (this.difficulty === Difficulty.HARD) {
            totalTarget *= 1.2; // Hard mode raises requirement by 20%
        }
        if (this.playerMode === PlayerMode.TWO_PLAYER) {
            totalTarget *= 1.75; // Two-player multiplier
        }

        // Final assignment (rounded to tens)
        this.targetScore = Math.floor(totalTarget / 10) * 10;

        // Set actual level time (hourglass may change this later without affecting target score)
        if (this.difficulty === Difficulty.HARD) {
            this.timeLimit = Math.min(35, 24 + n); // Hard mode time: 25~35s
        } else {
            this.timeLimit = Math.min(40, 29 + n); // Easy mode time: 30~40s
        }
        this.timeRemaining = this.timeLimit;

        this.boats = [];
        this.hooks = [];
        this.scores = [];

        // Assign dedicated hook sprites; fallback to original if not loaded
        let p1HookImg =
            typeof hookImg2 !== "undefined"
                ? hookImg2
                : typeof hookImg !== "undefined"
                  ? hookImg
                  : null;

        let startY = 185;

        if (this.isDeepSea) {
            p1HookImg = typeof newhookImg !== "undefined" ? newhookImg : null;
            startY = 179; // Submarine has deeper draft; move launch point downward
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

            // Left player (P1)
            this.boats.push(createVector(boat1X, 195));
            this.hooks.push(new Hook(boat1X, startY, p1HookImg));
            this.scores.push(0);

            // Right player (P2)
            this.boats.push(createVector(boat2X, 195));

            // Core update: assign dedicated new hook to right player
            let p2HookImg = typeof hookImg !== "undefined" ? hookImg : null;
            let p2StartY = 185;

            if (this.isDeepSea) {
                p2HookImg =
                    typeof newhook2Img !== "undefined" ? newhook2Img : null;
                p2StartY = 179; // Raise for clean embedding under submarine belly
            }

            this.hooks.push(new Hook(boat2X, p2StartY, p2HookImg));
            this.scores.push(0);

            this.hook1 = this.hooks[0];
            this.hook2 = this.hooks[1];
        }
        this.activeItems = [];
        this.fishCaught = {};
        this.spawnItems();
        // Total spawned item value after spawnItems (excluding later dynamic spawns like Koi)
        this.initialSpawnValueTotal = this._sumActiveItemsScoreValue();
        this.floatingScores = [];
        this.koiSpawned = false;

        // Small chance to naturally spawn one Koi per level
        this.hasRandomKoi = random() < 0.1; // 10% spawn chance
        this.randomKoiTime = random(8, 16); // Randomly appears at 8~16s
        this.randomKoiSpawned = false; // Whether natural Koi has already appeared

        // Cached UI colors
        this.cPrimary = color(0, 200, 150);
        this.cP1 = color(255, 150, 50);
        this.cP2 = color(50, 150, 255);
        this.cSecondary = color(255, 215, 0);
        this.cMoney = color(255, 220, 50);
        this._pauseBtnBounds = { cx: 0, cy: 0, w: 24, h: 24 };

        // Deep-sea system init (darknessLayer mask + shark events)
        if (this.isDeepSea) {
            this.darknessLayer = createGraphics(width, height);
            this.sharks = [];
            this.sharkSpawnTimer = 0;
            this.sharkSpawnInterval = floor(random(600, 800)); // Random interval: 5-8 seconds
        }
    }

    _sumActiveItemsScoreValue() {
        let sum = 0;
        for (const item of this.activeItems) {
            if (
                item &&
                typeof item.scoreValue === "number" &&
                !isNaN(item.scoreValue)
            ) {
                sum += item.scoreValue;
            }
        }
        return sum;
    }

    spawnItems() {
        this.activeItems = [];

        let isHard = this.difficulty === Difficulty.HARD;
        let multiplier = this.playerMode === PlayerMode.TWO_PLAYER ? 1.5 : 1;

        // ═══════════════════════════════════════════════════════════
        // Layered spawning system
        // Split screen vertically into three spawn layers with dedicated item zones
        // ═══════════════════════════════════════════════════════════
        const SAFE_MARGIN = 40;
        const LAYER_SHALLOW = { minY: 320, maxY: 380 }; // Shallow: small-fish activity zone
        const LAYER_MID = { minY: 360, maxY: 500 }; // Mid: big fish + obstacles
        const LAYER_DEEP = { minY: 480, maxY: height - 20 }; // Deep: chests + pearls + rocks

        // Per-category caps; no hard global MAX_ITEMS cap
        // Keeps the ocean lively while preserving challenge
        const MAX_OBSTACLES = 12; // Chest + rock + fishbone cap (same for both modes)

        // Collision-check helper
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

        // Independent lists for layered collision checks
        let staticItems = []; // Obstacles (chests, rocks, fishbones, pearls)
        let dynamicItems = []; // Creatures (fish)

        // Phase 1: determine per-category counts (rebalanced)
        // Chests: normal 2-3, deep sea 3-4
        let treasureCount = this.isDeepSea
            ? Math.floor(random(3, 5) * multiplier)
            : Math.floor(random(2, 4) * multiplier);

        // Loose rocks/fishbones: fixed 5-7
        let looseStoneCount = Math.floor(random(5, 8) * multiplier);

        // Big fish/angler fish: 4-5, restricted to mid-deep zone
        let bigFishCount = Math.floor(random(4, 6) * multiplier);

        // Small fish: 8-10, used as visual interference in shallow/mid zones
        let smallFishCount = Math.floor(random(8, 11) * multiplier);

        // Pearls: fixed 1 per run (50% chance)
        let pearlCount = random() < 0.5 ? 1 : 0;

        // Phase 2: spawn chests (deep bottom)
        for (
            let i = 0;
            i < treasureCount && staticItems.length < MAX_OBSTACLES;
            i++
        ) {
            let attempts = 0;
            while (attempts < 30) {
                let tx = random(80, width - 80);
                let ty = height - random(30, 80); // Keep chest close to seabed
                let treasure = new Treasure(tx, ty);

                if (!checkOverlap(treasure, staticItems, 40)) {
                    this.activeItems.push(treasure);
                    staticItems.push(treasure);

                    // Hard mode: spawn guard rocks around chest
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

        // Phase 3: spawn loose rocks and fishbones (mid + deep)
        for (
            let i = 0;
            i < looseStoneCount && staticItems.length < MAX_OBSTACLES;
            i++
        ) {
            let attempts = 0;
            while (attempts < 20) {
                let sx = random(SAFE_MARGIN, width - SAFE_MARGIN);
                // Place obstacles between mid and deep layers
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

        // Phase 4: spawn pearl (deepest bottom only)
        for (let i = 0; i < pearlCount; i++) {
            let attempts = 0;
            while (attempts < 30) {
                let px = random(SAFE_MARGIN + 20, width - SAFE_MARGIN - 20);
                // Pearl must be in the bottom-most screen area
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

        // Phase 4B: spawn moving shell (50% chance, mid-deep zone)
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

        // Phase 5: spawn big fish/angler fish (independent quota, mid-deep only)
        for (let i = 0; i < bigFishCount; i++) {
            let attempts = 0;
            while (attempts < 30) {
                let fx = random(50, width - 50);
                let fy = random(LAYER_DEEP.minY, LAYER_DEEP.maxY - 60);
                let fish;

                if (this.isDeepSea) {
                    // Deep sea: ~40% angler fish, 60% big fish
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

        // Phase 6: spawn small fish (shallow + mid, moving visual obstacles)
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
                // If the caught item is a chest and player has clover, increase reward
                if (
                    this.player.hasClover &&
                    returnedItem.itemName === "Treasure"
                ) {
                    returnedItem.scoreValue = Math.floor(
                        returnedItem.scoreValue * 1.35,
                    );
                }
                // Fishbone collector: fishbones grant 20~50 gold; rocks grant +100% gold
                if (this.player.hasFishboneCollector) {
                    if (returnedItem.itemName === "FishBone") {
                        returnedItem.scoreValue = Math.floor(random(20, 31)); // Original upper bound was 51
                    } else if (returnedItem.itemName === "Stone") {
                        returnedItem.scoreValue = Math.floor(
                            returnedItem.scoreValue * 2,
                        );
                    }
                }
                // Play catch sound effect
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
                // Track P1/P2 balances separately in two-player mode; single-player keeps original logic
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

        // Deep-sea shark event system
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
                // Detect collision between shark head and item attached to rising hook
                for (let hook of this.hooks) {
                    if (
                        hook.attachedItem &&
                        hook.state === HookState.MOVING_UP
                    ) {
                        let item = hook.attachedItem;

                        // Shark ignores rocks/fishbones; no steal triggered
                        let isStoneOrBone =
                            item instanceof Stone || item instanceof FishBone;

                        // Shark-head collision check
                        // Compute head coordinate by shifting 35% body length toward facing direction
                        let headX =
                            shark.x + shark.direction * shark.width * 0.35;
                        let headY = shark.y;
                        const SHARK_BITE_RADIUS = 25; // Bite radius (small head circle only)
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
                            // Shark eats the item; hook returns empty
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
        // Koi fish
        let timePassed = this.timeLimit - this.timeRemaining;
        // Spawn Koi 10s into the level
        if (this.player.hasLuckyCoin && timePassed >= 10 && !this.koiSpawned) {
            let koi = new KoiFish(random(375, 475)); // Spawn height in shallow-mid zone
            this.activeItems.push(koi);
            this.koiSpawned = true; // Mark as spawned for this level
            this.player.hasLuckyCoin = false; // Consume the item
            if (koiInSfx && !koiInSfx.isPlaying()) {
                koiInSfx.play(); // Entrance SFX
            }
        }

        // Random Koi is mutually exclusive with Lucky Coin Koi; max one Koi per level
        if (
            this.hasRandomKoi &&
            !this.randomKoiSpawned &&
            !this.koiSpawned &&
            timePassed >= this.randomKoiTime
        ) {
            if (!this.player.hasLuckyCoin) {
                let randomKoi = new KoiFish(random(375, 475));
                this.activeItems.push(randomKoi);
                this.randomKoiSpawned = true;
                this.koiSpawned = true;

                if (koiInSfx && !koiInSfx.isPlaying()) {
                    koiInSfx.play();
                }
            } else {
                // If Lucky Coin is bought, discard this level's random-Koi chance
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

        // --- Background ---
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
            // Deep-sea render order: items -> sharks -> darkness mask -> submarine + hooks
            // Draw items and sharks first (masked later; visible only in light cone)
            for (let item of this.activeItems) {
                item.draw();
            }

            // Sharks are also hidden by darkness mask and visible only in the cone
            for (let shark of this.sharks) {
                shark.draw();
            }

            // Apply darkness mask (contains spotlight cone + angler glow cutout holes)
            this._updateDarknessLayer();
            push();
            imageMode(CORNER); // Mask must cover full screen from top-left (0,0)
            image(this.darknessLayer, 0, 0);
            pop();

            // Draw submarine and hooks above the mask
            for (let i = 0; i < this.boats.length; i++) {
                push();
                let waveSpeed = frameCount * 0.015;
                let phaseOffset = this.boats[i].x * 0.01;
                let bobY = sin(waveSpeed + phaseOffset) * 3;
                let rockAngle = cos(waveSpeed * 0.8 + phaseOffset) * 0.025;
                translate(this.boats[i].x, this.boats[i].y + bobY);
                rotate(rockAngle);
                // Core update: P2 uses new submarine; P1 uses old submarine
                if (
                    i === 1 &&
                    typeof submarineImg2 !== "undefined" &&
                    submarineImg2
                ) {
                    // P2 (right player) uses new submarineImg2
                    image(submarineImg2, 0, -40, 240, 130);
                } else if (
                    typeof submarineImg !== "undefined" &&
                    submarineImg
                ) {
                    // P1 (left player), or single-player, uses old submarine
                    image(submarineImg, 0, -40, 240, 130);
                } else {
                    this._drawSubmarine(i);
                }
                // End of core update
                pop();
                this.hooks[i].draw();
            }
        } else {
            // Normal render order (keep original logic: boat -> hooks -> items)
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

        // --- Clean UI draw code (duplicate black-screen-causing code removed) ---
        push();
        let timeLeft = Math.ceil(this.timeRemaining || 0);
        textSize(18);
        // Use pixel arcade font when available; fallback to default font
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

        // Deep-sea marker display
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

            // Show level number at the top center
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
            // Two-player UI layout:
            // Row 1 (y=20): P1 (left) | TOTAL (center) | P2 (right)
            // Row 2 (y=45): LV.X (left) | GOAL (center)
            // Row 3 (y=70/95): TIME (center; move to y=95 in deep sea)
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
            // Previous version: `P2: ${this.scores[1]}`
            textAlign(RIGHT, TOP);
            this.drawPixelText(
                `P2: ${this.player.p2Score}`,
                rightX - 50, // Leave space for pause button
                line1Y,
                this.cP2,
            );
            // Show level number on the left second row
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

        // Pause button
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

        // Floating text
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
                fill(255, 55, 55, fs.alpha); // Red warning (STOLEN!)
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

        // Help button (fixed at bottom-right)
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

    // Deep-sea darkness mask: fill black, then cut gradient holes using destination-out
    _updateDarknessLayer() {
        let dl = this.darknessLayer;
        dl.clear();
        dl.background(0, 0, 0, 215);
        let ctx = dl.drawingContext;
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";

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

            // Soft radial glow around submarine (main halo effect)
            let ambientR = 130;
            let ambientGrad = ctx.createRadialGradient(
                bx,
                by,
                0,
                bx,
                by,
                ambientR,
            );
            ambientGrad.addColorStop(0, "rgba(0,0,0,1)");
            ambientGrad.addColorStop(0.5, "rgba(0,0,0,0.9)");
            ambientGrad.addColorStop(0.82, "rgba(0,0,0,0.45)");
            ambientGrad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = ambientGrad;
            ctx.beginPath();
            ctx.arc(bx, by, ambientR, 0, Math.PI * 2);
            ctx.fill();

            // Light cone: trapezoid path + linear gradient (strong near, weak far) + soft blur edges
            let farCx = bx + dx * coneLen;
            let farCy = by + dy * coneLen;
            let coneGrad = ctx.createLinearGradient(bx, by, farCx, farCy);
            coneGrad.addColorStop(0, "rgba(0,0,0,0.85)");
            coneGrad.addColorStop(0.55, "rgba(0,0,0,0.6)");
            coneGrad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.filter = "blur(18px)";
            ctx.fillStyle = coneGrad;
            ctx.beginPath();
            ctx.moveTo(tx + px * topHalfW, ty + py * topHalfW);
            ctx.lineTo(
                bx + Math.sin(a2) * coneLen,
                by + Math.cos(a2) * coneLen,
            );
            ctx.lineTo(
                bx + Math.sin(a1) * coneLen,
                by + Math.cos(a1) * coneLen,
            );
            ctx.lineTo(tx - px * topHalfW, ty - py * topHalfW);
            ctx.closePath();
            ctx.fill();
            ctx.filter = "none";
        }

        // Angler fish: soft radial glow with pulse-based dynamics
        for (let item of this.activeItems) {
            if (item instanceof AnglerFish) {
                let pulse = 0.15 * sin(frameCount * 0.05 + item.glowPulse);
                let r = item.glowRadius * (1 + pulse);
                let grad = ctx.createRadialGradient(
                    item.position.x,
                    item.position.y,
                    0,
                    item.position.x,
                    item.position.y,
                    r,
                );
                grad.addColorStop(0, "rgba(0,0,0,0.85)");
                grad.addColorStop(0.5, "rgba(0,0,0,0.45)");
                grad.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(item.position.x, item.position.y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            // Pearl: soft blue-white glow
            if (item instanceof Pearl) {
                let pulse = 0.25 * sin(frameCount * 0.06 + item.glowPhase);
                let r = item.glowRadius * (1 + pulse);
                let grad = ctx.createRadialGradient(
                    item.position.x,
                    item.position.y,
                    0,
                    item.position.x,
                    item.position.y,
                    r,
                );
                grad.addColorStop(0, "rgba(0,0,0,0.85)");
                grad.addColorStop(0.5, "rgba(0,0,0,0.45)");
                grad.addColorStop(1, "rgba(0,0,0,0)");
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
                let grad = ctx.createRadialGradient(
                    item.position.x,
                    item.position.y,
                    0,
                    item.position.x,
                    item.position.y,
                    r,
                );
                grad.addColorStop(0, "rgba(0,0,0,0.8)");
                grad.addColorStop(0.5, "rgba(0,0,0,0.4)");
                grad.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(item.position.x, item.position.y, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    // Draw submarine by code (fallback when submarineImg is unavailable, centered at 0,0)
    _drawSubmarine(playerIndex) {
        noStroke();
        // Hull
        fill(playerIndex === 0 ? color(60, 110, 160) : color(110, 60, 160));
        ellipse(0, 15, 210, 78);
        // Conning tower
        fill(playerIndex === 0 ? color(45, 88, 130) : color(88, 45, 130));
        rect(-22, -38, 44, 50, 6);
        // Periscope
        fill(35, 70, 105);
        rect(-6, -60, 12, 28);
        // Portholes
        fill(190, 235, 255, 200);
        ellipse(38, 14, 26, 26);
        stroke(40, 90, 130);
        strokeWeight(3);
        noFill();
        ellipse(38, 14, 26, 26);
        noStroke();
        // Propeller
        fill(80, 140, 175);
        ellipse(-100, 14, 18, 42);
        // Searchlight (front glow point)
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

    // Help button & panel

    _drawHelpButton() {
        push();
        const btnX = width - 40;
        const btnY = height - 40;
        const btnR = 20;

        const isHovered = dist(mouseX, mouseY, btnX, btnY) < btnR;

        // Button shadow
        noStroke();
        fill(0, 0, 0, 140);
        circle(btnX + 3, btnY + 3, btnR * 2);

        // Button body
        fill(isHovered ? color(80, 180, 255) : color(30, 120, 200));
        circle(btnX, btnY, btnR * 2);

        // Border highlight
        stroke(255, 255, 255, 150);
        strokeWeight(2);
        noFill();
        circle(btnX, btnY, btnR * 2);
        noStroke();

        // "?" text
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(18);
        textStyle(BOLD);
        if (typeof pixelFont !== "undefined" && pixelFont) {
            textFont(pixelFont);
        }
        text("?", btnX, btnY - 1);
        textStyle(NORMAL);

        // Expand help panel on hover
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

        // Panel background
        push();
        noStroke();
        fill(0, 0, 0, 140);
        rect(panelX + 4, panelY + 4, panelW, panelH, 12); // Shadow
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

        // Game introduction
        // Game introduction
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
        // Fix: split an overly long goal sentence
        text("Catch fish & treasure to reach", lx, cy);
        cy += lineH;
        text("the GOAL score.", lx, cy);
        cy += lineH;
        text("Stone: 70-110 pts. Fish bone: 0 pts", lx, cy);
        cy += lineH;
        text("  (20-50 with Fishbone Collector).", lx, cy);
        cy += lineH + 6;

        // Shop and deep sea
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

        // Divider
        stroke(0, 120, 180, 180);
        strokeWeight(1);
        line(lx, cy, panelX + panelW - 18, cy);
        noStroke();
        cy += 10;

        // Controls
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
            // Fix: split an overly long single-player controls sentence
            text("Press DOWN ARROW \u2193 to cast", lx, cy);
            cy += lineH;
        }

        // Fix: split an overly long pause-instruction sentence
        text("Pause : click the \u23F8 button", lx, cy);
        cy += lineH;
        text("(top-right)", lx, cy);
        cy += lineH + 10;

        // Divider
        stroke(0, 120, 180, 180);
        strokeWeight(1);
        line(lx, cy, panelX + panelW - 18, cy);
        noStroke();
        cy += 10;

        // Item value reference
        fill(255, 210, 50);
        textSize(11);
        textStyle(BOLD);
        text("ITEM VALUES", lx, cy);
        cy += lineH;

        fill(190, 230, 255);
        textStyle(NORMAL);
        // Fix: horizontal layout was too long; changed to 4 stacked lines
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
