// 注意：如果後端主機/port 不同，修改 API_BASE
const API_BASE = "http://localhost:8080";

let selectedVehicle = null;
let selectedCarId = null;
let basePrice = 0;
let perKmPrice = 0;
let maxPassengers = 0;

// ... (fixedDistanceTable 與 getFixedDistance 保持不變，省略以節省篇幅) ...
const fixedDistanceTable = {
  "松山國際機場-高鐵-台北站": 6,
  "松山國際機場-高鐵-台中站": 150,
  "松山國際機場-高鐵-台南站": 290,
  "松山國際機場-高鐵-左營站": 360,
  "松山國際機場-桃園國際機場": 45,
  "松山國際機場-清泉崗國際機場": 150,
  "松山國際機場-小港國際機場": 360,
  "松山國際機場-台北市": 5,
  "松山國際機場-台中市": 150,
  "松山國際機場-高雄市": 350,

  "桃園國際機場-高鐵-台北站": 45,
  "桃園國際機場-高鐵-台中站": 120,
  "桃園國際機場-高鐵-台南站": 260,
  "桃園國際機場-高鐵-左營站": 310,
  "桃園國際機場-台北市": 45,
  "桃園國際機場-台中市": 120,
  "桃園國際機場-高雄市": 310,
  "桃園國際機場-清泉崗國際機場": 120,
  "桃園國際機場-小港國際機場": 310,

  "清泉崗國際機場-小港國際機場": 230,
  "清泉崗國際機場-高鐵-台北站": 150,
  "清泉崗國際機場-高鐵-台中站": 20,
  "清泉崗國際機場-高鐵-台南站": 170,
  "清泉崗國際機場-高鐵-左營站": 230,
  "清泉崗國際機場-台北市": 150,
  "清泉崗國際機場-台中市": 20,
  "清泉崗國際機場-高雄市": 230,

  "小港國際機場-高鐵-台北站": 360,
  "小港國際機場-高鐵-台中站": 230,
  "小港國際機場-高鐵-台南站": 50,
  "小港國際機場-高鐵-左營站": 10,
  "小港國際機場-台北市": 350,
  "小港國際機場-台中市": 230,
  "小港國際機場-高雄市": 10,

  "高鐵-台北站-台北市": 5,
  "高鐵-台北站-台中市": 150,
  "高鐵-台北站-高雄市": 350,
  "高鐵-台北站-高鐵-台中站": 150,
  "高鐵-台北站-高鐵-台南站": 290,
  "高鐵-台北站-高鐵-左營站": 350,

  "高鐵-台中站-高鐵-台南站": 140,
  "高鐵-台中站-高鐵-左營站": 190,
  "高鐵-台中站-台中市": 10,
  "高鐵-台中站-高雄市": 190,
  "高鐵-台南站-高鐵-左營站": 50,

  "高鐵-台南站-高雄市": 50,
  "高鐵-左營站-高雄市": 10,

  "台北市-台中市": 150,
  "台北市-高雄市": 350,
  "台中市-高雄市": 190,
};

function getFixedDistance(from, to) {
  const key = `${from}-${to}`;
  const reverseKey = `${to}-${from}`;
  return fixedDistanceTable[key] ?? fixedDistanceTable[reverseKey] ?? null;
}

// ⭐ 修改：載入後端車輛清單（直接使用靜態圖片路徑）
async function loadCarsFromBackend() {
  try {
      const resp = await fetch(`${API_BASE}/api/adscar`);
      if (!resp.ok) {
        console.error("載入車輛失敗", resp.status);
        return [];
      }
      const cars = await resp.json();
      
      return cars.map(car => ({
        id: car.adscarId,
        name: car.name,
        maxPassengers: car.maxPassengers,
        maxLuggage: car.maxLuggage,
        baseFare: car.baseFare,
        perKmFare: car.perKmFare,
        // ⭐ 修改處：直接使用後端回傳的 image 欄位 (例如 /images/Toyota Camry.jpg)
        // 如果後端欄位叫 'image'，請確認您的 Adscar Entity 屬性名稱
        // 這裡假設後端 JSON 欄位名為 image
        imageUrl: car.image ? car.image : '' 
      }));
  } catch (e) {
      console.error("API 連線錯誤", e);
      return [];
  }
}

