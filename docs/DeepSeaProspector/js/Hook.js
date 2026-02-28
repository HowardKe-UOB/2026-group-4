class Hook extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.origin = createVector(x, y);
        this.state = HookState.IDLE_SWINGING;
        this.moveSpeed = 5;
        this.attachedItem = null;

        // 收钩速度倍率，默认为 1
        this.retractMultiplier = 1;
        // 激光辅助瞄准，默认关闭
        this.hasLaser = false;
        
        this.angle = 0;
        this.angleVel = 0.035;   //这个值控制钩子左右摆动的速度
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
            let originalSpeed = this.attachedItem
                ? max(1, this.moveSpeed - this.attachedItem.weight)
                : this.moveSpeed;
            // 如果有力量药水
            let currentSpeed = originalSpeed * (this.retractMultiplier || 1);
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
        // 绘制激光瞄准线
        if (this.hasLaser && this.state === HookState.IDLE_SWINGING) {
        push();
        // 绿色激光，透明度值125，宽度3
        stroke(0, 255, 0, 125); 
        strokeWeight(3);
        
        // 计算激光终点：从起点出发，沿着当前角度延伸到最大长度
        let laserEndX = this.origin.x + sin(this.angle) * this.maxLength;
        let laserEndY = this.origin.y + cos(this.angle) * this.maxLength;
        
        line(this.origin.x, this.origin.y, laserEndX, laserEndY);
        pop();
        }

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
