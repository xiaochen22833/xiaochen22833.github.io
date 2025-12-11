/**
 * 二维码生成器核心逻辑
 */

// 获取DOM元素
const qrContentInput = document.getElementById('qrContentInput');
const fgColorInput = document.getElementById('fgColorInput');
const bgColorInput = document.getElementById('bgColorInput');
const qrSizeInput = document.getElementById('qrSizeInput');
const qrContentError = document.getElementById('qrContentError');
const qrCanvas = document.getElementById('qr-canvas');

// 初始化 qrious 实例
let qr = new QRious({
    element: qrCanvas,
    value: 'Hello, My Tools!', // 默认内容
    size: 250,
    foreground: '#000000',
    background: '#ffffff',
    level: 'H' // 纠错等级 H (高)
});

// 生成二维码
function generateQrCode() {
    qrContentError.innerText = '';
    const content = qrContentInput.value.trim();
    const fgColor = fgColorInput.value;
    const bgColor = bgColorInput.value;
    const size = parseInt(qrSizeInput.value, 10);

    if (!content) {
        qrContentError.innerText = '请输入要生成二维码的内容！';
        qr.value = ''; // 清空二维码
        return;
    }

    if (isNaN(size) || size < 50 || size > 1000) {
        qrContentError.innerText = '尺寸必须是 50-1000 之间的数字！';
        return;
    }

    qr.value = content;
    qr.size = size;
    qr.foreground = fgColor;
    qr.background = bgColor;
    
    // qrious 没有直接的update方法，修改属性后会自动重绘，但为了确保，可以再触发一次
    // qr = new QRious({ ...qr, value: content, size: size, foreground: fgColor, background: bgColor });
    // 上述方法会创建新的实例，下面的方式更直接
    qr.set({ // set方法可以触发更新
        value: content,
        size: size,
        foreground: fgColor,
        background: bgColor
    });
    
    showToast('二维码已更新！');
}

// 下载二维码
function downloadQrCode() {
    const content = qrContentInput.value.trim();
    if (!content) {
        showToast('内容为空，请先生成二维码！');
        return;
    }

    const image = qrCanvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.download = `qrcode_${Date.now()}.png`; // 以时间戳命名文件
    link.href = image;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('二维码已下载！');
}

// 清空输入框并重置二维码
function clearInput() {
    qrContentInput.value = '';
    qrContentError.innerText = '';
    fgColorInput.value = '#000000';
    bgColorInput.value = '#ffffff';
    qrSizeInput.value = '250';
    qr.value = ''; // 清空内容
    qr.set({ // 重置二维码样式
        value: '', 
        size: 250, 
        foreground: '#000000', 
        background: '#ffffff'
    });
    showToast('已清空所有内容和重置二维码。');
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

// 页面加载时执行
window.onload = () => {
    qrContentInput.value = 'https://www.google.com'; // 默认填充一个示例URL
    generateQrCode(); // 自动生成一次
};

// 监听输入变化，实时更新 (可以根据需要调整是否实时)
let generateTimeout;
qrContentInput.addEventListener('input', () => {
    clearTimeout(generateTimeout);
    generateTimeout = setTimeout(generateQrCode, 500); // 延迟0.5秒更新
});
fgColorInput.addEventListener('change', generateQrCode);
bgColorInput.addEventListener('change', generateQrCode);
qrSizeInput.addEventListener('change', generateQrCode); // size改变时也实时更新
