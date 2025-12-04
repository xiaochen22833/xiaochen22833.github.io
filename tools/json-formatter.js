/**
 * JSON 格式化与校验核心逻辑
 */

// 获取DOM元素
const jsonInput = document.getElementById('jsonInput');
const statusMessage = document.getElementById('statusMessage');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const errorDetails = document.getElementById('errorDetails');

// 格式化 JSON
function formatJson() {
    clearStatus();
    const input = jsonInput.value.trim();

    if (!input) {
        showStatus('error', '请输入 JSON 字符串！');
        return;
    }

    try {
        const parsedJson = JSON.parse(input);
        const formattedJson = JSON.stringify(parsedJson, null, 4); // 4个空格缩进
        jsonInput.value = formattedJson;
        showStatus('success', 'JSON 格式化成功！');
    } catch (e) {
        showStatus('error', 'JSON 格式不正确！', e.message);
        // 尝试定位错误行 (简单实现，仅对常见错误消息有效)
        const match = e.message.match(/at position (\d+)/) || e.message.match(/line (\d+) column (\d+)/);
        if (match) {
            let errorPos = parseInt(match[1]);
            let errorMessage = `错误信息: ${e.message}\n尝试定位：`;

            // 在textarea中插入一个标记（例如^)
            let originalText = jsonInput.value;
            let beforeError = originalText.substring(0, errorPos);
            let afterError = originalText.substring(errorPos);
            jsonInput.value = beforeError + '←这里可能存在问题' + afterError;
            
            // 滚动到错误位置
            jsonInput.scrollTop = jsonInput.scrollHeight * (errorPos / originalText.length);

            errorDetails.innerText = errorMessage + '\n请检查标记位置。';
        }
    }
}

// 压缩 JSON
function compressJson() {
    clearStatus();
    const input = jsonInput.value.trim();

    if (!input) {
        showStatus('error', '请输入 JSON 字符串！');
        return;
    }

    try {
        const parsedJson = JSON.parse(input);
        const compressedJson = JSON.stringify(parsedJson); // 不带缩进参数即为压缩
        jsonInput.value = compressedJson;
        showStatus('success', 'JSON 压缩成功！');
    } catch (e) {
        showStatus('error', 'JSON 格式不正确，无法压缩！', e.message);
    }
}

// 清空输入框和状态
function clearInput() {
    jsonInput.value = '';
    clearStatus();
}

// 复制结果
function copyResult() {
    const text = jsonInput.value.trim();
    if (!text) {
        showToast('内容为空，无法复制！');
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        showToast('JSON 内容已复制到剪贴板！');
    }).catch(err => {
        console.error('无法复制', err);
        // 降级处理
        jsonInput.select();
        document.execCommand("copy");
        showToast('JSON 内容已复制到剪贴板！');
    });
}

// 显示状态消息
function showStatus(type, message, details = '') {
    statusMessage.style.display = 'flex';
    statusText.innerText = message;
    errorDetails.style.display = 'none';

    if (type === 'success') {
        statusMessage.className = 'status-message success';
        statusIcon.className = 'fa-solid fa-circle-check';
    } else if (type === 'error') {
        statusMessage.className = 'status-message error';
        statusIcon.className = 'fa-solid fa-circle-xmark';
        if (details) {
            errorDetails.style.display = 'block';
            errorDetails.innerText = details;
        }
    }
}

// 清除状态消息
function clearStatus() {
    statusMessage.style.display = 'none';
    statusText.innerText = '';
    errorDetails.innerText = '';
}

// 复制文本到剪贴板 (通用提示框)
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 页面加载时自动校验一次 (如果文本框有内容)
window.onload = () => {
    // 示例 JSON 数据
    const exampleJson = `{
    "name": "张三",
    "age": 30,
    "isStudent": false,
    "courses": [
        {"title": "数学", "score": 95},
        {"title": "英语", "score": 88}
    ],
    "address": {
        "city": "北京",
        "zipCode": "100000"
    },
    "notes": null
}`;
    jsonInput.value = exampleJson;
    formatJson(); // 初始时自动格式化一次
};

// 监听输入框变化，实时校验 (可选，如果觉得影响性能可以去掉)
let validationTimeout;
jsonInput.addEventListener('input', () => {
    clearTimeout(validationTimeout);
    validationTimeout = setTimeout(() => {
        // 尝试自动校验，但不自动格式化或压缩
        const input = jsonInput.value.trim();
        if (input) {
            try {
                JSON.parse(input);
                showStatus('success', 'JSON 格式正确！');
            } catch (e) {
                showStatus('error', 'JSON 格式不正确！', e.message);
            }
        } else {
            clearStatus();
        }
    }, 500); // 延迟0.5秒校验
});
