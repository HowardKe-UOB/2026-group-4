// ============================================================
// DeepSeaCreatures.js
// New creature classes for deep sea levels (levelNum >= 3)
// ============================================================

// AnglerFish: high-value catch AND a moving light source in the darkness layer
class AnglerFish extends BaseFish {
    constructor(x, y) {
        let randomSize = random(80, 130);
        // High score reward: 400–800, deep sea risk premium
        let calculatedScore = floor(map(randomSize, 80, 130, 400, 800));
        let calculatedWeight = map(randomSize, 80, 130, 6, 10);
        super(
            x,
            y,
            "Angler Fish",
            calculatedScore,
            calculatedWeight,
            randomSize,
        );
        this.speed = random(0.2, 0.5);
        this.glowRadius = random(80, 110);
        this.glowPulse = random(TWO_PI); // random phase so each fish pulses differently
        // Reuse big fish sprites; falls back to shape if unavailable
        this.frames =
            typeof imgBigFishes !== "undefined" && imgBigFishes.length > 0
                ? random(imgBigFishes)
                : null;
    }

    draw() {
        push();
        translate(this.position.x, this.position.y);

        // Visible ambient glow halo
        let pulse = 0.15 * sin(frameCount * 0.05 + this.glowPulse);
        let r = this.glowRadius * (1 + pulse);
        noStroke();
        fill(255, 200, 50, 16);
        ellipse(0, 0, r * 2.6, r * 2.6);
        fill(255, 200, 50, 26);
        ellipse(0, 0, r * 1.6, r * 1.6);

        // Sprite or fallback shape (anglerfish images face right, so use +direction)
        scale(this.direction, 1);
        imageMode(CENTER);
        if (typeof anglerFishImgs !== "undefined" && anglerFishImgs.length === 4) {
            let frameIndex = floor(frameCount / 12) % 4;
            let img = anglerFishImgs[frameIndex];
            let ratio = img.height / img.width;
            image(img, 0, 0, this.width, this.width * ratio);
        } else if (this.frames && this.frames.length === 2) {
            let frameIndex = floor(frameCount / 20) % 2;
            image(this.frames[frameIndex], 0, 0, this.width, this.height);
        } else {
            fill(80, 40, 120);
            ellipse(0, 0, this.width, this.height);
            stroke(255, 200, 50);
            strokeWeight(2);
            line(0, -this.height * 0.35, 0, -this.height);
            fill(255, 220, 80);
            noStroke();
            ellipse(0, -this.height * 0.75, 14, 14);
        }
        pop();
        this.drawScoreText();
    }
}

// Shark: deep sea predator that steals caught items off the hook
class Shark {
    constructor() {
        // Spawn from left or right edge, at a random depth
        this.direction = random() > 0.5 ? 1 : -1;
        this.x = this.direction === 1 ? -150 : width + 150;
        this.y = random(280, height - 80);
        this.speed = random(4.5, 7.5);
        this.width = 170;
        this.height = 85;
        this.done = false;
    }

    update() {
        this.x += this.speed * this.direction;
        if (this.direction === 1 && this.x > width + 170) this.done = true;
        if (this.direction === -1 && this.x < -170) this.done = true;
    }

    // Tight overlap check — matches actual shark body (excludes fins/tail)
    overlaps(px, py, radius) {
        let dx = abs(this.x - px);
        let dy = abs(this.y - py);
        return dx < this.width * 0.4 + radius && dy < this.height * 0.28 + radius;
    }

    draw() {
        push();
        translate(this.x, this.y);
        scale(this.direction, 1); // flip to face movement direction

        if (typeof sharkImgs !== "undefined" && sharkImgs.length === 4) {
            let frameIndex = floor(frameCount / 10) % 4;
            imageMode(CENTER);
            image(sharkImgs[frameIndex], 0, 0, this.width, this.height);
        } else {
            // Fallback: code-drawn shark
            noStroke();
            // Body
            fill(85, 98, 115);
            ellipse(0, 0, this.width, this.height * 0.55);
            // Tail fin
            fill(65, 78, 95);
            triangle(
                -this.width * 0.38,
                0,
                -this.width * 0.68,
                -this.height * 0.38,
                -this.width * 0.68,
                this.height * 0.38,
            );
            // Dorsal fin
            triangle(
                -this.width * 0.05,
                -this.height * 0.28,
                this.width * 0.18,
                -this.height * 0.28,
                this.width * 0.06,
                -this.height * 0.64,
            );
            // Pectoral fin
            fill(72, 84, 100);
            triangle(
                this.width * 0.05,
                this.height * 0.1,
                this.width * 0.22,
                this.height * 0.1,
                this.width * 0.1,
                this.height * 0.4,
            );
            // Lighter belly
            fill(195, 208, 218, 190);
            ellipse(
                this.width * 0.06,
                this.height * 0.09,
                this.width * 0.58,
                this.height * 0.27,
            );
            // Eye
            fill(25, 25, 25);
            ellipse(this.width * 0.33, -this.height * 0.07, 14, 14);
            fill(220, 0, 0, 170);
            ellipse(this.width * 0.33, -this.height * 0.07, 7, 7);
            // Teeth
            fill(235, 235, 235);
            for (let i = 0; i < 5; i++) {
                triangle(
                    this.width * (0.27 + i * 0.055),
                    this.height * 0.14,
                    this.width * (0.3 + i * 0.055),
                    this.height * 0.14,
                    this.width * (0.285 + i * 0.055),
                    this.height * 0.31,
                );
            }
        }
        pop();
    }
}
