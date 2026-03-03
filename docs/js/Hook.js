class Hook extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.origin = createVector(x, y);
        this.state = HookState.IDLE_SWINGING;
        this.moveSpeed = 5;
        this.attachedItem = null;

        this.retractMultiplier = 1;
        this.hasLaser = false;

        this.angle = 0;
        this.angleVel = 0.035;
        this.length = 50;
        this.maxLength = 500;

        this.sprite = hookImg;
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
            let originalSpeed = this.attachedItem
                ? max(1, this.moveSpeed - this.attachedItem.weight)
                : this.moveSpeed;
            let currentSpeed = originalSpeed * (this.retractMultiplier || 1);
            this.length -= currentSpeed;

            // 更新鱼叉中心的位置
            this.position.x = this.origin.x + sin(this.angle) * this.length;
            this.position.y = this.origin.y + cos(this.angle) * this.length;

            // 【核心修改：挂载位移】
            if (this.attachedItem) {
                // 设置尖端偏移量 (鱼叉图片宽高设的是 60，中心到尖端大约是 25~30 像素)
                let tipOffset = 28;

                // 顺着鱼叉当前的角度，把鱼往下/往外推 tipOffset 个像素
                this.attachedItem.position.x =
                    this.position.x + sin(this.angle) * tipOffset;
                this.attachedItem.position.y =
                    this.position.y + cos(this.angle) * tipOffset;
            }

            if (this.length <= 50) {
                this.state = HookState.IDLE_SWINGING;
                return this.attachedItem;
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
        // 1. 绘制激光瞄准线 (保持不变)
        if (this.hasLaser && this.state === HookState.IDLE_SWINGING) {
            push();
            stroke(0, 255, 0, 125);
            strokeWeight(3);
            let laserEndX = this.origin.x + sin(this.angle) * this.maxLength;
            let laserEndY = this.origin.y + cos(this.angle) * this.maxLength;
            line(this.origin.x, this.origin.y, laserEndX, laserEndY);
            pop();
        }

        // 2. 绘制绳子 (保持不变)
        stroke(85, 55, 35);
        strokeWeight(3);
        line(this.origin.x, this.origin.y, this.position.x, this.position.y);

        // 3. 【核心修改】绘制带旋转角度的鱼叉
        push();
        // 将画布原点移动到绳子末端
        translate(this.position.x, this.position.y);

        // 计算当前绳子的真实角度
        let lineAngle = atan2(
            this.position.y - this.origin.y,
            this.position.x - this.origin.x,
        );

        // 旋转图片：因为你的原图是指向左上角的，我们需要加上 135度 (radians(135)) 的角度补偿
        // 这样鱼叉的尖端就会永远顺着绳子的方向了
        rotate(lineAngle + radians(135));

        imageMode(CENTER);
        if (this.sprite) {
            // 你可以根据需要调整 60, 60 这两个数字来改变鱼叉的大小
            image(this.sprite, 0, 0, 80, 80);
        }
        pop();

        // 4. 绘制被抓到的物品 (保持不变)
        if (this.attachedItem) {
            this.attachedItem.draw();
        }
    }
}
