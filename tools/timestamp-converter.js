/**
 * 增强版时间戳转换逻辑
 */

let isRunning = true;
let currentUnit = 's'; // 's' 或 'ms'
const currentTSDisplay = document.getElementById('currentTS');
const stopBtn = document.getElementById('stopBtn');
const currentUnitText = document.getElementById('currentUnitText');

// 1. 实时更新当前时间戳
function updateClock() {
    if (!isRunning) return;
    const now = new Date().getTime();
    if (currentUnit === 's') {
        currentTSDisplay.innerText = Math.floor(now / 1000);
    } else {
        currentTSDisplay.innerText = now;
    }
}

let timer = setInterval(updateClock, 1000);

// 2. 停止/开始切换
function toggleTimer() {
    isRunning = !isRunning;
    if (isRunning) {
        stopBtn.innerHTML = '<i class="fa-solid fa-stop"></i> 停止';
        stopBtn.classList.remove('btn-green');
        stopBtn.classList.add('btn-red');
        timer = setInterval(updateClock, currentUnit === 's' ? 1000 : 50);
    } else {
        stopBtn.innerHTML = '<i class="fa-solid fa-play"></i> 开始';
        stopBtn.classList.add('btn-green'); // 如果你想加个绿色类
        stopBtn.classList.remove('btn-red');
        clearInterval(timer);
    }
}

// 3. 切换单位
function toggleUnit() {
    currentUnit = (currentUnit === 's') ? 'ms' : 's';
    currentUnitText.innerText = (currentUnit === 's') ? '秒(s)' : '毫秒(ms)';
    
    // 切换后立即重置定时器频率
    if (isRunning) {
        clearInterval(timer);
        timer = setInterval(updateClock, currentUnit === 's' ? 1000 : 50);
    }
    updateClock();
}

// 4. 复制当前
function copyCurrent() {
    const val = currentTSDisplay.innerText;
    navigator.clipboard.writeText(val);
    alert('已复制: ' + val);
}

// 5. 时间戳转日期
function convertTsToDate() {
    const input = document.getElementById('tsToDate_input').value.trim();
    const unit = document.getElementById('tsToDate_unit').value;
    const resultField = document.getElementById('tsToDate_result');

    if (!input) return;

    let ts = parseInt(input);
    if (unit === 's') ts *= 1000;

    const date = new Date(ts);
    if (isNaN(date.getTime())) {
        resultField.value = "无效的时间戳";
    } else {
        resultField.value = formatDate(date);
    }
}

// 6. 日期转时间戳
function convertDateToTs() {
    const input = document.getElementById('dateToTs_input').value.trim();
    const unit = document.getElementById('dateToTs_unit').value;
    const resultField = document.getElementById('dateToTs_result');

    if (!input) return;

    const date = new Date(input.replace(/-/g, '/')); // 兼容处理
    if (isNaN(date.getTime())) {
        resultField.value = "无效的日期格式";
    } else {
        let ts = date.getTime();
        if (unit === 's') ts = Math.floor(ts / 1000);
        resultField.value = ts;
    }
}

// 辅助函数：格式化日期
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

// 页面初始化
window.onload = () => {
    // 默认在输入框填入当前时间
    const now = new Date();
    document.getElementById('tsToDate_input').value = Math.floor(now.getTime() / 1000);
    document.getElementById('dateToTs_input').value = formatDate(now);
};
