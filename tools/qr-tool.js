/**
 * 二维码生成与解析逻辑
 */

// --- 选项卡切换 ---
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tab === 'generate') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('tab-generate').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('tab-decode').classList.add('active');
    }
}

// --- 生成逻辑 (QRious) ---
const qr = new QRious({
    element: document.getElementById('qr-canvas'),
    level: 'H',
    size: 260
});

function updateQR() {
    const content = document.getElementById('gen-content').value;
    const fg = document.getElementById('gen-fg').value;
    const bg = document.getElementById('gen-bg').value;
    const size = document.getElementById('gen-size').value;

    if (!content) return;

    qr.set({
        value: content,
        foreground: fg,
        background: bg,
        size: parseInt(size)
    });
}

function downloadQR() {
    const canvas = document.getElementById('qr-canvas');
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL();
    link.click();
}

// --- 解析逻辑 (jsQR) ---
function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // 显示预览
            const preview = document.getElementById('preview-img');
            preview.src = img.src;
            preview.style.display = 'inline-block';

            // 执行解析
            decodeImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function decodeImage(img) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
    });

    const resultArea = document.getElementById('decode-result-area');
    const resultText = document.getElementById('result-text');

    resultArea.style.display = 'block';
    if (code) {
        resultText.innerText = code.data;
        resultText.style.color = "#333";
    } else {
        resultText.innerText = "未识别到有效的标准二维码。如果是微信小程序码（菊花状），暂不支持解析。";
        resultText.style.color = "#e74c3c";
    }
}

// 拖拽支持
const dropZone = document.getElementById('drop-zone');
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#2196f3';
});
dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#ccc';
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    const files = e.dataTransfer.files;
    if (files.length) {
        document.getElementById('file-input').files = files;
        handleFileUpload({files: files});
    }
});

function copyDecodedText() {
    const text = document.getElementById('result-text').innerText;
    navigator.clipboard.writeText(text).then(() => alert('已复制到剪贴板'));
}

// 初始化
window.onload = updateQR;
