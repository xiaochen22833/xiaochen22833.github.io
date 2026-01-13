// 移除已有的 favicon 链接
const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
if (existingLinks.length === 0) {
    // 添加新的 favicon
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.type = 'image/png';
    newLink.href = './assets/icons/tool-ico3.png';

    document.head.appendChild(newLink);
}

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;

// 鼠标状态
const mouse = { x: -100, y: -100 };

// 天气状态枚举
const WEATHER_TYPES = ['SUNNY', 'RAIN', 'SNOW'];
let currentWeatherIndex = localStorage.getItem('WeatherIndex') || 2;

// 粒子数组
let particles = [];

// 调整画布大小
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
}

// 监听鼠标移动
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('resize', resize);

// ---------------------- 粒子类定义 ----------------------

class Particle {
    constructor() {
        this.reset();
    }
    reset() {}
    update() {}
    draw() {}
}

// 1. 晴天粒子 (漂浮的光斑)
class SunnyParticle extends Particle {
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 20 + 10;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // 鼠标排斥/互动效果
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
            this.x -= dx * 0.02;
            this.y -= dy * 0.02;
        }

        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// 2. 雨天粒子 (下落的线条)
class RainParticle extends Particle {
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height; // 从上方随机位置开始
        this.length = Math.random() * 20 + 10;
        this.speed = Math.random() * 10 + 5;
        this.wind = 0;
    }
    update() {
        // 鼠标风力影响
        const dx = mouse.x - this.x;
        const dist = Math.abs(dx);
        if (dist < 200) {
            this.wind = (dx > 0 ? -1 : 1) * (1 - dist/200) * 2;
        } else {
            this.wind *= 0.9; // 慢慢恢复
        }

        this.y += this.speed;
        this.x += this.wind;

        if (this.y > height) {
            this.y = -this.length;
            this.x = Math.random() * width;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.wind * 2, this.y + this.length);
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// 3. 雪天粒子 (飘落的圆点)
class SnowParticle extends Particle {
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height;
        this.size = Math.random() * 3 + 1;
        this.speed = Math.random() * 2 + 0.5;
        this.swing = Math.random() * 0.02;
        this.swingStep = Math.random() * Math.PI;
    }
    update() {
        this.swingStep += this.swing;
        let windForceX = Math.sin(this.swingStep);

        // 鼠标排斥
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
            const force = (150 - dist) / 150;
            windForceX -= (dx / dist) * force * 5;
            this.y -= (dy / dist) * force * 2; // 甚至会被鼠标向上推一点
        }

        this.x += windForceX;
        this.y += this.speed;

        if (this.y > height) {
            this.y = -5;
            this.x = Math.random() * width;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }
}

// ---------------------- 控制逻辑 ----------------------

function initParticles() {
    particles = [];
    const type = WEATHER_TYPES[currentWeatherIndex];
    let count = 0;
    
    if (type === 'SUNNY') count = 30;
    else if (type === 'RAIN') count = 150;
    else if (type === 'SNOW') count = 100;

    for (let i = 0; i < count; i++) {
        if (type === 'SUNNY') particles.push(new SunnyParticle());
        else if (type === 'RAIN') particles.push(new RainParticle());
        else if (type === 'SNOW') particles.push(new SnowParticle());
    }
}

function drawBackground() {
    // 绘制背景渐变色
    const type = WEATHER_TYPES[currentWeatherIndex];
    let gradient = ctx.createLinearGradient(0, 0, 0, height);

    if (type === 'SUNNY') {
        gradient.addColorStop(0, '#4facfe');
        gradient.addColorStop(1, '#00f2fe');
    } else if (type === 'RAIN') {
        gradient.addColorStop(0, '#203a43');
        gradient.addColorStop(1, '#2c5364');
    } else if (type === 'SNOW') {
        gradient.addColorStop(0, '#83a4d4');
        gradient.addColorStop(1, '#b6fbff');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
}

function animate() {
    drawBackground();
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}

// 切换按钮逻辑
let weatherBtn = document.getElementById('weather-toggle');
if (weatherBtn) {
    weatherBtn.addEventListener('click', () => {
        currentWeatherIndex = (currentWeatherIndex + 1) % WEATHER_TYPES.length;
        localStorage.setItem('WeatherIndex', currentWeatherIndex); // 保存
        initParticles();
    });
}

// 启动
resize();
animate();
