// ตัวแปรเก็บข้อมูล
let currentCategory = 'ดอกไม้';
let currentPage = 1;
let totalPages = 3;
let selectedFlowerItem = null; 

// ---------------- ส่วนระบบเปลี่ยนหมวดหมู่และเปลี่ยนหน้า ---------------- //

function changeCategory(categoryName, tabElement) {
    currentCategory = categoryName;
    currentPage = 1; 
    updatePageText();

    let allTabs = document.querySelectorAll('.tab');
    allTabs.forEach(tab => tab.classList.remove('active'));
    tabElement.classList.add('active');
}

function changePage(direction) {
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    updatePageText();
}

function updatePageText() {
    document.getElementById('page-text').innerText = currentPage + '/' + totalPages;
}

// ---------------- ส่วนระบบจัดช่อดอกไม้ ---------------- //

function selectFlower(flower, element) {
    selectedFlowerItem = flower;
    
    let allBoxes = document.querySelectorAll('.item-box');
    allBoxes.forEach(box => box.classList.remove('selected'));
    element.classList.add('selected');
}

// ฟังก์ชันแสดงแจ้งเตือน Popup ด้านบน
function showNotification(message) {
    let notif = document.createElement('div');
    notif.className = 'custom-notification';
    notif.innerText = message;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.classList.add('show');
    }, 10);

    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

function placeFlower(slot) {
    if (!selectedFlowerItem) {
        showNotification("อย่าลืมเลือกดอกไม้จากกล่องด้านล่างก่อนนะครับ!");
        return;
    }
    
    let fallbackItem = selectedFlowerItem.split(/[\/\\]/).pop();
    slot.innerHTML = `<img src="${selectedFlowerItem}" onerror="this.onerror=null; this.src='${fallbackItem}';" style="width: 80%; height: 80%; object-fit: contain; pointer-events: none;">`;
    
    slot.style.animation = 'none';
    slot.style.border = 'none';
    slot.style.backgroundColor = 'transparent';
    
    saveBouquet();
}

function clearAllFlowers() {
    for (let i = 1; i <= 5; i++) {
        let slot = document.getElementById('slot' + i);
        if (slot) {
            slot.innerHTML = '';
            slot.style.animation = 'blink 1.5s infinite';
            slot.style.border = '2px dashed #FF9EB5';
            slot.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        }
    }
    
    // ยกเลิกการเลือกดอกไม้ด้วย เพื่อให้เริ่มจัดใหม่จริงๆ
    selectedFlowerItem = null;
    let allBoxes = document.querySelectorAll('.item-box');
    allBoxes.forEach(box => box.classList.remove('selected'));
    
    saveBouquet();
    showNotification("ล้างช่อดอกไม้เรียบร้อยแล้ว");
}

function saveBouquet() {
    let bouquetData = {};
    for (let i = 1; i <= 5; i++) {
        let slot = document.getElementById('slot' + i);
        if (slot && slot.innerHTML.trim() !== '') {
            bouquetData['slot' + i] = slot.innerHTML;
        }
    }
    localStorage.setItem('bouquetState', JSON.stringify(bouquetData));
}

function loadBouquet() {
    let data = localStorage.getItem('bouquetState');
    if (data) {
        let bouquetData = JSON.parse(data);
        for (let i = 1; i <= 5; i++) {
            let slot = document.getElementById('slot' + i);
            if (slot && bouquetData['slot' + i]) {
                let savedContent = bouquetData['slot' + i];
                
                // ดึงแค่ชื่อไฟล์ออกมา แล้วบังคับให้ชี้ไปที่โฟลเดอร์ images/ เสมอ (แก้ปัญหา URL พังทุกรูปแบบ)
                savedContent = savedContent.replace(/src=["']([^"']+)["']/gi, function(match, url) {
                    let filename = url.split(/[\/\\]/).pop(); // ตัด path ที่พังทิ้งทั้งหมด รองรับทั้ง Windows (\) และ Mac (/)
                    return `src="images/${filename}" onerror="this.onerror=null; this.src='${filename}';"`;
                });
                
                slot.innerHTML = savedContent;
                slot.style.animation = 'none';
                slot.style.border = 'none';
                slot.style.backgroundColor = 'transparent';
            }
        }
    }
}

// โหลดข้อมูลช่อดอกไม้ทุกครั้งที่เปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', loadBouquet);

function goToMessagePage() {
    for (let i = 1; i <= 5; i++) {
        let slot = document.getElementById('slot' + i);
        if (!slot || slot.innerHTML.trim() === '') {
            showNotification("กรุณาเลือกดอกไม้ให้ครบ");
            return;
        }
    }
    window.location.href = 'message.html';
}

// ---------------- ส่วนหน้าเขียนข้อความ (message.html) ---------------- //

const msgInput = document.getElementById('short-msg');
const previewText = document.getElementById('preview-text');

// ตรวจสอบว่าเปิดอยู่หน้า message.html หรือไม่ (กันโค้ดพังในหน้าอื่น)
if (msgInput && previewText) {
    // โหลดข้อความที่เคยพิมพ์ไว้
    let savedShort = localStorage.getItem('shortMessage');
    if (savedShort) {
        msgInput.value = savedShort;
        previewText.innerText = '"' + savedShort + '"';
    }

    // ให้ทำงานทุกครั้งที่มีการพิมพ์
    msgInput.addEventListener('input', function() {
        let text = this.value.trim();
        if (text === '') {
            previewText.innerText = '"ข้อความจะปรากฏตรงนี้"';
        } else {
            previewText.innerText = '"' + text + '"';
        }
        localStorage.setItem('shortMessage', text);
    });
}

