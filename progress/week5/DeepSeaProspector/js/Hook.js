class Hook extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.origin = createVector(x, y);
        this.state = HookState.IDLE_SWINGING;
        this.moveSpeed = 5;
        this.attachedItem = null;

        this.angle = 0;
        this.angleVel = 0.05;
        this.length = 50; // 初始线长
        this.maxLength = 500;
    }

    update() {
        if (this.state === HookState.IDLE_SWINGING) {
            // 钟摆运动
            this.angle = (sin(frameCount * this.angleVel) * PI) / 3;
            this.position.x = this.origin.x + sin(this.angle) * this.length;
            this.position.y = this.origin.y + cos(this.angle) * this.length;
        } else if (this.state === HookState.MOVING_DOWN) {
            this.length += this.moveSpeed;
            this.position.x = this.origin.x + sin(this.angle) * this.length;
            this.position.y = this.origin.y + cos(this.angle) * this.length;

            // 触底反弹
            if (
                this.position.y > height ||
                this.position.x < 0 ||
                this.position.x > width
            ) {
                this.retractUp();
            }
        } else if (this.state === HookState.MOVING_UP) {
            // 如果抓到东西，根据重量减速
            let currentSpeed = this.attachedItem
                ? max(1, this.moveSpeed - this.attachedItem.weight)
                : this.moveSpeed;
            this.length -= currentSpeed;
            this.position.x = this.origin.x + sin(this.angle) * this.length;
            this.position.y = this.origin.y + cos(this.angle) * this.length;

            // 如果附着了物品，物品跟着钩子走
            if (this.attachedItem) {
                this.attachedItem.position.x = this.position.x;
                this.attachedItem.position.y = this.position.y;
            }

            if (this.length <= 50) {
                this.state = HookState.IDLE_SWINGING;
                return this.attachedItem; // 返回抓到的物品以便结算
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
