class SeaItem extends GameObject {
    constructor(x, y, itemName, scoreValue, weight) {
        super(x, y);
        this.itemName = itemName;
        this.scoreValue = scoreValue;
        this.weight = weight;
        this.width = 40;
        this.height = 30;
        this.canBeCaught = true;
    }

    update() {}

    draw() {
        rectMode(CENTER);
        fill(200);
        rect(this.position.x, this.position.y, this.width, this.height);
        this.drawScoreText();
    }

    drawScoreText() {}
}

class BaseFish extends SeaItem {
    constructor(x, y, itemName, scoreValue, weight, size) {
        super(x, y, itemName, scoreValue, weight);
        this.width = size;
        this.height = size;
        this.speed = random(1, 2.5);
        this.direction = random() > 0.5 ? 1 : -1;
    }

    swim() {
        this.position.x += this.speed * this.direction;

        if (this.position.x < this.width / 2 && this.direction === -1) {
            this.direction = 1;
        } else if (
            this.position.x > width - this.width / 2 &&
            this.direction === 1
        ) {
            this.direction = -1;
        }
    }

    update() {
        this.swim();
    }
}

class SmallFish extends BaseFish {
    constructor(x, y) {
        let randomSize = random(40, 60);
        // Score nerfed: 70–110 (was 30–150), keeps it a "filler" item
        let calculatedScore = floor(map(randomSize, 40, 60, 75, 115));
        let calculatedWeight = map(randomSize, 40, 60, 1.5, 2.5);

        super(
            x,
            y,
            "Small Fish",
            calculatedScore,
            calculatedWeight,
            randomSize,
        );

        this.speed = random(1.2, 1.6);
        this.fishIndex = floor(random(imgSmallFishes.length)); // 0–42 → fish1–fish43
        this.frames = imgSmallFishes[this.fishIndex];
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        scale(-this.direction, 1);
        imageMode(CENTER);

        if (this.frames && this.frames.length === 2) {
            let frameIndex = floor(frameCount / 15) % 2;
            image(this.frames[frameIndex], 0, 0, this.width, this.height);
        }
        pop();
        this.drawScoreText();
    }
}

class BigFish extends BaseFish {
    constructor(x, y) {
        let randomSize = random(110, 150);
        // Score nerfed (was 250–600), high-risk high-reward
        let calculatedScore = floor(map(randomSize, 110, 150, 190, 240)); // Previously 240, 340
        let calculatedWeight = map(randomSize, 110, 150, 3, 4);

        super(x, y, "Big Fish", calculatedScore, calculatedWeight, randomSize);

        this.speed = random(0.3, 0.8);
        this.fishIndex = floor(random(imgBigFishes.length)); // 0–20 → fish44–fish64
        this.frames = imgBigFishes[this.fishIndex];
        this.catchRadius = this.width * 0.35; // tighter hitbox: ~32–56px vs visual 45–80px
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);
        scale(-this.direction, 1);
        imageMode(CENTER);

        if (this.frames && this.frames.length === 2) {
            let frameIndex = floor(frameCount / 20) % 2;
            image(this.frames[frameIndex], 0, 0, this.width, this.height);
        }
        pop();
        this.drawScoreText();
    }
}

class FishBone extends SeaItem {
    constructor(x, y) {
        super(x, y, "FishBone", 1, 1.5);
        this.width = 70;
        this.height = 40;
        this.sprite = imgSkeleton;
    }
    draw() {
        push();
        translate(this.position.x, this.position.y);
        imageMode(CENTER);
        image(this.sprite, 0, 0, this.width, this.height);
        pop();
    }
}

class Treasure extends SeaItem {
    constructor(x, y) {
        let val = floor(random(300, 380));
        super(x, y, "Treasure", val, 4);
        this.width = 80;
        this.height = 60;

        this.sprite = treasureChest;
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        imageMode(CENTER);

        if (this.sprite) {
            image(this.sprite, 0, 0, this.width, this.height);
        }
        pop();

        this.drawScoreText();
    }
}

