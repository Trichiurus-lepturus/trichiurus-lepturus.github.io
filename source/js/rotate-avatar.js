document.addEventListener('DOMContentLoaded', () => {
    const image = document.querySelector('.site-author-image');
    let isHovering = false;

    // 可调参数
    const omega_max = 35;
    const acceleration = 0.5;
    const max_orientation = 360;

    // 运行时变量
    let orientation = 0;
    let omega_now = 0;
    let state = '静止';
    let currentDeceleration = 0;

    // 鼠标事件监听
    image.addEventListener('mouseenter', () => isHovering = true);
    image.addEventListener('mouseleave', () => isHovering = false);

    // 减速计算核心算法
    function calculateDeceleration() {
        const v = omega_now;
        if (v === 0) return 0;

        // 计算最小需求角度
        const minDelta = (v ** 2) / (6 * acceleration);
        let baseDelta = (max_orientation - orientation % max_orientation) % max_orientation;
        baseDelta = baseDelta === 0 ? max_orientation : baseDelta;

        // 寻找最小n值
        let n = 0;
        if (baseDelta < minDelta) {
            const needed = minDelta - baseDelta;
            n = Math.ceil(needed / max_orientation);
        }

        // 计算最终参数
        const totalDelta = baseDelta + n * max_orientation;
        return Math.min((v ** 2) / (2 * totalDelta), 3 * acceleration);
    }

    // 动画帧循环
    function update() {
        const prevState = state;

        // 状态转移逻辑
        if (isHovering) {
            state = omega_now < omega_max ? '加速' : '匀速';
        } else {
            if (['加速', '匀速'].includes(state)) {
                state = '减速';
                currentDeceleration = calculateDeceleration();
            } else if (state === '减速' && omega_now === 0) {
                // orientation = 0;
                state = '静止';
            }
        }

        // 状态行为执行
        switch (state) {
            case '加速':
                omega_now = Math.min(omega_now + acceleration, omega_max);
                orientation = (orientation + omega_now) % max_orientation;
                break;

            case '匀速':
                orientation = (orientation + omega_now) % max_orientation;
                break;

            case '减速':
                omega_now = Math.max(omega_now - currentDeceleration, 0);
                orientation = (orientation + omega_now) % max_orientation;
                break;

            case '静止':
                orientation = (orientation + !!orientation) % max_orientation | 0; // |0 确保结果为整数
                break;
        }

        // 应用旋转效果
        image.style.transform = `rotate(${orientation}deg)`;
        requestAnimationFrame(update);
    }

    // 启动动画循环
    requestAnimationFrame(update);
});
