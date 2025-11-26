const API_BASE = "http://localhost:8080";

/* ============================================================
   全域變數
============================================================ */
let cars = [];
let filteredCars = [];
let currentIndex = 0;
const CARDS_PER_PAGE = 3;
const CARD_WIDTH = 340; // 卡片寬度 + gap

/* ============================================================
   登入/登出 UI 更新
============================================================ */
function updateLoginUI() {
    const name = sessionStorage.getItem("memberName");
    const loginBtn = document.getElementById("loginBtn"); // 如果有的話
    // 這裡主要依賴 member.js 的 navbar 更新，此處可留空或做額外處理
}
document.addEventListener("DOMContentLoaded", updateLoginUI);


/* ============================================================
   從後端載入車款資料
============================================================ */
function loadFromBackend() {
    fetch(`${API_BASE}/api/subcars`)
        .then(res => {
            if (!res.ok) throw new Error("API Error");
            return res.json();
        })
        .then(data => {
            console.log("車輛資料載入成功:", data);
            // 資料轉換：確保圖片路徑正確
            cars = data.map(c => ({
                ...c,
                // 如果資料庫存的是 /images/xxx.jpg，轉為 ./images/xxx.jpg
                img: c.img ? (c.img.startsWith('/') ? '.' + c.img : c.img) : ''
            }));
            filteredCars = cars; // 初始化篩選結果為全部
            initFilters();
            loadCarousel(filteredCars);
        })
        .catch(err => console.error("讀取後端資料失敗：", err));
}

// 啟動載入
loadFromBackend();


/* ============================================================
   Carousel：渲染車卡
============================================================ */
function loadCarousel(list) {
    const track = document.getElementById("carouselTrack");
    if (!track) return;
    
    track.innerHTML = "";

    if (list.length === 0) {
        track.innerHTML = "<p style='padding:20px; width:100%; text-align:center;'>沒有符合條件的車款</p>";
        return;
    }

    list.forEach(c => {
        const imgSrc = c.img || "https://fakeimg.pl/300x200/?text=No+Image";
        
        track.innerHTML += `
            <div class="car-card" style="min-width: 300px;">
                <img src="${imgSrc}" onerror="this.src='https://fakeimg.pl/300x200/?text=Image+Error'">
                <h3 class="mt-3 fw-bold">${c.name}</h3>
                <p class="text-muted mb-1">品牌：${c.brand}</p>
                <p class="text-danger fw-bold fs-5">月費：NT$ ${c.price}</p>
                <button class="btn btn-danger w-100 mt-2" onclick="selectCar(${c.id})">確認選擇</button>
            </div>
        `;
    });

    // 重置位置
    currentIndex = 0;
    updateCarousel();
}


/* ============================================================
   Carousel 左右導航
============================================================ */
const nextBtn = document.getElementById("carNext");
const prevBtn = document.getElementById("carPrev");

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        // 計算最大索引：總數 - 一頁顯示數 (防止右邊留白)
        const maxIndex = Math.max(0, filteredCars.length - CARDS_PER_PAGE);
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });
}

function updateCarousel() {
    const track = document.getElementById("carouselTrack");
    if (track) {
        // 移動距離 = 索引 * (卡片寬度 + 間距)
        const shift = currentIndex * -CARD_WIDTH; 
        track.style.transform = `translateX(${shift}px)`;
    }
}


/* ============================================================
   初始化篩選選單
============================================================ */
function initFilters() {
    const brandSelect = document.getElementById("filterBrand");
    const priceSelect = document.getElementById("filterPrice");
    const areaSelect = document.getElementById("filterArea");
    // const storeSelect = document.getElementById("filterStore"); // HTML 好像移除了這個

    if (!brandSelect) return;

    // 清空
    brandSelect.innerHTML = `<option value="">品牌</option>`;
    priceSelect.innerHTML = `<option value="">月費</option>`;
    areaSelect.innerHTML = `<option value="">取車區域</option>`;

    // 產生選項
    const brands = [...new Set(cars.map(c => c.brand))];
    brands.forEach(b => {
        brandSelect.innerHTML += `<option value="${b}">${b}</option>`;
    });

    const prices = [...new Set(cars.map(c => c.price))].sort((a,b)=>a-b);
    prices.forEach(p => {
        priceSelect.innerHTML += `<option value="${p}">${p}</option>`;
    });

    ["北區", "中區", "南區"].forEach(a => {
        areaSelect.innerHTML += `<option value="${a}">${a}</option>`;
    });
}


/* ============================================================
   搜尋 (前端篩選)
============================================================ */
function applyFilters() {
    const brand = document.getElementById("filterBrand").value;
    const price = document.getElementById("filterPrice").value;
    const area = document.getElementById("filterArea").value;

    filteredCars = cars.filter(c => {
        return (!brand || c.brand === brand) &&
               (!price || c.price == price) &&
               (!area  || c.area === area);
    });

    loadCarousel(filteredCars);
}

