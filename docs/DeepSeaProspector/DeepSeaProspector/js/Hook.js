class Hook extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.origin = createVector(x, y);
        this.state = HookState.IDLE_SWINGING;
        this.moveSpeed = 5;
        this.attachedItem = null;

        this.angle = 0;
        this.angleVel = 0.05;
        this.length = 50;
        this.maxLength = 500;
    }

    update() {
        if (this.state === HookState.IDLE_SWINGING) {
            this.angle = (sin(frameCount * this.angleVel) * PI) / 3;
            this.position.x = this.origin.x + sin(this.angle) * this.length;
            this.position.y = this.origin.y + cos(this.angle) * this.length;
        } else if (this.state === HookState.MOVING_DOWN) {
            this.length += this.moveSpeed;
            this.position.x = this.origin.x + sin(this.angle) * this.length;
            this.position.y = this.origin.y + cos(this.angle) * this.length;

            // Bounce back after hitting the bottom
            if (
                this.position.y > height ||
                this.position.x < 0 ||
                this.position.x > width
            ) {
                this.retractUp();
            }
        } else if (this.state === HookState.MOVING_UP) {
            // If an object is caught, slow down according to its weight.
            let currentSpeed = this.attachedItem
                ? max(1, this.moveSpeed - this.attachedItem.weight)
                : this.moveSpeed;
            this.length -= currentSpeed;
            this.position.x = this.origin.x + sin(this.angle) * this.length;
            this.position.y = this.origin.y + cos(this.angle) * this.length;

            // If an object is attached, it will follow the hook.
            if (this.attachedItem) {
                this.attachedItem.position.x = this.position.x;
                this.attachedItem.position.y = this.position.y;
            }

            if (this.length <= 50) {
                this.state = HookState.IDLE_SWINGING;
                return this.attachedItem; // Return the caught items
            }
        }
        return null;
    }

    deployDown() {
        if (this.state === HookState.IDLE_SWINGING) {
            this.state = HookState.MOVING_DOWN;
        }
    }

    retractUp() {
        this.state = HookState.MOVING_UP;
    }

    grabItem(item) {
        this.attachedItem = item;
        this.retractUp();
    }

    draw() {
        stroke(200);
        strokeWeight(2);
        line(this.origin.x, this.origin.y, this.position.x, this.position.y);

        noStroke();
        fill(100);
        arc(this.position.x, this.position.y, 20, 20, 0, PI);

        if (this.attachedItem) {
            this.attachedItem.draw();
        }
    }
}
