const API_BASE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async () => {

    console.log("訂單查詢頁載入");

    // 1. 取得 token & member (改用 sessionStorage)
    const token = sessionStorage.getItem("jwtToken");
    const memberName = sessionStorage.getItem("memberName");

    // 2. 未登入 → 返回
    if (!token) {
        alert("請先登入會員才能查詢訂單！");
        window.location.href = "subscribe.html"; // 或 login.html
        return;
    }

    // 3. 顯示當前登入會員名稱 (如果 UI 有預留位置)
    const loginInfoSpan = document.getElementById("currentUserBadge");
    if (loginInfoSpan) {
        loginInfoSpan.textContent = `👤 ${memberName}`;
    }

    // 4. 開始抓取訂單
    const tbody = document.querySelector("#orderTable tbody");
    // 清空並顯示 Loading
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><span class="spinner-border text-primary"></span> 載入中...</td></tr>`;

    try {
        // ⭐ 修改：呼叫後端新的 my-orders API
        const response = await fetch(
            `${API_BASE}/api/sub-orders/my-orders`,
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            if (response.status === 401) {
                alert("登入逾時，請重新登入");
                // 清除過期 Token
                sessionStorage.clear();
                window.location.href = "login.html";
                return;
            }
            throw new Error("後端回傳錯誤：" + response.status);
        }

        const orders = await response.json();
        console.log("會員訂單資料 =", orders);

        tbody.innerHTML = ""; // 清除 Loading

        if (orders.length === 0) {
            // 顯示無資料訊息
            document.getElementById("emptyMsg").classList.remove("d-none");
            document.querySelector(".card").classList.add("d-none"); // 隱藏表格
            return;
        }

        // 計算結束日期（依訂閱月數）
        function getEndDate(startDateStr, months) {
            if (!startDateStr) return "—";
            const startDate = new Date(startDateStr);
            if (isNaN(startDate)) return "—";
            const endDate = new Date(startDate.getTime() + months * 30 * 24 * 60 * 60 * 1000); // 概算
            return endDate.toISOString().split("T")[0];
        }

        // 5. 渲染訂單內容
        orders.forEach(order => {
            const tr = document.createElement("tr");
            
            // 判斷狀態樣式
            const statusClass = order.status === '進行中' ? 'status-in-progress' : 'status-completed';
            
            tr.innerHTML = `
                <td><span class="fw-bold text-dark">#${order.orderNo}</span></td>
                <td>${order.carId}</td> <td>${order.startDate}</td>
                <td>${getEndDate(order.startDate, order.months)}</td>
                <td class="text-danger fw-bold">NT$ ${order.finalPrice?.toLocaleString() ?? "0"}</td>
                <td class="${statusClass}">
                    ${order.status}
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("查詢錯誤：", err);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-3">查詢發生錯誤，請稍後再試</td></tr>`;
    }
});

// 登出按鈕 (如果頁面有獨立的)
const logoutBtn = document.getElementById("logoutBtn");
if(logoutBtn){
    logoutBtn.addEventListener("click", () => {
        if (confirm("確定要登出嗎？")) {
            sessionStorage.clear();
            alert("已登出");
            window.location.href = "index.html";
        }
    });
}