// 綁定篩選事件
const filters = ["filterBrand", "filterPrice", "filterArea"];
filters.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", applyFilters);
});
// 搜尋按鈕也可觸發
const searchBtn = document.getElementById("searchBtn");
if (searchBtn) searchBtn.addEventListener("click", applyFilters);


/* ============================================================
   STEP1 → STEP2 (選車)
============================================================ */
let selectedCar = null;
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

// 注意：此函數被 HTML onclick 呼叫，必須是全域函數
window.selectCar = function(id) {
    selectedCar = cars.find(c => c.id === id);
    if (!selectedCar) return;
    
    step1.classList.remove("active");
    step2.classList.add("active");
    window.scrollTo(0, 0);
}


/* ============================================================
   STEP2 Tabs (條款切換)
============================================================ */
const tabContent = document.getElementById("tabContent");
if (tabContent) {
    tabContent.innerHTML = `<h3>取車應備文件</h3><p>需攜帶：身分證、駕照、押金 NT$10,000</p>`;

    document.querySelectorAll(".tab").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            btn.classList.add("active");

            const tab = btn.dataset.tab;
            const content = {
                doc: `<h3>取車應備文件</h3><p>需攜帶：身分證、駕照、押金 NT$10,000</p>`,
                note: `<h3>注意事項</h3><p>不得酒駕 · 必須持有效駕照</p>`,
                insurance: `<h3>保險內容</h3><p>含強制險、第三責任險</p>`,
                cancel: `<h3>取消政策</h3><p>3天前退30%，當日退0%</p>`
            };
            tabContent.innerHTML = content[tab];
        });
    });
}


/* ============================================================
   STEP2 → STEP3 (前往試算)
============================================================ */
const s3_carImg = document.getElementById("s3_carImg");
const s3_carName = document.getElementById("s3_carName");

// 綁定 HTML onclick="goStep3()"
window.goStep3 = function() {
    step2.classList.remove("active");
    step3.classList.add("active");
    window.scrollTo(0, 0);

    if (s3_carImg) s3_carImg.src = selectedCar.img || '';
    if (s3_carName) s3_carName.textContent = selectedCar.name;

    updateCalculation();
}


/* ============================================================
   STEP3 試算功能
============================================================ */
const s3_month = document.getElementById("s3_month");
const s3_mileageBonus = document.getElementById("s3_mileageBonus");
const s3_totalFee = document.getElementById("s3_totalFee");
const s3_finalTotal = document.getElementById("s3_finalTotal");

function updateCalculation() {
    if (!s3_month || !selectedCar) return;
    
    const m = parseInt(s3_month.value);
    let bonus = (m === 6 || m === 9) ? 200 : (m === 12 ? 400 : 0);
    
    if (s3_mileageBonus) s3_mileageBonus.textContent = bonus;

    const totalFee = selectedCar.price * m;
    if (s3_totalFee) s3_totalFee.textContent = "NT$ " + totalFee.toLocaleString();

    const finalTotal = totalFee + 10000; // 加上押金
    if (s3_finalTotal) s3_finalTotal.textContent = "NT$ " + finalTotal.toLocaleString();
}

if (s3_month) s3_month.addEventListener("change", updateCalculation);


/* ============================================================
   完成訂閱（送出訂單）
============================================================ */
window.confirmOrder = function() {
    // 1. 檢查 Token
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
        alert("請先登入會員！");
        // 呼叫 index.html 的 Modal (如果有的話)
        const loginModalEl = document.getElementById('loginModal');
        if (loginModalEl) {
            const modal = new bootstrap.Modal(loginModalEl);
            modal.show();
        }
        return;
    }

    const s3_store = document.getElementById("s3_store");
    const s3_date = document.getElementById("s3_date");
    const s3_time = document.getElementById("s3_time");

    if(!s3_date.value || !s3_time.value) {
        alert("請選擇取車日期與時間");
        return;
    }

    // 2. 建立 Payload
    const payload = {
        carId: selectedCar.id,
        store: s3_store.value,
        startDate: s3_date.value,
        startTime: s3_time.value,
        months: parseInt(s3_month.value),
        mileageBonus: parseInt(s3_mileageBonus.textContent),
        totalPrice: selectedCar.price * parseInt(s3_month.value),
        finalPrice: selectedCar.price * parseInt(s3_month.value) + 10000
    };

    // 3. 發送請求
    fetch(`${API_BASE}/api/sub-orders`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token 
        },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        if (res.status === 401) {
            throw new Error("登入逾時，請重新登入");
        }
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "訂閱失敗");
        }
        return res.json();
    })
    .then(data => {
        alert("訂閱成功！訂單編號：" + data.orderNo);
        window.location.href = "order.html";
    })
    .catch(err => alert("錯誤：" + err.message));
}


/* ============================================================
   返回按鈕
============================================================ */
window.backToStep1 = function() {
    step2.classList.remove("active");
    step1.classList.add("active");
}

window.backToStep2 = function() {
    step3.classList.remove("active");
    step2.classList.add("active");
}