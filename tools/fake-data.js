/**
 * 虚拟数据生成核心逻辑
 */

// 常用姓氏
const SURNAMES = "李王张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆灏崔顾侯邵孟龙万段雷钱汤尹黎易常武乔贺赖龚文";
// 常用名字字符
const NAMES = "伟刚勇军磊强军平保东文辉力明永健世广志义兴良海山仁波宁贵福生龙元全国胜学祥才发武新利清飞彬富顺信子杰涛昌成康星光天达安岩中茂进林有坚和彪博诚先敬震振壮会思群豪心邦承乐绍功松善厚庆磊民友裕河哲江超浩亮政谦亨奇固之轮翰朗伯宏言若鸣朋斌梁栋维启克伦翔旭鹏泽晨辰士以建家致树炎德行时泰盛雄琛钧冠策腾楠榕风航弘";

// 手机号前段
const MOBILE_PREFIX = ['130','131','132','133','135','136','137','138','139','150','151','152','153','155','156','157','158','159','170','176','177','178','180','181','182','183','184','185','186','187','188','189'];

// 简单的区域码示例 (实际有几千个，这里只列几个做演示)
const AREA_CODES = ['110101', '110102', '110105', '310101', '310104', '440103', '440304', '330102', '320102', '510104'];

// 辅助函数：生成随机整数
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 辅助函数：随机从数组取一项
function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// 1. 生成姓名
function generateName() {
    const surname = SURNAMES[randomInt(0, SURNAMES.length - 1)];
    const nameLen = randomInt(1, 2); // 名字长度 1 或 2
    let name = "";
    for (let i = 0; i < nameLen; i++) {
        name += NAMES[randomInt(0, NAMES.length - 1)];
    }
    return surname + name;
}

// 2. 生成手机号
function generateMobile() {
    const prefix = randomPick(MOBILE_PREFIX);
    let suffix = "";
    for (let i = 0; i < 8; i++) {
        suffix += randomInt(0, 9);
    }
    return prefix + suffix;
}

// 3. 生成身份证号 (符合 ISO 7064:1983.MOD 11-2 校验规则)
function generateIdCard() {
    const areaCode = randomPick(AREA_CODES);
    
    // 随机生日 (1970 - 2003)
    const year = randomInt(1970, 2003);
    let month = randomInt(1, 12);
    month = month < 10 ? '0' + month : month;
    let day = randomInt(1, 28); // 简单处理，统一直到28号
    day = day < 10 ? '0' + day : day;
    const birthday = `${year}${month}${day}`;

    // 随机顺序码 (最后一位奇数男，偶数女)
    let sequence = "";
    for(let i=0; i<3; i++) sequence += randomInt(0, 9);

    const base = areaCode + birthday + sequence;

    // 计算校验码
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
        sum += parseInt(base[i]) * weights[i];
    }
    const mod = sum % 11;
    const checkCode = checkCodes[mod];

    return base + checkCode;
}

// 4. 生成银行卡号 (符合 Luhn 算法)
function generateBankCard() {
    // 常见银行 BIN 码
    const prefixes = ['622202', '622848', '622700', '622262', '621661']; 
    const prefix = randomPick(prefixes);
    
    // 生成中间位 (凑够 18 位，不含最后校验位)
    let content = prefix;
    while (content.length < 18) { // 这里生成 19 位卡号的前 18 位
        content += randomInt(0, 9);
    }

    // Luhn 算法计算校验位
    let arr = content.split('').reverse().map(Number);
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        let n = arr[i];
        if (i % 2 == 0) { // 从右向左，偶数位（对应原来的奇数位，因为reverse了） * 2
            n *= 2;
            if (n > 9) n -= 9;
        }
        sum += n;
    }
    
    let checkDigit = (10 - (sum % 10)) % 10;
    
    return content + checkDigit;
}

// 5. 生成社会统一信用代码
function generateFakeSocialCreditCode() {
    const charset = '0123456789ABCDEFGHJKLMNPQRTUWXY'; // 31个合法字符
    const weights = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];

    // 1. 前2位：常用示例（91=企业，52=社会组织，12=机关法人等）
    const first2 = '91'; // 企业类最常见

    // 2. 第3-8位：行政区划码（这里固定用北京市东城区 110101）
    const regionCode = '110101';

    // 3. 第9-17位：9位随机主体标识（使用合法字符）
    let body9 = '';
    for (let i = 0; i < 9; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        body9 += charset[randomIndex];
    }

    // 前17位拼接
    const code17 = first2 + regionCode + body9;

    // 4. 计算校验码（第18位）
    let sum = 0;
    for (let i = 0; i < 17; i++) {
        const char = code17[i];
        const index = charset.indexOf(char);
        if (index === -1) throw new Error('Invalid character in code');
        sum += index * weights[i];
    }

    const checkCodeIndex = (31 - (sum % 31)) % 31;
    const checkChar = charset[checkCodeIndex];

    return code17 + checkChar;
}

// ----------------- 界面交互 -----------------

function generateAll() {
    // 增加一点随机动画延迟感
    const elements = ['val-name', 'val-mobile', 'val-idcard', 'val-bank', 'val-socialCode'];
    elements.forEach(id => {
        document.getElementById(id).style.opacity = 0.5;
    });

    setTimeout(() => {
        document.getElementById('val-name').innerText = generateName();
        document.getElementById('val-mobile').innerText = generateMobile();
        document.getElementById('val-idcard').innerText = generateIdCard();
        document.getElementById('val-bank').innerText = generateBankCard();
        document.getElementById('val-socialCode').innerText = generateFakeSocialCreditCode();

        elements.forEach(id => {
            document.getElementById(id).style.opacity = 1;
        });
    }, 150);
}

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

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 页面加载时自动生成一次
window.onload = generateAll;