// Pearl: rare high-value deep-sea item with very small size and difficult capture.
class Pearl extends SeaItem {
    constructor(x, y) {
        // High value and very light, but with a tiny collision profile.
        let val = 1000;
        super(x, y, "Pearl", val, 1);
        this.width = 22;
        this.height = 22;
        this.catchRadius = 8; // Very small catch radius, intentionally hard to hit
        // Pearl glow pulse parameters (also used for deep-sea mask light cutout)
        this.glowPhase = random(TWO_PI);
        this.glowRadius = 50; // Halo radius in deep-sea mask; smaller than AnglerFish but still noticeable
        this.sprite = typeof pearlImg !== "undefined" ? pearlImg : null;
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        // Outer halo (radial gradient, same soft spotlight style as AnglerFish)
        let pulse = 0.2 * sin(frameCount * 0.06 + this.glowPhase);
        let r = this.glowRadius * (1 + pulse * 0.5);
        {
            let ctx = drawingContext;
            ctx.save();
            let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.3);
            grad.addColorStop(0, "rgba(220,230,255,0.38)");
            grad.addColorStop(0.5, "rgba(200,215,255,0.16)");
            grad.addColorStop(1, "rgba(180,200,255,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        imageMode(CENTER);
        if (this.sprite) {
            image(this.sprite, 0, 0, this.width, this.height);
        } else {
            // Fallback: draw procedurally when no sprite is available
            fill(240, 245, 255);
            ellipse(0, 0, this.width, this.height);
            fill(255, 255, 255, 200);
            ellipse(-3, -4, 6, 5);
            stroke(180, 190, 210, 100);
            strokeWeight(1);
            noFill();
            arc(0, 2, this.width * 0.6, this.height * 0.4, 0, PI);
        }

        pop();
        this.drawScoreText();
    }
}

class Stone extends SeaItem {
    constructor(x, y) {
        let val = floor(random(60, 90));
        let w = random(3.5, 4);

        super(x, y, "Stone", val, w);

        this.width = random(50, 80);
        this.height = this.width;

        if (typeof stones !== "undefined" && stones.length > 0) {
            this.sprite = random(stones);
        } else {
            this.sprite = null;
        }
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        if (this.sprite) {
            imageMode(CENTER);

            image(this.sprite, 0, 0, this.width, this.height);
        } else {
            noStroke();
            fill(90, 90, 95);
            ellipse(0, 0, this.width, this.height);

            fill(120, 120, 125);
            ellipse(
                -this.width * 0.15,
                -this.height * 0.15,
                this.width * 0.4,
                this.height * 0.3,
            );
            fill(60, 60, 65);
            ellipse(
                this.width * 0.15,
                this.height * 0.2,
                this.width * 0.5,
                this.height * 0.2,
            );
        }

        pop();
        this.drawScoreText();
    }
}

// Optional extension: remove Koi after it leaves the screen.
class KoiFish extends BaseFish {
    constructor(y) {
        // Parameters
        let val = random([700, 800]);
        // Randomly spawn from left (-100) or right (width + 100)
        let spawnX = random() > 0.5 ? -100 : width + 100;
        super(spawnX, y, "KoiFish", val, 2.33, 60); // Size and weight settings

        this.playedOutSfx = false; // Exit SFX trigger flag

        if (
            typeof koiFishImgs !== "undefined" &&
            koiFishImgs.length > 0 &&
            koiFishImgs[0]
        ) {
            let img = koiFishImgs[0];
            let targetWidth = 70;
            let targetHeight = targetWidth * (img.height / img.width);
            // Reassign width/height based on sprite aspect ratio
            this.width = targetWidth;
            this.height = targetHeight;
        }

        this.speed = random(3.5, 4.2); // Faster movement speed
        this.direction = spawnX < 0 ? 1 : -1; // Spawn left -> swim right, spawn right -> swim left

        this.glowPhase = random(TWO_PI);
        this.glowRadius = 60;
    }

    update() {
        this.swim();
    }

    // Override swim behavior: keep moving forward, no wall bounce
    swim() {
        this.position.x += this.speed * this.direction;
        // Exit sound effect
        if (!this.playedOutSfx) {
            if (
                (this.direction === 1 && this.position.x > width) ||
                (this.direction === -1 && this.position.x < 0)
            ) {
                if (koiOutSfx && !koiOutSfx.isPlaying()) {
                    koiOutSfx.play();
                }
                this.playedOutSfx = true;
            }
        }
    }

