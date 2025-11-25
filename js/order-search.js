const API_BASE = "http://localhost:8080/api/orders";

// 初始化：載入歷史紀錄
window.onload = function () {
    loadHistory();
};

// 查詢訂單
async function searchOrders() {

    const phone = document.getElementById("phoneInput").value.trim();
    if (!phone) {
        alert("請輸入電話號碼");
        return;
    }

    // 儲存到 localStorage
    saveHistory(phone);

    // 呼叫 API
    const res = await fetch(`${API_BASE}/phone/${phone}`);
    
    const resultArea = document.getElementById("resultArea");

    if (res.status === 404) {
        resultArea.innerHTML = `
            <div class="alert alert-warning">查無訂單</div>
        `;
        return;
    }

    const list = await res.json();

    // 顯示訂單列表
    let html = `<h4>查詢結果</h4>`;

    list.forEach(order => {
        html += `
            <div class="card shadow-sm mb-3">
                <div class="card-body">
                    <h5 class="card-title">訂單編號：${order.orderNo}</h5>
                    <p>預訂用戶：${order.name}</p>
                    <p>行動電話：${order.phone}</p>
                    <p>上車地點：${order.pickupPlace}</p>
                    <p>下車地點：${order.dropoffPlace}</p>
                    <p>車型：${order.adscar?.name}</p>
                    <p>乘車時間：${order.pickupDate} ${order.pickupTime}</p>
                </div>
            </div>
        `;
    });

    resultArea.innerHTML = html;

    // 重刷歷史紀錄
    loadHistory();
}


// 儲存搜尋紀錄（最多 5 筆）
function saveHistory(phone) {
    let history = JSON.parse(localStorage.getItem("orderSearchHistory") || "[]");

    // 去重複
    history = history.filter(p => p !== phone);

    // 最新的放最前面
    history.unshift(phone);

    // 最多五筆
    if (history.length > 5) history.pop();

    localStorage.setItem("orderSearchHistory", JSON.stringify(history));
}


// 載入歷史紀錄到列表
function loadHistory() {
    const history = JSON.parse(localStorage.getItem("orderSearchHistory") || "[]");
    const listArea = document.getElementById("historyList");

    listArea.innerHTML = "";

    history.forEach(phone => {
        const li = document.createElement("li");
        li.className = "list-group-item history-item";
        li.innerText = phone;
        li.onclick = function () {
            document.getElementById("phoneInput").value = phone;
            searchOrders();
        };
        listArea.appendChild(li);
    });
}
