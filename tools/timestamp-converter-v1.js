/**
 * 时间戳转换器核心逻辑
 */

// 获取DOM元素
const timestampInput = document.getElementById('timestampInput');
const datetimeInput = document.getElementById('datetimeInput');
const timestampError = document.getElementById('timestampError');
const datetimeError = document.getElementById('datetimeError');

const resultTimestampMs = document.getElementById('resultTimestampMs');
const resultTimestampSec = document.getElementById('resultTimestampSec');
const resultDatetimeMs = document.getElementById('resultDatetimeMs');
const resultDatetimeSec = document.getElementById('resultDatetimeSec');

// 辅助函数：格式化日期为 YYYY-MM-DD HH:mm:ss.SSS
function formatDatetimeMs(date) {
    if (!date || isNaN(date.getTime())) return '--';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

// 辅助函数：格式化日期为 YYYY-MM-DD HH:mm:ss
function formatDatetimeSec(date) {
    if (!date || isNaN(date.getTime())) return '--';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


// 时间戳转日期
function convertTimestampToDatetime() {
    timestampError.innerText = '';
    datetimeError.innerText = '';
    const timestampStr = timestampInput.value.trim();

    if (!timestampStr) {
        timestampError.innerText = '请输入时间戳';
        resetResults();
        return;
    }

    let timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) {
        timestampError.innerText = '时间戳格式不正确，请输入纯数字';
        resetResults();
        return;
    }

    // 判断是秒还是毫秒，通常时间戳在 10 位是秒，13 位是毫秒
    let isMs = timestampStr.length === 13;
    let finalTimestamp = isMs ? timestamp : timestamp * 1000;

    const date = new Date(finalTimestamp);

    if (isNaN(date.getTime())) {
        timestampError.innerText = '时间戳超出了有效范围';
        resetResults();
        return;
    }

    resultTimestampMs.innerText = finalTimestamp;
    resultTimestampSec.innerText = Math.floor(finalTimestamp / 1000);
    resultDatetimeMs.innerText = formatDatetimeMs(date);
    resultDatetimeSec.innerText = formatDatetimeSec(date);
}

// 日期转时间戳
function convertDatetimeToTimestamp() {
    timestampError.innerText = '';
    datetimeError.innerText = '';
    const datetimeStr = datetimeInput.value.trim();

    if (!datetimeStr) {
        datetimeError.innerText = '请输入日期时间字符串';
        resetResults();
        return;
    }

    // 尝试使用多种常见格式解析
    let date = new Date(datetimeStr);

    // 针对 Safari/Firefox 不支持 yyyy-MM-dd HH:mm:ss.SSS 格式的兼容
    // 如果直接解析失败，尝试替换T
    if (isNaN(date.getTime())) {
        const isoLikeStr = datetimeStr.replace(' ', 'T');
        date = new Date(isoLikeStr);
    }
    // 再次尝试处理更宽松的格式，例如 yyyy/MM/dd
    if (isNaN(date.getTime())) {
        const standardStr = datetimeStr.replace(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/, '$1/$2/$3');
        date = new Date(standardStr);
    }


    if (isNaN(date.getTime())) {
        datetimeError.innerText = '日期时间格式无法识别，请尝试 YYYY-MM-DD HH:mm:ss[.SSS] 或 YYYY/MM/DD 等标准格式';
        resetResults();
        return;
    }

    const msTimestamp = date.getTime();
    const secTimestamp = Math.floor(msTimestamp / 1000);

    resultTimestampMs.innerText = msTimestamp;
    resultTimestampSec.innerText = secTimestamp;
    resultDatetimeMs.innerText = formatDatetimeMs(date);
    resultDatetimeSec.innerText = formatDatetimeSec(date);
}

// 清空所有字段和结果
function resetFields() {
    timestampInput.value = '';
    datetimeInput.value = '';
    timestampError.innerText = '';
    datetimeError.innerText = '';
    resetResults();
}

// 清空结果显示
function resetResults() {
    resultTimestampMs.innerText = '--';
    resultTimestampSec.innerText = '--';
    resultDatetimeMs.innerText = '--';
    resultDatetimeSec.innerText = '--';
}

// 复制文本到剪贴板
function copyText(elementId) {
    const text = document.getElementById(elementId).innerText;
    if (text === '--') return;

    navigator.clipboard.writeText(text).then(() => {
        showToast(`已复制: ${text}`);
    }).catch(err => {
        console.error('无法复制', err);
        // 降级处理（如果不支持 clipboard API）
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showToast(`已复制: ${text}`);
    });
}

// 显示提示框
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 页面加载时，尝试用当前时间填充
window.onload = () => {
    const now = new Date();
    timestampInput.value = now.getTime(); // 默认填充当前毫秒时间戳
    convertTimestampToDatetime(); // 自动转换一次
};

// 监听输入框变化，实时转换 (可选，如果觉得影响性能可以去掉)
let timestampTimeout;
timestampInput.addEventListener('input', () => {
    clearTimeout(timestampTimeout);
    timestampTimeout = setTimeout(convertTimestampToDatetime, 500); // 延迟0.5秒转换
});

let datetimeTimeout;
datetimeInput.addEventListener('input', () => {
    clearTimeout(datetimeTimeout);
    datetimeTimeout = setTimeout(convertDatetimeToTimestamp, 500); // 延迟0.5秒转换
});
