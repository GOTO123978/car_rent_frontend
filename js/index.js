// js/index.js

// 如果其他檔案已經定義了 API_BASE，這裡可以共用或重新定義
// 建議在 HTML head 中定義一個全域 config，或者每個檔案自己定義
const INDEX_API_BASE = "http://localhost:8080";

let allCarsData = [];

/* =========================================
   1. 處理分店資料 (Fetch & Render)
   ========================================= */
async function initBranches() {
    try {
        const data = await $.ajax({
            url: `${INDEX_API_BASE}/api/allbranch`,
            type: "GET",
            dataType: "json"
        });
        renderBranchesOptions(data);
    } catch (err) {
        console.error("分店載入失敗", err);
        $("#pickupLocation").html('<option>載入失敗</option>');
    }
}

function renderBranchesOptions(branches) {
    const pickupSelect = $("#pickupLocation");
    const returnSelect = $("#returnLocation");
    
    pickupSelect.empty().append('<option value="">請選擇取車分店</option>');
    returnSelect.empty().append('<option value="">請選擇還車分店</option>');

    branches.forEach(branchName => {
        pickupSelect.append(`<option value="${branchName}">${branchName}</option>`);
        returnSelect.append(`<option value="${branchName}">${branchName}</option>`);
    });
}

/* =========================================
   2. 處理車輛資料 (Fetch & Render)
   ========================================= */
async function initCars() {
    try {
        const data = await $.ajax({
            url: `${INDEX_API_BASE}/api/car`,
            type: "GET",
            dataType: "json"
        });

        allCarsData = data;
        renderCars(data);

    } catch (err) {
        console.error("車輛載入失敗", err);
        document.getElementById("car-list").innerHTML = 
            '<p class="text-danger text-center">無法連線至伺服器。</p>';
    }
}

function renderCars(cars) {
    const carList = document.getElementById("car-list");
    carList.innerHTML = "";

    if (!cars || cars.length === 0) {
        carList.innerHTML = '<p class="text-muted text-center py-5">目前沒有符合條件的車輛。</p>';
        return;
    }

    const limitedCars = cars.slice(0, 4);

    limitedCars.forEach(car => {
        // 圖片路徑處理：如果是相對路徑 (./images/...) 則保持，否則加上後端 URL
        // 假設資料庫存的是 /images/xxx.jpg
        const imgSrc = car.imagePath ? (car.imagePath.startsWith('/') ? '.' + car.imagePath : car.imagePath) 
                                     : "https://fakeimg.pl/400x250/?text=No+Image";

        const col = document.createElement("div");
        col.className = "col-md-3 col-sm-6";

        col.innerHTML = `
        <div class="card car-card h-100 shadow-sm">
            <img src="${imgSrc}" class="card-img-top" alt="${car.name}" onerror="this.src='https://fakeimg.pl/400x250/?text=Image+Error'">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title fw-bold text-truncate">${car.name}</h5>
                
                <div class="mb-2 small text-muted">
                    <span><i class="bi bi-people-fill"></i> ${car.seats}人</span> | 
                    <span><i class="bi bi-bag-fill"></i> ${car.luggage}</span>
                </div>
                
                <div class="mt-auto text-center">
                    <div class="mb-2"><span class="price-tag">NT$ ${car.price}</span> <small>/日</small></div>
                    <button class="btn btn-outline-danger w-100" onclick="goToReserve()">
                        立即預約
                    </button>
                </div>
            </div>
        </div>`;
        carList.appendChild(col);
    });
}

/* =========================================
   3. 搜尋與跳轉邏輯
   ========================================= */
function setupSearchListener() {
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) {
        searchBtn.addEventListener("click", function () {
            const seatType = document.getElementById("carType").value;
            let filtered = allCarsData;

            if (seatType === "5") {
                filtered = allCarsData.filter(car => car.seats === 5);
            } else if (seatType === "7") {
                filtered = allCarsData.filter(car => car.seats >= 7);
            }
            renderCars(filtered);
        });
    }
}

function goToReserve() {
    const token = sessionStorage.getItem("jwtToken");
    if (token) {
        window.location.href = `${INDEX_API_BASE}/reserve?token=${token}`;
    } else {
        alert("請先登入會員才能預約！");
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    }
}

/* =========================================
   4. 初始化 (Entry Point)
   ========================================= */
document.addEventListener("DOMContentLoaded", async function () {
    // 1. 初始化資料
    await initBranches();
    await initCars();
    
    // 2. 綁定搜尋事件
    setupSearchListener();

    // 3. Navbar UI 更新 (依賴 member.js 的邏輯，或在此手動觸發)
    // 如果 member.js 已經在 ready 時執行了 UI 更新，這裡可以省略
    // 為了保險起見，再次檢查
    const token = sessionStorage.getItem("jwtToken");
    if (token) {
        $("#myorderbtn").show();
        $("#memberCenterBtn").show();
    } else {
        $("#myorderbtn").hide();
        $("#memberCenterBtn").hide();
    }
});