// ⭐ 修改：渲染車輛卡片 (處理圖片路徑)
async function renderCarCards() {
  const container = document.getElementById("vehicle-list"); 
  container.innerHTML = '<p class="text-center w-100"><span class="spinner-border text-primary"></span> 載入中...</p>';
  
  const carList = await loadCarsFromBackend();
  container.innerHTML = ""; 

  if (!carList || !carList.length) {
    container.innerHTML = "<p class='text-center text-muted w-100'>目前無可用車輛或連線失敗</p>";
    return;
  }

  carList.forEach(car => {
    // 處理圖片路徑：如果是相對路徑，加上 API_BASE (如果是前後端分離) 或者直接用 (如果是同源)
    // 假設圖片在 Spring Boot static/images 下，且您是用 5500 訪問
    // 則路徑應為 http://localhost:8080/images/xxx.jpg
    let imgSrc = "https://fakeimg.pl/300x200/?text=No+Image";
    
if (car.imageUrl) {
        // ⭐ 修改重點：直接讀取 5500 前端資源
        // 資料庫存的是 "/images/xxx.jpg"
        // 我們加上 "." 變成 "./images/xxx.jpg"，讓它相對於當前 HTML 檔案尋找
        if (car.imageUrl.startsWith("/")) {
            imgSrc = "." + car.imageUrl; 
        } else {
            imgSrc = car.imageUrl;
        }
    }

    const col = document.createElement("div");
    col.className = "col-md-3 col-sm-6"; // RWD
    col.innerHTML = `
      <div class="card vehicle-card h-100 shadow-sm" onclick="selectVehicle('${car.id}', '${escapeHtml(car.name)}', ${car.baseFare}, ${car.perKmFare}, ${car.maxPassengers})">
        <img src="${imgSrc}" class="vehicle-img card-img-top" alt="${escapeHtml(car.name)}" onerror="this.src='https://fakeimg.pl/300x200/?text=Image+Error'">
        <div class="card-body text-center d-flex flex-column">
          <h5 class="card-title fw-bold text-truncate">${escapeHtml(car.name)}</h5>
          <p class="card-text text-muted small flex-grow-1">${car.maxPassengers}人座 | ${car.maxLuggage ?? 2}件行李</p>
          <button class="btn btn-outline-primary btn-sm w-100 mt-2">選擇此車型</button>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

// ... (以下函式保持不變：escapeHtml, showVehicles, selectVehicle, goBackToStep2, updateDistanceAndPrice, calculatePrice, submitOrder) ...

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function showVehicles() {
  // (邏輯不變，省略)
  // ...
  const name = document.getElementById('userName').value.trim();
  const phone = document.getElementById('userPhone').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  
  if (!name || !phone || !email) { alert("請填寫所有聯絡資訊欄位"); return; }
  
  document.getElementById('step2').style.display = 'flex'; // 修正為 flex 以配合 row
  renderCarCards();
  document.getElementById('showVehiclesBtn').style.display = 'none';
}

function selectVehicle(id, name, base, perKm, maxPax) {
  selectedCarId = Number(id);
  selectedVehicle = name;
  basePrice = Number(base);
  perKmPrice = Number(perKm);
  maxPassengers = Number(maxPax);

  document.getElementById('vehicleName').value = name;
  const paxInput = document.getElementById('passengerCount');
  paxInput.setAttribute('max', maxPassengers);
  paxInput.value = Math.min(maxPassengers, paxInput.value || 1);

  updateDistanceAndPrice();
  calculatePrice();

  document.getElementById('step2').style.display = 'none';
  document.getElementById('step3').style.display = 'block';
}

function goBackToStep2() {
  document.getElementById('step3').style.display = 'none';
  document.getElementById('step2').style.display = 'flex';
}

function updateDistanceAndPrice() {
  const from = document.getElementById("pickupPlace").value;
  const to = document.getElementById("dropoffPlace").value;
  const distance = getFixedDistance(from, to);
  if (distance !== null) {
    document.getElementById("distance").value = distance;
    calculatePrice();
  } else {
    document.getElementById("distance").value = "";
    document.getElementById("price").value = "";
  }
}

function calculatePrice() {
  const distanceVal = parseFloat(document.getElementById('distance').value || 0);
  const signageFee = document.getElementById('signage').value === 'yes' ? 200 : 0;
  const total = (Number(basePrice) || 0) + (Number(perKmPrice) || 0) * (distanceVal || 0) + signageFee;
  document.getElementById('price').value = `NT$ ${Math.round(total)} 元`;
}

async function submitOrder() {
  if (!selectedCarId) { alert("請先選擇車型"); return; }

// 1. 取得 Token
  const token = sessionStorage.getItem("jwtToken");
  if (!token) {
      alert("請先登入會員才能預約！");
      // 打開登入 Modal
      const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
      loginModal.show();
      return;
  }
  const order = {
    name: document.getElementById('userName').value.trim(),
    phone: document.getElementById('userPhone').value.trim(),
    email: document.getElementById('userEmail').value.trim(),
    pickupPlace: document.getElementById('pickupPlace').value,
    dropoffPlace: document.getElementById('dropoffPlace').value,
    pickupDate: document.getElementById('pickupDate').value,
    pickupTime: document.getElementById('pickupTime').value + ":00",
    distanceKm: parseFloat(document.getElementById('distance').value || 0),
    passengerCount: parseInt(document.getElementById('passengerCount').value || 1),
    luggageCount: (document.getElementById('luggage').value === 'yes') ? 1 : 0,
    signage: document.getElementById('signage').value === 'yes',
    totalPrice: parseInt((document.getElementById('price').value || '').match(/\d+/)[0], 10),
    adscar: { adscarId: selectedCarId },
    // 如果後端支援 memberId 綁定，可加上這行：
    // memberId: memberId 
  };

  try {
    const resp = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
     headers: { 
          "Content-Type": "application/json",
          // ⭐ 新增：帶入 JWT Token
          "Authorization": "Bearer " + token 
      },
      body: JSON.stringify(order)
    });

    if (resp.ok) {
      const created = await resp.json();
      document.getElementById("modalOrderNo").innerText = created.orderNo;
      const successModal = new bootstrap.Modal(document.getElementById('successModal'));
      successModal.show();
    } else {
      alert("建立訂單失敗，請稍後再試");
    }
  } catch (err) {
    console.error("建立訂單例外", err);
    alert("連線錯誤");
  }
}

// 初始化事件監聽
document.addEventListener("DOMContentLoaded", () => {
  const pickupPlace = document.getElementById("pickupPlace");
  const dropoffPlace = document.getElementById("dropoffPlace");
  const signage = document.getElementById("signage");
  pickupPlace?.addEventListener("change", updateDistanceAndPrice);
  dropoffPlace?.addEventListener("change", updateDistanceAndPrice);
  signage?.addEventListener("change", updateDistanceAndPrice);

  const today = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("pickupDate");
  if (dateInput) dateInput.setAttribute("min", today);

  // 自動填入會員資料
  const memName = sessionStorage.getItem("memberName");
  const memPhone = sessionStorage.getItem("memberPhone");
  const memEmail = sessionStorage.getItem("memberEmail");

  if (memName) {
      const nameInput = document.getElementById('userName');
      const phoneInput = document.getElementById('userPhone');
      const emailInput = document.getElementById('userEmail');
      if(nameInput) nameInput.value = memName;
      if(phoneInput) phoneInput.value = memPhone;
      if(emailInput) emailInput.value = memEmail;
  }
});