    // Override draw behavior: add animation and mirroring
    draw() {
        push();
        translate(this.position.x, this.position.y);

        // Golden radial glow halo (same style as AnglerFish)
        let pulse = 0.15 * sin(frameCount * 0.05 + this.glowPhase);
        let r = this.glowRadius * (1 + pulse);
        let ctx = drawingContext;
        ctx.save();
        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.3);
        grad.addColorStop(0, "rgba(255,200,50,0.28)");
        grad.addColorStop(0.5, "rgba(255,200,50,0.13)");
        grad.addColorStop(1, "rgba(255,200,50,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (this.direction === -1) {
            scale(-1, 1);
        }
        imageMode(CENTER);
        if (typeof koiFishImgs !== "undefined" && koiFishImgs.length === 2) {
            let frame = Math.floor(frameCount / 15) % 2;
            image(koiFishImgs[frame], 0, 0, this.width, this.height);
        } else {
            fill(255, 215, 0);
            ellipse(0, 0, this.width, this.height * 0.5);
        }
        pop();
        this.drawScoreText();
    }
}

// Moving shell: inherits BaseFish to reuse swim() logic; high-value visible target.
class SwimmingPearlShell extends BaseFish {
    constructor(x, y) {
        // Constructor settings for SwimmingPearlShell
        super(x, y, "Moving Shell", floor(random(500, 600)), 2, 42); // Previously 1000
        this.speed = random(3, 3.8);
        // Animation sequence: 1-2-3-4-3-2-1 (ping-pong loop)
        this._framePingPong = [0, 1, 2, 3, 2, 1];
        this._frameInterval = 8; // Switch frame every 8 ticks
        // Deep-sea glow settings (kept stylistically consistent with Pearl)
        this.glowPhase = random(TWO_PI);
        this.glowRadius = 55;
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        // Deep-sea halo (radial gradient, same soft spotlight style as AnglerFish)
        let pulse = 0.2 * sin(frameCount * 0.06 + this.glowPhase);
        let r = this.glowRadius * (1 + pulse * 0.5);
        {
            let ctx = drawingContext;
            ctx.save();
            let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.3);
            grad.addColorStop(0, "rgba(200,240,255,0.32)");
            grad.addColorStop(0.5, "rgba(180,230,255,0.14)");
            grad.addColorStop(1, "rgba(160,220,255,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (this.direction === -1) {
            scale(-1, 1);
        }

        imageMode(CENTER);

        const hasImgs =
            typeof pearlShellImgs !== "undefined" &&
            pearlShellImgs.length > 0 &&
            pearlShellImgs[0];

        if (hasImgs) {
            let seqIndex =
                Math.floor(frameCount / this._frameInterval) %
                this._framePingPong.length;
            let frameIdx = this._framePingPong[seqIndex];
            let img = pearlShellImgs[frameIdx];
            if (img) image(img, 0, 0, this.width, this.height);
        } else {
            // Fallback: procedurally draw opened shell + glowing pearl
            noStroke();

            // Lower shell
            fill(220, 190, 150);
            arc(0, 5, this.width, this.height * 0.7, 0, PI);

            // Upper shell (opened upward)
            fill(240, 210, 170);
            arc(0, -8, this.width, this.height * 0.65, PI, TWO_PI);

            // Shell texture lines
            stroke(180, 150, 110, 160);
            strokeWeight(1);
            for (let i = -1; i <= 1; i++) {
                line(i * 10, -18, i * 12, 10);
            }
            noStroke();

            // Pearl halo
            fill(220, 230, 255, 60);
            ellipse(0, 0, 22 + pulse * 8, 22 + pulse * 8);

            // Pearl body
            fill(240, 245, 255);
            ellipse(0, 0, 14, 14);
            fill(255, 255, 255, 200);
            ellipse(-2, -3, 5, 4);
        }

        pop();
        this.drawScoreText();
    }
}