function goToLetterPage() {
    const msgInput = document.getElementById('short-msg');
    if (!msgInput || msgInput.value.trim() === '') {
        showNotification("กรุณาเขียนข้อความด้วยนะครับ");
        return;
    }
    window.location.href = 'letter.html';
}

// ---------------- ส่วนหน้าเขียนจดหมาย (letter.html) ---------------- //

const longMsgInput = document.getElementById('long-msg');
if (longMsgInput) {
    // โหลดข้อความจดหมายที่เคยพิมพ์ไว้
    let savedLong = localStorage.getItem('longMessage');
    if (savedLong) {
        longMsgInput.value = savedLong;
    }
    
    longMsgInput.addEventListener('input', function() {
        localStorage.setItem('longMessage', this.value.trim());
    });
}

function goToSharePage() {
    const longMsgInput = document.getElementById('long-msg');
    if (!longMsgInput || longMsgInput.value.trim() === '') {
        showNotification("กรุณาเขียนจดหมายด้วยนะครับ");
        return;
    }
    window.location.href = 'share.html';
}

// ---------------- ส่วนหน้าส่งช่อดอกไม้ (share.html) ---------------- //

// ฟังก์ชันสำหรับเปิด/ปิดจดหมาย
function toggleLetter() {
    const closedEnv = document.getElementById('env-closed');
    const openEnv = document.getElementById('env-open');
    const letterModal = document.getElementById('letter-modal');
    const hint = document.getElementById('click-hint');

    if (letterModal) {
        if (!letterModal.classList.contains('show')) {
            letterModal.classList.add('show');
            if (closedEnv) closedEnv.style.display = 'none';
            if (openEnv) openEnv.classList.remove('hidden');
            if (hint) hint.style.display = 'none';
        } else {
            letterModal.classList.remove('show');
            if (closedEnv) closedEnv.style.display = 'block';
            if (openEnv) openEnv.classList.add('hidden');
            if (hint) hint.style.display = 'block';
        }
    }
}

// เช็ก URL ว่ามีคำว่า ?view=receiver ไหม
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const copyBtn = document.getElementById('copy-btn');
    
    // ถ้ามีคำว่า receiver ให้ซ่อนปุ่มคัดลอกลิงก์
    if (urlParams.get('view') === 'receiver') {
        if (copyBtn) copyBtn.style.display = 'none';
        
        // ซ่อนปุ่มไปหน้า Donate สำหรับคนรับลิงก์ด้วย
        const goDonateBtn = document.getElementById('go-donate-btn');
        if (goDonateBtn) goDonateBtn.style.display = 'none';
    }

    // นำข้อความที่บันทึกไว้มาแสดงในหน้า share.html
    const savedShortMsg = localStorage.getItem('shortMessage');
    if (savedShortMsg) {
        const shareTitle = document.querySelector('.share-title');
        if (shareTitle) shareTitle.innerText = savedShortMsg;
    }

    const savedLongMsg = localStorage.getItem('longMessage');
    if (savedLongMsg) {
        const modalLetterText = document.getElementById('modal-letter-text');
        if (modalLetterText) modalLetterText.innerText = savedLongMsg;
    }
});

// ฟังก์ชันเวลากดปุ่ม "คัดลอกลิงก์"
function copyShareLink() {
    // เอา URL ปัจจุบันมาเติม ?view=receiver เข้าไป
    let currentUrl = window.location.origin + window.location.pathname;
    let shareUrl = currentUrl + '?view=receiver';

    // สั่งก็อปปี้ลง Clipboard ของเครื่อง
    navigator.clipboard.writeText(shareUrl).then(() => {
        // เปลี่ยนข้อความปุ่มเพื่อบอกว่าก็อปปี้สำเร็จแล้ว
        const copyBtn = document.getElementById('copy-btn');
        copyBtn.innerText = "คัดลอกสำเร็จ!";
        copyBtn.style.backgroundColor = "#88D49E"; // เปลี่ยนเป็นสีเขียวชั่วคราว
        
        setTimeout(() => {
            copyBtn.innerText = "คัดลอกลิงก์";
            copyBtn.style.backgroundColor = "#FF9EB5";
        }, 3000);
    }).catch(err => {
        alert("คัดลอกลิงก์ไม่สำเร็จ กรุณาลองใหม่ครับ");
    });
}

// ---------------- ส่วนหน้าสนับสนุน (donate.html) ---------------- //

function checkPremiumAndGo() {
    let secretCode = prompt("กรุณากรอกรหัสลับที่ได้รับจากการสนับสนุน (ลองพิมพ์ 1234 เพื่อทดสอบ):");
    
    if (secretCode === "1234") {
        showNotification("รหัสถูกต้อง! ขอบคุณที่สนับสนุนพวกเราครับ 💖");
        setTimeout(() => {
            window.location.href = 'create.html'; // ส่งกลับไปหน้าแรกเพื่อจัดช่อใหม่
        }, 2000);
    } else if (secretCode !== null && secretCode.trim() !== "") {
        showNotification("รหัสไม่ถูกต้องครับ ลองใหม่อีกครั้งน้า");
    }
}